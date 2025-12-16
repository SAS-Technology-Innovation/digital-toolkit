# Digital Signage Display

The **SAS Digital Toolkit Signage** is a full-screen, auto-advancing slideshow designed for digital signage boards to showcase the latest applications and information about the school's digital ecosystem.

## 🎯 Purpose

Display engaging, informative content on digital signage boards throughout the school that:
- Showcases recently added applications
- Highlights core enterprise tools
- Provides information about division-specific apps
- Educates the community about available digital resources

## 🚀 Quick Start

### Accessing the Signage Display

1. **Deploy your Apps Script** (if not already deployed)
   ```bash
   npm run deploy
   ```

2. **Get your web app URL** from the Apps Script deployment

3. **Access the signage display** by adding `?page=signage` to your web app URL:
   ```
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?page=signage
   ```

4. **Open in full-screen mode** (F11 on most browsers) for the best signage experience

### Local Testing

To test the signage display locally:

1. Open `signage.html` directly in your browser
2. It will use mock data for demonstration
3. The slideshow will auto-advance every 12 seconds

## 📺 Slide Types

The signage display includes the following slide types:

### 1. **Welcome Slide**
- SAS branding and introduction
- Sets the tone with animated logo
- Explains the purpose of the digital toolkit

### 2. **Stats Overview**
- Total applications count
- School-wide tools count
- Division-specific apps count
- Enterprise core tools count
- Visually engaging stat cards

### 3. **Enterprise Apps** (if any exist)
- Official SAS core tools
- Premium gold styling
- Shows up to 6 enterprise apps per slide
- Displays app logos, names, and descriptions

### 4. **What's New** (apps added in last 30 days)
- Recently added applications
- Eye-catching red theme with "NEW" badges
- Shows up to 6 new apps per slide
- Multiple slides created if more than 6 new apps
- Displays addition date

### 5. **App Spotlight**
- Featured apps with detailed information
- Full-screen focus on individual apps
- Shows logo, description, features, and badges
- Highlights key features like SSO and mobile support
- Prioritizes apps with complete descriptions

### 6. **Division Overview**
- Elementary School apps (blue theme)
- Middle School apps (red theme)
- High School apps (navy theme)
- Shows sample of division-specific apps
- Displays total count of available apps

## ⚙️ Configuration

### Customizable Settings (in signage.html)

Located at the top of the `<script>` section:

```javascript
const SLIDE_DURATION = 12000; // 12 seconds per slide
const REFRESH_INTERVAL = 300000; // Refresh data every 5 minutes
const NEW_APP_THRESHOLD_DAYS = 30; // Apps added in last 30 days are "new"
const MAX_APPS_PER_SLIDE = 6; // Maximum apps to show per slide
```

**Parameters:**
- `SLIDE_DURATION`: Time each slide displays (in milliseconds)
- `REFRESH_INTERVAL`: How often to reload data from backend (in milliseconds)
- `NEW_APP_THRESHOLD_DAYS`: How many days back to consider an app "new"
- `MAX_APPS_PER_SLIDE`: Maximum number of apps to display on multi-app slides

### SAS Brand Colors

The signage uses official SAS brand colors defined in CSS:

```css
--sas-red: #a0192a
--sas-blue: #1a2d58
--sas-yellow: #fabc00
--elementary: #228ec2
--middle-school: #a0192a
--high-school: #1a2d58
```

## 🎨 Design Features

### Visual Elements
- **Full-screen layout** optimized for digital displays
- **Smooth transitions** between slides (1-second fade)
- **Animated elements** for visual interest (floating logos, pulsing badges)
- **Progress indicator** at the bottom showing current slide
- **Live updates indicator** in top-right corner
- **Responsive design** adapts to different screen sizes

### Typography
- **Headings**: Bebas Neue (bold, impactful)
- **Body text**: DM Sans (clean, readable)
- **Large font sizes** for visibility from a distance

### Animations
- **Pulse effect** on welcome logo
- **Float animation** on spotlight app logos
- **Glow effect** on "What's New" badges
- **Smooth fade transitions** between slides

## 📊 Data Source

The signage display uses the same backend as the main dashboard:
- Connects to `getDashboardData()` function in [Code.js](Code.js)
- Reads from the same Google Sheets data source
- Auto-refreshes every 5 minutes to show latest data
- Falls back to mock data for local testing

## 🖥️ Display Recommendations

### Hardware Setup
- **Screen Resolution**: 1920x1080 (Full HD) recommended
- **Orientation**: Landscape
- **Browser**: Chrome, Firefox, or Edge (latest versions)
- **Connection**: Stable internet connection required

### Best Practices
1. **Full-screen mode**: Press F11 to hide browser UI
2. **Disable sleep mode**: Configure display to stay on
3. **Auto-refresh**: Browser will auto-refresh data, but consider page reload daily
4. **Network**: Ensure reliable internet connection for data updates
5. **Testing**: Test in your actual display environment before deployment

### Kiosk Mode Setup

For dedicated signage displays, consider using browser kiosk mode:

**Chrome Kiosk Mode (Windows/Linux):**
```bash
chrome.exe --kiosk "YOUR_SIGNAGE_URL"
```

**Chrome Kiosk Mode (Mac):**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --kiosk "YOUR_SIGNAGE_URL"
```

## 🔄 Auto-Refresh & Updates

### Automatic Data Refresh
- Slideshow automatically fetches fresh data every 5 minutes
- Updates happen in the background without disrupting the slideshow
- New apps and changes appear automatically

### Live Updates Indicator
- Green dot in top-right corner indicates live connection
- Blinking animation shows the system is actively updating

### Manual Refresh
- Simply reload the page (F5) to force a data refresh
- All slides regenerate with latest data

## 🎯 Use Cases

### Locations
- **Main entrance** - Welcome visitors and showcase tools
- **Library** - Highlight educational resources
- **Teacher lounges** - Keep staff informed of new apps
- **Cafeteria** - Engage students during breaks
- **Division offices** - Show division-specific apps

### Events
- **Open houses** - Demonstrate school technology
- **Parent conferences** - Inform parents of student resources
- **Professional development** - Showcase tools for teachers
- **New student orientation** - Introduce digital ecosystem

## 📝 Maintenance

### Updating Content
Content updates automatically from your Google Sheets:
1. Add/update apps in your Google Sheets
2. Signage display will fetch updates within 5 minutes
3. No code changes needed for content updates

### Customizing Slides
To modify slide content or styling:
1. Edit `signage.html`
2. Deploy updated version: `npm run push && npm run deploy`
3. Changes will reflect on next page load

### Troubleshooting

**Slideshow not advancing:**
- Check browser console for JavaScript errors
- Verify data is loading (check network tab)

**Data not loading:**
- Verify Script Properties are configured (SPREADSHEET_ID, SHEET_NAME)
- Check Google Sheets permissions
- Review Apps Script execution logs: `npm run logs`

**Images not displaying:**
- Verify logo_url field contains valid image URLs
- Check image URLs are publicly accessible
- Confirm CORS settings allow image loading

**Blank screen:**
- Check browser console for errors
- Verify you're using `?page=signage` parameter
- Ensure Apps Script deployment is current

## 🔧 Advanced Customization

### Adding Custom Slides

To add custom slide types, edit the `generateSlides()` function:

```javascript
// Add your custom slide after line ~785
slides.push(createYourCustomSlide());
```

Then create your slide function:

```javascript
function createYourCustomSlide() {
  const slide = document.createElement('div');
  slide.className = 'slide your-custom-slide';
  slide.innerHTML = `
    <h1>Your Custom Content</h1>
    <p>Your custom slide content here</p>
  `;
  return slide;
}
```

### Changing Slide Order

Modify the order in `generateSlides()` [signage.html:770-807](signage.html#L770-L807)

### Custom Transitions

Edit the `.slide` CSS class to change transition effects [signage.html:40-50](signage.html#L40-L50)

## 📄 Related Documentation

- [CLAUDE.md](CLAUDE.md) - Main project documentation
- [Code.js](Code.js) - Backend data processing
- [index.html](index.html) - Main dashboard UI
- [AI_FEATURES.md](AI_FEATURES.md) - AI integration documentation

## 🆘 Support

For issues or questions:
1. Check [CLAUDE.md](CLAUDE.md) troubleshooting section
2. Review Apps Script logs: `npm run logs`
3. Test locally with mock data to isolate issues
4. Verify Google Sheets data format matches expectations

---

**Enjoy showcasing your digital toolkit on your signage displays!** 🎉
