/**
 * Vercel Serverless Function: /api/ai
 * Proxies AI query requests to Google Apps Script backend with FRONTEND_KEY authentication
 *
 * Uses POST to Apps Script to handle large appsData payloads that would exceed
 * URL length limits with GET parameters.
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
    // Use POST to Apps Script to handle large appsData payloads
    // This avoids URL length limits that would occur with GET parameters
    const postBody = {
      api: 'ai',
      key: FRONTEND_KEY,
      query: query,
      provider: provider,
      appsData: appsData
    };

    // Fetch from Apps Script using POST
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(postBody),
      redirect: 'follow'
    });

    // Get response text first for debugging
    const responseText = await response.text();

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError.message);
      console.error('Response was:', responseText.substring(0, 500));
      return res.status(500).json({
        error: 'Invalid response from Apps Script',
        message: 'Response was not valid JSON',
        debug: responseText.substring(0, 200)
      });
    }

    if (data.error) {
      console.error('Apps Script AI error:', data);
      return res.status(response.status === 200 ? 500 : response.status).json(data);
    }

    // No caching for AI responses (they should be fresh)
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error calling AI via Apps Script:', error);
    return res.status(500).json({
      error: 'Failed to process AI query',
      message: error.message
    });
  }
}
