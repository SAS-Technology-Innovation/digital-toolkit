# CLAUDE.md

This file provides comprehensive guidance to Claude AI when working with the SAS Digital Toolkit Dashboard codebase.

## 🎯 Project Overview

The **SAS Digital Toolkit Dashboard** is a Google Apps Script web application that displays educational applications for Singapore American School. The system provides a clean, organized view of apps categorized by school divisions with smart filtering and department grouping.

### Core Components

- **`Code.js`**: Google Apps Script backend that reads from Google Sheets and processes data
- **`index.html`**: Single-page frontend with embedded CSS/JavaScript for the dashboard UI
- **`appsscript.json`**: Google Apps Script configuration and permissions
- **`package.json`**: npm scripts for clasp-based deployment workflow

## 🏗️ Architecture & Data Flow

### System Architecture
```
Google Sheets (Data Source)
    ↓
Google Apps Script Backend (Code.js)
    ↓ (JSON API)
Frontend Dashboard (index.html)
    ↓
User Interface (Responsive Web App)
```

### Data Processing Pipeline

1. **Data Ingestion**: `getDashboardData()` reads from Google Sheets
2. **Division Categorization**: Apps sorted into Whole School, Elementary, Middle, High
3. **License Filtering**: Separation of "everyone" vs "department-specific" apps
4. **Department Grouping**: Valid departments grouped with app counts
5. **JSON Response**: Structured data sent to frontend for rendering

### Business Logic Rules

**Division Assignment:**
- **Whole School Apps**: 
  - Multiple divisions listed (ES + MS + HS)
  - "School Operations" or "school-wide" department
  - Site/School/Enterprise/Unlimited licenses
  - Apps with "school-wide" in division field
- **Division-Specific Apps**: Apps listed for single division only

**License Categorization:**
- **"Apps Everyone Can Use"**: Site, School, Enterprise, Unlimited licenses + school-wide department
- **"Department Apps"**: Individual and other license types grouped by department

**Department Filtering:**
- Excludes division names (Elementary, Middle, High School, etc.)
- Filters out "N/A", empty, or placeholder departments
- Only shows valid department names with actual apps

## 💻 Technical Implementation

### Backend (Code.js)

**Key Functions:**
- `doGet()`: Serves HTML as Google Apps Script web app
- `getDashboardData()`: Main data processing function

**Data Processing Pattern:**
```javascript
// Modern JavaScript data processing
const allApps = values
  .map(row => convertToAppObject(row))
  .filter(app => app.Active === true)
  .map(app => cleanAppData(app));

// Division categorization with clear business rules
const isEffectivelyWholeSchool = 
  licenseType.includes('site') ||
  department === 'school operations' ||
  (divisionsPresent.es && divisionsPresent.ms && divisionsPresent.hs);
```

**Error Handling:**
- Try-catch wrapper for all Google Sheets operations
- Graceful fallback with error messages
- Detailed logging for debugging

### Frontend (index.html)

**Architecture Principles:**
- **No Build Process**: All dependencies via CDN
- **Embedded Styles**: CSS included in HTML for Apps Script compatibility
- **Progressive Enhancement**: Works without JavaScript for basic content
- **Responsive Design**: Mobile-first approach with Tailwind CSS

**Key Functions:**
- `renderDashboard(dataString)`: Main rendering orchestrator
- `createAppCard(app)`: Reusable app card component
- `createDepartmentCard(department, apps)`: Department container with apps
- `renderDivisionContent(divisionData, division)`: Tab content renderer

**Google Apps Script Integration:**
```javascript
// Always use google.script.run for data fetching
google.script.run
  .withSuccessHandler(renderDashboard)
  .withFailureHandler(showError)
  .getDashboardData();
```

## 🔧 Development Patterns

### Google Apps Script Specifics

**Environment Constraints:**
- No Node.js modules or npm packages
- All dependencies must be CDN-based
- V8 JavaScript runtime with some limitations
- HTML must be served via `HtmlService`

**Required Patterns:**
```javascript
// Backend function structure
function getDashboardData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    // Process data
    return JSON.stringify(result);
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return JSON.stringify({ error: error.message });
  }
}

// Frontend API call pattern
google.script.run
  .withSuccessHandler(successCallback)
  .withFailureHandler(errorCallback)
  .backendFunction();
```

### Data Structure Standards

**Expected Google Sheets Columns:**
- `Active`: Boolean (TRUE/FALSE)
- `Product`: String (App name)
- `Division`: String (Elementary, Middle, High, or combinations)
- `Department`: String (Actual department name)
- `Subject`: String (Subject area)
- `License Type`: String (Site, Individual, Enterprise, etc.)
- `Licenses`: Number (License count)
- `Category`: String (App category)
- `Website`: String (App URL)
- `Spend`: String/Number (Cost information)

**Output JSON Structure:**
```javascript
{
  wholeSchool: {
    apps: [...],           // All whole school apps
    everyoneApps: [...],   // Site/enterprise license apps
    byDepartment: {...}    // Department-grouped apps
  },
  elementary: { /* same structure */ },
  middleSchool: { /* same structure */ },
  highSchool: { /* same structure */ },
  stats: { /* app counts */ }
}
```

## 🚀 Development Workflow

### Local Development
```bash
# No build process required
open index.html  # Uses empty mock data for testing UI
```

### Deployment Process
```bash
npm run push     # Push code to Google Apps Script
npm run deploy   # Create new web app deployment
npm run logs     # View execution logs for debugging
```

### Testing Strategy
- **Frontend Testing**: Open `index.html` locally (uses mock data)
- **Backend Testing**: Deploy to Apps Script and test with real data
- **Integration Testing**: Full deployment with actual Google Sheets

## 🎨 UI/UX Guidelines

### Design System
- **Typography**: Poppins (body), Bebas Neue (headings)
- **Color Scheme**: Professional blue/gray palette
- **Spacing**: Tailwind CSS spacing scale
- **Icons**: Lucide icons for consistency

### Component Patterns
- **Cards**: Consistent app card design across all sections
- **Tags**: Color-coded tags for categories, subjects, licenses
- **Navigation**: Tab-based division navigation
- **Responsive**: Mobile-first responsive design

### Accessibility
- Semantic HTML structure
- Proper heading hierarchy
- Focus management for keyboard navigation
- Color contrast compliance

## ⚠️ Common Pitfalls & Solutions

### Google Apps Script Limitations
- **No ES6 Modules**: Use global functions and CDN imports
- **CORS Restrictions**: Use `google.script.run` for all backend calls
- **File Size Limits**: Keep HTML file under 100MB (rarely an issue)

### Data Processing Issues
- **Division String Variations**: Account for different division naming patterns
- **Empty/Invalid Departments**: Always filter out placeholder values
- **License Type Variations**: Use case-insensitive string matching

### Performance Considerations
- **Single Sheet Read**: Minimize SpreadsheetApp API calls
- **Client-Side Filtering**: Avoid complex filtering in frontend
- **Efficient Rendering**: Use document fragments for large lists

## 🔒 Security & Permissions

### Google Apps Script Security
- `@OnlyCurrentDoc` annotation for limited scope
- Domain-restricted web app access
- No external API calls without explicit permission

### Data Privacy
- No persistent data storage in Apps Script
- Direct read-only access to Google Sheets
- No user data collection or tracking

## 📚 Key Dependencies

### CDN Dependencies
- **Tailwind CSS**: `https://cdn.tailwindcss.com`
- **Lucide Icons**: `https://unpkg.com/lucide@latest/dist/umd/lucide.js`
- **Google Fonts**: Poppins and Bebas Neue

### Development Dependencies
- **@google/clasp**: Google Apps Script CLI tool
- **Node.js**: For running npm scripts

## 🐛 Debugging & Troubleshooting

### Common Issues
1. **"Script not found"**: Check `.clasp.json` scriptId
2. **Permission denied**: Verify Google Sheets access or run `npm run login`.
3. **Deployment fails**: Check for syntax errors in Apps Script editor
4. **Data not loading**: Verify `SPREADSHEET_ID` and `SHEET_NAME` in Script Properties.

### Debugging Tools
- `Logger.log()` for backend debugging
- `npm run logs` to view execution logs
- Browser DevTools for frontend debugging
- Apps Script editor for syntax checking

## 📝 Code Style Guidelines

### JavaScript
- Use modern ES6+ syntax where supported
- Consistent naming conventions (camelCase)
- Clear function documentation
- Error handling for all external API calls

### HTML/CSS
- Semantic HTML structure
- Tailwind CSS for styling
- Embedded CSS for Apps Script compatibility
- Mobile-first responsive design

---

**When modifying this codebase:**
1. Test locally first with `index.html`
2. Ensure Google Sheets compatibility
3. Maintain clean separation between backend logic and frontend presentation
4. Follow existing patterns for consistency
5. Document any business logic changes