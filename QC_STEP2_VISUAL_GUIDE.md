# QC Step 2: Inspection Modal - Visual Guide

## Modal Layout

### Desktop View (max-w-2xl)
```
┌─────────────────────────────────────────────────────────────┐
│ Inspection de Réception                                 [X] │
│ Vérification de la qualité et de la conformité              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ DÉTAILS DU MOUVEMENT                                        │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Article                    │ Quantité Reçue             │  │
│ │ Gants Nitrile M            │ 500 Paire                  │  │
│ │ GN-M-001                   │                            │  │
│ │                            │                            │  │
│ │ Zone de Destination        │ Opérateur                  │  │
│ │ Zone A - Rack 12           │ Karim B.                   │  │
│ │                            │                            │  │
│ │ Numéro de Lot              │ Date                       │  │
│ │ LOT-2026-03-001            │ 2026-03-02 14:32:20        │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ POINTS DE VÉRIFICATION                                      │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ☐ Aspect / Emballage Extérieur                         │  │
│ │   Vérifier l'état général et l'intégrité              │  │
│ │                                                        │  │
│ │ ☐ Conformité Quantité vs BL                           │  │
│ │   Vérifier que la quantité correspond au BL           │  │
│ │                                                        │  │
│ │ ☐ Présence Documents (FDS/BL)                         │  │
│ │   Vérifier la présence des documents obligatoires     │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ⚠ Les deux premiers points doivent être vérifiés pour      │
│   approuver                                                 │
│                                                              │
│ VALIDATION DES QUANTITÉS                                    │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Quantité Valide            Quantité Défectueuse        │  │
│ │ [500]                      [0]                         │  │
│ │ Quantité acceptée          Quantité rejetée            │  │
│ │                                                        │  │
│ │ Total Vérifié: 500 Paire                              │  │
│ │ Quantité Reçue: 500 Paire                             │  │
│ │ ✓ Quantités conformes                                 │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ NOM DU CONTRÔLEUR *                                         │
│ [Entrez votre nom]                                          │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ [Annuler]                      [Approuver la Réception]    │
└─────────────────────────────────────────────────────────────┘
```

### Mobile View (Full Width)
```
┌──────────────────────────────┐
│ Inspection de Réception  [X] │
│ Vérification de la qualité   │
├──────────────────────────────┤
│                              │
│ DÉTAILS DU MOUVEMENT         │
│ ┌──────────────────────────┐ │
│ │ Article                  │ │
│ │ Gants Nitrile M          │ │
│ │ GN-M-001                 │ │
│ │                          │ │
│ │ Quantité Reçue           │ │
│ │ 500 Paire                │ │
│ │                          │ │
│ │ Zone de Destination      │ │
│ │ Zone A - Rack 12         │ │
│ │                          │ │
│ │ Opérateur                │ │
│ │ Karim B.                 │ │
│ │                          │ │
│ │ Numéro de Lot            │ │
│ │ LOT-2026-03-001          │ │
│ │                          │ │
│ │ Date                     │ │
│ │ 2026-03-02 14:32:20      │ │
│ └──────────────────────────┘ │
│                              │
│ POINTS DE VÉRIFICATION       │
│ ┌──────────────────────────┐ │
│ │ ☐ Aspect / Emballage    │ │
│ │   Vérifier l'état...    │ │
│ │                          │ │
│ │ ☐ Conformité Quantité   │ │
│ │   Vérifier que la...    │ │
│ │                          │ │
│ │ ☐ Présence Documents    │ │
│ │   Vérifier la présence  │ │
│ └──────────────────────────┘ │
│                              │
│ VALIDATION DES QUANTITÉS     │
│ Quantité Valide              │
│ [500]                        │
│ Quantité acceptée            │
│                              │
│ Quantité Défectueuse         │
│ [0]                          │
│ Quantité rejetée             │
│                              │
│ Total Vérifié: 500 Paire     │
│ Quantité Reçue: 500 Paire    │
│ ✓ Quantités conformes        │
│                              │
│ NOM DU CONTRÔLEUR *          │
│ [Entrez votre nom]           │
│                              │
├──────────────────────────────┤
│ [Annuler]                    │
│ [Approuver la Réception]     │
└──────────────────────────────┘
```

## State Transitions

### Approval Flow
```
Pending Entrée
    ↓
Click "Inspecter" icon
    ↓
Modal opens
    ↓
Fill form
    ↓
Validation passes?
    ├─ No → Show errors
    │       ↓
    │       User fixes
    │       ↓
    │       [Loop back to validation]
    │
    └─ Yes → Click "Approuver"
             ↓
             Modal closes
             ↓
             Toast: "✓ Inspection approuvée"
             ↓
             [Step 3: Stock update - pending]
```

## Validation States

### Checkboxes
```
☐ Unchecked (default)
☑ Checked (valid)
```

### Quantity Reconciliation
```
Valid:     ✓ Quantités conformes (green)
Invalid:   ✗ Écart détecté: 50 Paire (red)
```

### Approve Button
```
Disabled:  [Approuver la Réception]  (gray, cursor: not-allowed)
Enabled:   [Approuver la Réception]  (green, cursor: pointer)
```

### Warning Banner
```
⚠ Les deux premiers points doivent être vérifiés pour approuver
(yellow background, yellow border)
```

## Conditional Elements

### Control Note Field
```
Appears when: Qté Défectueuse > 0

┌─────────────────────────────────┐
│ Note de Contrôle * (Obligatoire)│
│ ┌─────────────────────────────┐ │
│ │ Décrivez les défauts...     │ │
│ │                             │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│ Détails sur les articles        │
│ défectueux                      │
└─────────────────────────────────┘
```

## Color Scheme

| Element | Color | Usage |
|---------|-------|-------|
| Header | Foreground | Title and description |
| Details Box | Muted/50 | Background for details |
| Checkboxes | Border | Unchecked state |
| Checkboxes | Primary | Checked state |
| Valid Quantity | Green | Quantities match |
| Invalid Quantity | Red | Quantities don't match |
| Warning | Yellow | Requirements not met |
| Approve Button | Green | Enabled state |
| Approve Button | Muted | Disabled state |
| Cancel Button | Border | Secondary action |

## Responsive Breakpoints

### Desktop (≥ 768px)
- 2-column grid for details
- Side-by-side quantity inputs
- Full-width modal (max-w-2xl)

### Mobile (< 768px)
- 1-column stacked layout
- Full-width inputs
- Full-screen modal
- Scrollable content

## Accessibility Features

- ✓ Semantic HTML (labels, inputs, buttons)
- ✓ Keyboard navigation
- ✓ Focus indicators
- ✓ Error messages linked to fields
- ✓ Descriptive button labels
- ✓ Color not sole indicator (icons + text)
- ✓ Sufficient contrast ratios
- ✓ Touch-friendly targets (min 44px)

## Animation & Transitions

- Modal fade-in/out
- Button hover effects
- Input focus ring
- Smooth color transitions
- No jarring movements

## Status Indicators

### Success
- ✓ Green checkmark
- Green text
- "Quantités conformes"

### Error
- ✗ Red alert icon
- Red text
- "Écart détecté: X Paire"

### Warning
- ⚠ Yellow alert icon
- Yellow text
- "Les deux premiers points..."

## Next Phase Visual Changes

When Step 3 is implemented:
- Modal will show "Approuvé" status
- Stock will update in real-time
- Movement status changes to "Terminé"
- PDF download becomes available
- Toast shows detailed confirmation

## Status
✅ Complete - All visual elements implemented
