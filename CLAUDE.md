# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Project Overview

The **SAS Digital Toolkit Dashboard** is a Google Apps Script web application that displays educational applications for Singapore American School. Apps are categorized by school divisions with smart filtering and department grouping.

### Core Components

- **[Code.js](Code.js)**: Google Apps Script backend (reads from Google Sheets, processes data)
- **[index.html](index.html)**: Single-page frontend with embedded CSS/JS
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
- **Frontend only**: Open `index.html` locally (uses mock data)
- **Full integration**: Deploy to Apps Script and test with real Google Sheets

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

## 📋 Phase 4: Future Features
See [UPCOMING_FEATURES.md](UPCOMING_FEATURES.md) for planned advanced features:
- User favorites/bookmarks
- Ratings and reviews
- Usage analytics
- Dark mode
- Mobile PWA
- Advanced search
- Google Workspace SSO integration

---

**Key Development Principles:**
1. Test locally with `index.html` before deploying
2. All business logic changes should update division/department categorization rules
3. Never hardcode configuration - always use Script Properties
4. Google Sheets column names are case-sensitive and must match exactly
5. Always provide clickable file references using `[filename:line](path#Lline)` format