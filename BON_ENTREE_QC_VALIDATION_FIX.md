# Bon d'Entrée - QC Validation Quantity Fix

## Problem Statement

The PDF generation for Entrée (inbound) movements had a critical discrepancy:
- When Quality Control marked some units as defective, the PDF still showed the **initial total quantity**
- The PDF did not reflect the **validated quantity** that actually entered stock
- There was no breakdown showing defective vs. accepted units
- The PDF did not match the actual stock increase in the database

**Example Issue:**
```
Scenario: Receive 100 units, QC finds 15 defective
- Initial Quantity: 100 units
- Defective: 15 units
- Valid (Stock): 85 units

PDF Showed: "Quantite Saisie: 100" ❌
Should Show: "Quantite Acceptee (Stock): 85" ✅
```

## Solution Applied

### 1. Dynamic PDF Content Based on QC Status

The PDF now adapts based on whether QC inspection has been completed:

**Before QC Inspection (Pending):**
```typescript
// Show initial quantity only
const { qty, unit } = getQuantityDisplay(movement);
doc.text("Quantite Saisie: " + qty + " " + unit, 15, yPos);

if (movement.statut === "En attente de validation Qualité") {
  doc.text("En attente de validation qualite", 15, yPos);
}
```

**After QC Inspection (Completed):**
```typescript
// Show detailed breakdown
const hasQCInspection = movement.statut === "Terminé" && 
  (movement.validQuantity !== undefined || movement.defectiveQuantity !== undefined);

if (hasQCInspection) {
  // Display QC breakdown section
}
```

### 2. Professional QC Breakdown Section

Added a detailed breakdown in a bordered box:

```typescript
// QC Inspection Section
doc.setFontSize(12);
doc.setFont("helvetica", "bold");
doc.text("Controle Qualite", 10, yPos);

// Draw box around QC details
doc.rect(10, yPos - 5, 190, 35, 'S');

// Total Quantity Received
doc.text("Quantite Totale Recue:", 15, yPos);
doc.text(totalQty + " " + unit, 90, yPos);

// Defective Quantity (RED)
doc.text("Quantite Defectueuse:", 15, yPos);
doc.setTextColor(220, 38, 38); // Red
doc.text(defectiveQty + " " + unit, 90, yPos);

// Valid Quantity - ACCEPTED INTO STOCK (GREEN)
doc.text("Quantite Acceptee (Stock):", 15, yPos);
doc.setTextColor(34, 197, 94); // Green
doc.text(validQty + " " + unit, 90, yPos);
```

### 3. Color Coding for Clarity

- **Black**: Standard information
- **Red**: Defective quantity (rejected units)
- **Green**: Accepted quantity (entered stock)
- **Orange**: Pending validation status

### 4. QC Controller Information

Added inspector details when available:

```typescript
if (movement.controleur) {
  doc.text("Controle effectue par: " + emergencyClean(movement.controleur), 15, yPos);
}

if (movement.etatArticles) {
  doc.text("Etat: " + emergencyClean(movement.etatArticles), 15, yPos);
}
```

## PDF Layout Comparison

### Before Fix (After QC with Defects)
```
┌─────────────────────────────────────┐
│ Bon d'Entree                        │
├─────────────────────────────────────┤
│ ID: 123                             │
│ Date: 2026-03-28                    │
│ Article: Gants Nitrile M            │
│ Quantite Saisie: 100 Paire      ❌  │
│ Numero de Lot: LOT-001              │
│ Destination: Zone A                 │
│ Operateur: Jean D.                  │
└─────────────────────────────────────┘

Stock Increase: 85 units (doesn't match PDF!)
```

### After Fix (After QC with Defects)
```
┌─────────────────────────────────────┐
│ Bon d'Entree                        │
├─────────────────────────────────────┤
│ ID: 123                             │
│ Date: 2026-03-28                    │
│ Article: Gants Nitrile M            │
│ Numero de Lot: LOT-001              │
│ Destination: Zone A                 │
│ Operateur: Jean D.                  │
│                                     │
│ Controle Qualite                ✅  │
│ ┌─────────────────────────────────┐ │
│ │ Quantite Totale Recue: 100     │ │
│ │ Quantite Defectueuse: 15 (RED) │ │
│ │ Quantite Acceptee: 85 (GREEN)  │ │
│ │                                 │ │
│ │ Controle par: Marie L.          │ │
│ │ Etat: Conforme                  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Stock Increase: 85 units ✅ MATCHES PDF!
```

### Before QC Inspection (Pending)
```
┌─────────────────────────────────────┐
│ Bon d'Entree                        │
├─────────────────────────────────────┤
│ ID: 124                             │
│ Date: 2026-03-28                    │
│ Article: Masques FFP2               │
│ Quantite Saisie: 500 Unité          │
│ Numero de Lot: LOT-002              │
│ Destination: Zone D                 │
│ Operateur: Sophie R.                │
│                                     │
│ En attente de validation qualite    │
│ (ORANGE)                            │
└─────────────────────────────────────┘

Stock Increase: 0 units (pending QC)
```

## Quality Control Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    ENTRÉE CREATED                           │
│              (Supplier delivers 100 units)                  │
│              Status: "En attente"                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PDF GENERATED (Before QC)                      │
│              Shows: "Quantite Saisie: 100"                  │
│              Shows: "En attente de validation"              │
│              Stock Impact: 0 (pending)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              QC INSPECTION PERFORMED                        │
│              Finds: 15 defective, 85 valid                  │
│              Status: "Terminé"                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PDF GENERATED (After QC)                       │
│              Shows: "Quantite Totale Recue: 100"            │
│              Shows: "Quantite Defectueuse: 15" (RED)        │
│              Shows: "Quantite Acceptee: 85" (GREEN) ✅      │
│              Stock Impact: +85 units ✅                     │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Synchronization

### Database/State
```typescript
// In DataContext.tsx - approveQualityControl()
const validQty = etatArticles === "Non-conforme" 
  ? mouvement.qte - unitesDefectueuses 
  : mouvement.qte;

// Only valid quantity is added to stock
updateArticle(article.id, { 
  stock: newStock + validQty  // ✅ Only accepted units
});
```

### PDF Generation
```typescript
// In pdf-generator.ts - generateInboundPDF()
const validQty = formatQty(
  movement.validQuantity !== undefined 
    ? movement.validQuantity  // ✅ Same value as stock increase
    : movement.qte
);

doc.text("Quantite Acceptee (Stock): " + validQty + " " + unit);
```

**Result:** PDF quantity matches database stock increase exactly! ✅

## Use Cases

### Case 1: Perfect Delivery (No Defects)
```
Receive: 100 units
QC Inspection: All conform
Defective: 0
Accepted: 100

PDF Shows:
- Quantite Totale Recue: 100
- Quantite Defectueuse: 0
- Quantite Acceptee (Stock): 100 ✅

Stock Increase: +100 ✅
```

### Case 2: Partial Defects
```
Receive: 100 units
QC Inspection: Some defects found
Defective: 15
Accepted: 85

PDF Shows:
- Quantite Totale Recue: 100
- Quantite Defectueuse: 15 (RED)
- Quantite Acceptee (Stock): 85 ✅

Stock Increase: +85 ✅
```

### Case 3: Complete Rejection
```
Receive: 100 units
QC Inspection: All defective
Defective: 100
Accepted: 0

PDF Shows:
- Quantite Totale Recue: 100
- Quantite Defectueuse: 100 (RED)
- Quantite Acceptee (Stock): 0 ✅

Stock Increase: 0 ✅
```

### Case 4: Pending Inspection
```
Receive: 100 units
QC Inspection: Not yet performed
Status: "En attente"

PDF Shows:
- Quantite Saisie: 100
- En attente de validation qualite (ORANGE)

Stock Increase: 0 (pending) ✅
```

## Legal Compliance

The PDF now serves as a **legal warehouse receipt** that:

1. ✅ **Accurately reflects stock entry**: Only shows accepted units
2. ✅ **Documents defects**: Clear record of rejected units
3. ✅ **Traceability**: Shows QC controller and inspection results
4. ✅ **Audit trail**: Matches database stock exactly
5. ✅ **Supplier disputes**: Clear evidence of defective deliveries
6. ✅ **Regulatory compliance**: Professional QC documentation

## Benefits

1. **Accuracy**: PDF quantity matches actual stock increase
2. **Transparency**: Clear breakdown of total vs. accepted quantities
3. **Professional**: Bordered QC section with color coding
4. **Legal**: Valid receipt for warehouse operations
5. **Traceability**: Complete QC inspection details
6. **Compliance**: Meets quality control documentation standards

## Files Modified

**src/lib/pdf-generator.ts**
- Updated `generateInboundPDF()` function
- Added QC inspection detection logic
- Added professional QC breakdown section
- Implemented color coding (red for defects, green for accepted)
- Added QC controller and status information
- Made PDF content dynamic based on inspection status

## Testing Checklist

- [x] Generate PDF before QC → Shows "Quantite Saisie" and "En attente"
- [x] Generate PDF after QC (no defects) → Shows breakdown with 0 defective
- [x] Generate PDF after QC (with defects) → Shows correct breakdown
- [x] Defective quantity appears in red
- [x] Accepted quantity appears in green
- [x] QC controller name appears
- [x] PDF quantity matches stock increase in database
- [x] No syntax errors or compilation issues

## Impact

### Before Fix
- ❌ PDF showed initial quantity regardless of QC results
- ❌ No visibility of defective units
- ❌ PDF didn't match actual stock increase
- ❌ Not suitable as legal receipt

### After Fix
- ✅ PDF shows validated quantity after QC
- ✅ Clear breakdown of defective vs. accepted units
- ✅ PDF matches database stock exactly
- ✅ Professional legal receipt for warehouse

## Date
March 28, 2026
