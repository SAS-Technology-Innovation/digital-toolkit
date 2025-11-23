# Data Management Guide

This guide explains how to use the **Digital Toolkit Admin** tools to maintain and enrich your app database using AI-powered features.

## 🎯 Overview

The Digital Toolkit Dashboard includes built-in data quality tools accessible directly from Google Sheets. These tools use **Claude AI** to automatically enrich missing data, validate completeness, and ensure high-quality app information.

## 🔑 Prerequisites

### Required Configuration
Before using data management tools, ensure these Script Properties are set:

1. Open your Apps Script project: `npm run open`
2. Go to **Project Settings (⚙️) > Script Properties**
3. Verify these properties exist:
   - `SPREADSHEET_ID` - Your Google Sheets ID
   - `SHEET_NAME` - Your sheet name
   - `CLAUDE_API_KEY` - Your Anthropic Claude API key (required for enrichment)
   - `GEMINI_API_KEY` - Your Google Gemini API key (optional, for user chat)

### Get a Claude API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys**
4. Create a new key
5. Copy the key (starts with `sk-ant-api03-...`)
6. Add to Script Properties as `CLAUDE_API_KEY`

## 📊 Admin Menu

When you open your Google Sheets, you'll see a custom menu: **🤖 Digital Toolkit Admin**

### Menu Options

#### 1. 📊 Validate Data
**Purpose:** Quick health check of your app database

**What it does:**
- Scans all active apps
- Checks for required fields: product_name, description, division, department, category, website
- Reports missing data with row numbers

**When to use:**
- After importing new apps
- Before deploying updates
- Regular data quality audits

**Example Output:**
```
⚠️ Validation Issues Found

Found 5 issue(s):

⚠️ Row 15 (Canva): Missing "description"
⚠️ Row 23 (Kahoot): Missing "description"
⚠️ Row 45 (Nearpod): Missing "audience"
```

#### 2. 🔍 Find Missing Fields
**Purpose:** Comprehensive audit of incomplete data

**What it does:**
- Reports missing: descriptions, categories, audience, grade levels, logos
- Shows first 5 apps for each missing field type
- Provides total counts

**When to use:**
- Planning data enrichment work
- Understanding data gaps
- Prioritizing cleanup efforts

**Example Output:**
```
📊 Missing Data Report

Missing Descriptions: 12
- Google Classroom (Row 5)
- Seesaw (Row 12)
- Adobe Express (Row 18)
... and 9 more

Missing Categories: 8
Missing Audience: 15
Missing Grade Levels: 10
Missing Logos: 25
```

#### 3. ✨ Enrich Missing Descriptions
**Purpose:** AI-generated descriptions for apps

**What it does:**
- Finds apps without descriptions
- Uses Claude AI to generate 1-2 sentence descriptions
- Processes up to 10 apps per run
- Automatically saves to sheet

**When to use:**
- Apps missing descriptions after import
- Bulk description generation
- Improving search and discovery

**Process:**
1. Click menu item
2. Confirm action (shows warning about API usage)
3. Wait for completion (1-2 minutes for 10 apps)
4. Review generated descriptions in sheet

**AI Prompt Example:**
```
Generate a concise, educational 1-2 sentence description for this app:

App Name: Canva
Category: Design
Subject: Visual Arts
Website: https://canva.com

Write a clear description suitable for teachers and staff at an
international school. Focus on what the app does and who it's for.
```

**Generated Description:**
> "Canva is a graphic design platform that enables teachers and students to create presentations, posters, infographics, and social media graphics using drag-and-drop templates and design elements."

#### 4. 🔄 Refresh All Missing Data
**Purpose:** Comprehensive AI-powered data enrichment

**What it does:**
- Fills in ALL missing fields (descriptions, categories, audience, grade levels)
- Uses intelligent prompts based on context (division, subject, website)
- Processes up to 15 apps per run
- Includes 1-second rate limiting

**When to use:**
- Major data cleanup operations
- New app imports with minimal data
- Comprehensive database refresh

**Process:**
1. Click menu item
2. Confirm action (warns about API quota usage)
3. Wait for completion (2-5 minutes for 15 apps)
4. Review enriched data in sheet

**AI Prompt Example:**
```
You are helping to enrich educational app data for Singapore American School.

App Name: Khan Academy
Website: https://www.khanacademy.org
Subject: Mathematics
Division: Whole School

Current Data:
- Description: [MISSING]
- Category: [MISSING]
- Audience: Teachers,Students
- Grade Levels: [MISSING]

Please provide the missing data in JSON format:
- Description: 1-2 concise sentences
- Category: Choose from predefined list
- Audience: Teachers, Students, Staff, Parents
- Grade Levels: Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12 (individual grades, comma-separated)
```

**Generated Response:**
```json
{
  "description": "Khan Academy is a free online learning platform offering video lessons, practice exercises, and personalized learning dashboards in math, science, and humanities for students of all ages.",
  "category": "Learning Management",
  "audience": "Teachers,Students,Parents",
  "gradeLevels": "K-12"
}
```

#### 5. 🧪 Test Claude/Gemini Connection
**Purpose:** Verify API configuration

**What it does:**
- Tests API key validity
- Sends sample request
- Returns AI response

**When to use:**
- After setting up API keys
- Troubleshooting connection issues
- Verifying quota availability

## 🎯 Recommended Workflow

### Initial Setup (New Database)
1. Import app data to Google Sheets
2. Run **📊 Validate Data** to see what's missing
3. Run **🔍 Find Missing Fields** for detailed report
4. Run **🔄 Refresh All Missing Data** (repeat as needed for large datasets)
5. Manually review and adjust AI-generated content
6. Run **📊 Validate Data** again to confirm completeness

### Regular Maintenance
1. Add new apps to sheet
2. Fill in basic info (name, division, website)
3. Run **✨ Enrich Missing Descriptions** for quick fixes
4. Periodically run **🔍 Find Missing Fields** to check data quality

### Bulk Operations
For large datasets (50+ apps with missing data):
1. Run enrichment in batches (15 apps at a time)
2. Wait 5-10 minutes between batches to avoid rate limits
3. Monitor Apps Script logs: `npm run logs`
4. Check for API errors or quota issues

## 📋 Required Columns

The enrichment tools expect these column headers (all lowercase):

| Column | Type | Required | Enrichable |
|--------|------|----------|------------|
| `active` | Boolean | Yes | No |
| `product_name` | String | Yes | No |
| `division` | String | Yes | No |
| `grade_levels` | String | No | **Yes** |
| `department` | String | Yes | No |
| `subjects` | String | No | No |
| `enterprise` | Boolean | No | No |
| `budget` | String | No | No |
| `audience` | String | No | **Yes** |
| `license_type` | String | No | No |
| `licence_count` | Number | No | No |
| `value` | Number | No | No |
| `date_added` | Date | No | No |
| `renewal_date` | Date | No | No |
| `category` | String | No | **Yes** |
| `website` | String | Yes | No |
| `description` | String | Yes | **Yes** |
| `support_email` | String | No | No |
| `tutorial_link` | String | No | No |
| `mobile_app` | String | No | No |
| `sso_enabled` | Boolean | No | No |
| `logo_url` | String | No | No |

**Enrichable Fields:** These can be auto-generated by Claude/Gemini AI
- `description` - App description (1-2 sentences)
- `category` - App category
- `audience` - Target users
- `grade_levels` - Individual grades (comma-separated): Pre-K, Kindergarten, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10, Grade 11, Grade 12

**Note:** Column names changed from mixed-case to all lowercase. The `grade_levels` column is now in 4th position (after `division`, before `department`) and uses individual grade values instead of ranges.

## ⚙️ Technical Details

### Rate Limiting
- **Enrichment limits:** 10-15 apps per run
- **API delays:** 1 second between requests
- **Reason:** Prevents quota exhaustion and API throttling

### Error Handling
- Failed enrichments are logged but don't stop the process
- Apps with errors are skipped
- Successful enrichments save immediately (`SpreadsheetApp.flush()`)
- User-friendly error alerts in Google Sheets

### Data Quality
**AI-Generated Content Guidelines:**
- Descriptions: Factual, non-promotional, 1-2 sentences
- Categories: From predefined list (ensures consistency)
- Audience: Based on typical use cases
- Grade Levels: Derived from division context

**Manual Review Recommended:**
- Always review AI-generated content
- Adjust descriptions for accuracy
- Verify categories match your taxonomy
- Confirm audience and grade levels

### Logging
View detailed logs for troubleshooting:
```bash
npm run logs
```

Log entries include:
- Apps processed
- API responses
- Errors and warnings
- Enrichment success/failure

## 🚨 Troubleshooting

### "Configuration error: CLAUDE_API_KEY not set"
**Solution:** Add `CLAUDE_API_KEY` to Script Properties (see Prerequisites)

### "Claude API temporarily unavailable"
**Possible causes:**
- Invalid API key
- Rate limit exceeded
- Network connectivity issues

**Solutions:**
1. Test API key with **🧪 Test Claude Connection**
2. Wait 5-10 minutes and retry
3. Check Anthropic status page
4. Verify API key in [Anthropic Console](https://console.anthropic.com/)

### "Failed to read or process data"
**Possible causes:**
- Incorrect `SPREADSHEET_ID` or `SHEET_NAME`
- Missing column headers
- Sheet access permissions

**Solutions:**
1. Verify Script Properties are correct
2. Check column headers match expected names (all lowercase)
3. Ensure Apps Script has sheet access

### Enrichment Stops Mid-Process
**Possible causes:**
- API quota exhausted
- Script execution timeout (6 minutes max)
- Network issues

**Solutions:**
1. Run enrichment in smaller batches (adjust `maxToEnrich` in code)
2. Wait and re-run to continue where it stopped
3. Check Apps Script execution logs for errors

### Poor Quality AI Responses
**Solutions:**
- Ensure app has website URL (improves context)
- Fill in subject/category manually for better prompts
- Review and edit AI-generated content
- Report persistent issues to admin

## 🔒 Security & Privacy

### API Key Safety
- API keys stored in Script Properties (not in code)
- Keys not visible in published web app
- Only accessible to Apps Script project editors

### Data Processing
- All AI requests use HTTPS
- No data stored on external servers (except temporary API processing)
- Anthropic Claude API privacy policy applies

### Access Control
- Data management tools only available to sheet editors
- Web app users cannot trigger enrichment
- Menu only appears when sheet is open

## 📈 Best Practices

### Before Enrichment
- ✅ Backup your Google Sheet
- ✅ Review existing data quality
- ✅ Test with small batch first (5-10 apps)
- ✅ Verify API key is working

### During Enrichment
- ⏳ Be patient (1-5 minutes for full runs)
- 📊 Monitor progress in Apps Script logs
- 🚫 Don't edit sheet during processing
- ⚠️ Watch for error alerts

### After Enrichment
- ✔️ Review AI-generated content
- ✏️ Edit for accuracy and tone
- 📋 Run validation again
- 💾 Commit changes to version control

## 📚 Related Documentation

- [CLAUDE.md](CLAUDE.md) - Complete technical documentation
- [AI_FEATURES.md](AI_FEATURES.md) - AI integration details
- [README.md](README.md) - Project overview and setup
- [expected-data-template.csv](expected-data-template.csv) - Data structure example

## 🆘 Support

For issues or questions:
1. Check this guide and [CLAUDE.md](CLAUDE.md)
2. Review Apps Script logs: `npm run logs`
3. Test API connections with menu tools
4. Report bugs via [GitHub Issues](https://github.com/SAS-Technology-Innovation/digital-toolkit/issues)

---

**Pro Tip:** Start small! Test enrichment on 5-10 apps first to verify the AI output quality matches your expectations before processing larger batches.
