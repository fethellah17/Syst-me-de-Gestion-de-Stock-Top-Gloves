# Fix: Sortie Dropdown Empty Bug

## Problem
The "Choisir l'Emplacement Source" dropdown in the "Nouveau Mouvement" modal was empty when type was "Sortie", preventing users from selecting a source location.

## Root Cause
The `articleLocations` array was including locations with 0 stock, and the dropdown wasn't properly filtering or displaying available stock information.

## Solution Implemented

### 1. Dynamic Source Filtering
- Modified line 67 to filter `articleLocations` to only include locations with `quantite > 0`
- Empty shelves are now automatically excluded from the dropdown

```typescript
const articleLocations = selectedArticle ? getArticleLocations(selectedArticle.ref).filter(loc => loc.quantite > 0) : [];
```

### 2. Display Current Stock in Dropdown
- Updated dropdown options to show: `{emplacementNom} (Disponible: {quantite} {uniteSortie})`
- Example: "Zone B - Rack 03 (Disponible: 100 unités)"
- Added fallback message when no locations have stock: "Aucun emplacement avec stock disponible"

### 3. Validation Constraint (Prevent Negative Stock)
- Added inline error message when quantity exceeds available stock
- Shows: "Quantité insuffisante dans cet emplacement (Max: X)"
- Error appears immediately below the dropdown with AlertCircle icon
- Submit button is disabled when stock is insufficient

### 4. Consistent Unit Display
- Changed all references from `selectedArticle.unite` to `selectedArticle.uniteSortie`
- Ensures consistency with the dual-unit system (entry unit vs exit unit)
- Applied to: dropdown options, stock display, article locations badge

## Files Modified
- `src/pages/MouvementsPage.tsx`

## Testing Checklist
- [x] Dropdown shows only locations with stock > 0
- [x] Each option displays available quantity
- [x] Validation error appears when quantity exceeds stock
- [x] Submit button disabled when stock insufficient
- [x] Same logic applied to Transfert type
- [x] No TypeScript errors

## Impact
- Users can now see which shelves have stock available
- Clear visibility of available quantities prevents errors
- Real-time validation prevents negative stock situations
- Improved UX with better error messages
