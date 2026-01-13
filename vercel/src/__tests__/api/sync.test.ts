import { describe, it, expect } from "vitest";

// Test the data transformation logic extracted from the sync route
// Note: We test the transformation functions independently

interface AppsScriptApp {
  id?: string;
  product: string;
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
  licenses?: number | string;
  utilization?: number | string;
  status?: string;
}

interface AppInsert {
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
  utilization: number | null;
  status: string | null;
  synced_at: string;
  apps_script_id: string | null;
}

// Replicate the transformation function from sync route
function transformAppToSupabase(app: AppsScriptApp): AppInsert {
  let audience: string[] | null = null;
  if (app.audience) {
    if (Array.isArray(app.audience)) {
      audience = app.audience;
    } else if (typeof app.audience === "string") {
      audience = app.audience.split(",").map((a) => a.trim()).filter(Boolean);
    }
  }

  const parseBoolean = (val: unknown): boolean => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.toLowerCase() === "true" || val === "Yes";
    return false;
  };

  const parseNumber = (val: unknown): number | null => {
    if (val === null || val === undefined || val === "") return null;
    const num = typeof val === "string" ? parseFloat(val.replace(/[,$]/g, "")) : Number(val);
    return isNaN(num) ? null : num;
  };

  return {
    product: app.product,
    description: app.description || null,
    category: app.category || null,
    subject: app.subject || null,
    department: app.department || null,
    division: app.division || null,
    audience,
    website: app.website || null,
    tutorial_link: app.tutorialLink || app.tutorial_link || null,
    logo_url: app.logoUrl || app.logo_url || null,
    sso_enabled: parseBoolean(app.ssoEnabled ?? app.sso_enabled),
    mobile_app: parseBoolean(app.mobileApp ?? app.mobile_app),
    grade_levels: app.gradeLevels || app.grade_levels || null,
    is_new: parseBoolean(app.isNew ?? app.is_new),
    vendor: app.vendor || null,
    license_type: app.licenseType || app.license_type || null,
    renewal_date: app.renewalDate || app.renewal_date || null,
    annual_cost: parseNumber(app.annualCost ?? app.annual_cost),
    licenses: parseNumber(app.licenses) as number | null,
    utilization: parseNumber(app.utilization) as number | null,
    status: app.status || null,
    synced_at: new Date().toISOString(),
    apps_script_id: app.id || null,
  };
}

// Replicate the data extraction function from sync route
function extractAppsFromData(data: unknown): AppsScriptApp[] {
  if (!data || typeof data !== "object") return [];

  const dataObj = data as Record<string, unknown>;

  if (dataObj.apps && Array.isArray(dataObj.apps)) {
    return dataObj.apps as AppsScriptApp[];
  }

  if (Array.isArray(data)) {
    return data as AppsScriptApp[];
  }

  // Division-based format
  const divisions = ["wholeSchool", "elementary", "middleSchool", "highSchool"];
  const allApps: AppsScriptApp[] = [];

  for (const div of divisions) {
    const divisionData = dataObj[div] as Record<string, unknown> | undefined;
    if (divisionData?.apps && Array.isArray(divisionData.apps)) {
      allApps.push(...(divisionData.apps as AppsScriptApp[]));
    }
  }

  // Deduplicate by product name
  const uniqueApps = new Map<string, AppsScriptApp>();
  for (const app of allApps) {
    if (app.product && !uniqueApps.has(app.product)) {
      uniqueApps.set(app.product, app);
    }
  }

  return [...uniqueApps.values()];
}

describe("Sync Data Transformation", () => {
  describe("transformAppToSupabase", () => {
    it("transforms basic app data correctly", () => {
      const input: AppsScriptApp = {
        product: "Test App",
        description: "Test description",
        category: "Productivity",
      };

      const result = transformAppToSupabase(input);

      expect(result.product).toBe("Test App");
      expect(result.description).toBe("Test description");
      expect(result.category).toBe("Productivity");
    });

    it("handles camelCase field names", () => {
      const input: AppsScriptApp = {
        product: "Test App",
        tutorialLink: "https://tutorial.com",
        logoUrl: "https://logo.com/logo.png",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "K-5",
        isNew: true,
        licenseType: "Site License",
        renewalDate: "2024-01-01",
        annualCost: 5000,
      };

      const result = transformAppToSupabase(input);

      expect(result.tutorial_link).toBe("https://tutorial.com");
      expect(result.logo_url).toBe("https://logo.com/logo.png");
      expect(result.sso_enabled).toBe(true);
      expect(result.mobile_app).toBe(true);
      expect(result.grade_levels).toBe("K-5");
      expect(result.is_new).toBe(true);
      expect(result.license_type).toBe("Site License");
      expect(result.renewal_date).toBe("2024-01-01");
      expect(result.annual_cost).toBe(5000);
    });

    it("handles snake_case field names", () => {
      const input: AppsScriptApp = {
        product: "Test App",
        tutorial_link: "https://tutorial.com",
        logo_url: "https://logo.com/logo.png",
        sso_enabled: true,
        mobile_app: "Yes",
        grade_levels: "K-5",
        is_new: true,
        license_type: "Site License",
        renewal_date: "2024-01-01",
        annual_cost: 5000,
      };

      const result = transformAppToSupabase(input);

      expect(result.tutorial_link).toBe("https://tutorial.com");
      expect(result.logo_url).toBe("https://logo.com/logo.png");
      expect(result.sso_enabled).toBe(true);
      expect(result.mobile_app).toBe(true);
      expect(result.grade_levels).toBe("K-5");
      expect(result.is_new).toBe(true);
      expect(result.license_type).toBe("Site License");
      expect(result.renewal_date).toBe("2024-01-01");
      expect(result.annual_cost).toBe(5000);
    });

    it("parses audience string to array", () => {
      const input: AppsScriptApp = {
        product: "Test App",
        audience: "Teachers, Students, Parents",
      };

      const result = transformAppToSupabase(input);

      expect(result.audience).toEqual(["Teachers", "Students", "Parents"]);
    });

    it("handles audience as array", () => {
      const input: AppsScriptApp = {
        product: "Test App",
        audience: ["Teachers", "Students"],
      };

      const result = transformAppToSupabase(input);

      expect(result.audience).toEqual(["Teachers", "Students"]);
    });

    it("parses boolean string values correctly", () => {
      const input: AppsScriptApp = {
        product: "Test App",
        ssoEnabled: "true",
        mobileApp: "Yes",
        isNew: "false",
      };

      const result = transformAppToSupabase(input);

      expect(result.sso_enabled).toBe(true);
      expect(result.mobile_app).toBe(true);
      expect(result.is_new).toBe(false);
    });

    it("parses number values from strings", () => {
      const input: AppsScriptApp = {
        product: "Test App",
        annualCost: "$5,000",
        licenses: "100",
        utilization: "85.5",
      };

      const result = transformAppToSupabase(input);

      expect(result.annual_cost).toBe(5000);
      expect(result.licenses).toBe(100);
      expect(result.utilization).toBe(85.5);
    });

    it("handles null and undefined values", () => {
      const input: AppsScriptApp = {
        product: "Test App",
        description: undefined,
        category: undefined,
        annualCost: "",
      };

      const result = transformAppToSupabase(input);

      expect(result.description).toBeNull();
      expect(result.category).toBeNull();
      expect(result.annual_cost).toBeNull();
    });

    it("sets synced_at timestamp", () => {
      const input: AppsScriptApp = { product: "Test App" };
      const before = new Date().toISOString();
      const result = transformAppToSupabase(input);
      const after = new Date().toISOString();

      expect(result.synced_at >= before).toBe(true);
      expect(result.synced_at <= after).toBe(true);
    });

    it("sets apps_script_id from id", () => {
      const input: AppsScriptApp = {
        id: "abc123",
        product: "Test App",
      };

      const result = transformAppToSupabase(input);

      expect(result.apps_script_id).toBe("abc123");
    });
  });

  describe("extractAppsFromData", () => {
    it("extracts apps from flat array format { apps: [...] }", () => {
      const data = {
        apps: [
          { product: "App 1" },
          { product: "App 2" },
        ],
      };

      const result = extractAppsFromData(data);

      expect(result).toHaveLength(2);
      expect(result[0].product).toBe("App 1");
      expect(result[1].product).toBe("App 2");
    });

    it("extracts apps from direct array format [...]", () => {
      const data = [
        { product: "App 1" },
        { product: "App 2" },
      ];

      const result = extractAppsFromData(data);

      expect(result).toHaveLength(2);
      expect(result[0].product).toBe("App 1");
    });

    it("extracts and deduplicates apps from division-based format", () => {
      const data = {
        wholeSchool: {
          name: "Whole School",
          apps: [
            { product: "Google Workspace" },
            { product: "Zoom" },
          ],
        },
        elementary: {
          name: "Elementary",
          apps: [
            { product: "Seesaw" },
            { product: "Google Workspace" }, // Duplicate
          ],
        },
        middleSchool: {
          name: "Middle School",
          apps: [
            { product: "Desmos" },
          ],
        },
        highSchool: {
          name: "High School",
          apps: [
            { product: "Turnitin" },
          ],
        },
      };

      const result = extractAppsFromData(data);

      // Should be 5, not 6 (Google Workspace deduplicated)
      expect(result).toHaveLength(5);
      const products = result.map((a) => a.product);
      expect(products).toContain("Google Workspace");
      expect(products).toContain("Zoom");
      expect(products).toContain("Seesaw");
      expect(products).toContain("Desmos");
      expect(products).toContain("Turnitin");
    });

    it("handles partial division data", () => {
      const data = {
        wholeSchool: {
          apps: [{ product: "App 1" }],
        },
        // Missing other divisions
      };

      const result = extractAppsFromData(data);

      expect(result).toHaveLength(1);
      expect(result[0].product).toBe("App 1");
    });

    it("handles empty divisions", () => {
      const data = {
        wholeSchool: { apps: [] },
        elementary: { apps: [] },
      };

      const result = extractAppsFromData(data);

      expect(result).toHaveLength(0);
    });

    it("returns empty array for null input", () => {
      expect(extractAppsFromData(null)).toHaveLength(0);
    });

    it("returns empty array for undefined input", () => {
      expect(extractAppsFromData(undefined)).toHaveLength(0);
    });

    it("returns empty array for non-object input", () => {
      expect(extractAppsFromData("string")).toHaveLength(0);
      expect(extractAppsFromData(123)).toHaveLength(0);
    });
  });
});

describe("Data Consistency", () => {
  it("preserves all fields during transformation", () => {
    const input: AppsScriptApp = {
      id: "test-id",
      product: "Complete App",
      description: "Full description",
      category: "Productivity",
      subject: "Math",
      department: "Academic",
      division: "Whole School",
      audience: "Teachers, Students",
      website: "https://app.com",
      tutorialLink: "https://tutorial.com",
      logoUrl: "https://logo.com",
      ssoEnabled: true,
      mobileApp: "Yes",
      gradeLevels: "K-12",
      isNew: true,
      vendor: "App Inc",
      licenseType: "Site License",
      renewalDate: "2024-12-31",
      annualCost: 10000,
      licenses: 500,
      utilization: 75,
      status: "active",
    };

    const result = transformAppToSupabase(input);

    expect(result.apps_script_id).toBe("test-id");
    expect(result.product).toBe("Complete App");
    expect(result.description).toBe("Full description");
    expect(result.category).toBe("Productivity");
    expect(result.subject).toBe("Math");
    expect(result.department).toBe("Academic");
    expect(result.division).toBe("Whole School");
    expect(result.audience).toEqual(["Teachers", "Students"]);
    expect(result.website).toBe("https://app.com");
    expect(result.tutorial_link).toBe("https://tutorial.com");
    expect(result.logo_url).toBe("https://logo.com");
    expect(result.sso_enabled).toBe(true);
    expect(result.mobile_app).toBe(true);
    expect(result.grade_levels).toBe("K-12");
    expect(result.is_new).toBe(true);
    expect(result.vendor).toBe("App Inc");
    expect(result.license_type).toBe("Site License");
    expect(result.renewal_date).toBe("2024-12-31");
    expect(result.annual_cost).toBe(10000);
    expect(result.licenses).toBe(500);
    expect(result.utilization).toBe(75);
    expect(result.status).toBe("active");
  });
});
