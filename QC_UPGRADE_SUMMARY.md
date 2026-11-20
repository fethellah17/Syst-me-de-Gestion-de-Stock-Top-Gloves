# QC System Upgrade - Quick Summary

## What Changed?

### ✅ 1. Per-Article QC Toggle
Articles now have a "Contrôle de Qualité" setting:
- **Avec contrôle de qualité** (default): Requires QC validation
- **Sans contrôle de qualité**: Auto-approved, no QC needed

### ✅ 2. QC for Both Entrée AND Sortie
Previously: Only Sortie had QC
Now: Both Entrée and Sortie can require QC (if article has `requiresQC: true`)

### ✅ 3. Dedicated QC Page
New page at `/controle-qualite` with two tabs:
- **Contrôles à l'Entrée**: Validate incoming receipts
- **Contrôles à la Sortie**: Validate outgoing orders

### ✅ 4. Smart Stock Management

**Entrée with QC:**
- Stock goes to "quarantine" (not added yet)
- After QC approval: Valid units → stock, Defective units → rejected

**Entrée without QC:**
- Stock added immediately to destination

**Sortie with QC:**
- Stock NOT deducted yet (pending validation)
- After QC approval: Total quantity deducted

**Sortie without QC:**
- Stock deducted immediately from source

## How to Use

### For Warehouse Manager:

1. **Configure Articles:**
   - Edit article → Set "Contrôle de Qualité"
   - Medical devices → "Avec contrôle de qualité"
   - Office supplies → "Sans contrôle de qualité"

2. **Create Movements:**
   - Create Entrée/Sortie as usual
   - System automatically routes to QC if needed
   - Toast message indicates if QC is required

### For QC Controller:

1. **Navigate to "Contrôle Qualité"** in sidebar
2. **Select tab:**
   - "Contrôles à l'Entrée" for receipts
   - "Contrôles à la Sortie" for orders
3. **Review pending items** (badge shows count)
4. **Click "Valider"** to approve or "Rejeter" to reject
5. **Fill QC form:**
   - État: Conforme / Non-conforme
   - Unités défectueuses (if applicable)
   - Nom du contrôleur
6. **Submit** → Stock updated automatically

## Files Changed

- `src/contexts/DataContext.tsx` - Added QC logic
- `src/pages/ArticlesPage.tsx` - Added QC toggle
- `src/pages/MouvementsPage.tsx` - Updated messages
- `src/pages/ControleQualitePage.tsx` - NEW QC page
- `src/App.tsx` - Added route
- `src/components/AppLayout.tsx` - Added nav link
- `QC_SYSTEM_UPGRADE.md` - Full documentation

## Testing

Run the app and test:
1. Create article with QC enabled
2. Create Entrée → Should be pending
3. Go to Contrôle Qualité → Validate it
4. Check stock was updated
5. Create article with QC disabled
6. Create Entrée → Should be auto-approved
7. Check stock was updated immediately

## Result

✅ QC now works for both Entrée and Sortie
✅ Per-article QC configuration
✅ Dedicated QC page with tabs
✅ Smart stock management based on QC status
✅ Clear user feedback and workflow
