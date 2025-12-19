/**
 * API Route: /api/status
 *
 * Fetches application status data from Vercel Edge Config.
 * Returns operational status (1 = up, 0 = down) for all monitored applications.
 *
 * Edge Config key: app_status
 * Contains:
 * - statuses: { [productName]: 0 | 1 }
 * - summary: { total, up, down, uptime, avgResponseTime }
 * - lastChecked: ISO timestamp
 *
 * @returns {Object} JSON response with status data
 */

import { get } from '@vercel/edge-config';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    // Get status data from Edge Config
    const statusData = await get('app_status');

    if (!statusData) {
      return new Response(
        JSON.stringify({
          error: 'Status data not available',
          message: 'Status checks have not run yet. Please wait for the next scheduled check.',
          statuses: {},
          summary: {
            total: 0,
            up: 0,
            down: 0,
            uptime: 0,
            avgResponseTime: 0
          },
          lastChecked: null
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        }
      );
    }

    return new Response(
      JSON.stringify(statusData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // Cache for 1 minute, serve stale for 5 minutes while revalidating
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching status data:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch status data',
        message: error.message,
        statuses: {},
        summary: {
          total: 0,
          up: 0,
          down: 0,
          uptime: 0,
          avgResponseTime: 0
        },
        lastChecked: null
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
