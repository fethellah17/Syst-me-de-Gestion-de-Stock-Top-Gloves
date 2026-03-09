# Unit-Aware Movements - Quick Reference Card

## 🎯 Quick Overview

**What Changed**: Movement forms now support dual-unit input with automatic conversion and validation.

**Key Benefit**: Users can work with any unit (bulk or consumption) while the system maintains accuracy.

## 📋 Form Fields

### New: Unit Dropdown
- **Location**: Next to quantity field
- **Options**: Entry Unit (bulk) + Exit Unit (consumption)
- **Auto-set**: Based on movement type

### Enhanced: Quantity Field
- **Type**: Decimal input (supports 0.001)
- **Validation**: Real-time stock checking
- **Preview**: Live conversion display

## 🔄 Default Units by Movement Type

| Movement Type | Default Unit | Reason |
|--------------|--------------|---------|
| **Entrée** | Entry Unit (Boîte, Tonne) | Receiving bulk shipments |
| **Sortie** | Exit Unit (Paire, Kg) | Consuming from stock |
| **Transfert** | Exit Unit (Paire, Kg) | Moving existing stock |
| **Ajustement** | Exit Unit (Paire, Kg) | Correcting inventory |

## 🧮 Conversion Examples

### Example 1: Gants Nitrile M
- **Entry Unit**: Boîte (Box)
- **Exit Unit**: Paire (Pair)
- **Factor**: 100 (100 pairs per box)

```
Input: 5 Boîtes
Output: 500 Paires
Storage: 500 (always in exit unit)
```

### Example 2: Masques FFP2
- **Entry Unit**: Carton
- **Exit Unit**: Unité
- **Factor**: 1000 (1000 units per carton)

```
Input: 3 Cartons
Output: 3,000 Unités
Storage: 3000 (always in exit unit)
```

### Example 3: Produit Chimique
- **Entry Unit**: Tonne
- **Exit Unit**: Kg
- **Factor**: 1000 (1000 kg per tonne)

```
Input: 2.5 Tonnes
Output: 2,500.000 Kg
Storage: 2500.000 (3 decimals for weight)
```

## ✅ Validation Rules

### Entrée (Entry)
- ✓ No stock validation needed
- ✓ Any quantity accepted
- ✓ Converts to exit unit before adding

### Sortie (Exit)
- ⚠️ Must have sufficient stock
- ⚠️ Validates in exit unit
- ⚠️ Submit disabled if insufficient
- ⚠️ Red alert shows max available

### Transfert
- ⚠️ Same as Sortie
- ⚠️ Source must have enough stock
- ⚠️ Destination can be any location

### Ajustement - Surplus
- ✓ No validation needed
- ✓ Adding to stock

### Ajustement - Manquant
- ⚠️ Same as Sortie
- ⚠️ Cannot remove more than available

## 🎨 Visual Indicators

### Live Preview
```
Équivaut à: 500 Paires [P]
```
- Shows conversion to other unit
- Gray badge with unit symbol
- Updates in real-time

### Stock Alert (Insufficient)
```
⚠️ Stock Insuffisant
Maximum disponible: 1,500 Paires
```
- Red background
- AlertCircle icon
- Shows max available

### Submit Button
- **Enabled**: Blue, clickable
- **Disabled**: Gray, not clickable (when stock insufficient)

## 🔢 Rounding Rules

| Unit Type | Rounding | Example |
|-----------|----------|---------|
| Pièce, Boîte, Unité, Paire, Carton | Integer | 49.7 → 50 |
| Kg, g, Litre, ml, Tonne | 3 decimals | 49.7 → 49.700 |

## 💡 Pro Tips

### Tip 1: Quick Unit Switch
Click the unit dropdown to switch between bulk and consumption units anytime.

### Tip 2: Watch the Preview
The live preview shows exactly what will be stored in the database.

### Tip 3: Stock Validation
The system checks stock in real-time. If you see a red alert, reduce the quantity.

### Tip 4: Decimal Input
For weight/volume units, you can enter decimals (e.g., 2.5 Tonnes).

### Tip 5: Success Message
After submit, the success message shows both your input and the calculated value.

## 🚨 Common Errors

### Error 1: Stock Insuffisant
**Cause**: Trying to remove more than available
**Solution**: Reduce quantity or select different source location

### Error 2: Submit Disabled
**Cause**: Stock validation failed
**Solution**: Check the red alert for max available quantity

### Error 3: No Unit Dropdown
**Cause**: No article selected
**Solution**: Select an article first

## 📊 Success Messages

### Entrée
```
✓ Entrée de 5 Boîtes (500 Paires) en Zone A-12
```

### Sortie
```
Sortie créée. En attente de validation Qualité.
```

### Transfert
```
✓ Transfert effectué avec succès.
```

### Ajustement
```
✓ Ajustement d'inventaire (Surplus) effectué.
```

## 🎓 Training Scenarios

### Scenario 1: Receiving Shipment
1. Select article
2. Select "Entrée"
3. Unit = "Boîte" (auto-set)
4. Enter quantity in boxes
5. See preview in pairs
6. Submit

### Scenario 2: Production Use
1. Select article
2. Select "Sortie"
3. Unit = "Paire" (auto-set)
4. Select source location
5. Enter quantity needed
6. Check stock validation
7. Submit if sufficient

### Scenario 3: Warehouse Move
1. Select article
2. Select "Transfert"
3. Unit = "Paire" (auto-set)
4. Can switch to "Boîte" if preferred
5. Select source and destination
6. Enter quantity
7. Submit

## 🔍 Troubleshooting

### Q: Why is submit disabled?
**A**: Stock insufficient. Check the red alert for max available.

### Q: Why don't I see the unit dropdown?
**A**: Select an article first.

### Q: Can I enter decimals?
**A**: Yes, for weight/volume units (Kg, Litre, etc.)

### Q: What unit is stored in the database?
**A**: Always the exit unit (smallest unit).

### Q: Can I change the unit after entering quantity?
**A**: Yes, the quantity stays the same, but the conversion updates.

## 📱 Mobile Usage

- Touch-friendly dropdowns
- Larger tap targets
- Responsive layout
- Same functionality as desktop

## ⌨️ Keyboard Shortcuts

- **Tab**: Navigate between fields
- **Enter**: Submit form (if valid)
- **Esc**: Close modal
- **Arrow keys**: Navigate dropdowns

## 🎯 Best Practices

1. **Always check the preview** before submitting
2. **Use bulk units for entries** (Boîte, Carton, Tonne)
3. **Use consumption units for exits** (Paire, Unité, Kg)
4. **Watch for red alerts** indicating insufficient stock
5. **Verify success message** shows correct values

## 📞 Support

If you encounter issues:
1. Check this quick reference
2. Verify article has correct units configured
3. Check stock availability in source location
4. Contact system administrator

---

**Version**: 1.0.0
**Last Updated**: March 9, 2026
