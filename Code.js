/**
 * @OnlyCurrentDoc
 */

// This function serves the HTML content of the web app.
function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate()
    .setTitle('SAS Apps Dashboard')
    .setFaviconUrl('https://placehold.co/32x32/1f2937/ffffff?text=SAS')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Reads data from a Google Sheet, processes it, and returns it as a JSON string.
 * Expected headers: Active, Product, Division, Department, Subject, Budget, License Type, Licenses, Spend, Category, Website
 */
function getDashboardData() {
  const SPREADSHEET_ID = '1N5urSfuuo2kqCeD-wyo1VpqMZGKTqMhPO2GK7wMvfy8';
  const SHEET_NAME = 'Sheet1';     // <--- REPLACE WITH YOUR SHEET NAME

  let values;
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found.`);
    }
    values = sheet.getDataRange().getValues();
  } catch (e) {
    Logger.log('Error reading sheet: ' + e.message);
    return JSON.stringify({
      error: `Could not retrieve data. Please ensure the sheet ID and name are correct and the script has permission to access it. Error: ${e.message}`
    });
  }

  // The first row is the header
  const headers = values.shift();

  const wholeSchoolApps = [];
  const elementaryApps = [];
  const middleSchoolApps = [];
  const highSchoolApps = [];

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    if (row.length === 0 || !row[0]) continue; // Skip empty rows

    const app = {};
    headers.forEach((header, index) => {
      app[header] = row[index] || '';
    });

    // Only process active apps
    if (app.Active && app.Active.toString().toLowerCase() !== 'yes') continue;

    const appData = {
      product: app.Product || 'N/A',
      division: app.Division || 'N/A',
      department: app.Department || 'N/A',
      subject: app.Subject || 'N/A',
      budget: app.Budget || 'N/A',
      licenseType: app['License Type'] || 'N/A',
      licenses: parseInt(app.Licenses) || 0,
      category: app.Category || 'N/A',
      website: app.Website || '#',
    };

    const division = appData.division.toLowerCase();

    // Check if it's whole school (multiple divisions or schoolwide)
    const isWholeSchool = division.includes('schoolwide') ||
                         division.includes('whole school') ||
                         division.includes('all') ||
                         (division.includes('elementary') && division.includes('middle') && division.includes('high')) ||
                         appData.licenseType.toLowerCase().includes('site');

    if (isWholeSchool) {
      wholeSchoolApps.push(appData);
    } else {
      // Categorize by specific divisions
      if (division.includes('elementary') || division.includes('early learning')) {
        elementaryApps.push(appData);
      }
      if (division.includes('middle')) {
        middleSchoolApps.push(appData);
      }
      if (division.includes('high')) {
        highSchoolApps.push(appData);
      }
    }
  }

  // Sort apps by product name
  wholeSchoolApps.sort((a, b) => a.product.localeCompare(b.product));
  elementaryApps.sort((a, b) => a.product.localeCompare(b.product));
  middleSchoolApps.sort((a, b) => a.product.localeCompare(b.product));
  highSchoolApps.sort((a, b) => a.product.localeCompare(b.product));

  // Helper function to group by category and department
  function groupBy(apps, key) {
    return apps.reduce((groups, app) => {
      const group = app[key] || 'Other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(app);
      return groups;
    }, {});
  }

  return JSON.stringify({
    wholeSchool: {
      apps: wholeSchoolApps,
      byCategory: groupBy(wholeSchoolApps, 'category'),
      byDepartment: groupBy(wholeSchoolApps, 'department')
    },
    elementary: {
      apps: elementaryApps,
      byCategory: groupBy(elementaryApps, 'category'),
      byDepartment: groupBy(elementaryApps, 'department')
    },
    middleSchool: {
      apps: middleSchoolApps,
      byCategory: groupBy(middleSchoolApps, 'category'),
      byDepartment: groupBy(middleSchoolApps, 'department')
    },
    highSchool: {
      apps: highSchoolApps,
      byCategory: groupBy(highSchoolApps, 'category'),
      byDepartment: groupBy(highSchoolApps, 'department')
    },
    stats: {
      totalApps: wholeSchoolApps.length + elementaryApps.length + middleSchoolApps.length + highSchoolApps.length,
      wholeSchoolCount: wholeSchoolApps.length,
      elementaryCount: elementaryApps.length,
      middleSchoolCount: middleSchoolApps.length,
      highSchoolCount: highSchoolApps.length
    }
  });
}
