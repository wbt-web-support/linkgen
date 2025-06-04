# LinkGen - URL Parameter Generator

A modern, ChatGPT-inspired web application for generating URLs with tracking parameters for Meta Ads and Google Ads campaigns.

## Features

- 🎨 **Modern ChatGPT-like Interface** - Clean, dark theme with smooth animations
- 🔗 **URL Parameter Generation** - Automatically adds `lead_source` parameters
- 📋 **One-Click Copy** - Copy generated URLs to clipboard instantly
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- ⌨️ **Keyboard Shortcuts** - Enhanced productivity with keyboard navigation
- ✨ **Real-time Validation** - Validates URLs before processing
- 🎯 **Toast Notifications** - User-friendly feedback messages

## How to Use

1. **Open the Application**
   - Open `index.html` in your web browser
   - The app will automatically focus on the input field

2. **Enter Your URL**
   - Paste your base URL into the text area
   - Example: `https://stewart-temp-solutions.com/solar-panels-for-homes-and-businesses/`

3. **Generate URLs**
   - Click the generate button (arrow up icon) or press Enter
   - The app will create two tracking URLs:
     - Meta Ads URL: `?lead_source=meta-ads`
     - Google Ads URL: `?lead_source=google-ads`

4. **Copy URLs**
   - Click the copy button next to each generated URL
   - URLs are automatically copied to your clipboard
   - Visual feedback confirms successful copying

## Generated URLs Example

**Input:**
```
https://stewart-temp-solutions.com/solar-panels-for-homes-and-businesses/
```

**Output:**
```
Meta Ads: https://stewart-temp-solutions.com/solar-panels-for-homes-and-businesses/?lead_source=meta-ads
Google Ads: https://stewart-temp-solutions.com/solar-panels-for-homes-and-businesses/?lead_source=google-ads
```

## Keyboard Shortcuts

- **Enter** - Generate URLs
- **Ctrl/Cmd + Enter** - Generate URLs (alternative)
- **Escape** - Reset form and start over

## Browser Support

- Modern browsers with JavaScript enabled
- Clipboard API support for optimal copy functionality
- Fallback copy method for older browsers

## File Structure

```
linkgen/
├── index.html          # Main HTML file
├── styles.css          # Styling and animations
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Features in Detail

### URL Validation
- Ensures proper URL format before processing
- Handles various URL schemes (http, https)
- Provides clear error messages for invalid URLs

### Smart Parameter Handling
- Preserves existing URL parameters
- Adds or updates `lead_source` parameter
- Maintains URL structure and encoding

### Responsive Design
- Optimized for desktop and mobile devices
- Touch-friendly interface on mobile
- Adaptive layout that works on all screen sizes

### Accessibility
- Keyboard navigation support
- Focus management for screen readers
- High contrast colors for readability

## Development

The application is built with vanilla HTML, CSS, and JavaScript - no frameworks required.

### Customization
- Colors and themes can be modified in `styles.css`
- Parameter names can be changed in `script.js`
- Additional tracking sources can be added by extending the generation logic

## License

Open source - feel free to modify and use for your projects. 