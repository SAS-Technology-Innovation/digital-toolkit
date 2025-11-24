# AI Coding Instructions for SAS Digital Toolkit Dashboard

This is a **Google Apps Script web application** that provides a comprehensive dashboard for school application management at Singapore American School. Understanding the Google Apps Script environment and the specific business logic is crucial for effective development.

## 🎯 Project Architecture

### System Overview
**Single-Page Web App with Google Sheets Backend:**
- `Code.js`: Google Apps Script backend that processes Google Sheets data
- `index.html`: Frontend SPA with embedded CSS/JS (no build process)
- Data flow: Google Sheets → Apps Script → JSON → Frontend rendering
- Deployment: Google Apps Script Web App with domain restrictions

### Core Business Logic

**Division-Based Organization:**
- **Whole School**: Apps available to all divisions (Elementary + Middle + High)
- **Elementary**: Elementary-specific apps + whole school apps
- **Middle School**: Middle-specific apps + whole school apps
- **High School**: High-specific apps + whole school apps

**App Categorization Rules:**
```javascript
// Whole School Apps (appear in all division tabs):
const isEffectivelyWholeSchool =
  licenseType.includes('site') ||           // Site licenses
  licenseType.includes('school') ||         // School licenses
  licenseType.includes('enterprise') ||     // Enterprise licenses
  department === 'school operations' ||     // School Operations dept
  department === 'school-wide' ||           // School-wide dept
  division.includes('school-wide') ||       // School-wide division
  (hasElementary && hasMiddle && hasHigh);   // Multi-division apps
```

**License-Based Filtering (within each tab):**
- **"Apps Everyone Can Use"**: Site/School/Enterprise/Unlimited licenses + school-wide department
- **"Department Apps"**: Individual/other licenses grouped by actual departments

## 🔧 Technical Implementation

### Google Apps Script Specifics

**Backend Patterns:**
```javascript
// Required function structure
function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate()
    .setTitle('SAS Apps Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Data processing with error handling
function getDashboardData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    // Process and return JSON
    return JSON.stringify(result);
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return JSON.stringify({ error: error.message });
  }
}
```

**Frontend Integration:**
```javascript
// Always use google.script.run for backend calls
google.script.run
  .withSuccessHandler(renderDashboard)
  .withFailureHandler(showError)
  .getDashboardData();
```

### Data Structure Standards

**Expected Google Sheets Columns (all lowercase):**
- `active`: Boolean (TRUE/FALSE) - only TRUE apps are processed
- `product_name`: String - application name
- `division`: String - school divisions (SAS Elementary School, SAS Middle School, SAS High School, Whole School)
- `grade_levels`: String - individual grades (Pre-K, Kindergarten, Grade 1, Grade 2, etc.)
- `department`: String - actual department name (not division names)
- `subjects`: String - subject area for tagging
- `enterprise`: Boolean - official enterprise/core tool checkbox
- `budget`: String - budget source (Office Of Learning, IT Operations, etc.)
- `audience`: String - comma-separated (Teachers, Students, Parents, Staff)
- `license_type`: String - license type (Site Licence, Inidividual, Enterprise, School)
- `licence_count`: Number/String - number of licenses
- `value`: Number - annual cost
- `date_added`: Date - when app was added
- `renewal_date`: Date - subscription renewal
- `category`: String - application category
- `website`: String - application URL
- `description`: String - brief app description (1-2 sentences)
- `support_email`: String - support contact
- `tutorial_link`: String - training/help URL
- `mobile_app`: String - mobile availability (Yes/No/iOS/Android)
- `sso_enabled`: Boolean - SSO available
- `logo_url`: String - app logo image URL

**Note:** Column names changed from mixed-case to all lowercase. The `grade_levels` column now uses individual grades instead of ranges (e.g., "Pre-K, Kindergarten, Grade 1" not "K-5").

**Backend Output Structure:**
```javascript
{
  wholeSchool: {
    apps: [...],           // All whole school apps
    everyoneApps: [...],   // Apps everyone can use (site licenses)
    byDepartment: {...}    // Department-grouped individual apps
  },
  elementary: {            // Elementary-specific + whole school
    apps: [...],
    everyoneApps: [...],
    byDepartment: {...}
  },
  // ... same for middleSchool, highSchool
  stats: {
    totalApps: number,
    wholeSchoolCount: number,
    elementaryCount: number,
    middleSchoolCount: number,
    highSchoolCount: number
  }
}
```

## 🎨 Frontend Development

### Architecture Principles
- **No Build Process**: All dependencies via CDN
- **Embedded Styles**: All CSS embedded in HTML for Apps Script compatibility
- **Progressive Enhancement**: Works without complex JavaScript
- **Responsive Design**: Mobile-first with Tailwind CSS

### Key Components
```javascript
// Main rendering functions
function renderDashboard(dataString) { /* Orchestrates UI rendering */ }
function createAppCard(app) { /* Reusable app card component */ }
function createDepartmentCard(department, apps) { /* Department container */ }
function renderDivisionContent(divisionData, division) { /* Tab content */ }
```

### UI Patterns
- **Tab Navigation**: Division-based tabs (Whole School, Elementary, Middle, High)
- **Card Layout**: Consistent app cards with clickable titles
- **Tag System**: Color-coded tags for categories, subjects, license types
- **Department Grouping**: Collapsible department cards with app counts

## 🚀 Development Workflow

### Local Development
```bash
# No build tools required
open index.html  # Uses empty mock data for UI testing
```

### Deployment Commands
```bash
npm run login        # First time Google Apps Script login
npm run push         # Push code changes to Apps Script
npm run deploy       # Create new web app deployment
npm run logs         # View execution logs for debugging
npm run pull         # Pull latest from Apps Script cloud
```

### GitHub Actions Deployment
- **Auto-deploys**: On push to `main` branch
- **Required Secrets**: `CLASP_CREDENTIALS`, `APPS_SCRIPT_ID`, and `APPS_SCRIPT_DEPLOYMENT_ID`.
- **Manual Trigger**: Available via Actions tab

## ⚠️ Critical Implementation Details

### Department Filtering Logic
```javascript
// Filter out division names that appear in department column
const divisionNames = [
  'SAS Elementary School', 'SAS Early Learning Center',
  'SAS Middle School', 'SAS High School',
  'Elementary School', 'Early Learning Center',
  'Middle School', 'High School',
  'Elementary', 'Middle', 'High School'
];

// Only show valid departments
const isValidDepartment = !divisionNames.some(divName => 
  dept.toLowerCase().includes(divName.toLowerCase())
) && dept !== 'N/A' && dept.trim() !== '';
```

### Responsive Grid System
```css
/* Uses CSS Grid for fluid layouts */
.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.department-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}
```

### Error Handling Pattern
```javascript
// Backend error handling
try {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  // Operations
} catch (error) {
  Logger.log('Error in getDashboardData: ' + error.message);
  return JSON.stringify({ error: 'Failed to read data: ' + error.message });
}

// Frontend error handling
function showError(error) {
  document.getElementById('loading').style.display = 'none';
  const errorContainer = document.getElementById('error');
  errorContainer.style.display = 'block';
  errorContainer.innerHTML = `<p>Error: ${error.message}</p>`;
}
```

## 🔒 Security & Configuration

### Google Apps Script Configuration
```json
// appsscript.json
{
  "timeZone": "Asia/Singapore",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "DOMAIN"              // Domain-restricted access
  }
}
```

### Required Configuration Updates
```javascript
// Update these in Code.js before deployment
const SPREADSHEET_ID = 'your-google-sheets-id';
const SHEET_NAME = 'your-sheet-name';
```

## 📚 External Dependencies

### CDN Dependencies (No npm packages)
- **Tailwind CSS**: `https://cdn.tailwindcss.com`
- **Lucide Icons**: `https://unpkg.com/lucide@latest/dist/umd/lucide.js`
- **Google Fonts**: Poppins (body), Bebas Neue (headings)

### Development Tools
- **@google/clasp**: Google Apps Script CLI
- **Node.js**: For npm scripts only

## 🐛 Common Issues & Solutions

### Development Issues
1. **"Script not found"**: Check `.clasp.json` scriptId
2. **Permission denied**: Run `npm run login` and verify access
3. **Deployment fails**: Check Apps Script editor for syntax errors
4. **Data not loading**: Verify SPREADSHEET_ID and SHEET_NAME

### Business Logic Issues
1. **Apps in wrong divisions**: Check division string matching logic
2. **Division names as departments**: Verify department filtering array
3. **Missing apps**: Check Active column filtering (must be TRUE)
4. **Duplicate apps**: Ensure proper else-if logic in division assignment

### Performance Optimization
```javascript
// Efficient data processing patterns
const allApps = values
  .map(row => convertToObject(row))      // Single pass conversion
  .filter(app => app.Active === true)    // Early filtering
  .map(app => cleanData(app));           // Clean transformation

// Avoid multiple sheet reads
const values = sheet.getDataRange().getValues(); // Single API call
```

## 🎯 Key Conventions

### Naming Conventions
- **Functions**: camelCase (`getDashboardData`, `renderDivisionContent`)
- **Variables**: camelCase (`divisionData`, `everyoneApps`)
- **CSS Classes**: kebab-case (`app-card`, `department-header`)
- **IDs**: kebab-case with division prefix (`wholeSchool-content`)

### Code Organization
- **Backend**: All logic in `Code.js`, single file
- **Frontend**: All code embedded in `index.html`
- **No external files**: Everything self-contained for Apps Script

### Testing Strategy
- **Local UI**: Open `index.html` for interface testing
- **Backend Logic**: Deploy to Apps Script for data testing
- **Full Integration**: Test deployed web app with real data

---

## 📝 Development Guidelines

**When modifying this project:**

1. **Test Locally First**: Always test UI changes with `index.html`
2. **Maintain Data Structure**: Keep consistent JSON structure from backend
3. **Follow Business Rules**: Respect division/department categorization logic
4. **Use Modern JavaScript**: Leverage ES6+ features where supported
5. **Keep It Simple**: Avoid complex build processes or external dependencies
6. **Document Changes**: Update this file when business logic changes

**Remember**: This is a Google Apps Script environment, not Node.js. All dependencies must be CDN-based, and the runtime has specific limitations and capabilities.

## Architecture Overview

**Single-Page Web App with Google Sheets Backend:**
- `Code.js`: Google Apps Script backend that serves HTML and reads from Google Sheets
- `index.html`: Frontend SPA with embedded CSS/JS (no build process)
- Data flows: Google Sheets → Apps Script → JSON → Frontend rendering
- Environment detection: Code checks for `google.script` availability, falls back to mock data for local testing

## Key Development Patterns

**Google Apps Script Specifics:**
- Use `HtmlService.createTemplateFromFile('index')` to serve the HTML file
- All backend functions must be in `Code.js` with Google Apps Script syntax
- Frontend calls backend via `google.script.run.functionName()`
- No Node.js modules - pure JavaScript/HTML with CDN dependencies

**Data Processing Pattern:**
```javascript
// Apps Script reads from specific Google Sheets structure
const headers = values.shift(); // First row contains column headers (all lowercase)
// Expected headers: active, product_name, division, grade_levels, department, subjects, enterprise, budget, audience, license_type, licence_count, value, date_added, renewal_date, category, website, description, support_email, tutorial_link, mobile_app, sso_enabled, logo_url
```

**Division Categorization Logic:**
- Apps are categorized into: Whole School, Elementary, Middle School, High School
- Logic in `getDashboardData()` checks division strings and license types
- Site/School/Enterprise licenses appear in "Apps Everyone Can Use" sections

## Development Workflow

**Local Development:**
- Open `index.html` directly in browser (uses mock data)
- No build tools or dev server required
- Test with mock data structure matching real Google Sheets format

**Deployment Commands:**
```bash
npm run login        # First time setup
npm run push         # Deploy code changes
npm run deploy       # Create new deployment
npm run logs         # View execution logs
```

**GitHub Actions Deployment:**
- Auto-deploys on push to `main` branch
- Requires three secrets: `CLASP_CREDENTIALS`, `APPS_SCRIPT_ID`, and `APPS_SCRIPT_DEPLOYMENT_ID`.
- Common failure: "No credentials found" means secret is missing or malformed
- Solution: Run `npm run login` locally, then copy entire `.clasprc.json` to GitHub secret
- The `.clasp.json` file is generated dynamically in the workflow from the `APPS_SCRIPT_ID` secret.

**Configuration Requirements:**
- Update `SPREADSHEET_ID` and `SHEET_NAME` in `Code.js` before deployment
- Set `SPREADSHEET_ID` and `SHEET_NAME` in Script Properties before deployment
- Google Sheets must match expected column structure
- Apps Script project permissions must allow sheet access
- Required OAuth scope: `https://www.googleapis.com/auth/spreadsheets.readonly` in `appsscript.json`

## Critical Implementation Details

**Responsive Grid System:**
- Uses CSS Grid with `repeat(auto-fit, minmax())` for fluid layouts
- Two card sizes: larger "everyone apps" vs smaller "department apps"
- Division-specific color schemes applied via CSS classes

**Error Handling Pattern:**
```javascript
// Always wrap Google Sheets operations in try-catch
try {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  // ... sheet operations
} catch (e) {
  return JSON.stringify({ error: `Could not retrieve data...` });
}
```

**Environment Detection:**
```javascript
// Check for Apps Script environment
if (typeof google !== 'undefined' && typeof google.script !== 'undefined') {
  google.script.run.withSuccessHandler(renderDashboard).getDashboardData();
} else {
  renderDashboard(JSON.stringify(mockData)); // Local testing
}
```

## Unique Project Conventions

- **No package imports**: All dependencies via CDN (Tailwind, Lucide icons)
- **Embedded styling**: All CSS embedded in `index.html` for Apps Script compatibility  
- **Division-based filtering**: License types determine app visibility (site licenses = "everyone can use")
- **Singapore timezone**: All Apps Script operations in Asia/Singapore timezone
- **Domain-restricted deployment**: Web app access limited to SAS domain

## Integration Points

**Google Apps Script APIs:**
- `SpreadsheetApp.openById()` for sheet access
- `HtmlService` for web app deployment
- `Logger.log()` for debugging (view via `npm run logs`)

**External Dependencies:**
- Tailwind CSS via CDN for styling
- Lucide icons for UI elements
- Google Fonts (Bebas Neue, Poppins)

When modifying this project, always test locally first, ensure Google Sheets compatibility, and remember that Apps Script has different JavaScript capabilities than Node.js environments.