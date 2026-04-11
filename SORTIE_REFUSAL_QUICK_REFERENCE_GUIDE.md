# SORTIE CUSTOM REFUSAL - QUICK REFERENCE

## What Was Built

A two-scenario refusal system for Sortie (exit) movements that automatically handles stock impact and generates appropriate PDFs.

## The Two Scenarios

### 🔴 Option A: Article Défectueux / Rebut
**When to use:** Item is damaged (moisture, breakage, etc.)

| Aspect | Detail |
|--------|--------|
| **Fields** | Nom du Contrôleur, Motif du Refus |
| **Stock Impact** | ✓ DEDUCTED (permanent loss) |
| **PDF Name** | `Avis_de_Rejet_de_Sortie_[Product].pdf` |
| **Color** | Red (destructive) |

### 🔵 Option B: Erreur de Préparation
**When to use:** Operator picked wrong item/quantity

| Aspect | Detail |
|--------|--------|
| **Fields** | Nom de l'Opérateur, Motif de l'Erreur |
| **Stock Impact** | ✗ NO DEDUCTION (items stay on shelf) |
| **PDF Name** | `Note_de_Correction_Sortie_[Product].pdf` |
| **Color** | Blue (informational) |

## User Flow

```
Sortie Movement (Pending QC)
         ↓
    Click "Inspecter"
         ↓
  InspectionModal Opens
         ↓
  Check "Refuser toute la quantité"
         ↓
  Click "Confirmer le Refus Total"
         ↓
  SortieRefusalModal Opens ← NEW
         ↓
  Select Scenario (A or B)
         ↓
  Fill Required Fields
         ↓
  Click "Confirmer le Refus"
         ↓
  PDF Generated & Downloaded
  Stock Updated Accordingly
  Toast Notification Shown
```

## Key Differences from Entrée

| Aspect | Entrée | Sortie |
|--------|--------|--------|
| **Refusal Modal** | None (direct refusal) | SortieRefusalModal (two options) |
| **Stock Impact** | Always NO deduction | Depends on scenario |
| **PDF Types** | 1 type | 2 types |
| **Trigger** | "Refus Total" in QC | "Refus Total" in QC |

## Stock Impact Examples

### Scenario A: Defective (Stock DEDUCTED)
```
Before: Stock = 1000 units
Sortie Qty: 100 units
Refusal Type: Defective

After: Stock = 900 units ← REDUCED
```

### Scenario B: Correction (Stock UNCHANGED)
```
Before: Stock = 1000 units
Sortie Qty: 100 units
Refusal Type: Correction

After: Stock = 1000 units ← SAME
```

## PDF Features

Both PDFs include:
- ✓ Professional black & white layout
- ✓ Company logo (Top Gloves)
- ✓ Movement details (article, lot, date, zones)
- ✓ Quantity information
- ✓ Reason/motive section
- ✓ Stock impact summary
- ✓ Two-column signature blocks
- ✓ Validation date & timestamp

## Code Integration Points

### 1. InspectionModal
```typescript
onSortieRefusal={handleOpenSortieRefusalModal}
```
Triggers when user selects "Refus Total" for Sortie

### 2. SortieRefusalModal
```typescript
<SortieRefusalModal
  isOpen={isSortieRefusalModalOpen}
  onClose={handleCloseSortieRefusalModal}
  mouvement={sortieRefusalMouvement}
  article={sortieRefusalArticle}
  onConfirm={handleSortieRefusalConfirm}
/>
```

### 3. DataContext
```typescript
approveQualityControl(
  id,
  controleur,
  "Non-conforme",
  unitesDefectueuses,
  qteValide,
  refusTotalMotif,
  noteControle,
  verificationPoints,
  sortieRefusalType  // "defective" or "correction"
)
```

## Testing Scenarios

### Test 1: Defective Refusal
1. Create Sortie for 100 units
2. Open QC → Select "Refus Total"
3. Choose "Article Défectueux / Rebut"
4. Fill: Controller name + Reason
5. Confirm
6. ✓ Verify: Stock reduced by 100
7. ✓ Verify: PDF downloaded (Avis_de_Rejet_de_Sortie_*)

### Test 2: Correction Refusal
1. Create Sortie for 100 units
2. Open QC → Select "Refus Total"
3. Choose "Erreur de Préparation"
4. Fill: Operator name + Reason
5. Confirm
6. ✓ Verify: Stock unchanged
7. ✓ Verify: PDF downloaded (Note_de_Correction_Sortie_*)

### Test 3: Entrée Unchanged
1. Create Entrée for 100 units
2. Open QC → Select "Refus Total"
3. ✓ Verify: Standard refusal flow (no SortieRefusalModal)
4. ✓ Verify: Stock not deducted

## Files Changed

| File | Change |
|------|--------|
| `src/components/SortieRefusalModal.tsx` | NEW - Two-scenario modal |
| `src/components/InspectionModal.tsx` | Added onSortieRefusal callback |
| `src/pages/MouvementsPage.tsx` | Added state & handlers |
| `src/contexts/DataContext.tsx` | Updated Mouvement & approveQualityControl |
| `src/lib/pdf-generator.ts` | Added 2 PDF functions |

## Validation Rules

### Option A (Defective)
- ✓ Controller name required
- ✓ Reason required
- ✓ Min 1 character each

### Option B (Correction)
- ✓ Operator name required
- ✓ Reason required
- ✓ Min 1 character each

## Error Handling

- ✓ Missing fields → Error message shown
- ✓ No scenario selected → Button disabled
- ✓ PDF generation fails → Toast error
- ✓ Stock calculation errors → Logged to console

## Performance Notes

- PDF generation is async (doesn't block UI)
- Modal opens instantly
- Stock updates are immediate
- No database calls (all in-memory)

## Future Enhancements

- [ ] Email PDF to controller/operator
- [ ] Archive PDFs in system
- [ ] Add photo upload for defects
- [ ] Batch refusal processing
- [ ] Refusal analytics dashboard
