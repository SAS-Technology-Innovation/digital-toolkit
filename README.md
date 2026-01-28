# SAS Digital Toolkit

A modern web application for managing and showcasing educational technology applications at Singapore American School. Built with Next.js and Google Apps Script.

**Live Demo**: [https://sas-digital-toolkit.vercel.app](https://sas-digital-toolkit.vercel.app)

## Overview

The Digital Toolkit Dashboard provides an elegant interface for organizing and discovering educational applications across school divisions. Apps are automatically categorized by division (Whole School, Elementary, Middle School, High School) with smart filtering, department grouping, and powerful search.

**Perfect for:**

- Schools managing multiple educational apps and licenses
- Technology directors tracking software inventory and renewals
- Teachers and staff discovering available tools
- Parents understanding school technology resources

## Features

### Dashboard

- **Division-Based Organization** - Whole School, Elementary, Middle School, High School tabs
- **My Apps Tab** - View apps you own or champion (when logged in)
- **Smart Categorization** - Enterprise Apps, Apps Everyone Can Use, Department-Specific Apps
- **Enhanced App Cards** - Logos, grade levels, "NEW" badges, audience tags, SSO/mobile indicators
- **Powerful Search** - Real-time filtering across name, category, subject, department, audience
- **App Details Modal** - Comprehensive information with team assignments, descriptions, tutorials

### App Ownership System

- **App Roles** - Owner, Champion, TIC Manager assignments per app
- **Team Management** - View and manage app team from detail modal
- **My Apps View** - Dashboard tab showing apps you're responsible for
- **Role Constraints** - Single Owner and TIC Manager, multiple Champions allowed

### Additional Pages

- **App Catalog** (`/apps`) - Searchable catalog with filters
- **Request App** (`/requests`) - Form to request new applications
- **Status** (`/status`) - Real-time app status monitoring
- **Renewals** (`/renewals`) - Subscription renewal management with workflow
- **Analytics** (`/analytics`) - Usage analytics and insights
- **Admin** (`/admin`) - Data sync, duplicate management, and data tools
- **User Management** (`/admin/users`) - Manage users, roles, and accounts
- **Help Center** (`/help`) - Documentation, FAQs, and user guides
- **About** (`/about`) - Information about the Digital Toolkit
- **Signage** (`/signage`) - Digital signage display for screens

### Admin Features

- **Notion-Style Inline Editing** - Click any cell to edit directly in the data table (TIC/Admin roles)
- **50+ Editable Fields** - Product info, contracts, costs, compliance, contacts, and more
- **Field-Aware Editors** - Text, number, date, select, boolean, URL, textarea, and multi-select editors
- **Data Sync** - Bidirectional sync between Supabase and Google Sheets
- **Duplicate Management** - Detect and remove duplicate app records
- **EdTech Impact Integration** - Import assessment data, ratings, and compliance info
- **Export** - Download app data as CSV
- **Sync Logs** - View sync history and status

### Authentication & User Management

- **Multiple Sign-in Methods**: Magic links (passwordless) and password authentication
- **Self-Service Registration**: Users can create accounts with @sas.edu.sg emails
- **Password Reset**: Secure password recovery via email
- **User Management**: Admins can manage users, roles, and account status
- **Role-Based Access Control**: Staff, TIC, Approver, and Admin roles
- **Domain Restriction**: @sas.edu.sg emails only
- **Protected Routes**: Admin pages require authentication

### AI Features

- AI-powered search with natural language queries
- Intelligent app recommendations
- Chat interface for assistance

## Tech Stack

| Component | Technology |
| --- | --- |
| Frontend | Next.js 16 with App Router |
| Styling | Tailwind CSS v4, Shadcn/UI |
| Authentication | Supabase Auth (Magic Links) |
| Database | Supabase (PostgreSQL) — primary; Google Sheets (sync target) |
| AI | Claude API |
| Deployment | Vercel |
| Backend API | Google Apps Script |

## Project Structure

```
digital-toolkit/
├── vercel/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/            # App Router pages and API routes
│   │   ├── components/     # React components (Shadcn/UI + custom)
│   │   ├── lib/            # Utilities, auth context, Supabase clients
│   │   └── middleware.ts   # Auth middleware
│   └── public/             # Static assets
├── appsscript/             # Google Apps Script backend
│   ├── Code.js             # Main entry point
│   ├── ai-functions.js     # AI integrations
│   └── utilities.js        # Helper functions
├── docs/                   # Additional documentation
├── CLAUDE.md               # Developer guide for Claude Code
└── README.md               # This file
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker Desktop (for local Supabase)
- Google Account with Apps Script access
- Supabase account
- Vercel account (for deployment)

### 1. Clone Repository

```bash
git clone https://github.com/SAS-Technology-Innovation/digital-toolkit.git
cd digital-toolkit
```

### 2. Install Dependencies

```bash
# Install all dependencies (root + vercel)
npm run setup

# Install CLI tools globally (optional)
npm run setup:cli
```

### 3. Setup Frontend

```bash
cd vercel
cp .env.local.example .env.local
# Edit .env.local with your credentials
npm run dev
```

### 4. Setup Backend (Apps Script)

```bash
# From project root
npm run clasp:login
npm run clasp:push
```

### 5. Local Supabase (Optional)

```bash
# Requires Docker Desktop
npm run supabase:start   # Start local Supabase
npm run supabase:status  # Check status
# Studio at http://localhost:54323
```

### 4. Configure Environment Variables

**Vercel (.env.local):**

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SECRET_KEY=your_service_role_key
APPS_SCRIPT_URL=your_apps_script_url
FRONTEND_KEY=your_frontend_key
ANTHROPIC_API_KEY=your_claude_api_key
```

**Apps Script (Script Properties):**

- `SPREADSHEET_ID` - Your Google Sheets ID
- `SHEET_NAME` - Sheet name (e.g., "Apps")
- `FRONTEND_KEY` - Shared secret for API auth
- `GEMINI_API_KEY` - For AI features
- `CLAUDE_API_KEY` - For data enrichment

## Development

### Frontend Commands

```bash
cd vercel
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # Run ESLint
npm run test:run      # Run tests
```

### Backend Commands (from project root)

> ⚠️ **CRITICAL: NEVER use `clasp deploy`** - Only use `clasp push`. Creating new deployments breaks production.

```bash
npm run clasp:push    # Push to Apps Script (ONLY use this for updates)
npm run clasp:pull    # Pull from Apps Script
npm run clasp:logs    # View logs
npm run clasp:open    # Open in browser

# ❌ NEVER create new deployments - the URL must stay constant
```

**Production Apps Script URL (FINAL):**
```
https://script.google.com/macros/s/AKfycbwa6PVAO9kzsNqluKYXftwDuOAPFTsIB7elk3IG-SuA95xZlMIOSW_VH5yt-Ic_vbYv/exec
```

### Supabase Commands (from project root)

```bash
npm run supabase:start         # Start local Supabase
npm run supabase:stop          # Stop local Supabase
npm run supabase:db:push       # Push migrations to remote
npm run supabase:migration:new # Create new migration
```

### Google Sheets Sync (from project root)

```bash
npm run sheets:pull   # Download data to local CSV/JSON
npm run sheets:push   # Push local changes to Google Sheets
```

## Documentation

- [vercel/README.md](vercel/README.md) - Frontend documentation
- [CLAUDE.md](CLAUDE.md) - Developer guide and architecture details
- [docs/](docs/) - Additional documentation

## SAS Branding

The application uses SAS brand colors:

- Primary Blue: `#1a2d58`
- SAS Red: `#a0192a`
- Eagle Yellow: `#fabc00`
- Elementary: `#228ec2`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

---

**Developed by the Singapore American School Technology & Innovation Team**
