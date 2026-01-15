# Changelog

All notable changes to the SAS Digital Toolkit project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Upcoming features and improvements will be listed here

---

## [2.1.0] - 2026-01-15

### Added

- **About Page** (`/about`)
  - Mission statement and platform overview
  - Features and technology stack information
  - Team credits and contact information
- **Privacy Policy** (`/privacy`)
  - Data collection and usage details
  - User rights and data protection measures
  - Third-party service disclosures
- **Terms of Service** (`/terms`)
  - Acceptable use guidelines
  - User responsibilities
  - Legal terms and conditions
- **Vercel Analytics & Speed Insights**
  - Page view tracking and visitor analytics
  - Core Web Vitals performance monitoring
- **Releases Page** (`/releases`)
  - On-site changelog display
  - Version history and release notes

### Changed

- README updated with new features and pages
- Sidebar navigation includes About, Privacy, Terms, and Releases links
- Help page footer now links to About, Privacy, and Terms

---

## [2.0.0] - 2026-01-15

### Added

- **User Management Admin Page** (`/admin/users`)
  - View all users with search and filter by role/status
  - Inline role dropdown for quick role changes (Staff, TIC, Approver, Admin)
  - Active/inactive toggle for user accounts
  - Stats cards showing user counts by role
- **Password Authentication**
  - Sign in with password option (in addition to magic links)
  - User registration page (`/register`) with password strength indicator
  - Password reset flow (`/reset-password` and `/reset-password/confirm`)
  - Email verification for new accounts
- **Dashboard Renewal Submit Page** (`/renewals/submit`)
  - Renewal assessment form accessible within the dashboard layout
  - Pre-fills user email from authenticated session
  - Includes breadcrumb navigation
- **Breadcrumb Navigation**
  - Added to Renewals Dashboard, TIC Review, and Approver pages
  - Consistent navigation pattern across renewal workflow
- **User Management API Routes**
  - `GET/POST /api/users` - List and create users
  - `GET/PATCH/DELETE /api/users/[id]` - Manage individual users
  - Role-based access control (admin only)
- **TIC Review Dashboard** (`/renewals/tic-review`)
  - Review teacher feedback on apps
  - Generate AI summaries
  - Submit recommendations
- **Approver Decisions Page** (`/renewals/approver`)
  - Final decision-making interface
  - View TIC recommendations
  - Approve, modify, or retire apps
- **Help Center** (`/help`)
  - Comprehensive documentation and FAQs
  - User role guides and workflow explanations
  - Quick links to common actions

### Changed

- Login page now has tabs for Magic Link and Password authentication
- Sidebar navigation reorganized with better grouping
- Submit Assessment link now points to dashboard version (`/renewals/submit`)
- Help page updated with new FAQs for authentication and user management
- Apps list API now falls back to service client for better reliability

### Fixed

- Empty dropdowns in renewal form now show error message with retry button
- Improved error handling in apps list API route

---

## [1.2.0] - 2024-12-15

### Added

- App Renewal Process page with role-based access
- Renewal action persistence (Renew, Modify, Retire) to database
- `/api/save-renewal-action` endpoint for saving renewal decisions
- Enhanced search filtering in renewal page (department, subjects, audience)
- Real-time data loading from Apps Script on page reload
- Status page for monitoring app health

### Changed

- Improved renewal workflow with multi-step process
- Enhanced filtering capabilities across all pages

### Fixed

- Search filtering now includes department and subjects fields

---

## [1.1.0] - 2024-12-09

### Added

- Supabase integration for authentication and data storage
- Magic link authentication for @sas.edu.sg users
- Protected admin routes
- Analytics page with usage insights

### Changed

- Reorganized project structure: Apps Script files moved to `appsscript/` directory
- Moved frontend files to `vercel/` directory for clear separation
- Updated GitHub Actions workflow to work with new directory structure
- Documentation moved to `docs/` directory

### Fixed

- Apps Script deployment workflow now correctly targets `appsscript/` directory

---

## [1.0.0] - 2024-11-01

### Added

- **Dashboard** - Division-based app organization (Whole School, Elementary, Middle, High)
- **App Catalog** - Searchable catalog with filters
- **App Cards** - Enhanced cards with logos, badges, and quick actions
- **App Details Modal** - Comprehensive information display
- **Request App** - Form for requesting new applications
- **Signage Display** - Digital signage mode for screens
- **AI Integration** - Claude-powered search and recommendations
- **SAS Branding** - Custom colors, fonts, and styling

### Technical

- Next.js 16 with App Router
- Tailwind CSS v4 with Shadcn/UI components
- Google Apps Script backend
- Google Sheets data source
- Vercel deployment

---

## Version History Format

Each version entry includes:

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

For the latest release notes, visit our [GitHub Releases](https://github.com/SAS-Technology-Innovation/digital-toolkit/releases).
