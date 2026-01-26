#!/usr/bin/env node
/**
 * Pull data from Google Sheets to a local CSV file
 * Usage: node scripts/sheets-pull.js [output-file]
 *
 * This script fetches the current data from Google Sheets and saves it locally
 * for development purposes. You can edit the CSV and push changes back.
 */

const fs = require("fs");
const path = require("path");

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

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const FRONTEND_KEY = process.env.FRONTEND_KEY;

async function main() {
  const outputFile = process.argv[2] || "data/apps-local.csv";

  if (!APPS_SCRIPT_URL || !FRONTEND_KEY) {
    console.error("Error: Missing APPS_SCRIPT_URL or FRONTEND_KEY in .env.local");
    process.exit(1);
  }

  console.log("Fetching data from Google Sheets...");

  try {
    const url = `${APPS_SCRIPT_URL}?api=csv&key=${FRONTEND_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error("Error response:", text);
      process.exit(1);
    }

    const data = await response.json();

    if (data.error) {
      console.error("API Error:", data.error, data.message);
      process.exit(1);
    }

    // Ensure directory exists
    const outputDir = path.dirname(path.resolve(outputFile));
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write CSV file
    const csvPath = path.resolve(outputFile);
    fs.writeFileSync(csvPath, data.csv);
    console.log(`CSV saved to: ${csvPath}`);
    console.log(`Total rows: ${data.rowCount}`);
    console.log(`Columns: ${data.headers.length}`);

    // Also save JSON for easier programmatic access
    const jsonPath = csvPath.replace(".csv", ".json");
    fs.writeFileSync(jsonPath, JSON.stringify(data.data, null, 2));
    console.log(`JSON saved to: ${jsonPath}`);

    console.log("\nDone! You can now edit the local files.");
    console.log("To push changes back, run: npm run sheets:push");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
