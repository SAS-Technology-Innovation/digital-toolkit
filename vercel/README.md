# SAS Digital Toolkit - Next.js Frontend

A modern Next.js application for the SAS Digital Toolkit, providing a dashboard for educational technology resources at Singapore American School.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4 with Shadcn/UI components
- **Database**: Supabase (PostgreSQL + Realtime)
- **Authentication**: Supabase Auth with Magic Links
- **AI**: Claude API integration for intelligent search
- **Deployment**: Vercel

## Features

### Core Pages
- **Dashboard** (`/`) - Division-based view of apps (Whole School, Elementary, Middle, High School)
- **App Catalog** (`/apps`) - Searchable catalog with filters (category, department, audience, division)
- **Request App** (`/requests`) - Form to request new applications
- **Status** (`/status`) - Real-time app status monitoring
- **Renewals** (`/renewals`) - Subscription renewal management
- **Analytics** (`/analytics`) - Usage analytics and insights
- **Admin** (`/admin`) - Data sync and management
- **Signage** (`/signage`) - Digital signage display

### Authentication
- Magic link authentication via Supabase
- Protected routes (Admin requires login)
- User avatar and sign-out in sidebar

### AI Features
- AI-powered search with natural language queries
- Intelligent app recommendations
- Chat interface for assistance

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SECRET_KEY=your_service_role_key

# Apps Script Backend (optional, for legacy data)
APPS_SCRIPT_URL=your_apps_script_url
FRONTEND_KEY=your_frontend_key

# AI
ANTHROPIC_API_KEY=your_claude_api_key
```

### Installation

```bash
cd vercel
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Project Structure

```
vercel/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (dashboard)/        # Dashboard route group
│   │   │   ├── page.tsx        # Main dashboard
│   │   │   ├── apps/           # App catalog
│   │   │   ├── admin/          # Admin panel
│   │   │   ├── analytics/      # Analytics
│   │   │   ├── renewals/       # Renewals
│   │   │   ├── requests/       # Request form
│   │   │   ├── status/         # Status page
│   │   │   └── layout.tsx      # Dashboard layout with sidebar
│   │   ├── api/                # API routes
│   │   │   ├── ai/             # AI chat endpoint
│   │   │   ├── data/           # Apps data endpoint
│   │   │   ├── renewal-data/   # Renewal data endpoint
│   │   │   ├── status/         # Status endpoint
│   │   │   └── sync/           # Supabase sync endpoint
│   │   ├── auth/               # Auth callback
│   │   ├── login/              # Login page
│   │   ├── signage/            # Signage display
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn/UI components
│   │   ├── ai/                 # AI chat components
│   │   ├── app-card.tsx        # App card component
│   │   ├── app-detail-modal.tsx# App detail modal
│   │   └── app-sidebar.tsx     # Navigation sidebar
│   ├── lib/                    # Utilities
│   │   ├── auth/               # Auth context
│   │   ├── supabase/           # Supabase clients
│   │   └── utils.ts            # Helper functions
│   └── hooks/                  # Custom React hooks
├── public/                     # Static assets
│   └── assets/                 # Images and icons
├── supabase/                   # Supabase config
└── package.json
```

## Component Library

Uses [Shadcn/UI](https://ui.shadcn.com/) with custom themed components:

### Custom Components
- `AppCard` - Displays app info with colored badges
- `AppDetailModal` - Full app details modal
- `AudienceBadge` - Color-coded audience tags (Teachers, Students, Staff, Parents)
- `CategoryBadge` - Color-coded category tags
- `DivisionSection` - Division-themed section containers

### SAS Brand Colors
- Primary Blue: `#1a2d58`
- SAS Red: `#a0192a`
- Eagle Yellow: `#fabc00`
- Elementary: `#228ec2`

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/data` | GET | Fetch apps data (from Apps Script or mock) |
| `/api/ai` | POST | AI chat completion |
| `/api/renewal-data` | GET | Fetch renewal data |
| `/api/status` | GET | Fetch app status |
| `/api/sync` | POST | Sync data with Supabase |

## Deployment

Deployed automatically via Vercel on push to `main` branch.

### Vercel Configuration
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## Related

- [Root README](../README.md) - Main project documentation
- [Apps Script Backend](../appsscript/) - Google Apps Script data source
- [CLAUDE.md](../CLAUDE.md) - AI assistant instructions
