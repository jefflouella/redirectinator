# 🧪 Testing Redirectinator Advanced Extensions

## Quick Test Checklist

### 1. Extension Loading
- [ ] Chrome extension loads without errors in `chrome://extensions/`
- [ ] Firefox add-on loads without errors in `about:debugging`
- [ ] Visual indicator appears: "🔍 RA Extension Active" (top-right corner)
- [ ] Console shows: "Redirectinator Advanced: Extension API injected"

### 2. Web App Detection
- [ ] Visit Redirectinator web app (localhost or deployed)
- [ ] Browser console shows: "Extension detected via global object: 1.0.0-local"
- [ ] Advanced Mode toggle becomes enabled (not grayed out)
- [ ] Extension Status shows: "Extension detected"

### 3. URL Analysis Testing
- [ ] Switch to Advanced Mode
- [ ] Test with HTTP redirect URL: `https://httpbin.org/redirect/2`
- [ ] Test with Meta Refresh URL: `http://testing.tamethebots.com/metaredirect.html`
- [ ] Test with JavaScript redirect URL: `http://testing.tamethebots.com/jsredirect.html`

### 4. Debug Page Testing
- [ ] Open `extensions/debug.html` in browser
- [ ] Extension status shows green indicator
- [ ] Click "Test URL Analysis" with test URLs
- [ ] Results appear in JSON format

## 🔧 Troubleshooting

### Extension Not Detected

**Symptoms:**
- Extension Status: "Extension not detected"
- Advanced Mode toggle is disabled
- Console shows: "Runtime connection failed"

**Solutions:**
1. **Reload Extension:**
   - Chrome: Go to `chrome://extensions/` → Click reload button
   - Firefox: Go to `about:debugging` → Click reload button

2. **Check Permissions:**
   - Extension must have "Active Tab" permission
   - Content scripts must run on all URLs

3. **Check Console Logs:**
   - Open browser DevTools (F12)
   - Look for extension-related errors
   - Check if content script is injected

### Analysis Fails

**Symptoms:**
- URL analysis returns error
- Console shows timeout or connection errors

**Solutions:**
1. **Check Background Script:**
   - Chrome: `chrome://extensions/` → Inspect background page
   - Firefox: `about:debugging` → Inspect extension

2. **Verify Message Passing:**
   - Content script should send messages to background
   - Background should receive and process messages

3. **Test Simple URLs:**
   - Start with basic HTTP redirects
   - Gradually test more complex scenarios

## 🐛 Debug Steps

### Step 1: Verify Extension Loading
```bash
# Check if extension files are present
ls -la /path/to/extensions/chrome/
ls -la /path/to/extensions/firefox/
```

### Step 2: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for these messages:
   ```
   Redirectinator Advanced: Extension API injected
   Extension detected via global object: 1.0.0-local
   ```

### Step 3: Test Content Script Injection
1. Visit any website
2. Open DevTools Console
3. Check if `window.redirectinatorExtension` exists:
   ```javascript
   console.log(window.redirectinatorExtension);
   ```

### Step 4: Test Message Passing
1. Open extension background page console
2. Send a test message:
   ```javascript
   chrome.runtime.sendMessage({
     type: 'WEB_APP_ANALYZE_URL',
     url: 'https://example.com'
   }, (response) => console.log(response));
   ```

### Step 5: Check Web App Integration
1. Visit your Redirectinator web app
2. Open DevTools Console
3. Check extension service status:
   ```javascript
   // This should show the extension service instance
   console.log(window.extensionService || 'Extension service not found');
   ```

## 📊 Test URLs

### HTTP Redirects
- `https://httpbin.org/redirect/1` - Simple redirect
- `https://httpbin.org/redirect/3` - Multiple redirects
- `https://bit.ly/3example` - Short URL redirect

### Meta Refresh Redirects
- `http://testing.tamethebots.com/metaredirect.html` - Basic meta refresh
- `http://www.example.com/` - Some sites use meta refresh

### JavaScript Redirects
- `http://testing.tamethebots.com/jsredirect.html` - Basic JS redirect
- Sites with client-side routing may use JS redirects

## 🎯 Success Criteria

### ✅ Extension Loads Successfully
- No errors in browser console
- Visual indicator appears briefly
- Content script injects properly

### ✅ Web App Detects Extension
- Extension status shows "detected"
- Advanced Mode toggle becomes enabled
- No connection errors in console

### ✅ URL Analysis Works
- Basic HTTP redirects detected
- Meta refresh redirects detected
- JavaScript redirects detected
- Results appear in web app interface

### ✅ Performance Acceptable
- Analysis completes within 10 seconds
- No excessive memory usage
- Background processing doesn't freeze browser

## 🚨 Common Issues & Solutions

### Issue: "Extension context invalidated"
**Solution:** Reload the extension completely

### Issue: "Could not establish connection"
**Solution:** Check if background script is running

### Issue: "Permission denied"
**Solution:** Verify extension permissions in manifest

### Issue: "Content script not injected"
**Solution:** Check content script matches in manifest

### Issue: "Message port closed"
**Solution:** Ensure extension isn't reloaded during analysis

## 📞 Getting Help

If you encounter issues:

1. **Check the debug page:** `extensions/debug.html`
2. **Review console logs** in both web app and extension
3. **Verify extension permissions** and manifest
4. **Test with simple URLs** first
5. **Check browser compatibility** (Chrome vs Firefox)

## 🎉 Success!

Once all tests pass:
- ✅ Extension loads without errors
- ✅ Web app detects extension automatically
- ✅ Advanced mode works for all redirect types
- ✅ Performance is acceptable

**Your Redirectinator Advanced extension is ready for use! 🚀**
