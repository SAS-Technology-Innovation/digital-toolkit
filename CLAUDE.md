# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Google Apps Script web application that displays a dashboard for school application management. The project consists of:

- **code.gs**: Google Apps Script backend that serves HTML and reads data from Google Sheets
- **index.html**: Frontend dashboard with Tailwind CSS styling and JavaScript for data visualization

## Architecture

The application follows a simple client-server architecture:

1. **Backend (code.gs)**:
   - `doGet()`: Serves the HTML file as a Google Apps Script web app
   - `getDashboardData()`: Reads application data from a Google Sheet and processes it into categorized JSON

2. **Frontend (index.html)**:
   - Single-page application with tabbed interface
   - Uses Tailwind CSS for styling
   - JavaScript handles data rendering and tab switching
   - Includes mock data for local testing when not in Apps Script environment

3. **Data Flow**:
   - Google Sheet → Apps Script backend → JSON → Frontend rendering
   - Data is categorized by school divisions (Schoolwide, Elementary, Middle School, High School)
   - Each category tracks applications with spend amounts and license counts

## Development Setup

This is a Google Apps Script project with no build tools or package managers. Development is done directly in the Google Apps Script editor or by uploading files.

### Configuration Required

Before deployment, update these values in `code.gs`:
- `SPREADSHEET_ID`: Your Google Sheets document ID
- `SHEET_NAME`: The specific sheet name containing application data

### Testing

- **Local testing**: Open `index.html` in a browser (uses mock data)
- **Apps Script testing**: Deploy as web app in Google Apps Script editor

### Deployment

Deploy through Google Apps Script as a web application with appropriate sharing permissions for your organization.

## Data Structure

The Google Sheet should contain columns matching the headers processed in `getDashboardData()`:
- Product: Application name
- Category: Application category
- Website: Application URL
- Spend: Cost amount
- Licenses: Number of licenses
- Division: School divisions (determines categorization)