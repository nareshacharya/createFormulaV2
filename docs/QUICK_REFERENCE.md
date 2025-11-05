# Quick Reference Guide

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [State Management](#state-management)
- [Common Tasks](#common-tasks)
- [Event Bus](#event-bus)
- [Key Components](#key-components)
- [Calculations](#calculations)
- [API Reference](#api-reference)

---

## Architecture

### Stack

- **React 19.0** + TypeScript 5.7
- **Vite 6.0** (build tool)
- **Tailwind CSS 3.4** (styling)
- **React Context API** (state)
- **Event Bus** (communication)

### Structure

```
src/
├── components/     # Reusable UI components
├── context/        # Context providers
├── hooks/          # Custom hooks
├── services/       # API services
├── utils/          # Utilities
├── view/           # Main views
├── mocks/          # Mock data
└── types/          # TypeScript types
```

---

## Features

| Feature | Description | Files |
|---------|-------------|-------|
| **Formula Management** | Create, version, normalize formulas | `FormulaModal.tsx`, `FormulaList.tsx` |
| **Ingredient Management** | Search, filter, add ingredients | `IngredientList.tsx`, `LibraryPanel.tsx` |
| **DataGrid** | Advanced table with editing, sorting | `DataGrid.tsx` |
| **Workspace Management** | Multi-workspace with isolation | `WorkspaceContext.tsx`, `WorkspaceTabs.tsx` |
| **Dilution** | Dilute ingredients with solvents | `dilution/DilutionModal.tsx` |

---

## State Management

### Global State (Context)

```typescript
const {
  tabs,
  activeWorkspace,
  addTab,
  switchTab,
  updateWorkspaceData,
  lockFormula,
} = useWorkspace();
```

### Local State (Hooks)

```typescript
const [data, setData] = useState([]);
const filteredData = useMemo(() => filter(data), [data]);
const handleClick = useCallback(() => {}, []);
```

### Event Bus

```typescript
// Emit
eventBus.emit('ingredient-selected', { ingredient });

// Listen
useEffect(() => {
  eventBus.on('ingredient-selected', handler);
  return () => eventBus.off('ingredient-selected', handler);
}, []);
```

### History (Undo/Redo)

```typescript
appStateHistory.push(state, 'action', 'description');
const previousState = appStateHistory.undo();
```

---

## Common Tasks

### Add Ingredient to Formula

1. User clicks ingredient in LibraryPanel
2. Emits `ingredient-selected` event
3. WorkArea validates and adds row
4. Recalculates totals
5. Saves to history

### Add Formula Column

1. User clicks "+ Formula"
2. Modal opens, user selects formula
3. Creates column definition
4. Initializes data with zeros
5. Locks formula in workspace
6. Sets as editable

### Normalize Formula

1. User clicks "Normalize"
2. Calculates current total
3. Calculates scale factor (100 / total)
4. Multiplies all values by factor
5. Updates target total to 100
6. Saves to history

### Create Formula Version

1. Gets current formula composition
2. Increments version number (v1 → v2)
3. Creates new formula with new ID
4. Adds to available formulas
5. Can be added to workspace

---

## Event Bus

### Key Events

| Event | From | To | Data |
|-------|------|-----|------|
| `ingredient-selected` | Library | WorkArea | `{ ingredient }` |
| `formula-selected` | Library | WorkArea | `{ formula }` |
| `normalize-formula` | Header | WorkArea | none |
| `undo-action` | Header | WorkArea | none |
| `active-formula-changed` | WorkArea | Header | `{ formula }` |
| `formula-selections-updated` | WorkArea | Header, Library | `{ count, selectedIds }` |
| `dilution-changed` | DilutionHook | WorkArea | `{ ingredientId, dilution }` |

---

## Key Components

### DataGrid

```typescript
<DataGrid
  columns={columns}
  data={tableData}
  onCellEdit={(rowId, colId, value) => {}}
  onRowDelete={(rowId) => {}}
  onBulkDelete={(rowIds) => {}}
  enableRowReordering={true}
  enableBulkSelection={true}
  dilutionState={dilutionState}
/>
```

### FormulaModal

```typescript
<FormulaModal
  isOpen={isOpen}
  onClose={() => {}}
  onCreateFormula={(formula) => {}}
  onSelectFormula={(formula) => {}}
  availableFormulas={formulas}
  maxSelections={4}
  currentSelections={selectedFormulaIds.length}
/>
```

### IngredientList

```typescript
<IngredientList
  ingredients={ingredients}
  searchQuery={searchQuery}
  onIngredientClick={(ing) => {}}
  selectedIngredients={selectedIngredientIds}
/>
```

### DilutionModal

```typescript
<DilutionModal
  isOpen={isOpen}
  onClose={() => {}}
  ingredientId={ingredientId}
  ingredientName={name}
  initialDilution={dilution}
  onSave={(dilution) => {}}
/>
```

---

## Calculations

### Running Total

```typescript
const runningTotal = ingredientRows
  .filter(row => !row.isFormula)
  .reduce((sum, row) => sum + (parseFloat(row[formulaId]) || 0), 0);
```

### Contribution Cost

```typescript
const contCost = (percentage * costPerKg) / 1000;
```

### RMC (Raw Material Cost)

```typescript
const rmc = ingredientRows
  .reduce((sum, row) => {
    const pct = parseFloat(row[formulaId]) || 0;
    const cost = parseFloat(row.costKg) || 0;
    return sum + (pct * cost) / 1000;
  }, 0);
```

### Normalization

```typescript
const scaleFactor = 100 / currentTotal;
const normalizedValue = currentValue * scaleFactor;
```

### Number of Lines

```typescript
const lineCount = ingredientRows
  .filter(row => (parseFloat(row[formulaId]) || 0) > 0)
  .length;
```

---

## API Reference

### PegaService

```typescript
// Get data
await PegaService.getFormulas();
await PegaService.getIngredients();
await PegaService.getIngredientAttributes();

// Search
await PegaService.searchIngredients(query, type);
await PegaService.searchFormulas(query, filters);

// CRUD
await PegaService.createFormula(formula);
await PegaService.updateFormula(id, updates);
```

### CompoundingService

```typescript
// Prepare formula
const compoundingFormula = prepareFormulaForCompounding(
  formula,
  ingredients,
  attributes,
  targetTotal
);

// Validate
const { isValid, errors } = validateFormulaForCompounding(formula);

// Submit
const { success, submissionId } = await submitForCompounding(submission);
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Tab | Move to next cell |
| Shift+Tab | Move to previous cell |
| Arrow Keys | Navigate cells |
| Enter | Edit cell / Save |
| Escape | Cancel edit |
| Cmd/Ctrl+C | Copy |
| Cmd/Ctrl+V | Paste |

---

## File Locations

### Core Components

- **DataGrid**: `src/components/DataGrid.tsx`
- **FormulaModal**: `src/components/FormulaModal.tsx`
- **IngredientList**: `src/components/IngredientList.tsx`
- **WorkspaceTabs**: `src/components/workspace/WorkspaceTabs.tsx`

### Views

- **AppShell**: `src/view/AppShell/AppShell.tsx`
- **AppHeader**: `src/view/AppShell/AppHeader.tsx`
- **LibraryPanel**: `src/view/Library/LibraryPanel.tsx`
- **WorkArea**: `src/view/WorkArea/WorkArea.tsx`

### State & Utils

- **WorkspaceContext**: `src/context/WorkspaceContext.tsx`
- **Event Bus**: `src/utils/bus.ts`
- **State History**: `src/utils/stateHistory.ts`
- **Formula Calculations**: `src/utils/formulaCalculations.ts`

### Services

- **Pega**: `src/services/pega.ts`
- **Compounding**: `src/services/compounding.ts`

---

## Data Models

### Formula

```typescript
interface Formula {
  id: string;
  name: string;
  version: string;
  status: 'draft' | 'active' | 'archived' | 'submitted';
  createdBy: string;
  lastUpdated: string;
  category: string;
  totalPercentage: number;
  ingredients: FormulaIngredient[];
  description: string;
}
```

### Ingredient

```typescript
interface Ingredient {
  id: string;
  name: string;
  code: string;
  price: number;
  type: 'natural' | 'synthetic' | 'base';
  category: string;
  supplier: string;
  status: 'active' | 'inactive' | 'palette';
  mac: number;
  odorProfile?: string;
  volatility?: string;
  allergens?: string[];
}
```

### Column

```typescript
interface Column {
  id: string;
  key: string;
  title: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'add-column';
  sortable?: boolean;
  editable?: boolean;
  width?: number;
  group?: string;
  formulaId?: string;
  attributeId?: string;
}
```

### Dilution

```typescript
interface Dilution {
  ingredientId: string;
  concentration: number;
  solventIds: string[];
  solventPercentages: Record<string, number>;
  totalPercentage: number;
}
```

---

## Commands

### Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview build
npm run lint     # Run linter
```

### Testing (Future)

```bash
npm test         # Run tests
npm run test:ui  # Test UI
npm run coverage # Coverage report
```

---

## Troubleshooting

### Formula not updating

- Check `editableFormula` is set
- Verify event listeners registered
- Check console for validation errors

### Workspace data lost

- Ensure `updateWorkspaceData` called
- Check `WorkspaceContext` provider wraps app
- Verify `activeWorkspace` is used

### Calculations incorrect

- Check formula column IDs match
- Verify `calculateTotals` called after updates
- Check for NaN values

### Performance issues

- Enable virtual scrolling
- Memoize expensive calculations
- Check for unnecessary re-renders

---

## Links

- **[Full Documentation](./README.md)**
- **[Architecture](./ARCHITECTURE.md)**
- **[Features](./features/)**
- **[State Management](./STATE_MANAGEMENT.md)**
- **[GitHub Repository](#)**

---

**Last Updated:** November 5, 2025
