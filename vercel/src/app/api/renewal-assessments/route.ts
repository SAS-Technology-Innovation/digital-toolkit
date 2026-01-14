import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";
import type { RenewalAssessmentInsert, UserProfileInsert, Database } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

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
 * Also auto-creates or updates user profile
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      app_id,
      submitter_email,
      submitter_name,
      submitter_departments,
      submitter_division,
      recommendation,
      justification,
    } = body;

    if (!app_id || !submitter_email || !recommendation || !justification) {
      return NextResponse.json(
        { error: "Missing required fields: app_id, submitter_email, recommendation, justification" },
        { status: 400 }
      );
    }

    if (!submitter_name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!submitter_departments || submitter_departments.length === 0) {
      return NextResponse.json(
        { error: "At least one department is required" },
        { status: 400 }
      );
    }

    if (!submitter_division) {
      return NextResponse.json(
        { error: "Division is required" },
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
    const supabase = createServiceClient() as SupabaseClient<Database>;

    // First, get the app details to snapshot current values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: app, error: appError } = await (supabase as any)
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

    // Type assertion for app data (needed for build-time type checking)
    const appData = app as { renewal_date: string | null; annual_cost: number | null; licenses: number | null };

    // Auto-create or update user profile
    const userProfile = await getOrCreateUserProfile(supabase, {
      email: submitter_email,
      name: submitter_name,
      department: Array.isArray(submitter_departments)
        ? submitter_departments.join(", ")
        : submitter_departments,
      division: submitter_division,
    });

    // Prepare insert data
    const insertData: RenewalAssessmentInsert = {
      app_id,
      submitter_email,
      submitter_name: submitter_name || null,
      recommendation,
      justification,
      current_renewal_date: appData.renewal_date,
      current_annual_cost: appData.annual_cost,
      current_licenses: appData.licenses,
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

    // Add department/division/profile info to assessment (uses extended columns)
    const extendedInsertData = {
      ...insertData,
      submitter_department: Array.isArray(submitter_departments)
        ? submitter_departments.join(", ")
        : submitter_departments,
      submitter_division: submitter_division,
      submitter_profile_id: userProfile?.id || null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assessment, error: insertError } = await (supabase as any)
      .from("renewal_assessments")
      .insert(extendedInsertData)
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
 * Get or create a user profile based on email
 */
async function getOrCreateUserProfile(
  supabase: SupabaseClient<Database>,
  userData: {
    email: string;
    name: string;
    department: string;
    division: string;
  }
): Promise<{ id: string } | null> {
  try {
    // Check if user exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("user_profiles")
      .select("id, total_submissions")
      .eq("email", userData.email)
      .single();

    const now = new Date().toISOString();

    if (existing) {
      // Update existing user profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated } = await (supabase as any)
        .from("user_profiles")
        .update({
          name: userData.name,
          department: userData.department,
          division: userData.division,
          last_submission_at: now,
          total_submissions: (existing.total_submissions || 0) + 1,
        })
        .eq("id", existing.id)
        .select("id")
        .single();

      return updated;
    } else {
      // Create new user profile
      const insertData: UserProfileInsert = {
        email: userData.email,
        name: userData.name,
        department: userData.department,
        division: userData.division,
        role: "staff",
        first_submission_at: now,
        last_submission_at: now,
        total_submissions: 1,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: created, error } = await (supabase as any)
        .from("user_profiles")
        .insert(insertData)
        .select("id")
        .single();

      if (error) {
        console.error("Error creating user profile:", error);
        return null;
      }

      return created;
    }
  } catch (error) {
    console.error("Error in getOrCreateUserProfile:", error);
    return null;
  }
}

/**
 * Update or create renewal decision for an app
 * Aggregates all teacher submissions
 */
async function updateRenewalDecision(
  appId: string,
  supabase: SupabaseClient<Database>
) {
  try {
    // Get all assessments for this app
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assessments } = await (supabase as any)
      .from("renewal_assessments")
      .select("recommendation")
      .eq("app_id", appId);

    if (!assessments) return;

    // Calculate stats
    const stats = {
      total_submissions: assessments.length,
      renew_count: assessments.filter((a: { recommendation: string }) => a.recommendation === "renew").length,
      renew_with_changes_count: assessments.filter((a: { recommendation: string }) => a.recommendation === "renew_with_changes").length,
      replace_count: assessments.filter((a: { recommendation: string }) => a.recommendation === "replace").length,
      retire_count: assessments.filter((a: { recommendation: string }) => a.recommendation === "retire").length,
    };

    // Check if decision exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("renewal_decisions")
      .select("id")
      .eq("app_id", appId)
      .single();

    if (existing) {
      // Update existing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("renewal_decisions")
        .update({
          ...stats,
          updated_at: new Date().toISOString(),
        })
        .eq("app_id", appId);
    } else {
      // Create new
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
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
