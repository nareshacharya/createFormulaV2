# Pega Integration Implementation Plan
**Version 1.0** | **Date:** November 20, 2025

---

## Executive Summary

This document outlines the complete strategy for integrating Pega Constellation Data Pages into the CreateFormulaV2 application. The integration will enable seamless data synchronization while maintaining backward compatibility with mock data as fallback. The application will be deployed as an embedded component within Pega Constellation.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Data Flow Diagrams](#data-flow-diagrams)
3. [Implementation Phases](#implementation-phases)
4. [API Integration Specifications](#api-integration-specifications)
5. [Performance Optimization Strategy](#performance-optimization-strategy)
6. [Error Handling & Fallback Mechanism](#error-handling--fallback-mechanism)
7. [Implementation Checklist](#implementation-checklist)

---

## Architecture Overview

### High-Level Components

```
┌─────────────────────────────────────────────────────────┐
│           CreateFormulaV2 Application                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │            UI Layer (React Components)              │ │
│  │  - LibraryPanel                                      │ │
│  │  - IngredientList                                    │ │
│  │  - FormulaList                                       │ │
│  │  - DataGrid                                          │ │
│  │  - AttributeSelector                                │ │
│  └─────────────────────────────────────────────────────┘ │
│                      ↓                                     │
│  ┌─────────────────────────────────────────────────────┐ │
│  │         ApiService (Abstraction Layer)              │ │
│  │  Routes: Mock ↔ DX API (Feature Flag Controlled)   │ │
│  └─────────────────────────────────────────────────────┘ │
│        ↙                   ↓                   ↖            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ PegaService  │  │ DxApiService │  │ CachingLayer │    │
│  │ (Mock Data)  │  │ (Real API)   │  │ (Optimization)    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                            │
└─────────────────────────────────────────────────────────┘
         ↓                              ↓
   [Local Mock Data]        [Pega Constellation]
     (Fallback)              (Production API)
```

### Service Tier Architecture

```
Caching Layer (Redis-like strategy)
    ↓
Rate Limiting & Request Batching
    ↓
DX API Wrapper (dxApi.ts)
    ├─ Authentication
    ├─ Request/Response Transform
    ├─ Error Handling
    └─ Retry Logic
    ↓
Pega Data Pages
    ├─ D_GetIngredientsForFormulaPanel
    ├─ D_GetingredientSummary
    ├─ D_GetFormulasForFormulaPanel
    ├─ D_GetFormulaDetailsForFormulaPanel (New)
    ├─ D_AttributesList
    ├─ D_GetIngredientsDataForSelectedFormula
    └─ (Additional pages as needed)
```

---

## Data Flow Diagrams

### 1. Ingredient List Loading Flow

```
User opens LibraryPanel
    ↓
ApiService.getIngredients({ skip: 0, limit: 50 })
    ↓
DxApiService.getIngredients()
    ↓
[DX API Call: D_GetIngredientsForFormulaPanel]
    ↓
Transform Response (Map Pega fields to Ingredient model)
    ↓
Cache Result (5 min TTL)
    ↓
Render 50 items + "Load More" button
    ↓
(If API fails) → Fallback to PegaService.getIngredients() → Mock data

User clicks "Load More"
    ↓
ApiService.getIngredients({ skip: 50, limit: 50 })
    ↓
Check Cache → Miss → API Call
    ↓
Append to list
```

### 2. Ingredient Details Modal Flow

```
User clicks info icon on ingredient row
    ↓
Emit event: "ingredient-detail-requested"
    ↓
IngredientQuickView Modal opens
    ↓
ApiService.getIngredientDetails(ingredientId, version)
    ↓
DxApiService.getIngredientDetails()
    ↓
[DX API Call: D_GetingredientSummary]
    ↓
Transform Response (Map detailed fields)
    ↓
Cache Result (10 min TTL)
    ↓
Display Compliance, Safety, Supplier, Composition
    ↓
(If API fails) → Show cached data or "Data unavailable"
```

### 3. Formula Persistence Flow

```
User clicks "Save Workspace" in header
    ↓
Collect all work area data (tables, formulas, columns, history)
    ↓
ApiService.saveWorkspace(workspaceData)
    ↓
DxApiService.createCase() or updateCase()
    ↓
[DX API Call: Create/Update Case with workspace JSON]
    ↓
Receive workspaceId
    ↓
Store in localStorage (for session recovery)
    ↓
Show success notification
    ↓
(If API fails) → Store in localStorage only, sync on retry
```

### 4. Compliance Check Flow

```
User clicks "Compliance Check" button
    ↓
Collect active formula data
    ↓
ApiService.checkCompliance(formulaData)
    ↓
DxApiService.submitForCompliance()
    ↓
[DX API Call: Case creation with compliance request]
    ↓
Receive compliance result JSON
    ↓
Transform and display in Compliance Modal
    ↓
Show pass/fail with details
```

---

## Implementation Phases

### Phase 1: Foundation & Infrastructure (Week 1)
**Status:** Ready for implementation

Tasks:
- [ ] Update `featureFlags.ts` with Pega endpoint configuration
- [ ] Enhance `dxApi.ts` with:
  - Authentication handler
  - Request/response transformation layer
  - Caching decorator
  - Error handling & retry logic
- [ ] Update `pega.ts` with new service methods
- [ ] Implement `CacheManager` utility class
- [ ] Setup error boundaries and fallback UI

**Files to Modify:**
- `src/config/featureFlags.ts`
- `src/services/dxApi.ts`
- `src/services/pega.ts`
- `src/services/api.ts`
- `src/utils/cacheManager.ts` (NEW)
- `src/utils/errorHandler.ts` (NEW)

---

### Phase 2: Data Integration (Week 2)
**Status:** Depends on Phase 1

Tasks:
- [ ] Ingredients Data Page Integration
  - [ ] Update `IngredientList.tsx` to use pagination
  - [ ] Implement lazy loading with "Load More"
  - [ ] Integrate `D_GetIngredientsForFormulaPanel`
  
- [ ] Ingredient Details Integration
  - [ ] Update `IngredientQuickView.tsx` to fetch details
  - [ ] Integrate `D_GetingredientSummary`
  - [ ] Display compliance, safety, supplier info
  
- [ ] Formulas Data Page Integration
  - [ ] Update `FormulaList.tsx` to fetch from Pega
  - [ ] Integrate `D_GetFormulasForFormulaPanel`
  - [ ] Implement formula search & filter
  
- [ ] Attributes Data Page Integration
  - [ ] Update `AttributeSelector.tsx` to fetch from Pega
  - [ ] Integrate `D_AttributesList`
  - [ ] Handle attribute selection UI

**Files to Modify:**
- `src/components/IngredientList.tsx`
- `src/components/IngredientQuickView.tsx`
- `src/components/FormulaList.tsx`
- `src/view/Library/LibraryPanel.tsx`
- `src/components/AttributeSelector.tsx`

---

### Phase 3: Operations & Persistence (Week 3)
**Status:** Depends on Phase 2

Tasks:
- [ ] Formula Creation & Persistence
  - [ ] Create `D_CreateFormula` API call handler
  - [ ] Update `FormulaModal.tsx` to persist new formulas
  - [ ] Handle generated formula ID mapping
  
- [ ] Workspace Save/Load
  - [ ] Implement `saveWorkspace()` method
  - [ ] Implement `loadWorkspace()` method
  - [ ] Create `D_SaveWorkspace` / `D_LoadWorkspace` handlers
  - [ ] Add workspace recovery on app initialization
  
- [ ] Compliance Check
  - [ ] Implement `checkCompliance()` method
  - [ ] Create `D_CheckCompliance` API call
  - [ ] Update header compliance button
  - [ ] Display results in modal
  
- [ ] Compounding Submission
  - [ ] Implement `submitForCompounding()` method
  - [ ] Create `D_SubmitCompounding` API call
  - [ ] Update compounding button
  - [ ] Show submission confirmation

**Files to Modify:**
- `src/services/api.ts`
- `src/services/dxApi.ts`
- `src/view/WorkArea/WorkArea.tsx`
- `src/components/FormulaModal.tsx`
- `src/view/AppShell/Header.Actions.tsx`

---

### Phase 4: Performance Optimization (Week 4)
**Status:** Depends on Phase 3

Tasks:
- [ ] Request Batching
  - [ ] Implement request debouncing (300ms)
  - [ ] Batch multiple API calls
  - [ ] Reduce API round trips
  
- [ ] Caching Strategy
  - [ ] Implement TTL-based cache
  - [ ] Cache ingredients list (5 min)
  - [ ] Cache formula list (10 min)
  - [ ] Cache attributes (15 min)
  - [ ] Implement cache invalidation
  
- [ ] Lazy Loading
  - [ ] Implement infinite scroll or pagination
  - [ ] Virtual scrolling for large lists
  - [ ] On-demand detail fetching
  
- [ ] Network Optimization
  - [ ] Request compression
  - [ ] Field filtering (only needed fields)
  - [ ] Parallel request optimization

**Files to Modify:**
- `src/utils/cacheManager.ts`
- `src/utils/requestBatcher.ts` (NEW)
- `src/components/IngredientList.tsx`
- `src/components/FormulaList.tsx`

---

### Phase 5: Testing & Deployment (Week 5)
**Status:** Depends on Phase 4

Tasks:
- [ ] Unit Tests
  - [ ] Test DxApiService methods
  - [ ] Test error handling & fallback
  - [ ] Test caching logic
  
- [ ] Integration Tests
  - [ ] Test data flow end-to-end
  - [ ] Test mock vs. real API switching
  - [ ] Test workspace persistence
  
- [ ] Performance Tests
  - [ ] Measure API response times
  - [ ] Measure component render times
  - [ ] Validate caching effectiveness
  
- [ ] Pega Component Deployment
  - [ ] Package as Pega component
  - [ ] Configure endpoints in Pega
  - [ ] Test in Pega environment
  - [ ] Document deployment steps

---

## API Integration Specifications

### 1. Ingredients List Integration

**Data Page:** `D_GetIngredientsForFormulaPanel`

**Request:**
```typescript
{
  skip: number;        // Pagination offset (0, 50, 100, ...)
  limit: number;       // Page size (50)
  filters?: {
    search?: string;   // Search by name or LIMS ID
    status?: string;   // "Active", "Inactive", etc.
    chemicalClass?: string;
  }
}
```

**Response Mapping:**
```typescript
Pega Field                  → App Field
─────────────────────────────────────────
IngredientID               → id
ChemicalNamePreferred      → name
LIMSIngID                  → code
CASID                      → casNumber
INGStatus                  → status
SpecificGravity20C         → specificGravity
RefractiveIndex20C         → refractiveIndex
PhysicalState              → physicalState
OdorStrength               → odorStrength
OlfactivePrimaryDescriptor → primaryDescriptor
OlfactiveSecondaryDescriptor → secondaryDescriptor
Version                    → version
```

**Caching:**
- TTL: 5 minutes
- Key: `ingredients_${skip}_${limit}_${JSON.stringify(filters)}`
- Invalidate on: New ingredient added/formula created

---

### 2. Ingredient Details Integration

**Data Page:** `D_GetingredientSummary`

**Request:**
```typescript
{
  IngredientID: string;
  Version: string;
}
```

**Response Mapping:**
```typescript
// Main Properties
IngredientDetails.{
  BoilingPoint, Density20C, CID, CASID,
  ChemicalClass, DerivedSourceClass,
  OlfactivePrimaryDescriptor, etc.
}

// Nested Objects
Compliance.{
  BiodegStatus_CSV, CaliforniaProp65,
  CARB, EPA, HalalStatus, etc.
}

Safety.{
  GHSHazard_Class, GHSSignalWord,
  LD50OralMgkg, LD50DermalMgkg, etc.
}

Composition[].{
  ComponentName, Percentage, BoilingPoint, etc.
}

Supplier[].{
  SupplierName, SupplierCode, etc.
}
```

**Caching:**
- TTL: 10 minutes
- Key: `ingredient_${id}_${version}`

---

### 3. Formulas List Integration

**Data Page:** `D_GetFormulasForFormulaPanel`

**Request:**
```typescript
{
  skip?: number;
  limit?: number;
  filters?: {
    search?: string;
    status?: string;
    projectId?: string;
  }
}
```

**Response Mapping:**
```typescript
FormulaID              → id
FormulaName            → name
FormulaVersion         → version
FormulaStatus          → status
CreatedBy              → createdBy
LastUpdated            → lastUpdated
ProjectName            → projectName
ProjectID              → projectId
CostPerKg              → costPerKg
```

**Caching:**
- TTL: 10 minutes
- Key: `formulas_${skip}_${limit}_${JSON.stringify(filters)}`

---

### 4. Attributes List Integration

**Data Page:** `D_AttributesList`

**Request:**
```typescript
{
  filters?: {
    category?: string;
    type?: string;  // "text", "number", "boolean", "select"
  }
}
```

**Response Mapping:**
```typescript
AttributeName          → name
AttributeDesription    → description
Field                  → id
Module                 → module
```

**Caching:**
- TTL: 15 minutes
- Key: `attributes_${JSON.stringify(filters)}`

---

### 5. Ingredient Details for Formula Integration

**Data Page:** `D_GetIngredientsDataForSelectedFormula`

**Request:**
```typescript
{
  FormulaID: string;
  IngredientID: string;
  Version?: string;
}
```

**Response:**
```typescript
{
  IngredientID: string;
  // Additional formula-specific ingredient data
  // Attributes values for this ingredient in this formula
  // Compliance status within formula context
}
```

---

### 6. Workspace Persistence Integration

**Scenarios:**
- Save workspace
- Load workspace list
- Load specific workspace
- Delete workspace

**Data Structure:**
```typescript
interface WorkspaceData {
  id?: string;
  name: string;
  description?: string;
  tableData: Row[];
  columns: Column[];
  selectedFormulaIds: string[];
  projectMapping: Record<string, string>;
  history: HistoryEntry[];
  createdAt: Date;
  lastModified: Date;
  createdBy?: string;
}
```

**Caching:**
- TTL: Session duration
- Store in localStorage for offline access
- Sync on next successful API call

---

### 7. Compliance Check Integration

**API Call:**
```typescript
POST /api/compliance/check
{
  formulaId: string;
  formulaData: CompleteFormulaData;
}
```

**Response:**
```typescript
{
  complianceStatus: "PASS" | "FAIL" | "WARNING";
  details: {
    category: string;
    status: boolean;
    message: string;
  }[];
  timestamp: Date;
}
```

---

### 8. Compounding Submission Integration

**API Call:**
```typescript
POST /api/compounding/submit
{
  formulaId: string;
  formulaData: CompleteFormulaData;
  priority: "low" | "normal" | "high" | "urgent";
  notes?: string;
}
```

**Response:**
```typescript
{
  submissionId: string;
  status: "SUBMITTED" | "IN_PROGRESS" | "COMPLETED";
  taskId?: string;
  message: string;
  timestamp: Date;
}
```

---

## Performance Optimization Strategy

### 1. Caching Strategy

```typescript
// CacheManager Implementation
class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  set<T>(key: string, value: T, ttl: number = 300000) {
    // 5 min default
    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      ttl
    });

    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
    }

    // Set expiration
    this.timers.set(
      key,
      setTimeout(() => this.cache.delete(key), ttl)
    );
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.createdAt;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }
}
```

**Cache Allocation:**
- Ingredients: 5 MB (max 50k records with pagination)
- Formulas: 2 MB
- Attributes: 1 MB
- Details: 3 MB (LRU eviction)

---

### 2. Request Batching

```typescript
// RequestBatcher Implementation
class RequestBatcher {
  private queue: BatchRequest[] = [];
  private debounceTimer: NodeJS.Timeout | null = null;

  add<T>(
    key: string,
    factory: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, factory, resolve, reject });

      // Debounce: wait 300ms before executing
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.flush(), 300);
    });
  }

  private async flush() {
    const batch = this.queue.splice(0);
    if (batch.length === 0) return;

    // Group by key to deduplicate
    const grouped = new Map<string, BatchRequest>();
    batch.forEach(req => {
      if (!grouped.has(req.key)) grouped.set(req.key, req);
    });

    // Execute all unique requests in parallel
    const results = await Promise.allSettled(
      Array.from(grouped.values()).map(req => req.factory())
    );

    // Resolve/reject all promises
    results.forEach((result, idx) => {
      const req = Array.from(grouped.values())[idx];
      if (result.status === 'fulfilled') {
        req.resolve(result.value);
      } else {
        req.reject(result.reason);
      }
    });
  }
}
```

---

### 3. Lazy Loading Strategy

```typescript
// Ingredient List with Infinite Scroll
interface IngredientListState {
  items: Ingredient[];
  skip: number;
  limit: 50;
  hasMore: boolean;
  isLoading: boolean;
}

// Load initial batch
const items = await ApiService.getIngredients({
  skip: 0,
  limit: 50
});

// On scroll to bottom
const onScroll = () => {
  if (state.skip + state.limit < totalCount) {
    loadMore();
  }
};

const loadMore = async () => {
  const more = await ApiService.getIngredients({
    skip: state.skip + state.limit,
    limit: 50
  });
  state.items.push(...more);
};
```

---

### 4. Request Prioritization

```typescript
enum RequestPriority {
  CRITICAL = 0,   // Workspace save/load
  HIGH = 1,       // User interaction (ingredient details)
  NORMAL = 2,     // List pagination
  LOW = 3         // Background sync
}

// Priority Queue for API calls
class PriorityQueuedDxApi {
  private queue: PriorityRequest[] = [];

  execute<T>(
    request: DxApiRequest,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    this.queue.push({ request, priority });
    this.queue.sort((a, b) => a.priority - b.priority);
    return this.processQueue();
  }
}
```

---

## Error Handling & Fallback Mechanism

### 1. Error Hierarchy

```typescript
enum ErrorCategory {
  NETWORK = "network",           // No internet
  AUTHENTICATION = "auth",       // Invalid token
  RATE_LIMIT = "rate_limit",    // Too many requests
  NOT_FOUND = "not_found",      // Resource not found
  SERVER_ERROR = "server_error", // 5xx
  VALIDATION = "validation",     // Bad request
  UNKNOWN = "unknown"
}

class ApiError extends Error {
  constructor(
    public message: string,
    public category: ErrorCategory,
    public statusCode?: number,
    public retryable: boolean = true
  ) {
    super(message);
  }
}
```

### 2. Fallback Strategy

```
Attempt DX API
    ↓
[Success] → Cache & Return
    ↓
[Network Error] → Show offline mode, use cached data, queue for retry
    ↓
[Auth Error] → Re-authenticate or show login
    ↓
[Rate Limit] → Exponential backoff retry
    ↓
[Server Error] → Retry with exponential backoff (max 3 attempts)
    ↓
[Not Found] → Try mock data as fallback
    ↓
[Final Fallback] → PegaService.getIngredients() → Mock data
    ↓
[Still fails] → Show error to user, offer manual refresh
```

### 3. Retry Logic

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts || !isRetryable(error)) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### 4. User Notifications

```typescript
// Toast messages
const showErrorNotification = (error: ApiError) => {
  const messages: Record<ErrorCategory, string> = {
    NETWORK: "No internet connection. Using cached data.",
    AUTH: "Session expired. Please login again.",
    RATE_LIMIT: "Server busy. Retrying in a moment...",
    NOT_FOUND: "Requested data not found.",
    SERVER_ERROR: "Server error. Please try again.",
    VALIDATION: "Invalid request. Please check your input.",
    UNKNOWN: "An unexpected error occurred."
  };

  toast.error(messages[error.category]);
};
```

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review all attached JSON files and map fields
- [ ] Get Pega endpoint URLs and authentication method
- [ ] Confirm Data Page naming conventions
- [ ] Setup mock data as fallback (already done)
- [ ] Plan database schema for workspace persistence

### Phase 1: Infrastructure
- [ ] Create `CacheManager` utility
- [ ] Enhance `dxApi.ts` with auth handler
- [ ] Create `RequestBatcher` utility
- [ ] Update `featureFlags.ts` with Pega config
- [ ] Create error handler utilities
- [ ] Implement retry logic

### Phase 2: Data Integration
- [ ] Update `IngredientList` pagination
- [ ] Fetch from `D_GetIngredientsForFormulaPanel`
- [ ] Implement ingredient details modal
- [ ] Fetch from `D_GetingredientSummary`
- [ ] Update `FormulaList` pagination
- [ ] Fetch from `D_GetFormulasForFormulaPanel`
- [ ] Update `AttributeSelector`
- [ ] Fetch from `D_AttributesList`

### Phase 3: Operations
- [ ] Implement workspace save
- [ ] Implement workspace load
- [ ] Implement compliance check
- [ ] Implement compounding submission
- [ ] Handle formula creation response

### Phase 4: Performance
- [ ] Implement caching
- [ ] Implement request batching
- [ ] Implement lazy loading
- [ ] Add performance monitoring
- [ ] Optimize bundle size

### Phase 5: Testing & Deployment
- [ ] Unit tests (DxApiService)
- [ ] Integration tests (data flow)
- [ ] Performance tests (response times)
- [ ] E2E tests (user flows)
- [ ] Package for Pega deployment
- [ ] Document Pega configuration

---

## Key Design Principles

### 1. **Progressive Enhancement**
- Start with mock data
- Gradually introduce API calls
- Always have fallback

### 2. **Performance First**
- Cache aggressively
- Batch requests
- Lazy load data
- Minimize re-renders

### 3. **Resilience**
- Comprehensive error handling
- Automatic fallback
- Offline support
- Graceful degradation

### 4. **Maintainability**
- Clear separation of concerns
- Centralized error handling
- Reusable utilities
- Well-documented APIs

### 5. **User Experience**
- Show loading states
- Provide feedback
- Clear error messages
- Minimize wait times

---

## Success Metrics

- [ ] All API calls have working fallback
- [ ] Zero critical errors in production
- [ ] Page load time < 2 seconds (cached)
- [ ] API call response time < 500ms
- [ ] Ingredient list loads in < 1 second (50 items)
- [ ] Detailed modal loads in < 500ms
- [ ] Offline mode works for cached data
- [ ] 95% uptime in Pega environment

---

## Next Steps

1. **Week 1:** Implement Phase 1 infrastructure
2. **Week 2:** Integrate data sources
3. **Week 3:** Implement operations
4. **Week 4:** Optimize performance
5. **Week 5:** Test and deploy to Pega

---

## Document Versioning

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 20, 2025 | Initial architecture and planning document |

---

**Document Owner:** Development Team
**Last Updated:** November 20, 2025
**Status:** Ready for Implementation
