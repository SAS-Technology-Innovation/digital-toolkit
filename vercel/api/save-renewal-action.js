/**
 * API Route: /api/save-renewal-action
 *
 * Saves renewal actions (Renew, Modify, Retire) to Google Sheets via Apps Script.
 *
 * @param {string} product - App product name
 * @param {string} action - Action taken (renew, modify, retire)
 * @param {string} notes - Optional notes
 * @returns {Object} JSON response with save status
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
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
    const { product, action, notes } = req.body;

    if (!product || !action) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'product and action are required'
      });
    }

    // Build the Apps Script API URL
    const apiUrl = `${APPS_SCRIPT_URL}?api=saveRenewalAction&key=${encodeURIComponent(FRONTEND_KEY)}&product=${encodeURIComponent(product)}&action=${encodeURIComponent(action)}&notes=${encodeURIComponent(notes || '')}`;

    console.log('Saving renewal action to Apps Script:', product, action);

    // Send to Apps Script
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      redirect: 'follow'
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError.message);
      return res.status(500).json({
        error: 'Invalid response from Apps Script',
        message: 'Response was not valid JSON',
        debug: responseText.substring(0, 200)
      });
    }

    if (data.error) {
      console.error('Apps Script error:', data);
      return res.status(response.status === 200 ? 500 : response.status).json(data);
    }

    // No caching for action saves
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error saving renewal action:', error);
    return res.status(500).json({
      error: 'Failed to save renewal action',
      message: error.message
    });
  }
}
