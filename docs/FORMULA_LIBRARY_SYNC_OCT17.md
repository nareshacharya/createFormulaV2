# Formula Library Synchronization & UI Improvements - October 17, 2025

## Overview
This document details the improvements made to synchronize formula selections between the DataGrid and library panel, along with UI icon updates for better user experience.

## Changes Implemented

### 1. Formula Deletion Synchronization ✅

**Problem:** When a formula was deleted from the DataGrid, the library panel still showed it as "selected/added", preventing users from adding the same formula again.

**Solution:** Updated `handleRowDelete` in `useDataGridHandlers.ts` to emit a `formula-selections-updated` event when a formula row is deleted.

**Files Modified:**
- `src/view/WorkArea/hooks/useDataGridHandlers.ts`

**Code Changes:**
```typescript
// In handleRowDelete function
if (rowToDelete?.isFormula) {
  newData = newData.filter(
    (row) => row.parentFormulaId !== rowToDelete.formulaId
  );

  // Remove from tracking sets and update state
  pendingFormulaIds.current?.delete(rowToDelete.formulaId);
  const updatedSelectedIds = selectedFormulaIds.filter(
    (id) => id !== rowToDelete.formulaId
  );
  setSelectedFormulaIds(updatedSelectedIds);

  // ✨ NEW: Emit event to update formula selections in library panel
  const remainingFormulaCount = columns.filter(
    (col) => col.group === "Formulas" && col.formulaId && col.formulaId !== rowToDelete.formulaId
  ).length;
  eventBus.emit("formula-selections-updated", {
    count: remainingFormulaCount,
    selectedIds: updatedSelectedIds,
  });
}
```

**Result:** When a formula is deleted from the DataGrid, the library panel immediately updates to show the formula as available for re-selection.

---

### 2. Formula Explosion Synchronization ✅

**Problem:** When a formula was exploded (converted to individual ingredients), the library panel still showed it as "selected", preventing users from adding the same formula again.

**Solution:** Updated `handleExplodeFormula` in `useFormulaOperations.ts` to remove the formula from `selectedFormulaIds` and emit the synchronization event.

**Files Modified:**
- `src/view/WorkArea/hooks/useFormulaOperations.ts`
- `src/view/WorkArea/WorkArea.tsx`

**Code Changes:**

1. **Added new props to `UseFormulaOperationsProps`:**
```typescript
interface UseFormulaOperationsProps {
  columns: Column[];
  editableFormula: string;
  formulas: Formula[];
  ingredients: Ingredient[];
  setTableData: Dispatch<SetStateAction<any[]>>;
  selectedFormulaIds: string[];        // ✨ NEW
  setSelectedFormulaIds: Dispatch<SetStateAction<string[]>>;  // ✨ NEW
}
```

2. **Updated `handleExplodeFormula` function:**
```typescript
const handleExplodeFormula = (formulaId: string) => {
  setTableData((prev) => {
    // ... existing explosion logic ...
    return calculateTotals(newData, columns);
  });

  // ✨ NEW: Remove the formula from selectedFormulaIds and emit event
  const updatedSelectedIds = selectedFormulaIds.filter(
    (id) => id !== formulaId
  );
  setSelectedFormulaIds(updatedSelectedIds);

  const remainingFormulaCount = columns.filter(
    (col) => col.group === "Formulas" && col.formulaId && col.formulaId !== formulaId
  ).length;
  eventBus.emit("formula-selections-updated", {
    count: remainingFormulaCount,
    selectedIds: updatedSelectedIds,
  });
};
```

3. **Updated WorkArea.tsx to pass new props:**
```typescript
const { handleNormalize, handleMergeDuplicates, handleExplodeFormula } =
  useFormulaOperations({
    columns,
    editableFormula,
    formulas,
    ingredients,
    setTableData,
    selectedFormulaIds,        // ✨ NEW
    setSelectedFormulaIds,     // ✨ NEW
  });
```

**Result:** When a formula is exploded, the library panel immediately updates to show the formula as available for re-selection.

---

### 3. Dilution Icon Update (Hover State) ✅

**Problem:** The hover icon for dilution used a custom SVG drop icon instead of the Material Symbols icon, creating visual inconsistency.

**Solution:** Replaced the custom SVG with Material Symbols `water_drop` icon in `DilutionIcon.tsx`.

**Files Modified:**
- `src/components/dilution/DilutionIcon.tsx`

**Code Changes:**
```typescript
// BEFORE: Custom SVG
<svg width="16" height="16" viewBox="0 0 16 16" ...>
  <path d="M8 2C8 2 4 6.5 4 9.5C4 11.71..." />
</svg>

// AFTER: Material Symbols Icon
<span
  className={`material-symbols-rounded text-sm transition-colors duration-200 ${
    hasDilution
      ? "text-blue-600"
      : isHovered
      ? "text-blue-500"
      : "text-gray-400"
  }`}
  style={{ fontVariationSettings: "'FILL' 0" }}
>
  water_drop
</span>
```

**Icon States:**
- **No dilution (default):** Gray outlined drop icon
- **Hover:** Blue outlined drop icon
- **Has dilution:** Blue filled drop icon (already implemented)

**Result:** Consistent Material Symbols icon usage across all dilution states.

---

### 4. Explode Icon Update ✅

**Problem:** Formula explode functionality used the "explosion" icon instead of the more appropriate "bomb" icon.

**Solution:** Changed both occurrences of `explosion` to `bomb` in DataGrid.tsx.

**Files Modified:**
- `src/components/DataGrid.tsx`

**Code Changes:**
```typescript
// Location 1: Description column (line ~461)
<span
  className="material-symbols-rounded text-lg"
  style={{ fontVariationSettings: "'FILL' 1" }}
>
  bomb  {/* Changed from: explosion */}
</span>

// Location 2: Formula number cell (line ~626)
<span
  className="material-symbols-rounded text-lg"
  style={{ fontVariationSettings: "'FILL' 1" }}
>
  bomb  {/* Changed from: explosion */}
</span>
```

**Icon Properties:**
- **Style:** Filled (`'FILL' 1`)
- **Color:** Orange (`text-orange-600`)
- **Size:** Large (`text-lg`)
- **Position:** Right side of formula rows

**Result:** Explode functionality now uses the bomb icon (💣) which is more visually clear and consistent with the action being performed.

---

## File Size Compliance ✅

**Requirement:** No file should exceed 1000 lines (with exception for DataGrid and WorkArea up to 1500 lines).

**Current File Sizes:**
- ✅ `DataGrid.tsx`: **1356 lines** (under 1500 limit)
- ✅ `WorkArea.tsx`: **1482 lines** (under 1500 limit)
- ✅ `useDataGridHandlers.ts`: ~160 lines
- ✅ `useFormulaOperations.ts`: ~230 lines
- ✅ `DilutionIcon.tsx`: ~45 lines

**Result:** All files are within size constraints.

---

## Testing Checklist

### Formula Deletion
- [ ] Add a formula from library panel to DataGrid
- [ ] Verify formula shows as "selected" in library (with checkmark)
- [ ] Delete the formula row from DataGrid
- [ ] Verify formula immediately shows as "available" in library (no checkmark)
- [ ] Verify you can add the same formula again

### Formula Explosion
- [ ] Add a formula with nested ingredients to DataGrid
- [ ] Verify formula shows as "selected" in library
- [ ] Click the bomb icon (💣) on the formula row
- [ ] Verify formula explodes into individual ingredients
- [ ] Verify formula immediately shows as "available" in library
- [ ] Verify you can add the same formula again

### Dilution Icon (Hover)
- [ ] Add an ingredient to DataGrid
- [ ] Hover over ingredient in description column
- [ ] Verify gray outlined drop icon appears (Material Symbols)
- [ ] Verify icon turns blue on hover
- [ ] Click to add dilution
- [ ] Verify dilution displays with filled blue drop icon

### Explode Icon
- [ ] Add a formula to DataGrid
- [ ] Verify bomb icon (💣) appears in description column (orange, filled)
- [ ] Verify bomb icon appears in active formula number cell (orange, filled)
- [ ] Verify both icons are on the right side
- [ ] Click bomb icon to explode formula
- [ ] Verify formula converts to individual ingredients

---

## Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Formula Deletion Flow                    │
└─────────────────────────────────────────────────────────────┘

User clicks delete on formula row
         │
         ▼
handleRowDelete(rowId) in useDataGridHandlers.ts
         │
         ├─► Remove formula row and child ingredients from tableData
         ├─► Remove formulaId from pendingFormulaIds
         ├─► Remove formulaId from selectedFormulaIds
         │
         ▼
eventBus.emit("formula-selections-updated", {
  count: remainingFormulaCount,
  selectedIds: updatedSelectedIds
})
         │
         ▼
Library panel updates (FormulaList component)
         │
         ▼
Formula shows as available (no checkmark)


┌─────────────────────────────────────────────────────────────┐
│                    Formula Explosion Flow                    │
└─────────────────────────────────────────────────────────────┘

User clicks bomb icon (💣)
         │
         ▼
handleExplodeFormula(formulaId) in useFormulaOperations.ts
         │
         ├─► Remove formula row from tableData
         ├─► Convert formula to individual ingredients
         ├─► Insert ingredients into tableData
         ├─► Calculate new totals
         │
         ▼
setTableData(newData)
         │
         ▼
Remove formulaId from selectedFormulaIds
         │
         ▼
eventBus.emit("formula-selections-updated", {
  count: remainingFormulaCount,
  selectedIds: updatedSelectedIds
})
         │
         ▼
Library panel updates (FormulaList component)
         │
         ▼
Formula shows as available (no checkmark)
```

---

## Icon Reference

### Dilution Icons
| State | Icon | Style | Color | Usage |
|-------|------|-------|-------|-------|
| No dilution (default) | 💧 | Outlined | Gray | Hover state in description |
| No dilution (hover) | 💧 | Outlined | Blue | Interactive hover feedback |
| Has dilution | 💧 | Filled | Blue | Active dilution indicator |

### Explode Icon
| Icon | Style | Color | Position | Usage |
|------|-------|-------|----------|-------|
| 💣 | Filled | Orange | Right side | Formula explosion action |

---

## Benefits

1. **Improved User Experience:** 
   - Users can now re-add formulas after deletion or explosion
   - No confusion about which formulas are actually in use
   - Clear visual feedback in library panel

2. **Data Consistency:**
   - Library panel always reflects actual DataGrid state
   - Real-time synchronization via event bus
   - No stale selections

3. **Visual Consistency:**
   - All icons use Material Symbols
   - Consistent filled/outlined states
   - Clear color coding (blue for dilution, orange for explode)

4. **Code Maintainability:**
   - Clean separation of concerns (hooks)
   - Event-driven architecture
   - Files within size limits

---

## Future Considerations

1. **Performance:** Consider debouncing event emissions if bulk operations are added
2. **Undo Support:** Track formula explosions in undo history
3. **TypeScript:** Address pre-existing `any` type warnings when time permits
4. **Testing:** Add unit tests for event synchronization logic

---

## Related Documentation
- [DataGrid Refactoring](./DATAGRID_REFACTORING.md)
- [Dilution Feature](./DILUTION_FEATURE.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Event Bus Architecture](./ARCHITECTURE.md)
