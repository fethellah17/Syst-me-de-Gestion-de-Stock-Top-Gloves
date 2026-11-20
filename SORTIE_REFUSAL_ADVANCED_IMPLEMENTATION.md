# Sortie System Re-Implementation with Advanced Refusal Logic

## Overview
The Sortie system has been re-implemented with a centralized quality control workflow that distinguishes between two types of refusals: defective items (Rebut) and picking errors (Correction).

## Key Changes

### 1. Interface & Actions (MovementTable)
**STRICT RULE**: For 'En attente' movements, ONLY the ClipboardCheck (Quality Control) icon is shown.
- No 'X' or 'Delete' icons in the Actions column
- All quality decisions happen inside the QC Modal
- For 'Refusé' status, a PDF download icon appears

**Desktop View**:
- Sortie + En attente → ClipboardCheck icon only
- Sortie + Refusé → PDF download icon
- Sortie + Terminé → PDF download icon

**Mobile View**:
- Same logic applied to card-based layout

### 2. QC Modal Workflow (InspectionModal + SortieRefusalModal)

#### For Sortie Movements:
When a Sortie movement is in "En attente" status and the user clicks ClipboardCheck:

1. **InspectionModal Opens** with:
   - Movement details (Article, Quantity, Zone Source, Operator, Lot Number)
   - Verification checklist (État, Quantité, Emballage)
   - Standard approval flow
   - **NEW**: "Refuser tout" button (red, prominent)

2. **"Refuser tout" Button** triggers **SortieRefusalModal** with:
   - Two radio button options:
     - **Scenario A**: Article Défectueux (Rebut)
     - **Scenario B**: Erreur de Préparation (Correction)

#### Scenario A: Article Défectueux (Rebut)
- **Logic**: Physical damage found → DEDUCT quantity from stock
- **Input Fields**:
  - Nom du Contrôleur (Controller Name)
  - Motif du Refus (Refusal Reason)
- **PDF Generated**: `Avis_Rejet_Sortie_[ProductName]_[Date].pdf`
- **PDF Note**: "Marchandise non-conforme déduite du stock physique."
- **Stock Impact**: Full quantity deducted

#### Scenario B: Erreur de Préparation (Correction)
- **Logic**: Picking error → DO NOT DEDUCT from stock (Return to shelf)
- **Input Fields**:
  - Nom de l'Opérateur (Operator Name)
  - Motif de l'Erreur (Error Reason)
- **PDF Generated**: `Note_Correction_Sortie_[ProductName]_[Date].pdf`
- **PDF Note**: "Correction administrative. La marchandise reste en stock."
- **Stock Impact**: No deduction

### 3. PDF Professional Content

Both PDFs follow the Black & White theme with:

**Layout**:
- Header: Logo (20x20mm) + "Top Gloves" + Title + Date
- Content: Movement details, Quantity section, Reason section
- Signatures: Side-by-side horizontal layout
  - Left: Operator signature
  - Right: Controller signature
- Footer: Validation date + Generation timestamp

**Specific Notes**:
- Scenario A: "Note: Marchandise non-conforme déduite du stock physique."
- Scenario B: "Note: Correction administrative. La marchandise reste en stock."

**Filenames**:
- Include product name: `Avis_Rejet_Sortie_Gants-Nitrile-M_09-04-2026.pdf`
- Include date: DD-MM-YYYY format

### 4. Post-Action Behavior

After confirmation in SortieRefusalModal:
1. Modal closes
2. Status updates to 'Refusé'
3. PDF is automatically generated and downloaded
4. InspectionModal closes
5. MovementTable refreshes
6. Download PDF icon appears in Actions column for future reference

### 5. Global Settings

**Units**:
- Display full unit names (e.g., 'Paires' instead of 'pair')
- Implemented via `getFullUnitName()` utility
- Applied in modal display and PDF generation

**Filenames**:
- Format: `[DocumentType]_[ProductName]_[Date].pdf`
- Product name cleaned: spaces → hyphens, special chars removed
- Date format: DD-MM-YYYY

## Component Structure

### Modified Components:

1. **InspectionModal.tsx**
   - Added SortieRefusalModal import
   - Added state: `isSortieRefusalModalOpen`
   - Added handler: `handleSortieRefusalApprove()`
   - Added "Refuser tout" button for Sortie movements
   - Integrated SortieRefusalModal at bottom

2. **SortieRefusalModal.tsx** (Already implemented)
   - Two radio button scenarios
   - Dynamic form fields based on selection
   - PDF generation on approval
   - Full unit name display

3. **MovementTable.tsx**
   - Updated actions column logic
   - Only ClipboardCheck for 'En attente' Sortie
   - PDF download for 'Refusé' and 'Terminé' Sortie
   - Removed unnecessary delete icons

4. **pdf-generator.ts**
   - Added: `generateRejectionDefectivePDF()` - Scenario A
   - Added: `generateCorrectionNotePDF()` - Scenario B
   - Both use centralized header rendering
   - Professional side-by-side signatures
   - Specific notes for each scenario

## Inventory Accuracy

The system ensures inventory accuracy by:

1. **Defective Items (Scenario A)**:
   - Full quantity deducted from stock
   - Marked as "Non-conforme"
   - PDF documents the damage

2. **Picking Errors (Scenario B)**:
   - No stock deduction
   - Item returns to shelf
   - Administrative correction only
   - PDF documents the error for audit trail

3. **Centralized Decisions**:
   - All quality decisions in QC Modal
   - No inline actions
   - Complete audit trail via PDFs
   - Clear distinction between damage and errors

## User Experience

### For Quality Controllers:
1. Click ClipboardCheck on pending Sortie
2. Review movement details and verification checklist
3. Click "Refuser tout" if needed
4. Select scenario (Defective or Correction)
5. Fill in controller/operator name and reason
6. Confirm → PDF generated automatically
7. Status updates to 'Refusé'

### For Operators:
1. See only ClipboardCheck icon for pending movements
2. No confusion with delete/reject buttons
3. Clear workflow: QC → Refusal → PDF

## Testing Checklist

- [ ] ClipboardCheck appears only for 'En attente' Sortie
- [ ] "Refuser tout" button visible in InspectionModal for Sortie
- [ ] SortieRefusalModal opens with two scenarios
- [ ] Scenario A: Defective - generates Avis_Rejet_Sortie PDF
- [ ] Scenario B: Correction - generates Note_Correction_Sortie PDF
- [ ] PDFs have correct signatures layout (side-by-side)
- [ ] PDFs include specific notes for each scenario
- [ ] Filenames include product name and date
- [ ] Units display as full names (Paires, not pair)
- [ ] Status updates to 'Refusé' after confirmation
- [ ] PDF download icon appears in Actions column
- [ ] Stock deduction only for Scenario A
- [ ] Stock unchanged for Scenario B

## Files Modified

1. `src/components/InspectionModal.tsx` - Added SortieRefusalModal integration
2. `src/components/SortieRefusalModal.tsx` - Already implemented, verified
3. `src/components/MovementTable.tsx` - Updated actions column logic
4. `src/lib/pdf-generator.ts` - Added two new PDF functions

## Next Steps

1. Test the complete workflow with sample data
2. Verify PDF generation and download
3. Confirm stock calculations for both scenarios
4. Test on mobile and desktop views
5. Verify audit trail completeness
