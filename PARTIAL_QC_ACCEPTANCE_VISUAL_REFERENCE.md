# PARTIAL QC ACCEPTANCE - VISUAL REFERENCE

## Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│ QC Validation Complete                                      │
│ validQuantity = ? | defectiveQuantity = ?                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │ Is validQuantity > 0?  │
        └────────┬───────────────┘
                 │
        ┌────────┴────────┐
        │                 │
       YES               NO
        │                 │
        ↓                 ↓
   ┌─────────┐      ┌──────────┐
   │ LINK    │      │ DO NOT   │
   │SUPPLIER │      │ LINK     │
   └────┬────┘      └────┬─────┘
        │                │
        ↓                ↓
   ┌─────────────┐  ┌──────────────┐
   │ Partial     │  │ Complete     │
   │ Acceptance  │  │ Rejection    │
   │ (50% OK)    │  │ (0% OK)      │
   └─────────────┘  └──────────────┘
```

---

## Scenario Comparison

### Scenario 1: Partial Acceptance (50% Defective)

```
INPUT:
┌─────────────────────────────────────┐
│ Entrée Movement                     │
│ Article: Gants Nitrile M            │
│ Supplier: Fournisseur A             │
│ Received: 1000 Paire                │
└─────────────────────────────────────┘

QC INSPECTION:
┌─────────────────────────────────────┐
│ Accepted: 500 Paire                 │
│ Defective: 500 Paire                │
│ Total: 1000 Paire ✓                 │
└─────────────────────────────────────┘

DECISION POINT:
┌─────────────────────────────────────┐
│ Is validQuantity > 0?               │
│ Is 500 > 0?                         │
│ YES ✓                               │
└─────────────────────────────────────┘

OUTPUT:
┌─────────────────────────────────────┐
│ ✓ Supplier A LINKED                 │
│ ✓ Stock += 500 Paire                │
│ ✓ Badge appears                     │
│ ✓ Console: SUPPLIER LINKED          │
└─────────────────────────────────────┘
```

### Scenario 2: Complete Rejection (100% Defective)

```
INPUT:
┌─────────────────────────────────────┐
│ Entrée Movement                     │
│ Article: Gants Latex S              │
│ Supplier: Fournisseur B             │
│ Received: 1000 Paire                │
└─────────────────────────────────────┘

QC INSPECTION:
┌─────────────────────────────────────┐
│ Accepted: 0 Paire                   │
│ Defective: 1000 Paire               │
│ Total: 1000 Paire ✓                 │
└─────────────────────────────────────┘

DECISION POINT:
┌─────────────────────────────────────┐
│ Is validQuantity > 0?               │
│ Is 0 > 0?                           │
│ NO ✗                                │
└─────────────────────────────────────┘

OUTPUT:
┌─────────────────────────────────────┐
│ ✗ Supplier B NOT LINKED             │
│ ✓ Stock += 0 Paire                  │
│ ✗ Badge does NOT appear             │
│ ✓ Console: NO SUPPLIER LINK         │
└─────────────────────────────────────┘
```

### Scenario 3: Full Acceptance (0% Defective)

```
INPUT:
┌─────────────────────────────────────┐
│ Entrée Movement                     │
│ Article: Gants Vinyle L             │
│ Supplier: Fournisseur C             │
│ Received: 1000 Paire                │
└─────────────────────────────────────┘

QC INSPECTION:
┌─────────────────────────────────────┐
│ Accepted: 1000 Paire                │
│ Defective: 0 Paire                  │
│ Total: 1000 Paire ✓                 │
└─────────────────────────────────────┘

DECISION POINT:
┌─────────────────────────────────────┐
│ Is validQuantity > 0?               │
│ Is 1000 > 0?                        │
│ YES ✓                               │
└─────────────────────────────────────┘

OUTPUT:
┌─────────────────────────────────────┐
│ ✓ Supplier C LINKED                 │
│ ✓ Stock += 1000 Paire               │
│ ✓ Badge appears                     │
│ ✓ Console: SUPPLIER LINKED          │
└─────────────────────────────────────┘
```

---

## Articles Table Display

### Before Fix (Incorrect)
```
Article: Gants Nitrile M
Ref: GN-M-001
Stock: 2500 Paire

Suppliers: [Fournisseur B]
           ↑ Fournisseur A missing (incorrect!)
           
Note: Fournisseur A delivered 950 accepted units
      but was not linked due to 50 defective units
```

### After Fix (Correct)
```
Article: Gants Nitrile M
Ref: GN-M-001
Stock: 3450 Paire

Suppliers: [Fournisseur A] [Fournisseur B]
           ↑ Fournisseur A now linked (correct!)
           
Note: Fournisseur A delivered 950 accepted units
      and is now correctly linked despite 50 defective units
```

---

## Stock Update Comparison

### Scenario: 1000 units received, 50 defective, 950 accepted

```
BEFORE FIX:
┌──────────────────────────────────────┐
│ Stock: 2500 Paire                    │
│ + Accepted: 950 Paire                │
│ - Defective: 50 Paire (not added)    │
│ = New Stock: 3450 Paire ✓            │
│                                      │
│ Supplier: NOT LINKED ✗ (WRONG!)      │
└──────────────────────────────────────┘

AFTER FIX:
┌──────────────────────────────────────┐
│ Stock: 2500 Paire                    │
│ + Accepted: 950 Paire                │
│ - Defective: 50 Paire (not added)    │
│ = New Stock: 3450 Paire ✓            │
│                                      │
│ Supplier: LINKED ✓ (CORRECT!)        │
└──────────────────────────────────────┘
```

---

## Console Output Visualization

### Partial Acceptance Log
```
┌─────────────────────────────────────────────────────────┐
│ [PARTIAL QC ACCEPTANCE - SUPPLIER LINKED]               │
│ Article: Gants Nitrile M                                │
│   Supplier: Fournisseur A (ID: 1)                       │
│   Accepted Qty: 950 Paire                               │
│   Defective Qty: 50 Paire                               │
│   Status: LINKED (because accepted qty > 0)             │
└─────────────────────────────────────────────────────────┘
```

### Complete Rejection Log
```
┌─────────────────────────────────────────────────────────┐
│ [COMPLETE REJECTION - NO SUPPLIER LINK]                 │
│ Article: Gants Latex S                                  │
│   Supplier: Fournisseur B                               │
│   Accepted Qty: 0 (entire lot rejected)                 │
│   Status: NOT LINKED (because accepted qty = 0)         │
└─────────────────────────────────────────────────────────┘
```

### Duplicate Prevention Log
```
┌─────────────────────────────────────────────────────────┐
│ [PARTIAL QC ACCEPTANCE - SUPPLIER ALREADY LINKED]       │
│ Article: Gants Vinyle L, Supplier: Fournisseur C        │
└─────────────────────────────────────────────────────────┘
```

---

## Supplier Badge Timeline

### Multiple Deliveries from Same Supplier

```
DAY 1:
┌─────────────────────────────────────┐
│ Supplier A delivers 1000 units       │
│ QC: 950 accepted, 50 defective       │
│ Decision: validQuantity (950) > 0?   │
│ Result: YES → LINK                   │
│                                      │
│ supplierIds = [1]                    │
│ Badge: [Fournisseur A]               │
└─────────────────────────────────────┘

DAY 2:
┌─────────────────────────────────────┐
│ Supplier A delivers 500 units        │
│ QC: 500 accepted, 0 defective        │
│ Decision: validQuantity (500) > 0?   │
│ Result: YES → LINK (but already in)  │
│                                      │
│ supplierIds = [1] (no duplicate)     │
│ Badge: [Fournisseur A] (still one)   │
└─────────────────────────────────────┘

DAY 3:
┌─────────────────────────────────────┐
│ Supplier B delivers 2000 units       │
│ QC: 2000 accepted, 0 defective       │
│ Decision: validQuantity (2000) > 0?  │
│ Result: YES → LINK                   │
│                                      │
│ supplierIds = [1, 2]                 │
│ Badges: [Fournisseur A] [Fournisseur B]
└─────────────────────────────────────┘
```

---

## Quantity Calculation Flow

```
USER INPUT (InspectionModal):
┌─────────────────────────────────────┐
│ Quantité Défectueuse: 50 Paire      │
│ (User enters defective quantity)     │
└────────────────┬────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│ AUTO-CALCULATE:                     │
│ Quantité Valide = Total - Defective │
│ Quantité Valide = 1000 - 50 = 950   │
└────────────────┬────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│ PASS TO APPROVAL:                   │
│ validQuantity = 950                 │
│ defectiveQuantity = 50              │
└────────────────┬────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│ DECISION POINT:                     │
│ Is validQuantity > 0?               │
│ Is 950 > 0?                         │
│ YES → LINK SUPPLIER                 │
└─────────────────────────────────────┘
```

---

## Data Integrity Guarantee

```
CUMULATIVE SUPPLIER LIST (Never Overwritten):

Initial State:
┌─────────────────────────────────────┐
│ Article: Gants Nitrile M            │
│ supplierIds = [1, 2]                │
│ (Fournisseur A, Fournisseur B)       │
└─────────────────────────────────────┘

New Delivery from Fournisseur A:
┌─────────────────────────────────────┐
│ Check: Is 1 already in [1, 2]?       │
│ YES → Don't add again                │
│ supplierIds = [1, 2] (unchanged)     │
└─────────────────────────────────────┘

New Delivery from Fournisseur C:
┌─────────────────────────────────────┐
│ Check: Is 3 already in [1, 2]?       │
│ NO → Add it                          │
│ supplierIds = [1, 2, 3]              │
│ (Fournisseur A, B, C)                │
└─────────────────────────────────────┘

Result: CUMULATIVE, NEVER OVERWRITTEN ✓
```

---

## Testing Matrix

```
┌──────────────┬──────────┬───────────┬──────────────┬──────────────┐
│ Scenario     │ Accepted │ Defective │ Supplier     │ Stock Update │
│              │ Qty      │ Qty       │ Linked?      │              │
├──────────────┼──────────┼───────────┼──────────────┼──────────────┤
│ Full Accept  │ 1000     │ 0         │ ✓ YES        │ +1000        │
├──────────────┼──────────┼───────────┼──────────────┼──────────────┤
│ 90% Accept   │ 900      │ 100       │ ✓ YES        │ +900         │
├──────────────┼──────────┼───────────┼──────────────┼──────────────┤
│ 50% Accept   │ 500      │ 500       │ ✓ YES        │ +500         │
├──────────────┼──────────┼───────────┼──────────────┼──────────────┤
│ 10% Accept   │ 100      │ 900       │ ✓ YES        │ +100         │
├──────────────┼──────────┼───────────┼──────────────┼──────────────┤
│ Complete Rej │ 0        │ 1000      │ ✗ NO         │ +0           │
└──────────────┴──────────┴───────────┴──────────────┴──────────────┘

KEY: validQuantity > 0 → LINK | validQuantity = 0 → NO LINK
```

---

## Implementation Checklist

```
CODE CHANGES:
  [✓] Updated supplier linking logic
  [✓] Added detailed console logging
  [✓] Maintained backward compatibility
  [✓] No breaking changes

TESTING:
  [✓] Partial acceptance (50% defective)
  [✓] Complete rejection (100% defective)
  [✓] Full acceptance (0% defective)
  [✓] Duplicate prevention
  [✓] Console logging verification
  [✓] Supplier badge display

DOCUMENTATION:
  [✓] Implementation summary
  [✓] Quick test guide
  [✓] Code flow explanation
  [✓] Visual reference (this file)

DEPLOYMENT:
  [✓] No database changes
  [✓] No configuration changes
  [✓] No environment variables
  [✓] Ready for immediate deployment
```

---

## Summary

The partial QC acceptance supplier mapping fix ensures:

1. **Suppliers are recognized** for accepted goods (validQuantity > 0)
2. **Partial acceptance is valid** (not treated as complete rejection)
3. **Data integrity is maintained** (cumulative, non-destructive)
4. **System is transparent** (detailed logging)

**Key Decision:** `validQuantity > 0 ? LINK : DO_NOT_LINK`
