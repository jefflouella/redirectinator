# URL Persistence Feature

## Overview

The URL Persistence feature ensures that URLs added to a project are automatically saved to the browser's IndexedDB storage and persist across page refreshes and browser sessions.

## How It Works

### Storage Mechanism

- **IndexedDB**: Uses the browser's IndexedDB API for reliable client-side storage
- **Project Integration**: URLs are stored as part of the project data structure
- **Auto-Save**: URLs are automatically saved whenever they're added, removed, or modified

### Data Structure

```typescript
interface Project {
  id: string;
  name: string;
  urls: UrlEntry[]; // ← URLs are stored here
  results: RedirectResult[];
  // ... other project data
}

interface UrlEntry {
  id: string;
  startingUrl: string;
  targetRedirect: string;
}
```

## Features

### ✅ Automatic Persistence

- **Add URLs**: Single URLs, bulk text, CSV upload - all auto-saved
- **Remove URLs**: Individual URL removal with immediate persistence
- **Clear All**: Complete URL list clearing with persistence
- **Real-time Sync**: Changes are saved immediately to IndexedDB

### ✅ Page Refresh Recovery

- **Load on Mount**: URLs are loaded from the project when component mounts
- **State Restoration**: Complete URL list is restored after page refresh
- **Loading Indicator**: Visual feedback while URLs are being loaded

### ✅ Cross-Session Persistence

- **Browser Storage**: URLs persist across browser sessions
- **Project-Based**: Each project maintains its own URL list
- **IndexedDB Reliability**: Uses robust browser storage API

## User Experience

### Before (Lost on Refresh)

```
1. Add URLs to project ✅
2. Refresh page ❌ (URLs disappear)
3. Start over from scratch 😞
```

### After (Persistent)

```
1. Add URLs to project ✅
2. Refresh page ✅ (URLs remain)
3. Continue working seamlessly 😊
```

## Implementation Details

### Custom Hook: `useUrlPersistence`

```typescript
const {
  urls, // Current URL list
  isLoading, // Loading state
  addUrl, // Add single URL
  removeUrl, // Remove URL by index
  setAllUrls, // Replace all URLs
  clearUrls, // Clear all URLs
} = useUrlPersistence(currentProject);
```

### Auto-Save Logic

- **Immediate Persistence**: Every URL change triggers IndexedDB save
- **Project Updates**: Project `updatedAt` timestamp is refreshed
- **Error Handling**: Failed saves are logged but don't break UI
- **Performance**: Efficient updates without full project reload

### Loading States

- **Mount Loading**: Shows spinner while loading URLs from project
- **Count Display**: Dynamic URL count with loading indicator
- **Seamless UX**: No interruption to user workflow

## Browser Storage

### Storage Location

- **Database**: `RedirectinatorDB`
- **Store**: `projects` (contains URLs in `urls` field)
- **Persistence**: Survives browser restarts, clears cache, etc.

### Storage Limits

- **IndexedDB**: Typically 50MB-1GB depending on browser
- **Fallback**: Graceful degradation if storage is unavailable
- **Compression**: Efficient storage of URL data

## Error Handling

### Storage Failures

- **Silent Degradation**: App continues working if IndexedDB fails
- **Console Logging**: Errors are logged for debugging
- **User Continuity**: No interruption to user workflow

### Loading Failures

- **Fallback State**: Empty URL list if loading fails
- **Recovery**: User can re-add URLs if needed
- **Graceful UX**: Loading states prevent confusion

## Testing

### Manual Testing

1. **Add URLs** to a project
2. **Refresh the page**
3. **Verify URLs persist** and are reloaded
4. **Test across browser sessions**

### Storage Verification

- Open **Developer Tools** → **Application** → **IndexedDB**
- Navigate to `RedirectinatorDB` → `projects`
- Verify URL data is stored in project records

## Benefits

### ✅ User Experience

- **No Data Loss**: URLs survive page refreshes
- **Seamless Workflow**: No interruption to work process
- **Reliable Storage**: Uses browser's native storage API

### ✅ Performance

- **Efficient Storage**: Minimal overhead for URL operations
- **Fast Loading**: Quick retrieval from IndexedDB
- **Background Sync**: Auto-save happens without blocking UI

### ✅ Reliability

- **Cross-Session**: URLs persist across browser sessions
- **Error Recovery**: Graceful handling of storage failures
- **Data Integrity**: URLs remain associated with correct projects

## Migration

### Existing Projects

- **Automatic**: Existing projects with URLs will load correctly
- **Backward Compatible**: No data loss during transition
- **Progressive Enhancement**: Feature works alongside existing functionality

### New Projects

- **Immediate Persistence**: URL persistence works from project creation
- **Full Integration**: New projects get full persistence features

---

**🎉 Your URLs will now persist across page refreshes and browser sessions!**

The URL persistence feature uses your browser's IndexedDB storage to automatically save and restore your URL lists, ensuring you never lose your work when refreshing the page or reopening your browser.
