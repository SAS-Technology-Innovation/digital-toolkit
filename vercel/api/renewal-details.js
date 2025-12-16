/**
 * API Route: /api/renewal-details
 *
 * Fetches FULL app details from Apps Script for specific apps.
 * Used for lazy-loading detailed information after initial fast load from Edge Config.
 *
 * Accepts POST request with list of product names to fetch details for.
 * Returns full app objects with all fields (logos, descriptions, etc.)
 *
 * @param {Array<string>} products - Array of product names to fetch details for
 * @returns {Object} JSON response with full app details
 */

export default async function handler(request, response) {
  // Only accept POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { products } = request.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return response.status(400).json({
        error: 'Invalid request: products array required'
      });
    }

    const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
    const FRONTEND_KEY = process.env.FRONTEND_KEY;

    if (!APPS_SCRIPT_URL || !FRONTEND_KEY) {
      return response.status(500).json({
        error: 'Server configuration error: missing credentials'
      });
    }

    // Fetch full data from Apps Script
    const appsScriptResponse = await fetch(
      `${APPS_SCRIPT_URL}?api=data&key=${encodeURIComponent(FRONTEND_KEY)}`,
      {
        headers: { 'Accept': 'application/json' },
        redirect: 'follow'
      }
    );

    if (!appsScriptResponse.ok) {
      throw new Error(`Apps Script request failed: ${appsScriptResponse.status}`);
    }

    const fullData = await appsScriptResponse.json();

    // Extract detailed fields for requested products
    const detailedApps = {};

    // Search through all divisions
    ['wholeSchool', 'elementary', 'middleSchool', 'highSchool'].forEach(division => {
      if (fullData[division] && fullData[division].apps) {
        fullData[division].apps.forEach(app => {
          if (products.includes(app.product)) {
            detailedApps[app.product] = extractDetailedFields(app);
          }
        });
      }
    });

    return response.status(200).json({
      success: true,
      count: Object.keys(detailedApps).length,
      apps: detailedApps
    });

  } catch (error) {
    console.error('Error fetching renewal details:', error);

    return response.status(500).json({
      error: 'Failed to fetch app details',
      details: error.message
    });
  }
}

/**
 * Extracts detailed fields from full app object
 * Returns all fields NOT included in minimal Edge Config data
 *
 * Edge Config only has: product, division, department, subjects
 * Everything else comes from Apps Script
 */
function extractDetailedFields(app) {
  return {
    // Core identity (for matching)
    product: app.product,

    // Renewal-specific fields (not in Edge Config)
    budget: app.budget || '',
    spend: app.spend || '',
    licenses: app.licenses || '',
    licenseType: app.licenseType || '',
    renewalDate: app.renewalDate || '',

    // Detailed fields (not in Edge Config)
    logoUrl: app.logoUrl || '',
    description: app.description || '',
    website: app.website || '',
    tutorialLink: app.tutorialLink || '',
    supportEmail: app.supportEmail || '',
    ssoEnabled: app.ssoEnabled || false,
    mobileApp: app.mobileApp || '',
    audience: app.audience || '',
    category: app.category || '',
    dateAdded: app.dateAdded || '',

    // Flag to indicate details are loaded
    _detailsLoaded: true
  };
}
