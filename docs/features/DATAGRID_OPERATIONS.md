# DataGrid Operations Feature

## Overview

The DataGrid is the central component for formula composition management, providing advanced table operations including inline editing, row reordering, bulk selection, column management, keyboard navigation, and real-time calculations.

## User Stories

### US-040: Edit Cell Values Inline

**As a** perfumer  
**I want to** edit ingredient percentages directly in the table  
**So that** I can quickly adjust my formula composition

**Acceptance Criteria:**

- Click cell to enter edit mode
- Input shows current value pre-selected
- Type new value
- Press Enter or click outside to save
- Press Escape to cancel
- Invalid values rejected with error message
- Contribution cost updates automatically
- Formula totals recalculate
- Action saved to undo history

---

### US-041: Reorder Rows by Dragging

**As a** perfumer  
**I want to** drag and drop rows to reorder ingredients  
**So that** I can organize my formula logically

**Acceptance Criteria:**

- Drag handle visible on each row
- Click and hold drag handle to start drag
- Row follows cursor during drag
- Drop zones highlighted
- Release to drop at new position
- Row order persists
- Sorting cleared when manual reordering starts
- Action saved to undo history

---

### US-042: Select Multiple Rows

**As a** perfumer  
**I want to** select multiple rows at once  
**So that** I can perform bulk operations

**Acceptance Criteria:**

- Checkbox on each row for selection
- "Select All" checkbox in header
- Click checkbox to toggle selection
- Shift+Click to select range
- Cmd/Ctrl+Click to select individual rows
- Selected row count displayed
- Bulk actions toolbar appears when rows selected
- Clear selection button available

---

### US-043: Bulk Delete Rows

**As a** perfumer  
**I want to** delete multiple ingredients at once  
**So that** I can quickly remove unwanted items

**Acceptance Criteria:**

- Select multiple rows
- Bulk toolbar shows "Delete X rows" button
- Click delete shows confirmation dialog
- Confirm deletes all selected rows
- Formula totals recalculate
- Success notification with count
- Action saved to undo history

---

### US-044: Add/Remove Columns

**As a** perfumer  
**I want to** show or hide attribute columns  
**So that** I can customize my view

**Acceptance Criteria:**

- "+ Attribute" column always visible
- Click "+ Attribute" opens attribute selector
- Select attribute adds new column
- Column menu has "Delete Column" option
- Confirm deletion removes column
- Column order adjustable via drag-and-drop
- Column widths adjustable by dragging edge
- Column configuration persists during session

---

### US-045: Sort by Column

**As a** perfumer  
**I want to** sort ingredients by any column  
**So that** I can analyze data in different orders

**Acceptance Criteria:**

- Click column header to sort ascending
- Click again to sort descending
- Click third time to clear sort
- Sort indicator (arrow) shown in header
- Numeric columns sort numerically
- Text columns sort alphabetically
- Date columns sort chronologically
- Only one column sorted at a time
- Manual row reordering clears sort

---

### US-046: Filter Column Values

**As a** perfumer  
**I want to** filter rows by column values  
**So that** I can focus on specific ingredients

**Acceptance Criteria:**

- Filter icon in column header
- Click opens filter dropdown
- Text columns: contains/equals/starts with
- Number columns: equals/greater/less/between
- Multiple filters combine with AND
- Active filter indicated in header
- Clear filter option available
- Filtered row count displayed

---

### US-047: Group Rows by Attribute

**As a** perfumer  
**I want to** group ingredients by common attributes  
**So that** I can see formulas organized by categories

**Acceptance Criteria:**

- Column menu has "Group By" option
- Groups created by unique column values
- Group headers show: value, count, subtotal
- Expand/collapse group functionality
- Groups calculated independently
- Only one grouping active at a time
- Clear grouping option available

---

### US-048: View Running Total

**As a** perfumer  
**I want to** see formula totals in real-time  
**So that** I can track my progress toward 100%

**Acceptance Criteria:**

- Total row always visible at bottom
- Running total sums all ingredient percentages
- Target total row shows 100.00000
- RMC (Raw Material Cost) row calculated
- Number of lines row counts non-zero ingredients
- Totals update immediately on value change
- Color-coded: green (=100%), orange (≠100%)

---

### US-049: Keyboard Navigation

**As a** perfumer  
**I want to** navigate the grid using keyboard  
**So that** I can work efficiently without mouse

**Acceptance Criteria:**

- Tab moves to next editable cell
- Shift+Tab moves to previous cell
- Arrow keys navigate between cells
- Enter enters edit mode
- Escape exits edit mode without saving
- Home/End jump to first/last column
- PageUp/PageDown scroll large amounts
- Current cell highlighted with focus ring

---

### US-050: Copy/Paste Values

**As a** perfumer  
**I want to** copy values between cells  
**So that** I can quickly duplicate values

**Acceptance Criteria:**

- Cmd/Ctrl+C copies selected cell(s)
- Cmd/Ctrl+V pastes into selected cell(s)
- Paste validates data types
- Invalid paste shows error
- Paste into multiple cells supported
- Copy from Excel/Google Sheets supported

---

### US-051: Export Grid Data

**As a** perfumer  
**I want to** export the grid to Excel or CSV  
**So that** I can use data in other tools

**Acceptance Criteria:**

- Export button in toolbar
- Export formats: Excel (.xlsx), CSV
- Exported file includes: all visible columns, current filters/sorts
- Totals included in export
- Filename auto-generated with timestamp
- Download starts immediately

---

### US-052: Resize Columns

**As a** perfumer  
**I want to** adjust column widths  
**So that** I can see all content clearly

**Acceptance Criteria:**

- Hover column border shows resize cursor
- Drag border to resize
- Double-click border auto-fits content
- Minimum width enforced (80px)
- Maximum width enforced (500px)
- Width persists during session

---

## Technical Implementation

### File Structure

| File Path | Responsibility | Lines |
|-----------|---------------|-------|
| `src/components/DataGrid.tsx` | Main grid component | 779 |
| `src/components/DataGrid/components/CellRenderer.tsx` | Cell rendering logic | 470 |
| `src/components/DataGrid/components/EditableCell.tsx` | Editable cell component | ~150 |
| `src/components/DataGrid/components/BulkActionsToolbar.tsx` | Bulk operations UI | 205 |
| `src/components/DataGrid/components/headers/TableHeader.tsx` | Column headers | ~200 |
| `src/components/DataGrid/hooks/useRowReordering.ts` | Drag & drop logic | ~100 |
| `src/components/DataGrid/hooks/useBulkSelection.ts` | Multi-select logic | ~80 |
| `src/components/DataGrid/hooks/useKeyboardNavigation.ts` | Keyboard controls | ~120 |
| `src/components/DataGrid/hooks/useSavedViews.ts` | View persistence | ~100 |
| `src/components/DataGrid/utils/rowOrdering.ts` | Row ordering utilities | ~50 |
| `src/view/WorkArea/hooks/useDataGridHandlers.ts` | Event handlers | ~150 |

### Data Models

```typescript
// Column Definition
interface Column {
  id: string;                      // Unique identifier
  key: string;                     // Data property key
  title: string;                   // Display title
  type: 'text' | 'number' | 'boolean' | 'select' | 'add-column' | 'badge';
  sortable?: boolean;              // Can be sorted
  editable?: boolean;              // Can be edited
  fixed?: boolean;                 // Fixed position
  width?: number;                  // Column width (px)
  minWidth?: number;               // Minimum width
  maxWidth?: number;               // Maximum width
  group?: string;                  // Column group
  formulaId?: string;              // For formula columns
  attributeId?: string;            // For attribute columns
  values?: string[];               // For select type
  options?: string[];              // For select type
  render?: (value: any, row: any) => React.ReactNode;  // Custom renderer
}

// Grid Props
interface DataGridProps {
  columns: Column[];
  data: any[];
  onAddColumn?: (columnType: 'formula' | 'attribute') => void;
  onRowDelete?: (rowId: string) => void;
  onBulkDelete?: (rowIds: string[]) => void;
  onCellEdit?: (rowId: string, columnId: string, value: any) => void;
  onDeleteColumn?: (columnId: string) => void;
  onSetActiveFormula?: (columnId: string) => void;
  onCreateVersion?: (columnId: string) => void;
  onNormalizeFormula?: (columnId: string) => void;
  onSendForCompounding?: (columnId: string) => void;
  onColumnReorder?: (fromIndex: number, toIndex: number) => void;
  onRowReorder?: (rowOrder: string[]) => void;
  onToggleGrouping?: (columnId: string) => void;
  groupedByColumn?: string | null;
  editableFormula?: string;
  className?: string;
  showEmptyState?: boolean;
  enableRowReordering?: boolean;
  enableBulkSelection?: boolean;
  dilutionState?: UseDilutionReturn;
}
```

### Component Architecture

```
DataGrid
├── TableHeader
│   ├── ColumnGroup (Ingredient, Formulas, Attributes, etc.)
│   ├── ColumnHeader (per column)
│   │   ├── Sort Indicator
│   │   ├── Filter Icon
│   │   └── Column Menu
│   └── BulkSelectCheckbox (if enabled)
├── TableBody
│   ├── VirtualScroller (for performance)
│   ├── DraggableRow (repeatable)
│   │   ├── DragHandle
│   │   ├── RowCheckbox
│   │   ├── CellRenderer (per column)
│   │   │   ├── EditableCell (for editable)
│   │   │   └── ReadOnlyCell
│   │   └── RowActions (edit/delete)
│   ├── GroupHeaderRow (if grouped)
│   └── TotalRow (running, target, RMC, lines)
├── BulkActionsToolbar (when rows selected)
│   ├── Selected Count
│   ├── Delete Button
│   ├── Export Button
│   └── Clear Selection Button
└── EmptyState (when no data)
```

### Key Operations

#### 1. Cell Editing

```typescript
const EditableCell = ({ value, rowId, columnId, onEdit, type }: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    
    // Validate value
    if (type === 'number') {
      const numValue = parseFloat(localValue);
      if (isNaN(numValue) || numValue < 0) {
        toast.error('Invalid number');
        setLocalValue(value);
        return;
      }
    }
    
    // Only save if changed
    if (localValue !== value) {
      onEdit(rowId, columnId, localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return isEditing ? (
    <input
      ref={inputRef}
      type={type === 'number' ? 'number' : 'text'}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-full px-2 py-1 border-2 border-blue-500 rounded"
    />
  ) : (
    <div 
      onDoubleClick={handleDoubleClick}
      className="w-full px-2 py-1 cursor-text hover:bg-gray-50"
    >
      {value}
    </div>
  );
};
```

#### 2. Row Reordering

```typescript
export function useRowReordering(
  data: any[],
  onRowReorder?: (rowOrder: string[]) => void,
  onDragStart?: () => void
) {
  const [dragState, setDragState] = useState<{
    draggedIndex: number | null;
    dragOverIndex: number | null;
  }>({
    draggedIndex: null,
    dragOverIndex: null,
  });

  const handleDragStart = (index: number) => {
    setDragState({ draggedIndex: index, dragOverIndex: null });
    onDragStart?.();
  };

  const handleDragOver = (index: number) => {
    if (dragState.draggedIndex === index) return;
    setDragState(prev => ({ ...prev, dragOverIndex: index }));
  };

  const handleDragEnd = () => {
    const { draggedIndex, dragOverIndex } = dragState;
    
    if (draggedIndex === null || dragOverIndex === null) {
      setDragState({ draggedIndex: null, dragOverIndex: null });
      return;
    }

    // Reorder array
    const newData = [...data];
    const [draggedItem] = newData.splice(draggedIndex, 1);
    newData.splice(dragOverIndex, 0, draggedItem);

    // Call callback with new order
    onRowReorder?.(newData.map(row => row.id));

    setDragState({ draggedIndex: null, dragOverIndex: null });
  };

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragLeave: () => setDragState(prev => ({ ...prev, dragOverIndex: null })),
  };
}
```

#### 3. Bulk Selection

```typescript
export function useBulkSelection(data: any[]) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleRowSelection = (rowId: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (isAllSelected()) {
      setSelectedRows(new Set());
    } else {
      const nonTotalRows = data.filter(row => !row.isTotal);
      setSelectedRows(new Set(nonTotalRows.map(row => row.id)));
    }
  };

  const clearSelection = () => {
    setSelectedRows(new Set());
  };

  const isRowSelected = (rowId: string) => {
    return selectedRows.has(rowId);
  };

  const isAllSelected = () => {
    const nonTotalRows = data.filter(row => !row.isTotal);
    return nonTotalRows.length > 0 && 
           nonTotalRows.every(row => selectedRows.has(row.id));
  };

  const isSomeSelected = () => {
    return selectedRows.size > 0 && !isAllSelected();
  };

  return {
    selectedRows,
    toggleRowSelection,
    toggleSelectAll,
    clearSelection,
    isRowSelected,
    isAllSelected,
    isSomeSelected,
  };
}
```

#### 4. Keyboard Navigation

```typescript
export function useKeyboardNavigation({
  data,
  columns,
  editableFormula,
  onCellEdit,
  onNavigate,
}: KeyboardNavigationProps) {
  const [focusedCell, setFocusedCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!focusedCell) return;

    const { rowId, columnId } = focusedCell;
    const rowIndex = data.findIndex(row => row.id === rowId);
    const colIndex = columns.findIndex(col => col.id === columnId);

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (rowIndex > 0) {
          const newCell = { rowId: data[rowIndex - 1].id, columnId };
          setFocusedCell(newCell);
          onNavigate?.(newCell);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (rowIndex < data.length - 1) {
          const newCell = { rowId: data[rowIndex + 1].id, columnId };
          setFocusedCell(newCell);
          onNavigate?.(newCell);
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        if (colIndex > 0) {
          const newCell = { rowId, columnId: columns[colIndex - 1].id };
          setFocusedCell(newCell);
          onNavigate?.(newCell);
        }
        break;

      case 'ArrowRight':
        e.preventDefault();
        if (colIndex < columns.length - 1) {
          const newCell = { rowId, columnId: columns[colIndex + 1].id };
          setFocusedCell(newCell);
          onNavigate?.(newCell);
        }
        break;

      case 'Enter':
        e.preventDefault();
        // Enter edit mode
        const cell = document.getElementById(`cell-${rowId}-${columnId}`);
        cell?.querySelector('input')?.focus();
        break;

      case 'Tab':
        e.preventDefault();
        // Move to next editable cell
        // Implementation here
        break;
    }
  }, [focusedCell, data, columns, onNavigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    focusedCell,
    setFocusedCell,
  };
}
```

### Performance Optimizations

```typescript
// 1. Virtual Scrolling for large datasets
const VirtualizedGrid = () => {
  const visibleRows = useVirtualScroll({
    items: data,
    itemHeight: 40,
    containerHeight: 600,
    overscan: 5,
  });

  return visibleRows.map(row => <Row key={row.id} data={row} />);
};

// 2. Memoized Cell Rendering
const Cell = React.memo(({ value, rowId, columnId, onEdit }: CellProps) => {
  // Render logic
}, (prevProps, nextProps) => {
  // Only re-render if value or editing state changed
  return prevProps.value === nextProps.value &&
         prevProps.isEditing === nextProps.isEditing;
});

// 3. Debounced Calculations
const debouncedRecalculate = useMemo(
  () => debounce((data: any[]) => {
    const totals = calculateTotals(data, columns);
    setTableData(totals);
  }, 100),
  [columns]
);

// 4. Lazy Column Loading
const visibleColumns = useMemo(() => {
  const scrollLeft = containerRef.current?.scrollLeft || 0;
  const containerWidth = containerRef.current?.clientWidth || 0;
  
  return columns.filter(col => {
    const colLeft = getColumnOffset(col.id);
    const colRight = colLeft + col.width;
    return colRight >= scrollLeft && colLeft <= scrollLeft + containerWidth;
  });
}, [columns, scrollPosition]);
```

### Related Features

- [Formula Management](./FORMULA_MANAGEMENT.md) - Formula columns
- [Ingredient Management](./INGREDIENT_MANAGEMENT.md) - Ingredient rows
- [Workspace Management](./WORKSPACE_MANAGEMENT.md) - Grid state persistence
- [Dilution](./DILUTION.md) - Dilution icons in cells

### Testing Checklist

- [ ] Edit cell value with double-click
- [ ] Edit cell value with Enter key
- [ ] Cancel edit with Escape
- [ ] Invalid number rejected
- [ ] Drag row to new position
- [ ] Select single row with checkbox
- [ ] Select all rows with header checkbox
- [ ] Select range with Shift+Click
- [ ] Delete selected rows
- [ ] Add attribute column
- [ ] Remove column
- [ ] Resize column by dragging
- [ ] Auto-fit column width
- [ ] Sort ascending/descending/clear
- [ ] Navigate with arrow keys
- [ ] Navigate with Tab key
- [ ] Copy/paste values
- [ ] Export to Excel
- [ ] View running total
- [ ] Group by attribute
- [ ] Filter by column value

### Accessibility

- **Keyboard Navigation**: Full keyboard support for all operations
- **ARIA Grid**: Proper grid role with row/cell roles
- **Focus Management**: Visible focus indicators
- **Screen Reader**: Cell contents announced
- **Labels**: All interactive elements labeled

### Known Limitations

- Maximum 50 columns before performance degradation
- Virtual scrolling disabled if < 20 rows
- Copy/paste limited to 1000 cells
- No cell merging
- No frozen columns (except first column)

### Future Enhancements

- [ ] Cell formatting (colors, fonts, borders)
- [ ] Conditional formatting rules
- [ ] Cell comments/notes
- [ ] Cell validation rules
- [ ] Multi-cell formulas
- [ ] Undo/redo per cell
- [ ] Cell history tracking
- [ ] Right-click context menu
- [ ] Column pinning
- [ ] Row grouping with subtotals
