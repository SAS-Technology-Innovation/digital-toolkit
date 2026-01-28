# Data Schema Standardization

Based on [schema.org/SoftwareApplication](https://schema.org/SoftwareApplication) for future integration compatibility.

## Proposed Standardized App Schema

| Schema.org Property | Current Field | New Standardized Field | Type | Notes |
|---------------------|---------------|------------------------|------|-------|
| `@type` | - | `type` | string | Always "SoftwareApplication" |
| `identifier` | `product_id` | `identifier` | string | Slug-based unique ID |
| `name` | `product` | `name` | string | Product name |
| `description` | `description` | `description` | string | Product description |
| `url` | `website` | `url` | string | Product website |
| `image` | `logo_url` | `image` | string | Logo URL |
| `applicationCategory` | `category` | `applicationCategory` | string | App category |
| `keywords` | `subjects` | `keywords` | string[] | Subject tags |
| `provider.name` | `vendor` | `provider` | object | `{ name, url, email }` |
| `audience` | `audience` | `audience` | string[] | Target audience |
| `educationalLevel` | `grade_levels` | `educationalLevel` | string[] | Grade levels |
| `offers` | - | `offers` | object | See Offers section |

### Offers Object (Licensing/Pricing)
```json
{
  "offers": {
    "price": 1500.00,           // annual_cost
    "priceCurrency": "USD",
    "priceValidUntil": "2025-06-30",  // renewal_date
    "availability": "InStock",
    "itemCondition": "NewCondition",
    "seller": { "name": "Vendor Name" },
    "license": {
      "type": "Site License",   // license_type
      "quantity": 500           // licenses
    }
  }
}
```

### Organization/Division
```json
{
  "applicableLocation": {
    "type": "EducationalOrganization",
    "name": "Singapore American School",
    "department": "Technology",       // department
    "division": ["Elementary", "Middle", "High"]  // division
  }
}
```

### Compliance/Assessment (EdTech Impact)
```json
{
  "additionalProperty": [
    { "name": "assessmentStatus", "value": "APPROVED" },
    { "name": "globalRating", "value": 4.5 },
    { "name": "riskRating", "value": "Low" },
    { "name": "gdprCompliant", "value": true },
    { "name": "accessibilityLevel", "value": "WCAG 2.1 AA" }
  ]
}
```

## Field Mapping: Current → Standardized

### Core Fields
| Current | Standardized | Transform |
|---------|--------------|-----------|
| `product` | `name` | Direct |
| `product_id` | `identifier` | Direct |
| `description` | `description` | Direct |
| `website` | `url` | Direct |
| `logo_url` | `image` | Direct |
| `category` | `applicationCategory` | Direct |
| `subjects` | `keywords` | Split to array |

### Audience & Education
| Current | Standardized | Transform |
|---------|--------------|-----------|
| `audience` | `audience` | Already array |
| `grade_levels` | `educationalLevel` | Parse to array |
| `division` | `applicableLocation.division` | Parse to array |
| `department` | `applicableLocation.department` | Direct |

### Licensing & Cost
| Current | Standardized | Transform |
|---------|--------------|-----------|
| `annual_cost` | `offers.price` | Direct |
| `license_type` | `offers.license.type` | Direct |
| `licenses` | `offers.license.quantity` | Direct |
| `renewal_date` | `offers.priceValidUntil` | Format as ISO date |

### Provider Info
| Current | Standardized | Transform |
|---------|--------------|-----------|
| `vendor` | `provider.name` | Direct |
| `support_email` | `provider.email` | Direct |

### Technical
| Current | Standardized | Transform |
|---------|--------------|-----------|
| `sso_enabled` | `additionalProperty[ssoEnabled]` | Boolean |
| `mobile_app` | `availableOnDevice` | Array of devices |

### EdTech Impact / Compliance
| Current | Standardized | Transform |
|---------|--------------|-----------|
| `assessment_status` | `additionalProperty[assessmentStatus]` | Direct |
| `global_rating` | `aggregateRating.ratingValue` | Direct |
| `risk_rating` | `additionalProperty[riskRating]` | Direct |
| `privacy_policy_url` | `additionalProperty[privacyPolicy]` | Direct |
| `terms_url` | `additionalProperty[termsOfService]` | Direct |
| `gdpr_url` | `additionalProperty[gdprInfo]` | Direct |
| `accessibility` | `accessibilityFeature` | Parse to array |

## Function Consolidation Plan

### Phase 1: Create Shared Utils Module

Create `/vercel/src/lib/shared/` with:

```
shared/
├── schema.ts          # Type definitions based on schema.org
├── transforms.ts      # All data transformation functions
├── validators.ts      # Validation functions
├── parsers.ts         # JSON/date/array parsing
└── constants.ts       # Division mappings, grade levels, etc.
```

### Phase 2: Remove Duplicate Functions

| Keep (Single Source) | Remove |
|---------------------|--------|
| `shared/parsers.ts:parseJsonArray` | Apps Script `parseJsonField`, `safeJsonParse` |
| `shared/transforms.ts:transformGradeLevels` | Apps Script `convertGradeRangeToIndividual`, `parseGradeLevels` |
| `shared/transforms.ts:generateIdentifier` | Both `generateProductId` functions |
| `shared/transforms.ts:transformDivision` | Apps Script `getDivisionFromGrades`, `isEffectivelyWholeSchool` |

### Phase 3: Unified Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Sources                              │
│  EdTech Impact CSV  │  Google Sheets  │  Direct API Input   │
└──────────┬──────────┴────────┬────────┴─────────┬───────────┘
           │                   │                  │
           ▼                   ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Unified Transform Layer                         │
│  shared/transforms.ts - toStandardSchema()                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase (Source of Truth)                     │
│              Standardized Schema                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    Google Sheets     Dashboard API    Future APIs
    (Legacy Export)   (Vercel)         (Integrations)
```

## Migration Steps

1. **Create schema types** in TypeScript
2. **Add transform functions** that map old → new schema
3. **Update Supabase** columns to match standardized names
4. **Update sync routes** to use transforms
5. **Update EdTech import** to use shared transforms
6. **Deprecate duplicate functions** in Apps Script
7. **Update Google Sheets** column headers
8. **Test bidirectional sync**

## Benefits

- **Interoperability**: schema.org compliance enables future LTI, CASE, xAPI integrations
- **Maintainability**: Single source of truth for transforms
- **Type Safety**: Full TypeScript types based on schema
- **Reduced Code**: ~40% reduction in duplicate functions
- **API Ready**: Clean REST/GraphQL API structure
