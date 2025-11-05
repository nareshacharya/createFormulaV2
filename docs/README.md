# CreateFormulaV2 - Documentation Index

## Overview

Complete documentation for the CreateFormulaV2 fragrance formulation management application. This documentation covers architecture, features, components, and development guidelines.

## Quick Links

- **[Architecture](./ARCHITECTURE.md)** - Application structure, patterns, and design decisions
- **[Features](./features/)** - Detailed feature specifications with user stories
- **[State Management](./STATE_MANAGEMENT.md)** - State patterns and event bus
- **[Feature Flags & API Integration](./FEATURE_FLAGS_API_INTEGRATION.md)** - Complete integration guide
- **[Feature Flags Quick Start](./FEATURE_FLAGS_QUICK_START.md)** - Quick reference for developers
- **[Quick Reference](./QUICK_REFERENCE.md)** - Fast lookup guide

## Application Overview

**CreateFormulaV2** is a React-based perfume formulation management system that enables perfumers to:

- Create and manage fragrance formulas
- Work with ingredient libraries
- Calculate formulations with real-time totals
- Use multi-workspace sessions for parallel projects
- Dilute ingredients with solvents
- Submit formulas for compounding
- Track changes with undo/redo

### Technology Stack

- **React 19.0.0** with TypeScript 5.7.2
- **Vite 6.0.5** for build tooling
- **Tailwind CSS 3.4.0** for styling
- **React Context API** for state management
- **Event Bus** for component communication
- **i18next** for internationalization

## Features Documentation

### Core Features

#### [Formula Management](./features/FORMULA_MANAGEMENT.md)

Complete formula lifecycle management including creation, versioning, and activation.

**Key User Stories:**

- US-001: View Formula Library
- US-002: Select Formula for Workspace
- US-003: Create New Formula
- US-004: Edit Formula Metadata
- US-005: Set Active/Editable Formula
- US-006: Create Formula Version
- US-007: Normalize Formula
- US-008: Send Formula for Compounding
- US-009: Remove Formula from Workspace
- US-010: View Formula Metrics

**Files:**

- `src/components/FormulaModal.tsx`
- `src/components/FormulaList.tsx`
- `src/view/WorkArea/hooks/useFormulaOperations.ts`
- `src/view/WorkArea/components/FormulaColumnHandlers.tsx`

---

#### [Ingredient Management](./features/INGREDIENT_MANAGEMENT.md)

Comprehensive ingredient browsing, searching, filtering, and selection system.

**Key User Stories:**

- US-020: Browse Ingredient Library
- US-021: Search Ingredients
- US-022: Filter by Ingredient Type
- US-023: Advanced Filtering
- US-024: View Ingredient Quick Info
- US-025: View Ingredient Full Details
- US-026: Add Ingredient to Formula
- US-027: Remove Ingredient from Formula
- US-028: View Ingredient Usage
- US-029: Sort Ingredient List

**Files:**

- `src/components/IngredientList.tsx`
- `src/components/IngredientQuickView.tsx`
- `src/components/QueryBuilder.tsx`
- `src/view/Library/LibraryPanel.tsx`

---

#### [DataGrid Operations](./features/DATAGRID_OPERATIONS.md)

Advanced table operations including inline editing, drag-and-drop, bulk actions, and keyboard navigation.

**Key User Stories:**

- US-040: Edit Cell Values Inline
- US-041: Reorder Rows by Dragging
- US-042: Select Multiple Rows
- US-043: Bulk Delete Rows
- US-044: Add/Remove Columns
- US-045: Sort by Column
- US-046: Filter Column Values
- US-047: Group Rows by Attribute
- US-048: View Running Total
- US-049: Keyboard Navigation
- US-050: Copy/Paste Values
- US-051: Export Grid Data
- US-052: Resize Columns

**Files:**

- `src/components/DataGrid.tsx`
- `src/components/DataGrid/components/CellRenderer.tsx`
- `src/components/DataGrid/hooks/useRowReordering.ts`
- `src/components/DataGrid/hooks/useBulkSelection.ts`
- `src/components/DataGrid/hooks/useKeyboardNavigation.ts`

---

#### [Workspace Management](./features/WORKSPACE_MANAGEMENT.md)

Multi-workspace support with isolated sessions and formula locking.

**Key User Stories:**

- US-060: View Active Workspace
- US-061: Create New Workspace
- US-062: Switch Between Workspaces
- US-063: Rename Workspace
- US-064: Close Workspace
- US-065: Reset Workspace
- US-066: Formula Locking Across Workspaces
- US-067: View Workspace Summary
- US-068: Workspace State Persistence
- US-069: Workspace Limit Management

**Files:**

- `src/context/WorkspaceContext.tsx`
- `src/components/workspace/WorkspaceTabs.tsx`
- `src/hooks/useWorkspace.ts`

---

#### [Dilution Feature](./features/DILUTION.md)

Ingredient dilution system with solvent management and concentration calculations.

**Key User Stories:**

- US-080: Add Dilution to Ingredient
- US-081: View Dilution Details
- US-082: Edit Dilution
- US-083: Remove Dilution
- US-084: Multiple Solvents Selection
- US-085: Dilution Calculation Display

**Files:**

- `src/components/dilution/DilutionModal.tsx`
- `src/components/dilution/DilutionBadge.tsx`
- `src/components/dilution/useDilution.ts`
- `src/types/dilution.ts`

---

## Architecture

### Application Structure

```
src/
├── components/          # Reusable UI components
│   ├── DataGrid/       # DataGrid sub-components
│   ├── dilution/       # Dilution feature
│   ├── workspace/      # Workspace management
│   └── *.tsx           # Other components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── services/           # External service integrations
├── utils/              # Utility functions
├── view/               # Major view components
│   ├── AppShell/       # App shell and header
│   ├── Library/        # Library panel
│   └── WorkArea/       # Main workspace
├── mocks/              # Mock data
└── types/              # TypeScript types
```

### Key Patterns

1. **Event-Driven Communication** - Custom event bus for decoupled components
2. **Custom Hooks** - Business logic extracted into reusable hooks
3. **Context API** - Global state via WorkspaceContext
4. **State History** - Undo/redo with StateHistoryManager
5. **Service Layer** - API abstraction via PegaService

### State Management Flow

```
User Action → Component Event → Hook Function → State Update → Re-render
     ↓
Event Bus Notification → Other Components Update
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev  # Start at http://localhost:5173
```

### Build

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint
```

## Key Concepts

### Formulas

Formulas are compositions of ingredients with percentages. Each formula has:

- Unique ID and version
- Status (draft, active, archived, submitted)
- Ingredients list with percentages
- Metadata (creator, category, description)

### Workspaces

Workspaces are isolated sessions that allow working on multiple projects:

- Maximum 3 concurrent workspaces
- Each has independent state (formulas, ingredients, grid)
- Formula locking prevents concurrent editing
- Default workspace (Alpha) cannot be closed

### DataGrid

The central component for formula editing:

- Columns: Ingredient properties, formulas, attributes
- Rows: Ingredients with values per formula
- Total rows: Running total, target, RMC, lines count
- Operations: Edit, reorder, bulk actions, sorting

### Calculations

Real-time calculations include:

- **Running Total**: Sum of all ingredient percentages
- **Target Total**: Always 100.00000 (normalized)
- **RMC (Raw Material Cost)**: Sum of contribution costs
- **Contribution Cost**: (percentage × costPerKg) / 1000
- **Number of Lines**: Count of non-zero ingredients

### Event Bus

Custom event system for cross-component communication:

```typescript
// Emit
eventBus.emit('ingredient-selected', { ingredient });

// Listen
eventBus.on('ingredient-selected', (data) => {
  // Handle event
});

// Cleanup
eventBus.off('ingredient-selected', handler);
```

## API Integration

### Pega DX API (Future)

The application is designed to integrate with Pega DX API:

- **Formula Management**: CRUD operations for formulas
- **Ingredient Library**: Fetch and search ingredients
- **Attributes**: Get ingredient attributes
- **Compounding**: Submit formulas for production
- **Authentication**: Bearer token authentication

Current implementation uses mock data in `src/mocks/`.

## Development Guidelines

### Component Structure

```typescript
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

### Naming Conventions

- **Components**: PascalCase (`DataGrid.tsx`)
- **Hooks**: camelCase with `use` prefix (`useWorkspace.ts`)
- **Utils**: camelCase (`formulaCalculations.ts`)
- **Types**: PascalCase (`Formula.ts`)

### Testing

Unit tests should cover:

- Utility functions (calculations, validators)
- Custom hooks in isolation
- Component rendering and interactions
- Event bus communication
- State management logic

## Common Tasks

### Adding a New Feature

1. Create feature documentation in `docs/features/`
2. Define user stories and acceptance criteria
3. Design data models and types
4. Implement components and hooks
5. Add event bus events if needed
6. Update related components
7. Add tests
8. Update documentation

### Adding a New Component

1. Create component file in appropriate directory
2. Define TypeScript interfaces for props
3. Implement component logic
4. Add JSDoc comments
5. Export from index file if in subdirectory
6. Document in COMPONENTS.md (when created)

### Adding a New Hook

1. Create hook file in `src/hooks/` or feature directory
2. Define return type interface
3. Implement hook logic with memoization
4. Add JSDoc comments
5. Export and use in components

## Troubleshooting

### Common Issues

**Formula not updating after edit:**
- Check if editableFormula is set correctly
- Verify event bus listeners are registered
- Check console for validation errors

**Workspace data lost on switch:**
- Ensure updateWorkspaceData is called
- Check WorkspaceContext provider wraps app
- Verify activeWorkspace is being used

**Calculations incorrect:**
- Check formula column IDs match selectedFormulaIds
- Verify calculateTotals is called after updates
- Check for NaN values in data

**Performance issues:**
- Enable virtual scrolling for large lists
- Memoize expensive calculations
- Check for unnecessary re-renders

## Additional Resources

### External Documentation

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### Related Files

- `README.md` - Project readme
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind configuration

## Contributing

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Keep user stories actionable
- Update index when adding docs

### Code Standards

- Follow TypeScript strict mode
- Use functional components with hooks
- Implement proper error handling
- Add comments for complex logic
- Write self-documenting code

## License

[License information]

## Contact

[Contact information]

---

**Last Updated:** November 5, 2025  
**Version:** 0.0.0  
**Documentation Status:** In Progress
