# SORTIE SYSTEM - QUICK REFERENCE

## 🎯 What Changed

The Sortie (Exit) system now matches Entrée (Entry) standards with a professional, symmetrical workflow.

---

## 📋 Key Features

### 1. Workflow
```
Create Sortie → "En attente" → QC Modal → Approve → "Terminé" → PDF
                                                ↓
                                        Stock Deducted
```

### 2. QC Modal (InspectionModal)
- **Sortie Checklist**: État, Quantité, Emballage
- **"Sélectionner Tout"**: Quick check/uncheck all
- **Approve Button**: Enabled by default (non-blocking)
- **Quantity Logic**: Valid = Total - Defective
- **Mandatory Notes**: If defects > 0
- **Total Refusal**: Option to reject entire shipment

### 3. PDF (Bon de Sortie)
- **Format**: `Bon_Sortie_[Product]_[Date].pdf`
- **Design**: Black & white, minimalist
- **Content**: 
  - Quantities with full unit names
  - Taux de Conformité (quality score)
  - Verification checklist
  - Control notes (if any)
  - Side-by-side signatures

### 4. Stock Deduction
- **Before QC**: Stock unchanged
- **After QC**: Stock deducted (total quantity)
- **Defective**: Permanent loss (not added back)

---

## 🔧 Files Modified

| File | Changes |
|------|---------|
| `src/lib/pdf-generator.ts` | New `generateOutboundPDF()` with professional layout |
| `src/components/InspectionModal.tsx` | Already supports Sortie (no changes needed) |
| `src/pages/MouvementsPage.tsx` | Updated to handle Sortie QC |
| `src/components/MovementTable.tsx` | Updated PDF call with articles array |
| `src/contexts/DataContext.tsx` | Already implements Sortie logic (no changes) |

---

## 🧪 Testing

### Create a Sortie
1. Go to Mouvements page
2. Click "Ajouter une Sortie"
3. Fill in details (article, quantity, lot, destination)
4. Submit → Status should be "En attente"

### Perform QC
1. Click ClipboardCheck icon on "En attente" Sortie
2. InspectionModal opens
3. Check verification points (or use "Sélectionner Tout")
4. Enter defective quantity (if any)
5. Enter control notes (mandatory if defects)
6. Click "Approuver la Sortie"
7. Status changes to "Terminé"
8. Stock is deducted

### Generate PDF
1. Click FileText icon on "Terminé" Sortie
2. PDF downloads: `Bon_Sortie_[Product]_[Date].pdf`
3. Verify layout and content

---

## 📊 Quality Score Examples

| Scenario | Valid | Defective | Score | Label |
|----------|-------|-----------|-------|-------|
| Perfect | 100 | 0 | 100% | Sortie Parfaite |
| Partial | 95 | 5 | 95% | 95% |
| Poor | 50 | 50 | 50% | 50% |
| Refused | 0 | 100 | 0% | Refus Total |

---

## 🎨 PDF Layout

```
┌─────────────────────────────────────┐
│ [Logo] Top Gloves    BON DE SORTIE  │
│                      Date: ...      │
├─────────────────────────────────────┤
│ DETAILS DE LA SORTIE                │
│ Article: Gants Nitrile M (GN-M-001) │
│ Date: 10-04-2026                    │
│ Zone Source: Zone A - Rack 12       │
│ Destination: Département Production │
│ Opérateur: Jean D.                  │
├─────────────────────────────────────┤
│ QUANTITES                           │
│ Quantité Demandée: 100 Paires       │
│ Quantité Validée: 95 Paires         │
│ Quantité Endommagée: 5 Paires       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Taux de Conformité: 95%         │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ OBSERVATIONS / NOTES DE CONTROLE    │
│ 5 paires endommagées lors du        │
│ transport. Emballage défectueux.    │
├─────────────────────────────────────┤
│ POINTS DE CONTROLE                  │
│ [X] État de l'article               │
│ [X] Conformité Quantité vs Demande  │
│ [X] Emballage Expédition            │
├─────────────────────────────────────┤
│ Signature du Magasinier:            │
│ ________________                    │
│ Nom: Jean D.                        │
│                                     │
│ Signature du Contrôleur Qualité:    │
│ ________________                    │
│ Nom: Marie L.                       │
│                                     │
│ Date de Validation: 10-04-2026      │
└─────────────────────────────────────┘
```

---

## 🔐 Data Consistency

### Unit Conversion
- Entry Unit (Boîte) → Exit Unit (Paire)
- Conversion Factor: 100 Paires per Boîte
- Applied consistently in QC modal and PDF

### Full Unit Names
- ✅ "Paires" (not "Pr")
- ✅ "Boîtes" (not "Bx")
- ✅ "Kilogrammes" (not "Kg")

### No UUIDs in PDFs
- Clean, professional appearance
- Only human-readable information

---

## 🚀 Deployment

Build status: ✅ **SUCCESSFUL**
- No TypeScript errors
- All tests pass
- Ready for production

---

## 📞 Support

For issues or questions:
1. Check the full implementation document: `SORTIE_SYSTEM_IMPLEMENTATION_COMPLETE.md`
2. Review the workflow example in the documentation
3. Test with the provided scenarios

---

## ✨ Summary

The Sortie system is now **production-ready** with:
- ✅ Professional QC workflow
- ✅ Beautiful PDF generation
- ✅ Proper stock management
- ✅ Full traceability
- ✅ Symmetrical to Entrée

**Status**: Ready for deployment
