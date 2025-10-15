# Theme Flash Issue During Tab Bar Animation

## Problem Description
When toggling between light and dark themes or when opening/closing the tab bar, there is a brief white flash visible during the animation transition.

## What We've Tried

### 1. Removed All Transitions on Color Properties
- Removed `transition: all` from `.tab-toggle-button` 
- Removed `background-color` and `border-color` transitions from `.tab-bar-container`
- Only kept `transition: transform 0.3s ease` for the slide animation
- Result: Flash still present

### 2. Removed Visual Effects
- Removed `box-shadow` from both `.tab-toggle-button` and `.tab-bar-container`
- Removed `backdrop-filter: blur(10px)` from `.tab-bar-container`
- Result: Flash still present

### 3. Removed Transparency
- Changed all tab backgrounds from `transparent` to solid colors
- Light mode: `#fffffe`, Dark mode: `#232329`
- Applied to tabs, toggle button, container, and create button
- Result: Flash still present

### 4. Theme Prop Management
- Initially tried MutationObserver to watch theme changes (removed as unnecessary)
- Passed theme prop from App → TabbedApp → TabBar (later removed)
- Wrapped TabBar in theme div (later removed to avoid duplicate wrappers)
- Final approach: TabBar components inherit theme from parent TabbedApp container
- Result: Flash still present

## Current State

### File: `TabBar.scss`
- `.tab-toggle-button`: No transitions, solid backgrounds
- `.tab-bar-container`: Only `transform` transition, solid backgrounds, no shadows
- `.tab`: Solid backgrounds for all states (normal, hover, active)
- `.create-tab-button`: Solid backgrounds

### File: `TabbedApp.tsx`
- Applies `themeClass` (`theme--light` or `theme--dark`) to main container
- Theme prop passed from `App.tsx` based on `editorTheme`
- TabBar components should inherit theme from this parent container

### File: `TabBar.tsx`
- Simple fragment wrapper (no extra theme div)
- Components render inside themed parent container

## Possible Causes (Not Yet Investigated)

1. **React Re-render Timing**: The theme class might be updating after the animation starts, causing components to briefly render with default/wrong colors

2. **CSS Specificity**: The theme-specific styles (`.theme--dark .tab-toggle-button`) might not be applying fast enough during the animation

3. **Browser Paint Cycle**: The browser might be painting the components before the theme class is fully applied to the DOM

4. **Fixed Positioning**: The tab bar components use `position: fixed`, which might be rendering outside the normal document flow and not inheriting theme styles properly during animation

5. **Transform Animation Side Effect**: The `transform: translateX()` animation might be triggering a repaint that briefly shows unstyled content

## Recommended Next Steps

1. Try using CSS custom properties (CSS variables) instead of theme classes
2. Use `will-change: transform` to hint browser about animation
3. Consider using `visibility` or `opacity` instead of `transform` for show/hide
4. Investigate if the issue is specific to the slide animation direction
5. Check if adding `contain: layout style paint` helps with rendering
6. Profile with Chrome DevTools Performance tab to see exact timing of style recalculation

## Notes
- Issue is visible during animation but not in static states
- Both light→dark and dark→light transitions show the flash
- Opening and closing the tab bar also shows the flash
- The flash appears to be white/light colored regardless of theme direction
