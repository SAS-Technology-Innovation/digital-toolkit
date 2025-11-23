/**
 * @OnlyCurrentDoc
 */

// --- CONFIGURATION ---
// Configuration is managed via Script Properties.
// In the Apps Script Editor, go to Project Settings (gear icon) > Script Properties.
// Add properties for SPREADSHEET_ID, SHEET_NAME, GEMINI_API_KEY, and CLAUDE_API_KEY.

/**
 * Creates a custom menu in Google Sheets for data management
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🤖 Digital Toolkit Admin')
    .addItem('📊 Validate Data', 'validateAllData')
    .addItem('✨ Enrich Missing Descriptions', 'enrichMissingDescriptions')
    .addItem('🔍 Find Missing Fields', 'findMissingFields')
    .addItem('🔄 Refresh All Missing Data', 'enrichAllMissingData')
    .addSeparator()
    .addItem('🧪 Test Claude Connection', 'testClaude')
    .addItem('🧪 Test Gemini Connection', 'testGemini')
    .addToUi();
}

/**
 * Serves the HTML content of the web app.
 * Use ?page=signage to display the digital signage slideshow
 */
function doGet(e) {
  const page = e.parameter.page || 'index';

  if (page === 'signage') {
    return HtmlService.createTemplateFromFile('signage').evaluate()
      .setTitle('SAS Digital Toolkit - Signage')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // Default to main dashboard
  return HtmlService.createTemplateFromFile('index').evaluate()
    .setTitle('SAS Apps Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Processes AI query using selected AI provider (Gemini or Claude)
 */
function queryAI(userQuery, allAppsData, provider) {
  try {
    provider = provider || 'gemini'; // Default to Gemini

    // Parse apps data
    const apps = JSON.parse(allAppsData);

    // Create a simplified app list for context (to reduce token usage)
    const appContext = apps.map(app => ({
      name: app.product,
      description: app.description || '',
      category: app.category,
      subject: app.subject,
      division: app.division,
      audience: app.audience,
      gradeLevels: app.gradeLevels,
      sso: app.ssoEnabled,
      mobile: app.mobileApp
    }));

    // Construct the prompt with safety guardrails and moderation
    const systemPrompt = `You are an educational technology assistant for Singapore American School. Your job is to help teachers, staff, students, and parents find the right digital tools from our toolkit.

CRITICAL SAFETY AND CONTENT GUIDELINES:
1. ONLY recommend apps that exist in the provided database below
2. NEVER recommend or mention apps, tools, or websites not in the database
3. If asked about apps not in the database, guide them through the app request process
4. Reject any harmful, harassing, discriminatory, or inappropriate requests
5. Do not provide advice on topics outside of educational technology selection
6. Maintain a professional, respectful, and educational tone at all times
7. If a question seems inappropriate or off-topic, redirect to appropriate educational technology queries

This is a CLOSED SYSTEM - you can ONLY discuss and recommend apps from the provided database.

APP REQUEST PROCESS:
When an app is not available, guide users through these steps:
1. Search the current toolkit for similar tools that might meet their needs
2. Talk to their department lead or PLC coach about requirements
3. If no solution is found, follow the formal app request process with this information:
   - What problem or opportunity does this tool seek to address?
   - Which grade level and subject areas will this tool serve and for what purpose?
   - How will you measure the impact or success of this tool?
   - What other tools or alternatives have you considered?
   - Do you foresee any training or support needs for this tool? If so, what kind?
   - What is the cost, how many licenses will you need, and who will be using the tool?`;

    const userPrompt = `Available Apps Database (ONLY source of truth):
${JSON.stringify(appContext, null, 2)}

User Question: "${userQuery}"

INSTRUCTIONS:
- First, check if the question is appropriate and related to educational technology
- If inappropriate, harmful, or off-topic, respond: "I can only help with educational technology recommendations from the SAS Digital Toolkit. Please ask about available apps for teaching, learning, or school operations."
- If appropriate, analyze the question and recommend 3-5 most relevant apps FROM THE DATABASE ABOVE ONLY
- For each recommendation:
  1. Explain WHY it matches their needs
  2. Highlight key features (SSO, Mobile, Grade Levels)
  3. Mention who it's best suited for (audience)
- If asked about an app not in the database, provide this response:

"That app is not currently available in the SAS Digital Toolkit. Here's what I recommend:

**First, explore alternatives:** Let me suggest similar tools we do have that might meet your needs: [suggest 2-3 alternatives from database with brief explanations]

**If none of these work for you:**
1. Search our toolkit thoroughly to ensure there isn't a similar solution
2. Talk to your department lead or PLC coach about your specific requirements
3. Follow the App Request Process with this information:
   - What problem or opportunity does this tool seek to address?
   - Which grade level and subject areas will this tool serve and for what purpose (e.g., classroom instruction, homework, assessment, differentiation, communication, data tracking)?
   - How will you measure the impact or success of this tool?
   - What other tools or alternatives have you considered?
   - Do you foresee any training or support needs for this tool? If so, what kind?
   - What is the cost, how many licenses will you need, and who will be using the tool?"

Format your response as a conversational, friendly answer. Be concise but helpful.`;

    if (provider.toLowerCase() === 'claude') {
      return queryClaudeAPI(systemPrompt, userPrompt, userQuery);
    } else {
      return queryGeminiAPI(systemPrompt, userPrompt, userQuery);
    }

  } catch (error) {
    Logger.log('Error in queryAI: ' + error.message);
    return JSON.stringify({
      error: 'Failed to process AI query: ' + error.message
    });
  }
}

/**
 * Query Gemini API
 */
function queryGeminiAPI(systemPrompt, userPrompt, userQuery) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const GEMINI_API_KEY = scriptProperties.getProperty('GEMINI_API_KEY');

  if (!GEMINI_API_KEY) {
    return JSON.stringify({
      error: 'Gemini API key not configured. Please set GEMINI_API_KEY in Script Properties.'
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [{
      parts: [{
        text: systemPrompt + '\n\n' + userPrompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (responseCode !== 200) {
    Logger.log('Gemini API Error: ' + responseText);
    return JSON.stringify({
      error: 'Gemini AI temporarily unavailable. Try Claude or try again later.'
    });
  }

  const result = JSON.parse(responseText);

  if (result.candidates && result.candidates.length > 0) {
    const aiResponse = result.candidates[0].content.parts[0].text;

    return JSON.stringify({
      success: true,
      response: aiResponse,
      query: userQuery,
      provider: 'gemini'
    });
  } else {
    return JSON.stringify({
      error: 'No response from Gemini. Please rephrase your question.'
    });
  }
}

/**
 * Query Claude API (Anthropic)
 */
function queryClaudeAPI(systemPrompt, userPrompt, userQuery) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const CLAUDE_API_KEY = scriptProperties.getProperty('CLAUDE_API_KEY');

  if (!CLAUDE_API_KEY) {
    return JSON.stringify({
      error: 'Claude API key not configured. Please set CLAUDE_API_KEY in Script Properties.'
    });
  }

  const url = 'https://api.anthropic.com/v1/messages';

  const payload = {
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: [{
        type: 'text',
        text: userPrompt
      }]
    }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (responseCode !== 200) {
    Logger.log('Claude API Error: ' + responseText);
    return JSON.stringify({
      error: 'Claude AI temporarily unavailable. Try Gemini or try again later.'
    });
  }

  const result = JSON.parse(responseText);

  if (result.content && result.content.length > 0) {
    const aiResponse = result.content[0].text;

    return JSON.stringify({
      success: true,
      response: aiResponse,
      query: userQuery,
      provider: 'claude'
    });
  } else {
    return JSON.stringify({
      error: 'No response from Claude. Please rephrase your question.'
    });
  }
}

/**
 * TEST FUNCTION: Test Gemini API connection
 * Run this from Apps Script Editor to test Gemini integration
 */
function testGemini() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const GEMINI_API_KEY = scriptProperties.getProperty('GEMINI_API_KEY');

  Logger.log('=== GEMINI API TEST ===');
  Logger.log('API Key configured: ' + (GEMINI_API_KEY ? 'YES (length: ' + GEMINI_API_KEY.length + ')' : 'NO'));

  if (!GEMINI_API_KEY) {
    Logger.log('ERROR: GEMINI_API_KEY not found in Script Properties');
    return 'ERROR: API key not configured';
  }

  const testPrompt = 'Hello! Can you recommend a math app?';
  const mockAppData = [{
    name: 'Khan Academy',
    description: 'Free math practice',
    category: 'Math',
    subject: 'Mathematics',
    division: 'Whole School',
    audience: 'Students,Teachers',
    gradeLevels: 'K-12',
    sso: true,
    mobile: 'Yes'
  }];

  const systemPrompt = 'You are an educational technology assistant.';
  const userPrompt = `Available Apps: ${JSON.stringify(mockAppData)}\n\nUser Question: "${testPrompt}"\n\nRecommend relevant apps.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [{
      parts: [{
        text: systemPrompt + '\n\n' + userPrompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024
    }
  };

  Logger.log('Request URL: ' + url.replace(GEMINI_API_KEY, 'API_KEY_HIDDEN'));
  Logger.log('Request Payload: ' + JSON.stringify(payload, null, 2));

  try {
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log('Response Code: ' + responseCode);
    Logger.log('Response Body: ' + responseText);

    if (responseCode === 200) {
      const result = JSON.parse(responseText);
      if (result.candidates && result.candidates.length > 0) {
        const aiResponse = result.candidates[0].content.parts[0].text;
        Logger.log('SUCCESS! AI Response: ' + aiResponse);
        return 'SUCCESS: ' + aiResponse;
      }
    } else {
      Logger.log('ERROR: HTTP ' + responseCode);
      return 'ERROR: HTTP ' + responseCode + ' - ' + responseText;
    }
  } catch (error) {
    Logger.log('EXCEPTION: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return 'EXCEPTION: ' + error.message;
  }
}

/**
 * TEST FUNCTION: Test Claude API connection
 * Run this from Apps Script Editor to test Claude integration
 */
function testClaude() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const CLAUDE_API_KEY = scriptProperties.getProperty('CLAUDE_API_KEY');

  Logger.log('=== CLAUDE API TEST ===');
  Logger.log('API Key configured: ' + (CLAUDE_API_KEY ? 'YES (length: ' + CLAUDE_API_KEY.length + ')' : 'NO'));

  if (!CLAUDE_API_KEY) {
    Logger.log('ERROR: CLAUDE_API_KEY not found in Script Properties');
    return 'ERROR: API key not configured';
  }

  const testPrompt = 'Hello! Can you recommend a math app?';
  const mockAppData = [{
    name: 'Khan Academy',
    description: 'Free math practice',
    category: 'Math',
    subject: 'Mathematics',
    division: 'Whole School',
    audience: 'Students,Teachers',
    gradeLevels: 'K-12',
    sso: true,
    mobile: 'Yes'
  }];

  const systemPrompt = 'You are an educational technology assistant.';
  const userPrompt = `Available Apps: ${JSON.stringify(mockAppData)}\n\nUser Question: "${testPrompt}"\n\nRecommend relevant apps.`;

  const url = 'https://api.anthropic.com/v1/messages';

  const payload = {
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: [{
        type: 'text',
        text: userPrompt
      }]
    }]
  };

  Logger.log('Request URL: ' + url);
  Logger.log('Request Payload: ' + JSON.stringify(payload, null, 2));
  Logger.log('API Key (first 10 chars): ' + CLAUDE_API_KEY.substring(0, 10) + '...');

  try {
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log('Response Code: ' + responseCode);
    Logger.log('Response Body: ' + responseText);

    if (responseCode === 200) {
      const result = JSON.parse(responseText);
      if (result.content && result.content.length > 0) {
        const aiResponse = result.content[0].text;
        Logger.log('SUCCESS! AI Response: ' + aiResponse);
        return 'SUCCESS: ' + aiResponse;
      }
    } else {
      Logger.log('ERROR: HTTP ' + responseCode);
      return 'ERROR: HTTP ' + responseCode + ' - ' + responseText;
    }
  } catch (error) {
    Logger.log('EXCEPTION: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return 'EXCEPTION: ' + error.message;
  }
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

// ==========================================
// DATA MANAGEMENT & ENRICHMENT FUNCTIONS
// ==========================================

/**
 * Validates all data and reports issues
 */
function validateAllData() {
  const ui = SpreadsheetApp.getUi();
  const scriptProperties = PropertiesService.getScriptProperties();
  const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
  const SHEET_NAME = scriptProperties.getProperty('SHEET_NAME');

  if (!SPREADSHEET_ID || !SHEET_NAME) {
    ui.alert('❌ Configuration Error', 'SPREADSHEET_ID and SHEET_NAME must be set in Script Properties.', ui.ButtonSet.OK);
    return;
  }

  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const dataRows = values.slice(1);

    const issues = [];
    const requiredFields = ['product_name', 'description', 'Division', 'Department', 'Category', 'Website'];

    dataRows.forEach((row, index) => {
      const rowNum = index + 2; // +2 because: 0-indexed + header row
      const isActive = row[headers.indexOf('Active')] === true || row[headers.indexOf('Active')].toString().toLowerCase() === 'true';

      if (!isActive) return; // Skip inactive apps

      const appName = row[headers.indexOf('product_name')] || `Row ${rowNum}`;

      requiredFields.forEach(field => {
        const colIndex = headers.indexOf(field);
        if (colIndex === -1) {
          issues.push(`❌ Column "${field}" not found in sheet`);
        } else if (!row[colIndex] || row[colIndex].toString().trim() === '') {
          issues.push(`⚠️ Row ${rowNum} (${appName}): Missing "${field}"`);
        }
      });
    });

    if (issues.length === 0) {
      ui.alert('✅ Validation Complete', 'All active apps have required fields!', ui.ButtonSet.OK);
    } else {
      const message = `Found ${issues.length} issue(s):\n\n` + issues.slice(0, 20).join('\n') +
                      (issues.length > 20 ? `\n\n... and ${issues.length - 20} more issues.` : '');
      ui.alert('⚠️ Validation Issues Found', message, ui.ButtonSet.OK);
      Logger.log('Validation Issues:\n' + issues.join('\n'));
    }
  } catch (error) {
    ui.alert('❌ Error', 'Validation failed: ' + error.message, ui.ButtonSet.OK);
    Logger.log('Validation error: ' + error.message);
  }
}

/**
 * Finds all rows with missing fields and displays report
 */
function findMissingFields() {
  const ui = SpreadsheetApp.getUi();
  const scriptProperties = PropertiesService.getScriptProperties();
  const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
  const SHEET_NAME = scriptProperties.getProperty('SHEET_NAME');

  if (!SPREADSHEET_ID || !SHEET_NAME) {
    ui.alert('❌ Configuration Error', 'SPREADSHEET_ID and SHEET_NAME must be set in Script Properties.', ui.ButtonSet.OK);
    return;
  }

  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const dataRows = values.slice(1);

    const missingData = {
      description: [],
      category: [],
      audience: [],
      gradeLevels: [],
      logoUrl: []
    };

    dataRows.forEach((row, index) => {
      const rowNum = index + 2;
      const isActive = row[headers.indexOf('Active')] === true || row[headers.indexOf('Active')].toString().toLowerCase() === 'true';

      if (!isActive) return;

      const appName = row[headers.indexOf('product_name')] || `Row ${rowNum}`;

      if (!row[headers.indexOf('description')] || row[headers.indexOf('description')].toString().trim() === '') {
        missingData.description.push(`${appName} (Row ${rowNum})`);
      }
      if (!row[headers.indexOf('Category')] || row[headers.indexOf('Category')].toString().trim() === '') {
        missingData.category.push(`${appName} (Row ${rowNum})`);
      }
      if (!row[headers.indexOf('audience')] || row[headers.indexOf('audience')].toString().trim() === '') {
        missingData.audience.push(`${appName} (Row ${rowNum})`);
      }
      if (!row[headers.indexOf('grade_levels')] || row[headers.indexOf('grade_levels')].toString().trim() === '') {
        missingData.gradeLevels.push(`${appName} (Row ${rowNum})`);
      }
      if (!row[headers.indexOf('logo_url')] || row[headers.indexOf('logo_url')].toString().trim() === '') {
        missingData.logoUrl.push(`${appName} (Row ${rowNum})`);
      }
    });

    const report = [
      `📊 Missing Data Report`,
      ``,
      `Missing Descriptions: ${missingData.description.length}`,
      missingData.description.slice(0, 5).join('\n'),
      missingData.description.length > 5 ? `... and ${missingData.description.length - 5} more` : '',
      ``,
      `Missing Categories: ${missingData.category.length}`,
      missingData.category.slice(0, 5).join('\n'),
      ``,
      `Missing Audience: ${missingData.audience.length}`,
      missingData.audience.slice(0, 5).join('\n'),
      ``,
      `Missing Grade Levels: ${missingData.gradeLevels.length}`,
      missingData.gradeLevels.slice(0, 5).join('\n'),
      ``,
      `Missing Logos: ${missingData.logoUrl.length}`,
      missingData.logoUrl.slice(0, 5).join('\n')
    ].filter(line => line !== undefined).join('\n');

    ui.alert('🔍 Missing Fields Report', report, ui.ButtonSet.OK);
    Logger.log('Missing Fields Report:\n' + report);

  } catch (error) {
    ui.alert('❌ Error', 'Failed to analyze missing fields: ' + error.message, ui.ButtonSet.OK);
    Logger.log('Missing fields analysis error: ' + error.message);
  }
}

/**
 * Enriches apps with missing descriptions using Claude AI
 */
function enrichMissingDescriptions() {
  const ui = SpreadsheetApp.getUi();
  const scriptProperties = PropertiesService.getScriptProperties();
  const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
  const SHEET_NAME = scriptProperties.getProperty('SHEET_NAME');
  const CLAUDE_API_KEY = scriptProperties.getProperty('CLAUDE_API_KEY');

  if (!CLAUDE_API_KEY) {
    ui.alert('❌ Configuration Error', 'CLAUDE_API_KEY must be set in Script Properties for data enrichment.', ui.ButtonSet.OK);
    return;
  }

  const response = ui.alert(
    '✨ Enrich Missing Descriptions',
    'This will use Claude AI to generate descriptions for apps that are missing them. This operation may take several minutes. Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const dataRows = values.slice(1);

    const descriptionCol = headers.indexOf('description');
    const productCol = headers.indexOf('product_name');
    const categoryCol = headers.indexOf('Category');
    const websiteCol = headers.indexOf('Website');
    const subjectCol = headers.indexOf('subjects_or_department');

    let enrichedCount = 0;
    const maxToEnrich = 10; // Limit to prevent quota issues

    dataRows.forEach((row, index) => {
      if (enrichedCount >= maxToEnrich) return;

      const rowNum = index + 2;
      const isActive = row[headers.indexOf('Active')] === true || row[headers.indexOf('Active')].toString().toLowerCase() === 'true';

      if (!isActive) return;

      const description = row[descriptionCol];
      const productName = row[productCol];

      if (!description || description.toString().trim() === '') {
        const category = row[categoryCol] || 'Unknown';
        const website = row[websiteCol] || '';
        const subject = row[subjectCol] || '';

        const generatedDesc = generateDescriptionWithClaude(productName, category, website, subject);

        if (generatedDesc && generatedDesc !== 'ERROR') {
          sheet.getRange(rowNum, descriptionCol + 1).setValue(generatedDesc);
          enrichedCount++;
          Logger.log(`Enriched description for ${productName} (Row ${rowNum})`);
          SpreadsheetApp.flush(); // Save immediately
        }
      }
    });

    ui.alert('✅ Enrichment Complete', `Successfully generated descriptions for ${enrichedCount} app(s).`, ui.ButtonSet.OK);

  } catch (error) {
    ui.alert('❌ Error', 'Enrichment failed: ' + error.message, ui.ButtonSet.OK);
    Logger.log('Enrichment error: ' + error.message);
  }
}

/**
 * Enriches ALL missing data (descriptions, categories, audience, grade levels) using Claude AI
 */
function enrichAllMissingData() {
  const ui = SpreadsheetApp.getUi();
  const scriptProperties = PropertiesService.getScriptProperties();
  const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
  const SHEET_NAME = scriptProperties.getProperty('SHEET_NAME');
  const CLAUDE_API_KEY = scriptProperties.getProperty('CLAUDE_API_KEY');

  if (!CLAUDE_API_KEY) {
    ui.alert('❌ Configuration Error', 'CLAUDE_API_KEY must be set in Script Properties for data enrichment.', ui.ButtonSet.OK);
    return;
  }

  const response = ui.alert(
    '🔄 Enrich All Missing Data',
    'This will use Claude AI to fill in ALL missing fields (descriptions, categories, audience, grade levels). This operation may take several minutes and use significant API quota. Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const dataRows = values.slice(1);

    const colMap = {
      description: headers.indexOf('description'),
      category: headers.indexOf('Category'),
      audience: headers.indexOf('audience'),
      gradeLevels: headers.indexOf('grade_levels'),
      product: headers.indexOf('product_name'),
      website: headers.indexOf('Website'),
      subject: headers.indexOf('subjects_or_department'),
      division: headers.indexOf('Division')
    };

    let enrichedCount = 0;
    const maxToEnrich = 15; // Limit to prevent quota issues

    dataRows.forEach((row, index) => {
      if (enrichedCount >= maxToEnrich) return;

      const rowNum = index + 2;
      const isActive = row[headers.indexOf('Active')] === true || row[headers.indexOf('Active')].toString().toLowerCase() === 'true';

      if (!isActive) return;

      const productName = row[colMap.product];
      const hasMissingData = !row[colMap.description] || !row[colMap.category] || !row[colMap.audience] || !row[colMap.gradeLevels];

      if (hasMissingData) {
        const enrichedData = enrichAppDataWithClaude({
          productName: productName,
          website: row[colMap.website] || '',
          subject: row[colMap.subject] || '',
          division: row[colMap.division] || '',
          currentDescription: row[colMap.description] || '',
          currentCategory: row[colMap.category] || '',
          currentAudience: row[colMap.audience] || '',
          currentGradeLevels: row[colMap.gradeLevels] || ''
        });

        if (enrichedData && enrichedData !== 'ERROR') {
          if (enrichedData.description && !row[colMap.description]) {
            sheet.getRange(rowNum, colMap.description + 1).setValue(enrichedData.description);
          }
          if (enrichedData.category && !row[colMap.category]) {
            sheet.getRange(rowNum, colMap.category + 1).setValue(enrichedData.category);
          }
          if (enrichedData.audience && !row[colMap.audience]) {
            sheet.getRange(rowNum, colMap.audience + 1).setValue(enrichedData.audience);
          }
          if (enrichedData.gradeLevels && !row[colMap.gradeLevels]) {
            sheet.getRange(rowNum, colMap.gradeLevels + 1).setValue(enrichedData.gradeLevels);
          }

          enrichedCount++;
          Logger.log(`Enriched data for ${productName} (Row ${rowNum})`);
          SpreadsheetApp.flush(); // Save immediately
          Utilities.sleep(1000); // Rate limiting
        }
      }
    });

    ui.alert('✅ Enrichment Complete', `Successfully enriched ${enrichedCount} app(s) with missing data.`, ui.ButtonSet.OK);

  } catch (error) {
    ui.alert('❌ Error', 'Enrichment failed: ' + error.message, ui.ButtonSet.OK);
    Logger.log('Full enrichment error: ' + error.message);
  }
}

/**
 * Helper: Generates description for an app using Claude AI
 */
function generateDescriptionWithClaude(productName, category, website, subject) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const CLAUDE_API_KEY = scriptProperties.getProperty('CLAUDE_API_KEY');

  if (!CLAUDE_API_KEY) {
    return 'ERROR';
  }

  const prompt = `Generate a concise, educational 1-2 sentence description for this app:

App Name: ${productName}
Category: ${category}
Subject: ${subject}
Website: ${website}

Write a clear description suitable for teachers and staff at an international school. Focus on what the app does and who it's for. Do not include promotional language or marketing speak. Just the facts.

Return ONLY the description text, nothing else.`;

  const url = 'https://api.anthropic.com/v1/messages';
  const payload = {
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: [{
        type: 'text',
        text: prompt
      }]
    }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();

    if (responseCode === 200) {
      const result = JSON.parse(response.getContentText());
      if (result.content && result.content.length > 0) {
        return result.content[0].text.trim();
      }
    }

    Logger.log('Claude API error for ' + productName + ': HTTP ' + responseCode);
    return 'ERROR';

  } catch (error) {
    Logger.log('Error generating description for ' + productName + ': ' + error.message);
    return 'ERROR';
  }
}

/**
 * Helper: Enriches app data with all missing fields using Claude AI
 */
function enrichAppDataWithClaude(appData) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const CLAUDE_API_KEY = scriptProperties.getProperty('CLAUDE_API_KEY');

  if (!CLAUDE_API_KEY) {
    return 'ERROR';
  }

  const prompt = `You are helping to enrich educational app data for Singapore American School. Analyze this app and fill in missing information:

App Name: ${appData.productName}
Website: ${appData.website}
Subject: ${appData.subject}
Division: ${appData.division}

Current Data:
- Description: ${appData.currentDescription || '[MISSING]'}
- Category: ${appData.currentCategory || '[MISSING]'}
- Audience: ${appData.currentAudience || '[MISSING]'}
- Grade Levels: ${appData.currentGradeLevels || '[MISSING]'}

Please provide the missing data in JSON format. Use these guidelines:
- Description: 1-2 concise sentences about what the app does
- Category: Choose ONE from: Learning Management, Content Creation, Assessment, Math Tools, Language Arts, Science, Design, Productivity, Communication, Research, Programming
- Audience: Comma-separated from: Teachers, Students, Staff, Parents
- Grade Levels: Use format like "K-5", "6-8", "9-12", or "K-12" based on the division

Return ONLY valid JSON in this exact format:
{
  "description": "...",
  "category": "...",
  "audience": "...",
  "gradeLevels": "..."
}`;

  const url = 'https://api.anthropic.com/v1/messages';
  const payload = {
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: [{
        type: 'text',
        text: prompt
      }]
    }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();

    if (responseCode === 200) {
      const result = JSON.parse(response.getContentText());
      if (result.content && result.content.length > 0) {
        const responseText = result.content[0].text.trim();

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    }

    Logger.log('Claude API error for ' + appData.productName + ': HTTP ' + responseCode);
    return 'ERROR';

  } catch (error) {
    Logger.log('Error enriching data for ' + appData.productName + ': ' + error.message);
    return 'ERROR';
  }
}

/**
 * Tests Claude API connection
 */
function testClaude() {
  const ui = SpreadsheetApp.getUi();
  const scriptProperties = PropertiesService.getScriptProperties();
  const CLAUDE_API_KEY = scriptProperties.getProperty('CLAUDE_API_KEY');

  if (!CLAUDE_API_KEY) {
    ui.alert('❌ Configuration Error', 'CLAUDE_API_KEY is not set in Script Properties.', ui.ButtonSet.OK);
    return;
  }

  const testResult = generateDescriptionWithClaude('Google Classroom', 'Learning Management', 'https://classroom.google.com', 'Education');

  if (testResult && testResult !== 'ERROR') {
    ui.alert('✅ Claude Connection Successful', 'API key is valid and working!\n\nSample response: ' + testResult.substring(0, 200) + '...', ui.ButtonSet.OK);
  } else {
    ui.alert('❌ Claude Connection Failed', 'Check Apps Script logs for details: npm run logs', ui.ButtonSet.OK);
  }
}

/**
 * Tests Gemini API connection
 */
function testGemini() {
  const ui = SpreadsheetApp.getUi();
  const scriptProperties = PropertiesService.getScriptProperties();
  const GEMINI_API_KEY = scriptProperties.getProperty('GEMINI_API_KEY');

  if (!GEMINI_API_KEY) {
    ui.alert('❌ Configuration Error', 'GEMINI_API_KEY is not set in Script Properties.', ui.ButtonSet.OK);
    return;
  }

  // Simple test prompt
  const testPrompt = 'Respond with "API connection successful" if you receive this message.';
  const testResult = queryGeminiAPI('You are a test assistant.', testPrompt, 'test');

  if (testResult && !testResult.includes('error') && !testResult.includes('ERROR')) {
    ui.alert('✅ Gemini Connection Successful', 'API key is valid and working!', ui.ButtonSet.OK);
  } else {
    ui.alert('❌ Gemini Connection Failed', 'Check Apps Script logs for details: npm run logs', ui.ButtonSet.OK);
  }
}
