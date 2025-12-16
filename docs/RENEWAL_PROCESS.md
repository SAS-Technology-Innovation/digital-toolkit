# App Renewal Process - Current Implementation

## Overview

The App Renewal Process page provides administrators with a password-protected dashboard to review, compare, and manage app subscription renewals for Singapore American School.

**Live URL**: https://sas-digital-toolkit.vercel.app/renewal

## Current Architecture

```
User Browser
    ↓ (password authentication)
/renewal → renewal.html
    ↓ (two-stage data loading)
Stage 1: /api/renewal-data → Edge Config (minimal fields)
    ↓ (fast initial render - product, division, department, subjects)
Display UI with filters (instant)
    ↓ (background loading)
Stage 2: /api/renewal-details → Apps Script → Google Sheets
    ↓ (full details - costs, logos, descriptions, etc.)
Progressive enhancement with detailed data
    ↓ (user actions)
/api/save-renewal-action → Apps Script → Google Sheets "Renewal Actions"
```

**Performance Benefits:**

- Fast initial page load (~100-200ms from Edge Config)
- Immediate UI interaction (filters, search, navigation)
- Background loading of detailed data doesn't block user
- Graceful degradation if detailed data fails

## Implemented Features

### 1. Password Protection ✅

**Implementation**: [vercel/api/verify-password.js](../vercel/api/verify-password.js)

- Password gate on page load
- Uses `RENEWAL_PASSWORD` environment variable
- Stores authentication in session storage
- Clean SAS-branded login interface

**Code**: [renewal.html:1107-1247](../vercel/renewal.html#L1107-L1247)

### 2. Two-Stage Data Loading ✅

**Implementation**: Fast initial load from Edge Config, then progressive enhancement from Apps Script

#### Stage 1: Minimal Data (Edge Config)

- Endpoint: `/api/renewal-data` → Edge Config
- Returns minimal fields only: product, division, department, subjects
- Ultra-fast response (~100-200ms)
- Enables immediate filtering, search, and navigation
- Fallback to Apps Script if Edge Config empty

#### Stage 2: Detailed Data (Apps Script)

- Endpoint: `/api/renewal-details` → Apps Script → Google Sheets
- Returns full details: budget, spend, licenses, renewalDate, licenseType, logoUrl, description, etc.
- Loads in background after UI is interactive
- Merges into existing app data for progressive enhancement
- Graceful degradation if fails (continues with minimal data)

**Code**:

- [renewal.html:2151-2240](../vercel/renewal.html#L2151-L2240) - loadTwoStageData() and loadDetailedData()
- [api/renewal-data.js](../vercel/api/renewal-data.js) - Minimal data endpoint
- [api/renewal-details.js](../vercel/api/renewal-details.js) - Detailed data endpoint

### 3. Timeline View ✅

**Implementation**: Apps organized by renewal date

**Timeline Sections**:
- **Overdue**: Past renewal dates (red theme)
- **Urgent**: Next 30 days (orange theme)
- **Upcoming**: 31-90 days (yellow theme)
- **Future**: 91+ days (blue theme)
- **No Renewal Date**: Apps without renewal dates (gray theme)

**Visual Design**:
- Card-based grid layout
- Color-coded status badges
- Renewal date countdown
- Department and division tags

**Code**: [renewal.html:1629-1758](../vercel/renewal.html#L1629-L1758)

### 4. Advanced Filtering ✅

**Implementation**: Multi-dimensional filtering system

**Filter Types**:
- **Timeline**: All, None, Overdue, 30 days, 60 days, 90 days
- **Division**: All, Whole School, Elementary, Middle, High
- **Budget**: All, Office of Learning, IT Operations, Communications, Business Office
- **Sort**: Renewal Date, Name, Cost, Licenses

**Search**:
- Real-time search across: product, department, subjects, category, budget, audience
- Debounced input (300ms) for performance
- Highlights matching results

**Code**: [renewal.html:1757-1840](../vercel/renewal.html#L1757-L1840)

### 5. Renewal Action Persistence ✅

**Implementation**: Save renewal decisions to Google Sheets

**Actions**:
- **Renew**: Continue subscription
- **Modify**: Change license count or terms
- **Retire**: Cancel subscription

**Workflow**:
1. User clicks action button on app card
2. Modal prompts for optional notes
3. POST to `/api/save-renewal-action`
4. Saved to "Renewal Actions" sheet with timestamp

**Google Sheets Structure**:
- Sheet Name: `Renewal Actions`
- Columns: `timestamp`, `product_name`, `action`, `notes`
- Auto-created on first use
- SAS Blue header styling

**Code**:
- Frontend: [renewal.html:1817-1854](../vercel/renewal.html#L1817-L1854)
- API: [vercel/api/save-renewal-action.js](../vercel/api/save-renewal-action.js)
- Apps Script: [appsscript/Code.js:351-404](../appsscript/Code.js#L351-L404)

### 6. App Details Modal ✅

**Implementation**: Click "Details" to view comprehensive app information

**Modal Content**:
- App name and logo
- Full description
- Division and department
- License information (type, count, cost)
- Renewal date and status
- Features (SSO, Mobile)
- Action buttons (Renew, Modify, Retire)
- External links (Website, Tutorial)

**UX**:
- Click outside or ESC to close
- Prevents body scroll when open
- Smooth fade-in animation

**Code**: [renewal.html:1857-1920](../vercel/renewal.html#L1857-L1920)

## API Endpoints

### GET /api/renewal-data

Returns minimal app data from Edge Config for fast initial load.

**Implementation**: [vercel/api/renewal-data.js](../vercel/api/renewal-data.js)

**Response Format**:
```json
{
  "wholeSchool": {
    "apps": [
      {
        "product": "Google Classroom",
        "division": "Whole School",
        "department": "IT Operations",
        "subjects": "All Subjects",
        "_detailsLoaded": false
      }
    ]
  },
  "elementary": {...},
  "middleSchool": {...},
  "highSchool": {...}
}
```

**Response Headers**:

- `X-Data-Source`: "edge-config" or "apps-script-fallback"
- `Cache-Control`: "public, s-maxage=3600, stale-while-revalidate=86400"

### POST /api/renewal-details

Returns detailed app information from Apps Script for specific apps.

**Implementation**: [vercel/api/renewal-details.js](../vercel/api/renewal-details.js)

**Request Body**:
```json
{
  "products": ["Google Classroom", "Canvas LMS", "Seesaw"]
}
```

**Response Format**:
```json
{
  "success": true,
  "count": 3,
  "apps": {
    "Google Classroom": {
      "product": "Google Classroom",
      "budget": "IT Operations",
      "spend": "$25,000",
      "licenses": "Site",
      "licenseType": "Site Licence",
      "renewalDate": "2025-06-30",
      "logoUrl": "https://...",
      "description": "Learning management system...",
      "website": "https://classroom.google.com",
      "tutorialLink": "https://...",
      "ssoEnabled": true,
      "mobileApp": "iOS/Android",
      "audience": "Teachers, Students",
      "category": "Learning Management",
      "_detailsLoaded": true
    }
  }
}
```

### GET /api/data

Returns all dashboard data from Apps Script (legacy endpoint, still used by main dashboard).

**Response Format**:
```json
{
  "wholeSchool": {
    "apps": [...],
    "enterpriseApps": [...],
    "everyoneApps": [...],
    "byDepartment": {...}
  },
  "elementary": {...},
  "middleSchool": {...},
  "highSchool": {...},
  "stats": {
    "totalApps": 123,
    "enterpriseCount": 15
  }
}
```

### POST /api/save-renewal-action

Saves renewal action to Google Sheets.

**Request Body**:
```json
{
  "product": "Google Classroom",
  "action": "renew",
  "notes": "Essential for all divisions"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Renewal action saved successfully",
  "data": {
    "timestamp": "2024-12-16T10:30:00.000Z",
    "product": "Google Classroom",
    "action": "renew",
    "notes": "Essential for all divisions"
  }
}
```

### POST /api/verify-password

Verifies renewal page password.

**Request Body**:
```json
{
  "password": "user-entered-password"
}
```

**Response**:
```json
{
  "valid": true
}
```

## Environment Variables

### Required (Currently Used)

| Variable | Location | Description |
|----------|----------|-------------|
| `APPS_SCRIPT_URL` | Vercel | Apps Script web app URL |
| `FRONTEND_KEY` | Vercel + Apps Script | Authentication key |
| `RENEWAL_PASSWORD` | Vercel + Apps Script | Renewal page password |

### Optional (For Future Enhancements)

| Variable | Purpose |
|----------|---------|
| `EDGE_CONFIG` | Edge Config connection string |
| `EDGE_CONFIG_ID` | Edge Config ID for API updates |
| `VERCEL_TOKEN` | Vercel API token for Edge Config writes |
| `CRON_SECRET` | Protection for refresh endpoint |

## Apps Script Setup

The Apps Script backend must have these functions:

### 1. getDashboardData()

Returns all apps data for the dashboard.

**Already Implemented**: [appsscript/Code.js:406-624](../appsscript/Code.js#L406-L624)

### 2. saveRenewalAction(product, action, notes)

Saves renewal actions to "Renewal Actions" sheet.

**Already Implemented**: [appsscript/Code.js:351-404](../appsscript/Code.js#L351-L404)

### 3. verifyRenewalPassword(password)

Verifies renewal page password.

**Already Implemented**: [appsscript/Code.js:319-334](../appsscript/Code.js#L319-L334)

## User Workflow

1. **Access Page**: Navigate to `/renewal`
2. **Enter Password**: Authenticate with `RENEWAL_PASSWORD`
3. **View Timeline**: See apps organized by renewal urgency
4. **Filter & Search**: Narrow down to specific apps
5. **Review Apps**: Click details to see full information
6. **Take Action**: Click Renew/Modify/Retire
7. **Add Notes**: Enter optional context for decision
8. **Confirm**: Action saved to Google Sheets

## Data Security

- **Password Protection**: Only authorized staff can access
- **API Authentication**: `FRONTEND_KEY` validates all requests
- **HTTPS Only**: All traffic encrypted
- **Session Storage**: Password stored in browser session (cleared on close)
- **Audit Trail**: All actions logged with timestamp to Google Sheets

## Current Limitations

1. **No Edge Config Caching**: Data fetched fresh on every page load
2. **No Bulk Actions**: Must process apps one at a time
3. **No Export**: Cannot export renewal decisions to CSV/PDF
4. **No Comparison Mode**: Cannot compare apps side-by-side
5. **No AI Recommendations**: Manual review only

**See [RENEWAL_ENHANCEMENTS.md](RENEWAL_ENHANCEMENTS.md) for planned improvements.**

## Performance

**Two-Stage Loading Performance**:

- **Stage 1 (Edge Config)**: ~100-200ms - Ultra-fast minimal data load
- **UI Interactive**: Immediate after Stage 1 - Filters, search, navigation ready
- **Stage 2 (Apps Script)**: ~1-2 seconds - Background loading of detailed data
- **Total Time to Interactive**: ~100-200ms (previously ~2-3 seconds)
- **Filtering**: Instant (client-side)
- **Search**: Instant (client-side with 300ms debounce)
- **Sorting**: Instant (client-side)
- **Action Save**: ~1-2 seconds (writes to Google Sheets)

**Performance Improvements**:

- 90% faster initial page load (100ms vs 2-3 seconds)
- Non-blocking detailed data loading
- Graceful degradation if detailed data fails
- Reduced Edge Config payload (minimal fields only)

## Deployment

### Deploy to Vercel

```bash
# From project root
vercel --prod
```

### Deploy Apps Script

```bash
# From project root
cd appsscript
npx @google/clasp push --force
```

Or via GitHub Actions (automatically on merge to `main`).

## Monitoring

### Check Renewal Actions Sheet

Open your Google Sheet → "Renewal Actions" tab to see all saved decisions.

### Vercel Logs

```bash
vercel logs --prod
```

Filter by `/api/save-renewal-action` to see action saves.

## Troubleshooting

### Password Not Working

**Solution**: Verify `RENEWAL_PASSWORD` is set correctly in both:
- Vercel environment variables
- Apps Script Script Properties

### Actions Not Saving

**Solution**: Check Apps Script logs for errors:
```bash
npm run logs
```

### Data Not Loading

**Solution**:
1. Check `APPS_SCRIPT_URL` is correct
2. Verify `FRONTEND_KEY` matches in Vercel and Apps Script
3. Check Apps Script deployment is public ("Anyone" access)

## Next Steps

See [RENEWAL_SETUP.md](RENEWAL_SETUP.md) for Edge Config optimization (future enhancement).

See [RENEWAL_ENHANCEMENTS.md](RENEWAL_ENHANCEMENTS.md) for planned features:
- Table view with sortable columns
- Comparison mode for side-by-side analysis
- AI-powered budget optimization
- Bulk actions
- Export to CSV/PDF

---

**Status**: ✅ Fully Implemented and Deployed

**Last Updated**: December 16, 2024
