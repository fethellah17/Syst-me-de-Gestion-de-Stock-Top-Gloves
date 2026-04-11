# CRITICAL BUG FIX: Articles Total Stock Out of Sync with Emplacements

## Problem Statement
When an **Entrée** is created with status **"En attente"** (pending QC), the Article Table was incorrectly showing the quantity as already added to the **Stock Total**, while the Emplacements correctly showed it was NOT yet stored.

This created a **ghost stock** situation where:
- Article Stock column: Shows 500 units (WRONG - includes pending items)
- Emplacement column: Shows 0 units (CORRECT - items not yet physically stored)

## Root Cause
In `src/pages/ArticlesPage.tsx`, the stock calculation logic was summing **ALL Entrée movements** without filtering by status:

```typescript
// BEFORE (BUGGY):
if (mouvement.type === "Entrée") {
  const originalQty = mouvement.qteOriginale || mouvement.qte;
  totalQtyInEntryUnits += originalQty;  // ❌ Adds ALL entries, including "En attente"
}
```

This meant pending entries (status: "En attente") were being counted as confirmed stock.

## Solution: Status-Based Filtering
Updated the calculation to **only count confirmed Entrée movements** (status: "Terminé"):

```typescript
// AFTER (FIXED):
if (mouvement.type === "Entrée") {
  // CRITICAL FIX: Only count Entrée movements that are CONFIRMED (Terminé)
  // "En attente" entries are NOT yet physically stored and should NOT be counted
  if (mouvement.statut === "Terminé" || mouvement.status === "approved") {
    const originalQty = mouvement.qteOriginale || mouvement.qte;
    totalQtyInEntryUnits += originalQty;
    console.log(`[CALC] ${a.nom} ENTRÉE CONFIRMÉE: +${originalQty} ${a.uniteEntree}`);
  } else {
    console.log(`[CALC] ${a.nom} ENTRÉE EN ATTENTE (IGNORÉE): ${mouvement.qte} ${a.uniteSortie}`);
  }
}
```

## Implementation Details

### File Modified
- `src/pages/ArticlesPage.tsx` (lines 314-340)

### Logic Changes
1. **Entrée movements**: Now filtered by status before adding to total
   - ✅ Only "Terminé" or "approved" entries are counted
   - ❌ "En attente" entries are explicitly ignored with logging

2. **Sortie movements**: Already had correct filtering (unchanged)
   - Only "Terminé" or "approved" sorties are deducted

3. **Ajustement movements**: Already had correct logic (unchanged)
   - Surplus and Manquant adjustments are always applied

### Stock Calculation Flow
```
Article Stock = Sum of:
  ✅ Confirmed Entrée (Terminé)
  ✅ Confirmed Sortie (Terminé) - deducted
  ✅ Ajustement Surplus (Terminé)
  ❌ Ajustement Manquant (Terminé) - deducted
  ❌ Pending Entrée (En attente) - IGNORED
  ❌ Pending Sortie (En attente) - IGNORED
```

## Validation Scenario

### Before Fix
1. Create Entrée: 500 units, Status: "En attente"
   - Article Stock: **500** ❌ (WRONG - includes pending)
   - Emplacement: **0** ✅ (Correct - not yet stored)

2. Approve QC: Click "Confirmer"
   - Article Stock: **500** ✅ (Now correct)
   - Emplacement: **500** ✅ (Now correct)

### After Fix
1. Create Entrée: 500 units, Status: "En attente"
   - Article Stock: **0** ✅ (CORRECT - pending not counted)
   - Emplacement: **0** ✅ (Correct - not yet stored)

2. Approve QC: Click "Confirmer"
   - Article Stock: **500** ✅ (Correct)
   - Emplacement: **500** ✅ (Correct)

## Key Principles Enforced

1. **Single Source of Truth**: Article stock is derived from confirmed movements only
2. **Inventory Integrity**: Pending items are treated as "In Transit" or "Ghost Stock"
3. **Synchronization**: Article Stock and Emplacement quantities are always in sync
4. **Audit Trail**: Console logs track all stock calculations for debugging

## Testing Checklist

- [ ] Create new Entrée with 500 units → Article Stock remains at previous value
- [ ] Approve QC for that Entrée → Article Stock jumps to 500 + previous value
- [ ] Verify Emplacement shows correct quantity after QC approval
- [ ] Test with multiple pending entries → All ignored until approved
- [ ] Test Sortie workflow → Pending sorties don't deduct stock
- [ ] Test Ajustement workflow → Adjustments work correctly

## Related Code
- `src/contexts/DataContext.tsx`: `approveQualityControl()` - Updates stock when QC is approved
- `src/pages/ArticlesPage.tsx`: Stock calculation in table rendering (FIXED)
- `src/lib/stock-utils.ts`: Stock status calculations (unchanged)

## Impact
- ✅ Fixes critical data integrity issue
- ✅ Ensures Articles table reflects only confirmed, physically stored items
- ✅ Maintains synchronization between Article Stock and Emplacement quantities
- ✅ Prevents ghost stock from appearing in reports
