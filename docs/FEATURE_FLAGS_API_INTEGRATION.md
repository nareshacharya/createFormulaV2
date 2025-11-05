# Feature Flags & API Integration Guide

**Version:** 1.0  
**Last Updated:** November 5, 2025  
**Target Audience:** Developers integrating CreateFormulaV2 with Pega Constellation

---

## Table of Contents

1. [Overview](#overview)
2. [Feature Flags System](#feature-flags-system)
3. [API Integration](#api-integration)
4. [DX API Implementation](#dx-api-implementation)
5. [Component Updates](#component-updates)
6. [Testing & Validation](#testing--validation)
7. [Deployment Guide](#deployment-guide)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Purpose

This application is designed to be embedded as a component in the Pega Constellation application. It includes a comprehensive feature flag system to:

- **Control feature visibility** during phased rollouts
- **Switch between mock data and DX API** seamlessly
- **Hide work-in-progress features** from clients
- **Enable developer-only features** without UI controls

### Key Principles

1. **No UI controls for feature flags** - All configuration is code-based
2. **Environment-specific overrides** - Different settings for dev/staging/production
3. **Graceful degradation** - Features can be disabled without breaking the app
4. **API abstraction** - Single interface for mock and live data

---

## Feature Flags System

### Configuration File

**Location:** `src/config/featureFlags.ts`

This is the **master configuration file** that controls all features in the application.

```typescript
export const featureFlags: FeatureFlags = {
  api: { ... },          // API configuration
  dataGrid: { ... },     // Data grid features
  header: { ... },       // Header stats visibility
  formula: { ... },      // Formula operations
  ingredient: { ... },   // Ingredient features
  dilution: { ... },     // Dilution functionality
  workspace: { ... },    // Workspace management
  undoRedo: { ... },     // Undo/redo settings
  developer: { ... },    // Developer tools
};
```

### Feature Categories

#### 1. API Configuration

Controls API mode and integration settings:

```typescript
api: {
  useDxApi: false,  // Set to true for Pega integration
  dxApiConfig: {
    baseUrl: 'https://your-pega-instance.com/prweb/api/application/v2',
    endpoints: {
      ingredientsDataPage: 'D_IngredientsList',
      formulasDataPage: 'D_FormulasList',
      // ... more endpoints
    },
  },
  enableCaching: true,
  enableBatchRequests: true,
  // ... more settings
}
```

**When to Change:**
- Set `useDxApi: true` when deploying to Pega
- Update endpoint names to match your Pega application
- Configure authentication in DxApiService

#### 2. Data Grid Features

Controls advanced grid functionality:

```typescript
dataGrid: {
  enableRowReordering: false,      // Manual drag-drop row reordering
  showColumnRemoveIcon: false,     // Close icon on column headers
  showAttributeRemoveIcon: false,  // Close icon on attribute columns
  enableBulkSelection: true,
  enableInlineEditing: true,
  // ... more features
}
```

**Features Currently Hidden:**
- **Row Reordering** - Implemented but not shown to client yet
- **Column Remove Icons** - Alternative to actions menu (redundant)

**Reason:** These features are ahead of schedule and awaiting client approval.

#### 3. Header Features

Individual control over header statistics:

```typescript
header: {
  showFormulaName: true,
  showFormulaId: true,
  showFormulaStatus: true,
  showLineCount: false,        // TODO: Enable after approval
  showFormulaCost: false,      // TODO: Enable after approval
  showTargetCost: false,       // TODO: Enable after approval
  showProjectDropdown: true,
  showCreatedBy: true,
  showLastUpdated: true,
}
```

**Use Case:** Show/hide individual metrics without code changes

#### 4. Formula Features

```typescript
formula: {
  enableFormulaCreation: true,
  enableFormulaVersioning: true,
  enableFormulaNormalization: true,
  enableSendForCompounding: true,
  enableFormulaValidation: true,
  // ... more
}
```

#### 5. Developer Features

```typescript
developer: {
  showDevConsole: false,          // Debug panel
  enableVerboseLogging: false,    // Detailed logs
  enableUrlOverrides: true,       // ?feature_xxx=true
  showEventBusMonitor: false,     // Event tracking
}
```

### Using Feature Flags in Components

#### Basic Usage

```typescript
import { useDataGridFeatures } from '../hooks/useFeatureFlags';

const MyComponent = () => {
  const dataGridFlags = useDataGridFeatures();
  
  return (
    <div>
      {dataGridFlags.enableRowReordering && (
        <DragHandle />
      )}
    </div>
  );
};
```

#### Available Hooks

```typescript
useFeatureFlags()        // All flags
useApiFeatures()         // API settings
useDataGridFeatures()    // Grid features
useHeaderFeatures()      // Header stats
useFormulaFeatures()     // Formula operations
useIngredientFeatures()  // Ingredient features
useDilutionFeatures()    // Dilution settings
useWorkspaceFeatures()   // Workspace settings
useUndoRedoFeatures()    // Undo/redo settings
useDeveloperFeatures()   // Developer tools
```

#### Utility Hooks

```typescript
// Check single feature
const isEnabled = useFeature('dataGrid', 'enableRowReordering');

// Check multiple features (all must be true)
const allEnabled = useFeatures([
  ['dataGrid', 'enableRowReordering'],
  ['dataGrid', 'enableBulkSelection']
]);

// Check if any feature is enabled
const anyEnabled = useAnyFeature([
  ['header', 'showLineCount'],
  ['header', 'showFormulaCost']
]);

// Get API mode
const apiMode = useApiMode(); // 'dx-api' | 'mock'
```

### Environment-Specific Overrides

Automatically applied based on `import.meta.env.MODE`:

```typescript
// Development
if (env === 'development') {
  featureFlags.developer.enableVerboseLogging = true;
  featureFlags.api.showDetailedErrors = true;
}

// Staging - Test all features
if (env === 'staging') {
  featureFlags.dataGrid.enableRowReordering = true;
  featureFlags.header.showLineCount = true;
}

// Production - Conservative defaults
if (env === 'production') {
  featureFlags.developer.enableVerboseLogging = false;
  featureFlags.developer.enableUrlOverrides = false;
}
```

### URL Parameter Overrides

For testing specific features without code changes:

```
# Enable row reordering
?feature_rowReordering=true

# Show header stats
?feature_lineCount=true&feature_formulaCost=true

# Switch to DX API
?feature_useDxApi=true
```

**Note:** Only works if `developer.enableUrlOverrides` is `true`

---

## API Integration

### Architecture Overview

The application uses a **3-layer API architecture**:

```
Components
    ↓
ApiService (Abstraction Layer)
    ↓
├─ PegaService (Mock Data)
└─ DxApiService (Pega DX API)
```

### API Abstraction Layer

**Location:** `src/services/api.ts`

The `ApiService` provides a unified interface that automatically routes to the correct backend:

```typescript
import { ApiService } from './services/api';

// Automatically uses mock or DX API based on featureFlags.api.useDxApi
const ingredients = await ApiService.getIngredients();
const formulas = await ApiService.getFormulas();

// Create formula
const newFormula = await ApiService.createFormula({
  name: 'New Fragrance',
  version: 'v1',
  // ... more fields
});

// Update formula
await ApiService.updateFormula('FORM001', {
  status: 'active',
  totalPercentage: 100,
});

// Submit for compounding
await ApiService.submitForCompounding('FORM001');
```

### Response Format

All API methods return a consistent response:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
```

Usage:

```typescript
const response = await ApiService.getIngredients();

if (response.success) {
  console.log('Data:', response.data);
} else {
  console.error('Error:', response.error?.message);
}
```

### Switching Between Mock and Live Data

**Development (Mock Data):**

```typescript
// featureFlags.ts
api: {
  useDxApi: false,  // Uses mock data from src/mocks/
}
```

**Production (Pega DX API):**

```typescript
// featureFlags.ts
api: {
  useDxApi: true,  // Uses DxApiService
  dxApiConfig: {
    baseUrl: 'https://your-pega.com/prweb/api/application/v2',
    // ... configuration
  },
}
```

**No code changes required in components!**

---

## DX API Implementation

### Overview

**Location:** `src/services/dxApi.ts`

The `DxApiService` implements Pega DX API v2 integration with:

- Data Page fetching
- Case creation and updates
- Batch request management
- Request caching
- Retry logic
- Authentication

### Data Flow

```
CreateFormulaV2 Component
        ↓
   ApiService
        ↓
   DxApiService
        ↓
   Pega DX API v2
        ↓
   ┌─────────────────┐
   │ Data Pages      │ → Ingredients, Formulas, Attributes
   │ Case API        │ → Create/Update Formulas
   │ Action API      │ → Submit for Compounding
   └─────────────────┘
```

### Data Pages

The application expects the following Pega Data Pages:

#### 1. Ingredients List

**Data Page:** `D_IngredientsList` (configurable)

**Expected Structure:**

```json
{
  "pxResults": [
    {
      "IngredientID": "INGR8007758",
      "Name": "Bergamot Oil",
      "Code": "INGR8007758",
      "Price": 23.40,
      "Unit": "kg",
      "Type": "natural",
      "Category": "Essential Oils",
      "Supplier": "Givaudan",
      "Status": "active",
      "MAC": 0.4,
      "OdorProfile": "Fresh, Citrus",
      "Volatility": "Top Note",
      "Allergens": "Limonene, Linalool",
      "IFRACategory": "Category 4",
      "CASNumber": "8007-75-8",
      "Description": "Fresh citrus oil..."
    }
  ]
}
```

**Property Mapping:**

| Pega Property | App Property | Type | Required |
|---------------|--------------|------|----------|
| IngredientID | id | string | Yes |
| Name | name | string | Yes |
| Code | code | string | Yes |
| Price | price | number | Yes |
| Type | type | 'natural'\|'synthetic'\|'base' | Yes |
| MAC | mac | number | Yes |
| Status | status | 'active'\|'inactive' | Yes |

#### 2. Formulas List

**Data Page:** `D_FormulasList` (configurable)

**Expected Structure:**

```json
{
  "pxResults": [
    {
      "FormulaID": "FORM001",
      "Name": "Fresh Citrus Blend",
      "Version": "v1",
      "Status": "active",
      "CreatedBy": "John Doe",
      "LastUpdated": "2024-01-15",
      "Category": "Perfume",
      "ProjectName": "Summer Collection",
      "ProjectID": "PROJ001",
      "TotalPercentage": 100.0,
      "CostPerKg": 45.50,
      "Ingredients": [
        {
          "IngredientID": "INGR8007758",
          "Name": "Bergamot Oil",
          "Percentage": 15.5,
          "Type": "natural"
        }
      ],
      "TopNotes": ["Bergamot", "Lemon"],
      "MiddleNotes": ["Rose", "Jasmine"],
      "BaseNotes": ["Sandalwood"],
      "Description": "A fresh citrus fragrance..."
    }
  ]
}
```

#### 3. Ingredient Attributes

**Data Page:** `D_IngredientAttributesList` (configurable)

**Expected Structure:**

```json
{
  "pxResults": [
    {
      "AttributeID": "ATTR001",
      "Name": "Odor Profile",
      "Type": "select",
      "Description": "Primary odor characteristics",
      "Category": "Sensory",
      "IsRequired": false,
      "Values": ["Fresh", "Floral", "Woody", "Citrus"],
      "Unit": null
    }
  ]
}
```

### Case Operations

#### Creating a Formula

When a user creates a new formula, it creates a case in Pega:

```typescript
POST /prweb/api/application/v2/cases
{
  "caseTypeID": "FragranceLab-Work-Formula",
  "content": {
    "Name": "New Fragrance",
    "Version": "v1",
    "Status": "draft",
    "Category": "Perfume",
    "Ingredients": [
      {
        "IngredientID": "INGR001",
        "Name": "Bergamot",
        "Percentage": 15.5,
        "Type": "natural"
      }
    ],
    "TotalPercentage": 15.5,
    "TopNotes": ["Bergamot"],
    "MiddleNotes": [],
    "BaseNotes": [],
    "Description": "Fresh citrus fragrance"
  }
}
```

**Response:**

```json
{
  "ID": "F-123",
  "caseTypeName": "FragranceLab-Work-Formula",
  "nextAssignmentID": "A-456"
}
```

#### Updating a Formula

When the user edits a formula in the DataGrid, updates are sent to Pega:

```typescript
PUT /prweb/api/application/v2/cases/F-123
{
  "content": {
    "TotalPercentage": 100.0,
    "Ingredients": [
      // Updated ingredient list
    ]
  }
}
```

**Batch Updates:**

If multiple formulas are edited in quick succession, the service batches updates:

```typescript
// User edits formula A
// User edits formula B  
// User edits formula C
// → All sent in one batch after 500ms (configurable)
```

Configuration:

```typescript
api: {
  enableBatchRequests: true,
  dxApiConfig: {
    batch: {
      enabled: true,
      maxBatchSize: 10,
      batchDelay: 500, // ms
    },
  },
}
```

#### Submitting for Compounding

```typescript
POST /prweb/api/application/v2/cases/F-123/actions/SubmitForCompounding
```

This executes a Pega action that validates and submits the formula for compounding.

### Authentication

The `DxApiService` needs to authenticate with Pega. Implementation depends on your architecture:

#### Option 1: Parent Frame Authentication (Recommended for Constellation)

```typescript
// DxApiService.initializeAuth()
window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*');

window.addEventListener('message', (event) => {
  if (event.data.type === 'AUTH_TOKEN_RESPONSE') {
    this.authToken = event.data.token;
  }
});
```

#### Option 2: Cookie/Session Authentication

```typescript
// Pega session already established, auth handled by cookies
// No explicit token needed
```

#### Option 3: OAuth/SAML Flow

```typescript
// Implement OAuth flow
const token = await performOAuthFlow();
this.authToken = token;
```

**Implementation Location:** `DxApiService.initializeAuth()` in `src/services/dxApi.ts`

### Request Caching

To reduce API calls, responses are cached:

```typescript
api: {
  enableCaching: true,
  cacheDuration: 5 * 60 * 1000, // 5 minutes
}
```

**Cache Invalidation:**

- Automatic: After `cacheDuration` expires
- Manual: After create/update operations
- Clear all: `ApiService.clearCache()`

### Error Handling

All DX API errors are caught and returned in a consistent format:

```typescript
{
  success: false,
  error: {
    message: "HTTP 404: Formula not found",
    code: "FORMULA_NOT_FOUND",
    details: { ... }
  }
}
```

**Retry Logic:**

```typescript
api: {
  dxApiConfig: {
    retry: {
      enabled: true,
      maxRetries: 3,
      retryDelay: 1000, // ms
    },
  },
}
```

---

## Component Updates

### Components Using Feature Flags

The following components have been updated to respect feature flags:

#### 1. Header Badges (`Header.Badges.tsx`)

```typescript
const headerFlags = useHeaderFeatures();

{headerFlags.showLineCount && (
  <div>Line Count: {metrics.lineCount}</div>
)}

{headerFlags.showFormulaCost && (
  <div>Cost: ${metrics.formulaCost}</div>
)}
```

**Controlled Features:**
- Formula Name
- Formula ID
- Status Badge
- Line Count
- Formula Cost
- Target Cost (RMC)

#### 2. DataGrid (`DataGrid.tsx`)

```typescript
const dataGridFlags = useDataGridFeatures();

const enableRowReordering = enableRowReorderingProp ?? 
  dataGridFlags.enableRowReordering;

{enableRowReordering && (
  <DragHandle />
)}
```

**Controlled Features:**
- Row reordering (drag-drop)
- Bulk selection
- Column remove icons
- Inline editing

#### 3. Column Header Cell (`ColumnHeaderCell.tsx`)

```typescript
const dataGridFlags = useDataGridFeatures();

{dataGridFlags.showColumnRemoveIcon && (
  <button onClick={onDeleteColumn}>
    <CloseIcon />
  </button>
)}
```

**Controlled Features:**
- Remove icon visibility

### Adding Feature Flags to New Components

**Step 1:** Import the appropriate hook

```typescript
import { useFormulaFeatures } from '../hooks/useFeatureFlags';
```

**Step 2:** Use the hook in your component

```typescript
const MyComponent = () => {
  const formulaFlags = useFormulaFeatures();
  
  return (
    <div>
      {formulaFlags.enableFormulaCreation && (
        <button>Create Formula</button>
      )}
    </div>
  );
};
```

**Step 3:** Add feature to `featureFlags.ts` if needed

```typescript
formula: {
  enableMyNewFeature: false, // TODO: Enable after testing
}
```

---

## Testing & Validation

### Pre-Deployment Checklist

#### 1. Feature Flag Verification

```typescript
// Check all flags are properly configured
import { featureFlags } from './config/featureFlags';

console.log('API Mode:', featureFlags.api.useDxApi ? 'DX API' : 'Mock');
console.log('Row Reordering:', featureFlags.dataGrid.enableRowReordering);
console.log('Header Stats:', {
  lineCount: featureFlags.header.showLineCount,
  formulaCost: featureFlags.header.showFormulaCost,
});
```

#### 2. Mock Data Testing

Test with mock data first:

```typescript
api: {
  useDxApi: false,
}
```

Verify all features work as expected.

#### 3. DX API Testing

**Step 1:** Configure endpoints

```typescript
api: {
  useDxApi: true,
  dxApiConfig: {
    baseUrl: 'https://staging-pega.com/prweb/api/application/v2',
    endpoints: {
      ingredientsDataPage: 'D_IngredientsList',
      formulasDataPage: 'D_FormulasList',
      // ... rest
    },
  },
}
```

**Step 2:** Enable verbose logging

```typescript
developer: {
  enableVerboseLogging: true,
}
```

**Step 3:** Test each endpoint individually

```typescript
// Test ingredients fetch
const ingredients = await ApiService.getIngredients();
console.log('Ingredients:', ingredients);

// Test formulas fetch
const formulas = await ApiService.getFormulas();
console.log('Formulas:', formulas);

// Test formula creation
const newFormula = await ApiService.createFormula({
  name: 'Test Formula',
  version: 'v1',
  // ... rest
});
console.log('Created:', newFormula);

// Test formula update
const updated = await ApiService.updateFormula('FORM001', {
  status: 'active',
});
console.log('Updated:', updated);
```

**Step 4:** Monitor browser console for errors

Look for:
- Authentication issues
- Endpoint 404s
- Data transformation errors
- CORS issues

#### 4. Feature Toggle Testing

Test each feature can be toggled on/off:

```bash
# Test with URL parameters
?feature_rowReordering=true
?feature_lineCount=true
?feature_useDxApi=true
```

#### 5. Performance Testing

Monitor API performance:

```typescript
developer: {
  showPerformanceMetrics: true,
}
```

Check:
- API response times
- Cache hit rates
- Batch request efficiency

### Validation Test Cases

| Test Case | Expected Result |
|-----------|-----------------|
| Load ingredients list | Data displays in library panel |
| Load formulas list | Formulas appear in formula list |
| Create new formula | Case created in Pega, ID returned |
| Edit formula in grid | Case updated in Pega |
| Add ingredient to formula | Update sent to Pega |
| Remove ingredient | Update sent to Pega |
| Normalize formula | Percentages recalculated, update sent |
| Submit for compounding | Action executed in Pega |
| Multiple rapid edits | Batched into single request |
| Cache expiry | Fresh data fetched after 5 minutes |
| Authentication failure | Error message displayed |
| Network timeout | Retry logic triggers |

---

## Deployment Guide

### Pega Constellation Integration

#### Step 1: Build the Application

```bash
npm run build
```

This creates a production build in the `dist` folder.

#### Step 2: Configure Feature Flags for Production

```typescript
// featureFlags.ts
api: {
  useDxApi: true,
  dxApiConfig: {
    baseUrl: window.location.origin + '/prweb/api/application/v2',
    // ... rest
  },
}

// Or use environment variables
api: {
  useDxApi: import.meta.env.VITE_USE_DX_API === 'true',
  dxApiConfig: {
    baseUrl: import.meta.env.VITE_DX_API_BASE_URL,
    // ... rest
  },
}
```

**.env.production:**

```env
VITE_USE_DX_API=true
VITE_DX_API_BASE_URL=https://production-pega.com/prweb/api/application/v2
```

#### Step 3: Embed in Pega Constellation

The built application can be embedded as:

1. **Custom Component in Constellation**
2. **iFrame**
3. **Web Component**

**Example Constellation Configuration:**

```javascript
{
  component: 'CreateFormulaV2',
  props: {
    // Optional prop overrides
  },
  config: {
    authentication: 'inherit', // Use parent auth
    allowParentCommunication: true,
  }
}
```

#### Step 4: Configure CORS (if needed)

If hosting separately, configure Pega CORS headers:

```
Access-Control-Allow-Origin: https://your-app-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
```

#### Step 5: Verify Integration

1. Load application in Pega
2. Check authentication works
3. Verify data loads from Pega Data Pages
4. Test create/update operations
5. Monitor browser console for errors

### Environment-Specific Configurations

**Development:**

```typescript
api: {
  useDxApi: false,
  developer: {
    enableVerboseLogging: true,
    showDevConsole: true,
  },
}
```

**Staging:**

```typescript
api: {
  useDxApi: true,
  dxApiConfig: {
    baseUrl: 'https://staging-pega.com/...',
  },
  developer: {
    enableVerboseLogging: true,
  },
  dataGrid: {
    enableRowReordering: true, // Test all features
    showColumnRemoveIcon: true,
  },
  header: {
    showLineCount: true,
    showFormulaCost: true,
  },
}
```

**Production:**

```typescript
api: {
  useDxApi: true,
  dxApiConfig: {
    baseUrl: 'https://production-pega.com/...',
  },
  developer: {
    enableVerboseLogging: false,
    enableUrlOverrides: false,
  },
  dataGrid: {
    enableRowReordering: false, // Only approved features
    showColumnRemoveIcon: false,
  },
  header: {
    showLineCount: false,
    showFormulaCost: false,
  },
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Authentication failed"

**Cause:** DxApiService unable to get auth token

**Solution:**

- Check `DxApiService.initializeAuth()` implementation
- Verify parent frame is sending auth token
- Check browser console for postMessage errors
- Verify CORS configuration

**Debug:**

```typescript
developer: {
  enableVerboseLogging: true,
}

// Check logs
[DX API] Authentication initialized: { hasToken: false }
```

#### 2. "404 Not Found" on Data Page

**Cause:** Data Page name mismatch

**Solution:**

- Verify Data Page exists in Pega
- Check exact spelling in `featureFlags.ts`
- Verify user has access to Data Page

**Configuration:**

```typescript
dxApiConfig: {
  endpoints: {
    ingredientsDataPage: 'D_IngredientsList', // Must match exactly
  },
}
```

#### 3. Data Not Displaying

**Cause:** Data structure mismatch

**Solution:**

- Check browser console for transformation errors
- Verify Pega data structure matches expected format
- Update `transform*Data()` methods in `DxApiService`

**Debug:**

```typescript
// Check raw response
const response = await fetch('...DataPage...');
const data = await response.json();
console.log('Raw Pega Data:', data);
```

#### 4. Feature Not Showing/Hiding

**Cause:** Feature flag not configured or component not updated

**Solution:**

- Check feature flag value in `featureFlags.ts`
- Verify component uses the feature flag hook
- Clear browser cache
- Check for prop overrides in component usage

**Debug:**

```typescript
const flags = useDataGridFeatures();
console.log('Row Reordering Enabled:', flags.enableRowReordering);
```

#### 5. Performance Issues

**Cause:** Too many API calls or cache disabled

**Solution:**

- Enable caching: `enableCaching: true`
- Increase cache duration: `cacheDuration: 10 * 60 * 1000`
- Enable batch requests: `enableBatchRequests: true`
- Reduce Data Page result size

**Monitor:**

```typescript
developer: {
  showPerformanceMetrics: true,
}
```

#### 6. CORS Errors

**Cause:** Cross-origin requests blocked

**Solution:**

- Configure Pega CORS headers
- Use proxy in development
- Deploy to same origin as Pega

**Development Proxy:**

```typescript
// vite.config.ts
export default {
  server: {
    proxy: {
      '/prweb': {
        target: 'https://your-pega.com',
        changeOrigin: true,
      },
    },
  },
};
```

### Debug Mode

Enable comprehensive debugging:

```typescript
developer: {
  showDevConsole: true,
  enableVerboseLogging: true,
  showPerformanceMetrics: true,
  showEventBusMonitor: true,
}
```

This will log:
- All API requests/responses
- Feature flag checks
- Event bus activity
- Performance metrics
- Cache hits/misses

### Support

For issues or questions:

1. Check browser console for error messages
2. Enable verbose logging
3. Verify feature flag configuration
4. Check DX API endpoint configuration
5. Test with mock data first
6. Consult Pega DX API documentation

---

## Appendix

### Complete Feature Flag Reference

See `src/config/featureFlags.ts` for the complete, up-to-date list of all feature flags and their descriptions.

### API Service Reference

See `src/services/api.ts` for all available API methods and their signatures.

### DX API Service Reference

See `src/services/dxApi.ts` for DX API implementation details and data transformation logic.

---

**End of Guide**
