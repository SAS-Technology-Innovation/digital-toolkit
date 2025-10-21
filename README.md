# SAS Digital Toolkit Dashboard

A modern web dashboard for managing and viewing school application data at Singapore American School. Available in two deployment options: **Google Apps Script** (dynamic) or **Cloudflare Worker** (static, optimized for embedding).

## 🎯 Overview

The Digital Toolkit Dashboard displays educational applications organized by school divisions (Whole School, Elementary, Middle School, High School) with detailed categorization and filtering capabilities.

## 🏗️ Architecture

Choose the deployment option that best fits your needs:

### Option 1: Google Apps Script (Dynamic)
**Best for:** Real-time data, simple setup, internal dashboards

**Technology Stack:**
- **Backend**: Google Apps Script (JavaScript V8 runtime)
- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Lucide Icons
- **Data Source**: Google Sheets (live)
- **Deployment**: Google Apps Script Web App

**Data Flow:**
```
Google Sheets → Apps Script Backend → JSON API → Frontend Dashboard
```

### Option 2: Cloudflare Worker (Static)
**Best for:** Fast loading, embedding, public dashboards

**Technology Stack:**
- **Backend**: Cloudflare Worker (Edge computing)
- **Frontend**: HTML5, CSS3, JavaScript (embed-optimized)
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Lucide Icons
- **Data Source**: Static JSON file (exported from Google Sheets)
- **Deployment**: Cloudflare Workers (Global CDN)

**Data Flow:**
```
Google Sheets → Export to JSON → Cloudflare Worker → Embedded Dashboard
```

**Quick Links:**
- [Quick Start (Cloudflare)](QUICKSTART.md) - Get started in 10 minutes
- [Migration Guide](MIGRATION_GUIDE.md) - Detailed migration instructions
- [Cloudflare Worker README](cloudflare-worker/README.md) - Advanced configuration

## 📊 Features

### Division-Based Organization
- **Whole School**: Apps available to all divisions
- **Elementary**: Apps specific to elementary + whole school apps
- **Middle School**: Apps specific to middle school + whole school apps  
- **High School**: Apps specific to high school + whole school apps

### Smart Categorization
- **Apps Everyone Can Use**: Site/School/Enterprise licenses
- **Department-Specific Apps**: Individual licenses grouped by department
- **Automatic Filtering**: Excludes invalid departments and duplicate entries

### User Interface
- Responsive tabbed interface
- Search and filter capabilities
- Clickable app cards with direct links
- Visual tags for categories, subjects, and license types
- Department cards with app counts and icons

## 🆚 Which Deployment Option Should I Choose?

| Feature | Google Apps Script | Cloudflare Worker |
|---------|-------------------|-------------------|
| **Setup Complexity** | ⭐⭐ Easy | ⭐⭐⭐ Moderate |
| **Load Speed** | 2-4 seconds | < 500ms |
| **Data Updates** | Real-time | Manual export |
| **Cost** | Free (with limits) | Free (100K req/day) |
| **Best for Embedding** | Good | Excellent |
| **Custom Domain** | Limited | Full support |
| **Scalability** | Limited | Unlimited |
| **Requires Node.js** | No | Yes |

**Choose Google Apps Script if:**
- You want real-time data from Google Sheets
- You prefer simpler setup and maintenance
- You're using it internally (not embedded)
- You don't need ultra-fast loading times

**Choose Cloudflare Worker if:**
- You need fast loading times (< 500ms)
- You're embedding on a public website
- You want a professional, custom domain
- You're okay with manual data updates
- You need global CDN distribution

## 🚀 Quick Start

### Option 1: Google Apps Script Setup

#### Prerequisites
- Google Account with access to Google Apps Script
- Google Sheets document with application data
- Node.js installed (for development)

#### Local Setup & Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SAS-Technology-Innovation/digital-toolkit.git
    cd digital-toolkit
    ```

2.  **Connect to your Apps Script project:**
    To link your local environment to your Google Apps Script project, you need to create a `.clasp.json` file. This file is intentionally not stored in the repository.

    -   First, find your **Script ID** in the Apps Script editor under **Project Settings (⚙️) > IDs**.
    -   Then, run the `clasp clone` command:
    ```bash
    npx @google/clasp clone "YOUR_SCRIPT_ID"
    ```
    This will create the `.clasp.json` file and pull the latest code from the cloud, ensuring your local project is correctly linked.

3.  **Log in to clasp:**
    If you haven't already, log in to your Google account.
    ```bash
    npm run login
    ```

4.  **Start developing:**
    Use the npm scripts in `package.json` to push, pull, and deploy your code.

### Option 2: Cloudflare Worker Setup

#### Prerequisites
- Node.js 16+ installed
- Cloudflare account (free tier works)
- Dashboard data exported from Google Sheets

#### Quick Setup (10 minutes)

1. **Export your data from Google Sheets:**
   ```bash
   # Run exportDashboardToJSON() in your Apps Script project
   # Download the JSON file from Google Drive
   ```

2. **Set up Cloudflare Worker:**
   ```bash
   cd cloudflare-worker
   npm install
   npx wrangler login
   ```

3. **Add your data:**
   ```bash
   # Place dashboard-data.json in cloudflare-worker/
   cp ~/Downloads/dashboard-data-*.json ./dashboard-data.json
   ```

4. **Test locally:**
   ```bash
   npm run dev
   # Visit http://localhost:8787
   ```

5. **Deploy:**
   ```bash
   npm run deploy
   # Your worker URL will be displayed
   ```

6. **Embed on your website:**
   ```html
   <iframe src="YOUR_WORKER_URL" width="100%" height="800" style="border:none;"></iframe>
   ```

**For detailed instructions, see:**
- [Quick Start Guide](QUICKSTART.md)
- [Migration Guide](MIGRATION_GUIDE.md)
- [Cloudflare Worker README](cloudflare-worker/README.md)

## 📋 Configuration

### Google Sheets Setup
Your Google Sheet must contain these columns:
- **Active**: TRUE/FALSE (only TRUE apps are displayed)
- **Product**: Application name
- **Division**: School divisions (Elementary, Middle, High, or combinations)
- **Department**: Department name (used for grouping)
- **Subject**: Subject area
- **License Type**: License type (Site, Individual, Enterprise, etc.)
- **Licenses**: Number of licenses (numeric)
- **Category**: Application category
- **Website**: Application URL
- **Spend**: Cost information

### Apps Script Configuration

Configuration is managed using **Script Properties** to avoid hardcoding sensitive information in the code.

1.  Open the Apps Script project by running `npm run open`.
2.  In the left-hand menu, click on **Project Settings** (the ⚙️ gear icon).
3.  Scroll down to the **Script Properties** section.
4.  Click **Add script property**.
5.  Add the following two properties:
    -   **Property:** `SPREADSHEET_ID`
        **Value:** `your-google-sheets-id`
    -   **Property:** `SHEET_NAME`
        **Value:** `your-sheet-name`

## 🔧 Development

### Available Scripts
```bash
npm run login     # Login to Google Apps Script
npm run push      # Push code changes
npm run deploy    # Create new deployment
npm run pull      # Pull latest from Apps Script
npm run logs      # View execution logs
npm run open      # Open Apps Script editor
```

### Project Structure
```
digital-toolkit/
├── Code.js                 # Apps Script backend
├── index.html             # Frontend dashboard
├── appsscript.json       # Apps Script configuration
├── package.json          # npm scripts
├── .clasp.json          # clasp configuration
└── .github/
    └── workflows/
        └── deploy.yml    # Auto-deployment
```

### Business Logic

**Division Assignment:**
- Apps are assigned to divisions based on the Division column
- Apps with multiple divisions listed become "Whole School" apps
- "School Operations" department apps are treated as whole school
- Site/School/Enterprise licenses appear in "Apps Everyone Can Use"

**Department Filtering:**
- Only valid department names are shown as department cards
- Division names (Elementary, Middle, High) are filtered out
- Empty, "N/A", or placeholder departments are excluded

## 🚀 Deployment

### GitHub Actions (Recommended)
The repository includes automatic deployment via GitHub Actions:
1.  **Add GitHub Secrets:**
    Go to your repository's **Settings → Secrets and variables → Actions** and add the following three secrets:
    -   `CLASP_CREDENTIALS`: Your local clasp authentication token. Get it by running `npm run login` and then `cat ~/.config/clasp/.clasprc.json`.
    -   `APPS_SCRIPT_ID`: The ID of your Google Apps Script project. Find it in the Apps Script editor under **Project Settings (⚙️) > IDs**.
    -   `APPS_SCRIPT_DEPLOYMENT_ID`: The stable deployment ID for your web app. Find it under **Deploy > Manage deployments**.

    > **Note:** The `.clasp.json` file is not committed to the repository. It is generated dynamically during the GitHub Actions workflow. For local development, this file will be created when you run `npm run login` and `npm run pull` or `npm run clone`.

3. **Auto-Deploy:**
   - Pushes to `main` branch automatically deploy
   - Manual deployment via Actions tab

### Manual Deployment
```bash
# Push and deploy manually
npm run push
npm run deploy
```

## 📱 Usage

1. **Access the Dashboard**: Visit your deployed Google Apps Script web app URL
2. **Navigate Divisions**: Click tabs to view different school divisions
3. **Browse Apps**: View apps in "Everyone Can Use" and department sections
4. **Access Apps**: Click app names to visit application websites
5. **View Details**: Check tags for categories, subjects, and license types

## 🎨 Customization

### Styling
- Uses Tailwind CSS for responsive design
- Custom CSS variables for school branding
- Lucide icons for visual elements

### Department Icons
Icons are automatically assigned based on department names:
- Technology/IT: Monitor icon
- English/Language: Book icon
- Math: Calculator icon
- Science: Flask icon
- Arts/Music: Palette icon
- PE/Athletics: Activity icon
- Library: Library icon
- Counseling: Heart icon

## 🔒 Security & Privacy

- **Domain Restricted**: Web app access limited to SAS domain
- **@OnlyCurrentDoc**: Limited to current document permissions
- **No Data Storage**: No persistent data storage in Apps Script
- **Read-Only Sheet Access**: Real-time data from Google Sheets

## 🐛 Troubleshooting

### Common Issues

**"Script not found" error:**
- Verify `scriptId` in `.clasp.json`
- Ensure you have access to the Apps Script project

**Google Sheets permission error:**
- Check that the spreadsheet ID is correct
- Verify sheet name matches configuration
- Ensure the Apps Script has read access to the sheet

**Deployment fails:**
- Check Google Apps Script editor for syntax errors
- Verify all files are valid
- Ensure proper OAuth scopes in `appsscript.json`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test changes locally by opening `index.html`
4. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For technical support, contact: [edtech@sas.edu.sg](mailto:edtech@sas.edu.sg)

---

**Developed by the Singapore American School Technology & Innovation Team**
