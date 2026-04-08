# Bon de Sortie - Date de lot Field Addition

## Overview
Added "Date de lot" field to the Bon de Sortie PDF template, placed immediately below "Numéro de Lot" field.

## Change Details

### Modified Function
- **Function**: `generateOutboundPDF()`
- **File**: `src/lib/pdf-generator.ts`
- **Change Type**: Field addition (non-breaking)

### Field Placement

#### Updated Field Order:
1. ID du Mouvement
2. Date de Sortie
3. Article
4. Quantité
5. Numéro de Lot
6. **Date de lot** ← NEW FIELD
7. Emplacement Source
8. Destination
9. Opérateur
10. Contrôle qualité (conditional)
11. Date d'Approbation

### Implementation

```typescript
doc.text(`Numéro de Lot: ${movement.lotNumber || 'N/A'}`, 15, yPos);
yPos += 7;

// NEW FIELD: Date de lot
doc.text(`Date de lot: ${movement.lotDate ? new Date(movement.lotDate).toLocaleDateString('fr-FR') : 'N/A'}`, 15, yPos);
yPos += 7;

doc.text(`Emplacement Source: ${movement.emplacementSource || 'N/A'}`, 15, yPos);
```

### Data Binding
- **Source**: `movement.lotDate` from Mouvement interface
- **Format**: French date format via `toLocaleDateString('fr-FR')`
- **Fallback**: Displays "N/A" if lotDate is not available
- **Type**: Optional field (lotDate?: string)

### Styling Consistency
- ✅ Font size: 10pt (same as other fields)
- ✅ Font: Helvetica normal (same as other fields)
- ✅ Color: Black (#000000) - monochrome design maintained
- ✅ X position: 15 (aligned with other fields)
- ✅ Y increment: 7 units (consistent spacing)

### Layout Impact
- **Static layout maintained**: Uses same Y-coordinate increment logic (yPos += 7)
- **No signature position change**: Footer remains at bottom-right
- **No header change**: Logo and title positions unchanged
- **Quality metrics section**: Unaffected, still appears after all fields

## Compliance Checklist

- ✅ Field added immediately below "Numéro de Lot"
- ✅ Uses same Y-coordinate increment logic (yPos += 7)
- ✅ Pulls data from movement.lotDate
- ✅ Formats date in French locale
- ✅ Displays "N/A" when lotDate is unavailable
- ✅ Maintains monochrome/black styling
- ✅ Preserves absolute positioning system
- ✅ No impact on signature position
- ✅ No impact on other PDF templates
- ✅ Form-like structure maintained

## Other PDF Templates Status

### Unchanged Templates:
- ✅ Bon d'Entrée - Already has "Date de lot" field
- ✅ Bon de Transfert - Already has "Date de lot" field
- ✅ Bon d'Ajustement - Already has "Date de lot" field
- ✅ Bon de Rejet - Has "Date du Lot" field with fixed positioning

### Result:
All PDF templates now consistently include the lot date field.

## Testing Checklist

- [ ] PDF generates with lotDate present
- [ ] PDF generates with lotDate missing (shows "N/A")
- [ ] Date formats correctly in French (DD/MM/YYYY)
- [ ] Field appears between "Numéro de Lot" and "Emplacement Source"
- [ ] Vertical spacing is consistent (7 units)
- [ ] Text color is black (monochrome)
- [ ] Quality metrics section still appears correctly
- [ ] Signature section remains at bottom-right
- [ ] No layout shifts or overlaps

## Example Output

### With lotDate:
```
Numéro de Lot: LOT-2024-001
Date de lot: 15/01/2024
Emplacement Source: Zone A
```

### Without lotDate:
```
Numéro de Lot: LOT-2024-001
Date de lot: N/A
Emplacement Source: Zone A
```

## Build Status
✅ Build completed successfully with no errors
✅ No TypeScript diagnostics
✅ No breaking changes

## Status
🟢 **COMPLETE** - "Date de lot" field successfully added to Bon de Sortie PDF template.
