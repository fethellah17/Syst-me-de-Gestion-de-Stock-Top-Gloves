# Destinations System - Quick Start Guide

## What's New?

### 1. Destinations Management Page
- **Location**: Sidebar → "Destinations" (below Emplacements)
- **Features**: View, create, edit, delete destinations
- **Access**: `/destinations` route

### 2. On-the-Fly Destination Creation
- **Where**: Sortie movement form (Bulk Movement Modal)
- **How**: Type destination name → Click "+ Ajouter [name]"
- **Result**: Destination is created and selected instantly

### 3. CreatableSelect Component
- **Replaces**: Static dropdown for Sortie destinations
- **Benefits**: 
  - Search functionality
  - Create new destinations without leaving the form
  - Cleaner UI with better UX

## Quick Workflow

### Create a Sortie with New Destination

```
1. Click "Ajouter Mouvement" → Select "Sortie"
2. Fill article, quantity, source location
3. In "Destination" field:
   - Type "Client X"
   - Click "+ Ajouter 'Client X'"
   - Destination is created and selected
4. Complete remaining fields
5. Click "Valider"
```

### Manage Destinations

```
1. Click "Destinations" in sidebar
2. View all destinations in table
3. Search by name
4. Edit: Click pencil icon
5. Delete: Click trash icon (with confirmation)
```

## Key Features

✅ **Duplicate Prevention**: Can't create duplicate destinations
✅ **Instant Creation**: No page reload needed
✅ **Search**: Filter destinations while typing
✅ **Mobile Friendly**: Works on all screen sizes
✅ **Consistent Design**: Matches system UI/UX
✅ **Data Integrity**: Destinations saved to all movements

## Files Changed

| File | Change | Type |
|------|--------|------|
| `src/pages/DestinationsPage.tsx` | NEW | Page |
| `src/components/CreatableSelect.tsx` | NEW | Component |
| `src/components/BulkMovementModal.tsx` | UPDATED | Component |
| `src/pages/MouvementsPage.tsx` | UPDATED | Page |
| `src/components/AppLayout.tsx` | UPDATED | Layout |
| `src/App.tsx` | UPDATED | Router |

## Testing

### Test 1: Create Destination via Page
1. Go to Destinations page
2. Click "Ajouter"
3. Enter "Test Destination"
4. Click "Ajouter"
5. ✅ Should appear in table

### Test 2: Create Destination On-the-Fly
1. Create Sortie movement
2. In Destination field, type "New Client"
3. Click "+ Ajouter 'New Client'"
4. ✅ Should be selected and appear in Destinations page

### Test 3: Duplicate Prevention
1. Try to create same destination twice
2. ✅ Should not allow duplicate

### Test 4: Sortie PDF
1. Create Sortie with new destination
2. Approve QC
3. Download Bon de Sortie PDF
4. ✅ Destination should be printed

## Troubleshooting

**Q: Destination not appearing in dropdown?**
- A: Refresh page or check for duplicates

**Q: Can't create destination on-the-fly?**
- A: Make sure you're in Sortie movement type
- A: Check that destination name is not empty

**Q: Destination not saved in movement?**
- A: Verify movement was submitted successfully
- A: Check browser console for errors

## API Integration

When connecting to backend:

```typescript
// In DataContext.tsx
const addDestination = async (destination: Omit<Destination, "id">) => {
  try {
    const response = await fetch('/api/destinations', {
      method: 'POST',
      body: JSON.stringify(destination)
    });
    const newDestination = await response.json();
    setDestinations([...destinations, newDestination]);
  } catch (error) {
    console.error('Failed to add destination:', error);
  }
};
```

## Performance Notes

- Destinations list is cached in context
- Search is instant (client-side)
- No pagination needed (typically < 50 destinations)
- CreatableSelect is optimized for small datasets

## Next Steps

1. ✅ Test all workflows
2. ✅ Verify PDF generation includes destination
3. ✅ Test on mobile devices
4. ✅ Check QC modal shows correct destination
5. ✅ Verify data persistence across page reloads
