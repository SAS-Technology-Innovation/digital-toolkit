#!/usr/bin/env node
/**
 * EdTech Impact Excel Import Script
 *
 * Imports product data from EdTech Impact Excel file to update the apps database.
 * This script serves as a template for future Excel imports.
 *
 * Usage:
 *   node scripts/edtech-import.js [options]
 *
 * Options:
 *   --dry-run     Preview changes without writing to database (default)
 *   --apply       Actually apply changes to database
 *   --local       Use local Supabase instance (default anon key)
 *   --file PATH   Path to Excel file (default: ../EdTech Impact.xlsx)
 *   --output PATH Output JSON file for preview (default: data/edtech-import-preview.json)
 *
 * Environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SECRET_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY - Supabase API key
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { createClient } = require("@supabase/supabase-js");

// Load environment variables from .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join("=").trim();
    }
  });
}

// =============================================================================
// FIELD MAPPING CONFIGURATION
// =============================================================================

const FIELD_MAPPING = {
  // Core Product Info
  "Product": "product",
  "Category": "category",
  "Website": "website",
  "Company": "vendor",
  "description": "description",
  "Age": "_age",
  "Department": "department",
  "Budget Owner": "budget",
  "Used By": "_audience",

  // Assessment and Ratings
  "Assessment": "assessment_status",
  "Global Rating": "global_rating",
  "Recommended": "recommended_reason",
  "Risk Rating": "risk_rating",
  "Accessibility": "accessibility",

  // Compliance and Privacy
  "Data Privacy": "privacy_policy_url",
  "Terms": "terms_url",
  "GDPR": "gdpr_url",

  // Support and Training
  "Support": "_support",
  "Training": "_training",

  // Commercial
  "Purchase Models": "_purchase_models",
  "Price from": "price_from",
  "value": "annual_cost",
  "Licences": "licenses",

  // Languages
  "Languages": "_languages",

  // Contract
  "start_date": "contract_start_date",
  "end_date": "contract_end_date",
  "auto_renew": "auto_renew",
  "notice_period": "notice_period",

  // Internal Management
  "Product Champion": "product_champion",
  "Product Manager": "product_manager",
  "Provider Contact": "provider_contact",
  "Finance Contact": "finance_contact",
  "notes": "notes",

  // Alternatives
  "Alternatives": "_alternatives",
};

// =============================================================================
// TRANSFORMATION FUNCTIONS
// =============================================================================

function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    if (typeof value === "string") {
      return value.split(",").map(s => s.trim()).filter(Boolean);
    }
    return [];
  }
}

function transformGradeLevels(ageValue) {
  if (!ageValue) return null;

  const ageArray = parseJsonArray(ageValue);
  if (ageArray.length === 0) return null;

  const grades = new Set();

  for (const range of ageArray) {
    const age = range.toString().toLowerCase();
    const match = age.match(/(\d+)\s*[-+to]\s*(\d+)?/i);
    if (match) {
      const startAge = parseInt(match[1]);
      const endAge = match[2] ? parseInt(match[2]) : 18;

      if (startAge <= 5 || endAge >= 3) { if (startAge <= 4) grades.add("Pre-K"); if (startAge <= 5) grades.add("Kindergarten"); }
      if (startAge <= 6 && endAge >= 6) grades.add("Grade 1");
      if (startAge <= 7 && endAge >= 7) grades.add("Grade 2");
      if (startAge <= 8 && endAge >= 8) grades.add("Grade 3");
      if (startAge <= 9 && endAge >= 9) grades.add("Grade 4");
      if (startAge <= 10 && endAge >= 10) grades.add("Grade 5");
      if (startAge <= 11 && endAge >= 11) grades.add("Grade 6");
      if (startAge <= 12 && endAge >= 12) grades.add("Grade 7");
      if (startAge <= 13 && endAge >= 13) grades.add("Grade 8");
      if (startAge <= 14 && endAge >= 14) grades.add("Grade 9");
      if (startAge <= 15 && endAge >= 15) grades.add("Grade 10");
      if (startAge <= 16 && endAge >= 16) grades.add("Grade 11");
      if (startAge <= 17 && endAge >= 17) grades.add("Grade 12");
    }
  }

  return grades.size > 0 ? Array.from(grades).join(", ") : null;
}

function transformAudience(usedBy) {
  if (!usedBy) return null;

  const audiences = [];
  const lower = usedBy.toString().toLowerCase();

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

function parseDate(dateStr) {
  if (!dateStr) return null;

  if (typeof dateStr === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + dateStr * 86400000);
    return date.toISOString().split("T")[0];
  }

  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0];
  }

  return null;
}

function cleanHtml(html) {
  if (!html) return null;
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function generateProductId(name) {
  if (!name) return null;
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// =============================================================================
// MAIN TRANSFORM FUNCTION
// =============================================================================

function transformRow(row) {
  const transformed = {};

  for (const [excelCol, dbField] of Object.entries(FIELD_MAPPING)) {
    if (!dbField) continue;

    const value = row[excelCol];

    if (dbField.startsWith("_")) continue;

    switch (dbField) {
      case "global_rating":
        transformed[dbField] = value ? parseFloat(value) : null;
        break;
      case "annual_cost":
      case "licenses":
        transformed[dbField] = value ? parseInt(value) : null;
        break;
      case "auto_renew":
        transformed[dbField] = value === true || value === "true" || value === "Yes";
        break;
      case "contract_start_date":
      case "contract_end_date":
        transformed[dbField] = parseDate(value);
        break;
      case "recommended_reason":
        transformed[dbField] = cleanHtml(value);
        break;
      case "assessment_status":
        transformed[dbField] = value ? value.toString().toUpperCase().replace(" ", "_") : null;
        break;
      default:
        transformed[dbField] = value || null;
    }
  }

  // Process special fields
  transformed.grade_levels = transformGradeLevels(row["Age"]);
  transformed.audience = transformAudience(row["Used By"]);
  transformed.languages = parseJsonArray(row["Languages"]);
  transformed.support_options = parseJsonArray(row["Support"]);
  transformed.training_options = parseJsonArray(row["Training"]);
  transformed.purchase_models = parseJsonArray(row["Purchase Models"]);
  transformed.alternatives = parseJsonArray(row["Alternatives"]);

  // Generate product_id for matching
  if (transformed.product) {
    transformed.product_id = generateProductId(transformed.product);
  }

  // Add sync timestamp
  transformed.last_edtech_sync = new Date().toISOString();

  return transformed;
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

async function applyToDatabase(transformed, useLocal = false) {
  let supabaseUrl, supabaseKey;

  if (useLocal) {
    // Use local Supabase instance
    supabaseUrl = "http://127.0.0.1:54321";
    // Default local anon key (from supabase start output)
    supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
    console.log("Using local Supabase instance...");
  } else {
    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials. Use --local for local instance or set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Fetching existing apps from database...");

  // Get all existing apps
  const { data: existingApps, error: fetchError } = await supabase
    .from("apps")
    .select("id, product, product_id");

  if (fetchError) {
    throw new Error(`Failed to fetch existing apps: ${fetchError.message}`);
  }

  console.log(`Found ${existingApps.length} existing apps in database`);

  // Create lookup map by product_id and product name
  const appsByProductId = new Map();
  const appsByName = new Map();

  for (const app of existingApps) {
    if (app.product_id) {
      appsByProductId.set(app.product_id.toLowerCase(), app);
    }
    if (app.product) {
      appsByName.set(app.product.toLowerCase(), app);
    }
  }

  const stats = {
    updated: 0,
    notFound: 0,
    errors: 0,
    skipped: 0,
  };

  const notFoundProducts = [];
  const updatedProducts = [];
  const errorProducts = [];

  console.log("\nProcessing updates...");

  for (const item of transformed) {
    if (!item.product) {
      stats.skipped++;
      continue;
    }

    // Try to find existing app by product_id first, then by name
    let existingApp = appsByProductId.get(item.product_id);
    if (!existingApp) {
      existingApp = appsByName.get(item.product.toLowerCase());
    }

    if (!existingApp) {
      stats.notFound++;
      notFoundProducts.push(item.product);
      continue;
    }

    // Prepare update data - only include EdTech Impact fields
    const updateData = {
      // Assessment
      assessment_status: item.assessment_status,
      global_rating: item.global_rating,
      recommended_reason: item.recommended_reason,

      // Compliance
      privacy_policy_url: item.privacy_policy_url,
      terms_url: item.terms_url,
      gdpr_url: item.gdpr_url,
      risk_rating: item.risk_rating,

      // Accessibility
      accessibility: item.accessibility,
      languages: item.languages,

      // Support
      support_options: item.support_options,
      training_options: item.training_options,

      // Commercial
      purchase_models: item.purchase_models,
      price_from: item.price_from,
      alternatives: item.alternatives,

      // Contract (only if provided)
      ...(item.contract_start_date && { contract_start_date: item.contract_start_date }),
      ...(item.contract_end_date && { contract_end_date: item.contract_end_date }),
      ...(item.auto_renew !== undefined && { auto_renew: item.auto_renew }),
      ...(item.notice_period && { notice_period: item.notice_period }),

      // Internal
      ...(item.product_champion && { product_champion: item.product_champion }),
      ...(item.product_manager && { product_manager: item.product_manager }),
      ...(item.provider_contact && { provider_contact: item.provider_contact }),
      ...(item.finance_contact && { finance_contact: item.finance_contact }),

      // Also update some core fields if provided and different
      ...(item.category && { category: item.category }),
      ...(item.vendor && { vendor: item.vendor }),
      ...(item.website && { website: item.website }),
      ...(item.grade_levels && { grade_levels: item.grade_levels }),
      ...(item.audience && { audience: item.audience }),
      ...(item.department && { department: item.department }),
      ...(item.budget && { budget: item.budget }),
      ...(item.annual_cost && { annual_cost: item.annual_cost }),
      ...(item.licenses && { licenses: item.licenses }),

      // Sync metadata
      last_edtech_sync: item.last_edtech_sync,
      updated_at: new Date().toISOString(),
    };

    // Remove null/undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === null || updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { error: updateError } = await supabase
      .from("apps")
      .update(updateData)
      .eq("id", existingApp.id);

    if (updateError) {
      stats.errors++;
      errorProducts.push({ product: item.product, error: updateError.message });
    } else {
      stats.updated++;
      updatedProducts.push(item.product);
    }
  }

  return { stats, notFoundProducts, updatedProducts, errorProducts };
}

// =============================================================================
// REPORTING
// =============================================================================

function generateReport(data, transformed) {
  const report = {
    summary: {
      totalProducts: data.length,
      importedAt: new Date().toISOString(),
      sourceFile: "EdTech Impact.xlsx",
    },
    byAssessment: {},
    byCategory: {},
    products: [],
  };

  for (let i = 0; i < transformed.length; i++) {
    const mapped = transformed[i];

    const assessment = mapped.assessment_status || "Unknown";
    report.byAssessment[assessment] = (report.byAssessment[assessment] || 0) + 1;

    const category = mapped.category || "Uncategorized";
    report.byCategory[category] = (report.byCategory[category] || 0) + 1;

    report.products.push({
      product: mapped.product,
      product_id: mapped.product_id,
      assessment: mapped.assessment_status,
      category: mapped.category,
      vendor: mapped.vendor,
      website: mapped.website,
      global_rating: mapped.global_rating,
      grade_levels: mapped.grade_levels,
      languages: mapped.languages?.length || 0,
      has_privacy_policy: !!mapped.privacy_policy_url,
      has_alternatives: mapped.alternatives?.length > 0,
    });
  }

  return report;
}

// =============================================================================
// MAIN
// =============================================================================

async function readExcelFile(filePath) {
  console.log(`Reading Excel file: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: null });

  console.log(`Found ${data.length} products in sheet "${sheetName}"`);

  return data;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--apply");
  const useLocal = args.includes("--local");
  const fileIndex = args.indexOf("--file");
  const outputIndex = args.indexOf("--output");

  const defaultExcelPath = path.join(__dirname, "..", "..", "EdTech Impact.xlsx");
  const excelPath = fileIndex !== -1 ? args[fileIndex + 1] : defaultExcelPath;
  const outputPath = outputIndex !== -1
    ? args[outputIndex + 1]
    : path.join(__dirname, "..", "data", "edtech-import-preview.json");

  console.log("=".repeat(60));
  console.log("EdTech Impact Import Script");
  console.log("=".repeat(60));
  console.log(`Mode: ${dryRun ? "DRY RUN (preview only)" : "APPLY CHANGES"}`);
  console.log(`Database: ${useLocal ? "LOCAL (http://127.0.0.1:54321)" : "CLOUD (from env)"}`);
  console.log(`Excel file: ${excelPath}`);
  console.log(`Output file: ${outputPath}`);
  console.log("");

  try {
    const data = await readExcelFile(excelPath);

    console.log("\nTransforming data...");
    const transformed = data.map(transformRow);

    console.log("Generating report...\n");
    const report = generateReport(data, transformed);

    // Print summary
    console.log("=".repeat(60));
    console.log("IMPORT SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total products: ${report.summary.totalProducts}`);
    console.log("");

    console.log("By Assessment Status:");
    for (const [status, count] of Object.entries(report.byAssessment).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${status}: ${count}`);
    }
    console.log("");

    console.log("By Category (top 10):");
    const topCategories = Object.entries(report.byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    for (const [cat, count] of topCategories) {
      console.log(`  ${cat}: ${count}`);
    }
    console.log("");

    // Sample products
    console.log("Sample Products (first 5):");
    console.log("-".repeat(60));
    for (const item of report.products.slice(0, 5)) {
      console.log(`  ${item.product}`);
      console.log(`    Assessment: ${item.assessment}`);
      console.log(`    Category: ${item.category}`);
      console.log(`    Rating: ${item.global_rating || "N/A"}`);
      console.log(`    Vendor: ${item.vendor}`);
      console.log(`    Product ID: ${item.product_id}`);
      console.log("");
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save report
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`Report saved to: ${outputPath}`);

    // Save transformed data
    const transformedPath = outputPath.replace("-preview.json", "-data.json");
    fs.writeFileSync(transformedPath, JSON.stringify(transformed, null, 2));
    console.log(`Transformed data saved to: ${transformedPath}`);

    if (dryRun) {
      console.log("\n" + "=".repeat(60));
      console.log("DRY RUN COMPLETE - No changes applied");
      console.log("To apply changes to the database, run:");
      console.log("  npm run edtech:import:apply");
      console.log("=".repeat(60));
    } else {
      console.log("\n" + "=".repeat(60));
      console.log("APPLYING CHANGES TO DATABASE...");
      console.log("=".repeat(60));

      const result = await applyToDatabase(transformed, useLocal);

      console.log("\n" + "=".repeat(60));
      console.log("DATABASE UPDATE COMPLETE");
      console.log("=".repeat(60));
      console.log(`Updated: ${result.stats.updated}`);
      console.log(`Not found in DB: ${result.stats.notFound}`);
      console.log(`Errors: ${result.stats.errors}`);
      console.log(`Skipped: ${result.stats.skipped}`);

      if (result.notFoundProducts.length > 0) {
        console.log("\nProducts not found in database:");
        for (const name of result.notFoundProducts.slice(0, 20)) {
          console.log(`  - ${name}`);
        }
        if (result.notFoundProducts.length > 20) {
          console.log(`  ... and ${result.notFoundProducts.length - 20} more`);
        }
      }

      if (result.errorProducts.length > 0) {
        console.log("\nProducts with errors:");
        for (const { product, error } of result.errorProducts) {
          console.log(`  - ${product}: ${error}`);
        }
      }

      // Save results
      const resultsPath = outputPath.replace("-preview.json", "-results.json");
      fs.writeFileSync(resultsPath, JSON.stringify(result, null, 2));
      console.log(`\nResults saved to: ${resultsPath}`);
    }

  } catch (error) {
    console.error("\nError:", error.message);
    process.exit(1);
  }
}

main();
