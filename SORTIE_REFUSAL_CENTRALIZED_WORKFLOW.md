# Sortie Refusal - Centralized Workflow Guide

## New Unified Quality Gate

### Before: External Button (Removed)
```
Mouvements Table
├─ ClipboardCheck (QC Modal)
└─ Red X (Separate Refusal Modal) ← REMOVED
```

### After: Centralized in Modal
```
Mouvements Table
└─ ClipboardCheck (InspectionModal)
   ├─ Approve
   ├─ Partial Defects
   └─ Refuse Completely
      ├─ Entrée: Simple refusal
      └─ Sortie: Type selection
         ├─ Defective (Stock ↓)
         └─ Correction (Stock →)
```

## Step-by-Step Workflow

### Step 1: Identify Pending Movement
```
┌─────────────────────────────────────────────────────────────┐
│ Mouvements                                                  │
├─────────────────────────────────────────────────────────────┤
│ Date    │ Article    │ Type   │ Qté  │ Zone  │ Statut │ Act │
├─────────┼────────────┼────────┼──────┼───────┼────────┼─────┤
│ 09/04   │ Gants M    │ Sortie │ 100  │ A1    │ En att │ [📋]│ ← Click here
│ 08/04   │ Gants L    │ Entrée │ 200  │ B2    │ Termin │ [📄]│
└─────────┴────────────┴────────┴──────┴───────┴────────┴─────┘
```

### Step 2: InspectionModal Opens
```
┌──────────────────────────────────────────────────────────────┐
│ Contrôle Qualité - Sortie                               [X] │
│ Vérification de la qualité et de la conformité              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ☑ Refuser toute la quantité                                 │
│   Cochez cette case pour rejeter complètement ce mouvement  │
│                                                              │
│ [Refusal Type Selection Appears Below]                      │
│                                                              │
│ [Annuler]                          [Confirmer le Refus]    │
└──────────────────────────────────────────────────────────────┘
```

### Step 3: Select Refusal Type (Sortie Only)
```
┌──────────────────────────────────────────────────────────────┐
│ Contrôle Qualité - Sortie                               [X] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ☑ Refuser toute la quantité                                 │
│                                                              │
│ TYPE DE REFUS                                               │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ○ Article Défectueux (Rebut)                          │  │
│ │   Stock sera déduit pour cause de dommage             │  │
│ │                                                        │  │
│ │ ○ Erreur de Préparation (Correction)                  │  │
│ │   Retour en rayon - Pas de déduction de stock         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ [Annuler]                          [Confirmer le Refus]    │
└──────────────────────────────────────────────────────────────┘
```

### Step 4A: Select "Article Défectueux"
```
┌──────────────────────────────────────────────────────────────┐
│ Contrôle Qualité - Sortie                               [X] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ☑ Refuser toute la quantité                                 │
│                                                              │
│ TYPE DE REFUS                                               │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ◉ Article Défectueux (Rebut)                          │  │ ← Selected
│ │   Stock sera déduit pour cause de dommage             │  │
│ │                                                        │  │
│ │ ○ Erreur de Préparation (Correction)                  │  │
│ │   Retour en rayon - Pas de déduction de stock         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [RED BACKGROUND]                                       │ │
│ │                                                          │ │
│ │ Nom du Contrôleur *                                    │ │
│ │ [________________________]                              │ │
│ │                                                          │ │
│ │ Motif du Refus *                                       │ │
│ │ [_________________________________________________]     │ │
│ │ [_________________________________________________]     │ │
│ │                                                          │ │
│ │ ⚠ Stock déduit pour cause de dommage                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ [Annuler]                          [Confirmer le Refus]    │
└──────────────────────────────────────────────────────────────┘
```

### Step 4B: Select "Erreur de Préparation"
```
┌──────────────────────────────────────────────────────────────┐
│ Contrôle Qualité - Sortie                               [X] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ☑ Refuser toute la quantité                                 │
│                                                              │
│ TYPE DE REFUS                                               │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ○ Article Défectueux (Rebut)                          │  │
│ │   Stock sera déduit pour cause de dommage             │  │
│ │                                                        │  │
│ │ ◉ Erreur de Préparation (Correction)                  │  │ ← Selected
│ │   Retour en rayon - Pas de déduction de stock         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [BLUE BACKGROUND]                                      │ │
│ │                                                          │ │
│ │ Nom de l'Opérateur *                                   │ │
│ │ [________________________]                              │ │
│ │                                                          │ │
│ │ Motif de l'Erreur *                                    │ │
│ │ [_________________________________________________]     │ │
│ │ [_________________________________________________]     │ │
│ │                                                          │ │
│ │ ⓘ Retour en rayon - Erreur administrative             │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ [Annuler]                          [Confirmer le Refus]    │
└──────────────────────────────────────────────────────────────┘
```

### Step 5: Submit and PDF Generated
```
┌──────────────────────────────────────────────────────────────┐
│ ✓ Sortie rejetée - Article défectueux.                      │
│   PDF généré: Avis_de_Rejet_de_Sortie_Gants-Nitrile-M...   │
└──────────────────────────────────────────────────────────────┘
```

### Step 6: PDF Download Available
```
┌─────────────────────────────────────────────────────────────┐
│ Mouvements                                                  │
├─────────────────────────────────────────────────────────────┤
│ Date    │ Article    │ Type   │ Qté  │ Zone  │ Statut │ Act │
├─────────┼────────────┼────────┼──────┼───────┼────────┼─────┤
│ 09/04   │ Gants M    │ Sortie │ 100  │ A1    │ Rejeté │ [📄]│ ← PDF available
│ 08/04   │ Gants L    │ Entrée │ 200  │ B2    │ Termin │ [📄]│
└─────────┴────────────┴────────┴──────┴───────┴────────┴─────┘
```

## Comparison: Before vs After

### Before (External Button)
```
User Flow:
1. Click ClipboardCheck → InspectionModal
2. Click Red X → SortieRefusalModal
3. Select refusal type
4. Submit
5. PDF generated
6. Back to table

Issues:
- Two separate modals
- Easy to miss the red X button
- Confusing workflow
- Risk of accidental clicks
```

### After (Centralized)
```
User Flow:
1. Click ClipboardCheck → InspectionModal
2. Check "Refuser toute la quantité"
3. Select refusal type (radio buttons appear)
4. Fill fields
5. Click "Confirmer le Refus"
6. PDF generated
7. Modal closes

Benefits:
- Single modal for all decisions
- Clear workflow
- No accidental clicks
- Professional appearance
- Consistent with Entrée logic
```

## Key Differences

| Aspect | Before | After |
|--------|--------|-------|
| **Button Location** | Table actions column | Inside modal |
| **Number of Modals** | 2 (QC + Refusal) | 1 (QC with refusal) |
| **Refusal Type Selection** | Separate modal | Inside QC modal |
| **Table Cleanliness** | Cluttered | Clean |
| **User Confusion** | High | Low |
| **Accidental Clicks** | Possible | Prevented |
| **Workflow Steps** | 5+ | 4-5 |

## Quality Gate Decision Tree

```
User clicks ClipboardCheck
│
├─ InspectionModal opens
│  │
│  ├─ User selects "Approve"
│  │  └─ Normal approval flow
│  │
│  ├─ User selects "Partial Defects"
│  │  └─ Enter defective quantity
│  │
│  └─ User checks "Refuser toute la quantité"
│     │
│     ├─ If Entrée:
│     │  ├─ Enter controller name
│     │  ├─ Enter refusal reason
│     │  └─ Generate Bon d'Entrée PDF
│     │
│     └─ If Sortie:
│        ├─ Select refusal type (radio)
│        │
│        ├─ If "Article Défectueux":
│        │  ├─ Enter controller name
│        │  ├─ Enter refusal reason
│        │  ├─ Generate Avis_de_Rejet PDF
│        │  └─ Stock DEDUCTED
│        │
│        └─ If "Erreur de Préparation":
│           ├─ Enter operator name
│           ├─ Enter error reason
│           ├─ Generate Note_de_Correction PDF
│           └─ Stock NOT deducted
```

## Icon Legend

| Icon | Meaning | Action |
|------|---------|--------|
| 📋 | Quality Control | Opens InspectionModal |
| 📄 | Download PDF | Downloads movement PDF |
| ☑ | Checkbox | Check to refuse |
| ○ | Radio Button | Select refusal type |
| ⚠ | Warning | Stock impact indicator |
| ⓘ | Info | Additional information |

## Color Coding

| Color | Meaning | Context |
|-------|---------|---------|
| Red | Defective/Loss | Article Défectueux section |
| Blue | Correction/Return | Erreur de Préparation section |
| Green | Approve | Approval button |
| Gray | Disabled | Inactive button |

## Accessibility

- ✅ Keyboard navigable (Tab, Arrow keys)
- ✅ Radio buttons properly labeled
- ✅ Color not sole indicator
- ✅ Clear error messages
- ✅ WCAG AA compliant

## Mobile Responsiveness

- ✅ Full-width modal on mobile
- ✅ Scrollable content
- ✅ Touch-friendly buttons
- ✅ Readable text sizes
- ✅ Proper spacing

## Summary

The centralized workflow provides:

1. **Single Entry Point**: ClipboardCheck icon for all quality decisions
2. **Clear Workflow**: Step-by-step process within one modal
3. **Type-Specific Handling**: Sortie refusals with proper type selection
4. **Professional PDFs**: Appropriate documents for each scenario
5. **Proper Stock Management**: Correct deductions based on refusal type
6. **Better UX**: No accidental clicks, clear confirmation steps
7. **Consistent Design**: Matches existing Entrée logic
