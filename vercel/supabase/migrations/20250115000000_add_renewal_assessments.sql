-- Migration: Add renewal_assessments table
-- This table stores teacher renewal assessment submissions

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE assessment_status AS ENUM (
  'submitted',
  'in_review',
  'approved',
  'rejected',
  'completed'
);

CREATE TYPE assessment_recommendation AS ENUM (
  'renew',
  'renew_with_changes',
  'replace',
  'retire'
);

-- ============================================
-- RENEWAL ASSESSMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS renewal_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- App reference
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE NOT NULL,

  -- Submitter information
  submitter_email TEXT NOT NULL,
  submitter_name TEXT,

  -- Submission metadata
  submission_date TIMESTAMPTZ DEFAULT NOW(),
  status assessment_status DEFAULT 'submitted',

  -- Current subscription info (snapshot at time of submission)
  current_renewal_date DATE,
  current_annual_cost DECIMAL(10, 2),
  current_licenses INTEGER,

  -- Usage & Impact Questions
  usage_frequency TEXT,
  primary_use_cases TEXT,
  learning_impact TEXT,
  workflow_integration TEXT,
  alternatives_considered TEXT,
  unique_value TEXT,

  -- Stakeholder feedback
  stakeholder_feedback TEXT,

  -- Recommendation
  recommendation assessment_recommendation NOT NULL,
  justification TEXT NOT NULL,

  -- Proposed changes (for renew_with_changes)
  proposed_changes TEXT,
  proposed_cost DECIMAL(10, 2),
  proposed_licenses INTEGER,

  -- Admin review fields
  admin_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,

  -- Outcome (when completed)
  outcome_notes TEXT,
  final_decision assessment_recommendation,

  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_renewal_assessments_app_id ON renewal_assessments(app_id);
CREATE INDEX idx_renewal_assessments_status ON renewal_assessments(status);
CREATE INDEX idx_renewal_assessments_submission_date ON renewal_assessments(submission_date DESC);
CREATE INDEX idx_renewal_assessments_submitter_email ON renewal_assessments(submitter_email);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_renewal_assessments_updated_at
  BEFORE UPDATE ON renewal_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE renewal_assessments ENABLE ROW LEVEL SECURITY;

-- Public can insert (for submissions)
CREATE POLICY "Public insert access for renewal_assessments"
  ON renewal_assessments FOR INSERT
  WITH CHECK (true);

-- Public read access
CREATE POLICY "Public read access for renewal_assessments"
  ON renewal_assessments FOR SELECT
  USING (true);

-- Service role can do everything
CREATE POLICY "Service role full access on renewal_assessments"
  ON renewal_assessments FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- RENEWAL DECISIONS TABLE
-- Aggregates multiple assessments for final decision
-- ============================================

CREATE TYPE decision_status AS ENUM (
  'collecting',      -- Collecting teacher feedback
  'summarizing',     -- AI summary in progress
  'assessor_review', -- Assessor reviewing
  'final_review',    -- Final approver reviewing
  'decided',         -- Decision made
  'implemented'      -- Changes synced back to apps
);

CREATE TABLE IF NOT EXISTS renewal_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- App reference
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Renewal cycle info
  renewal_cycle_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),

  -- AI-generated summary of all teacher submissions
  ai_summary TEXT,
  ai_summary_generated_at TIMESTAMPTZ,

  -- Submission statistics
  total_submissions INTEGER DEFAULT 0,
  renew_count INTEGER DEFAULT 0,
  renew_with_changes_count INTEGER DEFAULT 0,
  replace_count INTEGER DEFAULT 0,
  retire_count INTEGER DEFAULT 0,

  -- Assessor (Department Lead / PLC Coach) review
  assessor_email TEXT,
  assessor_name TEXT,
  assessor_comment TEXT,
  assessor_recommendation assessment_recommendation,
  assessor_reviewed_at TIMESTAMPTZ,

  -- Final Approver (Admin / Principal) decision
  approver_email TEXT,
  approver_name TEXT,
  approver_comment TEXT,
  final_decision assessment_recommendation,
  final_decided_at TIMESTAMPTZ,

  -- Implementation details
  new_renewal_date DATE,
  new_annual_cost DECIMAL(10, 2),
  new_licenses INTEGER,
  implementation_notes TEXT,

  -- Status tracking
  status decision_status DEFAULT 'collecting',

  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for renewal_decisions
CREATE INDEX idx_renewal_decisions_app_id ON renewal_decisions(app_id);
CREATE INDEX idx_renewal_decisions_status ON renewal_decisions(status);
CREATE INDEX idx_renewal_decisions_cycle ON renewal_decisions(renewal_cycle_year DESC);

-- Trigger for updated_at
CREATE TRIGGER update_renewal_decisions_updated_at
  BEFORE UPDATE ON renewal_decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS for renewal_decisions
ALTER TABLE renewal_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for renewal_decisions"
  ON renewal_decisions FOR SELECT
  USING (true);

CREATE POLICY "Service role full access on renewal_decisions"
  ON renewal_decisions FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE renewal_assessments IS 'Stores individual teacher renewal assessment submissions';
COMMENT ON COLUMN renewal_assessments.usage_frequency IS 'How often teachers/students use this tool';
COMMENT ON COLUMN renewal_assessments.learning_impact IS 'Impact on student learning outcomes';
COMMENT ON COLUMN renewal_assessments.recommendation IS 'Teacher recommendation: renew, renew_with_changes, replace, retire';
COMMENT ON COLUMN renewal_assessments.status IS 'Individual submission status';

COMMENT ON TABLE renewal_decisions IS 'Aggregates teacher feedback for final renewal decisions';
COMMENT ON COLUMN renewal_decisions.ai_summary IS 'AI-generated summary of all teacher submissions';
COMMENT ON COLUMN renewal_decisions.assessor_comment IS 'Department Lead/PLC Coach review comment';
COMMENT ON COLUMN renewal_decisions.approver_comment IS 'Final approver decision comment';
COMMENT ON COLUMN renewal_decisions.final_decision IS 'The final decision: renew, renew_with_changes, replace, retire';
