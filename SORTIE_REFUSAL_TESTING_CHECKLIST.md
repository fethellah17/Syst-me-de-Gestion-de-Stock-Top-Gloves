# SORTIE Refusal - Testing Checklist

## Pre-Testing Setup

- [ ] Application is running
- [ ] Database is initialized with sample data
- [ ] User is logged in
- [ ] Navigation to Mouvements page works

---

## Test Case 1: Scenario A - Article Défectueux (Defective)

### 1.1 Create SORTIE Movement
- [ ] Navigate to Mouvements page
- [ ] Click "Ajouter un Mouvement"
- [ ] Select Type: "Sortie"
- [ ] Select Article: "Gants Nitrile M"
- [ ] Enter Quantity: 200
- [ ] Select Zone Source: "Zone A - Rack 12"
- [ ] Enter Destination: "Département Production"
- [ ] Enter Operator: "Jean D."
- [ ] Enter Lot Number: "LOT-TEST-001"
- [ ] Click "Créer"
- [ ] Verify: Movement appears in table with status "En attente"

### 1.2 Open QC Modal
- [ ] Click "Inspecter" button on the movement
- [ ] Verify: InspectionModal opens
- [ ] Verify: Modal title shows "Contrôle Qualité - Sortie"
- [ ] Verify: Movement details are displayed correctly

### 1.3 Select Refusal Type
- [ ] Check "Refuser toute la quantité" checkbox
- [ ] Verify: Refusal type selection appears (SORTIE only)
- [ ] Verify: Two radio button options visible:
  - [ ] "Article Défectueux" (Red border)
  - [ ] "Erreur de Préparation" (Blue border)
- [ ] Click "Article Défectueux" radio button
- [ ] Verify: Red border is highlighted

### 1.4 Fill Scenario A Fields
- [ ] Verify: "Nom du Contrôleur" field appears
- [ ] Verify: "Motif du Refus" textarea appears
- [ ] Enter Controller Name: "Marie L."
- [ ] Enter Refusal Reason: "Humidité détectée. Articles endommagés."
- [ ] Verify: Button text changed to "Confirmer le Refus (Défectueux)"
- [ ] Verify: Button is RED

### 1.5 Confirm Refusal
- [ ] Click "Confirmer le Refus (Défectueux)" button
- [ ] Verify: Modal closes
- [ ] Verify: Toast notification appears: "✗ Mouvement refusé défectueux (stock déduit) (200 Paires)"

### 1.6 Verify Stock Deduction
- [ ] Navigate to Articles page
- [ ] Find "Gants Nitrile M"
- [ ] Verify: Stock was DEDUCTED by 200 Paires
  - Before: 2500 Paires
  - After: 2300 Paires
- [ ] Verify: Zone A inventory updated
  - Before: 1500 Paires
  - After: 1300 Paires

### 1.7 Verify Movement Status
- [ ] Return to Mouvements page
- [ ] Find the movement
- [ ] Verify: Status changed to "Refusé"
- [ ] Verify: Red PDF icon appears
- [ ] Verify: Movement shows "Type: Défectueux"

### 1.8 Download PDF
- [ ] Click PDF icon (RED)
- [ ] Verify: PDF downloads with filename: "Avis_Rejet_Sortie_Gants-Nitrile-M_[DATE].pdf"
- [ ] Open PDF and verify:
  - [ ] Title: "AVIS DE REJET DE SORTIE (DEFECTUEUX)"
  - [ ] Article name and reference correct
  - [ ] Quantity: 200 Paires
  - [ ] Red warning note: "Marchandise non-conforme. Cette quantité a été déduite du stock physique."
  - [ ] Signature blocks:
    - [ ] Left: "Signature de l'Opérateur" with "Nom: Jean D."
    - [ ] Right: "Signature du Contrôleur" with "Nom: Marie L."
  - [ ] Date and timestamp present

---

## Test Case 2: Scenario B - Erreur de Préparation (Preparation Error)

### 2.1 Create SORTIE Movement
- [ ] Navigate to Mouvements page
- [ ] Click "Ajouter un Mouvement"
- [ ] Select Type: "Sortie"
- [ ] Select Article: "Gants Latex S"
- [ ] Enter Quantity: 150
- [ ] Select Zone Source: "Zone A - Rack 12"
- [ ] Enter Destination: "Département Production"
- [ ] Enter Operator: "Pierre M."
- [ ] Enter Lot Number: "LOT-TEST-002"
- [ ] Click "Créer"
- [ ] Verify: Movement appears in table with status "En attente"

### 2.2 Open QC Modal
- [ ] Click "Inspecter" button on the movement
- [ ] Verify: InspectionModal opens
- [ ] Verify: Modal title shows "Contrôle Qualité - Sortie"

### 2.3 Select Refusal Type
- [ ] Check "Refuser toute la quantité" checkbox
- [ ] Verify: Refusal type selection appears
- [ ] Click "Erreur de Préparation" radio button
- [ ] Verify: Blue border is highlighted

### 2.4 Fill Scenario B Fields
- [ ] Verify: "Nom de l'Opérateur" field appears
- [ ] Verify: "Motif de l'Erreur" textarea appears
- [ ] Enter Operator Name: "Pierre M."
- [ ] Enter Error Reason: "Mauvais article prélevé. Gants Vinyle au lieu de Gants Latex."
- [ ] Verify: Button text changed to "Confirmer la Correction"
- [ ] Verify: Button is BLUE

### 2.5 Confirm Refusal
- [ ] Click "Confirmer la Correction" button
- [ ] Verify: Modal closes
- [ ] Verify: Toast notification appears: "✗ Mouvement refusé erreur de préparation (stock conservé) (150 Paires)"

### 2.6 Verify NO Stock Deduction
- [ ] Navigate to Articles page
- [ ] Find "Gants Latex S"
- [ ] Verify: Stock was NOT DEDUCTED
  - Before: 1800 Paires
  - After: 1800 Paires (UNCHANGED)
- [ ] Verify: Zone inventory unchanged

### 2.7 Verify Movement Status
- [ ] Return to Mouvements page
- [ ] Find the movement
- [ ] Verify: Status changed to "Refusé"
- [ ] Verify: Blue PDF icon appears
- [ ] Verify: Movement shows "Type: Erreur"

### 2.8 Download PDF
- [ ] Click PDF icon (BLUE)
- [ ] Verify: PDF downloads with filename: "Note_Correction_Sortie_Gants-Latex-S_[DATE].pdf"
- [ ] Open PDF and verify:
  - [ ] Title: "NOTE DE CORRECTION DE PREPARATION"
  - [ ] Article name and reference correct
  - [ ] Quantity: 150 Paires
  - [ ] Blue info note: "Correction administrative. La marchandise reste disponible en stock."
  - [ ] Signature blocks:
    - [ ] Left: "Signature de l'Opérateur" with "Nom: Pierre M."
    - [ ] Right: "Visa du Responsable" with "Nom: Marie L."
  - [ ] Date and timestamp present

---

## Test Case 3: ENTRÉE Refusal (No Type Selection)

### 3.1 Create ENTRÉE Movement
- [ ] Navigate to Mouvements page
- [ ] Click "Ajouter un Mouvement"
- [ ] Select Type: "Entrée"
- [ ] Select Article: "Masques FFP2"
- [ ] Enter Quantity: 5 (in Carton)
- [ ] Enter Destination: "Zone D - Rack 05"
- [ ] Enter Operator: "Karim B."
- [ ] Enter Lot Number: "LOT-TEST-003"
- [ ] Click "Créer"
- [ ] Verify: Movement appears in table with status "En attente"

### 3.2 Open QC Modal
- [ ] Click "Inspecter" button on the movement
- [ ] Verify: InspectionModal opens
- [ ] Verify: Modal title shows "Contrôle Qualité - Entrée"

### 3.3 Select Refusal (No Type Selection)
- [ ] Check "Refuser toute la quantité" checkbox
- [ ] Verify: NO refusal type selection appears (ENTRÉE only)
- [ ] Verify: Simple fields appear:
  - [ ] "Nom du Contrôleur"
  - [ ] "Motif du Refus Total"

### 3.4 Fill ENTRÉE Refusal Fields
- [ ] Enter Controller Name: "Marie L."
- [ ] Enter Refusal Reason: "Cartons endommagés lors du transport."
- [ ] Verify: Button text shows "Confirmer le Refus Total"

### 3.5 Confirm Refusal
- [ ] Click "Confirmer le Refus Total" button
- [ ] Verify: Modal closes
- [ ] Verify: Toast notification appears: "✗ Mouvement refusé complètement (5000 Unités)"

### 3.6 Verify NO Stock Change
- [ ] Navigate to Articles page
- [ ] Find "Masques FFP2"
- [ ] Verify: Stock was NOT CHANGED (goods never entered)
  - Before: 8000 Unités
  - After: 8000 Unités (UNCHANGED)

### 3.7 Verify Movement Status
- [ ] Return to Mouvements page
- [ ] Find the movement
- [ ] Verify: Status changed to "Refusé"
- [ ] Verify: PDF icon appears

---

## Test Case 4: Form Validation

### 4.1 Scenario A - Missing Controller Name
- [ ] Create SORTIE movement
- [ ] Open QC modal
- [ ] Check "Refuser toute la quantité"
- [ ] Select "Article Défectueux"
- [ ] Leave "Nom du Contrôleur" empty
- [ ] Enter Refusal Reason
- [ ] Try to click "Confirmer le Refus (Défectueux)"
- [ ] Verify: Button is DISABLED
- [ ] Verify: Error message appears: "Veuillez renseigner le nom du contrôleur"

### 4.2 Scenario A - Missing Refusal Reason
- [ ] Create SORTIE movement
- [ ] Open QC modal
- [ ] Check "Refuser toute la quantité"
- [ ] Select "Article Défectueux"
- [ ] Enter Controller Name
- [ ] Leave "Motif du Refus" empty
- [ ] Try to click "Confirmer le Refus (Défectueux)"
- [ ] Verify: Button is DISABLED
- [ ] Verify: Error message appears: "Veuillez renseigner le motif du refus"

### 4.3 Scenario B - Missing Operator Name
- [ ] Create SORTIE movement
- [ ] Open QC modal
- [ ] Check "Refuser toute la quantité"
- [ ] Select "Erreur de Préparation"
- [ ] Leave "Nom de l'Opérateur" empty
- [ ] Enter Error Reason
- [ ] Try to click "Confirmer la Correction"
- [ ] Verify: Button is DISABLED
- [ ] Verify: Error message appears: "Veuillez renseigner le nom de l'opérateur"

### 4.4 Scenario B - Missing Error Reason
- [ ] Create SORTIE movement
- [ ] Open QC modal
- [ ] Check "Refuser toute la quantité"
- [ ] Select "Erreur de Préparation"
- [ ] Enter Operator Name
- [ ] Leave "Motif de l'Erreur" empty
- [ ] Try to click "Confirmer la Correction"
- [ ] Verify: Button is DISABLED
- [ ] Verify: Error message appears: "Veuillez renseigner le motif de l'erreur"

### 4.5 SORTIE - Missing Refusal Type
- [ ] Create SORTIE movement
- [ ] Open QC modal
- [ ] Check "Refuser toute la quantité"
- [ ] Do NOT select any refusal type
- [ ] Try to click confirm button
- [ ] Verify: Button is DISABLED
- [ ] Verify: Error message appears: "Veuillez sélectionner le type de refus"

---

## Test Case 5: UI Elements

### 5.1 Refusal Type Selection Display
- [ ] Create SORTIE movement
- [ ] Open QC modal
- [ ] Check "Refuser toute la quantité"
- [ ] Verify: Two radio buttons visible with:
  - [ ] Red border for "Article Défectueux"
  - [ ] Blue border for "Erreur de Préparation"
  - [ ] Descriptive text for each option
  - [ ] Warning/Info icons (⚠/ℹ)
  - [ ] Stock impact description

### 5.2 Dynamic Form Fields
- [ ] Select "Article Défectueux"
- [ ] Verify: "Nom du Contrôleur" and "Motif du Refus" appear
- [ ] Verify: "Nom de l'Opérateur" and "Motif de l'Erreur" do NOT appear
- [ ] Select "Erreur de Préparation"
- [ ] Verify: "Nom de l'Opérateur" and "Motif de l'Erreur" appear
- [ ] Verify: "Nom du Contrôleur" and "Motif du Refus" do NOT appear

### 5.3 Button Styling
- [ ] Select "Article Défectueux"
- [ ] Verify: Button is RED with text "Confirmer le Refus (Défectueux)"
- [ ] Select "Erreur de Préparation"
- [ ] Verify: Button is BLUE with text "Confirmer la Correction"

### 5.4 PDF Icon Colors
- [ ] Create and confirm Scenario A refusal
- [ ] Verify: PDF icon is RED in movement table
- [ ] Create and confirm Scenario B refusal
- [ ] Verify: PDF icon is BLUE in movement table

---

## Test Case 6: PDF Generation

### 6.1 Scenario A PDF Content
- [ ] Download Scenario A PDF
- [ ] Verify: All sections present:
  - [ ] Header with logo and title
  - [ ] Movement details section
  - [ ] Refusal reason section
  - [ ] Quantities section
  - [ ] Red warning note
  - [ ] Signature blocks
  - [ ] Validation date
  - [ ] Footer timestamp

### 6.2 Scenario B PDF Content
- [ ] Download Scenario B PDF
- [ ] Verify: All sections present:
  - [ ] Header with logo and title
  - [ ] Movement details section
  - [ ] Error description section
  - [ ] Quantities section
  - [ ] Blue info note
  - [ ] Signature blocks
  - [ ] Validation date
  - [ ] Footer timestamp

### 6.3 PDF Filename Format
- [ ] Scenario A: `Avis_Rejet_Sortie_[Product]_[DD-MM-YYYY].pdf`
- [ ] Scenario B: `Note_Correction_Sortie_[Product]_[DD-MM-YYYY].pdf`
- [ ] Verify: Product name is clean (no special characters)
- [ ] Verify: Date format is correct

---

## Test Case 7: Data Persistence

### 7.1 Refresh Page After Refusal
- [ ] Create and confirm refusal
- [ ] Refresh page (F5)
- [ ] Verify: Movement still shows "Refusé" status
- [ ] Verify: Refusal type is preserved
- [ ] Verify: Stock changes are persisted

### 7.2 Navigate Away and Back
- [ ] Create and confirm refusal
- [ ] Navigate to Articles page
- [ ] Navigate back to Mouvements page
- [ ] Verify: Movement still shows "Refusé" status
- [ ] Verify: All data is preserved

### 7.3 Multiple Refusals
- [ ] Create multiple SORTIE movements
- [ ] Confirm some as Scenario A, some as Scenario B
- [ ] Verify: Each shows correct status and type
- [ ] Verify: Stock changes are correct for each
- [ ] Verify: PDF icons show correct colors

---

## Test Case 8: Edge Cases

### 8.1 Large Quantities
- [ ] Create SORTIE with 10000 Paires
- [ ] Confirm as Scenario A
- [ ] Verify: Stock deducted correctly
- [ ] Verify: PDF displays quantity correctly

### 8.2 Small Quantities
- [ ] Create SORTIE with 1 Paire
- [ ] Confirm as Scenario B
- [ ] Verify: Stock unchanged
- [ ] Verify: PDF displays quantity correctly

### 8.3 Special Characters in Reason
- [ ] Create SORTIE
- [ ] Enter reason with special characters: "Dommage: 50% cassé & inutilisable"
- [ ] Confirm refusal
- [ ] Verify: PDF displays correctly without encoding issues

### 8.4 Long Reason Text
- [ ] Create SORTIE
- [ ] Enter very long reason (multiple lines)
- [ ] Confirm refusal
- [ ] Download PDF
- [ ] Verify: Text wraps correctly in PDF

---

## Test Case 9: Mobile Responsiveness

### 9.1 Mobile View - Refusal Type Selection
- [ ] Open on mobile device/responsive view
- [ ] Create SORTIE and open QC modal
- [ ] Check "Refuser toute la quantité"
- [ ] Verify: Refusal type options are visible and clickable
- [ ] Verify: Form fields are properly sized

### 9.2 Mobile View - PDF Download
- [ ] On mobile, confirm refusal
- [ ] Verify: PDF icon is visible and clickable
- [ ] Click PDF icon
- [ ] Verify: PDF downloads correctly

---

## Test Case 10: Integration Tests

### 10.1 Scenario A - Complete Flow
- [ ] Create SORTIE (200 Paires)
- [ ] Confirm as Défectueux
- [ ] Verify: Stock deducted
- [ ] Download PDF
- [ ] Verify: PDF content correct
- [ ] Verify: Movement table shows correct status and type

### 10.2 Scenario B - Complete Flow
- [ ] Create SORTIE (150 Paires)
- [ ] Confirm as Erreur
- [ ] Verify: Stock unchanged
- [ ] Download PDF
- [ ] Verify: PDF content correct
- [ ] Verify: Movement table shows correct status and type

### 10.3 Mixed Scenarios
- [ ] Create multiple SORTIE movements
- [ ] Confirm some as Scenario A, some as Scenario B
- [ ] Verify: Each has correct stock impact
- [ ] Verify: Each has correct PDF
- [ ] Verify: Movement table shows all correctly

---

## Performance Tests

- [ ] PDF generation completes in < 2 seconds
- [ ] Form validation is instant
- [ ] Stock updates are immediate
- [ ] Page refresh is fast after refusal
- [ ] Multiple refusals don't slow down system

---

## Final Verification

- [ ] All test cases passed
- [ ] No console errors
- [ ] No data corruption
- [ ] Stock calculations are accurate
- [ ] PDFs are professional and complete
- [ ] UI is intuitive and clear
- [ ] Validation prevents errors
- [ ] Toast notifications are helpful

---

## Sign-Off

- [ ] Testing completed by: ________________
- [ ] Date: ________________
- [ ] All tests passed: ☐ Yes ☐ No
- [ ] Issues found: ________________
- [ ] Ready for production: ☐ Yes ☐ No
