/**
 * Utilities Module
 * Shared helper functions for the SAS Digital Toolkit
 *
 * This module contains reusable utility functions used across:
 * - Code.js (main backend)
 * - data-management.js (data validation and enrichment)
 * - ai-functions.js (AI-related functions)
 *
 * @fileoverview Common utilities for data processing, validation, and formatting
 * @author SAS Technology Innovation Team
 */

// ==========================================
// CONFIGURATION CONSTANTS
// ==========================================

/**
 * AI model identifiers used across the application
 * Update these values when changing AI providers or model versions
 * @constant {Object}
 */
const AI_MODELS = {
  /** Claude model - using Haiku (smallest/fastest) for all operations */
  CLAUDE_FAST: 'claude-3-5-haiku-20241022',
  /** Legacy aliases for backward compatibility - all use Haiku now */
  CLAUDE_CHAT: 'claude-3-5-haiku-20241022',
  CLAUDE_ANALYTICS: 'claude-3-5-haiku-20241022',
  /** Gemini model for user-facing chat (when Claude not available) */
  GEMINI_CHAT: 'gemini-2.0-flash-exp'
};

/**
 * Processing configuration for batch operations
 * @constant {Object}
 */
const PROCESSING_CONFIG = {
  /** Maximum apps to process in a single enrichment batch */
  MAX_BATCH_SIZE: 200,
  /** Delay between API calls in milliseconds (rate limiting) */
  API_DELAY_MS: 100,
  /** Estimated seconds per app for time calculations */
  ESTIMATED_TIME_PER_APP: 2,
  /** Days threshold for "new" app badge */
  NEW_APP_THRESHOLD_DAYS: 30
};

/**
 * Valid grade levels for the SAS division structure
 * Pre-K through Grade 12
 * @constant {string[]}
 */
const VALID_GRADES = [
  'Pre-K', 'Kindergarten',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8',
  'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
];

/**
 * Valid audience types for app targeting
 * @constant {string[]}
 */
const VALID_AUDIENCES = ['Teachers', 'Students', 'Staff', 'Parents'];

/**
 * Valid license types matching Google Sheets data validation
 * Note: Uses intentional typo "Inidividual" and British spelling "Site Licence"
 * @constant {string[]}
 */
const VALID_LICENSE_TYPES = ['Site Licence', 'Inidividual', 'Division License', 'Free', 'Enterprise', 'Unlimited'];

/**
 * Valid budget categories matching Google Sheets data validation
 * Note: Uses specific capitalization "Office Of Learning" (capital O in "Of")
 * @constant {string[]}
 */
const VALID_BUDGETS = ['Office Of Learning', 'IT Operations', 'Communications', 'Business Office'];

// ==========================================
// BOOLEAN AND TYPE CONVERSION UTILITIES
// ==========================================

/**
 * Parses a value to boolean, handling various input types
 * Useful for Google Sheets checkbox values which can be TRUE, "TRUE", or "true"
 *
 * @param {*} value - The value to parse (boolean, string, or other)
 * @returns {boolean} The parsed boolean value
 *
 * @example
 * parseBoolean(true);      // returns true
 * parseBoolean('TRUE');    // returns true
 * parseBoolean('false');   // returns false
 * parseBoolean('');        // returns false
 * parseBoolean(null);      // returns false
 */
function parseBoolean(value) {
  if (value === true || value === false) return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
}

/**
 * Gets a trimmed string value from a row cell, with empty string fallback
 * Handles null, undefined, and various data types safely
 *
 * @param {Array} row - The data row array
 * @param {number} index - The column index
 * @returns {string} The trimmed string value, or empty string if missing
 *
 * @example
 * const name = getCellValue(row, 1);  // Gets trimmed value from column B
 */
function getCellValue(row, index) {
  if (index === -1 || index === undefined) return '';
  const value = row[index];
  if (value === null || value === undefined) return '';
  return value.toString().trim();
}

/**
 * Checks if a cell value is empty (null, undefined, empty string, or whitespace only)
 *
 * @param {*} value - The value to check
 * @returns {boolean} True if the value is considered empty
 *
 * @example
 * isEmpty('');        // returns true
 * isEmpty('  ');      // returns true
 * isEmpty(null);      // returns true
 * isEmpty('hello');   // returns false
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
}

// ==========================================
// COLUMN INDEX UTILITIES
// ==========================================

/**
 * Gets column index with fallback for old/new column naming conventions
 * Handles migration from capitalized to lowercase column names
 *
 * @param {string[]} headers - Array of header names
 * @param {string} lowercase - Lowercase column name (new format)
 * @param {string} [uppercase] - Capitalized column name (old format), defaults to Title Case
 * @returns {number} Column index, or -1 if not found
 *
 * @example
 * const divisionIdx = getColumnIndex(headers, 'division', 'Division');
 * const categoryIdx = getColumnIndex(headers, 'category');  // Auto-capitalizes to 'Category'
 */
function getColumnIndex(headers, lowercase, uppercase) {
  const idx = headers.indexOf(lowercase);
  if (idx !== -1) return idx;

  // If uppercase not provided, auto-capitalize first letter
  const fallback = uppercase || (lowercase.charAt(0).toUpperCase() + lowercase.slice(1));
  return headers.indexOf(fallback);
}

/**
 * Creates a complete column index map for all standard sheet columns
 * Handles both old (capitalized) and new (lowercase) column names
 *
 * @param {string[]} headers - Array of header names from the sheet
 * @returns {Object} Map of field names to column indices
 *
 * @example
 * const colMap = buildColumnMap(headers);
 * const productName = row[colMap.productName];
 * const isActive = parseBoolean(row[colMap.active]);
 */
function buildColumnMap(headers) {
  return {
    active: headers.indexOf('active'),
    productName: headers.indexOf('product_name'),
    division: getColumnIndex(headers, 'division', 'Division'),
    department: getColumnIndex(headers, 'department', 'Department'),
    subjects: getColumnIndex(headers, 'subjects', 'subjects_or_department'),
    enterprise: getColumnIndex(headers, 'enterprise', 'Enterprise'),
    budget: headers.indexOf('budget'),
    audience: headers.indexOf('audience'),
    licenseType: getColumnIndex(headers, 'license_type', 'License Type'),
    licenceCount: headers.indexOf('licence_count'),
    value: headers.indexOf('value'),
    dateAdded: headers.indexOf('date_added'),
    renewalDate: headers.indexOf('renewal_date'),
    category: getColumnIndex(headers, 'category', 'Category'),
    website: getColumnIndex(headers, 'website', 'Website'),
    description: headers.indexOf('description'),
    supportEmail: headers.indexOf('support_email'),
    tutorialLink: headers.indexOf('tutorial_link'),
    mobileApp: headers.indexOf('mobile_app'),
    ssoEnabled: headers.indexOf('sso_enabled'),
    logoUrl: headers.indexOf('logo_url'),
    gradeLevels: headers.indexOf('grade_levels')
  };
}

// ==========================================
// APP CATEGORIZATION UTILITIES
// ==========================================

/**
 * Checks if an app row is marked as active
 *
 * @param {Array} row - The data row array
 * @param {number} activeIndex - Index of the 'active' column
 * @returns {boolean} True if the app is active
 *
 * @example
 * if (isAppActive(row, colMap.active)) {
 *   // Process active app
 * }
 */
function isAppActive(row, activeIndex) {
  if (activeIndex === -1) return false;
  return parseBoolean(row[activeIndex]);
}

/**
 * Determines which divisions an app belongs to based on division string
 *
 * @param {string} division - The division field value
 * @returns {Object} Object with es, ms, hs boolean flags
 *
 * @example
 * const divisions = parseDivisions('SAS Elementary School, SAS Middle School');
 * // Returns: { es: true, ms: true, hs: false }
 */
function parseDivisions(division) {
  const divLower = (division || '').toLowerCase();
  return {
    es: divLower.includes('elementary') || divLower.includes('early learning'),
    ms: divLower.includes('middle'),
    hs: divLower.includes('high')
  };
}

/**
 * Determines if an app should be categorized as "Whole School"
 * Based on license type, department, division, or availability across all divisions
 *
 * Business Rules:
 * - Site/School/Enterprise/Unlimited licenses → Whole School
 * - School Operations or School-wide department → Whole School
 * - Division includes "whole school" or "school-wide" → Whole School
 * - Available in Elementary + Middle + High → Whole School
 *
 * @param {string} licenseType - The license type (e.g., "Site Licence")
 * @param {string} department - The department name
 * @param {string} division - The division field value
 * @param {Object} [divisionsPresent] - Optional pre-parsed divisions object
 * @returns {boolean} True if the app is effectively whole school
 *
 * @example
 * const isWholeSchool = isEffectivelyWholeSchool(
 *   'Site Licence',
 *   'Technology',
 *   'SAS Elementary School',
 *   { es: true, ms: false, hs: false }
 * );
 */
function isEffectivelyWholeSchool(licenseType, department, division, divisionsPresent) {
  const licenseTypeLower = (licenseType || '').toLowerCase();
  const departmentLower = (department || '').toLowerCase();
  const divisionLower = (division || '').toLowerCase();

  // Parse divisions if not provided
  const divs = divisionsPresent || parseDivisions(division);

  return (
    licenseTypeLower.includes('site') ||
    licenseTypeLower.includes('school') ||
    licenseTypeLower.includes('enterprise') ||
    licenseTypeLower.includes('unlimited') ||
    departmentLower === 'school operations' ||
    departmentLower === 'school-wide' ||
    divisionLower.includes('school-wide') ||
    divisionLower.includes('whole school') ||
    (divs.es && divs.ms && divs.hs)
  );
}

// ==========================================
// DATE AND TIME UTILITIES
// ==========================================

/**
 * Gets a Date object representing N days ago from today
 *
 * @param {number} days - Number of days to subtract
 * @returns {Date} Date object representing the past date
 *
 * @example
 * const thirtyDaysAgo = getDaysAgo(30);
 * if (dateAdded >= thirtyDaysAgo) {
 *   // App is new
 * }
 */
function getDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Gets a Date object representing N days from now
 *
 * @param {number} days - Number of days to add
 * @returns {Date} Date object representing the future date
 *
 * @example
 * const thirtyDaysFromNow = getDaysFromNow(30);
 * if (renewalDate <= thirtyDaysFromNow) {
 *   // App expires soon
 * }
 */
function getDaysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Formats a timestamp as relative time (e.g., "2 hours ago")
 *
 * @param {Date|string} timestamp - The timestamp to format
 * @returns {string} Human-readable relative time string
 *
 * @example
 * formatTimeAgo(new Date(Date.now() - 3600000));  // "1 hour ago"
 * formatTimeAgo('2024-01-15T10:30:00');           // "2 days ago"
 */
function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Unknown';

  const now = new Date();
  const date = new Date(timestamp);

  if (isNaN(date.getTime())) return 'Unknown';

  const seconds = Math.floor((now - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Checks if a date is within N days from today
 *
 * @param {Date|string} dateValue - The date to check
 * @param {number} days - Number of days threshold
 * @returns {boolean} True if the date is within the specified days
 *
 * @example
 * if (isWithinDays(app.dateAdded, 30)) {
 *   // Show "NEW" badge
 * }
 */
function isWithinDays(dateValue, days) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return false;

  const threshold = getDaysAgo(days);
  return date >= threshold;
}

// ==========================================
// ERROR HANDLING UTILITIES
// ==========================================

/**
 * Creates a standardized error response object
 * Used for consistent error formatting across all API responses
 *
 * @param {string} code - Error code (uppercase identifier, e.g., 'API_ERROR')
 * @param {string} message - User-friendly error message
 * @param {string} [details] - Optional technical details for debugging
 * @returns {Object} Standardized error response object
 *
 * @example
 * return createErrorResponse(
 *   'INVALID_INPUT',
 *   'The provided data format is invalid.',
 *   'Expected JSON but received undefined'
 * );
 */
function createErrorResponse(code, message, details) {
  const response = {
    success: false,
    error: {
      code: code,
      message: message
    }
  };

  if (details) {
    response.error.details = details;
  }

  return response;
}

/**
 * Creates a standardized success response object
 *
 * @param {*} data - The response data
 * @param {string} [message] - Optional success message
 * @returns {Object} Standardized success response object
 *
 * @example
 * return createSuccessResponse(appData, 'Data retrieved successfully');
 */
function createSuccessResponse(data, message) {
  const response = {
    success: true,
    data: data
  };

  if (message) {
    response.message = message;
  }

  return response;
}

/**
 * Safely parses JSON with error handling
 * Returns null instead of throwing on invalid JSON
 *
 * @param {string} jsonString - The JSON string to parse
 * @returns {Object|null} Parsed object, or null if parsing fails
 *
 * @example
 * const data = safeJsonParse(apiResponse);
 * if (data === null) {
 *   return createErrorResponse('PARSE_ERROR', 'Invalid JSON response');
 * }
 */
function safeJsonParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    Logger.log('JSON parse error: ' + error.message);
    return null;
  }
}

// ==========================================
// LOGGING UTILITIES
// ==========================================

/**
 * Logs a success message with consistent formatting
 *
 * @param {string} message - The message to log
 *
 * @example
 * logSuccess(`Enriched description for ${productName}`);
 */
function logSuccess(message) {
  Logger.log(`[✓ SUCCESS] ${message}`);
}

/**
 * Logs an error message with consistent formatting
 *
 * @param {string} message - The message to log
 * @param {Error} [error] - Optional error object for stack trace
 *
 * @example
 * logError(`Failed to enrich ${productName}`, error);
 */
function logError(message, error) {
  Logger.log(`[✗ ERROR] ${message}`);
  if (error && error.stack) {
    Logger.log(`[✗ STACK] ${error.stack}`);
  }
}

/**
 * Logs a debug message with consistent formatting
 * Use for development/troubleshooting information
 *
 * @param {string} message - The message to log
 *
 * @example
 * logDebug(`Processing row ${rowNum} for ${productName}`);
 */
function logDebug(message) {
  Logger.log(`[DEBUG] ${message}`);
}

/**
 * Logs a warning message with consistent formatting
 *
 * @param {string} message - The message to log
 *
 * @example
 * logWarning(`Row mismatch detected at row ${rowNum}`);
 */
function logWarning(message) {
  Logger.log(`[⚠ WARNING] ${message}`);
}

// ==========================================
// VALIDATION UTILITIES
// ==========================================

/**
 * Validates that a sheet exists and returns it
 * Shows user alert if sheet not found
 *
 * @param {Spreadsheet} spreadsheet - The spreadsheet object
 * @param {string} sheetName - Name of the sheet to find
 * @returns {Sheet|null} The sheet if found, null otherwise
 *
 * @example
 * const sheet = getValidatedSheet(spreadsheet, SHEET_NAME);
 * if (!sheet) return;  // Alert already shown
 */
function getValidatedSheet(spreadsheet, sheetName) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('❌ Error', `Sheet "${sheetName}" not found in spreadsheet.`, ui.ButtonSet.OK);
    } catch (e) {
      // Not running from Sheets UI
      Logger.log(`Sheet "${sheetName}" not found`);
    }
    return null;
  }
  return sheet;
}

/**
 * Validates that required Script Properties are configured
 *
 * @param {string[]} requiredProperties - Array of required property names
 * @returns {Object|null} Object with property values, or null if any missing
 *
 * @example
 * const config = validateScriptProperties(['SPREADSHEET_ID', 'SHEET_NAME']);
 * if (!config) return;  // Error already logged
 */
function validateScriptProperties(requiredProperties) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const values = {};
  const missing = [];

  requiredProperties.forEach(prop => {
    const value = scriptProperties.getProperty(prop);
    if (!value) {
      missing.push(prop);
    } else {
      values[prop] = value;
    }
  });

  if (missing.length > 0) {
    const message = `Missing required Script Properties: ${missing.join(', ')}`;
    Logger.log(message);
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('❌ Configuration Error', message + '\n\nPlease set these in Project Settings > Script Properties.', ui.ButtonSet.OK);
    } catch (e) {
      // Not running from Sheets UI
    }
    return null;
  }

  return values;
}

/**
 * Validates that a value is one of the allowed options
 *
 * @param {string} value - The value to validate
 * @param {string[]} allowedValues - Array of allowed values
 * @param {boolean} [caseSensitive=false] - Whether comparison is case-sensitive
 * @returns {boolean} True if value is valid
 *
 * @example
 * if (!isValidOption(provider, ['gemini', 'claude'])) {
 *   return createErrorResponse('INVALID_PROVIDER', 'Invalid AI provider');
 * }
 */
function isValidOption(value, allowedValues, caseSensitive) {
  if (!value) return false;
  const checkValue = caseSensitive ? value : value.toLowerCase();
  const checkAgainst = caseSensitive
    ? allowedValues
    : allowedValues.map(v => v.toLowerCase());
  return checkAgainst.includes(checkValue);
}
