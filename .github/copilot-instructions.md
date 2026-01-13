# SAS Digital Toolkit - Developer Guide

This file provides guidance for AI assistants (GitHub Copilot, Claude Code) working with this repository.

## Project Overview

The **SAS Digital Toolkit** is a full-stack web application for managing educational applications at Singapore American School.

- **Frontend**: Next.js 16 with App Router, TypeScript, Tailwind CSS v4, Shadcn/UI
- **Backend**: Google Apps Script (reads from Google Sheets)
- **Authentication**: Supabase Auth with Magic Links
- **Deployment**: Vercel (frontend), Google Apps Script (backend API)

## Architecture

```
Vercel (Next.js) → API Routes → Google Apps Script → Google Sheets
                 → Supabase Auth (Magic Links)
```

## Project Structure

```
digital-toolkit/
├── vercel/                 # Next.js frontend
│   └── src/
│       ├── app/            # App Router pages & API routes
│       ├── components/     # React components (Shadcn/UI + custom)
│       ├── lib/            # Auth, Supabase clients, utilities
│       └── middleware.ts   # Auth middleware
├── appsscript/             # Google Apps Script backend
│   ├── Code.js             # Main entry point
│   ├── ai-functions.js     # AI integrations
│   └── utilities.js        # Helper functions
└── docs/                   # Documentation
```

## Key Files

### Frontend (Next.js)

| File | Purpose |
|------|---------|
| `vercel/src/app/(dashboard)/page.tsx` | Main dashboard |
| `vercel/src/app/(dashboard)/apps/page.tsx` | App catalog |
| `vercel/src/app/(dashboard)/admin/page.tsx` | Admin panel (protected) |
| `vercel/src/app/login/page.tsx` | Login with magic links |
| `vercel/src/lib/auth/auth-context.tsx` | Auth provider |
| `vercel/src/middleware.ts` | Route protection |

### Backend (Apps Script)

| File | Purpose |
|------|---------|
| `appsscript/Code.js` | Main API endpoints |
| `appsscript/utilities.js` | Division/department logic |
| `appsscript/ai-functions.js` | AI integrations |

## Development Commands

### Frontend
```bash
cd vercel
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
```

### Backend
```bash
cd appsscript
npm run push     # Push to Apps Script
npm run deploy   # Create deployment
npm run logs     # View logs
```

## Business Logic

### Division Assignment

Apps are categorized into:
1. **Enterprise Apps** - `enterprise = TRUE`, whole school only
2. **Everyone Apps** - Site/school/unlimited licenses
3. **Department Apps** - Individual licenses, grouped by department

### Whole School Determination

An app is "whole school" if:
- License type includes: site, school, enterprise, unlimited
- Department is: school operations, school-wide
- Listed in all 3 divisions

## SAS Brand Colors

```css
--sas-blue: #1a2d58;
--sas-red: #a0192a;
--sas-yellow: #fabc00;
--elementary: #228ec2;
```

## For Complete Documentation

See:
- [CLAUDE.md](../CLAUDE.md) - Full developer guide
- [vercel/README.md](../vercel/README.md) - Frontend documentation
- [README.md](../README.md) - Project overview
