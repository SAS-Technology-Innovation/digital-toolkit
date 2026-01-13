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
- **Smart Categorization** - Enterprise Apps, Apps Everyone Can Use, Department-Specific Apps
- **Enhanced App Cards** - Logos, grade levels, "NEW" badges, audience tags, SSO/mobile indicators
- **Powerful Search** - Real-time filtering across name, category, subject, department, audience
- **App Details Modal** - Comprehensive information with descriptions, renewal dates, tutorials

### Additional Pages

- **App Catalog** (`/apps`) - Searchable catalog with filters
- **Request App** (`/requests`) - Form to request new applications
- **Status** (`/status`) - Real-time app status monitoring
- **Renewals** (`/renewals`) - Subscription renewal management
- **Analytics** (`/analytics`) - Usage analytics and insights
- **Admin** (`/admin`) - Data sync and management (requires login)
- **Signage** (`/signage`) - Digital signage display for screens

### Authentication

- Magic link authentication via Supabase
- @sas.edu.sg domain restriction
- Protected routes for admin pages

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
| Database | Supabase (PostgreSQL), Google Sheets |
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
- Google Account with Apps Script access
- Supabase account
- Vercel account (for deployment)

### 1. Clone Repository

```bash
git clone https://github.com/SAS-Technology-Innovation/digital-toolkit.git
cd digital-toolkit
```

### 2. Setup Frontend

```bash
cd vercel
npm install
cp .env.local.example .env.local
# Edit .env.local with your credentials
npm run dev
```

### 3. Setup Backend (Apps Script)

```bash
cd appsscript
npm install
npm run login
npx @google/clasp clone "YOUR_SCRIPT_ID"
npm run push
npm run deploy
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
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
```

### Backend Commands

```bash
cd appsscript
npm run push     # Push to Apps Script
npm run deploy   # Create deployment
npm run logs     # View logs
npm run open     # Open in browser
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
