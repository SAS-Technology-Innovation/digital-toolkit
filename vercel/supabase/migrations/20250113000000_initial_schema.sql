-- Supabase Schema for SAS Digital Toolkit
-- Run this in Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE app_status_type AS ENUM ('operational', 'issues', 'maintenance');
CREATE TYPE sync_status_type AS ENUM ('pending', 'in_progress', 'completed', 'failed');

-- ============================================
-- APPS TABLE
-- Main table storing all educational apps/tools
-- ============================================

CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product TEXT NOT NULL,
  description TEXT,
  category TEXT,
  subject TEXT,
  department TEXT,
  division TEXT,
  audience TEXT[],
  website TEXT,
  tutorial_link TEXT,
  logo_url TEXT,
  sso_enabled BOOLEAN DEFAULT false,
  mobile_app BOOLEAN DEFAULT false,
  grade_levels TEXT,
  is_new BOOLEAN DEFAULT false,
  vendor TEXT,
  license_type TEXT,
  renewal_date DATE,
  annual_cost DECIMAL(10, 2),
  licenses INTEGER,
  utilization INTEGER,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  apps_script_id TEXT UNIQUE
);

-- Index for faster lookups
CREATE INDEX idx_apps_category ON apps(category);
CREATE INDEX idx_apps_division ON apps(division);
CREATE INDEX idx_apps_apps_script_id ON apps(apps_script_id);
CREATE INDEX idx_apps_renewal_date ON apps(renewal_date);

-- ============================================
-- SYNC LOGS TABLE
-- Tracks sync operations between Apps Script and Supabase
-- ============================================

CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_type TEXT NOT NULL,
  status sync_status_type DEFAULT 'pending',
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  triggered_by TEXT
);

-- Index for recent syncs
CREATE INDEX idx_sync_logs_started_at ON sync_logs(started_at DESC);

-- ============================================
-- APP STATUS TABLE
-- Real-time status monitoring for apps
-- ============================================

CREATE TABLE IF NOT EXISTS app_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  status app_status_type DEFAULT 'operational',
  response_time INTEGER,
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  status_page_url TEXT,
  UNIQUE(app_id)
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for apps table
CREATE TRIGGER update_apps_updated_at
  BEFORE UPDATE ON apps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_status ENABLE ROW LEVEL SECURITY;

-- Public read access for apps (everyone can view)
CREATE POLICY "Public read access for apps"
  ON apps FOR SELECT
  USING (true);

-- Service role can do everything
CREATE POLICY "Service role full access on apps"
  ON apps FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on sync_logs"
  ON sync_logs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Public read access for sync_logs"
  ON sync_logs FOR SELECT
  USING (true);

CREATE POLICY "Service role full access on app_status"
  ON app_status FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Public read access for app_status"
  ON app_status FOR SELECT
  USING (true);

-- ============================================
-- VIEWS
-- ============================================

-- View for apps with their status
CREATE OR REPLACE VIEW apps_with_status AS
SELECT
  a.*,
  s.status AS current_status,
  s.response_time,
  s.last_checked
FROM apps a
LEFT JOIN app_status s ON a.id = s.app_id;

-- View for renewal summary
CREATE OR REPLACE VIEW renewal_summary AS
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
