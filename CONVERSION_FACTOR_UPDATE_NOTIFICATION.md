# Conversion Factor Update Notification

## Date: 25 mars 2026

## Overview
When you modify the "Facteur de Conversion" of an article, a professional success notification appears confirming that the factor was updated and all emplacements have been recalculated.

## Notification Message
```
"Le facteur de conversion a été mis à jour. Le stock dans tous les emplacements a été recalculé avec succès !"
```

Translation: "The conversion factor has been updated. The stock in all locations has been successfully recalculated!"

## When It Appears

### Scenario 1: Factor Changed with Existing Stock
1. Edit an article that has stock
2. Change the "Facteur de Conversion" value
3. Click "Modifier"
4. ✅ Success notification appears

### Scenario 2: Factor Changed with No Stock
1. Edit an article with zero stock
2. Change the "Facteur de Conversion" value
3. Click "Modifier"
4. ✅ Success notification appears (even though no stock to recalculate)

### Scenario 3: No Factor Change
1. Edit an article
2. Change other fields (name, category, etc.) but NOT the factor
3. Click "Modifier"
4. ✅ Different message: "Article modifié avec succès" (Article modified successfully)

## Visual Design

### Toast Component
- **Type**: Success (green background)
- **Duration**: 3 seconds (auto-dismisses)
- **Position**: Top-right corner (standard toast position)
- **Icon**: Checkmark icon (from lucide-react)
- **Animation**: Fade in/out

### Toast Styling
```
Background: Green (#10b981 or similar success color)
Text: White
Icon: Checkmark (✓)
Border-radius: Rounded corners
Shadow: Subtle shadow for depth
```

## Implementation Details

### Code Location
File: `src/pages/ArticlesPage.tsx`
Function: `handleSubmit()`

### Logic
```tsx
if (factorChanged && existingArticle.stock > 0) {
  // Factor changed with stock
  updateArticle(editingId, { ...formDataWithNumber, stock: roundedNewStock });
  setToast({ 
    message: "Le facteur de conversion a été mis à jour. Le stock dans tous les emplacements a été recalculé avec succès !", 
    type: "success" 
  });
} else if (factorChanged) {
  // Factor changed but no stock
  updateArticle(editingId, formDataWithNumber);
  setToast({ 
    message: "Le facteur de conversion a été mis à jour. Le stock dans tous les emplacements a été recalculé avec succès !", 
    type: "success" 
  });
} else {
  // No factor change
  updateArticle(editingId, formDataWithNumber);
  setToast({ message: "Article modifié avec succès", type: "success" });
}
```

## User Experience Flow

### Step 1: Open Article Edit Modal
```
User clicks Edit on an article
  ↓
Modal opens with current values
```

### Step 2: Change Factor
```
User changes "Facteur de Conversion" from 100 to 200
  ↓
Input field updates in real-time
```

### Step 3: Save Changes
```
User clicks "Modifier" button
  ↓
Form validates
  ↓
Article updates in DataContext
  ↓
Modal closes
```

### Step 4: See Notification
```
Success toast appears at top-right
  ↓
Message: "Le facteur de conversion a été mis à jour..."
  ↓
Toast auto-dismisses after 3 seconds
```

### Step 5: Verify in Emplacements
```
User navigates to Emplacements page
  ↓
Clicks on a location card
  ↓
Modal opens showing updated stock
  ↓
Stock reflects new factor: Original Qty × New Factor
```

## Toast Component Details

### File
`src/components/Toast.tsx`

### Props
```tsx
interface ToastProps {
  message: string;
  type: "success" | "error";
  duration?: number; // Default: 3000ms
}
```

### Usage in ArticlesPage
```tsx
const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

// Show notification
setToast({ 
  message: "Le facteur de conversion a été mis à jour. Le stock dans tous les emplacements a été recalculé avec succès !", 
  type: "success" 
});

// Render toast
{toast && <Toast message={toast.message} type={toast.type} />}
```

## Testing Workflow

### Test 1: Basic Factor Change
1. Go to Articles page
2. Find an article with stock (e.g., "Gants Nitrile M")
3. Click Edit
4. Change "Facteur de Conversion" from 100 to 200
5. Click "Modifier"
6. ✅ See success notification
7. Go to Emplacements
8. Click on a location with this article
9. ✅ Verify stock doubled (e.g., 500 → 1000)

### Test 2: Factor Change with No Stock
1. Create a new article with factor 100
2. Don't add any movements
3. Edit the article
4. Change factor to 50
5. Click "Modifier"
6. ✅ See success notification (even though no stock)

### Test 3: Other Field Change (No Factor)
1. Edit an article
2. Change the name or category (NOT the factor)
3. Click "Modifier"
4. ✅ See different message: "Article modifié avec succès"

### Test 4: Multiple Factor Changes
1. Edit article, change factor from 100 to 200
2. Click "Modifier" → See notification
3. Edit same article again, change factor from 200 to 50
4. Click "Modifier" → See notification again
5. Go to Emplacements → Stock reflects latest factor (50)

## Notification Behavior

### Auto-Dismiss
- Toast automatically disappears after 3 seconds
- User can click to dismiss manually (if implemented)

### Stacking
- If multiple notifications appear, they stack vertically
- Each has its own 3-second timer

### Accessibility
- Toast includes icon for visual confirmation
- Message is clear and in French (user's language)
- Color contrast meets accessibility standards

## Future Enhancements

- Add "Undo" button to revert factor change
- Add sound effect for notification
- Add animation when stock updates in Emplacements
- Add notification history/log
- Add option to customize notification duration
- Add notification preferences (enable/disable)

## Related Features

- **Dynamic Calculation**: Stock updates immediately in Emplacements
- **Console Logging**: Detailed logs show calculation steps
- **Frontend-Only**: No backend required, all in browser
- **Real-Time**: Changes visible instantly when opening Emplacements

## Files Modified

- `src/pages/ArticlesPage.tsx`
  - Updated `handleSubmit()` function
  - Added specific message for factor changes
  - Distinguishes between factor change and other updates
