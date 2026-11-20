# Dynamic Destinations System - Visual Guide

## Sidebar Navigation

```
┌─────────────────────────────────┐
│  Top Gloves                     │
│  Gestion de Stock               │
├─────────────────────────────────┤
│ 📊 Tableau de Bord              │
│ 📦 Articles                     │
│ 🏷️  Catégories                  │
│ 📍 Emplacements                 │
│ 📍 Destinations          ← NEW  │
│ ↔️  Mouvements                  │
│ 📋 Inventaire                   │
│ 📏 Unités de Mesure             │
│ 👥 Personnel                    │
├─────────────────────────────────┤
│ 🛡️  Accès Admin                 │
│ 🚪 Déconnexion                  │
└─────────────────────────────────┘
```

## Destinations Management Page

```
┌──────────────────────────────────────────────────────┐
│ Destinations                                         │
│ 5 destinations enregistrées              [+ Ajouter] │
├──────────────────────────────────────────────────────┤
│ 🔍 Rechercher une destination...                     │
├──────────────────────────────────────────────────────┤
│ ID │ Nom de la Destination    │ Actions             │
├────┼──────────────────────────┼─────────────────────┤
│ 1  │ Département Production   │ ✏️  🗑️              │
│ 2  │ Département Qualité      │ ✏️  🗑️              │
│ 3  │ Client X                 │ ✏️  🗑️              │
│ 4  │ Maintenance              │ ✏️  🗑️              │
│ 5  │ Expédition               │ ✏️  🗑️              │
└──────────────────────────────────────────────────────┘
```

## Add/Edit Destination Modal

```
┌─────────────────────────────────────────┐
│ Ajouter une destination                 │
├─────────────────────────────────────────┤
│                                         │
│ Nom de la Destination *                 │
│ ┌─────────────────────────────────────┐ │
│ │ Ex: Client X, Département...        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│                    [Annuler] [Ajouter] │
└─────────────────────────────────────────┘
```

## CreatableSelect Component - Closed State

```
┌─────────────────────────────────────────────────────┐
│ Destination (Client/Service)                        │
│ ┌───────────────────────────────────────────────┐   │
│ │ Sélectionner...                            ▼ │   │
│ └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## CreatableSelect Component - Open State (Existing Options)

```
┌─────────────────────────────────────────────────────┐
│ Destination (Client/Service)                        │
│ ┌───────────────────────────────────────────────┐   │
│ │ 🔍 Rechercher ou créer...                  ▲ │   │
│ ├───────────────────────────────────────────────┤   │
│ │ Département Production                      │   │
│ │ Département Qualité                         │   │
│ │ Client X                                    │   │
│ │ Maintenance                                 │   │
│ │ Expédition                                  │   │
│ └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## CreatableSelect Component - Create New

```
┌─────────────────────────────────────────────────────┐
│ Destination (Client/Service)                        │
│ ┌───────────────────────────────────────────────┐   │
│ │ 🔍 Client Y                                ▲ │   │
│ ├───────────────────────────────────────────────┤   │
│ │ + Ajouter "Client Y"                        │   │
│ └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## CreatableSelect Component - Selected State

```
┌─────────────────────────────────────────────────────┐
│ Destination (Client/Service)                        │
│ ┌───────────────────────────────────────────────┐   │
│ │ Département Production                  ✕ ▼ │   │
│ └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Bulk Movement Modal - Sortie Type

```
┌────────────────────────────────────────────────────────┐
│ Mouvement en Masse                                     │
├────────────────────────────────────────────────────────┤
│ Type: [Entrée] [Sortie] [Transfert]                   │
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Article │ Qté │ Source │ Destination │ Lot │ ... │  │
│ ├──────────────────────────────────────────────────┤  │
│ │ GN-M-001│ 100 │ Zone A │ [CreatableSelect] │ ... │  │
│ │ GL-S-002│ 50  │ Zone B │ [CreatableSelect] │ ... │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ Opérateur: [________________]                         │
│                                                        │
│                          [Annuler] [Valider]          │
└────────────────────────────────────────────────────────┘
```

## Mobile View - CreatableSelect

```
┌─────────────────────────────────┐
│ Destination (Client/Service)    │
│ ┌─────────────────────────────┐ │
│ │ Sélectionner...          ▼ │ │
│ └─────────────────────────────┘ │
│                                 │
│ (Tap to open dropdown)          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🔍 Rechercher...            │ │
│ ├─────────────────────────────┤ │
│ │ Département Production      │ │
│ │ Département Qualité         │ │
│ │ Client X                    │ │
│ │ Maintenance                 │ │
│ │ Expédition                  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## User Workflow - Create Sortie with New Destination

```
Step 1: Open Bulk Movement Modal
┌─────────────────────────────────┐
│ [+ Ajouter Mouvement]           │
└─────────────────────────────────┘
                ↓

Step 2: Select Sortie Type
┌─────────────────────────────────┐
│ Type: [Entrée] [Sortie] [Trans] │
└─────────────────────────────────┘
                ↓

Step 3: Fill Movement Details
┌─────────────────────────────────┐
│ Article: [GN-M-001]             │
│ Quantity: [100]                 │
│ Source: [Zone A]                │
│ Destination: [_________]        │
└─────────────────────────────────┘
                ↓

Step 4: Type New Destination
┌─────────────────────────────────┐
│ Destination: [Client X]         │
│ ┌─────────────────────────────┐ │
│ │ + Ajouter "Client X"        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
                ↓

Step 5: Click Create Button
┌─────────────────────────────────┐
│ Destination: [Client X] ✓       │
│ (Destination created & selected)│
└─────────────────────────────────┘
                ↓

Step 6: Submit Movement
┌─────────────────────────────────┐
│ [Valider]                       │
└─────────────────────────────────┘
                ↓

Step 7: Verify in Destinations Page
┌─────────────────────────────────┐
│ Destinations                    │
│ ┌─────────────────────────────┐ │
│ │ Client X              ✏️ 🗑️ │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────────┐
│  DataContext     │
│  destinations[]  │
│  addDestination()│
└────────┬─────────┘
         │
         ├─→ DestinationsPage
         │   ├─ View all
         │   ├─ Create
         │   ├─ Edit
         │   └─ Delete
         │
         └─→ MouvementsPage
             └─→ BulkMovementModal
                 └─→ CreatableSelect
                     ├─ Search
                     ├─ Select
                     └─ Create New
```

## State Transitions - CreatableSelect

```
┌─────────────┐
│   CLOSED    │
│ (Dropdown)  │
└──────┬──────┘
       │ Click button
       ↓
┌─────────────┐
│    OPEN     │
│ (Dropdown)  │
└──────┬──────┘
       │ Type text
       ↓
┌─────────────────────┐
│  SEARCH RESULTS     │
│  + Create Option    │
└──────┬──────────────┘
       │ Click option
       ↓
┌─────────────┐
│  SELECTED   │
│ (Closed)    │
└─────────────┘
```

## Color Scheme

```
Primary (Blue):     #3B82F6
Background:         #FFFFFF
Muted:              #6B7280
Border:             #E5E7EB
Hover:              #F3F4F6
Success:            #10B981
Destructive:        #EF4444
```

## Icon Usage

```
📍 MapPin      - Destinations & Emplacements
✏️  Edit        - Modify destination
🗑️  Trash       - Delete destination
+  Plus        - Add new destination
🔍 Search      - Search destinations
✕  X           - Clear selection
▼  ChevronDown - Open dropdown
```

## Responsive Breakpoints

```
Mobile:    < 768px
Tablet:    768px - 1024px
Desktop:   > 1024px

CreatableSelect adapts:
- Mobile: Full width, larger touch targets
- Tablet: Optimized spacing
- Desktop: Compact, efficient layout
```

## Animation Timings

```
Dropdown open/close:    200ms ease-in-out
Hover effects:          150ms ease-out
Focus transitions:      100ms ease-out
Toast notifications:    300ms fade-in
```

## Accessibility Features

```
✓ Keyboard navigation (Tab, Enter, Escape)
✓ Focus indicators (visible outline)
✓ ARIA labels on buttons
✓ Semantic HTML structure
✓ Color contrast ratios (WCAG AA)
✓ Screen reader support
✓ Touch-friendly targets (44px minimum)
```
