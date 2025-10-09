# Component Documentation

## Overview

This document provides detailed documentation for all components in the application, including their purpose, props, usage examples, and implementation details.

## Component Categories

### 📊 Data Display Components
- DataGrid
- FormulaDataGrid
- AttributeDataGrid
- IngredientTable

### 📝 Form Components
- SearchBar
- QueryBuilder
- MultiSelectDropdown

### 🎯 Action Components
- Button
- Badge
- PillTabs

### 📦 Container Components
- Modal
- Drawer
- FormulaModal
- IngredientQuickView

### 📋 List Components
- FormulaList
- IngredientList
- ListRow

---

## Core Components

### DataGrid

**Purpose**: Advanced data table component with sorting, filtering, cell editing, column management, and multi-select capabilities.

**Location**: `src/components/DataGrid.tsx`

**Props**:
```typescript
interface DataGridProps {
  columns: Column[];              // Column definitions
  data: any[];                    // Row data
  selectedRows?: Set<string>;     // Selected row IDs
  editableFormula?: string;       // Active formula column ID
  onCellEdit?: (rowId, columnId, value) => void;
  onRowDelete?: (rowId) => void;
  onRowSelect?: (rowId) => void;
  onColumnDelete?: (columnId) => void;
  onColumnReorder?: (fromIndex, toIndex) => void;
  className?: string;
}

interface Column {
  id: string;
  key: string;
  header: string;
  type: 'text' | 'number' | 'currency' | 'percentage';
  group?: 'Formulas' | 'Cost' | 'Attributes';
  formulaId?: string;
  locked?: boolean;
  sortable?: boolean;
  editable?: boolean;
  width?: string;
}
```

**Features**:
- **Cell Editing**: Click on editable cells to modify values
- **Sorting**: Click column headers to sort data
- **Column Reordering**: Drag and drop columns (formula columns only)
- **Row Selection**: Click checkboxes to select rows
- **Column Operations**: Delete or configure columns via context menu
- **Active Formula**: Green highlight for the active formula column
- **Total Rows**: Special styling for Running Total, Target Total, RMC, Weighted Avg

**Usage Example**:
```typescript
<DataGrid
  columns={columns}
  data={tableData}
  editableFormula={editableFormula}
  onCellEdit={handleCellEdit}
  onRowDelete={handleRowDelete}
  onColumnDelete={handleDeleteColumn}
  onColumnReorder={handleColumnReorder}
/>
```

**Key Implementation Details**:
```typescript
// Cell editing with validation
const handleCellEdit = (rowId, columnId, value) => {
  const column = columns.find(c => c.id === columnId);
  if (column?.type === 'number') {
    value = parseFloat(value) || 0;
  }
  // Update row data
  setTableData(prev => prev.map(row => 
    row.id === rowId ? { ...row, [columnId]: value } : row
  ));
};

// Column reordering with drag and drop
const handleDragEnd = (result) => {
  if (!result.destination) return;
  const fromIndex = result.source.index;
  const toIndex = result.destination.index;
  onColumnReorder?.(fromIndex, toIndex);
};
```

---

### SearchBar

**Purpose**: Search input with filtering capabilities and action buttons.

**Location**: `src/components/SearchBar.tsx`

**Props**:
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilter?: () => void;
  placeholder?: string;
  showFilterButton?: boolean;
}
```

**Features**:
- Debounced search input
- Filter button integration
- Clear button when text present
- Icon indicators

**Usage Example**:
```typescript
<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  onFilter={() => setShowFilterDialog(true)}
  placeholder="Search ingredients..."
  showFilterButton={true}
/>
```

---

### QueryBuilder

**Purpose**: Visual query construction for advanced filtering with multiple criteria and logical operators.

**Location**: `src/components/QueryBuilder.tsx`

**Props**:
```typescript
interface QueryBuilderProps {
  fields: Field[];
  onQueryChange: (query: RuleGroupType) => void;
  initialQuery?: RuleGroupType;
}

interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect';
  values?: string[];
  operators?: Operator[];
}
```

**Features**:
- AND/OR combinators
- Multiple operators (=, !=, <, >, contains, startsWith, etc.)
- Nested groups
- Add/remove rules dynamically

**Usage Example**:
```typescript
const fields = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'price', label: 'Price', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', 
    values: ['active', 'inactive'] }
];

<QueryBuilder
  fields={fields}
  onQueryChange={(query) => setFilterQuery(query)}
  initialQuery={savedQuery}
/>
```

---

### Modal

**Purpose**: Base modal component for dialogs and overlays.

**Location**: `src/components/Modal.tsx`

**Props**:
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
```

**Features**:
- Backdrop click to close
- Escape key to close
- Customizable sizes
- Header, body, footer sections
- Smooth animations

**Usage Example**:
```typescript
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Create New Formula"
  size="lg"
  footer={
    <>
      <Button onClick={() => setShowModal(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Save</Button>
    </>
  }
>
  <FormContent />
</Modal>
```

---

### FormulaModal

**Purpose**: Specialized modal for creating and editing formulas with ingredient selection.

**Location**: `src/components/FormulaModal.tsx`

**Props**:
```typescript
interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formula: Formula) => void;
  existingFormula?: Formula;
  ingredients: Ingredient[];
}
```

**Features**:
- Formula metadata (name, version, status, category)
- Ingredient selection with percentages
- Real-time percentage total calculation
- Validation (total must equal 100%)
- Edit mode for existing formulas

**Usage Example**:
```typescript
<FormulaModal
  isOpen={showFormulaModal}
  onClose={() => setShowFormulaModal(false)}
  onSave={(formula) => {
    // Create or update formula
    PegaService.saveFormula(formula);
    setShowFormulaModal(false);
  }}
  ingredients={availableIngredients}
  existingFormula={selectedFormula}
/>
```

**Key Features**:
```typescript
// Percentage validation
const totalPercentage = ingredients.reduce(
  (sum, ing) => sum + (ing.percentage || 0), 0
);
const isValid = totalPercentage === 100;

// Save button disabled if invalid
<Button 
  disabled={!isValid || !formulaName}
  onClick={handleSave}
>
  Save Formula
</Button>
```

---

### IngredientQuickView

**Purpose**: Detailed ingredient information modal with multiple sections.

**Location**: `src/components/IngredientQuickView.tsx`

**Props**:
```typescript
interface IngredientQuickViewProps {
  ingredient: Ingredient | null;
  isOpen: boolean;
  onClose: () => void;
}
```

**Features**:
- Tabbed sections for different data categories
- Overview, Chemical Properties, Physical Properties
- Compliance, Suppliers, Documents, Chemical Structure
- Add to work area button

**Sections**:
1. **Overview** - Basic info, description, status
2. **Chemical Properties** - CAS, EINECS, FEMA, molecular formula
3. **Physical Properties** - Boiling point, density, flash point
4. **Compliance** - IFRA categories, MAC limits, allergens
5. **Suppliers** - Supplier info, pricing, availability
6. **Documents** - SDS, COA, specifications
7. **Chemical Structure** - Structural formula, SMILES

**Usage Example**:
```typescript
<IngredientQuickView
  ingredient={selectedIngredient}
  isOpen={showQuickView}
  onClose={() => setShowQuickView(false)}
/>
```

---

### Button

**Purpose**: Reusable button component with variants and sizes.

**Location**: `src/components/Button.tsx`

**Props**:
```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}
```

**Variants**:
- `primary` - Blue background, primary actions
- `secondary` - Gray background, secondary actions
- `danger` - Red background, destructive actions
- `ghost` - Transparent, subtle actions

**Usage Example**:
```typescript
<Button 
  variant="primary" 
  size="md"
  icon={<i className="ri-add-line" />}
  onClick={handleCreate}
>
  Create Formula
</Button>
```

---

### Badge

**Purpose**: Status and category indicators.

**Location**: `src/components/Badge.tsx`

**Props**:
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}
```

**Variants**:
- `default` - Gray badge
- `success` - Green badge (active, approved)
- `warning` - Yellow badge (pending, draft)
- `danger` - Red badge (inactive, rejected)
- `info` - Blue badge (informational)

**Usage Example**:
```typescript
<Badge variant="success" size="sm">Active</Badge>
<Badge variant="warning">Draft</Badge>
<Badge variant="danger">Archived</Badge>
```

---

## View Components

### AppShell

**Purpose**: Main application layout container with header and resizable panels.

**Location**: `src/view/AppShell/AppShell.tsx`

**Structure**:
```typescript
<AppShell>
  <AppHeader />              {/* Top navigation bar */}
  <div className="flex">
    <LibraryPanel />         {/* Left collapsible panel */}
    <WorkArea />             {/* Right main workspace */}
  </div>
</AppShell>
```

**Features**:
- Collapsible library panel
- Resizable panels (future enhancement)
- Fixed header
- Responsive layout

**Key Implementation**:
```typescript
const [isLibraryOpen, setIsLibraryOpen] = useState(true);

return (
  <div className="flex flex-col h-screen">
    <AppHeader />
    <div className="flex flex-1 overflow-hidden">
      {isLibraryOpen && <LibraryPanel />}
      <WorkArea />
      <button 
        className="absolute top-4 -right-4 z-[99]"
        onClick={() => setIsLibraryOpen(!isLibraryOpen)}
      >
        {isLibraryOpen ? <ChevronLeft /> : <ChevronRight />}
      </button>
    </div>
  </div>
);
```

---

### LibraryPanel

**Purpose**: Tabbed panel for browsing ingredients, formulas, and attributes.

**Location**: `src/view/Library/LibraryPanel.tsx`

**Features**:
- Three tabs: Ingredients, Formulas, Attributes
- Search and filtering
- Click to add to work area
- Status indicators
- Responsive lists

**Tabs**:
1. **Ingredients** - Browse and search ingredients
2. **Formulas** - View saved formulas
3. **Attributes** - Filter by attributes

**Usage**:
```typescript
<LibraryPanel>
  <PillTabs 
    tabs={['Ingredients', 'Formulas', 'Attributes']}
    activeTab={activeTab}
    onChange={setActiveTab}
  />
  {activeTab === 'Ingredients' && <IngredientList />}
  {activeTab === 'Formulas' && <FormulaList />}
  {activeTab === 'Attributes' && <AttributeList />}
</LibraryPanel>
```

---

### WorkArea

**Purpose**: Main workspace for formula management and data grid operations.

**Location**: `src/view/WorkArea/WorkArea.tsx`

**Features**:
- Formula comparison data grid
- Multiple formula columns
- Cost calculations
- Formula operations (normalize, merge duplicates, explode)
- Real-time total calculations
- Contribution cost tracking

**State Management**:
```typescript
const {
  columns,           // Grid columns
  tableData,         // Grid rows
  formulas,          // Available formulas
  ingredients,       // Available ingredients
  editableFormula,   // Active formula ID
  setTableData,
  setColumns,
  // ... other state
} = useWorkAreaState();
```

**Event Handlers**:
```typescript
const {
  handleCellEdit,      // Cell value changes
  handleRowDelete,     // Remove ingredient
  handleDeleteColumn,  // Remove formula column
  handleColumnReorder, // Reorder columns
} = useDataGridHandlers({ /* deps */ });

const {
  handleNormalize,        // Normalize to 100%
  handleMergeDuplicates,  // Merge duplicate ingredients
  handleExplodeFormula,   // Expand sub-formula
} = useFormulaOperations({ /* deps */ });
```

---

## Ingredient Detail Sections

### OverviewSection

**Purpose**: Display basic ingredient information.

**Location**: `src/components/IngredientSections/OverviewSection.tsx`

**Content**:
- Ingredient name and code
- Type (Natural, Synthetic, Base)
- Category and subcategory
- Status (Active, Inactive, etc.)
- Description and usage notes
- Odor profile and characteristics

---

### ChemicalPropertiesSection

**Purpose**: Display chemical identification and properties.

**Location**: `src/components/IngredientSections/ChemicalPropertiesSection.tsx`

**Content**:
- CAS Number
- EINECS Number
- FEMA Number
- Molecular Formula
- Molecular Weight
- Chemical Family

---

### PhysicalPropertiesSection

**Purpose**: Display physical characteristics.

**Location**: `src/components/IngredientSections/PhysicalPropertiesSection.tsx`

**Content**:
- Appearance and state
- Boiling point
- Melting point
- Density
- Flash point
- Refractive index
- Solubility

---

### ComplianceSection

**Purpose**: Display regulatory and safety information.

**Location**: `src/components/IngredientSections/ComplianceSection.tsx`

**Content**:
- IFRA Category restrictions
- MAC (Maximum Allowable Concentration)
- Allergen information
- EU regulations
- FDA status
- Safety warnings

---

### SuppliersSection

**Purpose**: Display supplier and pricing information.

**Location**: `src/components/IngredientSections/SuppliersSection.tsx`

**Content**:
- Supplier name and code
- Price per kilogram
- Minimum order quantity
- Lead time
- Availability status
- Contact information

---

## Component Best Practices

### 1. Props Interface
Always define TypeScript interfaces for props:
```typescript
interface MyComponentProps {
  title: string;
  count: number;
  onAction?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, count, onAction }) => {
  // Component implementation
};
```

### 2. Default Props
Use default parameters for optional props:
```typescript
const MyComponent: React.FC<MyComponentProps> = ({ 
  title = 'Default Title',
  size = 'md',
  variant = 'primary'
}) => {
  // Component implementation
};
```

### 3. Event Handlers
Name handlers descriptively and pass them via props:
```typescript
// Parent
const handleSave = (data) => { /* logic */ };
<MyComponent onSave={handleSave} />

// Child
const MyComponent = ({ onSave }) => {
  return <button onClick={() => onSave(data)}>Save</button>;
};
```

### 4. Conditional Rendering
Use clear conditional logic:
```typescript
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}
```

### 5. Component Composition
Break down complex components:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardActions>
      <Button>Action</Button>
    </CardActions>
  </CardHeader>
  <CardBody>
    <Content />
  </CardBody>
  <CardFooter>
    <Button>Close</Button>
  </CardFooter>
</Card>
```

### 6. Accessibility
Include proper ARIA labels and semantic HTML:
```typescript
<button 
  aria-label="Close modal"
  onClick={onClose}
>
  <i className="ri-close-line" />
</button>

<input
  id="search"
  type="text"
  aria-label="Search ingredients"
  placeholder="Search..."
/>
```

### 7. Performance
Use React.memo for expensive components:
```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data;
});
```

### 8. Error Boundaries
Wrap components that might error:
```typescript
<ErrorBoundary fallback={<ErrorMessage />}>
  <ComplexComponent />
</ErrorBoundary>
```
