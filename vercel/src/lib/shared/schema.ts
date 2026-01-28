/**
 * SAS Digital Toolkit - Schema Types
 *
 * TypeScript interfaces based on schema.org/SoftwareApplication
 * This is the canonical schema definition per SCHEMA_V2.md
 *
 * @see https://schema.org/SoftwareApplication
 * @see docs/SCHEMA_V2.md
 */

import type {
  ApplicationCategory,
  AudienceType,
  EducationalLevel,
  Division,
  LicenseType,
  AssessmentStatus,
  RiskRating,
  AppStatus,
  DeviceType,
  SupportOption,
  TrainingOption,
} from "./constants";

// =============================================================================
// SCHEMA.ORG BASE TYPES
// =============================================================================

/**
 * schema.org Person type for contacts
 */
export interface Person {
  "@type": "Person";
  name: string;
  email?: string;
}

/**
 * schema.org Organization type for providers
 */
export interface Organization {
  "@type": "Organization";
  name: string;
  url?: string;
  email?: string;
  telephone?: string;
}

/**
 * schema.org EducationalOrganization for school context
 */
export interface EducationalOrganization {
  "@type": "EducationalOrganization";
  name: "Singapore American School";
  department?: string;
  division: Division[];
}

/**
 * schema.org QuantitativeValue for license quantities
 */
export interface QuantitativeValue {
  "@type": "QuantitativeValue";
  value: number;
  unitText: string; // "seats", "users", "devices"
}

/**
 * schema.org Offer for licensing/pricing
 */
export interface Offer {
  "@type": "Offer";
  price: number;
  priceCurrency: "USD";
  validFrom?: string; // ISO date
  validThrough?: string; // ISO date
  eligibleQuantity?: QuantitativeValue;
  licenseType: LicenseType;
  autoRenewal: boolean;
  noticePeriod?: string; // "30 days", "90 days"
}

/**
 * schema.org AggregateRating for app ratings
 */
export interface AggregateRating {
  "@type": "AggregateRating";
  ratingValue: number;
  bestRating: 5;
  worstRating: 1;
  ratingCount?: number;
  reviewSource?: string; // "EdTech Impact"
}

/**
 * schema.org AlignmentObject for educational alignment
 */
export interface AlignmentObject {
  "@type": "AlignmentObject";
  educationalFramework: string;
  targetName: string;
}

// =============================================================================
// COMPLIANCE TYPES
// =============================================================================

/**
 * Compliance and assessment information
 */
export interface Compliance {
  assessmentStatus: AssessmentStatus;
  assessmentDate?: string;
  reviewedBy?: string;
  privacyPolicy?: string; // URL
  termsOfService?: string; // URL
  gdprCompliant?: boolean;
  coppaCompliant?: boolean;
  ferpaCompliant?: boolean;
  dataProcessingAgreement?: string; // URL to DPA
}

// =============================================================================
// SUPPORT & TRAINING TYPES
// =============================================================================

/**
 * Support information
 */
export interface Support {
  email?: string;
  url?: string;
  phone?: string;
  documentation?: string; // Help docs URL
  tutorials?: string; // Tutorial URL
  options?: SupportOption[];
}

/**
 * Training information
 */
export interface Training {
  available: boolean;
  options?: TrainingOption[];
  url?: string;
}

// =============================================================================
// INTEGRATION TYPES
// =============================================================================

/**
 * Integration capabilities
 */
export interface Integrations {
  lti?: boolean;
  googleClassroom?: boolean;
  microsoftTeams?: boolean;
  canvas?: boolean;
  clever?: boolean;
  classlink?: boolean;
  api?: boolean;
}

// =============================================================================
// CONTACT TYPES
// =============================================================================

/**
 * Internal contact management
 */
export interface Contacts {
  productChampion?: Person;
  productManager?: Person;
  financeContact?: Person;
  providerContact?: Person;
}

// =============================================================================
// MAIN APPLICATION SCHEMA
// =============================================================================

/**
 * Core Application entity based on schema.org SoftwareApplication
 * This is the canonical schema for all app data in the system.
 *
 * @see https://schema.org/SoftwareApplication
 */
export interface Application {
  // === IDENTIFICATION (schema.org Thing) ===
  "@type": "SoftwareApplication";
  identifier: string; // Unique slug: "adobe-creative-cloud"
  name: string; // "Adobe Creative Cloud"
  alternateName?: string; // Short name: "Adobe CC"

  // === DESCRIPTION (schema.org CreativeWork) ===
  description: string;
  abstract?: string; // Short summary (1-2 sentences)
  keywords: string[]; // ["design", "photo editing", "video"]

  // === CLASSIFICATION ===
  applicationCategory: ApplicationCategory;
  applicationSubCategory?: string;

  // === URLS & MEDIA ===
  url: string; // Product website
  image: string; // Logo URL
  screenshot?: string[]; // Screenshot URLs
  video?: string; // Demo video URL

  // === PROVIDER (schema.org Organization) ===
  provider: Organization;

  // === EDUCATIONAL CONTEXT ===
  audience: AudienceType[];
  educationalLevel: EducationalLevel[];
  educationalAlignment?: AlignmentObject[];

  // === ORGANIZATION SCOPE ===
  applicableLocation: EducationalOrganization;
  isEnterprise: boolean;

  // === LICENSING (schema.org Offer) ===
  offers: Offer;

  // === TECHNICAL REQUIREMENTS ===
  operatingSystem?: string[];
  availableOnDevice?: DeviceType[];
  browserRequirements?: string[];
  ssoEnabled: boolean;

  // === COMPLIANCE & ASSESSMENT ===
  compliance: Compliance;

  // === RATINGS & REVIEWS ===
  aggregateRating?: AggregateRating;
  riskRating?: RiskRating;

  // === ACCESSIBILITY ===
  accessibilityFeature?: string[]; // ["WCAG 2.1 AA", "Screen Reader"]
  accessibilityHazard?: string[]; // ["Flashing", "Motion"]

  // === SUPPORT & TRAINING ===
  support: Support;
  training?: Training;

  // === INTEGRATIONS ===
  integrations?: Integrations;

  // === ALTERNATIVES ===
  alternatives?: string[]; // Array of alternative app identifiers

  // === INTERNAL MANAGEMENT ===
  contacts: Contacts;
  notes?: string;

  // === METADATA ===
  dateCreated: string; // ISO date
  dateModified: string; // ISO date
  status: AppStatus;
}

// =============================================================================
// PARTIAL/INPUT TYPES
// =============================================================================

/**
 * Partial application for creating new apps
 * All required fields from Application minus system-generated fields
 */
export interface ApplicationInput {
  name: string;
  description: string;
  applicationCategory: ApplicationCategory;
  url: string;
  image: string;
  provider: Omit<Organization, "@type">;
  audience: AudienceType[];
  educationalLevel: EducationalLevel[];
  divisions: Division[];
  isEnterprise?: boolean;
  ssoEnabled?: boolean;

  // Optional fields
  alternateName?: string;
  abstract?: string;
  keywords?: string[];
  applicationSubCategory?: string;
  screenshot?: string[];
  video?: string;
  operatingSystem?: string[];
  availableOnDevice?: DeviceType[];
  browserRequirements?: string[];
  accessibilityFeature?: string[];
  accessibilityHazard?: string[];
  notes?: string;

  // Licensing (optional - can be added later)
  price?: number;
  licenseType?: LicenseType;
  licenseQuantity?: number;
  contractStart?: string;
  contractEnd?: string;
  autoRenewal?: boolean;
  noticePeriod?: string;

  // Compliance (optional - can be filled during assessment)
  assessmentStatus?: AssessmentStatus;
  privacyPolicy?: string;
  termsOfService?: string;

  // Contacts (optional)
  productChampion?: string;
  productManager?: string;
  financeContact?: string;
  providerContact?: string;
}

// =============================================================================
// LEGACY COMPATIBILITY TYPES
// =============================================================================

/**
 * Legacy app format from Apps Script (for backwards compatibility during migration)
 * Maps to the current Google Sheets structure
 */
export interface LegacyApp {
  // ID field for apps_script_id
  id?: string;

  // Core fields
  product: string;
  productId?: string;
  product_id?: string;
  description?: string;
  category?: string;
  subject?: string;
  department?: string;
  division?: string;
  audience?: string | string[];
  website?: string;
  tutorialLink?: string;
  tutorial_link?: string;
  logoUrl?: string;
  logo_url?: string;
  ssoEnabled?: boolean | string;
  sso_enabled?: boolean | string;
  mobileApp?: boolean | string;
  mobile_app?: boolean | string;
  gradeLevels?: string;
  grade_levels?: string;
  isNew?: boolean | string;
  is_new?: boolean | string;
  vendor?: string;
  licenseType?: string;
  license_type?: string;
  renewalDate?: string;
  renewal_date?: string;
  annualCost?: number | string;
  annual_cost?: number | string;
  spend?: number | string;
  licenses?: number | string;
  utilization?: number | string;
  status?: string;
  enterprise?: boolean | string;
  budget?: string;
  supportEmail?: string;
  support_email?: string;
  dateAdded?: string;
  date_added?: string;
  isWholeSchool?: boolean;

  // EdTech Impact fields
  assessmentStatus?: string;
  assessment_status?: string;
  globalRating?: number | string;
  global_rating?: number | string;
  recommendedReason?: string;
  recommended_reason?: string;
  privacyPolicyUrl?: string;
  privacy_policy_url?: string;
  termsUrl?: string;
  terms_url?: string;
  gdprUrl?: string;
  gdpr_url?: string;
  riskRating?: string;
  risk_rating?: string;
  accessibility?: string;
  languages?: string[] | string;
  supportOptions?: string[] | string;
  support_options?: string[] | string;
  trainingOptions?: string[] | string;
  training_options?: string[] | string;
  purchaseModels?: string[] | string;
  purchase_models?: string[] | string;
  priceFrom?: string;
  price_from?: string;
  alternatives?: string[] | string;
  contractStartDate?: string;
  contract_start_date?: string;
  contractEndDate?: string;
  contract_end_date?: string;
  autoRenew?: boolean | string;
  auto_renew?: boolean | string;
  noticePeriod?: string;
  notice_period?: string;
  productChampion?: string;
  product_champion?: string;
  productManager?: string;
  product_manager?: string;
  providerContact?: string;
  provider_contact?: string;
  financeContact?: string;
  finance_contact?: string;
  notes?: string;
  edtechImpactId?: string;
  edtech_impact_id?: string;
  lastEdtechSync?: string;
  last_edtech_sync?: string;
}

/**
 * Supabase apps table row type (current database schema)
 */
export interface SupabaseApp {
  id: string;
  product: string;
  product_id: string | null;
  description: string | null;
  category: string | null;
  subject: string | null;
  department: string | null;
  division: string | null;
  audience: string[] | null;
  website: string | null;
  tutorial_link: string | null;
  logo_url: string | null;
  sso_enabled: boolean;
  mobile_app: boolean;
  grade_levels: string | null;
  vendor: string | null;
  license_type: string | null;
  renewal_date: string | null;
  annual_cost: number | null;
  licenses: number | null;
  utilization: number | null;
  status: string | null;
  synced_at: string | null;
  apps_script_id: string | null;
  enterprise: boolean;
  budget: string | null;
  support_email: string | null;
  date_added: string | null;
  is_whole_school: boolean;
  is_new: boolean;

  // EdTech Impact fields
  assessment_status: string | null;
  global_rating: number | null;
  recommended_reason: string | null;
  privacy_policy_url: string | null;
  terms_url: string | null;
  gdpr_url: string | null;
  risk_rating: string | null;
  accessibility: string | null;
  languages: string[] | null;
  support_options: string[] | null;
  training_options: string[] | null;
  purchase_models: string[] | null;
  price_from: string | null;
  alternatives: string[] | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  auto_renew: boolean;
  notice_period: string | null;
  product_champion: string | null;
  product_manager: string | null;
  provider_contact: string | null;
  finance_contact: string | null;
  notes: string | null;
  edtech_impact_id: string | null;
  last_edtech_sync: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Type for inserting new apps into Supabase
 */
export type SupabaseAppInsert = Omit<SupabaseApp, "id" | "created_at" | "updated_at">;

/**
 * Type for updating apps in Supabase
 */
export type SupabaseAppUpdate = Partial<SupabaseAppInsert>;
