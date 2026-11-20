# Movement History Table - Visual Guide

## New Table Structure

### Complete Table Layout

```
┌────────────┬─────────────┬────────┬────────────┬───────────┬────────────┬───────┬───────────┬───────────┬───────────┬────────┬─────────────┬────────┬──────────┬────────────┬─────────┐
│    Date    │   Article   │  Type  │ Numéro Lot │ Date Lot  │ Qté Saisie │ Unité │ Qté Total │ Qté Valide│Qté Défect.│ Source │ Destination │ Statut │ Opérateur│ Approuvé   │ Actions │
├────────────┼─────────────┼────────┼────────────┼───────────┼────────────┼───────┼───────────┼───────────┼───────────┼────────┼─────────────┼────────┼──────────┼────────────┼─────────┤
│ 09/03/2026 │ Gants       │ Entrée │LOT-2026-   │ 28/02/2026│     5      │  [B]  │    500    │     —     │     —     │   —    │  Zone A-12  │   ✓    │ Karim B. │  Système   │  📄 ✏️ 🗑️│
│ 14:32:20   │ Nitrile M   │        │ 03-001     │           │≈ 500 unités│       │           │           │           │        │             │Terminé │          │            │         │
│            │ GN-M-001    │        │            │           │            │       │           │           │           │        │             │        │          │            │         │
├────────────┼─────────────┼────────┼────────────┼───────────┼────────────┼───────┼───────────┼───────────┼───────────┼────────┼─────────────┼────────┼──────────┼────────────┼─────────┤
│ 09/03/2026 │ Gants       │ Sortie │LOT-2026-   │ 27/02/2026│    200     │  [P]  │    200    │    200    │     0     │Zone A  │ Département │   ⚠️   │ Sara M.  │ En attente │  🛡️ ✏️ 🗑️│
│ 13:15:45   │ Latex S     │        │ 03-002     │           │            │       │           │           │           │Rack 12 │ Production  │En att. │          │            │         │
│            │ GL-S-002    │        │            │           │            │       │           │           │           │        │             │        │          │            │         │
├────────────┼─────────────┼────────┼────────────┼───────────┼────────────┼───────┼───────────┼───────────┼───────────┼────────┼─────────────┼────────┼──────────┼────────────┼─────────┤
│ 08/03/2026 │ Masques     │Transfer│LOT-2026-   │ 01/03/2026│     3      │  [C]  │   3,000   │     —     │     —     │Zone D  │  Zone E     │   ✓    │ Jean D.  │    N/A     │  📄 ✏️ 🗑️│
│ 10:20:00   │ FFP2        │        │ 03-007     │           │≈ 3,000 unités│     │           │           │           │Rack 05 │ Quarantaine │Terminé │          │            │         │
│            │ MK-FFP2-006 │        │            │           │            │       │           │           │           │        │             │        │          │            │         │
└────────────┴─────────────┴────────┴────────────┴───────────┴────────────┴───────┴───────────┴───────────┴───────────┴────────┴─────────────┴────────┴──────────┴────────────┴─────────┘
```

## Column Details

### 1. Qté Saisie (Entered Quantity)

#### With Conversion
```
┌──────────────┐
│      5       │  ← Bold, prominent (what user entered)
│≈ 500 unités  │  ← Small, muted (conversion note)
└──────────────┘
```

#### Without Conversion
```
┌──────────────┐
│     200      │  ← Bold, prominent
│              │  ← No conversion note (same unit)
└──────────────┘
```

#### Styling
- Font: `font-mono font-semibold`
- Color: `text-foreground`
- Alignment: Right
- Conversion note:
  - Font: `text-[10px]`
  - Color: `text-muted-foreground`
  - Margin: `mt-0.5`

### 2. Unité (Unit Badge)

#### Badge Display
```
┌──────┐
│  B   │  ← Symbol only
└──────┘

Hover:
┌──────────────┐
│    Boîte     │  ← Tooltip with full name
└──────────────┘
      ▼
    ┌──────┐
    │  B   │
    └──────┘
```

#### Badge Styling
- Background: `bg-gray-100`
- Text: `text-gray-600`
- Border: `border-gray-200`
- Shape: `rounded-full`
- Padding: `px-2 py-0.5`
- Font: `text-xs font-semibold`

#### No Unit (Legacy)
```
┌──────┐
│  —   │  ← Placeholder for old data
└──────┘
```

### 3. Qté Total (Total Quantity)

#### Display
```
┌──────────────┐
│     500      │  ← Muted, smaller (calculated value)
└──────────────┘
```

#### Styling
- Font: `font-mono text-xs`
- Color: `text-muted-foreground`
- Alignment: Right
- Purpose: Reference/audit

## Unit Badge Examples

### Common Units

```
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│  P   │  │  B   │  │  U   │  │  C   │  │  Kg  │
└──────┘  └──────┘  └──────┘  └──────┘  └──────┘
 Paire     Boîte     Unité    Carton    Kilogram

┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│  L   │  │  T   │  │  Pc  │  │  g   │  │  ml  │
└──────┘  └──────┘  └──────┘  └──────┘  └──────┘
 Litre     Tonne     Pièce     Gramme   Millilitre
```

## Movement Type Examples

### Entrée (Entry)

```
┌────────────────────────────────────────────────────────────────┐
│ Type: Entrée (Green badge with ↓ icon)                        │
├────────────────────────────────────────────────────────────────┤
│ Qté Saisie: 5                                                  │
│             ≈ 500 unités                                       │
│ Unité: [B] (Boîte)                                            │
│ Qté Total: 500                                                 │
├────────────────────────────────────────────────────────────────┤
│ Interpretation:                                                │
│ - User entered 5 boxes                                         │
│ - System calculated 500 units (5 × 100)                       │
│ - Stock increased by 500 units                                │
└────────────────────────────────────────────────────────────────┘
```

### Sortie (Exit)

```
┌────────────────────────────────────────────────────────────────┐
│ Type: Sortie (Orange badge with ↑ icon)                       │
├────────────────────────────────────────────────────────────────┤
│ Qté Saisie: 200                                                │
│ Unité: [P] (Paire)                                            │
│ Qté Total: 200                                                 │
├────────────────────────────────────────────────────────────────┤
│ Interpretation:                                                │
│ - User entered 200 pairs                                       │
│ - No conversion needed (already in base unit)                 │
│ - Stock decreased by 200 pairs (after QC approval)            │
└────────────────────────────────────────────────────────────────┘
```

### Transfert

```
┌────────────────────────────────────────────────────────────────┐
│ Type: Transfert (Blue badge with ⇄ icon)                      │
├────────────────────────────────────────────────────────────────┤
│ Qté Saisie: 3                                                  │
│             ≈ 3,000 unités                                     │
│ Unité: [C] (Carton)                                           │
│ Qté Total: 3,000                                               │
├────────────────────────────────────────────────────────────────┤
│ Interpretation:                                                │
│ - User entered 3 cartons                                       │
│ - System calculated 3,000 units (3 × 1,000)                   │
│ - 3,000 units moved from source to destination                │
└────────────────────────────────────────────────────────────────┘
```

### Ajustement

```
┌────────────────────────────────────────────────────────────────┐
│ Type: Ajustement (+) (Purple badge with ✏️ icon)              │
├────────────────────────────────────────────────────────────────┤
│ Qté Saisie: 50                                                 │
│ Unité: [P] (Paire)                                            │
│ Qté Total: 50                                                  │
├────────────────────────────────────────────────────────────────┤
│ Interpretation:                                                │
│ - User entered 50 pairs (surplus found)                        │
│ - No conversion needed                                         │
│ - Stock increased by 50 pairs immediately                      │
└────────────────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (> 1200px)
```
All columns visible
Full width layout
Comfortable spacing
```

### Tablet (768px - 1200px)
```
Horizontal scroll enabled
All columns remain
Compact spacing
```

### Mobile (< 768px)
```
Horizontal scroll required
Priority columns visible first
Touch-friendly badges
```

## Color Coding

### Movement Types
- **Entrée**: Green (`status-green`)
- **Sortie**: Orange (`status-yellow`)
- **Transfert**: Blue (`status-blue`)
- **Ajustement**: Purple (`bg-purple-100 text-purple-800`)

### Status Badges
- **En attente**: Orange (`bg-orange-100 text-orange-800`)
- **Terminé**: Green (`status-green`)
- **Rejeté**: Red (`status-red`)

### Unit Badge
- **All units**: Gray (`bg-gray-100 text-gray-600 border-gray-200`)

## Interaction States

### Hover on Row
```
Background: bg-muted/30
Transition: smooth
Cursor: default
```

### Hover on Unit Badge
```
Tooltip appears above badge
Shows full unit name
Smooth fade-in
```

### Hover on Action Buttons
```
Background color change
Icon color intensifies
Cursor: pointer
```

## Data Flow

### Creating Movement
```
1. User enters: 5 Boîtes
2. System calculates: 500 Paires
3. Saved to database:
   - qte: 500 (base unit)
   - qteOriginale: 5 (user input)
   - uniteUtilisee: "Boîte"
4. Displayed in table:
   - Qté Saisie: 5 with "≈ 500 unités"
   - Unité: [B] badge
   - Qté Total: 500
```

### Viewing Movement
```
1. Load from database
2. Check if qteOriginale exists
3. If yes: Display original + conversion
4. If no: Display qte only (legacy)
5. Check if uniteUtilisee exists
6. If yes: Display unit badge
7. If no: Display "—" placeholder
```

## Accessibility

### Screen Readers
- Column headers properly labeled
- Unit badges have aria-labels
- Conversion notes announced
- Status badges descriptive

### Keyboard Navigation
- Tab through rows
- Focus indicators visible
- Action buttons accessible
- Tooltips keyboard-accessible

### Color Contrast
- All text meets WCAG AA
- Gray badges: 4.5:1 contrast
- Muted text: 4.5:1 contrast
- Status badges: High contrast

## Print Styling

### When Printing
```
- Remove action buttons
- Expand all columns
- Black and white friendly
- Page breaks between sections
- Header on each page
```

## Export Formats

### CSV Export
```
Date,Article,Type,Qté Saisie,Unité,Qté Total,...
09/03/2026 14:32:20,Gants Nitrile M,Entrée,5,Boîte,500,...
```

### Excel Export
```
- Formatted columns
- Unit symbols preserved
- Conversion formulas
- Color coding maintained
```

### PDF Export
```
- Professional layout
- Unit badges as text
- Conversion notes included
- Company branding
```

## Performance

### Rendering
- Virtual scrolling for 1000+ rows
- Lazy loading of badges
- Optimized re-renders
- Smooth scrolling

### Data Loading
- Paginated results
- Cached unit symbols
- Efficient filtering
- Quick search

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## Conclusion

The movement history table now provides complete transparency with:
- Original quantity as entered
- Unit badge with symbol
- Calculated total for reference
- Conversion notes when applicable
- Consistent gray monochrome styling
- Full audit trail

This creates a professional, clear, and auditable transaction history.

---

**Version**: 1.0.0
**Last Updated**: March 9, 2026
