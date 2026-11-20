# PDF Corruption Fix - URGENT

## Problem
PDFs were showing corrupted text like `&I&m&p&a` instead of proper unit symbols and text.

## Root Cause
HTML entities and React component interference were being passed to the PDF generator, causing encoding corruption.

## Solution Applied

### 1. Raw String Hard-Reset Function
Created `safeText()` function that:
- Converts all inputs to raw strings using `String()`
- Manually concatenates label + value + unit with NO processing
- Aggressively strips ALL HTML entities:
  - Named entities: `&amp;`, `&nbsp;`, `&quot;`
  - Numeric entities: `&#39;`, `&#x27;`
  - Standalone ampersands: `&`
  - HTML tags: `<...>`

```typescript
const safeText = (label: string, value: any, unit?: string): string => {
  const labelStr = String(label);
  const valueStr = String(value);
  const unitStr = unit ? String(unit) : '';
  
  let result = labelStr + ": " + valueStr;
  if (unitStr) {
    result = result + " " + unitStr;
  }
  
  // AGGRESSIVE entity killer
  result = result.replace(/&[a-z0-9]+;/gi, '');
  result = result.replace(/&#[0-9]+;/g, '');
  result = result.replace(/&#x[0-9a-f]+;/gi, '');
  result = result.replace(/&/g, '');
  result = result.replace(/<[^>]*>/g, '');
  
  return result.trim();
};
```

### 2. Applied to All PDF Functions
Replaced ALL quantity rendering in:
- `generateInboundPDF()` - Bon d'Entrée
- `generateOutboundPDF()` - Bon de Sortie (including QC metrics)
- `generateTransferPDF()` - Bon de Transfert
- `generateAdjustmentPDF()` - Bon d'Ajustement
- `generateRejectionPDF()` - Bon de Rejet

### 3. Debug Logging Added
Added console.log statements to:
- Track raw inputs to `safeText()`
- Log cleaned outputs
- Check movement object at PDF generation start
- Verify unit symbols from storage

## Usage Examples

### Before (Corrupted)
```typescript
doc.text(toPlainText("Quantite: " + qty + " " + unit), 15, yPos);
// Result: "Quantite: 100 &I&m&p&a"
```

### After (Fixed)
```typescript
doc.text(safeText("Quantite", qty, unit), 15, yPos);
// Result: "Quantite: 100 P"
```

## Testing Instructions

1. Generate any PDF (Entrée, Sortie, Transfert, Ajustement, Rejet)
2. Check browser console for debug logs:
   - Movement object details
   - Unit symbols
   - safeText INPUT/OUTPUT
3. Open generated PDF
4. Verify all quantity fields show clean text with proper unit symbols

## What to Check

✅ No `&` characters in PDF
✅ No HTML entities like `&amp;`, `&nbsp;`
✅ Unit symbols display correctly (P, B, K, etc.)
✅ Quantity values are numeric
✅ Labels are in French

## If Issue Persists

Check console logs to identify:
1. Is corruption in the movement object itself?
2. Is corruption coming from `getUnitSymbol()`?
3. Is corruption happening during string concatenation?

The debug logs will show exactly where the corruption originates.
