# Quality Control System - Visual Guide

## 🎯 Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    QC SYSTEM WORKFLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Article Configuration                                       │
│  ┌──────────────────────────────────────┐                  │
│  │ ⚙️ Avec QC    │  🚀 Sans QC         │                  │
│  │ (Medical)     │  (Office Supplies)   │                  │
│  └──────────────────────────────────────┘                  │
│         │                    │                              │
│         ▼                    ▼                              │
│  ┌──────────────┐    ┌──────────────┐                     │
│  │   ENTRÉE     │    │   ENTRÉE     │                     │
│  │   Created    │    │   Created    │                     │
│  └──────────────┘    └──────────────┘                     │
│         │                    │                              │
│         ▼                    ▼                              │
│  ┌──────────────┐    ┌──────────────┐                     │
│  │  ⏳ Pending  │    │  ✅ Approved │                     │
│  │  QC Review   │    │  Immediately │                     │
│  └──────────────┘    └──────────────┘                     │
│         │                    │                              │
│         ▼                    ▼                              │
│  ┌──────────────┐    ┌──────────────┐                     │
│  │ 🛡️ QC Page   │    │  📦 Stock    │                     │
│  │ Validation   │    │  Updated     │                     │
│  └──────────────┘    └──────────────┘                     │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐                                          │
│  │  ✅ Approved │                                          │
│  │  📦 Stock    │                                          │
│  │  Updated     │                                          │
│  └──────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Article Form - QC Toggle

```
┌────────────────────────────────────────────────────┐
│  Ajouter un article                                │
├────────────────────────────────────────────────────┤
│                                                    │
│  Référence: [GN-M-001________________]            │
│  Nom:       [Gants Nitrile M_________]            │
│  Catégorie: [Gants Nitrile ▼_________]            │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ Contrôle de Qualité                          │ │
│  ├──────────────────────────────────────────────┤ │
│  │ [✓ Avec contrôle de qualité] [Sans contrôle] │ │
│  │                                              │ │
│  │ ℹ️ Les entrées et sorties nécessiteront     │ │
│  │    une validation qualité avant mise à      │ │
│  │    jour du stock                            │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  [Annuler]  [Ajouter]                             │
└────────────────────────────────────────────────────┘
```

## 🛡️ Quality Control Page - Tab Interface

```
┌────────────────────────────────────────────────────────────┐
│  🛡️ Contrôle de Qualité                                    │
│  Validation des entrées et sorties nécessitant un contrôle │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────┬──────────────────────────┐  │
│  │ 📦 Contrôles à l'Entrée  │ 🛡️ Contrôles à la Sortie │  │
│  │         (3)              │         (2)              │  │
│  └──────────────────────────┴──────────────────────────┘  │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Date       │ Article        │ Qté  │ Actions       │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ 28/03/2026 │ Gants Nitrile  │ 500  │ [✓] [✗]      │   │
│  │ 14:32      │ GN-M-001       │ Paire│              │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ 28/03/2026 │ Masques FFP2   │ 1000 │ [✓] [✗]      │   │
│  │ 13:15      │ MK-FFP2-006    │ Unité│              │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

## ✅ QC Validation Modal - Entrée

```
┌────────────────────────────────────────────────────┐
│  Contrôle Qualité                                  │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ Type:    [Entrée]                            │ │
│  │ Article: Gants Nitrile M (GN-M-001)          │ │
│  │ Quantité Totale: 500 Paire                   │ │
│  │                                              │ │
│  │ ℹ️ Seules les unités valides seront         │ │
│  │    ajoutées au stock                         │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  État des Articles:                                │
│  [✓ Conforme] [Non-conforme]                      │
│                                                    │
│  Nom du Contrôleur:                                │
│  [Marie L.___________________________]            │
│                                                    │
│  [Annuler]  [Approuver]                           │
└────────────────────────────────────────────────────┘
```

## ⚠️ QC Validation Modal - Non-conforme

```
┌────────────────────────────────────────────────────┐
│  Contrôle Qualité                                  │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ Type:    [Entrée]                            │ │
│  │ Article: Gants Nitrile M (GN-M-001)          │ │
│  │ Quantité Totale: 500 Paire                   │ │
│  │ └─ Valides: 480 Paire                        │ │
│  │ └─ Défectueuses (Perte): 20 Paire           │ │
│  │                                              │ │
│  │ ℹ️ Seules les 480 unités valides seront     │ │
│  │    ajoutées au stock                         │ │
│  │    Les 20 unités défectueuses seront        │ │
│  │    rejetées (perte permanente)              │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  État des Articles:                                │
│  [Conforme] [✓ Non-conforme]                      │
│                                                    │
│  Nombre d'unités défectueuses:                     │
│  [20_____________________________________]        │
│                                                    │
│  Nom du Contrôleur:                                │
│  [Marie L.___________________________]            │
│                                                    │
│  [Annuler]  [Approuver]                           │
└────────────────────────────────────────────────────┘
```

## 🔄 Movement Flow Comparison

### WITH QC (requiresQC: true)

```
ENTRÉE:
┌─────────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐
│ Create  │ -> │ Pending  │ -> │ QC Page │ -> │ Approved │
│ Entrée  │    │ Status   │    │ Review  │    │ + Stock  │
└─────────┘    └──────────┘    └─────────┘    └──────────┘
                    ⏳              🛡️             ✅

SORTIE:
┌─────────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐
│ Create  │ -> │ Pending  │ -> │ QC Page │ -> │ Approved │
│ Sortie  │    │ Status   │    │ Review  │    │ - Stock  │
└─────────┘    └──────────┘    └─────────┘    └──────────┘
                    ⏳              🛡️             ✅
```

### WITHOUT QC (requiresQC: false)

```
ENTRÉE:
┌─────────┐    ┌──────────┐
│ Create  │ -> │ Approved │
│ Entrée  │    │ + Stock  │
└─────────┘    └──────────┘
                    ✅

SORTIE:
┌─────────┐    ┌──────────┐
│ Create  │ -> │ Approved │
│ Sortie  │    │ - Stock  │
└─────────┘    └──────────┘
                    ✅
```

## 📊 Stock Impact Examples

### Example 1: Entrée with QC - Conforme

```
Before:  Stock = 1000 Paire
Entrée:  +500 Paire (Pending QC)
         Stock = 1000 Paire (unchanged - quarantine)
QC:      État = Conforme
After:   Stock = 1500 Paire ✅
```

### Example 2: Entrée with QC - Non-conforme

```
Before:  Stock = 1000 Paire
Entrée:  +500 Paire (Pending QC)
         Stock = 1000 Paire (unchanged - quarantine)
QC:      État = Non-conforme
         Défectueuses = 20 Paire
After:   Stock = 1480 Paire ✅ (only valid units added)
         Lost = 20 Paire ❌ (defective units rejected)
```

### Example 3: Sortie with QC - Conforme

```
Before:  Stock = 1000 Paire
Sortie:  -100 Paire (Pending QC)
         Stock = 1000 Paire (unchanged - pending)
QC:      État = Conforme
After:   Stock = 900 Paire ✅
```

### Example 4: Sortie with QC - Non-conforme

```
Before:  Stock = 1000 Paire
Sortie:  -100 Paire (Pending QC)
         Stock = 1000 Paire (unchanged - pending)
QC:      État = Non-conforme
         Défectueuses = 10 Paire
After:   Stock = 900 Paire ✅ (total deducted)
         Valid = 90 Paire (sent to production)
         Lost = 10 Paire ❌ (defective - permanent loss)
```

### Example 5: Entrée without QC

```
Before:  Stock = 1000 Paire
Entrée:  +500 Paire (Auto-approved)
After:   Stock = 1500 Paire ✅ (immediate)
```

### Example 6: Sortie without QC

```
Before:  Stock = 1000 Paire
Sortie:  -100 Paire (Auto-approved)
After:   Stock = 900 Paire ✅ (immediate)
```

## 🎨 UI Elements

### Badge Notifications
```
┌──────────────────────────────┐
│ 📦 Contrôles à l'Entrée  (3) │  ← Orange badge = pending items
└──────────────────────────────┘

┌──────────────────────────────┐
│ 🛡️ Contrôles à la Sortie  (2) │  ← Orange badge = pending items
└──────────────────────────────┘
```

### Status Indicators
```
⏳ En attente de validation Qualité  (Pending)
✅ Terminé                            (Approved)
❌ Rejeté                             (Rejected)
```

### Toast Messages
```
✅ "Entrée créée. En attente de validation Qualité."
✅ "Entrée de 10 Boîte (1000 Paire) en Zone A - Stock mis à jour automatiquement"
✅ "✓ Entrée validée. Stock mis à jour avec succès."
✅ "✓ Sortie validée. Stock mis à jour avec succès."
❌ "✗ Mouvement rejeté. Opération annulée."
```

## 🔍 Navigation Path

```
Sidebar Menu:
├─ 📋 Tableau de Bord
├─ 📦 Articles
├─ 🏷️ Catégories
├─ 📍 Emplacements
├─ ↔️ Mouvements
├─ 🛡️ Contrôle Qualité  ← NEW PAGE
├─ 📊 Inventaire
├─ 📏 Unités de Mesure
└─ 👥 Personnel
```

## 🎯 Key Takeaways

1. **Per-Article Control**: Each article can require or skip QC
2. **Two-Way QC**: Both Entrée and Sortie can require validation
3. **Smart Stock**: Stock updates only after QC approval (if required)
4. **Dedicated Page**: Clear interface with tabs for Entrée/Sortie
5. **Defect Handling**: Non-conforme items tracked and rejected
6. **Immediate Feedback**: Toast messages indicate QC status
7. **Badge Notifications**: Pending counts visible on tabs
