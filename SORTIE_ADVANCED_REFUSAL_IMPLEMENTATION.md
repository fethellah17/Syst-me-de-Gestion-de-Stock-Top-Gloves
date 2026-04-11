# Sortie System Re-Implementation with Advanced Refusal Logic

## Overview
Complete re-implementation of the Sortie (Exit) system with advanced refusal logic that distinguishes between two critical scenarios:
- **Scenario A: Article Défectueux (Rebut)** - Physical damage detected, DEDUCT from stock
- **Scenario B: Erreur de Préparation (Correction)** - Picking error, DO NOT DEDUCT from stock

## Key Changes

### 1. Interface & Actions (MovementTable.tsx)

**STRICT RULE IMPLEMENTED:**
- Only `ClipboardCheck` (Quality Control) icon appears for "En attente" Sortie movements
- NO delete/reject icons in the Actions column
- All quality decisions happen inside the QC Modal
- Download PDF icon appears for "Refusé" Sortie movements

**Changes:**
```typescript
// Desktop view - Line 413-423
{m.type === "Sortie" && m.statut === "En attente" && (
  <button onClick={() => onInspect?.(m.id)}>
    <ClipboardCheck className="w-5 h-5" />
  </button>
)}

// For rejected Sortie - Line 424-431
{m.type === "Sortie" && m.statut === "Refusé" && (
  <button onClick={() => generateOutboundPDF(m, articles)}>
    <FileText className="w-4 h-4" />
  </button>
)}
```

### 2. QC Modal - Refusal Selection (InspectionModal.tsx)

**New Refusal Modal:**
- Triggered by "Refuser toute la quantité" button
- Shows two radio button scenarios with clear descriptions
- Each scenario has specific input fields

**Scenario A: Article Défectueux (Rebut)**
- Input Fields: "Nom du Contrôleur" & "Motif du Refus"
- Stock Impact: DEDUCT quantity from stock
- PDF: Generates "Avis_de_Rejet_de_Sortie.pdf"
- Note: "Marchandise non-conforme déduite du stock physique."

**Scenario B: Erreur de Préparation (Correction)**
- Input Fields: "Nom de l'Opérateur" & "Motif de l'Erreur"
- Stock Impact: NO DEDUCTION (Return to shelf)
- PDF: Generates "Note_de_Correction_Sortie.pdf"
- Note: "Correction administrative. La marchandise reste en stock."

**Implementation Details:**
```typescript
// New state variables for refusal modal
const [showRefusalModal, setShowRefusalModal] = useState(false);
const [refusalType, setRefusalType] = useState<"defectueux" | "erreur" | null>(null);
const [nomControleur, setNomControleur] = useState("");
const [nomOperateur, setNomOperateur] = useState("");
const [motifRefus, setMotifRefus] = useState("");
const [motifErreur, setMotifErreur] = useState("");

// New interface fields
export interface InspectionData {
  refusalType?: "defectueux" | "erreur";
  nomControleur?: string;
  nomOperateur?: string;
  motifRefus?: string;
  motifErreur?: string;
}
```

### 3. Data Model Updates (DataContext.tsx)

**Mouvement Interface:**
```typescript
export interface Mouvement {
  // ... existing fields ...
  refusalType?: "defectueux" | "erreur";  // NEW: Advanced refusal type
}
```

**approveQualityControl Function:**
- New parameter: `refusalType?: "defectueux" | "erreur"`
- Handles both new refusal types with distinct logic
- Maintains backward compatibility with legacy refusal logic

**Stock Update Logic:**
```typescript
// Scenario A: Défectueux - DEDUCT from stock
if (refusalType === "defectueux") {
  const newStock = Math.max(0, article.stock - mouvement.qte);
  updateArticle(article.id, { ...article, stock: newStock });
}

// Scenario B: Erreur - NO stock change
if (refusalType === "erreur") {
  // NO stock update - goods return to shelf
  console.log(`[REFUSAL TYPE B] NO stock update - goods return to shelf`);
}
```

### 4. Post-Action Behavior (MouvementsPage.tsx)

**After Confirmation:**
1. Modal closes
2. Status updates to "Refusé"
3. Download PDF icon appears in Actions column
4. Toast notification shows appropriate message:
   - Scenario A: "✗ Article Défectueux (Rebut): X Paires déduit du stock"
   - Scenario B: "✓ Erreur de Préparation: X Paires retourné en stock"

**Implementation:**
```typescript
const handleInspectionApprove = (data: InspectionData) => {
  if (data.refusalType === "defectueux") {
    // Scenario A: DEDUCT from stock
    approveQualityControl(..., "defectueux");
    setToast({
      message: `✗ Article Défectueux (Rebut): ${mouvement.qte} ${mouvement.uniteSortie} déduit du stock`,
      type: "success"
    });
  } else if (data.refusalType === "erreur") {
    // Scenario B: NO DEDUCTION
    approveQualityControl(..., "erreur");
    setToast({
      message: `✓ Erreur de Préparation: ${mouvement.qte} ${mouvement.uniteSortie} retourné en stock`,
      type: "success"
    });
  }
};
```

### 5. Global Settings

**Units:**
- Full names used throughout (e.g., "Paires" instead of "Pr")
- Consistent with article configuration

**Filenames:**
- Include product name in PDF filenames
- Format: `Type_ProductName_Date.pdf`
- Example: `Avis_Refus_Reception_Gants-Nitrile-M_09-04-2026.pdf`

## PDF Generation

**Two New PDF Types for Sortie Refusals:**

1. **Avis_de_Rejet_de_Sortie.pdf** (Scenario A)
   - Black & White theme
   - Signatures: Operator (Left) | Controller (Right) in horizontal row
   - Note: "Marchandise non-conforme déduite du stock physique."
   - Includes: Article details, quantity, reason, controller name

2. **Note_de_Correction_Sortie.pdf** (Scenario B)
   - Black & White theme
   - Signatures: Operator (Left) | Controller (Right) in horizontal row
   - Note: "Correction administrative. La marchandise reste en stock."
   - Includes: Article details, quantity, error reason, operator name

## Workflow Summary

### For Sortie "En attente" Movement:
1. User clicks ClipboardCheck icon
2. QC Modal opens with normal approval flow
3. User can click "Refuser toute la quantité" button
4. Refusal Modal appears with two scenarios
5. User selects scenario and fills required fields
6. Confirmation triggers appropriate stock update
7. Status changes to "Refusé"
8. Download PDF icon appears

### Stock Impact:
- **Scenario A (Défectueux):** Stock reduced by full quantity
- **Scenario B (Erreur):** Stock unchanged (goods return to shelf)

## Testing Checklist

- [ ] ClipboardCheck icon only appears for "En attente" Sortie movements
- [ ] No delete/reject icons visible in Actions column
- [ ] "Refuser toute la quantité" button opens refusal modal
- [ ] Radio buttons for Scenario A and B work correctly
- [ ] Scenario A requires "Nom du Contrôleur" and "Motif du Refus"
- [ ] Scenario B requires "Nom de l'Opérateur" and "Motif de l'Erreur"
- [ ] Scenario A deducts stock correctly
- [ ] Scenario B does NOT deduct stock
- [ ] Status updates to "Refusé" after confirmation
- [ ] Download PDF icon appears for rejected movements
- [ ] Toast messages show correct information
- [ ] PDF filenames include product name
- [ ] PDF content matches scenario type

## Files Modified

1. **src/components/InspectionModal.tsx**
   - Added refusal modal with two scenarios
   - Added state for refusal type selection
   - Updated interface to include new fields

2. **src/components/MovementTable.tsx**
   - Updated action icons for Sortie movements
   - Only ClipboardCheck for "En attente"
   - Download PDF for "Refusé"

3. **src/pages/MouvementsPage.tsx**
   - Updated handleInspectionApprove to handle refusal types
   - Added appropriate toast messages

4. **src/contexts/DataContext.tsx**
   - Added refusalType field to Mouvement interface
   - Updated approveQualityControl function signature
   - Implemented distinct stock update logic for each scenario

## Backward Compatibility

- Legacy refusal logic (refusTotalMotif) still supported
- New refusal types take precedence when provided
- Existing movements unaffected

## Key Features

✓ Centralized quality decisions in QC Modal
✓ Clear distinction between damage and errors
✓ Accurate inventory tracking
✓ Professional PDF reports with appropriate notes
✓ Minimalist radio button selection
✓ Full unit names throughout
✓ Product name in PDF filenames
✓ Horizontal signature layout
✓ Black & White professional theme
