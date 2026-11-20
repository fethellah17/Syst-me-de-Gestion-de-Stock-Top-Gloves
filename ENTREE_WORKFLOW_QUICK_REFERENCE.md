# Entrée Workflow - Quick Reference

## 3 Critical Fixes

### 1. Icon Logic (PDF vs QC)
**Problem**: PDF icon showing while "En Attente"
**Fix**: Hide PDF, show only QC icon while "En Attente"

```typescript
// BEFORE (Wrong)
{m.type === "Entrée" && (
  <button onClick={() => generateInboundPDF(m)}>
    <FileText className="w-4 h-4" />
  </button>
)}

// AFTER (Correct)
{m.type === "Entrée" && m.statut === "Terminé" && m.status === "approved" && (
  <button onClick={() => generateInboundPDF(m)}>
    <FileText className="w-4 h-4" />
  </button>
)}
```

**Result**: 
- ✓ PDF hidden while "En Attente"
- ✓ QC icon visible while "En Attente"
- ✓ PDF visible only after "Terminé"

### 2. Block Immediate Stock Update
**Problem**: Stock updated on creation, before QC
**Fix**: Remove stock update from creation, move to approval only

```typescript
// In addMouvement
if (mouvement.type === "Entrée") {
  // DO NOT update stock here
  console.log(`[ENTRÉE PENDING QC] Stock remains unchanged until QC approval`);
}

// In approveEntreeQualityControl
const quantityToAdd = Number(validQuantity);
const newStock = article.stock + quantityToAdd;
// Update stock ONLY here
```

**Result**:
- ✓ Stock NOT updated on creation
- ✓ Stock ONLY updated on QC approval
- ✓ No premature changes

### 3. Isolated QC Approval
**Problem**: Multiple movements interfering with each other
**Fix**: Use unique ID, precise zone matching

```typescript
// Unique ID + UUID
const newUuid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ID-based matching
const mouvement = mouvements.find(m => m.id === id);

// Number conversion
const quantityToAdd = Number(validQuantity);

// Zone-specific update
const existingLocationIndex = updatedInventory.findIndex(l => l.zone === mouvement.emplacementDestination);
if (existingLocationIndex >= 0) {
  updatedInventory[existingLocationIndex].quantity += quantityToAdd;
} else {
  updatedInventory.push({ zone: mouvement.emplacementDestination, quantity: quantityToAdd });
}

// Recalculate total
const newStock = article.stock + quantityToAdd;
```

**Result**:
- ✓ Each movement 100% independent
- ✓ Only target zone updated
- ✓ No double-counting
- ✓ Stock total = zone totals

## Workflow

### Before (Broken)
```
Create Entrée → Stock updated ❌
Create Entrée → Stock updated ❌
PDF available ❌ (before QC)
Approve → Stock updated again ❌ (double-counted)
```

### After (Fixed)
```
Create Entrée → Stock NOT updated ✓
Create Entrée → Stock NOT updated ✓
PDF hidden ✓ (status En Attente)
Approve → Stock updated ONCE ✓
PDF visible ✓ (status Terminé)
```

## Testing

### Test 1: Icon Visibility
- Create Entrée → PDF hidden ✓
- Approve Entrée → PDF visible ✓

### Test 2: Stock Not Updated on Creation
- Create Entrée 100 units
- Stock remains unchanged ✓
- Zone unchanged ✓

### Test 3: Isolated Approval
- Create 3 Entrée for same article
- Approve 1st → Only 1st updated ✓
- Approve 2nd → Only 2nd updated ✓
- Approve 3rd → Only 3rd updated ✓
- Stock: 2500 → 2600 → 2650 → 2725 ✓

## Files Modified

1. **src/components/MovementTable.tsx**
   - Desktop view: Entrée PDF button condition
   - Mobile view: Entrée PDF button condition

2. **src/contexts/DataContext.tsx** (Already correct)
   - addMouvement: Blocks stock update
   - approveEntreeQualityControl: Isolated zone update

## Result

✓ Icon logic fixed
✓ Stock update blocked on creation
✓ Isolated QC approval working
✓ No double-counting
✓ No interference between movements
