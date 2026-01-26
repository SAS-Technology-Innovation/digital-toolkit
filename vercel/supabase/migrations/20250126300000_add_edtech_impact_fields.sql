-- Migration: Add EdTech Impact fields to apps table
-- Focus on actionable data that supports procurement, compliance, and management

-- Compliance and Privacy (required for legal/security)
ALTER TABLE apps ADD COLUMN IF NOT EXISTS privacy_policy_url TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS terms_url TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS gdpr_url TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS risk_rating TEXT;

-- Product Assessment (critical for renewal decisions)
ALTER TABLE apps ADD COLUMN IF NOT EXISTS global_rating DECIMAL(3,2); -- 0.00 to 5.00 EdTech Impact rating
ALTER TABLE apps ADD COLUMN IF NOT EXISTS assessment_status TEXT; -- RETIRE, UNDER_REVIEW, RETAIN, RECOMMENDED
ALTER TABLE apps ADD COLUMN IF NOT EXISTS recommended_reason TEXT;

-- Accessibility and Languages (important for SAS international community)
ALTER TABLE apps ADD COLUMN IF NOT EXISTS accessibility TEXT; -- Robust, Moderate, Limited
ALTER TABLE apps ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;

-- Support and Training (helps with teacher onboarding)
ALTER TABLE apps ADD COLUMN IF NOT EXISTS support_options JSONB DEFAULT '[]'::jsonb;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS training_options JSONB DEFAULT '[]'::jsonb;

-- Commercial Information (budget planning)
ALTER TABLE apps ADD COLUMN IF NOT EXISTS purchase_models JSONB DEFAULT '[]'::jsonb;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS price_from TEXT; -- Original price string

-- Product Ecosystem (finding alternatives when retiring)
ALTER TABLE apps ADD COLUMN IF NOT EXISTS alternatives JSONB DEFAULT '[]'::jsonb;

-- Contract Management
ALTER TABLE apps ADD COLUMN IF NOT EXISTS contract_start_date DATE;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS contract_end_date DATE;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT false;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS notice_period TEXT;

-- Internal Management (ownership and accountability)
ALTER TABLE apps ADD COLUMN IF NOT EXISTS product_champion TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS product_manager TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS provider_contact TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS finance_contact TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS notes TEXT;

-- Sync metadata
ALTER TABLE apps ADD COLUMN IF NOT EXISTS edtech_impact_id TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS last_edtech_sync TIMESTAMP WITH TIME ZONE;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_apps_assessment_status ON apps(assessment_status);
CREATE INDEX IF NOT EXISTS idx_apps_global_rating ON apps(global_rating);

-- Comments
COMMENT ON COLUMN apps.assessment_status IS 'EdTech Impact assessment: RETIRE, UNDER_REVIEW, RETAIN, RECOMMENDED';
COMMENT ON COLUMN apps.global_rating IS 'EdTech Impact global rating (0-5 scale)';
COMMENT ON COLUMN apps.alternatives IS 'JSON array of alternative products [{id, name, slug}]';
