# Tailwind to Inline Styles - Pega Compatibility Guide

## Overview

This document describes the solution for using Tailwind-like styling in Pega environments where external CSS files are restricted. Instead of using `className` with Tailwind classes, we convert them to inline `style` objects at runtime.

## The Problem

Pega restricts the use of external CSS files, but you want to:
- Maintain the developer experience of Tailwind CSS
- Keep your code clean and maintainable
- Apply consistent styling across your application

## The Solution

We've created a utility system that converts Tailwind class names to React inline style objects at runtime. This approach:
- ✅ Works within Pega's CSS restrictions
- ✅ Maintains familiar Tailwind syntax
- ✅ Generates styles programmatically (no CSS files needed)
- ✅ Provides type safety with TypeScript
- ✅ Offers multiple usage patterns for different scenarios

---

## Quick Start

### Method 1: Direct `tw()` Function (Simplest)

```tsx
import { tw } from '@/utils/tailwindToInline';

function MyComponent() {
  return (
    <div style={tw('flex items-center gap-4 p-4 bg-gray-100 rounded-lg')}>
      <span style={tw('text-lg font-semibold text-gray-900')}>Hello</span>
      <button style={tw('px-4 py-2 bg-blue-500 text-white rounded')}>
        Click Me
      </button>
    </div>
  );
}
```

### Method 2: Styled Components (Most Convenient)

```tsx
import { StyledDiv, StyledButton } from '@/components/Styled';

function MyComponent() {
  return (
    <StyledDiv tw="flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
      <span style={tw('text-lg font-semibold text-gray-900')}>Hello</span>
      <StyledButton tw="px-4 py-2 bg-blue-500 text-white rounded">
        Click Me
      </StyledButton>
    </StyledDiv>
  );
}
```

### Method 3: Hooks (Best Performance)

```tsx
import { useStaticStyles } from '@/hooks/useStyles';

function MyComponent() {
  const containerStyles = useStaticStyles('flex items-center gap-4 p-4 bg-gray-100');
  const buttonStyles = useStaticStyles('px-4 py-2 bg-blue-500 text-white rounded');
  
  return (
    <div style={containerStyles}>
      <button style={buttonStyles}>Click Me</button>
    </div>
  );
}
```

---

## Migration Guide

### Before (with className)

```tsx
function OldComponent() {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-900">Title</h2>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Action
      </button>
    </div>
  );
}
```

### After (with inline styles) - Option A: Direct tw()

```tsx
import { tw } from '@/utils/tailwindToInline';

function NewComponent() {
  return (
    <div style={tw('flex items-center justify-between p-4 bg-white rounded-lg shadow-md')}>
      <h2 style={tw('text-xl font-bold text-gray-900')}>Title</h2>
      <button style={tw('px-4 py-2 bg-blue-500 text-white rounded')}>
        Action
      </button>
    </div>
  );
}
```

### After (with inline styles) - Option B: Styled Components

```tsx
import { StyledDiv, StyledH2, StyledButton } from '@/components/Styled';

function NewComponent() {
  return (
    <StyledDiv tw="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
      <StyledH2 tw="text-xl font-bold text-gray-900">Title</StyledH2>
      <StyledButton tw="px-4 py-2 bg-blue-500 text-white rounded">
        Action
      </StyledButton>
    </StyledDiv>
  );
}
```

---

## Supported Tailwind Classes

### ✅ Fully Supported

- **Layout**: `flex`, `grid`, `block`, `inline-block`, `hidden`
- **Flexbox**: `flex-row`, `flex-col`, `items-center`, `justify-between`, `gap-4`
- **Spacing**: `p-4`, `px-6`, `py-2`, `m-4`, `mx-auto`, `mt-8`, etc.
- **Sizing**: `w-full`, `h-screen`, `max-w-lg`, `min-h-full`
- **Typography**: `text-lg`, `font-bold`, `text-center`, `uppercase`
- **Colors**: All color variants (gray-100, blue-500, red-600, etc.)
- **Borders**: `border`, `border-2`, `rounded-lg`, `border-gray-300`
- **Backgrounds**: `bg-white`, `bg-blue-500`, `bg-gradient-to-br`
- **Shadows**: `shadow-sm`, `shadow-md`, `shadow-lg`
- **Opacity**: `opacity-50`, `opacity-100`
- **Position**: `relative`, `absolute`, `fixed`, `sticky`
- **Z-Index**: `z-10`, `z-50`
- **Overflow**: `overflow-auto`, `overflow-hidden`
- **Cursor**: `cursor-pointer`, `cursor-not-allowed`
- **Transitions**: `transition`, `transition-all`

### ⚠️ Requires Special Handling

- **Hover/Focus states**: Use the `useInteractiveStyles` hook
- **Responsive breakpoints**: Use the `useResponsiveStyles` hook or manual media queries
- **Pseudo-classes**: Use hooks for state management
- **Dark mode**: Handle manually with conditional logic

### ❌ Not Supported (Inline Limitations)

- Media queries in inline styles (use hooks instead)
- Pseudo-selectors like `::before`, `::after`
- Complex animations (use CSS-in-JS or inline keyframes)

---

## Advanced Usage

### 1. Interactive Styles (Hover/Focus)

```tsx
import { useInteractiveStyles } from '@/hooks/useStyles';

function InteractiveButton() {
  const [styles, , handlers] = useInteractiveStyles(
    'px-6 py-3 bg-blue-500 text-white rounded-lg',  // base
    'bg-blue-600 shadow-lg',                         // hover
    'ring-4 ring-blue-300'                           // focus
  );
  
  return (
    <button style={styles} {...handlers}>
      Hover or Focus Me
    </button>
  );
}
```

### 2. Variant Styles

```tsx
import { useVariantStyles } from '@/hooks/useStyles';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

function VariantButton({ variant }: { variant: ButtonVariant }) {
  const styles = useVariantStyles(
    'px-4 py-2 rounded font-medium',  // base
    {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-500 text-white',
      danger: 'bg-red-500 text-white',
    },
    variant
  );
  
  return <button style={styles}>Click Me</button>;
}
```

### 3. Conditional Styles

```tsx
import { tw } from '@/utils/tailwindToInline';

function StatusBadge({ isActive, isError }: { isActive: boolean; isError: boolean }) {
  const styles = tw(
    'px-3 py-1 rounded-full text-sm font-medium',
    isError && 'bg-red-100 text-red-800',
    isActive && !isError && 'bg-green-100 text-green-800',
    !isActive && !isError && 'bg-gray-100 text-gray-800'
  );
  
  return <span style={styles}>Status</span>;
}
```

### 4. Combining Multiple Styles

```tsx
import { mergeStyles } from '@/utils/tailwindToInline';

function CustomComponent() {
  const baseStyles = tw('p-4 bg-white rounded');
  const customStyles = { boxShadow: '0 0 20px rgba(0,0,0,0.1)' };
  
  return <div style={mergeStyles(baseStyles, customStyles)}>Content</div>;
}
```

### 5. Form Components

```tsx
import { StyledDiv, StyledLabel, StyledInput, StyledButton } from '@/components/Styled';

function LoginForm() {
  return (
    <form>
      <StyledDiv tw="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md max-w-md">
        <StyledDiv tw="flex flex-col gap-2">
          <StyledLabel tw="text-sm font-medium text-gray-700">Email</StyledLabel>
          <StyledInput 
            tw="px-3 py-2 border border-gray-300 rounded-md"
            type="email"
            placeholder="Enter email"
          />
        </StyledDiv>
        
        <StyledButton tw="px-4 py-2 bg-blue-500 text-white rounded-md font-medium">
          Submit
        </StyledButton>
      </StyledDiv>
    </form>
  );
}
```

---

## Available Hooks

### `useStaticStyles(classes: string)`
For styles that don't change. Uses memoization for performance.

```tsx
const styles = useStaticStyles('flex items-center gap-4 p-4');
```

### `useDynamicStyles(base: string, conditional?: Record<string, boolean>)`
For styles that change based on state.

```tsx
const styles = useDynamicStyles('px-4 py-2', {
  'bg-blue-500': isActive,
  'bg-gray-300': !isActive
});
```

### `useInteractiveStyles(base, hover?, focus?)`
For hover and focus states.

```tsx
const [styles, state, handlers] = useInteractiveStyles(
  'px-4 py-2 bg-blue-500',
  'bg-blue-600',
  'ring-2 ring-blue-300'
);
```

### `useVariantStyles(base, variants, current)`
For multiple style variants.

```tsx
const styles = useVariantStyles(
  'px-4 py-2 rounded',
  { primary: 'bg-blue-500', secondary: 'bg-gray-500' },
  'primary'
);
```

### `useDisabledStyles(base, disabled, isDisabled)`
For disabled states.

```tsx
const styles = useDisabledStyles(
  'px-4 py-2 bg-blue-500',
  'opacity-50 cursor-not-allowed',
  isDisabled
);
```

### `useTransitionStyles(base, property?, duration?)`
For animations and transitions.

```tsx
const styles = useTransitionStyles('opacity-100', 'opacity', 300);
```

---

## Available Styled Components

All common HTML elements have styled versions:

```tsx
import {
  StyledDiv, StyledSpan, StyledButton, StyledInput,
  StyledLabel, StyledH1, StyledH2, StyledH3,
  StyledSection, StyledHeader, StyledFooter, StyledNav,
  StyledUl, StyledOl, StyledLi, StyledTable,
  StyledForm, StyledTextarea, StyledSelect, StyledA
} from '@/components/Styled';
```

---

## Performance Tips

1. **Use hooks for static styles** - They memoize the conversion
2. **Avoid creating new style objects in render** - Use `useMemo` or hooks
3. **Combine similar styled elements** - Reuse style objects
4. **Use Styled components** - Less verbose and cleaner

### ❌ Bad (creates new object every render)
```tsx
function Bad() {
  return <div style={tw('flex items-center')}>Content</div>;
}
```

### ✅ Good (memoized)
```tsx
function Good() {
  const styles = useStaticStyles('flex items-center');
  return <div style={styles}>Content</div>;
}
```

---

## Color Palette Reference

All Tailwind colors are supported. Examples:

```tsx
tw('text-gray-900')    // #111827
tw('bg-blue-500')      // #3b82f6
tw('border-red-600')   // #dc2626
tw('text-green-700')   // #15803d
tw('bg-purple-500')    // #a855f7
tw('border-yellow-400') // #facc15
```

Available scales: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

Available colors: gray, blue, red, green, yellow, purple, indigo, white, black

---

## Spacing Reference

Tailwind spacing scale (used for padding, margin, gap, width, height):

```tsx
0: 0px       1: 4px      2: 8px      3: 12px     4: 16px
5: 20px      6: 24px     8: 32px     10: 40px    12: 48px
16: 64px     20: 80px    24: 96px    32: 128px   40: 160px
48: 192px    56: 224px   64: 256px
```

---

## Common Patterns

### Card Component
```tsx
<StyledDiv tw="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
  <StyledDiv tw="text-xl font-bold text-gray-900">Title</StyledDiv>
  <StyledDiv tw="mt-2 text-gray-600">Description</StyledDiv>
</StyledDiv>
```

### Button Component
```tsx
<StyledButton tw="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium shadow-md">
  Click Me
</StyledButton>
```

### Input Field
```tsx
<StyledInput tw="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
```

### Flexbox Layout
```tsx
<StyledDiv tw="flex items-center justify-between gap-4">
  <StyledDiv>Left</StyledDiv>
  <StyledDiv>Right</StyledDiv>
</StyledDiv>
```

### Grid Layout
```tsx
<StyledDiv tw="grid grid-cols-3 gap-4">
  <StyledDiv>Item 1</StyledDiv>
  <StyledDiv>Item 2</StyledDiv>
  <StyledDiv>Item 3</StyledDiv>
</StyledDiv>
```

---

## Troubleshooting

### Issue: Styles not applying
- Verify you're using `style` prop, not `className`
- Check that the Tailwind class names are supported (see supported list above)
- Ensure you're importing from the correct path

### Issue: Hover/focus not working
- Use `useInteractiveStyles` hook for hover/focus states
- Inline styles don't support pseudo-classes directly

### Issue: Performance concerns
- Use hooks with memoization for static styles
- Avoid creating new style objects in render methods
- Consider extracting reusable style objects

### Issue: TypeScript errors
- Ensure you're using `CSSProperties` type from React
- Check that all imports are correct
- Verify TypeScript version compatibility

---

## Examples in Codebase

See comprehensive examples in:
- **File**: `src/components/StyleExamples.tsx`
- **Contains**: 10+ real-world examples demonstrating all patterns

---

## Summary

This approach allows you to:
1. ✅ Use Tailwind-like syntax in Pega environments
2. ✅ Avoid external CSS file restrictions
3. ✅ Maintain clean, readable code
4. ✅ Get TypeScript type safety
5. ✅ Handle hover/focus/interactive states
6. ✅ Support responsive designs
7. ✅ Achieve good performance with memoization

Choose the method that works best for your use case:
- **Quick & Simple**: `tw()` function
- **Clean JSX**: Styled components with `tw` prop
- **Best Performance**: Hooks with memoization
