-- Migration: Multi-role support + auto-create profiles on auth signup
-- 1. Add roles text[] column alongside existing role column
-- 2. Migrate existing single role data to roles array
-- 3. Create trigger to auto-create user_profiles when auth.users are created

-- ============================================
-- MULTI-ROLE: Add roles array column
-- ============================================

-- Add new roles column as text array (keeps the existing ENUM for backward compat during migration)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS roles text[] DEFAULT '{staff}';

-- Migrate existing role data to roles array
UPDATE user_profiles
  SET roles = ARRAY[role::text]
  WHERE roles IS NULL OR roles = '{staff}';

-- For existing admins, ensure they also have staff in their roles
-- (admins should have all lower roles too, but we keep it explicit)
UPDATE user_profiles
  SET roles = ARRAY[role::text]
  WHERE role IS NOT NULL AND (roles IS NULL OR array_length(roles, 1) IS NULL);

-- Create index for roles array queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_roles ON user_profiles USING GIN(roles);

-- ============================================
-- AUTO-CREATE PROFILE: Trigger function
-- ============================================

-- Function to auto-create user_profiles when auth.users are created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    email,
    name,
    auth_user_id,
    role,
    roles,
    is_active
  ) VALUES (
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NULL
    ),
    NEW.id,
    'staff',
    '{staff}',
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    auth_user_id = EXCLUDED.auth_user_id,
    name = COALESCE(user_profiles.name, EXCLUDED.name),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- BACKFILL: Link existing auth users to profiles
-- ============================================

-- Link any existing auth users that don't have auth_user_id set in their profiles
UPDATE user_profiles up
  SET auth_user_id = au.id
  FROM auth.users au
  WHERE up.email = au.email
    AND up.auth_user_id IS NULL;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN user_profiles.roles IS 'Array of roles assigned to user. Supports multiple roles: staff, tic, approver, admin';
COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-creates user_profiles row when a new auth.users record is created';
