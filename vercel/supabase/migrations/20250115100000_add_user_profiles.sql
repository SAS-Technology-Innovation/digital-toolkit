-- Migration: Add user profiles with roles
-- Users are auto-created when they submit their first assessment

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM (
  'staff',     -- Regular staff/teachers who submit assessments
  'tic',       -- Technology Innovation Coordinator - reviews and summarizes
  'approver',  -- Director/Principal - makes final decisions
  'admin'      -- Full admin access
);

-- ============================================
-- USER PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity (linked to Supabase Auth when they log in)
  email TEXT NOT NULL UNIQUE,
  name TEXT,

  -- Organization info
  department TEXT,
  division TEXT,

  -- Role and permissions
  role user_role DEFAULT 'staff',

  -- Profile metadata
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,

  -- First submission tracking
  first_submission_at TIMESTAMPTZ,
  last_submission_at TIMESTAMPTZ,
  total_submissions INTEGER DEFAULT 0,

  -- Supabase Auth link (populated when user logs in with magic link)
  auth_user_id UUID UNIQUE,

  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_department ON user_profiles(department);
CREATE INDEX idx_user_profiles_division ON user_profiles(division);
CREATE INDEX idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Public can read basic profile info
CREATE POLICY "Public read access for user_profiles"
  ON user_profiles FOR SELECT
  USING (true);

-- Service role can do everything
CREATE POLICY "Service role full access on user_profiles"
  ON user_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- ============================================
-- UPDATE RENEWAL_ASSESSMENTS TABLE
-- Add submitter profile reference
-- ============================================

ALTER TABLE renewal_assessments
  ADD COLUMN IF NOT EXISTS submitter_department TEXT,
  ADD COLUMN IF NOT EXISTS submitter_division TEXT,
  ADD COLUMN IF NOT EXISTS submitter_profile_id UUID REFERENCES user_profiles(id);

CREATE INDEX idx_renewal_assessments_profile ON renewal_assessments(submitter_profile_id);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE user_profiles IS 'User profiles with roles for the renewal assessment system';
COMMENT ON COLUMN user_profiles.role IS 'User role: staff, tic (reviewer), approver (director), admin';
COMMENT ON COLUMN user_profiles.auth_user_id IS 'Links to Supabase Auth user when they log in via magic link';
COMMENT ON COLUMN user_profiles.first_submission_at IS 'When user submitted their first assessment';
