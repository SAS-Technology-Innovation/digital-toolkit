# SAS Digital Toolkit - Mintlify Integration

This directory contains files for integrating the SAS Digital Toolkit Dashboard directly into Mintlify documentation pages.

## 🎯 Overview

Unlike the iframe embedding approach (Cloudflare Worker), this integration renders the dashboard **directly** within your Mintlify pages using JavaScript. This provides:

- ✅ **Native Integration**: No iframes, better user experience
- ✅ **Responsive Design**: Adapts to Mintlify's layout
- ✅ **Real-time Data**: Fetches directly from Google Apps Script
- ✅ **Easy Setup**: Just add a script tag and container div
- ✅ **Customizable**: Control appearance and behavior

## 📁 Files

- **`import-toolkit.js`**: Vanilla JavaScript implementation (works anywhere)
- **`DashboardWidget.jsx`**: React component (for React-based Mintlify setups)
- **`example.mdx`**: Complete example showing how to use in Mintlify
- **`README.md`**: This file

## 🚀 Quick Start

### Option 1: Using Vanilla JavaScript (Recommended)

This works with standard Mintlify setups and requires no build configuration.

1. **Host the JavaScript file** on a CDN or your static assets folder:
   - Upload `import-toolkit.js` to your CDN
   - Or place it in your Mintlify `/public` folder

2. **Add to your MDX file**:

```mdx
---
title: 'Digital Toolkit'
---

# SAS Digital Toolkit

<div id="toolkit-dashboard"></div>

<script src="/import-toolkit.js"></script>
<script>
  {`
  if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
      initToolkitDashboard({
        apiUrl: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
        containerId: 'toolkit-dashboard'
      });
    });
  }
  `}
</script>
```

3. **Deploy and test!**

### Option 2: Using React Component

If your Mintlify setup supports React components:

1. **Copy `DashboardWidget.jsx`** to your components folder

2. **Import and use in MDX**:

```mdx
---
title: 'Digital Toolkit'
---

import DashboardWidget from '@/components/DashboardWidget';

# SAS Digital Toolkit

<DashboardWidget
  apiUrl="YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL"
  defaultDivision="wholeSchool"
  showHeader={true}
/>
```

## ⚙️ Configuration Options

### JavaScript API

```javascript
initToolkitDashboard({
  // Required: Your Google Apps Script web app URL
  apiUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',

  // Optional: ID of the container element (default: 'toolkit-dashboard')
  containerId: 'toolkit-dashboard',

  // Optional: Default tab to show (default: 'wholeSchool')
  // Options: 'wholeSchool', 'elementary', 'middleSchool', 'highSchool'
  defaultDivision: 'wholeSchool',

  // Optional: Show header with title (default: true)
  showHeader: true,

  // Optional: Use compact mode (default: false)
  compact: false
});
```

### React Props

```jsx
<DashboardWidget
  apiUrl="YOUR_APPS_SCRIPT_URL"    // Required
  defaultDivision="wholeSchool"     // Optional
  showHeader={true}                  // Optional
  compact={false}                    // Optional
/>
```

## 📋 Setup Instructions

### Step 1: Get Your Google Apps Script URL

1. Open your Google Apps Script project
2. Click **Deploy** → **New deployment**
3. Select **Web app** as the deployment type
4. Set access to "Anyone" or "Anyone at SAS"
5. Copy the web app URL - it looks like:
   ```
   https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

### Step 2: Add to Mintlify

#### For Mintlify Docs (Standard)

1. Create a new MDX file in your docs folder:
   ```bash
   docs/
   └── toolkit.mdx
   ```

2. Add the dashboard:
   ```mdx
   ---
   title: 'Digital Toolkit'
   description: 'Browse all available applications'
   ---

   # SAS Digital Toolkit

   <div id="toolkit-dashboard"></div>

   <script src="https://YOUR_CDN/import-toolkit.js"></script>
   <script>
     {`
     if (typeof window !== 'undefined') {
       window.addEventListener('load', function() {
         initToolkitDashboard({
           apiUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL',
           containerId: 'toolkit-dashboard'
         });
       });
     }
     `}
   </script>
   ```

3. Update `mint.json` to include your new page:
   ```json
   {
     "navigation": [
       {
         "group": "Resources",
         "pages": ["toolkit"]
       }
     ]
   }
   ```

#### For Mintlify with Custom Components

1. Place `DashboardWidget.jsx` in your components folder:
   ```bash
   components/
   └── DashboardWidget.jsx
   ```

2. Create your MDX file:
   ```mdx
   import DashboardWidget from '@/components/DashboardWidget';

   <DashboardWidget apiUrl="YOUR_URL" />
   ```

### Step 3: Deploy

```bash
# If using Mintlify CLI
mintlify dev     # Test locally
mintlify deploy  # Deploy to production
```

## 🎨 Customization

### Styling

The dashboard includes built-in styles that match most documentation themes. To customize:

1. **Override CSS variables** in your global styles:

```css
/* In your global CSS file */
.toolkit-widget {
  --toolkit-primary: #192f59;
  --toolkit-secondary: #295c9c;
  --toolkit-border-radius: 12px;
}
```

2. **Custom CSS classes**:

```css
/* Target specific elements */
.toolkit-app-card {
  border-radius: 8px !important;
}

.toolkit-section-title {
  font-family: 'Your Custom Font' !important;
}
```

### Hide Specific Sections

You can modify the JavaScript to hide sections you don't need:

```javascript
// In import-toolkit.js, find the renderDivisionContent method
// Comment out sections you don't want:

// ${Object.keys(departments).length > 0 ? `
//   <div class="toolkit-departments-section">
//     ...
//   </div>
// ` : ''}
```

## 🔧 Advanced Usage

### Multiple Dashboards on One Page

You can have multiple dashboard instances with different configurations:

```mdx
# Whole School Apps

<div id="toolkit-whole-school"></div>

# Elementary Apps Only

<div id="toolkit-elementary"></div>

<script src="/import-toolkit.js"></script>
<script>
  {`
  if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
      // Whole school dashboard
      initToolkitDashboard({
        apiUrl: 'YOUR_URL',
        containerId: 'toolkit-whole-school',
        defaultDivision: 'wholeSchool'
      });

      // Elementary only dashboard
      initToolkitDashboard({
        apiUrl: 'YOUR_URL',
        containerId: 'toolkit-elementary',
        defaultDivision: 'elementary'
      });
    });
  }
  `}
</script>
```

### Custom Loading States

You can add custom loading HTML in the container:

```html
<div id="toolkit-dashboard">
  <div style="text-align: center; padding: 3rem;">
    <p>Loading SAS Digital Toolkit...</p>
    <img src="/loading.gif" alt="Loading" />
  </div>
</div>
```

The script will replace this content once the data loads.

### Error Handling

Add custom error handling:

```javascript
initToolkitDashboard({
  apiUrl: 'YOUR_URL',
  containerId: 'toolkit-dashboard',
  onError: function(error) {
    console.error('Dashboard error:', error);
    // Custom error handling
    document.getElementById('toolkit-dashboard').innerHTML = `
      <div class="custom-error">
        <p>Unable to load the dashboard. Please try again later.</p>
      </div>
    `;
  }
});
```

## 🆚 Comparison with Other Options

| Feature | Mintlify Import | Cloudflare Worker | Google Apps Script |
|---------|----------------|-------------------|-------------------|
| **Integration** | Native (no iframe) | Iframe | Full page |
| **Load Speed** | Medium (2-3s) | Fast (< 500ms) | Slow (2-4s) |
| **Data** | Real-time | Static | Real-time |
| **Setup** | Easy | Moderate | Easy |
| **Customization** | High | Medium | Low |
| **Best For** | Documentation | Public embed | Internal use |

**Choose Mintlify Import if:**
- You want native integration (no iframe)
- You're using Mintlify or similar MDX platforms
- You need real-time data from Google Sheets
- You want easy customization

**Choose Cloudflare Worker if:**
- You need the fastest possible loading
- You're embedding on multiple sites
- Static data is acceptable
- You want global CDN distribution

## 🐛 Troubleshooting

### Dashboard not loading

**Check browser console for errors:**
```javascript
// Open browser DevTools (F12) and check Console
```

**Common issues:**
1. Incorrect Apps Script URL
2. CORS policy blocking the request
3. Apps Script not deployed as web app

**Solution:**
- Verify your Apps Script URL
- Ensure Apps Script is deployed with "Anyone" access
- Check that your Apps Script has the correct permissions

### Styles not applying

**Issue:** Dashboard looks unstyled

**Solution:**
```javascript
// Force style injection
document.getElementById('toolkit-dashboard-styles')?.remove();
// Then reinitialize the dashboard
```

### Multiple instances conflicting

**Issue:** Multiple dashboards on same page interfere with each other

**Solution:** Use unique container IDs:
```javascript
initToolkitDashboard({
  apiUrl: 'YOUR_URL',
  containerId: 'toolkit-dashboard-1'  // Unique ID
});

initToolkitDashboard({
  apiUrl: 'YOUR_URL',
  containerId: 'toolkit-dashboard-2'  // Different unique ID
});
```

## 📱 Mobile Responsiveness

The dashboard is fully responsive and works on:
- ✅ Desktop (1920px+)
- ✅ Laptop (1366px - 1920px)
- ✅ Tablet (768px - 1366px)
- ✅ Mobile (< 768px)

On mobile devices:
- Tabs become scrollable
- Grid layouts switch to single column
- Touch-friendly tap targets

## 🔐 Security Considerations

1. **CORS**: Ensure your Google Apps Script allows requests from your Mintlify domain
2. **Data Privacy**: Dashboard data is fetched client-side
3. **No API Keys**: No sensitive credentials needed in frontend code
4. **Content Security Policy**: Works with most CSP configurations

## 📊 Performance

- **Initial Load**: 2-3 seconds (fetching from Apps Script)
- **Subsequent Loads**: Instant (client-side tab switching)
- **Bundle Size**: ~15KB (JavaScript + CSS)
- **Dependencies**: None (vanilla JS)

## 🤝 Support

For issues or questions:

1. **Mintlify Issues**: Check [Mintlify Docs](https://mintlify.com/docs)
2. **Dashboard Issues**: Contact Technology & Innovation team
3. **Google Apps Script**: See main project documentation

## 📝 Example Projects

See `example.mdx` for a complete, working example with:
- Custom styling
- Loading states
- Error handling
- Mintlify components integration

---

**Last Updated**: January 2025
**Maintained By**: SAS Technology & Innovation Team
