# Bon de Rejet - Fixed Template Implementation

## Overview
Updated ONLY the `generateRejectionPDF` function with a fixed-template design approach using absolute positioning. All other PDF functions remain unchanged.

## Implementation Details

### Design Approach: Fixed-Template
- **No dynamic tables**: All fields use absolute positioning with `doc.text(x, y)`
- **Static layout**: Predictable coordinates for every element
- **Monochrome only**: Everything in Black (#000000)

## Document Structure

### Header Section (Fixed Coordinates)
```
Logo: Square 25x25mm at (10, 10)
Company Name: "Top Gloves" at (10, 40)
Title: "Bon de Rejet" at (200, 20) - right aligned
Report Date: at (200, 28) - right aligned
Separator Line: from (10, 48) to (200, 48)
```

### Body Content (Fixed Layout - Exact Order)
All fields positioned with absolute Y coordinates:

| Field | Y Position | Format |
|-------|-----------|--------|
| ID du Mouvement | 60 | `ID du Mouvement: [value]` |
| Date | 70 | `Date: [value]` |
| Article | 80 | `Article: [value]` |
| Type | 90 | `Type: Sortie` (hardcoded) |
| Quantité | 100 | `Quantité: [value]` |
| Numéro de Lot | 110 | `Numéro de Lot: [value or N/A]` |
| Date du Lot | 120 | `Date du Lot: [formatted date or N/A]` |
| Emplacement Source | 130 | `Emplacement Source: [value or N/A]` |
| Destination | 140 | `Destination: Retour Fournisseur` (hardcoded) |
| Opérateur | 150 | `Opérateur: [value]` |
| Contrôleur Qualité | 160 | `Contrôleur Qualité: [value or N/A]` |
| Raison du Rejet (Label) | 175 | `Raison du Rejet:` (bold) |
| Raison du Rejet (Text) | 185 | `[rejection reason with word wrap]` |

### Signature Section (Fixed Coordinates - Bottom Right)
```
Signature Text: "Signature du Contrôleur Qualité:" at (120, 260)
Signature Line: from (120, 268) to (200, 268)
```

## Key Features

### 1. Absolute Positioning
- Every field has a fixed Y coordinate
- No dynamic calculation or incremental positioning
- Layout is 100% predictable and consistent

### 2. Hardcoded Values
- **Type**: Always displays "Sortie" (rejection is only for outbound movements)
- **Destination**: Always displays "Retour Fournisseur" (rejected items return to supplier)

### 3. Monochrome Design
- All text: Black (#000000)
- All lines: Black (#000000)
- No colors whatsoever (no red, green, orange, etc.)

### 4. Fallback Support
- Includes fallback layout if logo fails to load
- Adjusted Y positions for no-logo scenario
- Same field order and structure maintained

### 5. Word Wrap for Rejection Reason
- Uses `doc.splitTextToSize()` for long rejection reasons
- Maximum width: 180 units
- Maintains readability for lengthy explanations

## File Naming
```
Bon_Rejet_[ID].pdf
```
Example: `Bon_Rejet_1234.pdf`

## Changes Made

### Modified Function
- ✅ `generateRejectionPDF()` - Complete rewrite with fixed template

### Unchanged Functions
- ✅ `generatePDFTemplate()` - No changes
- ✅ `generateInboundPDF()` - No changes
- ✅ `generateOutboundPDF()` - No changes
- ✅ `generateTransferPDF()` - No changes
- ✅ `generateAdjustmentPDF()` - No changes

## Technical Implementation

### Before (Dynamic Template)
```typescript
generatePDFTemplate(
  doc,
  "Rapport de Rejet",
  movement,
  "Signature du Contrôleur Qualité:",
  (doc, yPos) => {
    // Dynamic positioning with yPos increments
    doc.text(`Field: ${value}`, 15, yPos);
    yPos += 7; // Dynamic increment
  }
);
```

### After (Fixed Template)
```typescript
// Direct PDF generation with absolute coordinates
doc.text(`ID du Mouvement: ${movement.id}`, 15, 60);
doc.text(`Date: ${movement.date}`, 15, 70);
doc.text(`Article: ${movement.article}`, 15, 80);
// ... all fields with fixed Y positions
```

## Compliance Checklist

- ✅ Fixed-template design (no dynamic tables)
- ✅ Absolute positioning for all fields
- ✅ Exact field order as specified
- ✅ Monochrome design (black only)
- ✅ Square logo at top-left
- ✅ "Top Gloves" below logo
- ✅ Signature at bottom-right
- ✅ Type hardcoded as "Sortie"
- ✅ Destination hardcoded as "Retour Fournisseur"
- ✅ All required fields included
- ✅ Static and predictable layout
- ✅ Isolated change (other PDFs unchanged)

## Testing Checklist

- [ ] PDF generates with logo
- [ ] PDF generates without logo (fallback)
- [ ] All fields appear at correct Y positions
- [ ] "Type: Sortie" displays correctly
- [ ] "Destination: Retour Fournisseur" displays correctly
- [ ] Rejection reason wraps properly for long text
- [ ] Signature section at bottom-right
- [ ] File saves as `Bon_Rejet_[ID].pdf`
- [ ] All text is black (no colors)
- [ ] Layout is consistent across different movements

## Status
🟢 **COMPLETE** - Bon de Rejet now uses fixed-template design with absolute positioning. All other PDF functions remain unchanged.
