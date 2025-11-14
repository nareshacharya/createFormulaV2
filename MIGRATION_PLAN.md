# Application-Wide Tailwind to Inline Styles Migration

## Migration Status

### ✅ Completed Components
- [x] Modal.tsx
- [x] StyleExamples.tsx (demo component)

### 🔄 In Progress
- [ ] Button.tsx
- [ ] Dialog.tsx
- [ ] Badge.tsx
- [ ] Alert.tsx

### 📋 Pending Migration (High Priority)
- [ ] BulkActionsToolbar.tsx
- [ ] FormulaDataGrid.tsx
- [ ] DataGrid.tsx
- [ ] PillTabs.tsx
- [ ] IngredientAttributeList.tsx
- [ ] QueryBuilder.tsx
- [ ] FormulaModal.tsx
- [ ] FormulaDet

ailsModal.tsx
- [ ] ExcelUploadModal.tsx
- [ ] FormulaList.tsx
- [ ] IngredientList.tsx

---

## Automated Migration Script

### Step 1: Install dependencies (if needed)
```bash
# No additional dependencies needed - using existing React
```

### Step 2: Use the conversion utility

For each component file, follow this pattern:

**Before:**
```tsx
function MyComponent() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
      <h1 className="text-xl font-bold text-gray-900">Title</h1>
      <button className="px-4 py-2 bg-blue-500 text-white rounded">
        Click
      </button>
    </div>
  );
}
```

**After (Method 1 - Direct tw()):**
```tsx
import { tw } from '../utils/tailwindToInline';

function MyComponent() {
  return (
    <div style={tw('flex items-center gap-4 p-4 bg-white rounded-lg')}>
      <h1 style={tw('text-xl font-bold text-gray-900')}>Title</h1>
      <button style={tw('px-4 py-2 bg-blue-500 text-white rounded')}>
        Click
      </button>
    </div>
  );
}
```

**After (Method 2 - Styled Components):**
```tsx
import { StyledDiv, StyledH1, StyledButton } from '../components/Styled';

function MyComponent() {
  return (
    <StyledDiv tw="flex items-center gap-4 p-4 bg-white rounded-lg">
      <StyledH1 tw="text-xl font-bold text-gray-900">Title</StyledH1>
      <StyledButton tw="px-4 py-2 bg-blue-500 text-white rounded">
        Click
      </StyledButton>
    </StyledDiv>
  );
}
```

---

## Migration Steps for Each Component

### 1. Add Import
```tsx
import { tw } from '../utils/tailwindToInline';
// OR
import { StyledDiv, StyledButton, ... } from '../components/Styled';
```

### 2. Replace className with style
Find: `className="..."`
Replace: `style={tw('...')}`

### 3. Handle Dynamic Classes
**Before:**
```tsx
className={`base-class ${condition ? 'active-class' : 'inactive-class'}`}
```

**After:**
```tsx
style={tw(`base-class ${condition ? 'active-class' : 'inactive-class'}`)}
```

### 4. Update Component Props
**Before:**
```tsx
interface Props {
  className?: string;
}
```

**After:**
```tsx
import type { CSSProperties } from 'react';

interface Props {
  style?: CSSProperties;
}
```

### 5. Handle Pseudo-Classes (hover, focus, active)
**Before:**
```tsx
className="bg-blue-500 hover:bg-blue-600 focus:ring-2"
```

**After:**
```tsx
import { useInteractiveStyles } from '../hooks/useStyles';

const [styles, , handlers] = useInteractiveStyles(
  'bg-blue-500',      // base
  'bg-blue-600',      // hover
  'ring-2'            // focus
);

<button style={styles} {...handlers}>Click</button>
```

---

## Regex Patterns for Find & Replace

### Basic className to style conversion:
**Find:** `className="([^"]*)"`
**Replace:** `style={tw('$1')}`

### className with template literals:
**Find:** `className={\`([^`]*)\`}`
**Replace:** `style={tw(\`$1\`)}`

### className with variables:
**Find:** `className={([^}]*)}`
**Replace:** `style={tw($1)}`

### Remove tw- prefix (if present):
**Find:** `tw-`
**Replace:** (empty string)

---

## Component-Specific Migration Notes

### Button Component
- Replace `className` prop with `style`
- Use `useVariantStyles` hook for variants
- Memoize computed styles with `useMemo`

### Modal/Dialog Components
- Convert all className to style={tw(...)}
- Keep material-symbols-rounded class for icons
- Update z-index values if needed

### DataGrid Components
- Large component - migrate section by section
- Test sorting and filtering after migration
- Keep table semantics intact

### Form Components
- Input, Select, Textarea need focus styles
- Use `useFocusStyles` hook
- Maintain accessibility attributes

---

## Testing Checklist

After migrating each component:

- [ ] Visual appearance matches original
- [ ] Hover states work correctly
- [ ] Focus states work correctly
- [ ] Responsive behavior maintained
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Component still renders in all views

---

## Common Issues & Solutions

### Issue: "tw is not defined"
**Solution:** Add import: `import { tw } from '../utils/tailwindToInline';`

### Issue: Hover/focus not working
**Solution:** Use `useInteractiveStyles` hook instead of hover:/focus: classes

### Issue: Styles not applying
**Solution:** Check that class names are supported (see TAILWIND_TO_INLINE_STYLES.md)

### Issue: Performance degradation
**Solution:** Use `useMemo` or `useStaticStyles` to memoize style objects

### Issue: TypeScript errors with style prop
**Solution:** Import `CSSProperties` type from 'react'

---

## Migration Priority Order

1. **Core UI Components** (Button, Modal, Dialog, Badge, Alert)
2. **Layout Components** (Container, Grid, Flex wrappers)
3. **Form Components** (Input, Select, Textarea, Label)
4. **Data Components** (DataGrid, Table, List)
5. **Feature Components** (FormulaModal, IngredientList, etc.)
6. **Page Components** (Main pages and views)

---

## Performance Optimization

### Use Memoization
```tsx
const containerStyles = useMemo(() => tw('flex items-center gap-4'), []);
```

### Extract Reusable Styles
```tsx
// styles.ts
export const buttonBaseStyles = tw('px-4 py-2 rounded font-medium');
export const containerStyles = tw('flex flex-col gap-4 p-6');
```

### Use Static Styles Hook
```tsx
const styles = useStaticStyles('flex items-center gap-4');
```

---

## Roll-Out Strategy

### Phase 1: Core Components (Week 1)
- Button, Modal, Dialog, Badge, Alert
- Verify no regressions

### Phase 2: Data Components (Week 2)
- DataGrid, FormulaDataGrid, AttributeDataGrid
- Test thoroughly with real data

### Phase 3: Feature Components (Week 3)
- All modal/dialog variants
- List components
- Form components

### Phase 4: Page Components (Week 4)
- Main application pages
- Finalize and test complete app

### Phase 5: Cleanup (Week 5)
- Remove Tailwind CSS dependencies
- Remove unused CSS files
- Update documentation
- Final testing

---

## Verification Commands

```bash
# Check for remaining className usage
grep -r "className=" src/components --include="*.tsx"

# Count remaining migrations needed
grep -r "className=" src/components --include="*.tsx" | wc -l

# Verify tw imports
grep -r "import.*tw.*from.*tailwindToInline" src/components

# Build to check for errors
npm run build

# Run dev server
npm run dev
```

---

## Success Criteria

- ✅ Zero `className` attributes with Tailwind classes in components
- ✅ All components render correctly
- ✅ No visual regressions
- ✅ Application builds without errors
- ✅ All interactive states work (hover, focus, active)
- ✅ Performance is acceptable
- ✅ Code is maintainable and documented

---

## Resources

- Full Guide: `TAILWIND_TO_INLINE_STYLES.md`
- Quick Reference: `TAILWIND_INLINE_QUICK_REF.md`
- Example Components: `src/components/StyleExamples.tsx`
- Utility Functions: `src/utils/tailwindToInline.ts`
- Hooks: `src/hooks/useStyles.ts`
- Styled Components: `src/components/Styled.tsx`
