# Cloudflare Worker Deployment & Testing Guide

This guide provides step-by-step instructions for deploying and testing the SAS Digital Toolkit Dashboard on Cloudflare Workers.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Node.js 16+ installed (`node --version`)
- [ ] Wrangler CLI installed (`npm install` in cloudflare-worker/)
- [ ] Cloudflare account created
- [ ] Logged in to Wrangler (`npx wrangler login`)
- [ ] Current `dashboard-data.json` from Google Sheets
- [ ] Reviewed [SECURITY.md](SECURITY.md) guidelines
- [ ] Configured `wrangler.toml` with your settings

## 🚀 Deployment Steps

### Step 1: Verify Your Configuration

```bash
cd cloudflare-worker

# Check your configuration
cat wrangler.toml

# Verify required fields:
# - name: Your worker name
# - account_id: Your Cloudflare account ID (optional but recommended)
# - vars.ENVIRONMENT: "development" or "production"
```

### Step 2: Test Module Imports (Critical!)

**This addresses the PR review concern about module compatibility.**

Wrangler should bundle HTML and JSON files automatically, but let's verify:

```bash
# Test that imports work
npx wrangler dev

# You should see:
# ⛅️ wrangler 3.x.x
# ------------------
# ⎔ Starting local server...
# ⎔ Listening on http://localhost:8787

# If you see import errors, check the [rules] section in wrangler.toml
```

**Common import issues:**

1. **HTML not loading:**
   ```toml
   # Add to wrangler.toml
   [[rules]]
   type = "Text"
   globs = ["**/*.html"]
   ```

2. **JSON not loading:**
   ```toml
   [[rules]]
   type = "Data"
   globs = ["**/*.json"]
   ```

### Step 3: Local Testing

```bash
# Start development server
npm run dev

# Or with wrangler directly
npx wrangler dev
```

**Test all endpoints:**

1. **Dashboard HTML** - http://localhost:8787/
   - Should display the full dashboard
   - All tabs should work
   - Apps should be clickable

2. **JSON API** - http://localhost:8787/api/data
   - Should return JSON data
   - Verify structure matches expected format

3. **Health Check** - http://localhost:8787/health
   - Should return: `{"status":"ok","timestamp":"...","version":"1.0.0"}`

### Step 4: Test Security Configuration

**Test CORS (if configured):**

```bash
# Test with allowed origin
curl -H "Origin: https://yourdomain.com" -I http://localhost:8787/api/data

# Expected: Access-Control-Allow-Origin: https://yourdomain.com

# Test with disallowed origin (if not using wildcard)
curl -H "Origin: https://evil.com" -I http://localhost:8787/api/data

# Expected: Access-Control-Allow-Origin: (first allowed domain, not evil.com)
```

**Test CSP:**

```bash
# Check CSP header
curl -I http://localhost:8787/

# Expected: Content-Security-Policy: frame-ancestors [your-config]
```

### Step 5: Deploy to Cloudflare

#### Development Deployment

```bash
# Deploy with development settings
npm run deploy

# Or with wrangler
npx wrangler deploy
```

**Expected output:**
```
✨ Successfully published your Worker to:
   https://sas-digital-toolkit.your-subdomain.workers.dev
```

#### Production Deployment (Recommended)

```bash
# First, update wrangler.toml for production
# Set ENVIRONMENT = "production"
# Set ALLOWED_ORIGINS to specific domains
# Set FRAME_ANCESTORS to specific domains

# Deploy to production environment
npx wrangler deploy --env production
```

### Step 6: Post-Deployment Verification

**1. Test the deployed URL:**

```bash
# Get your worker URL from deployment output
WORKER_URL="https://your-worker.workers.dev"

# Test HTML endpoint
curl -I $WORKER_URL

# Test JSON endpoint
curl $WORKER_URL/api/data | jq .

# Test health endpoint
curl $WORKER_URL/health | jq .
```

**2. Verify security headers:**

```bash
# Check CORS header
curl -I $WORKER_URL/api/data | grep -i "access-control-allow-origin"

# Check CSP header
curl -I $WORKER_URL/ | grep -i "content-security-policy"

# ⚠️ WARNING: If you see '*' in production, fix immediately!
# See SECURITY.md for instructions
```

**3. Test from browser:**

Open your browser and visit:
- `https://your-worker.workers.dev/` - Should load dashboard
- `https://your-worker.workers.dev/api/data` - Should show JSON
- `https://your-worker.workers.dev/health` - Should show health status

**4. Test iframe embedding:**

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Embed Test</title>
</head>
<body>
  <h1>Testing Dashboard Embed</h1>
  <iframe
    src="https://your-worker.workers.dev"
    width="100%"
    height="800"
    style="border: 1px solid #ccc;"
  ></iframe>
</body>
</html>
```

Open in browser and verify:
- [ ] Dashboard loads in iframe
- [ ] All tabs work
- [ ] Apps are clickable
- [ ] No console errors

## 🧪 Testing Checklist

Use this checklist for each deployment:

### Functional Testing

- [ ] Dashboard HTML loads
- [ ] All four tabs work (Whole School, Elementary, MS, HS)
- [ ] "Apps Everyone Can Use" section displays
- [ ] Department cards display
- [ ] App cards show name, tags, and link
- [ ] Clicking app names opens correct URLs
- [ ] JSON API returns valid data
- [ ] Health endpoint responds

### Security Testing

- [ ] CORS headers match configuration
- [ ] CSP headers restrict frame-ancestors
- [ ] No wildcard (*) in production
- [ ] HTTPS enforced (if configured)
- [ ] Unknown origins rejected (if using allowlist)

### Performance Testing

- [ ] Initial load < 2 seconds
- [ ] JSON API response < 500ms
- [ ] Dashboard responsive on mobile
- [ ] No JavaScript errors in console
- [ ] All icons load properly (Lucide)

### Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## 🐛 Troubleshooting

### Issue: Worker not deploying

**Error:** `Could not find account`

**Solution:**
```bash
# Set account ID in wrangler.toml
account_id = "your-account-id"

# Find your account ID:
# 1. Log in to Cloudflare dashboard
# 2. URL contains account ID, or check Workers & Pages > Overview
```

**Error:** `Authentication error`

**Solution:**
```bash
# Re-login to Wrangler
npx wrangler logout
npx wrangler login
```

### Issue: Imports not working

**Error:** `Cannot find module './dashboard-data.json'`

**Solution:**
```bash
# Ensure files exist
ls dashboard-data.json embed.html

# Check wrangler.toml has rules:
cat wrangler.toml | grep -A 5 "\[rules\]"

# Should see:
# [[rules]]
# type = "Text"
# globs = ["**/*.html"]
# [[rules]]
# type = "Data"
# globs = ["**/*.json"]
```

### Issue: JSON or HTML not updating

**Problem:** Deployed worker shows old data

**Solution:**
```bash
# Clear Cloudflare cache
# 1. Visit Cloudflare Dashboard
# 2. Go to Caching > Configuration
# 3. Click "Purge Everything"

# Or redeploy with cache busting
npx wrangler deploy --compatibility-date=$(date +%Y-%m-%d)
```

### Issue: CORS errors in browser

**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:**
```bash
# Check your ALLOWED_ORIGINS configuration
# Make sure the requesting origin is in the list

# Example fix in wrangler.toml:
[vars]
ALLOWED_ORIGINS = "https://your-actual-site.com"

# Then redeploy
npx wrangler deploy
```

### Issue: Dashboard not loading in iframe

**Error:** `Refused to display '...' in a frame because an ancestor violates the CSP directive`

**Solution:**
```bash
# Check FRAME_ANCESTORS configuration
# Add the parent site's domain

[vars]
FRAME_ANCESTORS = "https://parent-site.com"

# Then redeploy
npx wrangler deploy
```

## 📊 Monitoring Your Deployment

### View Real-Time Logs

```bash
# Tail logs in real-time
npm run tail

# Or with wrangler
npx wrangler tail
```

**What to look for:**
- Request paths and methods
- Response status codes
- Error messages
- Performance metrics

### Check Metrics in Dashboard

1. Log in to Cloudflare Dashboard
2. Go to **Workers & Pages**
3. Select your worker
4. Click **Metrics**

**Key metrics:**
- **Requests:** Should match expected traffic
- **Errors:** Should be < 1%
- **Duration:** Should be < 50ms average
- **CPU Time:** Should be < 10ms average

### Set Up Alerts (Optional)

In Cloudflare Dashboard:
1. Go to **Notifications**
2. Create a new notification
3. Set triggers:
   - Error rate > 5%
   - Request volume spike
   - Worker exceeded limits

## 🔄 Updating Your Deployment

### Update Data Only

```bash
# 1. Export new data from Google Sheets
# 2. Replace dashboard-data.json
cp ~/Downloads/dashboard-data-new.json ./dashboard-data.json

# 3. Redeploy
npm run deploy
```

### Update Code

```bash
# 1. Make changes to worker.js or embed.html
# 2. Test locally
npm run dev

# 3. Deploy
npm run deploy
```

### Update Configuration

```bash
# 1. Edit wrangler.toml
nano wrangler.toml

# 2. Deploy with new config
npm run deploy
```

## 🎯 Production Deployment Best Practices

1. **Always test locally first:**
   ```bash
   npm run dev
   # Test thoroughly before deploying
   ```

2. **Use environments:**
   ```bash
   # Deploy to staging first
   npx wrangler deploy --env staging

   # Test staging
   # If all good, deploy to production
   npx wrangler deploy --env production
   ```

3. **Keep deployment log:**
   ```bash
   # Create a deployment log
   echo "$(date): Deployed version X.Y.Z" >> deployment-log.txt
   git add deployment-log.txt
   git commit -m "Deploy version X.Y.Z"
   ```

4. **Monitor after deployment:**
   - Watch logs for 15-30 minutes
   - Check error rates
   - Test all endpoints
   - Verify in production browser

5. **Have a rollback plan:**
   ```bash
   # List recent deployments
   npx wrangler deployments list

   # Rollback to previous version if needed
   npx wrangler rollback [deployment-id]
   ```

## 📝 Deployment Checklist Template

Copy this for each deployment:

```markdown
## Deployment - [Date]

### Pre-Deployment
- [ ] Tested locally with `npm run dev`
- [ ] Verified `dashboard-data.json` is current
- [ ] Reviewed security configuration
- [ ] Checked wrangler.toml settings
- [ ] Created backup of current deployment

### Deployment
- [ ] Ran `npm run deploy`
- [ ] Verified deployment URL
- [ ] Checked deployment logs

### Post-Deployment
- [ ] Tested all endpoints
- [ ] Verified security headers
- [ ] Tested iframe embedding
- [ ] Checked browser console for errors
- [ ] Monitored logs for 15 minutes
- [ ] Verified metrics in dashboard

### Notes
- Deployment URL: _______________
- Issues encountered: _______________
- Resolution: _______________
```

## 🆘 Emergency Procedures

### If deployment fails:

1. **Check logs:**
   ```bash
   npx wrangler tail
   ```

2. **Rollback if needed:**
   ```bash
   npx wrangler deployments list
   npx wrangler rollback [previous-deployment-id]
   ```

3. **Verify rollback:**
   ```bash
   curl https://your-worker.workers.dev/health
   ```

### If security issue detected:

1. **Immediately restrict access:**
   Update `wrangler.toml` with specific domains
   Redeploy ASAP

2. **Follow** [SECURITY.md incident response](SECURITY.md#-security-incident-response)

## 📚 Additional Resources

- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Debugging Workers](https://developers.cloudflare.com/workers/observability/debugging/)
- [Project README](README.md)
- [Security Guidelines](SECURITY.md)

---

**Questions?** Contact Technology & Innovation team

**Last Updated:** January 2025
