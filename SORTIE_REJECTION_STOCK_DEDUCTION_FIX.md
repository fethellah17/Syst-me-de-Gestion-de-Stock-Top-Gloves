# SORTIE REJECTION STOCK DEDUCTION FIX - CRITICAL LOGIC

## Problem
The system was treating **Sortie rejection** the same as **Entrée rejection**. This is fundamentally wrong:

- **Entrée Rejection**: Items never entered the warehouse → Stock stays the same ✓
- **Sortie Rejection**: Items are BAD/DEFECTIVE → Must be REMOVED from shelf → Stock MUST decrease ✗ (was not happening)

When you clicked "Rejeter le mouvement" on a Sortie, the shelf quantity (e.g., "Zone A - Rack 12: 100") was NOT decreasing. It should have become 90 (100 - 10 rejected items).

## Root Cause
The `rejectQualityControl()` function in DataContext was only updating the movement status to "Rejeté" without considering the movement type. It didn't deduct stock for Sortie rejections.

## Solution Implemented

### Updated rejectQualityControl() Logic

**For SORTIE Rejection:**
```
User clicks "Rejeter le mouvement" on a Sortie
  ↓
rejectQualityControl() is called
  ↓
Check: mouvement.type === "Sortie"?
  ↓ YES
Deduct quantity from article.stock
Deduct quantity from article.locations[emplacementSource]
Update movement status to "Rejeté"
Trigger setArticles() → React re-renders
  ↓
UI displays updated shelf quantity instantly
Example: "Zone A - Rack 12: 100" → "Zone A - Rack 12: 90"
```

**For ENTRÉE Rejection:**
```
User clicks "Rejeter le mouvement" on an Entrée
  ↓
rejectQualityControl() is called
  ↓
Check: mouvement.type === "Entrée"?
  ↓ YES
NO stock change (items never entered)
Update movement status to "Rejeté"
Trigger setMouvements() → React re-renders
  ↓
UI shows rejection but stock remains unchanged
```

## Key Implementation Details

### 1. Separate Logic Paths
```typescript
if (mouvement.type === "Sortie") {
  // SORTIE REJECTION = PHYSICAL REMOVAL (Loss/Waste)
  // Deduct from stock
  const newStock = Math.max(0, article.stock - mouvement.qte);
  
  // Deduct from specific location
  const updatedLocations = article.locations.map(loc => {
    if (loc.emplacementNom === mouvement.emplacementSource) {
      return { ...loc, quantite: Math.max(0, loc.quantite - mouvement.qte) };
    }
    return loc;
  }).filter(l => l.quantite > 0);
  
  // Update article
  updatedArticles = articles.map(a => 
    a.id === article.id 
      ? { ...a, stock: newStock, locations: updatedLocations }
      : a
  );
} else if (mouvement.type === "Entrée") {
  // ENTRÉE REJECTION = NO STOCK CHANGE
  // Items never entered - no deduction needed
  console.log(`Items never entered stock - no stock change`);
}
```

### 2. Immediate UI Update
- Updates both `article.stock` and `article.locations`
- Calls `setArticles()` to trigger React re-render
- Emplacement quantity updates instantly via `article.locations`

### 3. Comprehensive Logging
Added detailed console logs to track:
- Movement type (Sortie vs Entrée)
- Stock before/after
- Location before/after
- Confirmation of state updates

## Behavior After Fix

### Scenario 1: Reject a Sortie (10 units from Zone A - Rack 12)
```
Before: Zone A - Rack 12: 100 units
Click "Rejeter le mouvement"
After: Zone A - Rack 12: 90 units ✅
Stock decreased by 10 (permanent loss)
```

### Scenario 2: Reject an Entrée (50 units to Zone B - Rack 03)
```
Before: Zone B - Rack 03: 200 units
Click "Rejeter le mouvement"
After: Zone B - Rack 03: 200 units ✅
Stock unchanged (items never entered)
```

## Files Modified

- `src/contexts/DataContext.tsx`
  - Updated `rejectQualityControl()` function
  - Added separate logic for Sortie vs Entrée rejection
  - Added comprehensive logging
  - Sortie rejection now deducts stock and updates locations

## No Changes Needed

- `src/pages/ControleQualitePage.tsx` - Already correct
- `src/pages/InventairePage.tsx` - Already reads from article.locations
- `src/pages/ArticlesPage.tsx` - Already reads from article.locations

## Testing

### Test Case 1: Sortie Rejection
1. Go to **Contrôle de Qualité** → **Contrôles à la Sortie**
2. Click **Rejeter** on any pending Sortie
3. Fill in the form and click **Confirmer le Rejet**
4. **Expected**: The shelf quantity should DECREASE by the movement quantity
5. Verify in **Inventaire** page that the location quantity is reduced

### Test Case 2: Entrée Rejection
1. Go to **Contrôle de Qualité** → **Contrôles à l'Entrée**
2. Click **Rejeter** on any pending Entrée
3. Fill in the form and click **Confirmer le Rejet**
4. **Expected**: The shelf quantity should REMAIN UNCHANGED
5. Verify in **Inventaire** page that the location quantity is the same

## Business Logic

**Why Sortie Rejection = Stock Deduction:**
- Sortie rejection means the items are defective/damaged
- They cannot be used and must be removed from the warehouse
- This is a permanent loss (waste/scrap)
- Stock must reflect this loss immediately

**Why Entrée Rejection = No Stock Change:**
- Entrée rejection means the items failed QC
- They never entered usable inventory (remain in quarantine)
- They are not part of the warehouse stock
- Stock remains unchanged

## Console Output Example

When rejecting a Sortie:
```
[QC REJECTION] Starting rejection for movement 2
  Type: Sortie
  Article: Gants Latex S (GL-S-002)
  Quantité: 200
  Raison: Défectueux - Emballage endommagé
[SORTIE REJECTION] CRITICAL: Items are BAD - REMOVING from shelf
  Source location: Zone A - Rack 12
  Quantity to remove: 200
  Stock: 1800 → 1600
  Location Zone A - Rack 12: 1800 → 1600
[SORTIE REJECTION] ✅ Stock and locations updated - items removed from shelf
[QC REJECTION] ✅ Movement status updated to Rejeté
[QC REJECTION] setMouvements called
[QC REJECTION] setArticles called
[QC REJECTION] ✅ State updates complete
[QC REJECTION] ===== REJECTION COMPLETE =====
```
