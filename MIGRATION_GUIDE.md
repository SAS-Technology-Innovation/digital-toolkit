# Migration Guide: Google Apps Script → Cloudflare Worker + JSON

This guide explains how to migrate the SAS Digital Toolkit Dashboard from Google Apps Script to a Cloudflare Worker with static JSON data.

## Why Migrate?

### Benefits of the New Architecture

1. **Faster Performance**: Cloudflare's global CDN serves content from 275+ locations worldwide
2. **Better Embedding**: Purpose-built for iframe embedding with proper CORS and CSP headers
3. **Lower Costs**: Free tier covers most use cases (100K requests/day)
4. **More Control**: Customize caching, headers, and deployment process
5. **Optimized UI**: Removed unnecessary headers/footers for cleaner embedding

### Trade-offs

1. **Static Data**: Data is no longer live from Google Sheets (requires manual export)
2. **Deployment Step**: Need to redeploy when data changes
3. **Technical Setup**: Requires Node.js and Wrangler CLI

## Migration Process Overview

```
┌─────────────────────────────────────────────────┐
│ Phase 1: Export Data from Google Sheets        │
│ - Run exportDashboardToJSON() function         │
│ - Download JSON file from Google Drive         │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ Phase 2: Set Up Cloudflare Worker              │
│ - Install Node.js and Wrangler                  │
│ - Configure wrangler.toml                       │
│ - Place JSON data in cloudflare-worker/        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ Phase 3: Test Locally                          │
│ - Run npm run dev                               │
│ - Verify HTML and API endpoints                │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ Phase 4: Deploy to Cloudflare                  │
│ - Run npm run deploy                            │
│ - Get your worker URL                           │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ Phase 5: Embed on Your Website                 │
│ - Add iframe with worker URL                    │
│ - Test embedding on target site                │
└─────────────────────────────────────────────────┘
```

## Phase 1: Export Data from Google Sheets

### Step 1.1: Add Export Function to Google Apps Script

1. Open your Google Apps Script project
2. Create a new file called `ExportToJSON.gs`
3. Copy the content from `ExportToJSON.js` in this repository
4. Save the file

### Step 1.2: Run the Export

1. In the Apps Script editor, select the `exportDashboardToJSON` function
2. Click the Run button (▶️)
3. Grant necessary permissions when prompted
4. Wait for execution to complete

### Step 1.3: Get the JSON Data

**Method A: From Logs**
1. Click "View" → "Logs"
2. Copy the JSON data between the markers
3. Save to a file called `dashboard-data.json`

**Method B: From Google Drive**
1. Check the Logs for the Google Drive URL
2. Click the URL to open the file
3. Download the JSON file
4. Rename it to `dashboard-data.json`

### Step 1.4: Validate the JSON

```bash
# On Mac/Linux
cat dashboard-data.json | python -m json.tool

# Or use an online validator
# https://jsonlint.com/
```

## Phase 2: Set Up Cloudflare Worker

### Step 2.1: Install Prerequisites

1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/
   - Recommended: LTS version (v20 or later)

2. **Verify Installation**
   ```bash
   node --version  # Should show v20.x.x or later
   npm --version   # Should show 10.x.x or later
   ```

### Step 2.2: Install Dependencies

```bash
cd cloudflare-worker
npm install
```

### Step 2.3: Login to Cloudflare

```bash
npx wrangler login
```

This opens your browser to authenticate. If you don't have a Cloudflare account:
1. Go to https://dash.cloudflare.com/sign-up
2. Create a free account
3. Return to the terminal and run `npx wrangler login` again

### Step 2.4: Configure Your Worker

Edit `cloudflare-worker/wrangler.toml`:

```toml
name = "sas-digital-toolkit"  # Change this to your preferred name
```

Optional: Add your account ID:
1. Find it in the Cloudflare dashboard URL or sidebar
2. Add to `wrangler.toml`:
   ```toml
   account_id = "your-account-id-here"
   ```

### Step 2.5: Add Your Data

Place your `dashboard-data.json` file in the `cloudflare-worker/` directory:

```bash
cp dashboard-data.json cloudflare-worker/
```

## Phase 3: Test Locally

### Step 3.1: Start Dev Server

```bash
cd cloudflare-worker
npm run dev
```

You should see:
```
⛅️ wrangler 3.x.x
------------------
⎔ Starting local server...
⎔ Listening on http://localhost:8787
```

### Step 3.2: Test Endpoints

Open these URLs in your browser:

1. **Dashboard HTML**: http://localhost:8787/
   - Should show the full dashboard
   - Verify all tabs work
   - Check that apps are loading

2. **JSON API**: http://localhost:8787/api/data
   - Should return JSON data
   - Verify structure matches expected format

3. **Health Check**: http://localhost:8787/health
   - Should return: `{"status":"ok","timestamp":"...","version":"1.0.0"}`

### Step 3.3: Test Embedding

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Embed Test</title>
</head>
<body>
  <h1>Testing SAS Digital Toolkit Embed</h1>
  <iframe
    src="http://localhost:8787"
    width="100%"
    height="800"
    style="border: 1px solid #ccc;"
  ></iframe>
</body>
</html>
```

Open this file in your browser to test the iframe embedding.

## Phase 4: Deploy to Cloudflare

### Step 4.1: Deploy

```bash
npm run deploy
```

### Step 4.2: Get Your Worker URL

After deployment, you'll see:

```
✨ Successfully published your Worker to:
   https://sas-digital-toolkit.your-subdomain.workers.dev
```

Copy this URL - you'll need it for embedding!

### Step 4.3: Test Production Deployment

Visit your worker URL and test all endpoints:
- `https://your-worker.workers.dev/` - Dashboard
- `https://your-worker.workers.dev/api/data` - JSON
- `https://your-worker.workers.dev/health` - Health check

## Phase 5: Embed on Your Website

### Step 5.1: Basic Embed Code

Add this to your website where you want the dashboard to appear:

```html
<iframe
  src="https://your-worker-url.workers.dev"
  width="100%"
  height="800"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
  title="SAS Digital Toolkit"
  loading="lazy"
></iframe>
```

### Step 5.2: Responsive Embed (Recommended)

For better mobile support:

```html
<!-- Responsive 16:9 container -->
<div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe
    src="https://your-worker-url.workers.dev"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    title="SAS Digital Toolkit"
    loading="lazy"
  ></iframe>
</div>
```

### Step 5.3: Test the Embed

1. Visit your website with the embedded iframe
2. Verify the dashboard loads correctly
3. Test all tabs and interactions
4. Check on mobile devices
5. Verify in different browsers (Chrome, Safari, Firefox)

## Updating Data After Migration

When you need to update the dashboard with new data:

### Option 1: Manual Update (Recommended for beginners)

1. Run `exportDashboardToJSON()` in Google Apps Script
2. Download the new JSON file
3. Replace `cloudflare-worker/dashboard-data.json`
4. Deploy: `npm run deploy`
5. Wait 5-10 minutes for cache to clear

### Option 2: Automated with GitHub Actions (Advanced)

Set up a GitHub Action to:
1. Fetch data from Google Sheets API
2. Update `dashboard-data.json`
3. Deploy to Cloudflare automatically

Example workflow coming soon!

### Option 3: Use Cloudflare KV (Advanced)

Store data in Cloudflare KV for updates without redeployment:
1. Create KV namespace: `npx wrangler kv:namespace create DASHBOARD_DATA`
2. Update worker to read from KV
3. Update data: `npx wrangler kv:key put ...`

See `cloudflare-worker/README.md` for details.

## Rollback Plan

If you need to revert to Google Apps Script:

1. **Keep the original Google Apps Script project** (don't delete it!)
2. The original `Code.js` and `index.html` files are still in the repository
3. To rollback:
   - Redeploy the Google Apps Script project
   - Update your website's iframe to point to the Apps Script URL
   - No data loss - everything is still in Google Sheets

## Parallel Running (Recommended)

You can run both versions simultaneously during migration:

1. Keep the Google Apps Script version running
2. Deploy the Cloudflare Worker version
3. Test the Cloudflare version on a staging site
4. Once confident, switch the production iframe URL
5. Monitor for any issues
6. Keep Apps Script version as backup for 30 days

## Comparison Table

| Feature | Google Apps Script | Cloudflare Worker |
|---------|-------------------|-------------------|
| **Load Time** | 2-4 seconds | < 500ms |
| **Cost** | Free (with limits) | Free (100K req/day) |
| **Data Updates** | Real-time | Manual export |
| **Embedding** | Good | Excellent |
| **Customization** | Limited | Full control |
| **Scalability** | Limited | Unlimited |
| **Setup Complexity** | Easy | Moderate |

## Common Issues & Solutions

### Issue: npm install fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install

# Or use a different package manager
npx pnpm install
```

### Issue: Wrangler login doesn't work

**Solution**:
```bash
# Try with a specific browser
BROWSER=chrome npx wrangler login

# Or use OAuth token
npx wrangler login --scopes-list
```

### Issue: Worker not updating after deploy

**Solution**:
```bash
# Wait 2-3 minutes for propagation
# Or purge cache
npx wrangler deploy --compatibility-date=2024-01-02

# Force update by changing compatibility date
```

### Issue: JSON data not showing in dashboard

**Solution**:
```bash
# Verify JSON is valid
cat dashboard-data.json | jq

# Check worker logs
npm run tail

# Test API endpoint directly
curl https://your-worker.workers.dev/api/data
```

## Getting Help

- **Cloudflare Workers Discord**: https://discord.gg/cloudflaredev
- **Cloudflare Community**: https://community.cloudflare.com/
- **Wrangler GitHub**: https://github.com/cloudflare/workers-sdk
- **Internal Support**: Contact Technology & Innovation team

## Next Steps

After successful migration:

1. ✅ Set up a regular data export schedule (weekly/monthly)
2. ✅ Document the update process for your team
3. ✅ Consider setting up automated deployments
4. ✅ Monitor worker analytics in Cloudflare dashboard
5. ✅ Consider custom domain for professional URL
6. ✅ Implement KV storage for dynamic updates (optional)

## Migration Checklist

### Pre-Migration
- [ ] Backup Google Apps Script project
- [ ] Export current data to JSON
- [ ] Install Node.js and npm
- [ ] Create Cloudflare account

### Migration
- [ ] Install Wrangler CLI
- [ ] Configure wrangler.toml
- [ ] Test locally (npm run dev)
- [ ] Deploy to Cloudflare
- [ ] Test production deployment
- [ ] Update iframe on website
- [ ] Test embedding on production site

### Post-Migration
- [ ] Monitor for 24-48 hours
- [ ] Document update process
- [ ] Train team on new workflow
- [ ] Set up monitoring/alerts
- [ ] Schedule first data update
- [ ] Decommission Apps Script (after 30 days)

---

**Questions or Issues?**
Contact the Technology & Innovation team or create an issue in this repository.

**Last Updated**: January 2025
