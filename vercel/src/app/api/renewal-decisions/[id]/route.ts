import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";
import { requireRole, canPerformTicActions, canPerformApproverActions, getCurrentUserProfile } from "@/lib/auth/rbac";
import type { Database } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * GET /api/renewal-decisions/[id]
 * Get a single decision with all related data
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Get decision with app details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: decision, error } = await (supabase as any)
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
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Type assertion for decision
    const typedDecision = decision as { app_id: string; [key: string]: unknown };

    // Get all assessments for this app
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assessments } = await (supabase as any)
      .from("renewal_assessments")
      .select("*")
      .eq("app_id", typedDecision.app_id)
      .order("submission_date", { ascending: false });

    return NextResponse.json({
      ...typedDecision,
      assessments: assessments || [],
    });
  } catch (error) {
    console.error("Error fetching decision:", error);
    return NextResponse.json(
      { error: "Failed to fetch decision" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/renewal-decisions/[id]
 * Update a decision (TIC review or Director decision)
 * Role requirements:
 * - tic_review, generate_summary: TIC or higher
 * - director_decision: Approver or higher
 * - implement: Admin only
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    // Get current user profile for authorization
    const { profile, error: authError } = await getCurrentUserProfile();
    if (authError || !profile) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userRoles = profile.roles || [profile.role || "staff"];

    // Check role based on action
    switch (action) {
      case "tic_review":
      case "generate_summary":
        if (!canPerformTicActions(userRoles)) {
          return NextResponse.json(
            { error: "TIC role or higher required for this action" },
            { status: 403 }
          );
        }
        break;
      case "director_decision":
        if (!canPerformApproverActions(userRoles)) {
          return NextResponse.json(
            { error: "Approver role or higher required for this action" },
            { status: 403 }
          );
        }
        break;
      case "implement":
        // Only admin can mark as implemented
        const { authorized, errorResponse } = await requireRole("admin");
        if (!authorized || errorResponse) {
          return NextResponse.json(
            { error: "Admin role required to mark as implemented" },
            { status: 403 }
          );
        }
        break;
      default:
        // For generic updates, require at least TIC role
        if (!canPerformTicActions(userRoles)) {
          return NextResponse.json(
            { error: "TIC role or higher required" },
            { status: 403 }
          );
        }
    }

    const supabase = createServiceClient() as SupabaseClient<Database>;

    let updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Handle different actions
    switch (action) {
      case "tic_review":
        // TIC (Assessor) reviewing the aggregated feedback
        // Use the authenticated user's info instead of allowing spoofing
        updates = {
          ...updates,
          assessor_email: profile.email,
          assessor_name: profile.name || body.assessor_name,
          assessor_comment: body.assessor_comment,
          assessor_recommendation: body.assessor_recommendation,
          assessor_reviewed_at: new Date().toISOString(),
          status: "final_review",
        };
        break;

      case "director_decision":
        // Director making the final decision
        // Use the authenticated user's info instead of allowing spoofing
        updates = {
          ...updates,
          approver_email: profile.email,
          approver_name: profile.name || body.approver_name,
          approver_comment: body.approver_comment,
          final_decision: body.final_decision,
          final_decided_at: new Date().toISOString(),
          new_renewal_date: body.new_renewal_date || null,
          new_annual_cost: body.new_annual_cost || null,
          new_licenses: body.new_licenses || null,
          implementation_notes: body.implementation_notes || null,
          status: "decided",
        };
        break;

      case "implement":
        // Mark as implemented (synced back to Apps Script)
        updates = {
          ...updates,
          status: "implemented",
        };
        break;

      case "generate_summary":
        // Regenerate AI summary
        updates = {
          ...updates,
          status: "summarizing",
        };
        // AI generation handled separately
        break;

      default:
        // Generic update - only allow certain fields
        const allowedFields = [
          "status",
          "assessor_comment",
          "assessor_recommendation",
          "approver_comment",
          "final_decision",
          "new_renewal_date",
          "new_annual_cost",
          "new_licenses",
          "implementation_notes",
        ];

        for (const field of allowedFields) {
          if (body[field] !== undefined) {
            updates[field] = body[field];
          }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("renewal_decisions")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        apps (
          id,
          product,
          vendor,
          category,
          division
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Type assertion for data
    const typedData = data as { app_id: string; [key: string]: unknown };

    // If director made a decision to renew/retire, update the app status
    if (action === "director_decision" && body.final_decision) {
      if (body.final_decision === "retire") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("apps")
          .update({ status: "retired" })
          .eq("id", typedData.app_id);
      } else if (body.new_renewal_date) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("apps")
          .update({
            renewal_date: body.new_renewal_date,
            annual_cost: body.new_annual_cost || null,
            licenses: body.new_licenses || null,
          })
          .eq("id", typedData.app_id);
      }
    }

    return NextResponse.json(typedData);
  } catch (error) {
    console.error("Error updating decision:", error);
    return NextResponse.json(
      { error: "Failed to update decision" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/renewal-decisions/[id]
 * Delete a decision (admin only)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user has admin role
    const { authorized, errorResponse } = await requireRole("admin");
    if (!authorized || errorResponse) {
      return errorResponse;
    }

    const { id } = await params;
    const supabase = createServiceClient() as SupabaseClient<Database>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("renewal_decisions")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting decision:", error);
    return NextResponse.json(
      { error: "Failed to delete decision" },
      { status: 500 }
    );
  }
}
