/**
 * API Route: /api/refresh-status
 *
 * Cron job that checks the operational status of all applications
 * and stores results in Vercel Edge Config.
 *
 * Status values stored in Edge Config:
 * - 1 = Application is online/operational
 * - 0 = Application is offline/down
 *
 * Triggered by Vercel Cron or manually with CRON_SECRET.
 *
 * Usage:
 * - Cron: Vercel Cron calls this at scheduled intervals
 * - Manual: POST /api/refresh-status with header: Authorization: Bearer CRON_SECRET
 *
 * @returns {Object} JSON response with status check results
 */

export const config = {
  runtime: 'edge',
  // Allow longer execution for checking multiple URLs
  maxDuration: 60,
};

/**
 * Check if a URL is accessible (returns 2xx or 3xx status)
 * @param {string} url - The URL to check
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<{status: number, responseTime: number, error?: string}>}
 */
async function checkUrl(url, timeout = 10000) {
  const startTime = Date.now();

  try {
    // Validate URL
    if (!url || typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return { status: 0, responseTime: 0, error: 'Invalid URL' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD', // Use HEAD for faster checks
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'SAS-Digital-Toolkit-StatusChecker/1.0'
      }
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    // 2xx and 3xx are considered "up"
    const isUp = response.status >= 200 && response.status < 400;

    return {
      status: isUp ? 1 : 0,
      responseTime,
      httpStatus: response.status
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 0,
      responseTime,
      error: error.name === 'AbortError' ? 'Timeout' : error.message
    };
  }
}

export default async function handler(request) {
  // Verify authorization (cron secret or Vercel Cron header)
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
    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const vercelToken = process.env.VERCEL_TOKEN;

    if (!appsScriptUrl || !frontendKey) {
      throw new Error('APPS_SCRIPT_URL or FRONTEND_KEY not configured');
    }

    if (!edgeConfigId || !vercelToken) {
      throw new Error('EDGE_CONFIG_ID or VERCEL_TOKEN not configured for status storage');
    }

    // Fetch app data from Apps Script to get website URLs
    console.log('Fetching app data from Apps Script...');
    const response = await fetch(`${appsScriptUrl}?api=data&key=${frontendKey}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`Apps Script returned ${response.status}: ${response.statusText}`);
    }

    const appData = await response.json();

    if (appData.error) {
      throw new Error(`Apps Script error: ${appData.error}`);
    }

    // Collect all unique apps with websites
    const appsToCheck = new Map();
    const divisions = ['wholeSchool', 'elementary', 'middleSchool', 'highSchool'];

    divisions.forEach(division => {
      if (appData[division] && appData[division].apps) {
        appData[division].apps.forEach(app => {
          if (app.website && !appsToCheck.has(app.product)) {
            appsToCheck.set(app.product, {
              product: app.product,
              website: app.website,
              division: app.division
            });
          }
        });
      }
    });

    console.log(`Checking status of ${appsToCheck.size} applications...`);

    // Check all URLs in parallel (with concurrency limit)
    const apps = Array.from(appsToCheck.values());
    const statusResults = {};
    const checkDetails = [];

    // Check in batches of 10 to avoid overwhelming
    const batchSize = 10;
    for (let i = 0; i < apps.length; i += batchSize) {
      const batch = apps.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (app) => {
          const result = await checkUrl(app.website);
          return {
            product: app.product,
            website: app.website,
            ...result
          };
        })
      );

      batchResults.forEach(result => {
        // Store simplified status for Edge Config (1 or 0)
        statusResults[result.product] = result.status;
        checkDetails.push(result);
      });
    }

    // Calculate summary stats
    const totalApps = checkDetails.length;
    const appsUp = checkDetails.filter(r => r.status === 1).length;
    const appsDown = checkDetails.filter(r => r.status === 0).length;
    const avgResponseTime = checkDetails.length > 0
      ? Math.round(checkDetails.reduce((sum, r) => sum + r.responseTime, 0) / checkDetails.length)
      : 0;

    // Prepare Edge Config data
    const statusData = {
      statuses: statusResults,
      summary: {
        total: totalApps,
        up: appsUp,
        down: appsDown,
        uptime: totalApps > 0 ? Math.round((appsUp / totalApps) * 100) : 0,
        avgResponseTime
      },
      lastChecked: new Date().toISOString()
    };

    // Update Edge Config
    console.log('Updating Edge Config with status data...');
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
              key: 'app_status',
              value: statusData,
            }
          ],
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Edge Config update failed: ${updateResponse.status} - ${errorText}`);
    }

    // Log apps that are down for monitoring
    const downApps = checkDetails.filter(r => r.status === 0);
    if (downApps.length > 0) {
      console.log('Apps currently DOWN:', downApps.map(a => `${a.product}: ${a.error || 'HTTP ' + a.httpStatus}`));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Status check completed successfully',
        timestamp: new Date().toISOString(),
        summary: statusData.summary,
        downApps: downApps.map(a => ({
          product: a.product,
          website: a.website,
          error: a.error || `HTTP ${a.httpStatus}`
        }))
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error checking application status:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to check application status',
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
