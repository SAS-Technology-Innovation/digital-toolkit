import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * API Route: /api/renewal-data
 * Fetches app renewal data from Supabase
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
  created_at: string;
  updated_at: string;
}

interface RenewalApp {
  id: string;
  product: string;
  vendor: string;
  category: string;
  renewalDate: string;
  annualCost: number;
  licenses: number;
  licenseType: string;
  status: "urgent" | "upcoming" | "overdue" | "active" | "retired";
  division: string;
  utilization: number;
}

/**
 * Calculate renewal status based on renewal date
 */
function calculateStatus(renewalDate: string | null): RenewalApp["status"] {
  if (!renewalDate) return "active";

  const today = new Date();
  const renewal = new Date(renewalDate);
  const daysUntilRenewal = Math.ceil(
    (renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilRenewal < 0) return "overdue";
  if (daysUntilRenewal <= 30) return "urgent";
  if (daysUntilRenewal <= 90) return "upcoming";
  return "active";
}

/**
 * Transform Supabase app to renewal format
 */
function transformToRenewal(app: SupabaseApp): RenewalApp {
  const status = app.status === "retired" ? "retired" : calculateStatus(app.renewal_date);

  return {
    id: app.id,
    product: app.product,
    vendor: app.vendor || "Unknown",
    category: app.category || "General",
    renewalDate: app.renewal_date || "",
    annualCost: app.annual_cost || 0,
    licenses: app.licenses || 0,
    licenseType: app.license_type || "Unknown",
    status,
    division: app.division || "N/A",
    utilization: app.utilization || 0,
  };
}

const emptyRenewalResponse = {
  apps: [],
  summary: { totalApps: 0, totalAnnualCost: 0, urgentCount: 0, avgUtilization: 0 },
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
      .order("renewal_date", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch renewal data from database" },
        { status: 500 }
      );
    }

    if (!apps || apps.length === 0) {
      console.log("No apps in Supabase");
      return NextResponse.json(emptyRenewalResponse, {
        headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" },
      });
    }

    // Transform apps to renewal format
    const renewalApps = (apps as SupabaseApp[])
      .filter((app) => app.status !== "retired") // Filter out retired apps by default
      .map(transformToRenewal);

    // Calculate summary statistics
    const totalAnnualCost = renewalApps.reduce((sum, app) => sum + app.annualCost, 0);
    const urgentCount = renewalApps.filter(
      (a) => a.status === "urgent" || a.status === "overdue"
    ).length;
    const avgUtilization = renewalApps.length > 0
      ? Math.round(
          renewalApps.reduce((sum, app) => sum + app.utilization, 0) / renewalApps.length
        )
      : 0;

    const result = {
      apps: renewalApps,
      summary: {
        totalApps: renewalApps.length,
        totalAnnualCost,
        urgentCount,
        avgUtilization,
      },
    };

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
        "X-Data-Source": "supabase",
      },
    });
  } catch (error) {
    console.error("Error fetching renewal data:", error);
    return NextResponse.json(
      { error: "Failed to fetch renewal data" },
      { status: 500 }
    );
  }
}
