import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";
import type { UserRole, Database } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Role hierarchy - higher roles have all permissions of lower roles
 * admin > approver > tic > staff
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  staff: 1,
  tic: 2,
  approver: 3,
  admin: 4,
};

/**
 * Get the current authenticated user's profile with role
 */
export async function getCurrentUserProfile() {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { user: null, profile: null, error: "Not authenticated" };
    }

    // Get user profile with role
    const serviceClient = createServiceClient() as SupabaseClient<Database>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error: profileError } = await (serviceClient as any)
      .from("user_profiles")
      .select("id, email, name, role, department, division, is_active")
      .eq("email", user.email)
      .single();

    if (profileError || !profile) {
      // User is authenticated but has no profile - treat as staff
      return {
        user,
        profile: {
          id: null,
          email: user.email,
          name: null,
          role: "staff" as UserRole,
          department: null,
          division: null,
          is_active: true,
        },
        error: null,
      };
    }

    return { user, profile, error: null };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { user: null, profile: null, error: "Failed to get user profile" };
  }
}

/**
 * Check if user has at least the required role
 */
export function hasRole(userRole: UserRole | null | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can perform TIC actions (tic, approver, or admin)
 */
export function canPerformTicActions(userRole: UserRole | null | undefined): boolean {
  return hasRole(userRole, "tic");
}

/**
 * Check if user can perform approver actions (approver or admin)
 */
export function canPerformApproverActions(userRole: UserRole | null | undefined): boolean {
  return hasRole(userRole, "approver");
}

/**
 * Check if user can perform admin actions (admin only)
 */
export function canPerformAdminActions(userRole: UserRole | null | undefined): boolean {
  return hasRole(userRole, "admin");
}

/**
 * Verify user has required role, returns error response if not
 */
export async function requireRole(requiredRole: UserRole): Promise<{
  authorized: boolean;
  profile: { id: string | null; email: string; role: UserRole } | null;
  errorResponse?: Response;
}> {
  const { profile, error } = await getCurrentUserProfile();

  if (error || !profile) {
    return {
      authorized: false,
      profile: null,
      errorResponse: new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  if (!profile.is_active) {
    return {
      authorized: false,
      profile: null,
      errorResponse: new Response(
        JSON.stringify({ error: "Account is inactive" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  if (!hasRole(profile.role as UserRole, requiredRole)) {
    return {
      authorized: false,
      profile: profile as { id: string | null; email: string; role: UserRole },
      errorResponse: new Response(
        JSON.stringify({
          error: `Insufficient permissions. Required role: ${requiredRole}`,
          currentRole: profile.role,
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  return {
    authorized: true,
    profile: profile as { id: string | null; email: string; role: UserRole },
  };
}
