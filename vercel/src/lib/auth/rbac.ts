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
 * Get the highest role from a roles array
 */
export function getHighestRole(roles: string[] | null | undefined): UserRole {
  if (!roles || roles.length === 0) return "staff";
  let highest: UserRole = "staff";
  for (const r of roles) {
    const role = r as UserRole;
    if (ROLE_HIERARCHY[role] && ROLE_HIERARCHY[role] > ROLE_HIERARCHY[highest]) {
      highest = role;
    }
  }
  return highest;
}

/**
 * Check if a roles array includes a specific role
 */
export function userHasRole(roles: string[] | null | undefined, role: UserRole): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.includes(role);
}

/**
 * Get the current authenticated user's profile with roles
 */
export async function getCurrentUserProfile() {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { user: null, profile: null, error: "Not authenticated" };
    }

    // Get user profile with roles
    const serviceClient = createServiceClient() as SupabaseClient<Database>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error: profileError } = await (serviceClient as any)
      .from("user_profiles")
      .select("id, email, name, role, roles, department, division, is_active")
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
          roles: ["staff"],
          department: null,
          division: null,
          is_active: true,
        },
        error: null,
      };
    }

    // Ensure roles array is populated (backward compat with old single-role data)
    if (!profile.roles || profile.roles.length === 0) {
      profile.roles = [profile.role || "staff"];
    }

    return { user, profile, error: null };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { user: null, profile: null, error: "Failed to get user profile" };
  }
}

/**
 * Check if user has at least the required role level
 * Uses the highest role from the roles array for hierarchy checks
 */
export function hasRole(userRole: UserRole | null | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user's roles array satisfies the required role level
 */
export function hasRoleLevel(roles: string[] | null | undefined, requiredRole: UserRole): boolean {
  const highest = getHighestRole(roles);
  return hasRole(highest, requiredRole);
}

/**
 * Check if user can perform TIC actions (has tic, approver, or admin role)
 */
export function canPerformTicActions(userRoleOrRoles: UserRole | string[] | null | undefined): boolean {
  if (Array.isArray(userRoleOrRoles)) {
    return hasRoleLevel(userRoleOrRoles, "tic");
  }
  return hasRole(userRoleOrRoles as UserRole, "tic");
}

/**
 * Check if user can perform approver actions (has approver or admin role)
 */
export function canPerformApproverActions(userRoleOrRoles: UserRole | string[] | null | undefined): boolean {
  if (Array.isArray(userRoleOrRoles)) {
    return hasRoleLevel(userRoleOrRoles, "approver");
  }
  return hasRole(userRoleOrRoles as UserRole, "approver");
}

/**
 * Check if user can perform admin actions (has admin role)
 */
export function canPerformAdminActions(userRoleOrRoles: UserRole | string[] | null | undefined): boolean {
  if (Array.isArray(userRoleOrRoles)) {
    return hasRoleLevel(userRoleOrRoles, "admin");
  }
  return hasRole(userRoleOrRoles as UserRole, "admin");
}

/**
 * Verify user has required role, returns error response if not
 */
export async function requireRole(requiredRole: UserRole): Promise<{
  authorized: boolean;
  profile: { id: string | null; email: string; role: UserRole; roles: string[] } | null;
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

  // Check using roles array (multi-role) with fallback to single role
  const roles = profile.roles || [profile.role || "staff"];
  const highestRole = getHighestRole(roles);

  if (!hasRole(highestRole, requiredRole)) {
    return {
      authorized: false,
      profile: { id: profile.id, email: profile.email, role: highestRole, roles },
      errorResponse: new Response(
        JSON.stringify({
          error: `Insufficient permissions. Required role: ${requiredRole}`,
          currentRoles: roles,
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  return {
    authorized: true,
    profile: { id: profile.id, email: profile.email, role: highestRole, roles },
  };
}
