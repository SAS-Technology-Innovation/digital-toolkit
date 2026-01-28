import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { AppInsert, App, SyncLogInsert } from "@/lib/supabase/types";
import type { LegacyApp } from "@/lib/shared/schema";
import {
  transformAppsScriptToSupabase,
  toAppsScriptFieldUpdates,
  toGoogleSheetsRow,
} from "@/lib/shared/transforms";
import type { SupabaseApp } from "@/lib/shared/schema";

/**
 * Write data back to Apps Script - updates existing apps AND adds new ones
 */
async function writeBackToAppsScript(apps: App[]): Promise<{ success: boolean; error?: string; successCount?: number; failCount?: number; addedCount?: number }> {
  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
  const FRONTEND_KEY = process.env.FRONTEND_KEY;

  if (!APPS_SCRIPT_URL) {
    return { success: false, error: "APPS_SCRIPT_URL not configured" };
  }

  try {
    // Step 1: Update existing apps with bulkUpdate
    const allUpdates: Array<{ productId: string; field: string; value: unknown }> = [];
    for (const app of apps) {
      const updates = toAppsScriptFieldUpdates(app as unknown as SupabaseApp);
      allUpdates.push(...updates);
    }

    let updateSuccessCount = 0;
    let updateFailCount = 0;

    if (allUpdates.length > 0) {
      console.log(`Sending ${allUpdates.length} field updates to Apps Script`);

      const updateResponse = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api: "bulkUpdate",
          key: FRONTEND_KEY,
          updates: JSON.stringify(allUpdates),
        }),
      });

      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        updateSuccessCount = updateResult.successCount || 0;
        updateFailCount = updateResult.failCount || 0;
      }
    }

    // Step 2: Add new apps with bulkAdd (will skip existing ones based on product_id)
    const appsToAdd = apps
      .filter(app => app.product_id)
      .map(app => toGoogleSheetsRow(app as unknown as SupabaseApp));

    let addedCount = 0;

    if (appsToAdd.length > 0) {
      console.log(`Sending ${appsToAdd.length} apps to bulkAdd API`);

      const addResponse = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api: "bulkAdd",
          key: FRONTEND_KEY,
          apps: JSON.stringify(appsToAdd),
        }),
      });

      if (addResponse.ok) {
        const addResult = await addResponse.json();
        addedCount = addResult.addedCount || 0;
        console.log(`bulkAdd result: ${addedCount} added, ${addResult.skippedCount || 0} skipped`);
      }
    }

    return {
      success: true,
      successCount: updateSuccessCount,
      failCount: updateFailCount,
      addedCount: addedCount,
    };
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
      let apps: LegacyApp[] = [];

      if (data.apps && Array.isArray(data.apps)) {
        apps = data.apps;
      } else if (Array.isArray(data)) {
        apps = data;
      } else if (typeof data === "object" && data !== null) {
        // Division-based format: { wholeSchool: { apps: [...] }, elementary: { apps: [...] }, ... }
        const divisions = ["wholeSchool", "elementary", "middleSchool", "highSchool"];
        const allApps: LegacyApp[] = [];

        for (const div of divisions) {
          const divisionData = data[div];
          if (divisionData?.apps && Array.isArray(divisionData.apps)) {
            allApps.push(...divisionData.apps);
          }
        }

        // Deduplicate by product_id or product name
        const uniqueApps = new Map<string, LegacyApp>();
        for (const app of allApps) {
          const uniqueKey = app.productId || app.product_id || app.product;
          if (uniqueKey && !uniqueApps.has(uniqueKey)) {
            uniqueApps.set(uniqueKey, app);
          }
        }
        apps = [...uniqueApps.values()];
      }

      if (apps.length === 0) {
        throw new Error("No apps data received from Apps Script. Check data format.");
      }

      console.log(`Received ${apps.length} apps from Apps Script`);

      // Use shared transform function
      const transformedApps = apps.map(app => transformAppsScriptToSupabase(app) as unknown as AppInsert);

      for (const app of transformedApps) {
        try {
          let existingAppId: string | null = null;

          // First try to find by product_id (preferred - stable unique identifier)
          if (app.product_id) {
            const { data } = await supabase
              .from("apps")
              .select("id")
              .eq("product_id", app.product_id)
              .single();
            if (data) existingAppId = (data as { id: string }).id;
          }

          // Fallback: find by product name
          if (!existingAppId) {
            const { data } = await supabase
              .from("apps")
              .select("id")
              .eq("product", app.product)
              .single();
            if (data) existingAppId = (data as { id: string }).id;
          }

          if (existingAppId) {
            const { error: updateError } = await supabase
              .from("apps")
              .update({
                ...app,
                updated_at: new Date().toISOString(),
              } as never)
              .eq("id", existingAppId);

            if (updateError) throw updateError;
          } else {
            const { error: insertError } = await supabase
              .from("apps")
              .insert(app as never);

            if (insertError) throw insertError;
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

      const { data: allApps, error: fetchError } = await supabase
        .from("apps")
        .select("*")
        .not("product_id", "is", null);

      if (fetchError) {
        errors.push(`Push fetch error: ${fetchError.message}`);
      } else if (allApps && allApps.length > 0) {
        const modifiedApps = allApps.filter((app: { updated_at: string; synced_at: string | null }) => {
          if (!app.synced_at) return true;
          return new Date(app.updated_at) > new Date(app.synced_at);
        });

        if (modifiedApps.length === 0) {
          console.log("No modified apps to push");
        } else {
          console.log(`Pushing ${modifiedApps.length} modified apps to Apps Script`);

          const writeResult = await writeBackToAppsScript(modifiedApps as App[]);

          if (writeResult.success) {
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
