/**
 * DxApiService - Pega Constellation DX API Integration
 * 
 * Handles all communication with Pega DX API including:
 * - Authentication and token refresh
 * - Request retries with exponential backoff
 * - Response caching
 * - Error handling with fallback to mock data
 * - Request deduplication and batching
 * 
 * @see docs/TECHNICAL_SPECIFICATION.md for architecture details
 * @see docs/DX_API_IMPLEMENTATION_CHECKLIST.md for implementation tasks
 */

import { featureFlags } from '@/config/featureFlags';
import { cacheManager } from '@/utils/cacheManager';
import { requestBatcher } from '@/utils/requestBatcher';
import {
    DxApiError,
    HttpError,
    ErrorCodes,
    httpStatusToErrorCode,
    isRetryable
} from '@/services/errors';
import type {
    CreateFormulaPayload,
    CreateFormulaResponse,
    CreateFormulaVersionPayload,
    CreateFormulaVersionResponse,
    ShareFormulaPayload,
    ShareFormulaResponse,
    CreateAnalyticalFormulaPayload,
    CreateAnalyticalFormulaResponse,
    CheckDuplicateSampleIDResponse,
} from '@/types/formula.creation.types';

export interface DxApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    metadata?: {
        requestId: string;
        timestamp: Date;
        cacheHit: boolean;
        responseTime: number;
    };
}

export class DxApiService {
    private static authToken: string | null = null;

    private static authExpiry: Date | null = null;

    private static refreshPromise: Promise<string> | null = null;

    private static requestIdCounter = 0;

    /**
     * Initialize authentication for DX API
     */
    static async initializeAuth(): Promise<void> {
        if (this.isAuthValid()) return;

        try {
            const token = await this.getAuthToken();
            this.authToken = token;
            this.authExpiry = new Date(Date.now() + 3600000); // 1 hour
            // eslint-disable-next-line no-console
            console.log('[DxApi] Authentication initialized successfully');
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[DxApi] Authentication failed:', error);
            throw new DxApiError(
                ErrorCodes.AUTH_FAILED,
                'Failed to authenticate with Pega DX API',
                error,
                0
            );
        }
    }

    /**
     * Get ingredients list with pagination
     */
    static async getIngredients(filters?: {
        skip?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<DxApiResponse<unknown[]>> {
        const { skip = 0, limit = 50 } = filters || {};

        return this.executeRequest<unknown[]>(
            `${featureFlags.api.dxApiConfig.baseUrl}/data-pages/${featureFlags.api.dataPages.ingredientsList}`,
            {
                method: 'POST',
                body: JSON.stringify({
                    skip,
                    limit,
                    search: filters?.search,
                    status: filters?.status
                })
            }
        );
    }

    /**
     * Get detailed ingredient information
     */
    static async getIngredientDetails(
        ingredientId: string,
        version?: string
    ): Promise<DxApiResponse<unknown>> {
        const params = new URLSearchParams({
            ingredientId,
            ...(version && { version })
        });

        return this.executeRequest<unknown>(
            `${featureFlags.api.dxApiConfig.baseUrl}/data-pages/${featureFlags.api.dataPages.ingredientDetails}?${params}`,
            { method: 'GET' }
        );
    }

    /**
     * Get formulas list
     */
    static async getFormulas(filters?: {
        skip?: number;
        limit?: number;
        search?: string;
        status?: string;
        projectId?: string;
    }): Promise<DxApiResponse<unknown[]>> {
        const { skip = 0, limit = 50 } = filters || {};

        return this.executeRequest<unknown[]>(
            `${featureFlags.api.dxApiConfig.baseUrl}/data-pages/${featureFlags.api.dataPages.formulasList}`,
            {
                method: 'POST',
                body: JSON.stringify({
                    skip,
                    limit,
                    search: filters?.search,
                    status: filters?.status,
                    projectId: filters?.projectId
                })
            }
        );
    }

    /**
     * Get detailed formula information
     */
    static async getFormulaDetails(
        formulaId: string,
        version?: string
    ): Promise<DxApiResponse<unknown>> {
        const params = new URLSearchParams({
            formulaId,
            ...(version && { version })
        });

        return this.executeRequest<unknown>(
            `${featureFlags.api.dxApiConfig.baseUrl}/data-pages/${featureFlags.api.dataPages.formulaDetails}?${params}`,
            { method: 'GET' }
        );
    }

    /**
     * Get ingredient attributes
     */
    static async getIngredientAttributes(): Promise<
        DxApiResponse<unknown[]>
    > {
        return this.executeRequest<unknown[]>(
            `${featureFlags.api.dxApiConfig.baseUrl}/data-pages/${featureFlags.api.dataPages.attributesList}`,
            { method: 'GET' }
        );
    }

    /**
     * Check formula compliance
     */
    static async checkCompliance(
        formulaId: string,
        formulaData: unknown
    ): Promise<DxApiResponse<unknown>> {
        return this.executeRequest<unknown>(
            `${featureFlags.api.dxApiConfig.baseUrl}/case-types/${featureFlags.api.dxApiConfig.endpoints.formulaCaseType}/actions/CheckCompliance`,
            {
                method: 'POST',
                body: JSON.stringify({ formulaId, formulaData })
            }
        );
    }

    /**
     * Submit formula for compounding
     */
    static async submitForCompounding(
        formulaId: string,
        formulaData: unknown,
        priority: string = 'normal'
    ): Promise<DxApiResponse<unknown>> {
        return this.executeRequest<unknown>(
            `${featureFlags.api.dxApiConfig.baseUrl}/case-types/${featureFlags.api.dxApiConfig.endpoints.formulaCaseType}/actions/SubmitForCompounding`,
            {
                method: 'POST',
                body: JSON.stringify({ formulaId, formulaData, priority })
            }
        );
    }

    /**
     * Save workspace data
     */
    static async saveWorkspace(data: unknown): Promise<DxApiResponse<unknown>> {
        return this.executeRequest<unknown>(
            `${featureFlags.api.dxApiConfig.baseUrl}/case-types/${featureFlags.api.dxApiConfig.endpoints.formulaCaseType}/save-workspace`,
            {
                method: 'POST',
                body: JSON.stringify(data)
            }
        );
    }

    /**
     * Load workspace data
     */
    static async loadWorkspace(workspaceId: string): Promise<DxApiResponse<unknown>> {
        return this.executeRequest<unknown>(
            `${featureFlags.api.dxApiConfig.baseUrl}/case-types/${featureFlags.api.dxApiConfig.endpoints.formulaCaseType}/load-workspace?id=${workspaceId}`,
            { method: 'GET' }
        );
    }

    /**
     * Create new formula
     * POST to D_CreateFormula data page
     * 
     * User Stories: US #1108, US #1137
     * Status always set to DRAFT on creation
     * Returns FormulaID for use in subsequent operations (versioning, sharing)
     */
    static async createFormula(
        payload: CreateFormulaPayload
    ): Promise<DxApiResponse<CreateFormulaResponse['data']>> {
        try {
            return await this.executeRequest<CreateFormulaResponse['data']>(
                `${featureFlags.api.dxApiConfig.baseUrl}/data-pages/${featureFlags.api.dataPages.createFormula}`,
                {
                    method: 'POST',
                    body: JSON.stringify(payload)
                }
            );
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[DxApi] Create formula failed:', error);
            throw new DxApiError(
                ErrorCodes.REQUEST_FAILED,
                'Failed to create formula',
                error,
                0
            );
        }
    }

    /**
     * Create formula version
     * POST to D_CreateFormulaVersion data page
     * 
     * Must be called after createFormula to link version to formula
     * FormulaID is obtained from createFormula response
     */
    static async createFormulaVersion(
        payload: CreateFormulaVersionPayload
    ): Promise<DxApiResponse<CreateFormulaVersionResponse['data']>> {
        try {
            return await this.executeRequest<CreateFormulaVersionResponse['data']>(
                `${featureFlags.api.dxApiConfig.baseUrl}/data-pages/${featureFlags.api.dataPages.createFormulaVersion}`,
                {
                    method: 'POST',
                    body: JSON.stringify(payload)
                }
            );
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[DxApi] Create formula version failed:', error);
            throw new DxApiError(
                ErrorCodes.REQUEST_FAILED,
                'Failed to create formula version',
                error,
                0
            );
        }
    }

    /**
     * Share formula with another user or group
     * POST to D_ShareFormula data page
     * 
     * Allows sharing formulas with team members
     * Permission level (View/Edit) determines access rights
     */
    static async shareFormula(
        payload: ShareFormulaPayload
    ): Promise<DxApiResponse<ShareFormulaResponse['data']>> {
        try {
            return await this.executeRequest<ShareFormulaResponse['data']>(
                `${featureFlags.api.dxApiConfig.baseUrl}/data-pages/${featureFlags.api.dataPages.shareFormula}`,
                {
                    method: 'POST',
                    body: JSON.stringify(payload)
                }
            );
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[DxApi] Share formula failed:', error);
            throw new DxApiError(
                ErrorCodes.REQUEST_FAILED,
                'Failed to share formula',
                error,
                0
            );
        }
    }

    /**
     * Create analytical formula
     * POST to D_CreateAnalyticalFormula data page
     * 
     * User Story: US #1137
     * IMPORTANT: Call checkDuplicateSampleId BEFORE calling this method
     * Sample ID must be unique and verified first
     */
    static async createAnalyticalFormula(
        payload: CreateAnalyticalFormulaPayload
    ): Promise<DxApiResponse<CreateAnalyticalFormulaResponse['data']>> {
        try {
            return await this.executeRequest<CreateAnalyticalFormulaResponse['data']>(
                `${featureFlags.api.dxApiConfig.baseUrl}/data-pages/${featureFlags.api.dataPages.createAnalyticalFormula}`,
                {
                    method: 'POST',
                    body: JSON.stringify(payload)
                }
            );
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[DxApi] Create analytical formula failed:', error);
            throw new DxApiError(
                ErrorCodes.REQUEST_FAILED,
                'Failed to create analytical formula',
                error,
                0
            );
        }
    }

    /**
     * Check if Sample ID already exists
     * GET from D_CheckSampleIDExists data page
     * 
     * Used to validate Sample ID uniqueness before creating analytical formula
     * Must be called BEFORE createAnalyticalFormula
     * Returns true if Sample ID already exists, false if available
     */
    static async checkDuplicateSampleId(
        sampleId: string
    ): Promise<DxApiResponse<CheckDuplicateSampleIDResponse['data']>> {
        const params = new URLSearchParams({ SampleID: sampleId });

        try {
            return await this.executeRequest<CheckDuplicateSampleIDResponse['data']>(
                `${featureFlags.api.dxApiConfig.baseUrl}/data-pages/${featureFlags.api.dataPages.checkSampleIDExists}?${params}`,
                { method: 'GET' }
            );
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[DxApi] Check duplicate Sample ID failed:', error);
            throw new DxApiError(
                ErrorCodes.REQUEST_FAILED,
                'Failed to check Sample ID uniqueness',
                error,
                0
            );
        }
    }

    /**
     * Execute HTTP request with retry, caching, and error handling
     * @private
     */
    private static async executeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<DxApiResponse<T>> {
        const config = featureFlags.api.dxApiConfig;
        const cacheKey = this.generateCacheKey(endpoint, options);
        const requestId = this.generateRequestId();
        const startTime = Date.now();

        // Check cache first
        const cachedData = cacheManager.get<T>(cacheKey);
        if (cachedData) {
            return {
                success: true,
                data: cachedData,
                metadata: {
                    requestId,
                    timestamp: new Date(),
                    cacheHit: true,
                    responseTime: 0
                }
            };
        }

        let lastError: Error | null = null;

        // Retry loop with exponential backoff
        for (let attempt = 1; attempt <= config.retry.maxRetries; attempt += 1) {
            try {
                const token = await this.getAuthToken();

                const response = await fetch(endpoint, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'X-Request-ID': requestId
                    }
                });

                if (!response.ok) {
                    throw new HttpError(response.status, response.statusText);
                }

                const responseData = await response.json();
                const transformed = this.transformResponse<T>(responseData);
                const responseTime = Date.now() - startTime;

                // Cache successful response
                if (featureFlags.api.enableCaching) {
                    cacheManager.set(
                        cacheKey,
                        transformed,
                        featureFlags.api.cacheDuration
                    );
                }

                return {
                    success: true,
                    data: transformed,
                    metadata: {
                        requestId,
                        timestamp: new Date(),
                        cacheHit: false,
                        responseTime
                    }
                };
            } catch (error) {
                lastError = error as Error;

                if (!isRetryable(error) || attempt === config.retry.maxRetries) {
                    break;
                }

                // Exponential backoff
                const delay = config.retry.retryDelay * Math.pow(2, attempt - 1);
                await new Promise((resolve) => {
                    setTimeout(resolve, delay);
                });
            }
        }

        // All retries exhausted
        return {
            success: false,
            error: {
                code: ErrorCodes.REQUEST_FAILED,
                message: 'All retry attempts failed',
                details: lastError?.message
            }
        };
    }

    /**
     * Check if current authentication is still valid
     * @private
     */
    private static isAuthValid(): boolean {
        return (
            this.authToken !== null &&
            this.authExpiry !== null &&
            this.authExpiry > new Date()
        );
    }

    /**
     * Get auth token with double-checked locking
     * @private
     */
    private static async getAuthToken(): Promise<string> {
        // Fast path: token is still valid
        if (this.isAuthValid() && this.authToken) {
            return this.authToken;
        }

        // Slow path: need to refresh
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = this.performTokenRefresh();
        try {
            return await this.refreshPromise;
        } finally {
            this.refreshPromise = null;
        }
    }

    /**
     * Perform actual token refresh from Pega
     * @private
     */
    private static async performTokenRefresh(): Promise<string> {
        const config = featureFlags.api.dxApiConfig;

        // Mock implementation - replace with actual Pega auth endpoint
        // In real Pega integration, this would call Pega's OAuth endpoint
        const response = await fetch(`${config.baseUrl}/oauth2/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: 'your-client-id',
                client_secret: 'your-client-secret'
            })
        });

        if (!response.ok) {
            throw new Error(`Token refresh failed: ${response.statusText}`);
        }

        const data = (await response.json()) as { access_token: string };
        return data.access_token;
    }

    /**
     * Transform Pega response to remove Pega-specific fields
     * @private
     */
    private static transformResponse<T>(pegaData: unknown): T {
        if (Array.isArray(pegaData)) {
            return pegaData.map((item) => this.transformItem(item)) as T;
        }

        return this.transformItem(pegaData) as T;
    }

    /**
     * Remove Pega-specific fields from response item
     * @private
     */
    private static transformItem(item: unknown): unknown {
        if (typeof item !== 'object' || item === null) {
            return item;
        }

        const cleaned: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(item)) {
            // Skip Pega internal fields
            if (!key.startsWith('px') &&
                !key.startsWith('py') &&
                !key.startsWith('pz') &&
                !key.startsWith('__')) {
                cleaned[key] = value;
            }
        }

        return cleaned;
    }

    /**
     * Generate cache key from endpoint and options
     * @private
     */
    private static generateCacheKey(endpoint: string, options: RequestInit): string {
        const body = options.body ? JSON.stringify(options.body) : '';
        return `dx-api:${endpoint}:${body}`;
    }

    /**
     * Generate unique request ID for tracing
     * @private
     */
    private static generateRequestId(): string {
        this.requestIdCounter += 1;
        return `req-${Date.now()}-${this.requestIdCounter}`;
    }
}

export default DxApiService;
