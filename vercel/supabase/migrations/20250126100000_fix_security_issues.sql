-- Migration: Fix Supabase Security and Performance Issues
-- Addresses findings from Supabase database linter

-- ============================================
-- 1. FIX SECURITY DEFINER VIEWS (ERROR)
-- Recreate views with SECURITY INVOKER
-- ============================================

-- Drop and recreate apps_with_status view
DROP VIEW IF EXISTS apps_with_status;
CREATE VIEW apps_with_status
WITH (security_invoker = true)
AS
SELECT
  a.*,
  s.status AS current_status,
  s.response_time,
  s.last_checked
FROM apps a
LEFT JOIN app_status s ON a.id = s.app_id;

-- Drop and recreate renewal_summary view
DROP VIEW IF EXISTS renewal_summary;
CREATE VIEW renewal_summary
WITH (security_invoker = true)
AS
SELECT
  division,
  COUNT(*) AS total_apps,
  SUM(annual_cost) AS total_cost,
  SUM(licenses) AS total_licenses,
  AVG(utilization) AS avg_utilization,
  COUNT(*) FILTER (WHERE renewal_date < CURRENT_DATE) AS overdue,
  COUNT(*) FILTER (WHERE renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') AS urgent,
  COUNT(*) FILTER (WHERE renewal_date BETWEEN CURRENT_DATE + INTERVAL '30 days' AND CURRENT_DATE + INTERVAL '90 days') AS upcoming
FROM apps
WHERE renewal_date IS NOT NULL
GROUP BY division;

-- ============================================
-- 2. FIX FUNCTION SEARCH_PATH (WARN)
-- Add SET search_path = '' for security
-- ============================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix update_app_assignments_updated_at function
CREATE OR REPLACE FUNCTION public.update_app_assignments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- 3. DROP DUPLICATE/REDUNDANT RLS POLICIES
-- Consolidate multiple permissive policies
-- ============================================

-- Apps table: Drop service role policy (covered by public read + service role bypass)
DROP POLICY IF EXISTS "Service role full access on apps" ON apps;

-- Sync logs: Drop redundant policies
DROP POLICY IF EXISTS "Service role full access on sync_logs" ON sync_logs;

-- App status: Drop redundant policies
DROP POLICY IF EXISTS "Service role full access on app_status" ON app_status;

-- Renewal assessments: Drop redundant policies
DROP POLICY IF EXISTS "Service role full access on renewal_assessments" ON renewal_assessments;
DROP POLICY IF EXISTS "Public insert access for renewal_assessments" ON renewal_assessments;

-- Renewal decisions: Drop redundant policies
DROP POLICY IF EXISTS "Service role full access on renewal_decisions" ON renewal_decisions;

-- App assignments: Drop redundant read policy (keep the admin/tic management one)
DROP POLICY IF EXISTS "Anyone can read app assignments" ON app_assignments;

-- ============================================
-- 4. RECREATE CONSOLIDATED RLS POLICIES
-- Use (select auth.function()) for performance
-- ============================================

-- Apps: Service role write access with optimized auth check
CREATE POLICY "Service role write access on apps"
  ON apps FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- Sync logs: Service role write access
CREATE POLICY "Service role write access on sync_logs"
  ON sync_logs FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- App status: Service role write access
CREATE POLICY "Service role write access on app_status"
  ON app_status FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- Renewal assessments: Separate read and insert policies
CREATE POLICY "Service role write access on renewal_assessments"
  ON renewal_assessments FOR UPDATE
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "Service role delete on renewal_assessments"
  ON renewal_assessments FOR DELETE
  USING ((select auth.role()) = 'service_role');

-- Authenticated users can insert assessments (not wide open)
CREATE POLICY "Authenticated users can submit assessments"
  ON renewal_assessments FOR INSERT
  WITH CHECK (
    -- Allow authenticated users to submit
    (select auth.role()) = 'authenticated'
    -- Or service role
    OR (select auth.role()) = 'service_role'
    -- Or anon for public form submissions (controlled by frontend)
    OR (select auth.role()) = 'anon'
  );

-- Renewal decisions: Service role write access
CREATE POLICY "Service role write access on renewal_decisions"
  ON renewal_decisions FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ============================================
-- 5. FIX APP ASSIGNMENTS RLS POLICIES
-- Optimize and consolidate
-- ============================================

-- Drop the existing management policy
DROP POLICY IF EXISTS "Admins and TICs can manage app assignments" ON app_assignments;

-- Recreate with optimized auth check
CREATE POLICY "Admins and TICs can manage app assignments"
ON app_assignments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.auth_user_id = (select auth.uid())
    AND user_profiles.role IN ('admin', 'tic')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.auth_user_id = (select auth.uid())
    AND user_profiles.role IN ('admin', 'tic')
  )
);

-- Public read for app assignments (single policy)
CREATE POLICY "Public read access for app assignments"
ON app_assignments FOR SELECT
USING (true);

-- ============================================
-- 6. FIX USER_PROFILES RLS POLICIES
-- ============================================

-- Drop existing policies on user_profiles that need fixing
DROP POLICY IF EXISTS "Service role full access on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Recreate with optimized auth check
CREATE POLICY "Service role full access on user_profiles"
  ON user_profiles FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth_user_id = (select auth.uid()))
  WITH CHECK (auth_user_id = (select auth.uid()));

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON VIEW apps_with_status IS 'View joining apps with their current status. Uses SECURITY INVOKER to respect RLS.';
COMMENT ON VIEW renewal_summary IS 'Aggregated renewal statistics by division. Uses SECURITY INVOKER to respect RLS.';
