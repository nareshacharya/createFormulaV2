# Workspace Management Feature

## Overview
The workspace management system allows users to save and switch between up to 3 different workspace states. Each workspace preserves the entire application state including formulas, ingredients, attributes, and UI configurations.

## Components

### 1. WorkspaceManager (`src/utils/workspaceManager.ts`)
Core utility for managing workspace state persistence using localStorage.

#### Key Functions:
- `getWorkspaces()` - Retrieve all saved workspaces
- `getActiveWorkspaceId()` - Get the currently active workspace ID
- `saveWorkspace(name, state, id?)` - Save or update a workspace
- `deleteWorkspace(id)` - Delete a workspace
- `renameWorkspace(id, newName)` - Rename a workspace
- `canCreateWorkspace()` - Check if more workspaces can be created (max 3)

#### WorkspaceState Interface:
```typescript
interface WorkspaceState {
  formulas: unknown[];
  ingredients: unknown[];
  attributes: unknown[];
  selectedFormulas: string[];
  activeFormulaId: string | null;
  expandedIngredients: string[];
  filters: Record<string, unknown>;
  lastModified: string;
}
```

### 2. WorkspaceSelector (`src/components/WorkspaceSelector.tsx`)
Tab-based UI component for switching between workspaces and managing them.

**Features:**
- Workspace tabs showing all saved workspaces
- Active workspace highlighting
- Dropdown menu with workspace management options
- Rename workspace inline
- Delete workspace with confirmation
- Visual indicator for active workspace
- Last modified timestamp display

**Props:**
```typescript
interface WorkspaceSelectorProps {
  onWorkspaceChange: (workspace: Workspace | null) => void;
  onSaveWorkspace: () => void;
}
```

### 3. SaveWorkspaceModal (`src/components/SaveWorkspaceModal.tsx`)
Modal dialog for creating new workspaces with custom names.

**Features:**
- Input field for workspace name
- Default name generation with timestamp
- Enter key support for quick save
- Input validation
- Cancel/Save actions

**Props:**
```typescript
interface SaveWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName?: string;
}
```

### 4. Updated Header.Actions (`src/view/AppShell/Header.Actions.tsx`)
Enhanced header with workspace management and consistent rounded icons.

**New Features:**
- Workspace selector integrated in header
- "Save State" button (replaces "Run Compliance")
- All action icons now use consistent rounded-full design
- Visual separators between action groups
- Improved icon consistency (all using Remix Icons)

**Icon Updates:**
- ✅ New Formula: `ri-flask-line` with `ri-add-line` overlay (rounded)
- ✅ Merge Duplicates: `ri-git-merge-line` (rounded)
- ✅ Normalize: `ri-scales-3-line` (rounded) - better fit for perfume context
- ✅ Send for Compounding: `ri-send-plane-line` (rounded)
- ✅ Save State: `ri-save-3-line` (button with icon)
- ✅ Undo: `ri-arrow-go-back-line` (rounded with counter badge)
- ✅ More Actions: `ri-more-2-fill` (rounded)

## Usage

### Creating a Workspace
1. Click the "Save State" button in the header
2. Enter a meaningful name in the modal
3. Click "Save Workspace"
4. Workspace is created and set as active

### Switching Workspaces
1. Click on any workspace tab in the header
2. Application loads that workspace's state
3. Tab becomes highlighted as active

### Managing Workspaces
1. Click the dropdown toggle button (⋮) next to workspace tabs
2. Options available:
   - View all workspaces with details
   - Rename workspace (click edit icon)
   - Delete workspace (click delete icon with confirmation)
   - Save current state as new workspace

### Renaming a Workspace
1. Open workspace dropdown
2. Click edit icon next to workspace name
3. Type new name
4. Click checkmark or press Enter to save
5. Click X or press Escape to cancel

### Deleting a Workspace
1. Open workspace dropdown
2. Click delete icon next to workspace name
3. Confirm deletion in prompt
4. If deleted workspace was active, first remaining workspace becomes active

## Event System

### Events Emitted:
- `request-workspace-state` - Request current application state for saving
- `load-workspace-state` - Load workspace state into application

### Events to Implement in WorkArea:
```typescript
// Listen for workspace state requests
eventBus.on("request-workspace-state", () => {
  // Gather current state and emit back
  const state = gatherCurrentState();
  eventBus.emit("workspace-state-ready", { state });
});

// Listen for workspace load requests
eventBus.on("load-workspace-state", ({ state }) => {
  // Load the workspace state
  loadWorkspaceState(state);
});
```

## Storage Details

### LocalStorage Keys:
- `pega_workspaces` - Array of all workspace objects
- `pega_active_workspace_id` - ID of currently active workspace

### Storage Limits:
- Maximum 3 workspaces
- Uses browser localStorage (typically 5-10 MB per domain)
- Each workspace stores complete application state

## Design Specifications

### Header Layout:
```
[Workspace Tabs] [⋮] | [Actions Group] | [Save State] [Undo] [More]
```

### Visual Design:
- **Background**: Purple-800 (`bg-purple-800`)
- **Separators**: Purple-600 vertical lines
- **Active Tab**: White background with purple text
- **Inactive Tabs**: Purple-700 background with white text
- **Action Buttons**: 
  - Size: 36px × 36px (`w-9 h-9`)
  - Shape: Circular (`rounded-full`)
  - Background: Purple-700 (`bg-purple-700`)
  - Hover: Purple-600 (`hover:bg-purple-600`)
  - Disabled: 50% opacity (`bg-purple-700/50`)
  - Shadow: Small shadow (`shadow-sm`)
- **Save State Button**:
  - Background: Blue-600 (`bg-blue-600`)
  - Hover: Blue-700 (`hover:bg-blue-700`)
  - Shape: Rounded rectangle (`rounded-lg`)
  - Icon + Text

### Icon Consistency:
All icons from Remix Icon library (already included in index.html):
- Size: `text-base` (16px) for consistency
- Color: `text-white` on purple background
- Style: Line icons preferred for clean look

## Future Enhancements

### Planned Features:
1. **Auto-save**: Automatically save workspace on interval
2. **Cloud Sync**: Sync workspaces across devices using Pega DX APIs
3. **Workspace Export/Import**: Download/upload workspace as JSON
4. **Workspace Templates**: Predefined workspace configurations
5. **Workspace Sharing**: Share workspace with team members
6. **Workspace History**: Undo/redo within workspace
7. **Workspace Comparison**: Compare two workspaces side-by-side

### API Integration (Future):
```typescript
// Example API calls for cloud sync
const syncWorkspaceToCloud = async (workspace: Workspace) => {
  await PegaService.saveWorkspace(workspace);
};

const fetchWorkspacesFromCloud = async () => {
  return await PegaService.getWorkspaces();
};
```

## Best Practices

### Workspace Naming:
- Use descriptive names: "Summer 2024 Collection", "Rose Variants"
- Include date/time for iterations: "Formula Testing - 10/14"
- Avoid generic names: "Workspace 1", "Test"

### When to Save:
- Before major changes
- Before switching tasks
- End of work session
- After completing a milestone

### Workspace Organization:
- Use Workspace 1 for active/current work
- Use Workspace 2 for experimental variations
- Use Workspace 3 for reference/comparison

## Troubleshooting

### Issue: Cannot create more workspaces
**Solution**: Maximum of 3 workspaces allowed. Delete an existing workspace first.

### Issue: Workspace not saving
**Solution**: Check browser localStorage is enabled and not full.

### Issue: Workspace state not loading
**Solution**: Verify event handlers are properly set up in WorkArea component.

### Issue: Icons not displaying
**Solution**: Ensure Remix Icon CSS is loaded in index.html:
```html
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" rel="stylesheet">
```

## Testing Checklist

- [ ] Create new workspace with custom name
- [ ] Switch between workspaces
- [ ] Rename workspace
- [ ] Delete workspace (with confirmation)
- [ ] Delete last workspace (should prevent)
- [ ] Try creating 4th workspace (should show error)
- [ ] Workspace persists after browser refresh
- [ ] Active workspace indicator works correctly
- [ ] All rounded icons display correctly
- [ ] Icons are consistent in size and style
- [ ] Save State button functions correctly
- [ ] Undo counter badge displays properly
- [ ] Workspace dropdown closes on outside click
- [ ] Workspace tabs responsive on different screen sizes

## Code Examples

### Implementing State Collection in WorkArea:
```typescript
// In WorkArea component
useEffect(() => {
  const handleWorkspaceStateRequest = () => {
    const state: WorkspaceState = {
      formulas: formulas,
      ingredients: ingredients,
      attributes: attributes,
      selectedFormulas: selectedFormulas.map(f => f.id),
      activeFormulaId: activeFormula?.id || null,
      expandedIngredients: expandedRows,
      filters: currentFilters,
      lastModified: new Date().toISOString(),
    };
    
    eventBus.emit("workspace-state-ready", { state });
  };

  eventBus.on("request-workspace-state", handleWorkspaceStateRequest);
  
  return () => {
    eventBus.off("request-workspace-state", handleWorkspaceStateRequest);
  };
}, [formulas, ingredients, attributes, selectedFormulas, activeFormula, expandedRows, currentFilters]);
```

### Loading Workspace State:
```typescript
// In WorkArea component
useEffect(() => {
  const handleLoadWorkspace = ({ state }: { state: WorkspaceState }) => {
    // Load state into application
    setFormulas(state.formulas);
    setIngredients(state.ingredients);
    setAttributes(state.attributes);
    // ... load other state
    
    toast.success("Workspace loaded successfully");
  };

  eventBus.on("load-workspace-state", handleLoadWorkspace);
  
  return () => {
    eventBus.off("load-workspace-state", handleLoadWorkspace);
  };
}, []);
```

## Performance Considerations

- **localStorage**: Fast synchronous access, but limited to ~5MB
- **State Size**: Monitor workspace state size, compress if needed
- **Debouncing**: Consider debouncing auto-save to reduce writes
- **Cleanup**: Regularly clean up old/unused workspaces

## Security Notes

- Workspace data stored in localStorage (client-side only)
- No sensitive data should be stored without encryption
- Future cloud sync will use Pega authentication
- Consider adding workspace password protection for sensitive formulas
