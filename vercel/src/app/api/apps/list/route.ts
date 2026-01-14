import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * GET /api/apps/list
 * Get a simple list of apps for dropdown selection
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("apps")
      .select("id, product, vendor, category, division, renewal_date, annual_cost, licenses")
      .neq("status", "retired")
      .order("product", { ascending: true });

    if (error) {
      console.error("Error fetching apps list:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching apps list:", error);
    return NextResponse.json(
      { error: "Failed to fetch apps" },
      { status: 500 }
    );
  }
}
