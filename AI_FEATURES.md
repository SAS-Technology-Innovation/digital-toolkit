# AI Features Documentation

## Overview

The SAS Digital Toolkit Dashboard now includes **AI-powered search and recommendations** using Google's Gemini API. This allows users to ask natural language questions and receive intelligent app recommendations based on their specific needs.

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
- **Welcome message** with example queries
- **Suggestion chips** for quick queries
- **Chat interface** with user and AI messages
- **Text input** with auto-resize
- **Loading animation** while AI processes queries

**Suggestion chips:**
- "What tools support SSO?"
- "Elementary math apps"
- "Mobile apps"

---

## Setup Instructions

### Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"**
4. Create a new API key or use an existing one
5. Copy the API key

### Step 2: Configure Script Properties

1. Open the Apps Script project:
   ```bash
   npm run open
   ```

2. Go to **Project Settings** (⚙️ gear icon)

3. Scroll down to **Script Properties**

4. Click **"Add script property"**

5. Add the following property:
   - **Property:** `GEMINI_API_KEY`
   - **Value:** `YOUR_API_KEY_HERE` (paste your Gemini API key)

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

### Backend ([Code.js:22-119](Code.js#L22-L119))

**Function: `queryAI(userQuery, allAppsData)`**

**Process:**
1. Receives user's natural language query
2. Parses all apps data from dashboard
3. Creates simplified context (reduces token usage)
4. Constructs prompt for Gemini with:
   - System role: "Educational technology assistant for SAS"
   - Apps database context
   - User question
   - Instructions to recommend 3-5 relevant apps
5. Calls Gemini API (`gemini-pro` model)
6. Returns formatted response

**Error handling:**
- Missing API key check
- HTTP error responses
- Empty/invalid responses
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
User Input → sendAIMessage() → google.script.run.queryAI()
→ Backend API Call → Gemini Response → handleAIResponse()
→ addMessageToChat() → Display in UI
```

---

## Gemini API Details

**Model:** `gemini-pro`
**Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`

**Generation Config:**
- **Temperature:** 0.7 (balanced creativity and accuracy)
- **Max Output Tokens:** 1024 (keeps responses concise)

**Cost:** Gemini API has a generous free tier:
- 60 requests per minute
- 1,500 requests per day
- Free for moderate usage

[View Gemini Pricing](https://ai.google.dev/pricing)

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
3. Welcome message explains capabilities
4. User can:
   - Type custom questions
   - Click suggestion chips for quick queries
   - View conversation history
5. AI responds with:
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

**Solution:** Set `GEMINI_API_KEY` in Script Properties (see Setup Step 2)

### "AI service temporarily unavailable"

**Possible causes:**
- Invalid API key
- Exceeded API rate limits (60/min)
- Network connectivity issues
- Gemini API outage

**Check:**
1. Verify API key is valid
2. Check [Google Cloud Status Dashboard](https://status.cloud.google.com/)
3. Review Apps Script logs: `npm run logs`

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
