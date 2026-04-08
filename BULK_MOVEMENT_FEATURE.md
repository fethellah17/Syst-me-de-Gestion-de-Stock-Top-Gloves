# Bulk Movement Entry (Multi-Item Receipts) - Feature Documentation

## Overview
The Bulk Movement Entry feature allows users to receive multiple items in a single operation, sharing the same Lot Number and Lot Date. This dramatically improves efficiency when receiving shipments with multiple articles.

**Goal**: Receive 10 different items in 1 minute instead of opening the modal 10 times.

---

## Feature Architecture

### Components
1. **BulkMovementModal** (`src/components/BulkMovementModal.tsx`)
   - New dedicated component for bulk operations
   - Handles multi-item entry with dynamic row management
   - Validates all items before submission

2. **MouvementsPage** (`src/pages/MouvementsPage.tsx`)
   - Integrated with new "Réception en Masse" button
   - Handles bulk submission logic
   - Creates individual movements for each item

---

## User Interface

### Header Section (Common Data)
Located at the top of the modal, these fields apply to ALL items in the session:

- **Numéro de Lot** (Lot Number) - Required
  - Shared across all items
  - Ensures traceability

- **Date du Lot** (Lot Date) - Required
  - Calendar picker for easy selection
  - Shared across all items
  - Medical device compliance requirement

- **Opérateur** (Operator) - Required
  - Name of the person receiving the items
  - Shared across all items

### Dynamic Items List (The Rows)

Each row contains:

1. **Article Selection** (Searchable Dropdown)
   - Shows: `Article Name (Reference)`
   - Auto-selects entry unit when article is chosen
   - Validates that article is selected

2. **Quantity & Unit**
   - Quantity input (decimal support)
   - Unit dropdown (Entry Unit / Exit Unit)
   - Auto-converts between units if needed
   - Validates quantity > 0

3. **Target Rack/Emplacement** (Location Select)
   - Dropdown of all available locations
   - Each item can go to a different location
   - Validates that location is selected

4. **Delete Button** (Trash Icon)
   - Removes the row from the list
   - Disabled if only one row remains
   - Prevents accidental deletion of all items

### Action Buttons

1. **+ Ajouter un autre article** (Add Another Article)
   - Dashed border button
   - Appends a new empty row
   - Unlimited rows can be added

2. **Confirmer la Réception** (Confirm Receipt)
   - Shows count: "Confirmer la Réception (X articles)"
   - Validates all fields before submission
   - Creates individual movements for each item

---

## Logic & Submission

### Validation
Before submission, the system validates:

- **Common Data**:
  - Lot Number is not empty
  - Lot Date is selected
  - Operator name is provided

- **Each Item**:
  - Article is selected
  - Quantity > 0
  - Unit is selected
  - Emplacement is selected

### Processing
When "Confirmer la Réception" is clicked:

1. **Loop through all items**
   - For each item, create a separate movement record
   - Type: Always "Entrée" (Receipt)

2. **Shared Lot Information**
   - All movements share the SAME Lot Number
   - All movements share the SAME Lot Date
   - Ensures traceability across the batch

3. **Unit Conversion**
   - If user selected entry unit, convert to exit unit
   - Conversion formula: `quantity * facteurConversion`
   - Stored in exit unit (base unit) for consistency

4. **Stock Updates**
   - Each item updates the article's stock
   - Location occupancy is recalculated
   - Real-time inventory reflects changes

5. **Success Feedback**
   - Toast notification: "✓ X article(s) reçu(s) avec succès. Lot: [LotNumber]"
   - Modal closes automatically
   - Form resets for next batch

### Quality Control Integration
- If articles require QC (based on `requiresQC` flag):
  - Movements are created with QC pending status
  - User can navigate to QC page to validate
  - All items from the batch share the same lot for traceability

---

## Code Implementation

### BulkMovementModal Component

```typescript
interface BulkMovementItem {
  id: string;                    // Unique row ID
  articleId: string;             // Selected article ID
  quantity: number;              // User-entered quantity
  selectedUnit: string;          // Entry or Exit unit
  emplacementDestination: string; // Target location
}

interface BulkMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: any[];
  emplacements: any[];
  onSubmit: (items: BulkMovementItem[], lotNumber: string, lotDate: Date, operateur: string) => void;
}
```

### Key Functions

**addRow()**
- Generates unique ID for new row
- Appends empty item to items array
- Allows unlimited rows

**removeRow(id)**
- Removes item by ID
- Prevents deletion if only one row exists
- Maintains data integrity

**updateItem(id, field, value)**
- Updates specific field in item
- Auto-sets unit when article changes
- Clears validation errors on change

**validateForm()**
- Validates all common fields
- Validates each item row
- Returns boolean and sets error messages
- Prevents submission with errors

**handleSubmit()**
- Calls validateForm()
- Passes data to parent onSubmit handler
- Resets form after submission

### MouvementsPage Integration

**handleOpenBulkModal()**
- Opens the bulk modal
- Initializes empty state

**handleSubmitBulkMovement()**
- Receives items, lotNumber, lotDate, operateur
- Loops through each item
- Creates individual movements with:
  - Shared lot information
  - Converted quantities
  - Proper unit tracking
- Recalculates occupancies
- Shows success/error toast

---

## User Workflow Example

### Scenario: Receiving 3 items from supplier

1. **Click "Réception en Masse" button**
   - Modal opens with one empty row

2. **Fill Common Data**
   - Lot Number: `LOT-2024-001`
   - Lot Date: `2024-03-30`
   - Operator: `Jean Dupont`

3. **Add First Item**
   - Article: `Seringue 10ml (REF-001)`
   - Quantity: `50`
   - Unit: `boîte` (entry unit)
   - Emplacement: `Zone A - Étagère 1`

4. **Add Second Item**
   - Click "+ Ajouter un autre article"
   - Article: `Aiguille 25G (REF-002)`
   - Quantity: `100`
   - Unit: `boîte`
   - Emplacement: `Zone B - Étagère 2`

5. **Add Third Item**
   - Click "+ Ajouter un autre article"
   - Article: `Gaze stérile (REF-003)`
   - Quantity: `200`
   - Unit: `paquet`
   - Emplacement: `Zone C - Étagère 1`

6. **Submit**
   - Click "Confirmer la Réception (3 articles)"
   - System validates all fields
   - Creates 3 separate movements
   - All share: `LOT-2024-001` and `2024-03-30`
   - Toast: "✓ 3 article(s) reçu(s) avec succès. Lot: LOT-2024-001"

7. **Result**
   - 3 movements appear in the table
   - Stock updated for all 3 articles
   - Locations updated with new quantities
   - Ready for QC if needed

---

## Benefits

1. **Speed**: Receive 10 items in 1 minute vs 10 minutes
2. **Accuracy**: Single lot number ensures traceability
3. **Consistency**: All items share same lot date
4. **Flexibility**: Each item can go to different location
5. **Validation**: Prevents incomplete or invalid entries
6. **Compliance**: Maintains medical device traceability requirements

---

## Technical Details

### Files Modified
- `src/pages/MouvementsPage.tsx` - Added bulk modal integration
- `src/components/BulkMovementModal.tsx` - New component

### Files Created
- `src/components/BulkMovementModal.tsx` - Bulk movement modal component

### Dependencies
- React hooks (useState)
- date-fns (date formatting)
- Existing UI components (Modal, Calendar, Popover)
- UnitBadge component for unit display

### Data Flow
```
User Input
    ↓
BulkMovementModal (validation)
    ↓
handleSubmitBulkMovement (processing)
    ↓
Loop: addMouvement for each item
    ↓
recalculateAllOccupancies
    ↓
Toast notification
    ↓
Modal closes, form resets
```

---

## Future Enhancements

1. **Batch Import**: CSV/Excel import for large shipments
2. **QC Batch Processing**: Approve/reject entire batch at once
3. **Supplier Integration**: Auto-fill lot info from supplier data
4. **Barcode Scanning**: Scan articles instead of dropdown selection
5. **Duplicate Detection**: Warn if same article added twice
6. **Template Saving**: Save common lot configurations

---

## Testing Checklist

- [ ] Add single item and submit
- [ ] Add multiple items (3+) and submit
- [ ] Verify all items share same lot number
- [ ] Verify all items share same lot date
- [ ] Test unit conversion (entry to exit unit)
- [ ] Test validation (missing fields)
- [ ] Test delete row (single and multiple)
- [ ] Test add row (multiple times)
- [ ] Verify stock updates correctly
- [ ] Verify locations updated
- [ ] Check toast notifications
- [ ] Test with different article types
- [ ] Test with different locations
- [ ] Verify movements appear in table
- [ ] Test QC integration if applicable
