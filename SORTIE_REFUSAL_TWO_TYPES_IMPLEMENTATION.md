# SORTIE Refusal - Two Types Implementation Complete

## Overview
Implemented two distinct refusal scenarios for SORTIE movements with different stock impact:
- **Scenario A: Article Défectueux** (Defective) - Stock is DEDUCTED
- **Scenario B: Erreur de Préparation** (Preparation Error) - Stock is NOT deducted

---

## 1. UI Changes - InspectionModal.tsx

### New State Variables
```typescript
const [refusalType, setRefusalType] = useState<"defectueux" | "erreur" | null>(null);
const [nomControleur, setNomControleur] = useState("");
const [nomOperateur, setNomOperateur] = useState("");
const [motifErreur, setMotifErreur] = useState("");
```

### Refusal Type Selection (SORTIE Only)
When "Refus Total" is checked for SORTIE movements, users see two radio button options:

**Scenario A: Article Défectueux**
- Input: "Nom du Contrôleur" + "Motif du Refus"
- Visual: Red border, red warning icon
- Action: "Confirmer le Refus (Défectueux)"
- Stock Impact: DEDUCTED from inventory

**Scenario B: Erreur de Préparation**
- Input: "Nom de l'Opérateur" + "Motif de l'Erreur"
- Visual: Blue border, blue info icon
- Action: "Confirmer la Correction"
- Stock Impact: NO DEDUCTION (items stay in warehouse)

### Form Validation
- For SORTIE: Must select refusal type before confirming
- For Scenario A: Requires controller name + refusal reason
- For Scenario B: Requires operator name + error reason
- For ENTRÉE: Simple refusal (no type selection needed)

---

## 2. Data Model Updates - DataContext.tsx

### Mouvement Interface
Added new field:
```typescript
refusalType?: "defectueux" | "erreur";  // SORTIE refusal type
```

### approveQualityControl Function
Updated signature:
```typescript
approveQualityControl: (
  id: string, 
  controleur: string, 
  etatArticles: "Conforme" | "Non-conforme", 
  unitesDefectueuses?: number, 
  qteValide?: number, 
  refusTotalMotif?: string, 
  noteControle?: string, 
  verificationPoints?: Record<string, boolean>,
  refusalType?: "defectueux" | "erreur"  // NEW
) => void;
```

### Stock Deduction Logic
**For SORTIE Refusals:**

**Scenario A (defectueux):**
```
- Deduct total quantity from source zone
- Update article total stock
- Permanent loss (items removed from warehouse)
```

**Scenario B (erreur):**
```
- NO stock deduction
- Items remain in warehouse
- Administrative correction only
```

---

## 3. PDF Generation - pdf-generator.ts

### New Functions

#### generateSortieRefusalDefectueusPDF()
**Title:** "AVIS DE REJET DE SORTIE (DEFECTUEUX)"

**Sections:**
- Movement Details (Article, Date, Lot, Zones, Operator)
- Refusal Reason (detailed explanation)
- Quantities (rejected quantity in exit unit)
- Important Note (red): "Marchandise non-conforme. Cette quantité a été déduite du stock physique."

**Signatures:**
- Left: Signature de l'Opérateur (Nom: [operator])
- Right: Signature du Contrôleur (Nom: [controller])

**Filename:** `Avis_Rejet_Sortie_[Product]_[Date].pdf`

#### generateSortieRefusalErreurPDF()
**Title:** "NOTE DE CORRECTION DE PREPARATION"

**Sections:**
- Movement Details (Article, Date, Lot, Zones, Operator)
- Error Description (detailed explanation)
- Quantities (affected quantity in exit unit)
- Important Note (blue): "Correction administrative. La marchandise reste disponible en stock."

**Signatures:**
- Left: Signature de l'Opérateur (Nom: [operator])
- Right: Visa du Responsable (Nom: [controller])

**Filename:** `Note_Correction_Sortie_[Product]_[Date].pdf`

---

## 4. UI Integration - MovementTable.tsx

### PDF Download Button Logic
```typescript
// For approved SORTIE movements
if (m.statut === "Refusé" && m.refusalType === "defectueux") {
  generateSortieRefusalDefectueusPDF(m, articles);
} else if (m.statut === "Refusé" && m.refusalType === "erreur") {
  generateSortieRefusalErreurPDF(m, articles);
} else {
  generateOutboundPDF(m, articles);
}
```

### Visual Indicators
- **Scenario A (Defectueux):** Red PDF icon
- **Scenario B (Erreur):** Blue PDF icon
- **Normal Approval:** Green PDF icon

---

## 5. User Flow

### Step 1: Create SORTIE Movement
User creates a SORTIE movement → Status: "En attente"

### Step 2: Open QC Modal
User clicks "Inspecter" → InspectionModal opens

### Step 3: Select Refusal Type (if rejecting)
- Check "Refuser toute la quantité"
- For SORTIE: Select refusal type (Défectueux or Erreur)
- For ENTRÉE: No type selection needed

### Step 4: Fill Required Fields
**Scenario A:**
- Nom du Contrôleur: [name]
- Motif du Refus: [reason]

**Scenario B:**
- Nom de l'Opérateur: [name]
- Motif de l'Erreur: [reason]

### Step 5: Confirm
- Click "Confirmer le Refus (Défectueux)" or "Confirmer la Correction"
- Movement status → "Refusé"
- Stock updated based on scenario

### Step 6: Download PDF
- PDF icon appears in movement row
- Click to download appropriate PDF
- Scenario A: "Avis_Rejet_Sortie_[Product].pdf"
- Scenario B: "Note_Correction_Sortie_[Product].pdf"

---

## 6. Stock Impact Summary

| Scenario | Type | Stock Action | PDF Title | Signature Right |
|----------|------|--------------|-----------|-----------------|
| A | Défectueux | DEDUCT | AVIS DE REJET | Contrôleur |
| B | Erreur | NO CHANGE | NOTE DE CORRECTION | Responsable |

---

## 7. Key Features

✅ **Two distinct refusal scenarios** with different business logic
✅ **Conditional stock deduction** based on refusal type
✅ **Professional PDF generation** with appropriate titles and notes
✅ **Clear UI indicators** (red/blue) for each scenario
✅ **Proper form validation** requiring all necessary fields
✅ **Signature blocks** with appropriate labels
✅ **Automatic filename generation** with product name and date
✅ **Toast notifications** indicating refusal type and stock impact

---

## 8. Testing Checklist

- [ ] Create SORTIE movement
- [ ] Open QC modal and check "Refuser toute la quantité"
- [ ] Verify refusal type selection appears (SORTIE only)
- [ ] Select "Article Défectueux" scenario
- [ ] Fill controller name and refusal reason
- [ ] Confirm refusal
- [ ] Verify stock was DEDUCTED
- [ ] Download PDF and verify title is "AVIS DE REJET DE SORTIE (DEFECTUEUX)"
- [ ] Verify signatures show "Contrôleur"
- [ ] Verify red note about stock deduction
- [ ] Repeat with "Erreur de Préparation" scenario
- [ ] Verify stock was NOT deducted
- [ ] Download PDF and verify title is "NOTE DE CORRECTION DE PREPARATION"
- [ ] Verify signatures show "Responsable"
- [ ] Verify blue note about stock remaining

---

## 9. Files Modified

1. **src/components/InspectionModal.tsx**
   - Added refusal type selection UI
   - Updated form validation
   - New state variables for both scenarios

2. **src/contexts/DataContext.tsx**
   - Added refusalType field to Mouvement interface
   - Updated approveQualityControl signature
   - Implemented conditional stock deduction logic

3. **src/lib/pdf-generator.ts**
   - Added generateSortieRefusalDefectueusPDF()
   - Added generateSortieRefusalErreurPDF()
   - Professional formatting with appropriate titles and notes

4. **src/pages/MouvementsPage.tsx**
   - Updated handleInspectionApprove to pass refusal type
   - Enhanced toast messages with scenario details

5. **src/components/MovementTable.tsx**
   - Imported new PDF functions
   - Updated PDF button logic to handle both scenarios
   - Added visual indicators for each scenario

---

## 10. Implementation Notes

- **Stock Deduction (Scenario A):** Permanent loss - items removed from warehouse
- **No Deduction (Scenario B):** Administrative correction - items returned to shelf
- **PDF Filenames:** Automatically generated with product name and date
- **Signatures:** Different labels based on scenario (Contrôleur vs Responsable)
- **Notes:** Color-coded (red for deduction, blue for no deduction)
- **Validation:** Ensures all required fields are filled before confirmation

---

## 11. Future Enhancements

- Add email notification when refusal is confirmed
- Add refusal history/analytics dashboard
- Add ability to revert refusal decisions
- Add batch refusal processing
- Add refusal reason templates/suggestions
