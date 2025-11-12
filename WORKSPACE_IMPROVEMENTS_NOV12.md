# Workspace Improvements - November 12, 2025

## Overview
Implemented two major improvements to the workspace system:
1. **Workspace-Scoped Undo/Redo**: Undo operations are now isolated per workspace instead of being global
2. **Workspace Tabs Feature Flag**: Added configurable feature flag to enable/disable workspace tabs UI

## Issue 1: Cross-Workspace Undo Problem

### Problem Statement
Previously, the undo functionality was using a global `appStateHistory` singleton that was shared across all workspaces. This meant:
- Undoing an action in Workspace 1 would affect Workspace 2's history
- Users couldn't isolate their undo stacks by workspace
- Switching between workspaces would have confusing undo behavior

### Root Cause
- `appStateHistory` was created as a global singleton in `src/utils/stateHistory.ts`
- All workspaces called `appStateHistory.push()`, `appStateHistory.undo()` on the same instance
- No per-workspace state management for history

### Solution Implemented

#### 1. Modified WorkspaceContext (src/context/WorkspaceContext.tsx)
```typescript
// Added to WorkspaceData interface:
history: StateHistoryManager; // Per-workspace undo/redo history

// In createEmptyWorkspaceData():
history: new StateHistoryManager(), // Create new history manager for this workspace

// In WorkspaceContextType interface:
getActiveWorkspaceHistory: () => StateHistoryManager;

// Implementation:
const getActiveWorkspaceHistory = useCallback(() => {
  return activeWorkspace.history;
}, [activeWorkspace.history]);
```

**Effect**: Each workspace tab now gets its own `StateHistoryManager` instance that persists with that workspace's data.

#### 2. Created useWorkspaceHistory Hook (src/hooks/useWorkspaceHistory.ts)
```typescript
export const useWorkspaceHistory = (): StateHistoryManager => {
  const workspace = useWorkspace();
  return workspace.getActiveWorkspaceHistory();
};
```

**Effect**: Components can easily access the current workspace's history without importing the global singleton.

#### 3. Updated WorkArea.tsx
**Changes**:
- Removed: `import { appStateHistory } from "../../utils/stateHistory";`
- Added: `import { useWorkspaceHistory } from "../../hooks/useWorkspaceHistory";`
- Added hook call: `const workspaceHistory = useWorkspaceHistory();`
- Replaced all `appStateHistory.push()` → `workspaceHistory.push()`
- Replaced all `appStateHistory.undo()` → `workspaceHistory.undo()`
- Replaced all `appStateHistory.canUndo()` → `workspaceHistory.canUndo()`
- Replaced all `appStateHistory.getUndoCount()` → `workspaceHistory.getUndoCount()`
- Removed duplicate `handleUndoAction` function definition inside useEffect
- Added `workspaceHistory` as dependency to useCallback hooks

**Effect**: WorkArea now uses workspace-scoped history, ensuring undo operations only affect the current workspace.

#### 4. Global appStateHistory Deprecation
- The global `appStateHistory` export in `src/utils/stateHistory.ts` is still available for backward compatibility
- However, it's no longer used by the application
- Recommendation: Remove after verifying all usages have migrated to workspace-scoped history

### Testing Checklist for Issue 1
- [ ] Create Workspace 1, add formula A, undo - should only affect Workspace 1
- [ ] Switch to Workspace 2, add different formula B, undo - should only affect Workspace 2
- [ ] Switch back to Workspace 1, verify undo stack is still available
- [ ] Verify undo count displays correctly per workspace
- [ ] Test with multiple workspaces (up to maxWorkspaces limit)

---

## Issue 2: Workspace Tabs Feature Flag

### Problem Statement
User wanted ability to:
1. Enable/disable the workspace tabs UI completely
2. Configure maximum number of workspaces allowed
3. When disabled, default to single workspace but hide tabs from UI

### Root Cause
- Workspace tabs UI was always rendered
- MAX_TABS was hardcoded in WorkspaceTabs component
- No feature flag configuration for workspace functionality

### Solution Implemented

#### 1. Feature Flag Configuration (src/config/featureFlags.ts)
Already existed with proper configuration:
```typescript
workspace: {
  enableMultiWorkspace: true,      // Enable/disable multi-workspace
  maxWorkspaces: 3,                // Configure max workspaces
  enableWorkspaceNaming: true,     // Enable workspace renaming
  enableWorkspaceSaving: false,    // Future: persist workspaces
  enableWorkspaceTemplates: false, // Future: workspace templates
  showWorkspaceTabs: true,         // MAIN CONTROL: Show/hide tabs UI
  enableWorkspaceIsolation: true,  // Formula locking between workspaces
}
```

**Usage**:
- To **hide tabs from UI**: Set `workspace.showWorkspaceTabs = false`
- To **limit workspaces**: Change `workspace.maxWorkspaces = 1` (or desired number)
- To **disable multi-workspace**: Set `workspace.enableMultiWorkspace = false`

#### 2. Updated AppShell.tsx
```typescript
import { useWorkspaceFeatures } from "../../hooks/useFeatureFlags";

const AppShell = () => {
  const workspaceFeatures = useWorkspaceFeatures();

  return (
    // ... existing JSX ...
    
    {/* Workspace Tabs - Conditionally rendered based on feature flag */}
    {workspaceFeatures.showWorkspaceTabs && (
      <div className="flex items-center justify-between px-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 ml-2">
          <WorkspaceTabs />
        </div>
      </div>
    )}
    
    // ... rest of JSX ...
  );
};
```

**Effect**: Workspace tabs container is only rendered when `showWorkspaceTabs` is true.

#### 3. Updated WorkspaceTabs.tsx
```typescript
import { useWorkspaceFeatures } from "../../hooks/useFeatureFlags";

const WorkspaceTabs = () => {
  const { maxWorkspaces } = useWorkspaceFeatures();
  
  // ... inside dropdown menu ...
  <button
    disabled={tabs.length >= maxWorkspaces}
    className="..."
  >
    <i className="ri-add-line"></i>
    Add Workspace ({tabs.length}/{maxWorkspaces})
  </button>
};
```

**Effect**: 
- Max workspaces limit comes from feature flag, not hardcoded constant
- User can't create more workspaces than `maxWorkspaces` setting
- UI displays current/max ratio dynamically

#### 4. Hook Usage
Both components use the existing `useWorkspaceFeatures()` hook from `src/hooks/useFeatureFlags.ts`:
```typescript
export const useWorkspaceFeatures = () => {
    const { flags } = useFeatureFlags();
    return flags.workspace;
};
```

### Behavior Scenarios

**Scenario 1: Multi-Workspace Enabled (Default)**
```javascript
workspace: {
  enableMultiWorkspace: true,
  maxWorkspaces: 3,
  showWorkspaceTabs: true,
  // ...
}
```
- Users see workspace tabs UI
- Can create up to 3 workspaces
- Undo is scoped per workspace

**Scenario 2: Single Workspace, Tabs Hidden**
```javascript
workspace: {
  enableMultiWorkspace: false,
  maxWorkspaces: 1,
  showWorkspaceTabs: false,
  // ...
}
```
- Workspace tabs UI is hidden
- Only default workspace exists
- Application behaves like single-workspace mode
- Undo still works (scoped to single workspace)

**Scenario 3: Custom Max Workspaces**
```javascript
workspace: {
  enableMultiWorkspace: true,
  maxWorkspaces: 5,        // Increase limit
  showWorkspaceTabs: true,
  // ...
}
```
- Users see tabs UI
- Can create up to 5 workspaces
- UI shows "Add Workspace (n/5)" in menu

### Testing Checklist for Issue 2
- [ ] Default config: tabs visible, can create 3 workspaces
- [ ] Set `showWorkspaceTabs: false`: tabs should not appear
- [ ] Set `maxWorkspaces: 1`: "Add Workspace" button should be disabled
- [ ] Set `maxWorkspaces: 5`: should allow creating 5 workspaces
- [ ] Switch between tabs, verify UI responds correctly
- [ ] When tabs hidden, verify undo/redo still works

---

## Files Modified

### Core Context Changes
1. **src/context/WorkspaceContext.tsx**
   - Added `StateHistoryManager` import
   - Added `history` field to `WorkspaceData` interface
   - Added `getActiveWorkspaceHistory()` method to `WorkspaceContextType`
   - Initialize history manager in `createEmptyWorkspaceData()`
   - Implemented `getActiveWorkspaceHistory` callback

### New Hook
2. **src/hooks/useWorkspaceHistory.ts** (NEW)
   - Custom hook for accessing workspace-scoped history
   - Wraps `getActiveWorkspaceHistory()` from workspace context

### Main Component Changes
3. **src/view/WorkArea/WorkArea.tsx**
   - Removed global `appStateHistory` import
   - Added `useWorkspaceHistory` import
   - Replaced all `appStateHistory` calls with `workspaceHistory`
   - Removed duplicate `handleUndoAction` function
   - Updated dependency arrays for hooks

4. **src/view/AppShell/AppShell.tsx**
   - Added `useWorkspaceFeatures` import
   - Added conditional rendering of workspace tabs based on feature flag
   - Wrapped tabs container in `{workspaceFeatures.showWorkspaceTabs && (...)}`

5. **src/components/workspace/WorkspaceTabs.tsx**
   - Added `useWorkspaceFeatures` import
   - Replaced hardcoded `MAX_TABS` constant with `maxWorkspaces` from feature flag
   - Updated two references to `MAX_TABS` → `maxWorkspaces`

### Configuration (No Changes Needed)
6. **src/config/featureFlags.ts**
   - Already contains correct workspace feature flag configuration
   - All settings already in place

---

## Backward Compatibility

### Global appStateHistory
- Still exported from `src/utils/stateHistory.ts`
- Not used by application anymore
- Safe to remove in future refactoring
- Any external code using it won't break (no changes to class interface)

### Feature Flags
- New feature flags use sensible defaults (`showWorkspaceTabs: true`)
- Existing apps won't change behavior without explicit config change
- Can be controlled via:
  - Direct config edits in `featureFlags.ts`
  - Environment variables (if using `applyEnvironmentOverrides()`)
  - URL parameters (if `enableUrlOverrides: true`)

---

## Architecture Improvements

### Before (Issues)
```
WorkArea (Component A) ─┐
                        ├─→ appStateHistory (Global Singleton)
WorkArea (Component B) ─┘
```
- Single global history for all workspaces
- No isolation
- Cross-workspace undo contamination

### After (Solution)
```
Workspace 1 Context ─→ WorkspaceData { history: StateHistoryManager #1 } ─→ useWorkspaceHistory() ─→ WorkArea
Workspace 2 Context ─→ WorkspaceData { history: StateHistoryManager #2 } ─→ useWorkspaceHistory() ─→ WorkArea
Workspace 3 Context ─→ WorkspaceData { history: StateHistoryManager #3 } ─→ useWorkspaceHistory() ─→ WorkArea
```
- Each workspace has isolated history
- Clean dependency injection via context
- Scalable to any number of workspaces

---

## Configuration Examples

### Example 1: Disable Workspace Tabs (Keep Single Workspace)
Edit `src/config/featureFlags.ts`:
```typescript
workspace: {
  enableMultiWorkspace: false,
  maxWorkspaces: 1,
  showWorkspaceTabs: false,  // ← Hide tabs
  // ... other settings
}
```

### Example 2: Allow More Workspaces
Edit `src/config/featureFlags.ts`:
```typescript
workspace: {
  enableMultiWorkspace: true,
  maxWorkspaces: 10,  // ← Increase from 3 to 10
  showWorkspaceTabs: true,
  // ... other settings
}
```

### Example 3: Environment-Based Configuration
Add to `applyEnvironmentOverrides()` function:
```typescript
if (env === 'production') {
  featureFlags.workspace.maxWorkspaces = 2;  // Limit in production
  featureFlags.workspace.showWorkspaceTabs = true;
} else if (env === 'development') {
  featureFlags.workspace.maxWorkspaces = 5;  // More freedom in dev
}
```

---

## Deployment Notes

### Build & Test Steps
1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Preview: `npm run preview`
4. Run dev: `npm run dev`

### Verification Steps
1. **Undo Isolation**:
   - Open 2+ workspaces
   - Make changes in each
   - Verify undo only affects current workspace

2. **Feature Flag Control**:
   - Set `showWorkspaceTabs: false` and rebuild
   - Verify tabs disappear but app still works
   - Set back to true

3. **Tab Limits**:
   - Set `maxWorkspaces: 2`
   - Verify can create 2, but not 3
   - Set back to 3

---

## Future Enhancements

1. **Undo/Redo Per-Feature**: Could extend to undo individual actions (add, delete, edit)
2. **Persistent Workspace History**: Save history to localStorage per workspace
3. **Undo Export**: Allow exporting workspace history for audit purposes
4. **Undo/Redo Shortcuts**: Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z) per workspace
5. **Undo Visualization**: Timeline view of workspace actions

---

## Summary

Both requirements have been successfully implemented:

✅ **Issue 1: Workspace-Scoped Undo**
- Undo operations are now isolated per workspace
- Each workspace maintains its own undo/redo stack
- Switching between workspaces preserves undo state

✅ **Issue 2: Workspace Tabs Feature Flag**
- Workspace tabs can be hidden via feature flag
- Maximum workspaces is configurable
- Single workspace mode hides tabs but keeps functionality

The implementation follows React best practices and maintains backward compatibility with existing code.
