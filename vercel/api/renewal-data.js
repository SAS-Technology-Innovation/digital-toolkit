/**
 * API Route: /api/renewal-data
 *
 * Fetches app renewal data directly from Google Apps Script.
 * Previously used Edge Config caching, now fetches directly for simplicity.
 *
 * @returns {Object} JSON response with renewal data from Apps Script
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

    console.log('Fetching renewal data from Apps Script:', apiUrl.replace(FRONTEND_KEY, 'REDACTED'));

    // Fetch data from Apps Script
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      redirect: 'follow'
    });

    // Get response text first to debug
    const responseText = await response.text();
    console.log('Response status:', response.status);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError.message);
      return res.status(500).json({
        error: 'Invalid response from Apps Script',
        message: 'Response was not valid JSON. Check that FRONTEND_KEY matches in both Vercel and Apps Script.',
        debug: responseText.substring(0, 200)
      });
    }

    if (data.error) {
      console.error('Apps Script error:', data);
      return res.status(response.status === 200 ? 500 : response.status).json(data);
    }

    // Cache for 5 minutes with stale-while-revalidate for 1 minute
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    res.setHeader('X-Data-Source', 'apps-script');

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching renewal data:', error);
    return res.status(500).json({
      error: 'Failed to fetch renewal data',
      message: error.message
    });
  }
}
