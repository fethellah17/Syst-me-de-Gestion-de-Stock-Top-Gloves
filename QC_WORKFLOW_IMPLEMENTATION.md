# Quality Control (QC) Workflow Implementation

## Overview
This document describes the implementation of a pure frontend Quality Control workflow for inventory movements with rejection handling and PDF report generation.

## Features Implemented

### 1. Data Model Updates
**File**: `src/contexts/DataContext.tsx`

Added two new fields to the `Mouvement` interface:
- `status`: `"pending" | "approved" | "rejected"` - QC workflow status
- `rejectionReason`: `string` - Detailed reason for rejection (used in PDF reports)

The existing `statut` field is maintained for backward compatibility.

### 2. Rejection Modal
**File**: `src/pages/MouvementsPage.tsx`

Added a new rejection modal that appears when clicking the "Reject" button:
- **Input Fields**:
  - Contrôleur name (required)
  - Rejection reason (required, textarea for detailed explanation)
- **Display**: Shows movement details (article, quantity, operator, date)
- **Warning**: Informs user that rejection will cancel the movement without modifying stock
- **Validation**: Ensures all required fields are filled before submission

### 3. Movement Table Updates
**File**: `src/components/MovementTable.tsx`

#### New Action Buttons:
1. **Reject Button** (Red X icon):
   - Visible for movements with status "En attente de validation Qualité"
   - Opens the rejection modal
   - Icon: `XCircle` from lucide-react

2. **PDF Download Button** (Blue document icon):
   - Visible only for rejected movements (`status === "rejected"`)
   - Generates and downloads a PDF rejection report
   - Icon: `FileText` from lucide-react

### 4. PDF Generation
**Library**: jsPDF

#### PDF Report Structure:
1. **Header**:
   - Company name: "Top Gloves Inventory Hub"
   - Logo placeholder (can be replaced with actual logo)
   - Report title: "Rapport de Rejet de Mouvement"
   - Report generation date and time

2. **Movement Details Section**:
   - Movement ID
   - Date and time
   - Article name and reference
   - Movement type
   - Quantity
   - Lot number and date
   - Source location (if applicable)
   - Destination
   - Operator name
   - Quality controller name

3. **Rejection Reason Section**:
   - Detailed rejection reason with word wrapping
   - Clearly separated from movement details

4. **Footer**:
   - Signature line for "Contrôleur Qualité"

#### File Naming:
- Format: `Rejection_Report_[ID].pdf`
- Example: `Rejection_Report_123.pdf`

## Workflow Process

### Rejection Flow:
1. User views a movement with status "En attente de validation Qualité"
2. User clicks the red "Reject" button (X icon)
3. Rejection modal opens with movement details
4. User enters:
   - Their name (as quality controller)
   - Detailed rejection reason
5. User clicks "Confirmer le Rejet"
6. Movement status updates to "rejected"
7. Stock remains unchanged (no deduction)
8. Success toast notification appears

### PDF Generation Flow:
1. User views a rejected movement in the table
2. Blue PDF icon appears in the actions column
3. User clicks the PDF icon
4. PDF report is automatically generated with all movement details and rejection reason
5. PDF file downloads to user's default download folder

## Technical Implementation

### State Management:
- All data stored in React state via `DataContext`
- Persisted in localStorage (existing implementation)
- No backend required

### Components Modified:
1. `DataContext.tsx` - Data model and rejection logic
2. `MovementTable.tsx` - UI for reject button and PDF generation
3. `MouvementsPage.tsx` - Rejection modal and handlers

### Dependencies Added:
- `jspdf` - PDF generation library (installed via npm)

## Usage Example

```typescript
// Rejecting a movement
rejectQualityControl(movementId, "Marie L.", "Non-conformité: emballage endommagé");

// This updates the movement with:
// - status: "rejected"
// - statut: "Rejeté"
// - controleur: "Marie L."
// - rejectionReason: "Non-conformité: emballage endommagé"
```

## UI/UX Considerations

### Visual Indicators:
- **Reject Button**: Red color scheme with X icon for clear negative action
- **PDF Button**: Blue color scheme with document icon for informational action
- **Status Badge**: Red "Rejeté" badge for rejected movements
- **Warning Messages**: Clear warnings in rejection modal about consequences

### Accessibility:
- All buttons have descriptive `title` attributes for tooltips
- Form fields have proper labels and required indicators
- Color is not the only indicator (icons + text used)

## Future Enhancements

Potential improvements for future iterations:
1. Add company logo to PDF header
2. Include QR code in PDF for traceability
3. Add digital signature capability
4. Email PDF report automatically
5. Add rejection categories/templates
6. Include photos/attachments in rejection report
7. Multi-language support for PDF reports

## Testing Checklist

- [x] Rejection modal opens correctly
- [x] Form validation works (required fields)
- [x] Movement status updates on rejection
- [x] Stock remains unchanged after rejection
- [x] PDF generates with correct data
- [x] PDF downloads with correct filename
- [x] PDF icon only shows for rejected movements
- [x] Reject button only shows for pending movements
- [x] All data persists in localStorage

## Compliance Notes

This implementation supports medical device inventory compliance by:
- Maintaining complete audit trail of rejections
- Documenting rejection reasons
- Identifying quality controller responsible
- Generating formal rejection reports
- Preserving lot/batch traceability information
