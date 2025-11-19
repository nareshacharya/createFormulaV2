# Undo Functionality Fix - November 19, 2025

## Problem Statement

When performing multiple actions (e.g., adding two formulas), clicking the Undo button would revert to the initial state instead of going back one action at a time.

### Example Scenario
1. User adds "Woody Amber Signature" formula → Undo counter shows 1
2. User adds "Lavender Dreams" formula → Undo counter shows 2
3. User clicks Undo → Goes back to initial state instead of just removing "Lavender Dreams"

## Root Cause Analysis

The issue was in the `saveStateAfterAction` callback function in `WorkArea.tsx`:

```typescript
// OLD CODE (BROKEN)
const saveStateAfterAction = useCallback(
  (action: string, description: string) => {
    // Use setTimeout to ensure state updates have completed
    setTimeout(() => {
      // Problem: This closure captures the state values from when the callback was created,
      // not when it's actually called. React's state updates may not have completed yet.
      const currentDilutions = dilutionState.dilutions;
      workspaceHistory.push(
        {
          columns,        // <- STALE STATE
          tableData,      // <- STALE STATE
          formulas,       // <- STALE STATE
          availableFormulas, // <- STALE STATE
          dilutions: currentDilutions,
        },
        action,
        description
      );
      // ...
    }, 0);
  },
  [
    columns,
    tableData,
    formulas,
    availableFormulas,
    dilutionState,
    workspaceHistory,
  ]
);
```

### Why This Was Wrong

1. **setTimeout Timing Issue**: The `setTimeout(..., 0)` queues the state save to happen after the current JavaScript execution context, but React's state updates are batched and may not have completed by then.

2. **Stale Closure**: The closure captured state variables at the time `useCallback` created the function, not at the time it was invoked. When multiple actions happened rapidly:
   - Action 1: `saveStateAfterAction` called → queued with setTimeout
   - Action 2: State changes → new `saveStateAfterAction` callback created (due to dependency array)
   - setTimeout from Action 1 executes → captures old state from Action 1's callback
   - Both saves end up with incorrect state snapshots

3. **Race Condition**: Rapid successive actions could cause state saves to be captured out of order or with intermediate states.

## Solution

The fix uses a **queuing pattern** with a ref to defer state saves until the state has actually updated:

```typescript
// NEW CODE (FIXED)

// Track pending state save to avoid duplicate saves
const pendingStateSaveRef = useRef<{
  action: string;
  description: string;
} | null>(null);

// Helper function to queue a state save after an action completes
const saveStateAfterAction = useCallback(
  (action: string, description: string) => {
    // Queue the state save to be executed in the next effect
    pendingStateSaveRef.current = { action, description };
  },
  [] // Empty dependency array - this function never changes
);

// Effect to handle pending state saves when state changes
useEffect(() => {
  if (pendingStateSaveRef.current) {
    const { action, description } = pendingStateSaveRef.current;
    pendingStateSaveRef.current = null; // Clear the pending save

    // Access current state values - guaranteed to be latest
    const currentDilutions = dilutionState.dilutions;
    workspaceHistory.push(
      {
        columns,        // <- CURRENT STATE
        tableData,      // <- CURRENT STATE
        formulas,       // <- CURRENT STATE
        availableFormulas, // <- CURRENT STATE
        dilutions: currentDilutions,
      },
      action,
      description
    );
    eventBus.emit("undo-state-updated", {
      canUndo: workspaceHistory.canUndo(),
      count: workspaceHistory.getUndoCount(),
    });
  }
}, [
  columns,
  tableData,
  formulas,
  availableFormulas,
  dilutionState,
  workspaceHistory,
]);
```

### How This Works

1. **Queue Phase**: When an action occurs (e.g., formula added), `saveStateAfterAction` simply stores the action/description in `pendingStateSaveRef` without doing anything else.

2. **Detection Phase**: React's effect system detects that state has changed (columns, tableData, formulas, etc.) and runs the effect.

3. **Save Phase**: The effect checks if there's a pending state save and immediately saves the current state values (guaranteed to be up-to-date).

4. **Clear Phase**: The pending save is cleared to avoid duplicate saves.

## Benefits

✅ **Correct State Captures**: Each undo step captures the exact state after that specific action
✅ **No Race Conditions**: The effect ensures states are saved in the correct order
✅ **Predictable Behavior**: Undo counter accurately reflects the number of steps that can be undone
✅ **No setTimeout Hacks**: Removes unreliable timing-based logic

## Verification

### Before Fix
- Add Formula 1 → Undo: 1
- Add Formula 2 → Undo: 2
- Click Undo → Back to initial state (WRONG - should just remove Formula 2)

### After Fix
- Add Formula 1 → Undo: 1
- Add Formula 2 → Undo: 2  
- Click Undo → Formula 2 removed (CORRECT - one step back)
- Click Undo → Formula 1 removed (CORRECT - another step back)
- Click Undo → Initial state (CORRECT - back to beginning)

## Related Files

- `src/view/WorkArea/WorkArea.tsx` - Contains the fix
- `src/utils/stateHistory.ts` - StateHistoryManager class (unchanged)
- Line 130-170: New implementation of saveStateAfterAction with queuing pattern

## Technical Details

- **Pattern**: Ref-based queue with effect-driven execution
- **Stability**: Uses effect dependencies to ensure timing correctness
- **Performance**: Minimal overhead, no polling or unnecessary callbacks
- **Compatibility**: Works with React's batching and concurrent updates
