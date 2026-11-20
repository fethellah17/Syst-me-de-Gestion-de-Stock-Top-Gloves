# PDF Quality Health Score (Taux de Conformité) - COMPLETE

## Overview
Enhanced the PDF report with a Quality Health Score (Taux de Conformité) that provides managers with a quick, data-driven judgment of shipment quality at a glance. Added professional footer timestamp for document traceability.

## Implementation Details

### 1. Quality Score Calculation Function
**File: `src/lib/pdf-generator.ts`**

New function: `calculateQualityScore(validQuantity, receivedQuantity)`

**Formula:**
```
Taux de Conformité = (Quantité Valide / Quantité Reçue) × 100
```

**Example:**
- Received: 1000 items
- Defective: 50 items
- Valid: 950 items
- Score: (950 / 1000) × 100 = 95%

**Return Object:**
```typescript
{
  score: number;           // Rounded to 1 decimal place
  label: string;           // Formatted label with context
  isPerfect: boolean;      // True if 100%
  isRefused: boolean;      // True if 0%
}
```

**Contextual Labels:**
- 100%: "100% (Réception Parfaite)" - Perfect reception
- 0%: "0% (Refus Total)" - Total refusal
- Other: "95.5%" - Standard percentage format

### 2. PDF Visual Integration

#### Quality Score Display
- **Location:** In the "QUANTITES" section, after quantity details
- **Styling:** 
  - Bold text (Helvetica)
  - Simple thin-bordered box (0.3pt black line)
  - Black & white design (no colors)
  - Professional, minimalist appearance

#### Box Dimensions
- Width: 100mm
- Height: 8mm
- Positioned at x=15, y=yPos-2

#### Three Cases Handled

**CASE A: Total Acceptance (100% Valid)**
- Quality Score: 100% (Réception Parfaite)
- Displayed prominently in box
- Indicates perfect shipment quality

**CASE B: Partial Acceptance (With Defects)**
- Quality Score: Calculated from valid/received ratio
- Example: 95%, 87.5%, 50%, etc.
- Shows actual quality metrics for manager review

**CASE C: Total Refusal (0% Valid)**
- Quality Score: 0% (Refus Total)
- Clearly indicates complete rejection
- No items accepted into inventory

### 3. Footer Timestamp
**Location:** Bottom of PDF (y=292)
**Format:** Discreet gray text (RGB: 100, 100, 100)
**Font:** Helvetica, 7pt

**Text Template:**
```
Document genere automatiquement par le Systeme de Gestion de Stock Top Gloves le [Date et Heure]
```

**Date Format:**
- French locale (fr-FR)
- Full date: "15 avril 2026"
- Time: "14:32:45"
- Example: "Document genere automatiquement par le Systeme de Gestion de Stock Top Gloves le 15 avril 2026 14:32:45"

**Purpose:**
- Document traceability
- Automatic generation proof
- Professional audit trail
- Discreet but visible

### 4. PDF Aesthetic Maintained
- Entire PDF remains Black & White
- No colored badges or status indicators
- Thin horizontal lines for separation
- Clear, simple fonts (Helvetica)
- Professional, printable appearance
- Minimalist design philosophy

## User Experience

### Manager View
When opening the PDF, the manager immediately sees:

1. **Header Section**
   - Company logo and name
   - Document title (Bon d'Entree, etc.)
   - Report date

2. **Details Section**
   - Article information
   - Lot number and date
   - Destination zone
   - Operator name

3. **Quantities Section**
   - Received quantity
   - Accepted quantity
   - Defective quantity (if any)
   - **Quality Health Score in prominent box** ← Key KPI
   - Conversion factor (if applicable)

4. **Quality Control Section**
   - Observations/notes
   - Verification checklist (if applicable)

5. **Signature Section**
   - Operator signature block
   - QC Controller signature block
   - Validation date

6. **Footer**
   - Discreet timestamp
   - Automatic generation proof

## Technical Implementation

### Quality Score Calculation Logic
```typescript
const calculateQualityScore = (validQuantity: number, receivedQuantity: number) => {
  if (receivedQuantity === 0) {
    return { score: 0, label: "N/A", isPerfect: false, isRefused: true };
  }
  
  const score = (validQuantity / receivedQuantity) * 100;
  const roundedScore = Math.round(score * 10) / 10; // 1 decimal place
  
  const isPerfect = roundedScore === 100;
  const isRefused = roundedScore === 0;
  
  let label = `${roundedScore.toLocaleString('fr-FR')}%`;
  if (isPerfect) {
    label += " (Réception Parfaite)";
  } else if (isRefused) {
    label += " (Refus Total)";
  }
  
  return { score: roundedScore, label, isPerfect, isRefused };
};
```

### PDF Box Drawing
```typescript
// Draw simple box around quality score
doc.setDrawColor(0, 0, 0);
doc.setLineWidth(0.3);
doc.rect(15, yPos - 2, 100, 8, 'S');

// Add text inside box
doc.text("Taux de Conformite: " + qualityScore.label, 17, yPos + 3);
```

### Footer Timestamp
```typescript
const generationDate = new Date().toLocaleDateString("fr-FR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});
const footerText = `Document genere automatiquement par le Systeme de Gestion de Stock Top Gloves le ${generationDate}`;
doc.text(emergencyClean(footerText), 10, 292, { maxWidth: 190 });
```

## Files Modified
- `src/lib/pdf-generator.ts` - Added quality score calculation and PDF display

## Quality Score Examples

### Example 1: Perfect Reception
- Received: 500 Kg
- Defective: 0 Kg
- Valid: 500 Kg
- **Score: 100% (Réception Parfaite)**

### Example 2: Partial Acceptance
- Received: 1000 Pièces
- Defective: 50 Pièces
- Valid: 950 Pièces
- **Score: 95%**

### Example 3: High Defect Rate
- Received: 200 Unités
- Defective: 100 Unités
- Valid: 100 Unités
- **Score: 50%**

### Example 4: Total Refusal
- Received: 300 Cartons
- Defective: 300 Cartons
- Valid: 0 Cartons
- **Score: 0% (Refus Total)**

## Benefits

### For Managers
- Quick visual assessment of shipment quality
- Data-driven decision making
- Professional KPI display
- Audit trail with timestamp

### For Operations
- Clear quality metrics
- Standardized reporting
- Professional documentation
- Traceability proof

### For Compliance
- Automatic timestamp
- Document generation proof
- Quality metrics recorded
- Professional audit trail

## Testing Checklist
- [ ] Quality score displays correctly for 100% acceptance
- [ ] Quality score displays correctly for partial acceptance
- [ ] Quality score displays correctly for 0% refusal
- [ ] Score is rounded to 1 decimal place
- [ ] Perfect reception shows "(Réception Parfaite)" label
- [ ] Total refusal shows "(Refus Total)" label
- [ ] Box is drawn around quality score
- [ ] Footer timestamp appears at bottom
- [ ] Footer text is in gray (discreet)
- [ ] Footer includes current date and time
- [ ] PDF remains black & white
- [ ] All text is properly escaped (no & symbols)
- [ ] PDF prints correctly
- [ ] Quality score is visible and prominent
