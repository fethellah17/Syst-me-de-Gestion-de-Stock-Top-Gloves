# QC Control Notes - Complete Workflow Example

## Real-World Scenario

### Situation
A shipment of 500 pairs of Gants Nitrile M arrives at the warehouse. During quality control inspection, the controller discovers that 25 pairs are damaged due to packaging issues.

## Step-by-Step Workflow

### Step 1: Create Entrée Movement
- **Article:** Gants Nitrile M (GN-M-001)
- **Quantity:** 500 Paires
- **Lot Number:** LOT-2026-04-001
- **Destination Zone:** Zone A - Rack 12
- **Operator:** Karim B.
- **Status:** En attente (Pending QC)

### Step 2: Open QC Modal
1. User clicks "Contrôle Qualité" button on the pending Entrée
2. InspectionModal opens with movement details
3. Modal shows:
   - Article: Gants Nitrile M (GN-M-001)
   - Quantity Received: 500 Paires
   - Destination Zone: Zone A - Rack 12
   - Operator: Karim B.

### Step 3: Record Defects
1. User enters "Quantité Défectueuse": 25 Paires
2. **"Note de Contrôle" field automatically becomes visible and mandatory**
3. Field shows red asterisk: "Note de Contrôle * (Obligatoire)"
4. Quantities auto-calculate:
   - Quantité Conforme: 475 Paires
   - Quantité Défectueuse: 25 Paires

### Step 4: Write Control Notes
User writes detailed observation:
```
"Emballage endommagé lors du transport. 25 paires présentent 
des déchirures dans le film plastique. Articles à rejeter 
et retourner au fournisseur. Reste de la livraison (475 paires) 
conforme et acceptée."
```

### Step 5: Validation
- User enters controller name: "Marie L."
- Form validates:
  - ✓ Controller name provided
  - ✓ Quantities sum to total (475 + 25 = 500)
  - ✓ Note provided (mandatory because defects > 0)
- "Approuver la Réception" button enabled

### Step 6: Submit Approval
1. User clicks "Approuver la Réception"
2. System processes:
   - Saves mouvement with status "Terminé"
   - Saves controller: "Marie L."
   - Saves QC status: "Non-conforme"
   - Saves valid quantity: 475 Paires
   - Saves defective quantity: 25 Paires
   - **Saves control notes:** "Emballage endommagé lors du transport..."
   - Updates stock: +475 Paires in Zone A - Rack 12
   - Excludes defective units from stock

### Step 7: Generate PDF
1. User clicks "Générer PDF" on the completed movement
2. System generates "Bon d'Entrée" PDF with:

```
═══════════════════════════════════════════════════════════════
                    BON D'ENTREE
═══════════════════════════════════════════════════════════════

DETAILS DE LA RECEPTION
─────────────────────────────────────────────────────────────
Article: Gants Nitrile M (GN-M-001)
Date de Reception: 10-04-2026 14:32:20
Numero de Lot: LOT-2026-04-001
Date du Lot: 09-04-2026
Zone de Destination: Zone A - Rack 12
Operateur: Karim B.

QUANTITES
─────────────────────────────────────────────────────────────
Quantite Recue: 5 Boîte
Quantite Acceptee: 4.75 Boîte
Quantite Defectueuse: 0.25 Boîte

Taux de Conformite: 95% (Réception Partielle)

Facteur de Conversion: 1 Boîte = 100 Paire

OBSERVATIONS / NOTES DE CONTROLE
─────────────────────────────────────────────────────────────
Emballage endommagé lors du transport. 25 paires présentent 
des déchirures dans le film plastique. Articles à rejeter 
et retourner au fournisseur. Reste de la livraison (475 paires) 
conforme et acceptée.

POINTS DE CONTROLE
─────────────────────────────────────────────────────────────
[X] Aspect / Emballage Extérieur
[X] Conformité Quantité vs BL
[X] Présence Documents (FDS/BL)

═══════════════════════════════════════════════════════════════
Signature de l'Operateur:                Signature du Controleur Qualite:
_____________________________            _____________________________
Nom: Karim B.                            Nom: Marie L.

Date de Validation: 10-04-2026 14:35
═══════════════════════════════════════════════════════════════
```

## Key Points in PDF

### ✓ Control Notes Section
- **Title:** "OBSERVATIONS / NOTES DE CONTROLE"
- **Content:** Exact text entered by controller
- **Formatting:** Clean, readable, no encoding issues
- **Placement:** After quantities, before signatures

### ✓ Quality Score
- Shows: "95% (Réception Partielle)"
- Indicates partial acceptance with defects

### ✓ Verification Checklist
- Shows all inspection points checked
- Provides audit trail of QC process

## Alternative Scenario: Total Refusal

### If Controller Rejects Entire Shipment
1. User checks "Refuser toute la quantité"
2. Refusal reason field becomes mandatory
3. User writes: "Tous les articles présentent des défauts critiques"
4. System saves as total refusal
5. PDF shows:
   - Title: "AVIS DE REFUS DE RECEPTION"
   - Refusal reason in observations section
   - Quality score: "0% (Refus Total)"
   - No stock update (goods never entered warehouse)

## Data Persistence

### Database Record
```typescript
{
  id: "uuid-12345",
  date: "2026-04-10 14:32:20",
  article: "Gants Nitrile M",
  ref: "GN-M-001",
  type: "Entrée",
  qte: 500,
  lotNumber: "LOT-2026-04-001",
  emplacementDestination: "Zone A - Rack 12",
  operateur: "Karim B.",
  statut: "Terminé",
  status: "approved",
  controleur: "Marie L.",
  etatArticles: "Non-conforme",
  validQuantity: 475,
  defectiveQuantity: 25,
  qcStatus: "Non-conforme",
  noteControle: "Emballage endommagé lors du transport. 25 paires présentent des déchirures dans le film plastique. Articles à rejeter et retourner au fournisseur. Reste de la livraison (475 paires) conforme et acceptée.",
  verificationPoints: {
    aspect: true,
    quantite: true,
    documents: true
  },
  wasDelayed: false
}
```

## Audit Trail

### Complete History
1. **14:32:20** - Entrée created, status: "En attente"
2. **14:35:00** - QC inspection completed
   - Controller: Marie L.
   - Valid: 475 Paires
   - Defective: 25 Paires
   - Notes: "Emballage endommagé..."
3. **14:35:15** - Stock updated: +475 Paires in Zone A
4. **14:36:00** - PDF generated with control notes
5. **14:36:30** - PDF downloaded and printed

## Compliance Benefits

✓ **Traceability:** Every defect reason documented
✓ **Accountability:** Controller name recorded
✓ **Evidence:** Control notes in permanent PDF record
✓ **Audit:** Complete history available
✓ **Quality:** Systematic QC process documented
✓ **Supplier Management:** Defect patterns tracked

## Common Control Notes Examples

### Packaging Issues
- "Emballage endommagé lors du transport"
- "Film plastique déchiré sur 15 unités"
- "Boîte écrasée, contenu compromis"

### Quantity Issues
- "Quantité reçue inférieure à celle indiquée sur le BL"
- "5 unités manquantes par rapport à la commande"
- "Surcharge de 10 unités non commandées"

### Quality Issues
- "Articles cassés détectés à la réception"
- "Produits expirés - date limite dépassée"
- "Défaut de fabrication visible sur 3 unités"
- "Couleur non conforme aux spécifications"

### Documentation Issues
- "Fiche de données sécurité (FDS) manquante"
- "Bon de livraison incomplet"
- "Certificat de conformité absent"

## System Behavior

### When Note is Mandatory
```
Quantité Défectueuse > 0
    ↓
Note field becomes mandatory
    ↓
Red asterisk shown
    ↓
Form validation enforces note
    ↓
Error if note missing: "Une note de contrôle est obligatoire..."
```

### When Note is Optional
```
Quantité Défectueuse = 0
    ↓
Note field not shown
    ↓
No note required
    ↓
Form allows submission without note
```

### PDF Display Logic
```
Bon d'Entrée:
  - 100% Conforme → No observations section
  - Partial Defects → Observations section shown
  - Total Refusal → Refusal reason shown

Bon de Sortie:
  - No Defects → No observations section
  - Defects > 0 → Observations section shown
```

## Result

The complete QC flow ensures that:
1. Every defect is documented with a reason
2. The reason is saved to the database
3. The reason appears in the PDF report
4. The PDF is a permanent audit record
5. Traceability is maintained throughout the supply chain

This provides complete visibility into quality control decisions and creates a professional, documented record of all warehouse operations.
