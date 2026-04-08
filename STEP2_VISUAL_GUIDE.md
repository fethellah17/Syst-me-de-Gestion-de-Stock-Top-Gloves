# STEP 2: BULK INTERFACE - VISUAL GUIDE

## Desktop View (95vw × 90vh)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Nouveau Mouvement                                                        [X] │ ← Sticky Header
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Informations Communes                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Type de Mouvement: [Entrée] [Sortie] [Transfert]                   │   │
│  │                                                                     │   │
│  │ Numéro de Lot *    │ Date du Lot *      │ Opérateur *             │   │
│  │ [LOT-2024-001]     │ [dd/mm/yyyy]       │ [Nom]                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Articles à Traiter (3 articles)                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Article │ Quantité │ Source │ Destination │ Action                 │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ [▼]     │ [0] [▼]  │ [▼]    │ [▼]         │ [🗑]                   │   │
│  │         │ = 0 Paire│        │             │                        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ [▼]     │ [0] [▼]  │ [▼]    │ [▼]         │ [🗑]                   │   │
│  │         │ = 0 Paire│        │             │                        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ [▼]     │ [0] [▼]  │ [▼]    │ [▼]         │ [🗑]                   │   │
│  │         │ = 0 Paire│        │             │                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [+ Ajouter un autre article]                                              │
│                                                                             │
│  ℹ️ Tous les articles partageront le même numéro et date de lot.           │
│                                                                             │
│  ← Scrollable Content Area →                                               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Annuler]                    [Confirmer les Entrées (3)]                    │ ← Sticky Footer
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Mobile View (Full Screen)

```
┌──────────────────────────────┐
│ Nouveau Mouvement        [X] │ ← Sticky Header
├──────────────────────────────┤
│                              │
│ Informations Communes        │
│ ┌──────────────────────────┐ │
│ │ Type de Mouvement:       │ │
│ │ [Entrée] [Sortie]        │ │
│ │ [Transfert]              │ │
│ │                          │ │
│ │ Numéro de Lot *          │ │
│ │ [LOT-2024-001]           │ │
│ │                          │ │
│ │ Date du Lot *            │ │
│ │ [dd/mm/yyyy]             │ │
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
│ │ = 0 Paire                │ │
│ │                          │ │
│ │ Source                   │ │
│ │ [Sélectionner...]        │ │
│ │ Stock: 0 Paire           │ │
│ │                          │ │
│ │ Destination              │ │
│ │ [Sélectionner...]        │ │
│ │                          │ │
│ │ [Supprimer cet article]  │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ Article                  │ │
│ │ [Sélectionner...]        │ │
│ │ ... (Row 2)              │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ Article                  │ │
│ │ [Sélectionner...]        │ │
│ │ ... (Row 3)              │ │
│ └──────────────────────────┘ │
│                              │
│ [+ Ajouter un autre article] │
│                              │
│ ℹ️ Tous les articles...      │
│                              │
│ ← Scrollable Content Area →  │
│                              │
├──────────────────────────────┤
│ [Annuler]                    │
│ [Confirmer les Entrées (3)]  │ ← Sticky Footer
└──────────────────────────────┘
```

---

## Data Flow

### Initial State
```
items = [
  { id: "1", articleId: "", quantity: 0, selectedUnit: "", 
    emplacementSource: "", emplacementDestination: "", qc_status: "pending" },
  { id: "2", articleId: "", quantity: 0, selectedUnit: "", 
    emplacementSource: "", emplacementDestination: "", qc_status: "pending" },
  { id: "3", articleId: "", quantity: 0, selectedUnit: "", 
    emplacementSource: "", emplacementDestination: "", qc_status: "pending" },
]
```

### After User Input (Example)
```
items = [
  { 
    id: "1", 
    articleId: "1",                    // Gants Nitrile M
    quantity: 500, 
    selectedUnit: "Boîte",             // Entry unit
    emplacementSource: "",             // Not needed for Entrée
    emplacementDestination: "Zone A - Rack 12",
    qc_status: "pending"               // Ready for QC workflow
  },
  { 
    id: "2", 
    articleId: "2",                    // Gants Latex S
    quantity: 200, 
    selectedUnit: "Paire",             // Exit unit
    emplacementSource: "",
    emplacementDestination: "Zone B - Rack 03",
    qc_status: "pending"
  },
  { 
    id: "3", 
    articleId: "",                     // Empty row
    quantity: 0, 
    selectedUnit: "",
    emplacementSource: "",
    emplacementDestination: "",
    qc_status: "pending"
  },
]
```

### After Add Row
```
items = [
  // ... existing 3 rows ...
  { 
    id: "4", 
    articleId: "", 
    quantity: 0, 
    selectedUnit: "", 
    emplacementSource: "", 
    emplacementDestination: "", 
    qc_status: "pending"               // New row with pending status
  }
]
```

---

## Key Features

### 1. Responsive Design
- **Desktop**: Horizontal table with sticky header/footer
- **Mobile**: Vertical card stack with full-width inputs
- **Breakpoint**: 768px (md)

### 2. Real-Time Feedback
- Unit conversion display: "= 1500 Paire"
- Stock availability: "Stock disponible: 1500 Paire"
- Stock exceeded warning: Red text
- Row counter: "3 articles"

### 3. Form Validation
- Required fields marked with *
- Error borders (red) on invalid fields
- Quantity validation (> 0)
- Stock availability check
- Source ≠ Destination for Transfert

### 4. User Interactions
- Add row: "+ Ajouter un autre article"
- Delete row: Trash icon (disabled for single row)
- Type change: Confirmation dialog
- Movement type buttons: Color-coded (Green/Orange/Blue)

### 5. QC Status Tracking
- All rows start with `qc_status: "pending"`
- Ready for QC workflow integration in STEP 3
- Maintained through form lifecycle

---

## Accessibility Features

- ✅ Proper label associations
- ✅ Error messages linked to fields
- ✅ Keyboard navigation support
- ✅ Touch-friendly input sizes (h-12 on mobile)
- ✅ Clear visual hierarchy
- ✅ Color + text for status indication

---

## Performance Optimizations

- ✅ Sticky positioning for header/footer
- ✅ Efficient re-renders with React hooks
- ✅ Lazy loading of article/location data
- ✅ Memoized calculations for conversions
- ✅ Minimal DOM updates on state changes

