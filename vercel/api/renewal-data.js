/**
 * API Route: /api/renewal-data
 *
 * Fetches app renewal data from Vercel Edge Config.
 * Edge Config is refreshed hourly from Apps Script to reduce load.
 *
 * @returns {Object} JSON response with renewal data or error
 */

import { get } from '@vercel/edge-config';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    // Fetch renewal data from Edge Config
    const renewalData = await get('renewal_data');

    if (!renewalData) {
      return new Response(
        JSON.stringify({
          error: 'No renewal data found in Edge Config. Please refresh data.'
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        }
      );
    }

    // Return renewal data with cache headers
    return new Response(
      JSON.stringify(renewalData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
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
