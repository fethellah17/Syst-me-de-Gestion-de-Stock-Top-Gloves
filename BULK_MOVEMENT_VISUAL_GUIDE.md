# Bulk Movement Entry - Visual Guide

## Button Location

```
┌─────────────────────────────────────────────────────────────┐
│ Mouvements                                                  │
│ Gestion des entrées, sorties et transferts                 │
│                                                             │
│                    [Réception en Masse] [Nouveau Mouvement] │
│                         ↑                                    │
│                    NEW BUTTON                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Modal Layout

### Header Section (Common Data)

```
┌─────────────────────────────────────────────────────────────┐
│ Réception en Masse (Multi-Articles)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─ Informations Communes ──────────────────────────────┐   │
│ │                                                      │   │
│ │ Numéro de Lot *          │ Date du Lot *            │   │
│ │ [LOT-2024-001________]   │ [30/03/2024 ▼]          │   │
│ │                                                      │   │
│ │ Opérateur *                                          │   │
│ │ [Jean Dupont_________________________]               │   │
│ │                                                      │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Items List Section

```
┌─────────────────────────────────────────────────────────────┐
│ Articles à Recevoir                              3 article(s)│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Article │ Quantité │ Emplacement │ Action                  │
│ ────────┼──────────┼─────────────┼────────                 │
│                                                             │
│ ┌─ Row 1 ──────────────────────────────────────────────┐   │
│ │ [Seringue 10ml (REF-001) ▼]                          │   │
│ │ [50] [boîte ▼]  [Zone A - Étagère 1 ▼]  [🗑️]       │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─ Row 2 ──────────────────────────────────────────────┐   │
│ │ [Aiguille 25G (REF-002) ▼]                           │   │
│ │ [100] [boîte ▼]  [Zone B - Étagère 2 ▼]  [🗑️]      │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─ Row 3 ──────────────────────────────────────────────┐   │
│ │ [Gaze stérile (REF-003) ▼]                           │   │
│ │ [200] [paquet ▼]  [Zone C - Étagère 1 ▼]  [🗑️]     │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ + Ajouter un autre article                          │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Info Box & Actions

```
┌─────────────────────────────────────────────────────────────┐
│ ℹ️ Tous les articles reçus partageront le même numéro et   │
│    date de lot. Chaque article créera un mouvement d'entrée │
│    séparé.                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Annuler]  [Confirmer la Réception (3 articles)]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Row Structure (Detailed)

### Single Row Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│ Article Selection                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Seringue 10ml (REF-001) ▼]                             │ │
│ │ Searchable dropdown showing all articles                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Quantity & Unit                                             │
│ ┌──────────────────┐  ┌──────────────────┐                │
│ │ [50_________]    │  │ [boîte ▼]        │                │
│ │ Quantity input   │  │ Unit selector    │                │
│ └──────────────────┘  └──────────────────┘                │
│                                                             │
│ Emplacement (Location)                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Zone A - Étagère 1 ▼]                                  │ │
│ │ Dropdown of all available locations                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Delete Action                                               │
│ ┌──────┐                                                    │
│ │ [🗑️] │  Trash icon - removes this row                   │
│ └──────┘  (Disabled if only one row)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Workflow Diagram

```
START
  │
  ├─→ Click "Réception en Masse"
  │     │
  │     └─→ Modal Opens (1 empty row)
  │
  ├─→ Fill Common Data
  │     ├─ Lot Number: LOT-2024-001
  │     ├─ Lot Date: 30/03/2024
  │     └─ Operator: Jean Dupont
  │
  ├─→ Add Items
  │     ├─ Row 1: Seringue 10ml, 50 boîtes, Zone A
  │     ├─ Row 2: Aiguille 25G, 100 boîtes, Zone B
  │     │   (Click "+ Ajouter un autre article")
  │     └─ Row 3: Gaze stérile, 200 paquets, Zone C
  │       (Click "+ Ajouter un autre article")
  │
  ├─→ Validate
  │     ├─ Check all fields filled
  │     ├─ Check quantities > 0
  │     └─ Check articles selected
  │
  ├─→ Submit
  │     ├─ Click "Confirmer la Réception (3 articles)"
  │     │
  │     └─→ Process Each Item
  │           ├─ Item 1: Create Movement (Lot: LOT-2024-001)
  │           ├─ Item 2: Create Movement (Lot: LOT-2024-001)
  │           └─ Item 3: Create Movement (Lot: LOT-2024-001)
  │
  ├─→ Update System
  │     ├─ Update stock for all 3 articles
  │     ├─ Update location occupancy
  │     └─ Recalculate capacities
  │
  ├─→ Feedback
  │     ├─ Toast: "✓ 3 article(s) reçu(s) avec succès"
  │     ├─ Modal closes
  │     └─ Form resets
  │
  └─→ END (Movements visible in table)
```

---

## Validation Flow

```
User Clicks "Confirmer la Réception"
  │
  ├─→ Validate Common Data
  │     ├─ Lot Number empty? → ERROR
  │     ├─ Lot Date empty? → ERROR
  │     └─ Operator empty? → ERROR
  │
  ├─→ Validate Each Item
  │     ├─ Article not selected? → ERROR
  │     ├─ Quantity ≤ 0? → ERROR
  │     ├─ Unit not selected? → ERROR
  │     └─ Emplacement not selected? → ERROR
  │
  ├─→ Any Errors?
  │     ├─ YES → Show error messages, stay in modal
  │     └─ NO → Proceed to submission
  │
  └─→ Submit & Process
```

---

## Error Display

### Field-Level Errors

```
┌─────────────────────────────────────────────────────────────┐
│ Numéro de Lot *                                             │
│ [_________________________]                                 │
│ ⚠️ Numéro de lot requis                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Row 1 - Article                                             │
│ [Sélectionner... ▼]                                         │
│ ⚠️ Article requis                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Row 1 - Quantity                                            │
│ [_________]                                                 │
│ ⚠️ Quantité requise                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Success Scenario

### Before Submission
```
Modal shows:
- 3 items ready
- All fields filled
- Button: "Confirmer la Réception (3 articles)"
```

### After Submission
```
Toast Notification:
┌─────────────────────────────────────────────────────────────┐
│ ✓ 3 article(s) reçu(s) avec succès. Lot: LOT-2024-001      │
└─────────────────────────────────────────────────────────────┘

Movements Table:
┌─────────────────────────────────────────────────────────────┐
│ Date/Heure │ Article │ Type │ Qte │ Lot │ Emplacement │ ... │
├─────────────────────────────────────────────────────────────┤
│ 30/03 14:25 │ Seringue 10ml │ Entrée │ 50 │ LOT-2024-001 │ Zone A │
│ 30/03 14:25 │ Aiguille 25G │ Entrée │ 100 │ LOT-2024-001 │ Zone B │
│ 30/03 14:25 │ Gaze stérile │ Entrée │ 200 │ LOT-2024-001 │ Zone C │
└─────────────────────────────────────────────────────────────┘
```

---

## Comparison: Old vs New

### Old Way (10 items)
```
1. Click "Nouveau Mouvement"
2. Select Article 1, fill all fields, submit
3. Click "Nouveau Mouvement"
4. Select Article 2, fill all fields, submit
5. ... repeat 8 more times ...
13. Click "Nouveau Mouvement"
14. Select Article 10, fill all fields, submit

⏱️ Time: ~10 minutes
```

### New Way (10 items)
```
1. Click "Réception en Masse"
2. Fill Lot Number, Date, Operator (once)
3. Add Article 1 row
4. Add Article 2 row
5. ... add 8 more rows ...
11. Add Article 10 row
12. Click "Confirmer la Réception (10 articles)"

⏱️ Time: ~1 minute
```

**Efficiency Gain: 10x faster** ✓

---

## Key Features Highlighted

### 1. Shared Lot Information
```
All items in one batch:
├─ Lot Number: LOT-2024-001
├─ Lot Date: 30/03/2024
└─ Operator: Jean Dupont

Ensures complete traceability
```

### 2. Dynamic Row Management
```
Start: 1 row
Add: + Ajouter un autre article
Result: 2 rows
Add: + Ajouter un autre article
Result: 3 rows
...
Unlimited rows possible
```

### 3. Flexible Locations
```
Item 1 → Zone A - Étagère 1
Item 2 → Zone B - Étagère 2
Item 3 → Zone C - Étagère 1

Each item can go to different location
```

### 4. Unit Conversion
```
User enters: 50 boîtes (entry unit)
System converts: 50 × 10 = 500 pièces (exit unit)
Stored in: Exit unit (base unit)
```

### 5. Validation
```
Before submission:
✓ All common fields filled
✓ All items have articles
✓ All quantities > 0
✓ All units selected
✓ All locations selected
```

---

## Mobile Responsiveness

The modal is designed to work on mobile devices:

```
Mobile View (Stacked Layout):
┌──────────────────────────┐
│ Réception en Masse       │
├──────────────────────────┤
│ Lot Number               │
│ [________________]       │
│                          │
│ Lot Date                 │
│ [30/03/2024 ▼]          │
│                          │
│ Operator                 │
│ [Jean Dupont_____]       │
│                          │
│ Article 1                │
│ [Seringue 10ml ▼]        │
│ Qty: [50] Unit: [boîte ▼]│
│ Location: [Zone A ▼]     │
│ [🗑️]                     │
│                          │
│ + Ajouter un article     │
│                          │
│ [Annuler] [Confirmer]    │
└──────────────────────────┘
```

---

## Integration Points

### With Existing Systems

1. **Stock Management**
   - Updates article stock for each item
   - Reflects in real-time inventory

2. **Location Management**
   - Updates location occupancy
   - Recalculates available capacity

3. **Movement History**
   - Creates individual movement records
   - All share same lot for traceability

4. **Quality Control** (if applicable)
   - Movements can be sent to QC
   - All items from batch share lot info

5. **Reporting**
   - Movements appear in reports
   - Lot number enables batch tracking
