/**
 * SAS Digital Toolkit - Shared Transforms
 *
 * Centralized data transformation functions for converting between
 * different data formats: Apps Script, Supabase, EdTech Impact, etc.
 *
 * This is the single source of truth for all data transformations.
 *
 * Replaces:
 * - Vercel sync: transformAppToSupabase(), transformAppToAppsScript()
 * - Vercel sync: appToFieldUpdates(), appToSheetRow()
 * - EdTech import: transformRow()
 */

import {
  parseJsonArray,
  arrayToJsonString,
  parseBoolean,
  parseNumber,
  parseDate,
  parseDivisions,
  isWholeSchool,
  ageToGradeLevels,
  parseAudience,
  cleanHtml,
  generateIdentifier,
} from "./parsers";

import { SUPABASE_TO_SHEETS_MAPPING, EDTECH_TO_SUPABASE_MAPPING } from "./constants";
import type { LegacyApp, SupabaseApp, SupabaseAppInsert } from "./schema";

// =============================================================================
// APPS SCRIPT → SUPABASE TRANSFORMS
// =============================================================================

/**
 * Transform Apps Script data to Supabase format
 *
 * @param app - Legacy app object from Apps Script
 * @returns Supabase-formatted app object ready for insert
 */
export function transformAppsScriptToSupabase(app: LegacyApp): SupabaseAppInsert {
  // Parse audience
  let audience: string[] | null = null;
  if (app.audience) {
    if (Array.isArray(app.audience)) {
      audience = app.audience;
    } else if (typeof app.audience === "string") {
      audience = app.audience
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
    }
  }

  // Annual cost: Apps Script returns this as 'spend', also support annualCost and annual_cost
  const annualCostValue = app.spend ?? app.annualCost ?? app.annual_cost;

  return {
    product: app.product,
    product_id: app.productId || app.product_id || null,
    description: app.description || null,
    category: app.category || null,
    subject: app.subject || null,
    department: app.department || null,
    division: app.division || null,
    audience,
    website: app.website === "#" ? null : (app.website || null),
    tutorial_link: app.tutorialLink || app.tutorial_link || null,
    logo_url: app.logoUrl || app.logo_url || null,
    sso_enabled: parseBoolean(app.ssoEnabled ?? app.sso_enabled),
    mobile_app: parseBoolean(app.mobileApp ?? app.mobile_app),
    grade_levels: app.gradeLevels || app.grade_levels || null,
    is_new: parseBoolean(app.isNew ?? app.is_new),
    vendor: app.vendor || null,
    license_type: app.licenseType || app.license_type || null,
    renewal_date: app.renewalDate || app.renewal_date || null,
    annual_cost: parseNumber(annualCostValue),
    licenses: parseNumber(app.licenses) as number | null,
    utilization: parseNumber(app.utilization) as number | null,
    status: app.status || null,
    synced_at: new Date().toISOString(),
    apps_script_id: app.id || null,
    enterprise: parseBoolean(app.enterprise),
    budget: app.budget || null,
    support_email: app.supportEmail || app.support_email || null,
    date_added: app.dateAdded || app.date_added || null,
    is_whole_school: parseBoolean(app.isWholeSchool),

    // EdTech Impact fields
    assessment_status: app.assessmentStatus || app.assessment_status || null,
    global_rating: parseNumber(app.globalRating ?? app.global_rating),
    recommended_reason: app.recommendedReason || app.recommended_reason || null,
    privacy_policy_url: app.privacyPolicyUrl || app.privacy_policy_url || null,
    terms_url: app.termsUrl || app.terms_url || null,
    gdpr_url: app.gdprUrl || app.gdpr_url || null,
    risk_rating: app.riskRating || app.risk_rating || null,
    accessibility: app.accessibility || null,
    languages: parseJsonArray(app.languages),
    support_options: parseJsonArray(app.supportOptions ?? app.support_options),
    training_options: parseJsonArray(app.trainingOptions ?? app.training_options),
    purchase_models: parseJsonArray(app.purchaseModels ?? app.purchase_models),
    price_from: app.priceFrom || app.price_from || null,
    alternatives: parseJsonArray(app.alternatives),
    contract_start_date: app.contractStartDate || app.contract_start_date || null,
    contract_end_date: app.contractEndDate || app.contract_end_date || null,
    auto_renew: parseBoolean(app.autoRenew ?? app.auto_renew),
    notice_period: app.noticePeriod || app.notice_period || null,
    product_champion: app.productChampion || app.product_champion || null,
    product_manager: app.productManager || app.product_manager || null,
    provider_contact: app.providerContact || app.provider_contact || null,
    finance_contact: app.financeContact || app.finance_contact || null,
    notes: app.notes || null,
    edtech_impact_id: app.edtechImpactId || app.edtech_impact_id || null,
    last_edtech_sync: app.lastEdtechSync || app.last_edtech_sync || null,
  };
}

// =============================================================================
// SUPABASE → APPS SCRIPT TRANSFORMS
// =============================================================================

/**
 * Transform Supabase data back to Apps Script format for writeback
 *
 * @param app - Supabase app object
 * @returns Legacy app format for Apps Script
 */
export function transformSupabaseToAppsScript(app: SupabaseApp): LegacyApp {
  return {
    id: app.apps_script_id || undefined,
    product: app.product,
    productId: app.product_id || undefined,
    description: app.description || undefined,
    category: app.category || undefined,
    subject: app.subject || undefined,
    department: app.department || undefined,
    division: app.division || undefined,
    audience: app.audience?.join(", ") || undefined,
    website: app.website || undefined,
    tutorialLink: app.tutorial_link || undefined,
    logoUrl: app.logo_url || undefined,
    ssoEnabled: app.sso_enabled,
    mobileApp: app.mobile_app,
    gradeLevels: app.grade_levels || undefined,
    isNew: app.is_new,
    vendor: app.vendor || undefined,
    licenseType: app.license_type || undefined,
    renewalDate: app.renewal_date || undefined,
    annualCost: app.annual_cost || undefined,
    licenses: app.licenses || undefined,
    utilization: app.utilization || undefined,
    status: app.status || undefined,
    enterprise: app.enterprise,
    budget: app.budget || undefined,
    supportEmail: app.support_email || undefined,
    dateAdded: app.date_added || undefined,
    isWholeSchool: app.is_whole_school,

    // EdTech Impact fields
    assessmentStatus: app.assessment_status || undefined,
    globalRating: app.global_rating || undefined,
    recommendedReason: app.recommended_reason || undefined,
    privacyPolicyUrl: app.privacy_policy_url || undefined,
    termsUrl: app.terms_url || undefined,
    gdprUrl: app.gdpr_url || undefined,
    riskRating: app.risk_rating || undefined,
    accessibility: app.accessibility || undefined,
    languages: arrayToJsonString(app.languages) || undefined,
    supportOptions: arrayToJsonString(app.support_options) || undefined,
    trainingOptions: arrayToJsonString(app.training_options) || undefined,
    purchaseModels: arrayToJsonString(app.purchase_models) || undefined,
    priceFrom: app.price_from || undefined,
    alternatives: arrayToJsonString(app.alternatives) || undefined,
    contractStartDate: app.contract_start_date || undefined,
    contractEndDate: app.contract_end_date || undefined,
    autoRenew: app.auto_renew,
    noticePeriod: app.notice_period || undefined,
    productChampion: app.product_champion || undefined,
    productManager: app.product_manager || undefined,
    providerContact: app.provider_contact || undefined,
    financeContact: app.finance_contact || undefined,
    notes: app.notes || undefined,
    edtechImpactId: app.edtech_impact_id || undefined,
    lastEdtechSync: app.last_edtech_sync || undefined,
  };
}

/**
 * Convert Supabase app to Apps Script field updates for bulkUpdate API
 *
 * @param app - Supabase app object
 * @returns Array of field updates for Apps Script bulkUpdate
 */
export function toAppsScriptFieldUpdates(
  app: SupabaseApp
): Array<{ productId: string; field: string; value: unknown }> {
  const productId = app.product_id;
  if (!productId) return [];

  const updates: Array<{ productId: string; field: string; value: unknown }> = [];

  // Iterate through field mappings
  const appRecord = app as unknown as Record<string, unknown>;
  for (const [supabaseField, sheetColumn] of Object.entries(SUPABASE_TO_SHEETS_MAPPING)) {
    const value = appRecord[supabaseField];

    // Only include fields that have a value
    if (value !== null && value !== undefined && value !== "") {
      // Handle array fields
      if (Array.isArray(value)) {
        // Audience gets comma-separated, others get JSON
        const formattedValue =
          supabaseField === "audience"
            ? value.join(", ")
            : arrayToJsonString(value);
        if (formattedValue) {
          updates.push({ productId, field: sheetColumn, value: formattedValue });
        }
      } else {
        updates.push({ productId, field: sheetColumn, value });
      }
    }
  }

  return updates;
}

/**
 * Convert Supabase app to Google Sheets row format for adding new apps
 *
 * @param app - Supabase app object
 * @returns Object with sheet column names as keys
 */
export function toGoogleSheetsRow(app: SupabaseApp): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  const appRecord = app as unknown as Record<string, unknown>;

  // Map each Supabase field to its corresponding sheet column
  for (const [supabaseField, sheetColumn] of Object.entries(SUPABASE_TO_SHEETS_MAPPING)) {
    const value = appRecord[supabaseField];

    if (value !== null && value !== undefined) {
      // Handle array fields
      if (Array.isArray(value)) {
        row[sheetColumn] =
          supabaseField === "audience" ? value.join(", ") : arrayToJsonString(value);
      } else {
        row[sheetColumn] = value;
      }
    }
  }

  return row;
}

// =============================================================================
// EDTECH IMPACT → SUPABASE TRANSFORMS
// =============================================================================

/**
 * Transform EdTech Impact Excel row to Supabase format
 *
 * @param row - Raw Excel row object with EdTech Impact column names
 * @returns Supabase-formatted app object ready for insert/update
 */
export function transformEdTechToSupabase(
  row: Record<string, unknown>
): Partial<SupabaseAppInsert> {
  const transformed: Record<string, unknown> = {};

  // Map standard fields
  for (const [excelCol, dbField] of Object.entries(EDTECH_TO_SUPABASE_MAPPING)) {
    if (!dbField || dbField.startsWith("_")) continue;

    const value = row[excelCol];
    if (value === null || value === undefined) continue;

    switch (dbField) {
      case "global_rating":
        transformed[dbField] = parseNumber(value);
        break;
      case "annual_cost":
      case "licenses":
        transformed[dbField] = parseNumber(value);
        break;
      case "auto_renew":
        transformed[dbField] = parseBoolean(value);
        break;
      case "contract_start_date":
      case "contract_end_date":
        transformed[dbField] = parseDate(value);
        break;
      case "recommended_reason":
        transformed[dbField] = cleanHtml(value as string);
        break;
      case "assessment_status":
        transformed[dbField] = value
          ? String(value).toUpperCase().replace(" ", "_")
          : null;
        break;
      default:
        transformed[dbField] = value || null;
    }
  }

  // Process special fields that need custom transformations
  transformed.grade_levels = ageToGradeLevels(row["Age"]);
  transformed.audience = parseAudience(row["Used By"]);
  transformed.languages = parseJsonArray(row["Languages"]);
  transformed.support_options = parseJsonArray(row["Support"]);
  transformed.training_options = parseJsonArray(row["Training"]);
  transformed.purchase_models = parseJsonArray(row["Purchase Models"]);
  transformed.alternatives = parseJsonArray(row["Alternatives"]);

  // Generate product_id for matching
  if (transformed.product) {
    transformed.product_id = generateIdentifier(transformed.product as string);
  }

  // Add sync timestamp
  transformed.last_edtech_sync = new Date().toISOString();

  return transformed as Partial<SupabaseAppInsert>;
}

// =============================================================================
// DASHBOARD TRANSFORMS
// =============================================================================

/**
 * Dashboard app format (what the frontend receives)
 */
export interface DashboardApp {
  product: string;
  productId: string | null;
  division: string;
  department: string;
  subject: string;
  budget: string;
  licenseType: string;
  licenses: number;
  category: string;
  website: string;
  spend: string | number;
  enterprise: boolean;
  description: string;
  audience: string;
  gradeLevels: string;
  supportEmail: string;
  tutorialLink: string;
  mobileApp: string;
  ssoEnabled: boolean;
  logoUrl: string;
  dateAdded: string;
  renewalDate: string;
  vendor: string;
  isWholeSchool: boolean;

  // EdTech Impact fields
  assessmentStatus: string | null;
  globalRating: number | null;
  recommendedReason: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  gdprUrl: string;
  riskRating: string;
  accessibility: string;
  languages: string[];
  supportOptions: string[];
  trainingOptions: string[];
  purchaseModels: string[];
  priceFrom: string;
  alternatives: string[];
  contractStartDate: string;
  contractEndDate: string;
  autoRenew: boolean;
  noticePeriod: string;
  productChampion: string;
  productManager: string;
  providerContact: string;
  financeContact: string;
  notes: string;
  edtechImpactId: string | null;
  lastEdtechSync: string | null;
}

/**
 * Transform Supabase app to dashboard format
 *
 * @param app - Supabase app object
 * @returns Dashboard-formatted app object
 */
export function transformSupabaseToDashboard(app: SupabaseApp): DashboardApp {
  // Handle pricing: convert 0 to "Free"
  let spendValue: string | number = app.annual_cost ?? "N/A";
  if (typeof spendValue === "number" && spendValue === 0) {
    spendValue = "Free";
  }

  // Determine if whole school
  const divisionsPresent = parseDivisions(app.division);
  const appIsWholeSchool = isWholeSchool(
    app.license_type,
    app.department,
    app.division,
    divisionsPresent
  );

  return {
    product: app.product || "N/A",
    productId: app.product_id,
    division: app.division || "N/A",
    department: app.department || "N/A",
    subject: app.subject || "N/A",
    budget: app.budget || "N/A",
    licenseType: app.license_type || "N/A",
    licenses: app.licenses || 0,
    category: app.category || "N/A",
    website: app.website || "#",
    spend: spendValue,
    enterprise: app.enterprise,
    description: app.description || "",
    audience: app.audience?.join(", ") || "",
    gradeLevels: app.grade_levels || "",
    supportEmail: app.support_email || "",
    tutorialLink: app.tutorial_link || "",
    mobileApp: app.mobile_app ? "Yes" : "No",
    ssoEnabled: app.sso_enabled,
    logoUrl: app.logo_url || "",
    dateAdded: app.date_added || "",
    renewalDate: app.renewal_date || "",
    vendor: app.vendor || "",
    isWholeSchool: appIsWholeSchool,

    // EdTech Impact fields
    assessmentStatus: app.assessment_status,
    globalRating: app.global_rating,
    recommendedReason: app.recommended_reason || "",
    privacyPolicyUrl: app.privacy_policy_url || "",
    termsUrl: app.terms_url || "",
    gdprUrl: app.gdpr_url || "",
    riskRating: app.risk_rating || "",
    accessibility: app.accessibility || "",
    languages: app.languages || [],
    supportOptions: app.support_options || [],
    trainingOptions: app.training_options || [],
    purchaseModels: app.purchase_models || [],
    priceFrom: app.price_from || "",
    alternatives: app.alternatives || [],
    contractStartDate: app.contract_start_date || "",
    contractEndDate: app.contract_end_date || "",
    autoRenew: app.auto_renew,
    noticePeriod: app.notice_period || "",
    productChampion: app.product_champion || "",
    productManager: app.product_manager || "",
    providerContact: app.provider_contact || "",
    financeContact: app.finance_contact || "",
    notes: app.notes || "",
    edtechImpactId: app.edtech_impact_id,
    lastEdtechSync: app.last_edtech_sync,
  };
}

// =============================================================================
// DIVISION CATEGORIZATION
// =============================================================================

/**
 * Dashboard data structure
 */
export interface DashboardData {
  wholeSchool: DivisionData;
  elementary: DivisionData;
  middleSchool: DivisionData;
  highSchool: DivisionData;
  stats: {
    totalApps: number;
    wholeSchoolCount: number;
    elementaryCount: number;
    middleSchoolCount: number;
    highSchoolCount: number;
  };
}

/**
 * Division data structure
 */
export interface DivisionData {
  apps: DashboardApp[];
  enterpriseApps: DashboardApp[];
  everyoneApps: DashboardApp[];
  byDepartment: Record<string, DashboardApp[]>;
}

/**
 * Categorize apps into divisions and process for dashboard display
 *
 * @param apps - Array of dashboard apps
 * @returns Categorized dashboard data
 */
export function categorizeToDivisions(apps: DashboardApp[]): DashboardData {
  const divisionData = {
    wholeSchool: [] as DashboardApp[],
    elementary: [] as DashboardApp[],
    middleSchool: [] as DashboardApp[],
    highSchool: [] as DashboardApp[],
  };

  // Categorize apps by division
  for (const app of apps) {
    const divisionsPresent = parseDivisions(app.division);
    const appIsWholeSchool = isWholeSchool(
      app.licenseType,
      app.department,
      app.division,
      divisionsPresent
    );

    if (appIsWholeSchool) {
      divisionData.wholeSchool.push(app);
    } else {
      if (divisionsPresent.es) divisionData.elementary.push(app);
      if (divisionsPresent.ms) divisionData.middleSchool.push(app);
      if (divisionsPresent.hs) divisionData.highSchool.push(app);
    }
  }

  // Process each division
  const processDivision = (
    divisionApps: DashboardApp[],
    isWholeSchoolTab: boolean
  ): DivisionData => {
    // Sort alphabetically
    divisionApps.sort((a, b) => a.product.localeCompare(b.product));

    // Enterprise apps only on whole school tab
    const enterpriseApps = isWholeSchoolTab
      ? divisionApps.filter((app) => app.enterprise)
      : [];

    // "Everyone" apps: site/school licenses that are NOT enterprise
    const everyoneApps = divisionApps.filter((app) => {
      const type = app.licenseType.toLowerCase();
      const dept = app.department.toLowerCase();
      const isEveryone =
        type.includes("site") ||
        type.includes("school") ||
        type.includes("enterprise") ||
        type.includes("unlimited") ||
        dept === "school-wide";

      if (app.enterprise) return false;
      if (!isWholeSchoolTab && app.isWholeSchool) return false;

      return isEveryone;
    });

    // Department-specific apps
    const coreAppProducts = new Set(
      [...enterpriseApps, ...everyoneApps].map((app) => app.product)
    );
    const departmentApps = divisionApps.filter(
      (app) => !coreAppProducts.has(app.product)
    );

    const byDepartment: Record<string, DashboardApp[]> = {};
    for (const app of departmentApps) {
      const dept = app.department || "General";
      if (dept === "N/A" || dept.trim() === "") continue;

      if (!byDepartment[dept]) {
        byDepartment[dept] = [];
      }
      byDepartment[dept].push(app);
    }

    return {
      apps: divisionApps,
      enterpriseApps,
      everyoneApps,
      byDepartment,
    };
  };

  return {
    wholeSchool: processDivision(divisionData.wholeSchool, true),
    elementary: processDivision(divisionData.elementary, false),
    middleSchool: processDivision(divisionData.middleSchool, false),
    highSchool: processDivision(divisionData.highSchool, false),
    stats: {
      totalApps: apps.length,
      wholeSchoolCount: divisionData.wholeSchool.length,
      elementaryCount: divisionData.elementary.length,
      middleSchoolCount: divisionData.middleSchool.length,
      highSchoolCount: divisionData.highSchool.length,
    },
  };
}
