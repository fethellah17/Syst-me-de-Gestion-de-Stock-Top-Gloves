# STEP 2 REVISED: UI RESTRUCTURE - COMPLETE ✅

## Overview
The bulk movement modal UI has been restructured to move lot details from the top section into individual rows for per-article precision.

---

## 1. Top Section Cleanup ✅

### Before
```
Informations Communes
├── Type de Mouvement: [Entrée] [Sortie] [Transfert]
├── Numéro de Lot *: [LOT-2024-001]
├── Date du Lot *: [dd/mm/yyyy]
└── Opérateur *: [Nom]
```

### After
```
Informations Communes
├── Type de Mouvement: [Entrée] [Sortie] [Transfert]
└── Opérateur *: [Nom]
```

**Changes:**
- ✅ Removed "Numéro de Lot" field
- ✅ Removed "Date du Lot" field
- ✅ Kept "Type de Mouvement" buttons
- ✅ Kept "Opérateur" field

---

## 2. Table Columns Updated ✅

### Desktop Table Structure
```
[Article] [Quantité] [Source] [Destination] [Numéro de Lot] [Date d'expiration] [Action]
```

### New Columns Added
1. **Numéro de Lot**: Text input field
   - Placeholder: "LOT-2024-001"
   - Per-row entry
   - Validation: Required

2. **Date d'expiration**: Date picker field
   - Calendar popup
   - Per-row entry
   - Validation: Required

### Column Order
1. Article (dropdown)
2. Quantité (number + unit selector)
3. Source (for Sortie/Transfert only)
4. Destination (Client/Service for Sortie, Location for others)
5. **Numéro de Lot** (NEW)
6. **Date d'expiration** (NEW)
7. Action (delete button)

---

## 3. Mobile Card Layout ✅

### Mobile Card Structure
Each card now includes:
```
┌──────────────────────────────┐
│ Article                      │
│ [Sélectionner...]            │
│                              │
│ Quantité                     │
│ [0]        [Paire]           │
│                              │
│ Source (if needed)           │
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

**Mobile Features:**
- ✅ Full-width inputs (h-12 for touch)
- ✅ Lot fields appear in each card
- ✅ Date picker integrated
- ✅ No horizontal scrolling

---

## 4. State Management ✅

### Updated BulkMovementItem Interface
```typescript
interface BulkMovementItem {
  id: string;
  articleId: string;
  quantity: number;
  selectedUnit: string;
  emplacementSource?: string;
  emplacementDestination?: string;
  lotNumber: string;              // ← NEW: Per-row lot number
  lotDate?: Date;                 // ← NEW: Per-row lot date
  qc_status: "pending" | "approved" | "rejected";
}
```

### Initial State (3 Rows)
```typescript
const [items, setItems] = useState<BulkMovementItem[]>([
  { 
    id: "1", 
    articleId: "", 
    quantity: 0, 
    selectedUnit: "", 
    emplacementSource: "", 
    emplacementDestination: "", 
    lotNumber: "",           // ← NEW
    lotDate: undefined,      // ← NEW
    qc_status: "pending" 
  },
  // ... rows 2 and 3 ...
]);
```

### Form Validation
```typescript
// Validate per-row lot fields
items.forEach((item) => {
  if (!item.lotNumber.trim()) newErrors[`item-${item.id}-lot`] = "Requis";
  if (!item.lotDate) newErrors[`item-${item.id}-lotDate`] = "Requis";
  // ... other validations ...
});
```

---

## 5. Updated onSubmit Signature ✅

### Before
```typescript
onSubmit: (
  items: BulkMovementItem[], 
  movementType: MovementType, 
  lotNumber: string,        // Global
  lotDate: Date,            // Global
  operateur: string
) => void
```

### After
```typescript
onSubmit: (
  items: BulkMovementItem[], 
  movementType: MovementType, 
  operateur: string
) => void
```

**Changes:**
- ✅ Removed global `lotNumber` parameter
- ✅ Removed global `lotDate` parameter
- ✅ Lot details now come from `items[i].lotNumber` and `items[i].lotDate`

---

## 6. MouvementsPage Integration ✅

### Updated handleBulkMovementSubmit
```typescript
const handleBulkMovementSubmit = (
  items: any[],
  movementType: "Entrée" | "Sortie" | "Transfert",
  operateur: string  // Only operator now
) => {
  items.forEach(item => {
    // Use per-row lot details
    addMouvement({
      // ...
      lotNumber: item.lotNumber,           // ← From row
      lotDate: item.lotDate ? format(item.lotDate, "yyyy-MM-dd") : "",  // ← From row
      // ...
    });
  });
};
```

---

## 7. Benefits of This Approach ✅

### Precision
- ✅ Each article can have a different lot number
- ✅ Each article can have a different expiry date
- ✅ Perfect for mixed shipments with different batches

### Flexibility
- ✅ No need to split movements by lot
- ✅ Can process multiple lots in one submission
- ✅ Maintains traceability per article

### User Experience
- ✅ Cleaner top section (less clutter)
- ✅ Logical grouping (lot info with article)
- ✅ Mobile-friendly card layout
- ✅ Clear visual hierarchy

### Data Integrity
- ✅ Per-row validation
- ✅ No global lot constraints
- ✅ Each movement has its own lot metadata

---

## 8. File Changes

### Modified Files
1. **src/components/BulkMovementModal.tsx**
   - Updated `BulkMovementItem` interface (added `lotNumber`, `lotDate`)
   - Updated `BulkMovementModalProps` onSubmit signature
   - Removed global `lotNumber` and `lotDate` state
   - Updated "Informations Communes" section (removed lot fields)
   - Added "Numéro de Lot" column to desktop table
   - Added "Date d'expiration" column to desktop table
   - Added lot fields to mobile card view
   - Updated validation to check per-row lot fields
   - Updated handleSubmit to pass only `items`, `movementType`, `operateur`

2. **src/pages/MouvementsPage.tsx**
   - Updated `handleBulkMovementSubmit` signature
   - Changed to use `item.lotNumber` and `item.lotDate` from each row
   - Updated all three movement types (Entrée, Sortie, Transfert)

---

## 9. Visual Comparison

### Desktop View
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
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ [▼]     │ [0] │ [▼]    │ [▼]  │ [___] │ [____] │ [🗑]             │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ [▼]     │ [0] │ [▼]    │ [▼]  │ [___] │ [____] │ [🗑]             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [+ Ajouter un autre article]                                              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Annuler]                    [Confirmer les Entrées (3)]                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mobile View
```
┌──────────────────────────────┐
│ Nouveau Mouvement        [X] │
├──────────────────────────────┤
│                              │
│ Informations Communes        │
│ ┌──────────────────────────┐ │
│ │ Type de Mouvement:       │ │
│ │ [Entrée] [Sortie]        │ │
│ │ [Transfert]              │ │
│ │                          │ │
│ │ Opérateur *              │ │
│ │ [Nom]                    │ │
│ └──────────────────────────┘ │
│                              │
│ Articles à Traiter (3)       │
│                              │
│ ┌──────────────────────────┐ │
│ │ Article                  │ │
│ │ [Sélectionner...]        │ │
│ │                          │ │
│ │ Quantité                 │ │
│ │ [0]        [Paire]       │ │
│ │                          │ │
│ │ Source                   │ │
│ │ [Sélectionner...]        │ │
│ │                          │ │
│ │ Destination              │ │
│ │ [Sélectionner...]        │ │
│ │                          │ │
│ │ Numéro de Lot            │ ← NEW
│ │ [LOT-2024-001]           │
│ │                          │
│ │ Date d'expiration        │ ← NEW
│ │ [dd/mm/yyyy]             │
│ │                          │
│ │ [Supprimer cet article]  │
│ └──────────────────────────┘ │
│                              │
│ ... (Row 2 and 3) ...        │
│                              │
│ [+ Ajouter un autre article] │
│                              │
├──────────────────────────────┤
│ [Annuler]                    │
│ [Confirmer les Entrées (3)]  │
└──────────────────────────────┘
```

---

## 10. Testing Checklist

- [ ] Desktop: Lot fields removed from top section
- [ ] Desktop: Operator field only in top section
- [ ] Desktop: Table shows 7 columns (Article, Qty, Source, Dest, Lot, Date, Action)
- [ ] Desktop: Lot input field works
- [ ] Desktop: Date picker works
- [ ] Mobile: Lot fields appear in each card
- [ ] Mobile: Date picker works on mobile
- [ ] Mobile: No horizontal scrolling
- [ ] Form validation: Lot fields required
- [ ] Form validation: Date fields required
- [ ] Submit: Each row uses its own lot number
- [ ] Submit: Each row uses its own lot date
- [ ] Add row: New rows have empty lot fields
- [ ] Delete row: Works correctly
- [ ] Type change: Resets to 3 rows with empty lot fields

---

## 11. Next Steps

The revised UI is ready for:
- ✅ QC workflow integration
- ✅ Per-article lot tracking
- ✅ Batch processing with mixed lots
- ✅ Traceability improvements

