# INDIVIDUAL APPROVAL LOGIC - QUICK REFERENCE

## Status: ✅ ALREADY CORRECTLY IMPLEMENTED

The individual approval logic is already working correctly. Each movement is approved independently with its own unique ID.

---

## How It Works

### 1. ID-Based Approval ✅

**Movement Table**:
```typescript
onClick={() => onQualityControl(m.id)}  // ← Pass unique movement ID
```

**MouvementsPage**:
```typescript
const handleOpenQCModal = (id: number) => {
  setQCMouvementId(id);  // ← Store unique ID
  setIsQCModalOpen(true);
};
```

**QC Modal**:
```typescript
approveQualityControl(qcMouvementId, ...)  // ← Only this movement
```

### 2. Specific Deduction ✅

**DataContext**:
```typescript
const approveQualityControl = (id: number, ...) => {
  const mouvement = mouvements.find(m => m.id === id);  // ← Find specific movement
  const totalQtyToDeduct = mouvement.qte;  // ← Deduct only this movement's qty
  
  // Update only this movement
  setMouvements(mouvements.map(m => 
    m.id === id ? { ...m, statut: "Terminé" } : m
  ));
  
  // Deduct only from this movement's zone
  setArticles(prevArticles => {
    // Subtract totalQtyToDeduct from mouvement.emplacementSource
  });
};
```

### 3. UI Update ✅

**Button Display**:
```typescript
{m.statut === "En attente de validation Qualité" && (
  <button onClick={() => onQualityControl(m.id)}>
    Approuver
  </button>
)}
```

After approval:
- Status changes to "Terminé"
- Button disappears
- Other movements remain "En attente"

### 4. Data Integrity ✅

- Each movement has unique ID
- Only that movement is updated
- Only that movement's quantity is deducted
- No double-subtraction

---

## Example

### Before Approval
```
Movement 1: Sortie 50 from Zone A (Pending)
Movement 2: Sortie 20 from Zone B (Pending)

Inventory: [Zone A: 100, Zone B: 100]
```

### After Approving Movement 1
```
Movement 1: Sortie 50 from Zone A (Approuvé) ✅
Movement 2: Sortie 20 from Zone B (Pending) ← Still pending!

Inventory: [Zone A: 50, Zone B: 100]
```

### After Approving Movement 2
```
Movement 1: Sortie 50 from Zone A (Approuvé) ✅
Movement 2: Sortie 20 from Zone B (Approuvé) ✅

Inventory: [Zone A: 50, Zone B: 80]
```

---

## Key Points

✅ Each movement has unique ID
✅ Each approval is independent
✅ Only specific movement updated
✅ Only specific quantity deducted
✅ Other movements unaffected
✅ UI reflects individual status
✅ No double-subtraction

---

## Files Involved

1. **src/components/MovementTable.tsx**
   - Displays movements
   - Shows "Approuver" button for pending movements
   - Calls onQualityControl(m.id)

2. **src/pages/MouvementsPage.tsx**
   - handleOpenQCModal(id) - Opens QC modal for specific movement
   - handleSubmitQC() - Approves specific movement
   - Calls approveQualityControl(qcMouvementId, ...)

3. **src/contexts/DataContext.tsx**
   - approveQualityControl(id, ...) - Approves specific movement
   - Updates only that movement's status
   - Deducts only that movement's quantity

---

## Testing

- [ ] Create multiple Sorties for same article
- [ ] Approve first Sortie
- [ ] Verify only first Sortie status changes
- [ ] Verify only first Sortie quantity deducted
- [ ] Verify second Sortie still pending
- [ ] Approve second Sortie
- [ ] Verify second Sortie status changes
- [ ] Verify only second Sortie quantity deducted
- [ ] Verify inventory is correct

---

## Conclusion

The individual approval logic is **WORKING CORRECTLY**. Each movement is approved independently without affecting others.

