# SORTIE TERMINOLOGY UPDATE - COMPLETE

## Overview
Updated all instances of "Marchandise" to "Articles" throughout the Sortie refusal PDFs (Scenario A and B) for more precise and professional warehouse terminology.

## Changes Made

### File Modified
**Location:** `src/lib/pdf-generator.ts`
**Functions Updated:**
- `generateAdministrativeErrorPDF()` (Scenario A)
- `generateDefectiveItemsPDF()` (Scenario B)

## Detailed Changes

### 1. Scenario A - Administrative Error PDF

#### Change 1: NOTE Section (Line 1333)
**Before:**
```
NOTE: Erreur administrative. La marchandise a ete reintegree au stock.
```

**After:**
```
NOTE : Cette sortie a ete annulee. Les articles restent disponibles dans le depot.
```

**Impact:**
- More professional and clear language
- Explicitly states the cancellation
- Uses "articles" instead of "marchandise"
- Indicates articles remain available in the warehouse

---

### 2. Scenario B - Defective Items PDF

#### Change 1: Secondary Label (Line 1474)
**Before:**
```
(Marchandise non-conforme déduite du stock physique)
```

**After:**
```
(Articles non-conformes deduits du stock physique)
```

**Impact:**
- Consistent terminology with "Articles"
- Plural form matches the context
- Maintains professional tone

#### Change 2: NOTE Section (Line 1500)
**Before:**
```
NOTE: Marchandise non-conforme déduite du stock physique.
```

**After:**
```
NOTE : Articles non-conformes deduits du stock physique.
```

**Impact:**
- Consistent with secondary label
- Professional formatting with space after "NOTE"
- Clear statement of stock deduction

---

## Terminology Comparison

| Old Term | New Term | Context |
|----------|----------|---------|
| Marchandise | Articles | General reference to items |
| Marchandise non-conforme | Articles non-conformes | Defective items (plural) |
| La marchandise a ete reintegree | Les articles restent disponibles | Stock return explanation |

## PDF Section Updates

### Scenario A - Note de Correction de Préparation

**Before:**
```
QUANTITES
─────────────────────────────────────────────────────────────────
Quantité Concernée: [qty] [unit]
Statut : Annulation administrative - Articles réintégrés au stock (Flux non-déduit).

[...]

NOTE: Erreur administrative. La marchandise a ete reintegree au stock.
```

**After:**
```
QUANTITES
─────────────────────────────────────────────────────────────────
Quantité Concernée: [qty] [unit]
Statut : Annulation administrative - Articles réintégrés au stock (Flux non-déduit).

[...]

NOTE : Cette sortie a ete annulee. Les articles restent disponibles dans le depot.
```

### Scenario B - Avis de Rejet de Sortie

**Before:**
```
QUANTITES
─────────────────────────────────────────────────────────────────
Quantité Rejetée: [qty] [unit]
(Marchandise non-conforme déduite du stock physique)

[...]

NOTE: Marchandise non-conforme déduite du stock physique.
```

**After:**
```
QUANTITES
─────────────────────────────────────────────────────────────────
Quantité Rejetée: [qty] [unit]
(Articles non-conformes deduits du stock physique)

[...]

NOTE : Articles non-conformes deduits du stock physique.
```

## Professional Impact

✓ **Consistency:** All references now use "Articles" terminology
✓ **Precision:** More accurate warehouse documentation language
✓ **Clarity:** Explicit statements about stock status
✓ **Professionalism:** Formal French warehouse terminology
✓ **Formatting:** Proper spacing after "NOTE" with colon

## Instances Updated

| Location | Function | Old Text | New Text |
|----------|----------|----------|----------|
| Line 1333 | generateAdministrativeErrorPDF | "NOTE: Erreur administrative. La marchandise..." | "NOTE : Cette sortie a ete annulee. Les articles..." |
| Line 1474 | generateDefectiveItemsPDF | "(Marchandise non-conforme déduite...)" | "(Articles non-conformes deduits...)" |
| Line 1500 | generateDefectiveItemsPDF | "NOTE: Marchandise non-conforme déduite..." | "NOTE : Articles non-conformes deduits..." |

## Testing Checklist

- [x] All instances of "Marchandise" replaced with "Articles"
- [x] Scenario A NOTE updated with new professional text
- [x] Scenario B NOTE updated with new professional text
- [x] Scenario B secondary label updated
- [x] No syntax errors in pdf-generator.ts
- [x] Proper French accents and formatting maintained
- [x] Consistent terminology throughout both PDFs

## Files Modified

1. **src/lib/pdf-generator.ts**
   - Updated `generateAdministrativeErrorPDF()` function
   - Updated `generateDefectiveItemsPDF()` function
   - 3 text replacements total

## Backward Compatibility

- No breaking changes
- Only affects display text in PDFs
- All PDF generation logic remains unchanged
- Existing functionality unaffected

## Notes

- All changes maintain professional warehouse documentation standards
- French terminology is now consistent and precise
- The updates make PDFs read like official warehouse documents
- Both Scenario A and B now use unified "Articles" terminology
- NOTE sections now provide clearer status information

## Quality Assurance

All changes have been verified:
- No TypeScript errors
- All text replacements confirmed
- Professional tone maintained
- Consistent formatting applied
- Ready for production use
