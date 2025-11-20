/**
 * API Service Abstraction Layer
 * 
 * This service provides a unified interface for data fetching and manipulation.
 * It automatically switches between Mock data and DX API based on feature flags.
 * 
 * Usage:
 * - Import ApiService (not PegaService or DxApiService directly)
 * - ApiService will route requests to the appropriate backend
 * - Switch between modes by changing featureFlags.api.useDxApi
 * 
 * Example:
 * ```typescript
 * import { ApiService } from './services/api';
 * 
 * // This will use either mock data or DX API depending on configuration
 * const ingredients = await ApiService.getIngredients();
 * const formulas = await ApiService.getFormulas();
 * ```
 */

import { featureFlags } from '../config/featureFlags';
import { DxApiService, type DxApiResponse } from './dxApi';
import { PegaService } from './pega';
import type { Ingredient, Formula, IngredientAttribute } from './pega';

// ============================================================================
// TYPES
// ============================================================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: unknown;
    };
}

// ============================================================================
// API SERVICE ABSTRACTION
// ============================================================================

export class ApiService {
    /**
     * Get the current API mode
     */
    static getApiMode(): 'mock' | 'dx-api' {
        return featureFlags.api.useDxApi ? 'dx-api' : 'mock';
    }

    /**
     * Check if using DX API
     */
    static isUsingDxApi(): boolean {
        return featureFlags.api.useDxApi;
    }

    /**
     * Check if using Mock data
     */
    static isUsingMockData(): boolean {
        return !featureFlags.api.useDxApi;
    }

    // ============================================================================
    // INGREDIENTS
    // ============================================================================

    /**
     * Get all ingredients
     * Routes to either mock data or DX API based on feature flags
     */
    static async getIngredients(filters?: Record<string, unknown>): Promise<ApiResponse<Ingredient[]>> {
        try {
            if (this.isUsingDxApi()) {
                const response = await DxApiService.getIngredients(filters);
                return this.mapDxApiResponse(response);
            } else {
                const ingredients = await PegaService.getIngredients(filters);
                return { success: true, data: ingredients };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Search ingredients by query
     */
    static async searchIngredients(query: string, type?: string): Promise<ApiResponse<Ingredient[]>> {
        try {
            if (this.isUsingDxApi()) {
                // DX API: Use filters
                const filters: Record<string, unknown> = {};
                if (query) filters.search = query;
                if (type) filters.type = type;

                const response = await DxApiService.getIngredients(filters);
                return this.mapDxApiResponse(response);
            } else {
                // Mock data: Use search method
                const ingredients = await PegaService.searchIngredients(query, type);
                return { success: true, data: ingredients };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    // ============================================================================
    // FORMULAS
    // ============================================================================

    /**
     * Get all formulas
     */
    static async getFormulas(filters?: Record<string, unknown>): Promise<ApiResponse<Formula[]>> {
        try {
            if (this.isUsingDxApi()) {
                const response = await DxApiService.getFormulas(filters);
                return this.mapDxApiResponse(response);
            } else {
                const formulas = await PegaService.getFormulas(filters);
                return { success: true, data: formulas };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Search formulas by query
     */
    static async searchFormulas(query: string, filters?: Record<string, unknown>): Promise<ApiResponse<Formula[]>> {
        try {
            if (this.isUsingDxApi()) {
                const searchFilters = { ...filters, search: query };
                const response = await DxApiService.getFormulas(searchFilters);
                return this.mapDxApiResponse(response);
            } else {
                const formulas = await PegaService.searchFormulas(query, filters);
                return { success: true, data: formulas };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Create a new formula
     */
    static async createFormula(formula: Omit<Formula, 'id'>): Promise<ApiResponse<Formula>> {
        try {
            if (this.isUsingDxApi()) {
                const response = await DxApiService.createFormula(formula);
                return this.mapDxApiResponse(response);
            } else {
                const createdFormula = await PegaService.createFormula(formula);
                return { success: true, data: createdFormula };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Update an existing formula
     */
    static async updateFormula(id: string, updates: Partial<Formula>): Promise<ApiResponse<Formula | { success: boolean; caseID: string }>> {
        try {
            if (this.isUsingDxApi()) {
                const response = await DxApiService.updateFormula(id, updates);

                if (response.success && response.data) {
                    // DX API returns case update response
                    return {
                        success: true,
                        data: {
                            success: response.data.success,
                            caseID: response.data.caseID
                        }
                    };
                }

                return { success: false, error: response.error };
            } else {
                const updatedFormula = await PegaService.updateFormula(id, updates);
                return { success: true, data: updatedFormula };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Submit formula for compounding
     */
    static async submitForCompounding(formulaId: string): Promise<ApiResponse<unknown>> {
        try {
            if (this.isUsingDxApi()) {
                const response = await DxApiService.submitForCompounding(formulaId);
                return this.mapDxApiResponse(response);
            } else {
                // Mock implementation - just log for now
                console.log('[Mock API] Formula submitted for compounding:', formulaId);
                return {
                    success: true,
                    data: {
                        message: 'Formula submitted successfully (mock)',
                        formulaId
                    }
                };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Validate formula
     */
    static async validateFormula(formulaId: string): Promise<ApiResponse<unknown>> {
        try {
            if (this.isUsingDxApi()) {
                const response = await DxApiService.validateFormula(formulaId);
                return this.mapDxApiResponse(response);
            } else {
                // Mock implementation
                console.log('[Mock API] Formula validated:', formulaId);
                return {
                    success: true,
                    data: {
                        isValid: true,
                        errors: [],
                        warnings: [],
                    }
                };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    // ============================================================================
    // ATTRIBUTES
    // ============================================================================

    /**
     * Get ingredient attributes
     */
    static async getIngredientAttributes(): Promise<ApiResponse<IngredientAttribute[]>> {
        try {
            if (this.isUsingDxApi()) {
                const response = await DxApiService.getIngredientAttributes();
                return this.mapDxApiResponse(response);
            } else {
                const attributes = await PegaService.getIngredientAttributes();
                return { success: true, data: attributes };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Search attributes by query
     */
    static async searchAttributes(query: string, filters?: Record<string, unknown>): Promise<ApiResponse<IngredientAttribute[]>> {
        try {
            if (this.isUsingDxApi()) {
                // DX API doesn't have a specific search attributes endpoint
                // Get all and filter client-side
                const response = await DxApiService.getIngredientAttributes();

                if (response.success && response.data) {
                    const filtered = response.data.filter(attr =>
                        attr.name.toLowerCase().includes(query.toLowerCase()) ||
                        attr.description?.toLowerCase().includes(query.toLowerCase())
                    );
                    return { success: true, data: filtered };
                }

                return { success: false, error: response.error };
            } else {
                const attributes = await PegaService.searchAttributes(query, filters);
                return { success: true, data: attributes };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    // ============================================================================
    // PROJECTS
    // ============================================================================

    /**
     * Get a specific project by ID
     */
    static async getProject(projectId: string): Promise<ApiResponse<Project | null>> {
        try {
            if (this.isUsingDxApi()) {
                const response = await DxApiService.getProject?.(projectId);
                return response ? this.mapDxApiResponse(response) : { success: true, data: null };
            } else {
                const project = await PegaService.getProject(projectId);
                return { success: true, data: project };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Search projects by query
     */
    static async searchProjects(query: string): Promise<ApiResponse<Project[]>> {
        try {
            if (this.isUsingDxApi()) {
                const response = await DxApiService.searchProjects?.(query);
                return response ? this.mapDxApiResponse(response) : { success: true, data: [] };
            } else {
                const projects = await PegaService.searchProjects(query);
                return { success: true, data: projects };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    /**
     * Clear API cache (only applicable for DX API)
     */
    static clearCache(): void {
        if (this.isUsingDxApi()) {
            DxApiService.clearCache();
        }
    }

    /**
     * Check authentication status (only applicable for DX API)
     */
    static isAuthenticated(): boolean {
        if (this.isUsingDxApi()) {
            return DxApiService.isAuthenticated();
        }
        return true; // Mock data doesn't require authentication
    }

    /**
     * Initialize authentication (only applicable for DX API)
     */
    static async initializeAuth(): Promise<void> {
        if (this.isUsingDxApi()) {
            await DxApiService.initializeAuth();
        }
    }

    /**
     * Log API information for debugging
     */
    static logApiInfo(): void {
        const mode = this.getApiMode();
        console.log('[API Service] Current mode:', mode);

        if (this.isUsingDxApi()) {
            console.log('[API Service] DX API configuration:', {
                baseUrl: featureFlags.api.dxApiConfig.baseUrl,
                authenticated: DxApiService.isAuthenticated(),
                cachingEnabled: featureFlags.api.enableCaching,
                batchingEnabled: featureFlags.api.enableBatchRequests,
            });
        } else {
            console.log('[API Service] Using mock data');
        }
    }

    // ============================================================================
    // PRIVATE HELPER METHODS
    // ============================================================================

    /**
     * Map DX API response to generic API response
     */
    private static mapDxApiResponse<T>(dxResponse: DxApiResponse<T>): ApiResponse<T> {
        return {
            success: dxResponse.success,
            data: dxResponse.data,
            error: dxResponse.error ? {
                message: dxResponse.error.message,
                code: dxResponse.error.code,
                details: dxResponse.error.details,
            } : undefined,
        };
    }

    /**
     * Handle errors consistently
     */
    private static handleError(error: unknown): ApiResponse<never> {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';

        console.error('[API Service] Error:', error);

        return {
            success: false,
            error: {
                message,
                details: error,
            },
        };
    }
}

// Log API mode on initialization
if (featureFlags.developer.enableVerboseLogging) {
    ApiService.logApiInfo();
}

// Export as default
export default ApiService;

// Re-export types for convenience
export type { Ingredient, Formula, IngredientAttribute, Project } from './pega';
export type { DxApiResponse, DxApiError } from './dxApi';
