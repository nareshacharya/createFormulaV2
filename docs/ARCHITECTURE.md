# Architecture Guide

## Overview

The Pega Formulation App follows a modern React architecture with a component-based design, event-driven communication, and a clear separation of concerns between UI, business logic, and data layers.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Shell                        │
│  ┌───────────────┐           ┌──────────────────────────┐  │
│  │               │           │                          │  │
│  │    Library    │           │       Work Area          │  │
│  │     Panel     │◄─────────►│    (Data Grid &          │  │
│  │               │  Events   │     Operations)          │  │
│  │  - Ingredients│           │                          │  │
│  │  - Formulas   │           │  - Formula Management    │  │
│  │  - Attributes │           │  - Cost Calculations     │  │
│  │               │           │  - Merge Operations      │  │
│  └───────────────┘           └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │     Event Bus         │
              │  (Component Bridge)   │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │    Service Layer      │
              │   (Pega Integration)  │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │    Mock Data Store    │
              │  (Development Data)   │
              └───────────────────────┘
```

## Directory Structure

```
src/
├── components/                 # Reusable UI components
│   ├── AdvancedFilterSheet.tsx # Filter dialog with query builder
│   ├── AttributeDataGrid.tsx   # Attribute selection grid
│   ├── Badge.tsx               # Status and category badges
│   ├── Button.tsx              # Custom button component
│   ├── DataGrid.tsx            # Advanced data table (core component)
│   ├── Drawer.tsx              # Slide-out panel component
│   ├── FormulaDataGrid.tsx     # Formula-specific data grid
│   ├── FormulaList.tsx         # Formula library list view
│   ├── FormulaModal.tsx        # Formula creation/edit modal
│   ├── IngredientAttributeList.tsx  # Ingredient attributes
│   ├── IngredientList.tsx      # Ingredient library list view
│   ├── IngredientQuickView.tsx # Ingredient details modal
│   ├── IngredientTable.tsx     # Ingredient table view
│   ├── ListRow.tsx             # Generic list row component
│   ├── Modal.tsx               # Base modal component
│   ├── MultiSelectDropdown.tsx # Multi-selection dropdown
│   ├── PillTabs.tsx            # Tab navigation component
│   ├── QueryBuilder.tsx        # Advanced query builder
│   ├── SearchBar.tsx           # Search input with filters
│   └── IngredientSections/     # Ingredient detail sections
│       ├── ChemicalPropertiesSection.tsx
│       ├── ChemicalStructureSection.tsx
│       ├── ComplianceSection.tsx
│       ├── DocumentsSection.tsx
│       ├── OverviewSection.tsx
│       ├── PhysicalPropertiesSection.tsx
│       └── SuppliersSection.tsx
│
├── view/                       # Layout and shell components
│   ├── AppShell/               # Main application layout
│   │   ├── AppShell.tsx        # Container with header and panels
│   │   ├── AppHeader.tsx       # Application header
│   │   ├── Header.Actions.tsx  # Header action buttons
│   │   └── Header.Badges.tsx   # Header status badges
│   ├── Library/                # Left panel library
│   │   └── LibraryPanel.tsx    # Tabbed ingredient/formula panel
│   └── WorkArea/               # Right panel workspace
│       ├── WorkArea.tsx        # Main work area container
│       └── hooks/              # Custom React hooks
│           ├── useWorkAreaState.ts      # State management
│           ├── useDataGridHandlers.ts   # Grid event handlers
│           └── useFormulaOperations.ts  # Formula operations
│
├── pages/                      # Application pages
│   ├── NotFound.tsx            # 404 page
│   └── home/                   # Main application page
│       └── page.tsx
│
├── router/                     # Routing configuration
│   ├── config.tsx              # Route definitions
│   └── index.ts                # Router setup
│
├── services/                   # Data access layer
│   └── pega.ts                 # Pega service (API ready)
│
├── mocks/                      # Development data
│   ├── formulas.ts             # Sample formulas
│   └── ingredientAttributes.ts # Sample attributes
│
├── utils/                      # Utility functions
│   ├── bus.ts                  # Event bus implementation
│   ├── index.ts                # Common utilities
│   ├── queryEvaluator.ts       # Query evaluation logic
│   ├── tokens.ts               # CSS token utilities
│   └── formulaCalculations.ts  # Formula math utilities
│
├── controller/                 # UI controllers
│   └── uiLayoutController.ts   # Layout state management
│
├── i18n/                       # Internationalization
│   ├── index.ts                # i18n setup
│   └── local/                  # Translations
│       └── index.ts
│
├── model/                      # TypeScript interfaces
│   └── index.ts                # Data model definitions
│
├── App.tsx                     # Root application component
├── main.tsx                    # Application entry point
└── index.css                   # Global styles
```

## Key Architectural Patterns

### 1. Component-Based Architecture

Each UI element is a self-contained React component with:
- **Props**: Input data and callbacks
- **State**: Local component state
- **Hooks**: Reusable logic extraction
- **Events**: Component communication

### 2. Event-Driven Communication

The Event Bus pattern enables loose coupling between components:

```typescript
// Publishing events
eventBus.emit('ingredient-selected', { ingredient: data });

// Subscribing to events
eventBus.on('ingredient-selected', handleIngredientClick);

// Cleanup
eventBus.off('ingredient-selected', handleIngredientClick);
```

**Key Events:**
- `ingredient-selected` - User selects an ingredient
- `formula-selected` - User selects a formula
- `formula-selected-for-column` - Formula added to data grid
- `active-formula-changed` - Active formula changed
- `work-area-updated` - Work area data modified
- `normalize-formula` - Normalize formula percentages
- `merge-duplicates` - Merge duplicate ingredients
- `attribute-selected/deselected` - Attribute filters
- `create-formula` - Create new formula
- `load-formula` - Load formula into work area

### 3. Custom Hooks Pattern

Business logic is extracted into custom hooks for reusability:

**useWorkAreaState.ts** - Centralized state management
```typescript
// Manages all work area state
const state = useWorkAreaState();
// Returns: columns, tableData, formulas, ingredients, etc.
```

**useDataGridHandlers.ts** - Event handlers
```typescript
// Cell edits, row deletes, column operations
const { handleCellEdit, handleRowDelete, handleDeleteColumn } = 
  useDataGridHandlers({ columns, setTableData, ... });
```

**useFormulaOperations.ts** - Formula operations
```typescript
// Normalize, merge duplicates, explode formulas
const { handleNormalize, handleMergeDuplicates, handleExplodeFormula } = 
  useFormulaOperations({ columns, editableFormula, ... });
```

### 4. Service Layer Abstraction

The service layer provides a clean API interface:

```typescript
// services/pega.ts
export const PegaService = {
  getIngredients: async () => Ingredient[],
  getFormulas: async () => Formula[],
  getIngredientAttributes: async () => IngredientAttribute[],
  // Ready for real Pega API integration
};
```

### 5. State Management Strategy

**Local State** (useState)
- Component-specific UI state
- Form inputs, modal visibility
- Temporary selections

**Lifted State** (Props drilling)
- Shared state between related components
- Parent manages, children consume
- Work area state managed in WorkArea.tsx

**Global Events** (Event Bus)
- Cross-component communication
- Library ↔ Work Area interactions
- Decoupled component coordination

## Data Flow

### Adding an Ingredient to Work Area

```
User clicks ingredient in Library Panel
        ↓
LibraryPanel emits 'ingredient-selected' event
        ↓
WorkArea receives event via useEffect
        ↓
handleIngredientClick adds row to tableData
        ↓
setTableData updates state
        ↓
DataGrid re-renders with new data
        ↓
WorkArea emits 'work-area-updated' event
        ↓
LibraryPanel receives event and updates UI
```

### Calculating Formula Totals

```
User edits cell in DataGrid
        ↓
handleCellEdit updates row data
        ↓
If formula column and active formula:
  - Recalculate contribution cost
  - Call calculateTotals()
        ↓
calculateTotals filters rows:
  - Ingredient rows (non-total)
  - Total rows (running, target, RMC, weighted)
        ↓
For each formula column:
  - Sum ingredient percentages → Running Total
  - Set target to 100% → Target Total
  - Calculate cost impact → RMC
  - Calculate weighted average → Weighted Avg
        ↓
Return [...ingredientRows, ...updatedTotals]
        ↓
setTableData updates state
        ↓
DataGrid re-renders with updated totals
```

### Merging Duplicate Ingredients

```
User clicks "Merge Duplicates" button
        ↓
Header emits 'merge-duplicates' event
        ↓
useFormulaOperations.handleMergeDuplicates
        ↓
1. Separate ingredient rows from total rows
2. Group ingredients by description (case-insensitive)
3. For each group with duplicates:
   a. Create clean base object (id, description, costKg)
   b. Sum all formula column values
   c. Copy metadata properties
   d. Recalculate contribution cost
4. Combine merged rows with original total rows
5. Call calculateTotals() to update totals
        ↓
setTableData updates state
        ↓
DataGrid re-renders with merged data and totals
        ↓
Toast notification confirms merge
```

## Component Communication

### Direct Props (Parent → Child)
```typescript
<DataGrid 
  columns={columns}
  data={tableData}
  onCellEdit={handleCellEdit}
  onRowDelete={handleRowDelete}
/>
```

### Event Bus (Sibling ↔ Sibling)
```typescript
// LibraryPanel → WorkArea
eventBus.emit('ingredient-selected', { ingredient });

// WorkArea → LibraryPanel
eventBus.emit('work-area-updated', { ingredients });
```

### Callback Props (Child → Parent)
```typescript
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSave={(data) => handleSave(data)}
/>
```

## Performance Optimization

### React Hooks Optimization

1. **useMemo** - Expensive calculations
```typescript
const formulaColumns = useMemo(() => 
  columns.filter(col => col.group === "Formulas"),
  [columns]
);
```

2. **useCallback** - Stable function references
```typescript
const handleCellEdit = useCallback((rowId, columnId, value) => {
  // Handler logic
}, [dependencies]);
```

3. **Proper Dependencies** - Prevent unnecessary re-renders
```typescript
useEffect(() => {
  // Side effect
}, [editableFormula, setTableData]); // Only re-run when these change
```

### Component Optimization

1. **Conditional Rendering** - Only render what's needed
```typescript
{showModal && <Modal />}
{items.length > 0 && <Table data={items} />}
```

2. **Event Cleanup** - Prevent memory leaks
```typescript
useEffect(() => {
  eventBus.on('event', handler);
  return () => eventBus.off('event', handler);
}, [handler]);
```

## Error Handling

### Try-Catch for Async Operations
```typescript
const loadData = async () => {
  try {
    const data = await PegaService.getIngredients();
    setIngredients(data);
  } catch (error) {
    console.error("Failed to load data:", error);
    toast.error("Failed to load ingredients");
  }
};
```

### User Feedback
```typescript
// Success notifications
toast.success("Formula saved successfully");

// Error notifications
toast.error("Failed to save formula");

// Validation messages
if (!editableFormula) {
  toast.error("No active formula to normalize");
  return;
}
```

## Future Architecture Enhancements

### 1. Context API
Replace event bus with React Context for global state:
```typescript
<FormulationContext.Provider value={state}>
  <App />
</FormulationContext.Provider>
```

### 2. State Management Library
Implement Redux or Zustand for complex state:
```typescript
const useFormulaStore = create((set) => ({
  formulas: [],
  addFormula: (formula) => set((state) => ({ 
    formulas: [...state.formulas, formula] 
  })),
}));
```

### 3. React Query
Add server state management:
```typescript
const { data, isLoading } = useQuery(
  'ingredients',
  PegaService.getIngredients
);
```

### 4. Code Splitting
Lazy load routes and components:
```typescript
const WorkArea = lazy(() => import('./view/WorkArea/WorkArea'));
```

## Best Practices

1. **Single Responsibility** - One component, one purpose
2. **DRY Principle** - Extract reusable logic into hooks
3. **Type Safety** - Use TypeScript interfaces
4. **Component Composition** - Build complex UIs from simple components
5. **Immutable Updates** - Never mutate state directly
6. **Cleanup Effects** - Always cleanup event listeners and subscriptions
7. **Error Boundaries** - Graceful error handling
8. **Accessibility** - Semantic HTML and ARIA labels

## Testing Strategy

### Unit Tests
- Individual utility functions
- Formula calculation logic
- Query evaluation

### Component Tests
- Component rendering
- User interactions
- Props handling

### Integration Tests
- Component communication
- Event bus flows
- State updates

### E2E Tests
- Complete user workflows
- Formula creation to export
- Multi-step operations
