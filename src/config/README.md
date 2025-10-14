# Configuration Files

This directory contains centralized configuration for the application.

## Files

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
