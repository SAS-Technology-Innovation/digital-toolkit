/**
 * Data Management Module
 * Handles all data management operations:
 * - Data validation and quality checks
 * - AI-powered enrichment (Claude API)
 * - CSV import/export
 * - Logging and analytics
 */

// ==========================================
// DATA VALIDATION FUNCTIONS
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
    // Support both old (capitalized) and new (lowercase) column names
    const divisionField = headers.indexOf('division') !== -1 ? 'division' : 'Division';
    const categoryField = headers.indexOf('category') !== -1 ? 'category' : 'Category';
    const websiteField = headers.indexOf('website') !== -1 ? 'website' : 'Website';
    const departmentField = headers.indexOf('department') !== -1 ? 'department' : 'Department';

    const requiredFields = ['product_name', 'description', divisionField, categoryField, websiteField, departmentField];

    dataRows.forEach((row, index) => {
      const rowNum = index + 2;
      const activeIndex = headers.indexOf('active');
      const isActive = activeIndex !== -1 && (row[activeIndex] === true || row[activeIndex].toString().toLowerCase() === 'true');

      if (!isActive) return;

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
      website: [],
      audience: [],
      gradeLevels: [],
      supportEmail: [],
      tutorialLink: [],
      mobileApp: [],
      ssoEnabled: [],
      logoUrl: []
    };

    dataRows.forEach((row, index) => {
      const rowNum = index + 2;
      const activeIndex = headers.indexOf('active');
      const isActive = activeIndex !== -1 && (row[activeIndex] === true || row[activeIndex].toString().toLowerCase() === 'true');

      if (!isActive) return;

      const appName = row[headers.indexOf('product_name')] || `Row ${rowNum}`;

      if (!row[headers.indexOf('description')] || row[headers.indexOf('description')].toString().trim() === '') {
        missingData.description.push(`${appName} (Row ${rowNum})`);
      }
      if (!row[headers.indexOf('category')] || row[headers.indexOf('category')].toString().trim() === '') {
        missingData.category.push(`${appName} (Row ${rowNum})`);
      }
      if (!row[headers.indexOf('website')] || row[headers.indexOf('website')].toString().trim() === '') {
        missingData.website.push(`${appName} (Row ${rowNum})`);
      }
      if (!row[headers.indexOf('audience')] || row[headers.indexOf('audience')].toString().trim() === '') {
        missingData.audience.push(`${appName} (Row ${rowNum})`);
      }
      if (!row[headers.indexOf('grade_levels')] || row[headers.indexOf('grade_levels')].toString().trim() === '') {
        missingData.gradeLevels.push(`${appName} (Row ${rowNum})`);
      }
      if (!row[headers.indexOf('support_email')] || row[headers.indexOf('support_email')].toString().trim() === '') {
        missingData.supportEmail.push(`${appName} (Row ${rowNum})`);
      }
      if (!row[headers.indexOf('tutorial_link')] || row[headers.indexOf('tutorial_link')].toString().trim() === '') {
        missingData.tutorialLink.push(`${appName} (Row ${rowNum})`);
      }
      if (!row[headers.indexOf('mobile_app')] || row[headers.indexOf('mobile_app')].toString().trim() === '') {
        missingData.mobileApp.push(`${appName} (Row ${rowNum})`);
      }
      const ssoEnabled = row[headers.indexOf('sso_enabled')];
      if (ssoEnabled === '' || ssoEnabled === null || ssoEnabled === undefined) {
        missingData.ssoEnabled.push(`${appName} (Row ${rowNum})`);
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
      missingData.category.length > 5 ? `... and ${missingData.category.length - 5} more` : '',
      ``,
      `Missing Websites: ${missingData.website.length}`,
      missingData.website.slice(0, 5).join('\n'),
      missingData.website.length > 5 ? `... and ${missingData.website.length - 5} more` : '',
      ``,
      `Missing Audience: ${missingData.audience.length}`,
      missingData.audience.slice(0, 5).join('\n'),
      missingData.audience.length > 5 ? `... and ${missingData.audience.length - 5} more` : '',
      ``,
      `Missing Grade Levels: ${missingData.gradeLevels.length}`,
      missingData.gradeLevels.slice(0, 5).join('\n'),
      missingData.gradeLevels.length > 5 ? `... and ${missingData.gradeLevels.length - 5} more` : '',
      ``,
      `Missing Support Emails: ${missingData.supportEmail.length}`,
      missingData.supportEmail.slice(0, 5).join('\n'),
      missingData.supportEmail.length > 5 ? `... and ${missingData.supportEmail.length - 5} more` : '',
      ``,
      `Missing Tutorial Links: ${missingData.tutorialLink.length}`,
      missingData.tutorialLink.slice(0, 5).join('\n'),
      missingData.tutorialLink.length > 5 ? `... and ${missingData.tutorialLink.length - 5} more` : '',
      ``,
      `Missing Mobile App Info: ${missingData.mobileApp.length}`,
      missingData.mobileApp.slice(0, 5).join('\n'),
      missingData.mobileApp.length > 5 ? `... and ${missingData.mobileApp.length - 5} more` : '',
      ``,
      `Missing SSO Enabled Status: ${missingData.ssoEnabled.length}`,
      missingData.ssoEnabled.slice(0, 5).join('\n'),
      missingData.ssoEnabled.length > 5 ? `... and ${missingData.ssoEnabled.length - 5} more` : '',
      ``,
      `Missing Logos: ${missingData.logoUrl.length}`,
      missingData.logoUrl.slice(0, 5).join('\n'),
      missingData.logoUrl.length > 5 ? `... and ${missingData.logoUrl.length - 5} more` : ''
    ].filter(line => line !== undefined).join('\n');

    ui.alert('🔍 Missing Fields Report', report, ui.ButtonSet.OK);
    Logger.log('Missing Fields Report:\n' + report);

  } catch (error) {
    ui.alert('❌ Error', 'Failed to analyze missing fields: ' + error.message, ui.ButtonSet.OK);
    Logger.log('Missing fields analysis error: ' + error.message);
  }
}

// ==========================================
// AI ENRICHMENT FUNCTIONS
// ==========================================

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
    const categoryCol = headers.indexOf('category');
    const websiteCol = headers.indexOf('website');
    // Support both old (subjects_or_department) and new (subjects) column names
    const subjectCol = headers.indexOf('subjects') !== -1 ? headers.indexOf('subjects') : headers.indexOf('subjects_or_department');

    let enrichedCount = 0;
    let errorCount = 0;

    dataRows.forEach((row, index) => {

      const rowNum = index + 2;
      const activeIndex = headers.indexOf('active');
      const isActive = activeIndex !== -1 && (row[activeIndex] === true || row[activeIndex].toString().toLowerCase() === 'true');

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

          // Log the update
          logDataUpdate('Enrich Description', productName, 'description', description, generatedDesc, rowNum);

          SpreadsheetApp.flush(); // Save immediately
        } else if (generatedDesc === 'ERROR') {
          errorCount++;
          Logger.log(`Failed to enrich ${productName} (Row ${rowNum})`);
        }
      }
    });

    const message = `Successfully generated descriptions for ${enrichedCount} app(s).` +
                    (errorCount > 0 ? `\n\n⚠️ ${errorCount} app(s) failed to enrich.` : '');
    ui.alert('✅ Enrichment Complete', message, ui.ButtonSet.OK);

  } catch (error) {
    ui.alert('❌ Error', 'Enrichment failed: ' + error.message, ui.ButtonSet.OK);
    Logger.log('Enrichment error: ' + error.message);
  }
}

/**
 * Enriches ALL missing data using Claude AI
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

  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const dataRows = values.slice(1);

    const colMap = {
      description: headers.indexOf('description'),
      category: headers.indexOf('category'),
      website: headers.indexOf('website'),
      audience: headers.indexOf('audience'),
      gradeLevels: headers.indexOf('grade_levels'),
      supportEmail: headers.indexOf('support_email'),
      tutorialLink: headers.indexOf('tutorial_link'),
      mobileApp: headers.indexOf('mobile_app'),
      ssoEnabled: headers.indexOf('sso_enabled'),
      logoUrl: headers.indexOf('logo_url'),
      product: headers.indexOf('product_name')
    };

    let appsNeedingEnrichment = 0;
    dataRows.forEach((row, index) => {
      const activeIndex = headers.indexOf('active');
      const isActive = activeIndex !== -1 && (row[activeIndex] === true || row[activeIndex].toString().toLowerCase() === 'true');
      if (!isActive) return;

      const hasMissingData = !row[colMap.description] || !row[colMap.category] || !row[colMap.website] ||
                             !row[colMap.audience] || !row[colMap.gradeLevels] || !row[colMap.supportEmail] ||
                             !row[colMap.tutorialLink] || !row[colMap.mobileApp] ||
                             row[colMap.ssoEnabled] === '' || row[colMap.ssoEnabled] === null ||
                             !row[colMap.logoUrl];
      if (hasMissingData) appsNeedingEnrichment++;
    });

    // Performance optimization: Batch processing limit
    const MAX_BATCH_SIZE = 20; // Process max 20 apps at a time for better performance
    const batchSize = Math.min(appsNeedingEnrichment, MAX_BATCH_SIZE);
    const estimatedTime = Math.ceil(batchSize * 2 / 60); // Reduced from 3 to 2 minutes per app

    const response = ui.alert(
      '🔄 Enrich All Missing Data',
      `Found ${appsNeedingEnrichment} app(s) with missing data.\n\n⚡ Will process ${batchSize} apps this run (max batch size: ${MAX_BATCH_SIZE}).\n\nEstimated time: ~${estimatedTime} minute(s).\n\n💡 Tip: Run multiple times to process all apps in batches.\n\nContinue?`,
      ui.ButtonSet.YES_NO
    );

    if (response !== ui.Button.YES) return;

    // Support both old (subjects_or_department) and new (subjects) column names
    colMap.subject = headers.indexOf('subjects') !== -1 ? headers.indexOf('subjects') : headers.indexOf('subjects_or_department');
    colMap.division = headers.indexOf('division');

    let enrichedCount = 0;
    let errorCount = 0;
    let processedCount = 0;
    let skippedCount = 0;

    dataRows.forEach((row, index) => {
      const rowNum = index + 2;
      const activeIndex = headers.indexOf('active');
      const isActive = activeIndex !== -1 && (row[activeIndex] === true || row[activeIndex].toString().toLowerCase() === 'true');

      if (!isActive) return;

      const productName = row[colMap.product];
      const hasMissingData = !row[colMap.description] || !row[colMap.category] || !row[colMap.website] ||
                             !row[colMap.audience] || !row[colMap.gradeLevels] || !row[colMap.supportEmail] ||
                             !row[colMap.tutorialLink] || !row[colMap.mobileApp] ||
                             row[colMap.ssoEnabled] === '' || row[colMap.ssoEnabled] === null ||
                             !row[colMap.logoUrl];

      if (hasMissingData) {
        // Stop processing if we've reached the batch limit
        if (enrichedCount >= MAX_BATCH_SIZE) {
          skippedCount++;
          return;
        }

        processedCount++;

        if (processedCount % 5 === 0) {
          Logger.log(`Progress: ${processedCount}/${batchSize} apps processed (${enrichedCount} enriched, ${errorCount} errors)`);
        }

        const enrichedData = enrichAppDataWithClaude({
          productName: productName,
          subject: row[colMap.subject] || '',
          division: row[colMap.division] || '',
          currentDescription: row[colMap.description] || '',
          currentCategory: row[colMap.category] || '',
          currentWebsite: row[colMap.website] || '',
          currentAudience: row[colMap.audience] || '',
          currentGradeLevels: row[colMap.gradeLevels] || '',
          currentSupportEmail: row[colMap.supportEmail] || '',
          currentTutorialLink: row[colMap.tutorialLink] || '',
          currentMobileApp: row[colMap.mobileApp] || '',
          currentSsoEnabled: row[colMap.ssoEnabled],
          currentLogoUrl: row[colMap.logoUrl] || ''
        });

        if (enrichedData && !enrichedData.error && enrichedData !== 'ERROR') {
          if (enrichedData.description && !row[colMap.description]) {
            sheet.getRange(rowNum, colMap.description + 1).setValue(enrichedData.description);
            logDataUpdate('Enrich All Fields', productName, 'description', row[colMap.description], enrichedData.description, rowNum);
          }
          if (enrichedData.category && !row[colMap.category]) {
            sheet.getRange(rowNum, colMap.category + 1).setValue(enrichedData.category);
            logDataUpdate('Enrich All Fields', productName, 'category', row[colMap.category], enrichedData.category, rowNum);
          }
          if (enrichedData.website && !row[colMap.website]) {
            sheet.getRange(rowNum, colMap.website + 1).setValue(enrichedData.website);
            logDataUpdate('Enrich All Fields', productName, 'website', row[colMap.website], enrichedData.website, rowNum);
          }
          if (enrichedData.audience && !row[colMap.audience]) {
            sheet.getRange(rowNum, colMap.audience + 1).setValue(enrichedData.audience);
            logDataUpdate('Enrich All Fields', productName, 'audience', row[colMap.audience], enrichedData.audience, rowNum);
          }
          if (enrichedData.gradeLevels && !row[colMap.gradeLevels]) {
            // Validate grade levels against allowed dropdown values (supports comma-separated list)
            const validGrades = ['Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
                                'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
                                'Grade 11', 'Grade 12'];

            // Convert range notation to individual grades if AI returned a range
            let gradeLevelsToValidate = convertGradeRangeToIndividual(enrichedData.gradeLevels);
            gradeLevelsToValidate = gradeLevelsToValidate.trim().replace(/['"]/g, '');

            // Split comma-separated values and validate each individual grade
            const gradeList = gradeLevelsToValidate.split(',').map(g => g.trim());
            const invalidGrades = gradeList.filter(g => g !== '' && !validGrades.includes(g));

            if (invalidGrades.length === 0 && gradeList.length > 0 && gradeList[0] !== '') {
              // All grades are valid - join and set value
              const validatedGrades = gradeList.join(', ');
              sheet.getRange(rowNum, colMap.gradeLevels + 1).setValue(validatedGrades);
              logDataUpdate('Enrich All Fields', productName, 'grade_levels', row[colMap.gradeLevels], validatedGrades, rowNum);
            } else if (invalidGrades.length > 0) {
              // Some invalid grades found - log warning and skip
              Logger.log(`Warning: Invalid grade levels "${invalidGrades.join(', ')}" for ${productName} (Row ${rowNum}). Original value: "${enrichedData.gradeLevels}". Skipping.`);
            }
          }
          if (enrichedData.supportEmail && !row[colMap.supportEmail]) {
            sheet.getRange(rowNum, colMap.supportEmail + 1).setValue(enrichedData.supportEmail);
            logDataUpdate('Enrich All Fields', productName, 'support_email', row[colMap.supportEmail], enrichedData.supportEmail, rowNum);
          }
          if (enrichedData.tutorialLink && !row[colMap.tutorialLink]) {
            sheet.getRange(rowNum, colMap.tutorialLink + 1).setValue(enrichedData.tutorialLink);
            logDataUpdate('Enrich All Fields', productName, 'tutorial_link', row[colMap.tutorialLink], enrichedData.tutorialLink, rowNum);
          }
          if (enrichedData.mobileApp && !row[colMap.mobileApp]) {
            sheet.getRange(rowNum, colMap.mobileApp + 1).setValue(enrichedData.mobileApp);
            logDataUpdate('Enrich All Fields', productName, 'mobile_app', row[colMap.mobileApp], enrichedData.mobileApp, rowNum);
          }
          if (enrichedData.ssoEnabled !== undefined && (row[colMap.ssoEnabled] === '' || row[colMap.ssoEnabled] === null)) {
            sheet.getRange(rowNum, colMap.ssoEnabled + 1).setValue(enrichedData.ssoEnabled);
            logDataUpdate('Enrich All Fields', productName, 'sso_enabled', row[colMap.ssoEnabled], enrichedData.ssoEnabled, rowNum);
          }
          if (enrichedData.logoUrl && !row[colMap.logoUrl]) {
            sheet.getRange(rowNum, colMap.logoUrl + 1).setValue(enrichedData.logoUrl);
            logDataUpdate('Enrich All Fields', productName, 'logo_url', row[colMap.logoUrl], enrichedData.logoUrl, rowNum);
          }

          enrichedCount++;
          Logger.log(`✅ Enriched data for ${productName} (Row ${rowNum})`);
          SpreadsheetApp.flush();
        } else {
          errorCount++;
          const errorType = enrichedData && enrichedData.error ? enrichedData.error : 'UNKNOWN';
          const errorDetails = enrichedData && enrichedData.details ? enrichedData.details : 'No details';
          Logger.log(`❌ Failed to enrich ${productName} (Row ${rowNum}) - Error: ${errorType} - ${errorDetails}`);
        }

        // Reduced delay for better performance (500ms instead of 1500ms)
        Utilities.sleep(500);
      }
    });

    const remainingApps = appsNeedingEnrichment - enrichedCount;
    const message = `✅ Successfully enriched ${enrichedCount} app(s) with missing data.` +
                    (errorCount > 0 ? `\n\n⚠️ ${errorCount} app(s) failed to enrich.` : '') +
                    (remainingApps > 0 ? `\n\n📊 ${remainingApps} app(s) still need enrichment. Run again to continue.` : '\n\n🎉 All apps processed!');
    ui.alert('✅ Enrichment Complete', message, ui.ButtonSet.OK);

  } catch (error) {
    ui.alert('❌ Error', 'Enrichment failed: ' + error.message, ui.ButtonSet.OK);
    Logger.log('Full enrichment error: ' + error.message);
  }
}

// ==========================================
// CLAUDE AI HELPER FUNCTIONS
// ==========================================

/**
 * Generates description using Claude AI
 */
function generateDescriptionWithClaude(productName, category, website, subject) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const CLAUDE_API_KEY = scriptProperties.getProperty('CLAUDE_API_KEY');

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
    model: 'claude-sonnet-4-5-20250929',
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
 */
function enrichAppDataWithClaude(appData) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const CLAUDE_API_KEY = scriptProperties.getProperty('CLAUDE_API_KEY');

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
- Category: Choose EXACTLY ONE from this list: Lessons & Resources, Authoring Tools, Legal, Assessment, eTextbooks, 3D Printers, AV & Multimedia, Immersive Environments, Network Management, Careers, Collaboration, VLEs / LMS, Safeguarding, Learning Spaces, Adaptive Learning, Software Management, Website & App Design, Library Management, Apps, Virtual Classroom, Marking & Feedback, Data Analytics, Classroom Management, Planning, Management Information System (MIS), Organisation, IT Support Services, Device Management, Sign-in Systems, Recruitment, After School Clubs, Cybersecurity, Finance, Parent Communication, Health & Wellbeing, Trips Bookings & Payments, Plagiarism Detection, Visualisers
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
    model: 'claude-3-5-haiku-20241022', // Using Haiku for faster, cheaper responses
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
    ui.alert('❌ Claude Connection Failed', 'Check Apps Script logs for details', ui.ButtonSet.OK);
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

  // Note: This calls queryGeminiAPI from Code.js
  const testResult = queryGeminiAPI('You are a test assistant.', 'Respond with "API connection successful" if you receive this message.', 'test');

  if (testResult && !testResult.includes('error') && !testResult.includes('ERROR')) {
    ui.alert('✅ Gemini Connection Successful', 'API key is valid and working!', ui.ButtonSet.OK);
  } else {
    ui.alert('❌ Gemini Connection Failed', 'Check Apps Script logs for details', ui.ButtonSet.OK);
  }
}

// ==========================================
// LOGGING & ANALYTICS FUNCTIONS
// ==========================================

/**
 * Logs data enrichment operations to "Update Logs" sheet
 */
function logDataUpdate(operation, appName, field, oldValue, newValue, rowNum) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');

    if (!SPREADSHEET_ID) return;

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = spreadsheet.getSheetByName('Update Logs');

    if (!logSheet) {
      logSheet = spreadsheet.insertSheet('Update Logs');
      logSheet.getRange(1, 1, 1, 7).setValues([[
        'Timestamp', 'Operation', 'App Name', 'Row', 'Field', 'Old Value', 'New Value'
      ]]);
      logSheet.getRange(1, 1, 1, 7).setFontWeight('bold');
      logSheet.setFrozenRows(1);
    }

    logSheet.appendRow([
      new Date(),
      operation,
      appName,
      rowNum,
      field,
      oldValue || '[EMPTY]',
      newValue
    ]);

  } catch (error) {
    Logger.log('Error logging update: ' + error.message);
  }
}

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

// ==========================================
// CSV IMPORT/EXPORT FUNCTIONS
// ==========================================

/**
 * Shows CSV upload dialog
 */
function showCSVUploadDialog() {
  const html = HtmlService.createHtmlOutputFromFile('csv-upload-dialog')
    .setWidth(600)
    .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, 'Upload CSV Data');
}

/**
 * Maps EdTech Impact CSV format to SAS Digital Toolkit format
 * Handles column name differences and data transformations
 */
function mapEdTechImpactRow(csvRow, csvHeaders) {
  const mapped = {};

  // Column mapping: EdTech Impact → SAS Format
  // Current EdTech Impact export columns:
  // Product, Cancel by, Renews on, Price, Budget, Notes, Licences, Length, Source, Schools, Decision, Status
  // Note: Budget in EdTech Impact is the budget department (who pays), not usage department
  const columnMap = {
    'Product': 'product_name',
    'Price': 'value',
    // 'Budget': DO NOT MAP - Budget is who pays, not who uses
    'Licences': 'licence_count',
    'Schools': 'Division',
    'Renews on': 'renewal_date',
    'Status': 'Active'
  };

  // Map each column
  csvHeaders.forEach((csvHeader, index) => {
    const targetColumn = columnMap[csvHeader] || csvHeader;
    let value = csvRow[index];

    // Transform specific fields
    if (csvHeader === 'Schools') {
      // Keep full school names to match Google Sheets data validation
      // "SAS Elementary School, SAS Middle School, SAS High School" stays as is
      // Only transform "SAS Early Learning Center" to "SAS Elementary School"
      value = value ? value.replace(/SAS Early Learning Center/g, 'SAS Elementary School') : '';
      // Remove "SAS Central" as it's not a valid division
      value = value.replace(/SAS Central/g, '').replace(/, ,/g, ','); // Clean up double commas
      // Clean up extra commas and whitespace
      value = value.split(',').map(v => v.trim()).filter(v => v && v !== '').join(', ');
    }

    if (csvHeader === 'Status') {
      // Map Status boolean to Active TRUE/FALSE
      mapped['Active'] = (value === true || value === 'true') ? 'TRUE' : 'FALSE';
    }

    if (csvHeader === 'Price') {
      // Handle [object Object] in Price field - skip it
      if (value && value !== '[object Object]') {
        // Try to extract numeric value if it's a string
        const numericMatch = value.toString().match(/[\d,.]+/);
        if (numericMatch) {
          mapped['value'] = numericMatch[0].replace(/,/g, '');
        } else {
          mapped['value'] = '0'; // Default to 0 for free apps
        }
      } else {
        mapped['value'] = '0'; // [object Object] means no pricing data, treat as free
      }
      return; // Skip normal mapping for Price
    }

    if (csvHeader === 'Renews on') {
      // Convert date string to simple date format
      if (value && value !== '') {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            mapped['renewal_date'] = date.toISOString().split('T')[0]; // YYYY-MM-DD format
          }
        } catch (e) {
          // If date parsing fails, leave empty
          mapped['renewal_date'] = '';
        }
      }
      return; // Skip normal mapping for dates
    }

    mapped[targetColumn] = value || '';
  });

  // Set defaults for missing required fields
  if (!mapped['Active']) mapped['Active'] = 'TRUE';
  if (!mapped['enterprise']) mapped['enterprise'] = 'FALSE';  // Using lowercase to match Google Sheet

  // department: Default to School-wide since EdTech Impact doesn't track usage department
  // (Budget field is who pays, not who uses the app)
  if (!mapped['department']) mapped['department'] = 'School-wide';  // Using lowercase to match Google Sheet

  if (!mapped['License Type']) {
    // Infer license type from Licences count
    // IMPORTANT: Must match Google Sheets validation values exactly
    const licenceCount = parseInt(mapped['licence_count']) || 0;
    if (licenceCount > 100) {
      mapped['License Type'] = 'Site License';  // Match validation: "Site License"
    } else if (licenceCount > 0) {
      mapped['License Type'] = 'Individual';  // Match validation: "Individual"
    } else {
      mapped['License Type'] = 'Free';  // Match validation: "Free"
    }
  }
  if (!mapped['audience']) mapped['audience'] = 'Teachers, Staff';
  if (!mapped['grade_levels']) {
    // Infer from Division - use individual grade values to match Google Sheets validation
    // Only infer if audience includes Students (skip for Staff-only apps)
    const audience = mapped['audience'] || '';
    const division = mapped['Division'] || '';
    const divisionLower = division.toLowerCase();

    if (audience.toLowerCase().includes('student')) {
      if (divisionLower.includes('elementary') && divisionLower.includes('middle') && divisionLower.includes('high')) {
        mapped['grade_levels'] = 'Pre-K, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12';
      } else if (divisionLower.includes('elementary')) {
        mapped['grade_levels'] = 'Pre-K, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5';
      } else if (divisionLower.includes('middle')) {
        mapped['grade_levels'] = 'Grade 6, Grade 7, Grade 8';
      } else if (divisionLower.includes('high')) {
        mapped['grade_levels'] = 'Grade 9, Grade 10, Grade 11, Grade 12';
      } else {
        // Default to K-12 if can't determine specific division
        mapped['grade_levels'] = 'Pre-K, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12';
      }
    } else {
      // Staff-only apps: default to Grade 1 to satisfy validation (will be manually cleared after import)
      mapped['grade_levels'] = 'Grade 1';
    }
  }
  if (!mapped['Category']) {
    // Default category for imported apps
    // Can be updated manually after import based on actual usage
    mapped['Category'] = 'Apps';
  }

  return mapped;
}

/**
 * Detects if CSV is from EdTech Impact based on column headers
 */
function isEdTechImpactCSV(csvHeaders) {
  // Current EdTech Impact export has these columns:
  // Product, Cancel by, Renews on, Price, Budget, Notes, Licences, Length, Source, Schools, Decision, Status
  const edtechColumns = ['Product', 'Schools', 'Budget', 'Licences', 'Status'];
  const matchCount = edtechColumns.filter(col => csvHeaders.includes(col)).length;
  return matchCount >= 3; // If 3 or more EdTech Impact columns are present
}

/**
 * Processes uploaded XLSX file data (converts to CSV format)
 * Uses Google Sheets API to parse XLSX binary data
 */
function processXLSXData(xlsxBase64, updateMode) {
  try {
    // Decode base64 to blob
    const xlsxBlob = Utilities.newBlob(
      Utilities.base64Decode(xlsxBase64),
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'upload.xlsx'
    );

    // Create temporary spreadsheet from XLSX (Drive API v3)
    const tempFile = Drive.Files.create({
      name: 'temp_xlsx_' + new Date().getTime(),
      mimeType: 'application/vnd.google-apps.spreadsheet'
    }, xlsxBlob);

    // Open the temporary spreadsheet
    const tempSpreadsheet = SpreadsheetApp.openById(tempFile.id);
    const tempSheet = tempSpreadsheet.getSheets()[0];
    const data = tempSheet.getDataRange().getValues();

    // Convert to CSV format
    const csvText = data.map(row => {
      return row.map(cell => {
        const cellStr = cell.toString();
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return '"' + cellStr.replace(/"/g, '""') + '"';
        }
        return cellStr;
      }).join(',');
    }).join('\n');

    // Delete temporary file (Drive API v3)
    Drive.Files.remove(tempFile.id);

    // Process as CSV
    return processCSVData(csvText, updateMode);

  } catch (error) {
    Logger.log('XLSX processing error: ' + error.message);
    return {
      success: false,
      error: 'Failed to process XLSX file: ' + error.message
    };
  }
}

/**
 * Processes uploaded CSV data
 * Handles: Add new apps, Update existing apps, Remove apps not in CSV
 */
function processCSVData(csvText, updateMode) {
  const ui = SpreadsheetApp.getUi();
  const scriptProperties = PropertiesService.getScriptProperties();
  const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
  const SHEET_NAME = scriptProperties.getProperty('SHEET_NAME');

  if (!SPREADSHEET_ID || !SHEET_NAME) {
    return {
      success: false,
      error: 'Configuration error: SPREADSHEET_ID or SHEET_NAME not set in Script Properties'
    };
  }

  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const currentValues = sheet.getDataRange().getValues();
    const headers = currentValues[0];
    const currentRows = currentValues.slice(1);

    // Parse CSV
    const csvLines = csvText.trim().split('\n');
    let csvHeaders = parseCSVLine(csvLines[0]);
    let csvRows = csvLines.slice(1).map(line => parseCSVLine(line));

    // Normalize License Type values to match Google Sheets validation
    const licenseTypeIndex = csvHeaders.indexOf('License Type');
    if (licenseTypeIndex !== -1) {
      csvRows = csvRows.map(row => {
        if (row[licenseTypeIndex]) {
          const normalized = row[licenseTypeIndex].toString().trim();
          // Map variations to validation values
          if (normalized === 'Individual' || normalized === 'Inidividual') {
            row[licenseTypeIndex] = 'Individual';  // Correct spelling
          } else if (normalized === 'Site' || normalized === 'Site License' || normalized === 'Site Licence') {
            row[licenseTypeIndex] = 'Site License';  // American spelling
          } else if (normalized === 'Unlimited' || normalized === 'Free') {
            row[licenseTypeIndex] = 'Free';  // Use validation value
          } else if (normalized === 'Division License') {
            row[licenseTypeIndex] = 'Division License';  // Keep as-is
          }
        }
        return row;
      });
    }

    // Handle empty grade_levels fields - set default value to satisfy validation
    const gradeLevelsIndex = csvHeaders.indexOf('grade_levels');
    const audienceIndex = csvHeaders.indexOf('audience');
    if (gradeLevelsIndex !== -1) {
      csvRows = csvRows.map(row => {
        const gradeLevels = row[gradeLevelsIndex];
        const audience = row[audienceIndex] || '';

        // If grade_levels is empty, set default based on audience
        if (!gradeLevels || gradeLevels.toString().trim() === '') {
          if (audience.toLowerCase().includes('student')) {
            // Default to K-12 for student-facing apps
            row[gradeLevelsIndex] = 'Pre-K, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12';
          } else {
            // Default to Grade 1 for staff-only apps (will be manually cleared if needed)
            row[gradeLevelsIndex] = 'Grade 1';
          }
        }
        return row;
      });
    }

    // Detect if this is an EdTech Impact CSV and transform it
    const isEdTechFormat = isEdTechImpactCSV(csvHeaders);

    if (isEdTechFormat) {
      Logger.log('Detected EdTech Impact CSV format - transforming to SAS format');

      // Transform each row from EdTech format to SAS format
      const transformedRows = [];
      csvRows.forEach((csvRow, index) => {
        try {
          const mappedRow = mapEdTechImpactRow(csvRow, csvHeaders);
          transformedRows.push(mappedRow);
        } catch (error) {
          Logger.log(`Error transforming row ${index + 2}: ${error.message}`);
        }
      });

      // Update csvHeaders to match SAS format
      csvHeaders = headers; // Use sheet headers as the standard

      // Convert transformed objects to arrays matching sheet column order
      csvRows = transformedRows.map(mappedRow => {
        return headers.map(header => mappedRow[header] || '');
      });

      Logger.log(`Transformed ${csvRows.length} rows from EdTech Impact format`);
    } else {
      // Validate CSV headers match expected structure (only for non-EdTech CSVs)
      const validationResult = validateCSVHeaders(csvHeaders, headers);
      if (!validationResult.valid) {
        return {
          success: false,
          error: 'CSV header validation failed: ' + validationResult.error
        };
      }
    }

    // Track changes
    const stats = {
      added: 0,
      updated: 0,
      removed: 0,
      unchanged: 0,
      errors: []
    };

    const productNameIndex = headers.indexOf('product_name');
    if (productNameIndex === -1) {
      return {
        success: false,
        error: 'product_name column not found in sheet'
      };
    }

    // Create map of existing apps by product name
    const existingApps = new Map();
    currentRows.forEach((row, index) => {
      const productName = row[productNameIndex];
      if (productName) {
        existingApps.set(productName.toString().toLowerCase().trim(), {
          row: row,
          rowIndex: index + 2 // +2 for header and 1-based indexing
        });
      }
    });

    // Create map of CSV apps
    const csvApps = new Map();
    const csvProductNameIndex = csvHeaders.indexOf('product_name');
    csvRows.forEach(row => {
      const productName = row[csvProductNameIndex];
      if (productName) {
        csvApps.set(productName.toString().toLowerCase().trim(), row);
      }
    });

    // Process based on update mode
    if (updateMode === 'add-update') {
      // Add new apps and update existing ones
      csvRows.forEach((csvRow, csvIndex) => {
        const productName = csvRow[csvProductNameIndex];
        if (!productName) {
          stats.errors.push(`Row ${csvIndex + 2}: Missing product_name`);
          return;
        }

        const key = productName.toString().toLowerCase().trim();
        const existing = existingApps.get(key);

        if (existing) {
          // Update existing app
          const changes = updateAppRow(sheet, headers, csvHeaders, existing.rowIndex, csvRow, existing.row);
          if (changes > 0) {
            stats.updated++;
            Logger.log(`Updated ${productName}: ${changes} field(s) changed`);
          } else {
            stats.unchanged++;
          }
        } else {
          // Add new app
          const newRowIndex = sheet.getLastRow() + 1;
          addAppRow(sheet, headers, csvHeaders, newRowIndex, csvRow);
          stats.added++;
          Logger.log(`Added new app: ${productName}`);
        }
      });

    } else if (updateMode === 'sync') {
      // Full sync: Add, Update, and Remove

      // Add/Update apps from CSV
      csvRows.forEach((csvRow, csvIndex) => {
        const productName = csvRow[csvProductNameIndex];
        if (!productName) {
          stats.errors.push(`Row ${csvIndex + 2}: Missing product_name`);
          return;
        }

        const key = productName.toString().toLowerCase().trim();
        const existing = existingApps.get(key);

        if (existing) {
          // Update existing
          const changes = updateAppRow(sheet, headers, csvHeaders, existing.rowIndex, csvRow, existing.row);
          if (changes > 0) {
            stats.updated++;
          } else {
            stats.unchanged++;
          }
        } else {
          // Add new
          const newRowIndex = sheet.getLastRow() + 1;
          addAppRow(sheet, headers, csvHeaders, newRowIndex, csvRow);
          stats.added++;
        }
      });

      // Remove apps not in CSV (set Active to FALSE)
      existingApps.forEach((existing, key) => {
        if (!csvApps.has(key)) {
          const activeIndex = headers.indexOf('active');
          if (activeIndex !== -1) {
            sheet.getRange(existing.rowIndex, activeIndex + 1).setValue(false);
            stats.removed++;
            Logger.log(`Deactivated app: ${existing.row[productNameIndex]}`);
          }
        }
      });

    } else if (updateMode === 'update-only') {
      // Only update existing apps (fill missing fields)
      csvRows.forEach((csvRow, csvIndex) => {
        const productName = csvRow[csvProductNameIndex];
        if (!productName) return;

        const key = productName.toString().toLowerCase().trim();
        const existing = existingApps.get(key);

        if (existing) {
          const changes = fillMissingFields(sheet, headers, csvHeaders, existing.rowIndex, csvRow, existing.row);
          if (changes > 0) {
            stats.updated++;
          } else {
            stats.unchanged++;
          }
        }
      });
    }

    return {
      success: true,
      stats: stats
    };

  } catch (error) {
    Logger.log('CSV processing error: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Parses a CSV line handling quoted fields
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}

/**
 * Validates CSV headers against expected sheet headers
 * Supports both old (capitalized) and new (lowercase) column names
 */
function validateCSVHeaders(csvHeaders, sheetHeaders) {
  const requiredColumns = ['product_name', 'Active', 'Division'];
  // Support both old (Department) and new (department) column names
  const departmentColumn = csvHeaders.indexOf('department') !== -1 ? 'department' : 'Department';
  requiredColumns.push(departmentColumn);
  const missing = [];

  requiredColumns.forEach(col => {
    if (!csvHeaders.includes(col)) {
      missing.push(col);
    }
  });

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required columns: ${missing.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Infers grade levels from product information using AI
 * Uses Gemini API if GEMINI_API_KEY is set, otherwise falls back to rule-based inference
 */
function inferGradeLevels(productName, division, department, subjects) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

  if (!apiKey) {
    // Fallback to rule-based inference
    return inferGradeLevelsRules(division);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Based on the following information about an educational app, determine ALL applicable grade levels.

Product: ${productName}
Division: ${division}
Department: ${department}
Subjects: ${subjects}

CRITICAL: Return a comma-separated list of individual grades. DO NOT use ranges like "K-5" or "6-12".

Valid individual grades (use EXACTLY these values):
Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12

Division mapping (return ALL grades in the range as individual values):
- SAS Elementary School → "Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5"
- SAS Middle School → "Grade 6, Grade 7, Grade 8"
- SAS High School → "Grade 9, Grade 10, Grade 11, Grade 12"
- Whole School → "Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12"
- SAS Central → "" (empty string - staff-only division, no grade levels)

If product name or subject indicates specific grades, list ONLY those specific grades.
If division is "SAS Central", return an empty string (no grade levels for staff-only apps).

WRONG EXAMPLES (DO NOT USE):
- "K-5" ❌
- "6-12" ❌
- "9-12" ❌
- "Grades 1-3" ❌

CORRECT EXAMPLES:
- "Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5" ✓
- "Grade 6, Grade 7, Grade 8" ✓
- "Grade 9, Grade 10, Grade 11, Grade 12" ✓
- "Grade 1, Grade 2" ✓

Return ONLY the comma-separated list of individual grades, nothing else.`;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100
      }
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);

    if (response.getResponseCode() === 200) {
      const result = JSON.parse(response.getContentText());
      const gradeLevel = result.candidates[0].content.parts[0].text.trim();

      // Validate response is a valid single grade level
      const validGrades = ['Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
                          'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
                          'Grade 11', 'Grade 12'];

      // Check if response is exactly one of the valid grades (no commas, just single value)
      const trimmedGrade = gradeLevel.trim().replace(/['"]/g, '');
      if (validGrades.includes(trimmedGrade)) {
        return trimmedGrade;
      }

      // If empty string returned, that's also valid (means user should manually select)
      if (trimmedGrade === '') {
        return '';
      }
    }

    // Fallback if API fails or returns invalid
    return inferGradeLevelsRules(division);

  } catch (e) {
    Logger.log(`Grade level inference error: ${e.message}`);
    // Fallback on any error
    return inferGradeLevelsRules(division);
  }
}

/**
 * Converts grade range notation to comma-separated individual grades
 * e.g., "K-5" → "Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5"
 */
function convertGradeRangeToIndividual(rangeString) {
  if (!rangeString) return '';

  const cleaned = rangeString.trim().toUpperCase();

  // Handle common range patterns
  const rangePatterns = {
    'K-5': 'Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5',
    'K-8': 'Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8',
    'K-12': 'Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12',
    '6-8': 'Grade 6, Grade 7, Grade 8',
    '6-12': 'Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12',
    '9-12': 'Grade 9, Grade 10, Grade 11, Grade 12',
    'PREK-5': 'Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5',
    'PRE-K-5': 'Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5'
  };

  return rangePatterns[cleaned] || rangeString;
}

/**
 * Rule-based grade level inference from division
 */
function inferGradeLevelsRules(division) {
  if (!division || division.toString().trim() === '') {
    return '';
  }

  const divisionLower = division.toString().toLowerCase();

  // SAS Central is staff-only division - no grade levels
  if (divisionLower.includes('sas central') || divisionLower.includes('central')) {
    return '';
  }

  // Check for specific divisions
  const hasElementary = divisionLower.includes('elementary') || divisionLower.includes('early learning');
  const hasMiddle = divisionLower.includes('middle');
  const hasHigh = divisionLower.includes('high');

  // Build comma-separated list of ALL applicable individual grades
  const grades = [];

  if (hasElementary) {
    grades.push('Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5');
  }

  if (hasMiddle) {
    grades.push('Grade 6', 'Grade 7', 'Grade 8');
  }

  if (hasHigh) {
    grades.push('Grade 9', 'Grade 10', 'Grade 11', 'Grade 12');
  }

  // If no specific division found, return all grades
  if (grades.length === 0) {
    return 'Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12';
  }

  return grades.join(', ');
}

/**
 * Adds a new app row to the sheet
 * Note: For NEW apps, all CSV data is populated including protected fields (Department, subjects, Enterprise)
 * Protected field logic only applies to EXISTING apps to preserve manual edits
 */
function addAppRow(sheet, sheetHeaders, csvHeaders, rowIndex, csvRow) {
  const newRow = new Array(sheetHeaders.length).fill('');

  // Map CSV data to sheet columns
  csvHeaders.forEach((csvHeader, csvIndex) => {
    const sheetIndex = sheetHeaders.indexOf(csvHeader);
    if (sheetIndex !== -1) {
      newRow[sheetIndex] = csvRow[csvIndex];
    }
  });

  // Infer grade levels if not provided in CSV
  const gradeLevelsIndex = sheetHeaders.indexOf('grade_levels');
  if (gradeLevelsIndex !== -1 && (!newRow[gradeLevelsIndex] || newRow[gradeLevelsIndex] === '')) {
    const productNameIndex = sheetHeaders.indexOf('product_name');
    const divisionIndex = sheetHeaders.indexOf('Division');
    const departmentIndex = sheetHeaders.indexOf('department') !== -1 ? sheetHeaders.indexOf('department') : sheetHeaders.indexOf('Department');
    const subjectsIndex = sheetHeaders.indexOf('subjects') !== -1 ? sheetHeaders.indexOf('subjects') : sheetHeaders.indexOf('subjects_or_department');

    const productName = newRow[productNameIndex] || '';
    const division = newRow[divisionIndex] || '';
    const department = departmentIndex !== -1 ? newRow[departmentIndex] : '';
    const subjects = subjectsIndex !== -1 ? newRow[subjectsIndex] : '';

    newRow[gradeLevelsIndex] = inferGradeLevels(productName, division, department, subjects);
  }

  // Write row
  sheet.getRange(rowIndex, 1, 1, newRow.length).setValues([newRow]);
  SpreadsheetApp.flush();
}

/**
 * Updates an existing app row (overwrites all fields from CSV)
 */
function updateAppRow(sheet, sheetHeaders, csvHeaders, rowIndex, csvRow, existingRow) {
  let changesCount = 0;

  // Protected fields - NEVER overwrite if existing value is present
  // These are manually populated fields that should be preserved
  // Includes both old (capitalized) and new (lowercase) column names for backwards compatibility
  const PROTECTED_FIELDS = [
    'Department', 'department',              // Both cases
    'subjects_or_department', 'subjects',    // Both old and new names
    'Enterprise', 'enterprise'               // Both cases
  ];

  csvHeaders.forEach((csvHeader, csvIndex) => {
    const sheetIndex = sheetHeaders.indexOf(csvHeader);
    if (sheetIndex !== -1) {
      const newValue = csvRow[csvIndex];
      const oldValue = existingRow[sheetIndex];

      // Skip protected fields if existing value is present
      if (PROTECTED_FIELDS.includes(csvHeader) && oldValue && oldValue !== '') {
        return; // Don't overwrite manually populated fields
      }

      // Skip Category field if existing value is present and new value is just the default "Apps"
      // This preserves manually set categories during EdTech Impact imports
      if (csvHeader === 'Category' && oldValue && oldValue !== '' && newValue === 'Apps') {
        return; // Don't overwrite existing Category with default "Apps"
      }

      if (newValue !== oldValue) {
        sheet.getRange(rowIndex, sheetIndex + 1).setValue(newValue);
        changesCount++;
      }
    }
  });

  // Infer grade levels if not present in existing row
  const gradeLevelsIndex = sheetHeaders.indexOf('grade_levels');
  if (gradeLevelsIndex !== -1 && (!existingRow[gradeLevelsIndex] || existingRow[gradeLevelsIndex] === '')) {
    const productNameIndex = sheetHeaders.indexOf('product_name');
    const divisionIndex = sheetHeaders.indexOf('Division');
    const departmentIndex = sheetHeaders.indexOf('department') !== -1 ? sheetHeaders.indexOf('department') : sheetHeaders.indexOf('Department');
    const subjectsIndex = sheetHeaders.indexOf('subjects') !== -1 ? sheetHeaders.indexOf('subjects') : sheetHeaders.indexOf('subjects_or_department');

    const productName = existingRow[productNameIndex] || '';
    const division = existingRow[divisionIndex] || '';
    const department = departmentIndex !== -1 ? existingRow[departmentIndex] : '';
    const subjects = subjectsIndex !== -1 ? existingRow[subjectsIndex] : '';

    const inferredGradeLevel = inferGradeLevels(productName, division, department, subjects);
    if (inferredGradeLevel && inferredGradeLevel !== '') {
      // Validate grade levels before setting (supports comma-separated list)
      const validGrades = ['Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
                          'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
                          'Grade 11', 'Grade 12'];

      // Convert range notation to individual grades if returned as a range
      let gradeLevelsToValidate = convertGradeRangeToIndividual(inferredGradeLevel);
      gradeLevelsToValidate = gradeLevelsToValidate.trim().replace(/['"]/g, '');

      // Split comma-separated values and validate each individual grade
      const gradeList = gradeLevelsToValidate.split(',').map(g => g.trim());
      const invalidGrades = gradeList.filter(g => g !== '' && !validGrades.includes(g));

      if (invalidGrades.length === 0 && gradeList.length > 0 && gradeList[0] !== '') {
        // All grades are valid - join and set value
        const validatedGrades = gradeList.join(', ');
        sheet.getRange(rowIndex, gradeLevelsIndex + 1).setValue(validatedGrades);
        changesCount++;
      } else {
        Logger.log(`Warning: Invalid inferred grade level "${inferredGradeLevel}" for ${productName}. Skipping.`);
      }
    }
  }

  if (changesCount > 0) {
    SpreadsheetApp.flush();
  }

  return changesCount;
}

/**
 * Fills only missing fields in existing app row
 */
function fillMissingFields(sheet, sheetHeaders, csvHeaders, rowIndex, csvRow, existingRow) {
  let changesCount = 0;

  // Protected fields - NEVER overwrite if existing value is present
  // These are manually populated fields that should be preserved
  // Includes both old (capitalized) and new (lowercase) column names for backwards compatibility
  const PROTECTED_FIELDS = [
    'Department', 'department',              // Both cases
    'subjects_or_department', 'subjects',    // Both old and new names
    'Enterprise', 'enterprise'               // Both cases
  ];

  csvHeaders.forEach((csvHeader, csvIndex) => {
    const sheetIndex = sheetHeaders.indexOf(csvHeader);
    if (sheetIndex !== -1) {
      const newValue = csvRow[csvIndex];
      const oldValue = existingRow[sheetIndex];

      // Skip protected fields entirely - they should NEVER be filled by CSV imports
      // Only manually populate these fields
      if (PROTECTED_FIELDS.includes(csvHeader)) {
        return; // Don't touch manually populated fields
      }

      // Only update if old value is empty/missing and new value exists
      if ((!oldValue || oldValue === '') && newValue && newValue !== '') {
        sheet.getRange(rowIndex, sheetIndex + 1).setValue(newValue);
        changesCount++;
      }
    }
  });

  if (changesCount > 0) {
    SpreadsheetApp.flush();
  }

  return changesCount;
}

/**
 * Exports current sheet data as CSV
 */
function exportToCSV() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
  const SHEET_NAME = scriptProperties.getProperty('SHEET_NAME');

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();

  // Convert to CSV format
  const csv = values.map(row => {
    return row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma or quote
      const cellStr = cell.toString();
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return '"' + cellStr.replace(/"/g, '""') + '"';
      }
      return cellStr;
    }).join(',');
  }).join('\n');

  return csv;
}

/**
 * Downloads CSV file to user's computer
 */
function downloadCSV() {
  const csv = exportToCSV();
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss');
  const filename = `digital-toolkit-export_${timestamp}.csv`;

  const blob = Utilities.newBlob(csv, 'text/csv', filename);
  const ui = SpreadsheetApp.getUi();

  // Since we can't trigger downloads directly from Apps Script,
  // we'll display the CSV in a dialog with copy button
  const html = `
    <html>
      <body>
        <h3>CSV Export Ready</h3>
        <p>Copy the data below and save as <code>${filename}</code></p>
        <textarea id="csvData" style="width:100%;height:300px;font-family:monospace;font-size:11px;">${csv}</textarea>
        <br><br>
        <button onclick="copyToClipboard()">Copy to Clipboard</button>
        <button onclick="google.script.host.close()">Close</button>
        <script>
          function copyToClipboard() {
            document.getElementById('csvData').select();
            document.execCommand('copy');
            alert('CSV copied to clipboard!');
          }
        </script>
      </body>
    </html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(450);
  ui.showModalDialog(htmlOutput, 'Export CSV');
}
