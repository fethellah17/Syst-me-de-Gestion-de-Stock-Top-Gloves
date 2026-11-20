# Sortie Inventory Update - Critical Fix

## Problem Identified

The inventory is NOT updating after approving a Sortie because:

1. **ArticlesPage Stock Calculation**: The stock is calculated dynamically from `mouvements` array
2. **Calculation Logic**: Only counts Sortie movements where `statut === "Terminé"`
3. **Update Trigger**: When `approveQualityControl()` is called, it updates the movement status to "Terminé"
4. **Expected Result**: ArticlesPage should recalculate and subtract the Sortie quantity

## Root Cause

The `approveQualityControl` function calls `setMouvements()` to update the movement status, but the ArticlesPage might not be re-rendering properly, or the calculation might have a bug.

## Solution

The fix requires ensuring:

1. ✅ Movement status is updated to "Terminé"
2. ✅ `setMouvements()` is called with the updated array
3. ✅ ArticlesPage re-renders when `mouvements` changes
4. ✅ Stock calculation correctly subtracts Sortie movements

## Verification Steps

### Step 1: Check Console Logs
When you approve a Sortie, open the browser console (F12) and look for:

```
[QC APPROVAL] Starting approval for movement 123
  Type: Sortie
  État: Conforme
  Unités défectueuses: 0
[QC APPROVAL] Article found: Gants Nitrile M
  Stock avant: 100 Paire
[SORTIE QC] DEDUCTING 10 units from stock
  Valid units: 10
  Defective units (waste/loss): 0
  TOTAL DEDUCTION: 10
  Location Zone A - Rack 12: 100 → 90
  Stock après: 90 Paire
  Locations après: 1 emplacements
[SORTIE QC] ✅ Stock updated successfully
[SORTIE QC] ✅ State updates complete - UI should refresh now
```

### Step 2: Check ArticlesPage Calculation
The ArticlesPage should log:

```
[ARTICLES TABLE] Gants Nitrile M: 9 Boîte × 100 = 900 Paire
```

(Note: This shows the stock AFTER the Sortie is deducted)

### Step 3: Verify UI Updates
- Articles table: Stock column should show 90 (not 100)
- Emplacements modal: Quantity should show 90 (not 100)

## If Stock is NOT Updating

### Possible Causes:

1. **Movement Status Not Changing**
   - Check console for: `[QC APPROVAL] Movement status updated to Terminé`
   - If missing: The `setMouvements()` call might not be working

2. **ArticlesPage Not Re-rendering**
   - Check if the component re-renders when mouvements changes
   - Try refreshing the page manually - if stock updates, it's a re-render issue

3. **Stock Calculation Bug**
   - Check the ArticlesPage calculation logic
   - Verify it's checking `mouvement.statut === "Terminé"` for Sortie

4. **Stale Closure**
   - The `approveQualityControl` function might be using an old `articles` array
   - This shouldn't affect Sortie (which uses mouvements), but could affect Entrée

## Implementation Details

### Current Flow:

```typescript
// 1. User clicks "Approuver" button
handleSubmitQC()

// 2. Calls approveQualityControl()
approveQualityControl(id, controleur, etatArticles, unitesDefectueuses)

// 3. Updates movement status
const updatedMovements = mouvements.map(m => 
  m.id === id ? { ...m, statut: "Terminé", ... } : m
);
setMouvements(updatedMovements);

// 4. React re-renders components that use mouvements
// → ArticlesPage re-renders
// → Stock calculation runs again
// → Sortie is now counted (statut === "Terminé")
// → Stock decreases

// 5. UI updates immediately
```

### ArticlesPage Stock Calculation:

```typescript
mouvements.forEach(mouvement => {
  if (mouvement.ref === a.ref) {
    if (mouvement.type === "Sortie") {
      // ONLY count if statut === "Terminé"
      if (mouvement.statut === "Terminé" || mouvement.status === "approved") {
        const qtyInEntryUnits = mouvement.qte / a.facteurConversion;
        totalQtyInEntryUnits -= qtyInEntryUnits; // SUBTRACT from stock
      }
    }
  }
});
```

## Expected Behavior

### Before Approval:
- Sortie movement: `statut = "En attente de validation Qualité"`
- ArticlesPage: Sortie NOT counted (stock unchanged)
- Stock: 100 units

### After Approval:
- Sortie movement: `statut = "Terminé"`
- ArticlesPage: Sortie IS counted (stock decreased)
- Stock: 90 units ✅

## Debugging Checklist

- [ ] Open browser console (F12)
- [ ] Approve a Sortie
- [ ] Check for `[QC APPROVAL]` logs
- [ ] Check for `[SORTIE QC]` logs
- [ ] Verify `Stock updated successfully` message
- [ ] Check Articles table - stock should decrease
- [ ] Check Emplacements modal - quantity should decrease
- [ ] If not updating, refresh page - does it show correct stock?
- [ ] Check for JavaScript errors in console

## Next Steps

If the stock is still not updating after verification:

1. **Check React DevTools**
   - Install React DevTools browser extension
   - Verify `mouvements` state is actually changing
   - Check if ArticlesPage component is re-rendering

2. **Add Manual Refresh**
   - If manual page refresh shows correct stock, it's a re-render issue
   - May need to add explicit re-render trigger

3. **Check for Errors**
   - Look for any JavaScript errors in console
   - Check if `setMouvements()` is being called
   - Verify movement ID is correct

## Date
March 28, 2026
