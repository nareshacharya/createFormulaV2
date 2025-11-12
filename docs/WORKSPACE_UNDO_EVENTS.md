# Workspace Undo/Redo Events Documentation

## Overview
This document describes the events that would be needed to support comprehensive undo/redo functionality across workspace operations.

## Current Implementation
The application already has basic undo support for WorkArea operations (add/remove ingredients, formulas, attributes). See `appStateHistory` in `src/utils/stateHistory.ts`.

## Event Architecture for Undo/Redo

### 1. Workspace-Level Operations

These events track changes at the workspace level (creating, renaming, closing tabs):

```typescript
// Emitted when a new workspace tab is created
eventBus.emit("workspace-created", {
  workspaceId: string,
  workspaceName: string,
  timestamp: Date
});

// Emitted when workspace is switched
eventBus.emit("workspace-switched", {
  workspaceId: string,
  workspaceName: string,
  previousWorkspaceId: string,
  timestamp: Date
});

// Emitted when workspace is renamed
eventBus.emit("workspace-renamed", {
  workspaceId: string,
  oldName: string,
  newName: string,
  timestamp: Date
});

// Emitted when workspace is closed
eventBus.emit("workspace-closed", {
  workspaceId: string,
  workspaceName: string,
  hadUnsavedChanges: boolean,
  timestamp: Date
});

// Emitted when workspace is reset
eventBus.emit("workspace-reset", {
  workspaceId: string,
  workspaceName: string,
  previousState: WorkspaceData,
  timestamp: Date
});
```

### 2. Formula Operations Within Workspace

These events track formula-level changes within the active workspace:

```typescript
// Emitted when formula is added to workspace
eventBus.emit("formula-added-to-workspace", {
  workspaceId: string,
  formulaId: string,
  formulaName: string,
  columnPosition: number,
  timestamp: Date
});

// Emitted when formula is removed from workspace
eventBus.emit("formula-removed-from-workspace", {
  workspaceId: string,
  formulaId: string,
  formulaName: string,
  previousState: any,  // Snapshot of formula data before removal
  timestamp: Date
});

// Emitted when formula is set as active/editable
eventBus.emit("formula-activated", {
  workspaceId: string,
  formulaId: string,
  previousFormulaId: string | null,
  timestamp: Date
});
```

### 3. Ingredient Operations Within Formula

These events track ingredient changes in formula compositions:

```typescript
// Emitted when ingredient is added to active formula
eventBus.emit("ingredient-added-to-formula", {
  workspaceId: string,
  formulaId: string,
  ingredientId: string,
  ingredientName: string,
  rowPosition: number,
  timestamp: Date
});

// Emitted when ingredient is removed from formula
eventBus.emit("ingredient-removed-from-formula", {
  workspaceId: string,
  formulaId: string,
  ingredientId: string,
  ingredientName: string,
  previousData: any,  // Complete row data before removal
  timestamp: Date
});

// Emitted when ingredient percentage is changed
eventBus.emit("ingredient-percentage-changed", {
  workspaceId: string,
  formulaId: string,
  ingredientId: string,
  oldValue: number,
  newValue: number,
  timestamp: Date
});

// Emitted when ingredients are merged
eventBus.emit("ingredients-merged", {
  workspaceId: string,
  formulaId: string,
  mergedIngredients: Array<{id: string, name: string}>,
  resultingIngredient: {id: string, name: string},
  timestamp: Date
});
```

### 4. Attribute Operations Within Workspace

These events track attribute column operations:

```typescript
// Emitted when attribute column is added
eventBus.emit("attribute-added-to-workspace", {
  workspaceId: string,
  attributeId: string,
  attributeName: string,
  columnPosition: number,
  timestamp: Date
});

// Emitted when attribute column is removed
eventBus.emit("attribute-removed-from-workspace", {
  workspaceId: string,
  attributeId: string,
  attributeName: string,
  previousValues: Map<string, any>,  // All row values for this attribute
  timestamp: Date
});

// Emitted when attribute value is changed
eventBus.emit("attribute-value-changed", {
  workspaceId: string,
  formulaId: string,
  ingredientId: string,
  attributeId: string,
  oldValue: any,
  newValue: any,
  timestamp: Date
});
```

### 5. Column Reordering Operations

```typescript
// Emitted when column order is changed
eventBus.emit("columns-reordered", {
  workspaceId: string,
  previousOrder: string[],  // Array of column IDs
  newOrder: string[],
  timestamp: Date
});
```

## Implementation Strategy

### Step 1: Create Undo Stack Per Workspace
Each workspace should maintain its own undo/redo stack:

```typescript
interface WorkspaceUndoState {
  workspaceId: string;
  undoStack: UndoAction[];
  redoStack: UndoAction[];
  maxStackSize: number;  // e.g., 50 actions
}

interface UndoAction {
  actionType: string;
  timestamp: Date;
  previousState: any;
  newState: any;
  description: string;
}
```

### Step 2: Event Listener for Undo Actions
Create a centralized undo manager that listens to all relevant events:

```typescript
class WorkspaceUndoManager {
  private stacks: Map<string, WorkspaceUndoState>;
  
  constructor() {
    this.stacks = new Map();
    this.registerEventListeners();
  }
  
  registerEventListeners() {
    // Listen to all workspace/formula/ingredient events
    eventBus.on("ingredient-added-to-formula", this.handleAction);
    eventBus.on("formula-added-to-workspace", this.handleAction);
    // ... register all other events
  }
  
  handleAction(event: any) {
    const workspace = this.getWorkspaceStack(event.workspaceId);
    workspace.undoStack.push({
      actionType: event.type,
      timestamp: event.timestamp,
      previousState: event.previousState,
      newState: event.newState,
      description: this.generateDescription(event)
    });
    
    // Clear redo stack when new action is performed
    workspace.redoStack = [];
    
    // Emit undo state update
    eventBus.emit("undo-state-updated", {
      workspaceId: event.workspaceId,
      canUndo: workspace.undoStack.length > 0,
      canRedo: workspace.redoStack.length > 0,
      undoCount: workspace.undoStack.length
    });
  }
  
  undo(workspaceId: string) {
    const workspace = this.getWorkspaceStack(workspaceId);
    if (workspace.undoStack.length === 0) return;
    
    const action = workspace.undoStack.pop()!;
    workspace.redoStack.push(action);
    
    // Emit event to restore previous state
    eventBus.emit(`undo-${action.actionType}`, {
      workspaceId,
      action,
      restoreState: action.previousState
    });
  }
  
  redo(workspaceId: string) {
    const workspace = this.getWorkspaceStack(workspaceId);
    if (workspace.redoStack.length === 0) return;
    
    const action = workspace.redoStack.pop()!;
    workspace.undoStack.push(action);
    
    // Emit event to restore new state
    eventBus.emit(`redo-${action.actionType}`, {
      workspaceId,
      action,
      restoreState: action.newState
    });
  }
}
```

### Step 3: UI Integration
The BulkActionsToolbar already has an Undo button. It should:
1. Listen to `undo-state-updated` events for the current workspace
2. Display undo count badge
3. Trigger `workspaceUndoManager.undo(currentWorkspaceId)` on click

### Step 4: Keyboard Shortcuts
Add keyboard shortcuts for undo/redo:
- Ctrl+Z / Cmd+Z: Undo
- Ctrl+Shift+Z / Cmd+Shift+Z: Redo

## Benefits of This Architecture

1. **Workspace Isolation**: Each workspace has its own undo history
2. **Granular Control**: Can undo specific types of operations
3. **Cross-component**: Works across WorkArea, DataGrid, and other components
4. **Event-driven**: No tight coupling between components
5. **Persistent**: Can serialize undo stacks for session recovery
6. **Scalable**: Easy to add new undoable operations

## Future Enhancements

1. **Undo Grouping**: Group related actions (e.g., bulk delete as single undo)
2. **Selective Undo**: Allow undoing specific actions without undoing everything after
3. **Conflict Resolution**: Handle conflicts when multiple users edit same workspace
4. **Visual Undo History**: Show undo/redo history as a timeline
5. **Persistence**: Save undo history to backend for cross-session recovery

## Current Status

✅ **Implemented**:
- Basic undo for WorkArea operations (appStateHistory)
- Undo button in BulkActionsToolbar
- Event emission for undo state updates

⏳ **Pending**:
- Workspace-level undo stacks
- Comprehensive event emission for all operations
- Centralized undo manager
- Keyboard shortcuts for undo/redo
- Visual history timeline
