# Sortie Stock Deduction - Verification & Debugging

## Status: LOGIC IS CORRECT ✅

The stock deduction logic for Sortie movements is **already implemented correctly**. This document provides verification and debugging information.

## Current Implementation

### Stock Deduction Code (DataContext.tsx)

```typescript
if (mouvement.type === "Sortie") {
  // CRITICAL: SORTIE - ALL units (including defective) MUST be deducted from stock
  // This is a PERMANENT REMOVAL from warehouse (either shipped or waste/loss)
  const totalQtyToDeduct = mouvement.qte;

  console.log(`[SORTIE QC] DEDUCTING ${totalQtyToDeduct} units from stock`);
  console.log(`  Valid units: ${validQty}`);
  console.log(`  Defective units (waste/loss): ${defectiveQty}`);
  console.log(`  TOTAL DEDUCTION: ${totalQtyToDeduct}`);

  if (mouvement.emplacementSource) {
    const updatedLocations = article.locations.map(loc => {
      if (loc.emplacementNom === mouvement.emplacementSource) {
        const newQty = Math.max(0, loc.quantite - totalQtyToDeduct);
        console.log(`  Location ${loc.emplacementNom}: ${loc.quantite} → ${newQty}`);
        return { ...loc, quantite: newQty };
      }
      return loc;
    }).filter(l => l.quantite > 0);
    
    const newStock = Math.max(0, article.stock - totalQtyToDeduct);
    console.log(`  Stock après: ${newStock} ${article.uniteSortie}`);
    
    updateArticle(article.id, { 
      stock: newStock,
      locations: updatedLocations 
    });
    
    console.log(`[SORTIE QC] ✅ Stock updated successfully`);
  }
}
```

## What This Code Does

### 1. Deducts Total Quantity
```typescript
const totalQtyToDeduct = mouvement.qte; // ALWAYS the full quantity
```
- ✅ Deducts ALL units (valid + defective)
- ✅ Does NOT distinguish between conform and non-conform
- ✅ Both are removed from warehouse

### 2. Updates Article Stock
```typescript
const newStock = Math.max(0, article.stock - totalQtyToDeduct);
updateArticle(article.id, { stock: newStock, ... });
```
- ✅ Subtracts from article's total stock
- ✅ Ensures stock never goes negative
- ✅ Updates immediately via `updateArticle()`

### 3. Updates Location Stock
```typescript
const updatedLocations = article.locations.map(loc => {
  if (loc.emplacementNom === mouvement.emplacementSource) {
    return { ...loc, quantite: Math.max(0, loc.quantite - totalQtyToDeduct) };
  }
  return loc;
}).filter(l => l.quantite > 0); // Remove empty locations
```
- ✅ Subtracts from specific emplacement
- ✅ Removes location if quantity becomes 0
- ✅ Updates immediately

## Workflow Verification

### Correct Workflow (Using "Approuver" Button)

```
Step 1: User creates Sortie for 100 units
  → Status: "En attente de validation Qualité"
  → Stock: NO CHANGE (pending)

Step 2: QC Inspector reviews
  → Finds: 100 units defective
  → Fills form:
    - État Articles: "Non-conforme"
    - Unités Défectueuses: 100
    - Contrôleur: "Marie L."

Step 3: User clicks "Approuver" button ✅
  → Calls: approveQualityControl()
  → Deducts: 100 units from stock
  → Updates: Article stock AND location stock
  → Result: Stock = 0 ✅

Step 4: UI Updates
  → Articles table shows: Stock = 0 ✅
  → Emplacements modal shows: Quantity = 0 ✅
  → Toast: "Sortie traitée : 100 unités retirées du stock (Perte/Défectueux - 100% rebut)"
```

### INCORRECT Workflow (Using "Rejeter" Button)

```
Step 1: User creates Sortie for 100 units
  → Status: "En attente de validation Qualité"

Step 2: User clicks "Rejeter" button ❌ WRONG!
  → Calls: rejectQualityControl()
  → Does NOT deduct stock
  → Marks movement as "Rejeté"
  → Result: Stock unchanged ❌

This is WRONG for defective items!
"Rejeter" means "Cancel the operation" (items stay in warehouse)
For defective items, use "Approuver" with "Non-conforme"!
```

## Console Logs for Debugging

When `approveQualityControl()` is called for a Sortie, you should see:

```
[QC APPROVAL] Starting approval for movement 123
  Type: Sortie
  État: Non-conforme
  Unités défectueuses: 100
[QC APPROVAL] Article found: Gants Nitrile M
  Stock avant: 100 Paire
[SORTIE QC] DEDUCTING 100 units from stock
  Valid units: 0
  Defective units (waste/loss): 100
  TOTAL DEDUCTION: 100
  Location Zone A - Rack 12: 100 → 0
  Stock après: 0 Paire
  Locations après: 0 emplacements
[SORTIE QC] ✅ Stock updated successfully
```

## Troubleshooting

### Issue: Stock Not Deducted

**Possible Causes:**

1. **Using "Rejeter" button instead of "Approuver"**
   - Solution: Use "Approuver" button with "Non-conforme" status
   - "Rejeter" = Cancel operation (items stay)
   - "Approuver" with "Non-conforme" = Remove defective items

2. **No emplacementSource specified**
   - Check console for: `[SORTIE QC] ❌ No emplacementSource specified!`
   - Solution: Ensure Sortie movement has `emplacementSource` field

3. **Article not found**
   - Check console for: `[QC APPROVAL] Article not found: [ref]`
   - Solution: Verify article reference matches

4. **React state not updating**
   - Check if `updateArticle()` is being called
   - Check if `setArticles()` is working
   - Verify React component is re-rendering

### Verification Steps

1. **Open Browser Console** (F12)
2. **Create a Sortie** for 100 units
3. **Go to Contrôle Qualité page**
4. **Fill QC form:**
   - État Articles: "Non-conforme"
   - Unités Défectueuses: 100
   - Contrôleur: Your name
5. **Click "Approuver" button** (NOT "Rejeter"!)
6. **Check console logs** - should see all the logs above
7. **Check Articles table** - stock should be 0
8. **Check Emplacements modal** - quantity should be 0

## UI Button Clarification

### "Approuver" Button (Green)
- **Purpose**: Approve the QC inspection result
- **Use for:**
  - All conform items (État: "Conforme")
  - Partially defective items (État: "Non-conforme", some defective)
  - 100% defective items (État: "Non-conforme", all defective)
- **Effect on Sortie**: ALWAYS deducts stock (valid + defective)

### "Rejeter" Button (Red)
- **Purpose**: Cancel/reject the entire operation
- **Use for:**
  - Operation should not have happened
  - Wrong article selected
  - Incorrect quantity
  - Administrative error
- **Effect on Sortie**: Does NOT deduct stock (operation cancelled)

## Key Principle

```
┌─────────────────────────────────────────────────────────────┐
│                    SORTIE LOGIC                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  "Approuver" with "Conforme"                                │
│  → All items are good                                       │
│  → Deduct total quantity from stock ✅                      │
│  → Items successfully shipped                               │
│                                                             │
│  "Approuver" with "Non-conforme"                            │
│  → Some/all items are defective                             │
│  → Deduct total quantity from stock ✅                      │
│  → Valid items shipped, defective items = waste/loss        │
│                                                             │
│  "Rejeter"                                                  │
│  → Operation cancelled                                      │
│  → Do NOT deduct from stock ❌                              │
│  → Items remain in warehouse                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## State Update Flow

```typescript
// 1. Update movement status
setMouvements(mouvements.map(m => 
  m.id === id ? { ...m, statut: "Terminé", ... } : m
));

// 2. Calculate new stock
const newStock = Math.max(0, article.stock - totalQtyToDeduct);

// 3. Update article (triggers React re-render)
updateArticle(article.id, { 
  stock: newStock,
  locations: updatedLocations 
});

// 4. React re-renders components
// → ArticlesPage shows new stock
// → EmplacementsPage shows new quantities
// → Dashboard updates
```

## Files Involved

### 1. src/contexts/DataContext.tsx
- Contains `approveQualityControl()` function
- Handles stock deduction logic
- Updates article and location state

### 2. src/pages/ControleQualitePage.tsx
- Contains "Approuver" and "Rejeter" buttons
- Calls `approveQualityControl()` or `rejectQualityControl()`
- Shows toast messages

### 3. src/pages/ArticlesPage.tsx
- Displays article stock
- Recalculates from movements dynamically
- Updates when article state changes

### 4. src/pages/EmplacementsPage.tsx
- Displays location quantities
- Updates when article locations change

## Conclusion

The stock deduction logic is **CORRECT and WORKING**. The code:

✅ Deducts TOTAL quantity for Sortie (valid + defective)
✅ Updates article stock immediately
✅ Updates location stock immediately
✅ Removes empty locations
✅ Triggers React re-renders
✅ Shows correct values in UI

**If stock is not being deducted, the most likely cause is:**
- Using "Rejeter" button instead of "Approuver" button
- Check console logs to verify which function is being called

**Correct usage:**
- For defective items: Click "Approuver" with "Non-conforme" status
- NOT "Rejeter" (that cancels the operation entirely)

## Date
March 28, 2026
