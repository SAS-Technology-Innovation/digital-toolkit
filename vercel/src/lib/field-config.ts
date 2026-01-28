/**
 * Field Configuration Registry
 *
 * Centralized definition of every app field's display and edit behavior.
 * Used by EditableCell and shared column definitions to provide
 * Notion-style inline editing across all data tables.
 */

export type FieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "boolean"
  | "url"
  | "textarea"
  | "multiSelect"
  | "readonly";

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  width?: number;
  format?: (value: unknown) => string;
  editable?: boolean; // defaults to true if not readonly
}

// --- Formatters ---

function formatCurrency(value: unknown): string {
  if (value == null || value === "") return "";
  const num = Number(value);
  if (isNaN(num)) return String(value);
  if (num === 0) return "Free";
  return `$${num.toLocaleString()}`;
}

function formatDate(value: unknown): string {
  if (!value) return "";
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString();
}

function formatBoolean(value: unknown): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "";
}

function formatRating(value: unknown): string {
  if (value == null || value === "") return "";
  return `${value}/5`;
}

function formatPercent(value: unknown): string {
  if (value == null || value === "") return "";
  return `${value}%`;
}

function formatNumber(value: unknown): string {
  if (value == null || value === "") return "";
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toLocaleString();
}

function formatArray(value: unknown): string {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

// --- Field Configs ---

export const FIELD_CONFIGS: Record<string, FieldConfig> = {
  // Core identifiers
  id: { key: "id", label: "ID", type: "readonly", width: 80 },
  product: { key: "product", label: "Product", type: "text", width: 200 },
  product_id: { key: "product_id", label: "Product ID", type: "readonly", width: 150 },

  // Content
  description: { key: "description", label: "Description", type: "textarea", width: 250 },
  category: {
    key: "category",
    label: "Category",
    type: "select",
    width: 160,
    options: [
      "Learning Management",
      "Content Creation",
      "Assessment",
      "Communication",
      "Collaboration",
      "Productivity",
      "STEM",
      "Arts & Media",
      "Language Learning",
      "Special Education",
      "Library & Research",
      "Student Information",
      "Safety & Security",
      "IT Infrastructure",
      "Finance & Operations",
      "Other",
    ],
  },
  subject: { key: "subject", label: "Subject", type: "text", width: 140 },
  department: { key: "department", label: "Department", type: "text", width: 160 },
  division: {
    key: "division",
    label: "Division",
    type: "select",
    width: 180,
    options: [
      "SAS Elementary School",
      "SAS Middle School",
      "SAS High School",
      "Whole School",
      "SAS Elementary School, SAS Middle School",
      "SAS Middle School, SAS High School",
      "SAS Elementary School, SAS High School",
      "SAS Elementary School, SAS Middle School, SAS High School",
    ],
  },
  audience: {
    key: "audience",
    label: "Audience",
    type: "multiSelect",
    width: 180,
    options: ["Teachers", "Students", "Parents", "Staff"],
    format: formatArray,
  },
  grade_levels: { key: "grade_levels", label: "Grade Levels", type: "text", width: 180 },

  // URLs
  website: { key: "website", label: "Website", type: "url", width: 200 },
  tutorial_link: { key: "tutorial_link", label: "Tutorial Link", type: "url", width: 200 },
  logo_url: { key: "logo_url", label: "Logo URL", type: "url", width: 200 },

  // Technical
  sso_enabled: { key: "sso_enabled", label: "SSO Enabled", type: "boolean", width: 100, format: formatBoolean },
  mobile_app: { key: "mobile_app", label: "Mobile App", type: "boolean", width: 100, format: formatBoolean },
  is_new: { key: "is_new", label: "New", type: "boolean", width: 80, format: formatBoolean },
  enterprise: { key: "enterprise", label: "Enterprise", type: "boolean", width: 100, format: formatBoolean },
  is_whole_school: { key: "is_whole_school", label: "Whole School", type: "boolean", width: 110, format: formatBoolean },

  // Vendor & cost
  vendor: { key: "vendor", label: "Vendor", type: "text", width: 160 },
  license_type: {
    key: "license_type",
    label: "License Type",
    type: "select",
    width: 140,
    options: [
      "Site Licence",
      "Individual",
      "Enterprise",
      "Unlimited",
      "School Licence",
      "Department",
      "Free",
      "Freemium",
      "Per User",
      "Volume",
    ],
  },
  annual_cost: { key: "annual_cost", label: "Annual Cost", type: "number", width: 120, format: formatCurrency },
  licenses: { key: "licenses", label: "Licenses", type: "number", width: 100, format: formatNumber },
  utilization: { key: "utilization", label: "Utilization", type: "number", width: 100, format: formatPercent },
  budget: {
    key: "budget",
    label: "Budget",
    type: "select",
    width: 160,
    options: [
      "Office Of Learning",
      "IT Operations",
      "Elementary School",
      "Middle School",
      "High School",
      "Counseling",
      "Library",
      "Athletics",
      "Administration",
      "Other",
    ],
  },
  renewal_date: { key: "renewal_date", label: "Renewal Date", type: "date", width: 130, format: formatDate },
  date_added: { key: "date_added", label: "Date Added", type: "date", width: 130, format: formatDate },
  support_email: { key: "support_email", label: "Support Email", type: "text", width: 180 },

  // Status
  status: {
    key: "status",
    label: "Status",
    type: "select",
    width: 120,
    options: ["active", "retired", "under_review", "pending"],
  },

  // EdTech Impact - Compliance
  privacy_policy_url: { key: "privacy_policy_url", label: "Privacy Policy URL", type: "url", width: 200 },
  terms_url: { key: "terms_url", label: "Terms URL", type: "url", width: 200 },
  gdpr_url: { key: "gdpr_url", label: "GDPR URL", type: "url", width: 200 },
  risk_rating: {
    key: "risk_rating",
    label: "Risk Rating",
    type: "select",
    width: 120,
    options: ["Low", "Medium", "High"],
  },

  // EdTech Impact - Assessment
  global_rating: { key: "global_rating", label: "Global Rating", type: "number", width: 120, format: formatRating },
  assessment_status: {
    key: "assessment_status",
    label: "Assessment Status",
    type: "select",
    width: 160,
    options: ["RETAIN", "RETIRE", "UNDER_REVIEW", "RECOMMENDED"],
  },
  recommended_reason: { key: "recommended_reason", label: "Recommended Reason", type: "textarea", width: 200 },
  accessibility: { key: "accessibility", label: "Accessibility", type: "text", width: 160 },

  // EdTech Impact - Commercial
  price_from: { key: "price_from", label: "Price From", type: "text", width: 120 },
  purchase_models: { key: "purchase_models", label: "Purchase Models", type: "readonly", width: 160, format: formatArray },
  alternatives: { key: "alternatives", label: "Alternatives", type: "readonly", width: 160, format: formatArray },
  languages: { key: "languages", label: "Languages", type: "readonly", width: 160, format: formatArray },
  support_options: { key: "support_options", label: "Support Options", type: "readonly", width: 160, format: formatArray },
  training_options: { key: "training_options", label: "Training Options", type: "readonly", width: 160, format: formatArray },

  // Contract
  contract_start_date: { key: "contract_start_date", label: "Contract Start", type: "date", width: 130, format: formatDate },
  contract_end_date: { key: "contract_end_date", label: "Contract End", type: "date", width: 130, format: formatDate },
  auto_renew: { key: "auto_renew", label: "Auto Renew", type: "boolean", width: 100, format: formatBoolean },
  notice_period: { key: "notice_period", label: "Notice Period", type: "text", width: 120 },

  // Internal contacts
  product_champion: { key: "product_champion", label: "Product Champion", type: "text", width: 160 },
  product_manager: { key: "product_manager", label: "Product Manager", type: "text", width: 160 },
  provider_contact: { key: "provider_contact", label: "Provider Contact", type: "text", width: 160 },
  finance_contact: { key: "finance_contact", label: "Finance Contact", type: "text", width: 160 },
  notes: { key: "notes", label: "Notes", type: "textarea", width: 200 },
  edtech_impact_id: { key: "edtech_impact_id", label: "EdTech Impact ID", type: "text", width: 140 },

  // System timestamps (readonly)
  created_at: { key: "created_at", label: "Created", type: "readonly", width: 140, format: formatDate },
  updated_at: { key: "updated_at", label: "Updated", type: "readonly", width: 140, format: formatDate },
  synced_at: { key: "synced_at", label: "Synced", type: "readonly", width: 140, format: formatDate },
  last_edtech_sync: { key: "last_edtech_sync", label: "Last EdTech Sync", type: "readonly", width: 140, format: formatDate },
  apps_script_id: { key: "apps_script_id", label: "Apps Script ID", type: "readonly", width: 140 },
};

/**
 * Get the field configuration for a specific field key.
 * Returns a default text config if the field is unknown.
 */
export function getFieldConfig(key: string): FieldConfig {
  return FIELD_CONFIGS[key] ?? { key, label: key, type: "text", width: 140 };
}

/**
 * Returns the default visible column keys for the admin data table.
 */
export function getDefaultColumns(): string[] {
  return [
    "product",
    "category",
    "division",
    "status",
    "vendor",
    "annual_cost",
    "licenses",
    "license_type",
    "budget",
    "renewal_date",
    "contract_start_date",
    "contract_end_date",
    "assessment_status",
  ];
}

/**
 * Returns all field keys in display order.
 */
export function getAllFieldKeys(): string[] {
  return Object.keys(FIELD_CONFIGS);
}

/**
 * Check if a field is editable based on its config.
 */
export function isFieldEditable(key: string): boolean {
  const config = getFieldConfig(key);
  if (config.editable === false) return false;
  return config.type !== "readonly";
}
