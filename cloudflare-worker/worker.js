/**
 * Cloudflare Worker for SAS Digital Toolkit Dashboard
 *
 * This worker serves:
 * 1. The embedded dashboard HTML at the root path
 * 2. The dashboard data JSON at /api/data
 * 3. Handles CORS for cross-origin embedding
 *
 * Deploy with: wrangler deploy
 *
 * Note: The HTML and JSON files are bundled with the worker during deployment.
 * Make sure to update wrangler.toml if you add new files.
 */

// Import the dashboard data as a module
import dashboardData from './dashboard-data.json';

// Import the HTML file as text
// This will be bundled by wrangler during deployment
import embedHTML from './embed.html';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    // Route: Serve the dashboard data JSON
    if (path === '/api/data' || path === '/api/data.json') {
      return new Response(JSON.stringify(dashboardData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    }

    // Route: Serve the embedded HTML
    if (path === '/' || path === '/embed' || path === '/index.html') {
      // If embedHTML is already a string, use it directly
      // Otherwise, it might be imported as an object with a default export
      const htmlContent = typeof embedHTML === 'string' ? embedHTML : embedHTML.default || '';

      return new Response(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'X-Frame-Options': 'ALLOWALL', // Allow embedding in iframes
          'Content-Security-Policy': "frame-ancestors *", // Allow embedding from any origin
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      });
    }

    // Route: Health check endpoint
    if (path === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 404 for unknown routes
    return new Response('Not Found', {
      status: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  },
};

/**
 * Handle CORS preflight requests
 */
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}
