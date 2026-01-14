import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";
import type { RenewalAssessmentUpdate, Database } from "@/lib/supabase/types";
import { requireRole } from "@/lib/auth/rbac";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * GET /api/renewal-assessments/[id]
 * Get a single assessment by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("renewal_assessments")
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
          licenses,
          license_type,
          website,
          description
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching assessment:", error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/renewal-assessments/[id]
 * Update an assessment (TIC or higher role required)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user has TIC role or higher
    const { authorized, profile, errorResponse } = await requireRole("tic");
    if (!authorized || errorResponse) {
      return errorResponse;
    }

    const { id } = await params;
    const body = await request.json();

    // Use service client for admin updates
    const supabase = createServiceClient() as SupabaseClient<Database>;

    // Build update object with only allowed fields
    const allowedFields = [
      "status",
      "admin_notes",
      "reviewed_by",
      "reviewed_at",
      "outcome_notes",
      "final_decision",
    ];

    // Build updates object with only allowed fields
    const updates: RenewalAssessmentUpdate = {
      updated_at: new Date().toISOString(),
    };

    let hasFieldsToUpdate = false;
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (updates as Record<string, unknown>)[field] = body[field];
        hasFieldsToUpdate = true;
      }
    }

    if (!hasFieldsToUpdate) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // If status is changing to approved/rejected/completed, set reviewed_at and reviewed_by
    if (["approved", "rejected", "completed"].includes(body.status)) {
      if (!body.reviewed_at) {
        updates.reviewed_at = new Date().toISOString();
      }
      if (!body.reviewed_by && profile?.email) {
        updates.reviewed_by = profile.email;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("renewal_assessments")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        apps (
          id,
          product,
          vendor
        )
      `)
      .single();

    if (error) {
      console.error("Error updating assessment:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating assessment:", error);
    return NextResponse.json(
      { error: "Failed to update assessment" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/renewal-assessments/[id]
 * Delete an assessment (admin only)
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

    const { error } = await supabase
      .from("renewal_assessments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting assessment:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    return NextResponse.json(
      { error: "Failed to delete assessment" },
      { status: 500 }
    );
  }
}
