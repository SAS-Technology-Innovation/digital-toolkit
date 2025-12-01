/**
 * Vercel Serverless Function: /api/ai
 * Proxies AI query requests to Google Apps Script backend with FRONTEND_KEY authentication
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Allow GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
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

  // Get query parameters from GET or body from POST
  let query, provider, appsData;

  if (req.method === 'GET') {
    query = req.query.query;
    provider = req.query.provider || 'gemini';
    appsData = req.query.appsData;
  } else {
    // POST - parse body
    const body = req.body;
    query = body.query;
    provider = body.provider || 'gemini';
    appsData = body.appsData;
  }

  // Validate required parameters
  if (!query) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Query parameter is required'
    });
  }

  if (!appsData) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'appsData parameter is required'
    });
  }

  try {
    // For AI queries, we need to use POST to Apps Script because the data can be large
    // But Apps Script doGet only supports GET, so we'll URL-encode the data
    // Note: For very large appsData, consider using doPost in Apps Script

    const params = new URLSearchParams({
      api: 'ai',
      key: FRONTEND_KEY,
      query: query,
      provider: provider,
      appsData: typeof appsData === 'string' ? appsData : JSON.stringify(appsData)
    });

    const apiUrl = `${APPS_SCRIPT_URL}?${params.toString()}`;

    // Fetch from Apps Script
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (data.error) {
      console.error('Apps Script AI error:', data);
      return res.status(response.status === 200 ? 500 : response.status).json(data);
    }

    // No caching for AI responses (they should be fresh)
    res.setHeader('Cache-Control', 'no-store');

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error calling AI via Apps Script:', error);
    return res.status(500).json({
      error: 'Failed to process AI query',
      message: error.message
    });
  }
}
