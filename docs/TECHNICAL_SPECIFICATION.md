# DX API Integration - Technical Specification
**Version 1.0** | **Date:** November 20, 2025

---

## Overview

This document details the technical implementation requirements for integrating Pega DX API into the CreateFormulaV2 application. It serves as a reference for developers implementing the service layer.

---

## Table of Contents
1. [Service Architecture](#service-architecture)
2. [DxApiService Implementation](#dxapiservice-implementation)
3. [PegaService Enhancements](#pegaservice-enhancements)
4. [ApiService Routing](#apiservice-routing)
5. [Utility Classes](#utility-classes)
6. [Configuration](#configuration)
7. [Error Codes](#error-codes)

---

## Service Architecture

### Service Layer Stack

```
┌─────────────────────────────────────────┐
│           React Components              │
│  (LibraryPanel, DataGrid, etc.)        │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│  ApiService (Abstraction & Routing)    │
│  - Feature flag driven switching        │
│  - Error handling                       │
│  - Response transformation              │
└────────┬──────────────────────┬─────────┘
         │                      │
         │ useDxApi = false     │ useDxApi = true
         │                      │
┌────────▼─────────┐   ┌────────▼──────────────┐
│  PegaService     │   │   DxApiService       │
│  (Mock Data)     │   │   (Real API)         │
└──────────────────┘   ├──────────────────────┤
                       │ - Auth Management    │
                       │ - Cache Layer        │
                       │ - Request Batching   │
                       │ - Error Handling     │
                       │ - Retry Logic        │
                       │ - Rate Limiting      │
                       └──────────┬───────────┘
                                  │
                       ┌──────────▼───────────┐
                       │  Pega Endpoints     │
                       │  - Data Pages       │
                       │  - Case APIs        │
                       │  - Actions APIs     │
                       └─────────────────────┘
```

---

## DxApiService Implementation

### File: `src/services/dxApi.ts`

### Core Interface

```typescript
export interface DxApiConfig {
  baseUrl: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  timeout: number;  // ms
  retryAttempts: number;
  retryDelay: number;  // ms
  cacheDuration: number;  // ms
}

export interface DxApiResponse<T> {
  success: boolean;
  data?: T;
  error?: DxApiError;
  metadata?: {
    requestId: string;
    timestamp: Date;
    cacheHit: boolean;
  };
}

export interface DxApiError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
  retryable: boolean;
  timestamp: Date;
}
```

### Authentication Management

```typescript
class DxApiService {
  private static authToken: string | null = null;
  private static authExpiry: Date | null = null;
  private static refreshPromise: Promise<string> | null = null;

  /**
   * Initialize authentication
   */
  static async initializeAuth(): Promise<void> {
    if (this.isAuthValid()) return;

    try {
      const token = await this.getAuthToken();
      this.authToken = token;
      this.authExpiry = new Date(Date.now() + 3600000); // 1 hour
      console.log('[DxApi] Authentication initialized');
    } catch (error) {
      console.error('[DxApi] Authentication failed:', error);
      throw new DxApiError(
        'AUTH_FAILED',
        'Failed to authenticate with Pega',
        error,
        0,
        false
      );
    }
  }

  private static isAuthValid(): boolean {
    return (
      this.authToken !== null &&
      this.authExpiry !== null &&
      this.authExpiry > new Date()
    );
  }

  private static async getAuthToken(): Promise<string> {
    // Use double-checked locking pattern for token refresh
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (this.isAuthValid() && this.authToken) {
      return this.authToken;
    }

    this.refreshPromise = this.performTokenRefresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private static async performTokenRefresh(): Promise<string> {
    const config = featureFlags.api.dxApiConfig;
    const response = await fetch(`${config.baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.clientId!,
        client_secret: config.clientSecret!
      })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  }
}
```

### Request Execution

```typescript
/**
 * Make HTTP request with retry, caching, and error handling
 */
private static async executeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<DxApiResponse<T>> {
  const cacheKey = this.generateCacheKey(endpoint, options);
  const config = featureFlags.api.dxApiConfig;

  // Check cache first
  const cachedData = cacheManager.get<T>(cacheKey);
  if (cachedData) {
    return {
      success: true,
      data: cachedData,
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date(),
        cacheHit: true
      }
    };
  }

  let lastError: Error | null = null;

  // Retry loop with exponential backoff
  for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(endpoint, {
        ...options,
        timeout: config.timeout,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Request-ID': this.generateRequestId()
        }
      });

      if (!response.ok) {
        throw new HttpError(response.statusCode, response.statusText);
      }

      const data = await response.json();
      const transformed = this.transformResponse<T>(data);

      // Cache successful response
      cacheManager.set(cacheKey, transformed, config.cacheDuration);

      return {
        success: true,
        data: transformed,
        metadata: {
          requestId: response.headers.get('X-Request-ID') || this.generateRequestId(),
          timestamp: new Date(),
          cacheHit: false
        }
      };

    } catch (error) {
      lastError = error as Error;

      if (!this.isRetryable(error) || attempt === config.retryAttempts) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s
      const delay = config.retryDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All retries exhausted - check for mock data fallback
  if (featureFlags.api.useMockDataAsFallback) {
    console.warn('[DxApi] Falling back to PegaService for:', endpoint);
    return await this.fallbackToPegaService<T>(endpoint, options);
  }

  return {
    success: false,
    error: new DxApiError(
      'REQUEST_FAILED',
      'All retry attempts failed',
      lastError,
      0,
      false
    )
  };
}
```

### Data Transformation

```typescript
/**
 * Transform Pega response to application model
 */
private static transformResponse<T>(pegaData: any): T {
  if (Array.isArray(pegaData)) {
    return pegaData.map(item => this.transformItem(item)) as T;
  }
  return this.transformItem(pegaData) as T;
}

private static transformItem(item: any): any {
  // Remove Pega-specific fields (px*, py*)
  const cleaned: any = {};
  for (const [key, value] of Object.entries(item)) {
    if (!key.startsWith('px') && !key.startsWith('py') && !key.startsWith('pz')) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}
```

---

## PegaService Enhancements

### File: `src/services/pega.ts`

### Enhanced Interface

```typescript
export class PegaService {
  // INGREDIENTS
  static async getIngredients(
    filters?: {
      skip?: number;
      limit?: number;
      search?: string;
      status?: string;
      chemicalClass?: string;
    }
  ): Promise<Ingredient[]> {
    // Implementation with mock data
    const { skip = 0, limit = 50, search, status } = filters || {};
    let results = [...mockIngredients];

    if (search) {
      const query = search.toLowerCase();
      results = results.filter(
        i => i.name.toLowerCase().includes(query) ||
             i.code?.toLowerCase().includes(query)
      );
    }

    if (status) {
      results = results.filter(i => i.status === status);
    }

    return results.slice(skip, skip + limit);
  }

  static async getIngredientDetails(
    ingredientId: string,
    version: string
  ): Promise<IngredientDetails> {
    // Return enriched ingredient data
    const ingredient = mockIngredients.find(i => i.id === ingredientId);
    if (!ingredient) throw new Error('Ingredient not found');

    return {
      ...ingredient,
      compliance: mockComplianceData[ingredientId],
      safety: mockSafetyData[ingredientId],
      supplier: mockSupplierData[ingredientId],
      composition: mockCompositionData[ingredientId]
    };
  }

  // FORMULAS
  static async getFormulas(
    filters?: {
      skip?: number;
      limit?: number;
      search?: string;
      status?: string;
      projectId?: string;
    }
  ): Promise<Formula[]> {
    const { skip = 0, limit = 50, search, status, projectId } = filters || {};
    let results = [...mockFormulas];

    if (search) {
      const query = search.toLowerCase();
      results = results.filter(f =>
        f.name.toLowerCase().includes(query) ||
        f.id.toLowerCase().includes(query)
      );
    }

    if (status) {
      results = results.filter(f => f.status === status);
    }

    if (projectId) {
      results = results.filter(f => f.projectId === projectId);
    }

    return results.slice(skip, skip + limit);
  }

  static async getFormulaDetails(
    formulaId: string,
    version: string
  ): Promise<FormulaDetails> {
    const formula = mockFormulas.find(f => f.id === formulaId);
    if (!formula) throw new Error('Formula not found');

    return {
      ...formula,
      ingredients: mockFormulaIngredients[formulaId] || [],
      compliance: mockFormulaCompliance[formulaId],
      history: mockFormulaHistory[formulaId] || []
    };
  }

  // ATTRIBUTES
  static async getIngredientAttributes(): Promise<IngredientAttribute[]> {
    return [...mockIngredientAttributes];
  }

  // WORKSPACE
  static async saveWorkspace(data: WorkspaceData): Promise<{ id: string }> {
    const id = `workspace_${Date.now()}`;
    localStorage.setItem(`workspace_${id}`, JSON.stringify(data));
    return { id };
  }

  static async loadWorkspace(workspaceId: string): Promise<WorkspaceData> {
    const data = localStorage.getItem(`workspace_${workspaceId}`);
    if (!data) throw new Error('Workspace not found');
    return JSON.parse(data);
  }

  static async getWorkspaceList(): Promise<WorkspaceSummary[]> {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('workspace_'));
    return keys.map(key => {
      const data = JSON.parse(localStorage.getItem(key)!);
      return {
        id: key.replace('workspace_', ''),
        name: data.name,
        lastModified: data.lastModified,
        createdBy: data.createdBy
      };
    });
  }
}
```

---

## ApiService Routing

### File: `src/services/api.ts`

### Core Implementation

```typescript
export class ApiService {
  /**
   * Route between DxApiService and PegaService
   */
  static async getIngredients(
    filters?: Record<string, unknown>
  ): Promise<ApiResponse<Ingredient[]>> {
    try {
      if (this.isUsingDxApi()) {
        const response = await DxApiService.getIngredients(filters);
        return this.mapDxApiResponse(response);
      } else {
        const ingredients = await PegaService.getIngredients(
          filters as IngredientFilters
        );
        return { success: true, data: ingredients };
      }
    } catch (error) {
      // Try fallback if DX API fails
      try {
        const ingredients = await PegaService.getIngredients(
          filters as IngredientFilters
        );
        return { success: true, data: ingredients };
      } catch (fallbackError) {
        return this.handleError(fallbackError);
      }
    }
  }

  /**
   * Get detailed ingredient information
   */
  static async getIngredientDetails(
    ingredientId: string,
    version: string
  ): Promise<ApiResponse<IngredientDetails>> {
    try {
      if (this.isUsingDxApi()) {
        const response = await DxApiService.getIngredientDetails(
          ingredientId,
          version
        );
        return this.mapDxApiResponse(response);
      } else {
        const details = await PegaService.getIngredientDetails(
          ingredientId,
          version
        );
        return { success: true, data: details };
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Save workspace data
   */
  static async saveWorkspace(
    data: WorkspaceData
  ): Promise<ApiResponse<{ workspaceId: string }>> {
    try {
      if (this.isUsingDxApi()) {
        const response = await DxApiService.saveWorkspace(data);
        return this.mapDxApiResponse(response);
      } else {
        const result = await PegaService.saveWorkspace(data);
        return {
          success: true,
          data: { workspaceId: result.id }
        };
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Load workspace data
   */
  static async loadWorkspace(
    workspaceId: string
  ): Promise<ApiResponse<WorkspaceData>> {
    try {
      if (this.isUsingDxApi()) {
        const response = await DxApiService.loadWorkspace(workspaceId);
        return this.mapDxApiResponse(response);
      } else {
        const data = await PegaService.loadWorkspace(workspaceId);
        return { success: true, data };
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Check formula compliance
   */
  static async checkCompliance(
    formulaId: string,
    formulaData: CompleteFormulaData
  ): Promise<ApiResponse<ComplianceResult>> {
    try {
      if (!this.isUsingDxApi()) {
        return {
          success: false,
          error: {
            message: 'Compliance check only available with DX API',
            code: 'DX_API_REQUIRED'
          }
        };
      }

      const response = await DxApiService.checkCompliance(
        formulaId,
        formulaData
      );
      return this.mapDxApiResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Submit formula for compounding
   */
  static async submitForCompounding(
    formulaId: string,
    formulaData: CompleteFormulaData,
    priority: string = 'normal'
  ): Promise<ApiResponse<CompoundingSubmissionResult>> {
    try {
      if (!this.isUsingDxApi()) {
        return {
          success: false,
          error: {
            message: 'Compounding submission only available with DX API',
            code: 'DX_API_REQUIRED'
          }
        };
      }

      const response = await DxApiService.submitForCompounding(
        formulaId,
        formulaData,
        priority
      );
      return this.mapDxApiResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  private static mapDxApiResponse<T>(response: DxApiResponse<T>): ApiResponse<T> {
    if (response.success) {
      return { success: true, data: response.data };
    }
    return {
      success: false,
      error: {
        message: response.error?.message || 'Unknown error',
        code: response.error?.code,
        details: response.error?.details
      }
    };
  }

  private static handleError(error: unknown): ApiResponse<never> {
    console.error('[ApiService] Error:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'UNKNOWN_ERROR'
      }
    };
  }
}
```

---

## Utility Classes

### CacheManager

```typescript
// File: src/utils/cacheManager.ts

interface CacheEntry<T> {
  value: T;
  createdAt: number;
  ttl: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private maxSize: number = 50 * 1024 * 1024; // 50MB
  private currentSize: number = 0;

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set<T>(key: string, value: T, ttl: number = 300000): void {
    // 5 min default
    const size = JSON.stringify(value).length;

    // Evict old entries if needed
    if (this.currentSize + size > this.maxSize) {
      this.evictLRU();
    }

    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
      const old = this.cache.get(key);
      if (old) {
        this.currentSize -= JSON.stringify(old.value).length;
      }
    }

    // Add entry
    this.cache.set(key, { value, createdAt: Date.now(), ttl });
    this.currentSize += size;

    // Set expiration
    this.timers.set(
      key,
      setTimeout(() => this.delete(key), ttl)
    );
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.createdAt;
    if (age > entry.ttl) {
      this.delete(key);
      return null;
    }

    return entry.value as T;
  }

  delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= JSON.stringify(entry.value).length;
      this.cache.delete(key);
    }

    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
      this.timers.delete(key);
    }
  }

  clear(): void {
    this.cache.forEach((_, key) => this.delete(key));
  }

  private evictLRU(): void {
    // Find least recently used entry (oldest createdAt)
    let oldest: [string, CacheEntry<any>] | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!oldest || entry.createdAt < oldest[1].createdAt) {
        oldest = [key, entry];
      }
    }

    if (oldest) {
      this.delete(oldest[0]);
    }
  }
}

export const cacheManager = CacheManager.getInstance();
```

### RequestBatcher

```typescript
// File: src/utils/requestBatcher.ts

interface BatchRequest<T> {
  key: string;
  factory: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
  priority: number;
}

export class RequestBatcher {
  private static instance: RequestBatcher;
  private queue: BatchRequest<any>[] = [];
  private debounceTimer: NodeJS.Timeout | null = null;
  private debounceDelay: number = 300; // ms

  static getInstance(): RequestBatcher {
    if (!RequestBatcher.instance) {
      RequestBatcher.instance = new RequestBatcher();
    }
    return RequestBatcher.instance;
  }

  add<T>(
    key: string,
    factory: () => Promise<T>,
    priority: number = 2
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, factory, resolve, reject, priority });
      this.schedule();
    });
  }

  private schedule(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.flush(), this.debounceDelay);
  }

  private async flush(): Promise<void> {
    const batch = this.queue.splice(0);
    if (batch.length === 0) return;

    // Sort by priority (ascending)
    batch.sort((a, b) => a.priority - b.priority);

    // Group by key to deduplicate
    const grouped = new Map<string, BatchRequest<any>>();
    batch.forEach(req => {
      if (!grouped.has(req.key)) {
        grouped.set(req.key, req);
      }
    });

    // Execute all unique requests in parallel
    const requests = Array.from(grouped.values());
    const results = await Promise.allSettled(
      requests.map(req => req.factory())
    );

    // Resolve/reject all promises
    requests.forEach((req, idx) => {
      const result = results[idx];
      if (result.status === 'fulfilled') {
        req.resolve(result.value);
      } else {
        req.reject(result.reason);
      }
    });
  }
}

export const requestBatcher = RequestBatcher.getInstance();
```

---

## Configuration

### File: `src/config/featureFlags.ts`

```typescript
export const featureFlags = {
  api: {
    useDxApi: false, // Start with false in development
    useMockDataAsFallback: true, // Always fallback to mock data
    cacheDuration: 5 * 60 * 1000, // 5 minutes
    dxApiConfig: {
      baseUrl: process.env.REACT_APP_PEGA_BASE_URL || 'http://localhost:8080/api',
      clientId: process.env.REACT_APP_PEGA_CLIENT_ID || '',
      clientSecret: process.env.REACT_APP_PEGA_CLIENT_SECRET || '',
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000, // 1 second
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      batch: {
        batchDelay: 300, // ms
        maxBatchSize: 50
      },
      rateLimit: {
        requestsPerSecond: 10,
        burstSize: 20
      }
    },
    dataPages: {
      ingredientsList: 'D_GetIngredientsForFormulaPanel',
      ingredientDetails: 'D_GetingredientSummary',
      formulasList: 'D_GetFormulasForFormulaPanel',
      formulaDetails: 'D_GetFormulaDetailsForFormulaPanel',
      attributesList: 'D_AttributesList',
      ingredientDataForFormula: 'D_GetIngredientsDataForSelectedFormula'
    }
  },
  developer: {
    enableVerboseLogging: true,
    logApiCalls: true,
    showCacheHits: true
  }
};
```

### Environment Variables

```
# .env.development
REACT_APP_PEGA_BASE_URL=http://localhost:8080/api
REACT_APP_PEGA_CLIENT_ID=dev_client
REACT_APP_PEGA_CLIENT_SECRET=dev_secret
REACT_APP_USE_DX_API=false
REACT_APP_USE_MOCK_DATA_FALLBACK=true

# .env.production
REACT_APP_PEGA_BASE_URL=https://pega.production.com/api
REACT_APP_PEGA_CLIENT_ID=prod_client
REACT_APP_PEGA_CLIENT_SECRET=prod_secret
REACT_APP_USE_DX_API=true
REACT_APP_USE_MOCK_DATA_FALLBACK=true
```

---

## Error Codes

### Error Code Reference

| Code | Category | Severity | Retryable | Description |
|------|----------|----------|-----------|-------------|
| NETWORK_ERROR | Network | High | Yes | No internet connection or network timeout |
| AUTH_FAILED | Authentication | High | Yes | Invalid credentials or expired token |
| AUTH_EXPIRED | Authentication | Medium | Yes | Token expired, will retry with new token |
| RATE_LIMIT | Rate Limiting | Medium | Yes | Too many requests, exponential backoff applied |
| SERVER_ERROR | Server | High | Yes | 5xx error from server |
| BAD_REQUEST | Validation | Medium | No | 400 - Invalid request format |
| NOT_FOUND | Not Found | Medium | No | 404 - Resource not found |
| FORBIDDEN | Authorization | High | No | 403 - Access denied |
| CACHE_MISS | Cache | Low | No | Data not in cache (triggers fetch) |
| PARSE_ERROR | Data | High | No | Failed to parse API response |
| TIMEOUT | Network | High | Yes | Request timeout |
| UNKNOWN | Unknown | High | No | Unknown/unexpected error |

---

## Migration Strategy: Mock → DX API

### Step 1: Development (Current)
```
useDxApi = false
useMockDataAsFallback = true
→ All data from mock data
```

### Step 2: Testing in Local
```
useDxApi = true (pointing to local Pega)
useMockDataAsFallback = true
→ Primary: DX API, Fallback: Mock data
```

### Step 3: Staging
```
useDxApi = true (pointing to staging Pega)
useMockDataAsFallback = true
→ Primary: DX API, Fallback: Mock data
```

### Step 4: Production
```
useDxApi = true (pointing to production Pega)
useMockDataAsFallback = true
→ Primary: DX API, Fallback: Mock data (safety net)
```

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Initial Page Load | < 2s (cached) | Includes all initial data |
| Ingredient List Load | < 1s | First 50 items |
| Details Modal Load | < 500ms | Ingredient/formula details |
| API Response Time | < 200ms | 95th percentile |
| Cache Hit Rate | > 80% | Depends on user patterns |
| Memory Usage | < 50MB | Cache + state |
| Bundle Size | < 500KB | gzipped |

---

## Document Versioning

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 20, 2025 | Initial technical specification |

---

**Document Owner:** Development Team
**Last Updated:** November 20, 2025
**Status:** Ready for Implementation
