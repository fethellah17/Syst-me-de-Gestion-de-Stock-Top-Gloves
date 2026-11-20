# Sortie Refusal Logic - Clean Radio Selection Implementation

## Overview
Implemented a clean, minimalist radio button interface for Sortie (exit) movement refusals with two distinct scenarios and dynamic PDF generation.

## Architecture

### 1. New Component: SortieRefusalModal
**File:** `src/components/SortieRefusalModal.tsx`

#### Features:
- **Clean Radio Selection**: Two simple radio buttons with clear descriptions
- **Dynamic Field Display**: Fields appear/disappear based on selection
- **Color-Coded Sections**: Red for defective, blue for correction
- **Validation**: Ensures all required fields are filled before submission

#### Two Refusal Types:

**Option A: Article Défectueux (Rebut)**
- Radio label: "Article Défectueux (Rebut)"
- Description: "Stock sera déduit pour cause de dommage"
- Required fields:
  - Nom du Contrôleur
  - Motif du Refus
- PDF generated: `Avis_de_Rejet_de_Sortie.pdf`
- Stock impact: **DEDUCTED** (stock loss)

**Option B: Erreur de Préparation (Correction)**
- Radio label: "Erreur de Préparation (Correction)"
- Description: "Retour en rayon - Pas de déduction de stock"
- Required fields:
  - Nom de l'Opérateur
  - Motif de l'Erreur
- PDF generated: `Note_de_Correction_Sortie.pdf`
- Stock impact: **NO DEDUCTION** (administrative error)

### 2. PDF Generation Functions
**File:** `src/lib/pdf-generator.ts`

#### Function 1: `generateDefectiveRejectionPDF()`
```typescript
export const generateDefectiveRejectionPDF = async (
  movement: Mouvement, 
  controleurName: string, 
  motif: string, 
  articles?: any[]
)
```

**PDF Details:**
- Title: "AVIS DE REJET DE SORTIE"
- Sections:
  - Movement details (article, date, lot, zone, operator)
  - Quantities (rejected quantity = 100%)
  - Rejection reason
  - Stock impact note: "Stock déduit pour cause de dommage"
  - Signatures:
    - Left: Operator signature
    - Right: Controller signature (Contrôleur)

#### Function 2: `generateCorrectionNotePDF()`
```typescript
export const generateCorrectionNotePDF = async (
  movement: Mouvement, 
  operateurName: string, 
  motif: string, 
  articles?: any[]
)
```

**PDF Details:**
- Title: "NOTE DE CORRECTION - SORTIE"
- Sections:
  - Movement details (article, date, lot, zone, operator)
  - Quantities (corrected quantity = 100%)
  - Error description
  - Stock impact note: "Retour en rayon - Erreur administrative. Aucune déduction de stock."
  - Signatures:
    - Left: Operator signature
    - Right: Supervisor/Manager signature (Responsable)

### 3. Integration Points

#### MouvementsPage.tsx
- Added state: `isSortieRefusalModalOpen`, `sortieRefusalMouvementId`
- Added handlers:
  - `handleOpenSortieRefusalModal()`: Opens modal for Sortie movements
  - `handleCloseSortieRefusalModal()`: Closes modal
  - `handleSortieRefusalSubmit()`: Processes refusal, generates PDF, marks movement as rejected
- Passes `onSortieRefusal` prop to MovementTable

#### MovementTable.tsx
- Added prop: `onSortieRefusal?: (id: string) => void`
- Added button for Sortie movements in "En attente" status:
  - Icon: XIcon (red)
  - Title: "Refuser la Sortie"
  - Triggers: `onSortieRefusal?.(m.id)`

## UI/UX Design

### Modal Layout
```
┌─────────────────────────────────────────┐
│ Refus de Sortie                      [X]│
│ Sélectionnez le type de refus...       │
├─────────────────────────────────────────┤
│                                         │
│ Détails de la Sortie                   │
│ ├─ Article: [name] ([ref])             │
│ ├─ Quantité: [qty] [unit]              │
│ ├─ Zone Source: [zone]                 │
│ └─ Opérateur: [name]                   │
│                                         │
│ Type de Refus                          │
│ ○ Article Défectueux (Rebut)           │
│   Stock sera déduit pour cause...      │
│                                         │
│ ○ Erreur de Préparation (Correction)   │
│   Retour en rayon - Pas de déduction...│
│                                         │
│ [Dynamic Fields Based on Selection]    │
│                                         │
│ [Annuler] [Confirmer le Refus]        │
└─────────────────────────────────────────┘
```

### Dynamic Fields

**When "Article Défectueux" is selected:**
```
┌─────────────────────────────────────────┐
│ [Red Background Section]                │
│ Nom du Contrôleur *                    │
│ [Input field]                           │
│                                         │
│ Motif du Refus *                       │
│ [Textarea]                              │
│                                         │
│ ⚠ Stock déduit pour cause de dommage   │
└─────────────────────────────────────────┘
```

**When "Erreur de Préparation" is selected:**
```
┌─────────────────────────────────────────┐
│ [Blue Background Section]               │
│ Nom de l'Opérateur *                   │
│ [Input field]                           │
│                                         │
│ Motif de l'Erreur *                    │
│ [Textarea]                              │
│                                         │
│ ⓘ Retour en rayon - Erreur admin.      │
└─────────────────────────────────────────┘
```

## PDF Design Standards

### Professional Black & White Layout
- **Logo**: 20x20mm top-left corner
- **Company Name**: "Top Gloves" below logo
- **Title**: Right-aligned, bold
- **Report Date**: Right-aligned below title
- **Separator Line**: Black 0.5pt line

### Content Sections
- **Movement Details**: Simple text format, no boxes
- **Quantities**: Formatted with full unit names
- **Reason/Motif**: Wrapped text in dedicated section
- **Stock Impact**: Highlighted with color-coded text
- **Signatures**: Professional side-by-side layout
  - Left: Operator
  - Right: Controller/Supervisor
  - Signature lines: 18mm height
  - Printed name fields below

### Footer
- Validation date (bottom-left)
- Generation timestamp (discreet gray text, bottom)

## Stock Impact Logic

### Scenario A: Article Défectueux
- **Action**: Movement is rejected
- **Stock Impact**: **DEDUCTED** from inventory
- **Reason**: Item is damaged/defective and cannot be used
- **PDF**: Avis_de_Rejet_de_Sortie.pdf
- **Signature**: Contrôleur (Controller)

### Scenario B: Erreur de Préparation
- **Action**: Movement is rejected
- **Stock Impact**: **NO DEDUCTION** (stock remains unchanged)
- **Reason**: Administrative error - item returns to shelf
- **PDF**: Note_de_Correction_Sortie.pdf
- **Signature**: Opérateur (Operator) + Responsable (Supervisor)

## Implementation Details

### Form Validation
```typescript
// Validates based on selected refusal type
- refusalType must be selected
- If "defective": controleurName and motif required
- If "correction": operateurName and motif required
- All fields must be non-empty strings
```

### PDF Generation Flow
```
1. User selects refusal type and fills fields
2. Clicks "Confirmer le Refus"
3. Validation runs
4. If valid:
   - Generate appropriate PDF (defective or correction)
   - Call rejectQualityControl() to mark movement as rejected
   - Show success toast with PDF filename
   - Close modal
5. If invalid:
   - Show error messages
   - Keep modal open
```

### Movement Status
- Before: `statut: "En attente"` (pending)
- After: `statut: "Rejeté"` (rejected)
- QC Status: `qcStatus: "Non-conforme"` (non-conforming)

## Files Modified

1. **src/components/SortieRefusalModal.tsx** (NEW)
   - Complete modal component with radio selection
   - Dynamic field rendering
   - Form validation

2. **src/lib/pdf-generator.ts** (UPDATED)
   - Added `generateDefectiveRejectionPDF()`
   - Added `generateCorrectionNotePDF()`

3. **src/pages/MouvementsPage.tsx** (UPDATED)
   - Added imports for new modal and PDF functions
   - Added state management for modal
   - Added handlers for refusal workflow
   - Integrated SortieRefusalModal component
   - Updated MovementTable prop

4. **src/components/MovementTable.tsx** (UPDATED)
   - Added `onSortieRefusal` prop
   - Added refusal button for Sortie movements
   - Button appears only for "En attente" status

## Usage Flow

### For Users
1. Navigate to Mouvements page
2. Find a Sortie movement with status "En attente"
3. Click the red X button (Refuser la Sortie)
4. Modal opens showing movement details
5. Select refusal type:
   - **Article Défectueux**: If item is damaged
   - **Erreur de Préparation**: If it was a mistake
6. Fill in required fields (controller/operator name + reason)
7. Click "Confirmer le Refus"
8. PDF is generated and downloaded
9. Movement is marked as rejected
10. Stock is updated accordingly (deducted or unchanged)

## Testing Checklist

- [ ] Modal opens when clicking refusal button on Sortie movement
- [ ] Radio buttons toggle correctly
- [ ] Fields appear/disappear based on selection
- [ ] Validation prevents submission with empty fields
- [ ] Defective PDF generates with correct title and signatures
- [ ] Correction PDF generates with correct title and signatures
- [ ] Stock is deducted for defective items
- [ ] Stock is NOT deducted for correction errors
- [ ] Movement status changes to "Rejeté"
- [ ] Toast message shows PDF filename
- [ ] Modal closes after successful submission
- [ ] Error messages display for validation failures

## Future Enhancements

- Add photo/attachment support for defective items
- Implement batch refusal processing
- Add refusal history/analytics
- Email notifications for refusals
- Integration with supplier quality tracking
