# Theme Configuration Guide

## Overview

This document explains the centralized theme configuration system implemented for consistent UI styling across the application.

## Location

`src/config/theme.ts`

## Purpose

The theme configuration provides:
- **Consistent color schemes** for selection states across all components
- **Centralized styling** that can be updated in one place
- **Reusable utility functions** for common styling patterns
- **Type safety** for theme-related styling

## Selection Styles

### Available States

#### 1. **Selected/Highlighted** (`selected`)
Used for items that are already added/selected in the system.

```typescript
{
  background: "bg-blue-50",
  border: "border-blue-300",
  text: "text-blue-900",
  icon: "text-blue-600",
  shadow: "shadow-sm",
}
```

**Visual**: Light blue background with blue border and checkmark icon

**Used in**:
- Library panel (Formulas, Ingredients, Attributes tabs)
- Formula selection modal (already-added formulas)
- Attribute selection dialog (already-added attributes)

#### 2. **Active** (`active`)
Used for items currently being selected in the current session.

```typescript
{
  background: "bg-blue-100",
  border: "border-blue-400",
  text: "text-blue-900",
  icon: "text-blue-700",
  shadow: "shadow-md",
}
```

**Visual**: Darker blue background indicating active selection

#### 3. **Default** (`default`)
Used for unselected, available items.

```typescript
{
  background: "bg-white",
  border: "border-gray-200",
  text: "text-gray-700",
  icon: "text-gray-400",
  hover: "hover:bg-gray-50 hover:border-gray-300",
}
```

**Visual**: White background with subtle hover effects

#### 4. **Disabled** (`disabled`)
Used for items that cannot be selected (max selection reached, etc.).

```typescript
{
  background: "bg-gray-50",
  border: "border-gray-200",
  text: "text-gray-400",
  icon: "text-gray-300",
  opacity: "opacity-50",
  cursor: "cursor-not-allowed",
}
```

**Visual**: Grayed out with reduced opacity

## Utility Functions

### `getSelectionClasses(state)`

Returns combined class names for a given selection state.

```typescript
import { getSelectionClasses } from "../config/theme";

const classes = getSelectionClasses("selected");
// Returns: "bg-blue-50 border-blue-300 text-blue-900 text-blue-600 shadow-sm"
```

### `getListItemClasses(options)`

Returns appropriate class names based on item state flags.

```typescript
import { getListItemClasses } from "../config/theme";

const classes = getListItemClasses({
  isSelected: true,
  isHighlighted: false,
  isDisabled: false,
  isActive: false,
});
```

**Priority order**: `disabled > highlighted/selected > active > default`

## Usage Examples

### Example 1: Formula Selection

```tsx
import { getListItemClasses, selectionStyles } from "../config/theme";

const FormulaRow = ({ formula, isSelected, isHighlighted }) => {
  const classes = getListItemClasses({ isSelected, isHighlighted });
  
  return (
    <div className={classes}>
      {formula.name}
      {isHighlighted && (
        <i className={`ri-check-line ${selectionStyles.selected.icon}`} />
      )}
    </div>
  );
};
```

### Example 2: Attribute Selector

```tsx
import { getListItemClasses, selectionStyles } from "../config/theme";

const AttributeCard = ({ attribute, isHighlighted }) => {
  const classes = getListItemClasses({ isHighlighted });
  
  return (
    <label className={`p-3 rounded-md border ${classes}`}>
      <input type="checkbox" checked={isHighlighted} />
      <span>{attribute.name}</span>
      {isHighlighted && (
        <i className={`ri-check-line ${selectionStyles.selected.icon}`} />
      )}
    </label>
  );
};
```

## Customization

### Changing Colors

To change the selection colors application-wide, edit `src/config/theme.ts`:

```typescript
export const selectionStyles = {
  selected: {
    background: "bg-green-50",  // Change to green
    border: "border-green-300",
    text: "text-green-900",
    icon: "text-green-600",
    shadow: "shadow-sm",
  },
  // ... other states
} as const;
```

### Adding New States

```typescript
export const selectionStyles = {
  // ... existing states
  warning: {
    background: "bg-yellow-50",
    border: "border-yellow-300",
    text: "text-yellow-900",
    icon: "text-yellow-600",
    shadow: "shadow-sm",
  },
} as const;
```

## Components Using Theme

### Current Implementation

1. **AttributeSelector** (`src/components/AttributeSelector.tsx`)
   - Uses `getListItemClasses` for consistent styling
   - Blue highlight for already-added attributes

2. **FormulaDataGrid** (`src/components/FormulaDataGrid.tsx`)
   - Uses `getListItemClasses` for row styling
   - Blue highlight for already-selected formulas

3. **LibraryPanel** (via theme)
   - Uses blue highlight for selected items
   - Consistent with other components

### Migration Checklist

When adding theme support to a new component:

- [ ] Import theme utilities: `import { getListItemClasses, selectionStyles } from "../config/theme"`
- [ ] Replace hard-coded colors with theme classes
- [ ] Use `getListItemClasses` for state-based styling
- [ ] Use `selectionStyles.selected.icon` for checkmark icons
- [ ] Test all selection states (selected, active, disabled, default)

## Benefits

### Before Theme Configuration
- ❌ Inconsistent colors (yellow, green, blue across different components)
- ❌ Hard-coded styling scattered across components
- ❌ Difficult to maintain and update
- ❌ No single source of truth

### After Theme Configuration
- ✅ Consistent blue selection color across all components
- ✅ Centralized styling in one file
- ✅ Easy to update colors globally
- ✅ Type-safe with TypeScript
- ✅ Reusable utility functions
- ✅ Better maintainability

## Testing

To verify theme consistency:

1. **Formula Selection Modal**
   - Add a formula from modal
   - Reopen modal → formula should show blue highlight with checkmark

2. **Attribute Dialog**
   - Add an attribute from dialog
   - Reopen dialog → attribute should show blue highlight with checkmark

3. **Library Panel**
   - Select items from Ingredients/Formulas/Attributes tabs
   - Selected items should show blue highlight with checkmark

All three should use the **same blue color scheme**.

## Future Enhancements

Potential additions to the theme system:

1. **Dark Mode Support**
   ```typescript
   export const darkSelectionStyles = { /* ... */ };
   ```

2. **Custom Brand Colors**
   ```typescript
   export const brandColors = {
     primary: "#yourColor",
     secondary: "#yourColor",
     // ...
   };
   ```

3. **Component-Specific Overrides**
   ```typescript
   export const componentThemes = {
     formula: { /* custom overrides */ },
     attribute: { /* custom overrides */ },
   };
   ```

## Related Documentation

- [Component Refactoring Guide](./COMPONENT_REFACTORING.md)
- [Styling Guidelines](./STYLING_GUIDELINES.md)
- [Changes Log](./CHANGES.md)
