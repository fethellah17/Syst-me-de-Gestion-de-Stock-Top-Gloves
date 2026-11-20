# Unit Conversion Fix - Quick Reference

## What Was Fixed

### The Bug
```
User enters: 500 Kg defective
PDF showed: "Quantite Defectueuse: 500 Tonnes" ❌
Should show: "Quantite Defectueuse: 500 Kg" ✅
```

### The Fix
- ✅ Dual unit input in QC modal (Entry Unit or Exit Unit)
- ✅ Automatic conversion between units
- ✅ Correct unit labels in PDF
- ✅ Proper math verification (Acceptée + Défectueuse = Reçue)

---

## QC Modal Changes

### Before
```
Quantité Non-Conforme (Défectueuse)
[Input Field] (only in exit unit)
```

### After
```
Quantité Non-Conforme (Défectueuse)

[En Kg] [En Tonne]  ← Toggle between units

[Input Field]

Conversion Display:
500 Kg = 0.5 Tonne
```

### How It Works
1. Click unit toggle (Kg or Tonne)
2. Enter quantity in selected unit
3. System auto-converts to exit unit (Kg) for storage
4. Conversion display shows both units
5. Valid quantity auto-calculates

---

## PDF Changes

### Before (Bug)
```
Quantite Recue:        500 Kg
Quantite Acceptee:     480 Kg
Quantite Defectueuse:  20 Kg
```

### After (Fixed)
```
Quantite Recue:        1 Tonne          (Entry Unit)
Quantite Acceptee:     480 Kg           (Exit Unit)
Quantite Defectueuse:  20 Kg            (Exit Unit)
```

### The Rule
| Quantity | Unit | Reason |
|----------|------|--------|
| Reçue | Entry Unit | Original received quantity |
| Acceptée | Exit Unit | Warehouse storage unit |
| Défectueuse | Exit Unit | Warehouse storage unit |

---

## Data Flow

```
QC Modal
  ↓
User enters: 500 (in Kg)
  ↓
System stores: 500 Kg (exit unit)
  ↓
Stock Update: +500 Kg to warehouse
  ↓
PDF Display:
  - Reçue: 1 Tonne (converted from 1000 Kg)
  - Acceptée: 500 Kg
  - Défectueuse: 500 Kg
```

---

## Example: Tonne to Kg

### Setup
- Article: Gants Latex
- Entry Unit: Tonne
- Exit Unit: Kg
- Conversion Factor: 1000

### Scenario
- Reception: 1 Tonne
- QC: 500 Kg defective

### QC Modal
```
[En Kg] [En Tonne]
[500]  ← User enters 500 in Kg

Conversion: 500 Kg = 0.5 Tonne
```

### PDF Output
```
Quantite Recue:        1 Tonne
Quantite Acceptee:     500 Kg
Quantite Defectueuse:  500 Kg

Math: 500 + 500 = 1000 Kg = 1 Tonne ✅
```

---

## Example: Carton to Box

### Setup
- Article: Boîtes de Gants
- Entry Unit: Carton
- Exit Unit: Boîte
- Conversion Factor: 10

### Scenario
- Reception: 5 Cartons
- QC: 2 Cartons defective

### QC Modal
```
[En Boîte] [En Carton]
           [2]  ← User enters 2 in Carton

Conversion: 2 Carton = 20 Boîte
```

### PDF Output
```
Quantite Recue:        5 Carton
Quantite Acceptee:     30 Boîte
Quantite Defectueuse:  20 Boîte

Math: 30 + 20 = 50 Boîte = 5 Carton ✅
```

---

## Code Changes Summary

### InspectionModal.tsx
- Added `qteDefectueuseUnit` state
- Added unit toggle buttons
- Updated conversion logic
- Added conversion display

### pdf-generator.ts
- Updated function signature to accept articles
- Fixed unit display logic
- Added unit lookup

### MovementTable.tsx
- Pass articles array to PDF generator

---

## Testing

### Test 1: Kg Input
1. Create Entrée with 1 Tonne
2. QC: Enter 500 in Kg field
3. Verify: Conversion shows "500 Kg = 0.5 Tonne"
4. PDF: Shows "Reçue: 1 Tonne, Acceptée: 500 Kg, Défectueuse: 500 Kg"

### Test 2: Tonne Input
1. Create Entrée with 1 Tonne
2. QC: Toggle to Tonne, enter 0.5
3. Verify: Conversion shows "0.5 Tonne = 500 Kg"
4. PDF: Shows same as Test 1

### Test 3: Math Verification
1. Any scenario
2. Verify: Acceptée + Défectueuse = Reçue (converted)
3. Example: 500 + 500 = 1000 Kg = 1 Tonne ✅

### Test 4: Stock Update
1. Any scenario
2. Verify: Stock updated with correct quantity
3. Example: +500 Kg to warehouse (not +1 Tonne)

---

## Key Points

✅ **Dual Unit Input** - Choose entry or exit unit
✅ **Auto-Conversion** - System converts automatically
✅ **Correct Display** - Each quantity shows proper unit
✅ **Math Verification** - Quantities add up correctly
✅ **Data Integrity** - Stock updates use correct values
✅ **Professional** - Clear, accurate reporting

---

## Files Modified

1. `src/components/InspectionModal.tsx` - Dual unit input
2. `src/lib/pdf-generator.ts` - Correct unit display
3. `src/components/MovementTable.tsx` - Pass articles to PDF

---

## Status

✅ **Build:** Successful
✅ **TypeScript:** No errors
✅ **Production Ready:** Yes

---

## Summary

The unit conversion fix ensures:
- Accurate QC input with dual unit options
- Correct PDF display with proper unit labels
- Data integrity in stock updates
- Professional, compliant reporting

**Ready for immediate deployment.**
