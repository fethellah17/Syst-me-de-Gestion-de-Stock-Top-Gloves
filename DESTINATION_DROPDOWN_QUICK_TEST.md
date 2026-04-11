# DESTINATION DROPDOWN - QUICK TEST GUIDE

## Test Scenario 1: Basic Selection
**Goal:** Verify that clicking a destination option saves the selection

**Steps:**
1. Open "Nouveau Mouvement" form
2. Select "Sortie" movement type
3. Click on Destination field in any row
4. Click "Département Production" from the dropdown
5. **Expected:** Input field shows "Département Production" and dropdown closes

**Verification:**
- ✓ Input field displays selected value
- ✓ Dropdown closes automatically
- ✓ Selection persists when clicking field again

---

## Test Scenario 2: Search & Select
**Goal:** Verify that searching and selecting works correctly

**Steps:**
1. Open "Nouveau Mouvement" form
2. Select "Sortie" movement type
3. Click on Destination field
4. Type "Qua" to search
5. Click "Qualité" from filtered results
6. **Expected:** Input field shows "Qualité"

**Verification:**
- ✓ Dropdown filters as you type
- ✓ Only matching options visible
- ✓ Selection saves correctly

---

## Test Scenario 3: Create New Destination
**Goal:** Verify that creating a new destination works

**Steps:**
1. Open "Nouveau Mouvement" form
2. Select "Sortie" movement type
3. Click on Destination field
4. Type "Client Z" (not in existing list)
5. Click "Ajouter 'Client Z'" option
6. **Expected:** New destination created and selected

**Verification:**
- ✓ "Ajouter" option appears when typing new value
- ✓ New destination is created
- ✓ Input field shows "Client Z"
- ✓ New destination available in future selections

---

## Test Scenario 4: No Clipping or Scrolling
**Goal:** Verify that all destinations are visible without scrolling

**Steps:**
1. Open "Nouveau Mouvement" form
2. Select "Sortie" movement type
3. Click on Destination field
4. **Expected:** All destinations visible at once

**Verification:**
- ✓ No scrollbar appears
- ✓ All options visible without scrolling
- ✓ Dropdown floats above table rows
- ✓ No clipping by parent container

---

## Test Scenario 5: Multiple Rows
**Goal:** Verify that each row's destination is independent

**Steps:**
1. Open "Nouveau Mouvement" form
2. Select "Sortie" movement type
3. Select article in Row 1
4. Click Destination field in Row 1
5. Select "Client A"
6. Click Destination field in Row 2
7. Select "Client B"
8. **Expected:** Row 1 shows "Client A", Row 2 shows "Client B"

**Verification:**
- ✓ Each row maintains its own selection
- ✓ Selections don't interfere with each other
- ✓ Both values saved correctly

---

## Test Scenario 6: Mobile View
**Goal:** Verify that dropdown works on mobile

**Steps:**
1. Open "Nouveau Mouvement" form on mobile
2. Select "Sortie" movement type
3. Click on Destination field in card view
4. Verify dropdown appears and is fully visible
5. Select a destination
6. **Expected:** Selection saves and dropdown closes

**Verification:**
- ✓ Dropdown positioned correctly on mobile
- ✓ All options visible
- ✓ Selection works smoothly
- ✓ No clipping or truncation

---

## Test Scenario 7: Clear Selection
**Goal:** Verify that clearing a selection works

**Steps:**
1. Open "Nouveau Mouvement" form
2. Select "Sortie" movement type
3. Click on Destination field
4. Select "Client A"
5. Click the X button to clear
6. **Expected:** Input field becomes empty

**Verification:**
- ✓ X button appears when value is selected
- ✓ Clicking X clears the selection
- ✓ Input field shows placeholder text

---

## Test Scenario 8: Keyboard Navigation
**Goal:** Verify that keyboard shortcuts work

**Steps:**
1. Open "Nouveau Mouvement" form
2. Select "Sortie" movement type
3. Click on Destination field
4. Type "Qua"
5. Press Enter to create new destination
6. **Expected:** New destination "Qua" is created

**Verification:**
- ✓ Enter key creates new destination
- ✓ Escape key closes dropdown
- ✓ Keyboard navigation works smoothly

---

## Common Issues & Solutions

### Issue: Selection doesn't save
**Solution:** 
- Verify you're clicking on the option button (not just hovering)
- Check that the dropdown closes after clicking
- Verify the parent component's `updateItem()` is being called

### Issue: Dropdown is clipped
**Solution:**
- Verify Portal is rendering at document.body level
- Check z-index is set to 9999
- Verify `maxHeight: "none"` and `overflowY: "visible"`

### Issue: Dropdown doesn't close after selection
**Solution:**
- Verify `setIsOpen(false)` is called in `handleSelect()`
- Check that click-outside detection isn't interfering
- Verify Portal ref is properly attached

### Issue: Multiple selections interfere
**Solution:**
- Verify each row has its own `updateItem()` call
- Check that state is properly isolated per row
- Verify `onChange` callback is correctly mapped

---

## Success Criteria

✓ Clicking an option saves the selection
✓ Input field displays the selected value
✓ Dropdown closes automatically after selection
✓ All destinations visible without scrolling
✓ No clipping by parent container
✓ Each row maintains independent selection
✓ Works on both desktop and mobile
✓ Keyboard shortcuts work correctly
✓ Creating new destinations works
✓ Clearing selections works

---

## Performance Notes

- Portal rendering is efficient
- No continuous re-renders during scroll
- Position calculation only on open/close
- Smooth animations with CSS transitions
- No performance impact on form submission

---

## Browser Compatibility

- ✓ Chrome/Edge (latest)
- ✓ Firefox (latest)
- ✓ Safari (latest)
- ✓ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Status: Ready for Testing

All fixes have been implemented. The Destination dropdown should now:
1. Save selections correctly
2. Display all options without clipping
3. Close automatically after selection
4. Provide smooth user experience
5. Work consistently across all browsers and devices
