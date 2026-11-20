# PDF Download Buttons - User Guide

## Location
PDF download buttons appear in the **Actions** column of the Movements table on the **Mouvements** page.

## Button Appearance

### Visual Design
Each button shows a **FileText icon** (📄) with a colored background on hover:

| Movement Type | Button Color | Hover Background | Title |
|--------------|--------------|------------------|-------|
| **Entrée** | Blue (🔵) | Light Blue | "Télécharger le Bon d'Entrée (PDF)" |
| **Sortie** | Green (🟢) | Light Green | "Télécharger le Bon de Sortie (PDF)" |
| **Transfert** | Purple (🟣) | Light Purple | "Télécharger le Bon de Transfert (PDF)" |
| **Ajustement** | Amber (🟠) | Light Amber | "Télécharger le Bon d'Ajustement (PDF)" |

## Button Visibility Rules

### Bon d'Entrée (Blue Button)
- **Appears for**: ALL "Entrée" movements
- **No conditions**: Always visible for inbound operations

### Bon de Sortie (Green Button)
- **Appears for**: "Sortie" movements
- **Condition**: Only when status is "Terminé" AND approved
- **Reason**: Quality control must be completed first

### Bon de Transfert (Purple Button)
- **Appears for**: ALL "Transfert" movements
- **No conditions**: Always visible for transfer operations

### Bon d'Ajustement (Amber Button)
- **Appears for**: ALL "Ajustement" movements
- **No conditions**: Always visible for adjustment operations

## User Workflow

### Example 1: Downloading Bon d'Entrée
1. Navigate to **Mouvements** page
2. Find an "Entrée" movement in the table
3. Look at the **Actions** column (rightmost)
4. Click the **blue FileText button** (📄)
5. PDF downloads automatically as `Bon_Entree_[ID].pdf`

### Example 2: Downloading Bon de Transfert
1. Navigate to **Mouvements** page
2. Find a "Transfert" movement in the table
3. Look at the **Actions** column
4. Click the **purple FileText button** (📄)
5. PDF downloads automatically as `Bon_Transfert_[ID].pdf`

### Example 3: Downloading Bon d'Ajustement
1. Navigate to **Mouvements** page
2. Find an "Ajustement" movement in the table
3. Look at the **Actions** column
4. Click the **amber FileText button** (📄)
5. PDF downloads automatically as `Bon_Ajustement_[ID].pdf`

## Actions Column Layout

The Actions column may contain multiple buttons depending on the movement:

```
[Actions Column]
┌─────────────────────────────────────┐
│ [Shield] [FileText] [Edit] [Delete] │  ← For Sortie (pending QC)
│ [FileText] [Edit] [Delete]          │  ← For Entrée
│ [FileText] [Edit] [Delete]          │  ← For Transfert
│ [FileText] [Edit] [Delete]          │  ← For Ajustement
└─────────────────────────────────────┘
```

### Button Order (left to right):
1. **Shield** (🛡️) - Quality Control (Sortie only, when pending)
2. **FileText** (📄) - PDF Download (color-coded by type)
3. **Pencil** (✏️) - Edit movement
4. **Trash** (🗑️) - Delete movement

## PDF Content Preview

### Bon d'Entrée Contains:
- ID du Mouvement
- Date d'Entrée
- Article & Reference
- Quantité
- Numéro de Lot
- Date de lot
- **Source** (supplier/source)
- Opérateur
- Signature line for "Réceptionnaire"

### Bon de Transfert Contains:
- ID du Mouvement
- Date de Transfert
- Article & Reference
- Quantité
- Numéro de Lot
- Date de lot
- **Zone Origine**
- **Zone Destination**
- Opérateur
- Signature line for "Responsable Stock"

### Bon d'Ajustement Contains:
- ID du Mouvement
- Date d'Ajustement
- Article & Reference
- Type (Surplus/Manquant)
- Quantité Ajustée
- Numéro de Lot
- Date de lot
- **Motif de l'ajustement**
- Opérateur
- Signature line for "Responsable Inventaire"

## Troubleshooting

### Button Not Appearing?
- **For Sortie**: Check if quality control is completed (status must be "Terminé")
- **For others**: Button should always appear - refresh the page
- Check if you're on the full Mouvements page (not Dashboard compact view)

### PDF Not Downloading?
- Check browser's download settings
- Ensure pop-ups are not blocked
- Check browser console for errors
- Verify logo file exists at `/logo-topgloves.jpg`

### PDF Missing Information?
- Verify the movement has all required fields filled
- "Date de lot" only appears if set in the movement
- "Motif" only appears for adjustments if provided

## Mobile/Responsive View
- On smaller screens, the Actions column may require horizontal scrolling
- All buttons remain functional on mobile devices
- PDF generation works on all devices with modern browsers

## Browser Compatibility
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Notes
- PDFs are generated client-side (no server required)
- Files download immediately to browser's default download location
- File naming is automatic and follows the pattern: `Bon_[Type]_[ID].pdf`
- All PDFs use professional monochrome design (black text only)
