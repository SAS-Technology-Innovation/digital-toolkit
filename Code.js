/**
 * @OnlyCurrentDoc
 */

// --- CONFIGURATION ---
// Configuration is managed via Script Properties.
// In the Apps Script Editor, go to Project Settings (gear icon) > Script Properties.
// Add properties for SPREADSHEET_ID and SHEET_NAME.

/**
 * Serves the HTML content of the web app.
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate()
    .setTitle('SAS Apps Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Reads data from the Google Sheet, processes it for the dashboard, and returns it as a JSON string.
 */
function getDashboardData() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
    const SHEET_NAME = scriptProperties.getProperty('SHEET_NAME');

    if (!SPREADSHEET_ID || !SHEET_NAME) {
      const errorMessage = 'Configuration error: SPREADSHEET_ID and/or SHEET_NAME are not set in Script Properties. Please contact an administrator to configure the script.';
      Logger.log(errorMessage);
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
      // Only process active apps
      return app.Active === true || app.Active.toString().toLowerCase() === 'true';
    }).map(app => {
      // Create a clean appData object for the dashboard
      return {
        product: app.product_name || 'N/A',
        division: app.Division || 'N/A',
        department: app.Department || 'N/A',
        subject: app.subjects_or_department || 'N/A',
        budget: app.budget || 'N/A',
        licenseType: app['License Type'] || 'N/A',
        licenses: parseInt(app.licence_count) || 0,
        category: app.Category || 'N/A',
        website: app.Website || '#',
        spend: app.value || 'N/A',
        // New fields for enhanced dashboard
        enterprise: app.Enterprise === true || app.Enterprise.toString().toLowerCase() === 'true',
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

    // --- NEW, IMPROVED SORTING LOGIC ---
    allApps.forEach(app => {
      const division = app.division.toLowerCase();
      const licenseType = app.licenseType.toLowerCase();
      const department = app.department.toLowerCase();

      const divisionsPresent = {
        es: division.includes('elementary') || division.includes('early learning'),
        ms: division.includes('middle'),
        hs: division.includes('high')
      };

      const isEffectivelyWholeSchool =
        licenseType.includes('site') ||
        licenseType.includes('school') ||
        licenseType.includes('enterprise') ||
        licenseType.includes('unlimited') ||
        department === 'school operations' ||
        department === 'school-wide' ||
        division.includes('school-wide') ||
        division.includes('whole school') ||
        (divisionsPresent.es && divisionsPresent.ms && divisionsPresent.hs);

      // Mark app as whole school if it meets the criteria
      app.isWholeSchool = isEffectivelyWholeSchool;

      if (isEffectivelyWholeSchool) {
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
    Logger.log('Error in getDashboardData: ' + error.message);
    return JSON.stringify({
      error: 'Failed to read or process data: ' + error.message
    });
  }
}
