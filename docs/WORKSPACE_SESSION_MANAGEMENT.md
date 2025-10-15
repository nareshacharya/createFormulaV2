# Workspace Session Management

## Overview
This document describes the workspace session management system that allows users to work with multiple isolated workspace sessions simultaneously.

## Architecture

### Key Components

#### 1. WorkspaceContext (`src/context/WorkspaceContext.tsx`)
Central state management for all workspace sessions. Provides:
- **Multi-tab Support**: Up to 3 concurrent workspace tabs
- **Session Isolation**: Each tab maintains independent state (columns, data, selections)
- **Formula Locking**: Prevents formula editing conflicts across workspaces
- **Global Data**: Shared resources (available formulas, ingredients, attributes)

**Exported Types:**
```typescript
interface WorkspaceData {
  columns: Column[];
  tableData: Record<string, unknown>[];
  selectedFormulaIds: string[];
  editableFormula: string | null;
  selectedAttributes: string[];
  selectedFormulas: Formula[];
  formulas: Formula[];
  lockedFormulas: Set<string>;
}

interface WorkspaceTab {
  id: string;
  name: string;
  lastModified: Date;
  isDefault: boolean;
  data: WorkspaceData;
}
```

**Key Methods:**
- `addTab()`: Creates new workspace (max 3)
- `closeTab(tabId)`: Closes workspace and unlocks its formulas
- `switchTab(tabId)`: Switches active workspace
- `renameTab(tabId, name)`: Renames workspace
- `resetWorkspace(tabId)`: Resets workspace to fresh state
- `updateWorkspaceData(data)`: Updates active workspace state
- `lockFormula(formulaId)`: Locks formula in current workspace
- `unlockFormula(formulaId)`: Unlocks formula from current workspace
- `isFormulaLocked(formulaId)`: Checks if formula is locked in another workspace
- `getFormulaLockedInWorkspace(formulaId)`: Returns workspace name where formula is locked

#### 2. WorkspaceTabs Component (`src/components/workspace/WorkspaceTabs.tsx`)
UI component for managing workspace tabs:
- **Visual Tab Interface**: Shows active and inactive workspaces
- **Inline Renaming**: Double-click to rename (max 20 chars)
- **Tab Operations**: Add/close/switch tabs
- **Last Modified**: Tooltip shows last modification time
- **Keyboard Support**: Enter to save, Escape to cancel rename

**Features:**
- Maximum 3 tabs enforced
- Default "Alpha" workspace cannot be closed
- Active tab highlighted with purple theme
- Hover shows close button for non-default tabs

#### 3. useWorkspace Hook (`src/hooks/useWorkspace.ts`)
Custom hook for accessing workspace context:
```typescript
const {
  tabs,                      // All workspace tabs
  activeTabId,              // Current active tab ID
  activeWorkspace,          // Current workspace data
  addTab,                   // Add new workspace
  closeTab,                 // Close workspace
  switchTab,                // Switch to workspace
  renameTab,                // Rename workspace
  resetWorkspace,           // Reset workspace
  updateWorkspaceData,      // Update workspace state
  isFormulaLocked,          // Check formula lock status
  getFormulaLockedInWorkspace, // Get locking workspace name
  lockFormula,              // Lock formula
  unlockFormula,            // Unlock formula
  availableFormulas,        // Global formulas list
  ingredients,              // Global ingredients list
  attributes,               // Global attributes list
  setAvailableFormulas,     // Update formulas
  setIngredients,           // Update ingredients
  setAttributes,            // Update attributes
} = useWorkspace();
```

## User Workflows

### 1. Creating a New Workspace
**User Action:** Click "+ Add Workspace" in tab menu

**System Behavior:**
1. Validates maximum tabs not exceeded (max 3)
2. Creates new tab with empty state
3. Generates unique tab ID and default name
4. Switches to new tab automatically
5. Shows success toast: "New workspace 'Workspace 2' created - Fresh session started"

**Result:** User has fresh workspace with no formulas, ingredients, or data

### 2. Working in Multiple Workspaces
**User Action:** User adds Formula A to Workspace 1, then switches to Workspace 2

**System Behavior:**
1. Formula A is locked in Workspace 1 (added to `lockedFormulas` Set)
2. When switching to Workspace 2, workspace data loads independently
3. If user attempts to add Formula A in Workspace 2:
   - System checks `isFormulaLocked(formulaA.id)` → returns `true`
   - Shows error toast: "Formula 'Formula A' is already used in workspace 'Workspace 1' and cannot be edited here"
   - Formula can still be loaded in read-only mode for reference

**Result:** Each workspace maintains isolated formula assignments

### 3. Closing a Workspace
**User Action:** Click close button on workspace tab

**System Behavior:**
1. Validates not closing default workspace
2. Unlocks all formulas from that workspace (clears `lockedFormulas` Set)
3. Removes tab from tabs array
4. If closing active tab, switches to first available tab
5. Shows success toast with workspace name

**Result:** Formulas previously locked in that workspace become available again

### 4. Renaming a Workspace
**User Action:** Double-click tab or select "Rename Active" from menu

**System Behavior:**
1. Shows inline input field with current name
2. User types new name (max 20 characters)
3. Press Enter to save or Escape to cancel
4. Updates workspace name and `lastModified` timestamp
5. Shows success toast: "Workspace renamed"

**Result:** Workspace has custom name for better organization

## Formula Locking Logic

### Lock States

#### Unlocked Formula
- Not used in any workspace
- Can be added to any workspace
- Can be edited when added

#### Locked Formula
- Used in another workspace
- Can be viewed in current workspace (read-only)
- Cannot be edited in current workspace
- Displays warning when attempting to add

### Lock Checking Flow
```
User clicks formula in library
    ↓
Event: "formula-selected"
    ↓
Check: isFormulaLocked(formulaId)
    ↓
    ├─ TRUE  → Show error toast with workspace name
    │         → Block addition or mark as read-only
    └─ FALSE → Add formula normally
              → Lock formula in current workspace
```

### Lock Lifecycle
```
Formula added to Workspace A
    ↓
lockFormula(formulaId) in Workspace A
    ↓
[Formula is locked]
    ↓
User switches to Workspace B
    ↓
Attempts to add same formula
    ↓
isFormulaLocked(formulaId) → TRUE
    ↓
Show error or load read-only
    ↓
User closes Workspace A
    ↓
unlockFormula(formulaId) - clears all locks from A
    ↓
[Formula is unlocked]
    ↓
Now available in Workspace B
```

## Data Flow

### Workspace Initialization
```
App.tsx
    ↓
WorkspaceProvider wraps entire app
    ↓
Creates default "Alpha" workspace
    ↓
Initializes with empty columns and data
    ↓
Sets up event bus listeners
```

### State Updates
```
User action in WorkArea
    ↓
Calls useWorkspace hook
    ↓
updateWorkspaceData({ tableData: [...] })
    ↓
Updates active workspace in context
    ↓
React re-renders with new state
    ↓
All components see updated data
```

### Cross-Workspace Communication
```
Workspace A - User adds Formula X
    ↓
lockFormula(formulaX.id)
    ↓
Formula X added to Workspace A's lockedFormulas Set
    ↓
Switch to Workspace B
    ↓
User tries to add Formula X
    ↓
isFormulaLocked(formulaX.id) checks all other workspaces
    ↓
Finds Formula X in Workspace A's locked set
    ↓
Returns TRUE + workspace name
    ↓
Shows error message to user
```

## Integration Points

### AppShell Layout
```
<WorkspaceProvider>
  <AppHeader />
  <WorkspaceTabs />          ← Positioned below header
  <MainContent>
    <LibraryPanel />
    <WorkArea />             ← No longer contains WorkspaceTabs
  </MainContent>
</WorkspaceProvider>
```

### Event Bus Integration
The workspace system integrates with existing event bus:
- `ingredient-selected`: Adds ingredient to active workspace
- `formula-selected`: Checks locks, adds to active workspace
- `attribute-selected`: Validates and adds to active workspace
- `create-formula`: Creates in active workspace context
- `active-formula-changed`: Updates active workspace's editableFormula

### Component Communication
```
Library Panel → Event Bus → WorkArea Handlers → useWorkspace → Context
                                    ↓
                            Check isFormulaLocked()
                                    ↓
                            Update activeWorkspace data
```

## Best Practices

### For Developers

1. **Always use useWorkspace hook**: Don't access context directly
2. **Check formula locks before operations**: Prevents conflicts
3. **Update workspace data immutably**: Use spread operators
4. **Clean up on workspace close**: Unlock formulas properly
5. **Emit events for cross-component updates**: Keep components synchronized

### For Users

1. **Name workspaces clearly**: Makes switching easier
2. **Close unused workspaces**: Frees up formulas
3. **Check which workspace you're in**: Look at active tab
4. **Don't exceed 3 workspaces**: System enforces limit

## Performance Considerations

- **Lazy state updates**: Only active workspace renders
- **Efficient lock checking**: O(n) where n = number of tabs (max 3)
- **Minimal re-renders**: Context updates only affect subscribed components
- **Local storage potential**: Can persist workspace state (future enhancement)

## Future Enhancements

### Planned Features
1. **Workspace Persistence**: Save/load workspace sessions
2. **Undo/Redo per Workspace**: Independent action history
3. **Workspace Comparison**: Side-by-side formula comparison
4. **Shared Formulas**: Copy formula from one workspace to another
5. **Workspace Templates**: Start with predefined configurations

### Technical Improvements
1. **TypeScript strict mode**: Full type coverage
2. **Unit tests**: Test context operations
3. **Performance monitoring**: Track state update times
4. **Error boundaries**: Graceful workspace error handling

## Troubleshooting

### Formula Won't Add to Workspace
**Issue:** "Formula is already used in workspace..."
**Solution:** Close the other workspace or use different formula

### Workspace Tab Won't Close
**Issue:** Close button doesn't appear
**Solution:** Cannot close default "Alpha" workspace - it's permanent

### Lost Workspace Data
**Issue:** Workspace data disappeared after refresh
**Solution:** Current system doesn't persist - feature planned for future

### Maximum Tabs Reached
**Issue:** "Maximum of 3 tabs allowed"
**Solution:** Close an existing workspace to create new one

## Migration Notes

### Changes from Old System
- ❌ Removed: WorkspaceTabs inside WorkArea component
- ✅ Added: WorkspaceTabs below header in AppShell
- ✅ Added: WorkspaceContext for global state management
- ✅ Added: Formula locking mechanism
- ✅ Changed: Session isolation per workspace

### Breaking Changes
- WorkArea no longer manages workspace tabs internally
- State must be accessed via useWorkspace hook
- Direct state mutations no longer work - use updateWorkspaceData()

## Code Examples

### Adding a Workspace Tab
```typescript
const { addTab } = useWorkspace();

const handleAddWorkspace = () => {
  addTab(); // Automatically validates max tabs
};
```

### Checking Formula Lock
```typescript
const { isFormulaLocked, getFormulaLockedInWorkspace } = useWorkspace();

const handleFormulaClick = (formula: Formula) => {
  if (isFormulaLocked(formula.id)) {
    const workspaceName = getFormulaLockedInWorkspace(formula.id);
    alert(`Formula locked in ${workspaceName}`);
    return;
  }
  // Add formula...
};
```

### Updating Workspace Data
```typescript
const { updateWorkspaceData, activeWorkspace } = useWorkspace();

const addIngredient = (ingredient: Ingredient) => {
  const newTableData = [
    ...activeWorkspace.tableData,
    { id: ingredient.id, name: ingredient.name }
  ];
  
  updateWorkspaceData({ tableData: newTableData });
};
```

---

**Last Updated:** October 15, 2025
**Version:** 1.0.0
**Authors:** Development Team
