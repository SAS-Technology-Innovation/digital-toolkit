import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";

// Types for app assignments (table may not exist in generated types yet)
interface AssignmentWithApps {
  id: string;
  role: string;
  assigned_at: string;
  apps: {
    id: string;
    product: string;
    description: string | null;
    category: string | null;
    division: string | null;
    department: string | null;
    website: string | null;
    logo_url: string | null;
    sso_enabled: boolean;
    mobile_app: boolean;
    renewal_date: string | null;
    annual_cost: number | null;
  };
}

interface AssignmentWithUser {
  id: string;
  role: string;
  assigned_at: string;
  notes: string | null;
  user_profiles: {
    id: string;
    name: string | null;
    email: string;
    department: string | null;
    division: string | null;
    avatar_url: string | null;
  };
}

/**
 * GET /api/app-assignments
 * Get app assignments - either for a specific app or for the current user
 * Query params:
 * - app_id: Get all assignments for a specific app
 * - my_apps: If "true", get all apps assigned to the current user
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("app_id");
    const myApps = searchParams.get("my_apps") === "true";

    const supabase = await createServerSupabaseClient();

    if (myApps) {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get user profile - use explicit type
      const profileResult = await supabase
        .from("user_profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      const profile = profileResult.data as { id: string } | null;

      if (!profile) {
        return NextResponse.json({ apps: [] });
      }

      // Get all apps assigned to this user with app details
      // Using service client since app_assignments may have RLS
      const serviceClient = createServiceClient();

      const { data: rawAssignments, error } = await serviceClient
        .from("app_assignments" as never)
        .select(`
          id,
          role,
          assigned_at,
          apps (
            id,
            product,
            description,
            category,
            division,
            department,
            website,
            logo_url,
            sso_enabled,
            mobile_app,
            renewal_date,
            annual_cost
          )
        `)
        .eq("user_id", profile.id)
        .order("assigned_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch my apps:", error);
        return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
      }

      const assignments = rawAssignments as unknown as AssignmentWithApps[];

      // Transform to include role in app object
      const myAppsList = (assignments || []).map((a) => ({
        ...a.apps,
        assignment_id: a.id,
        assignment_role: a.role,
        assigned_at: a.assigned_at,
      }));

      return NextResponse.json({ apps: myAppsList });
    }

    if (appId) {
      // Get all assignments for a specific app with user details
      const serviceClient = createServiceClient();

      const { data: rawAssignments, error } = await serviceClient
        .from("app_assignments" as never)
        .select(`
          id,
          role,
          assigned_at,
          notes,
          user_profiles (
            id,
            name,
            email,
            department,
            division,
            avatar_url
          )
        `)
        .eq("app_id", appId)
        .order("role");

      if (error) {
        console.error("Failed to fetch app assignments:", error);
        return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
      }

      const assignments = rawAssignments as unknown as AssignmentWithUser[];

      return NextResponse.json({ assignments: assignments || [] });
    }

    return NextResponse.json({ error: "Missing app_id or my_apps parameter" }, { status: 400 });
  } catch (err) {
    console.error("App assignments GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/app-assignments
 * Create a new app assignment
 * Body: { app_id, user_id, role, notes? }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's profile to check roles
    const profileResult = await supabase
      .from("user_profiles")
      .select("id, role, roles")
      .eq("auth_user_id", user.id)
      .single();

    const currentProfile = profileResult.data as { id: string; role: string; roles: string[] | null } | null;

    const userRoles = currentProfile?.roles || (currentProfile?.role ? [currentProfile.role] : []);
    if (!currentProfile || (!userRoles.includes("admin") && !userRoles.includes("tic"))) {
      return NextResponse.json({ error: "Forbidden - Admin or TIC role required" }, { status: 403 });
    }

    const body = await request.json();
    const { app_id, user_id, role, notes } = body;

    if (!app_id || !user_id || !role) {
      return NextResponse.json({ error: "Missing required fields: app_id, user_id, role" }, { status: 400 });
    }

    if (!["owner", "champion", "tic_manager"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be: owner, champion, or tic_manager" }, { status: 400 });
    }

    // Use service client to bypass RLS for insert
    const serviceClient = createServiceClient();

    const assignmentData = {
      app_id,
      user_id,
      role,
      notes: notes || null,
      assigned_by: currentProfile.id,
    };

    const { data: assignment, error } = await serviceClient
      .from("app_assignments" as never)
      .insert(assignmentData as never)
      .select(`
        id,
        role,
        assigned_at,
        notes,
        user_profiles (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === "23505") {
        if (error.message.includes("single_owner")) {
          return NextResponse.json({ error: "This app already has an owner" }, { status: 409 });
        }
        if (error.message.includes("single_tic")) {
          return NextResponse.json({ error: "This app already has a TIC manager" }, { status: 409 });
        }
        return NextResponse.json({ error: "This user is already assigned this role for this app" }, { status: 409 });
      }
      console.error("Failed to create assignment:", error);
      return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
    }

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (err) {
    console.error("App assignments POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/app-assignments
 * Remove an app assignment
 * Query params: id (assignment id)
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("id");

    if (!assignmentId) {
      return NextResponse.json({ error: "Missing assignment id" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's profile to check roles
    const profileResult = await supabase
      .from("user_profiles")
      .select("id, role, roles")
      .eq("auth_user_id", user.id)
      .single();

    const currentProfile = profileResult.data as { id: string; role: string; roles: string[] | null } | null;

    const delUserRoles = currentProfile?.roles || (currentProfile?.role ? [currentProfile.role] : []);
    if (!currentProfile || (!delUserRoles.includes("admin") && !delUserRoles.includes("tic"))) {
      return NextResponse.json({ error: "Forbidden - Admin or TIC role required" }, { status: 403 });
    }

    // Use service client for delete
    const serviceClient = createServiceClient();

    const { error } = await serviceClient
      .from("app_assignments" as never)
      .delete()
      .eq("id", assignmentId);

    if (error) {
      console.error("Failed to delete assignment:", error);
      return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("App assignments DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
