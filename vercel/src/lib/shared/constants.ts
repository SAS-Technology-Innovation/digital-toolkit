/**
 * SAS Digital Toolkit - Shared Constants
 *
 * Centralized controlled vocabularies, enums, and mappings based on SCHEMA_V2.md
 * This is the single source of truth for all constant values across the codebase.
 */

// =============================================================================
// APPLICATION CATEGORIES (based on EdTech taxonomy)
// =============================================================================

export const APPLICATION_CATEGORIES = [
  "Learning Management",
  "Assessment",
  "Content Creation",
  "Collaboration",
  "Productivity",
  "Reference",
  "Simulation",
  "Adaptive Learning",
  "Coding",
  "Design",
  "Communication",
  "Administration",
  "Accessibility",
  "Other",
] as const;

export type ApplicationCategory = (typeof APPLICATION_CATEGORIES)[number];

// =============================================================================
// AUDIENCE TYPES
// =============================================================================

export const AUDIENCE_TYPES = [
  "Students",
  "Teachers",
  "Staff",
  "Parents",
  "Administrators",
] as const;

export type AudienceType = (typeof AUDIENCE_TYPES)[number];

// =============================================================================
// EDUCATIONAL LEVELS (Grade Levels)
// =============================================================================

export const EDUCATIONAL_LEVELS = [
  "Pre-K",
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
] as const;

export type EducationalLevel = (typeof EDUCATIONAL_LEVELS)[number];

// Grade level to age mapping (approximate)
export const GRADE_TO_AGE: Record<EducationalLevel, number> = {
  "Pre-K": 4,
  Kindergarten: 5,
  "Grade 1": 6,
  "Grade 2": 7,
  "Grade 3": 8,
  "Grade 4": 9,
  "Grade 5": 10,
  "Grade 6": 11,
  "Grade 7": 12,
  "Grade 8": 13,
  "Grade 9": 14,
  "Grade 10": 15,
  "Grade 11": 16,
  "Grade 12": 17,
};

// =============================================================================
// SCHOOL DIVISIONS
// =============================================================================

export const DIVISIONS = [
  "Elementary",
  "Middle",
  "High",
  "Central",
] as const;

export type Division = (typeof DIVISIONS)[number];

// Division to grade mapping
export const DIVISION_GRADES: Record<Division, EducationalLevel[]> = {
  Elementary: ["Pre-K", "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"],
  Middle: ["Grade 6", "Grade 7", "Grade 8"],
  High: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  Central: [], // Administrative - no specific grades
};

// Patterns for detecting divisions in text
export const DIVISION_PATTERNS = {
  elementary: [
    "elementary",
    "es",
    "primary",
    "sas elementary",
    "sas es",
    "lower school",
    "grades k-5",
    "grades pk-5",
  ],
  middle: [
    "middle",
    "ms",
    "sas middle",
    "sas ms",
    "middle school",
    "grades 6-8",
  ],
  high: [
    "high",
    "hs",
    "sas high",
    "sas hs",
    "upper school",
    "high school",
    "grades 9-12",
  ],
  wholeSchool: [
    "whole school",
    "all divisions",
    "school-wide",
    "schoolwide",
    "all schools",
    "k-12",
    "pk-12",
  ],
};

// =============================================================================
// LICENSE TYPES
// =============================================================================

export const LICENSE_TYPES = [
  "Site License",
  "Enterprise License",
  "Per User",
  "Per Device",
  "Concurrent",
  "Freemium",
  "Open Source",
  "Trial",
] as const;

export type LicenseType = (typeof LICENSE_TYPES)[number];

// Patterns for detecting whole-school licenses
export const WHOLE_SCHOOL_LICENSE_PATTERNS = [
  "site",
  "school",
  "enterprise",
  "unlimited",
  "institution",
  "campus",
];

// =============================================================================
// ASSESSMENT STATUS
// =============================================================================

export const ASSESSMENT_STATUSES = [
  "Approved",
  "Conditional",
  "Under Review",
  "Not Recommended",
  "Deprecated",
  "Pending",
] as const;

export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number];

// =============================================================================
// RISK RATING
// =============================================================================

export const RISK_RATINGS = [
  "Low",
  "Medium",
  "High",
  "Critical",
] as const;

export type RiskRating = (typeof RISK_RATINGS)[number];

// =============================================================================
// APP STATUS
// =============================================================================

export const APP_STATUSES = [
  "active",
  "inactive",
  "deprecated",
  "under_review",
] as const;

export type AppStatus = (typeof APP_STATUSES)[number];

// =============================================================================
// DEVICE TYPES
// =============================================================================

export const DEVICE_TYPES = [
  "Desktop",
  "Mobile",
  "Tablet",
  "Chromebook",
] as const;

export type DeviceType = (typeof DEVICE_TYPES)[number];

// =============================================================================
// SUPPORT OPTIONS
// =============================================================================

export const SUPPORT_OPTIONS = [
  "Email",
  "Phone",
  "Live Chat",
  "Knowledge Base",
  "Community Forum",
  "Dedicated Account Manager",
] as const;

export type SupportOption = (typeof SUPPORT_OPTIONS)[number];

// =============================================================================
// TRAINING OPTIONS
// =============================================================================

export const TRAINING_OPTIONS = [
  "Self-paced Online",
  "Live Webinar",
  "On-site Training",
  "Certification Program",
  "Video Tutorials",
  "Documentation",
] as const;

export type TrainingOption = (typeof TRAINING_OPTIONS)[number];

// =============================================================================
// FIELD MAPPINGS: Database ↔ Apps Script ↔ EdTech Impact
// =============================================================================

/**
 * Maps Supabase field names to Google Sheets column names
 * Used for bidirectional sync between Supabase and Apps Script
 */
export const SUPABASE_TO_SHEETS_MAPPING: Record<string, string> = {
  // Core fields
  product: "product_name",
  product_id: "product_id",
  description: "description",
  category: "category",
  subject: "subjects",
  department: "department",
  division: "division",
  website: "website",
  tutorial_link: "tutorial_link",
  logo_url: "logo_url",
  sso_enabled: "sso_enabled",
  mobile_app: "mobile_app",
  grade_levels: "grade_levels",
  vendor: "vendor",
  license_type: "license_type",
  renewal_date: "renewal_date",
  annual_cost: "value",
  licenses: "licence_count",
  enterprise: "enterprise",
  budget: "budget",
  support_email: "support_email",
  date_added: "date_added",
  audience: "audience",
  // EdTech Impact fields
  assessment_status: "assessment_status",
  global_rating: "global_rating",
  recommended_reason: "recommended_reason",
  privacy_policy_url: "privacy_policy_url",
  terms_url: "terms_url",
  gdpr_url: "gdpr_url",
  risk_rating: "risk_rating",
  accessibility: "accessibility",
  languages: "languages",
  support_options: "support_options",
  training_options: "training_options",
  purchase_models: "purchase_models",
  price_from: "price_from",
  alternatives: "alternatives",
  contract_start_date: "contract_start_date",
  contract_end_date: "contract_end_date",
  auto_renew: "auto_renew",
  notice_period: "notice_period",
  product_champion: "product_champion",
  product_manager: "product_manager",
  provider_contact: "provider_contact",
  finance_contact: "finance_contact",
  notes: "notes",
  edtech_impact_id: "edtech_impact_id",
  last_edtech_sync: "last_edtech_sync",
};

/**
 * Maps EdTech Impact Excel columns to Supabase field names
 * Used for importing data from EdTech Impact CSV/Excel files
 */
export const EDTECH_TO_SUPABASE_MAPPING: Record<string, string> = {
  // Core Product Info
  Product: "product",
  Category: "category",
  Website: "website",
  Company: "vendor",
  description: "description",
  Age: "_age", // Special processing
  Department: "department",
  "Budget Owner": "budget",
  "Used By": "_audience", // Special processing

  // Assessment and Ratings
  Assessment: "assessment_status",
  "Global Rating": "global_rating",
  Recommended: "recommended_reason",
  "Risk Rating": "risk_rating",
  Accessibility: "accessibility",

  // Compliance and Privacy
  "Data Privacy": "privacy_policy_url",
  Terms: "terms_url",
  GDPR: "gdpr_url",

  // Support and Training
  Support: "_support", // Special processing
  Training: "_training", // Special processing

  // Commercial
  "Purchase Models": "_purchase_models", // Special processing
  "Price from": "price_from",
  value: "annual_cost",
  Licences: "licenses",

  // Languages
  Languages: "_languages", // Special processing

  // Contract
  start_date: "contract_start_date",
  end_date: "contract_end_date",
  auto_renew: "auto_renew",
  notice_period: "notice_period",

  // Internal Management
  "Product Champion": "product_champion",
  "Product Manager": "product_manager",
  "Provider Contact": "provider_contact",
  "Finance Contact": "finance_contact",
  notes: "notes",

  // Alternatives
  Alternatives: "_alternatives", // Special processing
};
