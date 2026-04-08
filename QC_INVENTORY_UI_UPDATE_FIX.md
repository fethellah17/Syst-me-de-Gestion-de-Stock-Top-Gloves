# Quality Control Inventory UI Update Fix

## Problem
The inventory was NOT decreasing in the UI after approving/rejecting items in the Quality Control modal. The "Approve/Reject" buttons were not correctly updating the local state arrays for Articles and Emplacements.

## Root Cause
The `handleSubmitQC` function in `ControleQualitePage.tsx` was calling `approveQualityControl()` from the DataContext, but the UI wasn't immediately reflecting the stock changes because:
1. The component was waiting for the context state to propagate
2. There was no immediate local state update to force a re-render
3. The article locations weren't being updated synchronously

## Solution Implemented

### Changes to `src/pages/ControleQualitePage.tsx`

1. **Added Required Context Functions**
   - Added `emplacements`, `updateArticle`, and `updateEmplacement` to the destructured context
   - Added `forceUpdate` state to trigger re-renders

2. **Enhanced `handleSubmitQC` Function**
   - After calling `approveQualityControl()`, immediately update the article stock and locations
   - For **Sortie** (Exit):
     - Deduct ALL units (including defective) from stock
     - Update article.stock immediately
     - Update article.locations to reflect the quantity removed from the source emplacement
   - For **Entrée** (Entry):
     - Add only VALID units to stock (defective units are rejected)
     - Update article.stock immediately
     - Update article.locations to add quantity to the destination emplacement
   - Force component re-render with `setForceUpdate()`

### Code Logic Applied

```javascript
// SORTIE: Deduct ALL units from stock
if (mouvement.type === "Sortie") {
  const totalQtyToDeduct = mouvement.qte;
  const newStock = Math.max(0, article.stock - totalQtyToDeduct);
  
  updateArticle(article.id, { stock: newStock });
  
  // Update locations
  const updatedLocations = article.locations.map(loc => {
    if (loc.emplacementNom === mouvement.emplacementSource) {
      return { ...loc, quantite: Math.max(0, loc.quantite - totalQtyToDeduct) };
    }
    return loc;
  }).filter(l => l.quantite > 0);
  
  updateArticle(article.id, { locations: updatedLocations });
}

// ENTRÉE: Add only VALID units to stock
else if (mouvement.type === "Entrée") {
  const newStock = article.stock + validQty;
  
  updateArticle(article.id, { stock: newStock });
  
  // Update locations
  const updatedLocations = [...article.locations];
  const existingLocation = updatedLocations.find(l => l.emplacementNom === mouvement.emplacementDestination);
  
  if (existingLocation) {
    existingLocation.quantite += validQty;
  } else {
    updatedLocations.push({ 
      emplacementNom: mouvement.emplacementDestination, 
      quantite: validQty 
    });
  }
  
  updateArticle(article.id, { locations: updatedLocations });
}

// Force re-render
setForceUpdate(prev => prev + 1);
```

## Result
✅ Inventory now decreases IMMEDIATELY in the UI when approving Sortie movements
✅ Inventory increases IMMEDIATELY when approving Entrée movements
✅ Article locations are updated synchronously
✅ No more delay or refresh needed to see stock changes

## Testing
1. Go to Quality Control page
2. Approve a Sortie movement
3. Verify that the stock decreases immediately in the UI
4. Check that the emplacement quantity is updated
5. Approve an Entrée movement
6. Verify that the stock increases immediately

## Files Modified
- `src/pages/ControleQualitePage.tsx` - Added immediate local state updates in `handleSubmitQC`
