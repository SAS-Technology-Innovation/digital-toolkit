import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;

interface DuplicateGroup {
  product: string;
  count: number;
  ids: string[];
  keep_id: string;
  remove_ids: string[];
}

// GET - Check for duplicates
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all apps grouped by product name
    const { data: apps, error } = await supabase
      .from("apps")
      .select("id, product, created_at")
      .order("product")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching apps:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by product name and find duplicates
    const productGroups = new Map<string, { id: string; created_at: string }[]>();

    for (const app of apps || []) {
      const product = app.product?.toLowerCase().trim() || "";
      if (!product) continue;

      if (!productGroups.has(product)) {
        productGroups.set(product, []);
      }
      productGroups.get(product)!.push({ id: app.id, created_at: app.created_at });
    }

    // Find groups with duplicates
    const duplicates: DuplicateGroup[] = [];
    let totalDuplicates = 0;

    for (const [product, items] of productGroups) {
      if (items.length > 1) {
        // Sort by created_at to keep the oldest
        items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        const keepId = items[0].id;
        const removeIds = items.slice(1).map(item => item.id);

        duplicates.push({
          product,
          count: items.length,
          ids: items.map(item => item.id),
          keep_id: keepId,
          remove_ids: removeIds,
        });

        totalDuplicates += removeIds.length;
      }
    }

    return NextResponse.json({
      totalApps: apps?.length || 0,
      duplicateGroups: duplicates.length,
      totalDuplicates,
      duplicates: duplicates.slice(0, 100), // Limit to 100 groups for display
    });
  } catch (error) {
    console.error("Error checking duplicates:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST - Remove duplicates
export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all apps grouped by product name
    const { data: apps, error: fetchError } = await supabase
      .from("apps")
      .select("id, product, created_at")
      .order("product")
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Error fetching apps:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Group by product name
    const productGroups = new Map<string, { id: string; created_at: string }[]>();

    for (const app of apps || []) {
      const product = app.product?.toLowerCase().trim() || "";
      if (!product) continue;

      if (!productGroups.has(product)) {
        productGroups.set(product, []);
      }
      productGroups.get(product)!.push({ id: app.id, created_at: app.created_at });
    }

    // Collect IDs to delete (keeping the oldest for each product)
    const idsToDelete: string[] = [];

    for (const [, items] of productGroups) {
      if (items.length > 1) {
        // Sort by created_at to keep the oldest
        items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        // Add all but the first (oldest) to delete list
        for (let i = 1; i < items.length; i++) {
          idsToDelete.push(items[i].id);
        }
      }
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No duplicates found",
        deleted: 0,
        remaining: apps?.length || 0,
      });
    }

    // Delete duplicates in batches of 100
    let deleted = 0;
    const batchSize = 100;

    for (let i = 0; i < idsToDelete.length; i += batchSize) {
      const batch = idsToDelete.slice(i, i + batchSize);

      const { error: deleteError } = await supabase
        .from("apps")
        .delete()
        .in("id", batch);

      if (deleteError) {
        console.error("Error deleting batch:", deleteError);
        return NextResponse.json(
          {
            error: deleteError.message,
            partialDelete: true,
            deleted,
            remaining: (apps?.length || 0) - deleted,
          },
          { status: 500 }
        );
      }

      deleted += batch.length;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully removed ${deleted} duplicate apps`,
      deleted,
      remaining: (apps?.length || 0) - deleted,
    });
  } catch (error) {
    console.error("Error removing duplicates:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
