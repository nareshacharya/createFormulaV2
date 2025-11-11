# Toolbar Actions Integration - Complete Implementation

## Overview
Successfully integrated header toolbar actions (Add Formula, Merge Duplicates, Normalize, Send, Undo) into the DataGrid's BulkActionsToolbar, replacing the Save Views functionality.

## Changes Made

### 1. WorkArea Component (`src/view/WorkArea/WorkArea.tsx`)

#### Added Undo State Tracking
```typescript
// Added after groupedByColumn state
const [undoState, setUndoState] = useState({
  canUndo: false,
  undoCount: 0,
});
```

#### Created handleUndoAction Function
Extracted undo logic into a callable function with useCallback:
- Restores previous state from appStateHistory
- Restores dilution state
- Updates formula selections
- Emits undo state updates
- Shows success/error toast messages

#### Created handleToolbarSend Function
Wrapper function that:
- Validates an active formula is selected
- Calls handleSendForCompoundingFromMenu with the active formula
- Provides user feedback on validation errors

#### Added Undo State Listener
In the main event listener useEffect:
```typescript
eventBus.on("undo-state-updated", (data) => {
  setUndoState({
    canUndo: data.canUndo,
    undoCount: data.count,
  });
});
```

#### Updated DataGrid Props
Removed:
- `onSaveView`
- `onLoadView`  
- `enableSavedViews`

Added toolbar action props:
```typescript
// Toolbar actions
onToolbarAddFormula={handleAddFormulaColumn}
onToolbarMergeDuplicates={handleMergeDuplicates}
onToolbarNormalize={handleNormalize}
onToolbarSend={handleToolbarSend}
onToolbarUndo={handleUndoAction}
toolbarCanUndo={undoState.canUndo}
toolbarUndoCount={undoState.undoCount}
toolbarCanSend={!!activeFormula}
```

#### Cleaned Up
- Removed unused `handleSaveView` function
- Removed unused `handleLoadView` function

### 2. DataGrid Component (`src/components/DataGrid.tsx`)

#### Updated Props Destructuring
- Fixed parameter names for `enableRowReordering` and `enableBulkSelection`
- Added all toolbar action props to destructuring

#### Updated BulkActionsToolbar Call
Now passes all toolbar action handlers:
```typescript
<BulkActionsToolbar
  selectedCount={selectedRows.size}
  onBulkDelete={...}
  onClearSelection={clearSelection}
  onAddFormula={onToolbarAddFormula}
  onMergeDuplicates={onToolbarMergeDuplicates}
  onNormalize={onToolbarNormalize}
  onSend={onToolbarSend}
  onUndo={onToolbarUndo}
  canUndo={toolbarCanUndo}
  undoCount={toolbarUndoCount}
  canSend={toolbarCanSend}
/>
```

### 3. BulkActionsToolbar Component (`src/components/DataGrid/components/BulkActionsToolbar.tsx`)

#### Features Implemented
- **Add Formula Button** - Adds new formula column
- **Merge Duplicates Button** - Merges duplicate formulas
- **Normalize Button** - Normalizes formula percentages
- **Send Button** - Sends active formula for compounding (disabled until formula is active)
- **Undo Button** - Undoes last action (disabled when no undo available, shows count)

#### Visual States
- Buttons are conditionally rendered based on handler availability
- Disabled state for Send button when no active formula
- Disabled state for Undo button when no actions to undo
- Badge shows undo count when available

## Data Flow

### Toolbar Action Execution
1. User clicks toolbar button (e.g., "Merge")
2. BulkActionsToolbar calls handler prop (e.g., `onMergeDuplicates()`)
3. Handler executes action in WorkArea
4. Action emits state update event
5. UndoState listener updates component state
6. DataGrid re-renders with new undo state
7. Toolbar buttons update their enabled/disabled state

### Undo State Management
```
User Action
    ↓
Action Handler (saves state via appStateHistory.push())
    ↓
Emit "undo-state-updated" event
    ↓
Undo listener updates undoState
    ↓
DataGrid passes to BulkActionsToolbar
    ↓
Undo button updates enable state
```

## Integration Points

### Parent Components Using DataGrid
When implementing DataGrid in a parent component:

```typescript
<DataGrid
  // ... core props ...
  
  // Toolbar actions
  onToolbarAddFormula={() => handleAddFormula()}
  onToolbarMergeDuplicates={() => handleMergeDuplicates()}
  onToolbarNormalize={() => handleNormalize()}
  onToolbarSend={() => handleSend()}
  onToolbarUndo={() => handleUndo()}
  toolbarCanUndo={canUndo}
  toolbarUndoCount={undoCount}
  toolbarCanSend={canSend}
/>
```

## Event Bus Events

### Emitted by Toolbar Actions
- `undo-state-updated` - Contains `canUndo: boolean` and `count: number`
- `undo-action` - Triggered when user clicks Undo

### Listened to by WorkArea
- `undo-state-updated` - Updates undo state in component
- All other existing events for formula/ingredient operations

## Benefits

1. **Consolidated Actions** - All main operations available in the data grid toolbar
2. **Better UX** - Actions visible and accessible without header interaction
3. **Smart State** - Send button intelligently disabled until formula active
4. **Undo Feedback** - Users see undo count and availability
5. **Cleaner Header** - Removed save views functionality which wasn't being used

## Testing Checklist

- [ ] Click "Add Formula" button - adds new formula column
- [ ] Click "Merge Duplicates" button - merges duplicate formulas
- [ ] Click "Normalize" button - normalizes active formula
- [ ] "Send" button disabled until formula is active
- [ ] Click "Send" with active formula - sends for compounding
- [ ] "Undo" button disabled when no actions available
- [ ] Perform action, then click "Undo" - reverts last action
- [ ] Undo count badge shows and updates correctly
- [ ] Multiple undo operations work in sequence

## Next Steps

1. **Test all toolbar interactions** - Verify each button works as expected
2. **Monitor undo state** - Ensure state updates correctly
3. **Remove header actions** - Once verified in toolbar, can remove from header
4. **Performance optimization** - If needed, optimize re-render cycles
5. **Accessibility** - Ensure buttons are keyboard accessible

## Related Files

- `src/components/DataGrid.tsx` - DataGrid component with toolbar integration
- `src/components/DataGrid/components/BulkActionsToolbar.tsx` - Toolbar buttons
- `src/view/WorkArea/WorkArea.tsx` - Action handlers and undo management
- `src/view/WorkArea/components/FormulaColumnHandlers.tsx` - Formula-specific handlers
- `src/view/WorkArea/hooks/useFormulaOperations.ts` - Formula operation hooks
