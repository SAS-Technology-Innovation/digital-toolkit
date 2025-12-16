# Changelog

All notable changes to the SAS Digital Toolkit project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- App Renewal Process page with password protection
- Renewal action persistence (Renew, Modify, Retire) to Google Sheets
- `/api/save-renewal-action` endpoint for saving renewal decisions
- Enhanced search filtering in renewal page (department, subjects, audience)
- Edge Config integration for caching renewal data (optional)
- Automatic data refresh via Vercel Cron (daily at midnight)

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

### Changed
- Created `appsscript/` directory for all Apps Script backend files
- Created `vercel/` directory for all Vercel frontend and API files
- Moved documentation to `docs/` subdirectory
- Updated `.claspignore` for new structure

### Added
- Vercel deployment configuration
- Environment variable templates (`.env.local.example`)
- Comprehensive deployment documentation

## [2024-11-XX] - Initial Release

### Added
- Main dashboard for SAS Digital Toolkit apps
- Digital signage slideshow display
- AI-powered search with Gemini/Claude integration
- Data management tools (validation, enrichment)
- CSV/XLSX import from EdTech Impact
- Apps Script backend with Google Sheets integration
- Division-based app categorization (Whole School, Elementary, Middle, High)
- Enterprise apps section
- Department-grouped apps display

### Features
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
