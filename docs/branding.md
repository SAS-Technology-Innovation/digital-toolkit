# Singapore American School (SAS) Brand Guidelines

## Quick Reference

**Last Updated:** March 13, 2025  
**Contact:** communications@sas.edu.sg | +65 6360 6323  
**Website:** www.sas.edu.sg

---

## Brand Colors

### Primary Colors

Use SAS Red and SAS Blue as main colors. Eagle Yellow and Light Gray are accent colors.

| Color | Pantone | HEX | RGB | CMYK |
|-------|---------|-----|-----|------|
| **SAS Red** | 187 C | `#a0192a` | `rgb(171, 22, 43)` | `22 100 78 16` |
| **SAS Blue** | 2757 C | `#1a2d58` | `rgb(0, 30, 95)` | `100 89 36 31` |
| **Eagle Yellow** | 3514 C | `#fabc00` | `rgb(250, 188, 0)` | `1 29 94 0` |
| **Light Gray** | 427 C | `#d8dadb` | `rgb(214, 212, 211)` | `19 15 16 1` |

### Division Colors

| Division | Pantone | HEX | RGB | CMYK |
|----------|---------|-----|-----|------|
| **Elementary School** | 7689 C | `#228ec2` | `rgb(34, 142, 194)` | `78 31 0 5` |
| **Middle School** | 187 C | `#a0192a` | `rgb(171, 22, 43)` | `22 100 78 16` |
| **High School** | 2757 C | `#1a2d58` | `rgb(0, 30, 95)` | `100 89 36 31` |
| **General/Admin** | 424 C | `#6d6f72` | `rgb(109, 111, 114)` | `0 0 0 70` |

### CSS Color Variables

```css
:root {
  /* Primary Colors */
  --sas-red: #a0192a;
  --sas-blue: #1a2d58;
  --sas-yellow: #fabc00;
  --sas-gray: #d8dadb;
  
  /* Division Colors */
  --elementary: #228ec2;
  --middle-school: #a0192a;
  --high-school: #1a2d58;
  --admin: #6d6f72;
  
  /* Semantic Colors */
  --primary: var(--sas-blue);
  --secondary: var(--sas-red);
  --accent: var(--sas-yellow);
}
```

---

## Typography

### Font Stack

```css
/* Headings */
font-family: 'Bebas Neue', 'Helvetica Neue', Helvetica, Arial, sans-serif;

/* Body Copy */
font-family: 'Avenir LT Std', 'Helvetica Neue', Helvetica, Arial, sans-serif;

/* Digital Platforms (Google Workspace) */
font-family: 'Bebas Neue', 'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;

/* Spirit/Athletics */
font-family: 'Joe College', 'Milkshake', 'Bebas Neue', sans-serif;
```

### Font Specifications

| Use Case | Font | Weight | Notes |
|----------|------|--------|-------|
| Headings/Titles | Bebas Neue | Bold | Primary display font |
| Body Text | Avenir Lt Std | Regular | Primary content font |
| Google Docs/Slides | Bebas Neue, DM Sans | - | Web-safe alternatives |
| Athletics/Spirit | Joe College, Milkshake | - | Contact comms office for license |
| Fallback | Helvetica Neue → Helvetica → Arial | - | System defaults |

### Typography Scale (Recommended)

```css
/* Example scale for web/app development */
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
--font-size-5xl: 3rem;      /* 48px */
```

---

## Logo Assets

### Logo Components

- **Eagle Shield**: Iconic shield with eagle head
- **SAS Wordmark**: "SINGAPORE AMERICAN SCHOOL" text
- **Full Logo**: Eagle Shield + Wordmark combined

### Usage Rules

#### External Communications
- ✅ Use full SAS logo (Shield + Wordmark)
- ❌ Never use Eagle Shield alone
- ✅ Must always include wordmark

#### Internal Communications
- ✅ All components can be used independently
- ✅ Eagle Shield may be used alone
- **Preference order:** Full logo → Wordmark → Eagle Shield

### Minimum Sizes

| Medium | Minimum Size |
|--------|--------------|
| Print materials | 15mm |
| Digital media | 30px |
| Small-scale (stationery) | 8mm |

### Logo Variations

```
/assets/logos/
├── full-color/
│   ├── sas-logo-full-color.svg
│   ├── sas-logo-full-color.png
│   └── sas-logo-full-color-white-outline.svg  (for colored backgrounds)
├── monochrome/
│   ├── sas-logo-black.svg
│   ├── sas-logo-white.svg
│   ├── sas-logo-blue.svg
│   └── sas-logo-red.svg
├── shield-only/
│   ├── eagle-shield-full-color.svg
│   ├── eagle-shield-black.svg
│   └── eagle-shield-white.svg
└── wordmark-only/
    ├── sas-wordmark-blue.svg
    └── sas-wordmark-white.svg
```

### Clear Space Requirements

Maintain clear space around logo equal to the height of letter "S" in wordmark.

```
Exclusion zone = height of "S" from wordmark
```

---

## Secondary Colors

### Extended Palette

| Color Name | Pantone | HEX | Use Case |
|------------|---------|-----|----------|
| Orange | 716 C | `#ee7103` | Accent |
| Coral | 2034 C | `#e6413d` | Accent |
| Deep Red | 200 C | `#b60b37` | Accent |
| Crimson | 3517 C | `#c6171d` | Accent |
| Magenta | 2040 C | `#d3004e` | Accent |
| Pink | 226 C | `#d2006a` | Accent |
| Purple | 240 C | `#c42384` | Accent |
| Plum | 228 C | `#870859` | Accent |
| Sky Blue | 2393 C | `#008bc5` | Accent |
| Teal | 7704 C | `#1284ad` | Accent |
| Steel Blue | 7699 C | `#346a83` | Accent |
| Navy | 2186 C | `#004685` | Accent |
| Cyan | 631 C | `#2db7be` | Accent |
| Green | 340 C | `#009754` | Accent |
| Forest | 2245 C | `#007150` | Accent |
| Lime | 390 C | `#a2ba0f` | Accent |
| Gold | 1235 C | `#fdc013` | Accent |
| Yellow | 124 C | `#e5af00` | Accent |
| Tan | 4271 C | `#897363` | Accent |
| Brown | 2472 C | `#5c402c` | Accent |
| Gray 30% | 4281 C | `#aeb0b3` | Neutral |
| Gray 40% | 4289 C | `#97999c` | Neutral |
| Gray 50% | 4278 C | `#818386` | Neutral |
| Gray 80% | 425 C | `#575756` | Neutral |

---

## Icon Library

200+ custom icons available. Categories include:

- **Academic**: Art, World Languages, Critical Thinking, Content Knowledge
- **Athletics**: Touch Rugby, Volleyball, Cross Country
- **Character**: Communication, Collaboration, Creativity, Cultural Competence
- **Services**: Eagle Stop, Bus, Directory, SASCard, Uniforms
- **Milestones**: Graduation, Alumni

### Icon Usage

```html
<!-- SVG Icon Example -->
<img src="/assets/icons/eagle-stop.svg" alt="Eagle Stop" class="sas-icon" />

<!-- CSS for icon sizing -->
.sas-icon {
  width: 48px;
  height: 48px;
}

.sas-icon-sm { width: 24px; height: 24px; }
.sas-icon-md { width: 48px; height: 48px; }
.sas-icon-lg { width: 64px; height: 64px; }
```

**Request icons:** communications@sas.edu.sg

---

## Design Principles

### Brand Values (The Eagle Way)
- Compassion
- Fairness
- Honesty
- Respect
- Responsibility

### Visual Identity
- **Modern & Clean**: Uncluttered designs with clear hierarchy
- **Bold & Confident**: Strong use of primary colors
- **Professional**: Appropriate for educational institution
- **Inclusive**: Representing diverse community

---

## Digital Implementation

### Responsive Logo Display

```css
/* Logo responsive sizing */
.sas-logo {
  max-width: 200px;
  height: auto;
}

@media (max-width: 768px) {
  .sas-logo {
    max-width: 150px;
  }
}

@media (max-width: 480px) {
  .sas-logo {
    max-width: 120px;
    min-width: 30px; /* 30px minimum for digital */
  }
}
```

### Accessibility

```css
/* Ensure sufficient contrast ratios */
/* SAS Blue on white: 12.77:1 (WCAG AAA) */
/* SAS Red on white: 7.44:1 (WCAG AA) */

/* Recommended text color combinations */
.text-on-light {
  color: var(--sas-blue); /* Primary text */
}

.text-on-dark {
  color: white;
  background-color: var(--sas-blue);
}

/* Accessible button states */
.btn-primary {
  background-color: var(--sas-blue);
  color: white;
}

.btn-primary:hover {
  background-color: #0d1d3f; /* Darker blue */
}

.btn-primary:focus {
  outline: 3px solid var(--sas-yellow);
  outline-offset: 2px;
}
```

### Dark Mode Support

```css
@media (prefers-color-scheme: dark) {
  :root {
    --sas-background: #1a1a1a;
    --sas-text: #ffffff;
    --logo-variant: 'white'; /* Use white logo on dark backgrounds */
  }
}
```

---

## File Naming Conventions

```
Logo files:
sas-logo-[variant]-[color]-[size].[ext]
Examples:
- sas-logo-full-color.svg
- sas-logo-horizontal-white.png
- sas-eagle-shield-blue-large.svg

Icon files:
sas-icon-[category]-[name].[ext]
Examples:
- sas-icon-academic-art.svg
- sas-icon-athletics-volleyball.svg

Division logos:
sas-[division]-logo-[variant].[ext]
Examples:
- sas-elementary-logo-full-color.svg
- sas-highschool-logo-white.svg
```

---

## Brand Don'ts

❌ **Never:**
- Alter logo colors or proportions
- Use unapproved fonts
- Place logo on busy backgrounds without proper contrast
- Stretch or distort logo
- Use Eagle Shield alone for external communications
- Rotate or add effects to the logo
- Use low-resolution assets
- Ignore minimum size requirements
- Place elements within logo exclusion zone

---

## Asset Request

For logo files, brand assets, or questions:

**SAS Communications Office**
- Email: communications@sas.edu.sg
- Phone: +65 6360 6323
- Website: www.sas.edu.sg

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | March 13, 2025 | Initial brand guidelines |

---

## License

© 2025 Singapore American School. All rights reserved.

PEI Registration No.: 196400340R  
Accredited by: Western Association of Schools and Colleges (WASC)

**"Once an Eagle, Always an Eagle"**
