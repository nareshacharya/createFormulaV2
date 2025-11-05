# Application Architecture

## Overview

The **CreateFormulaV2** application is a React-based fragrance formulation management system built with TypeScript and Vite. It provides perfumers with tools to create, edit, and manage fragrance formulas through an intuitive interface with multi-workspace support, advanced data grid operations, and real-time calculations.

## Technology Stack

### Frontend Framework
- **React 19.0.0** - UI library with hooks and functional components
- **TypeScript 5.7.2** - Type-safe development
- **Vite 6.0.5** - Build tool and dev server
- **React Router DOM 7.1.1** - Client-side routing

### Styling
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
- **PostCSS 8.5.1** - CSS processing
- **Custom Design System** - Defined in `src/config/theme.ts`

### State Management
- **React Context API** - Global state via `WorkspaceContext`
- **React Hooks** - Local state management
- **Event Bus Pattern** - Cross-component communication (`src/utils/bus.ts`)

### Internationalization
- **i18next 24.0.5** - Translation framework
- **react-i18next 15.2.0** - React bindings
- **Browser Language Detector 8.0.2** - Automatic language detection

### Data Handling
- **React Hot Toast 2.6.0** - Toast notifications
- **React QueryBuilder 7.4.2** - Advanced filtering UI

## Application Structure

```
src/
├── components/          # Reusable UI components
│   ├── DataGrid/       # DataGrid sub-components and utilities
│   ├── dilution/       # Dilution feature components
│   ├── IngredientSections/  # Ingredient detail sections
│   └── workspace/      # Workspace management components
├── config/             # Configuration files (theme, constants)
├── context/            # React Context providers
├── controller/         # UI layout controllers
├── hooks/              # Custom React hooks
├── i18n/               # Internationalization setup
├── mocks/              # Mock data for development
├── model/              # Data models and types
├── pages/              # Page components
├── router/             # Routing configuration
├── services/           # External service integrations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
└── view/               # Major view components
    ├── AppShell/       # Application shell and header
    ├── Library/        # Library panel views
    └── WorkArea/       # Main workspace area
```

## Architectural Patterns

### 1. Component-Based Architecture

The application follows a hierarchical component structure:

```
App (Root)
├── WorkspaceProvider (Global State)
├── ModalContext (Global Modals)
└── AppRoutes
    └── HomePage
        └── AppShell
            ├── AppHeader
            │   ├── Header.Badges
            │   └── Header.Actions
            ├── WorkspaceTabs
            ├── LibraryPanel
            │   ├── IngredientList
            │   ├── FormulaList
            │   └── IngredientAttributeList
            └── WorkArea
                ├── DataGrid
                ├── FormulaMetrics
                └── Various Modals
```

### 2. Event-Driven Communication

The application uses a custom event bus (`src/utils/bus.ts`) for decoupled component communication:

**Key Events:**
- `ingredient-selected` - User selects an ingredient from library
- `formula-selected` - User selects a formula
- `attribute-selected` - User selects an attribute
- `normalize-formula` - Trigger formula normalization
- `merge-duplicates` - Merge duplicate ingredients
- `send-for-compounding` - Submit formula for compounding
- `undo-action` - Undo last action
- `active-formula-changed` - Active formula changed
- `dilution-changed` - Dilution settings modified
- `work-area-updated` - WorkArea state changed
- `undo-state-updated` - Undo/redo state changed

**Event Bus Pattern:**
```typescript
// Emitter
eventBus.emit('ingredient-selected', { ingredient });

// Listener
eventBus.on('ingredient-selected', (data) => {
  // Handle event
});

// Cleanup
eventBus.off('ingredient-selected', handler);
```

### 3. Custom Hooks Pattern

Business logic is extracted into custom hooks for reusability and separation of concerns:

**State Management Hooks:**
- `useWorkAreaState` - Main workspace state management
- `useWorkspace` - Workspace tab management
- `useDilution` - Dilution state management

**Operation Hooks:**
- `useDataGridHandlers` - DataGrid event handlers
- `useFormulaOperations` - Formula CRUD operations
- `useFormulaColumnHandlers` - Formula column operations

**UI Hooks:**
- `useClickOutside` - Detect clicks outside elements
- `useRowReordering` - Drag-and-drop row reordering
- `useBulkSelection` - Multi-select functionality
- `useKeyboardNavigation` - Keyboard shortcuts
- `useSavedViews` - Save/load grid views

### 4. Workspace Context Architecture

The `WorkspaceContext` provides multi-workspace support with isolated sessions:

**Features:**
- Up to 3 concurrent workspace tabs
- Each workspace has isolated state (columns, data, formulas)
- Formula locking across workspaces (prevent concurrent edits)
- Global data shared across all workspaces (ingredients, attributes)
- Workspace persistence and recovery

**Context API:**
```typescript
interface WorkspaceContextType {
  // Tab Management
  tabs: WorkspaceTab[];
  activeTabId: string;
  addTab: () => void;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  renameTab: (tabId: string, newName: string) => void;
  
  // Session Management
  resetWorkspace: (tabId: string) => void;
  updateWorkspaceData: (data: Partial<WorkspaceData>) => void;
  
  // Formula Locking
  isFormulaLocked: (formulaId: string) => boolean;
  lockFormula: (formulaId: string) => void;
  unlockFormula: (formulaId: string) => void;
  
  // Global Data
  availableFormulas: Formula[];
  ingredients: Ingredient[];
  attributes: IngredientAttribute[];
}
```

### 5. State History Management

Undo/Redo functionality is implemented via `StateHistoryManager`:

**Features:**
- Maximum 5 undo operations (6 states total including current)
- Deep state cloning for immutability
- Audit trail with timestamps and descriptions
- Export/import for persistence

**Usage:**
```typescript
// Save state after action
appStateHistory.push(
  { columns, tableData, formulas, dilutions },
  'add_ingredient',
  'Added Bergamot Oil to formula'
);

// Undo
const previousState = appStateHistory.undo();
if (previousState) {
  restoreState(previousState);
}

// Check availability
const canUndo = appStateHistory.canUndo();
const undoCount = appStateHistory.getUndoCount();
```

### 6. Service Layer Pattern

External integrations are abstracted through service classes:

**PegaService** (`src/services/pega.ts`):
- Data fetching (ingredients, formulas, attributes)
- CRUD operations
- Search and filtering
- Mock data for development
- Ready for DX API integration

**CompoundingService** (`src/services/compounding.ts`):
- Formula preparation for submission
- Validation rules
- Audit trail generation
- Export/import functionality

### 7. Utility-Based Calculations

Complex calculations are centralized in utility modules:

**Key Utilities:**
- `formulaCalculations.ts` - Percentage, RMC, totals
- `formulaIdGenerator.ts` - Unique ID generation
- `formulaNaming.ts` - Version and naming conventions
- `rmcCalculator.ts` - Raw Material Cost calculations
- `queryEvaluator.ts` - Advanced filter evaluation
- `grouping.ts` - Data grouping logic

## Data Flow

### 1. Initial Load Flow

```
App Mount
  └─> WorkspaceProvider Initialize
      ├─> Create default workspace
      └─> Load global data
          └─> PegaService.getFormulas()
          └─> PegaService.getIngredients()
          └─> PegaService.getIngredientAttributes()
              └─> Emit 'available-formulas-updated'
                  └─> Header listens and updates
```

### 2. Ingredient Addition Flow

```
User clicks ingredient in Library
  └─> LibraryPanel emits 'ingredient-selected'
      └─> WorkArea listener receives event
          └─> Validate: ingredient not already in formula
          └─> Add row to tableData
          └─> Recalculate totals (running, RMC, lines)
          └─> Update contribution cost
          └─> Save state to history
          └─> Emit 'work-area-updated'
              └─> LibraryPanel marks ingredient as selected
```

### 3. Formula Column Addition Flow

```
User clicks "+ Formula" in DataGrid
  └─> WorkArea opens FormulaModal
      └─> User selects/creates formula
          └─> Add formula column to grid
          └─> Lock formula in current workspace
          └─> Initialize column with zeros
          └─> Add total rows (running, target, RMC, lines)
          └─> Set as editable formula
          └─> Save state to history
          └─> Emit 'formula-selections-updated'
              └─> Header updates formula count badge
              └─> LibraryPanel marks formula as locked
```

### 4. Cell Edit Flow

```
User edits cell value
  └─> DataGrid.EditableCell onChange
      └─> onCellEdit handler in WorkArea
          └─> Validate input (number, range)
          └─> Update tableData at row/column
          └─> Recalculate percentages
          └─> Update contribution costs
          └─> Recalculate totals
          └─> Save state to history
          └─> Emit 'undo-state-updated'
              └─> Header enables undo button
```

### 5. Normalization Flow

```
User clicks "Normalize" in header
  └─> Header emits 'normalize-formula'
      └─> WorkArea listener receives event
          └─> Get active formula column
          └─> Calculate current total
          └─> Calculate scale factor (100 / current)
          └─> Multiply all values by factor
          └─> Round to 5 decimals
          └─> Update tableData
          └─> Update target total to 100.00000
          └─> Save state to history
          └─> Show success toast
```

### 6. Compounding Submission Flow

```
User clicks "Send for Compounding"
  └─> Header emits 'send-for-compounding'
      └─> WorkArea prepares formula data
          └─> Validate formula (100%, no negatives)
          └─> Build CompoundingFormula object
          └─> Add audit trail entries
          └─> CompoundingService.submitForCompounding()
              └─> POST to Pega DX API (future)
              └─> Return submission ID
                  └─> Show success notification
                  └─> Mark formula as submitted
```

## Design Patterns

### 1. Composition Over Inheritance

Components are composed of smaller, reusable components:
```tsx
<DataGrid
  columns={columns}
  data={data}
  dilutionState={dilutionState}
>
  <TableHeader />
  <TableBody>
    <DraggableRow>
      <CellRenderer />
    </DraggableRow>
  </TableBody>
  <BulkActionsToolbar />
</DataGrid>
```

### 2. Render Props Pattern

Used for flexible, reusable components:
```typescript
interface Column {
  render?: (value: any, row: any) => React.ReactNode;
}
```

### 3. Controlled Components

All inputs are controlled for predictable state:
```tsx
<input
  value={localValue}
  onChange={(e) => setLocalValue(e.target.value)}
  onBlur={() => onSave(localValue)}
/>
```

### 4. Custom Hook Pattern

Extract complex logic into reusable hooks:
```typescript
const {
  dilutions,
  getDilution,
  setDilution,
  hasDilution
} = useDilution();
```

### 5. Provider Pattern

Global state via Context providers:
```tsx
<WorkspaceProvider>
  <App />
</WorkspaceProvider>
```

## Performance Optimizations

### 1. Memoization

- `useMemo` for expensive calculations
- `useCallback` for stable function references
- `React.memo` for component memoization

### 2. Lazy Loading

- Dynamic imports for large modules
- Code splitting by route
- Lazy modal rendering

### 3. Debouncing

- Search input debounced (300ms)
- Auto-save debounced (500ms)
- Calculation throttling

### 4. Virtual Scrolling

- DataGrid virtualizes rows for 1000+ items
- Library panel virtualizes ingredient list
- Attribute list virtualization

### 5. Event Batching

- State updates batched in React 19
- Multiple calculations grouped
- Single re-render after batch

## Error Handling

### 1. Validation Layer

- Input validation (type, range, format)
- Formula validation (totals, percentages)
- Cross-field validation

### 2. Error Boundaries

- Component-level error catching
- Fallback UI for failures
- Error reporting to console

### 3. Toast Notifications

- Success messages (green)
- Error messages (red)
- Warning messages (yellow)
- Info messages (blue)

### 4. Graceful Degradation

- Fallback to mock data if API fails
- Offline support with local state
- Partial UI rendering on errors

## Testing Strategy

### Unit Testing
- Utility functions (calculations, validators)
- Custom hooks in isolation
- Service layer functions

### Component Testing
- Component rendering
- User interactions
- Event emissions
- State changes

### Integration Testing
- Feature workflows
- Multi-component interactions
- Event bus communication
- State persistence

### E2E Testing
- Complete user journeys
- Formula creation to submission
- Multi-workspace workflows
- Undo/redo operations

## Security Considerations

### 1. Input Sanitization

- XSS prevention on text inputs
- SQL injection prevention (API layer)
- Type validation via TypeScript

### 2. API Authentication

- Bearer token authentication (future)
- Session management
- CSRF protection

### 3. Data Validation

- Client-side validation
- Server-side validation (API)
- Type checking at boundaries

## Future Architecture Improvements

### 1. State Management

- Consider Redux Toolkit for complex state
- Implement Redux DevTools integration
- Add state persistence middleware

### 2. API Integration

- Implement React Query for data fetching
- Add optimistic updates
- Implement retry logic
- Add request caching

### 3. Testing

- Add Vitest for unit tests
- Add React Testing Library
- Implement E2E with Playwright
- Add visual regression testing

### 4. Performance

- Implement React Query for caching
- Add service worker for offline
- Optimize bundle size
- Add lazy loading for routes

### 5. Accessibility

- Add ARIA labels comprehensively
- Implement keyboard shortcuts
- Add screen reader support
- Ensure WCAG 2.1 AA compliance

### 6. Monitoring

- Add error tracking (Sentry)
- Add performance monitoring
- Add user analytics
- Add audit logging

## File Organization Best Practices

### Naming Conventions

- **Components**: PascalCase (`DataGrid.tsx`)
- **Hooks**: camelCase with `use` prefix (`useWorkspace.ts`)
- **Utils**: camelCase (`formulaCalculations.ts`)
- **Types**: PascalCase (`Formula.ts`)
- **Constants**: UPPER_SNAKE_CASE

### Import Order

1. External dependencies
2. Internal components
3. Internal hooks
4. Internal utils
5. Types
6. Styles

### Component Structure

```tsx
// 1. Imports
import React, { useState } from 'react';

// 2. Types
interface Props {}

// 3. Component
const Component = ({ prop }: Props) => {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Handlers
  const handleClick = () => {};
  
  // 6. Effects
  useEffect(() => {}, []);
  
  // 7. Render
  return <div />;
};

// 8. Export
export default Component;
```

## Configuration Files

- **vite.config.ts** - Vite build configuration
- **tsconfig.json** - TypeScript compiler options
- **tailwind.config.ts** - Tailwind CSS configuration
- **postcss.config.ts** - PostCSS plugins
- **eslint.config.js** - ESLint rules
- **vercel.json** - Deployment configuration

## Build and Deployment

### Development
```bash
npm run dev  # Start Vite dev server on http://localhost:5173
```

### Production Build
```bash
npm run build  # TypeScript compile + Vite build
npm run preview  # Preview production build
```

### Linting
```bash
npm run lint  # Run ESLint
```

## Related Documentation

- [Feature Documentation](./features/) - Detailed feature specs
- [Component API](./COMPONENTS.md) - Component reference
- [State Management](./STATE_MANAGEMENT.md) - State patterns
- [API Integration](./API_INTEGRATION.md) - Service integration
