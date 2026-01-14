import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";
import type { RenewalDecision, RenewalAssessment, AssessmentRecommendation } from "@/lib/supabase/types";

/**
 * GET /api/renewal-decisions
 * List all renewal decisions with their app details
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const appId = searchParams.get("app_id");

    const supabase = await createServerSupabaseClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("renewal_decisions")
      .select(`
        *,
        apps (
          id,
          product,
          vendor,
          category,
          division,
          department,
          renewal_date,
          annual_cost,
          licenses
        )
      `)
      .order("updated_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (appId) {
      query = query.eq("app_id", appId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching decisions:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching decisions:", error);
    return NextResponse.json(
      { error: "Failed to fetch decisions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/renewal-decisions
 * Create or update a renewal decision for an app (aggregates submissions)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { app_id, generate_summary } = body;

    if (!app_id) {
      return NextResponse.json(
        { error: "app_id is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get all assessments for this app
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assessments, error: assessmentsError } = await (supabase as any)
      .from("renewal_assessments")
      .select("*")
      .eq("app_id", app_id)
      .order("submission_date", { ascending: false });

    if (assessmentsError) {
      return NextResponse.json(
        { error: assessmentsError.message },
        { status: 500 }
      );
    }

    // Type assertion for assessments
    const typedAssessments = (assessments || []) as RenewalAssessment[];

    // Calculate aggregated stats
    const stats = calculateStats(typedAssessments);

    // Check if decision already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("renewal_decisions")
      .select("id")
      .eq("app_id", app_id)
      .single();

    let decision: RenewalDecision;

    if (existing) {
      // Update existing decision
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated, error: updateError } = await (supabase as any)
        .from("renewal_decisions")
        .update({
          ...stats,
          updated_at: new Date().toISOString(),
        })
        .eq("app_id", app_id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
      decision = updated as RenewalDecision;
    } else {
      // Create new decision
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: created, error: createError } = await (supabase as any)
        .from("renewal_decisions")
        .insert({
          app_id,
          ...stats,
          status: "collecting",
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        );
      }
      decision = created as RenewalDecision;
    }

    // Generate AI summary if requested
    if (generate_summary && typedAssessments && typedAssessments.length > 0) {
      const summary = await generateAISummary(typedAssessments, supabase, app_id);
      if (summary) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: withSummary } = await (supabase as any)
          .from("renewal_decisions")
          .update({
            ai_summary: summary,
            ai_summary_generated_at: new Date().toISOString(),
            status: "assessor_review",
          })
          .eq("app_id", app_id)
          .select()
          .single();

        if (withSummary) {
          decision = withSummary as RenewalDecision;
        }
      }
    }

    return NextResponse.json(decision, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("Error creating/updating decision:", error);
    return NextResponse.json(
      { error: "Failed to create/update decision" },
      { status: 500 }
    );
  }
}

/**
 * Calculate aggregated stats from assessments
 */
function calculateStats(assessments: RenewalAssessment[]) {
  const counts: Record<AssessmentRecommendation, number> = {
    renew: 0,
    renew_with_changes: 0,
    replace: 0,
    retire: 0,
  };

  assessments.forEach((a) => {
    if (a.recommendation in counts) {
      counts[a.recommendation]++;
    }
  });

  return {
    total_submissions: assessments.length,
    renew_count: counts.renew,
    renew_with_changes_count: counts.renew_with_changes,
    replace_count: counts.replace,
    retire_count: counts.retire,
  };
}

/**
 * Generate AI summary of all teacher submissions
 */
async function generateAISummary(
  assessments: RenewalAssessment[],
  supabase: ReturnType<typeof createServiceClient>,
  appId: string
): Promise<string | null> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY not configured, skipping AI summary");
    return null;
  }

  // Get app details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: app } = await (supabase as any)
    .from("apps")
    .select("product, vendor, category, division")
    .eq("id", appId)
    .single();

  // Build summary of all submissions
  const submissionsSummary = assessments.map((a, i) => {
    const parts = [
      `Submission ${i + 1} (${a.submitter_email}):`,
      `- Recommendation: ${a.recommendation.replace(/_/g, " ")}`,
    ];
    if (a.usage_frequency) parts.push(`- Usage: ${a.usage_frequency}`);
    if (a.primary_use_cases) parts.push(`- Use cases: ${a.primary_use_cases}`);
    if (a.learning_impact) parts.push(`- Learning impact: ${a.learning_impact}`);
    if (a.justification) parts.push(`- Justification: ${a.justification}`);
    if (a.stakeholder_feedback) parts.push(`- Feedback: ${a.stakeholder_feedback}`);
    return parts.join("\n");
  }).join("\n\n");

  const prompt = `You are an educational technology advisor helping an international school make renewal decisions for software subscriptions.

App: ${app?.product || "Unknown"}
Vendor: ${app?.vendor || "Unknown"}
Category: ${app?.category || "Unknown"}
Division: ${app?.division || "Unknown"}

${assessments.length} teacher(s) submitted renewal assessments:

${submissionsSummary}

Please provide a concise executive summary (3-5 paragraphs) that:
1. Summarizes the overall sentiment and key themes from teacher feedback
2. Highlights the main use cases and impact on teaching/learning
3. Notes any concerns or suggested improvements
4. Provides an aggregated recommendation based on the feedback

Be objective and data-driven. Focus on actionable insights for decision-makers.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anthropic API error:", error);
      return null;
    }

    const data = await response.json();
    return data.content?.[0]?.text || null;
  } catch (error) {
    console.error("AI summary generation error:", error);
    return null;
  }
}
