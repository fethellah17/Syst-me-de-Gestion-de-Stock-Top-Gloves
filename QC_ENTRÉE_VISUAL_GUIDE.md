# QC Entrée Workflow - Visual Guide

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREATE ENTRÉE MOVEMENT                        │
│                                                                   │
│  User creates new Entrée in Bulk Movement Modal                 │
│  - Article: Gants Nitrile M                                     │
│  - Quantity: 500 paires                                         │
│  - Destination: Zone A - Rack 12                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              MOVEMENT CREATED - PENDING QC                       │
│                                                                   │
│  Status: "En attente de validation Qualité" (Yellow Badge)      │
│  Stock: NOT UPDATED YET (remains 2500)                          │
│  Inventory: Zone A - Rack 12 still shows 1500                   │
│                                                                   │
│  Mouvements Table Row:                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Date │ Article │ Type │ Qté │ Statut │ Actions          │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ ...  │ Gants.. │ Entrée│ 500 │ 🟡 En attente │ [Inspecter]│   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    User clicks "Inspecter"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              QC INSPECTION MODAL OPENS                           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Contrôle Qualité - Entrée                              │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ Article: Gants Nitrile M (GN-M-001)                    │    │
│  │ Quantité Reçue: 500 Paire                              │    │
│  │ Destination: Zone A - Rack 12                          │    │
│  │ Opérateur: Karim B.                                    │    │
│  │ Date: 2026-03-02 14:32:20                              │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ Qté Valide: [480]                                      │    │
│  │ Qté Défectueuse: [20]                                  │    │
│  │ Nom du Contrôleur: [Marie L.]                          │    │
│  │ Note de Contrôle: [Emballage endommagé sur 20 unités]  │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │ [Annuler]  [Approuver l'Entrée]                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Inspector enters:                                              │
│  - Qté Valide: 480 (items in good condition)                   │
│  - Qté Défectueuse: 20 (damaged items)                         │
│  - Controleur: Marie L.                                        │
│  - Note: Optional inspection notes                             │
│                                                                   │
│  Validation: 480 + 20 = 500 ✓ (matches total received)         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                  User clicks "Approuver l'Entrée"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              APPROVAL PROCESSED - STOCK UPDATED                  │
│                                                                   │
│  Status: "Terminé" (Green Badge)                                │
│  Stock: UPDATED with valid quantity only                        │
│    Before: 2500 Paire                                           │
│    After:  2980 Paire (2500 + 480)                              │
│                                                                   │
│  Inventory Updated:                                             │
│    Zone A - Rack 12: 1500 → 1980 (1500 + 480)                  │
│                                                                   │
│  Defective Items: Logged as metadata (NOT added to stock)       │
│    - 20 Paire marked as defective                               │
│    - Treated as permanent loss                                  │
│                                                                   │
│  Mouvements Table Row:                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Date │ Article │ Type │ Qté │ Qté Valide │ Qté Défect. │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ ...  │ Gants.. │ Entrée│ 500 │ 480 ✓     │ 20 ✗        │   │
│  │      │         │      │     │ (green)   │ (red)       │   │
│  │ Statut: 🟢 Terminé │ Approuvé par: Marie L.              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Alternative: Rejection Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│              MOVEMENT CREATED - PENDING QC                       │
│                                                                   │
│  Status: "En attente de validation Qualité" (Yellow Badge)      │
│  Stock: NOT UPDATED YET                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    User clicks "Inspecter"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              QC INSPECTION MODAL OPENS                           │
│                                                                   │
│  Inspector finds major issues:                                  │
│  - Qté Valide: 0                                                │
│  - Qté Défectueuse: 500 (entire shipment damaged)               │
│  - Controleur: Marie L.                                         │
│  - Note: Shipment arrived with water damage                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                  User clicks "Approuver l'Entrée"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              APPROVAL PROCESSED - ZERO STOCK ADDED               │
│                                                                   │
│  Status: "Terminé" (Green Badge)                                │
│  Stock: UNCHANGED (0 added)                                     │
│    Before: 2500 Paire                                           │
│    After:  2500 Paire (2500 + 0)                                │
│                                                                   │
│  Defective Items: 500 Paire logged as total loss                │
│                                                                   │
│  Mouvements Table Row:                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Qté Valide: 0 (green) │ Qté Défect.: 500 (red)          │   │
│  │ Statut: 🟢 Terminé    │ Approuvé par: Marie L.          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Status Badge Colors

### Yellow Badge - "En attente"
```
┌─────────────────────┐
│ 🟡 En attente       │
└─────────────────────┘
```
- Entrée movement waiting for QC inspection
- Stock NOT added yet
- "Inspecter" button visible
- User action required

### Green Badge - "Terminé"
```
┌─────────────────────┐
│ ✓ Terminé           │
└─────────────────────┘
```
- Movement approved and completed
- Valid quantity added to stock
- Defective quantity logged
- No further action needed

### Red Badge - "Rejeté"
```
┌─────────────────────┐
│ ✗ Rejeté            │
└─────────────────────┘
```
- Movement rejected
- Stock NOT added
- Rejection reason logged
- No further action needed

## Table Display Examples

### Before QC Approval
```
Date       │ Article        │ Type   │ Qté │ Qté Valide │ Qté Défect. │ Statut      │ Approuvé par
───────────┼────────────────┼────────┼─────┼────────────┼─────────────┼─────────────┼──────────────
2026-03-02 │ Gants Nitrile M│ Entrée │ 500 │     —      │      —      │ 🟡 En attente│ En attente
```

### After QC Approval
```
Date       │ Article        │ Type   │ Qté │ Qté Valide │ Qté Défect. │ Statut      │ Approuvé par
───────────┼────────────────┼────────┼─────┼────────────┼─────────────┼─────────────┼──────────────
2026-03-02 │ Gants Nitrile M│ Entrée │ 500 │    480 ✓   │     20 ✗    │ ✓ Terminé   │ Marie L.
```

## Key Points

1. **No Immediate Stock Update**: Entrée movements don't add to stock until QC approval
2. **Partial Acceptance**: Only valid quantity is added; defective is logged as loss
3. **Visual Feedback**: Yellow badge indicates pending action, green/red for completion
4. **Traceability**: Inspector name and notes recorded for audit trail
5. **Validation**: System ensures Valide + Défectueuse = Total Received
