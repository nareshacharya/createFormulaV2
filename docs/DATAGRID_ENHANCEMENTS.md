# DataGrid Enhancements - October 15, 2024

## Overview
Major enhancements to the DataGrid component including bulk selection, improved toolbar layout, target total functionality, and component refactoring for maintainability.

## New Features

### 1. Bulk Selection & Actions
**Location:** `src/components/DataGrid/`

#### Components
- **BulkActionsToolbar** (`components/BulkActionsToolbar.tsx`)
  - Unified toolbar combining bulk actions and saved views
  - Positioned at top of data grid
  - Shows selection count and action buttons
  - Right-aligned saved views controls

#### Hooks
- **useBulkSelection** (`hooks/useBulkSelection.ts`)
  - Manages row selection state
  - Provides: `selectedRows`, `toggleRowSelection`, `toggleSelectAll`, `clearSelection`
  - Auto-filters total and empty rows
  - Indeterminate state support

#### Features
- Checkbox column (second column after drag handle)
- Select all/none with indeterminate state
- Bulk delete selected rows
- Clear selection button
- Visual feedback for selected rows

#### Usage
```tsx
<DataGrid
  enableBulkSelection={true}
  onBulkDelete={(rowIds) => handleBulkDelete(rowIds)}
  // ... other props
/>
```

### 2. Target Total Row
**Location:** `src/utils/formulaCalculations.ts`

#### Functionality
- **Automatic Creation:** Target Total row appears after Running Total
- **Default Value:** 100.00000 for all formula columns
- **Editable:** User can modify target total in active formula column
- **Persistence:** Preserves existing values across recalculations
- **Normalization:** Normalize button adjusts ingredient percentages to match target

#### Implementation
```typescript
// In calculateTotals()
const updatedTargetTotal = {
  id: "targetTotal",
  description: "Target Total",
  isTotal: true,
  totalType: "target",
  // Defaults to 100.00000 for formula columns
};
```

#### Visual Appearance
- Appears below Running Total row
- Light gray background (same as total rows)
- Editable input field for active formula
- Shows 5 decimal places

### 3. Component Refactoring
**Goal:** Keep all files under 1000 lines

#### Extracted Components

**CellRenderer** (`components/CellRenderer.tsx`)
- Handles all cell rendering logic
- ~470 lines (extracted from DataGrid)
- Props: row, column, editing state, handlers
- Types: description, numbers, formulas, badges, booleans

**BulkActionsToolbar** (`components/BulkActionsToolbar.tsx`)
- ~205 lines
- Combines bulk actions with saved views
- Replaces ViewManager component

**Hooks Structure**
```
DataGrid/
  hooks/
    useBulkSelection.ts     (~70 lines)
    useRowReordering.ts     (~70 lines)
    useSavedViews.ts        (~85 lines)
  components/
    BulkActionsToolbar.tsx  (~205 lines)
    CellRenderer.tsx        (~470 lines)
    DraggableRow.tsx        (~52 lines)
  utils/
    rowOrdering.ts          (~35 lines)
  types.ts                  (~71 lines)
```

### 4. Improved Toolbar Layout

#### Before
```
[Save View button]
[Views dropdown (left side)]

[Data Grid]
```

#### After
```
[Selection count/Bulk actions (left)] [Save View | Views (right)]

[Data Grid]
```

Benefits:
- More intuitive layout
- Bulk actions prominent when rows selected
- Saved views easily accessible on right
- Consistent with common UI patterns

## Column Structure

### Updated Column Order
1. **Drag Handle** (optional, `enableRowReordering`)
   - Icon: ri-draggable
   - Width: 8px padding

2. **Checkbox** (optional, `enableBulkSelection`)
   - Select all checkbox in header
   - Individual checkboxes in rows
   - Width: 10px with 3px padding

3. **Data Columns**
   - Description (fixed)
   - Cost columns
   - Formula columns (draggable)
   - Attribute columns (draggable)

### Removed
- Individual delete button column
- Delete action moved to bulk operations

## Props API

### New Props
```typescript
interface DataGridProps {
  // ... existing props
  onBulkDelete?: (rowIds: string[]) => void;
  enableBulkSelection?: boolean; // default: true
}
```

### Modified Props
- `enableSavedViews` - now integrated into BulkActionsToolbar
- `enableRowReordering` - works alongside bulk selection

## Row Types

### Total Rows
Two types of total rows managed by `totalType` property:

1. **Running Total** (`totalType: "running"`)
   - Calculates sum of ingredient percentages
   - Updates automatically
   - Non-editable (except active formula)
   - Always appears first

2. **Target Total** (`totalType: "target"`)
   - Default: 100.00000 for formula columns
   - Editable in active formula
   - Used by Normalize function
   - Always appears after running total

## Workflow Examples

### Bulk Delete Workflow
```
1. User checks rows to delete
2. Selection count updates in toolbar
3. Click "Delete" button
4. Confirmation (optional)
5. Rows removed, selection cleared
6. Toast notification shown
```

### Normalize to Target Workflow
```
1. User sets target total (e.g., 100.00000)
2. Enters ingredient percentages
3. Running total shows actual sum (e.g., 95.50000)
4. Click "Normalize" in header
5. All percentages adjusted proportionally
6. Running total now matches target
```

### Save/Load View Workflow
```
1. User arranges rows via drag & drop
2. Click "Save View" in toolbar (top right)
3. Enter view name
4. View saved to localStorage
5. To restore: Click "Views" dropdown
6. Select saved view
7. Rows reorder to saved state
```

## File Sizes After Refactoring

### Before
- DataGrid.tsx: 1191 lines
- WorkArea.tsx: 1468 lines

### After Extraction
- DataGrid.tsx: ~650 lines (targeted)
- CellRenderer.tsx: ~470 lines
- BulkActionsToolbar.tsx: ~205 lines
- WorkArea.tsx: ~1300 lines (will extract more)

### Remaining Work
- Extract WorkArea table initialization logic
- Extract WorkArea formula operations
- Extract WorkArea ingredient management
- Target: All files < 1000 lines

## Testing Checklist

### Bulk Selection
- [ ] Select all checkbox works
- [ ] Indeterminate state shows correctly
- [ ] Individual checkboxes toggle
- [ ] Bulk delete removes selected rows
- [ ] Selection persists during sorting
- [ ] Total rows cannot be selected

### Target Total
- [ ] Appears below running total
- [ ] Defaults to 100.00000
- [ ] Editable in active formula
- [ ] Persists through recalculations
- [ ] Normalize adjusts to target
- [ ] Shows 5 decimal places

### Toolbar Layout
- [ ] Bulk actions on left
- [ ] Saved views on right
- [ ] Save dialog works
- [ ] Views list displays
- [ ] Delete view works
- [ ] Responsive layout

### Row Reordering
- [ ] Works with checkboxes present
- [ ] Drag handle separate from checkbox
- [ ] Visual feedback during drag
- [ ] Total rows stay at bottom
- [ ] Reorder persists with views

## Migration Guide

### For Components Using DataGrid

**Old Code:**
```tsx
<DataGrid
  onRowDelete={handleDelete}
  enableSavedViews={true}
/>
```

**New Code:**
```tsx
<DataGrid
  onBulkDelete={handleBulkDelete}  // New prop
  enableBulkSelection={true}        // New prop
  enableSavedViews={true}
/>
```

### Handler Updates

**Old Delete Handler:**
```typescript
const handleDelete = (rowId: string) => {
  setData(prev => prev.filter(row => row.id !== rowId));
};
```

**New Bulk Delete Handler:**
```typescript
const handleBulkDelete = (rowIds: string[]) => {
  setData(prev => prev.filter(row => !rowIds.includes(row.id)));
  toast.success(`${rowIds.length} row(s) deleted`);
};
```

## Performance Considerations

### Bulk Operations
- Uses `Set` for O(1) selection lookup
- Memoized selection state
- Efficient array filtering

### Cell Rendering
- Extracted CellRenderer reduces DataGrid complexity
- Memoization opportunities for expensive renders
- Virtual scrolling candidate for large datasets

### Storage
- localStorage for saved views (5MB limit)
- JSON stringification minimal overhead
- View metadata: ~100 bytes per view

## Future Enhancements

### Potential Features
1. **Bulk Edit** - Modify multiple rows at once
2. **Export Selection** - Export selected rows only
3. **Column Visibility** - Hide/show columns via toolbar
4. **Advanced Filters** - Filter by column values
5. **Keyboard Shortcuts** - Ctrl+A, Delete, etc.
6. **Drag Multiple Rows** - Select and drag multiple rows

### Architecture Improvements
1. **Virtual Scrolling** - Handle 10,000+ rows
2. **Web Workers** - Offload calculations
3. **IndexedDB** - For larger view storage
4. **Undo/Redo** - Action history
5. **Real-time Collaboration** - Multi-user editing

## Troubleshooting

### Issue: Checkboxes not appearing
**Solution:** Ensure `enableBulkSelection={true}` is set

### Issue: Target Total not showing
**Solution:** Check that `calculateTotals()` is called after data changes

### Issue: Normalize not working
**Solution:** Verify Target Total row exists with `totalType: "target"`

### Issue: Selection cleared after sort
**Solution:** This is expected behavior - re-select after sorting

### Issue: Drag handle overlaps checkbox
**Solution:** Columns are ordered correctly - drag handle is first, checkbox second

## Related Files

### Core Files
- `src/components/DataGrid.tsx` - Main component
- `src/components/DataGrid/components/CellRenderer.tsx` - Cell rendering
- `src/components/DataGrid/components/BulkActionsToolbar.tsx` - Toolbar
- `src/components/DataGrid/hooks/useBulkSelection.ts` - Selection logic
- `src/utils/formulaCalculations.ts` - Total calculations

### Integration
- `src/view/WorkArea/WorkArea.tsx` - Primary consumer
- `src/view/WorkArea/hooks/useDataGridHandlers.ts` - Handler logic
- `src/view/WorkArea/hooks/useFormulaOperations.ts` - Normalize logic

## Documentation Updates

This document supersedes:
- `docs/DATAGRID_REFACTORING.md` (partially)
- Previous row reordering docs

Related documentation:
- `docs/README_REFACTORING.md` - Overall architecture
- `docs/QUICK_REFERENCE.md` - Developer quick reference
