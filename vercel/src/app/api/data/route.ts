import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * API Route: /api/data
 * Fetches app data from Supabase and formats it for the dashboard.
 * Falls back to mock data if Supabase is not configured.
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
  spend: number | string;
  dateAdded: string;
  enterprise: boolean;
  isWholeSchool?: boolean;
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
    spend: app.annual_cost === 0 ? "Free" : (app.annual_cost || "N/A"),
    dateAdded: app.created_at,
    enterprise: app.is_new, // Using is_new flag for enterprise status
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
  const licenseType = app.licenseType.toLowerCase();
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

// Mock data for when Supabase is not configured
const mockData = {
  wholeSchool: {
    name: "Whole School",
    apps: [
      {
        product: "Google Workspace",
        website: "https://workspace.google.com",
        renewalDate: "2024-06-15",
        spend: 0,
        dateAdded: "2023-01-01",
        division: "Whole School",
        enterprise: true,
        licenseType: "Site License",
        category: "Productivity",
        audience: "Teachers, Students, Staff, Parents",
        description: "Collaborative productivity suite including Docs, Sheets, Slides, and more.",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "K-12",
      },
      {
        product: "Toddle",
        website: "https://toddleapp.com",
        renewalDate: "2024-08-01",
        spend: 45000,
        dateAdded: "2023-06-15",
        division: "Whole School",
        enterprise: true,
        licenseType: "Enterprise",
        category: "Learning Management",
        audience: "Teachers, Students",
        description: "Collaborative teaching and learning platform for planning, assessment, and communication.",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "K-12",
      },
    ],
  },
  elementary: { name: "Elementary", apps: [] },
  middleSchool: { name: "Middle School", apps: [] },
  highSchool: { name: "High School", apps: [] },
};

export async function GET() {
  try {
    // Try to create Supabase client
    let supabase;
    try {
      supabase = await createServerSupabaseClient();
    } catch (err) {
      console.log("Supabase not configured, using mock data");
      return NextResponse.json(mockData, {
        headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
      });
    }

    // Fetch all apps from Supabase
    const { data: apps, error } = await supabase
      .from("apps")
      .select("*")
      .order("product", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(mockData, {
        headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
      });
    }

    if (!apps || apps.length === 0) {
      console.log("No apps in Supabase, using mock data");
      return NextResponse.json(mockData, {
        headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
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
    return NextResponse.json(mockData, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
    });
  }
}
