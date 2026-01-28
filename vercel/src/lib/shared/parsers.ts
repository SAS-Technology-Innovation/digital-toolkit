/**
 * SAS Digital Toolkit - Shared Parsers
 *
 * Centralized parsing functions for JSON, dates, arrays, booleans, and numbers.
 * This is the single source of truth for all parsing logic across the codebase.
 *
 * Replaces:
 * - Apps Script: parseJsonField() in Code.js
 * - Vercel sync: parseJsonArray() in route.ts
 * - EdTech import: parseJsonArray() in edtech-import.js
 * - Inline parseBoolean, parseNumber functions
 */

import {
  DIVISION_PATTERNS,
  WHOLE_SCHOOL_LICENSE_PATTERNS,
  GRADE_TO_AGE,
  type EducationalLevel,
} from "./constants";

// =============================================================================
// JSON ARRAY PARSING
// =============================================================================

/**
 * Parses a value into a string array. Handles:
 * - Already an array: returns as-is
 * - JSON string: parses and returns if array
 * - Comma-separated string: splits and trims
 * - Empty/null: returns empty array
 *
 * @param value - The value to parse
 * @returns Parsed string array
 */
export function parseJsonArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);

  if (typeof value === "string") {
    // Try parsing as JSON first
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      // Not valid JSON, try splitting by comma
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  return [];
}

/**
 * Converts an array to JSON string for storage in Google Sheets
 *
 * @param arr - The array to convert
 * @returns JSON string or null if empty
 */
export function arrayToJsonString(arr: unknown[] | null | undefined): string | null {
  if (!arr || arr.length === 0) return null;
  return JSON.stringify(arr);
}

// =============================================================================
// BOOLEAN PARSING
// =============================================================================

/**
 * Parses various boolean representations to actual boolean.
 * Handles: true/false, "true"/"false", "Yes"/"No", 1/0
 *
 * @param value - The value to parse
 * @returns Boolean value
 */
export function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const lower = value.toLowerCase().trim();
    return lower === "true" || lower === "yes" || lower === "1";
  }
  return false;
}

// =============================================================================
// NUMBER PARSING
// =============================================================================

/**
 * Parses various number representations to actual number.
 * Handles: numbers, strings with currency/commas, "Free" (returns 0)
 *
 * @param value - The value to parse
 * @returns Number or null if invalid
 */
export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  // Handle "Free" as 0
  if (typeof value === "string" && value.toLowerCase() === "free") return 0;

  // Handle numbers directly
  if (typeof value === "number") return isNaN(value) ? null : value;

  // Parse string, removing currency symbols and commas
  if (typeof value === "string") {
    const cleaned = value.replace(/[,$€£¥]/g, "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  return null;
}

/**
 * Parses value to integer
 *
 * @param value - The value to parse
 * @returns Integer or null if invalid
 */
export function parseInteger(value: unknown): number | null {
  const num = parseNumber(value);
  return num !== null ? Math.round(num) : null;
}

// =============================================================================
// DATE PARSING
// =============================================================================

/**
 * Parses various date formats to ISO date string (YYYY-MM-DD).
 * Handles: Date objects, ISO strings, Excel serial numbers, common date formats
 *
 * @param value - The value to parse
 * @returns ISO date string (YYYY-MM-DD) or null if invalid
 */
export function parseDate(value: unknown): string | null {
  if (!value) return null;

  // Handle Excel serial number (days since 1899-12-30)
  if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
    return null;
  }

  // Handle Date object
  if (value instanceof Date) {
    if (!isNaN(value.getTime())) {
      return value.toISOString().split("T")[0];
    }
    return null;
  }

  // Handle string
  if (typeof value === "string") {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  }

  return null;
}

/**
 * Parses value to full ISO timestamp string
 *
 * @param value - The value to parse
 * @returns ISO timestamp string or null if invalid
 */
export function parseTimestamp(value: unknown): string | null {
  if (!value) return null;

  // Handle Date object
  if (value instanceof Date) {
    if (!isNaN(value.getTime())) {
      return value.toISOString();
    }
    return null;
  }

  // Handle string
  if (typeof value === "string") {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return null;
}

// =============================================================================
// DIVISION PARSING
// =============================================================================

/**
 * Detects which divisions are present in a division string.
 *
 * @param divisionString - The division string to parse (e.g., "SAS Elementary School, SAS Middle School")
 * @returns Object with es, ms, hs booleans
 */
export function parseDivisions(divisionString: string | null | undefined): {
  es: boolean;
  ms: boolean;
  hs: boolean;
} {
  const result = { es: false, ms: false, hs: false };

  if (!divisionString) return result;

  const lower = divisionString.toLowerCase();

  // Check elementary patterns
  result.es = DIVISION_PATTERNS.elementary.some((pattern) =>
    lower.includes(pattern)
  );

  // Check middle patterns
  result.ms = DIVISION_PATTERNS.middle.some((pattern) =>
    lower.includes(pattern)
  );

  // Check high patterns
  result.hs = DIVISION_PATTERNS.high.some((pattern) =>
    lower.includes(pattern)
  );

  return result;
}

/**
 * Determines if an app should be categorized as "Whole School"
 * based on license type, department, division, and grade coverage.
 *
 * Rules:
 * - Site/School/Enterprise/Unlimited licenses → Whole School
 * - School Operations department → Whole School
 * - Apps in all 3 divisions (ES + MS + HS) → Whole School
 * - "Whole School" explicitly in division → Whole School
 *
 * @param licenseType - The license type string
 * @param department - The department string
 * @param division - The division string
 * @param divisionsPresent - Optional pre-parsed division object
 * @returns True if the app is effectively whole school
 */
export function isWholeSchool(
  licenseType: string | null | undefined,
  department: string | null | undefined,
  division: string | null | undefined,
  divisionsPresent?: { es: boolean; ms: boolean; hs: boolean }
): boolean {
  const type = (licenseType || "").toLowerCase();
  const dept = (department || "").toLowerCase();
  const div = (division || "").toLowerCase();

  // Check license type patterns
  const isWholeSchoolLicense = WHOLE_SCHOOL_LICENSE_PATTERNS.some((pattern) =>
    type.includes(pattern)
  );

  // Check department
  const isSchoolOperations =
    dept.includes("school operations") || dept === "school-wide";

  // Check division string for whole school patterns
  const hasWholeSchoolDivision = DIVISION_PATTERNS.wholeSchool.some((pattern) =>
    div.includes(pattern)
  );

  // Check if in all three divisions
  const divisions = divisionsPresent || parseDivisions(division);
  const inAllDivisions = divisions.es && divisions.ms && divisions.hs;

  return isWholeSchoolLicense || isSchoolOperations || hasWholeSchoolDivision || inAllDivisions;
}

// =============================================================================
// GRADE LEVEL PARSING
// =============================================================================

/**
 * Transforms age range values to grade levels.
 * Used for EdTech Impact imports where age ranges are provided.
 *
 * @param ageValue - Age range string or array (e.g., "5-12", ["4-8", "9-12"])
 * @returns Comma-separated grade levels or null
 */
export function ageToGradeLevels(ageValue: unknown): string | null {
  if (!ageValue) return null;

  const ageArray = parseJsonArray(ageValue);
  if (ageArray.length === 0) return null;

  const grades = new Set<EducationalLevel>();

  for (const range of ageArray) {
    const age = range.toString().toLowerCase();

    // Match patterns like "5-12", "5 to 12", "5+", etc.
    const match = age.match(/(\d+)\s*[-+to]\s*(\d+)?/i);
    if (match) {
      const startAge = parseInt(match[1]);
      const endAge = match[2] ? parseInt(match[2]) : 18;

      // Map ages to grade levels
      for (const [grade, gradeAge] of Object.entries(GRADE_TO_AGE)) {
        if (gradeAge >= startAge && gradeAge <= endAge) {
          grades.add(grade as EducationalLevel);
        }
      }
    }
  }

  return grades.size > 0 ? Array.from(grades).join(", ") : null;
}

/**
 * Parses grade level string to array of grade levels
 *
 * @param gradeLevels - Grade levels string (e.g., "Grade 6, Grade 7, Grade 8")
 * @returns Array of grade levels
 */
export function parseGradeLevels(gradeLevels: string | null | undefined): string[] {
  if (!gradeLevels) return [];

  return gradeLevels
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
}

// =============================================================================
// AUDIENCE PARSING
// =============================================================================

/**
 * Transforms "Used By" field to standard audience array.
 *
 * @param usedBy - Used by string (e.g., "Teachers, Students")
 * @returns Array of standard audience values
 */
export function parseAudience(usedBy: unknown): string[] | null {
  if (!usedBy) return null;

  const audiences: string[] = [];
  const lower = String(usedBy).toLowerCase();

  if (lower.includes("teacher") || lower.includes("faculty") || lower.includes("educator")) {
    audiences.push("Teachers");
  }
  if (lower.includes("student") || lower.includes("learner") || lower.includes("pupil")) {
    audiences.push("Students");
  }
  if (lower.includes("parent") || lower.includes("guardian") || lower.includes("family")) {
    audiences.push("Parents");
  }
  if (lower.includes("staff") || lower.includes("admin") || lower.includes("employee")) {
    audiences.push("Staff");
  }

  return audiences.length > 0 ? audiences : null;
}

// =============================================================================
// TEXT CLEANING
// =============================================================================

/**
 * Cleans HTML from a string, converting to plain text.
 *
 * @param html - HTML string to clean
 * @returns Plain text string
 */
export function cleanHtml(html: string | null | undefined): string | null {
  if (!html) return null;

  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Convert non-breaking spaces
    .replace(/&amp;/g, "&") // Convert ampersands
    .replace(/&lt;/g, "<") // Convert less than
    .replace(/&gt;/g, ">") // Convert greater than
    .replace(/&quot;/g, '"') // Convert quotes
    .replace(/&#39;/g, "'") // Convert apostrophes
    .trim();
}

// =============================================================================
// IDENTIFIER GENERATION
// =============================================================================

/**
 * Generates a URL-safe slug identifier from a product name.
 *
 * @param name - The product name
 * @returns Slug identifier (e.g., "adobe-creative-cloud")
 */
export function generateIdentifier(name: string | null | undefined): string | null {
  if (!name) return null;

  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dash
    .replace(/^-|-$/g, ""); // Remove leading/trailing dashes
}
