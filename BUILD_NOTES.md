# OpenDraw Build Notes

## Tauri WebView Cache Issue

### Problem
When building the Tauri app, changes made to the source code (removed components, color changes, etc.) were not appearing in the built executable, even though they appeared correctly in the web development server (`bun run dev`).

**Symptoms:**
- Web version (localhost) shows correct changes
- Tauri build shows old cached version
- Changes include: removed keyboard button, purple → orange theme colors, transparency slider colors

### Root Cause
Tauri uses Microsoft Edge WebView2 which maintains its own cache separate from the build files. Even after rebuilding the app with fresh `dist` files, the WebView2 runtime was serving cached HTML/CSS/JS from previous builds.

### Solution
To force a complete cache clear and ensure fresh builds:

1. **Stop all running instances**
   ```powershell
   Get-Process opendraw -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

2. **Clear WebView2 cache directories**
   ```powershell
   Remove-Item -Path "$env:LOCALAPPDATA\com.opendraw.app" -Recurse -Force -ErrorAction SilentlyContinue
   Remove-Item -Path "$env:APPDATA\com.opendraw.app" -Recurse -Force -ErrorAction SilentlyContinue
   Remove-Item -Path "$env:LOCALAPPDATA\Microsoft\EdgeWebView" -Recurse -Force -Confirm:$false -ErrorAction SilentlyContinue
   ```

3. **Delete dist folder**
   ```powershell
   Remove-Item -Path "dist" -Recurse -Force
   ```

4. **Bump version number** in `src-tauri/tauri.conf.json`
   - This forces Windows to recognize it as a new app version
   - Example: `1.0.0` → `1.0.1` → `1.0.2`

5. **Build fresh**
   ```powershell
   bun run tauri:build
   ```

### Build Script with Cache Clearing

Add this to `package.json`:

```json
{
  "scripts": {
    "tauri:build:clean": "powershell -Command \"Get-Process opendraw -ErrorAction SilentlyContinue | Stop-Process -Force; Remove-Item -Path dist -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item -Path $env:LOCALAPPDATA\\com.opendraw.app -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item -Path $env:APPDATA\\com.opendraw.app -Recurse -Force -ErrorAction SilentlyContinue\" && bun run tauri:build"
  }
}
```

### Important Notes

1. **Always increment version** when making UI changes to force cache invalidation
2. **Test in web first** (`bun run dev`) to verify changes before building
3. **WebView2 cache persists** across builds unless explicitly cleared
4. **App identifier** (`com.opendraw.app`) determines cache location
5. **Multiple cache locations** exist:
   - `%LOCALAPPDATA%\com.opendraw.app`
   - `%APPDATA%\com.opendraw.app`
   - `%LOCALAPPDATA%\Microsoft\EdgeWebView`

### Verification Steps

After building:
1. Check web version at `http://localhost:3001` - should show changes
2. If web shows changes but build doesn't → cache issue
3. Clear all caches and rebuild with new version number
4. Launch fresh executable from `src-tauri\target\release\opendraw.exe`

### Changes Made to Fix Original Issue

1. **Removed keyboard components:**
   - Deleted `VirtualKeyboard.tsx`, `VirtualKeyboard.scss`
   - Deleted `VirtualKeyboardToggle.tsx`, `VirtualKeyboardToggle.scss`
   - Removed keyboard button from `AppFooter.tsx`

2. **Changed theme colors (purple → orange):**
   - `packages/excalidraw/css/theme.scss`:
     - `--color-brand-hover`: `#5753d0` → `#ff9933`
     - `--color-brand-active`: `#4440bf` → `#ff8c00`
     - `--color-slider-track`: `hsl(240, 100%, 90%)` → `hsl(30, 100%, 90%)`
     - `--color-slider-thumb`: `var(--color-gray-80)` → `#ff8c00`
     - Dark theme equivalents updated similarly

3. **Version progression:**
   - Started: `1.0.0`
   - After cache issues: `1.0.1` → `1.0.2`
