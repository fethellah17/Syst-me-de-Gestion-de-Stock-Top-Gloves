# SORTIE Refusal - Quick Reference Guide

## Two Refusal Scenarios for SORTIE Movements

### Scenario A: Article Défectueux (Defective)
**When to use:** Items are damaged, broken, or non-conforming and must be removed

| Aspect | Details |
|--------|---------|
| **Input Fields** | Nom du Contrôleur + Motif du Refus |
| **Stock Action** | ✗ DEDUCT from inventory (permanent loss) |
| **PDF Title** | AVIS DE REJET DE SORTIE (DEFECTUEUX) |
| **PDF Filename** | `Avis_Rejet_Sortie_[Product].pdf` |
| **Signature Left** | Signature de l'Opérateur |
| **Signature Right** | Signature du Contrôleur |
| **Note** | "Marchandise non-conforme. Cette quantité a été déduite du stock physique." |
| **Button Color** | Red |
| **Button Text** | "Confirmer le Refus (Défectueux)" |

### Scenario B: Erreur de Préparation (Preparation Error)
**When to use:** Wrong item or quantity was picked, but items are fine and stay in warehouse

| Aspect | Details |
|--------|---------|
| **Input Fields** | Nom de l'Opérateur + Motif de l'Erreur |
| **Stock Action** | ✓ NO DEDUCTION (items remain in stock) |
| **PDF Title** | NOTE DE CORRECTION DE PREPARATION |
| **PDF Filename** | `Note_Correction_Sortie_[Product].pdf` |
| **Signature Left** | Signature de l'Opérateur |
| **Signature Right** | Visa du Responsable |
| **Note** | "Correction administrative. La marchandise reste disponible en stock." |
| **Button Color** | Blue |
| **Button Text** | "Confirmer la Correction" |

---

## User Workflow

### 1. Create SORTIE Movement
```
Create movement → Status: "En attente"
```

### 2. Open QC Modal
```
Click "Inspecter" button → InspectionModal opens
```

### 3. Select Refusal Type
```
Check "Refuser toute la quantité"
↓
Select refusal type:
  ○ Article Défectueux (RED)
  ○ Erreur de Préparation (BLUE)
```

### 4. Fill Required Fields
**For Défectueux:**
- Nom du Contrôleur: [controller name]
- Motif du Refus: [reason for defect]

**For Erreur:**
- Nom de l'Opérateur: [operator name]
- Motif de l'Erreur: [reason for error]

### 5. Confirm Refusal
```
Click button → Movement status: "Refusé"
Stock updated based on scenario
```

### 6. Download PDF
```
Click PDF icon → Download appropriate document
```

---

## Stock Impact Examples

### Example 1: Defective Items (Scenario A)
```
Initial Stock: 1000 Paires
SORTIE Movement: 200 Paires
Refusal Type: Défectueux

Result:
- Stock DEDUCTED: 1000 - 200 = 800 Paires
- PDF: "Avis_Rejet_Sortie_Gants-Nitrile-M.pdf"
- Note: Items removed from warehouse
```

### Example 2: Preparation Error (Scenario B)
```
Initial Stock: 1000 Paires
SORTIE Movement: 200 Paires (wrong item picked)
Refusal Type: Erreur

Result:
- Stock UNCHANGED: 1000 Paires
- PDF: "Note_Correction_Sortie_Gants-Nitrile-M.pdf"
- Note: Items returned to shelf
```

---

## Key Differences

| Feature | Défectueux | Erreur |
|---------|-----------|--------|
| **Physical Status** | Damaged/Broken | Fine/Intact |
| **Stock Impact** | Removed | Stays |
| **Warehouse Action** | Discard | Return to shelf |
| **Responsible Party** | Controller | Operator |
| **Document Type** | Rejection Notice | Correction Note |
| **Color Coding** | Red | Blue |

---

## Form Validation Rules

### Both Scenarios Require:
- ✓ Refusal type selected (for SORTIE)
- ✓ Name field filled (Controller or Operator)
- ✓ Reason field filled (Refusal or Error reason)

### Disable Conditions:
- ✗ Missing refusal type (SORTIE only)
- ✗ Empty name field
- ✗ Empty reason field

---

## PDF Features

### Common Elements (Both PDFs)
- Company logo (Top Gloves)
- Movement details (Article, Date, Lot, Zones)
- Quantity information
- Professional signature blocks
- Validation date
- Footer timestamp

### Scenario-Specific Elements
**Défectueux:**
- Red warning note about stock deduction
- "Contrôleur" signature label

**Erreur:**
- Blue info note about stock remaining
- "Responsable" signature label

---

## Toast Notifications

### Scenario A (Défectueux)
```
✗ Mouvement refusé défectueux (stock déduit) (200 Paires)
```

### Scenario B (Erreur)
```
✗ Mouvement refusé erreur de préparation (stock conservé) (200 Paires)
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Refusal type not showing | Ensure movement type is "Sortie" |
| Can't confirm refusal | Fill all required fields (name + reason) |
| Stock not updated | Check refusal type - Erreur doesn't deduct |
| PDF not downloading | Verify browser allows downloads |
| Wrong PDF generated | Check refusal type in movement details |

---

## Best Practices

1. **Always specify reason** - Helps with audit trail and future reference
2. **Use correct scenario** - Ensures proper stock accounting
3. **Download PDF immediately** - For documentation and records
4. **Review before confirming** - Refusals are permanent actions
5. **Keep PDF copies** - For compliance and traceability

---

## Related Features

- **QC Modal:** Full quality control workflow
- **Movement Table:** View all movements and their status
- **Stock Management:** Real-time inventory updates
- **PDF Reports:** Professional documentation
- **Audit Trail:** Complete movement history

---

## Support

For questions or issues:
1. Check movement status in table
2. Review PDF for details
3. Verify stock impact in article details
4. Check audit trail for history
