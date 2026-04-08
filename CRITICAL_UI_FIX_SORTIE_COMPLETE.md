# Critical UI Fix - Sortie with Source AND Destination

## ✅ ISSUE RESOLVED

The multi-article modal now has the **correct specific logic** for each movement type, matching the original screenshots.

---

## What Was Fixed

### Problem
The Sortie mode was only showing **Source (Rack)** but missing **Destination (Client/Dept)**.

### Solution
Updated the modal to show **context-specific columns** for each movement type:

---

## 1. Context-Specific Columns ✅

### ENTRÉE Mode
**Columns**: `[Article | Quantité | Destination (Emplacement)]`

```
┌────────────────────────────────────────────────────────────┐
│ Article (4 cols) │ Quantité (2) │ Destination (5) │ Action │
├────────────────────────────────────────────────────────────┤
│ Seringue 10ml ▼  │ 50 [boîte]   │ Zone A - R12 ▼  │  🗑️   │
└────────────────────────────────────────────────────────────┘
```

**Purpose**: Choose where to put the new stock

### SORTIE Mode
**Columns**: `[Article | Quantité | Source (Rack) | Destination (Client/Dept)]`

```
┌──────────────────────────────────────────────────────────────────────┐
│ Article (3) │ Quantité (2) │ Source (3)      │ Destination (3) │ Act │
├──────────────────────────────────────────────────────────────────────┤
│ Seringue ▼  │ 50 [boîte]   │ Zone A (150) ▼  │ Production ▼    │ 🗑️ │
└──────────────────────────────────────────────────────────────────────┘
```

**Purpose**: 
- **Source**: Which rack it leaves from
- **Destination**: Where it's going (client/department)

### TRANSFERT Mode
**Columns**: `[Article | Quantité | Source | Destination]`

```
┌──────────────────────────────────────────────────────────────────────┐
│ Article (3) │ Quantité (2) │ Source (3)  │ Destination (3) │ Action │
├──────────────────────────────────────────────────────────────────────┤
│ Seringue ▼  │ 50 [boîte]   │ Zone A ▼    │ Zone B ▼        │  🗑️   │
└──────────────────────────────────────────────────────────────────────┘
```

**Purpose**: Moving from one internal rack to another

---

## 2. Smart Selection per Row ✅

### For Sortie and Transfert
**Source dropdown is filtered per article**:
- Only shows locations where **that specific article** has stock
- Displays available quantity: "Zone A - Rack 12 (1500 dispo)"
- Disables if no stock available
- Shows warning: "Aucun stock disponible"

### For Sortie Destination
**Destination dropdown shows client/department options**:
- Département Production
- Maintenance
- Expédition
- Destruction
- Retour Fournisseur
- Échantillons

### For Entrée and Transfert Destination
**Destination dropdown shows all emplacements (racks)**

---

## 3. Layout Cleanup ✅

### Common Fields at Top
```
┌─ Informations Communes ────────────────────┐
│ Type de Mouvement: [Entrée][Sortie][Transfert] │
│ Numéro de Lot: [LOT-2024-001]             │
│ Date du Lot: [30/03/2024 ▼]               │
│ Opérateur: [Jean Dupont]                  │
└────────────────────────────────────────────┘
```

### Wider Columns
- Increased padding: `p-3` (was `p-2`)
- Larger inputs: `h-9` (was `h-8`)
- Larger text: `text-sm` (was `text-xs`)
- More spacing: `gap-2` maintained
- Better readability

### Column Widths
- **Entrée**: Article (4), Quantity (2), Destination (5), Action (1)
- **Sortie**: Article (3), Quantity (2), Source (3), Destination (3), Action (1)
- **Transfert**: Article (3), Quantity (2), Source (3), Destination (3), Action (1)

---

## 4. Validation ✅

### Dynamic Button Label
```typescript
getMovementTypeLabel(): string {
  switch (movementType) {
    case "Entrée": return "Entrées";
    case "Sortie": return "Sorties";
    case "Transfert": return "Transferts";
  }
}
```

**Button text changes**:
- Entrée: "Confirmer les Entrées (X)"
- Sortie: "Confirmer les Sorties (X)"
- Transfert: "Confirmer les Transferts (X)"

### Validation Rules

**Entrée**:
- ✓ Article required
- ✓ Quantity > 0
- ✓ Unit required
- ✓ Destination (emplacement) required

**Sortie**:
- ✓ Article required
- ✓ Quantity > 0
- ✓ Unit required
- ✓ Source (rack) required
- ✓ Destination (client/dept) required

**Transfert**:
- ✓ Article required
- ✓ Quantity > 0
- ✓ Unit required
- ✓ Source (rack) required
- ✓ Destination (rack) required
- ✓ Source ≠ Destination

---

## Code Changes

### 1. Added Destinations List
```typescript
const destinationsUtilisation = [
  "Département Production",
  "Maintenance",
  "Expédition",
  "Destruction",
  "Retour Fournisseur",
  "Échantillons",
];
```

### 2. Updated Table Header
```typescript
{movementType === "Sortie" && (
  <>
    <div className="col-span-3">Article</div>
    <div className="col-span-2">Quantité</div>
    <div className="col-span-3">Source (Rack)</div>
    <div className="col-span-3">Destination (Client/Dept)</div>
    <div className="col-span-1 text-center">Action</div>
  </>
)}
```

### 3. Updated Sortie Row Rendering
```typescript
{movementType === "Sortie" && (
  <>
    {/* Source (Rack) - Filtered by article */}
    <div className="col-span-3">
      <select value={item.emplacementSource}>
        <option value="">Sélectionner rack...</option>
        {availableSourceLocations.map((loc, idx) => (
          <option key={idx} value={loc.emplacementNom}>
            {loc.emplacementNom} ({loc.quantite.toLocaleString()} dispo)
          </option>
        ))}
      </select>
    </div>
    
    {/* Destination (Client/Dept) */}
    <div className="col-span-3">
      <select value={item.emplacementDestination}>
        <option value="">Sélectionner destination...</option>
        {destinationsUtilisation.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  </>
)}
```

### 4. Updated Validation
```typescript
else if (movementType === "Sortie") {
  if (!item.emplacementSource) {
    newErrors[`item-${item.id}-source`] = "Source requise";
  }
  if (!item.emplacementDestination) {
    newErrors[`item-${item.id}-dest`] = "Destination requise";
  }
}
```

---

## Visual Comparison

### Before (WRONG)
```
Sortie Mode:
┌────────────────────────────────────────────┐
│ Article │ Quantité │ Source │ Action      │
├────────────────────────────────────────────┤
│ Item ▼  │ 50 [kg]  │ ZoneA▼ │ 🗑️         │
└────────────────────────────────────────────┘
❌ Missing: Where is it going?
```

### After (CORRECT)
```
Sortie Mode:
┌──────────────────────────────────────────────────────────────┐
│ Article │ Quantité │ Source (Rack) │ Destination (Client) │ │
├──────────────────────────────────────────────────────────────┤
│ Item ▼  │ 50 [kg]  │ ZoneA (150)▼  │ Production ▼         │🗑️│
└──────────────────────────────────────────────────────────────┘
✅ Complete: From which rack + Where it's going
```

---

## Use Case Example

### Sortie: Sending 3 items to Production

**Step 1**: Click "Nouveau Mouvement"

**Step 2**: Select "Sortie"

**Step 3**: Fill common fields
- Lot: PROD-2024-015
- Date: 30/03/2024
- Operator: Marie Martin

**Step 4**: Add items

**Row 1**:
- Article: Seringue 10ml
- Quantity: 20 pièces
- Source: Zone A - Rack 12 (150 dispo) ← Smart filtered
- Destination: Département Production ← Client/Dept

**Row 2**:
- Article: Aiguille 25G
- Quantity: 50 pièces
- Source: Zone B - Rack 5 (200 dispo) ← Smart filtered
- Destination: Département Production

**Row 3**:
- Article: Gaze stérile
- Quantity: 30 paquets
- Source: Zone C - Rack 3 (100 dispo) ← Smart filtered
- Destination: Département Production

**Step 5**: Click "Confirmer les Sorties (3)"

**Result**: 
- 3 exit movements created
- Each knows: From which rack + Where it's going
- Stock deducted from correct racks
- Complete traceability

---

## Testing Checklist

- [x] Entrée shows only Destination
- [x] Sortie shows Source AND Destination
- [x] Transfert shows Source AND Destination
- [x] Source filtered per article
- [x] Sortie destination shows clients/depts
- [x] Transfert destination shows racks
- [x] Columns are wider and readable
- [x] Text is larger (text-sm)
- [x] Inputs are taller (h-9)
- [x] Validation works for all types
- [x] Button label changes dynamically
- [x] No TypeScript errors

---

## Summary of Fixes

### 1. Context-Specific Columns ✅
- Entrée: [Article | Qty | Destination]
- Sortie: [Article | Qty | Source | Destination]
- Transfert: [Article | Qty | Source | Destination]

### 2. Smart Selection ✅
- Source filtered by article stock
- Sortie destination = clients/departments
- Transfert destination = racks

### 3. Layout Cleanup ✅
- Wider columns
- Larger text and inputs
- Better spacing
- More readable

### 4. Validation ✅
- Dynamic button labels
- Type-specific validation
- Both source and destination required for Sortie

---

## Status

**✅ CRITICAL UI FIX COMPLETE**

The modal now matches the original screenshots with:
- Correct column layout for each type
- Smart source filtering per article
- Both Source AND Destination for Sortie
- Clean, readable layout
- Dynamic validation

**Production Ready**: Yes
**All Tests Passing**: Yes
**No Errors**: Yes

🎉 **GOAL ACHIEVED** 🎉
