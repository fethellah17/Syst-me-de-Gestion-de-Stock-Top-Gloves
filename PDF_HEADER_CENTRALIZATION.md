# PDF Header Centralization - Implementation Complete

## Overview
Successfully refactored the PDF generation system to use a centralized `renderHeader()` function, ensuring consistent and professional header layout across all documents.

## Changes Made

### 1. Centralized Header Function
Created `renderHeader(doc: jsPDF, title: string): number` function that:
- **Logo**: Square 20x20mm (reduced from 25x25mm for a more refined look)
- **Position**: Fixed to top-left corner (10, 10)
- **Company Name**: "Top Gloves" positioned directly underneath the logo
- **Title**: Document-specific title aligned to the right
- **Report Date**: Timestamp aligned to the right below title
- **Separator Line**: Black horizontal line below company name
- **Returns**: Y-position where content should start

### 2. Updated All PDF Generators
All five document types now use the centralized `renderHeader()` function:

1. **Bon d'Entrée** (Inbound) - via `generatePDFTemplate()`
2. **Bon de Sortie** (Outbound) - via `generatePDFTemplate()`
3. **Bon de Transfert** (Transfer) - via `generatePDFTemplate()`
4. **Bon d'Ajustement** (Adjustment) - via `generatePDFTemplate()`
5. **Bon de Rejet** (Rejection Report) - direct implementation

### 3. Benefits

#### Consistency
- All documents share identical header layout
- Logo size and positioning are uniform
- Typography and spacing are standardized

#### Maintainability
- Single source of truth for header design
- Changes to header only need to be made in one place
- Reduces code duplication

#### Regression Prevention
- Future updates to table logic or content fields cannot affect the header
- Header layout is isolated from document-specific content
- Logo and company name positioning remain static

## Technical Details

### Header Specifications
```typescript
const logoSize = 20;        // 20x20mm square logo
const logoX = 10;           // Fixed X position
const logoY = 10;           // Fixed Y position
const companyNameY = 35;    // 5mm below logo (logoY + logoSize + 5)
const separatorY = 43;      // 8mm below company name
const contentStartY = 53;   // 10mm below separator
```

### Function Signature
```typescript
const renderHeader = (doc: jsPDF, title: string): number
```

### Usage Example
```typescript
// In any PDF generator:
const logo = new Image();
logo.src = '/logo-topgloves.jpg';

logo.onload = () => {
  // Add logo
  doc.addImage(logo, 'JPEG', 10, 10, 20, 20);
  
  // Render header (centralized)
  const contentStartY = renderHeader(doc, "Bon d'Entrée");
  
  // Add document-specific content starting at contentStartY
  // ...
};
```

## Testing Recommendations

1. Generate each document type and verify:
   - Logo appears at top-left corner
   - Logo is square and properly sized (20x20mm)
   - "Top Gloves" text appears directly below logo
   - Title appears at top-right
   - Report date appears below title
   - Separator line is positioned correctly
   - Content starts at appropriate Y position

2. Test both scenarios:
   - With logo loaded successfully
   - With logo load failure (fallback mode)

3. Verify consistency:
   - Compare headers across all five document types
   - Ensure spacing and alignment are identical

## Files Modified
- `src/lib/pdf-generator.ts` - Complete refactoring with centralized header function

## Future Maintenance
To update the header design in the future:
1. Modify only the `renderHeader()` function
2. All five document types will automatically inherit the changes
3. No need to update individual PDF generators

This centralization ensures the header remains professional, consistent, and maintainable across all PDF documents.
