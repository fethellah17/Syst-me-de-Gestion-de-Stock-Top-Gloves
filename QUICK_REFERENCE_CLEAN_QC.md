# Quick Reference: Clean QC Architecture

## The 3 Golden Rules

### 1. THE IDENTIFIER
```typescript
// Every movement MUST have uniqueId
const newUniqueId = crypto.randomUUID();
```

### 2. THE FIREWALL
```typescript
// Entrée/Sortie: Stock NOT updated at creation
if (mouvement.type === "Entrée") {
  mouvementAvecStatut = { 
    ...mouvement, 
    statut: "En attente de validation Qualité",
    status: "pending"
  };
  // ⚠️ NO stock update here
}
```

### 3. THE TRIGGER
```typescript
// QC approval: Stock updated ONLY here
const approveEntreeQualityControl = (id, controleur, validQuantity) => {
  // Find movement by ID
  const mouvement = mouvements.find(m => m.id === id);
  
  // Check for duplicate approval
  if (mouvement.statut === "Terminé") return;
  
  // Update stock
  setArticles(prevArticles => {
    return prevArticles.map(a => {
      if (a.ref !== mouvement.ref) return a;
      
      // Add quantity to destination zone
      const updatedInventory = [...a.inventory];
      const zoneIndex = updatedInventory.findIndex(l => l.zone === mouvement.emplacementDestination);
      
      if (zoneIndex >= 0) {
        updatedInventory[zoneIndex].quantity += validQuantity;
      } else {
        updatedInventory.push({ zone: mouvement.emplacementDestination, quantity: validQuantity });
      }
      
      return {
        ...a,
        stock: a.stock + validQuantity,
        inventory: updatedInventory
      };
    });
  });
  
  // Update movement status
  setMouvements(prevMovements => {
    return prevMovements.map(m => 
      m.uniqueId === mouvement.uniqueId
        ? { ...m, statut: "Terminé", status: "approved", controleur, validQuantity }
        : m
    );
  });
};
```

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ CREATE ENTRÉE                                               │
│ - Generate uniqueId                                         │
│ - Set status: "En Attente"                                  │
│ - Stock: UNCHANGED ⚠️                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ QC INSPECTION                                               │
│ - Inspector clicks "Inspecter"                              │
│ - Modal opens with movement details                         │
│ - Inspector validates quantity & condition                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ APPROVAL (THE TRIGGER)                                      │
│ - Find movement by ID                                       │
│ - Check: Already approved? → Skip                           │
│ - Find article & destination zone                           │
│ - ADD quantity to zone                                      │
│ - Update total stock                                        │
│ - Set status: "Terminé"                                     │
│ - Stock: NOW UPDATED ✓                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Code Patterns

### Pattern 1: Find Movement by ID
```typescript
const mouvement = mouvements.find(m => m.id === id);
if (!mouvement || mouvement.type !== "Entrée") return;
```

### Pattern 2: Duplicate Approval Check
```typescript
if (mouvement.statut === "Terminé") {
  console.warn(`Movement already approved`);
  return;
}
```

### Pattern 3: Find or Create Zone
```typescript
const updatedInventory = [...a.inventory];
const zoneIndex = updatedInventory.findIndex(l => l.zone === targetZone);

if (zoneIndex >= 0) {
  // Zone exists - ADD to it
  updatedInventory[zoneIndex].quantity += quantityToAdd;
} else {
  // Zone is new - CREATE it
  updatedInventory.push({ zone: targetZone, quantity: quantityToAdd });
}
```

### Pattern 4: Update Movement by uniqueId
```typescript
setMouvements(prevMovements => {
  return prevMovements.map(m => 
    m.uniqueId === mouvement.uniqueId
      ? { ...m, statut: "Terminé", status: "approved", controleur }
      : m
  );
});
```

---

## UI Rules

### PDF Icon
```typescript
// Only show if status === "Terminé"
{m.type === "Entrée" && m.statut === "Terminé" && m.status === "approved" && (
  <button onClick={() => generateInboundPDF(m)}>
    <FileText className="w-4 h-4" />
  </button>
)}
```

### Pending Icon (Impact Stock Column)
```typescript
// Show clock icon if status === "En Attente"
{m.statut === "En attente de validation Qualité" && (
  <Clock className="w-3.5 h-3.5 text-amber-500" />
)}
```

---

## Error Prevention

### Check 1: Article Not Found
```typescript
const article = articles.find(a => a.ref === mouvement.ref);
if (!article) {
  alert(`Erreur: Article ${mouvement.ref} non trouvé`);
  return;
}
```

### Check 2: Zone Not Found
```typescript
const targetZone = mouvement.emplacementDestination;
if (!targetZone) {
  alert(`Erreur: Aucune zone de destination spécifiée`);
  return;
}
```

### Check 3: Invalid Quantity
```typescript
const quantityToAdd = Number(validQuantity);
if (quantityToAdd <= 0) {
  console.error(`Invalid quantity: ${quantityToAdd}`);
  return;
}
```

---

## Console Logging

```typescript
console.log(`[ENTRÉE CREATION] Article: ${mouvement.article}`);
console.log(`  Status: En Attente | uniqueId: ${newUniqueId}`);
console.log(`  ⚠️ FIREWALL: Stock NOT updated`);

console.log(`[ENTRÉE QC APPROVAL] Movement ID: ${id} | uniqueId: ${mouvement.uniqueId}`);
console.log(`  Article: ${article.nom}`);
console.log(`  Destination Zone: "${targetZone}"`);
console.log(`  Valid Quantity: ${quantityToAdd} ${article.uniteSortie}`);
console.log(`  Stock before: ${article.stock}`);
console.log(`  ✓ Zone FOUND: "${targetZone}" | ${currentQty} + ${quantityToAdd} = ${newQty}`);
console.log(`  Stock after: ${newStock}`);
console.log(`[ENTRÉE QC APPROVAL] ✓ COMPLETE`);
```

---

## Testing Checklist

```
[ ] Create Entrée → Stock should NOT change
[ ] Inspect Entrée → Stock should update
[ ] Approve same Entrée twice → Second should be skipped
[ ] Inspect with invalid zone → Alert should show
[ ] Inspect with invalid article → Alert should show
[ ] PDF icon only appears after approval
[ ] Clock icon appears for pending movements
[ ] Console logs show all steps
[ ] Sortie workflow works the same way
```

---

## Key Differences from Old Code

| Old | New |
|-----|-----|
| Stock updated at creation | Stock updated at QC approval |
| Index-based identification | uniqueId-based identification |
| No duplicate check | Duplicate approval prevented |
| Silent failures | Explicit error alerts |
| No pending indicator | Clock icon shows pending |
| PDF always visible | PDF only after approval |

---

## Files to Modify

1. `src/contexts/DataContext.tsx`
   - `addMouvement()` - Add firewall
   - `approveEntreeQualityControl()` - Implement 7-step approval
   - `approveSortieQualityControl()` - Implement 7-step approval

2. `src/components/MovementTable.tsx`
   - Impact Stock column - Add pending icon
   - PDF icon - Add visibility check

---

## Common Mistakes to Avoid

❌ **DON'T** update stock during movement creation
```typescript
// WRONG
if (mouvement.type === "Entrée") {
  article.stock += mouvement.qte; // ❌ NO!
}
```

❌ **DON'T** use article name to find movement
```typescript
// WRONG
const mouvement = mouvements.find(m => m.article === "Gants Nitrile M");
```

❌ **DON'T** forget to check for duplicate approval
```typescript
// WRONG
const approveEntree = (id) => {
  // No check for already approved
  updateStock();
};
```

❌ **DON'T** forget error handling
```typescript
// WRONG
const article = articles.find(a => a.ref === mouvement.ref);
updateArticle(article.id, ...); // Crashes if article is null
```

✅ **DO** use uniqueId for identification
```typescript
// RIGHT
const mouvement = mouvements.find(m => m.id === id);
if (mouvement.statut === "Terminé") return; // Duplicate check
```

✅ **DO** wrap stock updates in error checks
```typescript
// RIGHT
if (!article || !targetZone) {
  alert("Error: Missing required data");
  return;
}
```

---

## Questions?

Refer to `CLEAN_ARCHITECTURE_ENTRÉE_QC.md` for detailed explanations.
