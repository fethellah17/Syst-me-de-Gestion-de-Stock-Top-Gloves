# ✅ Sortie Approval Test Guide - IMMEDIATE INVENTORY UPDATE

## What Was Fixed

### Problem
Movement ID 2 (Gants Latex S - 200 Paire Sortie) was missing the `emplacementSource` field, causing the approval function to skip the stock deduction.

### Solution
Added `emplacementSource: "Zone A - Rack 12"` to the initial movement data, and ensured both movements have proper QC status fields.

## Test Steps

### Step 1: Open the Application
1. Start the development server if not running
2. Open browser and navigate to the app
3. Press F12 to open Developer Console

### Step 2: Check Initial Stock
1. Go to **Articles** page
2. Find "Gants Latex S" (ref: GL-S-002)
3. Note the current stock: **1800 Paire**
4. This is the baseline before approval

### Step 3: Check Emplacements
1. Go to **Emplacements** page
2. Click on "Zone A - Rack 12"
3. Modal opens showing articles in that location
4. Find "Gants Latex S"
5. Note the quantity: **1800 Paire**

### Step 4: Go to Quality Control
1. Navigate to **Contrôle Qualité** page
2. Click on **Sortie** tab
3. You should see a pending Sortie:
   - Article: Gants Latex S
   - Quantité: 200 Paire
   - Status: En attente de validation Qualité

### Step 5: Approve the Sortie
1. Click the **"Valider"** button on the Sortie
2. QC Modal opens
3. Fill in the form:
   - **Contrôleur**: Your name (e.g., "Marie L.")
   - **État des articles**: Select "Conforme"
   - Leave defective units at 0
4. Click **"Approuver"**

### Step 6: Watch the Console
You should see detailed logs like:

```
[QC APPROVAL] Starting approval for movement 2
  Type: Sortie
  Article: Gants Latex S (GL-S-002)
  Quantité: 200
  État: Conforme
  Unités défectueuses: 0

[QC APPROVAL] Article found: Gants Latex S
  Stock avant: 1800 Paire
  Locations avant: [{emplacementNom: "Zone A - Rack 12", quantite: 1800}]

[QC APPROVAL] ✅ Movement status updated to Terminé
  Movement ID: 2
  New status: Terminé
  Valid quantity: 200
  Defective quantity: 0

[SORTIE QC] DEDUCTING 200 units from stock
  Valid units (shipped): 200
  Defective units (waste/loss): 0
  TOTAL DEDUCTION: 200
  Source location: Zone A - Rack 12

  Location Zone A - Rack 12: 1800 → 1600
  Stock après: 1600 Paire
  Locations après: [{emplacementNom: "Zone A - Rack 12", quantite: 1600}]

[SORTIE QC] ✅ Article stock and locations updated

[QC APPROVAL] Applying state updates...
[QC APPROVAL] setMouvements called - 6 movements
[QC APPROVAL] setArticles called - 6 articles
[QC APPROVAL] ✅ State updates complete
[QC APPROVAL] ✅ UI should refresh immediately with new stock values
[QC APPROVAL] ===== APPROVAL COMPLETE =====
```

### Step 7: Verify Articles Page (IMMEDIATE)
1. Navigate to **Articles** page (or stay if already there)
2. Find "Gants Latex S"
3. **STOCK column should now show: 1600 Paire** ✅
4. Changed from 1800 → 1600 (deducted 200)
5. **NO page reload required!**

### Step 8: Verify Emplacements Modal (IMMEDIATE)
1. Navigate to **Emplacements** page
2. Click on "Zone A - Rack 12"
3. Modal opens
4. Find "Gants Latex S"
5. **Quantité should now show: 1600 Paire** ✅
6. Changed from 1800 → 1600 (deducted 200)
7. **NO page reload required!**

### Step 9: Verify Movement Status
1. Navigate to **Mouvements** page
2. Find the Sortie for "Gants Latex S" (200 Paire)
3. Status should show **"Terminé"** with green badge ✅
4. PDF button should be visible (green FileText icon) ✅

## Expected Results

### Before Approval
- **Articles Page**: Gants Latex S = 1800 Paire
- **Emplacements Modal**: Zone A - Rack 12 = 1800 Paire
- **Movement Status**: En attente de validation Qualité (orange)

### After Approval (IMMEDIATE)
- **Articles Page**: Gants Latex S = 1600 Paire ✅
- **Emplacements Modal**: Zone A - Rack 12 = 1600 Paire ✅
- **Movement Status**: Terminé (green) ✅
- **PDF Button**: Available ✅

### Calculation Verification
```
Initial Stock:     1800 Paire
Sortie Approved:   -200 Paire
Final Stock:       1600 Paire ✅
```

## Test with Entrée (Bonus)

### Step 1: Approve Entrée
1. Go to **Contrôle Qualité** page
2. Click on **Entrée** tab
3. Find pending Entrée: Gants Nitrile M (500 Paire = 5 Boîtes)
4. Click "Valider"
5. Fill form:
   - Contrôleur: Your name
   - État: Conforme
6. Click "Approuver"

### Step 2: Verify Stock Increase
1. Go to **Articles** page
2. Find "Gants Nitrile M"
3. Stock should INCREASE by 500 Paire ✅
4. Check console for detailed logs

## Troubleshooting

### If stock doesn't update:

1. **Check Console for Errors**
   - Look for red error messages
   - Check if `emplacementSource` is missing

2. **Verify Movement Data**
   - Ensure Sortie has `emplacementSource` field
   - Ensure Entrée has `emplacementDestination` field

3. **Check Article Reference**
   - Ensure `movement.ref` matches `article.ref`
   - Case-sensitive match required

4. **Hard Refresh**
   - Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clears cache and reloads

5. **Check React DevTools**
   - Install React DevTools extension
   - Inspect Components tab
   - Verify state changes in DataContext

## Key Points

✅ **Functional State Updates**: Using `setState(() => [...array])` forces React to detect changes
✅ **Dynamic Calculation**: UI recalculates stock from movements array
✅ **Immediate Re-render**: No page reload required
✅ **Comprehensive Logging**: Console shows every step
✅ **Dual Tracking**: Both explicit stock and dynamic calculation updated

## What Makes It Work

1. **Movement Status Change**: `statut: "En attente"` → `"Terminé"`
2. **Stock Deduction**: `article.stock` and `article.locations` updated
3. **Functional Updates**: `setMouvements(() => [...])` creates new reference
4. **React Re-render**: All components consuming `mouvements` re-render
5. **Dynamic Recalculation**: ArticlesPage and EmplacementsPage recalculate from movements
6. **Immediate Display**: New values appear instantly

## Success Criteria

✅ Console shows detailed approval logs
✅ Articles table updates immediately (1800 → 1600)
✅ Emplacements modal updates immediately (1800 → 1600)
✅ Movement status changes to "Terminé"
✅ PDF button appears
✅ No page reload required
✅ No errors in console

---

**Status**: ✅ READY TO TEST
**Fix Applied**: Added missing `emplacementSource` to initial data
**Method**: Functional state updates with comprehensive logging
