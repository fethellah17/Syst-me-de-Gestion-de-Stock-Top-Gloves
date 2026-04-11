# PARTIAL QC ACCEPTANCE - CODE FLOW EXPLANATION

## End-to-End Flow

### 1. User Creates Entrée Movement
**File:** `src/pages/MouvementsPage.tsx`

```
User clicks "Ajouter Entrée"
    ↓
BulkMovementModal opens
    ↓
User enters:
  - Article: "Gants Nitrile M"
  - Supplier: "Fournisseur A"
  - Quantity: 1000 Paire
  - Destination: "Zone A - Rack 12"
    ↓
User clicks "Créer Mouvement"
    ↓
addMouvement() called
```

### 2. Movement Created in Pending Status
**File:** `src/contexts/DataContext.tsx` → `addMouvement()`

```typescript
const addMouvement = (mouvement: Omit<Mouvement, "id">) => {
  const newId = crypto.randomUUID();
  
  // QC STEP 1: Entrée movements start with "En attente" status
  let mouvementAvecStatut = mouvement;
  if (mouvement.type === "Entrée") {
    mouvementAvecStatut = { 
      ...mouvement, 
      statut: "En attente",
      status: "pending"
    };
  }
  
  // Add to movements array
  setMouvements(prev => [{ ...mouvementAvecStatut, id: newId }, ...prev]);
  
  // CRITICAL: Do NOT update stock for Entrée
  // Stock will only be updated when the Entrée is approved by QC
  console.log(`[ENTRÉE - PENDING QC] Article: ${article.nom}`);
  console.log(`  Status: En attente`);
  console.log(`  Stock remains unchanged`);
};
```

**Result:**
- Movement created with status: "En attente"
- Stock: UNCHANGED (still waiting for QC)
- Movement appears in table with "Valider" button

---

### 3. User Clicks "Valider" Button
**File:** `src/pages/MouvementsPage.tsx`

```
User clicks "Valider" on movement
    ↓
handleOpenInspectionModal(id) called
    ↓
InspectionModal opens
```

### 4. QC Inspection Modal
**File:** `src/components/InspectionModal.tsx`

```
InspectionModal displays:
  - Article details
  - Verification checklist
  - Quantity input fields
  - Defective quantity input
    ↓
User enters:
  - Contrôleur: "Test User"
  - Quantité Défectueuse: 50 Paire
  - Quantité Valide: 950 Paire (auto-calculated)
  - Notes: "Minor packaging damage"
    ↓
User clicks "Valider"
    ↓
onApprove(data) called with InspectionData
```

### 5. Approval Handler
**File:** `src/pages/MouvementsPage.tsx` → `handleInspectionApprove()`

```typescript
const handleInspectionApprove = (data: InspectionData) => {
  if (!inspectionMouvementId) return;

  const mouvement = mouvements.find(m => m.id === inspectionMouvementId);
  if (!mouvement) return;

  // Check if this is a total refusal
  if (data.refusTotalMotif || data.refusalType) {
    // Handle refusal (not applicable here)
  } else {
    // Normal approval
    approveQualityControl(
      inspectionMouvementId,
      data.controleur,                    // "Test User"
      data.qteDefectueuse > 0 ? "Non-conforme" : "Conforme",  // "Non-conforme"
      data.qteDefectueuse,                // 50
      data.qteValide,                     // 950
      undefined,
      data.noteControle,                  // "Minor packaging damage"
      data.verificationPoints
    );
  }
};
```

---

### 6. Quality Control Approval Processing
**File:** `src/contexts/DataContext.tsx` → `approveQualityControl()`

#### Step 6a: Extract Quantities
```typescript
const validQuantity = qteValide !== undefined ? qteValide : mouvement.qte;
// validQuantity = 950

const defectiveQuantity = unitesDefectueuses || 0;
// defectiveQuantity = 50

console.log(`[ENTRÉE APPROVAL] Movement ID: ${id}`);
console.log(`  Article: ${mouvement.article} (${mouvement.ref})`);
console.log(`  Valid Qty: ${validQuantity} | Defective Qty: ${defectiveQuantity}`);
```

#### Step 6b: Update Movement Status
```typescript
setMouvements(mouvements.map(m =>
  m.id === id
    ? {
        ...m,
        statut: "Terminé",           // ← Status changes
        status: "approved",
        controleur: "Test User",
        etatArticles: "Non-conforme",
        validQuantity: 950,
        defectiveQuantity: 50,
        qcStatus: "Non-conforme",
        noteControle: "Minor packaging damage",
        verificationPoints: {...},
        wasDelayed: false
      }
    : m
));
```

#### Step 6c: CRITICAL - Supplier Linking Logic
```typescript
// POST-QC SUPPLIER LINKING
if (mouvement.type === "Entrée" && mouvement.fournisseur && validQuantity > 0) {
  // ✓ This condition is TRUE because:
  //   - mouvement.type = "Entrée" ✓
  //   - mouvement.fournisseur = "Fournisseur A" ✓
  //   - validQuantity = 950 > 0 ✓
  
  const article = articles.find(a => a.ref === mouvement.ref);
  // article = { id: 1, nom: "Gants Nitrile M", supplierIds: [1, 2], ... }
  
  if (article) {
    const supplier = suppliers.find(s => s.nom === mouvement.fournisseur);
    // supplier = { id: 1, nom: "Fournisseur A", contact1: "...", ... }
    
    if (supplier) {
      const currentSupplierIds = article.supplierIds || [];
      // currentSupplierIds = [1, 2]
      
      if (!currentSupplierIds.includes(supplier.id)) {
        // supplier.id = 1, already in [1, 2]
        // This condition is FALSE (duplicate prevention)
        
        const updatedSupplierIds = [...currentSupplierIds, supplier.id];
        updateArticle(article.id, { supplierIds: updatedSupplierIds });
      } else {
        // ← We go here (duplicate prevention)
        console.log(`[PARTIAL QC ACCEPTANCE - SUPPLIER ALREADY LINKED]`);
        console.log(`  Article: Gants Nitrile M`);
        console.log(`  Supplier: Fournisseur A`);
      }
    }
  }
}
```

**Key Decision Point:**
```
Is validQuantity > 0?
  ├─ YES (950 > 0) → Link supplier ✓
  └─ NO (0 > 0) → Do NOT link supplier ✗
```

#### Step 6d: Update Article Stock
```typescript
setArticles(prevArticles => {
  return prevArticles.map(article => {
    if (article.ref !== mouvement.ref) {
      return article;
    }

    const destinationZone = mouvement.emplacementDestination;
    // destinationZone = "Zone A - Rack 12"

    // Update inventory: Add valid quantity to destination zone
    const updatedInventory = article.inventory.map(loc => {
      if (loc.zone === destinationZone) {
        const newQty = Number(loc.quantity) + validQuantity;
        // If Zone A - Rack 12 had 1500, now has 1500 + 950 = 2450
        return { ...loc, quantity: newQty };
      }
      return loc;
    });

    // Update total stock
    const newTotalStock = article.stock + validQuantity;
    // If total was 2500, now is 2500 + 950 = 3450

    console.log(`[ENTRÉE APPROVAL] Article: ${article.nom}`);
    console.log(`  Total Stock: ${article.stock} → ${newTotalStock}`);

    return {
      ...article,
      stock: newTotalStock,
      inventory: updatedInventory
    };
  });
});
```

---

### 7. Results Displayed

#### Movement Table
```
ID    | Article        | Type   | Qté  | Fournisseur    | Status    | Contrôleur
------|----------------|--------|------|----------------|-----------|----------
1234  | Gants Nitrile M| Entrée | 1000 | Fournisseur A  | Terminé   | Test User
      |                |        |      |                | ✓ Approved|
```

#### Articles Table
```
Article: Gants Nitrile M
Ref: GN-M-001
Stock: 3450 Paire (was 2500)

Suppliers: [Fournisseur A] [Fournisseur B]
           ↑ Badge shows supplier is linked
```

#### Console Output
```
[ENTRÉE APPROVAL] Movement ID: 1234
  Article: Gants Nitrile M (GN-M-001)
  Destination Zone: Zone A - Rack 12
  Valid Qty: 950 | Defective Qty: 50

[PARTIAL QC ACCEPTANCE - SUPPLIER ALREADY LINKED] Article: Gants Nitrile M, Supplier: Fournisseur A

[ENTRÉE APPROVAL] Article: Gants Nitrile M
  Total Stock: 2500 → 3450
  Zones: Zone A - Rack 12(2450), Zone B - Rack 03(1000)
```

---

## Comparison: Different Scenarios

### Scenario A: Partial Acceptance (50% Defective)
```
Input:
  validQuantity = 950
  defectiveQuantity = 50

Decision Point:
  Is validQuantity > 0?
  950 > 0? → YES ✓

Result:
  Supplier LINKED ✓
  Stock += 950 ✓
  Badge appears ✓
```

### Scenario B: Complete Rejection (100% Defective)
```
Input:
  validQuantity = 0
  defectiveQuantity = 1000

Decision Point:
  Is validQuantity > 0?
  0 > 0? → NO ✗

Result:
  Supplier NOT LINKED ✓
  Stock += 0 ✓
  Badge does NOT appear ✓
```

### Scenario C: Full Acceptance (0% Defective)
```
Input:
  validQuantity = 1000
  defectiveQuantity = 0

Decision Point:
  Is validQuantity > 0?
  1000 > 0? → YES ✓

Result:
  Supplier LINKED ✓
  Stock += 1000 ✓
  Badge appears ✓
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ User Creates Entrée Movement                                │
│ Article: Gants Nitrile M, Supplier: Fournisseur A, Qty: 1000│
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ addMouvement() - Movement Created                           │
│ Status: "En attente" (pending QC)                           │
│ Stock: UNCHANGED                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ User Clicks "Valider" Button                                │
│ InspectionModal Opens                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ User Enters QC Data                                         │
│ Accepted: 950 Paire                                         │
│ Defective: 50 Paire                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ handleInspectionApprove() Called                            │
│ Calls: approveQualityControl(...)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ approveQualityControl() - Main Processing                   │
│                                                             │
│ 1. Extract quantities:                                      │
│    validQuantity = 950                                      │
│    defectiveQuantity = 50                                   │
│                                                             │
│ 2. Update movement status: "Terminé"                        │
│                                                             │
│ 3. SUPPLIER LINKING DECISION:                               │
│    Is validQuantity > 0?                                    │
│    950 > 0? → YES ✓                                         │
│    → Link Supplier A to Article                             │
│                                                             │
│ 4. Update article stock:                                    │
│    stock = 2500 + 950 = 3450                                │
│    inventory[Zone A] = 1500 + 950 = 2450                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Results                                                     │
│                                                             │
│ Movement Table:                                             │
│   Status: Terminé ✓                                         │
│   Contrôleur: Test User                                     │
│                                                             │
│ Articles Table:                                             │
│   Stock: 3450 Paire (was 2500)                              │
│   Suppliers: [Fournisseur A] [Fournisseur B]                │
│              ↑ Badge shows supplier linked                  │
│                                                             │
│ Console:                                                    │
│   [PARTIAL QC ACCEPTANCE - SUPPLIER ALREADY LINKED]         │
│   Article: Gants Nitrile M, Supplier: Fournisseur A         │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Code Locations

| Component | File | Function | Lines |
|-----------|------|----------|-------|
| Movement Creation | `src/contexts/DataContext.tsx` | `addMouvement()` | 300-350 |
| QC Modal | `src/components/InspectionModal.tsx` | `InspectionModal` | 1-862 |
| Approval Handler | `src/pages/MouvementsPage.tsx` | `handleInspectionApprove()` | 111-200 |
| QC Processing | `src/contexts/DataContext.tsx` | `approveQualityControl()` | 650-750 |
| **Supplier Linking** | `src/contexts/DataContext.tsx` | `approveQualityControl()` | **680-710** |
| Stock Update | `src/contexts/DataContext.tsx` | `approveQualityControl()` | 710-750 |

---

## Summary

The partial QC acceptance supplier mapping fix works by:

1. **Extracting quantities** from QC inspection (accepted vs. defective)
2. **Checking the decision point**: `Is validQuantity > 0?`
3. **Linking supplier** if ANY quantity is accepted (validQuantity > 0)
4. **NOT linking supplier** if entire lot is rejected (validQuantity = 0)
5. **Updating stock** independently (always adds validQuantity)
6. **Displaying results** in Articles Table with supplier badges

This ensures suppliers are recognized for their accepted goods, regardless of whether a portion of the delivery was damaged.
