import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppUpdate } from "@/lib/supabase/types";
import { requireRole } from "@/lib/auth/rbac";

/**
 * GET /api/apps/[id]
 * Fetch a single app by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: app, error } = await supabase
      .from("apps")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(app);
  } catch (error) {
    console.error("Error fetching app:", error);
    return NextResponse.json(
      { error: "Failed to fetch app" },
      { status: 500 }
    );
  }
}

// All fields that can be edited via the PATCH endpoint
const ALLOWED_FIELDS = [
  // Core
  "product", "description", "category", "subject", "department",
  "division", "audience", "grade_levels",
  // URLs
  "website", "tutorial_link", "logo_url",
  // Technical
  "sso_enabled", "mobile_app", "is_new", "enterprise", "is_whole_school",
  // Vendor & cost
  "vendor", "license_type", "annual_cost", "licenses", "utilization",
  "budget", "renewal_date", "date_added", "support_email", "status",
  // Compliance
  "privacy_policy_url", "terms_url", "gdpr_url", "risk_rating",
  // Assessment
  "global_rating", "assessment_status", "recommended_reason", "accessibility",
  // Commercial
  "price_from",
  // Contract
  "contract_start_date", "contract_end_date", "auto_renew", "notice_period",
  // Internal
  "product_champion", "product_manager", "provider_contact", "finance_contact",
  "notes", "edtech_impact_id",
];

const NUMERIC_FIELDS = ["annual_cost", "licenses", "utilization", "global_rating"];
const BOOLEAN_FIELDS = ["sso_enabled", "mobile_app", "enterprise", "is_new", "is_whole_school", "auto_renew"];

/**
 * PATCH /api/apps/[id]
 * Update an app's fields (partial update)
 * Requires TIC or Admin role.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check: require TIC or higher
    const { authorized, errorResponse } = await requireRole("tic");
    if (!authorized) {
      return errorResponse;
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const updates: AppUpdate = {};
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        let value = body[field];

        // Type coercion for numeric fields
        if (NUMERIC_FIELDS.includes(field)) {
          value = value === null || value === "" ? null : Number(value);
          if (value !== null && isNaN(value)) value = null;
        }

        // Type coercion for boolean fields
        if (BOOLEAN_FIELDS.includes(field)) {
          value = value === true || value === "true";
        }

        (updates as Record<string, unknown>)[field] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { data: app, error } = await supabase
      .from("apps")
      .update(updates as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(app);
  } catch (error) {
    console.error("Error updating app:", error);
    return NextResponse.json(
      { error: "Failed to update app" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/apps/[id]
 * Soft delete an app (set status to 'retired')
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Soft delete - set status to 'retired'
    const retireUpdate: AppUpdate = {
      status: "retired",
      updated_at: new Date().toISOString(),
    };
    const { data: app, error } = await supabase
      .from("apps")
      .update(retireUpdate as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, app });
  } catch (error) {
    console.error("Error retiring app:", error);
    return NextResponse.json(
      { error: "Failed to retire app" },
      { status: 500 }
    );
  }
}
