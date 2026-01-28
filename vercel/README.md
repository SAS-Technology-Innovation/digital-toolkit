# SAS Digital Toolkit - Next.js Frontend

A modern Next.js application for the SAS Digital Toolkit, providing a dashboard for educational technology resources at Singapore American School.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4 with Shadcn/UI components
- **Database**: Supabase (PostgreSQL + Realtime)
- **Authentication**: Supabase Auth with Magic Links
- **AI**: Claude API integration for intelligent search and summaries
- **Deployment**: Vercel

## Features

### Core Pages
- **Dashboard** (`/`) - Division-based view of apps (Whole School, Elementary, Middle, High School)
- **App Catalog** (`/apps`) - Searchable catalog with filters (category, department, audience, division)
- **Request App** (`/requests`) - Form to request new applications
- **Status** (`/status`) - Real-time app status monitoring
- **Analytics** (`/analytics`) - Usage analytics and insights
- **Admin** (`/admin`) - Data sync and management
- **Signage** (`/signage`) - Digital signage display
- **Help** (`/help`) - Help center with documentation

### Renewal Assessment Workflow
The toolkit includes a complete renewal assessment workflow for managing educational software subscriptions:

- **Submit Assessment** (`/renewal/submit`) - Public form for teachers to provide feedback on apps they use
- **All Renewals** (`/renewals`) - View all app renewals and subscription status
- **TIC Review** (`/renewals/tic-review`) - TIC dashboard to review teacher feedback and make recommendations
- **Approver Decisions** (`/renewals/approver`) - Director/Approver dashboard to make final renewal decisions
- **Admin Assessments** (`/admin/renewals`) - Admin view of all assessment submissions

### User Roles & Permissions

The system uses role-based access control (RBAC) with four tiers:

| Role | Description | Permissions |
|------|-------------|-------------|
| **Staff** | Regular users | Browse apps, submit assessments, request new apps |
| **TIC** | Technology & Innovation Coordinator | All Staff + review assessments, generate AI summaries, make recommendations |
| **Approver** | Director/Decision maker | All TIC + make final decisions, set subscription terms |
| **Admin** | EdTech team | All Approver + delete assessments, manage users, mark implemented |

User profiles are automatically created on first assessment submission. Role upgrades require EdTech team approval.

### Authentication
- Magic link authentication via Supabase
- Protected routes (Admin, Renewals require login)
- User avatar and sign-out in sidebar
- Email domain restriction (@sas.edu.sg)

### AI Features
- AI-powered search with natural language queries
- Intelligent app recommendations
- AI-generated summaries of teacher feedback for renewal decisions
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
│   │   │   │   └── renewals/   # Admin assessments view
│   │   │   ├── analytics/      # Analytics
│   │   │   ├── renewals/       # Renewals management
│   │   │   │   ├── page.tsx    # All renewals
│   │   │   │   ├── tic-review/ # TIC review dashboard
│   │   │   │   └── approver/   # Approver decisions
│   │   │   ├── requests/       # Request form
│   │   │   ├── status/         # Status page
│   │   │   ├── help/           # Help center
│   │   │   └── layout.tsx      # Dashboard layout with sidebar
│   │   ├── api/                # API routes
│   │   │   ├── ai/             # AI chat endpoint
│   │   │   ├── apps/           # Apps CRUD endpoints
│   │   │   ├── data/           # Apps data endpoint
│   │   │   ├── renewal-assessments/  # Assessment CRUD
│   │   │   ├── renewal-decisions/    # Decision CRUD
│   │   │   ├── renewal-data/   # Renewal data endpoint
│   │   │   ├── status/         # Status endpoint
│   │   │   └── sync/           # Supabase sync endpoint
│   │   ├── auth/               # Auth callback
│   │   ├── login/              # Login page
│   │   ├── renewal/            # Public renewal pages
│   │   │   ├── page.tsx        # Renewal info/help
│   │   │   └── submit/         # Public submission form
│   │   ├── signage/            # Signage display
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn/UI components
│   │   ├── ai/                 # AI chat components
│   │   ├── app-card.tsx        # App card component
│   │   ├── app-detail-modal.tsx# App detail modal
│   │   └── app-sidebar.tsx     # Navigation sidebar
│   ├── lib/                    # Utilities
│   │   ├── auth/               # Auth context & RBAC
│   │   │   ├── auth-context.tsx# Auth provider
│   │   │   └── rbac.ts         # Role-based access control
│   │   ├── supabase/           # Supabase clients
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server clients
│   │   │   └── types.ts        # Database types
│   │   └── utils.ts            # Helper functions
│   └── hooks/                  # Custom React hooks
├── public/                     # Static assets
│   └── assets/                 # Images and icons
├── supabase/                   # Supabase config & migrations
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

### Core APIs
| Route | Method | Description |
|-------|--------|-------------|
| `/api/data` | GET | Fetch apps data (from Apps Script or Supabase) |
| `/api/ai` | POST | AI chat completion |
| `/api/renewal-data` | GET | Fetch renewal data |
| `/api/status` | GET | Fetch app status |
| `/api/sync` | POST | Sync data with Supabase |

### Renewal Assessment APIs
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/renewal-assessments` | GET | Any | List assessments (filterable) |
| `/api/renewal-assessments` | POST | Public | Create assessment (validates @sas.edu.sg) |
| `/api/renewal-assessments/[id]` | GET | Any | Get assessment details |
| `/api/renewal-assessments/[id]` | PATCH | TIC+ | Update assessment status |
| `/api/renewal-assessments/[id]` | DELETE | Admin | Delete assessment |

### Renewal Decision APIs
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/renewal-decisions` | GET | Any | List decisions |
| `/api/renewal-decisions` | POST | Any | Create/update decision (aggregate assessments) |
| `/api/renewal-decisions/[id]` | GET | Any | Get decision with assessments |
| `/api/renewal-decisions/[id]` | PATCH | Varies | Update decision (role-based) |
| `/api/renewal-decisions/[id]` | DELETE | Admin | Delete decision |

### PATCH Actions for Decisions
| Action | Required Role | Description |
|--------|---------------|-------------|
| `tic_review` | TIC+ | Submit TIC recommendation |
| `generate_summary` | TIC+ | Trigger AI summary |
| `director_decision` | Approver+ | Make final decision |
| `implement` | Admin | Mark as implemented |

## Renewal Workflow

```
Teacher Submits → AI Aggregates → TIC Reviews → Approver Decides → Implemented
   (Staff)        (automatic)       (TIC)        (Director)        (Admin)
```

### Status Flow
1. **collecting** - Gathering teacher feedback
2. **summarizing** - AI generating summary
3. **assessor_review** - TIC reviewing
4. **final_review** - Awaiting director decision
5. **decided** - Decision made
6. **implemented** - Changes applied

## Deployment

Deployed automatically via Vercel on push to `main` branch.

### Vercel Configuration
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## Database Schema

### Key Tables
- `apps` - Application catalog
- `user_profiles` - User profiles with roles
- `renewal_assessments` - Teacher assessment submissions
- `renewal_decisions` - Aggregated decisions with TIC/Approver input

See `supabase/migrations/` for full schema definitions.

## Related

- [Root README](../README.md) - Main project documentation
- [Apps Script Backend](../) - Google Apps Script data source
- [CLAUDE.md](../CLAUDE.md) - AI assistant instructions
