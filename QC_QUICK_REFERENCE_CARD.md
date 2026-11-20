# QC SYSTEM - QUICK REFERENCE CARD

## What Changed?

### 1. Refus Total Option ✅
- **Where:** Top of inspection modal
- **What:** Red checkbox "Refuser toute la quantité"
- **Effect:** Hides verification points & quantities, shows only refusal reason
- **Result:** Movement status → "Refusé", Stock unchanged

### 2. Sortie Security Fix ✅
- **Before:** Sortie created with "Terminé" status, stock immediately deducted
- **After:** Sortie created with "En attente" status, stock protected until QC approval
- **Impact:** No goods leave warehouse without QC inspection

### 3. UI Updates ✅
- **"Inspecter" button:** Now appears for BOTH Entrée AND Sortie when "En attente"
- **Checklists:** Dynamic - different items for Entrée vs Sortie
- **Status badges:** New "Refusé" (red) badge added

---

## Movement Statuses

| Status | Color | Meaning | Stock Updated? | PDF Available? |
|--------|-------|---------|---|---|
| En attente | Yellow | Waiting for QC | ❌ No | ❌ No |
| Terminé | Green | Approved | ✅ Yes | ✅ Yes |
| Refusé | Red | Rejected | ❌ No | ❌ No |

---

## Approval Workflow

### Normal Approval
```
1. Inspector opens modal
2. Checks all verification points
3. Enters quantities (valid/defective)
4. Clicks "Approuver"
5. Status → "Terminé"
6. Stock updated
7. PDF available
```

### Refus Total
```
1. Inspector opens modal
2. Checks "Refuser toute la quantité"
3. Enters refusal reason
4. Clicks "Confirmer le Refus Total"
5. Status → "Refusé"
6. Stock unchanged
7. PDF hidden
```

---

## Verification Checklists

### Entrée
- [ ] Aspect / Emballage Extérieur
- [ ] Conformité Quantité vs BL
- [ ] Présence Documents (FDS/BL)

### Sortie
- [ ] État de l'article (Condition check)
- [ ] Conformité Quantité vs Demande
- [ ] Emballage Expédition

---

## Stock Impact

### Entrée Approval
- **Add:** Valid quantity to destination zone
- **Ignore:** Defective quantity (logged only)
- **Result:** Stock increases by valid quantity

### Sortie Approval
- **Subtract:** Total quantity from source zone
- **Note:** Defective items are permanent loss
- **Result:** Stock decreases by total quantity

### Refusal (Both)
- **Change:** None
- **Reason:** Recorded in movement
- **Result:** Stock unchanged

---

## Key Fields

### InspectionData
```typescript
{
  controleur: string;              // Inspector name
  verificationPoints: {};          // Checked items
  qteValide: number;               // Valid quantity
  qteDefectueuse: number;          // Defective quantity
  noteControle: string;            // Defect notes
  refusTotalMotif?: string;        // Refusal reason (NEW)
}
```

### Mouvement
```typescript
{
  statut: "En attente" | "Terminé" | "Refusé";
  controleur?: string;             // Inspector name
  validQuantity?: number;          // Approved quantity
  defectiveQuantity?: number;      // Rejected quantity
  refusalReason?: string;          // Refusal reason (NEW)
}
```

---

## Validation Rules

### Normal Approval
- ✅ All verification points must be checked
- ✅ Controller name required
- ✅ Quantities must sum to movement total
- ✅ Note mandatory if defective > 0

### Refus Total
- ✅ Controller name required
- ✅ Refusal reason required
- ✅ No other fields needed

---

## Button States

### "Inspecter" Button
- **Visible:** When status = "En attente" AND type = "Entrée" OR "Sortie"
- **Hidden:** When status = "Terminé" or "Refusé"
- **Action:** Opens inspection modal

### "Approuver" Button
- **Enabled:** When all verification points checked
- **Disabled:** When any verification point unchecked
- **Color:** Green

### "Confirmer le Refus Total" Button
- **Enabled:** When controller name + refusal reason filled
- **Disabled:** When either field empty
- **Color:** Red

---

## Toast Messages

### Approval Success
```
✓ Stock mis à jour avec succès (Qté: 95 Paire)
```

### Refusal Success
```
✗ Mouvement refusé complètement (500 Paires)
```

### Validation Error
```
Veuillez vérifier: [Field Name]
```

---

## Files Changed

| File | Changes |
|------|---------|
| InspectionModal.tsx | Refus Total toggle, conditional rendering |
| DataContext.tsx | Sortie fix, refusal handling, new status |
| MouvementsPage.tsx | Refusal handler, conditional toasts |
| MovementTable.tsx | Inspecter button for both types |

---

## Testing Checklist

- [ ] Refus Total hides verification points
- [ ] Refus Total requires reason
- [ ] Refusal creates "Refusé" status
- [ ] Refusal doesn't update stock
- [ ] Sortie starts "En attente"
- [ ] Sortie stock protected until approval
- [ ] Inspecter button for Entrée
- [ ] Inspecter button for Sortie
- [ ] Correct checklist for Entrée
- [ ] Correct checklist for Sortie
- [ ] PDF hidden for refusals
- [ ] PDF visible for approvals

---

## Security Guarantees

✅ **No goods enter without QC**
✅ **No goods leave without QC**
✅ **All rejections documented**
✅ **Stock integrity protected**
✅ **Operator accountability**

---

## Common Scenarios

### Scenario 1: Approve Entrée with Defects
```
1. Open modal for pending Entrée
2. Check all verification points
3. Enter: Valid=95, Defective=5
4. Enter note about defects
5. Click "Approuver"
Result: Stock +95, Defective logged
```

### Scenario 2: Reject Entire Sortie
```
1. Open modal for pending Sortie
2. Check "Refuser toute la quantité"
3. Enter reason: "Packaging damaged"
4. Click "Confirmer le Refus Total"
Result: Status "Refusé", Stock unchanged
```

### Scenario 3: Approve Sortie
```
1. Open modal for pending Sortie
2. Check all verification points
3. Enter: Valid=100, Defective=0
4. Click "Approuver"
Result: Stock -100, Goods can leave
```

---

## Troubleshooting

**Q: Inspecter button not showing?**
A: Check if status is "En attente" and type is "Entrée" or "Sortie"

**Q: Stock not updating?**
A: Ensure you clicked "Approuver" (not "Confirmer le Refus Total")

**Q: Refusal reason field not showing?**
A: Check the "Refuser toute la quantité" checkbox first

**Q: PDF button not visible?**
A: Check if status is "Terminé" (not "Refusé" or "En attente")

---

## Key Improvements

| Before | After |
|--------|-------|
| Sortie bypassed QC | Sortie requires QC ✅ |
| No rejection option | Refus Total available ✅ |
| Inspecter only for Entrée | Inspecter for both ✅ |
| No documented reasons | Reasons recorded ✅ |
| Stock at risk | Stock protected ✅ |

---

## Next Steps

1. **Test** all scenarios in the checklist
2. **Train** operators on new workflow
3. **Monitor** QC metrics
4. **Document** any issues
5. **Iterate** based on feedback

---

## Support

For questions about:
- **Refus Total:** See QC_ADVANCED_LOGIC_SORTIE_FIX_COMPLETE.md
- **Sortie Fix:** See QC_ADVANCED_LOGIC_SORTIE_FIX_COMPLETE.md
- **Complete System:** See QC_COMPLETE_SYSTEM_OVERVIEW.md
- **Implementation:** See QC_STEP3_STOCK_IMPACT_COMPLETE.md
