# SAS Digital Toolkit Dashboard

A **free, open-source** Google Apps Script web application for schools to manage and showcase their educational technology stack. Originally developed for Singapore American School, this dashboard can be easily customized for any educational institution.

**Live Demo**: [https://sas-digital-toolkit.vercel.app](https://sas-digital-toolkit.vercel.app)

---

## 🎯 Overview

The Digital Toolkit Dashboard provides an elegant, user-friendly interface for organizing and discovering educational applications across your school. Apps are automatically categorized by school divisions (Whole School, Elementary, Middle School, High School) with smart filtering, department grouping, and powerful search capabilities.

**Perfect for:**

- Schools managing multiple educational apps and licenses
- Technology directors tracking software inventory and renewals
- Teachers and staff discovering available tools
- Parents understanding school technology resources
- Budget planning and license management

---

## ✨ Key Features

### 📚 Main Dashboard

- **Division-Based Organization**: Whole School, Elementary, Middle School, High School
- **Smart Categorization**:
  - Enterprise Apps (premium core tools)
  - Apps Everyone Can Use (site/school licenses)
  - Department-Specific Apps (grouped with counts)
- **Enhanced App Cards**:
  - App logos for visual recognition
  - Grade level badges
  - "NEW" badges for recently added apps (last 30 days)
  - Audience tags (Teachers, Students, Parents, Staff)
  - SSO and mobile app indicators
- **Powerful Search**: Real-time filtering across name, category, subject, department, audience
- **App Details Modal**: Comprehensive information including descriptions, renewal dates, features, and tutorial links
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 🤖 AI-Powered Features

- **Natural Language Search**: Ask questions like "What can I use for collaborative writing with 8th graders?"
- **Smart Recommendations**: AI analyzes grade levels, subjects, SSO, mobile support, and audience
- **Dual AI Provider Support**: Google Gemini (user-facing) and Anthropic Claude (admin data enrichment)
- **Safety Guardrails**: Closed system ensures AI only recommends apps from your database
- **App Request Guidance**: Structured guidance when requested apps aren't available

See [docs/AI_FEATURES.md](docs/AI_FEATURES.md) for complete AI integration guide.

### 💼 App Renewal Management

Password-protected admin dashboard for managing subscription renewals:

- **Timeline View**: Apps organized by renewal urgency (Overdue, Urgent, Upcoming, Future)
- **Advanced Table View**: Sortable columns with multi-dimensional filtering
- **Cost Tracking**: Real-time calculation of total costs, renewals, and potential savings
- **Comparison Mode**: Side-by-side app comparison for decision making
- **Bulk Actions**: Mark multiple apps for renewal, modification, or retirement
- **Action Persistence**: All decisions saved to Google Sheets with timestamps
- **Two-Stage Loading**: Ultra-fast initial load (~100ms) with progressive enhancement

### 📺 Digital Signage Display

Full-screen auto-advancing slideshow for display boards:

- **Purpose-Driven Slides**: Showcases WHY and HOW apps support learning
- **Division Highlights**: Dedicated slides for each school division
- **Auto-Refresh**: Fetches fresh data every 5 minutes
- **Category Showcase**: Apps grouped by category with messaging
- **Customizable**: Configurable slide duration, refresh interval, and apps per slide

Access via `?page=signage` URL parameter.

### 🔧 Data Management Tools

Google Sheets admin menu for data quality control:

- **Data Validation**: Check for missing required fields
- **AI Data Enrichment**: Auto-generate descriptions, categories, audience, grade levels
- **CSV/XLSX Import**: Direct import from EdTech Impact platform exports
- **Update Logging**: Complete audit trail of all data changes
- **Analytics**: AI chat pattern analysis to discover missing apps

See [docs/DATA_MANAGEMENT.md](docs/DATA_MANAGEMENT.md) for complete workflows.

---

## 🏗️ Architecture

**Technology Stack:**

- **Backend**: Google Apps Script (JavaScript V8 runtime)
- **Frontend**: Vercel (Edge Config + Serverless Functions)
- **Styling**: Tailwind CSS via CDN
- **Icons**: Lucide Icons
- **Data Source**: Google Sheets
- **AI**: Google Gemini API (user-facing), Anthropic Claude API (admin)

**Data Flow:**

```
Google Sheets → Apps Script Backend → Edge Config (minimal data)
                                   ↓
                            Vercel Frontend (fast initial load)
                                   ↓
                            Apps Script (detailed data in background)
```

**Two-Stage Loading Architecture:**

1. **Stage 1 (Edge Config)**: ~100-200ms
   - Minimal fields: product, division, department, subjects
   - Enables immediate filtering and search
   - Served from global CDN edge locations

2. **Stage 2 (Apps Script)**: ~1-2 seconds (background)
   - Detailed fields: costs, logos, descriptions, renewal dates
   - Progressive enhancement doesn't block UI
   - Graceful degradation if fails

---

## 🚀 Quick Start

### Prerequisites

- Google Account with access to Google Apps Script
- Google Sheets document with application data
- Node.js 18+ installed
- Vercel account (for production deployment)

### 1. Clone and Setup

```bash
git clone https://github.com/SAS-Technology-Innovation/digital-toolkit.git
cd digital-toolkit
npm install
```

### 2. Google Apps Script Setup

1. Create a new Google Apps Script project
1. Get your Script ID from Project Settings → IDs
1. Clone your project:

   ```bash
   npx @google/clasp clone "YOUR_SCRIPT_ID"
   npm run login
   ```

1. Configure Script Properties (Project Settings → Script Properties):

| Property | Description | Required |
|----------|-------------|----------|
| `SPREADSHEET_ID` | Your Google Sheets ID | ✅ |
| `SHEET_NAME` | Sheet name (e.g., "Apps") | ✅ |
| `FRONTEND_KEY` | Shared secret for Vercel API auth | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | For AI features |
| `CLAUDE_API_KEY` | Anthropic Claude API key | For data enrichment |
| `RENEWAL_PASSWORD` | Password for renewal page | For renewal features |

### 3. Google Sheets Structure

Create a sheet with these 22 columns (see [expected-data-template.csv](expected-data-template.csv)):

1. `active` (Boolean) - TRUE/FALSE
2. `product_name` (String) - App name
3. `division` (String) - SAS Elementary School, SAS Middle School, etc.
4. `grade_levels` (String) - Pre-K, Kindergarten, Grade 1, Grade 2, ...
5. `department` (String) - Department name
6. `subjects` (String) - Subject areas
7. `enterprise` (Boolean) - Official core tool flag
8. `budget` (String) - Office Of Learning, IT Operations, etc.
9. `audience` (String) - Teachers, Students, Parents, Staff
10. `license_type` (String) - Site Licence, Individual, Enterprise
11. `licence_count` (Number/String) - Number of licenses or "Unlimited"
12. `value` (Number) - Annual cost
13. `date_added` (Date) - YYYY-MM-DD
14. `renewal_date` (Date) - YYYY-MM-DD
15. `category` (String) - App category
16. `website` (String) - App URL
17. `description` (String) - 1-2 sentence description
18. `support_email` (String) - Support contact
19. `tutorial_link` (String) - Training URL
20. `mobile_app` (String) - Yes, No, iOS/Android
21. `sso_enabled` (Boolean) - TRUE/FALSE
22. `logo_url` (String) - App logo URL

**💡 Tip:** Download [expected-data-template.csv](expected-data-template.csv) for a complete example.

### 4. Deploy Apps Script

```bash
# Push code to Apps Script
cd appsscript
npm run push

# Create deployment
npm run deploy
```

Save your deployment URL - you'll need it for Vercel.

### 5. Deploy to Vercel

1. Connect GitHub repository to Vercel
1. Set environment variables in Vercel dashboard:

   | Variable | Value |
   |----------|-------|
   | `APPS_SCRIPT_URL` | Your Apps Script web app URL |
   | `FRONTEND_KEY` | Same secret from Script Properties |
   | `RENEWAL_PASSWORD` | Password for /renewal page |
   | `EDGE_CONFIG` | Edge Config connection string (auto-created) |

1. Deploy (automatic via GitHub integration)

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

---

## 🔧 Development

### Available Commands

#### Apps Script Development

```bash
# Authentication
npm run login                    # Login to Google Apps Script
npx @google/clasp logout         # Logout

# Code Management
npm run push                     # Push code changes to Apps Script
npm run pull                     # Pull latest code from Apps Script
npx @google/clasp push --force   # Force push (overwrite remote)
npx @google/clasp status         # Show files that will be pushed

# Deployments
npm run deploy                   # Create new deployment
npx @google/clasp deployments   # List all deployments
npx @google/clasp undeploy <id> # Delete a deployment
npx @google/clasp redeploy <id> # Update existing deployment

# Monitoring & Debugging
npm run logs                     # View execution logs
npx @google/clasp logs --tail    # Tail logs in real-time
npm run open                     # Open Apps Script editor in browser

# Project Information
npx @google/clasp list           # List all your Apps Script projects
npx @google/clasp versions       # List versions of current script

# Testing (from Google Sheets UI)
# Open your Google Sheets → 🤖 Digital Toolkit Admin menu
# - 🧪 Test Claude Connection
# - 🧪 Test Gemini Connection
```

#### Vercel Development

```bash
vercel             # Deploy to Vercel preview
vercel --prod      # Deploy to production
vercel logs        # View deployment logs
vercel env         # Manage environment variables
```

### Project Structure

```text
digital-toolkit/
├── appsscript/              # Google Apps Script backend
│   ├── Code.js              # Main entry point
│   ├── ai-functions.js      # AI provider integrations
│   ├── utilities.js         # Helper functions
│   ├── data-management.js   # Data enrichment
│   └── appsscript.json      # Apps Script config
├── vercel/                  # Vercel frontend
│   ├── index.html           # Main dashboard
│   ├── renewal.html         # Renewal management page
│   ├── signage.html         # Digital signage display
│   └── api/                 # Serverless functions
│       ├── data.js          # Main data API
│       ├── renewal-data.js  # Minimal renewal data (Edge)
│       ├── renewal-details.js # Detailed renewal data
│       ├── save-renewal-action.js
│       ├── verify-password.js
│       └── ai.js            # AI API proxy
├── docs/                    # Documentation
│   ├── DEPLOYMENT.md        # Deployment guide
│   ├── AI_FEATURES.md       # AI integration docs
│   └── DATA_MANAGEMENT.md   # Data workflows
├── .github/workflows/       # GitHub Actions
│   └── deploy.yml           # Auto-deploy Apps Script
├── CHANGELOG.md             # Version history
├── CLAUDE.md                # Claude Code dev guide
└── README.md                # This file
```

### GitHub Actions

Automatic deployment on push to `main` branch:

1. **Setup secrets** (Settings → Secrets and variables → Actions):
   - `CLASP_CREDENTIALS`: `cat ~/.config/clasp/.clasprc.json`
   - `APPS_SCRIPT_ID`: From Apps Script Project Settings
   - `APPS_SCRIPT_DEPLOYMENT_ID`: From Deploy → Manage deployments

2. **Auto-deploy**: Push to `main` triggers deployment

---

## 📊 Business Logic

### Division Assignment

Apps are categorized based on these rules:

**Three-Tier Hierarchy:**

1. **Enterprise Apps** (Whole School only):
   - `enterprise` column = TRUE
   - Official SAS-approved core tools
   - Premium gold styling

2. **Apps Everyone Can Use**:
   - **Whole School tab**: Site/School/Enterprise/Unlimited licenses
   - **Division tabs**: Division-specific "everyone" apps only
   - Excludes whole school apps from division tabs

3. **Department-Specific Apps**:
   - Individual licenses
   - Grouped by department with counts
   - Filtered to exclude invalid departments

**Whole School Determination:**

An app is "Whole School" if ANY of these are true:

- License type includes: site, school, enterprise, unlimited
- Department is: "school operations" or "school-wide"
- Division includes: "school-wide" or "whole school"
- Listed in all 3 divisions: Elementary AND Middle AND High

**Key Rules:**

- Enterprise apps NEVER appear on division tabs
- Whole school apps do NOT appear in division "Everyone" sections
- Division tabs only show division-specific + department apps

### Department Filtering

- Only valid department names shown as department cards
- Division names (Elementary, Middle, High) filtered out
- Empty, "N/A", or placeholder departments excluded

### Grade Level Inference

When importing data, grade levels are auto-inferred from division:

- Elementary → "Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5"
- Middle School → "Grade 6, Grade 7, Grade 8"
- High School → "Grade 9, Grade 10, Grade 11, Grade 12"
- Multiple divisions → Combined grade list

---

## 🎨 Customization

### SAS Branding

Easily customize for your school:

**1. Colors** (in vercel/index.html):

```css
:root {
  --sas-red: #a0192a;         /* Your primary color */
  --sas-blue: #1a2d58;        /* Your secondary color */
  --sas-yellow: #fabc00;      /* Your accent color */
  --elementary: #228ec2;      /* Elementary color */
  --middle-school: #a0192a;   /* Middle School color */
  --high-school: #1a2d58;     /* High School color */
}
```

**2. Fonts** (Google Fonts link):

- Current: Bebas Neue (headings), DM Sans (body)
- Update font-family in CSS

**3. School Logo**: Update logo URL in header section

**4. Division Names**: Customize (e.g., "Lower School" instead of "Elementary")

### Department Icons

Icons auto-assigned based on keywords in `getDepartmentIcon()`:

- Technology/IT → Monitor
- English/Language → Book
- Math → Calculator
- Science → Flask
- Arts/Music → Palette
- PE/Athletics → Activity
- Library → Library
- Counseling → Heart

Add your own mappings in the function.

---

## 🔒 Security & Privacy

### Access Control

- **Domain Restricted**: Configure in `appsscript.json`
- **Password Protection**: Renewal page requires `RENEWAL_PASSWORD`
- **API Authentication**: `FRONTEND_KEY` validates all API requests
- **HTTPS Only**: All traffic encrypted

### Data Security

- **Read-Only Access**: Apps Script only reads from Google Sheets
- **No Persistent Storage**: No data stored in Apps Script
- **Script Properties**: Secrets stored securely, not in code
- **Audit Trails**: All renewal actions and data changes logged

### Customizing Access

In `appsscript.json`, change `access`:

- `DOMAIN`: Restricted to your Google Workspace domain (recommended)
- `ANYONE`: Public access (use with caution)

---

## 📝 Data Management Workflows

### CSV Import from EdTech Impact

1. Export CSV from EdTech Impact platform
2. Go to Google Sheets → **🤖 Digital Toolkit Admin → 📤 Upload CSV Data**
3. Select update mode (Add & Update recommended)
4. Upload file - system auto-detects format
5. Review statistics and verify import

**Auto-transformations:**

- `Schools` → `Division`
- `Price` → `value` (handles free apps)
- `Budget` → `Department`
- `Status` → `Active` (TRUE/FALSE)
- `Licences` → Infers `License Type`

**Auto-populated fields:**

- `grade_levels`: Inferred from division using AI or rules
- `audience`: "Teachers, Staff" (default)
- `category`: "Apps" (default)
- `enterprise`: FALSE (default)

### AI Data Enrichment

Google Sheets admin menu (requires `CLAUDE_API_KEY`):

- **Validate Data**: Check for missing required fields
- **Find Missing Fields**: Comprehensive report of missing data
- **Enrich Missing Descriptions**: AI-generated descriptions (10 apps/run)
- **Refresh All Missing Data**: Complete enrichment (15 apps/run)
- **Analyze AI Chat Patterns**: Discover missing apps from user searches

### Update Logging

Automatic audit trails:

- **Update Logs**: Tracks all data enrichment operations
- **AI Chat Analytics**: Logs user queries and recommendations
- **Pattern Analysis**: Identifies gaps in app database

See [docs/DATA_MANAGEMENT.md](docs/DATA_MANAGEMENT.md) for complete workflows.

---

## 🐛 Troubleshooting

### Common Issues

**"Script not found" error:**

- Verify `scriptId` in `.clasp.json`
- Ensure you have access to the Apps Script project
- Run `npm run login` to authenticate

**Google Sheets permission error:**

- Check `SPREADSHEET_ID` in Script Properties
- Verify sheet name matches `SHEET_NAME`
- Ensure Apps Script has read access

**Deployment fails:**

- Check Apps Script editor for syntax errors
- Verify all files are valid JavaScript
- Ensure proper OAuth scopes in `appsscript.json`

**Vercel deployment issues:**

- Verify environment variables are set correctly
- Check `FRONTEND_KEY` matches in both Vercel and Apps Script
- Ensure `APPS_SCRIPT_URL` is the correct deployment URL

**Data not loading on renewal page:**

- Check browser console for errors
- Verify Edge Config is populated (or fallback is working)
- Test `/api/renewal-data` endpoint directly

### Getting Help

- 📖 Read [CLAUDE.md](CLAUDE.md) for technical details
- 🐛 Report bugs via [GitHub Issues](https://github.com/SAS-Technology-Innovation/digital-toolkit/issues)
- 💡 Request features via [GitHub Issues](https://github.com/SAS-Technology-Innovation/digital-toolkit/issues)
- 📧 For SAS-specific support: [edtech@sas.edu.sg](mailto:edtech@sas.edu.sg)

---

## 🗺️ Roadmap

### ✅ Implemented Features

- **Phase 1-2**: Enterprise apps, search, audience tags
- **Phase 3**: Logos, grade badges, "What's New", detail modal
- **Phase 4**: AI search, dual AI providers, Vercel deployment, signage redesign
- **Renewal Features**: Timeline view, table view, cost tracking, comparison mode, two-stage loading

### 🔮 Future Enhancements

- User favorites/bookmarks with AI-suggested collections
- Ratings and reviews system
- Usage analytics dashboard
- Dark mode
- Mobile PWA
- AI conversation history persistence
- Multi-language AI support
- Google Workspace SSO integration

---

## 🤝 Contributing

We welcome contributions from schools and developers! This is an open-source project designed to benefit the entire education community.

**How to Contribute:**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Test changes locally
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

**Contribution Ideas:**

- New UI themes and branding options
- Additional department icon mappings
- Internationalization/translations
- Performance improvements
- Bug fixes and documentation improvements

---

## 📄 License

This project is licensed under the **ISC License** - see the LICENSE file for details.

**You are free to:**

- Use this software for any purpose (commercial or non-commercial)
- Modify the code to fit your needs
- Distribute the software
- Sublicense the software

---

## 🙏 Acknowledgments

- **Singapore American School Technology & Innovation Team** - Original development
- **Open-source community** - For tools and inspiration
- **Educational institutions worldwide** - For feedback and feature ideas

---

**Developed with ❤️ by the Singapore American School Technology & Innovation Team**

*Made free and open-source to benefit schools worldwide*
