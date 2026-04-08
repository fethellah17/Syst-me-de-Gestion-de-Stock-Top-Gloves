# Frontend Movements Integration - Local Browser State

## Date: 25 mars 2026

## Overview
The EmplacementsPage now uses the `mouvements` array from the DataContext to calculate and display stock in real-time. When you add a movement (Entrée) in the browser, it immediately updates the Emplacement modal.

## How It Works

### 1. Data Flow
```
User adds Movement (Entrée)
  ↓
DataContext.addMouvement() adds to mouvements array
  ↓
React re-renders EmplacementsPage
  ↓
getArticlesInLocation() recalculates from mouvements
  ↓
Modal displays updated quantities
```

### 2. Stock Calculation Formula
```
Total Stock = (Sum of Entries) - (Sum of Exits) + (Transfers In) - (Transfers Out)
```

For each article in each location:
- **Entrée (Entry)**: Add quantity (counted immediately for frontend testing)
- **Sortie (Exit)**: Subtract quantity (only if approved/completed)
- **Transfert (Transfer)**: Subtract from source, add to destination

### 3. Frontend-Only Logic
```tsx
const getArticlesInLocation = (locationName: string) => {
  return articles.map(article => {
    let totalQuantity = 0;
    
    mouvements.forEach(mouvement => {
      if (mouvement.ref === article.ref) {
        // Count ALL entries immediately (for frontend testing)
        if (mouvement.type === "Entrée" && mouvement.emplacementDestination === locationName) {
          totalQuantity += mouvement.qte;
        }
        // Only count approved exits
        else if (mouvement.type === "Sortie" && mouvement.emplacementSource === locationName) {
          if (mouvement.statut === "Terminé" || mouvement.status === "approved") {
            totalQuantity -= mouvement.qte;
          }
        }
        // Count all transfers
        else if (mouvement.type === "Transfert") {
          if (mouvement.emplacementSource === locationName) {
            totalQuantity -= mouvement.qte;
          }
          if (mouvement.emplacementDestination === locationName) {
            totalQuantity += mouvement.qte;
          }
        }
      }
    });
    
    if (totalQuantity > 0) {
      return {
        ref: article.ref,
        nom: article.nom,
        quantite: Number(totalQuantity), // Clean number
        unite: article.uniteSortie,
      };
    }
    return null;
  }).filter(Boolean);
};
```

## Key Features

### 1. Real-Time Updates
- When you add a movement, the modal updates immediately
- No page refresh needed
- Changes are visible as soon as you click on the location card

### 2. Clean Number Display
```tsx
quantite: Number(totalQuantity)
```
- 1005.0 → 1005
- 1005.5 → 1005.5
- No trailing zeros

### 3. Correct Unit Display
```tsx
unite: article.uniteSortie
```
- Shows the exit unit (consumption unit)
- Consistent with how quantities are stored

### 4. Frontend-Friendly Logic
- Entries are counted immediately (no approval needed for testing)
- Exits only count if approved (realistic behavior)
- Transfers are counted immediately

## Testing Workflow

### Step 1: Add an Article
1. Go to Articles page
2. Click "Ajouter"
3. Fill in: Référence, Nom, Unité d'Entrée, Unité de Sortie, Facteur de Conversion
4. Click "Ajouter"

### Step 2: Add a Movement (Entrée)
1. Go to Mouvements page
2. Click "Ajouter un mouvement"
3. Select Type: "Entrée"
4. Select Article
5. Enter Quantité
6. Select Emplacement Destination
7. Click "Ajouter"

### Step 3: View in Emplacement Modal
1. Go to Emplacements page
2. Click on the location card where you added the movement
3. The modal opens and shows the article with the quantity you entered

### Example
```
Article: Gants Nitrile M
Unité d'Entrée: Boîte
Unité de Sortie: Paire
Facteur: 100

Movement: Entrée 5 Boîtes to Zone A-12
  ↓
Stored as: 500 Paires (5 × 100)
  ↓
Display in modal: 500 Paire
```

## Modal Display

### Summary Section
- Shows: "Articles différents" count
- Example: "2" (meaning 2 different articles in this location)

### Table Columns
1. **Référence**: Article reference code (e.g., "GN-M-001")
2. **Désignation**: Article name (e.g., "Gants Nitrile M")
3. **Quantité**: Calculated stock quantity (e.g., "500")
4. **Unité**: Exit unit (e.g., "Paire")

### Example Table
```
Référence | Désignation      | Quantité | Unité
----------|------------------|----------|-------
GN-M-001  | Gants Nitrile M  | 500      | Paire
GL-S-002  | Gants Latex S    | 1800     | Paire
```

## Files Modified

- `src/pages/EmplacementsPage.tsx`
  - Updated `getArticlesInLocation` function
  - Simplified calculation logic
  - Counts ALL entries immediately (for frontend testing)
  - Only counts approved exits
  - Uses `Number()` for clean display

## Important Notes

### Frontend vs Production
- **Frontend (Current)**: Entries counted immediately, exits only if approved
- **Production**: Would only count "Terminé" or "approved" movements
- This allows testing without needing to approve every movement

### No Backend Required
- All calculations happen in the browser
- Uses DataContext's `mouvements` array
- No API calls needed
- Perfect for frontend development and testing

### Real-Time Reactivity
- React automatically re-renders when `mouvements` changes
- Modal updates instantly when you add a movement
- No manual refresh needed

## Troubleshooting

### Movement Not Showing in Modal
1. Check that the movement's `emplacementDestination` matches the location name
2. Check that the movement's `ref` matches the article's `ref`
3. Check browser console for any errors
4. Verify the article exists in the articles list

### Wrong Quantity Displayed
1. Check the movement quantity (`qte`)
2. Check the article's conversion factor
3. Verify the calculation: Quantity should be in exit unit
4. Check if exits are approved (status = "Terminé")

### Trailing Zeros Not Removed
1. Verify `Number(totalQuantity)` is being used
2. Check that `formatQuantity()` is applied to display
3. Verify no `.toFixed()` is being used

## Future Enhancements

- Add localStorage persistence (movements survive page refresh)
- Add movement history view
- Add undo/redo functionality
- Add movement filtering by date range
- Add export to CSV
