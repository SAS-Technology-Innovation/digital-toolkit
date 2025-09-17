# Google Apps Script Deployment Guide

## Local Development Setup

### First Time Setup

1.  **Connect to the Apps Script Project:**
    To link your local environment to your Google Apps Script project, you need a `.clasp.json` file. This file is ignored by git and will not be committed to the repository.

    -   Find your **Script ID** in the Apps Script editor under **Project Settings (⚙️) > IDs**.
    -   Run the `clasp clone` command in your terminal:
    ```bash
    npx @google/clasp clone "YOUR_SCRIPT_ID"
    ```
    This creates the `.clasp.json` file and ensures your local project is linked to the correct script in the cloud.

2.  **Login to Google:**
   ```bash
   npm run login
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

To enable automatic deployment from GitHub, you need to configure three secrets:

#### 1. `CLASP_CREDENTIALS`

This secret contains your Google authentication tokens.

1.  **First, ensure you're logged into clasp locally:**
   ```bash
   npm run login
   ```

2.  **Get your clasp credentials:**
   ```bash
   cat ~/.config/clasp/.clasprc.json
   ```

3.  **Add to GitHub Secrets:**
   - Go to your repository Settings → Secrets and variables → Actions
   - Create a new secret named `CLASP_CREDENTIALS`
   - Paste the **entire JSON content** from the clasp credentials file (including all curly braces)

#### 2. `APPS_SCRIPT_DEPLOYMENT_ID`

This secret ensures that GitHub Actions updates a single, stable web app URL instead of creating a new one on every deployment.

1.  **Create an initial deployment manually:**
    If you haven't deployed before, run:
    ```bash
    npm run deploy
    ```

2.  **Find the Deployment ID:**
    -   Open the Apps Script project (`npm run open`).
    -   Go to **Deploy > Manage deployments**.
    -   Find your active "Web app" deployment and click the three dots (...) > **Copy ID**. The ID will start with `AKfyc...`.

3.  **Add to GitHub Secrets:**
    -   Go to your repository Settings → Secrets and variables → Actions
    -   Create a new secret named `APPS_SCRIPT_DEPLOYMENT_ID`.
    -   Paste the copied Deployment ID.

#### 3. `APPS_SCRIPT_ID`

This secret stores the ID of your Google Apps Script project, keeping it out of version control.

1.  **Find the Script ID:**
    -   Open the Apps Script project (`npm run open`).
    -   Go to **Project Settings** (the ⚙️ gear icon).
    -   Under **IDs**, copy the **Script ID**.

2.  **Add to GitHub Secrets:**
    -   Create a new secret named `APPS_SCRIPT_ID` and paste the ID.

### Troubleshooting GitHub Actions

**Common Issues:**

1. **"No credentials found" error:**
   - Verify `CLASP_CREDENTIALS` secret exists and contains valid JSON
   - Ensure you've run `npm run login` locally before copying credentials
   - Check that the JSON is complete and not truncated

2. **"Unauthorized" error:**
   - Your clasp login may have expired - run `npm run login` again
   - Update the `CLASP_CREDENTIALS` secret with fresh credentials

3. **"Script not found" error:**
   - Verify the `APPS_SCRIPT_ID` secret is correct.
   - Ensure the service account has access to the Apps Script project

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

- **Script ID:** Managed via the `APPS_SCRIPT_ID` GitHub secret for deployments. For local development, this is stored in the untracked `.clasp.json` file.
- **Timezone:** Asia/Singapore
- **Runtime:** V8
- **Web App Access:** Domain restricted
- **Execute As:** User deploying
- **Required OAuth Scopes:** `https://www.googleapis.com/auth/spreadsheets.readonly`

## Troubleshooting

### Common Issues

1. **Permission Denied:**
   ```bash
   npm run login
   ```

2. **Script not found:**
   - For local development, verify `.clasp.json` has the correct `scriptId`.
   - Ensure you have access to the Apps Script project

3. **Google Sheets permission error:**
   - Ensure `appsscript.json` includes required OAuth scopes
   - Redeploy the web app after adding scopes
   - User may need to reauthorize the application

4. **Favicon error:**
   - Remove or use a valid favicon URL in `Code.js`
   - External placeholder services may not be supported

5. **Deployment fails:**
   - Check Apps Script project permissions
   - Verify files are valid JavaScript/HTML

### Manual Deployment

If automatic deployment fails, you can always deploy manually:

```bash
npm run push
npm run deploy
```