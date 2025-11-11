# Configuration Files

This directory contains centralized configuration for the application.

## Files

### Formula Creation Configuration

#### `formulaTypes.config.ts`
Defines the 4 formula types (BASE, DILUTION, ANALYTICAL, PERFUMER) with labels, descriptions, and helper functions.

**Key Exports**:
- `FORMULA_TYPES` - Enum of formula type constants
- `FORMULA_TYPE_LABELS` - Display names for each type
- `FORMULA_TYPE_DESCRIPTIONS` - Detailed descriptions
- Helper functions: `getFormulaTypeLabel()`, `getFormulaTypeDescription()`, `getAllFormulaTypes()`, `isValidFormulaType()`

#### `formulaCreation.config.ts`
Main configuration for the formula creation wizard, including steps, field visibility, validation, and auto-generation patterns.

**Key Exports**:
- `FORM_STEPS` - 5-step wizard configuration
- `FIELD_VISIBILITY` - Field visibility matrix by formula type
- `VALIDATION_RULES` - Validation rules for all fields
- `AUTO_GENERATION` - Auto-ID generation patterns (#1168, #1255)
- `STATUS_WORKFLOW` - Status management configuration
- `REFERENCE_DATA_ENDPOINTS` - API endpoints for reference data
- Helper functions: `getVisibleFields()`, `getRequiredFields()`, `isFieldRequired()`, `isFieldHidden()`, `isFieldVisible()`

**Documentation**: See [../../docs/FORMULA_CREATION_ENHANCEMENT.md](../../docs/FORMULA_CREATION_ENHANCEMENT.md)

#### `fieldConfigs/` Directory
Step-by-step field configurations for the formula creation wizard.

**Files**:
- `typeSelection.fields.ts` - Step 1: Formula type selection
- `generalInfo.fields.ts` - Step 2: General information (category, region, country)
- `formulaDetails.fields.ts` - Step 3: Formula-specific details (conditional by type)
- `productInfo.fields.ts` - Step 4: Product information (format, brand, supplier)
- `projectReference.fields.ts` - Step 5: Project integration (US-1048)
- `index.ts` - Central export with helper functions

**Key Features**:
- Data-driven field definitions
- Conditional visibility by formula type
- API-backed dropdowns
- Computed fields (e.g., UFI Code)
- Dependency management

### `theme.ts`
Centralized theme configuration for consistent UI styling across all components.

**Purpose**: Provides consistent color schemes and styling for selection states (selected, active, default, disabled).

**Key Exports**:
- `selectionStyles` - Object defining styles for each selection state
- `getSelectionClasses(state)` - Returns combined class string for a state
- `getListItemClasses(options)` - Smart helper for state-based styling

**Documentation**: See [../docs/THEME_CONFIGURATION.md](../docs/THEME_CONFIGURATION.md)

**Usage Example**:
```typescript
import { getListItemClasses, selectionStyles } from "./config/theme";

const className = getListItemClasses({ 
  isSelected: true, 
  isHighlighted: false 
});

const iconColor = selectionStyles.selected.icon; // "text-blue-600"
```

**Benefits**:
- ✅ Single source of truth for colors
- ✅ Easy to update globally
- ✅ Type-safe with TypeScript
- ✅ Consistent user experience

## Adding New Configuration

When adding new configuration files:

1. Create file in this directory: `src/config/your-config.ts`
2. Export configuration objects and utility functions
3. Add documentation in `docs/YOUR_CONFIG_DOCUMENTATION.md`
4. Update this README with file description
5. Import in components: `import { ... } from "../config/your-config"`

## Configuration Best Practices

1. **Keep it pure**: No side effects, just data and pure functions
2. **Type safety**: Use TypeScript `as const` for immutable configs
3. **Documentation**: Document usage and examples
4. **Single responsibility**: One config file per concern
5. **Avoid magic numbers**: Use named constants
6. **Export helpers**: Provide utility functions for common operations

## Related Documentation

- [Theme Configuration Guide](../docs/THEME_CONFIGURATION.md)
- [Changes Log](../docs/CHANGES.md)
- [Project Summary](../docs/SUMMARY.md)
