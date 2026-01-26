#!/usr/bin/env node
/**
 * Push local changes back to Google Sheets
 * Usage: node scripts/sheets-push.js [input-file]
 *
 * This script compares local JSON data with the original and pushes
 * only the changed fields back to Google Sheets.
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
  const inputFile = process.argv[2] || "data/apps-local.json";

  if (!APPS_SCRIPT_URL || !FRONTEND_KEY) {
    console.error("Error: Missing APPS_SCRIPT_URL or FRONTEND_KEY in .env.local");
    process.exit(1);
  }

  const inputPath = path.resolve(inputFile);
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found: ${inputPath}`);
    console.error("Run 'npm run sheets:pull' first to get the data.");
    process.exit(1);
  }

  console.log(`Reading local data from: ${inputPath}`);
  const localData = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  // Check for backup file to compare changes
  const backupPath = inputPath.replace(".json", ".backup.json");
  let originalData = null;

  if (fs.existsSync(backupPath)) {
    originalData = JSON.parse(fs.readFileSync(backupPath, "utf8"));
    console.log("Found backup file, comparing changes...");
  } else {
    console.log("No backup file found. All records will be checked.");
    // Create backup for next time
    fs.writeFileSync(backupPath, JSON.stringify(localData, null, 2));
    console.log(`Created backup at: ${backupPath}`);
  }

  // Find changes
  const updates = [];

  localData.forEach((row) => {
    const productId = row.product_id;
    if (!productId) {
      console.warn(`Skipping row without product_id: ${row.product_name || "Unknown"}`);
      return;
    }

    // Find original row if we have backup
    const originalRow = originalData
      ? originalData.find((r) => r.product_id === productId)
      : null;

    // Compare each field
    Object.keys(row).forEach((field) => {
      const newValue = row[field];
      const oldValue = originalRow ? originalRow[field] : undefined;

      // Skip if no change (or if no original to compare)
      if (originalRow && String(newValue) === String(oldValue)) {
        return;
      }

      // Skip if this is a new row (no original) - would need insert logic
      if (!originalRow && originalData) {
        return;
      }

      // Skip certain system fields
      if (["product_id"].includes(field)) {
        return;
      }

      updates.push({
        productId,
        field,
        value: newValue,
      });
    });
  });

  if (updates.length === 0) {
    console.log("No changes detected. Nothing to push.");
    return;
  }

  console.log(`Found ${updates.length} field changes to push.`);

  // Show preview
  console.log("\nChanges to push:");
  updates.slice(0, 10).forEach((u) => {
    console.log(`  - ${u.productId}: ${u.field} = ${u.value}`);
  });
  if (updates.length > 10) {
    console.log(`  ... and ${updates.length - 10} more`);
  }

  // Confirm
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("\nProceed with push? (y/N) ", async (answer) => {
    rl.close();

    if (answer.toLowerCase() !== "y") {
      console.log("Cancelled.");
      return;
    }

    console.log("\nPushing changes to Google Sheets...");

    try {
      // Use bulk update endpoint
      const url = `${APPS_SCRIPT_URL}?api=bulkUpdate&key=${FRONTEND_KEY}&updates=${encodeURIComponent(JSON.stringify(updates))}`;
      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text();
        console.error("Error response:", text);
        process.exit(1);
      }

      const result = await response.json();

      if (result.error) {
        console.error("API Error:", result.error, result.message);
        process.exit(1);
      }

      console.log(`\nSuccess! ${result.successCount} updates applied.`);
      if (result.failCount > 0) {
        console.log(`Warning: ${result.failCount} updates failed.`);
        result.failures?.forEach((f) => {
          console.log(`  - ${f.productId}: ${f.error}`);
        });
      }

      // Update backup with current data
      fs.writeFileSync(backupPath, JSON.stringify(localData, null, 2));
      console.log("Backup updated.");
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });
}

main();
