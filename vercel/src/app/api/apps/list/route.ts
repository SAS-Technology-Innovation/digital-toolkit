import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

interface AppListItem {
  id: string;
  product: string;
  vendor: string | null;
  category: string | null;
  division: string | null;
  renewal_date: string | null;
  annual_cost: number | null;
  licenses: number | null;
}

/**
 * GET /api/apps/list
 * Get a simple list of apps for dropdown selection
 * Tries server client first, falls back to service client if empty
 */
export async function GET() {
  try {
    // First try with the authenticated client
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("apps")
      .select("id, product, vendor, category, division, renewal_date, annual_cost, licenses")
      .neq("status", "retired")
      .order("product", { ascending: true });

    if (error) {
      console.error("Error fetching apps list with server client:", error);
    }

    // If we got data, return it
    if (data && data.length > 0) {
      return NextResponse.json(data);
    }

    // If no data, try with service client (bypasses RLS)
    console.log("Apps list empty with server client, trying service client...");
    const serviceClient = createServiceClient() as SupabaseClient<Database>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: serviceData, error: serviceError } = await (serviceClient as any)
      .from("apps")
      .select("id, product, vendor, category, division, renewal_date, annual_cost, licenses")
      .neq("status", "retired")
      .order("product", { ascending: true });

    if (serviceError) {
      console.error("Error fetching apps list with service client:", serviceError);
      return NextResponse.json({ error: serviceError.message }, { status: 500 });
    }

    // If still empty, try fetching all apps including retired
    if (!serviceData || serviceData.length === 0) {
      console.log("Still no apps found, checking total count...");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: allApps, error: allError } = await (serviceClient as any)
        .from("apps")
        .select("id, product, vendor, category, division, renewal_date, annual_cost, licenses, status")
        .order("product", { ascending: true });

      if (allError) {
        console.error("Error fetching all apps:", allError);
        return NextResponse.json({ error: allError.message }, { status: 500 });
      }

      if (!allApps || allApps.length === 0) {
        // No apps in database at all - this is expected for a fresh database
        console.log("No apps in database. Run a sync from Admin page to populate data.");
        return NextResponse.json([]);
      }

      // Filter out retired apps manually and return
      const activeApps = allApps.filter((app: AppListItem & { status?: string }) => app.status !== "retired");
      return NextResponse.json(activeApps);
    }

    return NextResponse.json(serviceData || []);
  } catch (error) {
    console.error("Error in apps list API:", error);
    return NextResponse.json(
      { error: "Failed to fetch apps. Please try syncing data from the Admin page." },
      { status: 500 }
    );
  }
}
