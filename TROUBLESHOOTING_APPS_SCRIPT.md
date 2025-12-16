# Apps Script Integration Issue - Troubleshooting

## 🔴 Current Problem

The renewal page is getting a 500 error because Apps Script is returning a Google Sign-in page instead of JSON data.

**Error Message:**
```json
{
  "error": "Invalid response from Apps Script",
  "message": "Response was not valid JSON. Check that FRONTEND_KEY matches in both Vercel and Apps Script.",
  "debug": "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n  <meta charset=\"utf-8\">\n  <meta name=\"robots\" content=\"noindex\">\n  <title>Sign in - Google Accounts</title>..."
}
```

## 🔍 Root Cause

Apps Script web app is requiring authentication instead of allowing public access. This happens when:

1. ❌ Apps Script is not deployed as a web app
2. ❌ Web app access is set to "Only myself" instead of "Anyone"
3. ❌ The deployment URL in `APPS_SCRIPT_URL` is outdated

## ✅ Solution

### Step 1: Verify Apps Script Deployment

1. **Open your Apps Script project:**
   - Go to: https://script.google.com
   - Open your "SAS Digital Toolkit" project

2. **Check Current Deployment:**
   - Click **Deploy** → **Manage deployments**
   - Look for an active Web app deployment

### Step 2: Update Web App Settings

If deployment exists, edit it:

1. Click the **pencil icon** (Edit) next to the deployment
2. **Configuration:**
   - **Execute as:** Me (your-email@sas.edu.sg)
   - **Who has access:** **Anyone** ⚠️ This is critical!
3. Click **Deploy**
4. Copy the new **Web app URL**

### Step 3: Create New Deployment (If Needed)

If no deployment exists:

1. Click **Deploy** → **New deployment**
2. Click **gear icon** → Select type: **Web app**
3. **Description:** "Digital Toolkit API v1" (or version number)
4. **Execute as:** Me (your-email@sas.edu.sg)
5. **Who has access:** **Anyone** ⚠️ Must be "Anyone"!
6. Click **Deploy**
7. **Authorize** if prompted (grant permissions)
8. Copy the **Web app URL**

### Step 4: Update Vercel Environment Variable

The Web app URL should look like:
```
https://script.google.com/macros/s/AKfycbz.../exec
```

**Update in Vercel:**

```bash
# Remove old value
vercel env rm APPS_SCRIPT_URL

# Add new value
vercel env add APPS_SCRIPT_URL
# Paste the new Web app URL
# Select all environments: Production, Preview, Development
```

Or via dashboard:
1. Go to: https://vercel.com/sas-edtech/digital-toolkit/settings/environment-variables
2. Find `APPS_SCRIPT_URL`
3. Click **Edit**
4. Paste new URL
5. Save

### Step 5: Redeploy

```bash
vercel --prod
```

## 🔒 Security Note

**Why "Anyone" is safe:**

Even though the web app is set to "Anyone", it's still protected by:

1. **FRONTEND_KEY** - Only requests with correct key get data
2. **doGet() validation** - Code checks the key before returning data
3. **RENEWAL_PASSWORD** - Renewal page has password gate
4. **No sensitive data exposed** - Public app catalog data only

The "Anyone" setting just means "no Google login required", but the app still validates requests via the `FRONTEND_KEY`.

## 🧪 Test After Fix

Once you've updated the deployment:

```bash
# Test Apps Script directly (should return JSON, not HTML)
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?api=data&key=YOUR_FRONTEND_KEY"

# Test via Vercel (after redeploy)
curl https://sas-digital-toolkit.vercel.app/api/data | jq '.'

# Test renewal page
open https://sas-digital-toolkit.vercel.app/renewal
```

## 📋 Apps Script doGet() Requirements

Your Apps Script `doGet(e)` function should handle the `api` parameter:

```javascript
function doGet(e) {
  const action = e.parameter.api || e.parameter.action;
  const key = e.parameter.key;

  // Verify frontend key
  const validKey = PropertiesService.getScriptProperties().getProperty('FRONTEND_KEY');
  if (key !== validKey) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Handle different API actions
  if (action === 'data') {
    return getDashboardData();
  }

  if (action === 'verifyPassword') {
    return verifyRenewalPassword(e.parameter.password);
  }

  // Default response
  return ContentService.createTextOutput(JSON.stringify({ error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## ✅ Checklist

Before redeploying Vercel:

- [ ] Apps Script deployed as Web app
- [ ] **"Who has access"** set to **"Anyone"**
- [ ] New Web app URL copied
- [ ] `APPS_SCRIPT_URL` updated in Vercel
- [ ] `FRONTEND_KEY` matches in both Apps Script and Vercel
- [ ] Apps Script `doGet()` handles `api=data` parameter

## 🔄 Alternative: Use Edge Config Only

If you prefer not to make Apps Script public, you can:

1. Keep Apps Script private
2. Manually populate Edge Config once
3. Set up periodic manual refresh instead of automatic cron

This way the renewal page uses Edge Config exclusively without calling Apps Script at all.

---

**Next Steps:**
1. Fix Apps Script deployment settings ("Anyone" access)
2. Update `APPS_SCRIPT_URL` in Vercel
3. Redeploy with `vercel --prod`
4. Test renewal page
