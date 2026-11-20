# PDF Final Layout - Quick Reference

## Section Order (Top to Bottom)

```
Header
  ↓
Movement Details
  ↓
QUANTITES (Table)
  ↓
Quality Score
  ↓ [8mm margin]
OBSERVATIONS / NOTES DE CONTROLE (if notes)
  ↓ [8mm margin]
POINTS DE CONTROLE (if checklist)
  ↓ [8mm margin]
Separator Line
  ↓
SIGNATURES (Side-by-Side)
  ↓
Validation Date
  ↓
Footer
```

## Signature Layout

```
Left Column (X=15)          Right Column (X=115)
┌──────────────────┐        ┌──────────────────┐
│ Signature de     │        │ Signature du     │
│ l'Operateur:     │        │ Controleur       │
│                  │        │ Qualite:         │
│ ________________ │        │ ________________ │
│                  │        │                  │
│ Nom: Karim B.    │        │ Nom: Marie L.    │
└──────────────────┘        └──────────────────┘
```

## Spacing Values

| Element | Value | Unit |
|---------|-------|------|
| Between Sections | 8 | mm |
| Signature Title to Line | 6 | mm |
| Signature Line to Name | 5 | mm |
| Signature Height | 18 | mm |
| Column Width | 70 | mm |
| Gap Between Columns | 30 | mm |

## Text Encoding

All text cleaned:
```
Input:  "Emballage & défauts"
Output: "Emballage  défauts"
```

## Key Features

✓ Observations ALWAYS before Checklist
✓ Signatures ALWAYS at bottom
✓ No overlapping sections
✓ Professional side-by-side layout
✓ Clean text (no garbled characters)
✓ Proper spacing throughout
✓ Dynamic positioning

## Common Scenarios

### Scenario 1: With Control Notes
```
QUANTITES
[8mm]
OBSERVATIONS
[8mm]
POINTS DE CONTROLE
[8mm]
SIGNATURES
```

### Scenario 2: No Control Notes
```
QUANTITES
[8mm]
POINTS DE CONTROLE
[8mm]
SIGNATURES
```

### Scenario 3: No Checklist
```
QUANTITES
[8mm]
OBSERVATIONS
[8mm]
SIGNATURES
```

## Positioning Logic

```typescript
// Ensure minimum space before signatures
const minSignatureY = 180;
if (yPos < minSignatureY) {
  yPos = minSignatureY;
}

// Add margin before signatures
yPos += 8;

// Left column
doc.text("Signature de l'Operateur:", 15, yPos);
yPos += 6;
doc.line(15, yPos + 18, 85, yPos + 18);
yPos += 23;
doc.text("Nom: " + name, 15, yPos);

// Right column (aligned with left)
let signatureYPos = yPos - 23 - 6;
doc.text("Signature du Controleur Qualite:", 115, signatureYPos);
signatureYPos += 6;
doc.line(115, signatureYPos + 18, 185, signatureYPos + 18);
signatureYPos += 23;
doc.text("Nom: " + controller, 115, signatureYPos);
```

## Column Positions

| Column | X Start | X End | Width |
|--------|---------|-------|-------|
| Left (Operator) | 15 | 85 | 70 |
| Gap | 85 | 115 | 30 |
| Right (Controller) | 115 | 185 | 70 |

## Font Sizes

| Element | Size | Weight |
|---------|------|--------|
| Section Title | 10pt | Bold |
| Signature Title | 9pt | Normal |
| Signature Name | 8pt | Normal |
| Footer | 7pt | Normal |

## Colors

| Element | Color | RGB |
|---------|-------|-----|
| Text | Black | 0,0,0 |
| Lines | Black | 0,0,0 |
| Footer | Gray | 100,100,100 |

## Margins

| Position | Margin | Purpose |
|----------|--------|---------|
| Top | 10mm | Header |
| Bottom | 10mm | Footer |
| Left | 10mm | Page edge |
| Right | 10mm | Page edge |
| Between Sections | 8mm | Separation |

## Result

Professional PDF with:
- ✓ Clean layout
- ✓ Proper spacing
- ✓ Side-by-side signatures
- ✓ No overlapping
- ✓ Professional appearance
