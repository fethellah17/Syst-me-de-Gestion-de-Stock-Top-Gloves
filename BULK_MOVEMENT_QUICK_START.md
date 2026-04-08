# Bulk Movement Entry - Quick Start Guide

## What's New?

A new **"Réception en Masse"** (Bulk Receipt) button on the Mouvements page that lets you receive multiple items in one operation.

---

## How to Use (5 Steps)

### Step 1: Open the Modal
Click the green **"Réception en Masse"** button in the Mouvements page header.

```
[Réception en Masse] [Nouveau Mouvement]
     ↑ Click here
```

### Step 2: Fill Common Information
These fields apply to ALL items you're receiving:

- **Numéro de Lot** (Lot Number): `LOT-2024-001`
- **Date du Lot** (Lot Date): `30/03/2024` (use calendar picker)
- **Opérateur** (Operator): `Jean Dupont`

### Step 3: Add Items
For each item you're receiving:

1. **Select Article**: Choose from dropdown (e.g., "Seringue 10ml (REF-001)")
2. **Enter Quantity**: Type the amount (e.g., `50`)
3. **Select Unit**: Choose entry or exit unit (e.g., `boîte`)
4. **Choose Location**: Select where to store it (e.g., `Zone A - Étagère 1`)

### Step 4: Add More Items (Optional)
Click **"+ Ajouter un autre article"** to add another row.

Repeat Step 3 for each additional item.

### Step 5: Submit
Click **"Confirmer la Réception (X articles)"** where X is the number of items.

---

## What Happens Next?

✓ System validates all fields
✓ Creates individual movements for each item
✓ All movements share the same Lot Number and Date
✓ Stock updates for all articles
✓ Locations update with new quantities
✓ Toast notification confirms success
✓ Modal closes and form resets

---

## Example Workflow

### Receiving 3 items from supplier

**Step 1: Open Modal**
- Click "Réception en Masse"

**Step 2: Common Info**
- Lot: `LOT-2024-001`
- Date: `30/03/2024`
- Operator: `Jean Dupont`

**Step 3: Item 1**
- Article: `Seringue 10ml (REF-001)`
- Qty: `50`
- Unit: `boîte`
- Location: `Zone A - Étagère 1`

**Step 4: Add Item 2**
- Click "+ Ajouter un autre article"
- Article: `Aiguille 25G (REF-002)`
- Qty: `100`
- Unit: `boîte`
- Location: `Zone B - Étagère 2`

**Step 5: Add Item 3**
- Click "+ Ajouter un autre article"
- Article: `Gaze stérile (REF-003)`
- Qty: `200`
- Unit: `paquet`
- Location: `Zone C - Étagère 1`

**Step 6: Submit**
- Click "Confirmer la Réception (3 articles)"
- See success message: "✓ 3 article(s) reçu(s) avec succès. Lot: LOT-2024-001"

---

## Key Features

### 1. Shared Lot Information
All items in one batch share:
- Same Lot Number
- Same Lot Date
- Same Operator

This ensures complete traceability.

### 2. Flexible Locations
Each item can go to a different location:
- Item 1 → Zone A
- Item 2 → Zone B
- Item 3 → Zone C

### 3. Unit Conversion
If you enter quantities in entry units, they're automatically converted to exit units:
- You enter: `50 boîtes`
- System stores: `500 pièces` (if 1 boîte = 10 pièces)

### 4. Validation
The system checks:
- All required fields are filled
- Quantities are greater than 0
- Articles are selected
- Locations are selected

### 5. Dynamic Rows
- Start with 1 row
- Add as many rows as needed
- Delete rows you don't need (except the last one)

---

## Common Tasks

### Add a Single Item
1. Open modal
2. Fill common info
3. Fill item row
4. Click "Confirmer la Réception (1 article)"

### Add Multiple Items
1. Open modal
2. Fill common info
3. Fill first item
4. Click "+ Ajouter un autre article"
5. Fill second item
6. Repeat steps 4-5 for more items
7. Click "Confirmer la Réception (X articles)"

### Remove an Item
1. Click the trash icon (🗑️) on the row you want to remove
2. Row is deleted
3. Item count updates

### Change an Item
1. Click on the field you want to change
2. Select new value
3. Changes are saved automatically

### Cancel Everything
1. Click "Annuler" button
2. Modal closes without saving
3. All changes are discarded

---

## Tips & Tricks

### Tip 1: Batch by Supplier
Use the same Lot Number for all items from one supplier shipment.

### Tip 2: Date Picker
Click the calendar icon to easily select the lot date.

### Tip 3: Searchable Dropdown
Start typing in the Article dropdown to search for items.

### Tip 4: Unit Selection
The system auto-selects the entry unit when you choose an article. Change it if needed.

### Tip 5: Location Codes
Locations show both name and code (e.g., "Zone A - Étagère 1 (ZA-E1)").

---

## Troubleshooting

### Problem: "Numéro de lot requis" error
**Solution**: Fill in the Lot Number field at the top.

### Problem: "Article requis" error
**Solution**: Select an article from the dropdown for that row.

### Problem: "Quantité requise" error
**Solution**: Enter a quantity greater than 0.

### Problem: "Emplacement requis" error
**Solution**: Select a location from the dropdown for that row.

### Problem: Can't delete the last row
**Solution**: You must have at least one row. Add a new row first, then delete the old one.

### Problem: Unit not showing
**Solution**: Make sure you've selected an article first. The unit dropdown appears after article selection.

---

## Comparison: Speed

### Old Way (10 items)
- Open modal 10 times
- Fill all fields 10 times
- Submit 10 times
- **Time: ~10 minutes**

### New Way (10 items)
- Open modal 1 time
- Fill common info 1 time
- Add 10 rows
- Submit 1 time
- **Time: ~1 minute**

**Result: 10x faster** ✓

---

## What Gets Created?

When you submit a bulk receipt with 3 items:

**3 separate movements are created:**
1. Movement 1: Seringue 10ml, 50 boîtes, Lot: LOT-2024-001
2. Movement 2: Aiguille 25G, 100 boîtes, Lot: LOT-2024-001
3. Movement 3: Gaze stérile, 200 paquets, Lot: LOT-2024-001

**All movements:**
- Share the same Lot Number
- Share the same Lot Date
- Share the same Operator
- Appear in the Mouvements table
- Update the stock for each article
- Update the location occupancy

---

## Next Steps

After receiving items:

1. **Check Stock**: Verify stock updated in Articles page
2. **Check Locations**: Verify locations updated in Emplacements page
3. **Quality Control**: If items need QC, go to Contrôle Qualité page
4. **View Movements**: See all movements in the Mouvements table

---

## Questions?

Refer to:
- **BULK_MOVEMENT_FEATURE.md** - Detailed feature documentation
- **BULK_MOVEMENT_VISUAL_GUIDE.md** - Visual diagrams and layouts
- **MouvementsPage.tsx** - Implementation code
- **BulkMovementModal.tsx** - Component code
