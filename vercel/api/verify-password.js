/**
 * Vercel Serverless Function: /api/verify-password
 * Verifies the renewal page password
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

  const RENEWAL_PASSWORD = process.env.RENEWAL_PASSWORD;

  // Validate environment variable
  if (!RENEWAL_PASSWORD) {
    console.error('Missing environment variable: RENEWAL_PASSWORD');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'RENEWAL_PASSWORD is not configured'
    });
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Password is required'
      });
    }

    // Simple password verification
    const isValid = password === RENEWAL_PASSWORD;

    // No caching for auth responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    return res.status(200).json({ valid: isValid });

  } catch (error) {
    console.error('Error verifying password:', error);
    return res.status(500).json({
      error: 'Failed to verify password',
      message: error.message
    });
  }
}
