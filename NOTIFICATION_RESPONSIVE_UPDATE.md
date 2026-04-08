# Notification System - Responsive Update

## Overview
Updated the notification display to be fully responsive with different behaviors for mobile and desktop devices.

## Changes Made

### 1. New Component: NotificationBottomSheet
- Created `src/components/NotificationBottomSheet.tsx`
- Mobile-optimized bottom sheet that slides up from the bottom
- Features:
  - Drag handle at the top for visual affordance
  - 90% screen width on mobile (full width on small devices)
  - 85% max height for comfortable viewing
  - Dimmed overlay (60% black) behind the sheet
  - Smooth animations (slide-in from bottom, fade-in overlay)
  - Touch-optimized tap targets (larger padding)
  - Active states for better mobile feedback

### 2. Updated AppLayout Component
- Added mobile detection using window resize listener
- Breakpoint: 768px (matches Tailwind's `md` breakpoint)
- Conditional rendering:
  - **Mobile (< 768px)**: Uses NotificationBottomSheet
  - **Desktop (≥ 768px)**: Uses existing dropdown/popover

### 3. Behavior

#### Desktop (≥ 768px)
- Small dropdown appears below the bell icon
- 320px width, max 384px height
- Positioned absolutely relative to bell button
- Hover states for better UX

#### Mobile (< 768px)
- Bottom sheet slides up from bottom of screen
- Full-width or 90% width (responsive)
- Dimmed overlay for focus
- Drag handle for visual affordance
- Touch-optimized interactions
- Smooth animations

### 4. Shared Logic
- Both implementations use the same alert data
- Same navigation behavior (clicking items navigates to articles page)
- Same visual hierarchy (critical alerts first, then warnings)
- Consistent styling with design system

## Technical Details

### Mobile Detection
```typescript
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };
  
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

### Z-Index Layers
- Overlay: `z-[60]`
- Bottom Sheet: `z-[70]`
- Ensures proper stacking above all other UI elements

### Animations
- Bottom sheet: `animate-in slide-in-from-bottom duration-300`
- Overlay: `animate-in fade-in duration-200`
- Button press: `active:scale-[0.98]` for tactile feedback

## Testing Recommendations

1. Test on various screen sizes (mobile, tablet, desktop)
2. Verify smooth transitions when resizing window
3. Check overlay dismissal on tap/click
4. Verify navigation works from both implementations
5. Test with different numbers of alerts (0, 1, 10+)
6. Verify accessibility (keyboard navigation, screen readers)

## Files Modified
- `src/components/AppLayout.tsx` - Added mobile detection and conditional rendering
- `src/components/NotificationBottomSheet.tsx` - New mobile bottom sheet component

## Dependencies
- No new dependencies added
- Uses existing Tailwind CSS utilities
- Uses existing Lucide React icons
