import { NextResponse } from "next/server";

/**
 * API Route: /api/renewal-data
 * Fetches app renewal data from Google Apps Script
 * Falls back to mock data if environment variables are not configured
 */

// Mock data for development/demo
const mockRenewalData = {
  apps: [
    {
      id: "1",
      product: "Adobe Creative Cloud",
      vendor: "Adobe",
      category: "Creative",
      renewalDate: "2024-02-15",
      annualCost: 25000,
      licenses: 150,
      licenseType: "Site License",
      status: "urgent",
      division: "Whole School",
      utilization: 85,
    },
    {
      id: "2",
      product: "Canva for Education",
      vendor: "Canva",
      category: "Creative",
      renewalDate: "2024-03-01",
      annualCost: 0,
      licenses: 500,
      licenseType: "Free",
      status: "upcoming",
      division: "Whole School",
      utilization: 92,
    },
    {
      id: "3",
      product: "Zoom Education",
      vendor: "Zoom",
      category: "Communication",
      renewalDate: "2024-04-15",
      annualCost: 15000,
      licenses: 200,
      licenseType: "Enterprise",
      status: "active",
      division: "Whole School",
      utilization: 78,
    },
    {
      id: "4",
      product: "Turnitin",
      vendor: "Turnitin",
      category: "Assessment",
      renewalDate: "2024-01-30",
      annualCost: 8500,
      licenses: 100,
      licenseType: "Per User",
      status: "overdue",
      division: "High School",
      utilization: 65,
    },
    {
      id: "5",
      product: "Seesaw",
      vendor: "Seesaw Learning",
      category: "Portfolio",
      renewalDate: "2024-05-01",
      annualCost: 12000,
      licenses: 300,
      licenseType: "School License",
      status: "active",
      division: "Elementary",
      utilization: 95,
    },
    {
      id: "6",
      product: "Canvas LMS",
      vendor: "Instructure",
      category: "Learning Management",
      renewalDate: "2024-08-01",
      annualCost: 45000,
      licenses: 2000,
      licenseType: "Enterprise",
      status: "active",
      division: "Whole School",
      utilization: 88,
    },
    {
      id: "7",
      product: "Epic!",
      vendor: "Epic Creations",
      category: "Reading",
      renewalDate: "2024-07-15",
      annualCost: 3500,
      licenses: 400,
      licenseType: "Site License",
      status: "active",
      division: "Elementary",
      utilization: 72,
    },
    {
      id: "8",
      product: "Quizlet",
      vendor: "Quizlet Inc",
      category: "Study Tools",
      renewalDate: "2024-03-15",
      annualCost: 2400,
      licenses: 150,
      licenseType: "Individual",
      status: "upcoming",
      division: "Middle School",
      utilization: 58,
    },
  ],
  summary: {
    totalApps: 8,
    totalAnnualCost: 111400,
    urgentCount: 2,
    avgUtilization: 79,
  },
};

export async function GET() {
  const FRONTEND_KEY = process.env.FRONTEND_KEY;
  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

  // If environment variables are not set, return mock data
  if (!FRONTEND_KEY || !APPS_SCRIPT_URL) {
    console.log("Using mock renewal data (env vars not configured)");
    return NextResponse.json(mockRenewalData, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
        "X-Data-Source": "mock",
      },
    });
  }

  try {
    // Build the Apps Script API URL
    const apiUrl = `${APPS_SCRIPT_URL}?api=data&key=${encodeURIComponent(FRONTEND_KEY)}`;

    // Fetch data from Apps Script
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    const responseText = await response.text();

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse response as JSON");
      return NextResponse.json(mockRenewalData, {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
          "X-Data-Source": "mock-fallback",
        },
      });
    }

    if (data.error) {
      console.error("Apps Script error:", data);
      return NextResponse.json(mockRenewalData, {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
          "X-Data-Source": "mock-fallback",
        },
      });
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
        "X-Data-Source": "apps-script",
      },
    });
  } catch (error) {
    console.error("Error fetching renewal data:", error);
    return NextResponse.json(mockRenewalData, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
        "X-Data-Source": "mock-error-fallback",
      },
    });
  }
}
