# STEP 2 REVISED: QUICK REFERENCE

## What Changed

### Top Section
- ❌ Removed: "Numéro de Lot" field
- ❌ Removed: "Date du Lot" field
- ✅ Kept: "Type de Mouvement" buttons
- ✅ Kept: "Opérateur" field

### Table Columns (Desktop)
```
Before: [Article] [Qty] [Source] [Dest] [Action]
After:  [Article] [Qty] [Source] [Dest] [Lot #] [Expiry] [Action]
```

### Mobile Cards
- ✅ Added: "Numéro de Lot" field
- ✅ Added: "Date d'expiration" field

### State Structure
```typescript
// Before
interface BulkMovementItem {
  id: string;
  articleId: string;
  quantity: number;
  selectedUnit: string;
  emplacementSource?: string;
  emplacementDestination?: string;
  qc_status: "pending" | "approved" | "rejected";
}

// After
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
```

### onSubmit Signature
```typescript
// Before
onSubmit(items, movementType, lotNumber, lotDate, operateur)

// After
onSubmit(items, movementType, operateur)
// Lot info comes from items[i].lotNumber and items[i].lotDate
```

---

## Key Features

| Feature | Status |
|---------|--------|
| Per-row lot number | ✅ |
| Per-row expiry date | ✅ |
| Desktop table columns | ✅ |
| Mobile card fields | ✅ |
| Form validation | ✅ |
| Date picker | ✅ |
| Mixed shipments | ✅ |
| Traceability | ✅ |

---

## File Changes

### src/components/BulkMovementModal.tsx
- Updated `BulkMovementItem` interface
- Updated `BulkMovementModalProps` onSubmit signature
- Removed global `lotNumber` and `lotDate` state
- Updated "Informations Communes" section
- Added lot columns to desktop table
- Added lot fields to mobile cards
- Updated validation logic
- Updated handleSubmit call

### src/pages/MouvementsPage.tsx
- Updated `handleBulkMovementSubmit` signature
- Changed to use `item.lotNumber` and `item.lotDate`
- Applied to all movement types

---

## Usage Example

### Before
```typescript
// All items share the same lot
onSubmit(
  items,                    // 3 items
  "Entrée",
  "LOT-2024-001",          // Global lot
  new Date("2025-12-31"),  // Global date
  "Karim B."
)
```

### After
```typescript
// Each item has its own lot
onSubmit(
  [
    { 
      articleId: "1", 
      quantity: 500, 
      lotNumber: "LOT-2024-001",    // Item 1 lot
      lotDate: new Date("2025-12-31")
    },
    { 
      articleId: "2", 
      quantity: 200, 
      lotNumber: "LOT-2024-002",    // Item 2 lot
      lotDate: new Date("2025-11-30")
    },
    { 
      articleId: "3", 
      quantity: 100, 
      lotNumber: "LOT-2024-003",    // Item 3 lot
      lotDate: new Date("2025-10-31")
    }
  ],
  "Entrée",
  "Karim B."
)
```

---

## Validation

### Required Fields (Per Row)
- ✅ Article
- ✅ Quantity
- ✅ Unit
- ✅ Destination (or Source for Sortie/Transfert)
- ✅ **Lot Number** (NEW)
- ✅ **Expiry Date** (NEW)

### Error Display
- Red border on invalid fields
- Error message below field
- Per-row validation

---

## Mobile Responsiveness

### Desktop (≥768px)
- Horizontal table layout
- 7 columns visible
- Sticky header
- Compact spacing

### Mobile (<768px)
- Vertical card layout
- Full-width inputs (h-12)
- Lot fields in each card
- Date picker integrated

---

## Benefits

1. **Precision**: Each article has its own lot number and date
2. **Flexibility**: Handle mixed shipments with different batches
3. **Traceability**: Complete per-article lot tracking
4. **Simplicity**: Cleaner top section, logical grouping
5. **Compliance**: Medical/regulatory lot tracking requirements

---

## Testing Checklist

- [ ] Top section: Lot fields removed
- [ ] Top section: Operator field only
- [ ] Desktop: 7 columns visible
- [ ] Desktop: Lot input works
- [ ] Desktop: Date picker works
- [ ] Mobile: Lot fields in cards
- [ ] Mobile: Date picker works
- [ ] Validation: Lot required
- [ ] Validation: Date required
- [ ] Submit: Uses per-row lot info
- [ ] Add row: Empty lot fields
- [ ] Delete row: Works correctly

---

## Next Steps

Ready for:
- ✅ QC workflow integration
- ✅ Batch processing
- ✅ Traceability reports
- ✅ Compliance audits

