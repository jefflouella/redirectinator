# Redirectinator Advanced Extensions

> **⚠️ PRE-RELEASE VERSION** - Manual installation required until official launch

## 🚀 Quick Start

### For Users (Manual Installation)

1. **Download**: Go to [`/extensions`](/extensions) in your browser
2. **Choose your browser**: Download Chrome or Firefox extension
3. **Install manually**: Follow the installation guide in the dist folder
4. **Test**: Visit [redirectinator.us](https://redirectinator.us) and enable Advanced Mode

### For Developers

```bash
# Build Chrome extension
npm run build:chrome

# Build Firefox extension
npm run build:firefox

# Build both extensions
npm run build:all
```

## 📁 Directory Structure

```
extensions/
├── chrome/                 # Chrome extension source
├── firefox/                # Firefox extension source
├── shared/                 # Shared extension code
├── dist/                   # Distribution files (for users)
│   ├── index.html         # Download page
│   ├── INSTALLATION.md    # Installation guide
│   ├── redirectinator-advanced-chrome.zip
│   └── redirectinator-advanced-firefox.zip
├── build.js               # Build automation
└── package.json           # Dependencies
```

## 🔧 Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

```bash
npm install
```

### Building

```bash
# Build Chrome extension
npm run build:chrome

# Build Firefox extension
npm run build:firefox

# Build both and copy to dist
npm run build:all
```

### Testing

```bash
# Test Chrome extension
npm run test:chrome

# Test Firefox extension
npm run test:firefox
```

## 📦 Distribution

The `dist/` folder contains everything users need to manually install the extensions:

- **`index.html`** - Beautiful download page with installation instructions
- **`INSTALLATION.md`** - Comprehensive installation guide
- **Extension ZIPs** - Ready-to-install extension packages

### Accessing Distribution Files

Users can access the distribution files at:

- **Local development**: `http://localhost:3000/extensions`
- **Production**: `https://redirectinator.us/extensions`

## 🚨 Important Notes

### Pre-Release Status

- **Not in stores yet** - Manual installation required
- **Testing phase** - May have bugs or incomplete features
- **Local development** - Designed for localhost:3000 testing

### Installation Requirements

- **Chrome/Edge**: Developer mode must be enabled
- **Firefox**: Temporary add-on (removed on restart)
- **Production**: Web app must be accessible on redirectinator.us

## 🔮 Future Plans

### Phase 1: Testing (Current)

- Manual installation only
- Local development testing
- Bug fixes and feature completion

### Phase 2: Store Submission

- Chrome Web Store submission
- Firefox Add-ons submission
- Auto-updates and distribution

### Phase 3: Official Launch

- Public availability
- Marketing and promotion
- User support channels

## 📞 Support

During pre-release testing:

1. Check the [installation guide](dist/INSTALLATION.md)
2. Review browser console for errors
3. Ensure extension is properly loaded
4. Verify web app is accessible on redirectinator.us

## 🏗️ Architecture

### Chrome Extension (Manifest V3)

- Background service worker
- Content scripts for page analysis
- Tab-based redirect detection
- Port-based communication

### Firefox Extension (Manifest V2)

- Background scripts
- Content scripts for page analysis
- WebExtension APIs
- Message-based communication

### Shared Features

- Meta refresh detection
- JavaScript redirect monitoring
- HTTP redirect following
- Comprehensive redirect chain analysis

---

**Version**: 1.0.0-local  
**Status**: Pre-release Testing  
**Last Updated**: January 2025
