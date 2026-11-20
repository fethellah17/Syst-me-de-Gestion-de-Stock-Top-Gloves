# Multi-Location Accumulation Fix - CRITICAL BUG RESOLVED

## Problem Statement
**"Last One Wins" Bug**: When adding 100 units to Zone A and 200 units to Zone B, the system only showed 200 in Zone B and Total Stock became 200 instead of 300.

## Root Cause
The `addMouvement` function in `DataContext.tsx` was using shallow array spread (`[...article.locations]`) which created a reference to the same location objects. When updating an existing location's quantity, the mutation was affecting the original state, causing the "last one wins" behavior.

## Solution Implemented

### 1. Article State Structure (Already Correct)
```typescript
interface Article {
  id: number;
  ref: string;
  nom: string;
  // ... other fields
  locations: ArticleLocation[]; // Array of { emplacementNom: string, quantite: number }
}
```

### 2. Fixed handleConfirm Logic (addMouvement)
**Key Changes:**
- Create a NEW array with deep copies: `article.locations.map(loc => ({ ...loc }))`
- Use `findIndex()` to locate existing location
- ACCUMULATE quantities instead of overwriting
- Properly handle both new and existing locations

**Before (Buggy):**
```typescript
const updatedLocations = [...article.locations]; // Shallow copy - WRONG!
const existingLocation = updatedLocations.find(l => l.emplacementNom === destination);
if (existingLocation) {
  existingLocation.quantite = newQty; // Overwrites! Last one wins!
}
```

**After (Fixed):**
```typescript
const updatedLocations = article.locations.map(loc => ({ ...loc })); // Deep copy - CORRECT!
const existingLocationIndex = updatedLocations.findIndex(l => l.emplacementNom === destination);
if (existingLocationIndex >= 0) {
  const oldQty = updatedLocations[existingLocationIndex].quantite;
  const rawLocationQty = oldQty + quantityInExitUnit; // ACCUMULATE!
  updatedLocations[existingLocationIndex].quantite = roundStockQuantity(rawLocationQty, article.uniteSortie);
}
```

### 3. Total Stock Calculation (Already Correct)
```typescript
const calculateTotalStock = (article: Article): number => {
  return article.locations.reduce((sum, loc) => sum + loc.quantite, 0);
};
```

### 4. Table Display (Already Correct)
**Articles Table:**
- Stock Column: Shows `totalStock` = sum of all locations
- Emplacement Column: Shows all zones with their quantities (e.g., "Zone A: 100, Zone B: 200")

## Test Scenario

### Setup
- Article: "Gants Nitrile M" (GN-M-001)
- Initial State: Empty locations array

### Test Case 1: Add 100 to Zone A
**Input:**
- Movement Type: Entrée
- Article: GN-M-001
- Quantity: 100
- Destination: Zone A - Rack 12

**Expected Result:**
```
locations: [
  { emplacementNom: "Zone A - Rack 12", quantite: 100 }
]
totalStock: 100
```

### Test Case 2: Add 200 to Zone B
**Input:**
- Movement Type: Entrée
- Article: GN-M-001
- Quantity: 200
- Destination: Zone B - Rack 03

**Expected Result:**
```
locations: [
  { emplacementNom: "Zone A - Rack 12", quantite: 100 },
  { emplacementNom: "Zone B - Rack 03", quantite: 200 }
]
totalStock: 300 ✓ (NOT 200!)
```

### Test Case 3: Add 50 more to Zone A
**Input:**
- Movement Type: Entrée
- Article: GN-M-001
- Quantity: 50
- Destination: Zone A - Rack 12

**Expected Result:**
```
locations: [
  { emplacementNom: "Zone A - Rack 12", quantite: 150 }, // 100 + 50 = 150 ✓
  { emplacementNom: "Zone B - Rack 03", quantite: 200 }
]
totalStock: 350 ✓
```

## Console Logs for Verification
The fix includes detailed console logging:

```
[ENTRÉE] Article: Gants Nitrile M
  Quantité reçue (déjà en Paire): 100
  Quantité arrondie: 100 Paire
  Nouvelle location Zone A - Rack 12: 100
  Stock total: 0 → 100

[ENTRÉE] Article: Gants Nitrile M
  Quantité reçue (déjà en Paire): 200
  Quantité arrondie: 200 Paire
  Nouvelle location Zone B - Rack 03: 200
  Stock total: 100 → 300

[ENTRÉE] Article: Gants Nitrile M
  Quantité reçue (déjà en Paire): 50
  Quantité arrondie: 50 Paire
  Location Zone A - Rack 12: 100 + 50 = 150
  Stock total: 300 → 350
```

## Files Modified
- `src/contexts/DataContext.tsx` - Fixed `addMouvement` function

## Verification Steps
1. Open the application
2. Go to Articles page
3. Create a new article or use existing one
4. Go to Mouvements page
5. Create bulk entries:
   - Add 100 to Zone A
   - Add 200 to Zone B
6. Verify in Articles table:
   - Stock shows 300 (not 200)
   - Emplacement shows both zones with correct quantities

## Impact
- ✓ Multi-location inventory now accumulates correctly
- ✓ Total stock calculation is accurate
- ✓ All locations are preserved
- ✓ No data loss or overwriting
- ✓ Backward compatible with existing data

## Related Features
- Bulk Movement Modal: Works correctly with fixed accumulation
- Inventory Adjustments: Uses same accumulation logic
- Quality Control: Deductions work correctly from accumulated stock
- Transfers: Properly handle multi-location sources
