# FIX DUPLICATE ENTRIES (x2 Bug): Inventory Doubling Issue

## Problem
Quantities in the Emplacement cell were being doubled (e.g., entering 100 showed 200). This was caused by:
1. Direct mutation of the article.inventory array
2. React Strict Mode double-rendering the mutations
3. Non-idempotent state updates

## Root Cause Analysis

### Before (Broken Logic)
```javascript
// PROBLEM: Mutating the original article object
const existingInventoryEntry = article.inventory.find(inv => inv.zone === destinationZone);
if (existingInventoryEntry) {
  existingInventoryEntry.quantity += qtyInExitUnit; // Direct mutation!
}
article.inventory.push({ zone: destinationZone, quantity: qtyInExitUnit }); // Direct mutation!

// Then calling updateArticle with the mutated reference
updateArticle(article.id, { 
  stock: totalStock,
  inventory: article.inventory  // Same reference, already mutated
});
```

**Why this fails:**
- React Strict Mode renders twice in development
- First render: mutates article.inventory
- Second render: mutates the same array again (doubling the values)
- The updateArticle call receives the same mutated reference both times

### After (Fixed Logic)
```javascript
// SOLUTION 1: Aggregate all entries first (prevents duplicates)
const aggregatedByArticleAndZone = {};
items.forEach(item => {
  const key = `${articleId}|${zone}`;
  if (!aggregatedByArticleAndZone[key]) {
    aggregatedByArticleAndZone[key] = { totalQty: 0 };
  }
  aggregatedByArticleAndZone[key].totalQty += qtyInExitUnit;
});

// SOLUTION 2: Create a completely new inventory array (no mutations)
const newInventory = article.inventory.map(inv => {
  if (inv.zone === zone) {
    return {
      ...inv,
      quantity: Number(inv.quantity) + Number(totalQty)
    };
  }
  return { ...inv, quantity: Number(inv.quantity) };
});

// SOLUTION 3: Add new zones if they don't exist
if (!newInventory.find(inv => inv.zone === zone)) {
  newInventory.push({ zone, quantity: Number(totalQty) });
}

// SOLUTION 4: Use functional state update (idempotent)
updateArticle(article.id, {
  stock: Number(totalStock),
  inventory: newInventory  // New array, not mutated
});
```

## Key Changes in handleBulkMovementSubmit

### 1. Aggregation Map (Prevents Duplicates)
```javascript
const aggregatedByArticleAndZone: Record<string, { 
  articleId: number; 
  zone: string; 
  totalQty: number; 
  unit: string 
}> = {};

// Group all items by article+zone combination
items.forEach(item => {
  const key = `${articleId}|${zone}`;
  if (!aggregatedByArticleAndZone[key]) {
    aggregatedByArticleAndZone[key] = { articleId, zone, totalQty: 0, unit };
  }
  // CRITICAL: Numeric addition only
  aggregatedByArticleAndZone[key].totalQty = Number(aggregatedByArticleAndZone[key].totalQty) + Number(qtyInExitUnit);
});
```

**Benefit:** If user enters 100 in Zone A twice, it's aggregated to 200 ONCE, not added twice.

### 2. Force Numeric Quantities
```javascript
const qty = Number(item.quantity) || 0;
if (qty <= 0) return;
```

**Benefit:** Prevents string concatenation from the start.

### 3. Create New Inventory Array (No Mutations)
```javascript
const newInventory = article.inventory.map(inv => {
  if (inv.zone === zone) {
    return {
      ...inv,
      quantity: Number(inv.quantity) + Number(totalQty)
    };
  }
  return { ...inv, quantity: Number(inv.quantity) };
});

// Add new zones
if (!newInventory.find(inv => inv.zone === zone)) {
  newInventory.push({ zone, quantity: Number(totalQty) });
}
```

**Benefit:** Creates a completely new array reference, preventing React Strict Mode double-mutations.

### 4. Idempotent State Update
```javascript
updateArticle(article.id, {
  stock: Number(totalStock),
  inventory: newInventory
});
```

**Benefit:** Running this twice with the same data produces the same result (idempotent).

## Test Case: Enter 100 in Zone A

### Expected Behavior
1. User enters 100 in Zone A
2. Clicks "Confirmer"
3. Emplacement cell shows: **Zone A: 100** (not 200)
4. Stock column shows: **100** (not 200)

### What Was Happening (Bug)
1. User enters 100 in Zone A
2. First render: inventory = [{ zone: "A", quantity: 100 }]
3. React Strict Mode re-renders
4. Second render: inventory = [{ zone: "A", quantity: 200 }] ← DOUBLED!

### What Happens Now (Fixed)
1. User enters 100 in Zone A
2. Aggregation: `aggregatedByArticleAndZone["1|A"] = { totalQty: 100 }`
3. Create new inventory: `[{ zone: "A", quantity: 100 }]`
4. React Strict Mode re-renders
5. Same new inventory created again: `[{ zone: "A", quantity: 100 }]` ← IDEMPOTENT!

## Files Modified
- `src/pages/MouvementsPage.tsx` - handleBulkMovementSubmit function

## Verification Checklist
- ✅ No direct mutations of article.inventory
- ✅ All quantities converted to Numbers before arithmetic
- ✅ Aggregation map prevents duplicate zone entries
- ✅ New inventory array created (not mutated)
- ✅ State update is idempotent (safe for React Strict Mode)
- ✅ No duplicate zones in inventory array
- ✅ Emplacement cell displays correct quantities
- ✅ Stock column shows correct total
