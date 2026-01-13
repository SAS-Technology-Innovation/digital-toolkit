import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppUpdate } from "@/lib/supabase/types";

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

/**
 * PATCH /api/apps/[id]
 * Update an app's fields (partial update)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    // Only allow certain fields to be updated
    const allowedFields = [
      "status",
      "renewal_date",
      "annual_cost",
      "licenses",
      "utilization",
      "license_type",
      "description",
      "notes",
    ];

    const updates: AppUpdate = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (updates as Record<string, unknown>)[field] = body[field];
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
