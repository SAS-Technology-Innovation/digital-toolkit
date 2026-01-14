import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/rbac";
import type { Database, UserRole } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * GET /api/users
 * List all users with optional filtering
 * Requires admin role
 */
export async function GET(request: NextRequest) {
  // Check admin permissions
  const { authorized, errorResponse } = await requireRole("admin");
  if (!authorized) {
    return errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") as UserRole | null;
    const isActive = searchParams.get("is_active");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const serviceClient = createServiceClient() as SupabaseClient<Database>;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (serviceClient as any)
      .from("user_profiles")
      .select("*", { count: "exact" });

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Apply role filter
    if (role) {
      query = query.eq("role", role);
    }

    // Apply active status filter
    if (isActive !== null) {
      query = query.eq("is_active", isActive === "true");
    }

    // Apply pagination and ordering
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      return Response.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return Response.json({
      users: users || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error in GET /api/users:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user profile
 * Requires admin role
 */
export async function POST(request: NextRequest) {
  // Check admin permissions
  const { authorized, errorResponse } = await requireRole("admin");
  if (!authorized) {
    return errorResponse;
  }

  try {
    const body = await request.json();
    const { email, name, department, division, role = "staff" } = body;

    if (!email) {
      return Response.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email domain
    if (!email.endsWith("@sas.edu.sg")) {
      return Response.json(
        { error: "Email must be an @sas.edu.sg address" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: UserRole[] = ["staff", "tic", "approver", "admin"];
    if (!validRoles.includes(role)) {
      return Response.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient() as SupabaseClient<Database>;

    // Check if user already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (serviceClient as any)
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return Response.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create user profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user, error } = await (serviceClient as any)
      .from("user_profiles")
      .insert({
        email,
        name,
        department,
        division,
        role,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return Response.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/users:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
