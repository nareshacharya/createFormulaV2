# Developer Guide

## Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (comes with Node.js)
- **Git**: For version control
- **VS Code**: Recommended IDE

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd createFormulaV2
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3000`

4. **Verify Installation**
   - Open browser to `http://localhost:3000`
   - You should see the application with sample data
   - Try clicking ingredients in the library panel

### Development Commands

```bash
# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint

# Type check
npx tsc --noEmit
```

## Project Configuration

### Vite Configuration

**File**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### TypeScript Configuration

**File**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallingCasesInSwitch": true
  },
  "include": ["src"],
  "references": [
    { "path": "./tsconfig.node.json" }
  ]
}
```

### Tailwind Configuration

**File**: `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          25: '#FCFCFD',
          50: '#F9FAFB',
          // ... other shades
        },
      },
      fontFamily: {
        sans: ['Lato', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

## Development Workflow

### 1. Creating a New Component

**Step-by-Step**:

1. **Create Component File**
   ```bash
   touch src/components/MyComponent.tsx
   ```

2. **Define Component Structure**
   ```typescript
   import React from 'react';
   
   interface MyComponentProps {
     title: string;
     onAction?: () => void;
   }
   
   const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
     return (
       <div className="p-4">
         <h2 className="text-xl font-semibold">{title}</h2>
         {onAction && (
           <button onClick={onAction} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
             Action
           </button>
         )}
       </div>
     );
   };
   
   export default MyComponent;
   ```

3. **Use Component**
   ```typescript
   import MyComponent from './components/MyComponent';
   
   function App() {
     return (
       <MyComponent 
         title="Hello" 
         onAction={() => console.log('Clicked')} 
       />
     );
   }
   ```

### 2. Adding a New Feature

**Example**: Adding a Formula Export Feature

1. **Create Service Method**
   ```typescript
   // src/services/pega.ts
   export const PegaService = {
     // ... existing methods
     
     exportFormula: async (formulaId: string): Promise<Blob> => {
       // Implementation
       const formula = await PegaService.getFormulaById(formulaId);
       const json = JSON.stringify(formula, null, 2);
       return new Blob([json], { type: 'application/json' });
     },
   };
   ```

2. **Create UI Component**
   ```typescript
   // src/components/ExportButton.tsx
   const ExportButton: React.FC<{ formulaId: string }> = ({ formulaId }) => {
     const handleExport = async () => {
       try {
         const blob = await PegaService.exportFormula(formulaId);
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `formula-${formulaId}.json`;
         a.click();
         URL.revokeObjectURL(url);
         toast.success('Formula exported successfully');
       } catch (error) {
         toast.error('Export failed');
       }
     };
     
     return (
       <button onClick={handleExport} className="btn-primary">
         Export Formula
       </button>
     );
   };
   ```

3. **Integrate into UI**
   ```typescript
   // src/view/WorkArea/WorkArea.tsx
   <ExportButton formulaId={activeFormula?.id} />
   ```

### 3. Modifying Existing Logic

**Example**: Changing Cost Calculation Formula

1. **Locate Calculation Logic**
   ```bash
   # Search for cost calculations
   grep -r "contCost" src/
   ```

2. **Update Utility Function**
   ```typescript
   // src/utils/formulaCalculations.ts
   export const calculateContributionCost = (
     percentage: number,
     costPerKg: number
   ): number => {
     // Old: (percentage × costPerKg) / 1000
     // New: (percentage × costPerKg) / 100 (new formula)
     return parseFloat(((percentage * costPerKg) / 100).toFixed(4));
   };
   ```

3. **Update All Usages**
   ```typescript
   // src/view/WorkArea/hooks/useDataGridHandlers.ts
   const contCost = calculateContributionCost(percentage, costPerKg);
   
   // src/view/WorkArea/hooks/useFormulaOperations.ts
   mergedRow.contCost = calculateContributionCost(percentage, costPerKg);
   ```

4. **Test Changes**
   - Add ingredient to work area
   - Enter percentage
   - Verify cost calculation
   - Test merge duplicates
   - Test formula normalization

## Code Style Guidelines

### TypeScript

1. **Always Use Interfaces for Props**
   ```typescript
   // ✅ GOOD
   interface ButtonProps {
     label: string;
     onClick: () => void;
   }
   
   // ❌ BAD
   const Button = (props: any) => { ... }
   ```

2. **Explicit Return Types for Functions**
   ```typescript
   // ✅ GOOD
   const calculateTotal = (items: Item[]): number => {
     return items.reduce((sum, item) => sum + item.price, 0);
   };
   
   // ❌ BAD
   const calculateTotal = (items) => {
     return items.reduce((sum, item) => sum + item.price, 0);
   };
   ```

3. **Use Type Guards**
   ```typescript
   // ✅ GOOD
   if (typeof value === 'string') {
     console.log(value.toUpperCase());
   }
   
   // ❌ BAD
   console.log((value as string).toUpperCase());
   ```

### React

1. **Functional Components**
   ```typescript
   // ✅ GOOD
   const MyComponent: React.FC<Props> = ({ title }) => {
     return <div>{title}</div>;
   };
   
   // ❌ BAD (class components deprecated in this project)
   class MyComponent extends React.Component { ... }
   ```

2. **Hooks Rules**
   ```typescript
   // ✅ GOOD - At top level
   const [count, setCount] = useState(0);
   useEffect(() => { ... }, []);
   
   // ❌ BAD - Inside conditions
   if (condition) {
     const [count, setCount] = useState(0); // WRONG!
   }
   ```

3. **Event Handlers**
   ```typescript
   // ✅ GOOD
   const handleClick = () => {
     // Logic
   };
   
   <button onClick={handleClick}>Click</button>
   
   // ❌ BAD
   <button onClick={() => {
     // Inline logic
   }}>Click</button>
   ```

### CSS/Tailwind

1. **Use Tailwind Utilities**
   ```typescript
   // ✅ GOOD
   <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
   
   // ❌ BAD - Custom CSS for common patterns
   <div className="custom-container">
   ```

2. **Responsive Classes**
   ```typescript
   // ✅ GOOD
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
   
   // ❌ BAD - Fixed layouts
   <div className="grid grid-cols-3">
   ```

3. **Semantic Class Names**
   ```typescript
   // ✅ GOOD
   <button className="btn-primary">Save</button>
   <div className="card-header">Title</div>
   
   // ❌ BAD
   <button className="blue-btn">Save</button>
   <div className="div-1">Title</div>
   ```

## Debugging

### React DevTools

1. **Install Extension**
   - [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools)
   - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

2. **Inspect Components**
   - View component props
   - Check state values
   - Track re-renders
   - Profiler for performance

### Console Logging

```typescript
// Debug event bus
eventBus.on('ingredient-selected', (data) => {
  console.log('Event received:', data);
});

// Debug state updates
setTableData(prev => {
  console.log('Previous state:', prev);
  const newState = /* calculations */;
  console.log('New state:', newState);
  return newState;
});

// Debug calculations
const result = calculateTotals(data, columns);
console.log('Calculated totals:', result);
```

### Breakpoints

In VS Code:
1. Click left margin to set breakpoint
2. Press F5 to start debugging
3. Use Debug Console to inspect values

### Common Issues

**Issue**: Component not re-rendering

**Solution**:
```typescript
// ❌ BAD - Mutating state
array.push(newItem);
setArray(array);

// ✅ GOOD - Create new array
setArray([...array, newItem]);
```

**Issue**: Stale closure in useEffect

**Solution**:
```typescript
// ❌ BAD - Missing dependencies
useEffect(() => {
  console.log(count); // May use old value
}, []);

// ✅ GOOD - Include dependencies
useEffect(() => {
  console.log(count);
}, [count]);
```

**Issue**: Infinite re-render loop

**Solution**:
```typescript
// ❌ BAD - Creates new function every render
<Component onClick={() => setCount(count + 1)} />

// ✅ GOOD - Stable reference
const handleClick = useCallback(() => {
  setCount(c => c + 1);
}, []);
<Component onClick={handleClick} />
```

## Testing

### Unit Tests (Future)

```typescript
// src/utils/__tests__/formulaCalculations.test.ts
import { calculateTotals } from '../formulaCalculations';

describe('calculateTotals', () => {
  it('should sum ingredient percentages', () => {
    const data = [
      { id: '1', FORM001: 50, isTotal: false },
      { id: '2', FORM001: 30, isTotal: false },
      { id: 'total', FORM001: 0, isTotal: true, totalType: 'running' },
    ];
    
    const result = calculateTotals(data, columns);
    const runningTotal = result.find(r => r.totalType === 'running');
    
    expect(runningTotal?.FORM001).toBe(80);
  });
});
```

### Component Tests (Future)

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Git Workflow

### Branch Strategy

```
main            - Production-ready code
├── 9oct        - Development branch
├── feature/... - Feature branches
└── fix/...     - Bug fix branches
```

### Commit Messages

Follow conventional commits:

```bash
# Feature
git commit -m "feat: add formula export functionality"

# Bug fix
git commit -m "fix: resolve merge duplicates total rows issue"

# Documentation
git commit -m "docs: update README with architecture guide"

# Refactoring
git commit -m "refactor: extract calculation logic to utility"

# Style
git commit -m "style: format code with prettier"
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes and Commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push to Remote**
   ```bash
   git push origin feature/my-feature
   ```

4. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Select base: `9oct`, compare: `feature/my-feature`
   - Fill in description
   - Request review

5. **Merge After Approval**
   ```bash
   git checkout 9oct
   git merge feature/my-feature
   git push origin 9oct
   ```

## Deployment

### Build for Production

```bash
# Create production build
npm run build

# Preview build locally
npm run preview
```

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Production Deployment**
   ```bash
   vercel --prod
   ```

### Environment Variables

Create `.env` file (not committed):

```env
VITE_API_BASE_URL=https://api.example.com
VITE_ENVIRONMENT=production
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Memoization

```typescript
// Expensive calculations
const expensiveValue = useMemo(
  () => computeExpensiveValue(data),
  [data]
);

// Callbacks
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

// Components
const MemoizedComponent = React.memo(MyComponent);
```

### Bundle Analysis

```bash
# Install analyzer
npm install --save-dev rollup-plugin-visualizer

# Update vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ],
});

# Build and analyze
npm run build
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- --port 3001
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Type check without emitting
npx tsc --noEmit

# Clear TypeScript cache
rm -rf node_modules/.cache
```

### Hot Reload Not Working

```bash
# Restart dev server
# Press Ctrl+C
npm run dev
```

## Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [ES7+ React Snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)

### VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- GitLens

## Getting Help

1. **Check Documentation**: Review architecture and component docs
2. **Search Issues**: Look for similar problems in the repository
3. **Console Logs**: Add debug logs to trace execution
4. **React DevTools**: Inspect component state and props
5. **Ask Team**: Reach out to senior developers
