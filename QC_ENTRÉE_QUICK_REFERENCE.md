# QC Entrée Implementation - Quick Reference

## What Changed

### 1. Entrée movements now start in "En attente" status
- Stock is NOT added until QC approval
- User must click "Inspecter" button to open QC modal
- Inspector enters valid and defective quantities

### 2. New QC Functions in DataContext

```typescript
// Approve Entrée with valid/defective split
approveEntreeQualityControl(
  id: number,
  controleur: string,
  validQuantity: number,
  defectiveQuantity?: number,
  controlNote?: string
)

// Reject entire Entrée shipment
rejectEntreeQualityControl(
  id: number,
  controleur: string,
  raison: string
)
```

### 3. New UI Elements

- **Yellow "En attente" badge**: Indicates pending QC
- **"Inspecter" button**: Opens QC modal for pending Entrée
- **Qté Valide column**: Shows approved quantity (green)
- **Qté Défect. column**: Shows defective quantity (red)

## How It Works

### Creating an Entrée
```typescript
// User creates Entrée in Bulk Movement Modal
addMouvement({
  type: "Entrée",
  article: "Gants Nitrile M",
  qte: 500,
  emplacementDestination: "Zone A - Rack 12",
  // ...
});

// Result: Movement created with status "En attente de validation Qualité"
// Stock remains unchanged (2500 → 2500)
```

### Approving QC
```typescript
// Inspector clicks "Inspecter" and fills form
approveEntreeQualityControl(
  mouvement.id,
  "Marie L.",           // Inspector name
  480,                  // Valid quantity
  20,                   // Defective quantity
  "Emballage endommagé" // Optional note
);

// Result:
// - Status changes to "Terminé"
// - Stock updated: 2500 + 480 = 2980
// - Zone A - Rack 12: 1500 + 480 = 1980
// - Defective (20) logged but NOT added to stock
```

### Rejecting QC
```typescript
// Inspector rejects entire shipment
rejectEntreeQualityControl(
  mouvement.id,
  "Marie L.",
  "Shipment arrived with water damage"
);

// Result:
// - Status changes to "Rejeté"
// - Stock remains unchanged (2500 → 2500)
// - Rejection reason logged
```

## File Changes Summary

| File | Changes |
|------|---------|
| `src/contexts/DataContext.tsx` | Added `approveEntreeQualityControl()`, `rejectEntreeQualityControl()`, modified `addMouvement()` |
| `src/components/MovementTable.tsx` | Added "Inspecter" button, updated status badges, added `onQualityControlEntree` prop |
| `src/pages/MouvementsPage.tsx` | Added Entrée QC modal, form handlers, validation logic |

## Testing Quick Checklist

```
□ Create Entrée → Status is "En attente" (yellow badge)
□ Stock NOT updated when Entrée created
□ Click "Inspecter" → Modal opens
□ Enter quantities → Validation works (Valide + Défect = Total)
□ Approve → Status "Terminé" (green badge)
□ Stock updated with ONLY valid quantity
□ Defective quantity shown in table (red)
□ Inspector name in "Approuvé par" column
□ Reject → Status "Rejeté" (red badge)
□ Stock unchanged when rejected
```

## Key Validation Rules

1. **Quantity Validation**
   - Qté Valide + Qté Défectueuse must equal total received
   - Both must be ≥ 0
   - System prevents invalid combinations

2. **Required Fields**
   - Controleur (Inspector name) is required
   - Quantities are required
   - Note is optional

3. **Stock Impact**
   - Only valid quantity added to stock
   - Defective quantity is permanent loss
   - Rejected shipments don't add any stock

## Status Values

```typescript
// Mouvement.statut values for Entrée
"En attente de validation Qualité"  // Pending QC (yellow)
"Terminé"                            // Approved (green)
"Rejeté"                             // Rejected (red)

// Mouvement.status values
"pending"   // Waiting for QC
"approved"  // QC approved
"rejected"  // QC rejected
```

## New Mouvement Fields

```typescript
validQuantity?: number;       // Quantity approved for use
defectiveQuantity?: number;   // Quantity marked as defective
```

## UI Components

### Inspecter Button
- Location: MovementTable actions column
- Visible: Only for Entrée with "En attente" status
- Icon: AlertCircle (amber)
- Action: Opens QC modal

### QC Modal
- Title: "Contrôle Qualité - Entrée"
- Fields:
  - Article info (read-only)
  - Qté Valide (input)
  - Qté Défectueuse (input)
  - Nom du Contrôleur (input, required)
  - Note de Contrôle (textarea, optional)
- Buttons: Annuler, Approuver l'Entrée

### Status Badges
- Yellow: "En attente" (pending)
- Green: "Terminé" (approved)
- Red: "Rejeté" (rejected)

## Common Issues & Solutions

### Issue: Stock not updating after approval
**Solution**: Ensure `approveEntreeQualityControl()` is called with correct parameters

### Issue: Modal not opening
**Solution**: Check that `onQualityControlEntree` prop is passed to MovementTable

### Issue: Validation error on quantities
**Solution**: Ensure Valide + Défectueuse equals total received quantity

### Issue: Status badge not showing
**Solution**: Verify mouvement.statut is one of the three valid values

## Performance Notes

- QC approval uses functional state update to prevent race conditions
- Stock calculations use `roundStockQuantity()` for consistency
- Inventory updates are atomic (all or nothing)

## Future Enhancements

1. Add Quarantine zone for defective items
2. Add QC metrics dashboard
3. Add batch QC approval
4. Add QC rejection reasons dropdown
5. Add QC performance metrics by inspector
6. Add QC history/audit trail
7. Add automatic QC for certain articles
8. Add QC approval workflow (multi-level)
