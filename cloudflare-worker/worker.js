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
 * Security Configuration:
 * - Set ALLOWED_ORIGINS in wrangler.toml for CORS restrictions
 * - Set FRAME_ANCESTORS in wrangler.toml for CSP restrictions
 * - See SECURITY.md for production deployment guidelines
 *
 * Note: The HTML and JSON files are bundled with the worker during deployment.
 * Make sure to update wrangler.toml if you add new files.
 */

// Import the dashboard data as a module
import dashboardData from './dashboard-data.json';

// Import the HTML file as text
// This will be bundled by wrangler during deployment
import embedHTML from './embed.html';

// Cache duration constants (in seconds)
const CACHE_DURATION = {
  HTML: 300,      // 5 minutes
  JSON: 300,      // 5 minutes (aligned with HTML to prevent stale data)
  CORS_MAX_AGE: 86400  // 24 hours
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Get security configuration from environment variables
    // Default to wildcard for development, but should be restricted in production
    const allowedOrigins = env.ALLOWED_ORIGINS || '*';
    const frameAncestors = env.FRAME_ANCESTORS || '*';

    // Validate origin for CORS (if not wildcard)
    const origin = request.headers.get('Origin');
    const corsOrigin = getCorsOrigin(origin, allowedOrigins);

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS(corsOrigin);
    }

    // Route: Serve the dashboard data JSON
    if (path === '/api/data' || path === '/api/data.json') {
      return new Response(JSON.stringify(dashboardData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': `public, max-age=${CACHE_DURATION.JSON}`,
          'Vary': 'Origin', // Important for CORS caching
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
          'Access-Control-Allow-Origin': corsOrigin,
          // X-Frame-Options removed - use CSP instead (more flexible)
          'Content-Security-Policy': `frame-ancestors ${frameAncestors}`, // Restrict embedding origins
          'Cache-Control': `public, max-age=${CACHE_DURATION.HTML}`,
          'Vary': 'Origin', // Important for CORS caching
        },
      });
    }

    // Route: Health check endpoint
    if (path === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: env.ENVIRONMENT || 'development'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
          'Cache-Control': 'no-cache', // Health check should not be cached
        },
      });
    }

    // 404 for unknown routes
    return new Response('Not Found', {
      status: 404,
      headers: {
        'Access-Control-Allow-Origin': corsOrigin,
      }
    });
  },
};

/**
 * Validate and get CORS origin
 * @param {string|null} origin - Request origin header
 * @param {string} allowedOrigins - Comma-separated list or '*'
 * @returns {string} - Allowed origin or '*'
 */
function getCorsOrigin(origin, allowedOrigins) {
  // If wildcard, return wildcard
  if (allowedOrigins === '*') {
    return '*';
  }

  // If no origin header, return first allowed origin or wildcard
  if (!origin) {
    const origins = allowedOrigins.split(',').map(o => o.trim());
    return origins[0] || '*';
  }

  // Check if origin is in allowed list
  const allowed = allowedOrigins.split(',').map(o => o.trim());
  if (allowed.includes(origin)) {
    return origin; // Return specific origin for Vary header support
  }

  // Origin not allowed, return first allowed origin
  return allowed[0] || '*';
}

/**
 * Handle CORS preflight requests
 * @param {string} corsOrigin - Allowed origin
 * @returns {Response}
 */
function handleCORS(corsOrigin) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': String(CACHE_DURATION.CORS_MAX_AGE),
      'Vary': 'Origin',
    },
  });
}
