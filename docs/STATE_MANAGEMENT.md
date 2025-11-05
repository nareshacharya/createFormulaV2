# State Management Documentation

## Overview

The CreateFormulaV2 application uses a hybrid state management approach combining React Context API, custom hooks, and an event bus pattern for cross-component communication. This document details the state management architecture, patterns, and best practices.

## State Management Layers

### 1. Global State (Context API)

Global application state managed through React Context providers.

#### WorkspaceContext

The primary global state container managing workspace sessions and shared data.

**Location:** `src/context/WorkspaceContext.tsx`

**Responsibilities:**

- Workspace tab management (create, close, switch, rename)
- Workspace data isolation
- Formula locking across workspaces
- Global shared data (ingredients, formulas, attributes)

**State Structure:**

```typescript
interface WorkspaceContextType {
  // Workspace Tabs
  tabs: WorkspaceTab[];
  activeTabId: string;
  activeWorkspace: WorkspaceData;
  
  // Tab Operations
  addTab: () => void;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  renameTab: (tabId: string, newName: string) => void;
  resetWorkspace: (tabId: string) => void;
  updateWorkspaceData: (data: Partial<WorkspaceData>) => void;
  
  // Formula Locking
  isFormulaLocked: (formulaId: string) => boolean;
  getFormulaLockedInWorkspace: (formulaId: string) => string | null;
  lockFormula: (formulaId: string) => void;
  unlockFormula: (formulaId: string) => void;
  
  // Global Data
  availableFormulas: Formula[];
  ingredients: Ingredient[];
  attributes: IngredientAttribute[];
  setAvailableFormulas: (formulas: Formula[]) => void;
  setIngredients: (ingredients: Ingredient[]) => void;
  setAttributes: (attributes: IngredientAttribute[]) => void;
}
```

**Usage:**

```typescript
import { useWorkspace } from '../hooks/useWorkspace';

const Component = () => {
  const {
    tabs,
    activeTabId,
    activeWorkspace,
    addTab,
    switchTab,
    updateWorkspaceData,
  } = useWorkspace();

  // Access workspace data
  const { columns, tableData, formulas } = activeWorkspace;

  // Update workspace
  const handleDataChange = (newData: any[]) => {
    updateWorkspaceData({ tableData: newData });
  };

  return (/* ... */);
};
```

**Key Benefits:**

- Centralized workspace state
- Automatic workspace isolation
- Formula lock management
- Global data sharing

---

### 2. Local Component State

Component-specific state using React useState hook.

**Common Patterns:**

```typescript
// UI State
const [isOpen, setIsOpen] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Form State
const [formData, setFormData] = useState({
  name: '',
  category: '',
  description: '',
});

// Selection State
const [selectedItems, setSelectedItems] = useState<string[]>([]);
const [activeItem, setActiveItem] = useState<string | null>(null);

// Computed State (derived from props/context)
const filteredItems = useMemo(() => {
  return items.filter(item => item.status === 'active');
}, [items]);
```

**Best Practices:**

- Keep state as local as possible
- Use derived state with useMemo for computed values
- Lift state up only when necessary
- Initialize state with meaningful defaults

---

### 3. Custom Hooks State

Encapsulated state logic in reusable custom hooks.

#### useWorkAreaState

Manages main workspace state for formula operations.

**Location:** `src/view/WorkArea/hooks/useWorkAreaState.ts`

**State:**

```typescript
const useWorkAreaState = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [attributes, setAttributes] = useState<IngredientAttribute[]>([]);
  const [editableFormula, setEditableFormula] = useState<string | null>(null);
  const [selectedFormulaIds, setSelectedFormulaIds] = useState<string[]>([]);
  const [activeFormula, setActiveFormula] = useState<Formula | null>(null);
  
  return {
    columns, setColumns,
    tableData, setTableData,
    formulas, setFormulas,
    ingredients, setIngredients,
    attributes, setAttributes,
    editableFormula, setEditableFormula,
    selectedFormulaIds, setSelectedFormulaIds,
    activeFormula, setActiveFormula,
    // ... other state
  };
};
```

#### useDilution

Manages ingredient dilution state.

**Location:** `src/components/dilution/useDilution.ts`

**API:**

```typescript
const {
  dilutions,
  getDilution,
  setDilution,
  removeDilution,
  hasDilution,
  clearAllDilutions,
  restoreDilutions,
} = useDilution();
```

**Implementation Highlights:**

```typescript
export const useDilution = (): UseDilutionReturn => {
  const [dilutions, setDilutions] = useState<DilutionState>({});

  const setDilution = useCallback((ingredientId: string, dilution: Dilution) => {
    setDilutions((prev) => ({
      ...prev,
      [ingredientId]: dilution,
    }));
    
    // Emit event for state history tracking
    setTimeout(() => {
      eventBus.emit("dilution-changed", { ingredientId, dilution });
    }, 0);
  }, []);

  const hasDilution = useCallback(
    (ingredientId: string): boolean => {
      return !!dilutions[ingredientId]?.solventIds?.length;
    },
    [dilutions]
  );

  return {
    dilutions,
    getDilution: useCallback((id) => dilutions[id], [dilutions]),
    setDilution,
    removeDilution: useCallback((id) => {
      setDilutions((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }, []),
    hasDilution,
    clearAllDilutions: useCallback(() => setDilutions({}), []),
    restoreDilutions: useCallback((saved) => setDilutions(saved || {}), []),
  };
};
```

#### useRowReordering

Manages drag-and-drop row reordering state.

**Location:** `src/components/DataGrid/hooks/useRowReordering.ts`

```typescript
const {
  dragState,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDragLeave,
} = useRowReordering(data, onRowReorder, onDragStart);
```

#### useBulkSelection

Manages multi-row selection state.

**Location:** `src/components/DataGrid/hooks/useBulkSelection.ts`

```typescript
const {
  selectedRows,
  toggleRowSelection,
  toggleSelectAll,
  clearSelection,
  isRowSelected,
  isAllSelected,
  isSomeSelected,
} = useBulkSelection(data);
```

---

### 4. Event Bus Pattern

Custom event bus for decoupled cross-component communication.

**Location:** `src/utils/bus.ts`

**Implementation:**

```typescript
type EventCallback = (data?: any) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: any): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const eventBus = new EventBus();
```

**Event Catalog:**

| Event Name | Emitter | Listener | Data | Purpose |
|------------|---------|----------|------|---------|
| `ingredient-selected` | LibraryPanel | WorkArea | `{ ingredient }` | User selects ingredient |
| `formula-selected` | LibraryPanel | WorkArea | `{ formula }` | User selects formula |
| `attribute-selected` | LibraryPanel | WorkArea | `{ attribute }` | User selects attribute |
| `normalize-formula` | Header | WorkArea | none | Trigger normalization |
| `merge-duplicates` | Header | WorkArea | none | Merge duplicate ingredients |
| `send-for-compounding` | Header | WorkArea | none | Submit for compounding |
| `undo-action` | Header | WorkArea | none | Undo last action |
| `active-formula-changed` | WorkArea | Header | `{ formula }` | Active formula updated |
| `formula-selections-updated` | WorkArea | Header, Library | `{ count, selectedIds }` | Formula selections changed |
| `work-area-updated` | WorkArea | Library | `{ ingredients }` | Ingredients updated |
| `dilution-changed` | DilutionHook | WorkArea | `{ ingredientId, dilution }` | Dilution modified |
| `undo-state-updated` | WorkArea | Header | `{ canUndo, count }` | Undo state changed |
| `available-formulas-updated` | WorkArea | Header | `{ formulas }` | Formula list updated |

**Usage Pattern:**

```typescript
// Emitter Component
const LibraryPanel = () => {
  const handleIngredientClick = (ingredient: Ingredient) => {
    eventBus.emit('ingredient-selected', { ingredient });
  };

  return (/* ... */);
};

// Listener Component
const WorkArea = () => {
  useEffect(() => {
    const handleIngredientSelected = (data: { ingredient: Ingredient }) => {
      // Add ingredient to formula
      addIngredient(data.ingredient);
    };

    eventBus.on('ingredient-selected', handleIngredientSelected);

    return () => {
      eventBus.off('ingredient-selected', handleIngredientSelected);
    };
  }, []);

  return (/* ... */);
};
```

**Best Practices:**

- Always clean up event listeners in useEffect return
- Use TypeScript interfaces for event data
- Document events in catalog above
- Avoid circular event dependencies
- Prefer direct props for parent-child communication

---

### 5. State History (Undo/Redo)

Time-travel state management for undo/redo functionality.

**Location:** `src/utils/stateHistory.ts`

**Implementation:**

```typescript
export class StateHistoryManager<T = any> {
  private history: HistoryEntry<T>[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 6; // Current + 5 undos

  push(state: T, action: string, description?: string): void {
    // Remove future states if we've undone
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new entry with deep clone
    this.history.push({
      state: JSON.parse(JSON.stringify(state)),
      timestamp: new Date(),
      action,
      description,
    });

    // Maintain max size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  undo(): T | null {
    if (!this.canUndo()) return null;
    this.currentIndex--;
    return this.getCurrentState();
  }

  redo(): T | null {
    if (!this.canRedo()) return null;
    this.currentIndex++;
    return this.getCurrentState();
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  getCurrentState(): T | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return null;
    }
    return JSON.parse(JSON.stringify(this.history[this.currentIndex].state));
  }
}

// Global instance
export const appStateHistory = new StateHistoryManager();
```

**Usage:**

```typescript
// Save state after action
const saveStateAfterAction = (action: string, description: string) => {
  setTimeout(() => {
    appStateHistory.push(
      {
        columns,
        tableData,
        formulas,
        availableFormulas,
        dilutions: dilutionState.dilutions,
      },
      action,
      description
    );
    
    eventBus.emit("undo-state-updated", {
      canUndo: appStateHistory.canUndo(),
      count: appStateHistory.getUndoCount(),
    });
  }, 0);
};

// Undo operation
const handleUndo = () => {
  const previousState = appStateHistory.undo();
  if (previousState) {
    setColumns(previousState.columns);
    setTableData(previousState.tableData);
    setFormulas(previousState.formulas);
    setAvailableFormulas(previousState.availableFormulas);
    dilutionState.restoreDilutions(previousState.dilutions);
    
    toast.success('Undone');
  }
};
```

**State Snapshot Structure:**

```typescript
interface WorkspaceState {
  columns: Column[];
  tableData: Record<string, unknown>[];
  formulas: Formula[];
  availableFormulas: Formula[];
  dilutions: DilutionState;
}
```

---

## State Flow Diagrams

### Ingredient Addition Flow

```
User clicks ingredient in Library
  ↓
LibraryPanel.handleIngredientClick()
  ↓
eventBus.emit('ingredient-selected', { ingredient })
  ↓
WorkArea.handleIngredientSelected() receives event
  ↓
Validate: ingredient not duplicate, has active formula
  ↓
Create new row with ingredient data
  ↓
Insert row before total rows
  ↓
Recalculate totals (running, RMC, lines)
  ↓
Update contribution cost for active formula
  ↓
setTableData(newData)
  ↓
Save to state history
  ↓
eventBus.emit('work-area-updated', { ingredients })
  ↓
LibraryPanel updates selected ingredients
```

### Formula Column Addition Flow

```
User clicks "+ Formula" button
  ↓
Modal opens with formula selection
  ↓
User selects formula
  ↓
eventBus.emit('formula-selected', { formula })
  ↓
WorkArea checks formula not locked
  ↓
Create new column definition
  ↓
Insert column before "+ Formula" column
  ↓
Initialize all rows with 0 for new column
  ↓
Lock formula in workspace context
  ↓
Set as editableFormula
  ↓
setColumns(newColumns)
  ↓
setTableData(newData)
  ↓
Save to state history
  ↓
eventBus.emit('formula-selections-updated')
  ↓
Header updates badge count
```

### Cell Edit Flow

```
User double-clicks cell
  ↓
Cell enters edit mode (input shown)
  ↓
User types new value
  ↓
User presses Enter or clicks outside
  ↓
Validate value (type, range)
  ↓
onCellEdit(rowId, columnId, newValue)
  ↓
Update tableData at [rowId][columnId]
  ↓
If active formula column, recalculate contribution costs
  ↓
Recalculate totals (all total rows)
  ↓
setTableData(updatedData)
  ↓
Save to state history
  ↓
eventBus.emit('undo-state-updated')
```

---

## Performance Optimizations

### Memoization

```typescript
// Memoize expensive calculations
const filteredData = useMemo(() => {
  return data.filter(row => /* filter logic */);
}, [data, filterCriteria]);

// Memoize callbacks to prevent child re-renders
const handleClick = useCallback((id: string) => {
  // Handle click
}, [/* dependencies */]);

// Memoize component with React.memo
const ExpensiveComponent = React.memo(({ data }: Props) => {
  return (/* ... */);
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data;
});
```

### Debouncing

```typescript
// Debounce search input
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    setSearchQuery(query);
  }, 300),
  []
);

// Debounce state saves
const debouncedSave = useMemo(
  () => debounce((state: WorkspaceState) => {
    appStateHistory.push(state, 'auto_save');
  }, 500),
  []
);
```

### Lazy State Initialization

```typescript
// Expensive initial state
const [data, setData] = useState(() => {
  // Only runs once on mount
  return computeExpensiveInitialState();
});
```

### Batch Updates

```typescript
// React 19 automatically batches state updates
const handleMultipleUpdates = () => {
  setColumns(newColumns);      // Batched
  setTableData(newData);        // Batched
  setFormulas(newFormulas);     // Batched
  // Single re-render after all updates
};
```

---

## Best Practices

### 1. State Colocation

Keep state as close to where it's used as possible.

**Bad:**

```typescript
// Global state for local UI
const [isModalOpen, setIsModalOpen] = useState(false); // In App.tsx
```

**Good:**

```typescript
// Local state in component
const MyComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // ...
};
```

### 2. Avoid Prop Drilling

Use Context or event bus instead of passing props through many levels.

**Bad:**

```typescript
<App>
  <Layout data={data}>
    <Sidebar data={data}>
      <Menu data={data}>
        <MenuItem data={data} /> {/* Prop drilling */}
      </Menu>
    </Sidebar>
  </Layout>
</App>
```

**Good:**

```typescript
<WorkspaceProvider>
  <App>
    <Layout>
      <Sidebar>
        <Menu>
          <MenuItem /> {/* Gets data from context */}
        </Menu>
      </Sidebar>
    </Layout>
  </App>
</WorkspaceProvider>
```

### 3. Derived State

Compute derived values instead of storing them.

**Bad:**

```typescript
const [items, setItems] = useState([]);
const [activeItems, setActiveItems] = useState([]);

// Must manually sync
useEffect(() => {
  setActiveItems(items.filter(i => i.active));
}, [items]);
```

**Good:**

```typescript
const [items, setItems] = useState([]);
const activeItems = useMemo(() => {
  return items.filter(i => i.active);
}, [items]);
```

### 4. Immutable Updates

Always create new objects/arrays, don't mutate.

**Bad:**

```typescript
const handleAdd = (item) => {
  items.push(item);          // Mutation!
  setItems(items);           // Won't trigger re-render
};
```

**Good:**

```typescript
const handleAdd = (item) => {
  setItems(prev => [...prev, item]);  // New array
};
```

### 5. Cleanup Effects

Always clean up side effects in useEffect.

**Good:**

```typescript
useEffect(() => {
  const handleEvent = (data) => {
    // Handle event
  };

  eventBus.on('my-event', handleEvent);

  return () => {
    eventBus.off('my-event', handleEvent);
  };
}, []);
```

---

## Debugging State

### React DevTools

Install React DevTools browser extension to:

- Inspect component state and props
- View context values
- Profile component renders
- Trace state updates

### Console Logging

```typescript
// Log state changes
useEffect(() => {
  console.log('State updated:', { columns, tableData, formulas });
}, [columns, tableData, formulas]);

// Log event emissions
eventBus.emit('my-event', data);
console.log('Event emitted:', 'my-event', data);
```

### State History Export

```typescript
// Export history for debugging
const exportHistory = () => {
  const history = appStateHistory.exportHistory();
  console.log(history);
  
  // Or download as file
  const blob = new Blob([history], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'state-history.json';
  a.click();
};
```

---

## Testing State

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDilution } from './useDilution';

test('setDilution adds dilution', () => {
  const { result } = renderHook(() => useDilution());

  act(() => {
    result.current.setDilution('ING001', {
      ingredientId: 'ING001',
      concentration: 10,
      solventIds: ['SOLV001'],
      solventPercentages: { 'SOLV001': 90 },
      totalPercentage: 100,
    });
  });

  expect(result.current.hasDilution('ING001')).toBe(true);
});
```

### Testing Context

```typescript
import { render } from '@testing-library/react';
import { WorkspaceProvider } from './WorkspaceContext';
import { useWorkspace } from '../hooks/useWorkspace';

test('adds new workspace tab', () => {
  const TestComponent = () => {
    const { tabs, addTab } = useWorkspace();
    return (
      <div>
        <div data-testid="count">{tabs.length}</div>
        <button onClick={addTab}>Add</button>
      </div>
    );
  };

  const { getByTestId, getByText } = render(
    <WorkspaceProvider>
      <TestComponent />
    </WorkspaceProvider>
  );

  expect(getByTestId('count')).toHaveTextContent('1');
  
  fireEvent.click(getByText('Add'));
  
  expect(getByTestId('count')).toHaveTextContent('2');
});
```

---

## Future Enhancements

- [ ] Implement Redux for more complex state
- [ ] Add Redux DevTools integration
- [ ] Implement state persistence to localStorage
- [ ] Add state migration system for schema changes
- [ ] Implement optimistic updates for API calls
- [ ] Add state rehydration on app load
- [ ] Implement state synchronization across browser tabs
- [ ] Add state compression for large datasets
- [ ] Implement undo/redo with branching
- [ ] Add state snapshot comparison tools
