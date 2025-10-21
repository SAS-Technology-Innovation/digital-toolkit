/**
 * Google Apps Script function to export dashboard data to JSON format
 * This is used to generate static JSON files for the Cloudflare Worker deployment
 *
 * USAGE:
 * 1. Open the Google Apps Script editor
 * 2. Run the exportDashboardToJSON function
 * 3. Copy the output from the Logger
 * 4. Save it to dashboard-data.json in your Cloudflare Worker project
 */

/**
 * Exports the dashboard data to JSON format and logs it
 * This reuses the existing getDashboardData() logic
 */
function exportDashboardToJSON() {
  try {
    const jsonData = getDashboardData();

    // Log the JSON data so it can be copied
    Logger.log('=== DASHBOARD DATA JSON ===');
    Logger.log(jsonData);
    Logger.log('=== END DASHBOARD DATA ===');

    // Also create a Drive file for easier downloading
    const fileName = 'dashboard-data-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd-HHmmss') + '.json';
    const file = DriveApp.createFile(fileName, jsonData, MimeType.JSON);

    Logger.log('\nJSON file created in Google Drive: ' + file.getName());
    Logger.log('File URL: ' + file.getUrl());
    Logger.log('\nYou can download this file and use it with your Cloudflare Worker.');

    return {
      success: true,
      fileName: fileName,
      fileUrl: file.getUrl()
    };

  } catch (error) {
    Logger.log('Error exporting to JSON: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Alternative: Create a menu item for easy access
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Digital Toolkit')
    .addItem('Export to JSON', 'exportDashboardToJSON')
    .addToUi();
}

/**
 * Creates a sample JSON file with mock data for testing
 * Use this if you want to test the Cloudflare Worker without connecting to Google Sheets
 */
function createSampleJSON() {
  const sampleData = {
    wholeSchool: {
      apps: [
        {
          product: "Google Workspace",
          division: "Whole School",
          department: "School Operations",
          subject: "Productivity",
          budget: "IT",
          licenseType: "Site",
          licenses: 1500,
          category: "Productivity Suite",
          website: "https://workspace.google.com",
          spend: "$150,000"
        },
        {
          product: "Canvas LMS",
          division: "Whole School",
          department: "School Operations",
          subject: "Learning Management",
          budget: "IT",
          licenseType: "Enterprise",
          licenses: 1500,
          category: "LMS",
          website: "https://canvas.instructure.com",
          spend: "$75,000"
        }
      ],
      everyoneApps: [
        {
          product: "Google Workspace",
          division: "Whole School",
          department: "School Operations",
          subject: "Productivity",
          budget: "IT",
          licenseType: "Site",
          licenses: 1500,
          category: "Productivity Suite",
          website: "https://workspace.google.com",
          spend: "$150,000"
        }
      ],
      byDepartment: {
        "Technology": [
          {
            product: "GitHub Enterprise",
            division: "Whole School",
            department: "Technology",
            subject: "Computer Science",
            budget: "IT",
            licenseType: "Individual",
            licenses: 50,
            category: "Development",
            website: "https://github.com",
            spend: "$5,000"
          }
        ]
      }
    },
    elementary: {
      apps: [],
      everyoneApps: [],
      byDepartment: {}
    },
    middleSchool: {
      apps: [],
      everyoneApps: [],
      byDepartment: {}
    },
    highSchool: {
      apps: [],
      everyoneApps: [],
      byDepartment: {}
    },
    stats: {
      totalApps: 2,
      wholeSchoolCount: 2,
      elementaryCount: 0,
      middleSchoolCount: 0,
      highSchoolCount: 0
    }
  };

  const jsonString = JSON.stringify(sampleData, null, 2);
  Logger.log('=== SAMPLE JSON DATA ===');
  Logger.log(jsonString);
  Logger.log('=== END SAMPLE DATA ===');

  return jsonString;
}
