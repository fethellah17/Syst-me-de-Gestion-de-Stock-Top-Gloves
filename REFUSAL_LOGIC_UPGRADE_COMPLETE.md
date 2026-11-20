# REFUSAL LOGIC UPGRADE - TWO SCENARIOS FOR TOTAL REJECTION

## ✅ IMPLEMENTATION COMPLETE

This document details the implementation of the advanced refusal logic that distinguishes between physical damage and administrative errors, providing high-level auditing capabilities.

---

## 1. REFUSAL MODAL UPDATE

### Two Refusal Scenarios

When a user selects "Refuser toute la quantité" during Sortie QC, they now see two distinct options:

#### **Option A: Article Défectueux / Endommagé**
- **Description**: Physical damage or defects detected
- **Examples**: Moisture, Breakage, Damage, Contamination
- **Input Fields**:
  - Nom du Contrôleur (Controller Name)
  - Motif du Refus (Defect Details)
- **Stock Action**: **DEDUCT** from inventory (permanent loss)
- **PDF Generated**: `Avis_Rejet_Sortie_Defectueux_[Product]_[Date].pdf`
- **Status**: "Refusé - Défectueux"

#### **Option B: Erreur de Préparation / Quantité**
- **Description**: Administrative or picking errors
- **Examples**: Wrong item picked, Wrong quantity, Wrong size
- **Input Fields**:
  - Nom de l'Opérateur (Operator Name)
  - Motif de l'Erreur (Error Details)
- **Stock Action**: **NO DEDUCTION** (items return to shelf)
- **PDF Generated**: `Note_Correction_Preparation_[Product]_[Date].pdf`
- **Status**: "Annulé - Erreur"

---

## 2. SCENARIO A: DEFECTIVE ITEM LOGIC

### Workflow
```
User selects "Article Défectueux / Endommagé"
                    ↓
        Enter Controller Name
        Enter Defect Details
                    ↓
        Click "Confirmer Refus - Défectueux"
                    ↓
        Status: "Refusé - Défectueux"
        Stock: DEDUCTED (permanent loss)
                    ↓
        PDF: Avis_Rejet_Sortie_Defectueux_[Product].pdf
                    ↓
        Download button appears immediately
```

### Stock Impact
- **Action**: DEDUCT total quantity from source zone
- **Reason**: Items are damaged/defective and cannot be used
- **Result**: Permanent loss recorded in inventory
- **Audit Trail**: Controller name and defect details captured

### PDF Content (Avis de Rejet - Défectueux)
- **Title**: "AVIS DE REJET - ARTICLE DÉFECTUEUX"
- **Details Section**:
  - Article name & reference
  - Rejection date
  - Quantity rejected
  - Lot number & date
- **Defect Details Section**:
  - Detailed defect description
- **Stock Impact Section** (Red text):
  - "Stock DÉDUIT: [qty] [unit]"
  - "Les articles défectueux sont considérés comme une perte permanente."
- **Signature**:
  - Controller signature line
  - Controller name field
- **Professional Layout**: Black & white, minimalist design

---

## 3. SCENARIO B: PREPARATION ERROR LOGIC

### Workflow
```
User selects "Erreur de Préparation / Quantité"
                    ↓
        Enter Operator Name
        Enter Error Details
                    ↓
        Click "Confirmer Refus - Erreur"
                    ↓
        Status: "Annulé - Erreur"
        Stock: UNCHANGED (items return to shelf)
                    ↓
        PDF: Note_Correction_Preparation_[Product].pdf
                    ↓
        Download button appears immediately
```

### Stock Impact
- **Action**: NO DEDUCTION from inventory
- **Reason**: Items remain in warehouse, preparation must be corrected
- **Result**: Items available for re-picking
- **Audit Trail**: Operator name and error details captured

### PDF Content (Note de Correction - Préparation)
- **Title**: "NOTE DE CORRECTION - ERREUR DE PRÉPARATION"
- **Error Details Section**:
  - Article name & reference
  - Error detection date
  - Quantity involved
  - Lot number
- **Error Reason Section**:
  - Detailed error description
- **Stock Impact Section** (Green text):
  - "Stock INCHANGÉ: Articles retournés à l'étagère"
  - "La préparation doit être corrigée et relancée."
- **Signature**:
  - Operator signature line
  - Operator name field
- **Professional Layout**: Black & white, minimalist design

---

## 4. UI & FLOW IMPLEMENTATION

### Modal Updates
- **Scenario Selection**: Radio buttons with clear descriptions
- **Conditional Fields**: Different input fields based on scenario
- **Button Text**: Changes based on scenario
  - "Confirmer Refus - Défectueux" (Scenario A)
  - "Confirmer Refus - Erreur" (Scenario B)
- **Validation**: Scenario must be selected before approval

### Movement Status Display
- **Scenario A**: Status shows "Refusé - Défectueux"
- **Scenario B**: Status shows "Annulé - Erreur"
- **Visual Distinction**: Different colors in UI
  - Red for defective (permanent loss)
  - Orange for error (correctable)

### PDF Download
- **Immediate Availability**: Download button appears right after confirmation
- **Scenario A**: Red icon, "Avis de Rejet - Défectueux"
- **Scenario B**: Orange icon, "Note de Correction"
- **Filename Format**:
  - Scenario A: `Avis_Rejet_Sortie_Defectueux_[Product]_[Date].pdf`
  - Scenario B: `Note_Correction_Preparation_[Product]_[Date].pdf`

---

## 5. FILES MODIFIED

### 1. `src/components/InspectionModal.tsx`
**Changes**:
- Added `refusalScenario` state ("defective" | "preparation_error")
- Added `operateur` state for Scenario B
- Updated `InspectionData` interface with new fields
- Added scenario selection UI with radio buttons
- Conditional field rendering based on scenario
- Updated button text and validation logic

### 2. `src/contexts/DataContext.tsx`
**Changes**:
- Updated `Mouvement` interface with new status values:
  - "Refusé - Défectueux"
  - "Annulé - Erreur"
- Updated `approveQualityControl()` function signature
- Added refusal scenario handling:
  - Scenario A: Deduct stock from source zone
  - Scenario B: No stock change
- Proper logging for audit trail

### 3. `src/pages/MouvementsPage.tsx`
**Changes**:
- Updated `handleInspectionApprove()` to pass refusal scenario
- Updated `operateur` parameter passing
- Scenario-specific toast messages

### 4. `src/components/MovementTable.tsx`
**Changes**:
- Added imports for new PDF functions
- Updated PDF button logic to handle both scenarios
- Conditional button rendering based on status
- Different icons and colors for each scenario

### 5. `src/lib/pdf-generator.ts`
**Changes**:
- Added `generateDefectiveRejectionPDF()` function
- Added `generatePreparationErrorPDF()` function
- Both use centralized header rendering
- Professional black & white layout
- Scenario-specific content and messaging

---

## 6. DATA FLOW

### Scenario A: Defective Item
```
InspectionModal
  ↓ (refusalScenario: "defective")
MouvementsPage.handleInspectionApprove()
  ↓
DataContext.approveQualityControl()
  ↓
  ├─ Update mouvement status: "Refusé - Défectueux"
  ├─ Set controleur name
  ├─ DEDUCT stock from source zone
  └─ Set refusalReason
  ↓
MovementTable
  ↓
generateDefectiveRejectionPDF()
  ↓
Download: Avis_Rejet_Sortie_Defectueux_[Product].pdf
```

### Scenario B: Preparation Error
```
InspectionModal
  ↓ (refusalScenario: "preparation_error")
MouvementsPage.handleInspectionApprove()
  ↓
DataContext.approveQualityControl()
  ↓
  ├─ Update mouvement status: "Annulé - Erreur"
  ├─ Set operateur name
  ├─ NO stock change
  └─ Set refusalReason
  ↓
MovementTable
  ↓
generatePreparationErrorPDF()
  ↓
Download: Note_Correction_Preparation_[Product].pdf
```

---

## 7. TESTING SCENARIOS

### Scenario A: Defective Item Test
1. Create Sortie with 100 units
2. Open QC modal
3. Select "Refuser toute la quantité"
4. Select "Article Défectueux / Endommagé"
5. Enter controller name: "Marie L."
6. Enter defect: "Humidité détectée, emballage endommagé"
7. Click "Confirmer Refus - Défectueux"
8. **Verify**:
   - Status: "Refusé - Défectueux"
   - Stock: DEDUCTED by 100
   - Download button appears (red icon)
   - PDF filename: `Avis_Rejet_Sortie_Defectueux_[Product]_[Date].pdf`

### Scenario B: Preparation Error Test
1. Create Sortie with 100 units
2. Open QC modal
3. Select "Refuser toute la quantité"
4. Select "Erreur de Préparation / Quantité"
5. Enter operator name: "Jean D."
6. Enter error: "Mauvaise taille sélectionnée (M au lieu de L)"
7. Click "Confirmer Refus - Erreur"
8. **Verify**:
   - Status: "Annulé - Erreur"
   - Stock: UNCHANGED
   - Download button appears (orange icon)
   - PDF filename: `Note_Correction_Preparation_[Product]_[Date].pdf`

---

## 8. AUDIT TRAIL

### Scenario A: Defective Item
- **Recorded Information**:
  - Controller name
  - Defect details
  - Rejection date/time
  - Quantity deducted
  - Lot number & date
- **PDF Report**: Professional audit document
- **Stock Impact**: Permanent loss recorded

### Scenario B: Preparation Error
- **Recorded Information**:
  - Operator name
  - Error details
  - Detection date/time
  - Quantity involved
  - Lot number & date
- **PDF Report**: Correction notice for re-picking
- **Stock Impact**: No change (items available for correction)

---

## 9. PROFESSIONAL STANDARDS

✅ **Distinction**: Clear separation between physical damage and administrative errors
✅ **Audit Trail**: Complete tracking of who, what, when, and why
✅ **Stock Accuracy**: Proper handling of inventory based on scenario
✅ **Documentation**: Professional PDFs for both scenarios
✅ **User Experience**: Intuitive modal with clear options
✅ **Compliance**: Pharmaceutical/medical standards ready

---

## 10. DEPLOYMENT STATUS

✅ **Build**: Successful, no errors
✅ **Type Safety**: All TypeScript checks pass
✅ **Backward Compatible**: Existing functionality preserved
✅ **Production Ready**: Ready for immediate deployment

---

## SUMMARY

The refusal logic upgrade provides a sophisticated two-scenario system that:

1. **Distinguishes** between physical damage and administrative errors
2. **Handles stock** appropriately for each scenario
3. **Generates** professional PDFs with scenario-specific content
4. **Maintains** complete audit trails
5. **Provides** high-level auditing capabilities

This enables organizations to:
- Track permanent losses (defective items)
- Identify and correct preparation errors
- Maintain accurate inventory records
- Generate professional compliance documentation

**Status**: ✅ **PRODUCTION-READY**
