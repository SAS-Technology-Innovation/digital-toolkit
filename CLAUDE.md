# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Project Overview

The **SAS Digital Toolkit** is a full-stack web application for managing and showcasing educational applications at Singapore American School. The frontend is built with Next.js 16 and deployed to Vercel, while the backend uses Google Apps Script to read from Google Sheets.

**Current Version:** 2.1.1 | [View Releases](/releases) | [Changelog](CHANGELOG.md)

### Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     Vercel (Frontend)                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Next.js 16 App Router                   │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │    │
│  │  │Dashboard │ │App Catalog│ │  Admin   │  ...       │    │
│  │  └──────────┘ └──────────┘ └──────────┘            │    │
│  │  ┌──────────────────────────────────────┐          │    │
│  │  │   Supabase Auth (Magic Links + PWD)   │          │    │
│  │  └──────────────────────────────────────┘          │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              API Routes (/api/*)                     │    │
│  │  /api/data  /api/users  /api/sync  /api/status      │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────┼──────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                Google Apps Script (Backend)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Code.js → getDashboardData(), queryAI(), etc.         │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Google Sheets (Data Source)              │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer          | Technology                                    |
| -------------- | --------------------------------------------- |
| Frontend       | Next.js 16 with App Router, TypeScript        |
| Styling        | Tailwind CSS v4, Shadcn/UI components         |
| Authentication | Supabase Auth (Magic Links + Password)        |
| Database       | Supabase (PostgreSQL) — primary; Google Sheets (sync target) |
| AI             | Claude API (via Apps Script proxy)            |
| Analytics      | Vercel Analytics, Speed Insights              |
| Deployment     | Vercel                                        |
| Backend API    | Google Apps Script                            |

## 📁 Project Structure

```text
digital-toolkit/
├── vercel/                      # Next.js frontend application
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── (dashboard)/     # Dashboard route group (with sidebar)
│   │   │   │   ├── page.tsx     # Main dashboard (/)
│   │   │   │   ├── apps/        # App catalog (/apps)
│   │   │   │   ├── admin/       # Admin panel (/admin) - protected
│   │   │   │   │   └── users/   # User management (/admin/users)
│   │   │   │   ├── analytics/   # Analytics (/analytics)
│   │   │   │   ├── renewals/    # Renewals workflow
│   │   │   │   │   ├── page.tsx         # Renewals dashboard
│   │   │   │   │   ├── submit/          # Submit assessment
│   │   │   │   │   ├── tic-review/      # TIC review page
│   │   │   │   │   └── approver/        # Approver decisions
│   │   │   │   ├── requests/    # Request form (/requests)
│   │   │   │   ├── status/      # Status page (/status)
│   │   │   │   ├── help/        # Help center (/help)
│   │   │   │   ├── about/       # About page (/about)
│   │   │   │   ├── privacy/     # Privacy policy (/privacy)
│   │   │   │   ├── terms/       # Terms of service (/terms)
│   │   │   │   ├── releases/    # Releases/changelog (/releases)
│   │   │   │   └── layout.tsx   # Dashboard layout with sidebar
│   │   │   ├── api/             # API routes
│   │   │   │   ├── ai/route.ts  # AI chat endpoint
│   │   │   │   ├── data/route.ts # Apps data endpoint
│   │   │   │   ├── users/       # User management API
│   │   │   │   │   ├── route.ts       # GET list, POST create
│   │   │   │   │   └── [id]/route.ts  # GET, PATCH, DELETE
│   │   │   │   ├── apps/list/route.ts # Apps dropdown list
│   │   │   │   ├── renewal-data/route.ts
│   │   │   │   ├── status/route.ts
│   │   │   │   └── sync/route.ts # Supabase sync
│   │   │   ├── auth/callback/   # Auth callback handler
│   │   │   ├── login/           # Login page (Magic Link + Password)
│   │   │   ├── register/        # User registration
│   │   │   ├── reset-password/  # Password reset flow
│   │   │   │   ├── page.tsx     # Request reset
│   │   │   │   └── confirm/     # Set new password
│   │   │   ├── renewal/         # Public renewal form (legacy)
│   │   │   ├── signage/         # Signage display (no sidebar)
│   │   │   └── layout.tsx       # Root layout
│   │   ├── components/          # React components
│   │   │   ├── ui/              # Shadcn/UI components
│   │   │   │   ├── data-table.tsx   # Shared DataTable (TanStack) with inline editing
│   │   │   │   ├── editable-cell.tsx # Notion-style inline cell editor
│   │   │   │   ├── switch.tsx   # Toggle switch
│   │   │   │   ├── breadcrumb.tsx
│   │   │   │   └── ...          # Other Shadcn components
│   │   │   ├── app-card.tsx     # App card component
│   │   │   ├── app-detail-modal.tsx
│   │   │   ├── app-sidebar.tsx  # Navigation sidebar
│   │   │   └── dashboard-search.tsx
│   │   ├── lib/                 # Utilities
│   │   │   ├── auth/            # Auth context & RBAC
│   │   │   │   ├── auth-context.tsx
│   │   │   │   └── rbac.ts         # Role-based access control helpers
│   │   │   ├── supabase/        # Supabase clients
│   │   │   │   ├── client.ts    # Browser client
│   │   │   │   ├── server.ts    # Server client
│   │   │   │   └── types.ts     # TypeScript types
│   │   │   ├── field-config.ts  # Centralized field type registry (50+ fields)
│   │   │   ├── app-columns.tsx  # Shared column definitions for all data tables
│   │   │   └── utils.ts         # Helper functions
│   │   ├── hooks/               # Custom React hooks
│   │   ├── __tests__/           # Test files
│   │   └── middleware.ts        # Auth middleware
│   ├── public/assets/           # Static assets (logos, images)
│   ├── supabase/                # Supabase config
│   ├── package.json
│   ├── vitest.config.ts         # Test configuration
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── components.json          # Shadcn/UI config
├── appsscript/                  # Google Apps Script backend
│   ├── Code.js                  # Main entry point
│   ├── ai-functions.js          # AI integrations
│   ├── utilities.js             # Helper functions
│   ├── data-management.js       # Data enrichment
│   └── appsscript.json          # Apps Script config
├── docs/                        # Documentation
├── .clasp.json                  # Google Apps Script project config
├── .mcp.json                    # Supabase MCP configuration
├── CHANGELOG.md                 # Version history
├── CLAUDE.md                    # This file
└── README.md
```

## 🔐 Authentication System

### Overview

- **Provider**: Supabase Auth
- **Methods**: Magic Links (passwordless) AND Password Authentication
- **Domain Restriction**: `@sas.edu.sg` emails only
- **Protected Routes**: `/admin`, `/admin/users` require authentication
- **User Registration**: Self-service with email verification
- **Role-Based Access**: Staff, TIC, Approver, Admin roles

### Key Files

**[vercel/src/lib/auth/auth-context.tsx](vercel/src/lib/auth/auth-context.tsx)**
```typescript
// Auth context provides user state and auth methods
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: SignUpMetadata) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}
```

**[vercel/src/middleware.ts](vercel/src/middleware.ts)**
- Refreshes session on every request
- Protects `/admin` routes (redirects to `/login`)
- Redirects authenticated users from `/login` to home

**[vercel/src/app/auth/callback/route.ts](vercel/src/app/auth/callback/route.ts)**
- Handles magic link verification and password reset
- Exchanges code for session
- Redirects to requested page or home

**[vercel/src/app/login/page.tsx](vercel/src/app/login/page.tsx)**
- Tabbed login form (Magic Link / Password)
- @sas.edu.sg domain validation
- Links to registration and password reset

**[vercel/src/app/register/page.tsx](vercel/src/app/register/page.tsx)**
- User registration with password strength indicator
- Collects name, department, division
- Email verification required

**[vercel/src/app/reset-password/page.tsx](vercel/src/app/reset-password/page.tsx)**
- Request password reset via email

**[vercel/src/app/reset-password/confirm/page.tsx](vercel/src/app/reset-password/confirm/page.tsx)**
- Set new password after clicking email link

### Auth Flows

**Magic Link Flow:**
```
User enters email → Validate @sas.edu.sg domain → Send magic link
       ↓
User clicks link → /auth/callback → Exchange code for session → Redirect
```

**Password Flow:**
```
User enters email + password → Validate credentials → Create session → Redirect
```

**Registration Flow:**
```
User fills form → Validate @sas.edu.sg → Create account → Send verification email
       ↓
User clicks verification link → Account activated → Redirect to login
```

**Password Reset Flow:**
```
User requests reset → Send email → User clicks link → /reset-password/confirm
       ↓
User enters new password → Update password → Redirect to login
```

## 👥 User Management

### Roles & Permissions

| Role | Permissions |
|------|-------------|
| Staff | Browse apps, submit assessments, request apps |
| TIC | + Review assessments, generate AI summaries, make recommendations |
| Approver | + Make final renewal decisions |
| Admin | + Manage users, roles, delete assessments, full system access |

### User Management Page (`/admin/users`)
- View all users with search and filter
- Inline role dropdown for quick changes
- Active/inactive toggle

## 📱 App Ownership System

### App Roles

| Role | Count Per App | Description |
|------|---------------|-------------|
| **Owner** | 1 | Primary responsible person for the app |
| **Champion** | Multiple | Product advocates and experts who support users |
| **TIC Manager** | 1 | Provides technical oversight |

### My Apps Tab

- Appears as first tab on Dashboard when logged in
- Shows all apps user is assigned to
- Grouped by role (Owner, Champion, TIC Manager)
- Color-coded role badges

### Team Management (App Modal)

- View assigned team members in app detail modal
- Admins/TICs can add/remove assignments
- Select role first, then user from dropdown
- Constraints enforce single Owner and TIC Manager per app

## ✏️ Inline Editing (Notion-Style)

The admin data table supports Notion-style inline cell editing. This is built into the shared `DataTable` component so any page using it can opt in.

### Architecture

| File | Purpose |
|------|---------|
| `src/lib/field-config.ts` | Centralized registry of all 50+ app fields — types, labels, widths, dropdown options, formatters |
| `src/components/ui/editable-cell.tsx` | Renders display/edit mode per field type (text, number, date, select, boolean, url, textarea, multiSelect) |
| `src/lib/app-columns.tsx` | Generates `ColumnDef[]` from field config; each cell uses `EditableCell` |
| `src/components/ui/data-table.tsx` | Accepts optional `onCellEdit` + `canEdit` via TanStack Table `meta` |
| `src/app/api/apps/[id]/route.ts` | PATCH endpoint — 40+ allowed fields, `requireRole("tic")` auth |

### How It Works

1. **DataTable** receives `onCellEdit` callback and `canEdit` boolean as props
2. These are passed through TanStack Table's `meta` to cell renderers
3. **EditableCell** reads `meta.canEdit` — if true, clicking a cell opens the appropriate editor
4. On save (Enter/blur), the `onCellEdit` callback PATCHes `/api/apps/{id}` and updates local state
5. Escape cancels, boolean fields save immediately via Switch toggle
6. Non-admin/TIC users see read-only cells with no edit affordances

### Field Types

- **text/url/number/date**: Inline `<Input>`, auto-focused
- **select**: Shadcn `<Select>` dropdown with options from field config
- **boolean**: `<Switch>` — saves immediately on toggle
- **textarea/multiSelect**: Opens in `<Popover>` to avoid distorting row height
- **readonly**: No edit affordance (id, timestamps, sync fields)

### Adding Editing to a New Page

```tsx
<DataTable
  columns={createAppColumns()}
  data={apps}
  onCellEdit={async (rowId, field, value) => {
    await fetch(`/api/apps/${rowId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }}
  canEdit={userRole === "admin" || userRole === "tic"}
/>
```

## 📄 Application Pages

### Dashboard Group (with sidebar)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Division-based app organization |
| `/apps` | App Catalog | Searchable catalog with filters |
| `/requests` | Request App | Form to request new applications |
| `/status` | Status | App health monitoring |
| `/analytics` | Analytics | Usage analytics and insights |
| `/admin` | Admin | Data sync and management |
| `/admin/users` | User Management | Manage users and roles |
| `/renewals` | Renewals Dashboard | App renewal overview |
| `/renewals/submit` | Submit Assessment | Teacher feedback form |
| `/renewals/tic-review` | TIC Review | Review and summarize feedback |
| `/renewals/approver` | Approver Decisions | Final decision making |
| `/help` | Help Center | Documentation and FAQs |
| `/about` | About | Platform information |
| `/releases` | Releases | Version history |
| `/privacy` | Privacy Policy | Data protection info |
| `/terms` | Terms of Service | Usage guidelines |

### Standalone Pages (no sidebar)

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Magic link + password auth |
| `/register` | Register | User registration |
| `/reset-password` | Reset Password | Password recovery |
| `/signage` | Signage | Digital signage display |

## 🔌 API Routes

| Route | Method | Description | Auth |
|-------|--------|-------------|------|
| `/api/data` | GET | Fetch apps data (proxies to Apps Script) | - |
| `/api/ai` | POST | AI chat completion | - |
| `/api/renewal-data` | GET | Fetch renewal data | - |
| `/api/status` | GET | Fetch app status | - |
| `/api/sync` | POST | Sync data with Supabase | - |
| `/api/apps/[id]` | GET | Fetch single app | - |
| `/api/apps/[id]` | PATCH | Update app fields (inline edit) | TIC+ |
| `/api/apps/[id]` | DELETE | Soft delete (retire) app | - |
| `/api/apps/list` | GET | Get apps for dropdown selection | - |
| `/api/app-assignments` | GET | Get assignments (by app_id or my_apps=true) | Auth |
| `/api/app-assignments` | POST | Create assignment | Admin/TIC |
| `/api/app-assignments` | DELETE | Remove assignment (by id) | Admin/TIC |
| `/api/users` | GET | List users | Admin |
| `/api/users` | POST | Create user | Admin |
| `/api/users/[id]` | GET | Get user details | Admin |
| `/api/users/[id]` | PATCH | Update user | Admin |
| `/api/users/[id]` | DELETE | Delete user | Admin |
| `/api/duplicates` | GET | Check for duplicate apps | Admin |
| `/api/duplicates` | POST | Remove duplicate apps | Admin |
| `/api/sheets/csv` | GET | Export Google Sheets as CSV/JSON | - |
| `/api/sheets/update` | POST | Update single field in Google Sheets | - |
| `/api/sheets/update` | PUT | Bulk update Google Sheets | - |

### Data Structure

The `/api/data` route returns division-based data:

```typescript
interface DashboardData {
  wholeSchool: {
    enterprise: App[];
    everyone: App[];
    departments: Record<string, App[]>;
  };
  elementary: { /* same structure */ };
  middleSchool: { /* same structure */ };
  highSchool: { /* same structure */ };
}
```

## 🎨 UI Components

### Shadcn/UI Integration
Components are installed via `npx shadcn@latest add [component]` and stored in `src/components/ui/`.

### Custom Components

**Color-Coded Badge Components:**

| Component | Purpose | Colors |
|-----------|---------|--------|
| `AudienceBadge` | Shows target audience | Teachers=green, Students=yellow, Parents=pink, Staff=purple |
| `CategoryBadge` | Shows app category | Learning Management=blue, Content Creation=green, etc. |
| `DivisionSection` | Division containers | Elementary=#228ec2, Middle=#a0192a, High=#1a2d58 |

**App Components:**
- `AppCard` - Displays app info with badges, logos, and actions
- `AppDetailModal` - Full app details in modal dialog
- `AppSidebar` - Navigation with user display and sign out
- `DashboardSearch` - Search bar with filters

### SAS Brand Colors

```css
/* In Tailwind config or CSS */
--sas-blue: #1a2d58;      /* Primary Blue */
--sas-red: #a0192a;       /* SAS Red */
--sas-yellow: #fabc00;    /* Eagle Yellow */
--elementary: #228ec2;    /* Elementary Blue */
```

## 🛠️ Project Setup

### Initial Setup

```bash
# Install all dependencies (root + vercel)
npm run setup

# Install CLI tools globally (clasp, vercel, supabase)
npm run setup:cli

# Setup MCP servers for Claude Code
npm run mcp:setup:supabase  # Supabase database operations
npm run mcp:setup:clasp     # Google Apps Script operations
# Then authenticate: claude /mcp → select server → "Authenticate"
```

### MCP Configuration

The project includes MCP servers for database and Apps Script operations. Configuration is in `.mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=tsirdxnazadtztdsxqbp"
    },
    "clasp": {
      "type": "stdio",
      "command": "npx",
      "args": ["@google/clasp", "mcp"]
    }
  }
}
```

To authenticate MCP servers (run in regular terminal, not IDE):
```bash
claude /mcp
# Select "supabase" → "Authenticate"
# Select "clasp" → "Authenticate" (requires clasp:login first)
```

## 🚀 Development Commands

### Frontend (Next.js)

```bash
cd vercel

# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # Run ESLint
npm run start        # Start production server

# Testing (see Testing section below for details)
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once (CI mode)
npm run test:coverage # Run tests with coverage report

# Run a single test file
npx vitest run src/__tests__/components/app-card.test.tsx

# Shadcn/UI
npx shadcn@latest add [component]  # Add new component
```

### Backend (Apps Script)

> ⚠️ **CRITICAL WARNING: NEVER USE `clasp deploy`** ⚠️
>
> Creating new deployments changes the deployment URL, which **BREAKS THE PRODUCTION APP** and requires updating environment variables everywhere. The deployment URL below is FINAL and must NEVER change.
>
> **ONLY use `clasp push`** - this updates the code without changing the deployment URL.

```bash
# Run from project root (clasp is configured at root level)
clasp push            # ✅ ONLY use this - pushes code to Apps Script
clasp pull            # ✅ OK - pulls code from Apps Script
clasp open            # ✅ OK - opens in browser

# ❌ NEVER USE THESE COMMANDS:
# clasp deploy        # ❌ NEVER - creates new deployment URL and BREAKS PRODUCTION
# clasp deployments   # ❌ View only - don't create new ones
```

**Production Apps Script Configuration (FINAL - DO NOT CHANGE):**
```
URL: https://script.google.com/macros/s/AKfycbwa6PVAO9kzsNqluKYXftwDuOAPFTsIB7elk3IG-SuA95xZlMIOSW_VH5yt-Ic_vbYv/exec
Script ID: 1T4d1x26rN5oAbNZIvjU0x1z3FTUxd1UwIoJwyBhxaIB30fWsvBj8-rjw
```

This URL is configured in:
- `vercel/.env.local` (APPS_SCRIPT_URL)
- Vercel environment variables (production)

### Supabase

```bash
# Run from project root
npm run supabase:start      # Start local Supabase (requires Docker)
npm run supabase:stop       # Stop local Supabase
npm run supabase:status     # Check status
npm run supabase:db:push    # Push migrations to remote
npm run supabase:migration:new  # Create new migration
```

**Local Supabase Setup** (requires Docker Desktop):
- Project name: `supabase-digitaltoolkit`
- Studio: <http://localhost:54323>
- API: <http://localhost:54321>

### Google Sheets Sync

```bash
# Pull data from Google Sheets to local CSV/JSON
npm run sheets:pull         # Saves to vercel/data/apps-local.csv and .json

# Edit the local JSON file, then push changes back
npm run sheets:push         # Compares with backup, pushes changes to Google Sheets
```

The local dev workflow allows you to:
1. Pull current data from Google Sheets
2. Edit the local `apps-local.json` file
3. Push changes back to Google Sheets
4. Backup is automatically maintained for change tracking

## ✅ Pre-Commit Checklist

Before pushing changes, ensure:

### Required Checks
- [ ] **Build passes**: `npm run build` completes without errors
- [ ] **Lint passes**: `npm run lint` has no errors
- [ ] **Tests pass**: `npm run test:run` all tests pass
- [ ] **Types check**: No TypeScript errors

### Recommended Checks
- [ ] **New features tested**: Add tests for new functionality
- [ ] **Documentation updated**: Update CLAUDE.md, README, or help pages if needed
- [ ] **CHANGELOG updated**: Add entry for significant changes
- [ ] **UI reviewed**: Manually test in browser for visual issues

### Quick Commands
```bash
# Run all checks before commit
cd vercel && npm run lint && npm run build && npm run test:run
```

## 🧪 Testing

- **Framework**: Vitest with jsdom environment
- **Testing Library**: @testing-library/react
- **Location**: `vercel/src/__tests__/`
- **Pattern**: `*.test.ts` or `*.test.tsx`

### Test Structure

```text
vercel/src/__tests__/
├── setup.ts                    # Global test setup
├── api/
│   └── sync.test.ts            # API route tests
├── components/
│   ├── app-card.test.tsx       # Component tests
│   ├── app-detail-modal.test.tsx
│   └── badges.test.tsx
└── lib/
    ├── auth.test.tsx           # Auth context tests
    └── utils.test.ts           # Utility function tests
```

### Test Setup

The setup file [setup.ts](vercel/src/__tests__/setup.ts) configures:

- Jest DOM matchers for Vitest
- Automatic cleanup after each test
- Next.js router mocks (`useRouter`, `usePathname`, `useSearchParams`)
- Browser API mocks (`matchMedia`, `ResizeObserver`, `IntersectionObserver`)

### Writing Tests

**Component Test Example:**

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppCard } from "@/components/app-card";

describe("AppCard Component", () => {
  it("renders app name correctly", () => {
    render(<AppCard app={mockApp} />);
    expect(screen.getByText("App Name")).toBeInTheDocument();
  });

  it("calls handler on button click", () => {
    const onShowDetails = vi.fn();
    render(<AppCard app={mockApp} onShowDetails={onShowDetails} />);
    fireEvent.click(screen.getByRole("button", { name: /details/i }));
    expect(onShowDetails).toHaveBeenCalledWith(mockApp);
  });
});
```

**Utility Test Example:**

```typescript
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges Tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});
```

### Tests to Add for New Features

When adding new features, create corresponding tests:

| Feature | Test File | What to Test |
|---------|-----------|--------------|
| New Page | `__tests__/pages/[page].test.tsx` | Renders correctly, navigation works |
| New API | `__tests__/api/[route].test.ts` | Returns correct data, handles errors |
| New Component | `__tests__/components/[comp].test.tsx` | Props work, events fire, accessibility |
| Auth Change | `__tests__/lib/auth.test.tsx` | Auth flows work correctly |

### Vitest Configuration

Key settings in [vercel/vitest.config.ts](vercel/vitest.config.ts):

- `environment: "jsdom"` - Browser-like environment
- `globals: true` - Global test functions (describe, it, expect)
- Path alias `@/` maps to `./src`
- Coverage excludes `node_modules/`, setup files, `.d.ts`, and Shadcn UI components

## ⚙️ Environment Variables

### Vercel (Frontend)

Create `.env.local` in `/vercel`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SECRET_KEY=your_service_role_key

# Apps Script Backend
APPS_SCRIPT_URL=your_apps_script_url
FRONTEND_KEY=your_frontend_key

# AI
ANTHROPIC_API_KEY=your_claude_api_key
```

### Apps Script (Backend)

Set via Project Settings → Script Properties:

| Property | Description |
|----------|-------------|
| `SPREADSHEET_ID` | Google Sheets ID |
| `SHEET_NAME` | Sheet name (e.g., "Apps") |
| `FRONTEND_KEY` | Shared secret for API auth |
| `GEMINI_API_KEY` | For user-facing AI features |
| `CLAUDE_API_KEY` | For admin data enrichment |

## 🏗️ Business Logic

### Division Assignment

Apps are categorized based on these rules:

**Three-Tier Hierarchy:**

1. **Enterprise Apps** (Whole School only):
   - `enterprise` column = TRUE
   - Premium gold styling

2. **Apps Everyone Can Use**:
   - Site/School/Enterprise/Unlimited licenses
   - Division tabs show only division-specific apps

3. **Department-Specific Apps**:
   - Individual licenses
   - Grouped by department with counts

**Whole School Determination:**
```javascript
const isWholeSchool =
  licenseType.includes('site') ||
  licenseType.includes('school') ||
  licenseType.includes('enterprise') ||
  licenseType.includes('unlimited') ||
  department === 'school operations' ||
  division.includes('whole school') ||
  (hasElementary && hasMiddle && hasHigh);
```

## 🗄️ Google Sheets Structure

Required columns (lowercase):

1. `active` - Boolean (TRUE/FALSE)
2. `product_name` - String
3. `division` - String (SAS Elementary School, etc.)
4. `grade_levels` - String (Pre-K, Kindergarten, Grade 1, ...)
5. `department` - String
6. `subjects` - String
7. `enterprise` - Boolean
8. `budget` - String (Office Of Learning, IT Operations, ...)
9. `audience` - String (Teachers, Students, Parents, Staff)
10. `license_type` - String (Site Licence, Individual, ...)
11. `licence_count` - Number
12. `value` - Number (annual cost)
13. `date_added` - Date (YYYY-MM-DD)
14. `renewal_date` - Date (YYYY-MM-DD)
15. `category` - String
16. `website` - String (URL)
17. `description` - String
18. `support_email` - String
19. `tutorial_link` - String (URL)
20. `mobile_app` - String (Yes, No, iOS/Android)
21. `sso_enabled` - Boolean
22. `logo_url` - String (URL)

## ⚠️ Common Issues

### Next.js

**Build Error: useSearchParams() requires Suspense**
```tsx
// Wrap component using useSearchParams in Suspense
<Suspense fallback={<Loading />}>
  <ComponentUsingSearchParams />
</Suspense>
```

**rawData.slice is not a function (Admin page)**
- `/api/data` returns division-based object, not array
- Flatten apps from all divisions before processing

### Authentication

**Magic link not working**
- Check Supabase Auth → URL Configuration → Site URL
- Verify redirect URL matches `/auth/callback`

**Protected route not redirecting**
- Check middleware.ts is in `src/` root
- Verify matcher config includes route

### API

**CORS error**
- API routes proxy to Apps Script with FRONTEND_KEY
- Check key matches in both environments

**Empty data response**
- Verify APPS_SCRIPT_URL is correct deployment URL
- Check Apps Script logs: `npm run clasp:logs`

### Apps Script

**"Bad Request" or API not responding after code changes**
- Code was pushed with `clasp push` but deployment uses old version
- **Solution**: Use the Apps Script editor to update the deployment to use the latest version (HEAD)
- **NEVER** create a new deployment - update the existing one

**Apps Script URL changed or broken**
- Someone used `clasp deploy` which created a new URL
- **Solution**: The production URL must be: `https://script.google.com/macros/s/AKfycbwa6PVAO9kzsNqluKYXftwDuOAPFTsIB7elk3IG-SuA95xZlMIOSW_VH5yt-Ic_vbYv/exec`
- Update `vercel/.env.local` and Vercel environment variables if needed
- **Prevention**: NEVER use `clasp deploy`, only `clasp push`

### UI Components

**Missing component error**
- Install via: `npx shadcn@latest add [component]`
- Check `components.json` for correct paths

**Toast not showing**
- Use `toast` from `sonner`, not `useToast`
- Ensure `<Toaster />` is in root layout

## 📝 Code Patterns

### Adding a New Page

1. Create page in `src/app/(dashboard)/[route]/page.tsx`
2. Add to navigation in `src/components/app-sidebar.tsx`
3. Add route protection in `middleware.ts` if needed
4. Add tests in `src/__tests__/pages/`
5. Update CLAUDE.md with new route

### Adding a New API Route

1. Create `src/app/api/[route]/route.ts`
2. Export GET/POST/PATCH/DELETE handlers:
   ```typescript
   export async function GET(request: Request) {
     // Handle request
     return Response.json(data);
   }
   ```
3. Add auth check if needed: `await requireRole("admin")`
4. Add tests in `src/__tests__/api/`

### Adding a New Component

1. For Shadcn/UI: `npx shadcn@latest add [component]`
2. For custom: Create in `src/components/`
3. Follow existing patterns for consistency
4. Add tests in `src/__tests__/components/`

---

**Key Development Principles:**

1. Use TypeScript for all new code
2. Follow existing component patterns
3. Keep API routes thin - logic in Apps Script or lib/
4. Test auth flows locally before deploying
5. Use Shadcn/UI for consistency
6. Keep sensitive data in environment variables
7. Run pre-commit checks before pushing
8. Update documentation for significant changes
