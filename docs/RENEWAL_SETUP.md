# App Renewal Process - Vercel Setup

This document explains how the App Renewal Process page works with Vercel Edge Config.

## Architecture

```
User → renewal.html → /api/renewal-data → Edge Config → Cached Data
                            ↑
                    Hourly Cron Job
                            ↑
              /api/refresh-renewal-data → Apps Script → Google Sheets
```

**Key Benefits:**
- **Fast Loading**: Data served from Edge Config (global CDN)
- **Reduced Load**: Apps Script only called hourly instead of per-request
- **High Availability**: Edge Config provides 99.99% uptime
- **Automatic Refresh**: Vercel Cron updates data every hour

## Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

### Required for Renewal Page

| Variable | Description | Example |
|----------|-------------|---------|
| `APPS_SCRIPT_URL` | Your Apps Script web app URL | `https://script.google.com/macros/s/ABC.../exec` |
| `FRONTEND_KEY` | Authentication key for Apps Script | `your-secret-key-here` |
| `EDGE_CONFIG` | Vercel Edge Config connection string | Auto-set when you create Edge Config |
| `EDGE_CONFIG_ID` | Edge Config ID for API updates | `ecfg_abc123...` |
| `VERCEL_TOKEN` | Vercel API token for Edge Config updates | Create in Account Settings → Tokens |
| `CRON_SECRET` | Secret for protecting refresh endpoint | Generate with `openssl rand -base64 32` |

### How to Set Up

#### 1. Create Edge Config

```bash
# In Vercel dashboard or CLI
vercel link
vercel edge-config create digital-toolkit
```

This auto-creates the `EDGE_CONFIG` environment variable.

#### 2. Get Edge Config ID

In Vercel Dashboard:
1. Go to Storage → Edge Config → digital-toolkit
2. Copy the Edge Config ID (starts with `ecfg_`)
3. Add as `EDGE_CONFIG_ID` environment variable

#### 3. Create Vercel API Token

1. Go to https://vercel.com/account/tokens
2. Create new token with scope: "Read and Write"
3. Copy token and add as `VERCEL_TOKEN` environment variable

#### 4. Generate Cron Secret

```bash
openssl rand -base64 32
```

Add the output as `CRON_SECRET` environment variable.

#### 5. Set Apps Script Variables

Copy from your existing Apps Script deployment:
- `APPS_SCRIPT_URL`: Your web app URL
- `FRONTEND_KEY`: Same key used in main dashboard

## API Endpoints

### GET /api/renewal-data

Fetches renewal data from Edge Config.

**Response:**
```json
{
  "wholeSchool": { "apps": [...] },
  "elementary": { "apps": [...] },
  "middleSchool": { "apps": [...] },
  "highSchool": { "apps": [...] },
  "stats": { "totalApps": 123 }
}
```

**Cache:** 1 hour (3600s) with stale-while-revalidate

### POST /api/refresh-renewal-data

Refreshes Edge Config from Apps Script. Protected by `CRON_SECRET`.

**Manual Trigger:**
```bash
curl -X POST https://your-domain.vercel.app/api/refresh-renewal-data \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Response:**
```json
{
  "success": true,
  "message": "Renewal data refreshed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "appsCount": 123
}
```

**Automatic Trigger:**
- Vercel Cron calls this endpoint every hour (on the hour)
- Configured in `vercel.json` under `crons` section

## Vercel Cron Configuration

In [vercel.json](vercel.json):

```json
{
  "crons": [
    {
      "path": "/api/refresh-renewal-data",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Schedule Format:** Cron expression (minute hour day month weekday)
- `0 * * * *` = Every hour at minute 0 (e.g., 1:00, 2:00, 3:00...)
- Available on Pro plans and above

## Apps Script Setup

Your Apps Script project needs a `getRenewalData()` function:

```javascript
function doGet(e) {
  const action = e.parameter.action;
  const key = e.parameter.key;

  // Verify frontend key
  const validKey = PropertiesService.getScriptProperties().getProperty('FRONTEND_KEY');
  if (key !== validKey) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getRenewalData') {
    return getRenewalData();
  }

  // ... other actions
}

function getRenewalData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    // Process data into renewal format
    const renewalData = processRenewalData(data);

    return ContentService.createTextOutput(JSON.stringify(renewalData))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Deployment

### Deploy to Vercel

```bash
cd vercel
vercel --prod
```

### Access Renewal Page

```
https://your-domain.vercel.app/renewal
```

The `/renewal` URL rewrites to `/renewal.html` (configured in `vercel.json`).

## Testing

### Test Edge Config API

```bash
curl https://your-domain.vercel.app/api/renewal-data
```

### Test Data Refresh (Manual)

```bash
curl -X POST https://your-domain.vercel.app/api/refresh-renewal-data \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Local Testing

```bash
# Install dependencies
npm install

# Pull environment variables
vercel env pull

# Run locally
vercel dev
```

Open http://localhost:3000/renewal

## Monitoring

### Check Cron Logs

Vercel Dashboard → Project → Deployments → Functions

Filter by `/api/refresh-renewal-data` to see hourly execution logs.

### Check Edge Config Data

```bash
# Using Vercel CLI
vercel edge-config list digital-toolkit
vercel edge-config get digital-toolkit renewal_data
```

### Check Last Updated Timestamp

```bash
curl https://your-domain.vercel.app/api/renewal-data | jq '.last_updated'
```

## Troubleshooting

### "No renewal data found in Edge Config"

**Solution:** Manually trigger refresh:
```bash
curl -X POST https://your-domain.vercel.app/api/refresh-renewal-data \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### "CRON_SECRET not configured"

**Solution:** Set `CRON_SECRET` environment variable in Vercel dashboard.

### "Apps Script returned 401"

**Solution:** Verify `FRONTEND_KEY` matches Apps Script property.

### Cron Not Running

**Solution:**
1. Verify you're on Vercel Pro plan (Cron requires Pro)
2. Check `vercel.json` is deployed with the project
3. View Cron logs in Vercel dashboard

## Cost Considerations

- **Edge Config**: Free for first 100K reads/month, then $0.50 per million
- **Vercel Cron**: Included in Pro plan ($20/month)
- **Typical Usage**: ~720 cron runs/month + ~10K reads = FREE (within limits)

## Security

- **Password Protection**: Renewal page requires password authentication
- **Cron Protection**: Refresh endpoint secured with `CRON_SECRET`
- **Apps Script Protection**: Frontend key validation prevents unauthorized access
- **Edge Config**: Read-only from frontend, writes only via authenticated API

## Next Steps

1. Set up all environment variables
2. Deploy to Vercel: `vercel --prod`
3. Manually trigger first refresh to populate Edge Config
4. Test renewal page: https://your-domain.vercel.app/renewal
5. Monitor cron logs to verify hourly updates
