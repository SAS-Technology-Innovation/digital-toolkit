# Renewal Page - Deployment Checklist

Quick reference for deploying the App Renewal Process page with Edge Config.

## ✅ Pre-Deployment Setup

### 1. Link Vercel Project
```bash
vercel link
```

### 2. Create Edge Config
In Vercel Dashboard:
- Go to **Storage** → **Edge Config**
- Click **Create Edge Config**
- Name: `digital-toolkit`
- Copy the Edge Config ID (starts with `ecfg_`)

### 3. Create Vercel API Token
- Go to https://vercel.com/account/tokens
- Create token with **Read and Write** scope
- Copy token for next step

### 4. Generate Cron Secret
```bash
openssl rand -base64 32
```

### 5. Set Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Where to Find |
|----------|---------------|
| `APPS_SCRIPT_URL` | Apps Script → Deploy → Web app URL |
| `FRONTEND_KEY` | Same as main dashboard (from Apps Script Properties) |
| `EDGE_CONFIG` | Auto-set when Edge Config created |
| `EDGE_CONFIG_ID` | Edge Config dashboard (starts with `ecfg_`) |
| `VERCEL_TOKEN` | Created in step 3 above |
| `CRON_SECRET` | Generated in step 4 above |

**Important:** Set variables for **Production**, **Preview**, and **Development** environments.

## 🚀 Deployment Steps

### 1. Pull Environment Variables
```bash
npm run env:pull
```

### 2. Test Edge Config Connection
```bash
npm run test:edge-config
```

**Expected Output:**
```
🔍 Testing Vercel Edge Config Connection...
⚠️  Edge Config is empty. Run refresh-renewal-data to populate.
```

This is normal for first-time setup!

### 3. Deploy to Vercel
```bash
npm run deploy
```

### 4. Initial Data Load
After deployment, manually trigger the first data refresh:

```bash
curl -X POST https://YOUR-DOMAIN.vercel.app/api/refresh-renewal-data \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Renewal data refreshed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "appsCount": 123
}
```

### 5. Verify Edge Config Populated
```bash
npm run test:edge-config
```

**Expected Output:**
```
✅ Edge Config connected successfully!
✅ Renewal data found!
   - Total apps: 123
   - Last updated: 1/15/2024, 10:30:00 AM
```

### 6. Test Renewal Page
Open: `https://YOUR-DOMAIN.vercel.app/renewal`

**Password:** Set via `RENEWAL_PASSWORD` in Apps Script Properties

## 📊 Post-Deployment Monitoring

### Check Cron Execution
Vercel Dashboard → Deployments → Functions → Filter by `/api/refresh-renewal-data`

You should see hourly executions.

### View Edge Config Data
```bash
# List all keys
vercel edge-config list digital-toolkit

# Get renewal data
vercel edge-config get digital-toolkit renewal_data

# Get last updated timestamp
vercel edge-config get digital-toolkit last_updated
```

### Test API Endpoints

**Get Renewal Data:**
```bash
curl https://YOUR-DOMAIN.vercel.app/api/renewal-data | jq
```

**Manually Refresh Data:**
```bash
curl -X POST https://YOUR-DOMAIN.vercel.app/api/refresh-renewal-data \
  -H "Authorization: Bearer YOUR_CRON_SECRET" | jq
```

## 🐛 Troubleshooting

### "Edge Config is empty"
**Solution:** Run initial data refresh (step 4 above)

### "CRON_SECRET not configured"
**Solution:** Set environment variable and redeploy
```bash
vercel env add CRON_SECRET
# Paste generated secret
vercel --prod
```

### "Apps Script returned 401"
**Solution:** Verify `FRONTEND_KEY` matches Apps Script
```bash
# Check Apps Script Properties
# Verify FRONTEND_KEY value matches Vercel env var
```

### Cron Not Running
**Solutions:**
1. Verify Pro plan (Cron requires Vercel Pro)
2. Check `vercel.json` exists in deployment
3. View logs in Vercel dashboard

### "Failed to update Edge Config"
**Solution:** Verify `VERCEL_TOKEN` and `EDGE_CONFIG_ID`
```bash
# Check token has correct permissions
# Verify Edge Config ID matches dashboard
```

## 🔄 Making Changes

### Update Renewal Page HTML
```bash
# Edit renewal.html
# Deploy changes
npm run deploy
```

### Update API Routes
```bash
# Edit api/renewal-data.js or api/refresh-renewal-data.js
npm run deploy
```

### Update Cron Schedule
Edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/refresh-renewal-data",
      "schedule": "0 */2 * * *"  // Every 2 hours instead of 1
    }
  ]
}
```

Then redeploy:
```bash
npm run deploy
```

## 📚 Resources

- [RENEWAL_SETUP.md](RENEWAL_SETUP.md) - Detailed setup documentation
- [Vercel Edge Config Docs](https://vercel.com/docs/storage/edge-config)
- [Vercel Cron Jobs Docs](https://vercel.com/docs/cron-jobs)
- Apps Script: Check your project's Script Properties

## ✅ Success Criteria

- [ ] Edge Config created and populated
- [ ] Environment variables set (all 6)
- [ ] Deployment successful
- [ ] Initial data refresh completed
- [ ] Renewal page loads with data
- [ ] Cron job running hourly
- [ ] Password authentication working

## 🎯 Next Steps After Deployment

1. Share renewal page URL with admins
2. Set up alerts for failed cron runs (Vercel Integrations)
3. Monitor Edge Config usage (should stay in free tier)
4. Document password for renewal access team
5. Schedule regular reviews of renewal data accuracy
