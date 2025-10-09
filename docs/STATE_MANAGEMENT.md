# State Management Guide

## Overview

The application uses a combination of React state management patterns including local state, lifted state, custom hooks, and an event bus for cross-component communication.

## State Management Patterns

### 1. Local Component State (useState)

Used for component-specific UI state that doesn't need to be shared.

**Examples**:
```typescript
const [isOpen, setIsOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [selectedTab, setSelectedTab] = useState('ingredients');
```

**When to use**:
- Modal/dialog visibility
- Form inputs
- Loading/error states local to a component
- UI toggles (expanded/collapsed)

### 2. Lifted State

Shared state managed in a parent component and passed down via props.

**Example**: WorkArea State Management
```typescript
// Parent: WorkArea.tsx
const [tableData, setTableData] = useState<any[]>([]);
const [columns, setColumns] = useState<Column[]>([]);
const [editableFormula, setEditableFormula] = useState<string>('');

// Passed to children
<DataGrid 
  data={tableData}
  columns={columns}
  editableFormula={editableFormula}
  onCellEdit={handleCellEdit}
/>
```

**When to use**:
- State shared between sibling components
- Parent needs to coordinate multiple children
- Clear parent-child relationship

### 3. Custom Hooks

Encapsulate and reuse stateful logic across components.

**Location**: `src/view/WorkArea/hooks/`

#### useWorkAreaState

**Purpose**: Centralized state management for the work area

**File**: `src/view/WorkArea/hooks/useWorkAreaState.ts`

**State Managed**:
```typescript
const useWorkAreaState = () => {
  // Data state
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [attributes, setAttributes] = useState<IngredientAttribute[]>([]);
  
  // UI state
  const [editableFormula, setEditableFormula] = useState<string>('');
  const [selectedFormulaIds, setSelectedFormulaIds] = useState<string[]>([]);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showFormulaSelector, setShowFormulaSelector] = useState(false);
  const [availableFormulas, setAvailableFormulas] = useState<Formula[]>([]);
  const [activeFormula, setActiveFormula] = useState<Formula | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedFormulas, setSelectedFormulas] = useState<string[]>([]);
  
  // Configuration
  const [maxAttributeSelections] = useState(10);
  const [maxFormulaSelections] = useState(5);
  
  return {
    columns,
    tableData,
    formulas,
    ingredients,
    attributes,
    editableFormula,
    maxAttributeSelections,
    maxFormulaSelections,
    selectedFormulaIds,
    showFormulaModal,
    showFormulaSelector,
    availableFormulas,
    activeFormula,
    selectedAttributes,
    selectedFormulas,
    setColumns,
    setTableData,
    setFormulas,
    setIngredients,
    setAttributes,
    setEditableFormula,
    setSelectedFormulaIds,
    setShowFormulaModal,
    setShowFormulaSelector,
    setAvailableFormulas,
    setActiveFormula,
    setSelectedAttributes,
    setSelectedFormulas,
  };
};
```

**Usage**:
```typescript
// In WorkArea.tsx
const state = useWorkAreaState();
const {
  columns,
  tableData,
  editableFormula,
  setTableData,
  setColumns,
  // ... other state and setters
} = state;
```

#### useDataGridHandlers

**Purpose**: Encapsulate event handlers for data grid operations

**File**: `src/view/WorkArea/hooks/useDataGridHandlers.ts`

**Handlers Provided**:
```typescript
const useDataGridHandlers = ({
  columns,
  selectedFormulaIds,
  editableFormula,
  formulas,
  pendingFormulaIds,
  setTableData,
  setColumns,
  setSelectedFormulaIds,
  setEditableFormula,
}) => {
  // Handle cell value changes
  const handleCellEdit = useCallback((rowId, columnId, value) => {
    setTableData(prev => {
      const updatedData = prev.map(row => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [columnId]: value };
          
          // Recalculate contribution cost if editing active formula
          if (columnId === editableFormula) {
            const percentage = parseFloat(value) || 0;
            const costPerKg = parseFloat(row.costKg) || 0;
            updatedRow.contCost = parseFloat(
              ((percentage * costPerKg) / 1000).toFixed(4)
            );
          }
          
          return updatedRow;
        }
        return row;
      });
      
      // Recalculate totals
      return calculateTotals(updatedData, columns);
    });
  }, [columns, editableFormula, setTableData]);
  
  // Handle row deletion
  const handleRowDelete = useCallback((rowId: string) => {
    setTableData(prev => {
      const filtered = prev.filter(row => row.id !== rowId);
      return calculateTotals(filtered, columns);
    });
    toast.success('Ingredient removed');
  }, [columns, setTableData]);
  
  // Handle column deletion
  const handleDeleteColumn = useCallback((columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    if (!column?.formulaId) return;
    
    // Remove from columns
    setColumns(prev => prev.filter(c => c.id !== columnId));
    
    // Remove from selected formulas
    setSelectedFormulaIds(prev => 
      prev.filter(id => id !== column.formulaId)
    );
    
    // Clear active formula if it was deleted
    if (editableFormula === columnId) {
      setEditableFormula('');
    }
    
    toast.success('Formula column removed');
  }, [columns, editableFormula, setColumns, setSelectedFormulaIds, setEditableFormula]);
  
  // Handle column reordering
  const handleColumnReorder = useCallback((fromIndex: number, toIndex: number) => {
    setColumns(prev => {
      const newColumns = [...prev];
      const [removed] = newColumns.splice(fromIndex, 1);
      newColumns.splice(toIndex, 0, removed);
      return newColumns;
    });
  }, [setColumns]);
  
  return {
    handleCellEdit,
    handleRowDelete,
    handleDeleteColumn,
    handleColumnReorder,
  };
};
```

**Usage**:
```typescript
const {
  handleCellEdit,
  handleRowDelete,
  handleDeleteColumn,
  handleColumnReorder,
} = useDataGridHandlers({
  columns,
  selectedFormulaIds,
  editableFormula,
  formulas,
  pendingFormulaIds,
  setTableData,
  setColumns,
  setSelectedFormulaIds,
  setEditableFormula,
});
```

#### useFormulaOperations

**Purpose**: Complex formula operations (normalize, merge, explode)

**File**: `src/view/WorkArea/hooks/useFormulaOperations.ts`

**Operations Provided**:
```typescript
const useFormulaOperations = ({
  columns,
  editableFormula,
  formulas,
  ingredients,
  setTableData,
}) => {
  // Normalize formula percentages to 100%
  const handleNormalize = useCallback(() => {
    if (!editableFormula) {
      toast.error("No active formula to normalize");
      return;
    }
    
    setTableData(prev => {
      const targetTotalRow = prev.find(
        row => row.isTotal && row.totalType === 'target'
      );
      const runningTotalRow = prev.find(
        row => row.isTotal && row.totalType === 'running'
      );
      
      if (!targetTotalRow || !runningTotalRow) {
        toast.error("Could not find totals");
        return prev;
      }
      
      const targetTotal = targetTotalRow[editableFormula];
      const runningTotal = runningTotalRow[editableFormula];
      const adjustmentFactor = targetTotal / runningTotal;
      
      const newData = prev.map(row => {
        if (!row.isTotal && !row.isFormula) {
          const currentValue = row[editableFormula] || 0;
          const newValue = parseFloat(
            (currentValue * adjustmentFactor).toFixed(2)
          );
          return { ...row, [editableFormula]: newValue };
        }
        return row;
      });
      
      return calculateTotals(newData, columns);
    });
    
    toast.success('Formula normalized to 100%');
  }, [editableFormula, columns, setTableData]);
  
  // Merge duplicate ingredients by name
  const handleMergeDuplicates = useCallback(() => {
    setTableData(prev => {
      const ingredientRows = prev.filter(row => !row.isTotal);
      const totalRows = prev.filter(row => row.isTotal);
      
      if (totalRows.length === 0) {
        toast.error("Table structure is incomplete");
        return prev;
      }
      
      // Group by description (case-insensitive)
      const grouped = new Map<string, any[]>();
      ingredientRows.forEach(row => {
        const key = row.description.toLowerCase().trim();
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(row);
      });
      
      const mergedRows: any[] = [];
      let mergedCount = 0;
      
      grouped.forEach(rows => {
        if (rows.length === 1) {
          mergedRows.push(rows[0]);
        } else {
          mergedCount += rows.length - 1;
          
          // Create clean base object
          const mergedRow: any = {
            id: rows[0].id,
            description: rows[0].description,
            costKg: rows[0].costKg,
            isTotal: false,
            isFormula: false,
          };
          
          // Sum all formula columns
          const formulaColumns = columns.filter(
            col => col.group === "Formulas" && col.formulaId
          );
          
          formulaColumns.forEach(col => {
            const total = rows.reduce((sum, row) => {
              const value = parseFloat(row[col.key]) || 0;
              return sum + value;
            }, 0);
            mergedRow[col.key] = parseFloat(total.toFixed(2));
          });
          
          // Recalculate contribution cost
          if (editableFormula) {
            const percentage = parseFloat(mergedRow[editableFormula]) || 0;
            const costPerKg = parseFloat(mergedRow.costKg) || 0;
            mergedRow.contCost = parseFloat(
              ((percentage * costPerKg) / 1000).toFixed(4)
            );
          }
          
          mergedRows.push(mergedRow);
        }
      });
      
      if (mergedCount === 0) {
        toast.error("No duplicate ingredients found");
        return prev;
      }
      
      // Combine with total rows and recalculate
      const dataWithTotals = [...mergedRows, ...totalRows];
      const finalData = calculateTotals(dataWithTotals, columns);
      
      toast.success(`Merged ${mergedCount} duplicate ingredient(s)`);
      return finalData;
    });
  }, [columns, editableFormula, setTableData]);
  
  // Explode sub-formula into individual ingredients
  const handleExplodeFormula = useCallback((formulaId: string) => {
    const formula = formulas.find(f => f.id === formulaId);
    if (!formula) return;
    
    setTableData(prev => {
      // Remove formula group row
      const newData = prev.filter(
        row => !(row.isFormula && row.formulaId === formulaId)
      );
      
      // Add individual ingredients
      const formulaIngredients = formula.ingredients.map((ing, index) => ({
        id: `exploded_${formulaId}_${index}`,
        description: ing.name,
        costKg: ingredients.find(i => i.id === ing.ingredientId)?.price || 0,
        [editableFormula]: parseFloat(ing.percentage.toFixed(2)),
        contCost: 0,
        isTotal: false,
        isFormula: false,
      }));
      
      // Insert before total rows
      const totalIndex = newData.findIndex(row => row.isTotal);
      const insertIndex = totalIndex !== -1 ? totalIndex : newData.length;
      newData.splice(insertIndex, 0, ...formulaIngredients);
      
      return calculateTotals(newData, columns);
    });
    
    toast.success(`Formula "${formula.name}" exploded`);
  }, [formulas, ingredients, editableFormula, columns, setTableData]);
  
  return {
    handleNormalize,
    handleMergeDuplicates,
    handleExplodeFormula,
  };
};
```

### 4. Event Bus Pattern

**Purpose**: Cross-component communication without prop drilling

**Location**: `src/utils/bus.ts`

**Implementation**:
```typescript
type EventCallback = (data: any) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();
  
  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }
  
  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  emit(event: string, data?: any) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const eventBus = new EventBus();
```

**Event Registry**:
```typescript
// Data events
'ingredient-selected'          // { ingredient: Ingredient }
'formula-selected'             // { formula: Formula }
'formula-selected-for-column'  // { formula: Formula }
'attribute-selected'           // { attribute: IngredientAttribute }
'attribute-deselected'         // { attribute: IngredientAttribute }

// UI events
'active-formula-changed'       // { formula: Formula }
'work-area-updated'           // { ingredients: string[] }
'available-formulas-updated'  // { formulas: Formula[] }
'formula-selections-updated'  // { count: number, selectedIds: string[] }

// Action events
'normalize-formula'           // (no data)
'merge-duplicates'            // (no data)
'create-formula'              // (no data)
'load-formula'                // { formulaId: string }
'new-formula-created'         // { formula: Formula }
```

**Usage Pattern**:
```typescript
// Component A - Publisher
eventBus.emit('ingredient-selected', { ingredient: data });

// Component B - Subscriber
useEffect(() => {
  const handleIngredientSelected = (data: { ingredient: Ingredient }) => {
    // Handle the event
    console.log('Ingredient selected:', data.ingredient);
  };
  
  eventBus.on('ingredient-selected', handleIngredientSelected);
  
  return () => {
    eventBus.off('ingredient-selected', handleIngredientSelected);
  };
}, []);
```

**When to use**:
- Sibling components need to communicate
- Deep component trees (avoid prop drilling)
- Loose coupling required
- Multiple subscribers for same event

**When NOT to use**:
- Direct parent-child communication (use props)
- Complex state logic (use Context or state library)
- Debugging is difficult (hard to trace event flow)

## Data Flow Examples

### Example 1: Adding Ingredient to Work Area

**Flow**:
```
1. User clicks ingredient in LibraryPanel
2. LibraryPanel.tsx emits event:
   eventBus.emit('ingredient-selected', { ingredient })

3. WorkArea.tsx listens for event:
   useEffect(() => {
     eventBus.on('ingredient-selected', handleIngredientClick);
     return () => eventBus.off('ingredient-selected', handleIngredientClick);
   }, []);

4. handleIngredientClick adds row:
   setTableData(prev => [...prev, newRow]);

5. DataGrid re-renders with new data

6. WorkArea.tsx emits update:
   eventBus.emit('work-area-updated', { ingredients: [...] });

7. LibraryPanel.tsx receives update and highlights selected ingredients
```

### Example 2: Cell Edit with Calculation

**Flow**:
```
1. User edits cell in DataGrid
2. DataGrid calls onCellEdit prop:
   onCellEdit(rowId, columnId, value)

3. handleCellEdit (from useDataGridHandlers):
   a. Update row data with new value
   b. If editing active formula column:
      - Recalculate contribution cost for that row
      - contCost = (percentage × costKg) / 1000
   c. Call calculateTotals() utility
   d. Update tableData state

4. calculateTotals utility:
   a. Separate ingredient rows from total rows
   b. For each formula column and total type:
      - Running Total: Sum all ingredient percentages
      - Target Total: Fixed at 100%
      - RMC: Sum of (percentage × cost / 100)
      - Weighted Avg: Weighted average of costs
   c. Return [...ingredientRows, ...updatedTotals]

5. setTableData triggers re-render
6. DataGrid displays updated values
```

### Example 3: Merge Duplicates Operation

**Flow**:
```
1. User clicks "Merge Duplicates" button in Header
2. Header.Actions.tsx emits event:
   eventBus.emit('merge-duplicates')

3. WorkArea.tsx listens via useEffect:
   useEffect(() => {
     eventBus.on('merge-duplicates', handleMergeDuplicates);
     return () => eventBus.off('merge-duplicates', handleMergeDuplicates);
   }, [handleMergeDuplicates]);

4. handleMergeDuplicates (from useFormulaOperations):
   a. Separate ingredient rows and total rows
   b. Group ingredients by description (case-insensitive)
   c. For each group with duplicates:
      - Create clean base object
      - Sum all formula column values
      - Recalculate contribution cost
   d. Combine merged rows with original total rows
   e. Call calculateTotals()
   f. Update tableData state

5. Toast notification shows success message
6. DataGrid re-renders with merged data
```

## State Update Patterns

### Immutable Updates

Always create new objects/arrays, never mutate:

```typescript
// ❌ BAD - Mutating state
const handleUpdate = () => {
  tableData[0].value = newValue;  // WRONG!
  setTableData(tableData);
};

// ✅ GOOD - Immutable update
const handleUpdate = () => {
  setTableData(prev => prev.map((row, index) => 
    index === 0 ? { ...row, value: newValue } : row
  ));
};
```

### Functional Updates

Use functional form when new state depends on previous:

```typescript
// ❌ BAD - May use stale state
const handleAdd = () => {
  setCount(count + 1);
};

// ✅ GOOD - Always uses latest state
const handleAdd = () => {
  setCount(prev => prev + 1);
};
```

### Batch Updates

React automatically batches updates in event handlers:

```typescript
const handleSave = () => {
  setName('John');       // Batched
  setAge(30);           // Batched
  setEmail('john@...');  // Batched
  // Only one re-render
};
```

## Performance Optimization

### useMemo for Expensive Calculations

```typescript
const formulaColumns = useMemo(
  () => columns.filter(col => col.group === 'Formulas'),
  [columns]
);

const totalCost = useMemo(
  () => tableData.reduce((sum, row) => sum + (row.contCost || 0), 0),
  [tableData]
);
```

### useCallback for Stable References

```typescript
const handleCellEdit = useCallback((rowId, columnId, value) => {
  setTableData(prev => {
    // Update logic
  });
}, [setTableData, columns, editableFormula]);
```

### Avoid Unnecessary Re-renders

```typescript
// Use React.memo for pure components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// Use key prop for list optimization
{items.map(item => (
  <ItemComponent key={item.id} data={item} />
))}
```

## Best Practices

### 1. Single Source of Truth
- Each piece of state should have one owner
- Derive values instead of duplicating state

### 2. Lift State Appropriately
- Not too high (unnecessary re-renders)
- Not too low (hard to share)
- Just right (common ancestor)

### 3. Keep State Minimal
- Only store what you can't calculate
- Derive computed values in render

### 4. Use TypeScript
- Define interfaces for state shape
- Type all handlers and callbacks

### 5. Clean Up Effects
- Always return cleanup function
- Unsubscribe from events
- Clear timers and listeners

### 6. Avoid Prop Drilling
- Use event bus for distant components
- Consider Context for app-wide state
- Extract custom hooks for shared logic

## Future Enhancements

### React Context
```typescript
const FormulationContext = createContext<FormulationState | null>(null);

export const useFormulation = () => {
  const context = useContext(FormulationContext);
  if (!context) throw new Error('Must be used within provider');
  return context;
};
```

### State Management Library (Zustand)
```typescript
import create from 'zustand';

const useFormulaStore = create((set) => ({
  formulas: [],
  addFormula: (formula) => set((state) => ({ 
    formulas: [...state.formulas, formula] 
  })),
  removeFormula: (id) => set((state) => ({ 
    formulas: state.formulas.filter(f => f.id !== id) 
  })),
}));
```

### React Query for Server State
```typescript
const { data, isLoading, error } = useQuery(
  ['ingredients'],
  () => PegaService.getIngredients(),
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
);
```
