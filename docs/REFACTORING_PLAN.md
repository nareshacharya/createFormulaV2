# DataGrid Refactoring Plan - File Size Reduction

## Goal
Reduce all files to under 1000 lines by extracting logical components and utilities.

## Current State

### Files Over 1000 Lines
1. **DataGrid.tsx**: 1,195 lines → Target: < 500 lines (main orchestrator)
2. **WorkArea.tsx**: 1,470 lines → Target: < 800 lines (feature container)

### Already Extracted (< 400 lines each)
- CellRenderer.tsx: 397 lines ✅
- BulkActionsToolbar.tsx: 234 lines ✅
- ViewManager.tsx: 177 lines ✅
- DraggableRow.tsx: 52 lines ✅
- useBulkSelection.ts: 70 lines ✅
- useRowReordering.ts: 70 lines ✅
- useSavedViews.ts: 85 lines ✅

## Refactoring Strategy

### Phase 1: DataGrid.tsx (1,195 → ~500 lines)

#### Extract 1: TableHeader Component ✅
**File:** `src/components/DataGrid/components/TableHeader.tsx`
**Lines:** ~250 lines
**Responsibility:** Column headers, sorting, drag-and-drop, column actions menu

**Contains:**
- Column header rendering
- Sort indicators
- Active formula badge
- Column drag and drop handlers
- Column actions menu (normalize, version, delete, etc.)
- Add column button

#### Extract 2: TableBody Component
**File:** `src/components/DataGrid/components/TableBody.tsx`
**Lines:** ~300 lines  
**Responsibility:** Render table rows with reordering support

**Contains:**
- Row mapping and rendering
- DraggableRow integration
- Empty state rendering
- Row selection checkboxes
- Cell rendering delegation to CellRenderer

**Props:**
```typescript
{
  data: DataGridRow[];
  columns: Column[];
  editingCell: EditingCell | null;
  editValue: string;
  editableFormula: string;
  selectedRows: Set<string>;
  dragState: DragState;
  keyboardNav: KeyboardNavState;
  onRowSelect: (rowId: string) => void;
  onCellEdit: (rowId, columnId, value) => void;
  onRowDragStart: (rowId: string) => void;
  onRowDragOver: (rowId: string) => void;
  onRowDragEnd: () => void;
}
```

#### Extract 3: Sorting Logic
**File:** `src/components/DataGrid/utils/sorting.ts`
**Lines:** ~80 lines
**Responsibility:** Data sorting logic

**Functions:**
```typescript
export function sortData(
  data: DataGridRow[],
  sortConfig: SortConfig | null,
  columns: Column[]
): DataGridRow[];

export function getNextSortDirection(
  currentSort: SortConfig | null,
  columnId: string
): 'asc' | 'desc' | null;
```

#### Extract 4: Cell Editing Logic
**File:** `src/components/DataGrid/utils/editingUtils.ts`
**Lines:** ~100 lines
**Responsibility:** Cell edit validation and handlers

**Functions:**
```typescript
export function isCellEditable(
  row: DataGridRow,
  column: Column,
  editableFormula?: string
): boolean;

export function getCellEditValue(
  row: DataGridRow,
  column: Column
): unknown;

export function validateCellValue(
  value: unknown,
  column: Column
): { isValid: boolean; error?: string };
```

#### Extract 5: Column Management
**File:** `src/components/DataGrid/utils/columnUtils.ts`
**Lines:** ~80 lines
**Responsibility:** Column operations

**Functions:**
```typescript
export function reorderColumns(
  columns: Column[],
  fromIndex: number,
  toIndex: number
): Column[];

export function canDragColumn(column: Column): boolean;

export function getColumnsByGroup(
  columns: Column[]
): Record<string, Column[]>;
```

#### Remaining in DataGrid.tsx (~500 lines)
- Component setup and state
- Hook initialization
- Event handler orchestration
- Component composition (header + body)
- Click outside handling
- Integration with parent component

### Phase 2: WorkArea.tsx (1,470 → ~800 lines)

#### Extract 1: FormulaManager
**File:** `src/view/WorkArea/components/FormulaManager.tsx`
**Lines:** ~250 lines
**Responsibility:** Formula operations and state

**Contains:**
- Formula creation
- Formula versioning
- Formula normalization
- Send for compounding
- Active formula management

**Functions:**
```typescript
export const useFormulaManager = () => {
  const createFormula = (ingredientIds: string[]) => {...};
  const normalizeFormula = (formulaId: string) => {...};
  const createVersion = (formulaId: string) => {...};
  const setActiveFormula = (formulaId: string) => {...};
  const sendForCompounding = (formulaId: string) => {...};
  
  return {
    formulas,
    activeFormula,
    createFormula,
    normalizeFormula,
    createVersion,
    setActiveFormula,
    sendForCompounding,
  };
};
```

#### Extract 2: IngredientManager
**File:** `src/view/WorkArea/components/IngredientManager.tsx`
**Lines:** ~200 lines
**Responsibility:** Ingredient operations

**Contains:**
- Add ingredients
- Remove ingredients
- Update ingredient values
- Ingredient search/filter
- Ingredient validation

#### Extract 3: AttributeManager
**File:** `src/view/WorkArea/components/AttributeManager.tsx`
**Lines:** ~150 lines
**Responsibility:** Attribute column operations

**Contains:**
- Add attribute columns
- Remove attribute columns
- Attribute value updates
- Attribute data fetching

#### Extract 4: WorkAreaToolbar
**File:** `src/view/WorkArea/components/WorkAreaToolbar.tsx`
**Lines:** ~120 lines
**Responsibility:** Top toolbar with actions

**Contains:**
- Quick actions (save, export, etc.)
- Formula selector
- View options
- Breadcrumb navigation

#### Remaining in WorkArea.tsx (~800 lines)
- Main layout structure
- State orchestration
- Manager hooks initialization
- DataGrid integration
- Library panel integration
- Modal/drawer management

## Implementation Phases

### Week 1: DataGrid Refactoring

**Day 1-2: Extract Table Components**
- [x] Create TableHeader component
- [ ] Create TableBody component
- [ ] Test rendering independently

**Day 3: Extract Utilities**
- [ ] Create sorting.ts
- [ ] Create editingUtils.ts
- [ ] Create columnUtils.ts
- [ ] Write unit tests

**Day 4-5: Integration & Testing**
- [ ] Integrate extracted components into DataGrid
- [ ] Verify all functionality works
- [ ] Fix any regressions
- [ ] Update tests

### Week 2: WorkArea Refactoring

**Day 1-2: Extract Managers**
- [ ] Create FormulaManager
- [ ] Create IngredientManager
- [ ] Create AttributeManager
- [ ] Test independently

**Day 3: Extract Toolbar**
- [ ] Create WorkAreaToolbar
- [ ] Style and test
- [ ] Integrate with WorkArea

**Day 4-5: Integration & Cleanup**
- [ ] Integrate all managers
- [ ] Verify functionality
- [ ] Performance testing
- [ ] Documentation update

## File Structure After Refactoring

```
src/
  components/
    DataGrid/
      components/
        TableHeader.tsx          (~250 lines) ✅
        TableBody.tsx            (~300 lines) NEW
        BulkActionsToolbar.tsx   (~234 lines) ✅
        CellRenderer.tsx         (~397 lines) ✅
        EditableCell.tsx         (~88 lines) ✅
        DraggableRow.tsx         (~52 lines) ✅
        ViewManager.tsx          (~177 lines) ✅
      hooks/
        useBulkSelection.ts      (~70 lines) ✅
        useRowReordering.ts      (~70 lines) ✅
        useSavedViews.ts         (~85 lines) ✅
        useKeyboardNavigation.ts (~285 lines) ✅
      utils/
        sorting.ts               (~80 lines) NEW
        editingUtils.ts          (~100 lines) NEW
        columnUtils.ts           (~80 lines) NEW
        rowOrdering.ts           (~35 lines) ✅
      types.ts                   (~71 lines) ✅
    DataGrid.tsx                 (~500 lines) REDUCED
    
  view/
    WorkArea/
      components/
        FormulaManager.tsx       (~250 lines) NEW
        IngredientManager.tsx    (~200 lines) NEW
        AttributeManager.tsx     (~150 lines) NEW
        WorkAreaToolbar.tsx      (~120 lines) NEW
      hooks/
        useFormulas.ts           (~100 lines) NEW
        useIngredients.ts        (~100 lines) NEW
      WorkArea.tsx               (~800 lines) REDUCED
```

## Benefits

### Maintainability
- ✅ Each file has single responsibility
- ✅ Easier to locate and fix bugs
- ✅ Simpler code reviews
- ✅ Better IDE performance

### Testability
- ✅ Unit test individual components
- ✅ Mock dependencies easily
- ✅ Test utilities in isolation
- ✅ Integration tests more focused

### Reusability
- ✅ Components can be used elsewhere
- ✅ Utilities are framework agnostic
- ✅ Hooks can be composed
- ✅ Types are centralized

### Performance
- ✅ Tree-shaking more effective
- ✅ Lazy loading opportunities
- ✅ Smaller bundle chunks
- ✅ Faster compilation

### Developer Experience
- ✅ Faster file navigation
- ✅ Better autocomplete
- ✅ Clearer imports
- ✅ Easier onboarding

## Migration Strategy

### Backward Compatibility
All refactoring maintains the same public API:

```typescript
// Before and After - Same API
<DataGrid
  columns={columns}
  data={data}
  onCellEdit={handleEdit}
  editableFormula={activeFormula}
  enableBulkSelection={true}
/>
```

### Gradual Adoption
1. Extract components without changing DataGrid public API
2. Test thoroughly in development
3. Deploy incrementally
4. Monitor for issues
5. Rollback plan ready

### Testing Checklist
- [ ] All existing unit tests pass
- [ ] Integration tests pass
- [ ] Manual smoke testing
- [ ] Performance benchmarks met
- [ ] No accessibility regressions
- [ ] Documentation updated

## Success Metrics

### Code Quality
- ✅ All files under 1000 lines
- ✅ Cyclomatic complexity < 15 per function
- ✅ Test coverage > 80%
- ✅ Zero TypeScript errors

### Performance
- ✅ Initial render < 200ms
- ✅ Cell edit response < 50ms
- ✅ Scroll performance 60fps
- ✅ Bundle size not increased > 5%

### Developer Metrics
- ✅ Time to find code < 30 seconds
- ✅ Time to fix bug reduced 30%
- ✅ Code review time reduced 40%
- ✅ Onboarding time reduced 50%

## Risks & Mitigation

### Risk 1: Breaking Changes
**Mitigation:** 
- Extensive testing
- Feature flags for new code
- Gradual rollout
- Quick rollback capability

### Risk 2: Performance Regression
**Mitigation:**
- Performance benchmarks
- Profiling before/after
- Optimize hot paths
- Lazy loading where possible

### Risk 3: Increased Complexity
**Mitigation:**
- Clear documentation
- Consistent patterns
- Code examples
- Architecture diagrams

### Risk 4: Team Learning Curve
**Mitigation:**
- Training sessions
- Pair programming
- Documentation
- Code walkthrough

## Next Steps

1. **Review & Approve** this refactoring plan
2. **Create JIRA tickets** for each extraction phase
3. **Set up branch strategy** (feature branches per component)
4. **Schedule team meeting** to discuss approach
5. **Begin Phase 1** with TableBody extraction

---

**Status:** Planning  
**Priority:** High  
**Estimated Effort:** 2 weeks  
**Last Updated:** October 15, 2025
