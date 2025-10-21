# Security Guidelines for Cloudflare Worker Deployment

This document provides security best practices for deploying the SAS Digital Toolkit Dashboard on Cloudflare Workers.

## ⚠️ Critical Security Configurations

### 1. CORS (Cross-Origin Resource Sharing)

**Default (Development):**
```toml
# wrangler.toml
[vars]
ALLOWED_ORIGINS = "*"  # ⚠️ INSECURE - allows all origins
```

**Production (Required):**
```toml
[env.production]
vars = {
  ALLOWED_ORIGINS = "https://yourdomain.com,https://docs.yourdomain.com"
}
```

**Why this matters:**
- Wildcard (`*`) allows any website to fetch your data
- Could enable data harvesting or unauthorized access
- Always restrict to specific trusted domains in production

### 2. Content Security Policy (CSP)

**Default (Development):**
```toml
FRAME_ANCESTORS = "*"  # ⚠️ INSECURE - allows embedding anywhere
```

**Production (Required):**
```toml
[env.production]
vars = {
  FRAME_ANCESTORS = "https://yourdomain.com https://docs.yourdomain.com"
}
```

**Why this matters:**
- Prevents clickjacking attacks
- Controls which sites can embed your dashboard in iframes
- Wildcard allows malicious sites to embed and trick users

## 🔒 Production Deployment Checklist

Before deploying to production, ensure:

- [ ] `ALLOWED_ORIGINS` is set to specific domains (no wildcard)
- [ ] `FRAME_ANCESTORS` is set to specific domains (no wildcard)
- [ ] `ENVIRONMENT` is set to `"production"`
- [ ] Account ID is configured in `wrangler.toml`
- [ ] Custom domain is configured (optional but recommended)
- [ ] You've tested the worker in development mode first
- [ ] Data in `dashboard-data.json` is current
- [ ] All team members know the update process

## 🛡️ Security Best Practices

### Domain Restrictions

**Single Domain:**
```toml
ALLOWED_ORIGINS = "https://sas.edu.sg"
FRAME_ANCESTORS = "https://sas.edu.sg"
```

**Multiple Domains:**
```toml
ALLOWED_ORIGINS = "https://sas.edu.sg,https://docs.sas.edu.sg,https://intranet.sas.edu.sg"
FRAME_ANCESTORS = "https://sas.edu.sg https://docs.sas.edu.sg https://intranet.sas.edu.sg"
```

**Note:**
- `ALLOWED_ORIGINS`: Comma-separated list
- `FRAME_ANCESTORS`: Space-separated list (CSP format)

### HTTPS Only

**Always use HTTPS in production:**
- ✅ `https://sas.edu.sg`
- ❌ `http://sas.edu.sg`
- ❌ Wildcards like `*.sas.edu.sg`

### Environment Separation

Use Wrangler environments for different deployment stages:

```toml
# Development (default)
[vars]
ENVIRONMENT = "development"
ALLOWED_ORIGINS = "*"
FRAME_ANCESTORS = "*"

# Staging
[env.staging]
vars = {
  ENVIRONMENT = "staging",
  ALLOWED_ORIGINS = "https://staging.sas.edu.sg",
  FRAME_ANCESTORS = "https://staging.sas.edu.sg"
}

# Production
[env.production]
vars = {
  ENVIRONMENT = "production",
  ALLOWED_ORIGINS = "https://sas.edu.sg,https://docs.sas.edu.sg",
  FRAME_ANCESTORS = "https://sas.edu.sg https://docs.sas.edu.sg"
}
```

**Deploy to specific environment:**
```bash
# Development (default)
wrangler deploy

# Staging
wrangler deploy --env staging

# Production
wrangler deploy --env production
```

## 🔐 Data Security

### Sensitive Data

**Never include in `dashboard-data.json`:**
- Personal information (names, emails, etc.)
- API keys or credentials
- Internal system URLs
- Pricing information (if confidential)
- License keys

**What's safe to include:**
- Application names
- Public-facing descriptions
- Categories and departments
- General license types ("Site", "Individual")
- Public website URLs

### Data Validation

Before exporting data from Google Sheets:

1. **Review the data:**
   ```bash
   # Check for sensitive information
   cat dashboard-data.json | grep -i "password\|api.*key\|secret"
   ```

2. **Validate JSON structure:**
   ```bash
   # Ensure valid JSON
   cat dashboard-data.json | jq .
   ```

3. **Check file size:**
   ```bash
   # Large files slow down the worker
   ls -lh dashboard-data.json
   # Recommended: < 100KB
   ```

## 🚨 Common Security Mistakes

### 1. Wildcard in Production

**❌ DON'T:**
```toml
[env.production]
vars = {
  ALLOWED_ORIGINS = "*"  # Insecure!
}
```

**✅ DO:**
```toml
[env.production]
vars = {
  ALLOWED_ORIGINS = "https://sas.edu.sg"
}
```

### 2. HTTP in Production

**❌ DON'T:**
```toml
ALLOWED_ORIGINS = "http://sas.edu.sg"  # Insecure!
```

**✅ DO:**
```toml
ALLOWED_ORIGINS = "https://sas.edu.sg"  # Secure
```

### 3. Forgetting Subdomains

**❌ DON'T:**
```toml
# This won't allow docs.sas.edu.sg
ALLOWED_ORIGINS = "https://sas.edu.sg"
```

**✅ DO:**
```toml
# List all subdomains explicitly
ALLOWED_ORIGINS = "https://sas.edu.sg,https://docs.sas.edu.sg"
```

### 4. Using Old Data

**❌ DON'T:**
- Deploy with outdated `dashboard-data.json`
- Forget to update when apps change
- Leave test data in production

**✅ DO:**
- Set up a regular update schedule (weekly/monthly)
- Document the update process
- Verify data before deploying

## 🔍 Security Monitoring

### Check Your Configuration

After deployment, verify security headers:

```bash
# Check CORS headers
curl -I https://your-worker.workers.dev/api/data

# Check CSP headers
curl -I https://your-worker.workers.dev/

# Check from specific origin
curl -H "Origin: https://sas.edu.sg" -I https://your-worker.workers.dev/
```

**Expected output (production):**
```
Access-Control-Allow-Origin: https://sas.edu.sg
Content-Security-Policy: frame-ancestors https://sas.edu.sg
```

**⚠️ Warning signs:**
```
Access-Control-Allow-Origin: *  # Too permissive!
Content-Security-Policy: frame-ancestors *  # Allows clickjacking!
```

### Monitor Worker Activity

Use Cloudflare dashboard to monitor:

1. **Request volume:** Unusual spikes may indicate abuse
2. **Error rates:** High errors could mean configuration issues
3. **Origins:** Check which domains are accessing your worker
4. **Geographic distribution:** Unexpected regions may indicate misuse

**Access monitoring:**
1. Log in to Cloudflare Dashboard
2. Go to Workers & Pages
3. Select your worker
4. Click "Metrics" or "Logs"

## 🔄 Updating Security Configuration

### Method 1: Update wrangler.toml and Redeploy

```bash
# Edit wrangler.toml
nano wrangler.toml

# Deploy with new configuration
wrangler deploy --env production
```

### Method 2: Use Wrangler Secrets (for sensitive values)

```bash
# Set secret via CLI (doesn't appear in wrangler.toml)
wrangler secret put ALLOWED_ORIGINS --env production
# Enter value when prompted

# Verify deployment
wrangler deployments list
```

## 🆘 Security Incident Response

### If You Suspect Unauthorized Access

1. **Immediately restrict access:**
   ```bash
   # Set to a safe, known domain
   wrangler secret put ALLOWED_ORIGINS --env production
   # Enter your domain only
   ```

2. **Check recent deployments:**
   ```bash
   wrangler deployments list
   ```

3. **Review worker logs:**
   - Check for unusual request patterns
   - Look for unknown origins
   - Identify IP addresses if available

4. **Rotate data if needed:**
   - Export fresh data from Google Sheets
   - Update `dashboard-data.json`
   - Redeploy

5. **Document the incident:**
   - What happened
   - When it was detected
   - Actions taken
   - Lessons learned

### If You Accidentally Deployed with Wildcard

1. **Don't panic** - fix it quickly
2. **Update configuration immediately:**
   ```bash
   # Update wrangler.toml
   # Change ALLOWED_ORIGINS = "*" to specific domain
   # Redeploy
   wrangler deploy --env production
   ```
3. **Monitor for 24-48 hours** for unusual activity
4. **Document for future reference**

## 📚 Additional Resources

- [Cloudflare Workers Security](https://developers.cloudflare.com/workers/platform/security/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CORS Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [OWASP Security Cheat Sheet](https://cheatsheetseries.owasp.org/)

## 🤝 Questions?

If you have security concerns or questions:

1. Review this document thoroughly
2. Check the [Cloudflare Worker README](README.md)
3. Consult with your IT security team
4. Contact Technology & Innovation team

---

**Last Updated:** January 2025
**Maintained By:** SAS Technology & Innovation Team
**Security Review:** Required before production deployment
