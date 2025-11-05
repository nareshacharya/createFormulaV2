# Feature Flags Quick Start Guide

## 🎯 Purpose

This application includes a comprehensive feature flag system for:
- ✅ Controlling feature visibility during phased rollouts
- ✅ Switching between mock data and Pega DX API
- ✅ Hiding work-in-progress features from clients
- ✅ Developer-only configuration (no UI controls)

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/config/featureFlags.ts` | **Master configuration file** - All feature flags |
| `src/hooks/useFeatureFlags.ts` | Custom hooks for accessing flags |
| `src/services/api.ts` | API abstraction layer (mock vs DX API) |
| `src/services/dxApi.ts` | Pega DX API integration |
| `docs/FEATURE_FLAGS_API_INTEGRATION.md` | **Complete documentation** |

## 🚀 Quick Configuration

### For Development (Mock Data)

```typescript
// src/config/featureFlags.ts
api: {
  useDxApi: false,  // Use mock data
}
```

### For Pega Integration (Production)

```typescript
// src/config/featureFlags.ts
api: {
  useDxApi: true,  // Use DX API
  dxApiConfig: {
    baseUrl: 'https://your-pega.com/prweb/api/application/v2',
    endpoints: {
      ingredientsDataPage: 'D_IngredientsList',
      formulasDataPage: 'D_FormulasList',
      attributesDataPage: 'D_IngredientAttributesList',
      formulaCaseType: 'FragranceLab-Work-Formula',
      // ... more endpoints
    },
  },
}
```

## 🎛️ Feature Control

### Currently Hidden Features

These features are implemented but **disabled** until client approval:

```typescript
dataGrid: {
  enableRowReordering: false,      // ❌ Manual drag-drop row reordering
  showColumnRemoveIcon: false,     // ❌ Close icon on column headers
  showAttributeRemoveIcon: false,  // ❌ Close icon on attribute columns
}

header: {
  showLineCount: false,       // ❌ Line count metric
  showFormulaCost: false,     // ❌ Formula cost metric
  showTargetCost: false,      // ❌ Target cost (RMC) metric
}
```

**To Enable:** Change `false` to `true` in `featureFlags.ts`

### Enable All Features (Staging/Testing)

```typescript
dataGrid: {
  enableRowReordering: true,
  showColumnRemoveIcon: true,
  showAttributeRemoveIcon: true,
}

header: {
  showLineCount: true,
  showFormulaCost: true,
  showTargetCost: true,
}
```

## 💻 Usage in Components

```typescript
import { useHeaderFeatures, useDataGridFeatures } from '../hooks/useFeatureFlags';

const MyComponent = () => {
  const headerFlags = useHeaderFeatures();
  const dataGridFlags = useDataGridFeatures();
  
  return (
    <div>
      {/* Conditionally render based on flags */}
      {headerFlags.showLineCount && (
        <div>Line Count: {lineCount}</div>
      )}
      
      {dataGridFlags.enableRowReordering && (
        <DragHandle />
      )}
    </div>
  );
};
```

## 🔄 API Integration

### How It Works

```
Components
    ↓
ApiService (Abstraction)
    ↓
├─ Mock Data (development)
└─ DX API (production)
```

### Using the API

```typescript
import { ApiService } from './services/api';

// Automatically uses mock or DX API based on featureFlags.api.useDxApi
const ingredients = await ApiService.getIngredients();
const formulas = await ApiService.getFormulas();

// Create formula
await ApiService.createFormula({ name: 'New Fragrance', ... });

// Update formula
await ApiService.updateFormula('FORM001', { status: 'active' });

// Submit for compounding
await ApiService.submitForCompounding('FORM001');
```

**No code changes needed when switching between mock and live data!**

## 🧪 Testing Features

### URL Parameter Overrides

Test features without changing code:

```
?feature_rowReordering=true
?feature_lineCount=true&feature_formulaCost=true
?feature_useDxApi=true
```

**Note:** Only works if `developer.enableUrlOverrides: true`

### Debug Mode

```typescript
developer: {
  enableVerboseLogging: true,   // Detailed logs
  showDevConsole: true,          // Debug panel
  showPerformanceMetrics: true,  // API performance
}
```

## 📊 Pega Data Integration

### Required Data Pages

1. **D_IngredientsList** - Ingredients list
2. **D_FormulasList** - Formulas list
3. **D_IngredientAttributesList** - Attribute definitions

### Case Operations

- **Create Formula** → Creates case in Pega
- **Update Formula** → Updates case via PUT
- **Submit for Compounding** → Executes Pega action
- **Validate Formula** → Executes validation action

See [complete documentation](./FEATURE_FLAGS_API_INTEGRATION.md) for data structures.

## 🔧 Configuration Checklist

### Before Pega Deployment

- [ ] Set `api.useDxApi: true`
- [ ] Configure `api.dxApiConfig.baseUrl`
- [ ] Update Data Page names in `endpoints`
- [ ] Configure Case Type name
- [ ] Implement authentication in `DxApiService.initializeAuth()`
- [ ] Test each endpoint individually
- [ ] Enable only approved features
- [ ] Disable developer features
- [ ] Disable URL overrides

### Environment-Specific Settings

**Development:**
```typescript
api.useDxApi = false
developer.enableVerboseLogging = true
developer.enableUrlOverrides = true
```

**Staging:**
```typescript
api.useDxApi = true
// Enable all features for testing
dataGrid.enableRowReordering = true
header.showLineCount = true
```

**Production:**
```typescript
api.useDxApi = true
// Only approved features enabled
dataGrid.enableRowReordering = false
header.showLineCount = false
developer.enableUrlOverrides = false
```

## 📖 Complete Documentation

See **[FEATURE_FLAGS_API_INTEGRATION.md](./FEATURE_FLAGS_API_INTEGRATION.md)** for:

- Complete feature flag reference
- DX API implementation details
- Data structure specifications
- Authentication setup
- Batch request configuration
- Error handling
- Performance optimization
- Troubleshooting guide
- Deployment checklist

## 🆘 Common Issues

### "Data not loading"
- Check `api.useDxApi` setting
- Verify Data Page names match exactly
- Check authentication is working
- Enable verbose logging

### "Feature not showing"
- Check feature flag value
- Clear browser cache
- Verify component uses feature flag hook

### "API errors"
- Check DX API endpoint configuration
- Verify CORS settings
- Check authentication token
- Review browser console errors

## 🎓 Key Concepts

1. **Feature flags are code-based** - No UI controls
2. **API is abstracted** - Single interface for mock/live data
3. **Props can override flags** - Components accept prop overrides
4. **Environment-aware** - Automatic dev/staging/prod settings
5. **URL overrides for testing** - Quick feature testing without code changes

---

**Need Help?** See [FEATURE_FLAGS_API_INTEGRATION.md](./FEATURE_FLAGS_API_INTEGRATION.md) for complete documentation.
