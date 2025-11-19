# Project Mapping Persistence Implementation

**Date:** November 2024  
**Status:** ✅ Completed

## Overview

Successfully implemented workspace-level project mapping persistence. Project mappings for formulas are now stored in the WorkspaceContext instead of component state, ensuring they persist across formula switches and survive workspace save/load cycles.

## Problem Statement

**Initial Issue:** When users mapped a formula to a project and switched between formulas, the project mapping was lost because it was stored only in component local state (`Header.Badges.tsx`).

**User Scenario:**
1. Create new version of "Woody Amber" formula
2. Click Project dropdown and select a project mapping
3. Switch to another formula
4. Switch back to original formula
5. **Bug:** Project mapping is gone

**Root Cause:** Project mapping state was local to `Header.Badges` component:
```typescript
const [mappedProject, setMappedProject] = useState<Project | null>(null);
```

This state was transient and not connected to workspace context, so switching formulas or workspaces would clear it.

## Solution Architecture

### 1. **WorkspaceContext Updates** (`src/context/WorkspaceContext.tsx`)

#### Added to WorkspaceData Interface
```typescript
interface WorkspaceData {
  // ... existing fields ...
  projectMappings: Record<string, { id: string; name: string }>; // Map of formulaId -> { projectId, projectName }
}
```

#### Added Three Helper Methods to WorkspaceContext

1. **`setProjectMapping(formulaId, projectId, projectName)`**
   - Writes project mapping to current workspace
   - Updates workspace state and lastModified timestamp
   - Per-workspace isolation - each tab has its own mappings

2. **`getProjectMapping(formulaId)`**
   - Reads project mapping from workspace context
   - Returns `{ id, name }` or `null` if not mapped
   - Reactive - updates when workspace changes

3. **`clearProjectMapping(formulaId)`**
   - Removes project mapping from current workspace
   - Updates workspace state and lastModified timestamp

#### Initialization
```typescript
const createEmptyWorkspaceData = (): WorkspaceData => ({
  // ... other fields ...
  projectMappings: {}, // Initialize empty on new workspace
});
```

### 2. **Header.Badges Component Refactor** (`src/view/AppShell/Header.Badges.tsx`)

#### Replaced Local State with Context
**Before:**
```typescript
const [mappedProject, setMappedProject] = useState<Project | null>(null);
const [isProjectSearchOpen, setIsProjectSearchOpen] = useState(false);
```

**After:**
```typescript
const workspaceContext = useContext(WorkspaceContext);

// Get mapped project from workspace context instead of local state
const mappedProject = 
  workspaceContext && currentFormula
    ? workspaceContext.getProjectMapping(currentFormula.id)
    : null;
```

#### Updated handleProjectSelect Handler
```typescript
const handleProjectSelect = (project: Project) => {
  if (!workspaceContext || !currentFormula) return;
  
  // Write to workspace context (PERSISTED)
  workspaceContext.setProjectMapping(currentFormula.id, project.id, project.name);
  
  // Close UI
  setIsProjectSearchOpen(false);
  setProjectSearchQuery("");
  
  // Emit event for backward compatibility
  eventBus.emit("project-mapped-to-formula", {
    formulaId: currentFormula?.id,
    projectId: project.id,
    projectName: project.name,
  });
};
```

## Data Flow

### Write Flow (User Selects Project)
```
Header.Badges handleProjectSelect()
    ↓
workspaceContext.setProjectMapping(formulaId, projectId, projectName)
    ↓
Update WorkspaceTab.data.projectMappings
    ↓
Update WorkspaceTab.lastModified = new Date()
    ↓
Trigger re-render via setState
```

### Read Flow (Formula Changes)
```
Switch to different formula or workspace
    ↓
activeFormula and/or activeTabId changes
    ↓
Component re-renders
    ↓
mappedProject = workspaceContext.getProjectMapping(currentFormula.id)
    ↓
Reads from activeWorkspace.projectMappings[formulaId]
    ↓
Display project name if mapping exists
```

### Persistence (Workspace Save)
```
User clicks Save
    ↓
WorkspaceContext captures activeWorkspace.data
    ↓
projectMappings included in captured data
    ↓
saveWorkspace() called with full WorkspaceData
    ↓
Stored to localStorage as part of workspace state
    ↓
On next load: projectMappings restored with other workspace data
```

## Key Features

✅ **Workspace-Level Isolation**: Each workspace tab has separate project mappings  
✅ **Formula-Specific**: Mappings keyed by formula ID, different versions have separate mappings  
✅ **Persistence Across Switches**: Survives switching between formulas and tabs  
✅ **Save/Load Support**: Included in workspace serialization  
✅ **Backward Compatible**: EventBus events still emitted for any listeners  
✅ **Type-Safe**: Full TypeScript support with proper interfaces  
✅ **Clean API**: Three simple methods (set, get, clear)  

## Use Cases

### Use Case 1: Single Formula, Multiple Workspaces
- User creates "Woody Amber" formula in Workspace A
- Maps it to "Fragrance Lab Pro" project
- Switches to Workspace B
- Same formula has no project mapping in Workspace B
- Each workspace maintains independent mapping

### Use Case 2: Formula Versioning
- User has "Woody Amber v1" (formulaId: "f123")
- Maps to "Fragrance Lab Pro" project
- Creates new version "Woody Amber v2" (formulaId: "f124")
- v2 starts with no project mapping
- Later assigns v2 to "Beauty Formulations" project
- v1 still has original mapping

### Use Case 3: Workspace Persistence
- User creates mapping in workspace
- Clicks "Save Workspace" button
- Workspace saved to localStorage with projectMappings
- Browser refresh
- Load workspace from localStorage
- Project mapping restored and visible

## Testing Scenarios

### Test 1: Basic Mapping & Switch
1. Create formula "Test Formula"
2. Click Project dropdown
3. Select "Fragrance Lab Pro"
4. Switch to another formula
5. Switch back to "Test Formula"
6. **Expected:** "Fragrance Lab Pro" still displayed

### Test 2: Multiple Formula Mappings
1. Create two formulas: A and B
2. Map A → "Project 1"
3. Map B → "Project 2"
4. Switch A ↔ B repeatedly
5. **Expected:** Each formula maintains its own mapping

### Test 3: Workspace Tab Isolation
1. In Tab 1: Create formula and map to "Project X"
2. Switch to Tab 2
3. Create same formula
4. Map to "Project Y"
5. Switch back to Tab 1
6. **Expected:** Still shows "Project X"

### Test 4: Workspace Save/Load
1. Create mapping in current workspace
2. Click Save button and enter workspace name
3. Verify saved (notification or list)
4. Hard refresh browser
5. Load workspace from selector
6. **Expected:** Mapping persists and displays correctly

## Files Modified

### 1. `src/context/WorkspaceContext.tsx`
- **Lines 21:** Added `projectMappings` field to WorkspaceData interface
- **Line 46-48:** Added three methods to WorkspaceContextType interface
- **Line 146:** Initialize empty projectMappings in createEmptyWorkspaceData
- **Lines 370-428:** Implemented three helper methods (setProjectMapping, getProjectMapping, clearProjectMapping)
- **Lines 439-455:** Added methods to value object returned from context
- **Lines 464-481:** Added methods to useMemo dependency array

### 2. `src/view/AppShell/Header.Badges.tsx`
- **Line 1:** Added useContext import
- **Line 3:** Added WorkspaceContext import
- **Line 25:** Added workspaceContext = useContext(WorkspaceContext)
- **Lines 48-70:** Simplified useEffect to remove project-specific logic
- **Lines 116-131:** Updated handleProjectSelect to use workspace context
- **Lines 133-136:** Computed mappedProject from workspace context instead of state

## Architecture Decisions

### Why Workspace-Level Instead of Global?
- **Formula Locking:** Already precedent in WorkspaceContext for formula-specific per-workspace state
- **Isolation:** Different users/workflows may map same formula to different projects
- **Scalability:** Works for any number of formulas without performance impact

### Why Not LocalStorage Directly?
- **Consistency:** Workspace context is single source of truth
- **Type Safety:** TypeScript ensures projectMappings structure
- **Reactivity:** Context changes trigger component re-renders
- **Lifecycle:** Mappings automatically cleared when workspace is deleted

### Why Record Instead of Map?
- **Serializability:** Record<> is JSON-serializable for persistence
- **Simplicity:** Object notation more familiar than Map
- **Performance:** O(1) lookup by formulaId
- **TypeScript:** Better IDE autocomplete and type checking

## Backward Compatibility

✅ All existing code continues to work  
✅ EventBus events still emitted for listeners  
✅ Formula model unchanged  
✅ No breaking changes to public APIs  
✅ localStorage format compatible  

## Future Enhancements

### Potential Additions
- [ ] "Copy project mapping" when duplicating formula
- [ ] "Auto-map" feature to suggest projects based on formula name
- [ ] Project mapping templates for workspace
- [ ] Batch project mapping changes
- [ ] Project mapping history/undo support
- [ ] Export/import project mappings with workspace

### Related Features to Consider
- [ ] Project validation (verify project exists in backend)
- [ ] Permission checks (user can only map to assigned projects)
- [ ] Last mapped timestamp per formula
- [ ] Project mapping change notifications

## Verification

✅ **TypeScript Compilation:** `npm run build` succeeds  
✅ **No New Errors:** All 166 modules transform successfully  
✅ **File Structure:** Changes isolated to WorkspaceContext and Header.Badges  
✅ **Imports:** All new imports properly added  
✅ **Methods:** All three methods exposed in context value object  
✅ **Dependencies:** All methods added to useMemo dependency array  

## Deployment Notes

- **Database Changes:** None required
- **API Changes:** None required  
- **Configuration:** No changes to feature flags needed
- **Migration:** Existing workspaces automatically initialized with empty projectMappings
- **Rollback:** Safe - old workspaces without projectMappings work fine (defaults to null)

## Summary

Project mapping persistence has been successfully implemented by moving state from component-level to workspace-level context management. The solution leverages existing WorkspaceContext architecture and follows established patterns for per-workspace data storage. Users can now confidently map formulas to projects knowing the mapping will persist across formula switches and workspace save/load cycles.
