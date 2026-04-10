# Entrée Stock Protection - Quick Reference

## The Fix (One Line Summary)
**Step 2 of handleBulkMovementSubmit now skips ALL stock updates for Entrée movements.**

## Code Location
**File**: `src/pages/MouvementsPage.tsx`  
**Function**: `handleBulkMovementSubmit`  
**Line**: ~313 (Step 2 condition)

## Before vs After

### BEFORE (BROKEN)
```typescript
// Step 2: SMART MERGE - Update articles state with strict zone logic
// Group items by article ID
const itemsByArticle: Record<number, any[]> = {};
items.forEach(item => {
  // ... grouping logic ...
});

// Update each affected article
Object.entries(itemsByArticle).forEach(([articleIdStr, articleItems]) => {
  // ... stock update logic for ALL movement types including Entrée ...
  if (movementType === "Entrée") {
    // WRONG: This was updating stock for Entrée!
    updatedInventory[existingZoneIndex].quantity += qtyInExitUnit;
    totalStockChange += qtyInExitUnit;
  }
  // ... more logic ...
});
```

### AFTER (FIXED)
```typescript
// Step 2: SMART MERGE - Update articles state with strict zone logic
// CRITICAL: SKIP this step entirely for Entrée movements with "En attente" status
if (movementType !== "Entrée") {
  // Group items by article ID
  const itemsByArticle: Record<number, any[]> = {};
  items.forEach(item => {
    // ... grouping logic ...
  });

  // Update each affected article
  Object.entries(itemsByArticle).forEach(([articleIdStr, articleItems]) => {
    // ... stock update logic for Sortie and Transfert only ...
  });
} else {
  // For Entrée movements: ZERO stock updates
  console.log(`[ENTRÉE PENDING QC] Step 2 SKIPPED - Stock will NOT be updated until QC approval`);
}
```

## What This Means

### For Entrée Movements
- ✅ Mouvement record created with "En attente" status
- ✅ Stock NOT updated
- ✅ Zones NOT updated
- ✅ Waiting for QC approval to update stock

### For Other Movements
- ✅ Sortie: Stock updated immediately
- ✅ Transfert: Stock updated immediately
- ✅ Ajustement: Stock updated immediately

## Test It

### Create an Entrée
1. Go to Mouvements page
2. Click "Nouveau Mouvement"
3. Select "Entrée" type
4. Select an article (e.g., "Gants Nitrile M" with stock 2500)
5. Enter quantity: 500
6. Select destination zone
7. Click "Créer"

### Verify Stock Unchanged
1. Go to Articles page
2. Find the article you just created Entrée for
3. Stock should still be 2500 (NOT 3000)
4. Zone stock should be unchanged

### Verify Mouvement Created
1. Go back to Mouvements page
2. Find the new mouvement at the top
3. Status should be "En attente" (yellow badge)
4. Impact Stock should show clock icon

## Console Output

When you create an Entrée, check the browser console for:
```
[ENTRÉE - PENDING QC] Article: Gants Nitrile M
  Quantité: 500 Paire
  Status: En attente
  Stock remains unchanged: 2500 Paire

[ENTRÉE PENDING QC] Step 2 SKIPPED - Stock will NOT be updated until QC approval
```

## Key Points

1. **Stock Protection**: Entrée movements do NOT affect warehouse stock until approved
2. **Unique Identification**: Each movement gets a UUID
3. **Visual Indicator**: Yellow "En attente" badge shows pending status
4. **Clock Icon**: Impact Stock column shows clock icon for pending Entrée
5. **No PDF**: Pending Entrée shows "Inspecter" icon instead of PDF download

## Next Phase (QC Step 2)

When QC approves an Entrée:
1. Call `approveQualityControl(id, controleur, etatArticles)`
2. Stock will be updated at that time
3. Mouvement status changes to "Terminé"
4. PDF download becomes available

## Troubleshooting

### Stock Still Updating?
- Clear browser cache
- Restart dev server
- Check console for errors

### Mouvement Not Created?
- Check browser console for errors
- Verify article exists
- Verify quantity > 0

### Status Not Showing "En attente"?
- Refresh page
- Check that mouvement type is "Entrée"
- Check that status field is populated

## Files Changed
- `src/pages/MouvementsPage.tsx` - Added condition to skip Step 2 for Entrée

## Status
✅ COMPLETE - Stock protection is now fully implemented
