# SAS Digital Toolkit - Schema v2.0

Ground-up data model based on [schema.org/SoftwareApplication](https://schema.org/SoftwareApplication) and [schema.org/Course](https://schema.org/Course).

## Core Entity: `Application`

Based on schema.org `SoftwareApplication` with educational extensions.

```typescript
interface Application {
  // === IDENTIFICATION (schema.org Thing) ===
  "@type": "SoftwareApplication";
  identifier: string;        // Unique slug: "adobe-creative-cloud"
  name: string;              // "Adobe Creative Cloud"
  alternateName?: string;    // Short name: "Adobe CC"

  // === DESCRIPTION (schema.org CreativeWork) ===
  description: string;       // Full description
  abstract?: string;         // Short summary (1-2 sentences)
  keywords: string[];        // ["design", "photo editing", "video"]

  // === CLASSIFICATION ===
  applicationCategory: ApplicationCategory;  // Primary category
  applicationSubCategory?: string;           // Sub-category

  // === URLS & MEDIA ===
  url: string;               // Product website
  image: string;             // Logo URL
  screenshot?: string[];     // Screenshot URLs
  video?: string;            // Demo video URL

  // === PROVIDER (schema.org Organization) ===
  provider: {
    "@type": "Organization";
    name: string;            // "Adobe Inc."
    url?: string;            // Vendor website
    email?: string;          // Support email
    telephone?: string;      // Support phone
  };

  // === EDUCATIONAL CONTEXT ===
  audience: Audience[];      // ["Teachers", "Students"]
  educationalLevel: EducationalLevel[];  // ["Grade 6", "Grade 7"]
  educationalAlignment?: {   // Learning standards alignment
    "@type": "AlignmentObject";
    educationalFramework: string;
    targetName: string;
  }[];

  // === ORGANIZATION SCOPE ===
  applicableLocation: {
    "@type": "EducationalOrganization";
    name: "Singapore American School";
    department?: string;     // "Technology", "VPA"
    division: Division[];    // ["Elementary", "Middle", "High"]
  };
  isEnterprise: boolean;     // School-wide mandatory tool

  // === LICENSING (schema.org Offer) ===
  offers: {
    "@type": "Offer";
    price: number;           // Annual cost in USD
    priceCurrency: "USD";
    validFrom?: string;      // Contract start (ISO date)
    validThrough?: string;   // Contract end / renewal date
    eligibleQuantity?: {
      "@type": "QuantitativeValue";
      value: number;         // Number of licenses
      unitText: string;      // "seats", "users", "devices"
    };
    licenseType: LicenseType;
    autoRenewal: boolean;
    noticePeriod?: string;   // "30 days", "90 days"
  };

  // === TECHNICAL REQUIREMENTS ===
  operatingSystem?: string[];           // ["Windows", "macOS", "ChromeOS"]
  availableOnDevice?: DeviceType[];     // ["Desktop", "Mobile", "Tablet"]
  browserRequirements?: string[];       // ["Chrome", "Safari", "Firefox"]
  ssoEnabled: boolean;

  // === COMPLIANCE & ASSESSMENT ===
  compliance: {
    assessmentStatus: AssessmentStatus;
    assessmentDate?: string;
    reviewedBy?: string;
    privacyPolicy?: string;  // URL
    termsOfService?: string; // URL
    gdprCompliant?: boolean;
    coppaCompliant?: boolean;
    ferpaCompliant?: boolean;
    dataProcessingAgreement?: string;  // URL to DPA
  };

  // === RATINGS & REVIEWS ===
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;     // 4.5
    bestRating: 5;
    worstRating: 1;
    ratingCount?: number;
    reviewSource?: string;   // "EdTech Impact"
  };
  riskRating?: RiskRating;

  // === ACCESSIBILITY ===
  accessibilityFeature?: string[];  // ["WCAG 2.1 AA", "Screen Reader"]
  accessibilityHazard?: string[];   // ["Flashing", "Motion"]

  // === SUPPORT & TRAINING ===
  support: {
    email?: string;
    url?: string;
    phone?: string;
    documentation?: string;  // Help docs URL
    tutorials?: string;      // Tutorial URL
    options?: SupportOption[];
  };
  training?: {
    available: boolean;
    options?: TrainingOption[];
    url?: string;
  };

  // === INTEGRATIONS ===
  integrations?: {
    lti?: boolean;
    googleClassroom?: boolean;
    microsoftTeams?: boolean;
    canvas?: boolean;
    clever?: boolean;
    classlink?: boolean;
    api?: boolean;
  };

  // === ALTERNATIVES ===
  alternatives?: string[];   // Array of alternative app identifiers

  // === INTERNAL MANAGEMENT ===
  contacts: {
    productChampion?: Person;
    productManager?: Person;
    financeContact?: Person;
    providerContact?: Person;
  };
  notes?: string;

  // === METADATA ===
  dateCreated: string;       // ISO date
  dateModified: string;      // ISO date
  status: AppStatus;         // "active", "deprecated", "under_review"
}

// === PERSON TYPE ===
interface Person {
  "@type": "Person";
  name: string;
  email?: string;
}
```

## Enums / Controlled Vocabularies

```typescript
// Application Categories (based on EdTech taxonomy)
type ApplicationCategory =
  | "Learning Management"      // LMS, VLE
  | "Assessment"               // Testing, quizzes
  | "Content Creation"         // Authoring tools
  | "Collaboration"            // Communication, teamwork
  | "Productivity"             // Office tools, utilities
  | "Reference"                // Databases, libraries
  | "Simulation"               // Science, math simulations
  | "Adaptive Learning"        // Personalized learning
  | "Coding"                   // Programming tools
  | "Design"                   // Graphics, multimedia
  | "Communication"            // Video conferencing, messaging
  | "Administration"           // SIS, HR, finance
  | "Accessibility"            // Assistive technology
  | "Other";

// Target Audience
type Audience =
  | "Students"
  | "Teachers"
  | "Staff"
  | "Parents"
  | "Administrators";

// Educational Levels
type EducationalLevel =
  | "Pre-K"
  | "Kindergarten"
  | "Grade 1" | "Grade 2" | "Grade 3" | "Grade 4" | "Grade 5"   // Elementary
  | "Grade 6" | "Grade 7" | "Grade 8"                            // Middle
  | "Grade 9" | "Grade 10" | "Grade 11" | "Grade 12";            // High

// School Divisions
type Division =
  | "Elementary"    // Pre-K through Grade 5
  | "Middle"        // Grades 6-8
  | "High"          // Grades 9-12
  | "Central";      // Administrative/School-wide

// License Types
type LicenseType =
  | "Site License"           // Unlimited school-wide
  | "Enterprise License"     // Unlimited organization-wide
  | "Per User"               // Per seat/user
  | "Per Device"             // Per device
  | "Concurrent"             // X simultaneous users
  | "Freemium"               // Free tier with paid upgrades
  | "Open Source"            // Free/open source
  | "Trial";                 // Evaluation period

// Assessment Status
type AssessmentStatus =
  | "Approved"               // Fully approved for use
  | "Conditional"            // Approved with conditions
  | "Under Review"           // Being evaluated
  | "Not Recommended"        // Failed review
  | "Deprecated"             // Being phased out
  | "Pending";               // Not yet reviewed

// Risk Rating
type RiskRating =
  | "Low"                    // Minimal data/privacy concerns
  | "Medium"                 // Some concerns, mitigated
  | "High"                   // Significant concerns
  | "Critical";              // Do not use

// App Status
type AppStatus =
  | "active"                 // Currently in use
  | "inactive"               // Not currently used
  | "deprecated"             // Being phased out
  | "under_review";          // Being evaluated

// Device Types
type DeviceType =
  | "Desktop"
  | "Mobile"
  | "Tablet"
  | "Chromebook";

// Support Options
type SupportOption =
  | "Email"
  | "Phone"
  | "Live Chat"
  | "Knowledge Base"
  | "Community Forum"
  | "Dedicated Account Manager";

// Training Options
type TrainingOption =
  | "Self-paced Online"
  | "Live Webinar"
  | "On-site Training"
  | "Certification Program"
  | "Video Tutorials"
  | "Documentation";
```

## Database Schema (Supabase)

```sql
-- Drop existing table and recreate with new schema
-- Migration: v2_schema_redesign

CREATE TYPE application_category AS ENUM (
  'Learning Management', 'Assessment', 'Content Creation', 'Collaboration',
  'Productivity', 'Reference', 'Simulation', 'Adaptive Learning', 'Coding',
  'Design', 'Communication', 'Administration', 'Accessibility', 'Other'
);

CREATE TYPE audience_type AS ENUM ('Students', 'Teachers', 'Staff', 'Parents', 'Administrators');
CREATE TYPE division_type AS ENUM ('Elementary', 'Middle', 'High', 'Central');
CREATE TYPE license_type AS ENUM ('Site License', 'Enterprise License', 'Per User', 'Per Device', 'Concurrent', 'Freemium', 'Open Source', 'Trial');
CREATE TYPE assessment_status AS ENUM ('Approved', 'Conditional', 'Under Review', 'Not Recommended', 'Deprecated', 'Pending');
CREATE TYPE risk_rating AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE app_status AS ENUM ('active', 'inactive', 'deprecated', 'under_review');

CREATE TABLE applications (
  -- Identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT UNIQUE NOT NULL,  -- Slug: "adobe-creative-cloud"
  name TEXT NOT NULL,
  alternate_name TEXT,

  -- Description
  description TEXT,
  abstract TEXT,
  keywords TEXT[],

  -- Classification
  category application_category NOT NULL DEFAULT 'Other',
  sub_category TEXT,

  -- URLs & Media
  url TEXT,
  image TEXT,
  screenshots TEXT[],
  video TEXT,

  -- Provider (JSONB for flexibility)
  provider JSONB DEFAULT '{}',
  -- Example: {"name": "Adobe Inc.", "url": "https://adobe.com", "email": "support@adobe.com"}

  -- Educational Context
  audience audience_type[] DEFAULT '{}',
  educational_level TEXT[],  -- Array of grade levels
  educational_alignment JSONB DEFAULT '[]',

  -- Organization Scope
  department TEXT,
  divisions division_type[] DEFAULT '{}',
  is_enterprise BOOLEAN DEFAULT false,

  -- Licensing
  price DECIMAL(10,2),
  license_type license_type,
  license_quantity INTEGER,
  license_unit TEXT DEFAULT 'users',
  contract_start DATE,
  contract_end DATE,
  auto_renewal BOOLEAN DEFAULT false,
  notice_period TEXT,

  -- Technical
  operating_systems TEXT[],
  devices TEXT[],
  browser_requirements TEXT[],
  sso_enabled BOOLEAN DEFAULT false,

  -- Compliance
  assessment_status assessment_status DEFAULT 'Pending',
  assessment_date DATE,
  reviewed_by TEXT,
  privacy_policy_url TEXT,
  terms_url TEXT,
  gdpr_compliant BOOLEAN,
  coppa_compliant BOOLEAN,
  ferpa_compliant BOOLEAN,
  dpa_url TEXT,

  -- Ratings
  rating_value DECIMAL(2,1),
  rating_count INTEGER,
  rating_source TEXT,
  risk_rating risk_rating,

  -- Accessibility
  accessibility_features TEXT[],
  accessibility_hazards TEXT[],

  -- Support & Training (JSONB for flexibility)
  support JSONB DEFAULT '{}',
  training JSONB DEFAULT '{}',

  -- Integrations
  integrations JSONB DEFAULT '{}',

  -- Alternatives
  alternatives TEXT[],  -- Array of identifiers

  -- Internal Contacts (JSONB)
  contacts JSONB DEFAULT '{}',
  notes TEXT,

  -- Metadata
  status app_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Source tracking
  source TEXT,  -- "edtech_impact", "manual", "sheets"
  source_id TEXT,
  last_sync TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_applications_identifier ON applications(identifier);
CREATE INDEX idx_applications_name ON applications(name);
CREATE INDEX idx_applications_category ON applications(category);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_divisions ON applications USING GIN(divisions);
CREATE INDEX idx_applications_audience ON applications USING GIN(audience);
CREATE INDEX idx_applications_assessment ON applications(assessment_status);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_applications_updated_at();
```

## Field Mapping: Old → New

| Old Field | New Field | Transform |
|-----------|-----------|-----------|
| `product` | `name` | Direct |
| `product_id` | `identifier` | Direct |
| `description` | `description` | Direct |
| `category` | `category` | Map to enum |
| `subjects` | `keywords` | Split to array |
| `website` | `url` | Direct |
| `logo_url` | `image` | Direct |
| `vendor` | `provider.name` | Wrap in object |
| `support_email` | `provider.email` OR `support.email` | Wrap in object |
| `audience` | `audience` | Map to enum array |
| `grade_levels` | `educational_level` | Parse to array |
| `division` | `divisions` | Parse to enum array |
| `department` | `department` | Direct |
| `enterprise` | `is_enterprise` | Direct boolean |
| `annual_cost` | `price` | Direct |
| `license_type` | `license_type` | Map to enum |
| `licenses` | `license_quantity` | Direct |
| `renewal_date` | `contract_end` | Parse to date |
| `date_added` | `created_at` | Parse to timestamp |
| `sso_enabled` | `sso_enabled` | Direct boolean |
| `mobile_app` | `devices` | Parse to array |
| `tutorial_link` | `support.tutorials` | Wrap in object |
| `assessment_status` | `assessment_status` | Map to enum |
| `global_rating` | `rating_value` | Direct |
| `risk_rating` | `risk_rating` | Map to enum |
| `privacy_policy_url` | `privacy_policy_url` | Direct |
| `terms_url` | `terms_url` | Direct |
| `gdpr_url` | - | Deprecated (use gdpr_compliant) |
| `accessibility` | `accessibility_features` | Parse to array |
| `languages` | - | Add to new languages field |
| `alternatives` | `alternatives` | Parse to array |
| `product_champion` | `contacts.productChampion` | Wrap in object |
| `product_manager` | `contacts.productManager` | Wrap in object |
| `notes` | `notes` | Direct |

## API Response Format

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "identifier": "adobe-creative-cloud",
  "name": "Adobe Creative Cloud",
  "description": "Comprehensive suite of creative software...",
  "keywords": ["design", "photo editing", "video production"],
  "applicationCategory": "Design",
  "url": "https://www.adobe.com/creativecloud.html",
  "image": "https://example.com/adobe-cc-logo.png",
  "provider": {
    "@type": "Organization",
    "name": "Adobe Inc.",
    "url": "https://adobe.com",
    "email": "support@adobe.com"
  },
  "audience": ["Teachers", "Staff"],
  "educationalLevel": ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  "applicableLocation": {
    "@type": "EducationalOrganization",
    "name": "Singapore American School",
    "department": "VPA",
    "division": ["Middle", "High"]
  },
  "offers": {
    "@type": "Offer",
    "price": 50000.00,
    "priceCurrency": "USD",
    "validThrough": "2026-06-30",
    "eligibleQuantity": {
      "@type": "QuantitativeValue",
      "value": 2500,
      "unitText": "users"
    },
    "licenseType": "Site License"
  },
  "compliance": {
    "assessmentStatus": "Approved",
    "privacyPolicy": "https://adobe.com/privacy"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.5,
    "bestRating": 5,
    "reviewSource": "EdTech Impact"
  }
}
```

## Migration Plan

1. **Create new table** `applications` with v2 schema
2. **Write migration script** to transform old data
3. **Update API routes** to use new schema
4. **Update frontend** components
5. **Update sync routes** for bidirectional sync
6. **Update EdTech import** for new schema
7. **Test thoroughly**
8. **Drop old table** after verification
