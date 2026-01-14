# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Project Overview

The **SAS Digital Toolkit** is a full-stack web application for managing and showcasing educational applications at Singapore American School. The frontend is built with Next.js 16 and deployed to Vercel, while the backend uses Google Apps Script to read from Google Sheets.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel (Frontend)                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Next.js 16 App Router                   │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │    │
│  │  │Dashboard │ │App Catalog│ │  Admin   │  ...       │    │
│  │  └──────────┘ └──────────┘ └──────────┘            │    │
│  │  ┌──────────────────────────────────────┐          │    │
│  │  │        Supabase Auth (Magic Links)    │          │    │
│  │  └──────────────────────────────────────┘          │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              API Routes (/api/*)                     │    │
│  │  /api/data  /api/ai  /api/sync  /api/status         │    │
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

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 with App Router, TypeScript |
| Styling | Tailwind CSS v4, Shadcn/UI components |
| Authentication | Supabase Auth (Magic Links) |
| Database | Supabase (PostgreSQL), Google Sheets |
| AI | Claude API (via Apps Script proxy) |
| Deployment | Vercel |
| Backend API | Google Apps Script |

## 📁 Project Structure

```
digital-toolkit/
├── vercel/                      # Next.js frontend application
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── (dashboard)/     # Dashboard route group (with sidebar)
│   │   │   │   ├── page.tsx     # Main dashboard (/)
│   │   │   │   ├── apps/        # App catalog (/apps)
│   │   │   │   ├── admin/       # Admin panel (/admin) - protected
│   │   │   │   ├── analytics/   # Analytics (/analytics)
│   │   │   │   ├── renewals/    # Renewals (/renewals)
│   │   │   │   ├── requests/    # Request form (/requests)
│   │   │   │   ├── status/      # Status page (/status)
│   │   │   │   └── layout.tsx   # Dashboard layout with sidebar
│   │   │   ├── api/             # API routes
│   │   │   │   ├── ai/route.ts  # AI chat endpoint
│   │   │   │   ├── data/route.ts # Apps data endpoint
│   │   │   │   ├── renewal-data/route.ts
│   │   │   │   ├── status/route.ts
│   │   │   │   └── sync/route.ts # Supabase sync
│   │   │   ├── auth/callback/   # Magic link callback
│   │   │   ├── login/           # Login page
│   │   │   ├── signage/         # Signage display (no sidebar)
│   │   │   └── layout.tsx       # Root layout
│   │   ├── components/          # React components
│   │   │   ├── ui/              # Shadcn/UI components
│   │   │   │   ├── audience-badge.tsx   # Color-coded audience tags
│   │   │   │   ├── category-badge.tsx   # Color-coded category tags
│   │   │   │   ├── division-section.tsx # Division containers
│   │   │   │   └── ...          # Other Shadcn components
│   │   │   ├── app-card.tsx     # App card component
│   │   │   ├── app-detail-modal.tsx
│   │   │   ├── app-sidebar.tsx  # Navigation sidebar
│   │   │   └── dashboard-search.tsx
│   │   ├── lib/                 # Utilities
│   │   │   ├── auth/            # Auth context
│   │   │   │   └── auth-context.tsx
│   │   │   ├── supabase/        # Supabase clients
│   │   │   │   ├── client.ts    # Browser client
│   │   │   │   └── server.ts    # Server client
│   │   │   └── utils.ts         # Helper functions
│   │   ├── hooks/               # Custom React hooks
│   │   └── middleware.ts        # Auth middleware
│   ├── public/assets/           # Static assets (logos, images)
│   ├── supabase/                # Supabase config
│   ├── package.json
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
└── README.md
```

## 🔐 Authentication System

### Overview
- **Provider**: Supabase Auth
- **Methods**: Magic Links (passwordless) AND Password Authentication
- **Domain Restriction**: `@sas.edu.sg` emails only
- **Protected Routes**: `/admin` requires authentication
- **User Registration**: Self-service with email verification

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

## 🔌 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/data` | GET | Fetch apps data (proxies to Apps Script) |
| `/api/ai` | POST | AI chat completion |
| `/api/renewal-data` | GET | Fetch renewal data |
| `/api/status` | GET | Fetch app status |
| `/api/sync` | POST | Sync data with Supabase |
| `/api/apps/list` | GET | Get apps for dropdown selection |
| `/api/users` | GET | List users (admin only) |
| `/api/users` | POST | Create user (admin only) |
| `/api/users/[id]` | GET | Get user details (admin only) |
| `/api/users/[id]` | PATCH | Update user (admin only) |
| `/api/users/[id]` | DELETE | Delete user (admin only) |

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

```bash
cd appsscript

npm run login        # Authenticate with Google
npm run push         # Push code to Apps Script
npm run pull         # Pull code from Apps Script
npm run deploy       # Create new deployment
npm run logs         # View execution logs
npm run open         # Open in browser
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
- Check Apps Script logs: `npm run logs`

## 🧪 Testing Locally

1. **Frontend only** (uses API):
   ```bash
   cd vercel
   npm run dev
   ```

2. **With mock data**: Create mock data in component for offline dev

3. **Full integration**: Deploy Apps Script and set `APPS_SCRIPT_URL`

## 📝 Code Patterns

### Adding a New Page

1. Create page in `src/app/(dashboard)/[route]/page.tsx`
2. Add to navigation in `src/components/app-sidebar.tsx`
3. Add route protection in `middleware.ts` if needed

### Adding a New API Route

1. Create `src/app/api/[route]/route.ts`
2. Export GET/POST handlers:
   ```typescript
   export async function GET(request: Request) {
     // Handle request
     return Response.json(data);
   }
   ```

### Adding a New Component

1. For Shadcn/UI: `npx shadcn@latest add [component]`
2. For custom: Create in `src/components/`
3. Follow existing patterns for consistency

---

**Key Development Principles:**

1. Use TypeScript for all new code
2. Follow existing component patterns
3. Keep API routes thin - logic in Apps Script or lib/
4. Test auth flows locally before deploying
5. Use Shadcn/UI for consistency
6. Keep sensitive data in environment variables
