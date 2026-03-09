# Dynamic Unit-Aware Movement System - Implementation Complete

## Overview
The movement system (Entrée, Sortie, Transfert, Ajustement) is now fully dynamic and unit-aware, allowing users to work with any unit while the system automatically handles conversions and validations.

## Key Features Implemented

### 1. Unified Form Logic
- **Article Selection**: When an article is selected, the form automatically fetches:
  - `uniteEntree` (Entry Unit - bulk unit, e.g., "Tonne", "Boîte")
  - `uniteSortie` (Exit Unit - consumption unit, e.g., "Kg", "Paire")
  - `facteurConversion` (Conversion Factor - how many exit units per entry unit)

- **Unit Dropdown**: Next to the quantity field, a dropdown displays both units:
  - For **Entrée**: Defaults to `uniteEntree` (bulk unit)
  - For **Sortie/Transfert/Ajustement**: Defaults to `uniteSortie` (consumption unit)
  - User can switch between units at any time

### 2. Movement-Specific Rules

#### Entrée (Entry)
- **Default Unit**: `uniteEntree` (e.g., "Boîte", "Tonne")
- **Calculation**: If user enters in `uniteEntree`, quantity is multiplied by `facteurConversion` before adding to stock
- **Example**: User enters 5 Boîtes → System stores 500 Paires (5 × 100)
- **Storage**: All stock is stored in `uniteSortie` (smallest unit)

#### Sortie (Exit) & Transfert
- **Default Unit**: `uniteSortie` (e.g., "Paire", "Kg")
- **Validation**: Input is converted to `uniteSortie` equivalent and checked against available stock
- **Error Handling**: If converted quantity > available stock:
  - Submit button is disabled
  - Red alert displays: "Stock Insuffisant (Max: X [Symbol])"
- **Example**: User enters 2 Tonnes, system checks if 2000 Kg is available

#### Ajustement (Adjustment)
- **Default Unit**: `uniteSortie`
- **Validation**: Same as Sortie for "Manquant" type
- **Surplus**: No stock validation needed (adding stock)

### 3. Visual Indicators

#### Live Conversion Preview
Below the quantity input, a live preview shows the equivalent in the other unit:
```
User enters: 5 Boîtes
Preview shows: "Équivaut à: 500 Paires" [P]
```

#### Unit Badges
- Gray circular badges display unit symbols (using `UnitBadge` component)
- Hover shows full unit name
- Consistent styling: `bg-gray-100 text-gray-600 border-gray-200`

#### Stock Validation Alert
When stock is insufficient:
```
⚠️ Stock Insuffisant
Maximum disponible: 1,500 Paires
```
- Red background (`bg-destructive/10`)
- Red border (`border-destructive/20`)
- AlertCircle icon
- Submit button disabled

### 4. Data Recording

#### Movement History
Each movement records:
- **Original Input**: The quantity and unit as entered by the user
- **Calculated Quantity**: The final quantity in `uniteSortie` (for audit purposes)
- **Example in success message**: "Entrée de 5 Boîtes (500 Paires) en Zone A-12"

#### Database Storage
- `qte`: Always stored in `uniteSortie` (smallest unit)
- This ensures consistency across all calculations
- Stock is always in the same unit for accurate tracking

### 5. Rounding & Precision

#### Smart Rounding
```typescript
const roundQuantity = (qty: number, unit: string): number => {
  const wholeItemUnits = ['pièce', 'boîte', 'unité', 'paire', 'carton', 'palette'];
  const isWholeItem = wholeItemUnits.some(u => unit.toLowerCase().includes(u));
  return isWholeItem ? Math.round(qty) : parseFloat(qty.toFixed(3));
};
```

- **Whole Items** (Pièce, Boîte, Unité, Paire, Carton): Rounded to integer
- **Weight/Volume** (Kg, g, Litre, ml, Tonne): Rounded to 3 decimals
- Prevents floating-point errors (e.g., 49.999 → 50)

## Technical Implementation

### Form State
```typescript
const [formData, setFormData] = useState({
  articleId: "",
  type: "Entrée" | "Sortie" | "Transfert" | "Ajustement",
  qte: 0,
  selectedUnit: "", // Unit selected by user
  // ... other fields
});
```

### Conversion Calculation
```typescript
const calculateQuantityInExitUnit = (): number => {
  if (!selectedArticle || !formData.qte || !formData.selectedUnit) return 0;
  
  if (formData.selectedUnit === selectedArticle.uniteEntree) {
    // Convert from entry unit to exit unit
    const rawQty = formData.qte * selectedArticle.facteurConversion;
    return roundQuantity(rawQty, selectedArticle.uniteSortie);
  } else {
    // Already in exit unit
    return roundQuantity(formData.qte, selectedArticle.uniteSortie);
  }
};
```

### Stock Validation
```typescript
const isStockSufficient = 
  (formData.type === "Sortie" || formData.type === "Transfert" || 
   (formData.type === "Ajustement" && formData.typeAjustement === "Manquant"))
    ? quantityInExitUnit <= sourceStockAvailable
    : true;
```

### Auto-Unit Selection
When article or movement type changes:
```typescript
// For Entrée: default to entry unit
if (type === "Entrée") {
  defaultUnit = article.uniteEntree;
} else {
  // For Sortie/Transfert/Ajustement: default to exit unit
  defaultUnit = article.uniteSortie;
}
```

## User Experience Flow

### Example: Creating an Entry
1. User selects "Gants Nitrile M" article
2. System auto-loads: `uniteEntree: "Boîte"`, `uniteSortie: "Paire"`, `facteurConversion: 100`
3. User selects "Entrée" type → Unit dropdown defaults to "Boîte"
4. User enters quantity: `5`
5. Live preview shows: "Équivaut à: 500 Paires" [P]
6. User can switch to "Paire" if they want to enter directly in pairs
7. On submit: System stores `500` in database (always in exit unit)
8. Success message: "Entrée de 5 Boîtes (500 Paires) en Zone A-12"

### Example: Creating an Exit with Validation
1. User selects "Gants Nitrile M" article
2. User selects "Sortie" type → Unit dropdown defaults to "Paire"
3. User selects source location: "Zone A - Rack 12" (1,500 Paires available)
4. User switches unit to "Boîte" and enters: `20`
5. Live preview shows: "Équivaut à: 2,000 Paires" [P]
6. System detects: 2,000 > 1,500 (insufficient stock)
7. Red alert appears: "Stock Insuffisant - Maximum disponible: 1,500 Paires"
8. Submit button is disabled
9. User reduces to `15` Boîtes (1,500 Paires)
10. Validation passes, submit enabled
11. On submit: System deducts 1,500 Paires from stock

## Benefits

### For Users
- **Flexibility**: Work with any unit (bulk or consumption)
- **Clarity**: Live conversion preview prevents errors
- **Safety**: Real-time validation prevents negative stock
- **Transparency**: See both input and calculated values

### For System
- **Consistency**: All stock stored in same unit (exit unit)
- **Accuracy**: Smart rounding prevents floating-point errors
- **Auditability**: Both input and calculated values recorded
- **Reliability**: Foolproof validation at every step

## Testing Scenarios

### Scenario 1: Entry with Conversion
- Article: Gants Nitrile M (100 Paires per Boîte)
- Input: 5 Boîtes
- Expected: 500 Paires added to stock
- Preview: "Équivaut à: 500 Paires"

### Scenario 2: Exit with Insufficient Stock
- Article: Gants Nitrile M
- Available: 1,500 Paires
- Input: 20 Boîtes (2,000 Paires)
- Expected: Submit disabled, error shown

### Scenario 3: Transfer with Unit Switch
- Article: Masques FFP2 (1,000 Unités per Carton)
- Available in Zone D: 5,000 Unités
- Input: 3 Cartons (3,000 Unités)
- Expected: Transfer succeeds, 3,000 deducted from source

### Scenario 4: Adjustment with Rounding
- Article: Produit Chimique (1,000 Kg per Tonne)
- Input: 2.5 Tonnes
- Expected: 2,500.000 Kg (rounded to 3 decimals)

## Files Modified

1. **src/pages/MouvementsPage.tsx**
   - Added `selectedUnit` to form state
   - Added unit dropdown next to quantity field
   - Added live conversion preview
   - Added stock validation with visual feedback
   - Updated submit logic to use converted quantity
   - Auto-set default unit based on movement type

2. **src/components/UnitBadge.tsx** (already existed)
   - Used for displaying unit symbols in gray circular badges

3. **src/lib/unit-conversion.ts** (already existed)
   - Contains rounding and conversion utilities

4. **src/contexts/DataContext.tsx** (no changes needed)
   - Already handles conversion for Entrée movements
   - Stock always stored in exit unit

## Conclusion

The movement system is now fully dynamic and unit-aware. Users can work with any unit, and the system automatically:
- Converts quantities to the smallest unit (exit unit)
- Validates stock availability
- Shows live conversion previews
- Prevents errors with smart rounding
- Records both input and calculated values for audit

This creates a foolproof system where users have flexibility while the system maintains data integrity.
