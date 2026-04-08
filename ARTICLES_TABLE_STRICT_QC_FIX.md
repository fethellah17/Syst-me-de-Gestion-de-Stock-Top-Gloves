# Articles Table Stock Calculation - Strict QC Fix

## Problem Statement

The Articles table (Inventory view) was showing incorrect stock quantities by including movements that were still "En attente de validation Qualité" (Pending Quality Control). This created a discrepancy between displayed stock and actual physical warehouse inventory.

**Example Issue:**
- An article receives 100 units (Entrée) but is still pending QC approval
- The table showed: Stock = 100 units
- Reality: Stock = 0 units (not yet approved for use)

## Solution Applied

### 1. Stock Calculation Logic Update (ArticlesPage.tsx)

Updated the stock calculation to strictly filter movements based on their validation status:

```typescript
mouvements.forEach(mouvement => {
  if (mouvement.ref === a.ref) {
    if (mouvement.type === "Entrée") {
      // CRITICAL: Only count validated entries (Terminé/Approuvé)
      if (mouvement.statut === "Terminé" || mouvement.status === "approved") {
        const validQty = mouvement.validQuantity !== undefined ? mouvement.validQuantity : mouvement.qte;
        const qtyInEntryUnits = validQty / a.facteurConversion;
        totalQtyInEntryUnits += qtyInEntryUnits;
      } else if (mouvement.statut === "En attente de validation Qualité" || mouvement.status === "pending") {
        // Track pending stock separately for visual feedback
        const originalQty = mouvement.qteOriginale || mouvement.qte;
        const qtyInEntryUnits = originalQty / a.facteurConversion;
        pendingQtyInEntryUnits += qtyInEntryUnits;
      }
      // Rejected entries (statut === "Rejeté") are completely ignored
    }
    // ... other movement types
  }
});
```

**Key Rules:**
- ✅ **Entrée + Terminé**: Add to stock (approved inventory)
- ✅ **Entrée + En attente**: Track separately (not in stock yet)
- ✅ **Entrée + Rejeté**: Completely ignored (never enters stock)
- ✅ **Sortie + Terminé**: Subtract from stock (approved exit)
- ✅ **Sortie + En attente**: Ignored (not yet processed)
- ✅ **Ajustement**: Always counted (created with Terminé status)

### 2. Visual Feedback for Pending Stock

Added an optional badge to show pending quantities:

```typescript
{pendingStockInExitUnits > 0 && (
  <span className="text-[10px] text-orange-600 font-mono flex items-center gap-1">
    <HelpCircle className="w-3 h-3" />
    (+{String(pendingStockInExitUnits)} en attente)
  </span>
)}
```

**Display Example:**
```
Stock: 0 Paire
(+100 en attente)
```

This clearly shows:
- Current usable stock: 0
- Pending approval: 100 units

### 3. Emplacement Stock Synchronization

The location-specific stock calculation (`calculateLocationStock` in DataContext.tsx) already implements the same strict filtering:

```typescript
// ENTRÉE: Only count if validated and destination matches
if (m.type === "Entrée" && m.statut === "Terminé" && m.emplacementDestination === emplacementName) {
  const quantityToAdd = m.validQuantity !== undefined ? m.validQuantity : m.qte;
  locationStock += quantityToAdd;
}
```

**Result:** Location badges in the Articles table automatically show only validated stock.

## Impact

### Before Fix
| Article | Stock Column | Reality |
|---------|-------------|---------|
| Gants Nitrile M | 2600 | 2500 (100 pending) |
| Masques FFP2 | 8500 | 8000 (500 pending) |

### After Fix
| Article | Stock Column | Reality |
|---------|-------------|---------|
| Gants Nitrile M | 2500<br/><small>(+100 en attente)</small> | 2500 ✅ |
| Masques FFP2 | 8000<br/><small>(+500 en attente)</small> | 8000 ✅ |

## Quality Control Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    ENTRÉE MOVEMENT                          │
│                  (100 units received)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Status: "En attente de validation"             │
│              Stock Table: 0 (+100 en attente)               │
│              Physical Reality: 0 (in quarantine)            │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌───────────────────────────┐  ┌──────────────────────────┐
│   QC APPROVAL             │  │   QC REJECTION           │
│   Status: "Terminé"       │  │   Status: "Rejeté"       │
│   Stock: +100 ✅          │  │   Stock: 0 (rejected)    │
└───────────────────────────┘  └──────────────────────────┘
```

## Files Modified

1. **src/pages/ArticlesPage.tsx**
   - Updated stock calculation loop to filter by `statut === "Terminé"`
   - Added pending stock tracking
   - Added visual feedback badge for pending quantities

2. **src/contexts/DataContext.tsx** (Already Correct)
   - `calculateLocationStock()` already filters correctly
   - `getArticleStockByLocation()` uses dynamic calculation
   - No changes needed

## Testing Checklist

- [x] Create new Entrée movement → Stock remains unchanged
- [x] Approve Entrée → Stock increases by approved quantity
- [x] Reject Entrée → Stock remains unchanged
- [x] Pending badge appears when movements are pending
- [x] Pending badge disappears after approval/rejection
- [x] Location badges show only validated stock
- [x] Defective units are excluded from stock (QC approval with defects)

## Compliance

This fix ensures the system accurately reflects:
- ✅ **Physical warehouse reality**: Only approved items are counted
- ✅ **Quality control process**: Pending items are in quarantine
- ✅ **Inventory accuracy**: Stock numbers match physical counts
- ✅ **Traceability**: Clear visibility of pending vs. approved stock

## Date
March 28, 2026
