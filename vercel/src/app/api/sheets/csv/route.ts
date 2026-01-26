import { NextResponse } from "next/server";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const FRONTEND_KEY = process.env.FRONTEND_KEY;

/**
 * GET - Download CSV data from Google Sheets
 * Returns the raw CSV data and JSON array for local development
 */
export async function GET(request: Request) {
  try {
    if (!APPS_SCRIPT_URL || !FRONTEND_KEY) {
      return NextResponse.json(
        { error: "Server configuration missing" },
        { status: 500 }
      );
    }

    // Check for download format
    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "json";

    // Call Apps Script CSV endpoint
    const response = await fetch(
      `${APPS_SCRIPT_URL}?api=csv&key=${FRONTEND_KEY}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Apps Script error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch data from Google Sheets", details: errorText },
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

    // Return as downloadable CSV file
    if (format === "csv") {
      return new NextResponse(data.csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="apps-data-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Return JSON response
    return NextResponse.json({
      success: true,
      headers: data.headers,
      rowCount: data.rowCount,
      data: data.data,
      csv: data.csv,
    });
  } catch (error) {
    console.error("Error fetching CSV:", error);
    return NextResponse.json(
      { error: "Failed to fetch CSV data", details: String(error) },
      { status: 500 }
    );
  }
}
