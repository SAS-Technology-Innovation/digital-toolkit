import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/rbac";
import type { Database, UserRole } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]
 * Get a single user profile
 * Requires admin role
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Check admin permissions
  const { authorized, errorResponse } = await requireRole("admin");
  if (!authorized) {
    return errorResponse;
  }

  try {
    const { id } = await params;
    const serviceClient = createServiceClient() as SupabaseClient<Database>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user, error } = await (serviceClient as any)
      .from("user_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({ user });
  } catch (error) {
    console.error("Error in GET /api/users/[id]:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]
 * Update a user profile (role, is_active, name, department, division)
 * Requires admin role
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  // Check admin permissions
  const { authorized, profile, errorResponse } = await requireRole("admin");
  if (!authorized) {
    return errorResponse;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { role, is_active, name, department, division } = body;

    // Validate role if provided
    if (role !== undefined) {
      const validRoles: UserRole[] = ["staff", "tic", "approver", "admin"];
      if (!validRoles.includes(role)) {
        return Response.json(
          { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const serviceClient = createServiceClient() as SupabaseClient<Database>;

    // Check if user exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingUser, error: fetchError } = await (serviceClient as any)
      .from("user_profiles")
      .select("id, email, role")
      .eq("id", id)
      .single();

    if (fetchError || !existingUser) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent admin from demoting themselves
    if (existingUser.email === profile?.email && role && role !== "admin") {
      return Response.json(
        { error: "You cannot change your own admin role" },
        { status: 400 }
      );
    }

    // Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;
    if (name !== undefined) updates.name = name;
    if (department !== undefined) updates.department = department;
    if (division !== undefined) updates.division = division;

    // Update user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user, error } = await (serviceClient as any)
      .from("user_profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return Response.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    return Response.json({ user });
  } catch (error) {
    console.error("Error in PATCH /api/users/[id]:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Soft delete a user (set is_active to false)
 * Requires admin role
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Check admin permissions
  const { authorized, profile, errorResponse } = await requireRole("admin");
  if (!authorized) {
    return errorResponse;
  }

  try {
    const { id } = await params;
    const serviceClient = createServiceClient() as SupabaseClient<Database>;

    // Check if user exists and prevent self-deletion
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingUser, error: fetchError } = await (serviceClient as any)
      .from("user_profiles")
      .select("id, email")
      .eq("id", id)
      .single();

    if (fetchError || !existingUser) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent admin from deactivating themselves
    if (existingUser.email === profile?.email) {
      return Response.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // Soft delete by setting is_active to false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (serviceClient as any)
      .from("user_profiles")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error deactivating user:", error);
      return Response.json(
        { error: "Failed to deactivate user" },
        { status: 500 }
      );
    }

    return Response.json({ success: true, message: "User deactivated" });
  } catch (error) {
    console.error("Error in DELETE /api/users/[id]:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
