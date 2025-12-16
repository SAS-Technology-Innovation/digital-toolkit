/**
 * Data Management Module
 * Handles all data management operations:
 * - Data validation and quality checks
 * - AI-powered enrichment (Claude API)
 * - CSV import/export
 * - Logging and analytics
 *
 * @fileoverview Data management, validation, and enrichment functions for the SAS Digital Toolkit.
 * This module provides functions called from the Google Sheets custom menu "🤖 Digital Toolkit Admin".
 *
 * @requires utilities.js - Shared helper functions (parseBoolean, isEmpty, buildColumnMap, etc.)
 * @requires ai-functions.js - AI-powered functions (generateDescriptionWithClaude, enrichAppDataWithClaude)
 *
 * @author SAS Technology Innovation Team
 */

// ==========================================
// DATA VALIDATION FUNCTIONS
// ==========================================

/**
 * Validates all active apps for required fields and reports issues.
 * Called from Google Sheets menu: 🤖 Digital Toolkit Admin → ✅ Validate Data
 *
 * Checks all active apps for the following required fields:
 * - product_name, description, division, category, website, department
 *
 * @function validateAllData
 * @returns {void} Displays results in a Google Sheets alert dialog
 *
 * @example
 * // Called from the Google Sheets custom menu
 * validateAllData();
 *
 * @see {@link findMissingFields} for a more detailed breakdown of missing data
 */
function validateAllData() {
  const ui = SpreadsheetApp.getUi();

  // Validate required configuration
  const config = validateScriptProperties(['SPREADSHEET_ID', 'SHEET_NAME']);
  if (!config) return;

  try {
    const sheet = SpreadsheetApp.openById(config.SPREADSHEET_ID).getSheetByName(config.SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const dataRows = values.slice(1);

    // Build column map using utility function
    const colMap = buildColumnMap(headers);

    const issues = [];

    // Define required fields using column map indices
    const requiredFieldsMap = {
      'product_name': colMap.productName,
      'description': colMap.description,
      'division': colMap.division,
      'category': colMap.category,
      'website': colMap.website,
      'department': colMap.department
    };

    dataRows.forEach((row, index) => {
      const rowNum = index + 2;

      // Use utility function for active check
      if (!isAppActive(row, colMap.active)) return;

      const appName = getCellValue(row, colMap.productName) || `Row ${rowNum}`;

      Object.entries(requiredFieldsMap).forEach(([fieldName, colIndex]) => {
        if (colIndex === -1) {
          issues.push(`❌ Column "${fieldName}" not found in sheet`);
        } else if (isEmpty(row[colIndex])) {
          issues.push(`⚠️ Row ${rowNum} (${appName}): Missing "${fieldName}"`);
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
    logError('Validation error', error);
  }
}

/**
 * Finds all rows with missing fields and displays a comprehensive report.
 * Called from Google Sheets menu: 🤖 Digital Toolkit Admin → 🔍 Find Missing Fields
 *
 * Tracks missing data for all optional fields:
 * - description, category, website, audience, grade_levels
 * - support_email, tutorial_link, mobile_app, sso_enabled, logo_url
 *
 * @function findMissingFields
 * @returns {void} Displays results in a Google Sheets alert dialog
 *
 * @example
 * // Called from the Google Sheets custom menu
 * findMissingFields();
 *
 * @see {@link validateAllData} for required field validation
 * @see {@link enrichAllMissingData} to automatically fill missing fields with AI
 */
function findMissingFields() {
  const ui = SpreadsheetApp.getUi();

  // Validate required configuration
  const config = validateScriptProperties(['SPREADSHEET_ID', 'SHEET_NAME']);
  if (!config) return;

  try {
    const sheet = SpreadsheetApp.openById(config.SPREADSHEET_ID).getSheetByName(config.SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const dataRows = values.slice(1);

    // Build column map using utility function
    const colMap = buildColumnMap(headers);

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

      // Use utility function for active check
      if (!isAppActive(row, colMap.active)) return;

      const appName = getCellValue(row, colMap.productName) || `Row ${rowNum}`;

      // Check each field using isEmpty utility
      if (isEmpty(row[colMap.description])) {
        missingData.description.push(`${appName} (Row ${rowNum})`);
      }
      if (isEmpty(row[colMap.category])) {
        missingData.category.push(`${appName} (Row ${rowNum})`);
      }
      if (isEmpty(row[colMap.website])) {
        missingData.website.push(`${appName} (Row ${rowNum})`);
      }
      if (isEmpty(row[colMap.audience])) {
        missingData.audience.push(`${appName} (Row ${rowNum})`);
      }
      if (isEmpty(row[colMap.gradeLevels])) {
        missingData.gradeLevels.push(`${appName} (Row ${rowNum})`);
      }
      if (isEmpty(row[colMap.supportEmail])) {
        missingData.supportEmail.push(`${appName} (Row ${rowNum})`);
      }
      if (isEmpty(row[colMap.tutorialLink])) {
        missingData.tutorialLink.push(`${appName} (Row ${rowNum})`);
      }
      if (isEmpty(row[colMap.mobileApp])) {
        missingData.mobileApp.push(`${appName} (Row ${rowNum})`);
      }
      // SSO enabled is a boolean field - check for empty/null/undefined specifically
      const ssoValue = row[colMap.ssoEnabled];
      if (ssoValue === '' || ssoValue === null || ssoValue === undefined) {
        missingData.ssoEnabled.push(`${appName} (Row ${rowNum})`);
      }
      if (isEmpty(row[colMap.logoUrl])) {
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
    logError('Missing fields analysis error', error);
  }
}

// ==========================================
// AI ENRICHMENT FUNCTIONS
// ==========================================

/**
 * Enriches apps with missing descriptions using Claude AI.
 * Called from Google Sheets menu: 🤖 Digital Toolkit Admin → ✨ Enrich Missing Descriptions
 *
 * Uses Claude API to generate 1-2 sentence descriptions for apps that have:
 * - No description or empty description field
 * - An active status (active = TRUE)
 * - A valid product name
 *
 * Safety features:
 * - Validates row before writing (checks product_name matches)
 * - Logs all changes to "Update Logs" sheet
 * - Flushes changes immediately after each write
 *
 * @function enrichMissingDescriptions
 * @returns {void} Displays results in a Google Sheets alert dialog
 * @requires CLAUDE_API_KEY - Must be set in Script Properties
 *
 * @example
 * // Called from the Google Sheets custom menu
 * enrichMissingDescriptions();
 *
 * @see {@link enrichAllMissingData} for comprehensive enrichment of all fields
 * @see {@link generateDescriptionWithClaude} in ai-functions.js for AI call details
 */
function enrichMissingDescriptions() {
  const ui = SpreadsheetApp.getUi();

  // Validate required configuration
  const config = validateScriptProperties(['SPREADSHEET_ID', 'SHEET_NAME', 'CLAUDE_API_KEY']);
  if (!config) return;

  const response = ui.alert(
    '✨ Enrich Missing Descriptions',
    'This will use Claude AI to generate descriptions for apps that are missing them. This operation may take several minutes. Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    const sheet = SpreadsheetApp.openById(config.SPREADSHEET_ID).getSheetByName(config.SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const dataRows = values.slice(1);

    // Build column map using utility function
    const colMap = buildColumnMap(headers);

    // Validate critical column indices
    if (colMap.productName === -1) {
      ui.alert('❌ Error', 'Could not find product_name column (Column B). Please check sheet structure.', ui.ButtonSet.OK);
      return;
    }
    if (colMap.description === -1) {
      ui.alert('❌ Error', 'Could not find description column. Please check sheet structure.', ui.ButtonSet.OK);
      return;
    }

    let enrichedCount = 0;
    let errorCount = 0;

    dataRows.forEach((row, index) => {
      const rowNum = index + 2; // Row 1 is headers, data starts at row 2

      // Use utility function for active check
      if (!isAppActive(row, colMap.active)) return;

      const description = row[colMap.description];
      const productName = getCellValue(row, colMap.productName);

      // Skip if no product name
      if (!productName) return;

      if (isEmpty(description)) {
        const category = getCellValue(row, colMap.category) || 'Unknown';
        const website = getCellValue(row, colMap.website);
        const subject = getCellValue(row, colMap.subjects);

        // SAFETY CHECK: Verify we're writing to the correct row by checking product_name
        const currentProductInSheet = sheet.getRange(rowNum, colMap.productName + 1).getValue();
        if (currentProductInSheet !== productName) {
          logWarning(`Row mismatch detected! Expected "${productName}" at row ${rowNum}, but found "${currentProductInSheet}". Skipping.`);
          errorCount++;
          return;
        }

        const generatedDesc = generateDescriptionWithClaude(productName, category, website, subject);

        if (generatedDesc && generatedDesc !== 'ERROR') {
          sheet.getRange(rowNum, colMap.description + 1).setValue(generatedDesc);
          enrichedCount++;
          logSuccess(`Enriched description for ${productName} (Row ${rowNum}, Column ${colMap.description + 1})`);

          // Log the update
          logDataUpdate('Enrich Description', productName, 'description', description, generatedDesc, rowNum);

          SpreadsheetApp.flush(); // Save immediately
        } else if (generatedDesc === 'ERROR') {
          errorCount++;
          logError(`Failed to enrich ${productName} (Row ${rowNum})`);
        }
      }
    });

    const message = `Successfully generated descriptions for ${enrichedCount} app(s).` +
                    (errorCount > 0 ? `\n\n⚠️ ${errorCount} app(s) failed to enrich.` : '');
    ui.alert('✅ Enrichment Complete', message, ui.ButtonSet.OK);

  } catch (error) {
    ui.alert('❌ Error', 'Enrichment failed: ' + error.message, ui.ButtonSet.OK);
    logError('Enrichment error', error);
  }
}

/**
 * Enriches ALL missing data using Claude AI.
 * Called from Google Sheets menu: 🤖 Digital Toolkit Admin → 🔄 Refresh All Missing Data
 *
 * Comprehensive enrichment that fills in all missing fields for active apps:
 * - description: 1-2 sentence app description
 * - category: App category from predefined list
 * - website: App URL
 * - audience: Target users (Teachers, Students, Staff, Parents)
 * - grade_levels: Applicable grade levels (validated against dropdown values)
 * - support_email: Support contact email
 * - tutorial_link: Training/help URL
 * - mobile_app: Mobile availability (Yes/No/iOS/Android)
 * - sso_enabled: SSO support (TRUE/FALSE)
 * - logo_url: App logo URL
 *
 * Performance optimizations:
 * - Batch size limit: 200 apps per run (configurable via PROCESSING_CONFIG.MAX_BATCH_SIZE)
 * - API delay: 100ms between calls (configurable via PROCESSING_CONFIG.API_DELAY_MS)
 * - Progress logging every 5 apps
 *
 * Safety features:
 * - Row mismatch detection before writing
 * - Grade level validation against allowed dropdown values
 * - Immediate flush after each write
 * - All changes logged to "Update Logs" sheet
 *
 * @function enrichAllMissingData
 * @returns {void} Displays results in a Google Sheets alert dialog
 * @requires CLAUDE_API_KEY - Must be set in Script Properties
 *
 * @example
 * // Called from the Google Sheets custom menu
 * enrichAllMissingData();
 *
 * @see {@link enrichMissingDescriptions} for description-only enrichment
 * @see {@link enrichAppDataWithClaude} in ai-functions.js for AI call details
 */
function enrichAllMissingData() {
  const ui = SpreadsheetApp.getUi();

  // Validate required configuration
  const config = validateScriptProperties(['SPREADSHEET_ID', 'SHEET_NAME', 'CLAUDE_API_KEY']);
  if (!config) return;

  try {
    const sheet = SpreadsheetApp.openById(config.SPREADSHEET_ID).getSheetByName(config.SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const dataRows = values.slice(1);

    // Build column map using utility function
    const colMap = buildColumnMap(headers);

    // Validate critical column indices
    if (colMap.productName === -1) {
      ui.alert('❌ Error', 'Could not find product_name column (Column B). Please check sheet structure.', ui.ButtonSet.OK);
      return;
    }

    // Count apps needing enrichment
    let appsNeedingEnrichment = 0;
    dataRows.forEach((row) => {
      if (!isAppActive(row, colMap.active)) return;

      const hasMissingData = isEmpty(row[colMap.description]) || isEmpty(row[colMap.category]) ||
                             isEmpty(row[colMap.website]) || isEmpty(row[colMap.audience]) ||
                             isEmpty(row[colMap.gradeLevels]) || isEmpty(row[colMap.supportEmail]) ||
                             isEmpty(row[colMap.tutorialLink]) || isEmpty(row[colMap.mobileApp]) ||
                             row[colMap.ssoEnabled] === '' || row[colMap.ssoEnabled] === null ||
                             isEmpty(row[colMap.logoUrl]);
      if (hasMissingData) appsNeedingEnrichment++;
    });

    // Use configuration constants
    const batchSize = Math.min(appsNeedingEnrichment, PROCESSING_CONFIG.MAX_BATCH_SIZE);
    const estimatedTime = Math.ceil(batchSize * PROCESSING_CONFIG.ESTIMATED_TIME_PER_APP / 60);

    const response = ui.alert(
      '🔄 Enrich All Missing Data',
      `Found ${appsNeedingEnrichment} app(s) with missing data.\n\n⚡ Will process ${batchSize} apps this run (max batch size: ${PROCESSING_CONFIG.MAX_BATCH_SIZE}).\n\nEstimated time: ~${estimatedTime} minute(s).\n\nContinue?`,
      ui.ButtonSet.YES_NO
    );

    if (response !== ui.Button.YES) return;

    let enrichedCount = 0;
    let errorCount = 0;
    let processedCount = 0;
    let skippedCount = 0;
    let rowMismatchCount = 0;

    dataRows.forEach((row, index) => {
      const rowNum = index + 2; // Row 1 is headers, data starts at row 2

      // Use utility function for active check
      if (!isAppActive(row, colMap.active)) return;

      const productName = getCellValue(row, colMap.productName);

      // Skip if no product name
      if (!productName) return;

      const hasMissingData = isEmpty(row[colMap.description]) || isEmpty(row[colMap.category]) ||
                             isEmpty(row[colMap.website]) || isEmpty(row[colMap.audience]) ||
                             isEmpty(row[colMap.gradeLevels]) || isEmpty(row[colMap.supportEmail]) ||
                             isEmpty(row[colMap.tutorialLink]) || isEmpty(row[colMap.mobileApp]) ||
                             row[colMap.ssoEnabled] === '' || row[colMap.ssoEnabled] === null ||
                             isEmpty(row[colMap.logoUrl]);

      if (hasMissingData) {
        // Stop processing if we've reached the batch limit (use processedCount to prevent infinite loop)
        if (processedCount >= PROCESSING_CONFIG.MAX_BATCH_SIZE) {
          skippedCount++;
          return;
        }

        processedCount++;

        // SAFETY CHECK: Verify we're writing to the correct row by checking product_name
        const currentProductInSheet = sheet.getRange(rowNum, colMap.productName + 1).getValue();
        if (currentProductInSheet !== productName) {
          logWarning(`Row mismatch detected! Expected "${productName}" at row ${rowNum}, but found "${currentProductInSheet}". Skipping.`);
          rowMismatchCount++;
          return;
        }

        if (processedCount % 5 === 0) {
          logDebug(`Progress: ${processedCount}/${batchSize} apps processed (${enrichedCount} enriched, ${errorCount} errors)`);
        }

        const enrichedData = enrichAppDataWithClaude({
          productName: productName,
          subject: getCellValue(row, colMap.subjects),
          division: getCellValue(row, colMap.division),
          currentDescription: getCellValue(row, colMap.description),
          currentCategory: getCellValue(row, colMap.category),
          currentWebsite: getCellValue(row, colMap.website),
          currentAudience: getCellValue(row, colMap.audience),
          currentGradeLevels: getCellValue(row, colMap.gradeLevels),
          currentSupportEmail: getCellValue(row, colMap.supportEmail),
          currentTutorialLink: getCellValue(row, colMap.tutorialLink),
          currentMobileApp: getCellValue(row, colMap.mobileApp),
          currentSsoEnabled: row[colMap.ssoEnabled],
          currentLogoUrl: getCellValue(row, colMap.logoUrl)
        });

        if (enrichedData && !enrichedData.error && enrichedData !== 'ERROR') {
          // Update each field if AI provided data and current value is empty
          if (enrichedData.description && isEmpty(row[colMap.description])) {
            sheet.getRange(rowNum, colMap.description + 1).setValue(enrichedData.description);
            logDataUpdate('Enrich All Fields', productName, 'description', row[colMap.description], enrichedData.description, rowNum);
          }
          if (enrichedData.category && isEmpty(row[colMap.category])) {
            sheet.getRange(rowNum, colMap.category + 1).setValue(enrichedData.category);
            logDataUpdate('Enrich All Fields', productName, 'category', row[colMap.category], enrichedData.category, rowNum);
          }
          if (enrichedData.website && isEmpty(row[colMap.website])) {
            sheet.getRange(rowNum, colMap.website + 1).setValue(enrichedData.website);
            logDataUpdate('Enrich All Fields', productName, 'website', row[colMap.website], enrichedData.website, rowNum);
          }
          if (enrichedData.audience && isEmpty(row[colMap.audience])) {
            sheet.getRange(rowNum, colMap.audience + 1).setValue(enrichedData.audience);
            logDataUpdate('Enrich All Fields', productName, 'audience', row[colMap.audience], enrichedData.audience, rowNum);
          }
          if (enrichedData.gradeLevels && isEmpty(row[colMap.gradeLevels])) {
            // Validate grade levels against allowed dropdown values using VALID_GRADES constant
            // Convert range notation to individual grades if AI returned a range
            let gradeLevelsToValidate = convertGradeRangeToIndividual(enrichedData.gradeLevels);
            gradeLevelsToValidate = gradeLevelsToValidate.trim().replace(/['"]/g, '');

            // Split comma-separated values and validate each individual grade
            const gradeList = gradeLevelsToValidate.split(',').map(g => g.trim());
            const invalidGrades = gradeList.filter(g => g !== '' && !VALID_GRADES.includes(g));

            if (invalidGrades.length === 0 && gradeList.length > 0 && gradeList[0] !== '') {
              // All grades are valid - join and set value
              const validatedGrades = gradeList.join(', ');
              sheet.getRange(rowNum, colMap.gradeLevels + 1).setValue(validatedGrades);
              logDataUpdate('Enrich All Fields', productName, 'grade_levels', row[colMap.gradeLevels], validatedGrades, rowNum);
            } else if (invalidGrades.length > 0) {
              // Some invalid grades found - log warning and skip
              logWarning(`Invalid grade levels "${invalidGrades.join(', ')}" for ${productName} (Row ${rowNum}). Original value: "${enrichedData.gradeLevels}". Skipping.`);
            }
          }
          if (enrichedData.supportEmail && isEmpty(row[colMap.supportEmail])) {
            sheet.getRange(rowNum, colMap.supportEmail + 1).setValue(enrichedData.supportEmail);
            logDataUpdate('Enrich All Fields', productName, 'support_email', row[colMap.supportEmail], enrichedData.supportEmail, rowNum);
          }
          if (enrichedData.tutorialLink && isEmpty(row[colMap.tutorialLink])) {
            sheet.getRange(rowNum, colMap.tutorialLink + 1).setValue(enrichedData.tutorialLink);
            logDataUpdate('Enrich All Fields', productName, 'tutorial_link', row[colMap.tutorialLink], enrichedData.tutorialLink, rowNum);
          }
          if (enrichedData.mobileApp && isEmpty(row[colMap.mobileApp])) {
            sheet.getRange(rowNum, colMap.mobileApp + 1).setValue(enrichedData.mobileApp);
            logDataUpdate('Enrich All Fields', productName, 'mobile_app', row[colMap.mobileApp], enrichedData.mobileApp, rowNum);
          }
          if (enrichedData.ssoEnabled !== undefined && (row[colMap.ssoEnabled] === '' || row[colMap.ssoEnabled] === null)) {
            sheet.getRange(rowNum, colMap.ssoEnabled + 1).setValue(enrichedData.ssoEnabled);
            logDataUpdate('Enrich All Fields', productName, 'sso_enabled', row[colMap.ssoEnabled], enrichedData.ssoEnabled, rowNum);
          }
          if (enrichedData.logoUrl && isEmpty(row[colMap.logoUrl])) {
            sheet.getRange(rowNum, colMap.logoUrl + 1).setValue(enrichedData.logoUrl);
            logDataUpdate('Enrich All Fields', productName, 'logo_url', row[colMap.logoUrl], enrichedData.logoUrl, rowNum);
          }

          enrichedCount++;
          logSuccess(`Enriched data for ${productName} (Row ${rowNum})`);
          SpreadsheetApp.flush();
        } else {
          errorCount++;
          const errorType = enrichedData && enrichedData.error ? enrichedData.error : 'UNKNOWN';
          const errorDetails = enrichedData && enrichedData.details ? enrichedData.details : 'No details';
          logError(`Failed to enrich ${productName} (Row ${rowNum}) - Error: ${errorType} - ${errorDetails}`);
        }

        // Use configured API delay for rate limiting
        Utilities.sleep(PROCESSING_CONFIG.API_DELAY_MS);
      }
    });

    const remainingApps = appsNeedingEnrichment - enrichedCount;
    const message = `✅ Successfully enriched ${enrichedCount} app(s) with missing data.` +
                    (errorCount > 0 ? `\n\n⚠️ ${errorCount} app(s) failed to enrich.` : '') +
                    (rowMismatchCount > 0 ? `\n\n🚨 ${rowMismatchCount} row mismatch(es) detected - check logs for details.` : '') +
                    (remainingApps > 0 ? `\n\n📊 ${remainingApps} app(s) still need enrichment. Run again to continue.` : '\n\n🎉 All apps processed!');
    ui.alert('✅ Enrichment Complete', message, ui.ButtonSet.OK);

  } catch (error) {
    ui.alert('❌ Error', 'Enrichment failed: ' + error.message, ui.ButtonSet.OK);
    logError('Full enrichment error', error);
  }
}

// ==========================================
// AI HELPER FUNCTIONS
// All AI-related functions have been moved to ai-functions.js
// The following functions are now in ai-functions.js:
// - generateDescriptionWithClaude, enrichAppDataWithClaude
// - testClaude, testGemini
// - logAIQuery, extractAppNames, analyzeAIChatPatterns
// - getAIChatStats, queryAnalyticsAI, buildDataSummary
// ==========================================

// ==========================================
// LOGGING FUNCTIONS
// ==========================================

/**
 * Logs data enrichment operations to "Update Logs" sheet.
 * Creates the sheet if it doesn't exist. Silent failure to prevent disrupting enrichment operations.
 *
 * The Update Logs sheet tracks all data modifications with columns:
 * - Timestamp: When the update occurred
 * - Operation: Type of operation (e.g., "Enrich Description", "Enrich All Fields")
 * - App Name: Name of the app that was modified
 * - Row: Sheet row number where the change was made
 * - Field: Which field was updated
 * - Old Value: Previous value (or "[EMPTY]" if blank)
 * - New Value: New value that was set
 *
 * @function logDataUpdate
 * @param {string} operation - The type of operation being performed
 * @param {string} appName - Name of the app being updated
 * @param {string} field - The field being updated
 * @param {*} oldValue - The previous value
 * @param {*} newValue - The new value
 * @param {number} rowNum - The row number in the sheet
 * @returns {void}
 *
 * @example
 * logDataUpdate('Enrich Description', 'Kahoot!', 'description', '', 'Interactive quiz platform', 15);
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

// ==========================================
// ANALYTICS DASHBOARD FUNCTIONS
// ==========================================

/**
 * Shows the analytics dashboard popup in Google Sheets.
 * Called from Google Sheets menu: 🤖 Digital Toolkit Admin → 📊 Analytics Dashboard
 *
 * Opens a modal dialog (900x700px) displaying:
 * - App statistics and counts
 * - Data quality scores
 * - Division breakdown
 * - License type distribution
 * - Recent activity from Update Logs
 * - AI chat usage statistics
 * - App overlap detection for cost savings
 *
 * @function showAnalyticsDashboard
 * @returns {void}
 *
 * @see {@link getAnalyticsData} for the data gathering function
 * @see analytics-dashboard.html for the dashboard UI
 */
function showAnalyticsDashboard() {
  const html = HtmlService.createHtmlOutputFromFile('analytics-dashboard')
    .setWidth(900)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, 'Digital Toolkit Analytics');
}

/**
 * Gathers comprehensive analytics data for the dashboard.
 * Called by the analytics-dashboard.html frontend via google.script.run.
 *
 * Data collected:
 * - stats: totalApps, inactiveApps, enterpriseApps, newAppsLast30Days
 * - dataQuality: score (0-100%), missingFields breakdown
 * - divisionBreakdown: wholeSchool, elementary, middleSchool, highSchool counts
 * - licenseTypes: distribution of license types
 * - recentActivity: last 10 updates from Update Logs
 * - aiChatStats: AI usage metrics from AI Chat Analytics sheet
 * - appOverlaps: detected overlapping functionality between apps
 * - potentialSavings: estimated cost savings from consolidation
 *
 * @function getAnalyticsData
 * @returns {Object} Analytics data object or {error: string} on failure
 *
 * @example
 * // Called from analytics-dashboard.html
 * google.script.run
 *   .withSuccessHandler(renderDashboard)
 *   .getAnalyticsData();
 */
function getAnalyticsData() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
    const SHEET_NAME = scriptProperties.getProperty('SHEET_NAME');

    if (!SPREADSHEET_ID || !SHEET_NAME) {
      return { error: 'Configuration error: SPREADSHEET_ID and SHEET_NAME must be set.' };
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const dataRows = values.slice(1);

    // Build column map using utility function
    const colIndex = buildColumnMap(headers);

    // Basic stats
    let totalApps = 0;
    let inactiveApps = 0;
    let enterpriseApps = 0;
    let newAppsLast30Days = 0;
    const thirtyDaysAgo = getDaysAgo(PROCESSING_CONFIG.NEW_APP_THRESHOLD_DAYS);

    // Division breakdown
    const divisionBreakdown = {
      wholeSchool: 0,
      elementary: 0,
      middleSchool: 0,
      highSchool: 0
    };

    // License types
    const licenseTypes = {};

    // Missing fields tracking
    const missingFields = {
      description: 0,
      category: 0,
      website: 0,
      audience: 0,
      gradeLevels: 0,
      logoUrl: 0,
      tutorialLink: 0,
      supportEmail: 0
    };

    // Process each row
    dataRows.forEach(row => {
      // Use utility function for active check
      if (!isAppActive(row, colIndex.active)) {
        inactiveApps++;
        return;
      }

      totalApps++;

      // Enterprise check using parseBoolean utility
      if (parseBoolean(row[colIndex.enterprise])) {
        enterpriseApps++;
      }

      // New apps check using isWithinDays utility
      if (colIndex.dateAdded !== -1 && row[colIndex.dateAdded]) {
        if (isWithinDays(row[colIndex.dateAdded], PROCESSING_CONFIG.NEW_APP_THRESHOLD_DAYS)) {
          newAppsLast30Days++;
        }
      }

      // Division breakdown using utility functions
      const division = getCellValue(row, colIndex.division);
      const licenseType = getCellValue(row, colIndex.licenseType);
      const department = getCellValue(row, colIndex.department);

      // Use utility function for whole school check
      const divisionsPresent = parseDivisions(division);

      if (isEffectivelyWholeSchool(licenseType, department, division, divisionsPresent)) {
        divisionBreakdown.wholeSchool++;
      } else {
        if (divisionsPresent.es) divisionBreakdown.elementary++;
        if (divisionsPresent.ms) divisionBreakdown.middleSchool++;
        if (divisionsPresent.hs) divisionBreakdown.highSchool++;
      }

      // License type counting
      const normalizedLicense = licenseType || 'Unknown';
      licenseTypes[normalizedLicense] = (licenseTypes[normalizedLicense] || 0) + 1;

      // Missing fields check using isEmpty utility
      if (isEmpty(row[colIndex.description])) missingFields.description++;
      if (isEmpty(row[colIndex.category])) missingFields.category++;
      if (isEmpty(row[colIndex.website])) missingFields.website++;
      if (isEmpty(row[colIndex.audience])) missingFields.audience++;
      if (isEmpty(row[colIndex.gradeLevels])) missingFields.gradeLevels++;
      if (isEmpty(row[colIndex.logoUrl])) missingFields.logoUrl++;
      if (isEmpty(row[colIndex.tutorialLink])) missingFields.tutorialLink++;
      if (isEmpty(row[colIndex.supportEmail])) missingFields.supportEmail++;
    });

    // Calculate data quality score
    const totalFieldsChecked = totalApps * 8; // 8 fields we check
    const totalMissing = Object.values(missingFields).reduce((sum, val) => sum + val, 0);
    const qualityScore = totalFieldsChecked > 0 ? Math.round(((totalFieldsChecked - totalMissing) / totalFieldsChecked) * 100) : 100;

    // Get recent activity from Update Logs
    const recentActivity = getRecentActivity(spreadsheet);

    // Get AI chat stats
    const aiChatStats = getAIChatStats(spreadsheet);

    // Detect app overlaps - include all relevant fields for smart overlap detection
    const apps = dataRows
      .filter(row => isAppActive(row, colIndex.active))
      .map(row => ({
        productName: getCellValue(row, colIndex.productName),
        description: getCellValue(row, colIndex.description),
        category: getCellValue(row, colIndex.category),
        subjects: getCellValue(row, colIndex.subjects),
        value: row[colIndex.value] || 0,
        licenseType: getCellValue(row, colIndex.licenseType),
        division: getCellValue(row, colIndex.division),
        department: getCellValue(row, colIndex.department),
        audience: getCellValue(row, colIndex.audience),
        gradeLevels: getCellValue(row, colIndex.gradeLevels)
      }));

    const appOverlaps = detectAppOverlaps(apps);
    const potentialSavings = calculatePotentialSavings(appOverlaps);

    return {
      stats: {
        totalApps: totalApps,
        inactiveApps: inactiveApps,
        enterpriseApps: enterpriseApps,
        newAppsLast30Days: newAppsLast30Days
      },
      dataQuality: {
        score: qualityScore,
        missingFields: missingFields
      },
      divisionBreakdown: divisionBreakdown,
      licenseTypes: licenseTypes,
      recentActivity: recentActivity,
      aiChatStats: aiChatStats,
      appOverlaps: appOverlaps,
      potentialSavings: potentialSavings
    };

  } catch (error) {
    Logger.log('Error getting analytics data: ' + error.message);
    return { error: error.message };
  }
}

/**
 * Gets recent activity from Update Logs sheet.
 * Returns the last 10 entries, most recent first.
 *
 * Activity types:
 * - 'enriched': AI-generated data updates
 * - 'new': Newly added apps
 * - 'update': Manual updates
 *
 * @function getRecentActivity
 * @param {Spreadsheet} spreadsheet - The spreadsheet object
 * @returns {Array<Object>} Array of activity objects with type, title, and time
 *
 * @example
 * const activities = getRecentActivity(spreadsheet);
 * // Returns: [{ type: 'enriched', title: 'Enriched description for Kahoot!', time: '2 hours ago' }]
 */
function getRecentActivity(spreadsheet) {
  try {
    const logSheet = spreadsheet.getSheetByName('Update Logs');
    if (!logSheet) return [];

    const values = logSheet.getDataRange().getValues();
    if (values.length <= 1) return [];

    const dataRows = values.slice(1);
    const activities = [];

    // Get last 10 entries, most recent first
    const recentRows = dataRows.slice(-10).reverse();

    recentRows.forEach(row => {
      const timestamp = row[0];
      const operation = row[1] || '';
      const appName = row[2] || '';
      const field = row[4] || '';

      let type = 'update';
      let title = '';

      if (operation.toLowerCase().includes('enrich')) {
        type = 'enriched';
        title = `Enriched ${field} for ${appName}`;
      } else if (operation.toLowerCase().includes('add')) {
        type = 'new';
        title = `Added new app: ${appName}`;
      } else {
        title = `Updated ${appName}: ${field}`;
      }

      activities.push({
        type: type,
        title: title,
        time: formatTimeAgo(timestamp)
      });
    });

    return activities;

  } catch (error) {
    Logger.log('Error getting recent activity: ' + error.message);
    return [];
  }
}

// getAIChatStats moved to ai-functions.js
// formatTimeAgo moved to utilities.js

// ==========================================
// APP OVERLAP DETECTION
// ==========================================

/**
 * Parses grade levels string and returns normalized grade numbers.
 * Used by overlap detection to compare apps across different grade representations.
 *
 * Grade number mappings:
 * - Pre-K = -1
 * - Kindergarten = 0
 * - Grade 1-12 = 1-12
 *
 * @function parseGradeLevels
 * @param {string} gradeLevelsStr - Grade levels string (e.g., "Pre-K, Kindergarten, Grade 1, Grade 2")
 * @returns {number[]} Array of grade numbers, sorted ascending
 *
 * @example
 * parseGradeLevels('Pre-K, Kindergarten, Grade 1');  // Returns: [-1, 0, 1]
 * parseGradeLevels('Grade 6, Grade 7, Grade 8');      // Returns: [6, 7, 8]
 */
function parseGradeLevels(gradeLevelsStr) {
  if (!gradeLevelsStr) return [];

  const grades = [];
  const str = gradeLevelsStr.toLowerCase();

  if (str.includes('pre-k') || str.includes('prek')) grades.push(-1);
  if (str.includes('kindergarten') || str.includes('kinder')) grades.push(0);

  for (let i = 1; i <= 12; i++) {
    if (str.includes(`grade ${i}`) || str.includes(`grade${i}`) || str.match(new RegExp(`\\b${i}\\b`))) {
      grades.push(i);
    }
  }

  return [...new Set(grades)].sort((a, b) => a - b);
}

/**
 * Checks if two apps have overlapping grade levels.
 * If either array is empty, assumes overlap (conservative approach).
 *
 * @function hasGradeOverlap
 * @param {number[]} grades1 - First app's grade numbers
 * @param {number[]} grades2 - Second app's grade numbers
 * @returns {boolean} True if there's any grade overlap
 *
 * @example
 * hasGradeOverlap([1, 2, 3], [3, 4, 5]);  // Returns: true (overlap at 3)
 * hasGradeOverlap([1, 2, 3], [4, 5, 6]);  // Returns: false (no overlap)
 * hasGradeOverlap([], [1, 2, 3]);          // Returns: true (empty = assume overlap)
 */
function hasGradeOverlap(grades1, grades2) {
  if (grades1.length === 0 || grades2.length === 0) return true; // If either is empty, assume overlap
  return grades1.some(g => grades2.includes(g));
}

/**
 * Determines which division an app belongs to based on grade levels or division field.
 * Checks division string first, then infers from grade numbers.
 *
 * @function getDivisionFromGrades
 * @param {number[]} grades - Array of grade numbers
 * @param {string} divisionStr - Division field value
 * @returns {string} Division: 'elementary', 'middle', 'high', 'whole-school', 'multi-division', or 'unknown'
 *
 * @example
 * getDivisionFromGrades([], 'SAS Elementary School');     // Returns: 'elementary'
 * getDivisionFromGrades([6, 7, 8], '');                   // Returns: 'middle'
 * getDivisionFromGrades([-1, 0, 1, 6, 7, 9, 10], '');     // Returns: 'whole-school'
 */
function getDivisionFromGrades(grades, divisionStr) {
  const div = (divisionStr || '').toLowerCase();

  // Check division string first
  if (div.includes('elementary') || div.includes('early learning')) return 'elementary';
  if (div.includes('middle')) return 'middle';
  if (div.includes('high')) return 'high';
  if (div.includes('whole school') || div.includes('school-wide')) return 'whole-school';

  // Infer from grades
  if (grades.length === 0) return 'unknown';

  const hasElementary = grades.some(g => g >= -1 && g <= 5);
  const hasMiddle = grades.some(g => g >= 6 && g <= 8);
  const hasHigh = grades.some(g => g >= 9 && g <= 12);

  if (hasElementary && hasMiddle && hasHigh) return 'whole-school';
  if (hasElementary && !hasMiddle && !hasHigh) return 'elementary';
  if (hasMiddle && !hasElementary && !hasHigh) return 'middle';
  if (hasHigh && !hasElementary && !hasMiddle) return 'high';

  return 'multi-division';
}

/**
 * Detects apps with overlapping functionality based on category, division, grade levels, and audience.
 * Only flags overlaps when apps serve the SAME audience in the SAME grade range.
 * Categories are tailored for K-12 educational technology at Singapore American School.
 *
 * Detection algorithm:
 * 1. Group apps by predefined tool type categories (LMS, Assessment, Content Creation, etc.)
 * 2. Within each category, identify apps with overlapping grades AND audience
 * 3. Calculate potential cost savings from consolidation
 * 4. Generate smart recommendations based on context
 *
 * Categories detected:
 * - Learning Management Systems (Canvas, Schoology, Google Classroom, etc.)
 * - AI Tools (Writing, Tutoring, Media Generation)
 * - Assessment Tools (Formative, Summative, Plagiarism)
 * - Content & Media Tools (Reading, Video, Simulations)
 * - Creation & Collaboration Tools (Presentation, Design, Coding)
 * - Communication Tools (Parent, Messaging)
 * - Operations & Administration (SIS, Library, Device Management, etc.)
 *
 * @function detectAppOverlaps
 * @param {Array<Object>} apps - Array of app objects with productName, description, category, etc.
 * @returns {Array<Object>} Array of overlap objects with category, apps, potentialSavings, recommendation
 *
 * @example
 * const overlaps = detectAppOverlaps(apps);
 * // Returns: [{ category: 'LMS', apps: [...], potentialSavings: 5000, recommendation: '...' }]
 *
 * @see {@link hasGradeOverlap} for grade comparison logic
 * @see {@link parseGradeLevels} for grade parsing
 */
function detectAppOverlaps(apps) {
  // Define overlap categories by TOOL TYPE (not subjects/departments - those have separate columns)
  // Only detects overlaps when apps serve same grades AND same audience
  const overlapCategories = {
    // ==========================================
    // LEARNING PLATFORMS & AI TOOLS
    // ==========================================

    // Learning Management Systems
    'Learning Management Systems': ['lms', 'canvas', 'schoology', 'google classroom', 'moodle', 'blackboard', 'brightspace', 'learning management', 'course management', 'powerschool learning', 'managebac'],

    // AI Tools (by function type)
    'AI Writing Assistants': ['chatgpt', 'claude', 'gemini', 'copilot', 'writesonic', 'jasper', 'quillbot', 'wordtune', 'grammarly ai', 'magic write', 'ai writing', 'generative ai'],
    'AI Tutoring Platforms': ['khanmigo', 'duolingo max', 'century tech', 'squirrel ai', 'carnegie learning', 'ai tutor'],
    'AI Media Generators': ['dall-e', 'midjourney', 'stable diffusion', 'adobe firefly', 'canva ai', 'runway', 'pictory', 'synthesia', 'ai image', 'ai video'],

    // ==========================================
    // ASSESSMENT & FEEDBACK TOOLS
    // ==========================================

    'Formative Assessment Tools': ['kahoot', 'quizizz', 'formative', 'nearpod', 'pear deck', 'socrative', 'plickers', 'gimkit', 'blooket', 'poll everywhere', 'mentimeter', 'slido'],
    'Summative Assessment Platforms': ['map growth', 'nwea', 'renaissance', 'star assessment', 'illuminate', 'mastery connect'],
    'Plagiarism Detection': ['turnitin', 'copyleaks', 'plagiarism', 'originality'],
    'Writing Feedback Tools': ['grammarly', 'writable', 'quill', 'noredink', 'revision assistant', 'kami'],

    // ==========================================
    // CONTENT & MEDIA TOOLS
    // ==========================================

    'Adaptive Learning Platforms': ['dreambox', 'lexia', 'ixl', 'khan academy', 'aleks', 'adaptive learning', 'personalized learning'],
    'Practice & Drill Platforms': ['prodigy', 'reflex math', 'xtramath', 'mathletics', 'typing.com', 'practice'],
    'Reading Platforms': ['raz-kids', 'epic', 'reading a-z', 'newsela', 'commonlit', 'readworks', 'sora', 'overdrive', 'achieve3000'],
    'Interactive Video Platforms': ['edpuzzle', 'playposit', 'vizia', 'ted-ed', 'flocabulary'],
    'Video/Screen Recording': ['flipgrid', 'flip', 'wevideo', 'screencastify', 'loom', 'screencast-o-matic', 'clips'],
    'Simulation Tools': ['phet', 'gizmos', 'labster', 'biodigital', 'visible body', 'simulation'],
    'Research Databases': ['world book', 'britannica', 'gale', 'ebsco', 'jstor', 'proquest'],
    'eBook Platforms': ['sora', 'overdrive', 'epic', 'ebook', 'digital library'],

    // ==========================================
    // CREATION & COLLABORATION TOOLS
    // ==========================================

    'Presentation Tools': ['canva', 'prezi', 'piktochart', 'visme', 'genially', 'google slides', 'powerpoint', 'keynote', 'presentation'],
    'Design Tools': ['canva', 'adobe express', 'adobe creative', 'figma', 'photoshop', 'illustrator', 'design'],
    'Digital Whiteboards': ['jamboard', 'miro', 'mural', 'lucidspark', 'whiteboard.fi', 'explain everything', 'figjam'],
    'Collaboration Platforms': ['padlet', 'google workspace', 'microsoft 365', 'notion', 'collaboration'],
    'Coding Platforms': ['scratch', 'code.org', 'kodable', 'tynker', 'replit', 'codehs', 'codecademy'],
    'Student Portfolio Tools': ['seesaw', 'book creator', 'portfolio', 'student work'],

    // ==========================================
    // COMMUNICATION TOOLS
    // ==========================================

    'Parent Communication': ['seesaw', 'classdojo', 'bloomz', 'remind', 'talking points', 'konstella', 'brightwheel', 'parent communication'],
    'Messaging Platforms': ['slack', 'teams', 'remind', 'messaging'],

    // ==========================================
    // OPERATIONS & ADMINISTRATION
    // ==========================================

    'Student Information Systems': ['powerschool', 'infinite campus', 'skyward', 'aeries', 'sis', 'student information', 'managebac', 'openapply'],
    'Scheduling Tools': ['calendly', 'doodle', 'youcanbook', 'acuity', 'schedule', 'booking'],
    'Library Systems': ['destiny', 'follett', 'alexandria', 'library management', 'koha', 'libguides'],
    'Device Management': ['jamf', 'mosyle', 'intune', 'kandji', 'mdm', 'device management', 'google admin'],
    'Content Filtering': ['securly', 'gaggle', 'bark', 'goguardian', 'lightspeed', 'content filter', 'web filter'],
    'Safety Monitoring': ['securly', 'gaggle', 'bark', 'goguardian', 'student safety', 'monitoring'],
    'Visitor Management': ['raptor', 'lobbyguard', 'ident-a-kid', 'visitor management'],
    'Payment Systems': ['myschoolbucks', 'payschools', 'schoolcafe', 'linq', 'payment'],
    'Professional Development': ['canvas catalog', 'coursera', 'linkedin learning', 'professional development', 'pd platform'],
    'Facilities Management': ['schooldude', 'famis', 'maintenance', 'work order'],
    'Transportation Systems': ['here comes the bus', 'transfinder', 'bus tracking', 'transportation']
  };

  const overlaps = [];
  const processedApps = new Set();

  // Pre-process apps to add parsed grade levels and division info
  const enrichedApps = apps.map(app => ({
    ...app,
    parsedGrades: parseGradeLevels(app.gradeLevels),
    normalizedDivision: getDivisionFromGrades(parseGradeLevels(app.gradeLevels), app.division),
    audienceLower: (app.audience || '').toLowerCase()
  }));

  // Group apps by potential overlap category
  Object.entries(overlapCategories).forEach(([category, keywords]) => {
    const matchingApps = enrichedApps.filter(app => {
      if (processedApps.has(app.productName)) return false;

      const searchText = `${app.productName} ${app.description || ''} ${app.category || ''} ${app.subjects || ''}`.toLowerCase();
      return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
    });

    // Skip if less than 2 apps match the category
    if (matchingApps.length < 2) return;

    // Group matching apps by division/grade overlap
    // Only flag as overlap if apps serve overlapping grades AND similar audience
    const overlapGroups = [];
    const appsCopy = [...matchingApps];

    while (appsCopy.length > 0) {
      const firstApp = appsCopy.shift();
      const group = [firstApp];

      // Find other apps that overlap with this one
      for (let i = appsCopy.length - 1; i >= 0; i--) {
        const otherApp = appsCopy[i];

        // Check grade overlap
        const gradesOverlap = hasGradeOverlap(firstApp.parsedGrades, otherApp.parsedGrades);

        // Check audience overlap (both serve students, both serve teachers, etc.)
        const audienceOverlap =
          (firstApp.audienceLower.includes('student') && otherApp.audienceLower.includes('student')) ||
          (firstApp.audienceLower.includes('teacher') && otherApp.audienceLower.includes('teacher')) ||
          (firstApp.audienceLower === '' || otherApp.audienceLower === ''); // Empty means unknown, assume overlap

        if (gradesOverlap && audienceOverlap) {
          group.push(otherApp);
          appsCopy.splice(i, 1);
        }
      }

      if (group.length >= 2) {
        overlapGroups.push(group);
      }
    }

    // Create overlap entries for each group
    overlapGroups.forEach(group => {
      const appsWithCosts = group.map(app => ({
        name: app.productName,
        cost: parseFloat(app.value) || 0,
        licenseType: app.licenseType || 'Unknown',
        division: app.normalizedDivision || 'Unknown',
        gradeLevels: app.gradeLevels || 'Not specified',
        audience: app.audience || 'Not specified'
      }));

      // Calculate potential savings (keep cheapest, sum rest)
      const sortedByCost = [...appsWithCosts].sort((a, b) => a.cost - b.cost);
      const potentialSavings = sortedByCost.slice(1).reduce((sum, app) => sum + app.cost, 0);

      // Generate smarter recommendation based on context
      let recommendation = '';
      const divisions = [...new Set(group.map(a => a.normalizedDivision))];
      const divisionContext = divisions.length === 1 ? divisions[0] : 'multiple divisions';

      if (potentialSavings > 0) {
        const cheapest = sortedByCost[0];
        recommendation = `Apps serving ${divisionContext}: Consider consolidating to **${cheapest.name}** (lowest cost at $${cheapest.cost.toLocaleString()}). Review actual usage before changes.`;
      } else {
        recommendation = `Multiple free tools for ${divisionContext}. Evaluate which best supports curriculum needs and standardize to reduce training overhead.`;
      }

      overlaps.push({
        category,
        apps: appsWithCosts,
        potentialSavings,
        recommendation,
        divisionContext
      });

      // Mark apps as processed
      group.forEach(app => processedApps.add(app.productName));
    });
  });

  // Sort by potential savings (highest first)
  overlaps.sort((a, b) => b.potentialSavings - a.potentialSavings);

  return overlaps;
}

/**
 * Calculates total potential savings from app consolidation.
 * Sums the potentialSavings from each overlap group.
 *
 * @function calculatePotentialSavings
 * @param {Array<Object>} overlaps - Array of overlap objects from detectAppOverlaps
 * @returns {number} Total potential savings in currency
 *
 * @example
 * const totalSavings = calculatePotentialSavings(overlaps);
 * // Returns: 15000 (if overlaps could save $15,000)
 */
function calculatePotentialSavings(overlaps) {
  return overlaps.reduce((total, group) => total + group.potentialSavings, 0);
}

// ==========================================
// AI ANALYTICS CHAT
// queryAnalyticsAI and buildDataSummary moved to ai-functions.js
// ==========================================

// ==========================================
// GRADE LEVEL HELPER FUNCTIONS
// ==========================================

/**
 * Converts grade range notation to comma-separated individual grades.
 * Handles various input formats and normalizes them to the standard format
 * used in Google Sheets data validation.
 *
 * Input formats supported:
 * - Range notation: "K-5", "6-8", "9-12"
 * - With Pre-K: "PREK-5", "PRE-K-K"
 * - Multiple ranges: "3-5, 6-8"
 * - Individual grades: "Grade 1" (passes through)
 *
 * Output format:
 * - Comma-separated individual grades: "Pre-K, Kindergarten, Grade 1, Grade 2, ..."
 *
 * Used by enrichAllMissingData for grade level validation before writing to sheet.
 *
 * @function convertGradeRangeToIndividual
 * @param {string} rangeString - Grade range string to convert
 * @returns {string} Comma-separated individual grades
 *
 * @example
 * convertGradeRangeToIndividual('K-5');
 * // Returns: "Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5"
 *
 * convertGradeRangeToIndividual('6-8');
 * // Returns: "Grade 6, Grade 7, Grade 8"
 *
 * convertGradeRangeToIndividual('3-5, 9-12');
 * // Returns: "Grade 3, Grade 4, Grade 5, Grade 9, Grade 10, Grade 11, Grade 12"
 */
function convertGradeRangeToIndividual(rangeString) {
  if (!rangeString) return '';

  // Handle comma-separated ranges (e.g., "3-5, 6-8")
  if (rangeString.includes(',')) {
    const parts = rangeString.split(',').map(p => p.trim());
    const converted = parts.map(part => convertGradeRangeToIndividual(part));
    // Flatten and deduplicate
    const allGrades = converted.join(', ').split(', ').map(g => g.trim());
    const uniqueGrades = [...new Set(allGrades)];
    return uniqueGrades.join(', ');
  }

  const cleaned = rangeString.trim().toUpperCase();

  // Handle common range patterns - aligned with SAS division structure
  const rangePatterns = {
    // Individual grades (already correct)
    'GRADE 1': 'Grade 1',
    'GRADE 2': 'Grade 2',
    'GRADE 3': 'Grade 3',
    'GRADE 4': 'Grade 4',
    'GRADE 5': 'Grade 5',
    'GRADE 6': 'Grade 6',
    'GRADE 7': 'Grade 7',
    'GRADE 8': 'Grade 8',
    'GRADE 9': 'Grade 9',
    'GRADE 10': 'Grade 10',
    'GRADE 11': 'Grade 11',
    'GRADE 12': 'Grade 12',

    // Specific grade ranges
    '1-2': 'Grade 1, Grade 2',
    '1-3': 'Grade 1, Grade 2, Grade 3',
    '1-4': 'Grade 1, Grade 2, Grade 3, Grade 4',
    '1-5': 'Grade 1, Grade 2, Grade 3, Grade 4, Grade 5',
    '2-5': 'Grade 2, Grade 3, Grade 4, Grade 5',
    '3-5': 'Grade 3, Grade 4, Grade 5',
    '3-8': 'Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8',
    '3-12': 'Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12',
    '4-5': 'Grade 4, Grade 5',

    // Early Learning (Pre-K and K only)
    'PREK-K': 'Pre-K, Kindergarten',
    'PRE-K-K': 'Pre-K, Kindergarten',

    // Middle School (Grade 6-8 only)
    '6-8': 'Grade 6, Grade 7, Grade 8',
    '6-12': 'Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12',
    '7-8': 'Grade 7, Grade 8',
    '7-12': 'Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12',

    // High School (Grade 9-12 only)
    '9-12': 'Grade 9, Grade 10, Grade 11, Grade 12',
    '9-10': 'Grade 9, Grade 10',
    '10-12': 'Grade 10, Grade 11, Grade 12',
    '11-12': 'Grade 11, Grade 12',

    // Combined ranges (for legacy data)
    'K-5': 'Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5',
    'K-8': 'Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8',
    'K-12': 'Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12',
    'PREK-5': 'Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5',
    'PRE-K-5': 'Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5',
    'PREK-12': 'Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12',
    'PRE-K-12': 'Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12'
  };

  return rangePatterns[cleaned] || rangeString;
}
