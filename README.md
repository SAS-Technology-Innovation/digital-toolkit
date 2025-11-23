# SAS Digital Toolkit Dashboard

A **free, open-source** Google Apps Script web application for schools to manage and showcase their educational technology stack. Originally developed for Singapore American School, this dashboard can be easily customized for any educational institution.

## 🎯 Overview

The Digital Toolkit Dashboard provides an elegant, user-friendly interface for organizing and discovering educational applications across your school. Apps are automatically categorized by school divisions (Whole School, Elementary, Middle School, High School) with smart filtering, department grouping, and powerful search capabilities.

**Perfect for:**
- Schools managing multiple educational apps and licenses
- Technology directors tracking software inventory
- Teachers and staff discovering available tools
- Parents understanding school technology resources
- Budget planning and license management

## 🏗️ Architecture

**Technology Stack:**
- **Backend**: Google Apps Script (JavaScript V8 runtime)
- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Lucide Icons
- **Data Source**: Google Sheets
- **Deployment**: Google Apps Script Web App

**Data Flow:**
```
Google Sheets → Apps Script Backend → JSON API → Frontend Dashboard
```

## ✨ Features

### 🎨 Enhanced User Experience (Phase 3)
- **App Logos & Branding**: Display app logos for quick visual recognition
- **Grade Level Badges**: Quickly identify appropriate grade levels (K-5, 6-8, 9-12, etc.)
- **"What's New" Section**: Automatically highlights apps added in the last 30 days
- **NEW Badges**: Eye-catching animated badges for recently added apps
- **App Detail Modal**: Click "Details" for comprehensive app information including:
  - Full description and features
  - License information and renewal dates
  - SSO and mobile app availability
  - Tutorial links and support resources
- **Integrated Search**: Header-based search across all app metadata
- **Tutorial Links**: Direct access to training resources

### 📚 Division-Based Organization
- **Whole School**: Apps available to all divisions
- **Elementary**: Apps specific to elementary + whole school apps
- **Middle School**: Apps specific to middle school + whole school apps
- **High School**: Apps specific to high school + whole school apps

### 🎯 Smart Categorization
- **Enterprise Apps**: Premium section for official school-wide core tools
- **Apps Everyone Can Use**: Site/School/Enterprise licenses for broad access
- **Department-Specific Apps**: Individual licenses grouped by department with counts
- **Automatic Filtering**: Excludes invalid departments and prevents duplicate entries

### 🔍 Powerful Search & Discovery
- **Real-time Search**: Instant filtering across product name, category, subject, department, and audience
- **Visual Tags**: Color-coded tags for categories, subjects, license types, and audiences
- **Meta Badges**: SSO availability and mobile app indicators
- **Department Icons**: Auto-assigned icons based on department keywords

### 📝 App Request Process
- **Guided Workflow**: Step-by-step process for requesting new applications
- **Visual Flowchart**: Interactive process diagram displayed alongside instructions
- **Required Questions**: Six structured questions to ensure thorough requests
- **Consultation Guidance**: Clear steps for working with department leads and PLC coaches
- **AI Integration**: AI assistant provides app request guidance when requested apps aren't available

### 📱 Responsive Design
- Mobile-first responsive layout
- Touch-friendly interface
- Works on desktop, tablet, and mobile devices
- Clean, modern SAS-branded design

## 🚀 Quick Start

### Prerequisites
- Google Account with access to Google Apps Script
- Google Sheets document with application data
- Node.js installed (for development)

### Local Setup & Development

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

## 📋 Configuration

### Google Sheets Setup

Create a Google Sheet with the following 22 columns (see [expected-data-template.csv](expected-data-template.csv) for a complete example):

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `Active` | Boolean | TRUE/FALSE - only TRUE apps displayed | TRUE |
| `product_name` | String | Application name | Google Classroom |
| `Division` | String | School divisions | Elementary, Middle, High, Whole School |
| `Department` | String | Department name | Mathematics, Technology, School Operations |
| `subjects_or_department` | String | Subject area | Math, Science, Arts |
| `Enterprise` | Boolean | Official enterprise/core tool | TRUE/FALSE |
| `budget` | Number | Budget allocation | 5000 |
| `audience` | String | Comma-separated audience | Teachers,Students,Parents |
| `License Type` | String | License model | Site, Individual, Enterprise, School |
| `licence_count` | Number | Number of licenses | 500 or "Unlimited" |
| `value` | Number | Annual cost | 2500 |
| `date_added` | Date | When app was added | 2024-01-15 |
| `renewal_date` | Date | Subscription renewal | 2025-12-31 |
| `Category` | String | App category | Learning Management, Design, Math Tools |
| `Website` | String | App URL | https://classroom.google.com |
| `description` | String | Brief description | Classroom management and assignment distribution |
| `grade_levels` | String | Target grades | K-5, 6-8, 9-12, K-12 |
| `support_email` | String | Support contact | support@school.edu |
| `tutorial_link` | String | Training URL | https://help.example.com |
| `mobile_app` | String | Mobile availability | Yes, No, iOS/Android |
| `sso_enabled` | Boolean | SSO available | TRUE/FALSE |
| `logo_url` | String | App logo image URL | https://example.com/logo.png |

**💡 Tip:** Download and customize [expected-data-template.csv](expected-data-template.csv) to get started quickly!

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
├── signage.html           # Digital signage display
├── appsscript.json       # Apps Script configuration
├── package.json          # npm scripts
├── .clasp.json          # clasp configuration (local only)
├── assets/                # Static assets
│   └── App Request Process for Teachers.png
├── .github/
│   └── workflows/
│       └── deploy.yml    # Auto-deployment
├── CLAUDE.md             # Developer documentation
├── AI_FEATURES.md        # AI integration guide
├── SIGNAGE.md            # Signage display guide
└── UPCOMING_FEATURES.md  # Future roadmap
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

### Branding & Styling
Easily customize the dashboard for your school:

1. **Colors**: Update CSS variables in [index.html](index.html#L12-L30)
   ```css
   :root {
     --sas-red: #a0192a;      /* Your primary color */
     --sas-blue: #1a2d58;     /* Your secondary color */
     --sas-yellow: #fabc00;   /* Your accent color */
     --elementary: #228ec2;   /* Elementary division color */
     --middle-school: #a0192a;/* Middle School color */
     --high-school: #1a2d58;  /* High School color */
   }
   ```

2. **Fonts**: Update font families in [index.html](index.html#L8)
   - Currently uses: Bebas Neue (headings) and DM Sans (body)
   - Change Google Fonts link to use your school's fonts

3. **School Logo**: Update logo URL in header section [index.html](index.html#L1037)

4. **Division Names**: Customize division names (e.g., "Lower School" instead of "Elementary")

See [branding.md](branding.md) for SAS's branding guidelines as an example.

### Department Icons
Icons are automatically assigned based on department names in [index.html](index.html#L1478-L1500):
- Technology/IT → Monitor
- English/Language → Book
- Math → Calculator
- Science → Flask
- Arts/Music → Palette
- PE/Athletics → Activity
- Library → Library
- Counseling → Heart

Add your own department icon mappings in the `getDepartmentIcon()` function.

## 🔒 Security & Privacy

- **Domain Restricted**: Web app access can be limited to your domain in [appsscript.json](appsscript.json#L8)
- **@OnlyCurrentDoc**: Limited to current document permissions in [Code.js](Code.js#L2)
- **No Data Storage**: No persistent data storage in Apps Script
- **Read-Only Sheet Access**: Real-time data from Google Sheets
- **Script Properties**: Configuration stored securely, not in code

**Customizing Access:**
- Change `access` in [appsscript.json](appsscript.json#L8) from `DOMAIN` to `ANYONE` for public access
- Or keep `DOMAIN` and update to your school's Google Workspace domain

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

## 🗺️ Roadmap

This project follows a phased development approach:

- **✅ Phase 1 & 2**: Enterprise apps section, search functionality, audience tags
- **✅ Phase 3**: Enhanced cards with logos, grade badges, "What's New" section, detail modal
- **✅ Phase 4 (Partial)**: AI-powered search with Gemini/Claude integration, content moderation, app request guidance
- **🔮 Phase 5**: User favorites, ratings/reviews, usage analytics, dark mode, Google Workspace SSO

### Phase 4: AI-Powered Features (Implemented)

The dashboard now includes intelligent natural language search powered by Google's Gemini API or Anthropic's Claude API:

- **Smart App Recommendations**: Ask questions like "What can I use for collaborative writing with 8th graders?"
- **AI Safety Guardrails**: Closed system ensures AI only recommends apps from your database
- **Content Moderation**: Filters harmful, inappropriate, or off-topic requests
- **App Request Guidance**: Provides structured guidance when requested apps aren't available
- **Dual API Support**: Works with both Gemini and Claude AI providers
- **Automatic Logging & Analytics**: Tracks AI queries and data enrichment operations for audit trails and pattern analysis

**Setup**: Add `GEMINI_API_KEY` or `CLAUDE_API_KEY` to Script Properties. See [AI_FEATURES.md](AI_FEATURES.md) for complete documentation.

**Logging Features**:
- **Update Logs**: Auto-tracks all data enrichment operations with before/after values
- **AI Chat Analytics**: Logs user queries, categorizes by type, and identifies search patterns
- **Pattern Analysis**: Built-in menu tool analyzes chat logs to discover missing apps users are searching for

See [UPCOMING_FEATURES.md](UPCOMING_FEATURES.md) for Phase 5 plans.

## 🤝 Contributing

We welcome contributions from schools and developers! This is an open-source project designed to benefit the entire education community.

**How to Contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Test changes locally by opening `index.html`
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

**Contribution Ideas:**
- New UI themes and branding options
- Additional department icon mappings
- Internationalization/translations
- Performance improvements
- Bug fixes and documentation improvements

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

**You are free to:**
- Use this software for any purpose (commercial or non-commercial)
- Modify the code to fit your needs
- Distribute the software
- Sublicense the software

## 📞 Support & Community

**Getting Help:**
- 📖 Read [CLAUDE.md](CLAUDE.md) for comprehensive technical documentation
- 🐛 Report bugs via [GitHub Issues](https://github.com/SAS-Technology-Innovation/digital-toolkit/issues)
- 💡 Request features via [GitHub Issues](https://github.com/SAS-Technology-Innovation/digital-toolkit/issues)
- 📧 For SAS-specific support: [edtech@sas.edu.sg](mailto:edtech@sas.edu.sg)

**For Other Schools:**
- This project is free to use and customize for your institution
- We'd love to hear how you're using it! Share your implementation via GitHub Discussions
- Consider contributing improvements back to the project

## 🙏 Acknowledgments

- **Singapore American School Technology & Innovation Team** - Original development
- **Open-source community** - For tools and inspiration
- **Educational institutions** worldwide - For feedback and feature ideas

---

**Developed with ❤️ by the Singapore American School Technology & Innovation Team**

*Made free and open-source to benefit schools worldwide*
