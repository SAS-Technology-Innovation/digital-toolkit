# Quick Start Guide

Get the SAS Digital Toolkit Dashboard running on Cloudflare Workers in under 10 minutes!

## Prerequisites

- Node.js 16+ installed
- Cloudflare account (free tier is fine)
- Your dashboard data exported from Google Sheets

## Step 1: Export Your Data (2 minutes)

1. Open your Google Apps Script project
2. Add the `ExportToJSON.js` file to your project
3. Run the `exportDashboardToJSON()` function
4. Download the JSON file from Google Drive (check the Logs for the URL)

## Step 2: Set Up Cloudflare Worker (3 minutes)

```bash
# Navigate to the cloudflare-worker directory
cd cloudflare-worker

# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login
```

## Step 3: Add Your Data (1 minute)

Place your exported `dashboard-data.json` file in the `cloudflare-worker/` directory.

```bash
# Example:
cp ~/Downloads/dashboard-data-*.json ./dashboard-data.json
```

## Step 4: Test Locally (2 minutes)

```bash
# Start the dev server
npm run dev
```

Open http://localhost:8787 in your browser. You should see your dashboard!

## Step 5: Deploy (2 minutes)

```bash
# Deploy to Cloudflare
npm run deploy
```

Copy your worker URL from the output. It looks like:
```
https://sas-digital-toolkit.your-subdomain.workers.dev
```

## Step 6: Embed on Your Site

Add this iframe to your website:

```html
<iframe
  src="YOUR_WORKER_URL_HERE"
  width="100%"
  height="800"
  style="border: none;"
  title="SAS Digital Toolkit"
></iframe>
```

## Done!

Your dashboard is now live on Cloudflare's global CDN. 🎉

## Next Steps

- Read the [Migration Guide](MIGRATION_GUIDE.md) for detailed information
- Check the [Cloudflare Worker README](cloudflare-worker/README.md) for advanced features
- Set up a data update schedule

## Troubleshooting

**Dashboard not loading?**
- Check browser console for errors
- Verify JSON data is valid: `cat dashboard-data.json | jq`

**Iframe not showing?**
- Check that parent site allows iframes
- Verify CORS settings

**Need help?**
- Check the [Migration Guide](MIGRATION_GUIDE.md)
- Contact Technology & Innovation team
