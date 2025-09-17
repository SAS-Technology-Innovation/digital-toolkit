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
        product: app.Product || 'N/A',
        division: app.Division || 'N/A',
        department: app.Department || 'N/A',
        subject: app.Subject || 'N/A',
        budget: app.Budget || 'N/A',
        licenseType: app['License Type'] || 'N/A',
        licenses: parseInt(app.Licenses) || 0,
        category: app.Category || 'N/A',
        website: app.Website || '#',
        spend: app.Spend || 'N/A'
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
        department === 'school-wide' || // Added this condition
        division.includes('school-wide') ||
        (divisionsPresent.es && divisionsPresent.ms && divisionsPresent.hs);

      if (isEffectivelyWholeSchool) {
        divisionData.wholeSchool.push(app);
        // Whole school apps should appear in every division's dashboard
        divisionData.elementary.push(app);
        divisionData.middleSchool.push(app);
        divisionData.highSchool.push(app);
      } else {
        // Add to specific divisions it belongs to
        if (divisionsPresent.es) divisionData.elementary.push(app);
        if (divisionsPresent.ms) divisionData.middleSchool.push(app);
        if (divisionsPresent.hs) divisionData.highSchool.push(app);
      }
    });

    // --- NEW PROCESSING & GROUPING FUNCTION ---
    function processDivisionApps(apps) {
      // Sort all apps alphabetically by product name first
      apps.sort((a, b) => a.product.localeCompare(b.product));

      const everyoneApps = apps.filter(app => {
        const type = app.licenseType.toLowerCase();
        const dept = app.department.toLowerCase();
        return type.includes('site') || 
               type.includes('school') || 
               type.includes('enterprise') || 
               type.includes('unlimited') ||
               dept === 'school-wide'; // Added this condition
      });

      const everyoneAppProducts = new Set(everyoneApps.map(app => app.product));
      // Department-specific apps are those that are NOT "everyone" apps
      const departmentSpecificApps = apps.filter(app => !everyoneAppProducts.has(app.product));

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
        everyoneApps: everyoneApps,
        byDepartment: departmentGroups
      };
    }

    const result = {
      wholeSchool: processDivisionApps(divisionData.wholeSchool),
      elementary: processDivisionApps(divisionData.elementary),
      middleSchool: processDivisionApps(divisionData.middleSchool),
      highSchool: processDivisionApps(divisionData.highSchool),
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
