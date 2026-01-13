import { NextResponse } from "next/server";

/**
 * API Route: /api/data
 * Proxies requests to Google Apps Script backend with FRONTEND_KEY authentication
 * Falls back to mock data if environment variables are not configured
 */

// Mock data for development/demo
const mockData = {
  wholeSchool: {
    name: "Whole School",
    apps: [
      {
        product: "Google Workspace",
        website: "https://workspace.google.com",
        renewalDate: "2024-06-15",
        spend: 0,
        dateAdded: "2023-01-01",
        division: "Whole School",
        enterprise: true,
        licenseType: "Site License",
        category: "Productivity",
        audience: "Teachers, Students, Staff, Parents",
        description: "Collaborative productivity suite including Docs, Sheets, Slides, and more.",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "K-12",
      },
      {
        product: "Toddle",
        website: "https://toddleapp.com",
        renewalDate: "2024-08-01",
        spend: 45000,
        dateAdded: "2023-06-15",
        division: "Whole School",
        enterprise: true,
        licenseType: "Enterprise",
        category: "Learning Management",
        audience: "Teachers, Students",
        description: "Collaborative teaching and learning platform for planning, assessment, and communication.",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "K-12",
      },
      {
        product: "Zoom",
        website: "https://zoom.us",
        renewalDate: "2024-04-15",
        spend: 15000,
        dateAdded: "2022-03-01",
        division: "Whole School",
        enterprise: true,
        licenseType: "Enterprise",
        category: "Communication",
        audience: "Teachers, Students, Staff, Parents",
        description: "Video conferencing platform for virtual meetings, classes, and events.",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "K-12",
      },
      {
        product: "Canva for Education",
        website: "https://canva.com/education",
        renewalDate: "2024-09-01",
        spend: 0,
        dateAdded: "2023-10-01",
        division: "Whole School",
        licenseType: "Site License",
        category: "Creative",
        audience: "Teachers, Students",
        description: "Design platform for creating presentations, posters, and visual content.",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "K-12",
      },
      {
        product: "ManageBac",
        website: "https://managebac.com",
        renewalDate: "2024-07-01",
        spend: 28000,
        dateAdded: "2023-05-15",
        division: "Whole School",
        licenseType: "Site License",
        category: "Administration",
        audience: "Teachers, Staff",
        description: "Curriculum planning and reporting platform for IB schools.",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "K-12",
      },
    ],
  },
  elementary: {
    name: "Elementary",
    apps: [
      {
        product: "Seesaw",
        website: "https://web.seesaw.me",
        renewalDate: "2024-05-01",
        spend: 12000,
        dateAdded: "2024-01-05",
        division: "Elementary",
        licenseType: "School License",
        category: "Portfolio",
        audience: "Teachers, Students, Parents",
        description: "Student-driven digital portfolio and parent communication platform.",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "K-5",
      },
      {
        product: "Epic!",
        website: "https://getepic.com",
        renewalDate: "2024-07-15",
        spend: 3500,
        dateAdded: "2023-08-20",
        division: "Elementary",
        licenseType: "Site License",
        category: "Reading",
        audience: "Teachers, Students",
        description: "Digital library with over 40,000 books for children aged 12 and under.",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "K-5",
      },
      {
        product: "Lexia Core5",
        website: "https://lexialearning.com",
        renewalDate: "2024-08-01",
        spend: 9500,
        dateAdded: "2023-09-01",
        division: "Elementary",
        licenseType: "Site License",
        category: "Reading",
        audience: "Teachers, Students",
        description: "Adaptive literacy program for phonics, fluency, and comprehension.",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "K-5",
      },
      {
        product: "Kodable",
        website: "https://kodable.com",
        renewalDate: "2024-06-01",
        spend: 2400,
        dateAdded: "2023-11-01",
        division: "Elementary",
        licenseType: "School License",
        category: "Coding",
        audience: "Teachers, Students",
        description: "Self-directed coding curriculum for elementary students.",
        ssoEnabled: false,
        mobileApp: "Yes",
        gradeLevels: "K-5",
      },
      {
        product: "IXL Math",
        website: "https://ixl.com",
        renewalDate: "2024-04-15",
        spend: 4200,
        dateAdded: "2024-01-01",
        division: "Elementary",
        licenseType: "Individual",
        category: "Math",
        department: "Math",
        audience: "Teachers, Students",
        description: "Personalized math practice with comprehensive skill coverage.",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "K-5",
      },
    ],
  },
  middleSchool: {
    name: "Middle School",
    apps: [
      {
        product: "Desmos",
        website: "https://desmos.com",
        renewalDate: "2024-09-01",
        spend: 0,
        dateAdded: "2023-09-01",
        division: "Middle School",
        licenseType: "Site License",
        category: "Math",
        audience: "Teachers, Students",
        description: "Interactive graphing calculator and math activities for visualization.",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "6-8",
      },
      {
        product: "BrainPOP",
        website: "https://brainpop.com",
        renewalDate: "2024-07-01",
        spend: 8500,
        dateAdded: "2023-08-15",
        division: "Middle School",
        licenseType: "School License",
        category: "Learning",
        audience: "Teachers, Students",
        description: "Animated educational content covering science, math, history, and more.",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "6-8",
      },
      {
        product: "NoRedInk",
        website: "https://noredink.com",
        renewalDate: "2024-06-15",
        spend: 3200,
        dateAdded: "2024-01-10",
        division: "Middle School",
        licenseType: "Site License",
        category: "English",
        audience: "Teachers, Students",
        description: "Adaptive grammar and writing practice platform.",
        ssoEnabled: true,
        mobileApp: "No",
        gradeLevels: "6-8",
      },
      {
        product: "Quizlet",
        website: "https://quizlet.com",
        renewalDate: "2024-03-15",
        spend: 2400,
        dateAdded: "2023-11-15",
        division: "Middle School",
        licenseType: "Individual",
        category: "Study Tools",
        department: "Social Studies",
        audience: "Students",
        description: "Digital flashcards and study games for learning vocabulary and concepts.",
      },
    ],
  },
  highSchool: {
    name: "High School",
    apps: [
      {
        product: "Turnitin",
        website: "https://turnitin.com",
        renewalDate: "2024-02-28",
        spend: 8500,
        dateAdded: "2022-08-01",
        division: "High School",
        licenseType: "Site License",
        category: "Assessment",
        audience: "Teachers, Students",
        description: "Plagiarism detection and writing feedback tool for academic integrity.",
        ssoEnabled: true,
        mobileApp: "No",
        gradeLevels: "9-12",
      },
      {
        product: "Adobe Creative Cloud",
        website: "https://adobe.com",
        renewalDate: "2024-02-15",
        spend: 25000,
        dateAdded: "2023-02-01",
        division: "High School",
        licenseType: "Site License",
        category: "Creative",
        audience: "Teachers, Students",
        description: "Professional creative tools including Photoshop, Illustrator, and Premiere Pro.",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "9-12",
      },
      {
        product: "Naviance",
        website: "https://naviance.com",
        renewalDate: "2024-05-01",
        spend: 12000,
        dateAdded: "2023-03-15",
        division: "High School",
        licenseType: "School License",
        category: "College & Career",
        audience: "Teachers, Students, Parents",
        description: "College and career readiness platform with planning tools and assessments.",
        ssoEnabled: true,
        mobileApp: "Yes",
        gradeLevels: "9-12",
      },
      {
        product: "AP Classroom",
        website: "https://apcentral.collegeboard.org",
        renewalDate: "2024-08-01",
        spend: 0,
        dateAdded: "2023-09-01",
        division: "High School",
        licenseType: "Site License",
        category: "AP Courses",
        audience: "Teachers, Students",
        description: "Official College Board resources for AP course instruction and practice.",
        ssoEnabled: false,
        mobileApp: "No",
        gradeLevels: "10-12",
      },
      {
        product: "GarageBand",
        website: "https://apple.com/garageband",
        renewalDate: "2024-12-01",
        spend: 0,
        dateAdded: "2024-01-05",
        division: "High School",
        licenseType: "Individual",
        category: "Music",
        department: "Arts",
        audience: "Students",
        description: "Music creation studio for recording and mixing audio.",
        mobileApp: "Yes",
      },
    ],
  },
};

export async function GET() {
  const FRONTEND_KEY = process.env.FRONTEND_KEY;
  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

  // If environment variables are not set, return mock data
  if (!FRONTEND_KEY || !APPS_SCRIPT_URL) {
    console.log("Using mock data (env vars not configured)");
    return NextResponse.json(mockData, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
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
      return NextResponse.json(mockData, {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
        },
      });
    }

    if (data.error) {
      console.error("Apps Script error:", data);
      return NextResponse.json(mockData, {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
        },
      });
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Error fetching from Apps Script:", error);
    return NextResponse.json(mockData, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    });
  }
}
