/* eslint-disable @typescript-eslint/no-use-before-define */
/**
 * DX API Service
 * 
 * Implementation of Pega DX API integration for the CreateFormulaV2 application.
 * This service handles all communication with Pega Constellation when deployed
 * as an embedded component.
 * 
 * Key Features:
 * - Data Page fetching for ingredients, formulas, and attributes
 * - Case creation and updates for formula management
 * - Batch updates for multiple formulas
 * - Request caching and optimistic updates
 * - Error handling and retry logic
 * - Authentication integration
 * 
 * Integration Points:
 * 1. Ingredients List: Fetched from D_IngredientsList Data Page
 * 2. Formulas List: Fetched from D_FormulasList Data Page
 * 3. Attributes List: Fetched from D_IngredientAttributesList Data Page
 * 4. Formula Operations: Create/Update via Case API
 * 5. Compounding: Submit formula for compounding via Action API
 * 
 * Developer Notes:
 * - Update endpoint configuration in featureFlags.ts
 * - Implement authentication in initializeAuth()
 * - Test each endpoint independently before full integration
 * - Use verbose logging during development
 * - Monitor API performance and adjust caching strategy
 */

import { featureFlags } from '../config/featureFlags';
import type { Ingredient, Formula, IngredientAttribute } from './pega';

// ============================================================================
// TYPES
// ============================================================================

export interface DxApiError {
    message: string;
    code?: string;
    details?: unknown;
    timestamp: Date;
}

export interface DxApiResponse<T> {
    success: boolean;
    data?: T;
    error?: DxApiError;
}

export interface DataPageResponse<T> {
    pxResults: T[];
    pxObjClass?: string;
}

export interface CaseCreationResponse {
    ID: string;
    caseTypeName: string;
    nextAssignmentID?: string;
}

export interface CaseUpdateResponse {
    success: boolean;
    caseID: string;
    etag?: string;
}

export interface BatchUpdateRequest {
    formulaId: string;
    updates: Partial<Formula>;
}

export interface BatchUpdateResponse {
    successful: string[];
    failed: Array<{ formulaId: string; error: string }>;
}

// ============================================================================
// REQUEST CACHE
// ============================================================================

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

class RequestCache {
    private cache = new Map<string, CacheEntry<unknown>>();
    private readonly cacheDuration: number;

    constructor(cacheDuration: number) {
        this.cacheDuration = cacheDuration;
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        if (now - entry.timestamp > this.cacheDuration) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    set<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    clear(pattern?: string): void {
        if (!pattern) {
            this.cache.clear();
            return;
        }

        const keys = Array.from(this.cache.keys());
        keys.forEach(key => {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        });
    }
}

// ============================================================================
// BATCH REQUEST MANAGER
// ============================================================================

class BatchRequestManager {
    private queue: BatchUpdateRequest[] = [];
    private timeoutId: NodeJS.Timeout | null = null;
    private readonly batchDelay: number;
    private readonly maxBatchSize: number;

    constructor(batchDelay: number, maxBatchSize: number) {
        this.batchDelay = batchDelay;
        this.maxBatchSize = maxBatchSize;
    }

    addToQueue(request: BatchUpdateRequest, callback: (response: DxApiResponse<CaseUpdateResponse>) => void): void {
        this.queue.push(request);

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        // Process immediately if we reach max batch size
        if (this.queue.length >= this.maxBatchSize) {
            this.processBatch();
            callback({ success: true, data: { success: true, caseID: request.formulaId } });
            return;
        }

        // Otherwise, wait for more requests
        this.timeoutId = setTimeout(() => {
            this.processBatch();
            callback({ success: true, data: { success: true, caseID: request.formulaId } });
        }, this.batchDelay);
    }

    private processBatch(): void {
        if (this.queue.length === 0) return;

        const batch = this.queue.splice(0, this.maxBatchSize);

        if (featureFlags.developer.enableVerboseLogging) {
            console.log('[DX API] Processing batch update:', {
                count: batch.length,
                formulas: batch.map(r => r.formulaId),
            });
        }

        // Process batch (implementation depends on Pega API capabilities)
        // This would typically be a single API call with multiple updates
        this.executeBatchUpdate(batch);
    }

    private async executeBatchUpdate(batch: BatchUpdateRequest[]): Promise<void> {
        // Implementation will depend on Pega's batch update capabilities
        // For now, we'll process them individually
        for (const request of batch) {
            await DxApiService.updateFormula(request.formulaId, request.updates);
        }
    }
}

// ============================================================================
// DX API SERVICE
// ============================================================================

export class DxApiService {
    private static cache = new RequestCache(featureFlags.api.cacheDuration);
    private static batchManager = new BatchRequestManager(
        featureFlags.api.dxApiConfig.batch.batchDelay,
        featureFlags.api.dxApiConfig.batch.maxBatchSize
    );

    private static authToken: string | null = null;
    private static baseUrl = featureFlags.api.dxApiConfig.baseUrl;

    // ============================================================================
    // AUTHENTICATION
    // ============================================================================

    /**
     * Initialize authentication
     * This should be called when the application starts and obtain auth token
     * 
     * When integrated with Pega Constellation:
     * - The auth token may be provided by the parent frame
     * - Or use Pega's built-in authentication
     * - Or implement OAuth/SAML flow
     */
    static async initializeAuth(): Promise<void> {
        try {
            // TODO: Implement actual authentication
            // For Pega Constellation integration, you might get the token from:
            // 1. Parent window postMessage
            // 2. Pega's authentication context
            // 3. Cookie/session storage

            // Example: Get token from parent frame (if embedded in Pega)
            if (window.parent !== window) {
                // Send authentication request to parent
                window.parent.postMessage({ type: 'REQUEST_AUTH_TOKEN' }, '*');

                // Listen for response
                await new Promise<void>((resolve) => {
                    const handleMessage = (event: MessageEvent) => {
                        if (event.data.type === 'AUTH_TOKEN_RESPONSE') {
                            this.authToken = event.data.token;
                            window.removeEventListener('message', handleMessage);
                            resolve();
                        }
                    };

                    window.addEventListener('message', handleMessage);

                    // Timeout after 5 seconds
                    setTimeout(() => {
                        window.removeEventListener('message', handleMessage);
                        resolve();
                    }, 5000);
                });
            }

            if (featureFlags.developer.enableVerboseLogging) {
                console.log('[DX API] Authentication initialized:', {
                    hasToken: !!this.authToken,
                });
            }
        } catch (error) {
            console.error('[DX API] Authentication failed:', error);
            throw error;
        }
    }

    // ============================================================================
    // HTTP UTILITIES
    // ============================================================================

    private static async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<DxApiResponse<T>> {
        const url = `${this.baseUrl}/${endpoint}`;
        const { timeout, retry } = featureFlags.api.dxApiConfig;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers,
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (featureFlags.developer.enableVerboseLogging) {
                console.log('[DX API] Request successful:', {
                    endpoint,
                    method: options.method || 'GET',
                    status: response.status,
                });
            }

            return { success: true, data };
        } catch (error) {
            clearTimeout(timeoutId);

            // Retry logic
            if (retry.enabled && retry.maxRetries > 0) {
                if (featureFlags.developer.enableVerboseLogging) {
                    console.log('[DX API] Retrying request:', { endpoint, error });
                }

                await new Promise(resolve => setTimeout(resolve, retry.retryDelay));
                return this.makeRequest<T>(endpoint, options);
            }

            const apiError: DxApiError = {
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date(),
                details: error,
            };

            console.error('[DX API] Request failed:', apiError);

            return { success: false, error: apiError };
        }
    }

    // ============================================================================
    // DATA PAGE OPERATIONS
    // ============================================================================

    /**
     * Fetch ingredients from Pega Data Page
     * 
     * Data Page: D_IngredientsList (configured in featureFlags)
     * 
     * Expected Data Structure:
     * {
     *   pxResults: [
     *     {
     *       IngredientID: string,
     *       Name: string,
     *       Code: string,
     *       Price: number,
     *       Type: string,
     *       Category: string,
     *       Supplier: string,
     *       Status: string,
     *       MAC: number,
     *       ...
     *     }
     *   ]
     * }
     */
    static async getIngredients(filters?: Record<string, unknown>): Promise<DxApiResponse<Ingredient[]>> {
        const cacheKey = `ingredients:${JSON.stringify(filters || {})}`;

        // Check cache
        if (featureFlags.api.enableCaching) {
            const cached = this.cache.get<Ingredient[]>(cacheKey);
            if (cached) {
                if (featureFlags.developer.enableVerboseLogging) {
                    console.log('[DX API] Cache hit:', cacheKey);
                }
                return { success: true, data: cached };
            }
        }

        const endpoint = `data/${featureFlags.api.dxApiConfig.endpoints.ingredientsDataPage}`;
        const queryParams = filters ? `?${new URLSearchParams(filters as Record<string, string>).toString()}` : '';

        const response = await this.makeRequest<DataPageResponse<unknown>>(`${endpoint}${queryParams}`);

        if (response.success && response.data) {
            // Transform Pega data structure to app data structure
            const ingredients = this.transformIngredientsData(response.data.pxResults);

            // Cache the result
            if (featureFlags.api.enableCaching) {
                this.cache.set(cacheKey, ingredients);
            }

            return { success: true, data: ingredients };
        }

        return { success: false, error: response.error };
    }

    /**
     * Fetch formulas from Pega Data Page
     * 
     * Data Page: D_FormulasList (configured in featureFlags)
     */
    static async getFormulas(filters?: Record<string, unknown>): Promise<DxApiResponse<Formula[]>> {
        const cacheKey = `formulas:${JSON.stringify(filters || {})}`;

        if (featureFlags.api.enableCaching) {
            const cached = this.cache.get<Formula[]>(cacheKey);
            if (cached) {
                return { success: true, data: cached };
            }
        }

        const endpoint = `data/${featureFlags.api.dxApiConfig.endpoints.formulasDataPage}`;
        const queryParams = filters ? `?${new URLSearchParams(filters as Record<string, string>).toString()}` : '';

        const response = await this.makeRequest<DataPageResponse<unknown>>(`${endpoint}${queryParams}`);

        if (response.success && response.data) {
            const formulas = this.transformFormulasData(response.data.pxResults);

            if (featureFlags.api.enableCaching) {
                this.cache.set(cacheKey, formulas);
            }

            return { success: true, data: formulas };
        }

        return { success: false, error: response.error };
    }

    /**
     * Fetch ingredient attributes from Pega Data Page
     * 
     * Data Page: D_IngredientAttributesList (configured in featureFlags)
     */
    static async getIngredientAttributes(): Promise<DxApiResponse<IngredientAttribute[]>> {
        const cacheKey = 'attributes';

        if (featureFlags.api.enableCaching) {
            const cached = this.cache.get<IngredientAttribute[]>(cacheKey);
            if (cached) {
                return { success: true, data: cached };
            }
        }

        const endpoint = `data/${featureFlags.api.dxApiConfig.endpoints.attributesDataPage}`;

        const response = await this.makeRequest<DataPageResponse<unknown>>(endpoint);

        if (response.success && response.data) {
            const attributes = this.transformAttributesData(response.data.pxResults);

            if (featureFlags.api.enableCaching) {
                this.cache.set(cacheKey, attributes);
            }

            return { success: true, data: attributes };
        }

        return { success: false, error: response.error };
    }

    // ============================================================================
    // CASE OPERATIONS
    // ============================================================================

    /**
     * Create a new formula in Pega
     * Creates a new case of type configured in featureFlags
     * 
     * Case Type: FragranceLab-Work-Formula (configured in featureFlags)
     * Action: CreateFormula
     * 
     * Request Body:
     * {
     *   caseTypeID: "FragranceLab-Work-Formula",
     *   content: {
     *     FormulaName: string,
     *     Version: string,
     *     Category: string,
     *     Ingredients: [...],
     *     ...
     *   }
     * }
     */
    static async createFormula(formula: Omit<Formula, 'id'>): Promise<DxApiResponse<Formula>> {
        const endpoint = `cases`;

        const payload = {
            caseTypeID: featureFlags.api.dxApiConfig.endpoints.formulaCaseType,
            content: this.transformFormulaToCreate(formula),
        };

        const response = await this.makeRequest<CaseCreationResponse>(endpoint, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        if (response.success && response.data) {
            // Clear formulas cache
            this.cache.clear('formulas');

            // Return the created formula with the new case ID
            const createdFormula: Formula = {
                ...formula,
                id: response.data.ID,
            };

            return { success: true, data: createdFormula };
        }

        return { success: false, error: response.error };
    }

    /**
     * Update an existing formula in Pega
     * Updates a case via the Case API
     * 
     * PUT /cases/{caseID}
     * Action: UpdateFormula
     */
    static async updateFormula(
        id: string,
        updates: Partial<Formula>
    ): Promise<DxApiResponse<CaseUpdateResponse>> {
        // If batch updates are enabled, queue the request
        if (featureFlags.api.enableBatchRequests) {
            return new Promise((resolve) => {
                this.batchManager.addToQueue({ formulaId: id, updates }, resolve);
            });
        }

        // Otherwise, process immediately
        return this.executeFormulaUpdate(id, updates);
    }

    private static async executeFormulaUpdate(
        id: string,
        updates: Partial<Formula>
    ): Promise<DxApiResponse<CaseUpdateResponse>> {
        const endpoint = `cases/${id}`;

        const payload = {
            content: this.transformFormulaToUpdate(updates),
        };

        const response = await this.makeRequest<CaseUpdateResponse>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        if (response.success) {
            // Clear formulas cache
            this.cache.clear('formulas');
            this.cache.clear(`formula:${id}`);
        }

        return response;
    }

    /**
     * Submit formula for compounding
     * Executes a Pega action on the formula case
     * 
     * POST /cases/{caseID}/actions/{actionID}
     * Action: SubmitForCompounding
     */
    static async submitForCompounding(formulaId: string): Promise<DxApiResponse<unknown>> {
        const endpoint = `cases/${formulaId}/actions/${featureFlags.api.dxApiConfig.endpoints.submitForCompoundingAction}`;

        const response = await this.makeRequest(endpoint, {
            method: 'POST',
        });

        if (response.success) {
            // Clear formulas cache to reflect updated status
            this.cache.clear('formulas');
            this.cache.clear(`formula:${formulaId}`);
        }

        return response;
    }

    /**
     * Validate formula
     * Executes validation action on the formula case
     * 
     * POST /cases/{caseID}/actions/{actionID}
     * Action: ValidateFormula
     */
    static async validateFormula(formulaId: string): Promise<DxApiResponse<unknown>> {
        const endpoint = `cases/${formulaId}/actions/${featureFlags.api.dxApiConfig.endpoints.validateFormulaAction}`;

        return this.makeRequest(endpoint, {
            method: 'POST',
        });
    }

    // ============================================================================
    // DATA TRANSFORMATION
    // ============================================================================

    /**
     * Transform Pega ingredient data to app data structure
     * 
     * Maps Pega property names to app property names
     */
    private static transformIngredientsData(pegaData: unknown[]): Ingredient[] {
        return pegaData.map((item: Record<string, unknown>) => ({
            id: item.IngredientID as string || item.pyGUID as string,
            name: item.Name as string,
            code: item.Code as string,
            price: Number(item.Price) || 0,
            unit: (item.Unit as string) || 'kg',
            type: (item.Type as string)?.toLowerCase() as 'natural' | 'synthetic' | 'base',
            category: item.Category as string,
            supplier: item.Supplier as string,
            status: (item.Status as string)?.toLowerCase() as 'active' | 'inactive' | 'palette' | 'analytical' | 'sers_review',
            mac: Number(item.MAC) || 0,
            odorProfile: item.OdorProfile as string,
            volatility: item.Volatility as string,
            allergens: (item.Allergens as string)?.split(',').map(a => a.trim()) || [],
            ifraCategory: item.IFRACategory as string,
            casNumber: item.CASNumber as string,
            einecs: item.EINECS as string,
            fema: item.FEMA as string,
            description: item.Description as string,
        }));
    }

    /**
     * Transform Pega formula data to app data structure
     */
    private static transformFormulasData(pegaData: unknown[]): Formula[] {
        return pegaData.map((item: Record<string, unknown>) => ({
            id: item.FormulaID as string || item.pyGUID as string,
            name: item.Name as string,
            version: item.Version as string,
            status: (item.Status as string)?.toLowerCase() as 'draft' | 'active' | 'archived',
            createdBy: item.CreatedBy as string,
            lastUpdated: item.LastUpdated as string,
            category: item.Category as string,
            projectName: item.ProjectName as string,
            projectId: item.ProjectID as string,
            totalPercentage: Number(item.TotalPercentage) || 0,
            costPerKg: Number(item.CostPerKg) || 0,
            ingredients: Array.isArray(item.Ingredients)
                ? (item.Ingredients as unknown[]).map((ing: Record<string, unknown>) => ({
                    ingredientId: ing.IngredientID as string,
                    name: ing.Name as string,
                    percentage: Number(ing.Percentage) || 0,
                    type: ing.Type as string,
                    notes: ing.Notes as string,
                }))
                : [],
            notes: {
                top: Array.isArray(item.TopNotes) ? item.TopNotes as string[] : [],
                middle: Array.isArray(item.MiddleNotes) ? item.MiddleNotes as string[] : [],
                base: Array.isArray(item.BaseNotes) ? item.BaseNotes as string[] : [],
            },
            description: item.Description as string,
        }));
    }

    /**
     * Transform Pega attribute data to app data structure
     */
    private static transformAttributesData(pegaData: unknown[]): IngredientAttribute[] {
        return pegaData.map((item: Record<string, unknown>) => ({
            id: item.AttributeID as string || item.pyGUID as string,
            name: item.Name as string,
            type: (item.Type as string)?.toLowerCase() as 'text' | 'number' | 'boolean' | 'select',
            description: item.Description as string,
            category: item.Category as string,
            isRequired: Boolean(item.IsRequired),
            values: Array.isArray(item.Values) ? item.Values as string[] : undefined,
            unit: item.Unit as string,
            min: item.Min as number,
            max: item.Max as number,
            maxLength: item.MaxLength as number,
            examples: Array.isArray(item.Examples) ? item.Examples as string[] : undefined,
        }));
    }

    /**
     * Transform app formula data to Pega create payload
     */
    private static transformFormulaToCreate(formula: Omit<Formula, 'id'>): Record<string, unknown> {
        return {
            Name: formula.name,
            Version: formula.version,
            Status: formula.status,
            Category: formula.category,
            ProjectName: formula.projectName,
            ProjectID: formula.projectId,
            TotalPercentage: formula.totalPercentage,
            Ingredients: formula.ingredients.map(ing => ({
                IngredientID: ing.ingredientId,
                Name: ing.name,
                Percentage: ing.percentage,
                Type: ing.type,
                Notes: ing.notes,
            })),
            TopNotes: formula.notes.top,
            MiddleNotes: formula.notes.middle,
            BaseNotes: formula.notes.base,
            Description: formula.description,
        };
    }

    /**
     * Transform app formula updates to Pega update payload
     */
    private static transformFormulaToUpdate(updates: Partial<Formula>): Record<string, unknown> {
        const payload: Record<string, unknown> = {};

        if (updates.name) payload.Name = updates.name;
        if (updates.version) payload.Version = updates.version;
        if (updates.status) payload.Status = updates.status;
        if (updates.category) payload.Category = updates.category;
        if (updates.totalPercentage !== undefined) payload.TotalPercentage = updates.totalPercentage;
        if (updates.ingredients) {
            payload.Ingredients = updates.ingredients.map(ing => ({
                IngredientID: ing.ingredientId,
                Name: ing.name,
                Percentage: ing.percentage,
                Type: ing.type,
                Notes: ing.notes,
            }));
        }
        if (updates.notes) {
            payload.TopNotes = updates.notes.top;
            payload.MiddleNotes = updates.notes.middle;
            payload.BaseNotes = updates.notes.base;
        }
        if (updates.description) payload.Description = updates.description;

        return payload;
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    /**
     * Clear all cached data
     */
    static clearCache(): void {
        this.cache.clear();

        if (featureFlags.developer.enableVerboseLogging) {
            console.log('[DX API] Cache cleared');
        }
    }

    /**
     * Get current authentication status
     */
    static isAuthenticated(): boolean {
        return !!this.authToken;
    }

    /**
     * Set base URL (useful for testing)
     */
    static setBaseUrl(url: string): void {
        this.baseUrl = url;
    }
}

// Initialize authentication on module load
if (featureFlags.api.useDxApi) {
    DxApiService.initializeAuth().catch(error => {
        console.error('[DX API] Failed to initialize authentication:', error);
    });
}

export default DxApiService;
