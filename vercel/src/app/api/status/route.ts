import { NextResponse } from "next/server";

/**
 * API Route: /api/status
 * Returns application status data
 * In production, this would connect to a monitoring service or database
 * For now, returns mock data for development/demo
 */

// Mock data for development/demo
const mockStatusData = {
  statuses: {
    "Google Workspace": 1,
    "Canvas LMS": 1,
    Zoom: 1,
    Seesaw: 1,
    "Epic!": 1,
    Desmos: 1,
    Quizlet: 1,
    Turnitin: 0, // Simulating an issue
    "Adobe Creative Cloud": 1,
  },
  summary: {
    total: 9,
    up: 8,
    down: 1,
    uptime: 98.5,
    avgResponseTime: 245,
  },
  lastChecked: new Date().toISOString(),
};

export async function GET() {
  try {
    // In production, you could:
    // 1. Fetch from Vercel Edge Config (requires @vercel/edge-config package)
    // 2. Query a database
    // 3. Call an external monitoring API

    // For now, return mock data
    return NextResponse.json(mockStatusData, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching status data:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch status data",
        statuses: {},
        summary: {
          total: 0,
          up: 0,
          down: 0,
          uptime: 0,
          avgResponseTime: 0,
        },
        lastChecked: null,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
