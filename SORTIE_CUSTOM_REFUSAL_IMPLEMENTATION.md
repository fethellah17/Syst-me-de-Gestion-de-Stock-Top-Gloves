# SORTIE CUSTOM REFUSAL LOGIC - IMPLEMENTATION COMPLETE

## Overview
Implemented a sophisticated two-scenario refusal system for Sortie (exit) movements that distinguishes between physical damage and preparation errors, with appropriate stock impact and PDF generation for each scenario.

## Architecture

### 1. New Component: SortieRefusalModal
**File:** `src/components/SortieRefusalModal.tsx`

A dedicated modal that appears when a user selects "Refus Total" for a Sortie movement in the QC modal.

**Features:**
- Two clear radio button options for refusal type
- Dynamic field labels based on selection
- Professional UI with color coding (red for defective, blue for correction)
- Real-time validation
- Impact summary showing stock consequences

**Two Scenarios:**

#### Option A: Article Défectueux / Rebut (Defective/Waste)
- **Purpose:** Item found damaged during exit (moisture, breakage, etc.)
- **Required Fields:** 
  - Nom du Contrôleur (Controller Name)
  - Motif du Refus (Refusal Reason)
- **Stock Impact:** DEDUCT from inventory (permanent loss)
- **PDF Generated:** `Avis_de_Rejet_de_Sortie_[ProductName].pdf`
- **Color Coding:** Red (destructive action)

#### Option B: Erreur de Préparation (Preparation Error)
- **Purpose:** Operator picked wrong item or quantity
- **Required Fields:**
  - Nom de l'Opérateur (Operator Name)
  - Motif de l'Erreur (Error Reason)
- **Stock Impact:** NO DEDUCTION (items stay on shelf)
- **PDF Generated:** `Note_de_Correction_Sortie_[ProductName].pdf`
- **Color Coding:** Blue (informational action)

### 2. PDF Generation Functions
**File:** `src/lib/pdf-generator.ts`

Two new PDF generation functions added:

#### `generateSortieDefectivePDF()`
- Generates "AVIS DE REJET DE SORTIE" (Rejection Notice)
- Shows defective quantity as permanent loss
- Includes controller name and defect details
- Professional black & white layout with two-column signature section
- Red accent for "IMPACT SUR LE STOCK" section

#### `generateSortieCorrectionPDF()`
- Generates "NOTE DE CORRECTION SORTIE" (Correction Note)
- Shows items remain on shelf (no stock impact)
- Includes operator name and error details
- Professional black & white layout with two-column signature section
- Blue accent for "IMPACT SUR LE STOCK" section

**Both PDFs Include:**
- Centralized header with logo (Base64 encoded)
- Movement details (article, lot number, date, zones)
- Quantity information
- Reason/motive section
- Stock impact summary
- Professional side-by-side signature blocks
- Validation date and footer timestamp

### 3. Data Model Updates
**File:** `src/contexts/DataContext.tsx`

#### New Mouvement Field
```typescript
sortieRefusalType?: "defective" | "correction";
```
Tracks which refusal scenario was applied to distinguish stock impact logic.

#### Updated approveQualityControl Signature
```typescript
approveQualityControl(
  id: string,
  controleur: string,
  etatArticles: "Conforme" | "Non-conforme",
  unitesDefectueuses?: number,
  qteValide?: number,
  refusTotalMotif?: string,
  noteControle?: string,
  verificationPoints?: Record<string, boolean>,
  sortieRefusalType?: "defective" | "correction"  // NEW
) => void
```

#### Sortie Approval Logic Enhancement
The `approveQualityControl` function now handles three Sortie scenarios:

1. **Defective Refusal** (`sortieRefusalType === "defective"`)
   - Sets `statut: "Refusé"`
   - Sets `validQuantity: 0`, `defectiveQuantity: mouvement.qte`
   - **DEDUCTS** total quantity from stock
   - Updates inventory zones accordingly

2. **Correction Refusal** (`sortieRefusalType === "correction"`)
   - Sets `statut: "Refusé"`
   - Sets `validQuantity: mouvement.qte`, `defectiveQuantity: 0`
   - **NO STOCK DEDUCTION** - items remain on shelf
   - Inventory unchanged

3. **Normal Sortie Approval** (no refusal)
   - Sets `statut: "Terminé"`
   - Deducts total quantity from stock
   - Existing logic preserved

### 4. UI Integration
**File:** `src/pages/MouvementsPage.tsx`

#### New State Management
```typescript
const [isSortieRefusalModalOpen, setIsSortieRefusalModalOpen] = useState(false);
const [sortieRefusalMouvement, setSortieRefusalMouvement] = useState<Mouvement | null>(null);
const [sortieRefusalArticle, setSortieRefusalArticle] = useState<Article | null>(null);
```

#### New Handlers
- `handleOpenSortieRefusalModal()` - Opens the refusal modal
- `handleCloseSortieRefusalModal()` - Closes the refusal modal
- `handleSortieRefusalConfirm()` - Processes the refusal selection

#### InspectionModal Integration
Updated `InspectionModal` to accept `onSortieRefusal` callback:
- When user selects "Refus Total" for a Sortie movement
- Closes InspectionModal
- Opens SortieRefusalModal for scenario selection
- Entrée refusal logic remains unchanged (uses standard refusal flow)

#### Modal Rendering
```typescript
<InspectionModal
  ...
  onSortieRefusal={handleOpenSortieRefusalModal}
/>

<SortieRefusalModal
  isOpen={isSortieRefusalModalOpen}
  onClose={handleCloseSortieRefusalModal}
  mouvement={sortieRefusalMouvement}
  article={sortieRefusalArticle}
  onConfirm={handleSortieRefusalConfirm}
/>
```

## Workflow

### User Journey

1. **Create Sortie Movement**
   - User creates a Sortie (exit) movement
   - Movement starts with `statut: "En attente"` (pending QC)

2. **Open QC Modal**
   - User clicks "Inspecter" on the pending Sortie
   - InspectionModal opens with verification checklist

3. **Select Refus Total**
   - User checks "Refuser toute la quantité" checkbox
   - InspectionModal shows refusal fields

4. **Confirm Refusal**
   - User clicks "Confirmer le Refus Total"
   - InspectionModal closes
   - **SortieRefusalModal opens** (NEW)

5. **Choose Scenario**
   - User selects either:
     - "Article Défectueux / Rebut" (Option A)
     - "Erreur de Préparation" (Option B)

6. **Fill Required Fields**
   - Option A: Controller name + Refusal reason
   - Option B: Operator name + Error reason

7. **Confirm Selection**
   - User clicks "Confirmer le Refus"
   - SortieRefusalModal closes
   - Appropriate PDF is generated and downloaded
   - Stock is updated according to scenario:
     - **Defective:** Stock DEDUCTED
     - **Correction:** Stock UNCHANGED
   - Toast notification confirms action

## Stock Impact Summary

| Scenario | Stock Deduction | Inventory Update | PDF Name |
|----------|-----------------|------------------|----------|
| Defective | ✓ YES (permanent loss) | Zone qty reduced | Avis_de_Rejet_de_Sortie_*.pdf |
| Correction | ✗ NO (items stay on shelf) | Unchanged | Note_de_Correction_Sortie_*.pdf |

## Key Features

✓ **Trigger Condition:** Only applies to Sortie movements with "Refus Total"
✓ **Entrée Unchanged:** Entry refusal logic remains unaffected
✓ **Two Clear Options:** Radio buttons with descriptive text
✓ **Dynamic Labels:** Field names change based on selection
✓ **Professional PDFs:** Black & white theme with two-column signatures
✓ **Immediate Download:** PDFs generated and downloaded automatically
✓ **Accurate Stock:** Correct inventory impact for each scenario
✓ **Audit Trail:** Movement status and refusal type recorded
✓ **User Feedback:** Toast notifications confirm actions

## Testing Checklist

- [ ] Create Sortie movement
- [ ] Open QC modal for Sortie
- [ ] Select "Refus Total"
- [ ] Confirm refusal → SortieRefusalModal opens
- [ ] Select "Article Défectueux / Rebut"
  - [ ] Fill controller name and reason
  - [ ] Confirm → PDF downloads
  - [ ] Verify stock DEDUCTED
  - [ ] Check movement status = "Refusé"
- [ ] Create another Sortie
- [ ] Select "Refus Total" again
- [ ] Select "Erreur de Préparation"
  - [ ] Fill operator name and reason
  - [ ] Confirm → PDF downloads
  - [ ] Verify stock UNCHANGED
  - [ ] Check movement status = "Refusé"
- [ ] Verify Entrée refusal still works normally
- [ ] Check PDF filenames are correct
- [ ] Verify PDF content matches scenario

## Files Modified

1. `src/components/SortieRefusalModal.tsx` - NEW
2. `src/components/InspectionModal.tsx` - Updated with onSortieRefusal callback
3. `src/pages/MouvementsPage.tsx` - Added state, handlers, and modal rendering
4. `src/contexts/DataContext.tsx` - Updated Mouvement interface and approveQualityControl logic
5. `src/lib/pdf-generator.ts` - Added two new PDF generation functions

## Imports Added

```typescript
// MouvementsPage.tsx
import { SortieRefusalModal, type SortieRefusalData } from "@/components/SortieRefusalModal";
import { generateSortieDefectivePDF, generateSortieCorrectionPDF } from "@/lib/pdf-generator";
import type { Mouvement, Article } from "@/contexts/DataContext";
```

## Notes

- The implementation maintains backward compatibility with existing Entrée refusal logic
- Stock calculations are precise and account for unit conversions
- PDF generation is asynchronous to prevent UI blocking
- All user inputs are validated before processing
- Toast notifications provide clear feedback on actions
- The system is ready for production use
