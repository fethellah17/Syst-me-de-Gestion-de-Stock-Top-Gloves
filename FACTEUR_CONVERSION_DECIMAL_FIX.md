# Fix: Enable Decimal Input for Facteur de Conversion

## Date: 25 mars 2026

## Problem
Users could not type decimal numbers (with dot or comma) in the "Facteur de Conversion" field. The system was instantly deleting the decimal separator.

## Root Cause
The React state was parsing the input to a number immediately in the `onChange` handler using `parseFloat()`, which was preventing the user from typing the decimal separator.

## Solution Applied

### 1. Changed State to Store String (While Typing)
```tsx
const [formData, setFormData] = useState({
  // ... other fields
  facteurConversion: "1", // Store as STRING, not number
  // ... other fields
});
```

### 2. Updated onChange to Accept Raw String Input
```tsx
onChange={(e) => {
  // Replace comma with dot for decimal support
  const value = e.target.value.replace(',', '.');
  // Store as string to allow typing decimals without parsing
  setFormData({ ...formData, facteurConversion: value });
}}
```

**Key points:**
- No `parseFloat()` in onChange - this was the culprit
- Automatically converts comma (,) to dot (.) for international keyboard support
- Stores the raw string value, allowing users to type freely

### 3. Convert to Number ONLY on Submit
```tsx
const handleSubmit = (e: React.FormEvent) => {
  // ... validation
  
  // Convert facteurConversion from string to number ONLY when submitting
  const facteurConversionNumber = parseFloat(formData.facteurConversion as string) || 1;
  const formDataWithNumber = { ...formData, facteurConversion: facteurConversionNumber };
  
  // Use formDataWithNumber for addArticle/updateArticle
  addArticle({ ...formDataWithNumber, stock: 0, ... });
};
```

### 4. Convert Back to String When Editing
```tsx
const handleOpenModal = (article?: Article) => {
  if (article) {
    setFormData({
      // ... other fields
      facteurConversion: String(article.facteurConversion), // Convert to string for editing
      // ... other fields
    });
  }
};
```

### 5. Input Attributes
```tsx
<input
  type="text"                    // Text input allows any characters
  inputMode="decimal"            // Shows decimal keyboard on mobile
  value={formData.facteurConversion}
  onChange={(e) => {
    const value = e.target.value.replace(',', '.');
    setFormData({ ...formData, facteurConversion: value });
  }}
  placeholder="Ex: 1000 ou 0.5"
/>
```

## Results

### What Now Works
- ✅ Type whole numbers: 1, 100, 1000
- ✅ Type decimals with dot: 0.5, 1.5, 2.75
- ✅ Type decimals with comma: 0,5, 1,5 (automatically converted to dot)
- ✅ Edit existing values without losing decimals
- ✅ Mobile keyboard shows decimal option

### Data Flow
1. **User types**: "1.5" → stored as string "1.5" in state
2. **User submits**: parseFloat("1.5") → 1.5 (number) → saved to database
3. **User edits**: 1.5 (number) → String(1.5) → "1.5" (string) → displayed in input

## Files Modified

- `src/pages/ArticlesPage.tsx`
  - Changed `facteurConversion` state from number to string
  - Updated `onChange` to store raw string with comma-to-dot conversion
  - Updated `handleSubmit` to convert string to number before saving
  - Updated `handleOpenModal` to convert number to string when editing

## Technical Notes

### Why This Works
- HTML `type="text"` input doesn't validate or restrict characters
- `inputMode="decimal"` provides mobile keyboard support without validation
- Parsing happens only on submit, not during typing
- Comma support via `.replace(',', '.')` handles international keyboards

### Type Safety
- TypeScript allows `facteurConversion` to be either string or number
- Conversion happens explicitly in handleSubmit and handleOpenModal
- Database/API receives proper number type

### Browser Compatibility
- Works on all modern browsers
- Mobile keyboards show decimal option with `inputMode="decimal"`
- No special polyfills needed
