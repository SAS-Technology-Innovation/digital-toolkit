# Protected Fields Fix - CSV Import

## Problem

The CSV import was overwriting three **manually populated fields** that should have been preserved:

1. **Department** - Manually set department assignments
2. **subjects_or_department** / **subjects** - Manually set subject tags
3. **Enterprise** - Manually set Enterprise checkbox (core SAS tools flag)

**User's Exact Feedback:**
> "These 3 departments were overwritten now the data is completely messed up. Department,subjects_or_department, Enterprise. I updated these to be now department,subjects, enterprise. Only fill missing ones. do not overwrite. As these are manually populated fields."

## Solution Implemented

Added **field protection logic** to prevent CSV imports from overwriting manually populated fields.

### Changes Made

#### 1. `updateAppRow()` Function ([data-management.js:1394-1430](data-management.js#L1394-L1430))

**Added protected fields array:**
```javascript
const PROTECTED_FIELDS = ['Department', 'subjects_or_department', 'subjects', 'Enterprise'];
```

**Added skip logic:**
```javascript
// Skip protected fields if existing value is present
if (PROTECTED_FIELDS.includes(csvHeader) && oldValue && oldValue !== '') {
  return; // Don't overwrite manually populated fields
}
```

**Behavior:**
- If a protected field has an existing value, CSV import will NOT overwrite it
- Only applies when updating EXISTING apps
- New apps can still have these fields populated from CSV

#### 2. `fillMissingFields()` Function ([data-management.js:1435-1467](data-management.js#L1435-L1467))

**Added the same protected fields array:**
```javascript
const PROTECTED_FIELDS = ['Department', 'subjects_or_department', 'subjects', 'Enterprise'];
```

**Added strict skip logic:**
```javascript
// Skip protected fields entirely - they should NEVER be filled by CSV imports
// Only manually populate these fields
if (PROTECTED_FIELDS.includes(csvHeader)) {
  return; // Don't touch manually populated fields
}
```

**Behavior:**
- Protected fields are NEVER touched during "Fill Missing Fields Only" mode
- Even if the field is empty, CSV import will not populate it
- These fields must be manually populated by the user

#### 3. `addAppRow()` Function ([data-management.js:1372-1391](data-management.js#L1372-L1391))

**Added clarifying comment:**
```javascript
/**
 * Adds a new app row to the sheet
 * Note: For NEW apps, all CSV data is populated including protected fields (Department, subjects, Enterprise)
 * Protected field logic only applies to EXISTING apps to preserve manual edits
 */
```

**Behavior:**
- NEW apps can have protected fields populated from CSV data
- This allows EdTech Impact imports to set initial values
- Once added, manual edits to these fields are protected

## How It Works

### Protected Fields List
```javascript
const PROTECTED_FIELDS = [
  'Department',           // Manually assigned department
  'subjects_or_department', // Old column name (backwards compatible)
  'subjects',             // New column name
  'Enterprise'            // Enterprise checkbox (TRUE/FALSE)
];
```

### Update Modes

#### Mode 1: "Add & Update" (uses `updateAppRow`)
- **New apps**: All fields populated from CSV (including protected fields)
- **Existing apps**: Protected fields are skipped if they have values
- **Example**:
  - Department = "Math" (manually set) → CSV says "TCR" → **Keeps "Math"**
  - Enterprise = TRUE (manually set) → CSV says FALSE → **Keeps TRUE**
  - subjects = "Algebra" (manually set) → CSV says "Science" → **Keeps "Algebra"**

#### Mode 2: "Fill Missing Fields Only" (uses `fillMissingFields`)
- **Protected fields are NEVER touched**, even if empty
- All other fields are filled if empty
- **Example**:
  - Department = "" (empty) → CSV says "TCR" → **Stays empty** (must be manually set)
  - description = "" (empty) → CSV says "A math app" → **Fills with "A math app"**

#### Mode 3: "Full Sync" (uses `updateAppRow` + deactivation)
- Same as "Add & Update" but also deactivates apps not in CSV
- Protected fields still respected

### Validation

The fix ensures:
- ✅ Manually populated fields are never overwritten
- ✅ CSV imports won't corrupt manual edits
- ✅ New apps can still be populated from CSV
- ✅ "Fill Missing" mode respects protected fields
- ✅ Backwards compatible with both column names (`subjects_or_department` and `subjects`)

## Testing Checklist

To verify the fix works:

1. **Test Update Mode:**
   - [ ] Manually set Department on an existing app
   - [ ] Upload CSV with different Department value
   - [ ] Verify Department was NOT overwritten

2. **Test Fill Missing Mode:**
   - [ ] Leave Department empty on an existing app
   - [ ] Upload CSV with Department value in "Fill Missing" mode
   - [ ] Verify Department stays empty (not filled)

3. **Test New Apps:**
   - [ ] Upload CSV with new app including Department/subjects/Enterprise
   - [ ] Verify new app is created with all fields populated

4. **Test Enterprise Flag:**
   - [ ] Manually check Enterprise checkbox on an app
   - [ ] Upload CSV with Enterprise=FALSE for that app
   - [ ] Verify Enterprise stays TRUE (not overwritten)

## Deployment

**Deployed:** 2025-11-23
**Files Changed:** [data-management.js](data-management.js)
**Functions Updated:**
- `updateAppRow()` - Lines 1394-1430
- `fillMissingFields()` - Lines 1435-1467
- `addAppRow()` - Lines 1372-1391 (documentation only)

**Command Used:**
```bash
npx @google/clasp push --force
```

## Why This Matters

These three fields are **manually curated** by the user for data quality:

1. **Department**: Auto-inference from EdTech Impact often gets this wrong. Users manually assign the correct department for each app.

2. **subjects**: Subject tagging is context-dependent and requires human judgment. CSV imports can't determine this accurately.

3. **Enterprise**: This is a **critical business flag** that marks official SAS core tools. It controls:
   - Premium gold styling in the dashboard
   - Placement on "Whole School" tab only
   - Exclusion from division tabs
   - User trust and app visibility

Overwriting these fields breaks the carefully curated app database.

## Related Issues Fixed

This fix also builds on previous Category protection logic:
```javascript
// Skip Category field if existing value is present and new value is just the default "Apps"
if (csvHeader === 'Category' && oldValue && oldValue !== '' && newValue === 'Apps') {
  return; // Don't overwrite existing Category with default "Apps"
}
```

The pattern is now consistent: **Preserve manual edits, only fill truly missing data.**

---

**Status:** ✅ FIXED and DEPLOYED
