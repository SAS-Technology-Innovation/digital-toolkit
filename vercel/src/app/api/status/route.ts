import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { App } from "@/lib/supabase/types";

/**
 * API Route: /api/status
 * Returns application status data from Supabase.
 * Each app gets a status based on its data presence (website reachability
 * would require external monitoring; for now we surface what we have).
 */

export async function GET() {
  try {
    let supabase;
    try {
      supabase = createServiceClient();
    } catch {
      return NextResponse.json(
        { error: "Supabase service client not configured" },
        { status: 500 }
      );
    }

    const { data: apps, error } = await supabase
      .from("apps")
      .select("*")
      .order("product");

    if (error) {
      throw new Error(error.message);
    }

    // Build status map from real apps
    const statuses: Record<string, number> = {};
    const appDetails: Array<{
      id: string;
      name: string;
      status: "operational" | "issues" | "maintenance";
      website: string | null;
      category: string | null;
    }> = [];

    for (const app of (apps as unknown as App[]) || []) {
      // Default to operational; use status field if it indicates issues
      const appStatus = (app.status as string | null)?.toLowerCase() || "";
      let resolvedStatus: "operational" | "issues" | "maintenance" = "operational";
      if (appStatus.includes("issue") || appStatus.includes("down") || appStatus === "inactive") {
        resolvedStatus = "issues";
      } else if (appStatus.includes("maintenance")) {
        resolvedStatus = "maintenance";
      }

      statuses[app.product] = resolvedStatus === "operational" ? 1 : 0;
      appDetails.push({
        id: app.id,
        name: app.product,
        status: resolvedStatus,
        website: app.website,
        category: app.category,
      });
    }

    const total = appDetails.length;
    const up = appDetails.filter((a) => a.status === "operational").length;
    const down = total - up;

    return NextResponse.json(
      {
        statuses,
        apps: appDetails,
        summary: {
          total,
          up,
          down,
          uptime: total > 0 ? Math.round((up / total) * 1000) / 10 : 0,
        },
        lastChecked: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching status data:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch status data",
        statuses: {},
        apps: [],
        summary: { total: 0, up: 0, down: 0, uptime: 0 },
        lastChecked: null,
      },
      { status: 500 }
    );
  }
}
