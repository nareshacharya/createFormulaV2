# ESLint Fixes Needed for xdcomponents Compatibility

## Summary
65 errors need to be fixed in createFormulaV2 before transferring to xdcomponents.

## Category 1: Unused Variables (35 errors)

### index.tsx (13 errors) - PEGA COMPONENT WRAPPER
```typescript
// Lines to remove:
- Fragment, DateTimeDisplay, Card, CardHeader, CardContent, Flex, Operator imports
- getPConnect, title, hideLabel, _label, user, dateTimeValue variables
```

### DataGrid.tsx (3 errors) - PARTIALLY FIXED ✅
- ✅ _onRowDelete - removed
- ✅ _showEmptyState - removed
- ❌ _rowIndex at line 700 - NEED TO FIX

### DataGrid/components/AddItemButton.tsx (2 errors)
```typescript
Line 36: _isFormula - remove
Line 38: _className - remove
```

### AdvancedFilterSheet.tsx (1 error) - FIXED ✅
- ✅ _filteredIngredients - removed

### IngredientAttributeList.tsx (1 error)
```typescript
Line 36: const [_hoveredRow, setHoveredRow] - remove or rename to hoveredRow
```

### IngredientList.tsx (1 error)
```typescript
Line 26: const [_localSelectedIngredients, setLocalSelectedIngredients] - remove or rename
```

### Ingredient Sections (6 errors - all same pattern)
- ChemicalPropertiesSection.tsx line 11: `_ingredient`
- ChemicalStructureSection.tsx line 10: `_ingredient`
- ComplianceSection.tsx line 11: `_ingredient`
- DocumentsSection.tsx line 11: `_ingredient`
- PhysicalPropertiesSection.tsx line 10: `_ingredient`
- SuppliersSection.tsx line 11: `_ingredient`

**Fix:** Remove the `_ingredient` parameter from destructuring if truly unused

### QueryBuilder.tsx (2 errors)
```typescript
Line 26: _onApply - remove
Line 233: _parentGroupId - remove
```

### compounding.ts (1 error)
```typescript
Line 81: _auditTrail - remove from function parameter
```

### pega.ts (6 errors)
```typescript
Lines 109, 114, 134, 143: _filters parameters - remove
Lines 500, 519: _mockFormulas, _mockAttributes - remove these mock arrays if unused
```

### idGeneration.ts (3 errors)
```typescript
Lines 347-349: _formulaType, _userInitials, _baseFormulaId - remove
```

### LibraryPanel.tsx (1 error)
```typescript
Line 37: const [_loading, setLoading] - rename to loading or remove
```

### WorkArea.tsx (1 error)
```typescript
Line 943: _handleToggleFormulaExpansion - remove or implement
```

### FormulaMetrics.tsx (1 error)
```typescript
Line 18: _formulas parameter - remove
```

### useDataGridHandlers.ts (1 error)
```typescript
Line 25: _selectedFormulaIds - remove from destructuring
```

### useFormulaOperations.ts (1 error)
```typescript
Line 30: _selectedFormulaIds - remove from destructuring
```

## Category 2: Accessibility Errors (11 errors)

### DataGrid.tsx (4 errors)
```typescript
Lines 737, 757, 917, 1073: Non-interactive elements with mouse/keyboard listeners
Fix: Add role="button" and onKeyDown handler
```

### EditableCell.tsx (2 errors)
```typescript
Lines 84, 135: Same fix as above
```

### IngredientTable.tsx (1 error)
```typescript
Line 370: Same fix
```

### ListRow.tsx (1 error)
```typescript
Line 67: tabIndex on non-interactive element
Fix: Add role="button" or make element interactive
```

## Category 3: Object Shorthand (4 errors)

### FormulaModal.tsx (1 error)
```typescript
Line 196: Convert to property shorthand
Example: { foo: foo } → { foo }
```

### compounding.ts (1 error)
```typescript
Line 99: Same fix
```

### rmcCalculator.ts (2 errors)
```typescript
Lines 105, 154: Same fix
```

## Category 4: File Extensions (3 errors)

Rename these files from .tsx to .ts (no JSX content):

1. `Portal.tsx` → `Portal.ts`
2. `Styled.tsx` → `Styled.ts`
3. `FormulaColumnHandlers.tsx` → `FormulaColumnHandlers.ts`
4. `FormulaMetrics.tsx` → `FormulaMetrics.ts`

## Category 5: Remaining Errors (12 errors)

### i18n/index.ts (1 error)
```typescript
Line 1: import { default as i18n } from 'i18next';
Fix: import i18n from 'i18next';
```

### dxApi.ts (3 errors)
```typescript
Line 32: max-classes-per-file - Split into multiple files or add eslint-disable
Line 187: class-methods-use-this - Make method static or use 'this'
Line 191: no-await-in-loop - Refactor to use Promise.all() or add eslint-disable
```

### FormulaModal.tsx (1 error)
```typescript
Line 1083: react/no-unstable-nested-components
Fix: Move component definition outside render function
```

## Priority Fix Order

1. **HIGH PRIORITY** - Fix index.tsx (13 errors) - This is the Pega component wrapper
2. **HIGH PRIORITY** - Fix unused variables in core components (DataGrid, etc.)
3. **MEDIUM PRIORITY** - Fix accessibility errors (add role="button")
4. **LOW PRIORITY** - Fix object shorthand
5. **LOW PRIORITY** - Rename .tsx to .ts files

## Automated Fixes Available

Run in createFormulaV2:
```bash
# This will auto-fix some errors
npm run lint -- --fix
```

This will automatically fix:
- Object shorthand (4 errors)
- Some unused eslint-disable directives (68 warnings)

## Notes

- Some `_variable` names indicate intentionally unused parameters (TypeScript pattern)
- xdcomponents ESLint is stricter and doesn't allow this pattern
- Must actually remove unused parameters, not just prefix with `_`
