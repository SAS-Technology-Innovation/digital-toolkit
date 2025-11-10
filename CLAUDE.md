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

Apps are categorized based on these business rules in [Code.js:91-126](Code.js#L91-L126):

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
function loadData() {
  if (typeof google !== 'undefined' && typeof google.script !== 'undefined') {
    // Production: Use google.script.run to get data from the server
    google.script.run
      .withSuccessHandler(renderDashboard)
      .withFailureHandler(showError)
      .getDashboardData();
  } else {
    // Local testing: Use mock data
    console.log('Running in local test mode with mock data');
    setTimeout(() => renderDashboard(JSON.stringify(getMockData())), 500);
  }
}
```

**Mock Data for Local Testing:**
- **index.html** [index.html:2490-2567](index.html#L2490-L2567): `getMockData()` function with 11 sample apps across all divisions
- **signage.html** [signage.html:1130-1166](signage.html#L1130-L1166): `getMockData()` function with simplified sample data
- Both mock data functions return the same structure as `getDashboardData()` backend function
- Local testing automatically works when opening HTML files directly in browser (outside Apps Script environment)

### Expected Google Sheets Structure
**Required columns in exact order** (case-sensitive):
1. `Active`: Boolean (TRUE/FALSE) - only TRUE apps processed
2. `product_name`: String - app name
3. `Division`: String - "Elementary", "Middle", "High", "Whole School", or combinations
4. `Department`: String - department name (filters out division names)
5. `subjects_or_department`: String - for tagging/categorization
6. `Enterprise`: Boolean (TRUE/FALSE) - **Enterprise checkbox (core SAS tools)**
7. `budget`: Number/String - budget information
8. `audience`: String - comma-separated: "Staff,Teachers,Students,Parents"
9. `License Type`: String - "Site", "Individual", "Enterprise", "School", etc.
10. `licence_count`: Number - number of licenses
11. `value`: Number/String - cost/spend information
12. `date_added`: Date - when app was added
13. `renewal_date`: Date - subscription renewal date
14. `Category`: String - for tagging
15. `Website`: String - app URL
16. `description`: String - 1-2 sentence app description
17. `grade_levels`: String - "K-5", "6-8", "9-12", "K-12", etc.
18. `support_email`: String - support contact email
19. `tutorial_link`: String - training/help URL
20. `mobile_app`: String - "Yes", "No", or "iOS/Android"
21. `sso_enabled`: Boolean (TRUE/FALSE) - single sign-on available
22. `logo_url`: String - app logo/icon URL

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
- **Frontend only**: Open `index.html` or `signage.html` locally in browser (automatically uses mock data)
  - Environment detection checks for `google.script` object
  - If not present, uses `getMockData()` function
  - Console will show: "Running in local test mode with mock data"
  - All UI features work (search, tabs, modals, cards, "What's New" section)
  - AI features disabled in local mode (requires backend API keys)
- **Full integration**: Deploy to Apps Script and test with real Google Sheets data

## 🔧 Configuration

### Script Properties Setup
Configuration is **NOT in code**. Set via Apps Script Editor:
1. Open project: `npm run open`
2. Go to **Project Settings (⚙️) > Script Properties**
3. Add properties:
   - `SPREADSHEET_ID`: Your Google Sheets ID
   - `SHEET_NAME`: Your sheet name

### GitHub Actions Deployment
Auto-deploys on push to `main`. Requires three repository secrets:

1. **`CLASP_CREDENTIALS`**: Run `npm run login`, then `cat ~/.config/clasp/.clasprc.json` and copy entire JSON
2. **`APPS_SCRIPT_ID`**: Find in Apps Script Editor → Project Settings → IDs
3. **`APPS_SCRIPT_DEPLOYMENT_ID`**: Find in Deploy → Manage deployments → Copy deployment ID

**Note**: `.clasp.json` is NOT in repo. Created locally via `npx @google/clasp clone` or dynamically in GitHub Actions.

## ⚠️ Common Issues

### Configuration Errors
- **"Configuration error: SPREADSHEET_ID not set"**: Set Script Properties (see above)
- **"Script not found"**: Check `.clasp.json` has correct scriptId (local) or `APPS_SCRIPT_ID` secret (GitHub Actions)
- **Permission denied**: Run `npm run login` and verify Google Sheets access

### Business Logic Issues
- **Apps in wrong division**: Check division string matching logic in [Code.js:85-99](Code.js#L85-L99)
- **Division names appearing as departments**: Verify department filtering array matches actual division names
- **Missing apps**: Ensure `Active` column is TRUE (case-insensitive)

### Deployment Issues
- **GitHub Actions "No credentials found"**: `CLASP_CREDENTIALS` secret must contain complete, valid JSON
- **OAuth scope error**: Ensure `appsscript.json` includes `spreadsheets.readonly` scope

## 🎨 UI Architecture & Key Patterns

### Three-Section Layout (per tab)

1. **Enterprise Apps** (Whole School only): Premium gold styling, "Official SAS Core Tools"
2. **Apps Everyone Can Use**: Blue/standard styling, site/school licenses
3. **Department Apps**: Grouped by department with icons and counts

### Critical Frontend Functions

- **`createAppCard(app)`** [index.html:1221-1281](index.html#L1221-L1281): Generates app cards with logos, badges, and data attributes
- **`renderDivisionContent(division, apps)`** [index.html:1320-1335](index.html#L1320-L1335): Renders division-specific content including "What's New"
- **`showAppDetails(app)`** [index.html:1403-1557](index.html#L1403-L1557): Modal popup for detailed app information
- **`setupSearch()`** [index.html:1404-1453](index.html#L1404-L1453): Real-time search across product, category, subject, department, audience
- **`isWithinDays(dateString, days)`** [index.html:1284-1295](index.html#L1284-L1295): Date helper for "NEW" badges (30-day threshold)
- **`getDepartmentIcon(department)`**: Auto-assigns icons based on department keywords (Technology→Monitor, Math→Calculator, etc.)

### App Request Process Section

A dedicated "Request a New App" section appears at the bottom of the Whole School tab [index.html:1840-1919](index.html#L1840-L1919):

**Layout:**
- Two-column responsive layout (content on left, flowchart image on right)
- Image sticky positioning for easy reference while scrolling
- Mobile-responsive: image appears above content on small screens

**Three-Step Process:**
1. **Search the Toolkit** - Ensure similar tool doesn't exist
2. **Consult Your Team** - Talk to department lead or PLC coach
3. **Submit App Request** - Formal request with required information

**Required Information (6 Questions):**
- Problem/opportunity being addressed
- Grade levels, subjects, and purpose
- Success measurement criteria
- Alternatives considered
- Training/support needs
- Cost, license count, and users

**Visual Aid:**
- Process flowchart image displayed on the right side
- Provides visual reference for the app request workflow
- Image source: Google Drive (converted to direct embed URL)

### SAS Branding

- **CSS Variables** [index.html:12-30](index.html#L12-L30): SAS Blue (#1a2d58), SAS Red (#a0192a), Eagle Yellow (#fabc00)
- **Division Colors**: Elementary (#228ec2), Middle (#a0192a), High (#1a2d58)
- **Typography**: Bebas Neue (headings), DM Sans (body text)
- **Customization**: To rebrand for another school, update CSS variables and font imports

## 🤖 AI-Powered Search (Gemini & Claude Integration)

The dashboard includes intelligent natural language search powered by Google's Gemini API or Anthropic's Claude API.

**Critical Implementation Details:**

- **Backend**: `queryAI(query, appsData, provider)` function in [Code.js:32-119](Code.js#L32-L119)
- **Frontend**: AI chat interface in [index.html:2134-2349](index.html#L2134-L2349)
- **Configuration**: Requires `GEMINI_API_KEY` or `CLAUDE_API_KEY` in Script Properties
- **Architecture**: User query + apps database → AI API → contextual recommendations

**Safety & Moderation Features:**
- Content moderation to reject harmful/inappropriate requests
- Closed system: AI can ONLY recommend apps from the database
- If app not found, AI provides alternatives + guides through App Request Process

**App Request Process (when app not in database):**
1. AI suggests similar alternatives from current toolkit
2. Guides user to talk to department lead or PLC coach
3. Provides complete app request checklist:
   - Problem/opportunity being addressed
   - Grade levels, subject areas, and purpose
   - Impact measurement criteria
   - Alternative tools considered
   - Training/support needs
   - Cost, license count, and user details

**Important Gotcha**: AI features will silently fail if neither `GEMINI_API_KEY` nor `CLAUDE_API_KEY` is set in Script Properties. Always verify this configuration when troubleshooting AI-related issues.

**See [AI_FEATURES.md](AI_FEATURES.md) for complete documentation.**

## 📺 Digital Signage Display

Full-screen slideshow display accessed via `?page=signage` URL parameter.

**Key Architecture:**

- **File**: [signage.html](signage.html) - Separate HTML file, shares backend with main dashboard
- **Configuration**:
  - `SLIDE_DURATION = 8000` (8 seconds per slide)
  - `REFRESH_INTERVAL = 300000` (5 minutes)
  - `NEW_APP_THRESHOLD_DAYS = 30`
  - `MAX_APPS_PER_SLIDE = 6`
- **Auto-refresh**: Fetches fresh data every 5 minutes via `getDashboardData()`
- **Slide Types**: Welcome, Stats, Enterprise Apps, What's New, Spotlights, Division Apps

**See [SIGNAGE.md](SIGNAGE.md) for setup and customization.**

---

**Key Development Principles:**
1. Test locally with `index.html` before deploying (uses automatic mock data detection)
2. All business logic changes should update division/department categorization rules
3. Never hardcode configuration - always use Script Properties (including API keys)
4. Google Sheets column names are case-sensitive and must match exactly
5. Mock data in `getMockData()` should mirror the structure returned by `getDashboardData()`
6. Always provide clickable file references using `[filename:line](path#Lline)` format
7. AI features require `GEMINI_API_KEY` or `CLAUDE_API_KEY` in Script Properties to function