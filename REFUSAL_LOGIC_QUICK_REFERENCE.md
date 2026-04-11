# REFUSAL LOGIC - QUICK REFERENCE

## Two Refusal Scenarios

### Scenario A: Article Défectueux / Endommagé
```
Input:
  - Nom du Contrôleur
  - Motif du Refus (e.g., Humidité, Casse)

Stock Action: DEDUCT (permanent loss)

Status: "Refusé - Défectueux"

PDF: Avis_Rejet_Sortie_Defectueux_[Product].pdf
     - Red text: "Stock DÉDUIT"
     - Signature: Contrôleur Qualité
```

### Scenario B: Erreur de Préparation / Quantité
```
Input:
  - Nom de l'Opérateur
  - Motif de l'Erreur (e.g., Mauvaise taille)

Stock Action: NO CHANGE (items return to shelf)

Status: "Annulé - Erreur"

PDF: Note_Correction_Preparation_[Product].pdf
     - Green text: "Stock INCHANGÉ"
     - Signature: Opérateur
```

---

## Modal Flow

1. User selects "Refuser toute la quantité"
2. Two radio button options appear
3. User selects scenario (A or B)
4. Conditional fields appear based on selection
5. User fills in required fields
6. Button text changes: "Confirmer Refus - Défectueux" or "Confirmer Refus - Erreur"
7. Click to confirm
8. PDF download button appears immediately

---

## Stock Impact

| Scenario | Stock Action | Reason |
|----------|--------------|--------|
| Defective | DEDUCT | Permanent loss, items unusable |
| Error | NO CHANGE | Items return to shelf for re-picking |

---

## PDF Filenames

| Scenario | Filename Format |
|----------|-----------------|
| Defective | `Avis_Rejet_Sortie_Defectueux_[Product]_[Date].pdf` |
| Error | `Note_Correction_Preparation_[Product]_[Date].pdf` |

---

## Status Values

| Scenario | Status |
|----------|--------|
| Defective | "Refusé - Défectueux" |
| Error | "Annulé - Erreur" |

---

## Testing

### Test Scenario A
1. Create Sortie → 100 units
2. QC Modal → "Refuser toute la quantité"
3. Select "Article Défectueux / Endommagé"
4. Enter: Controller name + defect details
5. Confirm
6. **Result**: Status "Refusé - Défectueux", Stock -100

### Test Scenario B
1. Create Sortie → 100 units
2. QC Modal → "Refuser toute la quantité"
3. Select "Erreur de Préparation / Quantité"
4. Enter: Operator name + error details
5. Confirm
6. **Result**: Status "Annulé - Erreur", Stock unchanged

---

## Audit Trail

**Scenario A (Defective)**:
- Who: Controller name
- What: Defect details
- When: Rejection date/time
- Impact: Stock deducted

**Scenario B (Error)**:
- Who: Operator name
- What: Error details
- When: Detection date/time
- Impact: Stock unchanged

---

## Build Status

✅ **SUCCESSFUL** - No errors, production-ready
