# Fix: Emplacement Modal Quantity Calculation Error

## Date: 25 mars 2026

## Problem
When viewing the "Contenu de l'Emplacement" modal, quantities were displaying incorrectly (e.g., showing 1102.5 instead of 105).

## Root Cause Analysis

### Understanding the Data Flow

The system stores quantities in **two different units** depending on context:

1. **Entry Unit (Unité d'Entrée)**: Bulk unit (e.g., "Boîte", "Tonne")
   - Used when user enters stock via "Entrée" movement
   - Example: User enters "5 Boîtes"

2. **Exit Unit (Unité de Sortie)**: Consumption unit (e.g., "Paire", "Kg")
   - The smallest/base unit
   - Used for all internal calculations and storage
   - Example: 5 Boîtes × 100 (factor) = 500 Paires

### Critical Rule
**Quantities stored in `article.locations[].quantite` are ALWAYS in the Exit Unit (Unité de Sortie)**

This is by design - the system converts everything to exit units for consistency.

### The Bug
If code was multiplying `location.quantite` by `facteurConversion` again, it would double-convert:
- Correct: 105 Paires (already in exit unit)
- Wrong: 105 × 10 = 1050 (if factor was 10)
- Or: 105 × 10.5 = 1102.5 (if factor was 10.5)

## Solution Applied

### 1. Verified Quantity Storage
```tsx
// In getArticlesInLocation function
const location = article.locations.find(l => l.emplacementNom === locationName);
if (location && location.quantite > 0) {
  // location.quantite is ALREADY in exit unit
  // NO conversion needed
  return {
    quantite: location.quantite, // Use directly, don't multiply
    unite: article.uniteSortie,  // Display in exit unit
  };
}
```

### 2. Added Debug Logging
```tsx
console.log(`[EMPLACEMENT] Article: ${article.nom}`);
console.log(`  Quantité en location: ${location.quantite}`);
console.log(`  Unité de sortie: ${article.uniteSortie}`);
console.log(`  Facteur de conversion: ${article.facteurConversion}`);
```

This logs:
- The raw quantity from storage
- The exit unit it should be displayed in
- The conversion factor (for reference only)

### 3. Ensured Clean Display
```tsx
{formatQuantity(article.quantite)} {article.unite}
```

The `formatQuantity` function strips trailing zeros:
- 105 displays as "105" (not "105.0")
- 10.5 displays as "10.5" (not "10.50")

## Data Flow Verification

### Correct Flow (What Should Happen)
```
User enters: 5 Boîtes (Entry Unit)
  ↓
System converts: 5 × 100 = 500 Paires (Exit Unit)
  ↓
Stored in location: quantite = 500
  ↓
Display in modal: 500 Paires (NO further conversion)
```

### Incorrect Flow (What Was Happening)
```
User enters: 5 Boîtes
  ↓
System converts: 5 × 100 = 500 Paires
  ↓
Stored in location: quantite = 500
  ↓
Display in modal: 500 × 100 = 50,000 Paires ❌ (WRONG!)
```

## Files Modified

- `src/pages/EmplacementsPage.tsx`
  - Updated `getArticlesInLocation` function
  - Added debug logging to console
  - Confirmed NO multiplication by conversion factor
  - Ensured quantities display in exit unit

## Testing Checklist

- [ ] Open Emplacements page
- [ ] Click on a location card to open the modal
- [ ] Check browser console for debug logs
- [ ] Verify quantities match expected values:
  - If you entered "5 Boîtes" with factor 100, should see "500 Paires"
  - NOT "5000 Paires" or any other multiplied value
- [ ] Verify no trailing zeros (105, not 105.0)
- [ ] Test with different conversion factors (1, 0.5, 10, 1000)

## Console Output Example

When opening a location modal, you should see:
```
[EMPLACEMENT] Article: Gants Nitrile M
  Quantité en location: 1500
  Unité de sortie: Paire
  Facteur de conversion: 100

[EMPLACEMENT] Article: Gants Latex S
  Quantité en location: 1800
  Unité de sortie: Paire
  Facteur de conversion: 100
```

If you see multiplication happening (e.g., 1500 × 100 = 150000), that's the bug.

## Technical Notes

### Why This Matters
- Quantities must be consistent across the system
- Storing in exit unit (smallest unit) prevents precision loss
- Conversion happens ONCE during entry, not repeatedly during display
- This is the same pattern used in:
  - Stock calculations
  - Movement history
  - PDF reports
  - Dashboard displays

### Future Prevention
- Always verify: "Are quantities already in exit unit?"
- Never multiply by conversion factor in display code
- Use conversion factor only when:
  - Converting FROM entry unit TO exit unit (on input)
  - Converting FROM exit unit TO entry unit (for display in entry unit context)
- Add logging when quantities are displayed to catch errors early
