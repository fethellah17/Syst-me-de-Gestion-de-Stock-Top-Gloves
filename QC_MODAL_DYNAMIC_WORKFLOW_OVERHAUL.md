# QC MODAL DYNAMIC WORKFLOW OVERHAUL

## Overview
The Quality Control Modal has been completely redesigned with a dynamic workflow that adapts based on the "État des Articles" (Article Status) selection. The workflow is now simpler, more intuitive, and eliminates the separate rejection modal.

## Key Changes

### 1. Removal of Separate Rejection Modal
- **Before**: Two separate modals - one for approval, one for rejection
- **After**: Single unified modal with dynamic content based on "État des Articles"
- **Benefit**: Simplified UX, all decisions in one place

### 2. Removal of Separate "Rejeter" Button
- **Before**: Each movement had two action buttons: "Valider" and "Rejeter"
- **After**: Single "Valider" button that opens the QC modal
- **Benefit**: All decisions made within the modal, cleaner table UI

### 3. Dynamic Workflow Based on État des Articles

#### CONFORME (Compliant) Workflow
```
User clicks "Valider"
  ↓
Modal opens with "État des Articles" selection
  ↓
User clicks "Conforme" button
  ↓
Modal displays:
  - Summary: Valid Units = Total, Defective Units = 0
  - Info message about stock deduction (Sortie) or addition (Entrée)
  - "Approuver la Sortie" button (green)
  ↓
User enters Contrôleur name and clicks button
  ↓
Movement approved with all units accepted
```

#### NON-CONFORME (Non-Compliant) Workflow
```
User clicks "Valider"
  ↓
Modal opens with "État des Articles" selection
  ↓
User clicks "Non-conforme" button
  ↓
Modal displays:
  - Input field: "Nombre d'unités défectueuses"
  - Checkbox: "Rejeter complètement le mouvement"
  - Summary showing Valid Units and Defective Units
  - Info message about stock deduction/addition
  ↓
User can:
  Option A: Enter partial defects (e.g., 5 out of 100)
    - Input field enabled
    - Summary updates dynamically
    - Valid Units = 95, Defective Units = 5
  
  Option B: Check "Rejeter complètement"
    - Input field disabled and auto-set to total quantity
    - Summary updates: Valid Units = 0, Defective Units = 100
    - Button text changes to "Valider"
  ↓
User enters Contrôleur name and clicks button
  ↓
Movement approved with specified defect count
```

## Form State Structure

```typescript
const [qcFormData, setQCFormData] = useState({
  etatArticles: "Conforme" as "Conforme" | "Non-conforme",
  unitesDefectueuses: 0,
  rejectCompletely: false,  // NEW: Checkbox state
  controleur: "",
});
```

## UI Components

### État des Articles Selection
- Two buttons: "Conforme" and "Non-conforme"
- Clicking either button resets defect count and checkbox
- Button styling changes based on selection

### CONFORME Display
```
┌─────────────────────────────────┐
│ Unités Valides: 100 Paire       │
│ Unités Défectueuses: 0 Paire    │
└─────────────────────────────────┘

✓ Les 100 unités seront déduites du stock (Conforme)
```

### NON-CONFORME Display
```
┌─────────────────────────────────┐
│ Nombre d'unités défectueuses    │
│ [Input field - enabled/disabled] │
└─────────────────────────────────┘

☐ Rejeter complètement le mouvement

┌─────────────────────────────────┐
│ Unités Valides: 95 Paire        │
│ Unités Défectueuses: 5 Paire    │
└─────────────────────────────────┘

⚠️ Les 100 unités seront déduites du stock (incluant les défectueuses)
Les 5 unités défectueuses sont une perte permanente.
```

## Checkbox Logic: "Rejeter complètement le mouvement"

### When Checked:
1. Input field becomes disabled (opacity-50, cursor-not-allowed)
2. Value automatically set to total movement quantity
3. Summary updates: Valid Units = 0, Defective Units = Total
4. This represents 100% rejection (total waste/loss)

### When Unchecked:
1. Input field becomes enabled
2. User can enter partial defect count
3. Summary updates based on input
4. This represents partial rejection

### Code Implementation:
```typescript
<input
  type="checkbox"
  id="rejectCompletely"
  checked={qcFormData.rejectCompletely}
  onChange={(e) => setQCFormData({ 
    ...qcFormData, 
    rejectCompletely: e.target.checked,
    unitesDefectueuses: e.target.checked ? mouvement.qte : 0
  })}
/>

<input
  type="number"
  value={qcFormData.rejectCompletely ? mouvement.qte : (qcFormData.unitesDefectueuses === 0 ? '' : qcFormData.unitesDefectueuses)}
  onChange={(e) => setQCFormData({ ...qcFormData, unitesDefectueuses: Number(e.target.value) || 0 })}
  disabled={qcFormData.rejectCompletely}
/>
```

## Stock Deduction Logic (CRITICAL)

### For SORTIE (Exit):
**ALWAYS deduct the total quantity from stock**, regardless of status:
- Conforme: 100 units → Stock decreases by 100
- Non-conforme (partial): 95 valid + 5 defective → Stock decreases by 100
- Non-conforme (complete): 0 valid + 100 defective → Stock decreases by 100

**Why?** All items are physically removed from the warehouse (either shipped or waste/loss).

### For ENTRÉE (Entry):
**Only add valid units to stock**:
- Conforme: 100 units → Stock increases by 100
- Non-conforme (partial): 95 valid + 5 defective → Stock increases by 95
- Non-conforme (complete): 0 valid + 100 defective → Stock increases by 0

**Why?** Defective items never enter usable inventory (remain in quarantine).

## Button Behavior

### Action Button Text
- **Conforme**: "Approuver la Sortie" (green)
- **Non-conforme**: "Valider" (orange)

### Button Styling
```typescript
className={`flex-1 h-9 rounded-md text-sm font-medium transition-opacity ${
  qcFormData.etatArticles === "Conforme"
    ? "bg-success text-success-foreground hover:opacity-90"
    : "bg-warning text-warning-foreground hover:opacity-90"
}`}
```

## Success Messages

### Sortie - Conforme
```
✓ Sortie validée : 100 unités retirées du stock (Conforme)
```

### Sortie - Non-conforme (Partial)
```
✓ Sortie traitée : 100 unités retirées du stock (95 valides, 5 défectueuses)
```

### Sortie - Non-conforme (Complete)
```
✓ Sortie traitée : 100 unités retirées du stock (Rebut Total - 100% défectueux)
```

### Entrée - Conforme
```
✓ Entrée validée : 100 unités ajoutées au stock
```

### Entrée - Non-conforme (Partial)
```
✓ Entrée validée : 95 unités ajoutées au stock
```

## Workflow Comparison

### Before (Old System)
```
Movement → Click "Valider" → QC Modal
                          → Click "Rejeter" → Rejection Modal
                          → Two separate decisions
```

### After (New System)
```
Movement → Click "Valider" → QC Modal
                          → Select "Conforme" or "Non-conforme"
                          → Dynamic content based on selection
                          → Single decision point
```

## Files Modified

- `src/pages/ControleQualitePage.tsx`
  - Removed `isRejectModalOpen` state
  - Removed `rejectFormData` state
  - Added `rejectCompletely` to `qcFormData`
  - Removed `handleOpenRejectModal()` function
  - Removed `handleCloseRejectModal()` function
  - Removed `handleSubmitReject()` function
  - Updated `handleSubmitQC()` to handle checkbox logic
  - Completely redesigned QC modal with dynamic workflow
  - Removed separate rejection modal
  - Updated table action buttons (single "Valider" button)
  - Removed unused imports (XCircle, AlertCircle, rejectQualityControl)

## No Changes Needed

- `src/contexts/DataContext.tsx` - Already handles both approval and rejection correctly
- `src/pages/InventairePage.tsx` - Already reads from article.locations
- `src/pages/ArticlesPage.tsx` - Already reads from article.locations

## Testing Scenarios

### Test 1: Sortie - Conforme
1. Go to **Contrôle de Qualité** → **Contrôles à la Sortie**
2. Click **Valider** on any pending Sortie
3. Click **Conforme** button
4. Verify: Summary shows all units as valid, 0 defective
5. Enter Contrôleur name and click **Approuver la Sortie**
6. Verify: Stock decreases by total quantity

### Test 2: Sortie - Non-conforme (Partial)
1. Go to **Contrôle de Qualité** → **Contrôles à la Sortie**
2. Click **Valider** on any pending Sortie (e.g., 100 units)
3. Click **Non-conforme** button
4. Enter 5 in "Nombre d'unités défectueuses"
5. Verify: Summary shows 95 valid, 5 defective
6. Enter Contrôleur name and click **Valider**
7. Verify: Stock decreases by 100 (all units removed)

### Test 3: Sortie - Non-conforme (Complete)
1. Go to **Contrôle de Qualité** → **Contrôles à la Sortie**
2. Click **Valider** on any pending Sortie (e.g., 100 units)
3. Click **Non-conforme** button
4. Check **Rejeter complètement le mouvement**
5. Verify: Input field disabled, value = 100
6. Verify: Summary shows 0 valid, 100 defective
7. Enter Contrôleur name and click **Valider**
8. Verify: Stock decreases by 100 (all units removed as waste)

### Test 4: Entrée - Conforme
1. Go to **Contrôle de Qualité** → **Contrôles à l'Entrée**
2. Click **Valider** on any pending Entrée
3. Click **Conforme** button
4. Verify: Summary shows all units as valid, 0 defective
5. Enter Contrôleur name and click **Approuver la Sortie**
6. Verify: Stock increases by total quantity

### Test 5: Entrée - Non-conforme (Partial)
1. Go to **Contrôle de Qualité** → **Contrôles à l'Entrée**
2. Click **Valider** on any pending Entrée (e.g., 100 units)
3. Click **Non-conforme** button
4. Enter 10 in "Nombre d'unités défectueuses"
5. Verify: Summary shows 90 valid, 10 defective
6. Enter Contrôleur name and click **Valider**
7. Verify: Stock increases by 90 (only valid units added)

## Benefits of New Design

✅ **Simplified UX**: Single modal instead of two
✅ **Intuitive Workflow**: Dynamic content based on selection
✅ **Clear Decision Path**: All options visible in one place
✅ **Reduced Clicks**: No need to open separate rejection modal
✅ **Better Visual Feedback**: Summary updates in real-time
✅ **Checkbox Convenience**: Quick way to reject completely
✅ **Consistent Logic**: Same approval path for all decisions
