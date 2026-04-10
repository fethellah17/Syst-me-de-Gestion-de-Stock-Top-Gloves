# Visual Guide: Clean QC Architecture

## The 3-Phase Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PHASE 1: CREATE ENTRÉE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User Action:                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Create Entrée                                                        │  │
│  │ - Article: Gants Nitrile M                                          │  │
│  │ - Quantity: 500 Paires                                              │  │
│  │ - Destination: Zone A - Rack 12                                     │  │
│  │ - Lot: LOT-2026-03-001                                              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  System Action:                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ addMouvement()                                                       │  │
│  │ 1. Generate uniqueId: "550e8400-e29b-41d4-a716-446655440001"       │  │
│  │ 2. Set status: "En attente de validation Qualité"                  │  │
│  │ 3. Add to movements array                                           │  │
│  │ 4. ⚠️ DO NOT update stock                                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Result:                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Movement Created                                                     │  │
│  │ - uniqueId: "550e8400-e29b-41d4-a716-446655440001"                 │  │
│  │ - Status: "En attente de validation Qualité"                       │  │
│  │ - Stock: 2500 (UNCHANGED)                                           │  │
│  │ - UI: ⏰ Clock icon in Impact Stock column                          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 2: QC INSPECTION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Inspector Action:                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Click "Inspecter" button                                            │  │
│  │ ↓                                                                    │  │
│  │ Modal opens with movement details                                   │  │
│  │ ↓                                                                    │  │
│  │ Inspector verifies:                                                 │  │
│  │ ✓ Aspect/Emballage: OK                                              │  │
│  │ ✓ Conformité Quantité: OK                                           │  │
│  │ ✓ Présence Documents: OK                                            │  │
│  │ ↓                                                                    │  │
│  │ Inspector enters:                                                   │  │
│  │ - Valid Quantity: 500                                               │  │
│  │ - Defective Quantity: 0                                             │  │
│  │ - Controleur: Marie L.                                              │  │
│  │ ↓                                                                    │  │
│  │ Click "Approuver"                                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PHASE 3: STOCK UPDATE (THE TRIGGER)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  System Action: approveEntreeQualityControl()                               │
│                                                                              │
│  STEP 1: Find movement by ID                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ const mouvement = mouvements.find(m => m.id === id);               │  │
│  │ if (!mouvement || mouvement.type !== "Entrée") return;             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  STEP 2: Check for duplicate approval                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ if (mouvement.statut === "Terminé") {                              │  │
│  │   console.warn("Already approved");                                │  │
│  │   return; // Skip                                                  │  │
│  │ }                                                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  STEP 3: Validate inputs                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ const quantityToAdd = Number(validQuantity);                       │  │
│  │ if (quantityToAdd <= 0) return;                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  STEP 4: Find the article                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ const article = articles.find(a => a.ref === mouvement.ref);      │  │
│  │ if (!article) {                                                    │  │
│  │   alert("Article not found");                                     │  │
│  │   return;                                                          │  │
│  │ }                                                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  STEP 5: Find the destination zone                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ const targetZone = mouvement.emplacementDestination;              │  │
│  │ if (!targetZone) {                                                 │  │
│  │   alert("No destination zone");                                   │  │
│  │   return;                                                          │  │
│  │ }                                                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  STEP 6: Update stock - THE ONLY PLACE                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ setArticles(prevArticles => {                                      │  │
│  │   return prevArticles.map(a => {                                   │  │
│  │     if (a.ref !== mouvement.ref) return a;                         │  │
│  │                                                                     │  │
│  │     // Find or create destination zone                             │  │
│  │     const updatedInventory = [...a.inventory];                     │  │
│  │     const zoneIndex = updatedInventory.findIndex(                  │  │
│  │       l => l.zone === targetZone                                   │  │
│  │     );                                                              │  │
│  │                                                                     │  │
│  │     if (zoneIndex >= 0) {                                          │  │
│  │       // Zone exists - ADD to it                                   │  │
│  │       updatedInventory[zoneIndex].quantity += quantityToAdd;       │  │
│  │     } else {                                                        │  │
│  │       // Zone is new - CREATE it                                   │  │
│  │       updatedInventory.push({                                      │  │
│  │         zone: targetZone,                                          │  │
│  │         quantity: quantityToAdd                                    │  │
│  │       });                                                           │  │
│  │     }                                                               │  │
│  │                                                                     │  │
│  │     // Update total stock                                          │  │
│  │     const newStock = a.stock + quantityToAdd;                      │  │
│  │                                                                     │  │
│  │     return {                                                        │  │
│  │       ...a,                                                         │  │
│  │       stock: newStock,                                             │  │
│  │       inventory: updatedInventory                                  │  │
│  │     };                                                              │  │
│  │   });                                                               │  │
│  │ });                                                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  STEP 7: Update movement status - ONLY this specific movement              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ setMouvements(prevMovements => {                                   │  │
│  │   return prevMovements.map(m => {                                  │  │
│  │     if (m.uniqueId !== mouvement.uniqueId) return m;              │  │
│  │                                                                     │  │
│  │     return {                                                        │  │
│  │       ...m,                                                         │  │
│  │       statut: "Terminé",                                           │  │
│  │       status: "approved",                                          │  │
│  │       controleur,                                                  │  │
│  │       validQuantity: quantityToAdd                                 │  │
│  │     };                                                              │  │
│  │   });                                                               │  │
│  │ });                                                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Result:                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Stock Updated                                                       │  │
│  │ - Zone A - Rack 12: 1500 + 500 = 2000                              │  │
│  │ - Total stock: 2500 + 500 = 3000 ✓                                 │  │
│  │ - Movement status: "Terminé"                                       │  │
│  │ - UI: ⏰ Clock icon disappears, 📄 PDF icon appears                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## State Diagram

```
                    ┌─────────────────────────────────────┐
                    │   MOVEMENT CREATED                  │
                    │   status: "pending"                 │
                    │   statut: "En attente"              │
                    │   Stock: UNCHANGED                  │
                    │   UI: ⏰ Clock icon                  │
                    └─────────────────────────────────────┘
                                  │
                                  │ Inspector clicks "Inspecter"
                                  │
                                  ↓
                    ┌─────────────────────────────────────┐
                    │   QC INSPECTION                     │
                    │   Modal opens                       │
                    │   Inspector validates               │
                    │   Inspector clicks "Approuver"      │
                    └─────────────────────────────────────┘
                                  │
                                  │ approveEntreeQualityControl()
                                  │
                                  ↓
                    ┌─────────────────────────────────────┐
                    │   STOCK UPDATED                     │
                    │   status: "approved"                │
                    │   statut: "Terminé"                 │
                    │   Stock: UPDATED ✓                  │
                    │   UI: 📄 PDF icon                   │
                    └─────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────┐         ┌──────────────────────────────┐   │
│  │ Create Entrée Form      │         │ Movements Table              │   │
│  │ - Article               │         │ - Date                       │   │
│  │ - Quantity              │         │ - Article                    │   │
│  │ - Destination           │         │ - Type                       │   │
│  │ - Lot Number            │         │ - Impact Stock (⏰ pending)   │   │
│  │ - Lot Date              │         │ - Status (En attente)        │   │
│  │ [Create]                │         │ - Actions (Inspecter)        │   │
│  └─────────────────────────┘         └──────────────────────────────┘   │
│           │                                      │                       │
│           │ addMouvement()                       │ onQualityControlEntree│
│           ↓                                      ↓                       │
└──────────────────────────────────────────────────────────────────────────┘
           │                                      │
           │                                      │
           ↓                                      ↓
┌──────────────────────────────────────────────────────────────────────────┐
│                         DATA CONTEXT                                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────┐         ┌──────────────────────────────┐   │
│  │ addMouvement()          │         │ approveEntreeQualityControl()│   │
│  │ 1. Generate uniqueId    │         │ 1. Find movement by ID       │   │
│  │ 2. Set status: pending  │         │ 2. Check duplicate approval  │   │
│  │ 3. Add to movements     │         │ 3. Validate inputs           │   │
│  │ 4. ⚠️ NO stock update   │         │ 4. Find article              │   │
│  │                         │         │ 5. Find destination zone     │   │
│  │ Result:                 │         │ 6. Update stock ✓            │   │
│  │ - Movement created      │         │ 7. Update movement status    │   │
│  │ - Stock: UNCHANGED      │         │                              │   │
│  │ - UI: ⏰ Clock icon      │         │ Result:                      │   │
│  │                         │         │ - Stock: UPDATED ✓           │   │
│  │                         │         │ - UI: 📄 PDF icon            │   │
│  └─────────────────────────┘         └──────────────────────────────┘   │
│           │                                      │                       │
│           │ setMouvements()                      │ setArticles()         │
│           │ setArticles()                        │ setMouvements()       │
│           ↓                                      ↓                       │
└──────────────────────────────────────────────────────────────────────────┘
           │                                      │
           │                                      │
           ↓                                      ↓
┌──────────────────────────────────────────────────────────────────────────┐
│                         STATE                                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────┐         ┌──────────────────────────────┐   │
│  │ Movements Array         │         │ Articles Array               │   │
│  │ [                       │         │ [                            │   │
│  │   {                     │         │   {                          │   │
│  │     id: 1,              │         │     id: 1,                   │   │
│  │     uniqueId: "550e...", │         │     ref: "GN-M-001",         │   │
│  │     status: "pending",  │         │     nom: "Gants Nitrile M",  │   │
│  │     statut: "En attente",│         │     stock: 2500,             │   │
│  │     qte: 500,           │         │     inventory: [             │   │
│  │     ...                 │         │       {                      │   │
│  │   }                     │         │         zone: "Zone A-12",   │   │
│  │ ]                       │         │         quantity: 1500       │   │
│  │                         │         │       }                      │   │
│  │ After approval:         │         │     ]                        │   │
│  │ [                       │         │   }                          │   │
│  │   {                     │         │ ]                            │   │
│  │     id: 1,              │         │                              │   │
│  │     uniqueId: "550e...", │         │ After approval:              │   │
│  │     status: "approved", │         │ [                            │   │
│  │     statut: "Terminé",  │         │   {                          │   │
│  │     qte: 500,           │         │     id: 1,                   │   │
│  │     validQuantity: 500, │         │     ref: "GN-M-001",         │   │
│  │     ...                 │         │     stock: 3000, ✓           │   │
│  │   }                     │         │     inventory: [             │   │
│  │ ]                       │         │       {                      │   │
│  │                         │         │         zone: "Zone A-12",   │   │
│  │                         │         │         quantity: 2000 ✓     │   │
│  │                         │         │       }                      │   │
│  │                         │         │     ]                        │   │
│  │                         │         │   }                          │   │
│  │                         │         │ ]                            │   │
│  └─────────────────────────┘         └──────────────────────────────┘   │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Error Prevention Flow

```
approveEntreeQualityControl(id, controleur, validQuantity)
│
├─ STEP 1: Find movement by ID
│  ├─ Found? → Continue
│  └─ Not found? → Return (silent)
│
├─ STEP 2: Check duplicate approval
│  ├─ Already approved? → Return (skip)
│  └─ Not approved? → Continue
│
├─ STEP 3: Validate quantity
│  ├─ Valid (> 0)? → Continue
│  └─ Invalid? → Return (error)
│
├─ STEP 4: Find article
│  ├─ Found? → Continue
│  └─ Not found? → Alert + Return
│
├─ STEP 5: Find destination zone
│  ├─ Found? → Continue
│  └─ Not found? → Alert + Return
│
├─ STEP 6: Update stock
│  ├─ Success? → Continue
│  └─ Error? → Alert + Return
│
└─ STEP 7: Update movement status
   ├─ Success? → Complete ✓
   └─ Error? → Alert + Return
```

---

## UI State Transitions

```
PENDING STATE (En attente de validation Qualité)
┌─────────────────────────────────────────────────────────────┐
│ Impact Stock Column:                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 500 Paire ⏰                                            │ │
│ │ (Clock icon indicates pending QC)                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Status Badge:                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚠️ En attente (Yellow)                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Actions:                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Inspecter] [Dupliquer]                                │ │
│ │ (PDF icon hidden)                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                        ↓ Approve
APPROVED STATE (Terminé)
┌─────────────────────────────────────────────────────────────┐
│ Impact Stock Column:                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 500 Paire                                              │ │
│ │ (No clock icon - stock is applied)                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Status Badge:                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✓ Terminé (Green)                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Actions:                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [📄 PDF] [Dupliquer]                                   │ │
│ │ (PDF icon visible)                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

The clean architecture ensures:

1. **Isolation**: Entrée doesn't affect stock until QC approval
2. **Identification**: Every movement has a unique ID
3. **Idempotency**: Duplicate approvals are prevented
4. **Error Prevention**: All edge cases are handled
5. **Transparency**: Console logging shows all operations
6. **User Feedback**: UI clearly shows pending vs. approved status

The workflow is clean, predictable, and maintainable.
