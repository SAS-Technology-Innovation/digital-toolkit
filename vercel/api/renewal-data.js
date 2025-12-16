/**
 * API Route: /api/renewal-data
 *
 * Fetches MINIMAL app renewal data from Vercel Edge Config for fast initial load.
 * Edge Config contains only essential fields for filtering, sorting, and basic display.
 * Use /api/renewal-details for full app details (logos, descriptions, etc.)
 *
 * Edge Config refresh: Hourly via /api/refresh-renewal-data
 *
 * Minimal fields returned:
 * - product, division, department, budget
 * - spend, licenses, licenseType, renewalDate
 * - subjects (for search filtering)
 *
 * @returns {Object} JSON response with minimal renewal data or fallback to Apps Script
 */

import { get } from '@vercel/edge-config';

export const config = {
  runtime: 'edge',
};

// Minimal fields for fast load - ONLY basic categorization data
function stripToMinimalFields(app) {
  return {
    product: app.product,
    division: app.division,
    department: app.department,
    subjects: app.subjects || app.subject || '',
    // Flag to indicate details need to be loaded
    _detailsLoaded: false
  };
}

function processMinimalData(data) {
  if (!data) return null;

  const minimal = {};

  // Process each division
  ['wholeSchool', 'elementary', 'middleSchool', 'highSchool'].forEach(division => {
    if (data[division] && data[division].apps) {
      minimal[division] = {
        apps: data[division].apps.map(stripToMinimalFields)
      };
    }
  });

  return minimal;
}

export default async function handler(request) {
  try {
    // Try Edge Config first (fast path)
    const renewalData = await get('renewal_data');

    if (!renewalData) {
      // Fallback to Apps Script if Edge Config not populated
      console.log('Edge Config empty, falling back to Apps Script');

      const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
      const FRONTEND_KEY = process.env.FRONTEND_KEY;

      const response = await fetch(
        `${APPS_SCRIPT_URL}?api=data&key=${encodeURIComponent(FRONTEND_KEY)}`,
        {
          headers: { 'Accept': 'application/json' },
          redirect: 'follow'
        }
      );

      if (!response.ok) {
        throw new Error('Apps Script fallback failed');
      }

      const fullData = await response.json();
      const minimalData = processMinimalData(fullData);

      return new Response(
        JSON.stringify(minimalData),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
            'X-Data-Source': 'apps-script-fallback'
          },
        }
      );
    }

    // Return minimal data from Edge Config (fast!)
    const minimalData = processMinimalData(renewalData);

    return new Response(
      JSON.stringify(minimalData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'X-Data-Source': 'edge-config'
        },
      }
    );
  } catch (error) {
    console.error('Error fetching renewal data:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch renewal data',
        details: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
