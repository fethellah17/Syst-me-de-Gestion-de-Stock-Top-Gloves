# Sortie Refusal Logic - Cleanup & Redirection Complete

## Overview
Successfully refactored the Sortie refusal logic to centralize all quality decisions within the InspectionModal, removing the external red X button and keeping the main table clean.

## Changes Made

### 1. UI Cleanup - Removed External Button
**File:** `src/components/MovementTable.tsx`

**Removed:**
- Red X button for Sortie refusals
- `onSortieRefusal` prop from interface
- Separate refusal action from the table

**Result:**
- Only ClipboardCheck icon appears for quality management
- Table is cleaner and less cluttered
- All quality decisions happen in one place

### 2. PDF Download Icon Visibility
**File:** `src/components/MovementTable.tsx`

**Updated:**
- Sortie PDF download button now shows for ANY non-pending status
- Changed from: `m.statut === "Terminé" && m.status === "approved"`
- Changed to: `m.statut !== "En attente"`

**Result:**
- PDF appears after QC is completed (whether approved or refused)
- Works for both approval and refusal scenarios
- Consistent with Entrée behavior

### 3. Internal Refusal Logic - Integrated into InspectionModal
**File:** `src/components/InspectionModal.tsx`

**Added:**
- Refusal type selection (radio buttons) for Sortie only
- Dynamic field rendering based on refusal type
- Color-coded sections (red for defective, blue for correction)
- Updated validation logic
- Updated approval handler

**New State:**
```typescript
const [refusalType, setRefusalType] = useState<"defective" | "correction" | null>(null);
const [controleurName, setControleurName] = useState("");
const [operateurName, setOperateurName] = useState("");
```

**Updated InspectionData Interface:**
```typescript
export interface InspectionData {
  // ... existing fields ...
  refusalType?: "defective" | "correction"; // For Sortie refusals
  controleurName?: string; // For defective refusals
  operateurName?: string; // For correction refusals
}
```

### 4. Quality Gate - Centralized Decision Making
**File:** `src/components/InspectionModal.tsx`

**Workflow:**
1. User clicks ClipboardCheck icon
2. InspectionModal opens
3. User checks "Refuser toute la quantité"
4. For Sortie: Radio buttons appear for refusal type selection
5. For Entrée: Only motif field appears (no type selection)
6. User fills required fields
7. Clicks "Confirmer le Refus"
8. PDF is generated based on refusal type
9. Movement is marked as rejected

### 5. PDF Generation Integration
**File:** `src/pages/MouvementsPage.tsx`

**Updated handleInspectionApprove:**
- Detects Sortie refusal with type selection
- Generates appropriate PDF:
  - Defective: `generateDefectiveRejectionPDF()`
  - Correction: `generateCorrectionNotePDF()`
- Shows success toast with PDF filename
- Marks movement as rejected

**Code:**
```typescript
if (data.refusTotalMotif && mouvement.type === "Sortie" && data.refusalType) {
  // Sortie refusal with type
  if (data.refusalType === "defective") {
    await generateDefectiveRejectionPDF(mouvement, data.controleurName || "", data.refusTotalMotif, articles);
  } else if (data.refusalType === "correction") {
    await generateCorrectionNotePDF(mouvement, data.operateurName || "", data.refusTotalMotif, articles);
  }
}
```

### 6. Removed Separate Component
**File:** `src/components/SortieRefusalModal.tsx`

**Status:** No longer used (kept for reference, can be deleted)
- Logic integrated into InspectionModal
- No longer imported in MouvementsPage
- Functionality preserved in InspectionModal

## UI/UX Flow

### Before (External Button)
```
Mouvements Table
├─ ClipboardCheck icon (QC)
└─ Red X icon (Refusal) ← REMOVED
```

### After (Centralized)
```
Mouvements Table
└─ ClipboardCheck icon (QC + Refusal)
   │
   └─ InspectionModal
      ├─ Normal Approval
      ├─ Entrée Refusal (no type)
      └─ Sortie Refusal (with type selection)
         ├─ Article Défectueux
         └─ Erreur de Préparation
```

## Quality Gate Logic

### For Entrée Movements
1. User clicks ClipboardCheck
2. InspectionModal opens
3. User can:
   - Approve with partial defects
   - Refuse completely (no type selection)
4. If refused: PDF generated, stock updated

### For Sortie Movements
1. User clicks ClipboardCheck
2. InspectionModal opens
3. User can:
   - Approve with partial defects
   - Refuse completely with type selection:
     - **Article Défectueux**: Stock DEDUCTED
     - **Erreur de Préparation**: Stock NOT deducted
4. If refused: Appropriate PDF generated, stock updated accordingly

## Refusal Type Selection (Sortie Only)

### Option A: Article Défectueux (Rebut)
- **Trigger:** "Refuser toute la quantité" checked + Sortie movement
- **Fields:**
  - Nom du Contrôleur
  - Motif du Refus
- **PDF:** Avis_de_Rejet_de_Sortie.pdf
- **Stock Impact:** DEDUCTED
- **Signature:** Operator (left) + Controller (right)

### Option B: Erreur de Préparation (Correction)
- **Trigger:** "Refuser toute la quantité" checked + Sortie movement
- **Fields:**
  - Nom de l'Opérateur
  - Motif de l'Erreur
- **PDF:** Note_de_Correction_Sortie.pdf
- **Stock Impact:** NO DEDUCTION
- **Signature:** Operator (left) + Supervisor (right)

## Files Modified

### Updated Files
1. **src/components/InspectionModal.tsx**
   - Added refusal type state
   - Added radio button selection UI
   - Updated validation logic
   - Updated approval handler
   - Added dynamic field rendering

2. **src/components/MovementTable.tsx**
   - Removed `onSortieRefusal` prop
   - Removed red X button
   - Updated PDF visibility logic

3. **src/pages/MouvementsPage.tsx**
   - Removed SortieRefusalModal import
   - Removed SortieRefusal state
   - Removed SortieRefusal handlers
   - Updated handleInspectionApprove for PDF generation
   - Removed SortieRefusalModal component from JSX

### Unchanged Files
- `src/lib/pdf-generator.ts` (functions still used)
- `src/components/SortieRefusalModal.tsx` (kept for reference)

## Benefits

### Cleaner UI
- Single icon for quality management
- No accidental clicks on wrong button
- Reduced visual clutter

### Better UX
- All decisions in one modal
- Clear workflow
- Consistent with Entrée logic

### Improved Safety
- Centralized quality gate
- Prevents accidental refusals
- Clear confirmation steps

### Proper Stock Management
- Defective items: Stock deducted
- Correction errors: Stock unchanged
- Correct PDF generated for each scenario

## Testing Checklist

- [x] ClipboardCheck button opens InspectionModal
- [x] "Refuser toute la quantité" checkbox works
- [x] For Sortie: Radio buttons appear when refusal checked
- [x] For Entrée: No radio buttons (only motif field)
- [x] Defective option shows red section
- [x] Correction option shows blue section
- [x] Fields appear/disappear based on selection
- [x] Validation prevents submission with empty fields
- [x] Defective PDF generates correctly
- [x] Correction PDF generates correctly
- [x] Stock deducted for defective items
- [x] Stock NOT deducted for correction errors
- [x] Movement marked as rejected
- [x] Toast shows PDF filename
- [x] Modal closes after submission
- [x] PDF download icon appears after QC
- [x] No red X button in table
- [x] No TypeScript errors

## Code Quality

✅ All files compile without errors
✅ No TypeScript warnings
✅ Proper type safety
✅ Clean code structure
✅ Consistent with existing patterns
✅ Comprehensive error handling

## Backward Compatibility

- Existing Entrée refusal logic unchanged
- Existing approval logic unchanged
- PDF generation functions unchanged
- Stock management logic unchanged
- Only UI/UX flow changed

## Future Considerations

- SortieRefusalModal.tsx can be deleted (no longer used)
- Consider adding refusal reason templates
- Consider adding refusal history/analytics
- Consider email notifications for refusals

## Summary

The refusal logic has been successfully centralized within the InspectionModal, providing:

1. **Cleaner Table**: Only ClipboardCheck icon for quality management
2. **Unified Quality Gate**: All decisions in one modal
3. **Type-Specific Handling**: Sortie refusals with type selection
4. **Proper Stock Management**: Correct deductions based on refusal type
5. **Professional PDFs**: Appropriate documents generated for each scenario
6. **Better UX**: Clear workflow with no accidental actions

The implementation maintains backward compatibility while improving the user experience and preventing accidental refusals.
