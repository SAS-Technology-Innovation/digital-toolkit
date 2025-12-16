# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Project Overview

The **SAS Digital Toolkit Dashboard** is a Google Apps Script web application that displays educational applications for Singapore American School. Apps are categorized by school divisions with smart filtering and department grouping.

### Core Components

- **[Code.js](Code.js)**: Google Apps Script backend (reads from Google Sheets, processes data)
- **[index.html](index.html)**: Single-page frontend with embedded CSS/JS
- **[signage.html](signage.html)**: Digital signage slideshow display (access via `?page=signage`)
- **[appsscript.json](appsscript.json)**: Google Apps Script configuration
- **[package.json](package.json)**: npm scripts for clasp-based deployment

## 🏗️ Architecture & Critical Business Logic

### Data Flow
```
Google Sheets → Apps Script Backend → JSON API → Frontend Dashboard → User Interface
```

### Division Assignment Logic (Code.js)

Apps are categorized based on these business rules in [Code.js:304-410](Code.js#L304-L410) and [utilities.js:270-289](utilities.js#L270-L289):

**Three-Tier Hierarchy:**

1. **Enterprise Apps** (ONLY on Whole School tab):
   - `Enterprise` column = TRUE checkbox
   - Highest priority, premium styling
   - Official SAS-approved core tools

2. **Apps Everyone Can Use**:
   - **Whole School tab**: Site/School/Enterprise/Unlimited licenses (non-Enterprise checkbox)
   - **Division tabs**: ONLY division-specific "everyone" apps (excludes whole school apps)
   - Site/School/Enterprise/Unlimited license types + NOT whole school

3. **Department-Specific Apps**:
   - Individual licenses or apps not in above categories
   - Grouped by department with counts
   - Filtered to exclude invalid department names

**Whole School Determination**:
```javascript
// An app is "Whole School" if it meets ANY of these:
const isEffectivelyWholeSchool =
  licenseType.includes('site') ||
  licenseType.includes('school') ||
  licenseType.includes('enterprise') ||
  licenseType.includes('unlimited') ||
  department === 'school operations' ||
  department === 'school-wide' ||
  division.includes('school-wide') ||
  division.includes('whole school') ||
  (hasElementary && hasMiddle && hasHigh); // All 3 divisions listed
```

**Key Rules:**
- Enterprise apps NEVER appear on division tabs (Elementary/Middle/High)
- Whole school apps do NOT appear in division tabs' "Everyone" section
- Division tabs only show division-specific apps + department apps

## 💻 Google Apps Script Environment

### Critical Constraints
- **No Node.js modules**: All dependencies via CDN (Tailwind CSS, Lucide Icons)
- **No build process**: Everything embedded in HTML/JS files
- **Backend-Frontend communication**: Must use `google.script.run` pattern
- **Configuration**: Uses Script Properties (not hardcoded values)

### Backend Pattern (Code.js)
```javascript
// Configuration via Script Properties (not in code)
const scriptProperties = PropertiesService.getScriptProperties();
const SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');
const SHEET_NAME = scriptProperties.getProperty('SHEET_NAME');

// Always wrap in try-catch
function getDashboardData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    // ... processing
    return JSON.stringify(result);
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return JSON.stringify({ error: error.message });
  }
}
```

### Frontend Pattern (index.html)
```javascript
// Environment detection for local testing vs deployed
if (typeof google !== 'undefined' && typeof google.script !== 'undefined') {
  google.script.run
    .withSuccessHandler(renderDashboard)
    .withFailureHandler(showError)
    .getDashboardData();
} else {
  renderDashboard(JSON.stringify(mockData)); // Local testing
}
```

### Expected Google Sheets Structure
**Required columns in exact order** (all lowercase):
1. `active`: Boolean (TRUE/FALSE) - only TRUE apps processed
2. `product_name`: String - app name
3. `division`: String - "SAS Elementary School", "SAS Middle School", "SAS High School", "Whole School", or combinations
4. `grade_levels`: String - comma-separated individual grades from multi-select dropdown: "Pre-K, Kindergarten, Grade 1, Grade 2" (valid values: Pre-K, Kindergarten, Grade 1-12)
5. `department`: String - department name (filters out division names)
6. `subjects`: String - subject tags/categorization
7. `enterprise`: Boolean (TRUE/FALSE) - **Enterprise checkbox (core SAS tools)**
8. `budget`: String - "Office Of Learning", "IT Operations", "Communications", "Business Office" (exact capitalization for validation)
9. `audience`: String - comma-separated: "Staff, Teachers, Students, Parents"
10. `license_type`: String - "Site Licence" (British), "Inidividual" (typo intentional for validation), "Division License", "Free"
11. `licence_count`: Number - number of licenses
12. `value`: Number/String - cost/spend information
13. `date_added`: Date - when app was added (YYYY-MM-DD)
14. `renewal_date`: Date - subscription renewal date (YYYY-MM-DD)
15. `category`: String - for tagging
16. `website`: String - app URL
17. `description`: String - 1-2 sentence app description
18. `support_email`: String - support contact email
19. `tutorial_link`: String - training/help URL
20. `mobile_app`: String - "Yes", "No", or "iOS/Android"
21. `sso_enabled`: Boolean (TRUE/FALSE) - single sign-on available
22. `logo_url`: String - app logo/icon URL

**Important Notes:**
- All column names are **lowercase** (changed from mixed case)
- `grade_levels` is in **4th position** (after division, before department)
- Grade levels format changed from ranges (e.g., "K-5") to **comma-separated individual grades** (e.g., "Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5" for Elementary apps)
- Grade levels are **automatically inferred** during CSV import using Gemini API or rule-based logic from the division field
- Data validation supports **multi-select dropdown** with comma-separated individual grade values
- Valid individual grades: Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12
- `license_type` uses intentional typo "Inidividual" and British spelling "Site Licence" to match existing Google Sheets data validation
- `budget` field uses specific capitalization "Office Of Learning" (capital O in "Of") for validation compatibility

**Backwards Compatibility:**
- Code.js supports both old (capitalized) and new (lowercase) column names for smooth migration
- data-management.js CSV import handles both formats automatically

**See [expected-data-template.csv](expected-data-template.csv) for example data.**

## 🚀 Development Commands

### Setup (First Time)
```bash
# Clone the Apps Script project (creates .clasp.json)
npx @google/clasp clone "YOUR_SCRIPT_ID"

# Login to Google
npm run login
```

### Daily Development
```bash
npm run push      # Push code changes to Apps Script
npm run deploy    # Create new deployment
npm run logs      # View execution logs
npm run open      # Open Apps Script editor
npm run pull      # Pull latest from cloud
```

### Testing Strategy
- **Frontend only**: Open `index.html` locally (uses mock data)
- **Full integration**: Deploy to Apps Script and test with real Google Sheets

### Python Development Scripts

**⚠️ These scripts are for LOCAL DEVELOPMENT ONLY - not used in production.**

Production data management happens through the Google Sheets interface via Apps Script.

#### merge-csvs.py
**Purpose**: Merge EdTech Impact subscription data with existing Google Sheet data

**Workflow**:
1. Download fresh `EdTech_Impact.csv` from EdTech Impact platform
2. Export current Google Sheet as CSV (e.g., `SAS Digital Toolkit (MASTER) - Apps.csv`)
3. Run: `python3 merge-csvs.py`
4. Imports `merged-import-data.csv` into Google Sheets
5. **Delete all CSV files** (contain sensitive data - see `.gitignore`)

**What it does**:
- Syncs `active` status (TRUE if in EdTech Impact, FALSE if not)
- Updates subscription fields: `licence_count`, `renewal_date`, `division`, `license_type`
- **Preserves protected fields**: `department`, `subjects`, `enterprise` (never overwrites)
- **Infers missing grade_levels** using rule-based logic from division field
- Normalizes data validation fields (`budget`, `license_type`) to match Google Sheets validation

**Grade Level Inference**:
- Uses division field to determine applicable grades
- Elementary → "Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5"
- Middle School → "Grade 6, Grade 7, Grade 8"
- High School → "Grade 9, Grade 10, Grade 11, Grade 12"
- Multiple divisions → combined grade list
- Only fills in **empty** grade_levels (preserves existing values)

**Output**: `merged-import-data.csv` with all lowercase column headers

#### Other Utility Scripts
- `sync-active-apps.py` - Simple active status sync (deprecated - use merge-csvs.py)
- `fix-license-types.py` - Utility to fix license type validation mismatches

**Important**: Always delete temporary CSV files after import - they contain sensitive school data and are excluded via `.gitignore`.

## 🔧 Configuration

### Script Properties Setup
Configuration is **NOT in code**. Set via Apps Script Editor:
1. Open project: `npm run open`
2. Go to **Project Settings (⚙️) > Script Properties**
3. Add required properties:
   - `SPREADSHEET_ID`: Your Google Sheets ID (required)
   - `SHEET_NAME`: Your sheet name (required)
   - `GEMINI_API_KEY`: Gemini API key for user-facing AI features (required for AI chat)
   - `CLAUDE_API_KEY`: Claude API key for admin data management (optional, for data enrichment only)

### GitHub Actions Deployment
Auto-deploys on push to `main`. Requires repository secrets:

**For Apps Script Deployment (deploy.yml):**

1. **`CLASP_CREDENTIALS`**: Run `npm run login`, then `cat ~/.config/clasp/.clasprc.json` and copy entire JSON
2. **`APPS_SCRIPT_ID`**: Find in Apps Script Editor → Project Settings → IDs
3. **`APPS_SCRIPT_DEPLOYMENT_ID`**: Find in Deploy → Manage deployments → Copy deployment ID

**For Claude Code Integration (claude.yml, claude-code-review.yml):**

- **`CLAUDE_CODE_OAUTH_TOKEN`**: OAuth token for Claude Code GitHub Action (get from Anthropic)

**Note**: `.clasp.json` is NOT in repo. Created locally via `npx @google/clasp clone` or dynamically in GitHub Actions.

### Vercel Deployment (Alternative Frontend)

The dashboard can also be deployed to Vercel for faster loading and CDN distribution. See **[VERCEL.md](VERCEL.md)** for complete setup instructions.

**Quick Setup:**

1. Set `FRONTEND_KEY` in Apps Script Properties
2. Deploy Apps Script: `npm run push && npm run deploy`
3. Deploy to Vercel with environment variables:
   - `FRONTEND_KEY`: Same key as Apps Script
   - `APPS_SCRIPT_URL`: Your Apps Script web app URL

**Architecture:**

- Vercel serves static HTML + serverless API functions
- API functions proxy requests to Apps Script with `FRONTEND_KEY` authentication
- Apps Script remains the single source of truth for data

## ⚠️ Common Issues

### Configuration Errors
- **"Configuration error: SPREADSHEET_ID not set"**: Set Script Properties (see above)
- **"Script not found"**: Check `.clasp.json` has correct scriptId (local) or `APPS_SCRIPT_ID` secret (GitHub Actions)
- **Permission denied**: Run `npm run login` and verify Google Sheets access

### Business Logic Issues

- **Apps in wrong division**: Check division string matching logic in [utilities.js:237-289](utilities.js#L237-L289)
- **Division names appearing as departments**: Verify department filtering array matches actual division names
- **Missing apps**: Ensure `Active` column is TRUE (case-insensitive)

### Deployment Issues
- **GitHub Actions "No credentials found"**: `CLASP_CREDENTIALS` secret must contain complete, valid JSON
- **OAuth scope error**: Ensure `appsscript.json` includes `spreadsheets.readonly` scope

## 🎨 Design Patterns & New Features

### Three-Section Layout (per tab)
1. **Enterprise Apps** (Whole School only): Premium gold styling, "Official SAS Core Tools"
2. **Apps Everyone Can Use**: Blue/standard styling, site/school licenses
3. **Department Apps**: Grouped by department with icons and counts

### UI Components (index.html)
- **Search Bar**: Global search across all fields (sticky, filters in real-time)
- **Enterprise Section**: Premium gold gradient with border, award icon
- **Tab Navigation**: Division-based tabs with color coding
- **App Cards**: Enhanced with descriptions, audience tags, SSO/Mobile badges
- **Audience Tags**: Color-coded (Staff=purple, Teachers=green, Students=yellow, Parents=pink)
- **Meta Badges**: SSO (green), Mobile (blue) indicators
- **Department Grouping**: Collapsible cards with app counts and icons
- **Responsive Grid**: CSS Grid with `repeat(auto-fit, minmax(280px, 1fr))`

### Search Functionality
- Searches across: product name, category, subject, department, audience
- Real-time filtering (hides non-matching cards)
- Clear button to reset search
- Hides empty sections when searching

### Icon Assignment Logic
Department icons auto-assigned based on keywords:
- Technology/IT → Monitor
- English/Language → Book
- Math → Calculator
- Science → Flask
- Arts/Music → Palette
- PE/Athletics → Activity

## 🚀 Phase 3 Features (Recently Implemented)

### Enhanced App Cards
**Visual Enhancements:**
- **App Logos**: Displays `logo_url` field with error handling (60x60px, top of card)
- **Grade Level Badges**: Shows `grade_levels` with graduation cap icon (yellow badge)
- **"NEW" Badge**: Animated badge for apps added in last 30 days (red gradient, top-right corner)
- **Description Display**: Shows app descriptions from `description` field
- **Action Buttons**: Tutorial link button (if `tutorial_link` exists) and Details button

**Code Location:** [index.html:1221-1281](index.html#L1221-L1281) - `createAppCard()` function

### App Detail Modal
Interactive modal popup with comprehensive app information:
- **Trigger**: "Details" button on app cards
- **Content**: Full app details, description, license info, features, renewal date
- **Actions**: Visit Website, View Tutorial buttons
- **UX**: Click outside or press ESC to close, prevents body scroll

**Code Location:** [index.html:1403-1557](index.html#L1403-L1557) - `showAppDetails()` and `closeModal()` functions

**CSS Styles:** [index.html:741-960](index.html#L741-L960)

### What's New Section
Dynamic section showing recently added apps:
- **Display Logic**: Only shows if apps added in last 30 days exist
- **Placement**: Top of each division tab (before Enterprise/Everyone sections)
- **Styling**: SAS Red themed container with gradient border
- **Date Check**: Uses `isWithinDays()` helper to filter by `date_added` field

**Code Location:**
- HTML: Each division tab has `<div id="{division}-whats-new">` container
- JS: [index.html:1320-1335](index.html#L1320-L1335) in `renderDivisionContent()`
- CSS: [index.html:269-318](index.html#L269-L318)

### SAS Brand Implementation
**Colors Applied:**
- Primary: SAS Blue (#1a2d58), SAS Red (#a0192a), Eagle Yellow (#fabc00)
- Division colors: Elementary (#228ec2), Middle (#a0192a), High (#1a2d58)
- Typography: Bebas Neue (headings), DM Sans (body text)

**CSS Variables:** [index.html:12-30](index.html#L12-L30)

### Date Handling
**Helper Function**: `isWithinDays(dateString, days)`
- Checks if `date_added` is within specified number of days
- Used for "NEW" badge and "What's New" section
- Handles invalid dates gracefully

**Code Location:** [index.html:1284-1295](index.html#L1284-L1295)

### Search Enhancements
**Search Fields**: Now includes audience field in search
- Searches: product name, category, subject, department, **audience**
- Real-time filtering with section hiding for empty results

**Code Location:** [index.html:1404-1453](index.html#L1404-L1453) - `setupSearch()` function

### Data Attributes for Search
All app cards include searchable data attributes:
- `data-product`, `data-category`, `data-subject`, `data-department`, `data-audience`
- Enables efficient client-side filtering

**Implementation:** [index.html:1262](index.html#L1262) in `createAppCard()`

## 🤖 Phase 4: AI-Powered Search & Recommendations

### Dual AI Provider Integration (Implemented)
The dashboard features **intelligent natural language search** with support for two AI providers:

**AI Provider Roles:**
- **Gemini (Production)**: Read-only queries, app recommendations, user-facing chat (default)
- **Claude (Admin)**: Data enrichment, validation, and write operations for sheet management

**User-Facing Features:**
- **AI Toggle in Search Bar**: Click "AI" button to enable natural language queries
- **Floating Chat Bubble**: Bottom-right corner bot icon for instant AI assistance
- **Smart Recommendations**: Ask questions like "What can I use for collaborative writing with 8th graders?"
- **Contextual Understanding**: AI analyzes grade levels, subjects, SSO, mobile support, and audience

**Admin Features (Claude Only):**
- **Data Enrichment**: Automatically generate missing descriptions
- **Column Validation**: Detect and fill missing required fields
- **Content Quality**: Ensure all apps have complete metadata
- **Sheet Menu Integration**: Custom menu in Google Sheets for easy data management

**Key Files:**

- [ai-functions.js:81-196](ai-functions.js#L81-L196) - `queryAI()` main entry point
- [ai-functions.js:210-273](ai-functions.js#L210-L273) - `queryGeminiAPI()` function
- [ai-functions.js:287-355](ai-functions.js#L287-L355) - `queryClaudeAPI()` function
- [index.html:3035-3165](index.html#L3035-L3165) - AI chat interface and message handling
- [AI_FEATURES.md](AI_FEATURES.md) - Complete AI features documentation

**Setup Required:**
1. **For Gemini (Required for users)**:
   - Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add to Script Properties: `GEMINI_API_KEY` = your key

2. **For Claude (Optional, admin only)**:
   - Get API key from [Anthropic Console](https://console.anthropic.com/)
   - Add to Script Properties: `CLAUDE_API_KEY` = your key

**How It Works:**
```
User Query → queryAI(query, appsData, provider) → Gemini/Claude API
→ Contextual Prompt + Apps Database → AI Response
→ Smart Recommendations → Display in Chat
```

**API Provider Selection:**
- Default: Gemini (faster, free tier available, user-facing)
- Admin tools: Claude (better for structured data operations)
- Configurable via `provider` parameter in `queryAI(query, data, provider)`

**See [AI_FEATURES.md](AI_FEATURES.md) for complete documentation.**

---

## 🔧 Data Management & Quality Control

### CSV/XLSX Import from EdTech Impact

**Primary Data Source:** EdTech Impact platform exports

The Digital Toolkit supports **automatic import and transformation** of app data from EdTech Impact CSV/XLSX exports.

**Quick Workflow:**
1. Export CSV/XLSX from EdTech Impact platform
2. Go to **🤖 Digital Toolkit Admin → 📤 Upload CSV Data**
3. Select update mode (Add & Update recommended)
4. Upload file - system auto-detects EdTech Impact format
5. Review statistics and verify import

**Expected EdTech Impact Export Format:**
```
Product, Cancel by, Renews on, Price, Budget, Notes, Licences, Length, Source, Schools, Decision, Status
```

**Key Transformations:**
- `Schools` → `Division` ("SAS Elementary School, SAS Middle School" → "Elementary, Middle")
- `Price` → `value` (`[object Object]` → 0 = Free)
- `Budget` → `Department` (IT Operations, Office of Learning, etc.)
- `Status` → `Active` (boolean → TRUE/FALSE)
- `Licences` → Infers `License Type` (>100 = Site, 1-100 = Individual, 0 = Unlimited)

**Auto-Populated Fields:**
- `Enterprise`: FALSE (default)
- `audience`: "Teachers, Staff"
- `grade_levels`: Inferred from division using Gemini API or rule-based logic
  - Elementary: "Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5"
  - Middle School: "Grade 6, Grade 7, Grade 8"
  - High School: "Grade 9, Grade 10, Grade 11, Grade 12"
  - Multiple divisions: combined grade list
- `category`: "Apps" (default)

**See [EDTECH_IMPACT_IMPORT.md](EDTECH_IMPACT_IMPORT.md) for complete import guide.**

**See [XLSX_IMPORT.md](XLSX_IMPORT.md) for technical XLSX/CSV processing details.**

### Google Sheets Admin Menu
When you open the Google Sheets containing your app data, a custom menu "🤖 Digital Toolkit Admin" appears with data management tools.

**Menu Functions** (requires `CLAUDE_API_KEY` for AI features):

1. **📊 Validate Data** ([data-management.js:38-95](data-management.js#L38-L95))
   - Checks all active apps for required fields
   - Reports missing: product_name, description, Division, Department, Category, Website
   - Shows up to 20 issues with row numbers
   - Logs full validation report to Apps Script Logger

2. **🔍 Find Missing Fields** ([data-management.js:115-250](data-management.js#L115-L250))
   - Generates comprehensive report of missing data
   - Tracks: descriptions, categories, audience, grade levels, logos
   - Shows first 5 apps missing each field type
   - Reports total counts for each missing field type

3. **✨ Enrich Missing Descriptions** ([data-management.js:269-385](data-management.js#L269-L385))
   - Uses Claude AI to generate descriptions for apps missing them
   - Processes up to 10 apps per run (rate limiting)
   - Generates 1-2 sentence educational descriptions
   - Automatically saves to sheet with immediate flushing

4. **🔄 Refresh All Missing Data** ([data-management.js:399-550](data-management.js#L399-L550))
   - Comprehensive data enrichment for ALL missing fields
   - Fills in: descriptions, categories, audience, grade levels
   - Processes up to 15 apps per run (quota protection)
   - Uses intelligent prompts based on division, subject, website
   - Includes 1-second rate limiting between requests

5. **📈 Analyze AI Chat Patterns** ([ai-functions.js:857-927](ai-functions.js#L857-L927))
   - Analyzes user AI chat interactions to identify missing apps
   - Reports query types, top keywords, and recent queries
   - Helps discover gaps in app database based on search patterns
   - Requires "AI Chat Analytics" sheet with logged queries

6. **🧪 Test Claude Connection** ([ai-functions.js:1102-1207](ai-functions.js#L1102-L1207))
   - Validates `CLAUDE_API_KEY` configuration
   - Tests Claude API connectivity with sample description generation
   - Displays actual API response (first 200 characters)
   - User-friendly success/failure alerts

7. **🧪 Test Gemini Connection** ([ai-functions.js:997-1096](ai-functions.js#L997-L1096))
   - Validates `GEMINI_API_KEY` configuration
   - Tests Gemini API connectivity with simple prompt
   - Confirms API key validity and working status
   - Clear error messages with troubleshooting guidance

### Data Enrichment Process

**How Claude AI Enrichment Works:**

1. **Description Generation** ([ai-functions.js:381-436](ai-functions.js#L381-L436)):
   - Analyzes: app name, category, subject, website
   - Generates factual, non-promotional 1-2 sentence descriptions
   - Tailored for international school educators
   - Uses Claude Sonnet 4.5 model with 150 max tokens

2. **Full Data Enrichment** ([ai-functions.js:480-592](ai-functions.js#L480-L592)):
   - Returns structured JSON with all missing fields
   - Category selection from predefined list (Learning Management, Content Creation, etc.)
   - Audience from: Teachers, Students, Staff, Parents
   - Grade levels based on division context (K-5, 6-8, 9-12, K-12)
   - Uses Claude Sonnet 4.5 model with 300 max tokens for richer data

**Best Practices:**
- Run "Find Missing Fields" first to identify scope
- Use "Enrich Missing Descriptions" for quick description fixes
- Use "Refresh All Missing Data" for comprehensive cleanup
- Monitor Apps Script execution logs for API errors: `npm run logs`
- Enrichment limits prevent quota exhaustion (10-15 apps per run)
- Re-run as needed for large datasets

**Requirements:**
- `CLAUDE_API_KEY` must be set in Script Properties
- Sheet must have proper column headers (case-sensitive)
- Only processes apps where `Active` = TRUE

**Error Handling:**
- API errors logged to Apps Script Logger
- Failed enrichments skip to next app
- Immediate flush to sheet after each successful enrichment
- User-friendly error alerts in Google Sheets UI

**For complete data management workflow and troubleshooting, see [DATA_MANAGEMENT.md](DATA_MANAGEMENT.md).**

### Automatic Logging System

The dashboard includes automatic logging for audit trails and analytics.

**Update Logs Sheet** ([data-management.js:553-600](data-management.js#L553-L600)):
- Auto-created when first enrichment operation runs
- Tracks: Timestamp, Operation, App Name, Row, Field, Old Value, New Value
- Provides complete audit trail of all data changes
- Silent failure to prevent disrupting enrichment operations

**AI Chat Analytics Sheet** ([ai-functions.js:799-838](ai-functions.js#L799-L838)):
- Auto-created when first AI query is processed
- Logs: Timestamp, User Query, Apps Recommended, Response Length, Query Type
- Auto-categorizes queries: General, Recommendation Request, Grade-Specific, Subject-Specific
- Enables pattern analysis to identify missing apps

**App Name Extraction** ([ai-functions.js:843-852](ai-functions.js#L843-L852)):
- Extracts app names from AI responses using markdown pattern matching
- Identifies apps mentioned in bold (**App Name**)
- Returns comma-separated list of up to 5 apps or count if more
- Used for "Apps Recommended" field in analytics

**Integration Points:**
- `logDataUpdate()` called in `enrichMissingDescriptions()` at line 835
- `logDataUpdate()` called in `enrichAllMissingData()` at lines 921, 925, 929, 933
- `logAIQuery()` called in `queryGeminiAPI()` at line 196
- `logAIQuery()` called in `queryClaudeAPI()` at line 270

**Usage:**
- Logging happens automatically - no user action required
- View logs by opening "Update Logs" or "AI Chat Analytics" sheets
- Run "Analyze AI Chat Patterns" from menu for insights
- Use logs to track changes, identify trends, and discover missing apps

---

## 📺 Digital Signage Display

### Overview
The **Digital Signage** feature provides a full-screen, auto-advancing slideshow designed for display on digital signage boards throughout the school.

**Access:** Add `?page=signage` to your web app URL
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?page=signage
```

### Key Features
- **Auto-advancing slideshow** - 12-second intervals between slides
- **Multiple slide types** - Welcome, Stats, Enterprise Apps, What's New, Spotlights, Division Apps
- **Auto-refresh** - Fetches fresh data every 5 minutes
- **SAS branded** - Uses official colors, fonts, and styling
- **Full-screen optimized** - Designed for visibility from a distance
- **Smooth animations** - Professional transitions and visual effects

### Slide Types
1. **Welcome Slide** - SAS branding and introduction
2. **Stats Overview** - Key metrics with visual stat cards
3. **Enterprise Apps** - Premium gold-styled core tools showcase
4. **What's New** - Recently added apps (last 30 days) with red theme
5. **App Spotlights** - Featured apps with detailed information
6. **Division Apps** - Elementary, Middle, and High School app showcases

### Configuration
Edit settings in [signage.html](signage.html) around line 500:
```javascript
// Location: signage.html in <script> section
const SLIDE_DURATION = 12000;           // Duration per slide in milliseconds (default: 12 seconds)
const REFRESH_INTERVAL = 300000;        // Data refresh interval in milliseconds (default: 5 minutes)
const NEW_APP_THRESHOLD_DAYS = 30;      // Days to consider app "new" (default: 30 days)
const MAX_APPS_PER_SLIDE = 6;           // Maximum number of apps per slide (default: 6)
```

**Customization Tips:**
- Increase `SLIDE_DURATION` for slower pace (e.g., 15000 = 15 seconds)
- Decrease `REFRESH_INTERVAL` for more frequent updates (warning: uses quota)
- Adjust `MAX_APPS_PER_SLIDE` based on screen size (4-8 recommended)

### Use Cases
- **Main entrance** - Welcome visitors and showcase tools
- **Library** - Highlight educational resources
- **Teacher lounges** - Keep staff informed
- **Cafeteria** - Engage students during breaks
- **Division offices** - Show division-specific apps

**See [SIGNAGE.md](SIGNAGE.md) for complete documentation, setup instructions, and customization options.**

---

## 📋 Phase 5: Future Features
See [UPCOMING_FEATURES.md](UPCOMING_FEATURES.md) for planned advanced features:
- User favorites/bookmarks (with AI-suggested collections)
- Ratings and reviews
- Usage analytics
- Dark mode
- Mobile PWA
- Conversation history persistence
- Multi-language AI support
- Google Workspace SSO integration

---

**Key Development Principles:**
1. Test locally with `index.html` before deploying
2. All business logic changes should update division/department categorization rules
3. Never hardcode configuration - always use Script Properties (including API keys)
4. Google Sheets column names are case-sensitive and must match exactly
5. Always provide clickable file references using `[filename:line](path#Lline)` format
6. **AI Provider Usage:**
   - Gemini: User-facing recommendations (requires `GEMINI_API_KEY`)
   - Claude: Admin data enrichment and validation (requires `CLAUDE_API_KEY`)
7. Data management operations should ONLY use Claude API to prevent accidental user-triggered writes