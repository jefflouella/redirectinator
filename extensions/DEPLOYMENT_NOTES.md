# Deployment Notes for redirectinator.us

## 🚀 Production Deployment

### Extension Distribution Files

The `dist/` folder contains all files needed for production distribution:

```
extensions/dist/
├── index.html                    # Download page
├── INSTALLATION.md              # Installation guide
├── redirectinator-advanced-chrome.zip    # Chrome extension
└── redirectinator-advanced-firefox.zip   # Firefox extension
```

### Deployment Steps

1. **Upload to Production**
   - Copy the entire `dist/` folder to your web server
   - Place it at: `https://redirectinator.us/extensions`

2. **Verify Access**
   - Test: `https://redirectinator.us/extensions`
   - Should show the download page
   - Download links should work correctly

3. **Extension Permissions**
   - Both Chrome and Firefox extensions now include:
     - `https://redirectinator.us/*` in permissions
     - `https://redirectinator.us/*` in content script matches

### User Experience Flow

1. **User visits redirectinator.us** → Sees "Advanced Mode Requires Extension"
2. **Clicks download button** → Goes to `/extensions`
3. **Downloads extension** → Follows installation guide
4. **Installs extension** → Returns to redirectinator.us
5. **Advanced Mode available** → Extension detected and working

### Testing Checklist

- [ ] Download page accessible at `/extensions`
- [ ] Chrome extension downloads correctly
- [ ] Firefox extension downloads correctly
- [ ] Installation guide is clear and complete
- [ ] Extension works on redirectinator.us domain
- [ ] Advanced Mode becomes available after installation

### Future Store Launch

When ready to submit to stores:

1. Update web app messages to point to stores instead of manual downloads
2. Remove or update the manual installation instructions
3. Update extension descriptions for store submission
4. Submit to Chrome Web Store and Firefox Add-ons

---

**Current Status**: Ready for production deployment  
**Domain**: redirectinator.us  
**Last Updated**: January 2025
