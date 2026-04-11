# Sortie Refusal - Quick Reference Card

## 🎯 What Changed

| Aspect | Before | After |
|--------|--------|-------|
| **Refusal Button** | Red X in table | Inside modal |
| **Number of Modals** | 2 | 1 |
| **Table Appearance** | Cluttered | Clean |
| **Workflow** | 5+ steps | 4-5 steps |
| **Accidental Clicks** | Possible | Prevented |

## 📋 New Workflow

```
1. Click ClipboardCheck icon
2. InspectionModal opens
3. Check "Refuser toute la quantité"
4. For Sortie: Select refusal type (radio)
5. Fill required fields
6. Click "Confirmer le Refus"
7. PDF generated
8. Movement marked as rejected
```

## 🔴 Refusal Type A: Article Défectueux

**When to use:** Item is damaged/defective

**Fields:**
- Nom du Contrôleur
- Motif du Refus

**PDF:** Avis_de_Rejet_de_Sortie.pdf

**Stock Impact:** ↓ DEDUCTED

**Signature:** Operator + Controller

## 🔵 Refusal Type B: Erreur de Préparation

**When to use:** Administrative/picking error

**Fields:**
- Nom de l'Opérateur
- Motif de l'Erreur

**PDF:** Note_de_Correction_Sortie.pdf

**Stock Impact:** → NO CHANGE

**Signature:** Operator + Supervisor

## 🎨 Visual Indicators

| Color | Meaning |
|-------|---------|
| 🔴 Red | Defective (Stock loss) |
| 🔵 Blue | Correction (No stock change) |
| ✅ Green | Approve button |
| ⚠️ Warning | Stock impact note |

## 📱 UI Elements

| Element | Location | Action |
|---------|----------|--------|
| ClipboardCheck | Table actions | Opens modal |
| Checkbox | Modal top | Enables refusal |
| Radio buttons | Modal middle | Selects type |
| Input fields | Modal middle | Enters data |
| Confirm button | Modal footer | Submits |
| PDF icon | Table actions | Downloads PDF |

## ✅ Validation Rules

- [ ] Refusal type must be selected (Sortie only)
- [ ] Controller/Operator name required
- [ ] Refusal/Error reason required
- [ ] All fields must be non-empty

## 📊 Stock Impact

### Defective (Article Défectueux)
```
Before: Stock = 100
After:  Stock = 0 (100 units deducted)
```

### Correction (Erreur de Préparation)
```
Before: Stock = 100
After:  Stock = 100 (no change)
```

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Modal won't open | Check movement status is "En attente" |
| Radio buttons missing | Ensure movement type is "Sortie" |
| PDF not generating | Check browser console for errors |
| Stock not updating | Verify refusal type is selected |
| Button disabled | Fill all required fields |

## 📝 PDF Filenames

**Defective:**
```
Avis_de_Rejet_de_Sortie_[Article]_[Date].pdf
```

**Correction:**
```
Note_de_Correction_Sortie_[Article]_[Date].pdf
```

## 🎓 Key Differences from Entrée

| Aspect | Entrée | Sortie |
|--------|--------|--------|
| **Refusal Type** | No selection | Two options |
| **Fields** | Controller + reason | Type-specific |
| **Stock Impact** | Always deducted | Depends on type |
| **PDF** | Bon d'Entrée | Type-specific |

## 🚀 Quick Start

1. **Find pending Sortie** → Status = "En attente"
2. **Click ClipboardCheck** → Modal opens
3. **Check refusal box** → Options appear
4. **Select type** → Fields appear
5. **Fill fields** → Name + reason
6. **Submit** → PDF generated
7. **Done** → Movement rejected

## 💡 Pro Tips

- ✅ Use "Defective" for damaged items
- ✅ Use "Correction" for picking errors
- ✅ Always fill reason field completely
- ✅ Check PDF downloads correctly
- ✅ Verify stock updated in articles page

## ⚠️ Important Notes

- Red X button is REMOVED (use modal instead)
- Only ClipboardCheck icon in table
- PDF appears after QC completion
- Stock deduction depends on refusal type
- Entrée refusal logic unchanged

## 📞 Support

**Issue:** Can't find refusal option
**Solution:** Use ClipboardCheck icon, check "Refuser toute la quantité"

**Issue:** Wrong PDF generated
**Solution:** Verify refusal type selection (radio button)

**Issue:** Stock not updated
**Solution:** Check refusal type is selected before submitting

## 🎯 Remember

| Do ✅ | Don't ❌ |
|------|---------|
| Use modal for refusal | Look for red X button |
| Select refusal type | Skip type selection |
| Fill all fields | Leave fields empty |
| Check PDF downloads | Assume PDF generated |
| Verify stock updated | Ignore stock changes |

## 📋 Checklist

Before submitting refusal:
- [ ] Refusal type selected
- [ ] Controller/Operator name entered
- [ ] Reason/Error description entered
- [ ] All fields filled
- [ ] Confirm button enabled

After submission:
- [ ] Toast shows PDF filename
- [ ] Modal closes
- [ ] Movement status = "Rejeté"
- [ ] PDF available in table
- [ ] Stock updated correctly

---

**Last Updated:** April 10, 2026
**Version:** 1.0
**Status:** Production Ready
