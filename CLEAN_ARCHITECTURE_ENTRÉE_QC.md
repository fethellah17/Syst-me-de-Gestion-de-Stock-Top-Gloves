# Clean Architecture: Quality Control & Movement Logic (Entrée Focus)

## Overview
This is a complete rewrite of the QC and movement logic with a clean, isolated workflow where **Entrée does NOT affect stock until the specific ID is approved via QC**.

---

## 1. THE IDENTIFIER (Foundation)

Every movement object **MUST** have a `uniqueId: crypto.randomUUID()`.

```typescript
// In DataContext.tsx - addMouvement()
const newUniqueId = crypto.randomUUID();
setMouvements(prev => [{ ...mouvementAvecStatut, id: newId, uniqueId: newUniqueId }, ...prev]);
```

**Why?** Never rely on indexes or names. The `uniqueId` is the single source of truth for identifying a specific movement during QC approval.

---

## 2. CREATE MOVEMENT (The Blocker)

When creating an **Entrée**, the code **ONLY** pushes to the movements array with `status: 'En Attente'`.

### The Firewall Rule
```typescript
if (mouvement.type === "Entrée") {
  mouvementAvecStatut = { 
    ...mouvement, 
    statut: "En attente de validation Qualité" as const, 
    status: "pending" as const 
  };
  console.log(`[ENTRÉE CREATION] Article: ${mouvement.article}`);
  console.log(`  ⚠️ FIREWALL: Stock NOT updated - waiting for QC approval`);
}
```

### STRICT RULE
**Any code that updates the articles array or emplacements during movement creation must be REMOVED.**

- ✅ Ajustement: Stock updated immediately (no QC needed)
- ✅ Transfert: Stock updated immediately (no QC needed)
- ❌ Entrée: Stock stays 0/unchanged at this step
- ❌ Sortie: Stock stays unchanged at this step

---

## 3. QC VALIDATION (The Trigger)

The **'Inspecter'** button passes the `uniqueId` to the Modal.

### In handleApprove(movementId)

```typescript
const approveEntreeQualityControl = (
  id: number,
  controleur: string,
  validQuantity: number,
  defectiveQuantity: number = 0,
  controlNote: string = "",
  qcChecklist?: { aspectEmballage: boolean; conformiteQuantite: boolean; presenceDocuments: boolean }
) => {
  // STEP 1: Find the EXACT movement using ID
  const mouvement = mouvements.find(m => m.id === id);
  if (!mouvement || mouvement.type !== "Entrée") return;

  // STEP 2: Check for duplicate approval (idempotency)
  if (mouvement.statut === "Terminé") {
    console.warn(`[ENTRÉE QC] ⚠️ Movement ID ${id} already approved. Skipping.`);
    return;
  }

  // STEP 3: Validate inputs
  const quantityToAdd = Number(validQuantity);
  if (quantityToAdd <= 0) {
    console.error(`[ENTRÉE QC] ❌ Invalid quantity: ${quantityToAdd}`);
    return;
  }

  // STEP 4: Find the article
  const article = articles.find(a => a.ref === mouvement.ref);
  if (!article) {
    console.error(`[ENTRÉE QC] ❌ Article not found: ${mouvement.ref}`);
    alert(`Erreur: Article ${mouvement.ref} non trouvé`);
    return;
  }

  // STEP 5: Find the destination zone
  const targetZone = mouvement.emplacementDestination;
  if (!targetZone) {
    console.error(`[ENTRÉE QC] ❌ No destination zone specified`);
    alert(`Erreur: Aucune zone de destination spécifiée`);
    return;
  }

  // STEP 6: Update stock - THE ONLY PLACE where Entrée affects stock
  setArticles(prevArticles => {
    return prevArticles.map(a => {
      if (a.ref !== mouvement.ref) {
        return a;
      }

      // Find or create the destination zone
      const updatedInventory = [...a.inventory];
      const zoneIndex = updatedInventory.findIndex(l => l.zone === targetZone);

      if (zoneIndex >= 0) {
        // Zone exists - ADD to it
        const currentQty = Number(updatedInventory[zoneIndex].quantity);
        const newQty = currentQty + quantityToAdd;
        updatedInventory[zoneIndex].quantity = roundStockQuantity(newQty, a.uniteSortie);
      } else {
        // Zone is new - CREATE it
        updatedInventory.push({
          zone: targetZone,
          quantity: roundStockQuantity(quantityToAdd, a.uniteSortie)
        });
      }

      // Update total stock
      const newStock = a.stock + quantityToAdd;

      return {
        ...a,
        stock: roundStockQuantity(newStock, a.uniteSortie),
        inventory: updatedInventory
      };
    });
  });

  // STEP 7: Update movement status - ONLY this specific movement by uniqueId
  setMouvements(prevMovements => {
    return prevMovements.map(m => {
      if (m.uniqueId !== mouvement.uniqueId) {
        return m;
      }

      return {
        ...m,
        statut: "Terminé" as const,
        status: "approved" as const,
        controleur,
        verifiePar: controleur,
        validQuantity: quantityToAdd,
        defectiveQuantity: Number(defectiveQuantity),
        commentaire: controlNote || m.commentaire,
        qcChecklist
      };
    });
  });
};
```

### Key Points

1. **Use .find() to get the EXACT movement using uniqueId**
   - Not by article name or index
   - Ensures only ONE row is affected

2. **Check for Duplicate Approval**
   - If `mouvement.statut === "Terminé"`, stop the function
   - Prevents double-counting stock

3. **Update Stock (The ONLY Place)**
   - Only now, find the article and the destination zone
   - Add `Number(qteValide)` to that zone
   - Recalculate Total: Update the article's total stock

4. **Update Status**
   - Use `setMouvements(prev => prev.map(m => m.uniqueId === movementId ? { ...m, status: 'Terminé' } : m))`
   - Ensures only ONE row is affected

5. **ERROR PREVENTION**
   - Wrap the stock update in a check: `if (article && targetZone)`
   - If not found, show an alert instead of crashing

---

## 4. UI RULES

### PDF Icon
- **Only visible if** `status === 'Terminé'`
- Hidden for pending movements

```typescript
{m.type === "Entrée" && m.statut === "Terminé" && m.status === "approved" && (
  <button onClick={() => generateInboundPDF(m)}>
    <FileText className="w-4 h-4" />
  </button>
)}
```

### Stock Preview (Impact Stock Column)
- Shows a **Clock/Pending icon** next to the number if `status === 'En Attente'`
- Indicates stock is not yet applied

```typescript
{m.statut === "En attente de validation Qualité" && (
  <div className="relative group">
    <Clock className="w-3.5 h-3.5 text-amber-500 cursor-help" />
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-amber-900 text-amber-50 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      En attente de validation QC
    </div>
  </div>
)}
```

---

## 5. WORKFLOW EXAMPLE: Entrée

### Step 1: Create Entrée
```
User creates: 500 Paires of Gants Nitrile M → Zone A-12
↓
Movement created with:
  - uniqueId: "550e8400-e29b-41d4-a716-446655440001"
  - status: "En Attente"
  - qte: 500
  - Stock: UNCHANGED (still 2500)
```

### Step 2: QC Inspector Inspects
```
Inspector clicks "Inspecter" button
↓
Modal opens with movement details
Inspector validates: 500 Paires are good
↓
Clicks "Approuver"
```

### Step 3: Stock Updated
```
approveEntreeQualityControl(id=1, controleur="Marie L.", validQuantity=500)
↓
1. Find movement by ID
2. Check if already approved (idempotency)
3. Find article: Gants Nitrile M
4. Find destination zone: Zone A-12
5. ADD 500 to Zone A-12 inventory
6. Update total stock: 2500 + 500 = 3000
7. Update movement status: "Terminé"
↓
Stock: NOW 3000 ✓
```

---

## 6. ERROR PREVENTION

### Duplicate Approval Check
```typescript
if (mouvement.statut === "Terminé") {
  console.warn(`[ENTRÉE QC] ⚠️ Movement ID ${id} already approved. Skipping.`);
  return;
}
```

### Zone Not Found Check
```typescript
if (!targetZone) {
  console.error(`[ENTRÉE QC] ❌ No destination zone specified`);
  alert(`Erreur: Aucune zone de destination spécifiée`);
  return;
}
```

### Article Not Found Check
```typescript
if (!article) {
  console.error(`[ENTRÉE QC] ❌ Article not found: ${mouvement.ref}`);
  alert(`Erreur: Article ${mouvement.ref} non trouvé`);
  return;
}
```

---

## 7. SORTIE QC (Same Pattern)

The **Sortie** workflow follows the same clean architecture:

1. **Create Sortie** → Status: "En Attente", Stock: UNCHANGED
2. **QC Inspector Inspects** → Validates quantity and condition
3. **Stock Updated** → ONLY valid quantity is deducted from stock

```typescript
const approveSortieQualityControl = (
  id: number,
  controleur: string,
  validQuantity: number,
  defectiveQuantity: number = 0,
  ...
) => {
  // Same 7-step pattern as Entrée
  // STEP 6: Deduct validQuantity from source zone
  // Defective quantity is logged but NOT deducted (blocked/returned)
};
```

---

## 8. CONSOLE LOGGING

All QC operations log detailed information for debugging:

```
[ENTRÉE CREATION] Article: Gants Nitrile M
  Status: En Attente de validation Qualité | uniqueId: 550e8400-e29b-41d4-a716-446655440001
  ⚠️ FIREWALL: Stock NOT updated - waiting for QC approval

[ENTRÉE QC APPROVAL] Movement ID: 1 | uniqueId: 550e8400-e29b-41d4-a716-446655440001
  Article: Gants Nitrile M (GN-M-001)
  Destination Zone: "Zone A - Rack 12"
  Valid Quantity: 500 Paire
  Defective Quantity: 0 Paire
  Stock before: 2500 Paire
  ✓ Zone FOUND: "Zone A - Rack 12" | 2500 + 500 = 3000
  Stock: 2500 + 500 = 3000
  ✓ Movement status: En Attente → Terminé
[ENTRÉE QC APPROVAL] ✓ COMPLETE - Stock updated for uniqueId: 550e8400-e29b-41d4-a716-446655440001
```

---

## 9. SUMMARY

| Aspect | Before | After |
|--------|--------|-------|
| **Movement Creation** | Stock updated immediately | Stock NOT updated (pending QC) |
| **Identifier** | Index-based (fragile) | `uniqueId` (robust) |
| **QC Approval** | Multiple updates possible | Single atomic update |
| **Duplicate Prevention** | No check | Status check prevents re-approval |
| **Error Handling** | Silent failures | Explicit alerts |
| **UI Feedback** | No pending indicator | Clock icon shows pending status |
| **PDF Visibility** | Always visible | Only after approval |

---

## 10. TESTING CHECKLIST

- [ ] Create Entrée → Stock should NOT change
- [ ] Inspect Entrée → Stock should update to correct value
- [ ] Approve same Entrée twice → Second approval should be skipped
- [ ] Inspect with invalid zone → Alert should show
- [ ] Inspect with invalid article → Alert should show
- [ ] PDF icon should only appear after approval
- [ ] Clock icon should appear for pending movements
- [ ] Console logs should show all steps

---

## Files Modified

1. **src/contexts/DataContext.tsx**
   - `addMouvement()` - Firewall for Entrée/Sortie
   - `approveEntreeQualityControl()` - Clean 7-step approval
   - `approveSortieQualityControl()` - Clean 7-step approval

2. **src/components/MovementTable.tsx**
   - Impact Stock column - Added pending clock icon
   - PDF icon visibility - Only show if status === "Terminé"

---

## Next Steps

1. Test the Entrée workflow end-to-end
2. Verify stock calculations are correct
3. Check console logs for any warnings
4. Test duplicate approval prevention
5. Verify PDF generation only works for approved movements
