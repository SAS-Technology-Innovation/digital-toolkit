-- App Assignments table for tracking app owners, champions, and TIC managers
-- Each app can have one owner, multiple champions, and one TIC manager

-- Create assignment role enum
CREATE TYPE app_assignment_role AS ENUM ('owner', 'champion', 'tic_manager');

-- Create app_assignments junction table
CREATE TABLE app_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role app_assignment_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique assignment per user per app per role
  UNIQUE(app_id, user_id, role)
);

-- Create index for efficient lookups
CREATE INDEX idx_app_assignments_app_id ON app_assignments(app_id);
CREATE INDEX idx_app_assignments_user_id ON app_assignments(user_id);
CREATE INDEX idx_app_assignments_role ON app_assignments(role);

-- Constraint: Only one owner per app
CREATE UNIQUE INDEX idx_app_assignments_single_owner
ON app_assignments(app_id)
WHERE role = 'owner';

-- Constraint: Only one TIC manager per app
CREATE UNIQUE INDEX idx_app_assignments_single_tic
ON app_assignments(app_id)
WHERE role = 'tic_manager';

-- Enable RLS
ALTER TABLE app_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read assignments
CREATE POLICY "Anyone can read app assignments"
ON app_assignments FOR SELECT
USING (true);

-- Policy: Admins and TICs can manage assignments
CREATE POLICY "Admins and TICs can manage app assignments"
ON app_assignments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.auth_user_id = auth.uid()
    AND user_profiles.role IN ('admin', 'tic')
  )
);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_app_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER app_assignments_updated_at
  BEFORE UPDATE ON app_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_app_assignments_updated_at();

-- Comment on table
COMMENT ON TABLE app_assignments IS 'Junction table linking apps to users with specific roles (owner, champion, tic_manager)';
COMMENT ON COLUMN app_assignments.role IS 'owner: single primary owner, champion: multiple product champions, tic_manager: single TIC oversight';
