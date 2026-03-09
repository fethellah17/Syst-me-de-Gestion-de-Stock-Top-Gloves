# PDF HTML Entity Fix - Complete Refactoring

## Problem
PDFs were displaying corrupted text with HTML-escaped characters like `&I&m&p...` instead of plain text. This was caused by HTML entities being passed directly to jsPDF without proper sanitization.

## Solution Implemented

### 1. New Aggressive Sanitization Function
Created `toPlainText()` function that strips ALL HTML entities:

```typescript
const toPlainText = (text: string | number | undefined | null): string => {
  if (text === undefined || text === null) return '';
  
  let str = String(text);
  
  // Strip all HTML entity patterns aggressively
  str = str.replace(/&[a-z0-9]+;/gi, '');        // Named entities: &amp; &nbsp;
  str = str.replace(/&#[0-9]+;/g, '');           // Numeric: &#39;
  str = str.replace(/&#x[0-9a-f]+;/gi, '');      // Hex: &#x27;
  str = str.replace(/&/g, '');                   // Standalone &
  str = str.replace(/<[^>]*>/g, '');             // HTML tags
  
  return str.trim();
};
```

### 2. Direct Text Placement
Replaced all intermediate string construction with direct `toPlainText()` calls:

**Before:**
```typescript
const line1 = "ID du Mouvement: " + cleanText(movement.id);
doc.text(decodeHTML(line1), 15, yPos);
```

**After:**
```typescript
doc.text(toPlainText("ID du Mouvement: " + String(movement.id)), 15, yPos);
```

### 3. Force String Casting
All dynamic values are now wrapped in `String()` before concatenation:

```typescript
doc.text(toPlainText("Quantite: " + String(qty) + " " + String(unit)), 15, yPos);
```

### 4. Hardcoded Labels
All labels are now hardcoded strings in the code, not pulled from translation files:
- "Quantite Saisie:" ✓
- "Impact Stock:" ✓
- "Numero de Lot:" ✓
- "Date de lot:" ✓

### 5. Updated All PDF Functions
Applied the fix to all 5 PDF generators:
1. ✅ `generateInboundPDF` (Bon d'Entrée)
2. ✅ `generateOutboundPDF` (Bon de Sortie)
3. ✅ `generateTransferPDF` (Bon de Transfert)
4. ✅ `generateAdjustmentPDF` (Bon d'Ajustement)
5. ✅ `generateRejectionPDF` (Bon de Rejet)

### 6. No DOM Scraping
- Removed all `html2canvas` or `doc.html()` usage
- Using only `doc.text()` direct API
- Manual PDF construction with precise text placement

## Key Changes

### Helper Functions Updated
- `toPlainText()`: New aggressive sanitizer (replaces `decodeHTML`)
- `formatQuantity()`: Now uses `toPlainText()`
- `getUnitDisplay()`: Now uses `toPlainText()`
- `cleanText()`: Now aliases to `toPlainText()`

### Header Function
- `renderHeader()`: All text now uses `toPlainText()`
- Company name, title, date labels all sanitized

### Template Generator
- Filename generation now sanitized
- Signature text sanitized

## Testing Checklist

Test each PDF type to verify no HTML entities appear:

- [ ] Bon d'Entrée - Check "Quantité Saisie" and "Impact Stock"
- [ ] Bon de Sortie - Check QC metrics section
- [ ] Bon de Transfert - Check zone names
- [ ] Bon d'Ajustement - Check adjustment type and reason
- [ ] Bon de Rejet - Check rejection reason text

## Expected Result

All PDFs should now display clean, plain text:
- ✅ "Quantité Saisie: 100 P"
- ✅ "Impact Stock: 1000 B"
- ❌ No more "&I&m&p&a&c&t..."

## Technical Notes

- All text passes through `toPlainText()` before reaching jsPDF
- No React-specific object binding can reach the PDF
- String concatenation happens before sanitization
- Labels are compile-time constants, not runtime translations
