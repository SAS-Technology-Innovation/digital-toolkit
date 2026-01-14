# Changelog

All notable changes to the SAS Digital Toolkit project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Changed

- Login page now has tabs for Magic Link and Password authentication
- Sidebar navigation updated with Users link under Admin section
- Submit Assessment link now points to dashboard version (`/renewals/submit`)
- Help page updated with new FAQs for authentication and user management
- Apps list API now falls back to service client for better reliability

### Fixed

- Empty dropdowns in renewal form now show error message with retry button
- Improved error handling in apps list API route

---

## [Previous Unreleased]

### Added

- App Renewal Process page with password protection
- Renewal action persistence (Renew, Modify, Retire) to Google Sheets
- `/api/save-renewal-action` endpoint for saving renewal decisions
- Enhanced search filtering in renewal page (department, subjects, audience)
- Real-time data loading from Apps Script on page reload
- `/api/renewal-data` endpoint (Edge Config integration - planned future enhancement)
- `/api/refresh-renewal-data` endpoint with Vercel Cron support (daily at midnight)

### Changed

- Reorganized project structure: Apps Script files moved to `appsscript/` directory
- Moved frontend files to `vercel/` directory for clear separation
- Updated GitHub Actions workflow to work with new directory structure
- Simplified deployment workflow: removed `update-deployment` step (using `clasp push` only)
- Documentation moved to `docs/` directory

### Fixed

- Apps Script deployment workflow now correctly targets `appsscript/` directory
- Search filtering in renewal page now includes department and subjects fields
- Removed OAuth authentication errors in GitHub Actions deployment

## [2024-12-09] - Project Restructure

### Project Organization

- Created `appsscript/` directory for all Apps Script backend files
- Created `vercel/` directory for all Vercel frontend and API files
- Moved documentation to `docs/` subdirectory
- Updated `.claspignore` for new structure

### Deployment

- Vercel deployment configuration
- Environment variable templates (`.env.local.example`)
- Comprehensive deployment documentation

## [2024-11-XX] - Initial Release

### Core Features

- Password-protected renewal page
- App filtering by timeline, division, budget
- Search across product, department, subjects, category, audience
- Auto-generated app descriptions using Claude AI
- SAS brand implementation (colors, fonts, styling)
- Responsive design for all screen sizes

---

## Version History Format

Each version entry should include:

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements
