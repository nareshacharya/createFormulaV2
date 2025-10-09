# Routing Guide

## Overview

The application uses React Router DOM v7 for client-side routing. The routing structure is simple with a focus on the main application view.

## Router Configuration

### Location
- `src/router/index.ts` - Router setup and initialization
- `src/router/config.tsx` - Route definitions

### Router Setup

**src/router/index.ts**
```typescript
import { createBrowserRouter } from 'react-router-dom';
import { routerConfig } from './config';

// Create router instance with configuration
export const router = createBrowserRouter(routerConfig);
```

**src/main.tsx** - Router Provider
```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

## Route Definitions

### Current Routes

```typescript
// src/router/config.tsx
import { RouteObject } from 'react-router-dom';
import App from '../App';
import HomePage from '../pages/home/page';
import NotFoundPage from '../pages/NotFound';

export const routerConfig: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
```

### Route Structure

```
/                           - Main application (App.tsx)
  └── / (index)            - Home page with AppShell
  
/*                          - 404 Not Found page
```

## Route Components

### App Component (Layout Route)

**Location**: `src/App.tsx`

**Purpose**: Root layout component that wraps all routes

**Structure**:
```typescript
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Outlet />  {/* Child routes render here */}
    </>
  );
}
```

### HomePage

**Location**: `src/pages/home/page.tsx`

**Purpose**: Main application page containing the entire formulation interface

**Structure**:
```typescript
import AppShell from '../../view/AppShell/AppShell';

export default function HomePage() {
  return <AppShell />;
}
```

**Contains**:
- AppShell (application layout)
  - AppHeader (top navigation)
  - LibraryPanel (left sidebar)
  - WorkArea (main content)

### NotFoundPage

**Location**: `src/pages/NotFound.tsx`

**Purpose**: 404 error page for invalid routes

**Structure**:
```typescript
export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-600">Page not found</p>
      <Link to="/" className="text-blue-600">Go to Home</Link>
    </div>
  );
}
```

## Navigation Patterns

### Current Navigation

The application uses a **Single Page Application (SPA)** pattern with:
- No traditional page-to-page navigation
- All functionality on the home page
- Modal-based workflows (Formula creation, Ingredient details)
- Panel-based navigation (Library tabs, Work area sections)

### Navigation Examples

```typescript
import { useNavigate, Link } from 'react-router-dom';

// Programmatic navigation
const navigate = useNavigate();
navigate('/');

// Link component
<Link to="/">Home</Link>

// Go back
navigate(-1);

// Replace history
navigate('/', { replace: true });
```

## Route Guards (Future Enhancement)

### Authentication Guard

```typescript
// src/router/guards/AuthGuard.tsx
import { Navigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const isAuthenticated = useAuth(); // Custom hook
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Usage in router config
{
  path: '/',
  element: (
    <AuthGuard>
      <App />
    </AuthGuard>
  ),
  children: [...]
}
```

### Role-Based Access

```typescript
// src/router/guards/RoleGuard.tsx
import { Navigate } from 'react-router-dom';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { userRole } = useAuth();
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

## Future Route Structure

### Planned Routes

```typescript
export const routerConfig: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'formulas',
        element: <FormulasPage />,
        children: [
          {
            index: true,
            element: <FormulaListView />,
          },
          {
            path: ':id',
            element: <FormulaDetailView />,
          },
          {
            path: 'create',
            element: <FormulaCreateView />,
          },
          {
            path: ':id/edit',
            element: <FormulaEditView />,
          },
        ],
      },
      {
        path: 'ingredients',
        element: <IngredientsPage />,
        children: [
          {
            index: true,
            element: <IngredientListView />,
          },
          {
            path: ':id',
            element: <IngredientDetailView />,
          },
        ],
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
```

### URL Structure

```
Future route structure:

/                                - Home page (dashboard)
/formulas                        - Formula list
/formulas/create                 - Create new formula
/formulas/:id                    - View formula details
/formulas/:id/edit               - Edit formula
/formulas/:id/compare            - Compare formulas
/ingredients                     - Ingredient library
/ingredients/:id                 - Ingredient details
/ingredients/:id/edit            - Edit ingredient
/reports                         - Reports and analytics
/reports/cost-analysis           - Cost analysis report
/reports/compliance              - Compliance report
/settings                        - Application settings
/settings/profile                - User profile
/settings/preferences            - User preferences
/login                           - Login page
/unauthorized                    - Access denied page
```

## Route Parameters

### URL Parameters

```typescript
// src/pages/formulas/[id]/page.tsx
import { useParams } from 'react-router-dom';

export default function FormulaDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  // Fetch formula by ID
  const formula = useFormula(id);
  
  return <FormulaDetail formula={formula} />;
}
```

### Query Parameters

```typescript
import { useSearchParams } from 'react-router-dom';

export default function FormulasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  
  // Filter formulas
  const formulas = useFormulas({ status, category });
  
  // Update query params
  const handleFilter = (newStatus: string) => {
    setSearchParams({ status: newStatus });
  };
  
  return <FormulaList formulas={formulas} />;
}
```

## Lazy Loading (Code Splitting)

### Route-Based Code Splitting

```typescript
import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load route components
const HomePage = lazy(() => import('../pages/home/page'));
const FormulasPage = lazy(() => import('../pages/formulas/page'));
const IngredientsPage = lazy(() => import('../pages/ingredients/page'));

export const routerConfig: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'formulas',
        element: (
          <Suspense fallback={<PageLoader />}>
            <FormulasPage />
          </Suspense>
        ),
      },
      {
        path: 'ingredients',
        element: (
          <Suspense fallback={<PageLoader />}>
            <IngredientsPage />
          </Suspense>
        ),
      },
    ],
  },
];
```

## Navigation Events

### Using Router Events

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function App() {
  const location = useLocation();
  
  useEffect(() => {
    // Track page views
    analytics.trackPageView(location.pathname);
    
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location]);
  
  return <Outlet />;
}
```

### Navigation Confirmation

```typescript
import { useBlocker } from 'react-router-dom';

export default function FormulaEditor() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Block navigation if there are unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges &&
      currentLocation.pathname !== nextLocation.pathname
  );
  
  return (
    <>
      <form onChange={() => setHasUnsavedChanges(true)}>
        {/* Form fields */}
      </form>
      
      {blocker.state === 'blocked' && (
        <Modal>
          <p>You have unsaved changes. Are you sure you want to leave?</p>
          <button onClick={() => blocker.proceed()}>Leave</button>
          <button onClick={() => blocker.reset()}>Stay</button>
        </Modal>
      )}
    </>
  );
}
```

## Error Handling

### Error Boundaries

```typescript
// src/router/config.tsx
import { RouteObject } from 'react-router-dom';
import ErrorPage from '../pages/ErrorPage';

export const routerConfig: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
        errorElement: <ErrorPage />,
      },
    ],
  },
];
```

### Error Page

```typescript
// src/pages/ErrorPage.tsx
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  
  let errorMessage: string;
  
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = 'Unknown error';
  }
  
  return (
    <div className="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p><i>{errorMessage}</i></p>
    </div>
  );
}
```

## Best Practices

### 1. Route Organization

```
pages/
├── home/
│   └── page.tsx
├── formulas/
│   ├── page.tsx              (list)
│   ├── [id]/
│   │   └── page.tsx          (detail)
│   └── create/
│       └── page.tsx          (create)
└── ingredients/
    ├── page.tsx
    └── [id]/
        └── page.tsx
```

### 2. Consistent Naming

- Use `page.tsx` for route components
- Use `[id]` for dynamic segments
- Use descriptive folder names

### 3. Route Definitions

```typescript
// Keep routes in separate config file
export const routes = {
  home: '/',
  formulas: '/formulas',
  formulaDetail: (id: string) => `/formulas/${id}`,
  formulaEdit: (id: string) => `/formulas/${id}/edit`,
  ingredients: '/ingredients',
  ingredientDetail: (id: string) => `/ingredients/${id}`,
};

// Usage
navigate(routes.formulaDetail(formula.id));
```

### 4. Type Safety

```typescript
// Define route params type
type FormulaParams = {
  id: string;
};

// Use in component
const { id } = useParams<FormulaParams>();
```

### 5. Loading States

```typescript
<Route
  path="/formulas"
  element={
    <Suspense fallback={<Spinner />}>
      <FormulasPage />
    </Suspense>
  }
/>
```

## Breadcrumbs

### Implementation

```typescript
// src/components/Breadcrumbs.tsx
import { Link, useLocation } from 'react-router-dom';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li>
          <Link to="/">Home</Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          return (
            <li key={name}>
              {isLast ? (
                <span>{name}</span>
              ) : (
                <Link to={routeTo}>{name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

## Summary

### Current State
- Simple SPA with single main route
- Modal-based workflows
- No authentication or authorization
- All functionality on home page

### Future Enhancements
- Multi-page structure with dedicated views
- Authentication and authorization
- Route guards and access control
- Breadcrumb navigation
- Deep linking support
- SEO optimization with meta tags
