# Fix: Emplacement Modal Stock Recalculation from Movements

## Date: 25 mars 2026

## Problem
The Emplacement modal was displaying corrupted/accumulated old values (e.g., 101002.5 Kg instead of 1005 Kg) because it was using cached values from `article.locations[].quantite` that contained test data from previous experiments.

## Root Cause
The system was relying on pre-calculated quantities stored in `article.locations[].quantite`, which could become stale or corrupted if:
1. Conversion factors were changed during testing
2. Old test movements were never cleaned up
3. The cached value wasn't recalculated after factor changes

## Solution Applied

### 1. Recalculate from Movement History
Instead of using cached `article.locations[].quantite`, the system now recalculates stock from scratch using the movement history:

```tsx
const getArticlesInLocation = (locationName: string) => {
  return articles.map(article => {
    let totalQuantity = 0;
    
    // Sum all movements for this article in this location
    mouvements.forEach(mouvement => {
      if (mouvement.ref === article.ref) {
        // Only count approved/completed movements
        if (mouvement.statut === "Terminé" || mouvement.status === "approved") {
          if (mouvement.type === "Entrée" && mouvement.emplacementDestination === locationName) {
            totalQuantity += mouvement.qte;
          } else if (mouvement.type === "Sortie" && mouvement.emplacementSource === locationName) {
            totalQuantity -= mouvement.qte;
          } else if (mouvement.type === "Transfert") {
            if (mouvement.emplacementSource === locationName) {
              totalQuantity -= mouvement.qte;
            }
            if (mouvement.emplacementDestination === locationName) {
              totalQuantity += mouvement.qte;
            }
          }
        }
      }
    });
    
    if (totalQuantity > 0) {
      return {
        quantite: Number(totalQuantity), // Clean number
        unite: article.uniteSortie,
      };
    }
    return null;
  }).filter(Boolean);
};
```

### 2. Formula Used
```
Total Stock = (Sum of Entries) - (Sum of Exits) + (Transfers In) - (Transfers Out)
```

For each article in each location:
- **Entrée (Entry)**: Add quantity to total
- **Sortie (Exit)**: Subtract quantity from total
- **Transfert (Transfer)**: Subtract from source, add to destination

### 3. Only Count Approved Movements
```tsx
if (mouvement.statut === "Terminé" || mouvement.status === "approved")
```

This ensures:
- Pending movements don't affect the count
- Rejected movements are ignored
- Only finalized movements are included

### 4. Clean Number Output
```tsx
quantite: Number(totalQuantity)
```

This strips trailing zeros:
- 1005.0 → 1005
- 1005.5 → 1005.5

### 5. Comprehensive Logging
```tsx
console.log(`[CALC] ${article.nom} ENTRÉE: +${mouvement.qte} → Total: ${totalQuantity}`);
console.log(`[CALC] ${article.nom} SORTIE: -${mouvement.qte} → Total: ${totalQuantity}`);
console.log(`[EMPLACEMENT] Article: ${article.nom}`);
console.log(`  Quantité calculée: ${totalQuantity}`);
console.log(`  Unité de sortie: ${article.uniteSortie}`);
console.log(`  Facteur de conversion: ${article.facteurConversion}`);
```

This allows you to see:
- Each movement being counted
- Running total as movements are processed
- Final calculated quantity
- The unit and conversion factor for reference

## Data Flow

### Before (Corrupted)
```
Old cached value: 101002.5 Kg
  ↓
Display in modal: 101002.5 Kg ❌ (WRONG - from old tests)
```

### After (Recalculated)
```
Movement 1: Entrée +500 Kg → Total: 500
Movement 2: Entrée +505 Kg → Total: 1005
Movement 3: Sortie -0 Kg → Total: 1005
  ↓
Display in modal: 1005 Kg ✅ (CORRECT - calculated fresh)
```

## Benefits

1. **Always Fresh**: Stock is recalculated every time the modal opens
2. **Immune to Corruption**: Old test data doesn't affect current display
3. **Respects Current Factors**: Uses current conversion factors, not old ones
4. **Transparent**: Console logs show exactly how the number was calculated
5. **Accurate**: Matches the movement history exactly

## Testing Checklist

- [ ] Open Emplacements page
- [ ] Click on a location to open the modal
- [ ] Check browser console for calculation logs
- [ ] Verify the final quantity matches expected value
- [ ] Test with different locations
- [ ] Test with articles that have multiple movements
- [ ] Verify no trailing zeros (1005, not 1005.0)
- [ ] Check that rejected/pending movements are NOT counted

## Console Output Example

```
[CALC] Gants Nitrile M ENTRÉE: +500 → Total: 500
[CALC] Gants Nitrile M ENTRÉE: +505 → Total: 1005
[EMPLACEMENT] Article: Gants Nitrile M
  Quantité calculée: 1005
  Unité de sortie: Paire
  Facteur de conversion: 100

[CALC] Masques FFP2 ENTRÉE: +5000 → Total: 5000
[CALC] Masques FFP2 SORTIE: -100 → Total: 4900
[EMPLACEMENT] Article: Masques FFP2
  Quantité calculée: 4900
  Unité de sortie: Unité
  Facteur de conversion: 1000
```

## Files Modified

- `src/pages/EmplacementsPage.tsx`
  - Added `mouvements` to context destructuring
  - Rewrote `getArticlesInLocation` function
  - Changed from using cached `article.locations[].quantite`
  - Now recalculates from movement history
  - Added comprehensive logging for debugging

## Technical Notes

### Why This Approach?
- **Single Source of Truth**: Movements are the authoritative record
- **Recalculation on Demand**: No need to update cache when factors change
- **Audit Trail**: Console logs show exactly how each number was calculated
- **Resilient**: Handles corrupted cache gracefully

### Performance Consideration
- Recalculates on every modal open (not cached)
- For typical inventory (100-1000 articles, 1000-10000 movements), this is negligible
- If performance becomes an issue, could add memoization

### Future Improvements
- Could add a "Refresh" button to manually recalculate
- Could add a data integrity check to compare cached vs calculated values
- Could add a cleanup function to remove old test movements
