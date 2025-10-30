# Row Reordering with Active Sort Fix - Oct 30, 2024

## Issue
Manual row reordering (drag-and-drop) was not working when a column was sorted. This created a confusing UX where:
- Users would sort a column (e.g., sort ingredients alphabetically)
- Then try to manually reorder rows by dragging
- The drag would appear to work momentarily, but rows would snap back to sorted order
- Manual reordering was effectively blocked by active sorting

## Root Cause
The `getSortedData()` function in DataGrid was always rendering rows in sorted order when `sortConfig` was set. Even after a successful drag-and-drop reorder, the next render would re-apply the sort, overriding the manual order.

## Solution
Automatically clear any active sorting when the user starts dragging a row. This allows manual reordering to take precedence over sorting.

### Implementation Details

**1. Updated `useRowReordering` hook** to accept an optional `onSortReset` callback:

```typescript
export const useRowReordering = (
    data: DataGridRow[],
    onRowReorder?: (rowOrder: string[]) => void,
    onSortReset?: () => void  // ✅ New parameter
) => {
    // ...
    
    const handleDragStart = useCallback((rowId: string) => {
        // Reset any active sorting when user starts dragging
        if (onSortReset) {
            onSortReset();  // ✅ Clear sort before drag
        }
        setDragState((prev) => ({ ...prev, draggedRowId: rowId }));
    }, [onSortReset]);
    
    // ...
}
```

**2. Updated DataGrid** to pass sort reset callback:

```typescript
const {
  dragState: rowDragState,
  handleDragStart: handleRowDragStart,
  handleDragOver: handleRowDragOver,
  handleDragEnd: handleRowDragEnd,
  handleDragLeave: handleRowDragLeave,
} = useRowReordering(data, onRowReorder, () => {
  // Reset sorting when user starts dragging rows
  setSortConfig(null);  // ✅ Clear sortConfig on drag start
});
```

## User Flow

### Before Fix
1. User sorts a column (e.g., "Description" alphabetically)
2. User tries to drag a row to a new position
3. ❌ Row snaps back to sorted position
4. ❌ Manual reordering is impossible

### After Fix
1. User sorts a column (e.g., "Description" alphabetically)
2. User clicks to drag a row
3. ✅ Sort is automatically cleared (column header no longer shows sort arrow)
4. ✅ User can freely reorder rows manually
5. ✅ Manual order is preserved

## Benefits

1. **Intuitive UX**: User intent is clear - manual drag = manual order preferred
2. **No Confirmation Needed**: Automatic sort reset is non-destructive
3. **Easy to Re-sort**: User can simply click the column header again to re-apply sorting
4. **Consistent Behavior**: Drag-and-drop always works, regardless of current state

## Edge Cases Handled

### ✅ Multiple Sorts
If user has sorted multiple times (changing columns), dragging resets the sort completely.

### ✅ Ascending/Descending
Works for both sort directions - any active sort is cleared on drag.

### ✅ Total Rows
Total rows are excluded from reordering and remain at the bottom (unchanged behavior).

### ✅ Formula Rows
Formula rows can be expanded/collapsed and reordered normally.

## Technical Notes

### Why Reset on `handleDragStart`?
- Resetting on drag start (not drag end) provides immediate visual feedback
- User sees the sort arrow disappear as soon as they start dragging
- This clearly communicates that manual ordering is now in effect

### Alternative Approaches Considered

1. **Allow Sorting + Manual Order Simultaneously**
   - ❌ Too complex - would need to track "custom order" vs "sorted order"
   - ❌ Confusing UX - which order takes precedence?

2. **Show Warning Dialog**
   - ❌ Interrupts workflow
   - ❌ Extra click required

3. **Disable Drag When Sorted**
   - ❌ Hidden affordance - user wouldn't know why dragging doesn't work
   - ❌ Poor accessibility

4. **Reset Sort on Drag End**
   - ❌ Confusing - sort would still be visible during drag
   - ✅ Chosen approach is better for immediate feedback

## Testing Instructions

### Test Basic Functionality
1. Add several ingredients to the DataGrid
2. Click any sortable column header (e.g., "Description")
3. ✅ Rows should sort (ascending first, then descending on second click)
4. With sort active, start dragging any row by the drag handle (☰ icon)
5. ✅ As soon as you click to drag, the sort arrow should disappear
6. ✅ Complete the drag - row should stay in new position
7. ✅ Release and verify row order is preserved

### Test Re-sorting After Manual Order
1. After manually reordering (from previous test)
2. Click a column header to sort again
3. ✅ Sorting should work normally
4. ✅ Manual order is overridden by new sort

### Test with Multiple Columns
1. Sort by "Description" (alphabetically)
2. Drag a row to reorder manually
3. ✅ Sort is cleared
4. Now sort by "IFRA Cat" (different column)
5. ✅ Rows sort by the new column
6. Drag a row again
7. ✅ New sort is cleared

### Test Total Rows
1. Ensure table has total rows (Running Total, Target Total, etc.)
2. Sort a formula column
3. Drag a regular ingredient row
4. ✅ Sort clears
5. ✅ Total rows stay at bottom (not draggable)

## Files Modified

1. **`src/components/DataGrid/hooks/useRowReordering.ts`**
   - Added optional `onSortReset` parameter
   - Call `onSortReset()` in `handleDragStart`
   - Updated dependency array for `handleDragStart`

2. **`src/components/DataGrid.tsx`**
   - Pass `() => setSortConfig(null)` as third argument to `useRowReordering`
   - Sort is now automatically cleared when drag starts

## Build Status
✅ TypeScript compilation: Passed  
✅ No new lint errors (only pre-existing `any` type warnings)  
✅ Hot Module Replacement working

## Summary
Manual row reordering now automatically clears any active sorting, allowing users to freely organize their data regardless of the current sort state. This provides a smooth, intuitive experience where user actions have predictable outcomes.
