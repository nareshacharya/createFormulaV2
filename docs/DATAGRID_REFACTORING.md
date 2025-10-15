# DataGrid Refactoring & Enhancement

## Date: October 15, 2025

## Overview
Comprehensive refactoring of the DataGrid component to improve maintainability and add new features for row reordering and saved views.

---

## 🎯 Key Changes

### 1. **Component Refactoring** ✅
- Split DataGrid.tsx into smaller, focused modules
- Created dedicated directories for hooks, components, utils, and types
- Reduced main component complexity

### 2. **Row Reordering Feature** ✨ NEW
- Drag and drop interface for manual row reordering
- Visual feedback during drag operations
- Preserves total rows at the bottom
- Only non-total rows are reorderable

### 3. **Save View Feature** ✨ NEW
- Save custom row orders as named views
- Load previously saved views
- Delete unwanted views
- Persistent storage using localStorage
- Visual indicator for currently active view

---

## 📁 New File Structure

```
src/components/DataGrid/
├── types.ts                          # TypeScript type definitions
├── hooks/
│   ├── useRowReordering.ts          # Row drag & drop logic
│   └── useSavedViews.ts             # View management logic
├── components/
│   ├── DraggableRow.tsx             # Draggable row wrapper
│   └── ViewManager.tsx              # UI for saving/loading views
└── utils/
    └── rowOrdering.ts               # Row ordering utilities
```

---

## 🔧 API Changes

### DataGrid Props

#### New Props:
```typescript
interface DataGridProps {
  // ... existing props ...
  
  // Row reordering
  onRowReorder?: (rowOrder: string[]) => void;
  
  // Saved views
  savedViews?: SavedView[];
  onSaveView?: (viewName: string) => void;
  onLoadView?: (viewId: string) => void;
}
```

#### Types:
```typescript
interface SavedView {
  id: string;
  name: string;
  rowOrder: string[];
  timestamp: number;
}

interface DragState {
  draggedRowId: string | null;
  dragOverRowId: string | null;
}
```

---

## 💡 Usage Examples

### Basic Row Reordering

```typescript
const MyComponent = () => {
  const [tableData, setTableData] = useState<DataGridRow[]>([...]);
  
  const handleRowReorder = (rowOrder: string[]) => {
    // Reorder the data based on new order
    const reorderedData = applyRowOrder(tableData, rowOrder);
    setTableData(reorderedData);
  };

  return (
    <DataGrid
      data={tableData}
      columns={columns}
      onRowReorder={handleRowReorder}
    />
  );
};
```

### With Saved Views

```typescript
const MyComponent = () => {
  const {
    savedViews,
    currentViewId,
    saveView,
    loadView,
    deleteView,
    loadSavedViews,
  } = useSavedViews();

  useEffect(() => {
    loadSavedViews();
  }, []);

  const handleSaveView = (viewName: string) => {
    const currentOrder = getCurrentRowOrder(tableData);
    saveView(viewName, currentOrder);
  };

  const handleLoadView = (viewId: string) => {
    const rowOrder = loadView(viewId);
    if (rowOrder) {
      const reorderedData = applyRowOrder(tableData, rowOrder);
      setTableData(reorderedData);
    }
  };

  return (
    <DataGrid
      data={tableData}
      columns={columns}
      onRowReorder={handleRowReorder}
      savedViews={savedViews}
      onSaveView={handleSaveView}
      onLoadView={handleLoadView}
    />
  );
};
```

---

## 🎨 User Interface

### Row Reordering
1. **Drag Handle**: Each draggable row shows a drag handle icon (⋮⋮)
2. **Visual Feedback**: 
   - Dragged row becomes semi-transparent (50% opacity)
   - Drop target shows blue top border
   - Cursor changes to move cursor on draggable rows
3. **Hover Effect**: Rows highlight on hover for better UX

### View Manager
1. **Save View Button**: Top toolbar button with save icon
2. **Views List Button**: Shows count of saved views
3. **Save Dialog**: Simple modal with text input for view name
4. **Views List**: 
   - Shows all saved views with timestamps
   - Current view highlighted in blue
   - Load and Delete actions per view
   - Confirmation dialog before deletion

---

## 🔒 Constraints & Rules

### Row Reordering Rules:
- ✅ Only non-total rows can be dragged
- ✅ Total rows always stay at the bottom
- ✅ Empty state rows cannot be reordered
- ✅ Formula group rows can be reordered
- ✅ Individual ingredient rows can be reordered

### View Management:
- ✅ Views are persisted in localStorage
- ✅ View names must be unique
- ✅ Maximum 50 views per workspace (recommended)
- ✅ Views include only row IDs, not full row data
- ✅ Views are workspace-specific

---

## 🛠️ Utility Functions

### `applyRowOrder(rows, rowOrder)`
Reorders rows based on provided order array.

**Parameters:**
- `rows`: Array of DataGridRow objects
- `rowOrder`: Array of row IDs in desired order

**Returns:** Reordered array with totals at the end

### `getCurrentRowOrder(rows)`
Extracts current row order (IDs only) from data.

**Parameters:**
- `rows`: Array of DataGridRow objects

**Returns:** Array of row IDs

### `isRowDraggable(row)`
Determines if a row can be dragged.

**Parameters:**
- `row`: DataGridRow object

**Returns:** Boolean

---

## 🐛 Known Limitations

1. **Local Storage**: Views stored in localStorage (5MB limit)
2. **Browser-Specific**: Views don't sync across browsers/devices
3. **No Undo**: Row reordering doesn't have undo functionality (yet)
4. **Performance**: Large datasets (>1000 rows) may have drag lag

---

## 🚀 Future Enhancements

- [ ] Undo/Redo for row reordering
- [ ] Keyboard shortcuts for reordering (Alt+Up/Down)
- [ ] Multi-select row dragging
- [ ] Cloud sync for views
- [ ] Export/Import views
- [ ] Column reordering in same drag system
- [ ] Touch device support for mobile
- [ ] View templates/presets

---

## 📊 Performance Considerations

- Row reordering uses `memo` for performance
- Drag operations debounced to prevent jank
- View loading optimized with Map lookups
- localStorage operations wrapped in try-catch

---

## 🧪 Testing Recommendations

### Manual Testing:
1. Drag rows to different positions
2. Save current order as view
3. Reorder rows again
4. Load saved view (should restore order)
5. Delete views
6. Test with >100 rows
7. Test drag at top and bottom of list
8. Test with total rows present

### Unit Tests Needed:
- `applyRowOrder()` with various inputs
- `getCurrentRowOrder()` with totals
- `isRowDraggable()` with different row types
- View save/load/delete operations

---

## 📝 Migration Guide

### For Existing Code:

No breaking changes! The new features are opt-in:

```typescript
// Before (still works)
<DataGrid data={data} columns={columns} />

// After (with new features)
<DataGrid
  data={data}
  columns={columns}
  onRowReorder={handleReorder}  // Optional
  onSaveView={handleSave}        // Optional
  onLoadView={handleLoad}        // Optional
/>
```

---

## ✅ Checklist for Integration

- [ ] Update DataGrid imports
- [ ] Add row reorder handler
- [ ] Implement view management hooks
- [ ] Test drag and drop functionality
- [ ] Test view save/load persistence
- [ ] Update parent component state management
- [ ] Add loading states for view operations
- [ ] Add error handling for localStorage failures
- [ ] Update user documentation
- [ ] Add feature to release notes

---

## 👥 Credits

**Author**: Naresh Acharya  
**Date**: October 15, 2025  
**Version**: 2.0.0  
**Status**: ✅ Complete
