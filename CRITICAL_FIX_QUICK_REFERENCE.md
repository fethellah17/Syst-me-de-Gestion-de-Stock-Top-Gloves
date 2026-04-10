# Critical PDF Unit Consistency Fix - Quick Reference

## The Bug
Total acceptance showed wrong unit in PDF.

**Before:**
```
Reception: 5 Boîtes
PDF: "Quantite Acceptee: 5 Paires" ❌ WRONG
```

**After:**
```
Reception: 5 Boîtes
PDF: "Quantite Acceptee: 5 Boîtes" ✅ CORRECT
```

---

## The Fix

### Case A: Total Acceptance
Display quantities in **Entry Unit** (original reception unit)

```typescript
// Calculate quantity in entry unit
const qtyInEntryUnit = article ? (movement.qte / conversionFactor) : movement.qte;

// Display in ENTRY UNIT
doc.text("Quantite Recue:        " + formatQty(qtyInEntryUnit) + " " + entryUnitFull, 15, yPos);
doc.text("Quantite Acceptee:     " + formatQty(qtyInEntryUnit) + " " + entryUnitFull, 15, yPos);
```

### Case B: Partial Acceptance
Still shows breakdown in **Exit Unit** (warehouse level) - UNCHANGED

```
Quantite Recue:        5 Boîtes
Quantite Acceptee:     480 Paires
Quantite Defectueuse:  20 Paires
```

---

## PDF Output

### Total Acceptance (Fixed)
```
Quantite Recue:        5 Boîtes
Quantite Acceptee:     5 Boîtes
(100% de la quantite recue)

Facteur de Conversion: 1 Boîtes = 100 Paires
```

### Partial Acceptance (Unchanged)
```
Quantite Recue:        5 Boîtes
Quantite Acceptee:     480 Paires
Quantite Defectueuse:  20 Paires

Facteur de Conversion: 1 Boîtes = 100 Paires
```

---

## Why This Matters

✅ **Physical Accuracy** - Matches reception units
✅ **Consistency** - Entry unit for total acceptance
✅ **Clarity** - Shows both received and accepted
✅ **Transparency** - Conversion factor displayed

---

## Examples

### Boîtes to Paires (1:100)
```
Reception: 5 Boîtes = 500 Paires

Total Acceptance:
Quantite Recue:        5 Boîtes
Quantite Acceptee:     5 Boîtes
Facteur de Conversion: 1 Boîtes = 100 Paires
```

### Cartons to Boîtes (1:10)
```
Reception: 10 Cartons = 100 Boîtes

Total Acceptance:
Quantite Recue:        10 Cartons
Quantite Acceptee:     10 Cartons
Facteur de Conversion: 1 Cartons = 10 Boîtes
```

### Tonnes to Kilogrammes (1:1000)
```
Reception: 1 Tonne = 1000 Kilogrammes

Total Acceptance:
Quantite Recue:        1 Tonnes
Quantite Acceptee:     1 Tonnes
Facteur de Conversion: 1 Tonnes = 1000 Kilogrammes
```

---

## File Modified

**src/lib/pdf-generator.ts**
- Case A: Updated to display in Entry Unit
- Case B: Unchanged (still shows Exit Unit breakdown)

---

## Status

✅ **Build:** Successful
✅ **TypeScript:** No errors
✅ **Production Ready:** Yes

---

**Ready for immediate deployment.**
