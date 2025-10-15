# Keyboard Navigation Feature

## Overview

The DataGrid now supports comprehensive keyboard navigation for efficient data entry, especially when working with active formula columns. This feature enables users to navigate and edit cells using only the keyboard, significantly improving workflow efficiency.

## Features

### 1. **Auto-Focus on Formula Activation**
- When a formula column is set as active, the first editable cell is automatically focused
- Visual indicator (blue border) shows which cell is currently focused
- Users can immediately start typing without clicking

### 2. **Arrow Key Navigation**
- **↑ Up Arrow**: Move to previous row
- **↓ Down Arrow**: Move to next row  
- **← Left Arrow**: Move to previous cell (wraps to last cell)
- **→ Right Arrow**: Move to next cell (wraps to first cell)
- Navigation wraps around at boundaries for continuous workflow

### 3. **Direct Typing Mode**
- Start typing any number to immediately enter edit mode
- The typed character replaces the existing value (no cursor visible)
- No need to press Enter or double-click first
- Text is selected for easy replacement

### 4. **Keyboard Shortcuts**

| Key | Action |
|-----|--------|
| **Enter** | Save changes and move down |
| **Escape** | Cancel editing and revert changes |
| **Tab** | Save and move to next cell →  |
| **Shift + Tab** | Save and move to previous cell ← |
| **Space** | Enter edit mode with empty value |
| **Arrow Keys** | Navigate between cells (or save & navigate if editing) |
| **Any Digit/Letter** | Start editing with that character |

### 5. **Visual Feedback**
- **Focused Cell**: Blue border (not editing)
- **Editing Cell**: Darker blue border with selected text
- **Hover State**: Light gray background on hoverable cells
- **No Visible Cursor**: Cursor is hidden during editing for cleaner UX

## Technical Implementation

### Hook: `useKeyboardNavigation`

Location: `src/components/DataGrid/hooks/useKeyboardNavigation.ts`

```typescript
interface UseKeyboardNavigationProps {
  data: DataRow[];
  columns: Column[];
  editableFormula?: string;
  onCellEdit?: (rowId: string, columnId: string, value: unknown) => void;
  onNavigate?: (cell: NavigationCell) => void;
}

interface UseKeyboardNavigationReturn {
  focusedCell: NavigationCell | null;
  editingCell: NavigationCell | null;
  editValue: string;
  handleCellFocus: (rowId: string, columnId: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleInputChange: (value: string) => void;
  clearFocus: () => void;
  isEditing: boolean;
}
```

**Key Functions:**

1. **`getEditableCells()`**
   - Returns list of navigable cells in active formula
   - Filters out total rows (except target total)
   - Only includes editable, non-fixed columns

2. **`handleCellFocus()`**
   - Sets focus on a specific cell
   - Validates cell is editable
   - Triggers navigation callback

3. **`navigateToCell()`**
   - Moves focus in specified direction
   - Handles wrapping at boundaries
   - Updates focused cell state

4. **`handleKeyDown()`**
   - Intercepts keyboard events
   - Routes to appropriate handler based on current state
   - Manages editing vs navigation modes

5. **`saveCell()`**
   - Saves current edit value
   - Parses numeric values
   - Calls onCellEdit callback

### Component: `EditableCell`

Location: `src/components/DataGrid/components/EditableCell.tsx`

```typescript
interface EditableCellProps {
  value: string | number;
  isEditing: boolean;
  isFocused: boolean;
  editValue: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClick: () => void;
  className?: string;
  align?: "left" | "right" | "center";
}
```

**Features:**
- Hidden cursor during editing (`caretColor: transparent`)
- Auto-select text when editing starts
- Blue border visual states
- Hover effects for better UX

### Integration in DataGrid

```typescript
// In DataGrid.tsx
const navigation = useKeyboardNavigation({
  data: sortedData,
  columns,
  editableFormula,
  onCellEdit,
  onNavigate: (cell) => {
    // Scroll to cell if needed
    const cellElement = document.getElementById(`cell-${cell.rowId}-${cell.columnId}`);
    cellElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
});

// In render
<EditableCell
  value={row[column.id]}
  isEditing={navigation.editingCell?.rowId === row.id && 
             navigation.editingCell?.columnId === column.id}
  isFocused={navigation.focusedCell?.rowId === row.id && 
             navigation.focusedCell?.columnId === column.id}
  editValue={navigation.editValue}
  onChange={navigation.handleInputChange}
  onKeyDown={navigation.handleKeyDown}
  onClick={() => navigation.handleCellFocus(row.id, column.id)}
/>
```

## User Workflow Examples

### Example 1: Quick Data Entry

1. User clicks formula column header (sets as active)
2. First cell automatically gets focus (blue border)
3. User types "25.5" → immediately enters edit mode
4. User presses Enter → saves and moves to next cell
5. User types "30" → replaces value
6. User presses Down → saves and moves down
7. Repeat until all values entered

### Example 2: Navigation Without Editing

1. Cell is focused (blue border)
2. User presses Down/Up arrows → moves between rows
3. User presses Right/Left → moves between cells
4. When ready, user starts typing to edit

### Example 3: Correcting Mistakes

1. User is editing a cell
2. User presses Escape → cancels and reverts
3. Cell returns to focused state
4. User can navigate away or try again

## Accessibility Features

### Keyboard-Only Operation
- Complete functionality without mouse
- All navigation via keyboard
- Clear visual focus indicators

### Screen Reader Support
- Focused cells have aria-selected attribute
- Edit mode announced via aria-live region
- Column headers properly labeled

### Visual Indicators
- High contrast borders for focus/edit states
- No reliance on color alone (border weight differs)
- Clear hover states for discoverability

## Browser Compatibility

Tested and working in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

### Optimizations
- `useCallback` hooks prevent unnecessary re-renders
- Only active formula column cells are navigable
- Efficient cell filtering with memoization
- Event handlers debounced where appropriate

### Known Limitations
- Navigation limited to single column (active formula)
- Large datasets (1000+ rows) may have slight lag
- Mobile/touch devices require different interaction pattern

## Configuration Options

### Disabling Navigation
```typescript
<DataGrid
  enableKeyboardNavigation={false} // Disable feature
  // ... other props
/>
```

### Custom Navigation Callback
```typescript
<DataGrid
  onNavigate={(cell) => {
    console.log(`Navigated to ${cell.rowId}, ${cell.columnId}`);
    // Custom logic here
  }}
  // ... other props
/>
```

### Customizing Editable Cells
The hook respects column properties:
```typescript
{
  id: 'myColumn',
  editable: true,      // Must be true for navigation
  fixed: false,        // Fixed columns not navigable
  type: 'number',      // Type determines validation
  // ...
}
```

## Troubleshooting

### Issue: Focus not appearing
**Solution**: Ensure formula is set as active and column is editable

### Issue: Arrow keys not working
**Solution**: Check that cell has focus (blue border visible)

### Issue: Values not saving
**Solution**: Verify onCellEdit callback is properly connected

### Issue: Navigation skipping rows
**Solution**: Check data for isEmpty or isTotal flags

## Future Enhancements

Planned improvements:
- [ ] Multi-column navigation (Tab between formula columns)
- [ ] Copy/paste support (Ctrl+C, Ctrl+V)
- [ ] Undo/redo (Ctrl+Z, Ctrl+Y)
- [ ] Batch edit mode (select range, type once)
- [ ] Keyboard shortcuts customization
- [ ] Touch device gesture support

## Related Documentation

- [DataGrid Enhancements](./DATAGRID_ENHANCEMENTS.md)
- [Components Documentation](./COMPONENTS.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)

## Changelog

### Version 1.0.0 (October 15, 2025)
- ✅ Initial implementation
- ✅ Arrow key navigation
- ✅ Direct typing to replace
- ✅ Hidden cursor in edit mode
- ✅ Auto-focus on formula activation
- ✅ Comprehensive keyboard shortcuts
- ✅ EditableCell component
- ✅ useKeyboardNavigation hook

## Support

For issues or feature requests related to keyboard navigation:
1. Check this documentation first
2. Review code in `src/components/DataGrid/hooks/useKeyboardNavigation.ts`
3. Test with browser console open for debugging
4. Submit detailed bug report with steps to reproduce
