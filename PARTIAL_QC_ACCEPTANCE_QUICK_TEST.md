# PARTIAL QC ACCEPTANCE - QUICK TEST GUIDE

## How to Test the Fix

### Test Case 1: Partial Acceptance (50% Defective)

**Setup:**
1. Go to Mouvements page
2. Create a new Entrée movement:
   - Article: "Gants Nitrile M" (GN-M-001)
   - Supplier: "Fournisseur A"
   - Quantity: 1000 Paire
   - Destination: "Zone A - Rack 12"

**QC Validation:**
1. Click "Valider" button on the movement
2. In InspectionModal:
   - Contrôleur: "Test User"
   - Quantité Défectueuse: 500 Paire
   - Quantité Valide: 500 Paire (auto-calculated)
   - Click "Valider"

**Expected Results:**
- ✓ Movement status changes to "Terminé"
- ✓ Stock increases by 500 Paire
- ✓ Go to Articles page → "Gants Nitrile M"
- ✓ Supplier badge "Fournisseur A" appears
- ✓ Console shows: `[PARTIAL QC ACCEPTANCE - SUPPLIER LINKED]`

---

### Test Case 2: Complete Rejection (100% Defective)

**Setup:**
1. Create a new Entrée movement:
   - Article: "Gants Latex S" (GL-S-002)
   - Supplier: "Fournisseur B"
   - Quantity: 500 Paire
   - Destination: "Zone A - Rack 12"

**QC Validation:**
1. Click "Valider" button
2. In InspectionModal:
   - Contrôleur: "Test User"
   - Quantité Défectueuse: 500 Paire
   - Quantité Valide: 0 Paire (auto-calculated)
   - Click "Valider"

**Expected Results:**
- ✓ Movement status changes to "Terminé"
- ✓ Stock remains UNCHANGED (0 added)
- ✓ Go to Articles page → "Gants Latex S"
- ✓ Supplier badge "Fournisseur B" does NOT appear
- ✓ Console shows: `[COMPLETE REJECTION - NO SUPPLIER LINK]`

---

### Test Case 3: Full Acceptance (0% Defective)

**Setup:**
1. Create a new Entrée movement:
   - Article: "Gants Vinyle L" (GV-L-003)
   - Supplier: "Fournisseur C"
   - Quantity: 2000 Paire
   - Destination: "Zone A - Rack 08"

**QC Validation:**
1. Click "Valider" button
2. In InspectionModal:
   - Contrôleur: "Test User"
   - Quantité Défectueuse: 0 Paire
   - Quantité Valide: 2000 Paire (auto-calculated)
   - Click "Valider"

**Expected Results:**
- ✓ Movement status changes to "Terminé"
- ✓ Stock increases by 2000 Paire
- ✓ Go to Articles page → "Gants Vinyle L"
- ✓ Supplier badge "Fournisseur C" appears
- ✓ Console shows: `[PARTIAL QC ACCEPTANCE - SUPPLIER LINKED]` (or similar)

---

### Test Case 4: Duplicate Prevention

**Setup:**
1. Create TWO Entrée movements from same supplier:
   - Movement 1: Supplier A, 500 units accepted
   - Movement 2: Supplier A, 300 units accepted

**QC Validation:**
1. Validate Movement 1 (500 units accepted)
   - Result: Supplier A linked
2. Validate Movement 2 (300 units accepted)
   - Result: Supplier A still linked (no duplicate)

**Expected Results:**
- ✓ Go to Articles page
- ✓ Only ONE "Supplier A" badge appears (not two)
- ✓ Console shows: `[PARTIAL QC ACCEPTANCE - SUPPLIER ALREADY LINKED]` on second validation

---

## Console Verification

### Open Browser DevTools
1. Press `F12` or `Ctrl+Shift+I`
2. Go to "Console" tab
3. Look for logs starting with `[PARTIAL QC ACCEPTANCE` or `[COMPLETE REJECTION`

### Expected Console Output

**For Partial Acceptance:**
```
[PARTIAL QC ACCEPTANCE - SUPPLIER LINKED] Article: Gants Nitrile M
  Supplier: Fournisseur A (ID: 1)
  Accepted Qty: 500 Paire
  Defective Qty: 500 Paire
  Status: LINKED (because accepted qty > 0)
```

**For Complete Rejection:**
```
[COMPLETE REJECTION - NO SUPPLIER LINK] Article: Gants Latex S
  Supplier: Fournisseur B
  Accepted Qty: 0 (entire lot rejected)
  Status: NOT LINKED (because accepted qty = 0)
```

**For Duplicate Prevention:**
```
[PARTIAL QC ACCEPTANCE - SUPPLIER ALREADY LINKED] Article: Gants Vinyle L, Supplier: Fournisseur C
```

---

## Supplier Badges Location

### Where to See Supplier Badges
1. Go to **Articles** page
2. Find the article you just validated
3. Look for colored badges under the article name
4. Each badge = one supplier who delivered accepted goods

### Example
```
Article: Gants Nitrile M
Ref: GN-M-001
Stock: 2500 Paire

Suppliers: [Fournisseur A] [Fournisseur B]
           ↑ These badges appear after QC approval
```

---

## Troubleshooting

### Issue: Supplier badge doesn't appear after validation

**Check:**
1. Did you validate with `validQuantity > 0`?
   - If validQuantity = 0, supplier should NOT appear (correct behavior)
2. Is the supplier name spelled correctly?
   - Must match exactly (case-sensitive)
3. Check console for errors
   - Look for `[PARTIAL QC ACCEPTANCE` logs

### Issue: Duplicate supplier badges appear

**Check:**
1. This should NOT happen (duplicate prevention is active)
2. If it does, check console for errors
3. Refresh page and try again

### Issue: Stock not updating correctly

**Check:**
1. Stock update is INDEPENDENT of supplier linking
2. Stock should increase by `validQuantity` (accepted units)
3. Defective units should NOT be added to stock
4. Check console for `[ENTRÉE APPROVAL]` logs

---

## Quick Checklist

- [ ] Test Case 1: Partial Acceptance (50% defective) ✓
- [ ] Test Case 2: Complete Rejection (100% defective) ✓
- [ ] Test Case 3: Full Acceptance (0% defective) ✓
- [ ] Test Case 4: Duplicate Prevention ✓
- [ ] Console logs are correct ✓
- [ ] Supplier badges display correctly ✓
- [ ] Stock updates are correct ✓
- [ ] No errors in browser console ✓

---

## Summary

The partial QC acceptance supplier mapping fix is working correctly when:
1. **Partial acceptance (50% defective)** → Supplier IS linked ✓
2. **Complete rejection (100% defective)** → Supplier is NOT linked ✓
3. **Full acceptance (0% defective)** → Supplier IS linked ✓
4. **Duplicate prevention** → Same supplier not linked twice ✓
