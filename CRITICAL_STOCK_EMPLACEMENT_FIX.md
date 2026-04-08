# CRITICAL REFACTOR: Stock & Emplacement Concatenation Fix

## Problem
Stock and Emplacement values were displaying as concatenated strings (e.g., '100020000') instead of numeric sums.

## Root Causes
1. **Movement Logic**: In `handleBulkMovementSubmit`, quantities were being added using `+=` operator on potentially string values
2. **Accumulation Logic**: In `DataContext.addMouvement`, inventory quantities were concatenated instead of added numerically
3. **Table Display**: Stock column wasn't using numeric conversion when summing inventory
4. **Emplacement Display**: Was using `getArticleLocations()` without ensuring numeric quantities

## Fixes Applied

### 1. MouvementsPage.tsx - handleBulkMovementSubmit
**Line 223-224**: Fixed Entrée accumulation logic
```javascript
// BEFORE (concatenation):
existingInventoryEntry.quantity += qtyInExitUnit;

// AFTER (numeric addition):
existingInventoryEntry.quantity = Number(existingInventoryEntry.quantity) + Number(qtyInExitUnit);
```

**Line 226**: Ensure new inventory entries are stored as Numbers
```javascript
article.inventory.push({ zone: destinationZone, quantity: Number(qtyInExitUnit) });
```

**Line 233-237**: Fixed total stock calculation
```javascript
const totalStock = article.inventory.reduce((sum, inv) => sum + Number(inv.quantity), 0);
updateArticle(article.id, { 
  stock: Number(totalStock),
  inventory: article.inventory 
});
```

### 2. ArticlesPage.tsx - Stock Column Display
**Lines 305-340**: Implemented dual calculation strategy
- Primary: Calculate stock directly from `article.inventory` array using numeric reduction
- Fallback: Use movement-based calculation if inventory is empty
- All quantities converted to Numbers before arithmetic operations

**Lines 370-382**: Fixed Emplacement Column Display
```javascript
// BEFORE (using getArticleLocations):
getArticleLocations(a.ref).map((loc, idx) => (
  <span>{loc.zone}: {loc.quantity.toLocaleString()}</span>
))

// AFTER (using inventory array directly with numeric conversion):
a.inventory.map((inv, idx) => (
  <span>{inv.zone}: {Number(inv.quantity).toLocaleString()}</span>
))
```

### 3. DataContext.tsx - Inventory Updates

**Lines 273-275**: Fixed Entrée inventory update
```javascript
const rawLocationQty = Number(existingLocation.quantity) + Number(quantityInExitUnit);
existingLocation.quantity = roundStockQuantity(rawLocationQty, article.uniteSortie);
```

**Lines 308-310**: Fixed Ajustement Surplus inventory update
```javascript
existingLocation.quantity = Number(existingLocation.quantity) + Number(mouvement.qte);
updatedInventory.push({ zone: emplacementCible, quantity: Number(mouvement.qte) });
```

**Lines 554-569**: Fixed processTransfer function
```javascript
// Source location: Convert before subtracting
quantity: Math.max(0, Number(loc.quantity) - Number(quantity))

// Destination location: Convert before adding
quantity: Number(loc.quantity) + Number(quantity)

// New destination: Store as Number
updatedInventory.push({ zone: destinationLocation, quantity: Number(quantity) });

// Filter: Use numeric comparison
filter(l => Number(l.quantity) > 0)
```

**Lines 413-417**: Fixed applyInventoryAdjustment function
```javascript
const newQuantity = Math.max(0, Number(loc.quantity) + Number(ecart));
filter(l => Number(l.quantity) > 0)
```

## Verification

### Test Case: Enter 100 in Zone A and 100 in Zone B
1. **Stock Column**: Should display `200` (not `100100`)
2. **Emplacement Column**: Should show two distinct badges:
   - Zone A: 100
   - Zone B: 100
3. **Console Logs**: Should show numeric calculations, not string concatenation

### Key Principles Applied
- ✅ All quantities converted to Numbers before arithmetic operations
- ✅ Inventory array stores numeric quantities, not strings
- ✅ Stock column uses `.reduce()` with numeric addition
- ✅ Emplacement column maps inventory array directly with numeric display
- ✅ No duplicate zones in Emplacement display
- ✅ All updates use `Number()` wrapper before `+`, `-`, or `+=` operations

## Files Modified
1. `src/pages/MouvementsPage.tsx` - handleBulkMovementSubmit function
2. `src/pages/ArticlesPage.tsx` - Stock and Emplacement column rendering
3. `src/contexts/DataContext.tsx` - addMouvement, processTransfer, applyInventoryAdjustment functions
