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

    // Construct the prompt
    const systemPrompt = `You are an educational technology assistant for Singapore American School. Your job is to help teachers, staff, students, and parents find the right digital tools from our toolkit.`;

    const userPrompt = `Available Apps Database:
${JSON.stringify(appContext, null, 2)}

User Question: "${userQuery}"

Please analyze the user's question and recommend 3-5 most relevant apps from the database above. For each recommendation:
1. Explain WHY it matches their needs
2. Highlight key features (SSO, Mobile, Grade Levels)
3. Mention who it's best suited for (audience)

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
