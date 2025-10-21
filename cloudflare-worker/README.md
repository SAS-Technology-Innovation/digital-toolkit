# SAS Digital Toolkit - Cloudflare Worker Deployment

This directory contains the Cloudflare Worker implementation of the SAS Digital Toolkit Dashboard, designed to be embedded as an iframe on other websites.

## Architecture Overview

```
┌─────────────────────┐
│  Google Sheets      │
│  (Data Source)      │
└──────────┬──────────┘
           │
           │ Export (manual/scheduled)
           ▼
┌─────────────────────┐
│  dashboard-data.json│
│  (Static JSON)      │
└──────────┬──────────┘
           │
           │ Bundled with
           ▼
┌─────────────────────┐
│ Cloudflare Worker  │
│  - Serves HTML     │
│  - Serves JSON API │
│  - CORS enabled    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Embedded iframe    │
│  (Your Website)     │
└─────────────────────┘
```

## What's Different from Google Apps Script?

### Old Architecture (Google Apps Script)
- ✅ Dynamic data (reads directly from Google Sheets)
- ✅ No separate deployment step for data updates
- ❌ Slower load times
- ❌ Dependent on Google Apps Script availability
- ❌ Limited customization for embedding

### New Architecture (Cloudflare Worker)
- ✅ Lightning-fast load times (global CDN)
- ✅ Optimized for embedding (no headers/footers)
- ✅ Better CORS and iframe support
- ✅ More control over caching and updates
- ✅ Lower costs at scale
- ❌ Requires manual data export/update process
- ❌ Data is static (not live from Google Sheets)

## Directory Structure

```
cloudflare-worker/
├── worker.js              # Main Cloudflare Worker script
├── embed.html             # Embed-optimized HTML dashboard
├── dashboard-data.json    # Static data exported from Google Sheets
├── wrangler.toml          # Cloudflare Worker configuration
├── package.json           # Node.js dependencies and scripts
└── README.md             # This file
```

## Prerequisites

1. **Node.js** (v16 or later)
2. **Cloudflare account** (free tier works fine)
3. **Wrangler CLI** (Cloudflare's deployment tool)

## Setup Instructions

### 1. Install Dependencies

```bash
cd cloudflare-worker
npm install
```

This will install Wrangler, the Cloudflare Workers CLI.

### 2. Login to Cloudflare

```bash
npx wrangler login
```

This will open your browser to authenticate with Cloudflare.

### 3. Configure Your Worker

Edit `wrangler.toml` and update:
- `name`: Your worker name (must be unique across Cloudflare)
- `account_id`: Your Cloudflare account ID (optional, but recommended)

To find your account ID:
1. Log in to the Cloudflare dashboard
2. Go to Workers & Pages
3. Your account ID is in the URL or sidebar

### 4. Export Data from Google Sheets

You have two options:

#### Option A: Manual Export (Recommended for first time)

1. Open your Google Apps Script project
2. Copy the `ExportToJSON.js` file content to your Apps Script editor
3. Run the `exportDashboardToJSON()` function
4. Copy the output from the Logs
5. Paste it into `dashboard-data.json`

OR download the file from Google Drive:
1. Run `exportDashboardToJSON()` in Apps Script
2. Check the Logs for the Google Drive file URL
3. Download the JSON file
4. Replace `dashboard-data.json` with the downloaded file

#### Option B: Automated Export (Advanced)

Set up a scheduled trigger in Google Apps Script:
1. Add this to your Apps Script project:

```javascript
function scheduledExport() {
  const jsonData = getDashboardData();
  const file = DriveApp.createFile('dashboard-data.json', jsonData, MimeType.JSON);

  // You could then:
  // - Email the file to yourself
  // - Upload to a webhook
  // - Store in a specific Drive folder
}
```

2. Set up a time-based trigger to run daily/weekly

### 5. Test Locally

Before deploying, test your worker locally:

```bash
npm run dev
```

This will start a local development server (usually at `http://localhost:8787`).

Visit these URLs to test:
- `http://localhost:8787/` - The embedded HTML
- `http://localhost:8787/api/data` - The JSON API
- `http://localhost:8787/health` - Health check

### 6. Deploy to Cloudflare

When you're ready to deploy:

```bash
npm run deploy
```

Wrangler will output your worker URL, something like:
```
https://sas-digital-toolkit.your-subdomain.workers.dev
```

## Embedding the Dashboard

### Basic Iframe Embed

```html
<iframe
  src="https://sas-digital-toolkit.your-subdomain.workers.dev"
  width="100%"
  height="800"
  style="border: none; border-radius: 8px;"
  title="SAS Digital Toolkit"
></iframe>
```

### Responsive Embed

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe
    src="https://sas-digital-toolkit.your-subdomain.workers.dev"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    title="SAS Digital Toolkit"
  ></iframe>
</div>
```

### JavaScript Embed

```html
<div id="toolkit-embed"></div>
<script>
  const embedContainer = document.getElementById('toolkit-embed');
  const iframe = document.createElement('iframe');
  iframe.src = 'https://sas-digital-toolkit.your-subdomain.workers.dev';
  iframe.width = '100%';
  iframe.height = '800';
  iframe.style.border = 'none';
  iframe.title = 'SAS Digital Toolkit';
  embedContainer.appendChild(iframe);
</script>
```

## Updating the Data

To update the dashboard with new data:

1. Export fresh data from Google Sheets (run `exportDashboardToJSON()`)
2. Update `dashboard-data.json` with the new data
3. Redeploy the worker: `npm run deploy`

The entire process takes less than 1 minute!

## API Endpoints

Your Cloudflare Worker exposes these endpoints:

| Endpoint | Description | Response Type |
|----------|-------------|---------------|
| `/` or `/embed` | Embedded HTML dashboard | HTML |
| `/api/data` | Dashboard data JSON | JSON |
| `/health` | Health check | JSON |

## Custom Domain (Optional)

To use your own domain:

1. Add your domain to Cloudflare (if not already added)
2. Update `wrangler.toml`:

```toml
[[routes]]
pattern = "toolkit.yourdomain.com/*"
zone_name = "yourdomain.com"
```

3. Deploy: `npm run deploy`
4. Cloudflare will automatically handle DNS and SSL

## Performance & Caching

The worker is configured with smart caching:
- HTML: Cached for 5 minutes
- JSON API: Cached for 1 hour
- Served from Cloudflare's global CDN (275+ locations)

## Monitoring & Logs

View your worker's logs in real-time:

```bash
npm run tail
```

Or view metrics in the Cloudflare dashboard:
1. Go to Workers & Pages
2. Select your worker
3. Click "Metrics" to see requests, errors, and performance

## Troubleshooting

### Issue: Worker not deploying

**Solution**: Make sure you're logged in to Wrangler:
```bash
npx wrangler whoami
npx wrangler login
```

### Issue: JSON data not loading

**Solution**: Check that `dashboard-data.json` is valid JSON:
```bash
cat dashboard-data.json | jq
```

### Issue: Iframe not loading

**Solution**: Check browser console for errors. Make sure the parent site allows iframes:
```javascript
// In parent site
console.log('Loading iframe from:', iframeUrl);
```

### Issue: CORS errors

**Solution**: The worker has CORS enabled by default. If you still see errors, check that the parent site is using HTTPS (not HTTP).

## Advanced: Using KV for Dynamic Updates

If you want to update data without redeploying:

1. Create a KV namespace:
```bash
npx wrangler kv:namespace create DASHBOARD_DATA
```

2. Update `wrangler.toml` with the namespace ID

3. Modify `worker.js` to read from KV:
```javascript
// In worker.js
const data = await env.DASHBOARD_DATA.get('dashboard-data', 'json');
```

4. Update data via API or Wrangler:
```bash
npx wrangler kv:key put --binding=DASHBOARD_DATA "dashboard-data" "$(cat dashboard-data.json)"
```

## Cost Estimate

Cloudflare Workers free tier includes:
- ✅ 100,000 requests per day
- ✅ Unlimited bandwidth
- ✅ Global CDN
- ✅ SSL/TLS included

For most school use cases, **the free tier is sufficient**!

Paid tier ($5/month) includes:
- 10 million requests per month
- Additional KV storage and operations

## Support

For issues or questions:
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Internal Support**: Contact Technology & Innovation team

## Migration Checklist

- [ ] Export data from Google Sheets
- [ ] Test worker locally (`npm run dev`)
- [ ] Deploy to Cloudflare (`npm run deploy`)
- [ ] Test the deployed URL
- [ ] Embed iframe on your website
- [ ] Set up data update process
- [ ] Monitor worker performance
- [ ] (Optional) Configure custom domain
- [ ] (Optional) Set up KV for dynamic updates

---

**Last Updated**: January 2025
**Maintained By**: SAS Technology & Innovation Team
