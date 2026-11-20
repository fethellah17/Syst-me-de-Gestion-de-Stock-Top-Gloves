# QC Control Notes - Quick Reference

## What Was Implemented

A complete QC flow that captures control notes when defects are recorded and displays them in PDF reports.

## User Workflow

### Step 1: Record Defects in QC Modal
1. Open Contrôle Qualité modal for an Entrée or Sortie
2. Enter "Quantité Défectueuse" > 0
3. **"Note de Contrôle" field becomes mandatory** (red asterisk)
4. Write the reason for defects (e.g., "Emballage endommagé", "Articles cassés")
5. Click "Approuver la Réception"

### Step 2: Notes Saved to Database
- Control notes are automatically saved to the mouvement record
- Persisted in the system for audit trail

### Step 3: Notes Appear in PDF
- When generating Bon d'Entrée or Bon de Sortie PDF
- A dedicated section appears: **"OBSERVATIONS / NOTES DE CONTROLE"**
- Shows the exact text entered by the controller
- Clean, readable formatting (no encoding issues)

## Key Rules

| Scenario | Behavior |
|----------|----------|
| **100% Conforme** | No observations section (clean PDF) |
| **Partial Defects** | Observations section shows control notes |
| **Total Refusal** | Refusal reason shown as observations |
| **No Defects** | No observations section |

## Technical Details

### Data Structure
```typescript
interface Mouvement {
  noteControle?: string;        // Control notes/observations
  qcStatus?: "Conforme" | "Non-conforme";  // QC outcome
  defectiveQuantity?: number;   // Number of defective units
  validQuantity?: number;       // Number of valid units
}
```

### Validation
- Note is **mandatory** when `qteDefectueuse > 0`
- Form prevents submission without notes
- Clear error message if missing

### PDF Rendering
- Section title: "OBSERVATIONS / NOTES DE CONTROLE"
- Font: Helvetica Normal, 9pt, Black
- Text wraps automatically to next line
- No overlapping or encoding issues
- Placed after Quantities table

## Files Involved

| File | Role |
|------|------|
| `InspectionModal.tsx` | Captures notes from user |
| `DataContext.tsx` | Persists notes to database |
| `pdf-generator.ts` | Displays notes in PDF |

## Testing

To verify the implementation:

1. **Create an Entrée movement**
   - Open QC modal
   - Enter defective quantity > 0
   - Note field becomes mandatory
   - Enter a note and approve
   - Generate PDF → See notes in "OBSERVATIONS" section

2. **Create a Sortie movement**
   - Open QC modal
   - Enter defective quantity > 0
   - Enter a note and approve
   - Generate PDF → See notes in "OBSERVATIONS" section

3. **Test empty state**
   - Create movement with 0 defects
   - Generate PDF → No observations section

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Note field not showing | Ensure `qteDefectueuse > 0` |
| Garbled text in PDF | Already fixed with `emergencyClean()` |
| Notes not saving | Check DataContext approveQualityControl() |
| Section not appearing | Check if defects > 0 |

## Example Control Notes

- "Emballage endommagé lors du transport"
- "5 articles cassés détectés à la réception"
- "Quantité inférieure à celle indiquée sur le BL"
- "Produits expirés - date limite dépassée"
- "Défaut de fabrication visible sur 3 unités"

## Compliance

✓ Mandatory field enforcement
✓ Data persistence
✓ Clean text encoding
✓ Professional PDF layout
✓ Audit trail (notes saved)
✓ Traceability (reason documented)
