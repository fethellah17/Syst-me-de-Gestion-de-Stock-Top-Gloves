# SORTIE REFUSAL PDF GENERATION - IMPLEMENTATION COMPLETE

## Overview
Implemented scenario-specific PDF generation for Sortie refusals with proper signature handling and standardized filenames.

## Changes Made

### 1. PDF Filename Standardization
**File:** `src/lib/pdf-generator.ts`

Both refusal types now use the standardized filename format:
```
Avis_Rejet_Sortie_[Nom_Produit].pdf
```

Example: `Avis_Rejet_Sortie_Gants-Nitrile-M.pdf`

---

## 2. Scenario A: Administrative Error (NO Stock Deduction)

### PDF Function: `generateAdministrativeErrorPDF()`

**Title:** `NOTE DE CORRECTION DE PRÉPARATION`

**Input Fields (Modal):**
- Nom de l'Opérateur
- Motif de l'Erreur

**PDF Content:**
- Document title: "NOTE DE CORRECTION DE PRÉPARATION"
- Note: "Erreur administrative. La marchandise a été réintégrée au stock."
- Quantity section shows: "(Erreur de preparation - Marchandise reintegree au stock)"

**Signature Section:**
- **LEFT ONLY:** Signature de l'Opérateur
- **RIGHT:** HIDDEN/EMPTY (No QC Controller signature)
- Operator name is displayed from `movement.nomOperateur`

**Stock Impact:** NONE - Merchandise is returned to stock

---

## 3. Scenario B: Defective Items (WITH Stock Deduction)

### PDF Function: `generateDefectiveItemsPDF()`

**Title:** `AVIS DE REJET DE SORTIE (DÉFECTUEUX)`

**Input Fields (Modal):**
- Nom du Contrôleur
- Nom de l'Opérateur
- Motif du Rejet

**PDF Content:**
- Document title: "AVIS DE REJET DE SORTIE (DÉFECTUEUX)"
- Note: "Marchandise non-conforme déduite du stock physique." (in RED)
- Quantity section shows: "(Marchandise non-conforme déduite du stock physique)"

**Signature Section:**
- **LEFT:** Signature de l'Opérateur (with operator name)
- **RIGHT:** Signature du Contrôleur Qualité (with QC controller name)
- Both signatures displayed on same horizontal line

**Stock Impact:** YES - Merchandise is deducted from physical stock

---

## 4. PDF Trigger Integration

**File:** `src/pages/MouvementsPage.tsx`

### Import Added:
```typescript
import { generateAdministrativeErrorPDF, generateDefectiveItemsPDF } from "@/lib/pdf-generator";
```

### PDF Generation in `handleInspectionApprove()`:
When a Sortie refusal is confirmed:

1. **Administrative Error Path:**
   - Calls `generateAdministrativeErrorPDF(updatedMouvement)`
   - PDF downloads immediately with filename: `Avis_Rejet_Sortie_[ProductName].pdf`

2. **Defective Items Path:**
   - Calls `generateDefectiveItemsPDF(updatedMouvement)`
   - PDF downloads immediately with filename: `Avis_Rejet_Sortie_[ProductName].pdf`

### Download Icon Behavior:
- Download icon appears immediately in Actions column after "Confirmer" is clicked
- PDF is generated and downloaded automatically
- No manual download step required

---

## 5. Professional Layout Features

### Both PDFs Include:
- **Header:** Logo (20x20mm), Company Name "Top Gloves", Document Title, Report Date
- **Movement Details:** Article, Date, Lot Number, Lot Date, Source Zone, Destination
- **Quantity Section:** Clear display of rejected quantity with context
- **Reason Section:** Detailed explanation of error/defect
- **Signature Section:** Professional side-by-side layout with horizontal lines
- **Validation Date:** Timestamp at bottom
- **Footer:** Automatic generation timestamp (discreet gray text)

### Black & White Professional Design:
- Monochrome layout for formal documentation
- Clear section separators (horizontal lines)
- Proper font hierarchy (bold titles, normal body text)
- Consistent spacing and alignment

---

## 6. Data Flow

```
InspectionModal (Sortie Refusal)
    ↓
User selects refusal type (Administrative or Defective)
    ↓
User fills scenario-specific fields
    ↓
User clicks "Confirmer"
    ↓
handleInspectionApprove() triggered
    ↓
approveQualityControl() updates database
    ↓
PDF generation triggered based on refusal type
    ↓
PDF downloads automatically
    ↓
Toast notification confirms action
```

---

## 7. Field Mapping

### Administrative Error:
- `nomOperateur` → Operator name in PDF
- `motifErreur` → Error reason in PDF
- No QC Controller signature

### Defective Items:
- `nomOperateur` → Operator name in PDF
- `nomControleur` → QC Controller name in PDF
- `motifRejet` → Rejection reason in PDF
- Both signatures displayed

---

## 8. Testing Checklist

- [ ] Create Sortie movement
- [ ] Open Inspection Modal
- [ ] Select "Refuser toute la quantité"
- [ ] Select "Erreur Administrative"
- [ ] Fill Nom de l'Opérateur and Motif de l'Erreur
- [ ] Click "Confirmer"
- [ ] Verify PDF downloads with correct filename
- [ ] Verify PDF shows only Operator signature
- [ ] Verify PDF note says "Erreur administrative..."
- [ ] Repeat with "Article Défectueux" option
- [ ] Verify PDF shows both signatures
- [ ] Verify PDF note says "Marchandise non-conforme déduite..."

---

## 9. Key Implementation Details

### Filename Generation:
```typescript
const cleanProductName = emergencyClean(movement.article)
  .replace(/\s+/g, '-')
  .replace(/[^a-zA-Z0-9\-]/g, '')
  .substring(0, 50);
const filename = `Avis_Rejet_Sortie_${cleanProductName}.pdf`;
```

### Signature Positioning:
- Left column (X=15): Operator signature
- Right column (X=115): QC Controller signature (Scenario B only)
- Both on same horizontal line for professional appearance
- Signature height: 18mm for hand signature space

### Legal Responsibility Alignment:
- **Scenario A:** Only operator signs (they made the error)
- **Scenario B:** Both sign (operator prepared, QC controller verified defect)

---

## 10. Notes

- PDFs are generated asynchronously but download immediately
- Filenames are sanitized to prevent filesystem issues
- Both PDFs maintain consistent professional styling with Entrée PDFs
- Stock deduction logic is handled separately in `approveQualityControl()`
- PDF generation does not block UI - happens in background

