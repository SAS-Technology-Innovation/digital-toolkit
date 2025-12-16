#!/usr/bin/env node
/**
 * Build script to generate Vercel-compatible versions of the dashboard HTML files.
 *
 * This script:
 * 1. Reads the original HTML files from the root directory (Apps Script versions)
 * 2. Modifies the loadData() function to use Vercel API endpoints
 * 3. Modifies the AI query function to use Vercel API endpoints
 * 4. Modifies password verification to use Vercel API endpoint
 * 5. Verifies all replacements were successful
 * 6. Writes the modified files to the vercel/public/ directory
 *
 * Usage: node scripts/build-vercel.js (from vercel/ directory)
 */

const fs = require('fs');
const path = require('path');

// Directories
const VERCEL_DIR = path.join(__dirname, '..');
const ROOT_DIR = path.join(VERCEL_DIR, '..');  // For assets
const PUBLIC_DIR = path.join(VERCEL_DIR, 'public');
const SOURCE_DIR = VERCEL_DIR;  // HTML source files are in vercel/ directory

// Track transformation success
let transformationErrors = [];

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

/**
 * Vercel-compatible loadData function for index.html
 */
const VERCEL_LOAD_DATA_INDEX = `function loadData() {
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

/**
 * Vercel-compatible loadData function for signage.html
 */
const VERCEL_LOAD_DATA_SIGNAGE = `function loadData() {
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

/**
 * Vercel-compatible loadData function for renewal.html
 */
const VERCEL_LOAD_DATA_RENEWAL = `function loadDashboardData() {
      document.getElementById('loading-state').style.display = 'flex';
      document.getElementById('timeline-section').style.display = 'none';

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
            handleDataError(error.message);
          }
        });
    }`;

/**
 * Vercel-compatible password verification for renewal.html
 */
const VERCEL_VERIFY_PASSWORD = `// Verify password via Vercel API
      fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: password })
      })
        .then(response => response.json())
        .then(data => {
          if (data.valid) {
            onAuthSuccess();
          } else {
            showPasswordError();
          }
        })
        .catch(error => {
          console.error('Auth error:', error);
          showPasswordError();
        });`;

/**
 * Vercel-compatible AI message sending code
 */
const VERCEL_SEND_AI = `// Call AI API via Vercel endpoint
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

/**
 * Transform index.html for Vercel deployment using regex patterns
 */
function transformIndexHtml() {
  console.log('Transforming index.html...');

  let content = fs.readFileSync(path.join(SOURCE_DIR, 'index.html'), 'utf8');
  const originalContent = content;

  // Pattern 1: Replace loadData function
  const loadDataPattern = /function loadData\(\)\s*\{[\s\S]*?google\.script\.run[\s\S]*?\.getDashboardData\(\);[\s\S]*?else\s*\{[\s\S]*?getMockData\(\)\)[\s\S]*?\}\s*\}/;

  if (loadDataPattern.test(content)) {
    content = content.replace(loadDataPattern, VERCEL_LOAD_DATA_INDEX);
    console.log('  ✓ Replaced loadData() function');
  } else {
    transformationErrors.push('index.html: Could not find loadData() function pattern');
    console.error('  ✗ ERROR: Could not find loadData() function pattern');
  }

  // Pattern 2: Replace AI API call in sendAIMessage
  const aiCallPattern = /\/\/\s*Call AI API\s*\n\s*google\.script\.run\s*\n\s*\.withSuccessHandler\(handleAIResponse\)\s*\n\s*\.withFailureHandler\(handleAIError\)\s*\n\s*\.queryAI\(message,\s*JSON\.stringify\(globalAppsData\),\s*selectedAIProvider\);/;

  if (aiCallPattern.test(content)) {
    content = content.replace(aiCallPattern, VERCEL_SEND_AI);
    console.log('  ✓ Replaced AI API call');
  } else {
    transformationErrors.push('index.html: Could not find AI API call pattern');
    console.error('  ✗ ERROR: Could not find AI API call pattern');
  }

  // Verification
  const remainingGoogleScriptRun = content.match(/google\.script\.run/g);
  if (remainingGoogleScriptRun) {
    const nonCommentMatches = content.split('\n').filter(line => {
      return line.includes('google.script.run') &&
             !line.trim().startsWith('//') &&
             !line.includes('getMockData');
    });
    if (nonCommentMatches.length > 0) {
      transformationErrors.push(`index.html: Found ${nonCommentMatches.length} remaining google.script.run references`);
      console.error(`  ✗ WARNING: Found ${nonCommentMatches.length} remaining google.script.run references`);
    }
  }

  // Write to public directory
  fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), content, 'utf8');
  console.log('  -> public/index.html created');

  return content !== originalContent;
}

/**
 * Transform signage.html for Vercel deployment using regex patterns
 */
function transformSignageHtml() {
  console.log('Transforming signage.html...');

  let content = fs.readFileSync(path.join(SOURCE_DIR, 'signage.html'), 'utf8');
  const originalContent = content;

  // Pattern: Replace loadData function in signage
  const loadDataPattern = /function loadData\(\)\s*\{[\s\S]*?google\.script\.run[\s\S]*?\.getDashboardData\(\);[\s\S]*?else\s*\{[\s\S]*?getMockData\(\)\)[\s\S]*?\}\s*\}/;

  if (loadDataPattern.test(content)) {
    content = content.replace(loadDataPattern, VERCEL_LOAD_DATA_SIGNAGE);
    console.log('  ✓ Replaced loadData() function');
  } else {
    transformationErrors.push('signage.html: Could not find loadData() function pattern');
    console.error('  ✗ ERROR: Could not find loadData() function pattern');
  }

  // Verification
  const remainingGoogleScriptRun = content.match(/google\.script\.run/g);
  if (remainingGoogleScriptRun) {
    const nonCommentMatches = content.split('\n').filter(line => {
      return line.includes('google.script.run') &&
             !line.trim().startsWith('//') &&
             !line.includes('getMockData');
    });
    if (nonCommentMatches.length > 0) {
      transformationErrors.push(`signage.html: Found ${nonCommentMatches.length} remaining google.script.run references`);
      console.error(`  ✗ WARNING: Found ${nonCommentMatches.length} remaining google.script.run references`);
    }
  }

  // Write to public directory
  fs.writeFileSync(path.join(PUBLIC_DIR, 'signage.html'), content, 'utf8');
  console.log('  -> public/signage.html created');

  return content !== originalContent;
}

/**
 * Transform renewal.html for Vercel deployment
 */
function transformRenewalHtml() {
  console.log('Transforming renewal.html...');

  let content = fs.readFileSync(path.join(SOURCE_DIR, 'renewal.html'), 'utf8');
  const originalContent = content;

  // Pattern 1: Replace loadDashboardData function
  const loadDataPattern = /function loadDashboardData\(\)\s*\{[\s\S]*?google\.script\.run[\s\S]*?\.getDashboardData\(\);[\s\S]*?else\s*\{[\s\S]*?getMockData\(\)\)[\s\S]*?\}\s*\}/;

  if (loadDataPattern.test(content)) {
    content = content.replace(loadDataPattern, VERCEL_LOAD_DATA_RENEWAL);
    console.log('  ✓ Replaced loadDashboardData() function');
  } else {
    transformationErrors.push('renewal.html: Could not find loadDashboardData() function pattern');
    console.error('  ✗ ERROR: Could not find loadDashboardData() function pattern');
  }

  // Pattern 2: Replace password verification
  // Match the google.script.run pattern for verifyRenewalPassword
  const passwordPattern = /\/\/\s*Verify password via server\s*\n\s*if\s*\(typeof google[\s\S]*?\.verifyRenewalPassword\(password\);[\s\S]*?\}\s*else\s*\{[\s\S]*?LOCAL_TEST_PASSWORD[\s\S]*?showPasswordError\(\);[\s\S]*?\}\s*\},\s*\d+\);\s*\}/;

  if (passwordPattern.test(content)) {
    content = content.replace(passwordPattern, VERCEL_VERIFY_PASSWORD);
    console.log('  ✓ Replaced password verification');
  } else {
    transformationErrors.push('renewal.html: Could not find password verification pattern');
    console.error('  ✗ ERROR: Could not find password verification pattern');
  }

  // Verification
  const remainingGoogleScriptRun = content.match(/google\.script\.run/g);
  if (remainingGoogleScriptRun) {
    const nonCommentMatches = content.split('\n').filter(line => {
      return line.includes('google.script.run') &&
             !line.trim().startsWith('//') &&
             !line.includes('getMockData');
    });
    if (nonCommentMatches.length > 0) {
      transformationErrors.push(`renewal.html: Found ${nonCommentMatches.length} remaining google.script.run references`);
      console.error(`  ✗ WARNING: Found ${nonCommentMatches.length} remaining google.script.run references`);
    }
  }

  // Write to public directory
  fs.writeFileSync(path.join(PUBLIC_DIR, 'renewal.html'), content, 'utf8');
  console.log('  -> public/renewal.html created');

  return content !== originalContent;
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

      // Check if it's a file (not directory)
      if (fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
        console.log(`  -> public/assets/${file}`);
      }
    });
  }
}

/**
 * Verify the generated files don't contain google.script.run
 */
function verifyBuild() {
  console.log('\nVerifying build...');

  const filesToCheck = ['index.html', 'signage.html', 'renewal.html'];
  let allPassed = true;

  filesToCheck.forEach(file => {
    const filePath = path.join(PUBLIC_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.error(`  ✗ ${file}: File not created!`);
      allPassed = false;
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Check for google.script.run (excluding comments)
    const lines = content.split('\n');
    const problematicLines = lines.filter((line, index) => {
      return line.includes('google.script.run') &&
             !line.trim().startsWith('//') &&
             !line.trim().startsWith('*');
    });

    if (problematicLines.length > 0) {
      console.error(`  ✗ ${file}: Contains ${problematicLines.length} google.script.run references!`);
      allPassed = false;
    } else {
      console.log(`  ✓ ${file}: No google.script.run references found`);
    }

    // Check for fetch('/api/data')
    if (content.includes("fetch('/api/data')")) {
      console.log(`  ✓ ${file}: Contains Vercel API call`);
    } else {
      console.error(`  ✗ ${file}: Missing Vercel API call!`);
      allPassed = false;
    }
  });

  // Check for AI endpoint in index.html
  const indexContent = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');
  if (indexContent.includes("fetch('/api/ai'")) {
    console.log(`  ✓ index.html: Contains Vercel AI API call`);
  } else {
    console.error(`  ✗ index.html: Missing Vercel AI API call!`);
    allPassed = false;
  }

  // Check for password verification in renewal.html
  const renewalContent = fs.readFileSync(path.join(PUBLIC_DIR, 'renewal.html'), 'utf8');
  if (renewalContent.includes("fetch('/api/verify-password'")) {
    console.log(`  ✓ renewal.html: Contains Vercel password verification API call`);
  } else {
    console.error(`  ✗ renewal.html: Missing Vercel password verification API call!`);
    allPassed = false;
  }

  return allPassed;
}

// Main execution
console.log('Building Vercel-compatible frontend...\n');
console.log(`Root directory: ${ROOT_DIR}`);
console.log(`Output directory: ${PUBLIC_DIR}\n`);

const indexChanged = transformIndexHtml();
const signageChanged = transformSignageHtml();
const renewalChanged = transformRenewalHtml();
copyAssets();

const buildPassed = verifyBuild();

console.log('\n' + '='.repeat(50));

if (transformationErrors.length > 0) {
  console.error('\n⚠️  Build completed with errors:');
  transformationErrors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
}

if (!buildPassed) {
  console.error('\n❌ Build verification failed!');
  process.exit(1);
}

console.log('\n✅ Build complete!');
