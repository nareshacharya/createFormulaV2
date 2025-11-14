# Tailwind to Inline Styles - Quick Reference

## 🚀 Three Ways to Use

### 1. Direct Function (Quickest)
```tsx
import { tw } from '@/utils/tailwindToInline';

<div style={tw('flex items-center gap-4 p-4 bg-white rounded')}>
  Content
</div>
```

### 2. Styled Components (Cleanest)
```tsx
import { StyledDiv } from '@/components/Styled';

<StyledDiv tw="flex items-center gap-4 p-4 bg-white rounded">
  Content
</StyledDiv>
```

### 3. Hooks (Best Performance)
```tsx
import { useStaticStyles } from '@/hooks/useStyles';

const styles = useStaticStyles('flex items-center gap-4 p-4');
<div style={styles}>Content</div>
```

---

## 📋 Migration Cheatsheet

| Before (className) | After (inline style) |
|-------------------|---------------------|
| `className="flex gap-4"` | `style={tw('flex gap-4')}` |
| `className="p-4 bg-white"` | `style={tw('p-4 bg-white')}` |
| `<div className="...">` | `<StyledDiv tw="...">` |

---

## 🎨 Common Patterns

### Button
```tsx
<StyledButton tw="px-6 py-3 bg-blue-500 text-white rounded-lg">
  Click Me
</StyledButton>
```

### Card
```tsx
<StyledDiv tw="p-6 bg-white rounded-xl shadow-lg">
  <StyledDiv tw="text-xl font-bold">Title</StyledDiv>
  <StyledDiv tw="text-gray-600">Content</StyledDiv>
</StyledDiv>
```

### Form Input
```tsx
<StyledInput tw="px-3 py-2 border border-gray-300 rounded-md" />
```

### Flex Container
```tsx
<StyledDiv tw="flex items-center justify-between gap-4">
  <div>Left</div>
  <div>Right</div>
</StyledDiv>
```

---

## 🎭 Interactive States

### Hover
```tsx
import { useInteractiveStyles } from '@/hooks/useStyles';

const [styles, , handlers] = useInteractiveStyles(
  'px-4 py-2 bg-blue-500',  // base
  'bg-blue-600',             // hover
);

<button style={styles} {...handlers}>Hover Me</button>
```

### Conditional
```tsx
const styles = tw(
  'px-4 py-2 rounded',
  isActive && 'bg-green-500',
  !isActive && 'bg-gray-300'
);
```

### Variants
```tsx
const styles = useVariantStyles(
  'px-4 py-2 rounded',
  {
    primary: 'bg-blue-500',
    danger: 'bg-red-500',
  },
  variant
);
```

---

## 📦 Available Imports

```tsx
// Utility function
import { tw, mergeStyles, colors, spacing } from '@/utils/tailwindToInline';

// Hooks
import { 
  useStaticStyles, 
  useDynamicStyles,
  useInteractiveStyles,
  useVariantStyles,
  useDisabledStyles 
} from '@/hooks/useStyles';

// Components
import { 
  StyledDiv, 
  StyledButton, 
  StyledInput,
  StyledLabel,
  // ... all HTML elements
} from '@/components/Styled';
```

---

## ✅ Fully Supported Classes

- **Layout**: `flex`, `grid`, `block`, `hidden`
- **Flex**: `flex-row`, `flex-col`, `items-center`, `justify-between`, `gap-4`
- **Spacing**: `p-4`, `px-6`, `m-4`, `mx-auto`, `mt-2`
- **Size**: `w-full`, `h-screen`, `max-w-lg`
- **Text**: `text-lg`, `font-bold`, `text-center`, `text-white`
- **Colors**: `bg-blue-500`, `text-gray-900`, `border-red-300`
- **Borders**: `border`, `rounded-lg`, `border-2`
- **Shadows**: `shadow-md`, `shadow-lg`
- **Position**: `relative`, `absolute`, `fixed`
- **Opacity**: `opacity-50`
- **Cursor**: `cursor-pointer`

---

## 🎯 Key Differences

| Traditional Tailwind | Inline Styles Approach |
|---------------------|----------------------|
| `className="..."` | `style={tw('...')}` or `tw="..."` |
| `hover:bg-blue-600` | Use `useInteractiveStyles` hook |
| `md:flex` | Use `useResponsiveStyles` hook |
| External CSS file | No CSS file needed ✅ |

---

## 💡 Tips

1. **Performance**: Use hooks for static styles (memoized)
2. **Cleaner JSX**: Use Styled components for less verbose code
3. **Type Safety**: All functions are fully typed
4. **Combining Styles**: Use `mergeStyles()` to combine multiple style objects
5. **Direct Access**: Import `colors`, `spacing` for custom values

---

## 📖 Full Documentation

See `TAILWIND_TO_INLINE_STYLES.md` for complete guide with:
- Detailed migration guide
- All available hooks
- Advanced patterns
- Performance optimization
- Troubleshooting

## 🔍 Examples

See `src/components/StyleExamples.tsx` for 10+ working examples
