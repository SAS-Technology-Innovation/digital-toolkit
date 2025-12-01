#!/usr/bin/env node
/**
 * Build script to generate Vercel-compatible versions of the dashboard HTML files.
 *
 * This script:
 * 1. Reads the original index.html and signage.html files
 * 2. Modifies the loadData() function to use Vercel API endpoints
 * 3. Modifies the AI query function to use Vercel API endpoints
 * 4. Writes the modified files to the public/ directory
 *
 * Usage: node scripts/build-vercel.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

/**
 * Transform index.html for Vercel deployment
 */
function transformIndexHtml() {
  console.log('Transforming index.html...');

  let content = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

  // Replace the loadData function to use Vercel API
  const oldLoadData = `function loadData() {
      // Check if running in Google Apps Script environment
      if (typeof google !== 'undefined' && typeof google.script !== 'undefined') {
        // Production: Use google.script.run to get data from the server
        google.script.run
          .withSuccessHandler(renderDashboard)
          .withFailureHandler(showError)
          .getDashboardData();
      } else {
        // Local testing: Use mock data
        console.log('Running in local test mode with mock data');
        setTimeout(() => renderDashboard(JSON.stringify(getMockData())), 500);
      }
    }`;

  const newLoadData = `function loadData() {
      // Vercel deployment: Fetch from API endpoint
      fetch('/api/data')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch data: ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          // API returns parsed JSON, stringify for renderDashboard
          renderDashboard(JSON.stringify(data));
        })
        .catch(error => {
          console.error('Error loading data:', error);
          // Fallback to mock data for local testing
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Falling back to mock data');
            setTimeout(() => renderDashboard(JSON.stringify(getMockData())), 500);
          } else {
            showError({ message: error.message });
          }
        });
    }`;

  content = content.replace(oldLoadData, newLoadData);

  // Replace the sendAIMessage function to use Vercel API
  const oldSendAI = `// Call AI API
      google.script.run
        .withSuccessHandler(handleAIResponse)
        .withFailureHandler(handleAIError)
        .queryAI(message, JSON.stringify(globalAppsData), selectedAIProvider);`;

  const newSendAI = `// Call AI API via Vercel endpoint
      fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: message,
          appsData: globalAppsData,
          provider: selectedAIProvider
        })
      })
        .then(response => response.json())
        .then(data => handleAIResponse(JSON.stringify(data)))
        .catch(error => handleAIError(error));`;

  content = content.replace(oldSendAI, newSendAI);

  // Write to public directory
  fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), content, 'utf8');
  console.log('  -> public/index.html created');
}

/**
 * Transform signage.html for Vercel deployment
 */
function transformSignageHtml() {
  console.log('Transforming signage.html...');

  let content = fs.readFileSync(path.join(ROOT_DIR, 'signage.html'), 'utf8');

  // Replace the loadData function for signage using exact string match
  const oldLoadDataSignage = `function loadData() {
      console.log('Loading dashboard data...');

      // Check if running in Google Apps Script environment
      if (typeof google !== 'undefined' && typeof google.script !== 'undefined') {
        google.script.run
          .withSuccessHandler(handleDataLoaded)
          .withFailureHandler(handleError)
          .getDashboardData();
      } else {
        // Local testing with mock data
        console.log('Running in local test mode with mock data');
        setTimeout(() => handleDataLoaded(JSON.stringify(getMockData())), 1000);
      }
    }`;

  const newLoadDataSignage = `function loadData() {
      console.log('Loading dashboard data...');

      // Vercel deployment: Fetch from API endpoint
      fetch('/api/data')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch data: ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          // API returns parsed JSON, stringify for handleDataLoaded
          handleDataLoaded(JSON.stringify(data));
        })
        .catch(error => {
          console.error('Error loading data:', error);
          // Fallback to mock data for local testing
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Falling back to mock data');
            setTimeout(() => handleDataLoaded(JSON.stringify(getMockData())), 1000);
          } else {
            handleError(error);
          }
        });
    }`;

  content = content.replace(oldLoadDataSignage, newLoadDataSignage);

  // Write to public directory
  fs.writeFileSync(path.join(PUBLIC_DIR, 'signage.html'), content, 'utf8');
  console.log('  -> public/signage.html created');
}

/**
 * Copy assets directory if it exists
 */
function copyAssets() {
  const assetsDir = path.join(ROOT_DIR, 'assets');
  const publicAssetsDir = path.join(PUBLIC_DIR, 'assets');

  if (fs.existsSync(assetsDir)) {
    console.log('Copying assets...');

    if (!fs.existsSync(publicAssetsDir)) {
      fs.mkdirSync(publicAssetsDir, { recursive: true });
    }

    const files = fs.readdirSync(assetsDir);
    files.forEach(file => {
      const src = path.join(assetsDir, file);
      const dest = path.join(publicAssetsDir, file);
      fs.copyFileSync(src, dest);
      console.log(`  -> public/assets/${file}`);
    });
  }
}

// Main execution
console.log('Building Vercel-compatible frontend...\n');
transformIndexHtml();
transformSignageHtml();
copyAssets();
console.log('\nBuild complete!');
