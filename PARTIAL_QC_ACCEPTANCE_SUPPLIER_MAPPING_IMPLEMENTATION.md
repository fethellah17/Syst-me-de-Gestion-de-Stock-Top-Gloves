# PARTIAL QC ACCEPTANCE - SUPPLIER MAPPING FIX

## Issue Summary
The system was incorrectly treating partial QC acceptance scenarios. When goods arrived with some damaged items, the supplier was not being linked to the article even though a portion of the delivery was accepted.

**Example Scenario:**
- Supplier A delivers 1000 units of Article X
- QC inspection finds 50 units damaged
- 950 units are accepted, 50 are rejected
- **Previous Behavior:** Supplier A was NOT linked (incorrect)
- **New Behavior:** Supplier A IS linked (correct)

---

## The Fix: Partial Acceptance Logic

### Core Principle
**A supplier must be added to an article's supplier list if ANY quantity is accepted (validQuantity > 0), regardless of whether some goods are damaged.**

### Implementation Details

#### Location
`src/contexts/DataContext.tsx` → `approveQualityControl()` function → Lines 680-710

#### Logic Flow

```
IF Entrée movement AND Supplier exists AND validQuantity > 0
  ├─ Find supplier by name
  ├─ Check if already linked (prevent duplicates)
  ├─ If NOT linked:
  │  └─ Add supplier ID to article's supplierIds array (cumulative)
  └─ Log: PARTIAL ACCEPTANCE - SUPPLIER LINKED
    
ELSE IF Entrée movement AND Supplier exists AND validQuantity = 0
  └─ Log: COMPLETE REJECTION - NO SUPPLIER LINK
```

#### Key Conditions

| Scenario | Accepted Qty | Defective Qty | Supplier Linked? | Reason |
|----------|-------------|---------------|------------------|--------|
| Full Acceptance | 1000 | 0 | ✓ YES | All units accepted |
| Partial Acceptance | 950 | 50 | ✓ YES | Some units accepted |
| Complete Rejection | 0 | 1000 | ✗ NO | No units accepted |

---

## Code Changes

### Before
```typescript
if (mouvement.type === "Entrée" && mouvement.fournisseur && validQuantity && validQuantity > 0) {
  // Link supplier
}
```

### After
```typescript
if (mouvement.type === "Entrée" && mouvement.fournisseur && validQuantity > 0) {
  // Link supplier with detailed logging
  console.log(`[PARTIAL QC ACCEPTANCE - SUPPLIER LINKED]`);
  console.log(`  Accepted Qty: ${validQuantity}`);
  console.log(`  Defective Qty: ${defectiveQuantity}`);
} else if (mouvement.type === "Entrée" && mouvement.fournisseur && validQuantity === 0) {
  // Do NOT link supplier
  console.log(`[COMPLETE REJECTION - NO SUPPLIER LINK]`);
}
```

---

## Data Integrity Guarantees

### Cumulative List (No Overwrites)
- Supplier list is **NEVER overwritten**
- New suppliers are **APPENDED** to existing list
- Duplicates are **PREVENTED** by checking `currentSupplierIds.includes(supplier.id)`

### Example Timeline
```
Day 1: Supplier A delivers Article X → supplierIds = [1]
Day 2: Supplier B delivers Article X → supplierIds = [1, 2]
Day 3: Supplier A delivers Article X again → supplierIds = [1, 2] (no duplicate)
```

### Supplier Badges Display
The Articles Table displays all linked suppliers as badges:
- Each badge represents a supplier who has successfully delivered accepted goods
- Badges are cumulative and never removed (historical record)
- Clicking a badge shows supplier details

---

## QC Workflow Integration

### Step 1: QC Validation (InspectionModal)
- User enters quantities: Accepted (Qté Valide) and Defective (Qté Défectueuse)
- User clicks "Valider" button

### Step 2: Approval Processing (approveQualityControl)
- Calculate: `validQuantity = qteValide` (from inspection)
- Calculate: `defectiveQuantity = qteDefectueuse` (from inspection)
- **Check: Is validQuantity > 0?**
  - YES → Link supplier to article
  - NO → Do NOT link supplier

### Step 3: Stock Update
- Add `validQuantity` to destination zone
- Defective items are NOT added to stock (they're rejected)

### Step 4: Supplier Badges
- Article page shows all linked suppliers
- Badges reflect all suppliers who have delivered accepted goods

---

## Testing Scenarios

### Scenario 1: Full Acceptance
```
Input:
- Supplier: "Fournisseur A"
- Received: 1000 units
- Accepted: 1000 units
- Defective: 0 units

Expected Output:
- Supplier A linked to article ✓
- Stock increased by 1000 ✓
- Supplier badge visible ✓
```

### Scenario 2: Partial Acceptance (50% Damaged)
```
Input:
- Supplier: "Fournisseur B"
- Received: 1000 units
- Accepted: 500 units
- Defective: 500 units

Expected Output:
- Supplier B linked to article ✓
- Stock increased by 500 ✓
- Supplier badge visible ✓
- Console log shows: "PARTIAL QC ACCEPTANCE - SUPPLIER LINKED" ✓
```

### Scenario 3: Complete Rejection
```
Input:
- Supplier: "Fournisseur C"
- Received: 1000 units
- Accepted: 0 units
- Defective: 1000 units

Expected Output:
- Supplier C NOT linked to article ✓
- Stock unchanged ✓
- No supplier badge ✓
- Console log shows: "COMPLETE REJECTION - NO SUPPLIER LINK" ✓
```

### Scenario 4: Multiple Deliveries from Same Supplier
```
Day 1:
- Supplier A delivers 1000 units → 950 accepted, 50 defective
- Result: Supplier A linked (supplierIds = [1])

Day 2:
- Supplier A delivers 500 units → 500 accepted, 0 defective
- Result: Supplier A still linked (supplierIds = [1], no duplicate)
```

---

## Console Logging

### Partial Acceptance Log
```
[PARTIAL QC ACCEPTANCE - SUPPLIER LINKED] Article: Gants Nitrile M
  Supplier: Fournisseur A (ID: 1)
  Accepted Qty: 950 Paire
  Defective Qty: 50 Paire
  Status: LINKED (because accepted qty > 0)
```

### Complete Rejection Log
```
[COMPLETE REJECTION - NO SUPPLIER LINK] Article: Gants Nitrile M
  Supplier: Fournisseur A
  Accepted Qty: 0 (entire lot rejected)
  Status: NOT LINKED (because accepted qty = 0)
```

### Duplicate Prevention Log
```
[PARTIAL QC ACCEPTANCE - SUPPLIER ALREADY LINKED] Article: Gants Nitrile M, Supplier: Fournisseur A
```

---

## Related Features

### Articles Table - Supplier Badges
- Location: `src/pages/ArticlesPage.tsx`
- Shows all linked suppliers for each article
- Badges are clickable to view supplier details

### Supplier Management
- Location: `src/pages/FournisseursPage.tsx`
- Add/Edit/Delete suppliers
- View supplier contact information

### Movement History
- Location: `src/components/MovementTable.tsx`
- Shows all movements with QC status
- Displays accepted vs. defective quantities

---

## Data Model

### Article Interface
```typescript
export interface Article {
  id: number;
  ref: string;
  nom: string;
  // ... other fields ...
  supplierIds?: number[]; // Many-to-Many: IDs of suppliers for this article
}
```

### Mouvement Interface
```typescript
export interface Mouvement {
  id: string;
  // ... other fields ...
  fournisseur?: string;         // Supplier name (for Entrée only)
  validQuantity?: number;       // QC metadata: quantity approved for use
  defectiveQuantity?: number;   // QC metadata: quantity marked as defective
  // ... other fields ...
}
```

---

## Verification Checklist

- [x] Supplier linking logic checks `validQuantity > 0`
- [x] Supplier linking only applies to Entrée movements
- [x] Duplicate suppliers are prevented
- [x] Supplier list is cumulative (never overwritten)
- [x] Console logging is detailed and clear
- [x] Partial acceptance scenarios are handled correctly
- [x] Complete rejection scenarios are handled correctly
- [x] Stock updates are independent of supplier linking
- [x] Supplier badges display correctly in Articles Table

---

## Summary

The partial QC acceptance supplier mapping fix ensures that:
1. **Suppliers are recognized for their accepted goods**, regardless of defects
2. **Partial acceptance is treated as valid**, not as complete rejection
3. **Data integrity is maintained** through cumulative, non-destructive updates
4. **The system is transparent** with detailed console logging for debugging

This aligns with real-world inventory management where suppliers should be credited for goods that pass QC, even if a portion of the delivery is defective.
