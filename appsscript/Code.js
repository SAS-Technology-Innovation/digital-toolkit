/**
 * SAS Digital Toolkit - Main Backend
 *
 * This is the main entry point for the SAS Digital Toolkit Google Apps Script web application.
 * It handles web requests, serves HTML pages, and provides the dashboard data API.
 *
 * @fileoverview Main backend for the SAS Apps Dashboard web application.
 * Serves HTML pages and JSON APIs for both the embedded Google Apps Script frontend
 * and external frontends (e.g., Vercel deployment).
 *
 * @requires utilities.js - Shared helper functions
 * @requires ai-functions.js - AI-powered features (Gemini/Claude)
 * @requires data-management.js - Data validation and enrichment
 *
 * @author SAS Technology Innovation Team
 * @OnlyCurrentDoc
 */

// --- CONFIGURATION ---
// Configuration is managed via Script Properties.
// In the Apps Script Editor, go to Project Settings (gear icon) > Script Properties.
// Add properties for SPREADSHEET_ID, SHEET_NAME, GEMINI_API_KEY, and CLAUDE_API_KEY.

/**
 * Creates a custom menu in Google Sheets when the spreadsheet is opened.
 * Called automatically by Google Sheets trigger system.
 *
 * Menu items:
 * - 📊 Analytics Dashboard - Opens the analytics modal
 * - ✅ Validate Data - Checks for required fields
 * - 🔍 Find Missing Fields - Reports all missing optional fields
 * - ✨ Enrich Missing Descriptions - AI-generates missing descriptions
 * - 🔄 Refresh All Missing Data - Comprehensive AI enrichment
 * - 🧪 Test Claude/Gemini - Tests API connectivity
 *
 * @function onOpen
 * @returns {void}
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🤖 Digital Toolkit Admin')
    .addItem('📊 Analytics Dashboard', 'showAnalyticsDashboard')
    .addSeparator()
    .addItem('✅ Validate Data', 'validateAllData')
    .addItem('🔍 Find Missing Fields', 'findMissingFields')
    .addSeparator()
    .addItem('✨ Enrich Missing Descriptions', 'enrichMissingDescriptions')
    .addItem('🔄 Refresh All Missing Data', 'enrichAllMissingData')
    .addSeparator()
    .addItem('🧪 Test Claude Connection', 'testClaude')
    .addItem('🧪 Test Gemini Connection', 'testGemini')
    .addToUi();
}

/**
 * Serves the HTML content of the web app or handles API requests.
 * This is the main entry point for all HTTP GET requests to the web app.
 *
 * URL patterns:
 * - Default (no params): Serves the main dashboard (index.html)
 * - ?page=signage: Serves the digital signage slideshow
 * - ?api=data&key=FRONTEND_KEY: Returns JSON data for external frontends (Vercel)
 * - ?api=ai&key=FRONTEND_KEY&query=...&provider=...: Handles AI queries
 *
 * @function doGet
 * @param {Object} e - Event parameter from Google Apps Script
 * @param {Object} e.parameter - URL query parameters
 * @returns {HtmlOutput|TextOutput} HTML page or JSON API response
 *
 * @example
 * // Access main dashboard
 * https://script.google.com/macros/s/DEPLOYMENT_ID/exec
 *
 * // Access signage display
 * https://script.google.com/macros/s/DEPLOYMENT_ID/exec?page=signage
 *
 * // API call for dashboard data
 * https://script.google.com/macros/s/DEPLOYMENT_ID/exec?api=data&key=YOUR_KEY
 */
function doGet(e) {
  const params = (e && e.parameter) || {};
  const page = params.page || 'index';
  const apiEndpoint = params.api;
  const frontendKey = params.key;

  // --- API Endpoints for External Frontends (Vercel) ---
  if (apiEndpoint) {
    return handleApiRequest(apiEndpoint, frontendKey, params);
  }

  // --- HTML Page Serving ---
  // Note: Main dashboard pages (index, signage, renewal) are served via Vercel deployment.
  // This doGet only serves the API endpoints.
  // For direct Apps Script access, redirect to Vercel deployment.

  // Return a simple redirect or message
  const vercelUrl = 'https://sas-digital-toolkit.vercel.app';
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta http-equiv="refresh" content="0; url=${vercelUrl}">
      <title>Redirecting...</title>
    </head>
    <body>
      <p>Redirecting to <a href="${vercelUrl}">${vercelUrl}</a>...</p>
    </body>
    </html>
  `).setTitle('SAS Digital Toolkit');
}

/**
 * Handles HTTP POST requests for API endpoints.
 * Used for AI queries where the payload (appsData) is too large for GET parameters.
 *
 * POST Body Format (JSON):
 * {
 *   "api": "ai",
 *   "key": "FRONTEND_KEY",
 *   "query": "user's question",
 *   "provider": "gemini" or "claude",
 *   "appsData": [...array of app objects...]
 * }
 *
 * @function doPost
 * @param {Object} e - Event parameter from Google Apps Script
 * @param {string} e.postData.contents - JSON string of the POST body
 * @returns {TextOutput} JSON response with data or error
 */
function doPost(e) {
  // Create JSON response helper
  const jsonResponse = (data) => {
    const output = ContentService.createTextOutput(JSON.stringify(data));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  };

  try {
    // Parse the POST body
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({
        error: 'Bad Request',
        message: 'No POST body provided'
      });
    }

    const body = JSON.parse(e.postData.contents);
    const endpoint = body.api;
    const frontendKey = body.key;

    // Validate required fields
    if (!endpoint) {
      return jsonResponse({
        error: 'Bad Request',
        message: 'api field is required in POST body'
      });
    }

    // Build params object from body for handleApiRequest
    const params = {
      query: body.query,
      provider: body.provider,
      appsData: typeof body.appsData === 'string' ? body.appsData : JSON.stringify(body.appsData)
    };

    return handleApiRequest(endpoint, frontendKey, params);

  } catch (error) {
    Logger.log('doPost error: ' + error.message);
    return jsonResponse({
      error: 'Server Error',
      message: 'Failed to process POST request: ' + error.message
    });
  }
}

/**
 * Handles API requests from external frontends (e.g., Vercel deployment).
 * Validates FRONTEND_KEY before returning data to ensure authorized access.
 *
 * API Endpoints:
 * - 'data': Returns full dashboard data (calls getDashboardData)
 * - 'ai': Handles AI queries (calls queryAI with provider and query)
 *
 * Security:
 * - Requires FRONTEND_KEY to be set in Script Properties
 * - Validates provided key matches stored key
 * - Returns 401 Unauthorized if key is invalid
 *
 * @function handleApiRequest
 * @param {string} endpoint - API endpoint name ('data' or 'ai')
 * @param {string} providedKey - The API key provided in the request
 * @param {Object} params - Additional URL parameters
 * @returns {TextOutput} JSON response with data or error
 *
 * @example
 * // Called internally by doGet for API requests
 * handleApiRequest('data', 'secret-key', {});
 * handleApiRequest('ai', 'secret-key', { query: 'Find math apps', provider: 'gemini' });
 */
function handleApiRequest(endpoint, providedKey, params) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const FRONTEND_KEY = scriptProperties.getProperty('FRONTEND_KEY');

  // Create JSON response helper
  const jsonResponse = (data, statusCode = 200) => {
    const output = ContentService.createTextOutput(JSON.stringify(data));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  };

  // Validate FRONTEND_KEY is configured
  if (!FRONTEND_KEY) {
    Logger.log('API Error: FRONTEND_KEY not configured in Script Properties');
    return jsonResponse({
      error: 'API not configured',
      message: 'FRONTEND_KEY must be set in Script Properties'
    }, 500);
  }

  // Validate the provided key matches
  if (!providedKey || providedKey !== FRONTEND_KEY) {
    Logger.log('API Error: Invalid or missing FRONTEND_KEY');
    return jsonResponse({
      error: 'Unauthorized',
      message: 'Invalid or missing API key'
    }, 401);
  }

  // Handle different API endpoints
  switch (endpoint) {
    case 'data':
      // Return dashboard data
      const dashboardData = getDashboardData();
      return jsonResponse(JSON.parse(dashboardData));

    case 'ai':
      // Handle AI query
      const query = params.query;
      const provider = params.provider || 'gemini';
      const appsData = params.appsData;

      if (!query) {
        return jsonResponse({
          error: 'Bad Request',
          message: 'Query parameter is required for AI endpoint'
        }, 400);
      }

      if (!appsData) {
        return jsonResponse({
          error: 'Bad Request',
          message: 'appsData parameter is required for AI endpoint'
        }, 400);
      }

      const aiResult = queryAI(query, appsData, provider);
      return jsonResponse(JSON.parse(aiResult));

    case 'verify-password':
      // Handle password verification for renewal page
      const password = params.password;

      if (!password) {
        return jsonResponse({
          error: 'Bad Request',
          message: 'Password parameter is required'
        }, 400);
      }

      const isValid = verifyRenewalPassword(password);
      return jsonResponse({ valid: isValid });

    case 'saveRenewalAction':
      // Handle saving renewal actions to Google Sheets
      const product = params.product;
      const action = params.action;
      const notes = params.notes || '';

      if (!product || !action) {
        return jsonResponse({
          error: 'Bad Request',
          message: 'product and action parameters are required'
        }, 400);
      }

      const saveResult = saveRenewalAction(product, action, notes);
      return jsonResponse(JSON.parse(saveResult));

    case 'csv':
      // Export all data as CSV
      const csvResult = exportSheetAsCSV();
      return jsonResponse(JSON.parse(csvResult));

    case 'update':
      // Update a specific cell in the sheet
      const updateProductId = params.productId || params.product_id;
      const updateField = params.field;
      const updateValue = params.value;

      if (!updateProductId || !updateField) {
        return jsonResponse({
          error: 'Bad Request',
          message: 'productId and field parameters are required'
        }, 400);
      }

      const updateResult = updateAppField(updateProductId, updateField, updateValue);
      return jsonResponse(JSON.parse(updateResult));

    case 'bulkUpdate':
      // Handle bulk updates from JSON array
      const updates = params.updates;

      if (!updates) {
        return jsonResponse({
          error: 'Bad Request',
          message: 'updates parameter is required (JSON array)'
        }, 400);
      }

      const bulkResult = bulkUpdateApps(updates);
      return jsonResponse(JSON.parse(bulkResult));

    default:
      return jsonResponse({
        error: 'Not Found',
        message: `Unknown API endpoint: ${endpoint}. Valid endpoints: data, ai, verify-password, saveRenewalAction`
      }, 404);
  }
}

// ==========================================
// AI FUNCTIONS
// All AI-related functions have been moved to ai-functions.js
// The following functions are now in ai-functions.js:
// - queryAI, queryGeminiAPI, queryClaudeAPI
// - testGemini, testClaude
// - logAIQuery, extractAppNames
// ==========================================

/**
 * Verifies the renewal page password.
 * Password is stored in Script Properties as RENEWAL_PASSWORD.
 *
 * @function verifyRenewalPassword
 * @param {string} password - The password to verify
 * @returns {boolean} True if password matches, false otherwise
 *
 * @example
 * // Called from frontend or API
 * const isValid = verifyRenewalPassword('user-entered-password');
 */
function verifyRenewalPassword(password) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const storedPassword = scriptProperties.getProperty('RENEWAL_PASSWORD');

    if (!storedPassword) {
      Logger.log('Warning: RENEWAL_PASSWORD not set in Script Properties');
      return false;
    }

    return password === storedPassword;
  } catch (error) {
    Logger.log('Error verifying renewal password: ' + error.message);
    return false;
  }
}

/**
 * Saves a renewal action (Renew, Modify, Retire) to the "Renewal Actions" sheet.
 * Creates the sheet if it doesn't exist with headers: timestamp, product_name, action, notes.
 *
 * @function saveRenewalAction
 * @param {string} product - The app product name
 * @param {string} action - The renewal action: 'renew', 'modify', or 'retire'
 * @param {string} notes - Optional notes about the action
 * @returns {string} JSON string with success status or error
 *
 * @example
 * // Save a renewal decision
 * saveRenewalAction('Google Classroom', 'renew', 'Essential for all divisions');
 * saveRenewalAction('Old App', 'retire', 'No longer used');
 */
function saveRenewalAction(product, action, notes) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');

    if (!SPREADSHEET_ID) {
      return JSON.stringify({
        error: 'Configuration error',
        message: 'SPREADSHEET_ID not set in Script Properties'
      });
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let actionsSheet = spreadsheet.getSheetByName('Renewal Actions');

    // Create the sheet if it doesn't exist
    if (!actionsSheet) {
      actionsSheet = spreadsheet.insertSheet('Renewal Actions');
      // Add headers
      actionsSheet.appendRow(['timestamp', 'product_name', 'action', 'notes']);
      // Format header row
      const headerRange = actionsSheet.getRange(1, 1, 1, 4);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#1a2d58'); // SAS Blue
      headerRange.setFontColor('#ffffff');
      // Freeze header row
      actionsSheet.setFrozenRows(1);
    }

    // Append the renewal action
    const timestamp = new Date();
    actionsSheet.appendRow([timestamp, product, action, notes || '']);

    Logger.log(`Renewal action saved: ${product} - ${action}`);

    return JSON.stringify({
      success: true,
      message: 'Renewal action saved successfully',
      data: {
        timestamp: timestamp.toISOString(),
        product: product,
        action: action,
        notes: notes || ''
      }
    });

  } catch (error) {
    Logger.log('Error saving renewal action: ' + error.message);
    return JSON.stringify({
      error: 'Failed to save renewal action',
      message: error.message
    });
  }
}

/**
 * Reads data from the Google Sheet, processes it for the dashboard, and returns it as a JSON string.
 * This is the main data API function called by the frontend dashboard.
 *
 * Data Processing Pipeline:
 * 1. Reads all rows from the configured Google Sheet
 * 2. Filters to only active apps (active = TRUE)
 * 3. Normalizes field names (supports both old/new column naming)
 * 4. Categorizes apps into divisions (Whole School, Elementary, Middle, High)
 * 5. Groups apps by Enterprise, Everyone, and Department sections
 * 6. Returns structured JSON with division tabs and statistics
 *
 * Division Assignment Rules (see isEffectivelyWholeSchool in utilities.js):
 * - Site/School/Enterprise/Unlimited licenses → Whole School
 * - School Operations department → Whole School
 * - Apps in all 3 divisions (ES + MS + HS) → Whole School
 * - Otherwise → assigned to specific division(s)
 *
 * @function getDashboardData
 * @returns {string} JSON string containing dashboard data structure:
 *   - wholeSchool: { apps, enterpriseApps, everyoneApps, byDepartment }
 *   - elementary: { apps, everyoneApps, byDepartment }
 *   - middleSchool: { apps, everyoneApps, byDepartment }
 *   - highSchool: { apps, everyoneApps, byDepartment }
 *   - stats: { totalApps, wholeSchoolCount, elementaryCount, middleSchoolCount, highSchoolCount }
 *
 * @example
 * // Called from frontend
 * google.script.run
 *   .withSuccessHandler(renderDashboard)
 *   .getDashboardData();
 *
 * @see {@link isEffectivelyWholeSchool} in utilities.js for division logic
 * @see {@link parseDivisions} in utilities.js for division parsing
 */
function getDashboardData() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
    const SHEET_NAME = scriptProperties.getProperty('SHEET_NAME');

    if (!SPREADSHEET_ID || !SHEET_NAME) {
      const errorMessage = 'Configuration error: SPREADSHEET_ID and/or SHEET_NAME are not set in Script Properties. Please contact an administrator to configure the script.';
      logError(errorMessage);
      return JSON.stringify({
        error: errorMessage
      });
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values.shift(); // Remove header row

    // Map headers to their column index for easy access
    const headerMap = headers.reduce((obj, header, index) => {
      obj[header] = index;
      return obj;
    }, {});

    const allApps = values.map(row => {
      // Convert row array to a named object
      const app = {};
      headers.forEach((header, index) => {
        app[header] = row[index] || '';
      });
      return app;
    }).filter(app => {
      // Only process active apps (support both old and new column names)
      const activeValue = app.active !== undefined ? app.active : app.Active;
      return activeValue === true || activeValue.toString().toLowerCase() === 'true';
    }).map(app => {
      // Create a clean appData object for the dashboard
      // Handle pricing: convert 0 to "Free"
      let spendValue = app.value || 'N/A';
      const numericValue = parseFloat(app.value);
      if (!isNaN(numericValue) && numericValue === 0) {
        spendValue = 'Free';
      }

      // Support both old (capitalized) and new (lowercase) column names
      return {
        product: app.product_name || 'N/A',
        productId: app.product_id || null, // Stable unique ID for sync deduplication (Column W)
        division: app.division || app.Division || 'N/A',
        department: app.department || app.Department || 'N/A',
        subject: app.subjects || app.subjects_or_department || 'N/A',
        budget: app.budget || 'N/A',
        licenseType: app.license_type || app['License Type'] || 'N/A',
        licenses: parseInt(app.licence_count) || 0,
        category: app.category || app.Category || 'N/A',
        website: app.website || app.Website || '#',
        spend: spendValue,
        // New fields for enhanced dashboard
        enterprise: (app.enterprise !== undefined ? app.enterprise : app.Enterprise) === true ||
                   (app.enterprise !== undefined ? app.enterprise : app.Enterprise).toString().toLowerCase() === 'true',
        description: app.description || '',
        audience: app.audience || '',
        gradeLevels: app.grade_levels || '',
        supportEmail: app.support_email || '',
        tutorialLink: app.tutorial_link || '',
        mobileApp: app.mobile_app || '',
        ssoEnabled: app.sso_enabled === true || app.sso_enabled.toString().toLowerCase() === 'true',
        logoUrl: app.logo_url || '',
        dateAdded: app.date_added || '',
        renewalDate: app.renewal_date || ''
      };
    });

    const divisionData = {
      wholeSchool: [],
      elementary: [],
      middleSchool: [],
      highSchool: []
    };

    // --- DIVISION ASSIGNMENT LOGIC ---
    // Uses utility functions for consistent categorization across the codebase
    allApps.forEach(app => {
      // Use utility function to parse divisions
      const divisionsPresent = parseDivisions(app.division);

      // Use centralized isEffectivelyWholeSchool function from utilities.js
      const appIsWholeSchool = isEffectivelyWholeSchool(
        app.licenseType,
        app.department,
        app.division,
        divisionsPresent
      );

      // Mark app as whole school if it meets the criteria
      app.isWholeSchool = appIsWholeSchool;

      if (appIsWholeSchool) {
        // Whole school apps ONLY go to wholeSchool array
        divisionData.wholeSchool.push(app);
      } else {
        // Division-specific apps go to their respective divisions
        if (divisionsPresent.es) divisionData.elementary.push(app);
        if (divisionsPresent.ms) divisionData.middleSchool.push(app);
        if (divisionsPresent.hs) divisionData.highSchool.push(app);
      }
    });

    // --- NEW PROCESSING & GROUPING FUNCTION ---
    function processDivisionApps(apps, isWholeSchoolTab) {
      // Sort all apps alphabetically by product name first
      apps.sort((a, b) => a.product.localeCompare(b.product));

      // NEW: Enterprise Apps ONLY appear on Whole School tab
      const enterpriseApps = isWholeSchoolTab ? apps.filter(app => app.enterprise === true) : [];

      // "Everyone" apps: Site/School licenses that are NOT enterprise
      // For division tabs: only include division-specific "everyone" apps (not whole school apps)
      const everyoneApps = apps.filter(app => {
        const type = app.licenseType.toLowerCase();
        const dept = app.department.toLowerCase();
        const isEveryone = (type.includes('site') ||
                           type.includes('school') ||
                           type.includes('enterprise') ||
                           type.includes('unlimited') ||
                           dept === 'school-wide');

        // Exclude enterprise apps
        if (app.enterprise) return false;

        // For division tabs, exclude whole school apps from "everyone" section
        if (!isWholeSchoolTab && app.isWholeSchool) return false;

        return isEveryone;
      });

      // Combine enterprise and everyone apps to exclude from department apps
      const coreAppProducts = new Set([...enterpriseApps, ...everyoneApps].map(app => app.product));

      // Department-specific apps are those that are NOT enterprise or everyone apps
      const departmentSpecificApps = apps.filter(app => !coreAppProducts.has(app.product));

      const departmentGroups = {};
      departmentSpecificApps.forEach(app => {
        const dept = app.department || 'General';
        // Filter out invalid or placeholder department names
        if (dept === 'N/A' || dept.trim() === '') return;

        if (!departmentGroups[dept]) {
          departmentGroups[dept] = [];
        }
        departmentGroups[dept].push(app);
      });

      return {
        apps: apps, // The full list for the division
        enterpriseApps: enterpriseApps, // NEW: Official SAS core tools (Whole School only)
        everyoneApps: everyoneApps,
        byDepartment: departmentGroups
      };
    }

    const result = {
      wholeSchool: processDivisionApps(divisionData.wholeSchool, true), // true = Whole School tab
      elementary: processDivisionApps(divisionData.elementary, false),   // false = Division tab
      middleSchool: processDivisionApps(divisionData.middleSchool, false),
      highSchool: processDivisionApps(divisionData.highSchool, false),
      stats: {
        totalApps: allApps.length,
        wholeSchoolCount: divisionData.wholeSchool.length,
        elementaryCount: divisionData.elementary.length,
        middleSchoolCount: divisionData.middleSchool.length,
        highSchoolCount: divisionData.highSchool.length
      }
    };

    return JSON.stringify(result);

  } catch (error) {
    logError('Error in getDashboardData', error);
    return JSON.stringify({
      error: 'Failed to read or process data: ' + error.message
    });
  }
}


// ==========================================
// DATA MANAGEMENT FUNCTIONS
// All data management, enrichment, validation, and CSV operations
// have been moved to data-management.js for better organization.
// See: validateAllData, findMissingFields, enrichMissingDescriptions,
//      enrichAllMissingData, getAnalyticsData, detectAppOverlaps
// ==========================================

// ==========================================
// BIDIRECTIONAL SYNC FUNCTIONS
// Functions for exporting data and updating Google Sheets
// ==========================================

/**
 * Exports the main sheet data as CSV format
 * Returns headers and all rows as a JSON object with CSV data
 *
 * @function exportSheetAsCSV
 * @returns {string} JSON string with headers and rows
 */
function exportSheetAsCSV() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
    const SHEET_NAME = scriptProperties.getProperty('SHEET_NAME');

    if (!SPREADSHEET_ID || !SHEET_NAME) {
      return JSON.stringify({
        error: 'Configuration error',
        message: 'SPREADSHEET_ID and/or SHEET_NAME not set'
      });
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const rows = values.slice(1);

    // Convert to CSV format
    const csvLines = [headers.join(',')];
    rows.forEach(row => {
      const csvRow = row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma or quote
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      });
      csvLines.push(csvRow.join(','));
    });

    return JSON.stringify({
      success: true,
      headers: headers,
      rowCount: rows.length,
      csv: csvLines.join('\n'),
      data: rows.map(row => {
        const obj = {};
        headers.forEach((header, idx) => {
          obj[header] = row[idx];
        });
        return obj;
      })
    });

  } catch (error) {
    Logger.log('Error exporting CSV: ' + error.message);
    return JSON.stringify({
      error: 'Failed to export CSV',
      message: error.message
    });
  }
}

/**
 * Updates a specific field for an app identified by product_id
 *
 * @function updateAppField
 * @param {string} productId - The product_id to find
 * @param {string} field - The column/field name to update
 * @param {*} value - The new value
 * @returns {string} JSON string with success status
 */
function updateAppField(productId, field, value) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
    const SHEET_NAME = scriptProperties.getProperty('SHEET_NAME');

    if (!SPREADSHEET_ID || !SHEET_NAME) {
      return JSON.stringify({
        error: 'Configuration error',
        message: 'SPREADSHEET_ID and/or SHEET_NAME not set'
      });
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];

    // Find column indices
    const productIdCol = headers.indexOf('product_id');
    const targetCol = headers.indexOf(field);

    if (productIdCol === -1) {
      return JSON.stringify({
        error: 'Column not found',
        message: 'product_id column not found in sheet'
      });
    }

    if (targetCol === -1) {
      return JSON.stringify({
        error: 'Column not found',
        message: `Field "${field}" not found in sheet headers`
      });
    }

    // Find the row with matching product_id
    let targetRow = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][productIdCol] === productId) {
        targetRow = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (targetRow === -1) {
      return JSON.stringify({
        error: 'Not found',
        message: `No app found with product_id: ${productId}`
      });
    }

    // Update the cell
    const cell = sheet.getRange(targetRow, targetCol + 1); // +1 because columns are 1-indexed
    const oldValue = cell.getValue();
    cell.setValue(value);

    Logger.log(`Updated ${field} for product_id ${productId}: "${oldValue}" → "${value}"`);

    return JSON.stringify({
      success: true,
      message: 'Field updated successfully',
      data: {
        productId: productId,
        field: field,
        oldValue: oldValue,
        newValue: value,
        row: targetRow
      }
    });

  } catch (error) {
    Logger.log('Error updating field: ' + error.message);
    return JSON.stringify({
      error: 'Failed to update field',
      message: error.message
    });
  }
}

/**
 * Bulk updates multiple apps at once
 *
 * @function bulkUpdateApps
 * @param {string|Array} updates - JSON array of updates, each with productId, field, value
 * @returns {string} JSON string with success/failure counts
 */
function bulkUpdateApps(updates) {
  try {
    // Parse if string
    const updateArray = typeof updates === 'string' ? JSON.parse(updates) : updates;

    if (!Array.isArray(updateArray)) {
      return JSON.stringify({
        error: 'Invalid format',
        message: 'updates must be an array'
      });
    }

    const scriptProperties = PropertiesService.getScriptProperties();
    const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
    const SHEET_NAME = scriptProperties.getProperty('SHEET_NAME');

    if (!SPREADSHEET_ID || !SHEET_NAME) {
      return JSON.stringify({
        error: 'Configuration error',
        message: 'SPREADSHEET_ID and/or SHEET_NAME not set'
      });
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];

    const productIdCol = headers.indexOf('product_id');
    if (productIdCol === -1) {
      return JSON.stringify({
        error: 'Column not found',
        message: 'product_id column not found in sheet'
      });
    }

    // Build a map of productId to row number
    const productIdToRow = {};
    for (let i = 1; i < values.length; i++) {
      const pid = values[i][productIdCol];
      if (pid) {
        productIdToRow[pid] = i + 1; // 1-indexed row number
      }
    }

    let successCount = 0;
    let failCount = 0;
    const failures = [];

    updateArray.forEach((update, index) => {
      const { productId, field, value } = update;

      if (!productId || !field) {
        failCount++;
        failures.push({ index, error: 'Missing productId or field' });
        return;
      }

      const targetCol = headers.indexOf(field);
      if (targetCol === -1) {
        failCount++;
        failures.push({ index, productId, error: `Field "${field}" not found` });
        return;
      }

      const targetRow = productIdToRow[productId];
      if (!targetRow) {
        failCount++;
        failures.push({ index, productId, error: 'Product not found' });
        return;
      }

      try {
        sheet.getRange(targetRow, targetCol + 1).setValue(value);
        successCount++;
      } catch (err) {
        failCount++;
        failures.push({ index, productId, error: err.message });
      }
    });

    Logger.log(`Bulk update: ${successCount} success, ${failCount} failed`);

    return JSON.stringify({
      success: true,
      message: `Updated ${successCount} fields, ${failCount} failed`,
      successCount: successCount,
      failCount: failCount,
      failures: failures
    });

  } catch (error) {
    Logger.log('Error in bulk update: ' + error.message);
    return JSON.stringify({
      error: 'Failed to perform bulk update',
      message: error.message
    });
  }
}

