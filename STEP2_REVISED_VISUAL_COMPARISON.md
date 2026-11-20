# STEP 2 REVISED: VISUAL COMPARISON

## Before vs After

### BEFORE: Global Lot Fields

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Nouveau Mouvement                                                        [X] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Informations Communes                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Type de Mouvement: [Entrée] [Sortie] [Transfert]                   │   │
│  │                                                                     │   │
│  │ Numéro de Lot *        │ Date du Lot *      │ Opérateur *         │   │
│  │ [LOT-2024-001]         │ [dd/mm/yyyy]       │ [Nom]               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Articles à Traiter (3 articles)                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Article │ Quantité │ Source │ Destination │ Action                 │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ [▼]     │ [0] [▼]  │ [▼]    │ [▼]         │ [🗑]                   │   │
│  │ [▼]     │ [0] [▼]  │ [▼]    │ [▼]         │ [🗑]                   │   │
│  │ [▼]     │ [0] [▼]  │ [▼]    │ [▼]         │ [🗑]                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ℹ️ Tous les articles partageront le même numéro et date de lot.           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Annuler]                    [Confirmer les Entrées (3)]                    │
└─────────────────────────────────────────────────────────────────────────────┘

PROBLEM: All articles share the same lot number and date
         Can't handle mixed shipments with different batches
```

### AFTER: Per-Row Lot Fields

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Nouveau Mouvement                                                        [X] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Informations Communes                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Type de Mouvement: [Entrée] [Sortie] [Transfert]                   │   │
│  │                                                                     │   │
│  │ Opérateur *                                                         │   │
│  │ [Nom]                                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Articles à Traiter (3 articles)                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Article │ Qty │ Source │ Dest │ Lot # │ Expiry │ Action           │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ [▼]     │ [0] │ [▼]    │ [▼]  │ [___] │ [____] │ [🗑]             │   │
│  │ [▼]     │ [0] │ [▼]    │ [▼]  │ [___] │ [____] │ [🗑]             │   │
│  │ [▼]     │ [0] │ [▼]    │ [▼]  │ [___] │ [____] │ [🗑]             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [+ Ajouter un autre article]                                              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Annuler]                    [Confirmer les Entrées (3)]                    │
└─────────────────────────────────────────────────────────────────────────────┘

BENEFIT: Each article has its own lot number and expiry date
         Perfect for mixed shipments with different batches
         Cleaner top section
```

---

## Data Structure Comparison

### BEFORE
```typescript
// Global lot fields
const [lotNumber, setLotNumber] = useState("");
const [lotDate, setLotDate] = useState<Date | undefined>(undefined);

// Items without lot info
interface BulkMovementItem {
  id: string;
  articleId: string;
  quantity: number;
  selectedUnit: string;
  emplacementSource?: string;
  emplacementDestination?: string;
  qc_status: "pending" | "approved" | "rejected";
}

// All items share the same lot
onSubmit(items, movementType, lotNumber, lotDate, operateur)
```

### AFTER
```typescript
// No global lot fields - removed!

// Items with per-row lot info
interface BulkMovementItem {
  id: string;
  articleId: string;
  quantity: number;
  selectedUnit: string;
  emplacementSource?: string;
  emplacementDestination?: string;
  lotNumber: string;              // ← NEW
  lotDate?: Date;                 // ← NEW
  qc_status: "pending" | "approved" | "rejected";
}

// Each item has its own lot
onSubmit(items, movementType, operateur)
// items[0].lotNumber, items[0].lotDate
// items[1].lotNumber, items[1].lotDate
// items[2].lotNumber, items[2].lotDate
```

---

## Example: Mixed Shipment

### Scenario
Receiving 3 different articles from 2 different suppliers:
- Gants Nitrile M (Supplier A, Lot 2024-001, Expires 2025-12-31)
- Gants Latex S (Supplier B, Lot 2024-002, Expires 2025-11-30)
- Masques FFP2 (Supplier A, Lot 2024-003, Expires 2025-10-31)

### BEFORE (Impossible)
❌ Can't enter different lot numbers for each article
❌ Can't enter different expiry dates for each article
❌ Would need to create 3 separate movements

### AFTER (Perfect)
✅ Enter all 3 articles in one movement
✅ Each article has its own lot number
✅ Each article has its own expiry date
✅ One submission, complete traceability

```
Row 1: Gants Nitrile M    | 500 Boîte | Zone A | LOT-2024-001 | 2025-12-31
Row 2: Gants Latex S      | 200 Boîte | Zone B | LOT-2024-002 | 2025-11-30
Row 3: Masques FFP2       | 100 Carton| Zone C | LOT-2024-003 | 2025-10-31
```

---

## Mobile Comparison

### BEFORE: Mobile Card (No Lot Fields)
```
┌──────────────────────────────┐
│ Article                      │
│ [Sélectionner...]            │
│                              │
│ Quantité                     │
│ [0]        [Paire]           │
│                              │
│ Source                       │
│ [Sélectionner...]            │
│                              │
│ Destination                  │
│ [Sélectionner...]            │
│                              │
│ [Supprimer cet article]      │
└──────────────────────────────┘
```

### AFTER: Mobile Card (With Lot Fields)
```
┌──────────────────────────────┐
│ Article                      │
│ [Sélectionner...]            │
│                              │
│ Quantité                     │
│ [0]        [Paire]           │
│                              │
│ Source                       │
│ [Sélectionner...]            │
│                              │
│ Destination                  │
│ [Sélectionner...]            │
│                              │
│ Numéro de Lot                │ ← NEW
│ [LOT-2024-001]               │
│                              │
│ Date d'expiration            │ ← NEW
│ [dd/mm/yyyy]                 │
│                              │
│ [Supprimer cet article]      │
└──────────────────────────────┘
```

---

## State Flow

### BEFORE
```
User Input
    ↓
Global lotNumber, lotDate
    ↓
All items use same lot
    ↓
Submit: onSubmit(items, type, lotNumber, lotDate, operator)
```

### AFTER
```
User Input (Row 1)
    ↓
items[0].lotNumber, items[0].lotDate
    ↓
User Input (Row 2)
    ↓
items[1].lotNumber, items[1].lotDate
    ↓
User Input (Row 3)
    ↓
items[2].lotNumber, items[2].lotDate
    ↓
Submit: onSubmit(items, type, operator)
        Each item carries its own lot info
```

---

## Validation Changes

### BEFORE
```typescript
if (!lotNumber.trim()) newErrors.lotNumber = "Requis";
if (!lotDate) newErrors.lotDate = "Requis";
```

### AFTER
```typescript
items.forEach((item) => {
  if (!item.lotNumber.trim()) newErrors[`item-${item.id}-lot`] = "Requis";
  if (!item.lotDate) newErrors[`item-${item.id}-lotDate`] = "Requis";
});
```

---

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Lot Precision** | Global (all items same) | Per-row (each item different) |
| **Mixed Shipments** | ❌ Not possible | ✅ Fully supported |
| **Traceability** | Limited | Complete |
| **Top Section** | Cluttered (3 fields) | Clean (1 field) |
| **Mobile UX** | Simpler | More complete |
| **Data Integrity** | Shared lot risk | Individual lot safety |
| **Flexibility** | Rigid | Flexible |

---

## Implementation Details

### Files Modified
1. **BulkMovementModal.tsx**
   - Removed global `lotNumber` and `lotDate` state
   - Added `lotNumber` and `lotDate` to `BulkMovementItem` interface
   - Updated UI to show lot fields in each row
   - Updated validation to check per-row lot fields

2. **MouvementsPage.tsx**
   - Updated `handleBulkMovementSubmit` signature
   - Changed to use `item.lotNumber` and `item.lotDate`
   - Applied to all movement types (Entrée, Sortie, Transfert)

### No Breaking Changes
- ✅ Existing functionality preserved
- ✅ QC workflow still works
- ✅ Stock calculations unchanged
- ✅ Movement history intact

