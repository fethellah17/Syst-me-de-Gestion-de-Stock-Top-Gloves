# Sortie Refusal - Quick Start Guide

## What's New?

A clean, simple radio button interface for refusing Sortie (exit) movements with two distinct scenarios:

1. **Article Défectueux (Defective Item)** → Stock is DEDUCTED
2. **Erreur de Préparation (Preparation Error)** → Stock is NOT deducted

## How to Use

### Step 1: Find a Pending Sortie
- Go to **Mouvements** page
- Look for a Sortie movement with status **"En attente"** (pending)

### Step 2: Click the Refusal Button
- Click the **red X button** in the Actions column
- Modal opens: "Refus de Sortie"

### Step 3: Select Refusal Type

**Option A: Article Défectueux (Rebut)**
- Select this if the item is damaged or defective
- Stock will be deducted (loss)
- Fill in:
  - **Nom du Contrôleur**: Name of quality controller
  - **Motif du Refus**: Reason for rejection
- PDF: `Avis_de_Rejet_de_Sortie.pdf`

**Option B: Erreur de Préparation (Correction)**
- Select this if it was an administrative mistake
- Stock will NOT be deducted (returns to shelf)
- Fill in:
  - **Nom de l'Opérateur**: Name of operator
  - **Motif de l'Erreur**: Description of the error
- PDF: `Note_de_Correction_Sortie.pdf`

### Step 4: Submit
- Click **"Confirmer le Refus"**
- PDF is automatically generated and downloaded
- Movement is marked as rejected
- Stock is updated accordingly

## Key Differences

| Aspect | Defective | Correction |
|--------|-----------|-----------|
| **Reason** | Item is damaged | Administrative error |
| **Stock Impact** | DEDUCTED | NO CHANGE |
| **Controller** | Contrôleur | Opérateur |
| **PDF Title** | Avis de Rejet | Note de Correction |
| **Signature** | Controller signs | Operator + Supervisor sign |

## PDF Details

### Avis de Rejet de Sortie (Defective)
- Shows: Article, quantity, rejection reason
- Note: "Stock déduit pour cause de dommage"
- Signatures: Operator (left) + Controller (right)

### Note de Correction Sortie (Error)
- Shows: Article, quantity, error description
- Note: "Retour en rayon - Erreur administrative"
- Signatures: Operator (left) + Supervisor (right)

## UI Elements

### Modal Header
- Title: "Refus de Sortie"
- Subtitle: "Sélectionnez le type de refus et complétez les informations"

### Movement Details (Read-only)
- Article name and reference
- Quantity and unit
- Source zone
- Operator name

### Radio Selection
- Two simple radio buttons
- Each with description of stock impact
- Fields appear/disappear based on selection

### Dynamic Fields
- **Defective**: Red background section
- **Correction**: Blue background section
- Color coding helps users understand the impact

## Validation

The form requires:
1. **Refusal type must be selected**
2. **All required fields must be filled**
3. **Fields cannot be empty**

If validation fails, error messages appear at the bottom of the modal.

## After Submission

✓ PDF is generated and downloaded
✓ Movement status changes to "Rejeté"
✓ Toast notification shows PDF filename
✓ Modal closes automatically
✓ Stock is updated:
  - Defective: Quantity deducted
  - Correction: No change

## Troubleshooting

**Q: The refusal button doesn't appear**
- A: Button only shows for Sortie movements with "En attente" status

**Q: I can't submit the form**
- A: Check that all required fields are filled (no empty fields)

**Q: Which option should I choose?**
- A: 
  - Choose **Defective** if the item is damaged/unusable
  - Choose **Correction** if it was a picking/packing mistake

**Q: Can I undo a refusal?**
- A: Currently, refusals are permanent. Contact admin if needed.

## Files Involved

- `src/components/SortieRefusalModal.tsx` - Modal component
- `src/lib/pdf-generator.ts` - PDF generation functions
- `src/pages/MouvementsPage.tsx` - Integration
- `src/components/MovementTable.tsx` - Refusal button

## Related Features

- **Inspection Modal**: For Entrée and Sortie quality control
- **PDF Generation**: Automatic PDF creation for all movements
- **Stock Management**: Real-time stock updates based on refusal type
