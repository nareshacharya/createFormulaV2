# Formula Management Fixes - October 29, 2025

## Overview
Fixed multiple critical issues related to formula ID generation, version creation, editability, and access control for reference formulas.

## Issues Fixed

### ✅ 1. Formula ID Format - Create New Formula (Issue #3)
**Problem:** Creating new formulas generated incorrect IDs like `FORM1761658577906` instead of proper format `NP-F-00001v1`.

**Solution:**
- Created centralized `formulaIdGenerator.ts` utility with `generateNewFormulaId()` function
- Updated `WorkArea.tsx` `handleCreateFormula()` to use new generator
- Updated `WorkArea.tsx` `handleFormulaModalCreateFormula()` to use new generator  
- Updated `FormulaModal.tsx` to use `v1` version format instead of `1.0`

**Files Changed:**
- NEW: `src/utils/formulaIdGenerator.ts` (140 lines)
- `src/view/WorkArea/WorkArea.tsx` - 2 functions updated
- `src/components/FormulaModal.tsx` - version format updated

**Formula ID Generator Features:**
```typescript
generateNewFormulaId({
  existingFormulas: Formula[],
  baseFormula?: Formula,         // For versioning
  isReferenceFromOtherProject?: boolean
})
```

Generates IDs in format: `{INITIALS}-F-{5-DIGIT-SEQ}v{VERSION}`
- Example: `NP-F-00001v1`, `NP-F-00002v3`

---

### ✅ 2. Formula Version ID Pattern (Issue #2)
**Problem:** Creating version of `NP-F-00003v1` generated `NP-F-00003v1v2` instead of `NP-F-00003v2` for same user.

**Solution:**
- Updated `FormulaColumnHandlers.tsx` `handleCreateVersion()`
- Now uses `generateNewFormulaId()` with `baseFormula` parameter
- Extracts base ID without version suffix before incrementing
- Properly handles same-user vs. different-user scenarios

**Logic:**
```typescript
// Same user: NP-F-00003v1 → NP-F-00003v2
generateNewFormulaId({
  existingFormulas: availableFormulas,
  baseFormula: formula,
  isReferenceFromOtherProject: false
})

// Different user: JD-F-00005v1 → NP-F-00001v1 (new ID for current user)
generateNewFormulaId({
  existingFormulas: availableFormulas,
  isReferenceFromOtherProject: true
})
```

**Files Changed:**
- `src/view/WorkArea/components/FormulaColumnHandlers.tsx`

---

### ✅ 3. Target Total Row Editability (Issue #7)
**Problem:** Target total row for active formula became read-only when it should be editable.

**Solution:**
- Updated `NumberCell.tsx` to check for `row.totalType === "target"` and `isActiveFormula`
- Renders `<input>` for target total in active formula
- Renders `<span>` for all other total rows (lines, rmc, running)

**Before:**
```tsx
// All total rows rendered as <span> - not editable
if (isTotal && isFormulaColumn) {
  return <span>{displayValue}</span>;
}
```

**After:**
```tsx
// Target total for active formula: editable
if (isTotal && isFormulaColumn) {
  if (row.totalType === "target" && isActiveFormula) {
    return <input type="number" ... />;
  }
  // Other totals: read-only
  return <span>{displayValue}</span>;
}
```

**Files Changed:**
- `src/components/DataGrid/components/cells/NumberCell.tsx`

---

### ✅ 4. Reference Formula Access Control (Issue #6)
**Problem:** Users could edit formulas created by other users. Need to lock reference formulas and show read-only state.

**Solution:**
- Added `isOwnFormula()` utility to check formula ownership
- Updated `ColumnHeaderCell.tsx` column header actions menu:
  - **Hidden for non-owned formulas:**
    - Set Active
    - Normalize  
    - Send for Compounding
  - **Always available:**
    - Create new version (allows adapting reference formulas)
    - Remove (remove from grid)
  - **Added visual indicators:**
    - Lock icon in column header (amber color)
    - "Reference formula (read-only)" message in menu

**Menu Logic:**
```typescript
const isOwned = column.formulaId ? isOwnFormula(column.formulaId) : true;
const isReadonly = !isOwned;

// Show Set Active only for owned formulas
{isOwned && <button>Set Active</button>}

// Show lock message for non-owned
{isReadonly && (
  <div>
    <span>🔒</span>
    <span>Reference formula (read-only)</span>
  </div>
)}

// Always show Create Version (for all formulas)
<button>Create new version</button>
```

**Visual Changes:**
- Lock icon (🔒) appears in formula column header for non-owned formulas
- Context menu shows limited options with read-only indicator
- Prevents accidental editing of reference formulas

**Files Changed:**
- `src/components/DataGrid/components/headers/ColumnHeaderCell.tsx`
- `src/utils/formulaIdGenerator.ts` - added `isOwnFormula()` utility

---

### ✅ 5. Search by Formula ID (Issue #5)
**Status:** Already working correctly!

**Finding:** `FormulaDataGrid.tsx` already includes formula ID in search:
```typescript
formula.id?.toLowerCase().includes(lower) ||
```

No changes needed.

---

### ✅ 6. Reset Deleted Formulas in Popup (Issue #4)
**Status:** Already working correctly!

**Finding:** `handleDeleteColumn()` in `useDataGridHandlers.ts` properly removes deleted formula from `selectedFormulaIds`:
```typescript
if (columnToDelete.formulaId) {
  setSelectedFormulaIds((prev) =>
    prev.filter((id) => id !== columnToDelete.formulaId)
  );
}
```

This makes deleted formulas selectable again in the modal. No changes needed.

---

### ⏳ 7. Save/Load Workspace State (Issue #1)
**Status:** Needs implementation

**Problem:** Saved workspaces don't load the complete DataGrid state (columns, data, formulas, etc.).

**Planned Solution:**
- Implement `request-workspace-state` event handler in WorkArea
- Emit `workspace-state-ready` with complete state snapshot
- Implement `load-workspace-state` event handler to restore state
- Update `workspaceManager.ts` `WorkspaceState` interface to include all necessary fields

**Not implemented in this session** - requires larger refactoring.

---

## Utility Functions Created

### `formulaIdGenerator.ts`

#### `generateNewFormulaId(config)`
Generates proper formula IDs based on context.

**Parameters:**
- `existingFormulas`: Array of all formulas to check sequence numbers
- `baseFormula?`: For versioning an existing formula
- `isReferenceFromOtherProject?`: Whether adapting from another user's formula

**Returns:** `string` - Formula ID (e.g., `NP-F-00003v2`)

#### `isOwnFormula(formulaId, currentUserInitials?)`
Checks if a formula belongs to the current user.

**Returns:** `boolean`

#### `parseFormulaId(formulaId)`
Parses a formula ID into components.

**Returns:** 
```typescript
{
  userInitials: string;
  sequentialNumber: string;
  version: string;
  versionNumber: number;
} | null
```

#### `getBaseFormulaId(formulaId)`
Removes version suffix from formula ID.

**Example:** `NP-F-00003v2` → `NP-F-00003`

#### `isValidFormulaIdFormat(formulaId)`
Validates formula ID format.

**Pattern:** `[2-3 LETTERS]-F-[5 DIGITS]v[VERSION]`

---

## Formula Naming Convention

### Format
`{USER_INITIALS}-F-{SEQUENTIAL_NUMBER}v{VERSION}`

### Examples
- `NP-F-00001v1` - Naresh Pentapati, Formula #1, version 1
- `NP-F-00001v2` - Naresh Pentapati, Formula #1, version 2
- `JD-F-00023v1` - John Doe, Formula #23, version 1

### Version Increment Rules

#### Same User (Owned Formula)
```
NP-F-00003v1 → Create Version → NP-F-00003v2
```
Increments version number, keeps base ID.

#### Different User (Reference Formula)
```
JD-F-00005v1 → Create Version → NP-F-00001v1
```
Generates new ID for current user, starts at v1.

---

## Testing Checklist

### Formula ID Generation
- [x] Create new formula generates proper ID (NP-F-00001v1)
- [x] Sequential numbering works correctly
- [x] Version format is correct (v1, v2, not 1.0)

### Formula Versioning
- [x] Same user: NP-F-00003v1 → NP-F-00003v2 ✓
- [x] Different user: JD-F-00005v1 → NP-F-00001v1 ✓
- [x] Version extracted correctly from generated ID

### Target Total Editability
- [x] Target total row is editable for active formula
- [x] Target total row is read-only for non-active formulas
- [x] Other total rows (lines, rmc, running) remain read-only

### Reference Formula Access Control
- [x] Lock icon shows for non-owned formulas
- [x] Set Active hidden for non-owned formulas
- [x] Normalize hidden for non-owned formulas
- [x] Send for Compounding hidden for non-owned formulas
- [x] Create Version available for all formulas
- [x] Remove available for all formulas
- [x] Read-only indicator shows in menu

### Already Working
- [x] Search by formula ID in modal
- [x] Deleted formulas become selectable again

---

## Build Status

✅ **Build Successful**
```
✓ 151 modules transformed.
✓ built in 1.51s
```

No compilation errors, no new lint warnings.

---

## Files Changed Summary

### New Files (1)
- `src/utils/formulaIdGenerator.ts` (140 lines)

### Modified Files (4)
- `src/view/WorkArea/WorkArea.tsx` - Formula ID generation
- `src/view/WorkArea/components/FormulaColumnHandlers.tsx` - Version creation
- `src/components/FormulaModal.tsx` - Version format
- `src/components/DataGrid/components/cells/NumberCell.tsx` - Target total editability
- `src/components/DataGrid/components/headers/ColumnHeaderCell.tsx` - Access control

### Total Changes
- **5 files modified**
- **1 file created**
- **~200 lines added**
- **~50 lines modified**

---

## Next Steps

### High Priority
1. **Implement workspace save/load** - Complete state snapshot/restore
2. **Test with actual Pega DX API** - Replace mock formula ID generation
3. **Add user service integration** - Replace mock user initials

### Medium Priority
4. **Add formula ownership metadata** - Store creator info in formula object
5. **Add formula history** - Track version lineage
6. **Improve error handling** - Better validation messages

### Low Priority
7. **Add formula ID validation UI** - Show format requirements
8. **Add batch operations** - Bulk version creation
9. **Add formula templates** - Quick start with common patterns

---

## Notes

- Formula ID generator is centralized and easy to modify
- Version increment logic handles edge cases (invalid IDs, different users)
- Access control prevents accidental editing of reference formulas
- All critical functionality working and tested
- Build successful with no errors
