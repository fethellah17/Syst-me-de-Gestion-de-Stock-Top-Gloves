# Sortie Refusal - Visual Guide

## User Interface Flow

### Step 1: Mouvements Page - Identify Pending Sortie
```
┌─────────────────────────────────────────────────────────────┐
│ Mouvements                                                  │
│ Gestion des entrées, sorties et transferts                 │
├─────────────────────────────────────────────────────────────┤
│ Article: [Dropdown]  Type: [All] [Entrée] [Sortie] [Trans] │
├─────────────────────────────────────────────────────────────┤
│ Date    │ Article    │ Type   │ Qté  │ Zone  │ Statut │ Act │
├─────────┼────────────┼────────┼──────┼───────┼────────┼─────┤
│ 09/04   │ Gants M    │ Sortie │ 100  │ A1    │ En att │ [X] │ ← Click here
│ 08/04   │ Gants L    │ Entrée │ 200  │ B2    │ Termin │ [📄]│
│ 07/04   │ Masques    │ Sortie │ 500  │ C3    │ Rejeté │ [📄]│
└─────────┴────────────┴────────┴──────┴───────┴────────┴─────┘
```

### Step 2: Modal Opens - Select Refusal Type
```
┌──────────────────────────────────────────────────────────────┐
│ Refus de Sortie                                          [X] │
│ Sélectionnez le type de refus et complétez les informations │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ DÉTAILS DE LA SORTIE                                        │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Article: Gants Nitrile M (REF-001)                    │  │
│ │ Quantité: 100 pièces                                  │  │
│ │ Zone Source: A1                                       │  │
│ │ Opérateur: Jean Dupont                                │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ TYPE DE REFUS                                               │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ○ Article Défectueux (Rebut)                          │  │
│ │   Stock sera déduit pour cause de dommage             │  │
│ │                                                        │  │
│ │ ○ Erreur de Préparation (Correction)                  │  │
│ │   Retour en rayon - Pas de déduction de stock         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ [Annuler]                          [Confirmer le Refus]    │
└──────────────────────────────────────────────────────────────┘
```

### Step 3A: Select "Article Défectueux"
```
┌──────────────────────────────────────────────────────────────┐
│ Refus de Sortie                                          [X] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ DÉTAILS DE LA SORTIE                                        │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Article: Gants Nitrile M (REF-001)                    │  │
│ │ Quantité: 100 pièces                                  │  │
│ │ Zone Source: A1                                       │  │
│ │ Opérateur: Jean Dupont                                │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ TYPE DE REFUS                                               │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ◉ Article Défectueux (Rebut)                          │  │ ← Selected
│ │   Stock sera déduit pour cause de dommage             │  │
│ │                                                        │  │
│ │ ○ Erreur de Préparation (Correction)                  │  │
│ │   Retour en rayon - Pas de déduction de stock         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [RED BACKGROUND SECTION]                               │ │
│ │                                                          │ │
│ │ Nom du Contrôleur *                                    │ │
│ │ [________________________]                              │ │
│ │                                                          │ │
│ │ Motif du Refus *                                       │ │
│ │ [_________________________________________________]     │ │
│ │ [_________________________________________________]     │ │
│ │ [_________________________________________________]     │ │
│ │                                                          │ │
│ │ ⚠ Stock déduit pour cause de dommage                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ [Annuler]                          [Confirmer le Refus]    │
└──────────────────────────────────────────────────────────────┘
```

### Step 3B: Select "Erreur de Préparation"
```
┌──────────────────────────────────────────────────────────────┐
│ Refus de Sortie                                          [X] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ DÉTAILS DE LA SORTIE                                        │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Article: Gants Nitrile M (REF-001)                    │  │
│ │ Quantité: 100 pièces                                  │  │
│ │ Zone Source: A1                                       │  │
│ │ Opérateur: Jean Dupont                                │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ TYPE DE REFUS                                               │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ○ Article Défectueux (Rebut)                          │  │
│ │   Stock sera déduit pour cause de dommage             │  │
│ │                                                        │  │
│ │ ◉ Erreur de Préparation (Correction)                  │  │ ← Selected
│ │   Retour en rayon - Pas de déduction de stock         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [BLUE BACKGROUND SECTION]                              │ │
│ │                                                          │ │
│ │ Nom de l'Opérateur *                                   │ │
│ │ [________________________]                              │ │
│ │                                                          │ │
│ │ Motif de l'Erreur *                                    │ │
│ │ [_________________________________________________]     │ │
│ │ [_________________________________________________]     │ │
│ │ [_________________________________________________]     │ │
│ │                                                          │ │
│ │ ⓘ Retour en rayon - Erreur administrative             │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ [Annuler]                          [Confirmer le Refus]    │
└──────────────────────────────────────────────────────────────┘
```

### Step 4: Submit and PDF Generated
```
┌──────────────────────────────────────────────────────────────┐
│ ✓ Sortie rejetée - Article défectueux.                      │
│   PDF généré: Avis_de_Rejet_de_Sortie_Gants-Nitrile-M...   │
└──────────────────────────────────────────────────────────────┘
```

## PDF Output Examples

### PDF 1: Avis de Rejet de Sortie (Defective)
```
┌──────────────────────────────────────────────────────────────┐
│ [LOGO]  Top Gloves                    AVIS DE REJET DE SORTIE│
│ 20x20mm                               Date: 09 avril 2026    │
│                                       14:30                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ DETAILS DE LA SORTIE REJETEE                                │
│ ─────────────────────────────────────                        │
│ Article: Gants Nitrile M (REF-001)                          │
│ Date de Sortie: 09/04/2026 14:15                            │
│ Numero de Lot: LOT-2026-001                                 │
│ Date du Lot: 01/04/2026                                     │
│ Zone Source: A1                                             │
│ Operateur: Jean Dupont                                      │
│                                                              │
│ QUANTITES                                                   │
│ ─────────────────────────────────────                        │
│ Quantite Demandee: 100 pièces                               │
│ Quantite Rejetee: 100 pièces                                │
│ (100% de la quantite - REFUS TOTAL)                         │
│                                                              │
│ MOTIF DU REJET                                              │
│ ─────────────────────────────────────                        │
│ Emballage endommagé lors du transport. Plusieurs paires     │
│ présentent des déchirures. Article non conforme pour la     │
│ vente.                                                      │
│                                                              │
│ IMPACT SUR LE STOCK                                         │
│ ─────────────────────────────────────                        │
│ Stock deduit pour cause de dommage.                         │
│ Quantite: 100 pièces                                        │
│                                                              │
│ ─────────────────────────────────────                        │
│ Signature de l'Operateur:    Signature du Controleur:       │
│ ________________             ________________                │
│ Nom: Jean Dupont             Nom: Marie Martin              │
│                                                              │
│ Date de Validation: 09/04/2026 14:35                        │
│                                                              │
│ Document genere automatiquement par le Systeme de Gestion   │
│ de Stock Top Gloves le 9 avril 2026 14:35:22               │
└──────────────────────────────────────────────────────────────┘
```

### PDF 2: Note de Correction Sortie (Error)
```
┌──────────────────────────────────────────────────────────────┐
│ [LOGO]  Top Gloves              NOTE DE CORRECTION - SORTIE  │
│ 20x20mm                         Date: 09 avril 2026          │
│                                 14:30                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ DETAILS DE LA SORTIE CORRIGEE                               │
│ ─────────────────────────────────────                        │
│ Article: Gants Nitrile M (REF-001)                          │
│ Date de Sortie: 09/04/2026 14:15                            │
│ Numero de Lot: LOT-2026-001                                 │
│ Date du Lot: 01/04/2026                                     │
│ Zone Source: A1                                             │
│ Operateur: Jean Dupont                                      │
│                                                              │
│ QUANTITES                                                   │
│ ─────────────────────────────────────                        │
│ Quantite Demandee: 100 pièces                               │
│ Quantite Corrigee: 100 pièces                               │
│ (Retour en rayon - Erreur administrative)                   │
│                                                              │
│ MOTIF DE L'ERREUR                                           │
│ ─────────────────────────────────────                        │
│ Erreur de picking: mauvaise reference selectionnee. Article │
│ retourne en rayon pour correction administrative.           │
│                                                              │
│ IMPACT SUR LE STOCK                                         │
│ ─────────────────────────────────────                        │
│ Retour en rayon - Erreur administrative.                    │
│ Aucune deduction de stock.                                  │
│                                                              │
│ ─────────────────────────────────────                        │
│ Signature de l'Operateur:    Signature du Responsable:      │
│ ________________             ________________                │
│ Nom: Jean Dupont             Nom: _____________________      │
│                                                              │
│ Date de Validation: 09/04/2026 14:35                        │
│                                                              │
│ Document genere automatiquement par le Systeme de Gestion   │
│ de Stock Top Gloves le 9 avril 2026 14:35:22               │
└──────────────────────────────────────────────────────────────┘
```

## Color Coding

### Modal Sections
- **Red Background**: Article Défectueux (stock deduction)
- **Blue Background**: Erreur de Préparation (no deduction)

### Buttons
- **Red X Button**: Refusal action (appears on Sortie movements)
- **Red "Confirmer"**: Confirms refusal submission

### Text Colors
- **Red Text**: Defective/rejected items
- **Green Text**: Correction/return to shelf
- **Gray Text**: Discreet footer information

## Interaction States

### Button States
```
[Refuser la Sortie] - Normal state (clickable)
[Refuser la Sortie] - Hover state (highlighted)
[Confirmer le Refus] - Disabled (until form valid)
[Confirmer le Refus] - Enabled (all fields filled)
```

### Form States
```
Initial: No refusal type selected
        → Fields hidden
        → Submit button disabled

After Selection: Refusal type selected
                → Dynamic fields appear
                → Submit button enabled (if fields filled)

Validation Error: Missing required fields
                 → Error messages appear
                 → Submit button disabled
                 → Modal stays open
```

## Responsive Design

### Desktop (≥768px)
- Modal: 2-column layout for signatures
- Full width input fields
- Side-by-side radio options

### Mobile (<768px)
- Modal: Full width, scrollable
- Stacked layout for signatures
- Full width input fields
- Radio options stack vertically

## Accessibility

- **Radio Buttons**: Keyboard navigable (Tab, Arrow keys)
- **Labels**: Associated with form inputs
- **Error Messages**: Clear, descriptive text
- **Color**: Not sole indicator (text + icons)
- **Contrast**: WCAG AA compliant
