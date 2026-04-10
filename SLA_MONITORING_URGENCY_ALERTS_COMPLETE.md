# SLA Monitoring: Urgency Alerts for Delayed Movements - COMPLETE

## Overview
Implemented comprehensive SLA monitoring system to identify bottlenecks in the quality control process. The system tracks movements delayed in "En attente" status for more than 24 hours and displays visual urgency indicators in the UI and PDF reports.

## Implementation Details

### 1. Delay Detection Logic
**File: `src/components/MovementTable.tsx`**

New functions:
- `isMovementDelayed(mouvement)` - Checks if a movement has been "En attente" for > 24 hours
- `getDelayDuration(mouvement)` - Calculates human-readable delay duration

**Logic:**
```typescript
const isMovementDelayed = (mouvement: Mouvement): boolean => {
  if (mouvement.statut !== "En attente") return false;
  
  const movementDate = new Date(mouvement.date);
  const currentDate = new Date();
  const hoursDifference = (currentDate.getTime() - movementDate.getTime()) / (1000 * 60 * 60);
  
  return hoursDifference > 24;
};
```

**Delay Duration Calculation:**
- Less than 1 hour: "X minute(s)"
- 1-24 hours: "X heure(s)"
- More than 24 hours: "X jour(s)"

### 2. Visual Urgency Indicator (UI)
**File: `src/components/MovementTable.tsx`**

#### Status Badge Enhancement
Updated `getStatusBadge()` function to include urgency alert:

**For movements with status "En attente":**
- **If NOT delayed (< 24 hours):**
  - Standard yellow badge: "⏱️ En attente"
  - No alert icon
  - Normal appearance

- **If delayed (> 24 hours):**
  - Yellow badge: "⏱️ En attente"
  - Red pulsing clock icon: "⏳"
  - Hover tooltip: "Attention: En attente depuis X jour(s)"
  - Pulse animation draws manager's attention

#### Visual Elements
- **Icon:** Red hourglass emoji (⏳) with pulse animation
- **Color:** Red (#EF4444) for high visibility
- **Animation:** CSS pulse effect for attention-grabbing
- **Tooltip:** Displays exact delay duration on hover

#### Tooltip Format
```
Attention: En attente depuis [duration]
Examples:
- "Attention: En attente depuis 1 jour"
- "Attention: En attente depuis 2 jours"
- "Attention: En attente depuis 25 heures"
```

### 3. Data Persistence
**File: `src/contexts/DataContext.tsx`**

#### Mouvement Interface Update
Added new field:
```typescript
wasDelayed?: boolean;  // SLA tracking: was this movement delayed (> 24h in "En attente")?
```

#### Delay Tracking in approveQualityControl()
When a movement is approved:
1. Calculate if it was delayed (> 24 hours in "En attente" status)
2. Store `wasDelayed` flag in the movement record
3. Persists for PDF generation and historical tracking

**Calculation:**
```typescript
const calculateWasDelayed = (): boolean => {
  const movementDate = new Date(mouvement.date);
  const currentDate = new Date();
  const hoursDifference = (currentDate.getTime() - movementDate.getTime()) / (1000 * 60 * 60);
  return hoursDifference > 24;
};
```

### 4. PDF Integration
**File: `src/lib/pdf-generator.ts`**

#### "Traitement: Retardé" Note
Added to the PDF header section for inbound receipts (Bon d'Entree):

**Location:** In "DETAILS DE LA RECEPTION" section, after "Date de Reception"

**Display:**
- **Text:** "Traitement: Retarde"
- **Color:** Red (#DC2626) for visibility
- **Font:** Bold Helvetica
- **Condition:** Only shown if `movement.wasDelayed === true`

**Example PDF Output:**
```
DETAILS DE LA RECEPTION
Article: Gants Nitrile M (GN-M-001)
Date de Reception: 2026-03-02 14:32:20
Traitement: Retarde
Numero de Lot: LOT-2026-03-001
...
```

#### Professional Context
- Managers can quickly identify which receptions took too long to process
- Provides audit trail for SLA compliance
- Helps identify bottlenecks in QC workflow
- Professional documentation of delays

### 5. Movement Table Display
**File: `src/components/MovementTable.tsx`**

#### Compact View (Dashboard)
- Shows standard "En attente" badge
- No urgency indicator in compact mode (space constraints)
- Full urgency display available in full table view

#### Full Table View (Movements Page)
- Shows "En attente" badge with urgency indicator if delayed
- Red pulsing clock icon (⏳) for delayed movements
- Hover tooltip with exact delay duration
- Professional, non-intrusive design

#### Status Badge Styling
```jsx
<div className="relative group inline-flex items-center gap-1">
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-800">
    <Clock className="w-3 h-3" />
    En attente
  </span>
  {isDelayed && (
    <>
      <span className="text-red-500 font-bold text-lg animate-pulse">⏳</span>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-900 text-red-50 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        Attention: En attente depuis {delayDuration}
      </div>
    </>
  )}
</div>
```

## User Experience Flow

### For Managers (Real-time Monitoring)
1. Open Movements page
2. Scan the table for red pulsing clock icons (⏳)
3. Hover over icon to see exact delay duration
4. Identify bottlenecks in QC process
5. Take action to expedite delayed movements

### For PDF Reports
1. Generate PDF for a completed movement
2. If movement was delayed, see "Traitement: Retarde" in red
3. Provides historical record of processing delays
4. Helps with SLA compliance documentation

## Technical Implementation

### Delay Calculation
- **Threshold:** 24 hours (86,400,000 milliseconds)
- **Precision:** Millisecond-level accuracy
- **Timezone:** Uses browser's local timezone
- **Error Handling:** Gracefully handles invalid dates

### Performance Considerations
- Delay calculation runs only when rendering status badge
- No continuous polling or background processes
- Efficient date comparison using milliseconds
- Minimal performance impact

### Browser Compatibility
- Works with all modern browsers
- Uses standard JavaScript Date API
- CSS animations supported in all modern browsers
- Graceful degradation for older browsers (no animation)

## Files Modified
1. `src/components/MovementTable.tsx` - Added delay detection and visual indicators
2. `src/contexts/DataContext.tsx` - Added wasDelayed tracking and calculation
3. `src/lib/pdf-generator.ts` - Added "Traitement: Retardé" note to PDF

## SLA Monitoring Benefits

### For Operations
- Identify QC bottlenecks
- Optimize workflow efficiency
- Reduce goods-in-transit time
- Improve inventory turnover

### For Management
- Data-driven performance metrics
- SLA compliance tracking
- Historical delay records
- Process improvement insights

### For Compliance
- Audit trail of processing times
- Professional documentation
- Regulatory compliance proof
- Quality assurance records

## Testing Checklist
- [ ] Movements < 24 hours show standard "En attente" badge
- [ ] Movements > 24 hours show red pulsing clock icon
- [ ] Tooltip displays correct delay duration
- [ ] Tooltip shows on hover and disappears on mouse leave
- [ ] PDF shows "Traitement: Retarde" for delayed movements
- [ ] PDF does NOT show note for non-delayed movements
- [ ] Delay calculation is accurate
- [ ] Works across different timezones
- [ ] Animation is smooth and not distracting
- [ ] Mobile view handles urgency indicator properly
- [ ] Compact dashboard view works correctly
- [ ] Full table view shows all details

## Example Scenarios

### Scenario 1: Quick Processing (< 24 hours)
- Movement created: 2026-03-02 14:32:20
- Approved: 2026-03-02 16:00:00 (1.5 hours later)
- **Display:** Standard yellow "En attente" badge
- **PDF:** No "Traitement: Retarde" note

### Scenario 2: Delayed Processing (> 24 hours)
- Movement created: 2026-03-01 14:32:20
- Approved: 2026-03-03 10:00:00 (39.5 hours later)
- **Display:** Yellow badge + red pulsing ⏳ icon
- **Tooltip:** "Attention: En attente depuis 1 jour"
- **PDF:** Red "Traitement: Retarde" note

### Scenario 3: Very Delayed Processing (> 48 hours)
- Movement created: 2026-02-28 14:32:20
- Approved: 2026-03-02 16:00:00 (50 hours later)
- **Display:** Yellow badge + red pulsing ⏳ icon
- **Tooltip:** "Attention: En attente depuis 2 jours"
- **PDF:** Red "Traitement: Retarde" note

## Future Enhancements
- Configurable SLA threshold (currently 24 hours)
- Email alerts for delayed movements
- SLA dashboard with metrics
- Historical trend analysis
- Automated escalation workflows
- Department-specific SLA targets
