# QC (Quality Control) Implementation for Entrée Movements - COMPLETE

## Overview
Implemented a complete Quality Control workflow for Entrée (inbound) movements. Items no longer enter usable stock immediately upon receipt - they must pass QC inspection first.

## Key Changes

### 1. Movement Status Workflow (DataContext.tsx)

**New Status for Entrée Movements:**
- Default status: `"En attente de validation Qualité"` (Pending QC)
- After approval: `"Terminé"` (Completed)
- After rejection: `"Rejeté"` (Rejected)

**Critical Rule:** When an Entrée movement is created with "En attente" status, its quantity is **NOT** added to physical stock yet.

```typescript
// In addMouvement():
if (mouvement.type === "Entrée") {
  // ENTRÉE: Start in pending QC status - stock NOT added yet
  mouvementAvecStatut = { 
    ...mouvement, 
    statut: "En attente de validation Qualité", 
    status: "pending" 
  };
}
```

### 2. QC Validation UI (MovementTable.tsx)

**Visual Indicators:**
- Yellow badge: "En attente" (Pending QC)
- Green badge: "Terminé" (Completed)
- Red badge: "Rejeté" (Rejected)

**Inspecter Button:**
- Shows for Entrée rows with "En attente de validation Qualité" status
- Clicking opens the QC inspection modal
- Icon: AlertCircle (amber color)

```typescript
{m.type === "Entrée" && m.statut === "En attente de validation Qualité" && (
  <button
    onClick={() => onQualityControlEntree?.(m.id)}
    className="p-1.5 rounded-md hover:bg-amber-100 transition-colors text-amber-600 hover:text-amber-800"
    title="Inspecter cet article"
  >
    <AlertCircle className="w-4 h-4" />
  </button>
)}
```

### 3. QC Inspection Modal (MouvementsPage.tsx)

**Modal Fields:**
- **Article Info** (read-only): Name, Reference, Quantity Received, Destination, Operator, Date
- **Qté Valide**: How many items passed inspection (good condition)
- **Qté Défectueuse**: How many items are damaged/defective
- **Nom du Contrôleur**: Inspector name (required)
- **Note de Contrôle**: Optional inspection notes

**Validation:**
- Qté Valide + Qté Défectueuse must equal total received quantity
- Controleur name is required
- Real-time validation prevents invalid combinations

### 4. Stock Impact on Approval (DataContext.tsx)

**New Function: `approveEntreeQualityControl()`**

When "Approuver l'Entrée" is clicked:
1. Status changes to "Terminé"
2. **ONLY** Qté Valide is added to destination zone stock
3. Qté Défectueuse is logged as metadata but NOT added to usable stock
4. Defective items are treated as permanent loss

```typescript
const approveEntreeQualityControl = (
  id: number, 
  controleur: string, 
  validQuantity: number, 
  defectiveQuantity: number = 0, 
  controlNote: string = ""
) => {
  // Only validQuantity is added to stock
  const quantityToAdd = validQuantity;
  
  // Update mouvement with metadata
  setMouvements(mouvements.map(m => 
    m.id === id 
      ? { 
          ...m, 
          statut: "Terminé",
          status: "approved",
          controleur,
          validQuantity,
          defectiveQuantity,
          commentaire: controlNote
        }
      : m
  ));
  
  // Add ONLY valid quantity to stock
  setArticles(prevArticles => {
    return prevArticles.map(article => {
      if (article.ref !== mouvement.ref) return article;
      
      const newStock = article.stock + quantityToAdd;
      // Update inventory for destination zone
      // ...
      return { ...article, stock: newStock, inventory: updatedInventory };
    });
  });
};
```

**New Function: `rejectEntreeQualityControl()`**

When an Entrée is rejected:
1. Status changes to "Rejeté"
2. Stock remains unchanged (items not added)
3. Rejection reason is logged

### 5. Data Model Updates (DataContext.tsx)

**Mouvement Interface - New Fields:**
```typescript
validQuantity?: number;       // QC metadata: quantity approved for use
defectiveQuantity?: number;   // QC metadata: quantity marked as defective
```

**DataContextType - New Functions:**
```typescript
approveEntreeQualityControl: (
  id: number, 
  controleur: string, 
  validQuantity: number, 
  defectiveQuantity?: number, 
  controlNote?: string
) => void;

rejectEntreeQualityControl: (
  id: number, 
  controleur: string, 
  raison: string
) => void;
```

## User Workflow

### Step 1: Create Entrée Movement
- User creates new Entrée in Bulk Movement Modal
- Movement is recorded with status "En attente de validation Qualité"
- Stock is NOT updated yet

### Step 2: Inspect Items
- User sees yellow "En attente" badge in Mouvements table
- User clicks "Inspecter" button (AlertCircle icon)
- QC Inspection Modal opens

### Step 3: Record QC Results
- Inspector enters:
  - Qté Valide (items in good condition)
  - Qté Défectueuse (damaged items)
  - Inspector name
  - Optional notes
- System validates: Valide + Défectueuse = Total Received

### Step 4: Approve or Reject
- **Approve**: Only valid quantity added to stock, defective logged as loss
- **Reject**: Entire shipment rejected, stock unchanged

### Step 5: View Results
- Status badge changes to green "Terminé" or red "Rejeté"
- Movement table shows:
  - Qté Valide (green, right column)
  - Qté Défect. (red, right column)
  - Inspector name in "Approuvé par" column

## Visual Indicators

### Status Badges
| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| En attente | Yellow | AlertCircle | Pending QC inspection |
| Terminé | Green | CheckCircle2 | Approved and added to stock |
| Rejeté | Red | AlertCircle | Rejected, not added to stock |

### Table Columns (Desktop View)
- **Qté Valide**: Shows approved quantity (green text, right-aligned)
- **Qté Défect.**: Shows defective quantity (red text, right-aligned)
- **Statut**: Shows status badge (yellow/green/red)

## Files Modified

1. **src/contexts/DataContext.tsx**
   - Modified `addMouvement()` to set Entrée status to "En attente"
   - Added `approveEntreeQualityControl()` function
   - Added `rejectEntreeQualityControl()` function
   - Updated `DataContextType` interface
   - Updated provider value

2. **src/components/MovementTable.tsx**
   - Updated `MovementTableProps` interface
   - Added `onQualityControlEntree` prop
   - Updated `getStatusBadge()` to handle Entrée status
   - Added "Inspecter" button for pending Entrée movements
   - Updated status badge colors (yellow for pending)

3. **src/pages/MouvementsPage.tsx**
   - Added `approveEntreeQualityControl` and `rejectEntreeQualityControl` to useData hook
   - Added state for Entrée QC modal
   - Added state for Entrée QC form data
   - Added `handleOpenEntreeQCModal()` handler
   - Added `handleCloseEntreeQCModal()` handler
   - Added `handleSubmitEntreeQC()` handler with validation
   - Added Entrée QC Modal component
   - Updated MovementTable call with new handler

## Testing Checklist

- [ ] Create new Entrée movement - verify status is "En attente"
- [ ] Verify stock is NOT updated when Entrée is created
- [ ] Click "Inspecter" button - modal opens
- [ ] Enter valid and defective quantities - validation works
- [ ] Approve Entrée - only valid quantity added to stock
- [ ] Verify defective quantity is logged but not added to stock
- [ ] Reject Entrée - stock remains unchanged
- [ ] Verify status badges display correctly (yellow/green/red)
- [ ] Check movement table shows Qté Valide and Qté Défect. columns
- [ ] Verify inspector name appears in "Approuvé par" column

## Next Steps (Optional Enhancements)

1. Add Quarantine zone for defective items
2. Add QC approval for Sortie movements (already partially implemented)
3. Add QC metrics dashboard
4. Add QC history/audit trail
5. Add batch QC approval
6. Add QC rejection reasons dropdown
7. Add QC performance metrics by inspector
