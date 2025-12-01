/**
 * Vercel Serverless Function: /api/data
 * Proxies requests to Google Apps Script backend with FRONTEND_KEY authentication
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const FRONTEND_KEY = process.env.FRONTEND_KEY;
  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

  // Validate environment variables
  if (!FRONTEND_KEY || !APPS_SCRIPT_URL) {
    console.error('Missing environment variables: FRONTEND_KEY or APPS_SCRIPT_URL');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Required environment variables are not set'
    });
  }

  try {
    // Build the Apps Script API URL
    const apiUrl = `${APPS_SCRIPT_URL}?api=data&key=${encodeURIComponent(FRONTEND_KEY)}`;

    // Fetch data from Apps Script
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    // Handle redirect (Apps Script returns 302 for web apps)
    const data = await response.json();

    if (data.error) {
      console.error('Apps Script error:', data);
      return res.status(response.status === 200 ? 500 : response.status).json(data);
    }

    // Cache for 5 minutes (same as signage refresh interval)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching from Apps Script:', error);
    return res.status(500).json({
      error: 'Failed to fetch data',
      message: error.message
    });
  }
}
