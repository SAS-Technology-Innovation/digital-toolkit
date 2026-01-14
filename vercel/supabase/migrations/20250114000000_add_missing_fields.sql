-- Migration to add missing fields from Apps Script data
-- Run this in Supabase SQL Editor

-- Add missing fields to apps table
ALTER TABLE apps ADD COLUMN IF NOT EXISTS enterprise BOOLEAN DEFAULT false;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS budget TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS support_email TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS date_added DATE;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS is_whole_school BOOLEAN DEFAULT false;

-- Add index for enterprise apps (frequently queried)
CREATE INDEX IF NOT EXISTS idx_apps_enterprise ON apps(enterprise) WHERE enterprise = true;

-- Add index for date_added to support "NEW" badge queries
CREATE INDEX IF NOT EXISTS idx_apps_date_added ON apps(date_added);

-- Comment on new columns for documentation
COMMENT ON COLUMN apps.enterprise IS 'Enterprise/core SAS tools - appear only in Whole School tab';
COMMENT ON COLUMN apps.budget IS 'Budget category: Office Of Learning, IT Operations, Communications, Business Office';
COMMENT ON COLUMN apps.support_email IS 'Support contact email for the app';
COMMENT ON COLUMN apps.date_added IS 'Date app was added to the catalog (for NEW badge)';
COMMENT ON COLUMN apps.is_whole_school IS 'Computed flag: true if app is available to all divisions';
