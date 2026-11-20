# Sortie Refusal System - Quick Reference

## Workflow Summary

```
Sortie "En attente" 
    ↓
Click ClipboardCheck (ONLY action icon)
    ↓
InspectionModal Opens
    ├─ Standard approval path
    └─ "Refuser tout" button (NEW)
         ↓
    SortieRefusalModal Opens
         ├─ Scenario A: Article Défectueux (Rebut)
         │   ├─ Input: Nom du Contrôleur, Motif du Refus
         │   ├─ PDF: Avis_Rejet_Sortie_[Product]_[Date].pdf
         │   ├─ Note: "Marchandise non-conforme déduite du stock physique."
         │   └─ Stock: DEDUCT full quantity
         │
         └─ Scenario B: Erreur de Préparation (Correction)
             ├─ Input: Nom de l'Opérateur, Motif de l'Erreur
             ├─ PDF: Note_Correction_Sortie_[Product]_[Date].pdf
             ├─ Note: "Correction administrative. La marchandise reste en stock."
             └─ Stock: NO DEDUCTION (return to shelf)
    ↓
Status → 'Refusé'
    ↓
PDF Download Icon appears in Actions
```

## Key Features

### 1. Actions Column (MovementTable)
- **En attente Sortie**: ClipboardCheck only ✓
- **Refusé Sortie**: PDF download icon ✓
- **Terminé Sortie**: PDF download icon ✓
- No delete/reject icons ✓

### 2. SortieRefusalModal
- **Radio Buttons**: Two clear scenarios
- **Dynamic Fields**: Based on selection
- **PDF Generation**: Automatic on confirmation
- **Full Unit Names**: Paires, not pair ✓

### 3. PDF Documents
- **Black & White Theme** ✓
- **Side-by-Side Signatures**: Operator (Left) | Controller (Right) ✓
- **Specific Notes**: Different for each scenario ✓
- **Filenames**: Include product name and date ✓

### 4. Stock Management
- **Scenario A (Defective)**: Quantity deducted ✓
- **Scenario B (Correction)**: No deduction ✓
- **Audit Trail**: Complete via PDFs ✓

## Implementation Details

### Modified Files
1. `src/components/InspectionModal.tsx`
   - Added SortieRefusalModal integration
   - Added "Refuser tout" button for Sortie
   - Added handler for refusal approval

2. `src/components/SortieRefusalModal.tsx`
   - Already implemented with two scenarios
   - Generates appropriate PDFs
   - Displays full unit names

3. `src/components/MovementTable.tsx`
   - Updated actions logic
   - Only ClipboardCheck for 'En attente' Sortie
   - PDF download for 'Refusé' and 'Terminé'

4. `src/lib/pdf-generator.ts`
   - `generateRejectionDefectivePDF()` - Scenario A
   - `generateCorrectionNotePDF()` - Scenario B
   - Professional layout with signatures

## User Interactions

### Quality Controller (Scenario A - Defective)
1. Click ClipboardCheck on pending Sortie
2. Review details and checklist
3. Click "Refuser tout"
4. Select "Article Défectueux (Rebut)"
5. Enter controller name and refusal reason
6. Click "Confirmer le Refus"
7. PDF downloads: `Avis_Rejet_Sortie_Gants-Nitrile-M_09-04-2026.pdf`
8. Status → 'Refusé'
9. Stock deducted

### Operator (Scenario B - Correction)
1. Click ClipboardCheck on pending Sortie
2. Review details and checklist
3. Click "Refuser tout"
4. Select "Erreur de Préparation (Correction)"
5. Enter operator name and error reason
6. Click "Confirmer le Refus"
7. PDF downloads: `Note_Correction_Sortie_Gants-Nitrile-M_09-04-2026.pdf`
8. Status → 'Refusé'
9. Stock unchanged (item returns to shelf)

## PDF Content

### Avis de Rejet de Sortie (Scenario A)
```
AVIS DE REJET DE SORTIE
─────────────────────────
DETAILS DE LA SORTIE REJETEE
Article: Gants Nitrile M (REF-001)
Date de Sortie: 09-04-2026 14:30
Numero de Lot: LOT-2026-001
...

MOTIF DU REJET
Dommage physique détecté lors du contrôle qualité

QUANTITES
Quantite Demandee: 100 Paires
Quantite Rejetee: 100 Paires

NOTE IMPORTANTE:
Marchandise non-conforme déduite du stock physique.

SIGNATURES (Side-by-side)
Signature de l'Operateur:        Signature du Controleur Qualite:
_____________________            _____________________
Nom: Jean Dupont                 Nom: Marie Martin
```

### Note de Correction de Sortie (Scenario B)
```
NOTE DE CORRECTION DE SORTIE
────────────────────────────
DETAILS DE LA SORTIE CORRIGEE
Article: Gants Nitrile M (REF-001)
Date de Sortie: 09-04-2026 14:30
Numero de Lot: LOT-2026-001
...

MOTIF DE L'ERREUR
Erreur de picking - mauvais article sélectionné

QUANTITES
Quantite Saisie: 100 Paires
Quantite Retournee en Rayon: 100 Paires

NOTE IMPORTANTE:
Correction administrative. La marchandise reste en stock.

SIGNATURES (Side-by-side)
Signature de l'Operateur:        Signature du Controleur Qualite:
_____________________            _____________________
Nom: Jean Dupont                 Nom: Marie Martin
```

## Validation Rules

### Scenario A (Defective)
- ✓ Controller name required
- ✓ Refusal reason required
- ✓ Full quantity deducted
- ✓ Status → 'Refusé'

### Scenario B (Correction)
- ✓ Operator name required
- ✓ Error reason required
- ✓ No stock deduction
- ✓ Status → 'Refusé'

## Testing Scenarios

### Test 1: Defective Item
1. Create Sortie with 100 Paires
2. Click ClipboardCheck
3. Click "Refuser tout"
4. Select "Article Défectueux"
5. Enter controller name and reason
6. Confirm
7. Verify: Stock deducted, PDF generated, Status = 'Refusé'

### Test 2: Picking Error
1. Create Sortie with 100 Paires
2. Click ClipboardCheck
3. Click "Refuser tout"
4. Select "Erreur de Préparation"
5. Enter operator name and reason
6. Confirm
7. Verify: Stock unchanged, PDF generated, Status = 'Refusé'

### Test 3: Normal Approval
1. Create Sortie with 100 Paires
2. Click ClipboardCheck
3. Fill verification checklist
4. Click "Approuver la Réception"
5. Verify: Stock deducted, Status = 'Terminé'

## Inventory Accuracy Guarantee

✓ **Defective Items**: Deducted from stock (physical damage)
✓ **Picking Errors**: Not deducted (administrative correction)
✓ **Audit Trail**: Complete PDF documentation
✓ **Clear Distinction**: Two separate workflows
✓ **No Ambiguity**: Each scenario has specific logic

## Global Settings Applied

✓ **Units**: Full names (Paires, not pair)
✓ **Filenames**: Include product name and date
✓ **PDF Theme**: Black & White professional
✓ **Signatures**: Side-by-side horizontal layout
✓ **Notes**: Specific for each scenario
