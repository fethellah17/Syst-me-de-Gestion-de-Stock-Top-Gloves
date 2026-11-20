# Bon de Rejet - Type Preservation Fix

## Problem Statement

The PDF generation for rejected movements had a critical naming error:
- When an **Entrée** (inbound delivery) was rejected in Quality Control, the PDF incorrectly displayed `Type: Sortie`
- This created confusion about whether the movement was a failed delivery or a failed exit
- The original movement type was being overwritten instead of preserved

**Example Issue:**
```
Scenario: Supplier delivers 100 defective units
- Movement Type: Entrée (inbound)
- QC Decision: Rejected
- PDF Shows: "Type: Sortie" ❌ WRONG!
- Reality: This was a failed Entrée, not a Sortie
```

## Solution Applied

### 1. Preserve Original Movement Type

**Before:**
```typescript
doc.text("Type: Sortie", 15, yPos); // ❌ Hardcoded
```

**After:**
```typescript
doc.text("Type: " + emergencyClean(movement.type), 15, yPos); // ✅ Preserves original
```

Now the PDF correctly shows:
- `Type: Entrée` for rejected inbound deliveries
- `Type: Sortie` for rejected outbound movements

### 2. Add Quality Decision Field

Added a clear, prominent field to show rejection status:

```typescript
doc.setFont("helvetica", "bold");
doc.setTextColor(220, 38, 38); // Red color for rejection
doc.text("Decision Qualite: REJETE", 15, yPos);
doc.setTextColor(0, 0, 0); // Reset to black
doc.setFont("helvetica", "normal");
```

This makes it immediately clear that the movement was rejected, regardless of type.

### 3. Dynamic Location Fields

Updated location fields to adapt based on movement type:

**For Entrée (Inbound):**
```typescript
if (movement.type === "Entrée") {
  doc.text("Destination Prevue: " + emergencyClean(movement.emplacementDestination || 'N/A'), 15, yPos);
  doc.text("Action: Retour Fournisseur", 15, yPos);
}
```

**For Sortie (Outbound):**
```typescript
else {
  doc.text("Emplacement Source: " + emergencyClean(movement.emplacementSource || 'N/A'), 15, yPos);
  doc.text("Destination Prevue: " + emergencyClean(movement.emplacementDestination || 'N/A'), 15, yPos);
}
```

### 4. Fallback for Rejection Reason

Added fallback to support both field names:

```typescript
const rejectionText = emergencyClean(movement.rejectionReason || movement.raison || "Non specifiee");
```

## PDF Layout Comparison

### Before Fix (Rejected Entrée)
```
┌─────────────────────────────────────┐
│ Bon de Rejet                        │
├─────────────────────────────────────┤
│ ID: 123                             │
│ Date: 2026-03-28                    │
│ Article: Gants Nitrile M            │
│ Type: Sortie                    ❌  │
│ Quantite: 100 Paire                 │
│ Emplacement Source: N/A             │
│ Destination: Retour Fournisseur     │
└─────────────────────────────────────┘
```

### After Fix (Rejected Entrée)
```
┌─────────────────────────────────────┐
│ Bon de Rejet                        │
├─────────────────────────────────────┤
│ ID: 123                             │
│ Date: 2026-03-28                    │
│ Article: Gants Nitrile M            │
│ Type: Entrée                    ✅  │
│ Decision Qualite: REJETE        ✅  │
│ Quantite: 100 Paire                 │
│ Destination Prevue: Zone A      ✅  │
│ Action: Retour Fournisseur      ✅  │
└─────────────────────────────────────┘
```

## Use Cases

### Case 1: Rejected Inbound Delivery (Entrée)
```
Supplier delivers defective goods
→ Type: Entrée
→ Decision: REJETE
→ Action: Retour Fournisseur
→ Stock Impact: None (never entered inventory)
```

**PDF Shows:**
- Type: Entrée ✅
- Decision Qualite: REJETE ✅
- Destination Prevue: [Warehouse location]
- Action: Retour Fournisseur

### Case 2: Rejected Outbound Movement (Sortie)
```
Warehouse attempts to ship goods
→ Type: Sortie
→ Decision: REJETE
→ Action: Remains in warehouse
→ Stock Impact: None (never left inventory)
```

**PDF Shows:**
- Type: Sortie ✅
- Decision Qualite: REJETE ✅
- Emplacement Source: [Warehouse location]
- Destination Prevue: [Customer/Department]

## Quality Control Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    ENTRÉE MOVEMENT                          │
│              (Supplier delivers 100 units)                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Quality Control Inspection                     │
│              Finds: Defective/Non-compliant                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    QC REJECTION                             │
│              Status: "Rejeté"                               │
│              Generate: Bon de Rejet PDF                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    PDF CONTENT                              │
│  Type: Entrée ✅ (NOT "Sortie")                            │
│  Decision Qualite: REJETE ✅                                │
│  Action: Retour Fournisseur ✅                              │
│  Stock Impact: 0 (never entered)                            │
└─────────────────────────────────────────────────────────────┘
```

## Benefits

1. **Accurate Documentation**: PDFs now correctly reflect the original movement type
2. **Clear Decision**: "Decision Qualite: REJETE" field makes rejection status obvious
3. **Proper Traceability**: Can distinguish between rejected deliveries and rejected shipments
4. **Compliance**: Accurate records for audits and supplier disputes
5. **Reduced Confusion**: Staff immediately understand what happened

## Files Modified

**src/lib/pdf-generator.ts**
- Updated `generateRejectionPDF()` function
- Preserved original `movement.type` instead of hardcoding "Sortie"
- Added "Decision Qualite: REJETE" field with red highlighting
- Made location fields dynamic based on movement type
- Added fallback for rejection reason field

## Testing Checklist

- [x] Reject an Entrée → PDF shows "Type: Entrée"
- [x] Reject a Sortie → PDF shows "Type: Sortie"
- [x] "Decision Qualite: REJETE" appears in red
- [x] Entrée rejection shows "Destination Prevue" and "Action: Retour Fournisseur"
- [x] Sortie rejection shows "Emplacement Source" and "Destination Prevue"
- [x] Rejection reason displays correctly
- [x] No syntax errors or compilation issues

## Impact on Business Logic

### Before Fix
- ❌ Rejected Entrée PDFs showed wrong type
- ❌ Confusion about whether goods were received or shipped
- ❌ Difficult to track supplier quality issues
- ❌ Audit trail was misleading

### After Fix
- ✅ All PDFs show correct original movement type
- ✅ Clear distinction between rejected deliveries and rejected shipments
- ✅ Accurate supplier quality tracking
- ✅ Compliant audit trail

## Date
March 28, 2026
