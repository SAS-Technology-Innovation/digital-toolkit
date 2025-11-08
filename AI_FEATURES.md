# AI Features Documentation

## Overview

The SAS Digital Toolkit Dashboard now includes **AI-powered search and recommendations** using both **Google's Gemini API** and **Anthropic's Claude API**. This allows users to ask natural language questions and receive intelligent app recommendations based on their specific needs, with the flexibility to choose their preferred AI provider.

---

## Features

### 1. AI Toggle in Search Bar
**Location:** Header search bar (yellow sparkles button)

**How it works:**
- Click the "AI" button to enable AI mode
- Search bar changes to golden/yellow theme
- Type natural language questions and press Enter
- Automatically opens chat window with your query

**Example queries:**
- "What can I use for collaborative writing with 8th graders?"
- "Show me math tools with mobile apps"
- "I need SSO-enabled apps for high school science"

### 2. Floating Chat Bubble
**Location:** Bottom-right corner (yellow circular button with bot icon)

**Features:**
- Always accessible from any tab
- Click to open/close AI chat window
- Maintains conversation history during session
- Responsive on mobile devices

### 3. AI Chat Window
**Location:** Opens bottom-right when chat bubble is clicked

**Components:**
- **AI Provider Selector** - Choose between Gemini or Claude
- **Welcome message** with example queries
- **Suggestion chips** for quick queries
- **Chat interface** with user and AI messages
- **Text input** with auto-resize
- **Loading animation** while AI processes queries

**AI Provider Options:**
- **Gemini** (Google) - Default, fast responses
- **Claude** (Anthropic) - Alternative AI provider

**Suggestion chips:**
- "What tools support SSO?"
- "Elementary math apps"
- "Mobile apps"

---

## Setup Instructions

### Step 1: Get API Keys

#### Option A: Gemini API Key (Google)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"**
4. Create a new API key or use an existing one
5. Copy the API key

#### Option B: Claude API Key (Anthropic)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **"Create Key"**
5. Copy the API key

**Note:** You can configure one or both providers. Users will only be able to select providers that have API keys configured.

### Step 2: Configure Script Properties

1. Open the Apps Script project:
   ```bash
   npm run open
   ```

2. Go to **Project Settings** (⚙️ gear icon)

3. Scroll down to **Script Properties**

4. Click **"Add script property"**

5. Add one or both of the following properties:
   - **Property:** `GEMINI_API_KEY`
   - **Value:** `YOUR_GEMINI_API_KEY_HERE`

   - **Property:** `CLAUDE_API_KEY`
   - **Value:** `YOUR_CLAUDE_API_KEY_HERE`

6. Click **"Save script properties"**

### Step 3: Deploy

Deploy the updated code:
```bash
npm run push
npm run deploy
```

Or commit to GitHub to trigger auto-deployment via GitHub Actions.

---

## Technical Architecture

### Backend ([Code.js:22-196](Code.js#L22-L196))

**Function: `queryAI(userQuery, allAppsData, provider)`**

**Process:**
1. Receives user's natural language query and selected AI provider
2. Parses all apps data from dashboard
3. Creates simplified context (reduces token usage)
4. Constructs prompt with:
   - System role: "Educational technology assistant for SAS"
   - Apps database context
   - User question
   - Instructions to recommend 3-5 relevant apps
5. Routes to appropriate AI provider:
   - **Gemini**: Calls `queryGeminiAPI()` - uses `gemini-2.0-flash-exp` model
   - **Claude**: Calls `queryClaudeAPI()` - uses `claude-sonnet-4-5-20250929` model
6. Returns formatted response with provider identifier

**Gemini Implementation ([Code.js:72-132](Code.js#L72-L132)):**
- Model: `gemini-2.0-flash-exp` (latest experimental model)
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`
- Temperature: 0.7
- Max tokens: 1024

**Claude Implementation ([Code.js:134-196](Code.js#L134-L196)):**
- Model: `claude-sonnet-4-5-20250929` (Claude Sonnet 4.5)
- Endpoint: `https://api.anthropic.com/v1/messages`
- Max tokens: 1024
- API Version: 2023-06-01

**Error handling:**
- Missing API key check for each provider
- HTTP error responses
- Empty/invalid responses
- Provider-specific error messages
- Logs all errors to Apps Script console

### Frontend ([index.html:2134-2349](index.html#L2134-L2349))

**Key Functions:**

1. **`setupAIFeatures()`** - Initializes all AI event listeners
2. **`sendAIMessage()`** - Sends query to backend via `google.script.run`
3. **`handleAIResponse()`** - Processes AI response and displays in chat
4. **`addMessageToChat(role, content)`** - Renders messages with proper styling
5. **`addLoadingMessage()`** - Shows animated loading indicator

**Data Flow:**
```
User Selects Provider (Gemini/Claude) → User Input → sendAIMessage()
→ google.script.run.queryAI(message, appsData, selectedProvider)
→ Backend Routes to queryGeminiAPI() OR queryClaudeAPI()
→ AI Response → handleAIResponse() → addMessageToChat() → Display in UI
```

---

## AI Provider Details

### Gemini API (Google)

**Model:** `gemini-2.0-flash-exp` (experimental, latest features)
**Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`

**Generation Config:**
- **Temperature:** 0.7 (balanced creativity and accuracy)
- **Max Output Tokens:** 1024 (keeps responses concise)

**Cost:** Gemini API has a generous free tier:
- 60 requests per minute
- 1,500 requests per day
- Free for moderate usage

[View Gemini Pricing](https://ai.google.dev/pricing)

### Claude API (Anthropic)

**Model:** `claude-sonnet-4-5-20250929` (Claude Sonnet 4.5)
**Endpoint:** `https://api.anthropic.com/v1/messages`

**Configuration:**
- **Max Tokens:** 1024 (keeps responses concise)
- **API Version:** 2023-06-01

**Cost:** Claude Sonnet 4.5 pricing (as of 2025):
- Input: $3 per million tokens
- Output: $15 per million tokens
- Estimated cost per query: ~$0.01-0.02

[View Claude Pricing](https://www.anthropic.com/api)

**Note:** Claude Sonnet 4.5 provides excellent reasoning, structured responses, and strong coding capabilities. Both providers support markdown formatting in responses.

---

## User Experience

### AI Toggle Mode
1. User clicks **"AI"** button in search bar
2. Search bar turns golden yellow
3. Placeholder changes to: *"Ask AI: What tools can I use for..."*
4. User types natural language query
5. Press Enter → Opens chat window with query
6. AI responds with personalized recommendations

### Chat Bubble Workflow
1. User clicks floating **yellow bot icon**
2. Chat window slides up from bottom-right
3. **Select AI Provider** (Gemini or Claude) using toggle buttons in header
4. Welcome message explains capabilities
5. User can:
   - Type custom questions
   - Click suggestion chips for quick queries
   - View conversation history
   - Switch between AI providers mid-conversation
6. AI responds with:
   - App recommendations
   - Reasoning for each suggestion
   - Feature highlights (SSO, Mobile, Grade Levels)
   - Audience suitability

---

## Customization

### Modify AI Prompt

Edit the prompt in [Code.js:50-62](Code.js#L50-L62):

```javascript
const prompt = `You are an educational technology assistant for Singapore American School...`;
```

**Tips:**
- Add specific criteria for your school
- Include preferred teaching philosophies
- Adjust tone (formal, casual, friendly)
- Add domain expertise

### Add More Suggestion Chips

Edit [index.html:1627-1631](index.html#L1627-L1631):

```html
<button class="ai-suggestion-chip" data-suggestion="YOUR_QUERY">Chip Label</button>
```

### Adjust AI Model Settings

Edit [Code.js:73-76](Code.js#L73-L76):

```javascript
generationConfig: {
  temperature: 0.7,    // 0.0 = focused, 1.0 = creative
  maxOutputTokens: 1024, // Response length
}
```

---

## Troubleshooting

### "API key not configured" Error

**For Gemini:** Set `GEMINI_API_KEY` in Script Properties (see Setup Step 2)
**For Claude:** Set `CLAUDE_API_KEY` in Script Properties (see Setup Step 2)

### "Gemini AI temporarily unavailable"

**Possible causes:**
- Invalid Gemini API key
- Exceeded API rate limits (60/min, 1500/day)
- Network connectivity issues
- Gemini API outage

**Check:**
1. Verify `GEMINI_API_KEY` is valid in Script Properties
2. Check [Google Cloud Status Dashboard](https://status.cloud.google.com/)
3. Review Apps Script logs: `npm run logs`
4. Try switching to Claude provider

### "Claude AI temporarily unavailable"

**Possible causes:**
- Invalid Claude API key
- Exceeded Claude API rate limits
- Insufficient Claude API credits
- Network connectivity issues
- Anthropic API outage

**Check:**
1. Verify `CLAUDE_API_KEY` is valid in Script Properties
2. Check Claude account credits at [Anthropic Console](https://console.anthropic.com/)
3. Review Apps Script logs: `npm run logs`
4. Try switching to Gemini provider

### Chat window not opening

**Solutions:**
1. Clear browser cache
2. Hard refresh (Cmd/Ctrl + Shift + R)
3. Check browser console for JavaScript errors
4. Ensure `google.script.run` is available (deployed as web app)

### Slow AI responses

**Optimization:**
- Reduce `globalAppsData` size by filtering fields
- Implement caching for common queries
- Use shorter prompts
- Decrease `maxOutputTokens`

---

## Privacy & Security

### Data Handling

**What gets sent to Gemini:**
- User's question (natural language query)
- Simplified app metadata (name, description, category, etc.)
- NO personal user data
- NO authentication tokens

**What's stored:**
- API key in Script Properties (encrypted by Google)
- No conversation history persisted (session-only)

### Best Practices

1. **Never commit API keys to Git**
   - Use Script Properties only
   - Add to `.gitignore` if storing locally

2. **Monitor API usage**
   - Check [Google AI Studio Console](https://makersuite.google.com/)
   - Set up billing alerts if using paid tier

3. **Rate limiting**
   - Built-in: 60 requests/minute
   - Consider client-side throttling for heavy usage

---

## Future Enhancements

### Planned Features (Phase 5)
- **Conversation history persistence** (save to user properties)
- **Smart search suggestions** based on popular queries
- **Multi-language support** (Gemini supports 100+ languages)
- **App comparison** ("Compare Google Classroom vs Schoology")
- **Usage analytics** (track most-asked questions)
- **Personalized recommendations** based on user role (teacher, student, parent)

### Advanced Integrations
- **Voice input** using Web Speech API
- **App ratings context** (include user reviews in recommendations)
- **Calendar integration** ("What can I use for tomorrow's geometry lesson?")
- **Google Workspace context** (recommend based on existing tools)

---

## Support

**For AI feature issues:**
- Email: edtech@sas.edu.sg
- Include error message from chat window
- Specify the query that caused the issue

**Gemini API documentation:**
- [Google AI for Developers](https://ai.google.dev/)
- [Gemini API Quickstart](https://ai.google.dev/tutorials/web_quickstart)

---

**Last updated:** 2025-01-08
**Version:** 1.0.0
