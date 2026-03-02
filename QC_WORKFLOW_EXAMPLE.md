# Quality Control Workflow - Visual Example

## Complete Workflow Example

### Scenario: Rejecting a Defective Shipment

#### Initial State
```
Movement Table:
┌────┬──────────────────────┬─────────┬────────┬──────────┬────────────────┐
│ ID │ Article              │ Type    │ Qté    │ Statut   │ Actions        │
├────┼──────────────────────┼─────────┼────────┼──────────┼────────────────┤
│ 10 │ Gants Nitrile M      │ Sortie  │ 500    │ 🟠 En    │ 🛡️ ❌ ✏️ 🗑️  │
│    │ (GN-M-001)           │         │        │ attente  │                │
└────┴──────────────────────┴─────────┴────────┴──────────┴────────────────┘

Legend:
🛡️ = Quality Control (Approve)
❌ = Reject
✏️ = Edit
🗑️ = Delete
```

#### Step 1: Click Reject Button (❌)
```
User clicks the red X button for Movement ID 10
```

#### Step 2: Rejection Modal Opens
```
┌─────────────────────────────────────────────────────────┐
│  Rejeter le Mouvement                              [X]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Article: Gants Nitrile M (GN-M-001)             │   │
│  │ Quantité: 500 paire                             │   │
│  │ Opérateur: Jean D.                              │   │
│  │ Date: 2026-03-01 14:30:00                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ⚠️ Attention: Le rejet annulera ce mouvement          │
│  Le stock ne sera pas modifié et un rapport PDF        │
│  sera généré.                                           │
│                                                         │
│  Nom du Contrôleur *                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Marie Lefebvre                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Raison du Rejet *                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Non-conformité qualité: 50 unités présentent   │   │
│  │ des déchirures au niveau des doigts. Défaut    │   │
│  │ de fabrication constaté. Lot complet retourné  │   │
│  │ au fournisseur pour remplacement. Référence    │   │
│  │ réclamation: REC-2026-03-001                    │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│  Cette raison sera incluse dans le rapport PDF         │
│                                                         │
│  ┌──────────┐  ┌────────────────────────┐             │
│  │ Annuler  │  │ Confirmer le Rejet     │             │
│  └──────────┘  └────────────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

#### Step 3: After Confirmation
```
✓ Toast Notification:
┌─────────────────────────────────────────┐
│ ✗ Sortie rejetée. Opération annulée.   │
└─────────────────────────────────────────┘

Movement Table Updated:
┌────┬──────────────────────┬─────────┬────────┬──────────┬────────────────┐
│ ID │ Article              │ Type    │ Qté    │ Statut   │ Actions        │
├────┼──────────────────────┼─────────┼────────┼──────────┼────────────────┤
│ 10 │ Gants Nitrile M      │ Sortie  │ 500    │ 🔴 Rejeté│ 📄 ✏️ 🗑️      │
│    │ (GN-M-001)           │         │        │          │                │
└────┴──────────────────────┴─────────┴────────┴──────────┴────────────────┘

Legend:
📄 = Download PDF Report
✏️ = Edit
🗑️ = Delete
```

#### Step 4: Generate PDF Report
```
User clicks the blue PDF icon (📄)

PDF Generation Process:
1. jsPDF creates document
2. Adds header with company name
3. Adds movement details
4. Adds rejection reason
5. Adds signature line
6. Downloads file

Downloaded File:
📄 Rejection_Report_10.pdf
```

#### Step 5: PDF Content
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│           Top Gloves Inventory Hub                      │
│              [Logo Placeholder]                         │
│                                                         │
│        Rapport de Rejet de Mouvement                    │
│                                                         │
│     Date du rapport: 1 mars 2026 à 14:35               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Détails du Mouvement                                   │
│                                                         │
│    ID du Mouvement: 10                                  │
│    Date: 2026-03-01 14:30:00                           │
│    Article: Gants Nitrile M (GN-M-001)                 │
│    Type: Sortie                                         │
│    Quantité: 500                                        │
│    Numéro de Lot: LOT-2026-03-001                      │
│    Date du Lot: 28/02/2026                             │
│    Emplacement Source: Zone A - Rack 12                │
│    Destination: Département Production                  │
│    Opérateur: Jean D.                                   │
│    Contrôleur Qualité: Marie Lefebvre                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Raison du Rejet                                        │
│                                                         │
│    Non-conformité qualité: 50 unités présentent des    │
│    déchirures au niveau des doigts. Défaut de          │
│    fabrication constaté. Lot complet retourné au       │
│    fournisseur pour remplacement. Référence            │
│    réclamation: REC-2026-03-001                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│                                                         │
│  Signature du Contrôleur Qualité:                      │
│                                                         │
│  _____________________________________________          │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────┐
│  User Action    │
│  Click Reject   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Rejection Modal │
│  Opens          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User Fills     │
│  Form Data      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Form Submit    │
│  Validation     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update Movement │
│  status: reject │
│  + reason       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save to        │
│  localStorage   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update UI      │
│  Show PDF icon  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User Clicks    │
│  PDF Icon       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Generate PDF   │
│  with jsPDF     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Download PDF   │
│  to Computer    │
└─────────────────┘
```

## State Changes

### Before Rejection:
```javascript
{
  id: 10,
  date: "2026-03-01 14:30:00",
  article: "Gants Nitrile M",
  ref: "GN-M-001",
  type: "Sortie",
  qte: 500,
  lotNumber: "LOT-2026-03-001",
  lotDate: "2026-02-28",
  emplacementSource: "Zone A - Rack 12",
  emplacementDestination: "Département Production",
  operateur: "Jean D.",
  statut: "En attente de validation Qualité",
  status: "pending"
}
```

### After Rejection:
```javascript
{
  id: 10,
  date: "2026-03-01 14:30:00",
  article: "Gants Nitrile M",
  ref: "GN-M-001",
  type: "Sortie",
  qte: 500,
  lotNumber: "LOT-2026-03-001",
  lotDate: "2026-02-28",
  emplacementSource: "Zone A - Rack 12",
  emplacementDestination: "Département Production",
  operateur: "Jean D.",
  statut: "Rejeté",
  status: "rejected",
  controleur: "Marie Lefebvre",
  raison: "Non-conformité qualité: 50 unités présentent des déchirures...",
  rejectionReason: "Non-conformité qualité: 50 unités présentent des déchirures..."
}
```

## Button States

### Pending Movement:
```
Actions Column:
┌──────────────────────────────┐
│  🛡️  ❌  ✏️  🗑️             │
│  QC  Reject Edit Delete      │
└──────────────────────────────┘
```

### Rejected Movement:
```
Actions Column:
┌──────────────────────────────┐
│  📄  ✏️  🗑️                  │
│  PDF Edit Delete             │
└──────────────────────────────┘
```

### Approved Movement:
```
Actions Column:
┌──────────────────────────────┐
│  ✏️  🗑️                      │
│  Edit Delete                 │
└──────────────────────────────┘
```

## Real-World Usage Timeline

```
14:30:00 - Movement created (Sortie, 500 units)
           Status: "En attente de validation Qualité"
           
14:32:15 - Quality controller reviews movement
           Notices defects in products
           
14:33:00 - Clicks "Reject" button
           Modal opens
           
14:34:30 - Fills rejection form:
           - Controller: Marie Lefebvre
           - Reason: Detailed defect description
           
14:35:00 - Confirms rejection
           Status changes to "Rejeté"
           Toast notification appears
           
14:35:15 - Clicks PDF icon
           PDF generates and downloads
           File: Rejection_Report_10.pdf
           
14:36:00 - Archives PDF in quality folder
           Sends PDF to supplier
           Creates replacement order
```

## Integration with Existing Workflow

```
Movement Lifecycle:

1. CREATE
   ↓
2. PENDING (Sortie only)
   ↓
   ├─→ APPROVE → Stock Updated → COMPLETED
   │
   └─→ REJECT → No Stock Change → REJECTED
                 ↓
                 PDF Report Generated
                 ↓
                 Archived for Audit
```

## Error Handling

### Validation Errors:
```
Missing Controller Name:
┌─────────────────────────────────────────┐
│ ⚠️ Veuillez renseigner le nom du       │
│    contrôleur                           │
└─────────────────────────────────────────┘

Missing Rejection Reason:
┌─────────────────────────────────────────┐
│ ⚠️ Veuillez renseigner la raison du    │
│    rejet                                │
└─────────────────────────────────────────┘
```

### Success Messages:
```
Rejection Success:
┌─────────────────────────────────────────┐
│ ✓ Sortie rejetée. Opération annulée.   │
└─────────────────────────────────────────┘

PDF Generated:
(Browser downloads file automatically)
```

---

This example demonstrates the complete workflow from rejection to PDF generation, showing all UI states, data transformations, and user interactions.
