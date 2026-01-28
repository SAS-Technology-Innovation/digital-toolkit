import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * API Route: /api/data
 * Fetches app data from Supabase and formats it for the dashboard.
 */

interface SupabaseApp {
  id: string;
  product: string;
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
  is_new: boolean;
  vendor: string | null;
  license_type: string | null;
  renewal_date: string | null;
  annual_cost: number | null;
  licenses: number | null;
  created_at: string;
  updated_at: string;
  // Fields from Apps Script sync
  enterprise: boolean;
  budget: string | null;
  support_email: string | null;
  date_added: string | null;
  is_whole_school: boolean;
  // EdTech Impact fields
  global_rating: number | null;
  assessment_status: string | null;
  recommended_reason: string | null;
  accessibility: string | null;
  price_from: string | null;
  product_champion: string | null;
  product_manager: string | null;
  edtech_impact_id: string | null;
}

interface DashboardApp {
  product: string;
  description: string;
  category: string;
  subject: string;
  department: string;
  division: string;
  audience: string;
  website: string;
  tutorialLink: string;
  logoUrl: string;
  ssoEnabled: boolean;
  mobileApp: string;
  gradeLevels: string;
  licenseType: string;
  renewalDate: string;
  annualCost: number | null;
  licenses: number | null;
  vendor: string;
  budget: string;
  dateAdded: string;
  enterprise: boolean;
  isWholeSchool?: boolean;
  // EdTech Impact fields
  globalRating: number | null;
  assessmentStatus: string | null;
  recommendedReason: string | null;
  accessibility: string | null;
  priceFrom: string | null;
  productChampion: string | null;
  productManager: string | null;
  edtechImpactId: string | null;
}

/**
 * Transform Supabase app to dashboard format
 */
function transformToDashboard(app: SupabaseApp): DashboardApp {
  return {
    product: app.product,
    description: app.description || "",
    category: app.category || "N/A",
    subject: app.subject || "N/A",
    department: app.department || "N/A",
    division: app.division || "N/A",
    audience: app.audience?.join(", ") || "",
    website: app.website || "#",
    tutorialLink: app.tutorial_link || "",
    logoUrl: app.logo_url || "",
    ssoEnabled: app.sso_enabled,
    mobileApp: app.mobile_app ? "Yes" : "No",
    gradeLevels: app.grade_levels || "N/A",
    licenseType: app.license_type || "N/A",
    renewalDate: app.renewal_date || "",
    annualCost: app.annual_cost,
    licenses: app.licenses,
    vendor: app.vendor || "",
    budget: app.budget || "",
    dateAdded: app.date_added || "",
    enterprise: app.enterprise,
    // EdTech Impact fields
    globalRating: app.global_rating,
    assessmentStatus: app.assessment_status,
    recommendedReason: app.recommended_reason,
    accessibility: app.accessibility,
    priceFrom: app.price_from,
    productChampion: app.product_champion,
    productManager: app.product_manager,
    edtechImpactId: app.edtech_impact_id,
  };
}

/**
 * Check if license type indicates "everyone" access
 */
function isEveryoneLicense(licenseType: string): boolean {
  const lt = licenseType.toLowerCase();
  return lt.includes("site") || lt.includes("school") || lt.includes("enterprise") || lt.includes("unlimited");
}

/**
 * Parse division string to determine which divisions an app belongs to
 */
function parseDivisions(divisionStr: string): { es: boolean; ms: boolean; hs: boolean; wholeSchool: boolean } {
  const div = divisionStr.toLowerCase();
  return {
    es: div.includes("elementary") || div.includes("es"),
    ms: div.includes("middle") || div.includes("ms"),
    hs: div.includes("high") || div.includes("hs"),
    wholeSchool: div.includes("whole") || div.includes("all"),
  };
}

/**
 * Determine if an app is effectively whole school
 */
function isEffectivelyWholeSchool(app: DashboardApp): boolean {
  const department = app.department.toLowerCase();
  const divisions = parseDivisions(app.division);

  // Site/School/Enterprise/Unlimited licenses are whole school
  if (isEveryoneLicense(app.licenseType)) return true;

  // School Operations department is whole school
  if (department === "school operations") return true;

  // Explicitly marked as whole school
  if (divisions.wholeSchool) return true;

  // Present in all three divisions
  if (divisions.es && divisions.ms && divisions.hs) return true;

  return false;
}

const emptyResponse = {
  wholeSchool: { name: "Whole School", apps: [] },
  elementary: { name: "Elementary", apps: [] },
  middleSchool: { name: "Middle School", apps: [] },
  highSchool: { name: "High School", apps: [] },
};

export async function GET() {
  try {
    // Create Supabase client
    let supabase;
    try {
      supabase = await createServerSupabaseClient();
    } catch {
      console.error("Supabase not configured");
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Fetch all apps from Supabase
    const { data: apps, error } = await supabase
      .from("apps")
      .select("*")
      .order("product", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch apps from database" },
        { status: 500 }
      );
    }

    if (!apps || apps.length === 0) {
      console.log("No apps in Supabase");
      return NextResponse.json(emptyResponse, {
        headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" },
      });
    }

    // Transform apps to dashboard format
    const dashboardApps = (apps as SupabaseApp[]).map(transformToDashboard);

    // Group apps by division
    const divisionData: {
      wholeSchool: DashboardApp[];
      elementary: DashboardApp[];
      middleSchool: DashboardApp[];
      highSchool: DashboardApp[];
    } = {
      wholeSchool: [],
      elementary: [],
      middleSchool: [],
      highSchool: [],
    };

    for (const app of dashboardApps) {
      const divisions = parseDivisions(app.division);
      const appIsWholeSchool = isEffectivelyWholeSchool(app);

      app.isWholeSchool = appIsWholeSchool;

      if (appIsWholeSchool) {
        divisionData.wholeSchool.push(app);
      } else {
        if (divisions.es) divisionData.elementary.push(app);
        if (divisions.ms) divisionData.middleSchool.push(app);
        if (divisions.hs) divisionData.highSchool.push(app);
      }
    }

    // Process each division to extract enterprise and everyone apps
    function processDivisionApps(apps: DashboardApp[], isWholeSchoolTab: boolean) {
      apps.sort((a, b) => a.product.localeCompare(b.product));

      const enterpriseApps = isWholeSchoolTab ? apps.filter((app) => app.enterprise === true) : [];

      const everyoneApps = apps.filter((app) => {
        if (app.enterprise) return false;
        if (!isWholeSchoolTab && app.isWholeSchool) return false;
        return isEveryoneLicense(app.licenseType);
      });

      return {
        apps,
        enterpriseApps,
        everyoneApps,
      };
    }

    const result = {
      wholeSchool: {
        name: "Whole School",
        ...processDivisionApps(divisionData.wholeSchool, true),
      },
      elementary: {
        name: "Elementary",
        ...processDivisionApps(divisionData.elementary, false),
      },
      middleSchool: {
        name: "Middle School",
        ...processDivisionApps(divisionData.middleSchool, false),
      },
      highSchool: {
        name: "High School",
        ...processDivisionApps(divisionData.highSchool, false),
      },
      stats: {
        totalApps: dashboardApps.length,
        wholeSchoolCount: divisionData.wholeSchool.length,
        elementaryCount: divisionData.elementary.length,
        middleSchoolCount: divisionData.middleSchool.length,
        highSchoolCount: divisionData.highSchool.length,
      },
    };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
