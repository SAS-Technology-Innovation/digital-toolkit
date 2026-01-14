import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";
import type { RenewalAssessmentInsert } from "@/lib/supabase/types";

/**
 * GET /api/renewal-assessments
 * List all assessments (optionally filtered by app_id, status)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("app_id");
    const status = searchParams.get("status");

    const supabase = await createServerSupabaseClient();

    let query = supabase
      .from("renewal_assessments")
      .select(`
        *,
        apps (
          id,
          product,
          vendor,
          category,
          division,
          renewal_date,
          annual_cost,
          licenses
        )
      `)
      .order("submission_date", { ascending: false });

    if (appId) {
      query = query.eq("app_id", appId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching assessments:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/renewal-assessments
 * Create a new assessment (public, no auth required)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { app_id, submitter_email, recommendation, justification } = body;

    if (!app_id || !submitter_email || !recommendation || !justification) {
      return NextResponse.json(
        { error: "Missing required fields: app_id, submitter_email, recommendation, justification" },
        { status: 400 }
      );
    }

    // Validate email domain
    if (!submitter_email.endsWith("@sas.edu.sg")) {
      return NextResponse.json(
        { error: "Email must be an @sas.edu.sg address" },
        { status: 400 }
      );
    }

    // Validate recommendation value
    const validRecommendations = ["renew", "renew_with_changes", "replace", "retire"];
    if (!validRecommendations.includes(recommendation)) {
      return NextResponse.json(
        { error: "Invalid recommendation value" },
        { status: 400 }
      );
    }

    // Use service client for insert (bypasses RLS for public submission)
    const supabase = createServiceClient();

    // First, get the app details to snapshot current values
    const { data: app, error: appError } = await supabase
      .from("apps")
      .select("renewal_date, annual_cost, licenses")
      .eq("id", app_id)
      .single();

    if (appError || !app) {
      return NextResponse.json(
        { error: "App not found" },
        { status: 404 }
      );
    }

    // Prepare insert data
    const insertData: RenewalAssessmentInsert = {
      app_id,
      submitter_email,
      submitter_name: body.submitter_name || null,
      recommendation,
      justification,
      current_renewal_date: app.renewal_date,
      current_annual_cost: app.annual_cost,
      current_licenses: app.licenses,
      usage_frequency: body.usage_frequency || null,
      primary_use_cases: body.primary_use_cases || null,
      learning_impact: body.learning_impact || null,
      workflow_integration: body.workflow_integration || null,
      alternatives_considered: body.alternatives_considered || null,
      unique_value: body.unique_value || null,
      stakeholder_feedback: body.stakeholder_feedback || null,
      proposed_changes: body.proposed_changes || null,
      proposed_cost: body.proposed_cost || null,
      proposed_licenses: body.proposed_licenses || null,
      status: "submitted",
    };

    const { data: assessment, error: insertError } = await supabase
      .from("renewal_assessments")
      .insert(insertData)
      .select(`
        *,
        apps (
          id,
          product,
          vendor
        )
      `)
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // Send email notification (non-blocking)
    sendNotificationEmail(assessment).catch(console.error);

    // Update or create renewal decision (non-blocking)
    updateRenewalDecision(app_id, supabase).catch(console.error);

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}

/**
 * Send email notification to edtech@sas.edu.sg
 */
async function sendNotificationEmail(assessment: {
  id: string;
  submitter_email: string;
  recommendation: string;
  justification: string;
  submission_date: string;
  apps?: {
    product?: string;
    vendor?: string;
  };
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email notification");
    return;
  }

  const recommendationLabels: Record<string, string> = {
    renew: "Renew",
    renew_with_changes: "Renew with Changes",
    replace: "Replace",
    retire: "Retire",
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sas-digital-toolkit.vercel.app";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SAS Digital Toolkit <noreply@resend.dev>",
        to: ["edtech@sas.edu.sg"],
        subject: `New Renewal Assessment: ${assessment.apps?.product || "Unknown App"}`,
        html: `
          <h2>New Renewal Assessment Submitted</h2>
          <p><strong>App:</strong> ${assessment.apps?.product || "Unknown"}</p>
          <p><strong>Vendor:</strong> ${assessment.apps?.vendor || "N/A"}</p>
          <p><strong>Submitter:</strong> ${assessment.submitter_email}</p>
          <p><strong>Recommendation:</strong> ${recommendationLabels[assessment.recommendation] || assessment.recommendation}</p>
          <p><strong>Submitted:</strong> ${new Date(assessment.submission_date).toLocaleString()}</p>
          <hr/>
          <p><strong>Justification:</strong></p>
          <p>${assessment.justification}</p>
          <hr/>
          <p><a href="${appUrl}/admin/renewals">View Assessment in Dashboard</a></p>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email:", error);
    } else {
      console.log("Email notification sent successfully");
    }
  } catch (error) {
    console.error("Email send error:", error);
  }
}

/**
 * Update or create renewal decision for an app
 * Aggregates all teacher submissions
 */
async function updateRenewalDecision(
  appId: string,
  supabase: ReturnType<typeof createServiceClient>
) {
  try {
    // Get all assessments for this app
    const { data: assessments } = await supabase
      .from("renewal_assessments")
      .select("recommendation")
      .eq("app_id", appId);

    if (!assessments) return;

    // Calculate stats
    const stats = {
      total_submissions: assessments.length,
      renew_count: assessments.filter((a) => a.recommendation === "renew").length,
      renew_with_changes_count: assessments.filter((a) => a.recommendation === "renew_with_changes").length,
      replace_count: assessments.filter((a) => a.recommendation === "replace").length,
      retire_count: assessments.filter((a) => a.recommendation === "retire").length,
    };

    // Check if decision exists
    const { data: existing } = await supabase
      .from("renewal_decisions")
      .select("id")
      .eq("app_id", appId)
      .single();

    if (existing) {
      // Update existing
      await supabase
        .from("renewal_decisions")
        .update({
          ...stats,
          updated_at: new Date().toISOString(),
        })
        .eq("app_id", appId);
    } else {
      // Create new
      await supabase
        .from("renewal_decisions")
        .insert({
          app_id: appId,
          ...stats,
          status: "collecting",
        });
    }
  } catch (error) {
    console.error("Error updating renewal decision:", error);
  }
}
