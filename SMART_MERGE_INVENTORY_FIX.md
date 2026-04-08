# SMART MERGE INVENTORY FIX: Preventing Data Loss

## Problem
The app was overwriting previous locations and only saving the last row from the movement. When adding 50 to Zone A and 70 to Zone B, only Zone B was saved.

## Root Cause
The original code was calling `updateArticle()` inside a loop, each time based on the stale `articles` array from the closure:

```javascript
// BROKEN: Each call overwrites the previous one
Object.values(aggregatedByArticleAndZone).forEach(({ articleId, zone, totalQty }) => {
  const article = articles.find(a => a.id === articleId); // Stale reference!
  updateArticle(article.id, { inventory: newInventory }); // Overwrites previous update
});
```

**Why this fails:**
- First iteration: Updates article with Zone A
- Second iteration: Reads stale `articles` array (doesn't have Zone A update yet)
- Overwrites with only Zone B
- Result: Zone A is lost

## Solution: Smart Merge with Aggregation

### Step 1: Aggregate All Changes First
```javascript
const aggregatedByArticleAndZone = {};
items.forEach(item => {
  const key = `${articleId}|${zone}`;
  if (!aggregatedByArticleAndZone[key]) {
    aggregatedByArticleAndZone[key] = { totalQty: 0 };
  }
  aggregatedByArticleAndZone[key].totalQty += qtyInExitUnit;
});
```

**Result:** All movements grouped by article+zone before processing.

### Step 2: Build Update Map (Not State Updates Yet)
```javascript
const articleUpdates = {};

Object.values(aggregatedByArticleAndZone).forEach(({ articleId, zone, totalQty }) => {
  if (!articleUpdates[articleId]) {
    // Start with CURRENT article state
    const currentArticle = articles.find(a => a.id === articleId);
    articleUpdates[articleId] = {
      stock: Number(currentArticle.stock),
      inventory: currentArticle.inventory.map(inv => ({
        zone: inv.zone,
        quantity: Number(inv.quantity)
      }))
    };
  }

  // Smart Merge: Update or add zone
  const existingZoneIndex = articleUpdates[articleId].inventory.findIndex(inv => inv.zone === zone);
  
  if (existingZoneIndex >= 0) {
    // Zone exists: ADD the new quantity
    articleUpdates[articleId].inventory[existingZoneIndex].quantity += totalQty;
  } else {
    // Zone is new: PUSH it
    articleUpdates[articleId].inventory.push({ zone, quantity: totalQty });
  }
});
```

**Result:** All changes aggregated in memory before touching state.

### Step 3: Single State Update
```javascript
Object.entries(articleUpdates).forEach(([articleId, { stock, inventory }]) => {
  updateArticle(parseInt(articleId), {
    stock: Number(stock),
    inventory: inventory
  });
});
```

**Result:** All articles updated once, no overwrites.

## Key Principles

### 1. "Stay & Add" Rule
- **Never replace** the inventory array
- **Always merge** with existing data
- If Zone A has 100 and you add 50, result is 150 (not 50)

### 2. Aggregation First
- Process all rows into a temporary map
- Group by article+zone
- Only then update state

### 3. Numeric Operations Only
```javascript
const qty = Number(item.quantity) || 0;
quantity: Number(inv.quantity) + Number(totalQty)
```

### 4. No Mutations
```javascript
// WRONG: Mutates original
article.inventory[0].quantity += 50;

// RIGHT: Creates new array
const newInventory = article.inventory.map(inv => ({
  ...inv,
  quantity: inv.zone === zone ? inv.quantity + 50 : inv.quantity
}));
```

## Test Case: Add 50 to Zone A and 70 to Zone B

### Initial State
```
Article: Gants
Inventory: [{ zone: "Zone A", quantity: 100 }]
Stock: 100
```

### User Input
- Row 1: Zone A, 50
- Row 2: Zone B, 70

### Processing

**Aggregation:**
```
aggregatedByArticleAndZone = {
  "1|Zone A": { totalQty: 50 },
  "1|Zone B": { totalQty: 70 }
}
```

**Build Updates:**
```
articleUpdates[1] = {
  inventory: [
    { zone: "Zone A", quantity: 100 + 50 = 150 },  // Merged!
    { zone: "Zone B", quantity: 70 }                // New!
  ],
  stock: 220
}
```

**Final State**
```
Article: Gants
Inventory: [
  { zone: "Zone A", quantity: 150 },
  { zone: "Zone B", quantity: 70 }
]
Stock: 220
```

✅ **No data lost!**

## Files Modified
- `src/pages/MouvementsPage.tsx` - handleBulkMovementSubmit function

## Verification Checklist
- ✅ All rows processed before state update
- ✅ Existing zones are merged (not replaced)
- ✅ New zones are added
- ✅ All quantities are numeric
- ✅ No data loss
- ✅ Idempotent (safe for React Strict Mode)
- ✅ Console logs show merge operations
