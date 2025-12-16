/**
 * Vercel Serverless Function: /api/ai
 * Direct Claude AI integration using Anthropic SDK
 *
 * Handles natural language queries about educational apps with contextual understanding.
 * Uses Claude Haiku for fast, cost-effective responses.
 */

import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

  // Validate environment variables
  if (!CLAUDE_API_KEY) {
    console.error('Missing environment variable: CLAUDE_API_KEY');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'CLAUDE_API_KEY is not set'
    });
  }

  // Parse request body
  const { query, appsData } = req.body;

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
    // Parse apps data
    let apps;
    try {
      apps = typeof appsData === 'string' ? JSON.parse(appsData) : appsData;
    } catch (parseError) {
      return res.status(400).json({
        error: 'Invalid appsData format',
        message: 'appsData must be valid JSON'
      });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: CLAUDE_API_KEY,
    });

    // Build context from apps data
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(query, apps);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022', // Fast, cost-effective model
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    // Extract text response
    const responseText = message.content[0].text;

    // No caching for AI responses (they should be fresh)
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    return res.status(200).json({
      response: responseText,
      model: 'claude-3-5-haiku-20241022',
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('Error calling Claude API:', error);

    // Handle specific Anthropic errors
    if (error.status === 401) {
      return res.status(500).json({
        error: 'Authentication failed',
        message: 'Invalid Claude API key'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      });
    }

    return res.status(500).json({
      error: 'Failed to process AI query',
      message: error.message
    });
  }
}

/**
 * Build system prompt for Claude
 */
function buildSystemPrompt() {
  return `You are an AI assistant helping educators at Singapore American School find the right educational technology tools.

Your role:
- Analyze the provided apps database and recommend appropriate tools
- Consider grade levels, subjects, SSO availability, mobile apps, and audience fit
- Provide specific, actionable recommendations with brief explanations
- Be concise but informative - focus on the most relevant apps
- Format app names in **bold** for easy scanning

Guidelines:
- Prioritize apps that match the user's specific needs (grade level, subject, features)
- Mention if an app has SSO (single sign-on) or mobile apps when relevant
- If asked for alternatives, suggest 2-3 options with trade-offs
- If no perfect match exists, suggest the closest alternatives and explain why
- Keep responses under 200 words unless specifically asked for more detail`;
}

/**
 * Build user prompt with query and apps context
 */
function buildUserPrompt(query, apps) {
  // Extract relevant app info for context
  const appsContext = apps.slice(0, 50).map(app => {
    return `- **${app.product}**: ${app.description || 'Educational app'} (${app.division || 'All grades'}, ${app.department || 'General'})${app.ssoEnabled ? ' [SSO]' : ''}${app.mobileApp && app.mobileApp !== 'No' ? ' [Mobile]' : ''}`;
  }).join('\n');

  return `Available apps database (${apps.length} total, showing top 50):

${appsContext}

User question: ${query}

Please provide a helpful, concise response recommending the most appropriate apps for this query.`;
}
