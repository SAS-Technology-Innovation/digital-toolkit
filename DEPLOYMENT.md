# Google Apps Script Deployment Guide

## Setup Commands

### First Time Setup

1. **Login to Google Apps Script:**
   ```bash
   npm run login
   ```

2. **Deploy to Apps Script:**
   ```bash
   npm run push
   npm run deploy
   ```

### Daily Development Commands

```bash
# Push your code changes
npm run push

# Create a new deployment
npm run deploy

# View execution logs
npm run logs

# Open Apps Script editor in browser
npm run open

# Pull latest changes from Apps Script
npm run pull
```

## GitHub Actions Setup

### Required Secrets

To enable automatic deployment from GitHub:

1. **Get your clasp credentials:**
   ```bash
   cat ~/.config/clasp/.clasprc.json
   ```

2. **Add to GitHub Secrets:**
   - Go to your repository Settings → Secrets and variables → Actions
   - Create a new secret named `CLASP_CREDENTIALS`
   - Paste the entire JSON content from the clasp credentials file

### Auto-Deployment

The workflow in `.github/workflows/deploy.yml` will automatically:
- Deploy on every push to the `main` branch
- Can be manually triggered from the Actions tab
- Uses Node.js 22 for all operations

## Project Structure

```
digital-toolkit/
├── .clasp.json           # Contains Apps Script project ID
├── appsscript.json       # Apps Script manifest and settings
├── package.json          # npm scripts and project info
├── Code.js               # Main Apps Script server code
├── index.html            # Frontend dashboard
└── .github/
    └── workflows/
        └── deploy.yml    # Auto-deployment workflow
```

## Apps Script Configuration

- **Script ID:** `1T4d1x26rN5oAbNZIvjU0x1z3FTUxd1UwIoJwyBhxaIB30fWsvBj8-rjw`
- **Timezone:** Asia/Singapore
- **Runtime:** V8
- **Web App Access:** Domain restricted
- **Execute As:** User deploying

## Troubleshooting

### Common Issues

1. **Permission Denied:**
   ```bash
   npm run login
   ```

2. **Script not found:**
   - Verify `.clasp.json` has correct `scriptId`
   - Ensure you have access to the Apps Script project

3. **Deployment fails:**
   - Check Apps Script project permissions
   - Verify files are valid JavaScript/HTML

### Manual Deployment

If automatic deployment fails, you can always deploy manually:

```bash
npm run push
npm run deploy
```