#!/usr/bin/env node
/**
 * Sync product_ids from Apps Script to Supabase
 */

const fs = require("fs");
const path = require("path");
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

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const FRONTEND_KEY = process.env.FRONTEND_KEY;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function syncFromAppsScript() {
  console.log("Fetching from Apps Script...");
  const res = await fetch(`${APPS_SCRIPT_URL}?api=data&key=${FRONTEND_KEY}`);
  const data = await res.json();

  // Extract apps from division-based structure
  const divisions = ["wholeSchool", "elementary", "middleSchool", "highSchool"];
  const allApps = [];

  for (const div of divisions) {
    if (data[div]?.apps) {
      allApps.push(...data[div].apps);
    }
  }

  // Deduplicate by product name
  const uniqueApps = new Map();
  for (const app of allApps) {
    if (!uniqueApps.has(app.product)) {
      uniqueApps.set(app.product, app);
    }
  }

  const apps = [...uniqueApps.values()];
  console.log(`Found ${apps.length} unique apps`);

  // Check for productId
  const withId = apps.filter((a) => a.productId);
  console.log(`Apps with productId: ${withId.length}`);

  if (withId.length > 0) {
    console.log("Sample productIds:");
    withId.slice(0, 5).forEach((a) => console.log(`  ${a.productId}: ${a.product}`));
  }

  // Sync to Supabase
  console.log("\nSyncing to Supabase...");
  let updated = 0;
  let errors = 0;

  for (const app of apps) {
    const productId = app.productId || null;

    // Find existing app by name and update product_id
    const { data: existing } = await supabase
      .from("apps")
      .select("id")
      .eq("product", app.product)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("apps")
        .update({
          product_id: productId,
          synced_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        errors++;
        console.error(`Error updating ${app.product}: ${error.message}`);
      } else {
        updated++;
      }
    }
  }

  console.log(`\nUpdated: ${updated}`);
  console.log(`Errors: ${errors}`);

  // Verify
  const { data: sample } = await supabase
    .from("apps")
    .select("product_id, product")
    .not("product_id", "is", null)
    .order("product_id", { ascending: true })
    .limit(5);

  console.log("\nSample from Supabase:");
  sample.forEach((a) => console.log(`  ${a.product_id}: ${a.product}`));
}

syncFromAppsScript().catch(console.error);
