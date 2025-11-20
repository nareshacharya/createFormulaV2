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
     * Check formula compliance
     */
    static async checkCompliance(formulaId: string, data?: Record<string, unknown>): Promise<ApiResponse<unknown>> {
        try {
            if (this.isUsingDxApi()) {
                const response = await DxApiService.checkCompliance(formulaId, data);
                return this.mapDxApiResponse(response);
            } else {
                // Mock implementation
                return {
                    success: true,
                    data: {
                        isCompliant: true,
                        warnings: [],
                        errors: [],
                        timestamp: new Date().toISOString(),
                    }
                };
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
    // WORKSPACE PERSISTENCE
    // ============================================================================

    /**
     * Save workspace data
     * Routes to DX API or localStorage based on feature flags
     */
    static async saveWorkspace(workspaceData: Record<string, unknown>): Promise<ApiResponse<{ id: string; name?: string }>> {
        try {
            if (this.isUsingDxApi()) {
                const response = await DxApiService.saveWorkspace(workspaceData);
                const mapped = this.mapDxApiResponse(response);
                return {
                    success: mapped.success,
                    data: mapped.data as { id: string; name?: string } | undefined,
                    error: mapped.error,
                };
            } else {
                // Mock: Store in localStorage (workspaceManager already does this)
                const workspaceId = `workspace_${Date.now()}`;
                localStorage.setItem(`workspace_data_${workspaceId}`, JSON.stringify(workspaceData));
                return {
                    success: true,
                    data: {
                        id: workspaceId,
                        name: (workspaceData as Record<string, unknown>)?.name as string || 'Workspace',
                    }
                };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Load workspace data
     * Routes to DX API or localStorage based on feature flags
     */
    static async loadWorkspace(workspaceId: string): Promise<ApiResponse<Record<string, unknown>>> {
        try {
            if (this.isUsingDxApi()) {
                const response = await DxApiService.loadWorkspace(workspaceId);
                const mapped = this.mapDxApiResponse(response);
                return {
                    success: mapped.success,
                    data: mapped.data as Record<string, unknown> | undefined,
                    error: mapped.error,
                };
            } else {
                // Mock: Load from localStorage
                const data = localStorage.getItem(`workspace_data_${workspaceId}`);
                if (!data) {
                    return { success: false, error: { message: 'Workspace not found' } };
                }
                return { success: true, data: JSON.parse(data) as Record<string, unknown> };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get list of available workspaces
     */
    static async getWorkspaceList(): Promise<ApiResponse<Array<{ id: string; name: string; lastModified: string }>>> {
        try {
            if (this.isUsingDxApi()) {
                const response = await DxApiService.loadWorkspace?.('list');
                if (response) {
                    const mapped = this.mapDxApiResponse(response);
                    return {
                        success: mapped.success,
                        data: mapped.data as Array<{ id: string; name: string; lastModified: string }> | undefined,
                        error: mapped.error,
                    };
                }
                return { success: true, data: [] };
            } else {
                // Mock: Get from workspaceManager via localStorage pattern
                const { getWorkspaces } = await import('../utils/workspaceManager');
                const workspaces = getWorkspaces();
                return {
                    success: true,
                    data: workspaces.map(w => ({
                        id: w.id,
                        name: w.name,
                        lastModified: w.lastModified,
                    }))
                };
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
            // Cache is managed by CacheManager singleton in DxApiService
            // No explicit clear needed as TTL handles expiration
        }
    }

    /**
     * Check authentication status (only applicable for DX API)
     */
    static isAuthenticated(): boolean {
        if (this.isUsingDxApi()) {
            // Authentication is handled internally by DxApiService
            return true; // Assume authenticated if DX API mode is enabled
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
        if (featureFlags.developer?.enableVerboseLogging) {
            const mode = this.getApiMode();
            // eslint-disable-next-line no-console
            console.log('[API Service] Current mode:', mode);

            if (this.isUsingDxApi()) {
                // eslint-disable-next-line no-console
                console.log('[API Service] DX API configuration:', {
                    baseUrl: featureFlags.api.dxApiConfig.baseUrl,
                    cachingEnabled: featureFlags.api.enableCaching,
                    batchingEnabled: featureFlags.api.enableBatchRequests,
                });
            } else {
                // eslint-disable-next-line no-console
                console.log('[API Service] Using mock data');
            }
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

        if (featureFlags.developer?.enableVerboseLogging) {
            // eslint-disable-next-line no-console
            console.error('[API Service] Error:', error);
        }

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
export type { DxApiResponse } from './dxApi';
