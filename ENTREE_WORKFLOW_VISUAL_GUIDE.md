# Entrée Workflow - Visual Guide

## Issue 1: Icon Logic

### BEFORE (Wrong)
```
Entrée Movement (Status: En Attente)
┌─────────────────────────────────────┐
│ Article: Gants Nitrile M            │
│ Quantity: 100 Paires                │
│ Status: En Attente                  │
│                                     │
│ Actions:                            │
│ [QC Icon] [PDF Icon] ❌ WRONG!     │
│                                     │
│ User can download PDF before QC!    │
└─────────────────────────────────────┘
```

### AFTER (Correct)
```
Entrée Movement (Status: En Attente)
┌─────────────────────────────────────┐
│ Article: Gants Nitrile M            │
│ Quantity: 100 Paires                │
│ Status: En Attente                  │
│                                     │
│ Actions:                            │
│ [QC Icon] ✓ CORRECT!               │
│                                     │
│ User must validate QC first         │
└─────────────────────────────────────┘

After QC Approval (Status: Terminé)
┌─────────────────────────────────────┐
│ Article: Gants Nitrile M            │
│ Quantity: 100 Paires                │
│ Status: Terminé                     │
│                                     │
│ Actions:                            │
│ [PDF Icon] ✓ CORRECT!              │
│                                     │
│ User can download PDF now           │
└─────────────────────────────────────┘
```

## Issue 2: Stock Update Timing

### BEFORE (Wrong)
```
Timeline:
┌─────────────────────────────────────────────────────┐
│ Create Entrée 100 units                             │
│ ↓                                                   │
│ Stock: 2500 → 2600 ❌ (premature!)                 │
│ Zone A: 1500 → 1600 ❌ (premature!)                │
│ Status: En Attente                                  │
│ ↓                                                   │
│ User approves QC                                    │
│ ↓                                                   │
│ Stock: 2600 → 2700 ❌ (double-counted!)            │
│ Zone A: 1600 → 1700 ❌ (double-counted!)           │
│                                                     │
│ Result: Stock increased 200 instead of 100 ❌      │
└─────────────────────────────────────────────────────┘
```

### AFTER (Correct)
```
Timeline:
┌─────────────────────────────────────────────────────┐
│ Create Entrée 100 units                             │
│ ↓                                                   │
│ Stock: 2500 (unchanged) ✓                          │
│ Zone A: 1500 (unchanged) ✓                         │
│ Status: En Attente ✓                               │
│ ↓                                                   │
│ User approves QC                                    │
│ ↓                                                   │
│ Stock: 2500 → 2600 ✓ (correct!)                    │
│ Zone A: 1500 → 1600 ✓ (correct!)                   │
│                                                     │
│ Result: Stock increased 100 as expected ✓          │
└─────────────────────────────────────────────────────┘
```

## Issue 3: Isolated Approval

### BEFORE (Wrong)
```
Setup: 3 Entrée movements for same article
┌─────────────────────────────────────────────────────┐
│ Movement 1: 100 units to Zone A                     │
│ Movement 2: 50 units to Zone B                      │
│ Movement 3: 75 units to Zone A                      │
└─────────────────────────────────────────────────────┘

User approves Movement 1:
┌─────────────────────────────────────────────────────┐
│ ❌ All 3 movements approved!                        │
│ ❌ Stock: 2500 → 2725 (all 3 added!)               │
│ ❌ Zone A: 1500 → 1675 (all 175 added!)            │
│ ❌ Zone B: 1000 → 1050 (50 added!)                 │
│                                                     │
│ Result: Wrong rows updated, wrong amounts ❌       │
└─────────────────────────────────────────────────────┘
```

### AFTER (Correct)
```
Setup: 3 Entrée movements for same article
┌─────────────────────────────────────────────────────┐
│ Movement 1 (ID: 1, UUID: xxx): 100 units to Zone A │
│ Movement 2 (ID: 2, UUID: yyy): 50 units to Zone B  │
│ Movement 3 (ID: 3, UUID: zzz): 75 units to Zone A  │
└─────────────────────────────────────────────────────┘

User approves Movement 1 (ID: 1):
┌─────────────────────────────────────────────────────┐
│ ✓ Only Movement 1 approved                          │
│ ✓ Stock: 2500 → 2600 (only +100)                   │
│ ✓ Zone A: 1500 → 1600 (only +100)                  │
│ ✓ Zone B: 1000 (unchanged)                         │
│ ✓ UUID logged: xxx                                 │
└─────────────────────────────────────────────────────┘

User approves Movement 2 (ID: 2):
┌─────────────────────────────────────────────────────┐
│ ✓ Only Movement 2 approved                          │
│ ✓ Stock: 2600 → 2650 (only +50)                    │
│ ✓ Zone A: 1600 (unchanged)                         │
│ ✓ Zone B: 1000 → 1050 (only +50)                   │
│ ✓ UUID logged: yyy                                 │
└─────────────────────────────────────────────────────┘

User approves Movement 3 (ID: 3):
┌─────────────────────────────────────────────────────┐
│ ✓ Only Movement 3 approved                          │
│ ✓ Stock: 2650 → 2725 (only +75)                    │
│ ✓ Zone A: 1600 → 1675 (only +75)                   │
│ ✓ Zone B: 1050 (unchanged)                         │
│ ✓ UUID logged: zzz                                 │
└─────────────────────────────────────────────────────┘

Final State:
┌─────────────────────────────────────────────────────┐
│ Stock: 2725 = 1675 + 1050 ✓                        │
│ No double-counting ✓                               │
│ No interference ✓                                  │
│ Complete audit trail ✓                             │
└─────────────────────────────────────────────────────┘
```

## State Diagram

### BEFORE (Broken)
```
Create Entrée
    ↓
Stock Updated ❌
    ↓
Status: En Attente
    ↓
PDF Available ❌
    ↓
User Approves
    ↓
Stock Updated Again ❌ (double-counted)
    ↓
Status: Terminé
    ↓
PDF Available ✓
```

### AFTER (Correct)
```
Create Entrée
    ↓
Stock NOT Updated ✓
    ↓
Status: En Attente ✓
    ↓
PDF Hidden ✓
    ↓
User Approves
    ↓
Stock Updated ONCE ✓
    ↓
Status: Terminé ✓
    ↓
PDF Visible ✓
```

## Data Flow Comparison

### BEFORE (Broken)
```
Movement 1 (100 units)
├─ Create
│  ├─ Stock: 2500 → 2600 ❌
│  └─ Zone A: 1500 → 1600 ❌
├─ Approve
│  ├─ Stock: 2600 → 2700 ❌ (double!)
│  └─ Zone A: 1600 → 1700 ❌ (double!)
└─ Result: +200 instead of +100 ❌

Movement 2 (50 units)
├─ Create
│  ├─ Stock: 2700 → 2750 ❌
│  └─ Zone B: 1000 → 1050 ❌
├─ Approve
│  ├─ Stock: 2750 → 2800 ❌ (double!)
│  └─ Zone B: 1050 → 1100 ❌ (double!)
└─ Result: +100 instead of +50 ❌
```

### AFTER (Correct)
```
Movement 1 (100 units, ID: 1, UUID: xxx)
├─ Create
│  ├─ Stock: 2500 (unchanged) ✓
│  └─ Zone A: 1500 (unchanged) ✓
├─ Approve (ID: 1)
│  ├─ Stock: 2500 → 2600 ✓
│  ├─ Zone A: 1500 → 1600 ✓
│  └─ UUID logged: xxx ✓
└─ Result: +100 as expected ✓

Movement 2 (50 units, ID: 2, UUID: yyy)
├─ Create
│  ├─ Stock: 2500 (unchanged) ✓
│  └─ Zone B: 1000 (unchanged) ✓
├─ Approve (ID: 2)
│  ├─ Stock: 2600 → 2650 ✓
│  ├─ Zone B: 1000 → 1050 ✓
│  └─ UUID logged: yyy ✓
└─ Result: +50 as expected ✓
```

## Icon Visibility Timeline

### BEFORE (Wrong)
```
Time    Status          PDF Icon    QC Icon
────────────────────────────────────────────
T0      En Attente      Visible ❌  Visible
T1      Terminé         Visible ✓   Visible
```

### AFTER (Correct)
```
Time    Status          PDF Icon    QC Icon
────────────────────────────────────────────
T0      En Attente      Hidden ✓    Visible ✓
T1      Terminé         Visible ✓   Hidden ✓
```

## Stock Calculation Verification

### BEFORE (Wrong)
```
Initial: Stock 2500, Zone A 1500, Zone B 1000

Create Entrée 1 (100 to Zone A):
  Stock: 2500 + 100 = 2600 ❌
  Zone A: 1500 + 100 = 1600 ❌

Create Entrée 2 (50 to Zone B):
  Stock: 2600 + 50 = 2650 ❌
  Zone B: 1000 + 50 = 1050 ❌

Approve Entrée 1:
  Stock: 2650 + 100 = 2750 ❌ (double!)
  Zone A: 1600 + 100 = 1700 ❌ (double!)

Approve Entrée 2:
  Stock: 2750 + 50 = 2800 ❌ (double!)
  Zone B: 1050 + 50 = 1100 ❌ (double!)

Final: Stock 2800 ≠ 1700 + 1100 = 2800 ❌
```

### AFTER (Correct)
```
Initial: Stock 2500, Zone A 1500, Zone B 1000

Create Entrée 1 (100 to Zone A):
  Stock: 2500 (unchanged) ✓
  Zone A: 1500 (unchanged) ✓

Create Entrée 2 (50 to Zone B):
  Stock: 2500 (unchanged) ✓
  Zone B: 1000 (unchanged) ✓

Approve Entrée 1:
  Stock: 2500 + 100 = 2600 ✓
  Zone A: 1500 + 100 = 1600 ✓

Approve Entrée 2:
  Stock: 2600 + 50 = 2650 ✓
  Zone B: 1000 + 50 = 1050 ✓

Final: Stock 2650 = 1600 + 1050 ✓
```

## Summary

| Aspect | BEFORE | AFTER |
|--------|--------|-------|
| **Icon on Creation** | PDF visible ❌ | PDF hidden ✓ |
| **Stock on Creation** | Updated ❌ | Not updated ✓ |
| **Stock on Approval** | Updated again ❌ | Updated once ✓ |
| **Multiple Movements** | Interfere ❌ | Independent ✓ |
| **Zone Updates** | Wrong zones ❌ | Correct zones ✓ |
| **Stock Accuracy** | Doubled ❌ | Correct ✓ |
| **Audit Trail** | Missing ❌ | Complete ✓ |

## Result

✓ Icon logic fixed
✓ Stock update blocked on creation
✓ Isolated QC approval working
✓ No double-counting
✓ No interference between movements
✓ Complete data integrity
