# QC Entrée Implementation - Code Changes Reference

## Overview of Changes

This document shows the exact code changes made to implement QC for Entrée movements.

## 1. DataContext.tsx Changes

### Change 1: Modified addMouvement() - Set Entrée to Pending QC

**Location**: Line ~240

**Before**:
```typescript
if (mouvement.type === "Entrée") {
  mouvementAvecStatut = { ...mouvement, statut: "Terminé" as const, status: "approved" as const };
}
```

**After**:
```typescript
if (mouvement.type === "Entrée") {
  // ENTRÉE: Start in pending QC status - stock NOT added yet
  mouvementAvecStatut = { ...mouvement, statut: "En attente de validation Qualité" as const, status: "pending" as const };
}
```

### Change 2: Modified addMouvement() - Don't Add Stock for Pending Entrée

**Location**: Line ~260

**Before**:
```typescript
if (mouvement.type === "Entrée") {
  const quantityInExitUnit = roundStockQuantity(mouvement.qte, article.uniteSortie);
  // ... add to stock immediately
  updateArticle(article.id, { stock: newStock, inventory: updatedInventory });
}
```

**After**:
```typescript
if (mouvement.type === "Entrée") {
  // CRITICAL: Entrée movements are PENDING QC - DO NOT add to stock yet
  // Stock will be added only after QC approval
  console.log(`[ENTRÉE PENDING QC] Article: ${article.nom}`);
  console.log(`  Quantité: ${mouvement.qte} ${article.uniteSortie}`);
  console.log(`  Status: En Attente de validation Qualité`);
  console.log(`  Stock remains unchanged until QC approval`);
}
```

### Change 3: Added approveEntreeQualityControl() Function

**Location**: After rejectQualityControl() function

```typescript
const approveEntreeQualityControl = (id: number, controleur: string, validQuantity: number, defectiveQuantity: number = 0, controlNote: string = "") => {
  const mouvement = mouvements.find(m => m.id === id);
  if (!mouvement || mouvement.type !== "Entrée") return;

  // CRITICAL: Only validQuantity is added to stock
  // Defective quantity is logged but NOT added to usable stock
  const quantityToAdd = validQuantity;

  // Update mouvement with "Terminé" status and QC metadata
  setMouvements(mouvements.map(m => 
    m.id === id 
      ? { 
          ...m, 
          statut: "Terminé" as const,
          status: "approved" as const,
          controleur,
          validQuantity,
          defectiveQuantity,
          commentaire: controlNote || m.commentaire
        }
      : m
  ));

  // Update article stock with ONLY valid quantity
  setArticles(prevArticles => {
    return prevArticles.map(article => {
      if (article.ref !== mouvement.ref) {
        return article;
      }

      console.log(`[ENTRÉE QC APPROVAL] Article: ${article.nom}`);
      console.log(`  Valid Quantity: ${validQuantity} ${article.uniteSortie}`);
      console.log(`  Defective Quantity: ${defectiveQuantity} ${article.uniteSortie}`);
      console.log(`  Stock before: ${article.stock} ${article.uniteSortie}`);

      // Add only valid quantity to stock
      const newStock = article.stock + quantityToAdd;

      // Update inventory for destination zone
      const updatedInventory = [...article.inventory];
      const existingLocation = updatedInventory.find(l => l.zone === mouvement.emplacementDestination);

      if (existingLocation) {
        const rawLocationQty = Number(existingLocation.quantity) + Number(quantityToAdd);
        existingLocation.quantity = roundStockQuantity(rawLocationQty, article.uniteSortie);
      } else {
        updatedInventory.push({ 
          zone: mouvement.emplacementDestination, 
          quantity: Number(quantityToAdd)
        });
      }

      console.log(`  Stock after: ${newStock} ${article.uniteSortie}`);
      console.log(`  Zone ${mouvement.emplacementDestination}: +${quantityToAdd}`);

      return {
        ...article,
        stock: roundStockQuantity(newStock, article.uniteSortie),
        inventory: updatedInventory
      };
    });
  });
};
```

### Change 4: Added rejectEntreeQualityControl() Function

**Location**: After approveEntreeQualityControl() function

```typescript
const rejectEntreeQualityControl = (id: number, controleur: string, raison: string) => {
  const mouvement = mouvements.find(m => m.id === id);
  if (!mouvement || mouvement.type !== "Entrée") return;

  // Update mouvement with "Rejeté" status
  setMouvements(mouvements.map(m => 
    m.id === id 
      ? { 
          ...m, 
          statut: "Rejeté" as const,
          status: "rejected" as const,
          controleur,
          raison,
          rejectionReason: raison
        }
      : m
  ));
  // Stock remains unchanged - rejected items are not added
};
```

### Change 5: Updated DataContextType Interface

**Location**: Line ~95

**Added**:
```typescript
approveEntreeQualityControl: (id: number, controleur: string, validQuantity: number, defectiveQuantity?: number, controlNote?: string) => void;
rejectEntreeQualityControl: (id: number, controleur: string, raison: string) => void;
```

### Change 6: Updated Provider Value

**Location**: Line ~715

**Added**:
```typescript
approveEntreeQualityControl,
rejectEntreeQualityControl,
```

## 2. MovementTable.tsx Changes

### Change 1: Updated MovementTableProps Interface

**Location**: Line ~10

**Before**:
```typescript
interface MovementTableProps {
  movements: Mouvement[];
  articles?: Article[];
  onQualityControl?: (id: number) => void;
  onReject?: (id: number) => void;
  onDuplicate?: (mouvement: Mouvement) => void;
  showActions?: boolean;
  compact?: boolean;
}
```

**After**:
```typescript
interface MovementTableProps {
  movements: Mouvement[];
  articles?: Article[];
  onQualityControl?: (id: number) => void;
  onQualityControlEntree?: (id: number) => void;
  onReject?: (id: number) => void;
  onDuplicate?: (mouvement: Mouvement) => void;
  showActions?: boolean;
  compact?: boolean;
}
```

### Change 2: Updated Component Function Signature

**Location**: Line ~20

**Before**:
```typescript
export const MovementTable = ({ 
  movements, 
  articles = [],
  onQualityControl,
  onReject,
  onDuplicate,
  showActions = true,
  compact = false
}: MovementTableProps) => {
```

**After**:
```typescript
export const MovementTable = ({ 
  movements, 
  articles = [],
  onQualityControl,
  onQualityControlEntree,
  onReject,
  onDuplicate,
  showActions = true,
  compact = false
}: MovementTableProps) => {
```

### Change 3: Updated getStatusBadge() Function

**Location**: Line ~70

**Before**:
```typescript
const getStatusBadge = (mouvement: Mouvement) => {
  if (mouvement.type !== "Sortie" && mouvement.type !== "Ajustement") return null;
  
  switch (mouvement.statut) {
    case "En attente de validation Qualité":
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800">
```

**After**:
```typescript
const getStatusBadge = (mouvement: Mouvement) => {
  // Show status for Entrée and Sortie movements
  if (mouvement.type === "Entrée" || mouvement.type === "Sortie" || mouvement.type === "Ajustement") {
    switch (mouvement.statut) {
      case "En attente de validation Qualité":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-800">
```

### Change 4: Added Inspecter Button in Actions

**Location**: Line ~352

**Before**:
```typescript
{showActions && (
  <td className="py-3 px-2 md:px-4 text-center">
    <div className="flex items-center justify-center gap-1">
    {m.type === "Sortie" && m.statut === "Terminé" && m.status === "approved" && (
```

**After**:
```typescript
{showActions && (
  <td className="py-3 px-2 md:px-4 text-center">
    <div className="flex items-center justify-center gap-1">
    {m.type === "Entrée" && m.statut === "En attente de validation Qualité" && (
      <button
        onClick={() => onQualityControlEntree?.(m.id)}
        className="p-1.5 rounded-md hover:bg-amber-100 transition-colors text-amber-600 hover:text-amber-800"
        title="Inspecter cet article"
      >
        <AlertCircle className="w-4 h-4" />
      </button>
    )}
    {m.type === "Sortie" && m.statut === "Terminé" && m.status === "approved" && (
```

## 3. MouvementsPage.tsx Changes

### Change 1: Updated useData Hook

**Location**: Line ~10

**Before**:
```typescript
const { mouvements, articles, emplacements, addMouvement, updateArticle, deleteMouvement, getArticleLocations, approveQualityControl, rejectQualityControl, processTransfer, recalculateAllOccupancies } = useData();
```

**After**:
```typescript
const { mouvements, articles, emplacements, addMouvement, updateArticle, deleteMouvement, getArticleLocations, approveQualityControl, rejectQualityControl, approveEntreeQualityControl, rejectEntreeQualityControl, processTransfer, recalculateAllOccupancies } = useData();
```

### Change 2: Added Entrée QC Modal State

**Location**: Line ~20

**Added**:
```typescript
const [isEntreeQCModalOpen, setIsEntreeQCModalOpen] = useState(false);
const [entreeQCMouvementId, setEntreeQCMouvementId] = useState<number | null>(null);
```

### Change 3: Added Entrée QC Form Data State

**Location**: Line ~40

**Added**:
```typescript
const [entreeQCFormData, setEntreeQCFormData] = useState({
  validQuantity: 0,
  defectiveQuantity: 0,
  controleur: "",
  controlNote: "",
});
```

### Change 4: Added Handlers

**Location**: After handleOpenRejectModal()

**Added**:
```typescript
const handleOpenEntreeQCModal = (id: number) => {
  const mouvement = mouvements.find(m => m.id === id);
  if (!mouvement || mouvement.type !== "Entrée") return;
  
  setEntreeQCMouvementId(id);
  setEntreeQCFormData({
    validQuantity: mouvement.qte,
    defectiveQuantity: 0,
    controleur: "",
    controlNote: "",
  });
  setIsEntreeQCModalOpen(true);
};

const handleCloseEntreeQCModal = () => {
  setIsEntreeQCModalOpen(false);
  setEntreeQCMouvementId(null);
};

const handleSubmitEntreeQC = (e: React.FormEvent) => {
  e.preventDefault();
  if (!entreeQCFormData.controleur) {
    setToast({ message: "Veuillez renseigner le nom du contrôleur", type: "error" });
    return;
  }

  if (entreeQCMouvementId) {
    const mouvement = mouvements.find(m => m.id === entreeQCMouvementId);
    if (!mouvement) return;

    // Validate quantities
    const totalQty = entreeQCFormData.validQuantity + entreeQCFormData.defectiveQuantity;
    if (totalQty !== mouvement.qte) {
      setToast({ 
        message: `Erreur: Qté Valide (${entreeQCFormData.validQuantity}) + Qté Défectueuse (${entreeQCFormData.defectiveQuantity}) doit égaler ${mouvement.qte}`, 
        type: "error" 
      });
      return;
    }

    approveEntreeQualityControl(
      entreeQCMouvementId,
      entreeQCFormData.controleur,
      entreeQCFormData.validQuantity,
      entreeQCFormData.defectiveQuantity,
      entreeQCFormData.controlNote
    );
    setToast({ message: "✓ Entrée validée. Stock mis à jour avec succès.", type: "success" });
    recalculateAllOccupancies();
    handleCloseEntreeQCModal();
  }
};
```

### Change 5: Updated MovementTable Call

**Location**: Line ~350

**Before**:
```typescript
<MovementTable 
  movements={filtered}
  articles={articles}
  onDuplicate={handleDuplicate}
  onQualityControl={handleOpenQCModal}
  onReject={handleOpenRejectModal}
  showActions={true}
  compact={false}
/>
```

**After**:
```typescript
<MovementTable 
  movements={filtered}
  articles={articles}
  onDuplicate={handleDuplicate}
  onQualityControl={handleOpenQCModal}
  onQualityControlEntree={handleOpenEntreeQCModal}
  onReject={handleOpenRejectModal}
  showActions={true}
  compact={false}
/>
```

### Change 6: Added Entrée QC Modal

**Location**: Before Delete Confirmation Modal

**Added**:
```typescript
{/* Entrée Quality Control Modal */}
<Modal isOpen={isEntreeQCModalOpen} onClose={handleCloseEntreeQCModal} title="Contrôle Qualité - Entrée">
  <form onSubmit={handleSubmitEntreeQC} className="space-y-4">
    {entreeQCMouvementId && (() => {
      const mouvement = mouvements.find(m => m.id === entreeQCMouvementId);
      const article = mouvement ? articles.find(a => a.ref === mouvement.ref) : null;

      return article && mouvement ? (
        <div className="p-3 bg-muted/50 rounded-md border border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Article:</span>
            <span className="text-sm font-semibold text-foreground">{article.nom} ({article.ref})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Quantité Reçue:</span>
            <span className="text-sm font-semibold text-foreground">{mouvement.qte.toLocaleString()} {article.uniteSortie}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Destination:</span>
            <span className="text-sm font-semibold text-foreground">{mouvement.emplacementDestination}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Opérateur:</span>
            <span className="text-sm font-semibold text-foreground">{mouvement.operateur}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Date:</span>
            <span className="text-sm font-mono text-foreground">{mouvement.date}</span>
          </div>
        </div>
      ) : null;
    })()}

    <div>
      <label className="block text-sm font-medium text-foreground mb-1">Qté Valide</label>
      <input
        type="number"
        value={entreeQCFormData.validQuantity}
        onChange={(e) => {
          const val = Number(e.target.value) || 0;
          const mouvement = mouvements.find(m => m.id === entreeQCMouvementId);
          const maxDefective = mouvement ? mouvement.qte - val : 0;
          setEntreeQCFormData({ 
            ...entreeQCFormData, 
            validQuantity: val,
            defectiveQuantity: Math.min(entreeQCFormData.defectiveQuantity, Math.max(0, maxDefective))
          });
        }}
        className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        min="0"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-foreground mb-1">Qté Défectueuse</label>
      <input
        type="number"
        value={entreeQCFormData.defectiveQuantity}
        onChange={(e) => {
          const val = Number(e.target.value) || 0;
          const mouvement = mouvements.find(m => m.id === entreeQCMouvementId);
          const maxDefective = mouvement ? mouvement.qte - entreeQCFormData.validQuantity : 0;
          setEntreeQCFormData({ 
            ...entreeQCFormData, 
            defectiveQuantity: Math.min(val, Math.max(0, maxDefective))
          });
        }}
        className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        min="0"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-foreground mb-1">Nom du Contrôleur</label>
      <input
        type="text"
        value={entreeQCFormData.controleur}
        onChange={(e) => setEntreeQCFormData({ ...entreeQCFormData, controleur: e.target.value })}
        className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="Nom du contrôleur"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-foreground mb-1">Note de Contrôle (Optionnel)</label>
      <textarea
        value={entreeQCFormData.controlNote}
        onChange={(e) => setEntreeQCFormData({ ...entreeQCFormData, controlNote: e.target.value })}
        className="w-full px-3 py-2 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="Observations du contrôle..."
        rows={2}
      />
    </div>

    <div className="flex gap-2 pt-4">
      <button
        type="button"
        onClick={handleCloseEntreeQCModal}
        className="flex-1 h-9 rounded-md border text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        Annuler
      </button>
      <button
        type="submit"
        className="flex-1 h-9 rounded-md bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Approuver l'Entrée
      </button>
    </div>
  </form>
</Modal>
```

## Summary of Changes

| File | Changes | Lines |
|------|---------|-------|
| DataContext.tsx | Modified addMouvement(), added 2 new functions, updated interface | ~100 |
| MovementTable.tsx | Updated interface, added button, updated badge colors | ~30 |
| MouvementsPage.tsx | Added state, handlers, modal, updated calls | ~150 |

**Total Lines Added**: ~280
**Total Lines Modified**: ~50
**Build Status**: ✅ SUCCESS
**Diagnostics**: ✅ NONE
