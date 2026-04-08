# Sortie Defective Items - Waste/Loss Logic Implementation

## Overview

Implemented strict "Total Deduction" logic for Sortie movements with defective items. When items are found to be defective during exit inspection, they are permanently removed from usable stock as waste/loss, ensuring the warehouse stock only reflects good, usable inventory.

## Business Rule

**CRITICAL PRINCIPLE**: In a Sortie movement, ALL units (including defective ones) MUST be deducted from stock because they are physically leaving the warehouse and are no longer part of the usable inventory.

### Why This Matters

```
Scenario: Warehouse has 100 units
Action: Sortie for 100 units
QC Inspection: All 100 units are defective
Result: Stock MUST become 0 (not remain at 100)
Reason: Defective items are waste/loss, not usable inventory
```

## Implementation Details

### 1. Stock Deduction Logic (Already Correct)

The DataContext already implements the correct logic:

```typescript
if (mouvement.type === "Sortie") {
  // SORTIE: ALL units (including defective) have physically left the warehouse
  // We ALWAYS deduct the TOTAL quantity from inventory
  // Defective units are a PERMANENT LOSS and are NOT added back to stock
  const totalQtyToDeduct = mouvement.qte;

  if (mouvement.emplacementSource) {
    const updatedLocations = article.locations.map(loc => {
      if (loc.emplacementNom === mouvement.emplacementSource) {
        return { ...loc, quantite: Math.max(0, loc.quantite - totalQtyToDeduct) };
      }
      return loc;
    }).filter(l => l.quantite > 0);
    
    updateArticle(article.id, { 
      stock: Math.max(0, article.stock - totalQtyToDeduct),
      locations: updatedLocations 
    });
  }
}
```

**Key Points:**
- ✅ Deducts TOTAL quantity (not just valid quantity)
- ✅ Updates both article stock and location stock
- ✅ Removes location if quantity becomes 0
- ✅ Defective units are NOT added back to stock

### 2. Enhanced UI Feedback

Updated the toast message to clearly communicate waste/loss:

```typescript
// UPDATED: Specific message for defective Sortie (waste/loss)
let message = "";
if (mouvement?.type === "Sortie") {
  if (qcFormData.etatArticles === "Non-conforme" && qcFormData.unitesDefectueuses > 0) {
    // Defective Sortie - items are waste/loss
    const validQty = mouvement.qte - qcFormData.unitesDefectueuses;
    if (validQty === 0) {
      // 100% defective - all waste
      message = `✓ Sortie traitée : ${mouvement.qte} unités retirées du stock (Perte/Défectueux - 100% rebut)`;
    } else {
      // Partial defective
      message = `✓ Sortie traitée : ${mouvement.qte} unités retirées du stock (${validQty} valides, ${qcFormData.unitesDefectueuses} défectueuses)`;
    }
  } else {
    // All conform
    message = `✓ Sortie validée : ${mouvement.qte} unités retirées du stock (Conforme)`;
  }
}
```

**Toast Messages:**
- 100% defective: "✓ Sortie traitée : 100 unités retirées du stock (Perte/Défectueux - 100% rebut)"
- Partial defective: "✓ Sortie traitée : 100 unités retirées du stock (85 valides, 15 défectueuses)"
- All conform: "✓ Sortie validée : 100 unités retirées du stock (Conforme)"

### 3. PDF Waste/Loss Indication

Updated Bon de Sortie PDF to clearly indicate waste/loss cases:

```typescript
// Check if this is a waste/loss case (100% defective)
const isWasteLoss = movement.defectiveQuantity !== undefined && 
                    movement.defectiveQuantity === movement.qte;

const title = isWasteLoss ? "Bon de Sortie (Articles Non-conformes)" : "Bon de Sortie";
```

**PDF Changes:**
- Title changes to "Bon de Sortie (Articles Non-conformes)" for 100% defective
- Adds line: "Type: Sortie (Articles Non-conformes - Mise au Rebut)"
- Adds note: "Note: Tous les articles sont non-conformes et mis au rebut (perte totale)"

## Workflow Comparison

### Case 1: 100% Defective Sortie (Waste/Loss)

```
┌─────────────────────────────────────────────────────────────┐
│ INITIAL STATE                                               │
│ Stock: 100 units in "Zone A"                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ SORTIE CREATED                                              │
│ Quantity: 100 units                                         │
│ Status: "En attente de validation Qualité"                 │
│ Stock Impact: NONE (pending)                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ QC INSPECTION                                               │
│ Controller finds: ALL 100 units defective                  │
│ Decision: Approve as "Non-conforme"                        │
│ Defective Units: 100                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STOCK UPDATE (CRITICAL)                                     │
│ Total Deduction: 100 units ✅                              │
│ Valid Units: 0 (none usable)                               │
│ Defective Units: 100 (waste/loss)                          │
│ New Stock: 0 ✅                                            │
│ Location "Zone A": 0 (removed) ✅                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ UI FEEDBACK                                                 │
│ Toast: "✓ Sortie traitée : 100 unités retirées du stock   │
│         (Perte/Défectueux - 100% rebut)"                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ PDF GENERATED                                               │
│ Title: "Bon de Sortie (Articles Non-conformes)"            │
│ Type: "Sortie (Articles Non-conformes - Mise au Rebut)"    │
│ Quantite Totale: 100                                       │
│ Quantite Valide: 0                                         │
│ Quantite Defectueuse: 100                                  │
│ Note: "Tous les articles sont non-conformes et mis au      │
│        rebut (perte totale)"                               │
└─────────────────────────────────────────────────────────────┘
```

### Case 2: Partial Defective Sortie

```
┌─────────────────────────────────────────────────────────────┐
│ INITIAL STATE                                               │
│ Stock: 100 units in "Zone A"                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ SORTIE CREATED                                              │
│ Quantity: 100 units                                         │
│ Status: "En attente de validation Qualité"                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ QC INSPECTION                                               │
│ Controller finds: 15 units defective, 85 valid             │
│ Decision: Approve as "Non-conforme"                        │
│ Defective Units: 15                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STOCK UPDATE (CRITICAL)                                     │
│ Total Deduction: 100 units ✅                              │
│ Valid Units: 85 (shipped successfully)                     │
│ Defective Units: 15 (waste/loss)                           │
│ New Stock: 0 ✅                                            │
│ Location "Zone A": 0 (removed) ✅                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ UI FEEDBACK                                                 │
│ Toast: "✓ Sortie traitée : 100 unités retirées du stock   │
│         (85 valides, 15 défectueuses)"                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ PDF GENERATED                                               │
│ Title: "Bon de Sortie"                                     │
│ Quantite Totale: 100                                       │
│ Quantite Valide: 85                                        │
│ Quantite Defectueuse: 15                                   │
└─────────────────────────────────────────────────────────────┘
```

### Case 3: All Conform Sortie

```
┌─────────────────────────────────────────────────────────────┐
│ INITIAL STATE                                               │
│ Stock: 100 units in "Zone A"                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ QC INSPECTION                                               │
│ Controller finds: All 100 units conform                    │
│ Decision: Approve as "Conforme"                            │
│ Defective Units: 0                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STOCK UPDATE                                                │
│ Total Deduction: 100 units ✅                              │
│ Valid Units: 100 (all shipped successfully)                │
│ Defective Units: 0                                         │
│ New Stock: 0 ✅                                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ UI FEEDBACK                                                 │
│ Toast: "✓ Sortie validée : 100 unités retirées du stock   │
│         (Conforme)"                                        │
└─────────────────────────────────────────────────────────────┘
```

## Key Principles

### 1. Total Deduction Rule

**Rule:** In Sortie, ALWAYS deduct the TOTAL quantity from stock, regardless of how many are defective.

**Reason:** 
- Valid units: Successfully shipped/transferred (left warehouse)
- Defective units: Waste/loss (also left warehouse, but unusable)
- Both categories physically left the warehouse
- Neither should remain in usable stock count

### 2. Waste/Loss Classification

**Defective items in Sortie are classified as:**
- Permanent loss
- Waste/scrap
- Not returned to inventory
- Not available for future use

### 3. Stock Accuracy

**Goal:** Warehouse stock ONLY reflects good, usable items.

**Formula:**
```
Usable Stock = Total Physical Stock - Defective Items
```

**Example:**
- Had: 100 units
- Sortie: 100 units (all defective)
- Usable Stock: 0 ✅ (correct)
- NOT: 100 ❌ (would be incorrect)
```

## PDF Document Types

### Standard Sortie (Conform or Partial Defective)
```
Title: "Bon de Sortie"
Content: Standard exit document
```

### Waste/Loss Sortie (100% Defective)
```
Title: "Bon de Sortie (Articles Non-conformes)"
Type Line: "Type: Sortie (Articles Non-conformes - Mise au Rebut)"
Note: "Tous les articles sont non-conformes et mis au rebut (perte totale)"
```

## Files Modified

### 1. src/pages/ControleQualitePage.tsx
- Updated `handleSubmitQC()` function
- Added specific toast messages for defective Sortie cases
- Distinguishes between 100% defective, partial defective, and all conform
- Clear communication of waste/loss

### 2. src/lib/pdf-generator.ts
- Updated `generateOutboundPDF()` function
- Detects 100% defective cases (`isWasteLoss`)
- Changes PDF title for waste/loss cases
- Adds "Type: Sortie (Articles Non-conformes - Mise au Rebut)" line
- Adds waste/loss note at bottom

### 3. src/contexts/DataContext.tsx
- No changes needed (logic already correct)
- Already deducts total quantity for Sortie
- Already updates both article and location stock

## Testing Checklist

- [x] 100% defective Sortie: Stock becomes 0
- [x] 100% defective Sortie: Location removed
- [x] 100% defective Sortie: Toast shows "Perte/Défectueux - 100% rebut"
- [x] 100% defective Sortie: PDF title includes "(Articles Non-conformes)"
- [x] 100% defective Sortie: PDF shows waste/loss note
- [x] Partial defective Sortie: Total quantity deducted
- [x] Partial defective Sortie: Toast shows breakdown (X valides, Y défectueuses)
- [x] All conform Sortie: Works as before
- [x] Articles table updates immediately
- [x] Emplacements modal updates immediately
- [x] No syntax errors or compilation issues

## Business Impact

### Before (If Logic Was Wrong)
- ❌ Defective items might remain in stock count
- ❌ Stock numbers don't reflect reality
- ❌ Warehouse appears to have more usable inventory than actual
- ❌ Planning and ordering decisions based on incorrect data

### After (Correct Logic)
- ✅ Stock only reflects usable, good items
- ✅ Defective items properly classified as waste/loss
- ✅ Accurate inventory for planning and ordering
- ✅ Clear documentation of waste/loss events
- ✅ Proper audit trail for defective items

## Compliance

This implementation ensures:
- ✅ **Inventory Accuracy**: Stock reflects only usable items
- ✅ **Waste Tracking**: Defective items properly documented as loss
- ✅ **Audit Trail**: Clear PDF documentation of waste events
- ✅ **Financial Accuracy**: Loss properly recorded for accounting
- ✅ **Operational Clarity**: Staff understand items are permanently removed

## Date
March 28, 2026
