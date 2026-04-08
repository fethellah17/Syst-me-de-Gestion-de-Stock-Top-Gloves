# Inventaire Stock Théorique Calculation Fix - CRITICAL DOUBLE MULTIPLICATION BUG

## Problem
The Stock Théorique column in the Inventaire table was showing values multiplied by 10 (e.g., 10000 instead of 1000). This was caused by a DOUBLE MULTIPLICATION bug in the DataContext.

## Root Cause - DOUBLE MULTIPLICATION
The bug was in `DataContext.tsx` in the `addMouvement` function for "Entrée" type movements:

### ❌ INCORRECT CODE (Before Fix):
```typescript
if (mouvement.type === "Entrée") {
  // BUG: mouvement.qte is ALREADY in exit units!
  const rawQuantityInExitUnit = mouvement.qte * article.facteurConversion; // ❌ DOUBLE MULTIPLICATION
  const quantityInExitUnit = roundStockQuantity(rawQuantityInExitUnit, article.uniteSortie);
  // ... rest of code
}
```

### ✅ CORRECT CODE (After Fix):
```typescript
if (mouvement.type === "Entrée") {
  // mouvement.qte is ALREADY in exit unit (smallest unit)
  // The conversion happens in the form BEFORE calling addMouvement
  const quantityInExitUnit = roundStockQuantity(mouvement.qte, article.uniteSortie); // ✅ NO MULTIPLICATION
  // ... rest of code
}
```

## Why This Happened

According to the Mouvement interface definition:
```typescript
interface Mouvement {
  qte: number; // Always stored in exit unit (smallest unit) for consistency
  qteOriginale?: number; // Original quantity as entered by user (for display)
  uniteUtilisee?: string; // Unit selected by user during operation (for display)
}
```

The `qte` field is **ALWAYS** already in exit units when it reaches `addMouvement`. The conversion from entry unit to exit unit happens in the form layer, not in the DataContext.

### Example Flow:
1. User enters: 5 Boîtes (entry unit)
2. Form converts: 5 × 100 = 500 Paires (exit unit)
3. Form calls: `addMouvement({ qte: 500, qteOriginale: 5, uniteUtilisee: "Boîte" })`
4. DataContext receives: `mouvement.qte = 500` (already in Paires)
5. ❌ OLD BUG: `500 × 100 = 50000` (double multiplication!)
6. ✅ NEW FIX: `500` (no multiplication needed)

## Solution Implemented

### 1. Removed Double Multiplication in DataContext
- Removed the line: `const rawQuantityInExitUnit = mouvement.qte * article.facteurConversion;`
- Changed to: `const quantityInExitUnit = roundStockQuantity(mouvement.qte, article.uniteSortie);`
- Added clear comments explaining that `mouvement.qte` is already in exit units

### 2. Updated Console Logging
Console logs now correctly show:
```
[ENTRÉE] Article: Gants Nitrile M
  Quantité reçue (déjà en Paire): 500
  Quantité arrondie: 500 Paire
  Stock avant: 2000 Paire
  Stock après (brut): 2500 Paire
  Stock après (arrondi): 2500 Paire
```

### 3. Added Debug Logging in Inventaire Page
The Inventaire page also logs each row:
```
[Inventaire] Article: Gants Nitrile M (GN-M-001), 
Emplacement: Zone A - Rack 12, 
Stock Théorique (location.quantite): 1500, 
Unit Sortie: Paire, 
Facteur Conversion: 100
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ USER INPUT (Form Layer)                                      │
│ - User enters: 5 Boîtes                                      │
│ - Form converts: 5 × facteurConversion(100) = 500 Paires    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ addMouvement({ qte: 500, qteOriginale: 5 })                 │
│ - qte is ALREADY in exit units (Paires)                     │
│ - NO conversion needed here                                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ DataContext Updates                                          │
│ - article.stock += 500 (no multiplication)                   │
│ - location.quantite += 500 (no multiplication)               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Inventaire Page Display                                      │
│ - Reads location.quantite directly (500)                     │
│ - Displays: 500 (no multiplication)                          │
└─────────────────────────────────────────────────────────────┘
```

## Verification Steps
1. Open browser DevTools (F12)
2. Add a new Entrée movement (e.g., 1 Boîte = 100 Paires)
3. Check Console logs:
   - Should show: "Quantité reçue (déjà en Paire): 100"
   - Should NOT multiply by 100 again
4. Go to Inventaire page
5. Verify Stock Théorique shows 100, not 1000 or 10000

## Files Changed
- `src/contexts/DataContext.tsx` - Removed double multiplication in addMouvement
- `src/pages/InventairePage.tsx` - Added debug logging (already correct, no calculation changes needed)

## Impact
This fix ensures that:
- Stock quantities are stored correctly in the database
- Inventaire table displays accurate theoretical stock
- No more mysterious "extra zeros" in stock calculations
- All stock movements are tracked with correct quantities
