# QC Entrée Implementation - Testing Checklist

## Pre-Testing Verification

- [x] Code compiles without errors
- [x] No TypeScript diagnostics
- [x] All functions properly typed
- [x] Build successful (vite build)
- [x] No console errors

## Functional Testing

### 1. Create Entrée Movement
- [ ] Navigate to Mouvements page
- [ ] Click "Nouveau Mouvement" button
- [ ] Select "Entrée" as movement type
- [ ] Fill in article details:
  - [ ] Select article (e.g., Gants Nitrile M)
  - [ ] Enter quantity (e.g., 500)
  - [ ] Select destination zone (e.g., Zone A - Rack 12)
  - [ ] Enter lot number
  - [ ] Enter lot date
- [ ] Click submit
- [ ] Verify movement appears in table

### 2. Verify Pending QC Status
- [ ] New Entrée shows yellow "En attente" badge
- [ ] Status column displays correctly
- [ ] "Inspecter" button appears in actions
- [ ] Button has AlertCircle icon (amber color)

### 3. Verify Stock NOT Updated
- [ ] Check Articles page
- [ ] Verify article stock is unchanged
- [ ] Verify inventory zones unchanged
- [ ] Example: If stock was 2500, should still be 2500

### 4. Open QC Modal
- [ ] Click "Inspecter" button
- [ ] Modal opens with title "Contrôle Qualité - Entrée"
- [ ] Modal displays article information:
  - [ ] Article name and reference
  - [ ] Quantity received
  - [ ] Destination zone
  - [ ] Operator name
  - [ ] Date/time

### 5. Fill QC Form
- [ ] Enter Qté Valide (e.g., 480)
- [ ] Enter Qté Défectueuse (e.g., 20)
- [ ] Verify sum equals total received (480 + 20 = 500)
- [ ] Enter Controleur name (e.g., Marie L.)
- [ ] Enter optional Note de Contrôle
- [ ] Verify all required fields filled

### 6. Quantity Validation
- [ ] Try entering invalid quantities:
  - [ ] Valide: 490, Défect: 20 (sum = 510, should error)
  - [ ] Valide: 400, Défect: 50 (sum = 450, should error)
  - [ ] Valide: 500, Défect: 0 (sum = 500, should work)
- [ ] Verify error messages appear
- [ ] Verify form prevents submission with invalid data

### 7. Approve QC
- [ ] Click "Approuver l'Entrée" button
- [ ] Modal closes
- [ ] Success toast appears: "✓ Entrée validée. Stock mis à jour avec succès."
- [ ] Return to Mouvements table

### 8. Verify Approval Results
- [ ] Status badge changed to green "Terminé"
- [ ] Qté Valide column shows 480 (green text)
- [ ] Qté Défect. column shows 20 (red text)
- [ ] "Approuvé par" column shows "Marie L."
- [ ] Optional note appears in Commentaire column

### 9. Verify Stock Updated
- [ ] Check Articles page
- [ ] Verify article stock increased by valid quantity only
  - [ ] Before: 2500
  - [ ] After: 2980 (2500 + 480)
- [ ] Verify inventory zone updated:
  - [ ] Zone A - Rack 12: 1500 → 1980 (1500 + 480)
- [ ] Verify defective quantity NOT added to stock

### 10. Test Rejection Workflow
- [ ] Create another Entrée movement
- [ ] Click "Inspecter"
- [ ] Enter quantities:
  - [ ] Valide: 0
  - [ ] Défect: 500 (entire shipment damaged)
- [ ] Enter controleur name
- [ ] Click "Approuver l'Entrée"
- [ ] Verify status changes to green "Terminé"
- [ ] Verify stock unchanged (0 added)
- [ ] Verify defective quantity shown as 500

### 11. Test Edge Cases

#### Edge Case 1: Partial Defects
- [ ] Create Entrée with 1000 units
- [ ] Approve with 950 valid, 50 defective
- [ ] Verify stock increased by 950 only
- [ ] Verify 50 shown as defective

#### Edge Case 2: All Valid
- [ ] Create Entrée with 500 units
- [ ] Approve with 500 valid, 0 defective
- [ ] Verify stock increased by 500
- [ ] Verify 0 shown as defective

#### Edge Case 3: All Defective
- [ ] Create Entrée with 500 units
- [ ] Approve with 0 valid, 500 defective
- [ ] Verify stock unchanged
- [ ] Verify 500 shown as defective

### 12. Test Form Validation

#### Missing Controleur
- [ ] Try to submit without entering controleur name
- [ ] Verify error: "Veuillez renseigner le nom du contrôleur"
- [ ] Verify form doesn't submit

#### Invalid Quantities
- [ ] Try quantities that don't sum to total
- [ ] Verify error message shows expected sum
- [ ] Verify form doesn't submit

#### Negative Quantities
- [ ] Try entering negative numbers
- [ ] Verify input prevents negative values (min="0")

### 13. Test UI Elements

#### Status Badges
- [ ] Yellow badge for "En attente" (pending)
- [ ] Green badge for "Terminé" (approved)
- [ ] Red badge for "Rejeté" (rejected)
- [ ] Correct icons displayed
- [ ] Correct colors applied

#### Buttons
- [ ] "Inspecter" button visible only for pending Entrée
- [ ] "Inspecter" button hidden for approved/rejected
- [ ] "Inspecter" button hidden for other movement types
- [ ] "Approuver l'Entrée" button in modal
- [ ] "Annuler" button in modal

#### Modal
- [ ] Modal opens when clicking "Inspecter"
- [ ] Modal closes when clicking "Annuler"
- [ ] Modal closes after successful approval
- [ ] Modal displays all required information
- [ ] Form fields properly labeled

### 14. Test Data Persistence

- [ ] Refresh page
- [ ] Verify approved Entrée still shows correct status
- [ ] Verify stock changes persisted
- [ ] Verify QC data (valid/defective) still displayed

### 15. Test Multiple Movements

- [ ] Create 3 Entrée movements
- [ ] Approve first with 480/20 split
- [ ] Approve second with 500/0 split
- [ ] Approve third with 0/500 split
- [ ] Verify all show correct status and quantities
- [ ] Verify stock calculations correct for all

### 16. Test with Different Articles

- [ ] Test with Gants Nitrile M (Paire unit)
- [ ] Test with Masques FFP2 (Unité unit)
- [ ] Test with different unit types
- [ ] Verify stock calculations correct for each

### 17. Test Mobile Responsiveness

- [ ] Open on mobile device/viewport
- [ ] Verify "Inspecter" button visible
- [ ] Verify modal opens correctly
- [ ] Verify form fields accessible
- [ ] Verify status badges display correctly

### 18. Test Performance

- [ ] Create 10+ Entrée movements
- [ ] Verify table loads quickly
- [ ] Verify modal opens without lag
- [ ] Verify stock calculations complete quickly
- [ ] Verify no console errors

## Integration Testing

### 1. Integration with Bulk Movement
- [ ] Create Entrée via Bulk Movement Modal
- [ ] Verify status is "En attente"
- [ ] Verify stock not updated
- [ ] Verify can inspect and approve

### 2. Integration with Articles Page
- [ ] Create Entrée
- [ ] Go to Articles page
- [ ] Verify stock unchanged
- [ ] Approve Entrée
- [ ] Go back to Articles page
- [ ] Verify stock updated

### 3. Integration with Dashboard
- [ ] Create Entrée
- [ ] Check Dashboard
- [ ] Verify movement shows with "En attente" status
- [ ] Approve Entrée
- [ ] Verify Dashboard updated

## Regression Testing

- [ ] Sortie movements still work correctly
- [ ] Transfert movements still work correctly
- [ ] Ajustement movements still work correctly
- [ ] Existing QC for Sortie still works
- [ ] Stock calculations for other movement types unchanged

## Browser Testing

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers

## Accessibility Testing

- [ ] Modal can be closed with Escape key
- [ ] Form fields have proper labels
- [ ] Error messages are clear
- [ ] Status badges have sufficient color contrast
- [ ] Buttons are keyboard accessible

## Documentation Testing

- [ ] QC_ENTRÉE_IMPLEMENTATION_COMPLETE.md is accurate
- [ ] QC_ENTRÉE_VISUAL_GUIDE.md matches implementation
- [ ] QC_ENTRÉE_QUICK_REFERENCE.md is helpful
- [ ] QC_ENTRÉE_CODE_CHANGES.md shows correct changes

## Final Verification

- [ ] All tests passed
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build successful
- [ ] Ready for production

## Sign-Off

- [ ] Developer: _________________ Date: _______
- [ ] QA: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______

## Notes

```
[Space for testing notes and observations]
```

---

## Test Data

### Sample Entrée Movement
- Article: Gants Nitrile M (GN-M-001)
- Quantity: 500 Paire
- Destination: Zone A - Rack 12
- Lot Number: LOT-2026-04-001
- Lot Date: 2026-04-08
- Operator: Karim B.

### Sample QC Approval
- Valid Quantity: 480 Paire
- Defective Quantity: 20 Paire
- Inspector: Marie L.
- Note: Emballage endommagé sur 20 unités

### Expected Results
- Stock before: 2500 Paire
- Stock after: 2980 Paire (2500 + 480)
- Zone A - Rack 12 before: 1500 Paire
- Zone A - Rack 12 after: 1980 Paire (1500 + 480)
