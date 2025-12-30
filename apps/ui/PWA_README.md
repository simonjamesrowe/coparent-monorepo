# Progressive Web App (PWA) Configuration

CoParent is configured as a Progressive Web App, allowing users to install it on their devices and use it offline.

## Features

### 🚀 Installation
- Users can install CoParent on their devices (mobile, tablet, desktop)
- Appears like a native app with its own icon and launch screen
- No app store required

### 📱 Offline Support
- Service worker caches essential files for offline access
- API requests use NetworkFirst strategy with 24-hour cache
- Images and fonts are cached for improved performance
- Automatic cache expiration to prevent stale data

### 🔄 Auto-Update
- Service worker automatically updates in the background
- Users always get the latest version without manual intervention
- Seamless update experience

## Configuration

### Manifest (`vite.config.ts`)
```typescript
{
  name: 'CoParent - Co-Parenting Platform',
  short_name: 'CoParent',
  theme_color: '#14b8a6',        // Teal (primary color)
  background_color: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
}
```

### Cache Strategies

**API Calls (NetworkFirst)**
- Tries network first, falls back to cache
- Cache expires after 24 hours
- Network timeout: 10 seconds
- Max 100 cached entries

**Images (CacheFirst)**
- Serves from cache immediately
- Cache expires after 30 days
- Max 50 cached images

**Fonts (CacheFirst)**
- Long-term cache (1 year)
- Max 10 font files

## Required Assets

To complete PWA setup, add these icon files to `apps/ui/public/`:

### Icons
- `pwa-192x192.png` - 192x192px app icon
- `pwa-512x512.png` - 512x512px app icon
- `apple-touch-icon.png` - 180x180px for iOS
- `favicon.ico` - Browser favicon

### Icon Requirements
- **Format:** PNG (for PWA icons)
- **Background:** Should work on any background color
- **Content:** CoParent logo/branding
- **Maskable:** Icons should be safe for adaptive icon shapes
- **Color:** Use teal (#14b8a6) as primary brand color

## Development

PWA features are enabled in development mode via `devOptions.enabled = true`.

### Testing PWA Features

1. **Build the app:**
   ```bash
   pnpm --filter coparent-ui build
   ```

2. **Preview the build:**
   ```bash
   pnpm --filter coparent-ui preview
   ```

3. **Check in browser:**
   - Open DevTools → Application → Service Workers
   - Open DevTools → Application → Manifest
   - Look for "Install App" prompt in browser

### Chrome DevTools
- **Application → Service Workers**: View active service worker
- **Application → Cache Storage**: Inspect cached files
- **Application → Manifest**: Verify PWA manifest
- **Lighthouse**: Run PWA audit

## Installation Instructions for Users

### Desktop (Chrome/Edge)
1. Visit the app in browser
2. Look for install icon in address bar
3. Click "Install CoParent"
4. App opens in standalone window

### iOS (Safari)
1. Visit the app in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Name it and tap "Add"

### Android (Chrome)
1. Visit the app in Chrome
2. Tap the three-dot menu
3. Select "Add to Home Screen"
4. Tap "Add"

## Offline Capabilities

### What Works Offline
- ✅ View cached pages
- ✅ View cached images and fonts
- ✅ View cached API responses (up to 24 hours old)
- ✅ Navigate between pages

### What Requires Internet
- ❌ Fresh API data
- ❌ Authentication/login
- ❌ Real-time updates
- ❌ File uploads

## Future Enhancements

- [ ] Background sync for offline actions
- [ ] Push notifications for messages and events
- [ ] IndexedDB for more robust offline storage
- [ ] Offline-first editing with sync when online
- [ ] Badge API for unread message count

## Resources

- [Vite PWA Plugin Docs](https://vite-pwa-org.netlify.app/)
- [Workbox Docs](https://developers.google.com/web/tools/workbox)
- [PWA Checklist](https://web.dev/pwa-checklist/)
