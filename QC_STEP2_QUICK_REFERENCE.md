# QC Step 2: Inspection Modal - Quick Reference

## What Was Built
A professional inspection modal that opens when clicking the "Inspecter" icon on pending Entrée movements.

## How to Use

### 1. Open Inspection Modal
- Go to Mouvements page
- Find a pending Entrée (yellow "En attente" badge)
- Click the blue "Inspecter" (Eye) icon
- Modal opens with movement details

### 2. Fill Verification Checklist
- ☐ Aspect / Emballage Extérieur
- ☐ Conformité Quantité vs BL
- ☐ Présence Documents (FDS/BL)

**Note**: First two must be checked to enable approval

### 3. Validate Quantities
- **Qté Valide**: Quantity accepted for stock (default: full quantity)
- **Qté Défectueuse**: Quantity rejected (default: 0)
- **Total**: Must equal received quantity

### 4. Enter Controller Name
- Required field
- Identifies who performed inspection

### 5. Add Control Note (if needed)
- Appears only if Qté Défectueuse > 0
- Mandatory when defective items exist
- Describe the defects

### 6. Approve
- Click "Approuver la Réception"
- Modal closes
- Toast notification shows

## Validation Rules

| Rule | Requirement |
|------|-------------|
| Aspect | Must be checked |
| Quantité | Must be checked |
| Controller | Non-empty |
| Quantity Sum | Must equal received |
| Note | Mandatory if defective > 0 |

## Error Messages

| Error | Cause |
|-------|-------|
| "Veuillez vérifier l'aspect..." | Aspect checkbox not checked |
| "Veuillez vérifier la conformité..." | Quantité checkbox not checked |
| "Veuillez renseigner le nom..." | Controller name empty |
| "La somme des quantités..." | Qté Valide + Qté Défectueuse ≠ received |
| "Une note de contrôle est obligatoire..." | Defective > 0 but no note |

## Visual Indicators

### Quantity Reconciliation
- ✓ **Green**: Quantities match
- ✗ **Red**: Quantities don't match (shows difference)

### Approve Button
- **Disabled** (gray): Requirements not met
- **Enabled** (green): Ready to approve

### Warning Banner
- **Yellow**: Shows when first two checkpoints not checked

## Mobile Features
- Full-width layout
- Large touch targets
- Scrollable content
- Sticky header/footer
- Stacked sections

## Data Captured
```typescript
{
  controleur: "Marie L.",
  verificationPoints: {
    aspect: true,
    quantite: true,
    documents: false
  },
  qteValide: 480,
  qteDefectueuse: 20,
  noteControle: "20 unités endommagées lors du transport"
}
```

## Component Files
- **Modal**: `src/components/InspectionModal.tsx`
- **Integration**: `src/pages/MouvementsPage.tsx`
- **Table**: `src/components/MovementTable.tsx`

## Next Phase (Step 3)
- Stock update logic
- Movement status change
- Inventory updates
- Rejection workflow

## Status
✅ Complete - Ready for testing
