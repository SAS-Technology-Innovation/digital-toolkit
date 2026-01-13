import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { AppInsert, App, SyncLogInsert } from "@/lib/supabase/types";

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
  // Tutorial link - support both naming conventions
  tutorialLink?: string;
  tutorial_link?: string;
  // Logo URL - support both naming conventions
  logoUrl?: string;
  logo_url?: string;
  // SSO enabled - support both naming conventions
  ssoEnabled?: boolean | string;
  sso_enabled?: boolean | string;
  // Mobile app - support both naming conventions
  mobileApp?: boolean | string;
  mobile_app?: boolean | string;
  // Grade levels - support both naming conventions
  gradeLevels?: string;
  grade_levels?: string;
  // Is new - support both naming conventions
  isNew?: boolean | string;
  is_new?: boolean | string;
  // Vendor
  vendor?: string;
  // License type - support both naming conventions
  licenseType?: string;
  license_type?: string;
  // Renewal date - support both naming conventions
  renewalDate?: string;
  renewal_date?: string;
  // Cost - support multiple naming conventions (Apps Script uses 'spend')
  annualCost?: number | string;
  annual_cost?: number | string;
  spend?: number | string;
  // Licenses
  licenses?: number | string;
  utilization?: number | string;
  status?: string;
  // Enterprise flag from Apps Script
  enterprise?: boolean | string;
  // Budget field from Apps Script
  budget?: string;
  // Support email from Apps Script
  supportEmail?: string;
  support_email?: string;
  // Date added from Apps Script
  dateAdded?: string;
  date_added?: string;
  // Is whole school flag (set by Apps Script)
  isWholeSchool?: boolean;
}

/**
 * Transform Apps Script data to Supabase format
 */
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
    // Handle "Free" as 0
    if (typeof val === "string" && val.toLowerCase() === "free") return 0;
    const num = typeof val === "string" ? parseFloat(val.replace(/[,$]/g, "")) : Number(val);
    return isNaN(num) ? null : num;
  };

  // Annual cost: Apps Script returns this as 'spend', also support annualCost and annual_cost
  const annualCostValue = app.spend ?? app.annualCost ?? app.annual_cost;

  return {
    product: app.product,
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
    is_new: parseBoolean(app.isNew ?? app.is_new ?? app.enterprise), // enterprise apps could be treated as "new"
    vendor: app.vendor || null,
    license_type: app.licenseType || app.license_type || null,
    renewal_date: app.renewalDate || app.renewal_date || null,
    annual_cost: parseNumber(annualCostValue),
    licenses: parseNumber(app.licenses) as number | null,
    utilization: parseNumber(app.utilization) as number | null,
    status: app.status || null,
    synced_at: new Date().toISOString(),
    apps_script_id: app.id || null,
  };
}

/**
 * Transform Supabase data back to Apps Script format for writeback
 */
function transformAppToAppsScript(app: App): AppsScriptApp {
  return {
    id: app.apps_script_id || undefined,
    product: app.product,
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
  };
}

/**
 * Write data back to Apps Script
 */
async function writeBackToAppsScript(apps: App[]): Promise<{ success: boolean; error?: string }> {
  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
  const FRONTEND_KEY = process.env.FRONTEND_KEY;

  if (!APPS_SCRIPT_URL) {
    return { success: false, error: "APPS_SCRIPT_URL not configured" };
  }

  try {
    const transformedApps = apps.map(transformAppToAppsScript);

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api: "update",
        key: FRONTEND_KEY,
        apps: transformedApps,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Apps Script write failed: ${response.status} - ${errorText}` };
    }

    const result = await response.json();
    if (result.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function POST(request: Request) {
  const startTime = Date.now();
  let syncLogId: string | null = null;

  try {
    const body = await request.json().catch(() => ({}));
    const triggeredBy = body.triggered_by || "api";
    const direction = body.direction || "pull"; // "pull" = AppsScript → Supabase, "push" = Supabase → AppsScript, "bidirectional" = both

    const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
    const FRONTEND_KEY = process.env.FRONTEND_KEY;

    if (!APPS_SCRIPT_URL) {
      return NextResponse.json(
        { error: "APPS_SCRIPT_URL not configured" },
        { status: 500 }
      );
    }

    let supabase;
    try {
      supabase = createServiceClient();
    } catch (err) {
      console.error("Service client creation failed:", err);
      return NextResponse.json(
        { error: "Supabase service client not configured. Set SUPABASE_SECRET_KEY." },
        { status: 500 }
      );
    }

    // Create sync log entry
    const syncLogData: SyncLogInsert = {
      sync_type: direction,
      status: "in_progress",
      triggered_by: triggeredBy,
    };
    const { data: syncLog, error: logError } = await supabase
      .from("sync_logs")
      .insert(syncLogData as never)
      .select()
      .single();

    if (logError) {
      console.error("Failed to create sync log:", logError);
    } else if (syncLog) {
      syncLogId = (syncLog as { id: string }).id;
    }

    let recordsSynced = 0;
    let recordsFailed = 0;
    const errors: string[] = [];

    // PULL: Apps Script → Supabase
    if (direction === "pull" || direction === "bidirectional") {
      const apiUrl = FRONTEND_KEY
        ? `${APPS_SCRIPT_URL}?api=data&key=${encodeURIComponent(FRONTEND_KEY)}`
        : `${APPS_SCRIPT_URL}?api=data`;

      console.log("Pulling from Apps Script...");
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`Apps Script fetch failed: ${response.status}`);
      }

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Invalid JSON from Apps Script");
      }

      // Extract apps from division-based structure or flat array
      let apps: AppsScriptApp[] = [];

      if (data.apps && Array.isArray(data.apps)) {
        // Flat array format: { apps: [...] }
        apps = data.apps;
      } else if (Array.isArray(data)) {
        // Direct array format: [...]
        apps = data;
      } else if (typeof data === "object" && data !== null) {
        // Division-based format: { wholeSchool: { apps: [...] }, elementary: { apps: [...] }, ... }
        const divisions = ["wholeSchool", "elementary", "middleSchool", "highSchool"];
        const allApps: AppsScriptApp[] = [];

        for (const div of divisions) {
          const divisionData = data[div];
          if (divisionData?.apps && Array.isArray(divisionData.apps)) {
            allApps.push(...divisionData.apps);
          }
        }

        // Deduplicate by product name (same app may appear in multiple divisions)
        const uniqueApps = new Map<string, AppsScriptApp>();
        for (const app of allApps) {
          if (app.product && !uniqueApps.has(app.product)) {
            uniqueApps.set(app.product, app);
          }
        }
        apps = [...uniqueApps.values()];
      }

      if (apps.length === 0) {
        throw new Error("No apps data received from Apps Script. Check data format.");
      }

      console.log(`Received ${apps.length} apps from Apps Script`);

      const transformedApps = apps.map(transformAppToSupabase);

      for (const app of transformedApps) {
        try {
          const { error: upsertError } = await supabase
            .from("apps")
            .upsert(app as never, {
              onConflict: "apps_script_id",
              ignoreDuplicates: false,
            });

          if (upsertError) {
            if (upsertError.code === "23505" || !app.apps_script_id) {
              const { error: updateError } = await supabase
                .from("apps")
                .update({
                  ...app,
                  updated_at: new Date().toISOString(),
                } as never)
                .eq("product", app.product);

              if (updateError) {
                const { error: insertError } = await supabase.from("apps").insert(app as never);
                if (insertError) throw insertError;
              }
            } else {
              throw upsertError;
            }
          }
          recordsSynced++;
        } catch (err) {
          recordsFailed++;
          errors.push(`Pull ${app.product}: ${err instanceof Error ? err.message : "Unknown error"}`);
          console.error(`Failed to sync ${app.product}:`, err);
        }
      }
    }

    // PUSH: Supabase → Apps Script
    if (direction === "push" || direction === "bidirectional") {
      console.log("Pushing to Apps Script...");

      // Get all apps from Supabase that have been modified since last sync
      const { data: modifiedApps, error: fetchError } = await supabase
        .from("apps")
        .select("*")
        .or(`synced_at.is.null,updated_at.gt.synced_at`);

      if (fetchError) {
        errors.push(`Push fetch error: ${fetchError.message}`);
      } else if (modifiedApps && modifiedApps.length > 0) {
        console.log(`Pushing ${modifiedApps.length} modified apps to Apps Script`);

        const writeResult = await writeBackToAppsScript(modifiedApps as App[]);

        if (writeResult.success) {
          // Update synced_at for all pushed apps
          const ids = modifiedApps.map((a: { id: string }) => a.id);
          await supabase
            .from("apps")
            .update({ synced_at: new Date().toISOString() } as never)
            .in("id", ids);

          recordsSynced += modifiedApps.length;
        } else {
          recordsFailed += modifiedApps.length;
          errors.push(`Push failed: ${writeResult.error}`);
        }
      }
    }

    const duration = Date.now() - startTime;

    // Update sync log
    if (syncLogId) {
      await supabase
        .from("sync_logs")
        .update({
          status: recordsFailed > 0 && recordsSynced === 0 ? "failed" : "completed",
          records_synced: recordsSynced,
          records_failed: recordsFailed,
          error_message: errors.length > 0 ? errors.slice(0, 5).join("; ") : null,
          completed_at: new Date().toISOString(),
        } as never)
        .eq("id", syncLogId);
    }

    return NextResponse.json({
      success: true,
      direction,
      records_synced: recordsSynced,
      records_failed: recordsFailed,
      duration_ms: duration,
      errors: errors.slice(0, 5),
    });
  } catch (error) {
    console.error("Sync failed:", error);

    if (syncLogId) {
      try {
        const supabase = createServiceClient();
        await supabase
          .from("sync_logs")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : "Unknown error",
            completed_at: new Date().toISOString(),
          } as never)
          .eq("id", syncLogId);
      } catch {
        console.error("Failed to update sync log");
      }
    }

    return NextResponse.json(
      {
        error: "Sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET handler for cron jobs (daily pull sync)
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return POST(
    new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify({ triggered_by: "cron", direction: "pull" }),
    })
  );
}
