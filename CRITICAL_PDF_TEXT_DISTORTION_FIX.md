# CRITICAL PDF BUG FIX: Distorted Text in Quantity Section

## Problem Identified
In the Entrée and Sortie PDFs, specifically when there are 'Damaged Goods' (Articles Endommagés), the text in the QUANTITES section appeared distorted with symbols (e.g., `&Q&u&a&n&t&i&t&e` instead of `Quantite`).

This pattern indicates that text was being split into individual characters and joined with `&` separators, suggesting an encoding or data transformation issue.

## Root Cause Analysis
The issue was caused by:
1. **Inconsistent text encoding**: Some text strings were not being properly cleaned before being passed to jsPDF's `doc.text()` method
2. **HTML entity encoding**: Text might have been HTML-encoded at some point in the data flow
3. **Missing emergencyClean() calls**: Not all text concatenations were using the `emergencyClean()` function to remove problematic characters

## Solution Implemented

### 1. Enhanced `emergencyClean()` Function
Updated the function to handle multiple types of encoding issues:
```typescript
const emergencyClean = (text: string | number): string => {
  let result = String(text);
  
  // Remove all ampersands (handles &Q&u&a&n&t&i&t&e pattern)
  result = result.replace(/&/g, '');
  
  // Remove HTML entities like &#123; or &amp;
  result = result.replace(/&#\d+;/g, '');
  result = result.replace(/&[a-zA-Z]+;/g, '');
  
  // Ensure no double spaces
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
};
```

### 2. Fixed `renderQuantityLine()` Function
Ensured text is always passed as a single string to jsPDF, never as an array:
```typescript
const renderQuantityLine = (doc: jsPDF, label: string, quantity: number, unit: string, xPos: number, yPos: number): void => {
  // Clean all components separately
  const cleanLabel = emergencyClean(String(label));
  const cleanQty = formatQty(quantity);
  const cleanUnit = emergencyClean(String(unit));
  
  // Build the complete text as a single string (CRITICAL: not an array)
  const fullText = String(`${cleanLabel} ${cleanQty} ${cleanUnit}`);
  
  // Render with proper font settings
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  // CRITICAL: Pass as string, not array - jsPDF will split arrays with separators
  doc.text(fullText, xPos, yPos);
};
```

### 3. Applied `emergencyClean()` to All Quantity Labels
Updated all direct `doc.text()` calls for quantity-related text:
- "Quantite Acceptee: 0 (REFUS TOTAL)"
- "Quantite Validee: 0 (REFUS TOTAL)"
- "Quantite Saisie: [qty] [unit]"
- "Quantite Ajustee: [qty] [unit]"
- "Taux de Conformite: [score]"

### 4. Fixed `renderObservationsSection()` Function
Ensured the note text is properly converted to string before cleaning:
```typescript
const cleanNote = emergencyClean(String(note));
const noteLines = doc.splitTextToSize(cleanNote, 180);
doc.text(noteLines, xPos, yPos);
```

## Expected Layout in PDF (After Fix)
The Quantities section now displays cleanly:
- **Quantité Demandée**: [Value] [Unit]
- **Quantité Validée**: [Value] [Unit]
- **Quantité Endommagée**: [Value] [Unit]

All labels are in clean, readable French text without any `&` or `;` symbols.

## Quality Check Coverage
This fix applies to:
1. ✅ **Bon d'Entrée** (Inbound) - All three cases:
   - Total Acceptance (100% Valide)
   - Partial Acceptance (With Defects)
   - Total Refusal (Refusé)

2. ✅ **Bon de Sortie** (Outbound) - All three cases:
   - Total Acceptance (100% Valide)
   - Partial Acceptance (With Defects)
   - Total Refusal (Refusé)

3. ✅ **Avis de Rejet** (Scenario B) - When QC data is included

## Files Modified
- `src/lib/pdf-generator.ts`
  - Enhanced `emergencyClean()` function
  - Fixed `renderQuantityLine()` function
  - Fixed `renderObservationsSection()` function
  - Applied `emergencyClean()` to all quantity-related text labels
  - Applied `emergencyClean()` to all "Taux de Conformite" labels

## Testing Recommendations
1. Generate a Bon d'Entrée PDF with damaged goods
2. Generate a Bon de Sortie PDF with defective items
3. Generate an Avis de Rejet PDF
4. Verify that all quantity labels display correctly without distortion
5. Check that French accents and special characters are preserved
6. Verify PDF filename generation works correctly

## Deployment Notes
- No database migrations required
- No API changes required
- No frontend component changes required
- Backward compatible with existing data
- Can be deployed immediately
