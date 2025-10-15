# Quick Reference Guide - DataGrid Refactoring

## 🚀 Quick Start

### For Row Reordering

```typescript
import { applyRowOrder } from '@/components/DataGrid/utils/rowOrdering';

// In your component
const handleRowReorder = (newOrder: string[]) => {
  const reordered = applyRowOrder(tableData, newOrder);
  setTableData(reordered);
};

<DataGrid
  data={tableData}
  columns={columns}
  onRowReorder={handleRowReorder}
/>
```

### For Save View Feature

```typescript
import { useSavedViews } from '@/components/DataGrid/hooks/useSavedViews';
import { getCurrentRowOrder } from '@/components/DataGrid/utils/rowOrdering';

// In your component
const { savedViews, saveView, loadView, deleteView, loadSavedViews } = useSavedViews();

useEffect(() => {
  loadSavedViews(); // Load from localStorage
}, [loadSavedViews]);

const handleSaveView = (viewName: string) => {
  const currentOrder = getCurrentRowOrder(tableData);
  saveView(viewName, currentOrder);
};

const handleLoadView = (viewId: string) => {
  const rowOrder = loadView(viewId);
  if (rowOrder) {
    const reordered = applyRowOrder(tableData, rowOrder);
    setTableData(reordered);
  }
};

<DataGrid
  data={tableData}
  columns={columns}
  savedViews={savedViews}
  onSaveView={handleSaveView}
  onLoadView={handleLoadView}
/>
```

---

## 📦 Imports

```typescript
// Types
import type { DataGridRow, SavedView, Column } from '@/components/DataGrid/types';

// Hooks
import { useRowReordering } from '@/components/DataGrid/hooks/useRowReordering';
import { useSavedViews } from '@/components/DataGrid/hooks/useSavedViews';

// Utils
import {
  applyRowOrder,
  getCurrentRowOrder,
  isRowDraggable
} from '@/components/DataGrid/utils/rowOrdering';

// Components
import { ViewManager } from '@/components/DataGrid/components/ViewManager';
import { DraggableRow } from '@/components/DataGrid/components/DraggableRow';
```

---

## 🎯 Common Use Cases

### 1. Enable Row Reordering Only

```typescript
<DataGrid
  data={tableData}
  columns={columns}
  onRowReorder={(newOrder) => {
    setTableData(applyRowOrder(tableData, newOrder));
  }}
/>
```

### 2. Enable Save View Only

```typescript
const { savedViews, saveView, loadView } = useSavedViews();

<DataGrid
  data={tableData}
  columns={columns}
  savedViews={savedViews}
  onSaveView={(name) => saveView(name, getCurrentRowOrder(tableData))}
  onLoadView={(id) => {
    const order = loadView(id);
    if (order) setTableData(applyRowOrder(tableData, order));
  }}
/>
```

### 3. Both Features Together

```typescript
const { savedViews, saveView, loadView, loadSavedViews } = useSavedViews();

useEffect(() => {
  loadSavedViews();
}, [loadSavedViews]);

<DataGrid
  data={tableData}
  columns={columns}
  onRowReorder={(newOrder) => {
    setTableData(applyRowOrder(tableData, newOrder));
  }}
  savedViews={savedViews}
  onSaveView={(name) => saveView(name, getCurrentRowOrder(tableData))}
  onLoadView={(id) => {
    const order = loadView(id);
    if (order) setTableData(applyRowOrder(tableData, order));
  }}
/>
```

---

## 🔍 Utility Functions Reference

### `applyRowOrder(rows, rowOrder)`
Reorders rows based on provided order array.
- **Input**: `rows: DataGridRow[]`, `rowOrder: string[]`
- **Output**: `DataGridRow[]`
- **Note**: Total rows always stay at the end

### `getCurrentRowOrder(rows)`
Extracts current row order (IDs only).
- **Input**: `rows: DataGridRow[]`
- **Output**: `string[]`
- **Note**: Excludes total rows

### `isRowDraggable(row)`
Checks if a row can be dragged.
- **Input**: `row: DataGridRow`
- **Output**: `boolean`
- **Returns false for**: Total rows, empty rows

---

## 🎨 UI Elements

### Drag Handle
- Icon: `ri-draggable` (⋮⋮)
- Appears on: Draggable rows
- Color: Gray (hover: darker gray)

### Visual Feedback
- **Dragging**: Row opacity 50%
- **Drop Target**: Blue top border (2px)
- **Hover**: Light gray background

### ViewManager Buttons
- **Save View**: Blue button with save icon
- **Views List**: Shows count badge

---

## 📝 Type Definitions

```typescript
interface DataGridRow {
  id: string;
  [key: string]: any;
  isTotal?: boolean;
  totalType?: string;
  isFormula?: boolean;
  isEmpty?: boolean;
}

interface SavedView {
  id: string;
  name: string;
  rowOrder: string[];
  timestamp: number;
}

interface DataGridProps {
  // ... existing props
  onRowReorder?: (rowOrder: string[]) => void;
  savedViews?: SavedView[];
  onSaveView?: (viewName: string) => void;
  onLoadView?: (viewId: string) => void;
}
```

---

## ⚠️ Important Notes

1. **Total Rows**: Always stay at the bottom, cannot be reordered
2. **Empty Rows**: Cannot be dragged
3. **localStorage**: 5MB limit per domain
4. **View IDs**: Auto-generated with timestamp
5. **Persistence**: Views survive page reloads

---

## 🐛 Troubleshooting

### Drag not working?
- Check if `onRowReorder` is provided
- Verify row has `id` field
- Ensure row is not marked as `isTotal` or `isEmpty`

### Views not persisting?
- Check browser localStorage is enabled
- Verify no privacy/incognito mode
- Check for localStorage quota errors in console

### Rows not reordering correctly?
- Ensure `applyRowOrder` is called with correct parameters
- Check that row IDs are unique
- Verify `setTableData` updates state properly

---

## 📚 More Documentation

- **Full Guide**: `docs/README_REFACTORING.md`
- **Detailed API**: `docs/DATAGRID_REFACTORING.md`
- **Summary**: `docs/REFACTORING_SUMMARY.md`
- **Types**: `src/components/DataGrid/types.ts`

---

## ✅ Checklist for Integration

- [ ] Import required hooks and utils
- [ ] Add `onRowReorder` handler
- [ ] Initialize `useSavedViews` hook
- [ ] Load saved views on mount
- [ ] Pass props to DataGrid
- [ ] Test drag and drop
- [ ] Test save/load views
- [ ] Verify localStorage persistence
- [ ] Handle errors gracefully

---

**Last Updated**: October 15, 2025  
**Version**: 2.1.0  
**Branch**: 15oct
