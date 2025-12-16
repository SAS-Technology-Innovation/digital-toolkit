/**
 * API Route: /api/refresh-renewal-data
 *
 * Fetches fresh renewal data from Apps Script and updates Edge Config.
 * Intended to be called by Vercel Cron (hourly) or manually for testing.
 *
 * Protected by CRON_SECRET to prevent unauthorized refreshes.
 *
 * Usage:
 * - Cron: Vercel Cron calls this hourly automatically
 * - Manual: POST /api/refresh-renewal-data with header: Authorization: Bearer CRON_SECRET
 *
 * @returns {Object} JSON response with refresh status
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Verify authorization (cron secret or manual trigger)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return new Response(
      JSON.stringify({ error: 'CRON_SECRET not configured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Allow requests with correct Bearer token or from Vercel Cron
  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` ||
    request.headers.get('x-vercel-cron') === '1';

  if (!isAuthorized) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized. Provide CRON_SECRET in Authorization header.' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    const frontendKey = process.env.FRONTEND_KEY;

    if (!appsScriptUrl || !frontendKey) {
      throw new Error('APPS_SCRIPT_URL or FRONTEND_KEY not configured');
    }

    // Fetch renewal data from Apps Script
    console.log('Fetching renewal data from Apps Script...');
    const response = await fetch(`${appsScriptUrl}?action=getRenewalData&key=${frontendKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Apps Script returned ${response.status}: ${response.statusText}`);
    }

    const renewalData = await response.json();

    if (renewalData.error) {
      throw new Error(`Apps Script error: ${renewalData.error}`);
    }

    // Update Edge Config using Vercel API
    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const vercelToken = process.env.VERCEL_TOKEN;

    if (!edgeConfigId || !vercelToken) {
      throw new Error('EDGE_CONFIG_ID or VERCEL_TOKEN not configured');
    }

    console.log('Updating Edge Config...');
    const updateResponse = await fetch(
      `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              operation: 'upsert',
              key: 'renewal_data',
              value: renewalData,
            },
            {
              operation: 'upsert',
              key: 'last_updated',
              value: new Date().toISOString(),
            },
          ],
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Edge Config update failed: ${updateResponse.status} - ${errorText}`);
    }

    const updateResult = await updateResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Renewal data refreshed successfully',
        timestamp: new Date().toISOString(),
        appsCount: renewalData.stats?.totalApps || 0,
        edgeConfigUpdate: updateResult,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error refreshing renewal data:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to refresh renewal data',
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
