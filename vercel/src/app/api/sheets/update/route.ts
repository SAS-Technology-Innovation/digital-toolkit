import { NextResponse } from "next/server";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const FRONTEND_KEY = process.env.FRONTEND_KEY;

interface UpdateRequest {
  productId: string;
  field: string;
  value: string | number | boolean;
}

interface BulkUpdateRequest {
  updates: UpdateRequest[];
}

/**
 * POST - Update a single field in Google Sheets
 * Body: { productId: string, field: string, value: any }
 */
export async function POST(request: Request) {
  try {
    if (!APPS_SCRIPT_URL || !FRONTEND_KEY) {
      return NextResponse.json(
        { error: "Server configuration missing" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { productId, field, value } = body as UpdateRequest;

    if (!productId || !field) {
      return NextResponse.json(
        { error: "productId and field are required" },
        { status: 400 }
      );
    }

    // Call Apps Script update endpoint
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.set("api", "update");
    url.searchParams.set("key", FRONTEND_KEY);
    url.searchParams.set("productId", productId);
    url.searchParams.set("field", field);
    url.searchParams.set("value", String(value));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Apps Script error:", errorText);
      return NextResponse.json(
        { error: "Failed to update Google Sheets", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error, message: data.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating field:", error);
    return NextResponse.json(
      { error: "Failed to update field", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * PUT - Bulk update multiple fields in Google Sheets
 * Body: { updates: [{ productId, field, value }, ...] }
 */
export async function PUT(request: Request) {
  try {
    if (!APPS_SCRIPT_URL || !FRONTEND_KEY) {
      return NextResponse.json(
        { error: "Server configuration missing" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { updates } = body as BulkUpdateRequest;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "updates array is required" },
        { status: 400 }
      );
    }

    // Call Apps Script bulkUpdate endpoint
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.set("api", "bulkUpdate");
    url.searchParams.set("key", FRONTEND_KEY);
    url.searchParams.set("updates", JSON.stringify(updates));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Apps Script error:", errorText);
      return NextResponse.json(
        { error: "Failed to bulk update Google Sheets", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error, message: data.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error bulk updating:", error);
    return NextResponse.json(
      { error: "Failed to bulk update", details: String(error) },
      { status: 500 }
    );
  }
}
