# Multi-Location Inventory System - Visual Guide

## 🎯 Problem Solved

### BEFORE (❌ Broken)
```
Article: Gants Nitrile M
emplacement: "Zone C"  ← Single string field
stock: 100

[Entry to Zone D: 50 units]

Article: Gants Nitrile M
emplacement: "Zone D"  ← OVERWRITTEN! Zone C is lost
stock: 150
```

### AFTER (✅ Fixed)
```
Article: Gants Nitrile M
locations: [
  { emplacementNom: "Zone C", quantite: 100 },
  { emplacementNom: "Zone D", quantite: 50 }
]
Total Stock: 150 (calculated dynamically)
```

## 📊 Data Flow

### Entry Movement
```
┌─────────────────────────────────────────┐
│ User creates Entry:                     │
│ - Article: Gants Nitrile M              │
│ - Quantity: 100                          │
│ - Destination: Zone C                    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ System checks locations array:          │
│ Does "Zone C" exist?                     │
└─────────────────────────────────────────┘
         ↓ NO              ↓ YES
┌──────────────┐    ┌──────────────────┐
│ CREATE new   │    │ ADD to existing  │
│ location:    │    │ quantity:        │
│ {            │    │ quantite += 100  │
│   name: "C", │    └──────────────────┘
│   qty: 100   │
│ }            │
└──────────────┘
```

### Exit Movement
```
┌─────────────────────────────────────────┐
│ User creates Exit:                      │
│ - Article: Gants Nitrile M              │
│ - Quantity: 30                           │
│ - Source: Zone C                         │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ System finds "Zone C" in locations:     │
│ quantite: 100 → 70                       │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ If quantity becomes 0:                  │
│ Remove location from array               │
└─────────────────────────────────────────┘
```

### Transfer Movement
```
┌─────────────────────────────────────────┐
│ User creates Transfer:                  │
│ - Article: Gants Nitrile M              │
│ - Quantity: 20                           │
│ - Source: Zone D                         │
│ - Destination: Zone C                    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ System updates BOTH locations:          │
│ Zone D: 50 → 30 (deduct)                │
│ Zone C: 70 → 90 (add)                   │
│ Total Stock: 120 (unchanged)            │
└─────────────────────────────────────────┘
```

## 🖥️ UI Display

### Articles Table - Before
```
┌──────────────────────────────────────────────────┐
│ Article          │ Emplacement │ Stock           │
├──────────────────────────────────────────────────┤
│ Gants Nitrile M  │ Zone D      │ 150             │
│                  │ ↑ WRONG!    │                 │
└──────────────────────────────────────────────────┘
```

### Articles Table - After
```
┌────────────────────────────────────────────────────────────┐
│ Article          │ Emplacement                │ Stock      │
├────────────────────────────────────────────────────────────┤
│ Gants Nitrile M  │ [Zone C: 100] [Zone D: 50] │ 150        │
│                  │  ↑ ALL locations shown     │ ↑ Sum      │
└────────────────────────────────────────────────────────────┘
```

## 🔄 Real-World Example

### Scenario: Medical Gloves Distribution

**Day 1 - Initial Delivery**
```
Receive 1000 pairs → Store in Zone A
locations: [{ emplacementNom: "Zone A", quantite: 1000 }]
Total: 1000
```

**Day 2 - Partial Transfer**
```
Transfer 300 pairs from Zone A → Zone B (for production)
locations: [
  { emplacementNom: "Zone A", quantite: 700 },
  { emplacementNom: "Zone B", quantite: 300 }
]
Total: 1000
```

**Day 3 - New Delivery**
```
Receive 500 pairs → Store in Zone A
locations: [
  { emplacementNom: "Zone A", quantite: 1200 },  ← ACCUMULATED
  { emplacementNom: "Zone B", quantite: 300 }
]
Total: 1500
```

**Day 4 - Production Consumption**
```
Exit 200 pairs from Zone B
locations: [
  { emplacementNom: "Zone A", quantite: 1200 },
  { emplacementNom: "Zone B", quantite: 100 }   ← DEDUCTED
]
Total: 1300
```

**Day 5 - Emergency Transfer**
```
Transfer 100 pairs from Zone A → Zone C (emergency stock)
locations: [
  { emplacementNom: "Zone A", quantite: 1100 },
  { emplacementNom: "Zone B", quantite: 100 },
  { emplacementNom: "Zone C", quantite: 100 }   ← NEW LOCATION
]
Total: 1300
```

## 📈 Benefits Visualization

### Data Integrity
```
BEFORE:                    AFTER:
┌──────────┐              ┌──────────┐
│ Article  │              │ Article  │
├──────────┤              ├──────────┤
│ stock: X │ ← Manual     │ locations│ ← Single
│ location │   sync       │   array  │   source
└──────────┘   needed     └──────────┘   of truth
     ↓                          ↓
  ❌ Can                     ✅ Always
  diverge                    consistent
```

### Location Tracking
```
BEFORE:                    AFTER:
┌──────────┐              ┌──────────────────┐
│ One      │              │ Multiple         │
│ location │              │ locations        │
│ at a     │              │ simultaneously   │
│ time     │              │ with quantities  │
└──────────┘              └──────────────────┘
     ↓                          ↓
  ❌ Lost                    ✅ Complete
  history                    visibility
```

### Stock Calculation
```
BEFORE:                    AFTER:
┌──────────┐              ┌──────────────────┐
│ Manual   │              │ Automatic        │
│ updates  │              │ calculation      │
│ required │              │ from locations   │
└──────────┘              └──────────────────┘
     ↓                          ↓
  ❌ Error                   ✅ Always
  prone                      accurate
```

## 🎨 UI Components

### Location Badges
```tsx
// Each location is displayed as a badge
[Zone C: 100] [Zone D: 50] [Zone E: 25]
  ↑ Location    ↑ Quantity
```

### Stock Display
```tsx
// Total stock is calculated and displayed
Stock: 175 Paire
       ↑ Sum of all location quantities
```

### Movement Form
```tsx
// Source dropdown shows available locations
Source: [Zone C (100 available) ▼]
        [Zone D (50 available)  ]
        [Zone E (25 available)  ]
```

## ✅ Validation Rules

### Entry
- ✅ Can create new location
- ✅ Can add to existing location
- ✅ No stock validation needed

### Exit
- ✅ Must select existing location
- ✅ Quantity ≤ available in that location
- ✅ Location removed if quantity becomes 0

### Transfer
- ✅ Source must have sufficient quantity
- ✅ Destination can be new or existing
- ✅ Total stock remains unchanged

## 🚀 Performance

### Memory Efficiency
```
BEFORE: 1 article = 1 location string
AFTER:  1 article = N locations (only where stock exists)

Example:
- Article in 3 locations: 3 objects in array
- Article in 0 locations: empty array
- No wasted memory for empty locations
```

### Calculation Speed
```typescript
// O(n) where n = number of locations per article
// Typically n < 10, so very fast
const totalStock = article.locations.reduce((sum, loc) => sum + loc.quantite, 0);
```

## 🎯 Summary

**Problem:** Single location field was overwritten on each movement
**Solution:** Array of locations with independent quantities
**Result:** Complete multi-location inventory tracking

**Key Achievement:** Article X can now exist in Zone C AND Zone D simultaneously with their respective quantities! ✅
