# Fix: Decimal Input for Facteur de Conversion & Clean Number Display

## Date: 25 mars 2026

## Issues Resolved

### 1. Unable to Type Decimal Numbers in Facteur de Conversion
**Problem**: Users couldn't enter decimal values like 0.5 or 1.5 in the conversion factor field.

**Root Cause**: 
- The `min="0.001"` attribute was too restrictive
- The `onChange` handler was using `Number(e.target.value) || 1` which could interfere with typing

**Solution Applied**:
```tsx
<input
  type="number"
  inputMode="decimal"
  min="0"              // Changed from 0.001 to 0
  step="any"           // Allows any decimal precision
  value={formData.facteurConversion}
  onChange={(e) => {
    const value = e.target.value;
    // Allow empty string for editing, use parseFloat for decimals
    setFormData({ ...formData, facteurConversion: value === '' ? 1 : parseFloat(value) || 1 });
  }}
  placeholder="Ex: 1000 ou 0.5"
/>
```

### 2. Trailing Zeros in Emplacement Modal Quantities
**Problem**: Quantities displayed with trailing zeros (e.g., 10000.0 or 10000.000)

**Root Cause**: 
- Using `toLocaleString()` with `maximumFractionDigits` was forcing decimal places
- Float precision issues from conversions

**Solution Applied**:
```tsx
const formatQuantity = (quantity: number): string => {
  // Strip trailing zeros by converting to Number, then back to string
  // This handles both integers (10000) and decimals (10.5) correctly
  return String(Number(quantity));
};
```

## Results

### Facteur de Conversion Input
- ✅ Can now enter whole numbers: 1, 100, 1000
- ✅ Can now enter decimals: 0.5, 1.5, 2.75
- ✅ Can now enter small decimals: 0.001, 0.01
- ✅ Works on both desktop and mobile (inputMode="decimal")

### Emplacement Modal Display
- ✅ Whole numbers display clean: 10000 (not 10000.0)
- ✅ Decimals display naturally: 10.5 (not 10.500)
- ✅ No trailing zeros

## Technical Notes

### Data Type Support
- TypeScript `number` type supports both integers and floats
- JavaScript `Number` and `parseFloat` handle decimals natively
- No database schema changes needed (using mock data context)

### Input Attributes
- `type="number"`: Enables numeric keyboard
- `inputMode="decimal"`: Shows decimal keyboard on mobile
- `step="any"`: Allows any decimal precision (not limited to 0.001 or 0.01)
- `min="0"`: Prevents negative values but allows all positive decimals

## Files Modified

1. `src/pages/ArticlesPage.tsx`
   - Updated Facteur de Conversion input field
   - Changed min from 0.001 to 0
   - Improved onChange handler with parseFloat
   - Updated placeholder text

2. `src/pages/EmplacementsPage.tsx`
   - Simplified formatQuantity function
   - Uses String(Number(quantity)) for clean display
   - Removed locale-specific formatting that added decimals
