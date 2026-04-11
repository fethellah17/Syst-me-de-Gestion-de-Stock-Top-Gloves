# SORTIE REFUSAL PDF DOWNLOAD FIX - IMPLEMENTATION COMPLETE

## Overview
Fixed PDF download icon visibility for refused Sortie movements. The system now displays the correct PDF download button immediately after a Sortie is marked as "Refusé" and links to the appropriate PDF generation function based on the refusal type.

## Changes Made

### 1. MovementTable.tsx - Updated Imports
**File:** `src/components/MovementTable.tsx`

Added two new PDF generation functions to imports:
```typescript
import { 
  generateInboundPDF, 
  generateOutboundPDF, 
  generateTransferPDF, 
  generateAdjustmentPDF,
  generateRejectionPDF,
  generateAdministrativeErrorPDF,      // NEW
  generateDefectiveItemsPDF             // NEW
} from "@/lib/pdf-generator";
```

### 2. Desktop View - Actions Column (Lines 415-450)
**Location:** Desktop table Actions column

Added two new conditional buttons for refused Sortie movements:

**Scenario A - Administrative Error:**
```typescript
{m.type === "Sortie" && m.statut === "Refusé" && m.refusalType === "administrative" && (
  <button
    onClick={() => generateAdministrativeErrorPDF(m)}
    className="p-1.5 rounded-md hover:bg-orange-100 transition-colors text-orange-600 hover:text-orange-800"
    title="Télécharger la Note de Correction (PDF)"
  >
    <FileText className="w-4 h-4" />
  </button>
)}
```

**Scenario B - Defective Items:**
```typescript
{m.type === "Sortie" && m.statut === "Refusé" && m.refusalType === "defective" && (
  <button
    onClick={() => generateDefectiveItemsPDF(m)}
    className="p-1.5 rounded-md hover:bg-red-100 transition-colors text-red-600 hover:text-red-800"
    title="Télécharger l'Avis de Rejet (PDF)"
  >
    <FileText className="w-4 h-4" />
  </button>
)}
```

### 3. Mobile Card View - Action Buttons (Lines 720-745)
**Location:** Mobile card view bottom action buttons

Added the same two conditional buttons with dark mode support:

**Scenario A - Administrative Error:**
```typescript
{m.type === "Sortie" && m.statut === "Refusé" && m.refusalType === "administrative" && (
  <button
    onClick={() => generateAdministrativeErrorPDF(m)}
    className="p-2 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300"
    title="Télécharger la Note de Correction (PDF)"
  >
    <FileText className="w-4 h-4" />
  </button>
)}
```

**Scenario B - Defective Items:**
```typescript
{m.type === "Sortie" && m.statut === "Refusé" && m.refusalType === "defective" && (
  <button
    onClick={() => generateDefectiveItemsPDF(m)}
    className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900 transition-colors text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
    title="Télécharger l'Avis de Rejet (PDF)"
  >
    <FileText className="w-4 h-4" />
  </button>
)}
```

## Trigger Visibility Logic

The PDF download icon appears based on these conditions:

### Scenario A (Administrative Error):
- **Condition:** `m.type === "Sortie" && m.statut === "Refusé" && m.refusalType === "administrative"`
- **PDF Generated:** `Note_de_Correction_Sortie.pdf`
- **Color:** Orange (warning/correction)
- **Signatures:** Only Signature de l'Opérateur

### Scenario B (Defective Items):
- **Condition:** `m.type === "Sortie" && m.statut === "Refusé" && m.refusalType === "defective"`
- **PDF Generated:** `Avis_de_Rejet_de_Sortie.pdf`
- **Color:** Red (rejection)
- **Signatures:** Both Signature de l'Opérateur AND Signature du Contrôleur

## PDF Functions Used

### generateAdministrativeErrorPDF()
- **Location:** `src/lib/pdf-generator.ts` (Line 1244)
- **Purpose:** Generates "Note de Correction de Sortie" for administrative errors
- **Stock Impact:** NO stock deduction (goods return to stock)
- **Signatures:** Operator only

### generateDefectiveItemsPDF()
- **Location:** `src/lib/pdf-generator.ts` (Line 1411)
- **Purpose:** Generates "Avis de Rejet de Sortie" for defective items
- **Stock Impact:** Stock deduction applied
- **Signatures:** Operator + Controller

## State Refresh Behavior

The table automatically refreshes when:
1. A Sortie movement is marked as "Refusé" in the QC Modal
2. The `statut` field is updated to "Refusé"
3. The `refusalType` field is set to either "administrative" or "defective"
4. The component re-renders with the new movement data

No manual page reload is required - the icon appears immediately in the Actions column.

## Testing Checklist

- [x] Desktop view shows correct PDF icon for Scenario A (orange)
- [x] Desktop view shows correct PDF icon for Scenario B (red)
- [x] Mobile view shows correct PDF icon for Scenario A (orange)
- [x] Mobile view shows correct PDF icon for Scenario B (red)
- [x] Clicking Scenario A button generates correct PDF with operator signature only
- [x] Clicking Scenario B button generates correct PDF with both signatures
- [x] Icon appears immediately after rejection without page reload
- [x] Correct tooltips display for each scenario
- [x] Dark mode styling applied correctly on mobile

## Files Modified

1. **src/components/MovementTable.tsx**
   - Added imports for `generateAdministrativeErrorPDF` and `generateDefectiveItemsPDF`
   - Added conditional buttons for Scenario A (administrative error)
   - Added conditional buttons for Scenario B (defective items)
   - Applied to both desktop and mobile views

## Backward Compatibility

- Existing approved Sortie movements continue to show the standard "Bon de Sortie" PDF button
- Rejected movements with `status === "rejected"` continue to show the rejection report button
- No changes to existing functionality

## Notes

- The refusal type is determined by the `refusalType` field in the Mouvement object
- This field is set during the QC rejection process in the DataContext
- The PDF generation functions already exist and handle all signature logic correctly
- Color coding helps users quickly identify the type of refusal (orange = correction, red = rejection)
