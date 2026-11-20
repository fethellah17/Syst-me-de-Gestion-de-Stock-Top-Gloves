# Quality Control - Permanent Loss Logic

## ⚠️ CRITICAL RULE: Defective Units = Permanent Loss

**ALL units (including defective) that leave the warehouse are PERMANENTLY deducted from inventory.**

Defective units are **NEVER** added back to stock. They are recorded as metadata for quality reports only.

---

## Core Logic

### Inventory Deduction Rule
```
Stock Deduction = TOTAL Quantity (100%)
```

**Example:**
- Output: 100 units
- Defective: 50 units
- **Stock Deduction: 100 units** (NOT 50!)

### Why This Logic?

1. **Physical Reality**: All 100 units have physically left the warehouse
2. **Defective = Loss**: The 50 defective units are destroyed/discarded (permanent loss)
3. **No Return**: Defective units never come back to inventory
4. **Audit Trail**: Defective count is stored as metadata for quality reports

---

## Data Schema

### Mouvement Interface
```typescript
interface Mouvement {
  id: number;
  date: string;
  article: string;
  ref: string;
  type: "Entrée" | "Sortie" | "Transfert" | "Ajustement";
  qte: number;                    // Total quantity (ALWAYS deducted from stock)
  emplacementSource?: string;
  emplacementDestination: string;
  operateur: string;
  statut?: "En attente de validation Qualité" | "Terminé" | "Rejeté";
  controleur?: string;
  etatArticles?: "Conforme" | "Non-conforme";
  unitesDefectueuses?: number;    // Metadata only - NOT added back to stock
  validQuantity?: number;         // Metadata: quantity approved for use
  defectiveQuantity?: number;     // Metadata: quantity marked as defective (LOSS)
  raison?: string;
  motif?: string;
  typeAjustement?: "Surplus" | "Manquant";
}
```

---

## How It Works

### 1. Creating a Sortie (Output)
When a user creates a "Sortie" movement:
- The movement is created with status: `"En attente de validation Qualité"`
- **Stock is NOT deducted yet** - it remains unchanged
- The movement appears in the table with a Quality Control action button

### 2. Opening Quality Control Modal
When clicking the QC button:
- Modal displays current article information
- Shows current stock level
- Shows **TOTAL quantity** to be removed
- **Real-time preview** of stock after approval

### 3. Quality Control Logic

#### Conforme (Compliant)
```
Stock Deduction = Total Quantity (100 units)
Valid Quantity = 100 units
Defective Quantity = 0 units
```

#### Non-conforme (Non-Compliant)
```
Stock Deduction = Total Quantity (100 units) ← ALWAYS THE TOTAL
Valid Quantity = 50 units (for reporting)
Defective Quantity = 50 units (PERMANENT LOSS - metadata only)
```

**Visual Display in Modal:**
```
Quantité Totale Sortie: 100 units
  └─ Valides: 50 units
  └─ Défectueuses (Perte): 50 units

⚠️ Les 100 unités seront déduites du stock (incluant les défectueuses)
Les 50 unités défectueuses sont une perte permanente.

Stock Après Approbation: 2400 units
```

### 4. Approval Process

When clicking "Approuver la Sortie":

1. **Validation Check**
   ```javascript
   const totalQtyToDeduct = mouvement.qte; // ALWAYS the total
   if (article.stock < totalQtyToDeduct) {
     // Block operation
   }
   ```

2. **Movement Record Update**
   ```javascript
   {
     ...movement,
     statut: "Terminé",
     controleur: "Marie L.",
     etatArticles: "Non-conforme",
     unitesDefectueuses: 50,    // Metadata only
     validQuantity: 50,          // Metadata for display
     defectiveQuantity: 50       // Metadata for display (LOSS)
   }
   ```

3. **Stock Deduction** (CRITICAL)
   ```javascript
   // ALWAYS deduct the TOTAL quantity
   const totalQtyToDeduct = mouvement.qte; // 100 units
   
   article.stock = article.stock - totalQtyToDeduct; // 2500 - 100 = 2400
   
   // NO logic to add defective units back!
   // Defective units are a PERMANENT LOSS
   ```

4. **UI Refresh**
   - Movement table updates with QC columns
   - Stock reflects TOTAL deduction
   - No page reload needed

### 5. Mouvements Table Display

| Column | Value | Meaning |
|--------|-------|---------|
| **Qté Total** | 100 | Total units that left warehouse |
| **Qté Valide** | 50 | Units approved for use (metadata) |
| **Qté Défect.** | 50 | Units marked as defective = **PERMANENT LOSS** |

**Stock Impact:** -100 units (NOT -50!)

---

## Code Implementation

### `approveQualityControl` (DataContext.tsx)

```javascript
const approveQualityControl = (id, controleur, etatArticles, unitesDefectueuses = 0) => {
  const mouvement = mouvements.find(m => m.id === id);
  
  // CRITICAL: ALL units have physically left the warehouse
  // We ALWAYS deduct the TOTAL quantity from inventory
  // Defective units are a PERMANENT LOSS and are NOT added back to stock
  const totalQtyToDeduct = mouvement.qte; // ALWAYS the total
  
  // Calculate quantities for display (metadata only)
  const validQty = etatArticles === "Non-conforme" 
    ? mouvement.qte - unitesDefectueuses 
    : mouvement.qte;
  const defectiveQty = etatArticles === "Non-conforme" ? unitesDefectueuses : 0;
  
  // Update movement with QC metadata
  setMouvements(mouvements.map(m => 
    m.id === id 
      ? { 
          ...m, 
          statut: "Terminé",
          controleur,
          etatArticles,
          unitesDefectueuses: etatArticles === "Non-conforme" ? unitesDefectueuses : undefined,
          validQuantity: validQty,        // Metadata for display
          defectiveQuantity: defectiveQty // Metadata for display (LOSS)
        }
      : m
  ));
  
  // Deduct the TOTAL from stock (100% of units have left)
  // Defective units are a PERMANENT LOSS
  updateArticle(article.id, { 
    stock: Math.max(0, article.stock - totalQtyToDeduct), // TOTAL deduction
    locations: updatedLocations 
  });
  
  // NO logic to add defective units back!
};
```

### Key Points in Code:

✅ **`totalQtyToDeduct = mouvement.qte`** - ALWAYS the total
✅ **Stock deduction uses `totalQtyToDeduct`** - Full amount
✅ **`validQuantity` and `defectiveQuantity`** - Metadata only
❌ **NO logic to add defective units back to stock**
❌ **NO conditional deduction based on defective count**

---

## Example Scenario

**Initial State:**
- Article: Gants Nitrile M
- Current Stock: 2500 units
- Location: Zone A - Rack 12

**User Action:**
1. Creates Sortie: 100 units
2. Opens Quality Control
3. Selects "Non-conforme"
4. Enters 50 defective units
5. Preview shows: 2500 - **100** = 2400 units (NOT 2450!)
6. Clicks "Approuver la Sortie"

**Result:**
- Movement status: "Terminé"
- **Stock updated: 2400 units** (deducted 100, NOT 50)
- **Metadata stored in movement:**
  - qte: 100 (total)
  - validQuantity: 50
  - defectiveQuantity: 50 (PERMANENT LOSS)
  - unitesDefectueuses: 50
- **Table displays:**
  - Qté Total: 100
  - Qté Valide: 50 (green)
  - Qté Défect.: 50 (red) ← This is a LOSS
- Table refreshes immediately

**Accounting:**
```
Stock Before: 2500
Total Output: -100 (all units left warehouse)
  ├─ Valid: 50 (used in production)
  └─ Defective: 50 (destroyed/discarded = LOSS)
Stock After: 2400
```

---

## Prohibited Logic

### ❌ NEVER DO THIS:
```javascript
// WRONG - This would add defective units back to stock
const qtyToDeduct = mouvement.qte - unitesDefectueuses;
article.stock = article.stock - qtyToDeduct; // WRONG!
```

### ✅ ALWAYS DO THIS:
```javascript
// CORRECT - Deduct the total quantity
const totalQtyToDeduct = mouvement.qte;
article.stock = article.stock - totalQtyToDeduct; // CORRECT!
```

---

## Visual Clarity

### In QC Modal:
```
Quantité Totale Sortie: 100 units
  └─ Valides: 50 units
  └─ Défectueuses (Perte): 50 units

⚠️ Les 100 unités seront déduites du stock (incluant les défectueuses)
Les 50 unités défectueuses sont une perte permanente.

Stock Après Approbation: 2400 units
```

### In Mouvements Table:
```
| Qté Total | Qté Valide | Qté Défect. |
|-----------|------------|-------------|
| 100       | 50 ✓       | 50 ✗        |
```

---

## Key Features

✅ **Total deduction** - All units removed from stock
✅ **Defective = Permanent loss** - Never added back
✅ **Metadata storage** - For quality reports only
✅ **Clear visual feedback** - Shows breakdown in UI
✅ **Validation** - Prevents negative stock
✅ **Audit trail** - Complete QC history
✅ **No return logic** - Defective units are gone forever

---

## Summary

**The Golden Rule:**
> When 100 units leave the warehouse (50 valid, 50 defective), the inventory is reduced by 100 units. The 50 defective units are a permanent loss and are NEVER added back to stock. They are recorded as metadata for quality reporting purposes only.
