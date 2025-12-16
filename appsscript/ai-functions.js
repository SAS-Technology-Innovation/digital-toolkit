/**
 * AI Functions Module
 * Consolidated AI-related functionality for the SAS Digital Toolkit
 *
 * This module contains:
 * - User-facing AI chat (Gemini/Claude) for app recommendations
 * - Admin AI enrichment functions (Claude) for data management
 * - Analytics AI for dashboard insights
 * - AI query logging and pattern analysis
 * - Test functions for API connections
 *
 * @fileoverview AI integration layer for the Digital Toolkit
 * @author SAS Technology Innovation Team
 *
 * IMPORTANT GUARDRAILS:
 * - AI only uses apps from the Google Sheet database (closed system)
 * - Rejects inappropriate/harmful/off-topic requests
 * - Guides users to app request process for missing tools
 * - Professional, educational tone at all times
 * - Fixed context around Digital Toolkit data only
 *
 * @requires utilities.js - Shared helper functions (AI_MODELS constant, etc.)
 */

// ==========================================
// CONFIGURATION HELPERS
// ==========================================

/**
 * Gets Claude API key from Script Properties
 *
 * @returns {string|null} The Claude API key, or null if not configured
 * @private
 */
function getClaudeApiKey() {
  return PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
}

/**
 * Gets Gemini API key from Script Properties
 *
 * @returns {string|null} The Gemini API key, or null if not configured
 * @private
 */
function getGeminiApiKey() {
  return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
}

/**
 * Valid AI providers for the queryAI function
 * @constant {string[]}
 * @private
 */
const VALID_AI_PROVIDERS = ['gemini', 'claude'];

// ==========================================
// USER-FACING AI CHAT FUNCTIONS
// ==========================================

/**
 * Processes AI query using selected AI provider (Gemini or Claude)
 * Used by the dashboard AI chat feature for app recommendations
 *
 * SAFETY GUARDRAILS:
 * - Only recommends apps from the provided database (closed system)
 * - Rejects inappropriate, harmful, or off-topic requests
 * - Guides users through app request process for missing tools
 * - Maintains professional, educational tone
 *
 * @param {string} userQuery - The user's question or request
 * @param {string} allAppsData - JSON string of all apps from the dashboard
 * @param {string} [provider='gemini'] - AI provider to use ('gemini' or 'claude')
 * @returns {string} JSON string with success/error response
 *
 * @example
 * // From the dashboard frontend:
 * google.script.run
 *   .withSuccessHandler(handleAIResponse)
 *   .queryAI("What apps can I use for math?", JSON.stringify(apps), "gemini");
 */
function queryAI(userQuery, allAppsData, provider) {
  try {
    provider = provider || 'gemini'; // Default to Gemini

    // Validate provider
    if (!VALID_AI_PROVIDERS.includes(provider.toLowerCase())) {
      return JSON.stringify({
        success: false,
        error: `Invalid AI provider: ${provider}. Valid options: ${VALID_AI_PROVIDERS.join(', ')}`
      });
    }

    // Safely parse apps data with error handling
    let apps;
    try {
      apps = JSON.parse(allAppsData);
    } catch (parseError) {
      Logger.log('Error parsing apps data: ' + parseError.message);
      return JSON.stringify({
        success: false,
        error: 'Invalid app data format. Please refresh the page and try again.'
      });
    }

    // Validate apps is an array
    if (!Array.isArray(apps)) {
      return JSON.stringify({
        success: false,
        error: 'App data must be an array. Please refresh the page and try again.'
      });
    }

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
 * Queries Gemini API for user-facing chat responses
 * Used for app recommendations and educational technology assistance
 *
 * @param {string} systemPrompt - System instructions defining AI behavior and guardrails
 * @param {string} userPrompt - The full prompt including app database and user question
 * @param {string} userQuery - The original user question (for logging)
 * @returns {string} JSON string with success/error response
 *
 * @private
 * @see queryAI - The main entry point that calls this function
 */
function queryGeminiAPI(systemPrompt, userPrompt, userQuery) {
  const GEMINI_API_KEY = getGeminiApiKey();

  if (!GEMINI_API_KEY) {
    return JSON.stringify({
      error: 'Gemini API key not configured. Please set GEMINI_API_KEY in Script Properties.'
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.GEMINI_CHAT}:generateContent?key=${GEMINI_API_KEY}`;

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

    // Extract app names from response for analytics
    const appMentions = extractAppNames(aiResponse);

    // Log the query for analytics
    logAIQuery(userQuery, aiResponse, appMentions);

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
 * Queries Claude API for user-facing chat responses
 * Used for app recommendations and educational technology assistance
 *
 * @param {string} systemPrompt - System instructions defining AI behavior and guardrails
 * @param {string} userPrompt - The full prompt including app database and user question
 * @param {string} userQuery - The original user question (for logging)
 * @returns {string} JSON string with success/error response
 *
 * @private
 * @see queryAI - The main entry point that calls this function
 */
function queryClaudeAPI(systemPrompt, userPrompt, userQuery) {
  const CLAUDE_API_KEY = getClaudeApiKey();

  if (!CLAUDE_API_KEY) {
    return JSON.stringify({
      error: 'Claude API key not configured. Please set CLAUDE_API_KEY in Script Properties.'
    });
  }

  const url = 'https://api.anthropic.com/v1/messages';

  const payload = {
    model: AI_MODELS.CLAUDE_FAST, // Using Haiku (smallest/cheapest model) for user queries
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

    // Extract app names from response for analytics
    const appMentions = extractAppNames(aiResponse);

    // Log the query for analytics
    logAIQuery(userQuery, aiResponse, appMentions);

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

// ==========================================
// ADMIN AI ENRICHMENT FUNCTIONS
// ==========================================

/**
 * Generates a concise, educational description for an app using Claude AI
 * Creates 1-2 sentence descriptions suitable for international school educators
 *
 * @param {string} productName - Name of the app/product
 * @param {string} category - App category (e.g., "Learning Management")
 * @param {string} website - App's official website URL
 * @param {string} subject - Subject area the app is used for
 * @returns {string} Generated description, or 'ERROR' if generation fails
 *
 * @example
 * const desc = generateDescriptionWithClaude(
 *   'Google Classroom',
 *   'Learning Management',
 *   'https://classroom.google.com',
 *   'All Subjects'
 * );
 *
 * @see enrichMissingDescriptions - Bulk operation that uses this function
 */
function generateDescriptionWithClaude(productName, category, website, subject) {
  const CLAUDE_API_KEY = getClaudeApiKey();

  if (!CLAUDE_API_KEY) return 'ERROR';

  const prompt = `Generate a concise, educational 1-2 sentence description for this app:

App Name: ${productName}
Category: ${category}
Subject: ${subject}
Website: ${website}

Write a clear description suitable for teachers and staff at an international school. Focus on what the app does and who it's for. Do not include promotional language or marketing speak. Just the facts.

Return ONLY the description text, nothing else.`;

  const url = 'https://api.anthropic.com/v1/messages';
  const payload = {
    model: AI_MODELS.CLAUDE_FAST, // Haiku for faster responses
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: [{ type: 'text', text: prompt }]
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
 * Enriches app data with all missing fields using Claude AI
 * Returns structured JSON with generated values for empty fields
 *
 * Fields that can be enriched:
 * - description: 1-2 sentence factual description
 * - category: Tool/application type (NOT subjects/departments)
 * - website: Official app URL
 * - audience: Teachers, Students, Staff, Parents
 * - gradeLevels: K-5, 6-8, 9-12, or K-12 based on division
 * - supportEmail: School support contact
 * - tutorialLink: Official help/tutorial URL
 * - mobileApp: Yes, No, iOS only, Android only, or iOS/Android
 * - ssoEnabled: true or false
 * - logoUrl: Left empty (fetched via favicon)
 *
 * @param {Object} appData - Current app data with fields to enrich
 * @param {string} appData.productName - Name of the app (required)
 * @param {string} [appData.subject] - Subject area
 * @param {string} [appData.division] - Division assignment
 * @param {string} [appData.currentDescription] - Existing description if any
 * @param {string} [appData.currentCategory] - Existing category if any
 * @param {string} [appData.currentWebsite] - Existing website if any
 * @param {string} [appData.currentAudience] - Existing audience if any
 * @param {string} [appData.currentGradeLevels] - Existing grade levels if any
 * @param {string} [appData.currentSupportEmail] - Existing support email if any
 * @param {string} [appData.currentTutorialLink] - Existing tutorial link if any
 * @param {string} [appData.currentMobileApp] - Existing mobile app status if any
 * @param {*} [appData.currentSsoEnabled] - Existing SSO status if any
 * @param {string} [appData.currentLogoUrl] - Existing logo URL if any
 * @returns {Object|string} Enriched data object, or error object/string
 *
 * @example
 * const enriched = enrichAppDataWithClaude({
 *   productName: 'Kahoot!',
 *   division: 'SAS Middle School',
 *   currentDescription: '',
 *   currentCategory: ''
 * });
 *
 * @see enrichAllMissingData - Bulk operation that uses this function
 */
function enrichAppDataWithClaude(appData) {
  const CLAUDE_API_KEY = getClaudeApiKey();

  if (!CLAUDE_API_KEY) return 'ERROR';

  const prompt = `You are helping to enrich educational app data for Singapore American School. Analyze this app and fill in missing information:

App Name: ${appData.productName}
Subject: ${appData.subject}
Division: ${appData.division}

Current Data:
- Description: ${appData.currentDescription || '[MISSING]'}
- Category: ${appData.currentCategory || '[MISSING]'}
- Website: ${appData.currentWebsite || '[MISSING]'}
- Audience: ${appData.currentAudience || '[MISSING]'}
- Grade Levels: ${appData.currentGradeLevels || '[MISSING]'}
- Support Email: ${appData.currentSupportEmail || '[MISSING]'}
- Tutorial Link: ${appData.currentTutorialLink || '[MISSING]'}
- Mobile App: ${appData.currentMobileApp || '[MISSING]'}
- SSO Enabled: ${appData.currentSsoEnabled !== undefined && appData.currentSsoEnabled !== '' ? appData.currentSsoEnabled : '[MISSING]'}
- Logo URL: ${appData.currentLogoUrl || '[MISSING]'}

Please provide the missing data in JSON format. Use these guidelines:
- Description: 1-2 concise sentences about what the app does (factual, non-promotional)
- Category: Choose EXACTLY ONE tool/application type (NOT subjects or departments - those have separate columns):
  AI Tools, Learning Management System, Assessment Platform, Adaptive Learning, Reading Platform, Practice & Drill, Interactive Content, Video Platform, Screen Recording, Presentation Tool, Design Tool, Digital Whiteboard, Collaboration Tool, Communication Platform, Student Portfolio, Writing Tool, Plagiarism Detection, Coding Platform, Simulation, Research Database, eTextbook, Library System, Student Information System, Scheduling Tool, Device Management, Content Filter, Safety Monitor, Visitor Management, Payment System, HR System, Facilities Management, Transportation, Office Suite, Cloud Storage, Note Taking, Project Management, Professional Development
- Website: Official app website URL (research if missing)
- Audience: Comma-separated from: Teachers, Students, Staff, Parents
- Grade Levels: Format like "K-5", "6-8", "9-12", or "K-12" based on division
- Support Email: School support contact email (use "edtech@sas.edu.sg" for educational technology or "ithelp@sas.edu.sg" for IT support)
- Tutorial Link: Official help/tutorial URL (research if needed)
- Mobile App: "Yes", "No", "iOS only", "Android only", or "iOS/Android"
- SSO Enabled: true or false (boolean)
- Logo URL: Leave empty (will be fetched automatically via favicon)

Return ONLY valid JSON in this exact format:
{
  "description": "...",
  "category": "...",
  "website": "...",
  "audience": "...",
  "gradeLevels": "...",
  "supportEmail": "...",
  "tutorialLink": "...",
  "mobileApp": "...",
  "ssoEnabled": true or false,
  "logoUrl": ""
}`;

  const url = 'https://api.anthropic.com/v1/messages';
  const payload = {
    model: AI_MODELS.CLAUDE_FAST, // Using Haiku for faster, cheaper responses
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: [{ type: 'text', text: prompt }]
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
    const responseText = response.getContentText();

    if (responseCode === 200) {
      const result = JSON.parse(responseText);
      if (result.content && result.content.length > 0) {
        const aiResponseText = result.content[0].text.trim();

        const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (parseError) {
            Logger.log('JSON parse error for ' + appData.productName + ': ' + parseError.message);
            Logger.log('Attempted to parse: ' + jsonMatch[0].substring(0, 200));
            return { error: 'JSON_PARSE_ERROR', details: parseError.message };
          }
        } else {
          Logger.log('No JSON found in response for ' + appData.productName);
          Logger.log('Response text: ' + aiResponseText.substring(0, 200));
          return { error: 'NO_JSON_IN_RESPONSE', response: aiResponseText.substring(0, 200) };
        }
      }
    } else if (responseCode === 429) {
      Logger.log('Rate limit exceeded for ' + appData.productName + ' - will retry with delay');
      return { error: 'RATE_LIMIT', details: 'Too many requests - need delay' };
    } else {
      Logger.log('Claude API error for ' + appData.productName + ': HTTP ' + responseCode);
      Logger.log('Response: ' + responseText.substring(0, 200));
      return { error: 'API_ERROR', code: responseCode, details: responseText.substring(0, 200) };
    }

    return { error: 'UNKNOWN_ERROR', details: 'No content in response' };

  } catch (error) {
    Logger.log('Error enriching data for ' + appData.productName + ': ' + error.message);
    Logger.log('Error stack: ' + error.stack);
    return { error: 'EXCEPTION', details: error.message };
  }
}

// ==========================================
// ANALYTICS AI FUNCTIONS
// ==========================================

/**
 * Handles AI queries for analytics dashboard
 * Uses Claude API to answer questions about app data
 */
function queryAnalyticsAI(query) {
  try {
    const apiKey = getClaudeApiKey();

    if (!apiKey) {
      return 'AI features require CLAUDE_API_KEY to be configured in Script Properties.';
    }

    // Get current app data for context
    const scriptProperties = PropertiesService.getScriptProperties();
    const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
    const SHEET_NAME = scriptProperties.getProperty('SHEET_NAME');

    if (!SPREADSHEET_ID || !SHEET_NAME) {
      return 'Configuration error: SPREADSHEET_ID and SHEET_NAME must be set.';
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const dataRows = values.slice(1);

    // Build data summary for AI context
    const dataSummary = buildDataSummary(headers, dataRows);

    const url = 'https://api.anthropic.com/v1/messages';

    const prompt = `You are an analytics assistant for the SAS Digital Toolkit - an educational technology management system for Singapore American School (a K-12 international school).

Current Data Summary:
${dataSummary}

User Question: ${query}

Instructions:
- Provide concise, actionable insights based on the data
- Use specific numbers and app names when relevant
- Format key points with **bold** for emphasis
- Keep responses under 200 words
- If asked about costs, calculate totals or averages
- If asked about missing data, identify specific gaps
- If asked about recommendations, be practical and specific
- Focus on K-12 educational technology management best practices
- Consider the needs of Elementary (Pre-K to Grade 5), Middle School (Grades 6-8), and High School (Grades 9-12) divisions

Response:`;

    const payload = {
      model: AI_MODELS.CLAUDE_ANALYTICS,
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);

    if (response.getResponseCode() === 200) {
      const result = JSON.parse(response.getContentText());
      return result.content[0].text.trim();
    } else {
      Logger.log('Claude API error: ' + response.getContentText());
      return 'Sorry, I encountered an error processing your question. Please try again.';
    }

  } catch (error) {
    Logger.log('Analytics AI error: ' + error.message);
    return 'An error occurred: ' + error.message;
  }
}

/**
 * Builds a summary of the app data for AI context
 */
function buildDataSummary(headers, dataRows) {
  const colIndex = {
    active: headers.indexOf('active'),
    productName: headers.indexOf('product_name'),
    division: headers.indexOf('division') !== -1 ? headers.indexOf('division') : headers.indexOf('Division'),
    department: headers.indexOf('department') !== -1 ? headers.indexOf('department') : headers.indexOf('Department'),
    enterprise: headers.indexOf('enterprise') !== -1 ? headers.indexOf('enterprise') : headers.indexOf('Enterprise'),
    description: headers.indexOf('description'),
    category: headers.indexOf('category'),
    value: headers.indexOf('value'),
    licenseType: headers.indexOf('license_type') !== -1 ? headers.indexOf('license_type') : headers.indexOf('License Type'),
    renewalDate: headers.indexOf('renewal_date'),
    audience: headers.indexOf('audience'),
    dateAdded: headers.indexOf('date_added')
  };

  let totalApps = 0;
  let enterpriseApps = 0;
  let totalCost = 0;
  const departments = {};
  const categories = {};
  const expiringSoon = [];
  const missingDescriptions = [];
  const highCostApps = [];

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  dataRows.forEach(row => {
    const isActive = colIndex.active !== -1 &&
      (row[colIndex.active] === true || row[colIndex.active].toString().toLowerCase() === 'true');

    if (!isActive) return;

    totalApps++;
    const productName = row[colIndex.productName] || 'Unknown';
    const cost = parseFloat(row[colIndex.value]) || 0;
    totalCost += cost;

    // Enterprise
    const isEnterprise = colIndex.enterprise !== -1 &&
      (row[colIndex.enterprise] === true || row[colIndex.enterprise].toString().toLowerCase() === 'true');
    if (isEnterprise) enterpriseApps++;

    // Department count
    const dept = row[colIndex.department] || 'Unassigned';
    departments[dept] = (departments[dept] || 0) + 1;

    // Category count
    const cat = row[colIndex.category] || 'Uncategorized';
    categories[cat] = (categories[cat] || 0) + 1;

    // Missing descriptions
    if (!row[colIndex.description] || row[colIndex.description].toString().trim() === '') {
      if (missingDescriptions.length < 5) missingDescriptions.push(productName);
    }

    // High cost apps
    if (cost > 1000) {
      highCostApps.push({ name: productName, cost });
    }

    // Expiring soon
    if (colIndex.renewalDate !== -1 && row[colIndex.renewalDate]) {
      const renewalDate = new Date(row[colIndex.renewalDate]);
      if (!isNaN(renewalDate.getTime()) && renewalDate <= thirtyDaysFromNow && renewalDate >= new Date()) {
        expiringSoon.push({ name: productName, date: renewalDate.toLocaleDateString() });
      }
    }
  });

  // Sort high cost apps
  highCostApps.sort((a, b) => b.cost - a.cost);

  // Build summary string
  let summary = `
Total Active Apps: ${totalApps}
Enterprise Apps: ${enterpriseApps}
Total Annual Cost: $${totalCost.toLocaleString()}
Average Cost per App: $${totalApps > 0 ? Math.round(totalCost / totalApps).toLocaleString() : 0}

Top Departments:
${Object.entries(departments).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([d, c]) => `- ${d}: ${c} apps`).join('\n')}

Categories:
${Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c, n]) => `- ${c}: ${n} apps`).join('\n')}
`;

  if (highCostApps.length > 0) {
    summary += `\nHighest Cost Apps:\n${highCostApps.slice(0, 5).map(a => `- ${a.name}: $${a.cost.toLocaleString()}`).join('\n')}\n`;
  }

  if (expiringSoon.length > 0) {
    summary += `\nExpiring in 30 Days:\n${expiringSoon.slice(0, 5).map(a => `- ${a.name} (${a.date})`).join('\n')}\n`;
  }

  if (missingDescriptions.length > 0) {
    summary += `\nApps Missing Descriptions: ${missingDescriptions.join(', ')}${missingDescriptions.length >= 5 ? ' (and more)' : ''}\n`;
  }

  return summary;
}

// ==========================================
// AI LOGGING & ANALYTICS FUNCTIONS
// ==========================================

/**
 * Logs AI chat queries to "AI Chat Analytics" sheet
 */
function logAIQuery(userQuery, aiResponse, appsRecommended) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');

    if (!SPREADSHEET_ID) return;

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let chatSheet = spreadsheet.getSheetByName('AI Chat Analytics');

    if (!chatSheet) {
      chatSheet = spreadsheet.insertSheet('AI Chat Analytics');
      chatSheet.getRange(1, 1, 1, 5).setValues([[
        'Timestamp', 'User Query', 'Apps Recommended', 'Response Length', 'Query Type'
      ]]);
      chatSheet.getRange(1, 1, 1, 5).setFontWeight('bold');
      chatSheet.setFrozenRows(1);
    }

    let queryType = 'General';
    if (userQuery.toLowerCase().includes('recommend') || userQuery.toLowerCase().includes('suggest')) {
      queryType = 'Recommendation Request';
    } else if (userQuery.toLowerCase().includes('grade') || userQuery.toLowerCase().includes('student')) {
      queryType = 'Grade-Specific';
    } else if (userQuery.toLowerCase().includes('subject') || userQuery.toLowerCase().includes('math') || userQuery.toLowerCase().includes('science')) {
      queryType = 'Subject-Specific';
    }

    chatSheet.appendRow([
      new Date(),
      userQuery,
      appsRecommended || 'N/A',
      aiResponse.length,
      queryType
    ]);

  } catch (error) {
    Logger.log('Error logging AI query: ' + error.message);
  }
}

/**
 * Extract app names from AI response for analytics
 */
function extractAppNames(aiResponse) {
  const boldMatches = aiResponse.match(/\*\*([^*]+)\*\*/g) || [];
  const appNames = boldMatches
    .map(match => match.replace(/\*\*/g, '').trim())
    .filter(name => name.length > 0 && name.length < 50);

  if (appNames.length === 0) return 'None detected';
  if (appNames.length > 5) return `${appNames.length} apps mentioned`;
  return appNames.slice(0, 5).join(', ');
}

/**
 * Analyzes AI chat logs to identify missing app patterns
 */
function analyzeAIChatPatterns() {
  const ui = SpreadsheetApp.getUi();
  const scriptProperties = PropertiesService.getScriptProperties();
  const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');

  if (!SPREADSHEET_ID) {
    ui.alert('❌ Configuration Error', 'SPREADSHEET_ID must be set in Script Properties.', ui.ButtonSet.OK);
    return;
  }

  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const chatSheet = spreadsheet.getSheetByName('AI Chat Analytics');

    if (!chatSheet) {
      ui.alert('📊 No Data Yet', 'No AI chat logs found. Chat logs will appear after users interact with the AI assistant.', ui.ButtonSet.OK);
      return;
    }

    const values = chatSheet.getDataRange().getValues();
    const dataRows = values.slice(1);

    if (dataRows.length === 0) {
      ui.alert('📊 No Data Yet', 'No AI chat queries logged yet.', ui.ButtonSet.OK);
      return;
    }

    const queryTypes = {};
    const commonKeywords = {};
    const recentQueries = dataRows.slice(-10).reverse();

    dataRows.forEach(row => {
      const query = row[1] || '';
      const queryType = row[4] || 'General';

      queryTypes[queryType] = (queryTypes[queryType] || 0) + 1;

      const words = query.toLowerCase().split(/\s+/).filter(word => word.length > 4);
      words.forEach(word => {
        commonKeywords[word] = (commonKeywords[word] || 0) + 1;
      });
    });

    const topKeywords = Object.entries(commonKeywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => `${word} (${count})`);

    const report = `📊 AI Chat Analytics Report

Total Queries: ${dataRows.length}

Query Types:
${Object.entries(queryTypes).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

Top Keywords:
${topKeywords.join(', ')}

Recent Queries (Last 10):
${recentQueries.map((row, i) => `${i + 1}. ${row[1].substring(0, 60)}${row[1].length > 60 ? '...' : ''}`).join('\n')}

💡 Tip: Look for repeated keywords that don't match existing apps - these may indicate missing tools users are searching for.`;

    ui.alert('📊 AI Chat Analytics', report, ui.ButtonSet.OK);
    Logger.log('AI Chat Analytics:\n' + report);

  } catch (error) {
    ui.alert('❌ Error', 'Failed to analyze chat patterns: ' + error.message, ui.ButtonSet.OK);
    Logger.log('Analytics error: ' + error.message);
  }
}

/**
 * Gets AI chat statistics from AI Chat Analytics sheet
 * Used by getAnalyticsData in data-management.js
 */
function getAIChatStats(spreadsheet) {
  try {
    const chatSheet = spreadsheet.getSheetByName('AI Chat Analytics');
    if (!chatSheet) return { totalQueries: 0, queriesLast7Days: 0, avgResponseLength: 0, topKeywords: [] };

    const values = chatSheet.getDataRange().getValues();
    if (values.length <= 1) return { totalQueries: 0, queriesLast7Days: 0, avgResponseLength: 0, topKeywords: [] };

    const dataRows = values.slice(1);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let totalQueries = dataRows.length;
    let queriesLast7Days = 0;
    let totalResponseLength = 0;
    const keywordCounts = {};

    dataRows.forEach(row => {
      const timestamp = new Date(row[0]);
      const query = row[1] || '';
      const responseLength = parseInt(row[3]) || 0;

      // Count queries in last 7 days
      if (!isNaN(timestamp.getTime()) && timestamp >= sevenDaysAgo) {
        queriesLast7Days++;
      }

      // Sum response lengths
      totalResponseLength += responseLength;

      // Extract keywords (words > 4 chars)
      const words = query.toLowerCase().split(/\s+/).filter(word => word.length > 4);
      words.forEach(word => {
        keywordCounts[word] = (keywordCounts[word] || 0) + 1;
      });
    });

    // Get top 8 keywords
    const topKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word);

    return {
      totalQueries: totalQueries,
      queriesLast7Days: queriesLast7Days,
      avgResponseLength: totalQueries > 0 ? Math.round(totalResponseLength / totalQueries) : 0,
      topKeywords: topKeywords
    };

  } catch (error) {
    Logger.log('Error getting AI chat stats: ' + error.message);
    return { totalQueries: 0, queriesLast7Days: 0, avgResponseLength: 0, topKeywords: [] };
  }
}

// ==========================================
// TEST FUNCTIONS
// ==========================================

/**
 * TEST FUNCTION: Test Gemini API connection
 * Run this from Apps Script Editor to test Gemini integration
 */
function testGemini() {
  const GEMINI_API_KEY = getGeminiApiKey();

  Logger.log('=== GEMINI API TEST ===');
  Logger.log('API Key configured: ' + (GEMINI_API_KEY ? 'YES (length: ' + GEMINI_API_KEY.length + ')' : 'NO'));

  if (!GEMINI_API_KEY) {
    Logger.log('ERROR: GEMINI_API_KEY not found in Script Properties');
    // Check if running from Sheets UI
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('❌ Configuration Error', 'GEMINI_API_KEY is not set in Script Properties.', ui.ButtonSet.OK);
    } catch (e) {
      // Not running from Sheets UI
    }
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.GEMINI_CHAT}:generateContent?key=${GEMINI_API_KEY}`;

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

        // Show UI alert if running from Sheets
        try {
          const ui = SpreadsheetApp.getUi();
          ui.alert('✅ Gemini Connection Successful', 'API key is valid and working!', ui.ButtonSet.OK);
        } catch (e) {
          // Not running from Sheets UI
        }

        return 'SUCCESS: ' + aiResponse;
      }
    } else {
      Logger.log('ERROR: HTTP ' + responseCode);

      try {
        const ui = SpreadsheetApp.getUi();
        ui.alert('❌ Gemini Connection Failed', 'Check Apps Script logs for details', ui.ButtonSet.OK);
      } catch (e) {
        // Not running from Sheets UI
      }

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
  const CLAUDE_API_KEY = getClaudeApiKey();

  Logger.log('=== CLAUDE API TEST ===');
  Logger.log('API Key configured: ' + (CLAUDE_API_KEY ? 'YES (length: ' + CLAUDE_API_KEY.length + ')' : 'NO'));

  if (!CLAUDE_API_KEY) {
    Logger.log('ERROR: CLAUDE_API_KEY not found in Script Properties');
    // Check if running from Sheets UI
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('❌ Configuration Error', 'CLAUDE_API_KEY is not set in Script Properties.', ui.ButtonSet.OK);
    } catch (e) {
      // Not running from Sheets UI
    }
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
    model: AI_MODELS.CLAUDE_CHAT,
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

        // Show UI alert if running from Sheets
        try {
          const ui = SpreadsheetApp.getUi();
          ui.alert('✅ Claude Connection Successful', 'API key is valid and working!\n\nSample response: ' + aiResponse.substring(0, 200) + '...', ui.ButtonSet.OK);
        } catch (e) {
          // Not running from Sheets UI
        }

        return 'SUCCESS: ' + aiResponse;
      }
    } else {
      Logger.log('ERROR: HTTP ' + responseCode);

      try {
        const ui = SpreadsheetApp.getUi();
        ui.alert('❌ Claude Connection Failed', 'Check Apps Script logs for details', ui.ButtonSet.OK);
      } catch (e) {
        // Not running from Sheets UI
      }

      return 'ERROR: HTTP ' + responseCode + ' - ' + responseText;
    }
  } catch (error) {
    Logger.log('EXCEPTION: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return 'EXCEPTION: ' + error.message;
  }
}
