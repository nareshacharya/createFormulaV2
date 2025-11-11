/**
 * Feature Flags Configuration
 * 
 * This file controls feature visibility and API integration modes for the CreateFormulaV2 application.
 * 
 * IMPORTANT: This is a DEVELOPER-ONLY configuration file. 
 * These settings are not exposed to end users in the UI.
 * 
 * Purpose:
 * - Control visibility of features that are implemented but not yet ready for production
 * - Switch between mock data and DX API integration modes
 * - Enable/disable specific UI elements for phased rollouts
 * - Configure API behavior and integration points
 * 
 * Usage:
 * - Import featureFlags or useFeatureFlags hook in components
 * - Check feature flags before rendering features or making API calls
 * - Update this file to enable/disable features for different environments
 * 
 * Integration with Pega Constellation:
 * When this application is embedded in Pega Constellation:
 * 1. Set `api.useDxApi` to true
 * 2. Configure `api.dxApiConfig` with Pega endpoints
 * 3. Implement authentication in DxApiService
 * 4. Test each feature flag independently
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

export interface DxApiConfig {
    /** Base URL for Pega DX API */
    baseUrl: string;

    /** API version */
    version: string;

    /** Application name in Pega */
    applicationName: string;

    /** Endpoints configuration */
    endpoints: {
        /** Data Page for fetching ingredients list */
        ingredientsDataPage: string;

        /** Data Page for fetching formulas list */
        formulasDataPage: string;

        /** Data Page for fetching ingredient attributes */
        attributesDataPage: string;

        /** Case type for formula operations */
        formulaCaseType: string;

        /** Action for creating a new formula */
        createFormulaAction: string;

        /** Action for updating an existing formula */
        updateFormulaAction: string;

        /** Action for submitting formula for compounding */
        submitForCompoundingAction: string;

        /** Action for validating formula */
        validateFormulaAction: string;
    };

    /** Request timeout in milliseconds */
    timeout: number;

    /** Retry configuration */
    retry: {
        enabled: boolean;
        maxRetries: number;
        retryDelay: number;
    };

    /** Batch request configuration for multiple formula updates */
    batch: {
        enabled: boolean;
        maxBatchSize: number;
        batchDelay: number;
    };
}

export interface ApiFeatureFlags {
    /** Use DX API instead of mock data (set to true for Pega integration) */
    useDxApi: boolean;

    /** DX API configuration */
    dxApiConfig: DxApiConfig;

    /** Enable request caching */
    enableCaching: boolean;

    /** Cache duration in milliseconds */
    cacheDuration: number;

    /** Enable optimistic updates (update UI before API confirmation) */
    enableOptimisticUpdates: boolean;

    /** Enable batch API requests for multiple formula updates */
    enableBatchRequests: boolean;

    /** Show API loading states in UI */
    showApiLoadingStates: boolean;

    /** Show detailed API error messages */
    showDetailedErrors: boolean;
}

// ============================================================================
// UI FEATURE FLAGS
// ============================================================================

export interface DataGridFeatureFlags {
    /** Enable manual row reordering via drag and drop */
    enableRowReordering: boolean;

    /** Show remove/close icon on formula column headers */
    showColumnRemoveIcon: boolean;

    /** Show remove/close icon on attribute column headers */
    showAttributeRemoveIcon: boolean;

    /** Enable bulk row selection and operations */
    enableBulkSelection: boolean;

    /** Enable inline cell editing */
    enableInlineEditing: boolean;

    /** Enable keyboard navigation */
    enableKeyboardNavigation: boolean;

    /** Enable column resizing */
    enableColumnResizing: boolean;

    /** Enable column sorting */
    enableColumnSorting: boolean;

    /** Enable column filtering */
    enableColumnFiltering: boolean;

    /** Enable row grouping */
    enableRowGrouping: boolean;

    /** Enable copy/paste functionality */
    enableCopyPaste: boolean;

    /** Enable export functionality */
    enableExport: boolean;

    /** Show running totals row */
    showRunningTotals: boolean;

    /** Show RMC (Raw Material Cost) calculations */
    showRmcCalculations: boolean;
}

export interface HeaderFeatureFlags {
    /** Show formula name in header */
    showFormulaName: boolean;

    /** Show formula ID in header */
    showFormulaId: boolean;

    /** Show formula status badge */
    showFormulaStatus: boolean;

    /** Show line count metric */
    showLineCount: boolean;

    /** Show formula cost metric */
    showFormulaCost: boolean;

    /** Show target cost (RMC) metric */
    showTargetCost: boolean;

    /** Show project dropdown */
    showProjectDropdown: boolean;

    /** Show created by information */
    showCreatedBy: boolean;

    /** Show last updated information */
    showLastUpdated: boolean;
}

export interface FormulaFeatureFlags {
    /** Enable formula creation */
    enableFormulaCreation: boolean;

    /** Enable formula versioning */
    enableFormulaVersioning: boolean;

    /** Enable formula normalization */
    enableFormulaNormalization: boolean;

    /** Enable formula duplication */
    enableFormulaDuplication: boolean;

    /** Enable formula deletion */
    enableFormulaDeletion: boolean;

    /** Enable formula export */
    enableFormulaExport: boolean;

    /** Enable formula sharing */
    enableFormulaSharing: boolean;

    /** Show formula metadata editor */
    showFormulaMetadata: boolean;

    /** Show formula notes section */
    showFormulaNotes: boolean;

    /** Enable send for compounding */
    enableSendForCompounding: boolean;

    /** Enable formula validation on demand */
    enableFormulaValidation: boolean;
}

export interface IngredientFeatureFlags {
    /** Enable ingredient search */
    enableIngredientSearch: boolean;

    /** Enable advanced query builder filtering */
    enableAdvancedFiltering: boolean;

    /** Enable ingredient type filtering */
    enableTypeFiltering: boolean;

    /** Enable ingredient quick view */
    enableQuickView: boolean;

    /** Enable ingredient full detail view */
    enableDetailView: boolean;

    /** Show ingredient attributes in list */
    showIngredientsAttributes: boolean;

    /** Show ingredient pricing */
    showIngredientPricing: boolean;

    /** Show ingredient suppliers */
    showIngredientSuppliers: boolean;

    /** Show allergen information */
    showAllergenInfo: boolean;
}

export interface DilutionFeatureFlags {
    /** Enable dilution functionality */
    enableDilution: boolean;

    /** Enable multi-solvent dilution */
    enableMultiSolventDilution: boolean;

    /** Show dilution badge on ingredients */
    showDilutionBadge: boolean;

    /** Show dilution icon in data grid */
    showDilutionIcon: boolean;

    /** Enable dilution editing */
    enableDilutionEditing: boolean;

    /** Show dilution calculations in real-time */
    showDilutionCalculations: boolean;

    /** Maximum number of solvents per dilution */
    maxSolventsPerDilution: number;
}

export interface WorkspaceFeatureFlags {
    /** Enable multi-workspace support */
    enableMultiWorkspace: boolean;

    /** Maximum number of concurrent workspaces */
    maxWorkspaces: number;

    /** Enable workspace naming/renaming */
    enableWorkspaceNaming: boolean;

    /** Enable workspace saving */
    enableWorkspaceSaving: boolean;

    /** Enable workspace templates */
    enableWorkspaceTemplates: boolean;

    /** Show workspace tabs */
    showWorkspaceTabs: boolean;

    /** Enable workspace isolation (formula locking) */
    enableWorkspaceIsolation: boolean;
}

export interface UndoRedoFeatureFlags {
    /** Enable undo/redo functionality */
    enableUndoRedo: boolean;

    /** Maximum number of undo steps */
    maxUndoSteps: number;

    /** Show undo/redo buttons in UI */
    showUndoRedoButtons: boolean;

    /** Enable keyboard shortcuts for undo/redo */
    enableUndoRedoShortcuts: boolean;
}

export interface DeveloperFeatureFlags {
    /** Show developer console/debug panel */
    showDevConsole: boolean;

    /** Enable verbose logging */
    enableVerboseLogging: boolean;

    /** Show performance metrics */
    showPerformanceMetrics: boolean;

    /** Enable feature flag override via URL params */
    enableUrlOverrides: boolean;

    /** Show event bus activity monitor */
    showEventBusMonitor: boolean;

    /** Enable React DevTools integration */
    enableReactDevTools: boolean;
}

// ============================================================================
// MASTER FEATURE FLAGS CONFIGURATION
// ============================================================================

export interface FeatureFlags {
    /** API configuration and integration mode */
    api: ApiFeatureFlags;

    /** Data grid feature flags */
    dataGrid: DataGridFeatureFlags;

    /** Header feature flags */
    header: HeaderFeatureFlags;

    /** Formula management feature flags */
    formula: FormulaFeatureFlags;

    /** Ingredient management feature flags */
    ingredient: IngredientFeatureFlags;

    /** Dilution feature flags */
    dilution: DilutionFeatureFlags;

    /** Workspace management feature flags */
    workspace: WorkspaceFeatureFlags;

    /** Undo/Redo feature flags */
    undoRedo: UndoRedoFeatureFlags;

    /** Developer-only features */
    developer: DeveloperFeatureFlags;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const featureFlags: FeatureFlags = {
    // ============================================================================
    // API CONFIGURATION
    // ============================================================================
    api: {
        // Set to true when deploying to Pega Constellation
        useDxApi: false,

        dxApiConfig: {
            // Update these values when integrating with Pega
            baseUrl: 'https://your-pega-instance.com/prweb/api/application/v2',
            version: 'v2',
            applicationName: 'FragranceLab',

            endpoints: {
                // Data Pages - Update with actual Pega Data Page names
                ingredientsDataPage: 'D_IngredientsList',
                formulasDataPage: 'D_FormulasList',
                attributesDataPage: 'D_IngredientAttributesList',

                // Case Types and Actions - Update with actual Pega case types
                formulaCaseType: 'FragranceLab-Work-Formula',
                createFormulaAction: 'CreateFormula',
                updateFormulaAction: 'UpdateFormula',
                submitForCompoundingAction: 'SubmitForCompounding',
                validateFormulaAction: 'ValidateFormula',
            },

            timeout: 30000, // 30 seconds

            retry: {
                enabled: true,
                maxRetries: 3,
                retryDelay: 1000, // 1 second
            },

            batch: {
                enabled: true,
                maxBatchSize: 10, // Max formulas to update in one batch
                batchDelay: 500, // Debounce delay for batching requests
            },
        },

        enableCaching: true,
        cacheDuration: 5 * 60 * 1000, // 5 minutes
        enableOptimisticUpdates: true,
        enableBatchRequests: true,
        showApiLoadingStates: true,
        showDetailedErrors: false, // Set to true for development
    },

    // ============================================================================
    // DATA GRID FEATURES
    // ============================================================================
    dataGrid: {
        // Features ready but hidden from client
        enableRowReordering: false, // TODO: Enable after client approval
        showColumnRemoveIcon: true, // Enabled - shows X icon on formula/attribute column headers
        showAttributeRemoveIcon: true, // Enabled - shows X icon on attribute column headers

        // Enabled features
        enableBulkSelection: true,
        enableInlineEditing: true,
        enableKeyboardNavigation: true,
        enableColumnResizing: true,
        enableColumnSorting: true,
        enableColumnFiltering: true,
        enableRowGrouping: true,
        enableCopyPaste: true,
        enableExport: true,
        showRunningTotals: true,
        showRmcCalculations: true,
    },

    // ============================================================================
    // HEADER FEATURES
    // ============================================================================
    header: {
        // Individual stat controls
        showFormulaName: true,
        showFormulaId: true,
        showFormulaStatus: true,
        showLineCount: false, // TODO: Enable after client approval
        showFormulaCost: false, // TODO: Enable after client approval
        showTargetCost: false, // TODO: Enable after client approval

        // Other header elements
        showProjectDropdown: true,
        showCreatedBy: true,
        showLastUpdated: true,
    },

    // ============================================================================
    // FORMULA FEATURES
    // ============================================================================
    formula: {
        enableFormulaCreation: true,
        enableFormulaVersioning: true,
        enableFormulaNormalization: true,
        enableFormulaDuplication: true,
        enableFormulaDeletion: true,
        enableFormulaExport: true,
        enableFormulaSharing: false, // TODO: Implement sharing feature
        showFormulaMetadata: true,
        showFormulaNotes: true,
        enableSendForCompounding: true,
        enableFormulaValidation: true,
    },

    // ============================================================================
    // INGREDIENT FEATURES
    // ============================================================================
    ingredient: {
        enableIngredientSearch: true,
        enableAdvancedFiltering: true,
        enableTypeFiltering: true,
        enableQuickView: true,
        enableDetailView: true,
        showIngredientsAttributes: true,
        showIngredientPricing: true,
        showIngredientSuppliers: true,
        showAllergenInfo: true,
    },

    // ============================================================================
    // DILUTION FEATURES
    // ============================================================================
    dilution: {
        enableDilution: true,
        enableMultiSolventDilution: true,
        showDilutionBadge: true,
        showDilutionIcon: true,
        enableDilutionEditing: true,
        showDilutionCalculations: true,
        maxSolventsPerDilution: 3,
    },

    // ============================================================================
    // WORKSPACE FEATURES
    // ============================================================================
    workspace: {
        enableMultiWorkspace: true,
        maxWorkspaces: 3,
        enableWorkspaceNaming: true,
        enableWorkspaceSaving: false, // TODO: Implement persistence
        enableWorkspaceTemplates: false, // TODO: Implement templates
        showWorkspaceTabs: true,
        enableWorkspaceIsolation: true, // Formula locking between workspaces
    },

    // ============================================================================
    // UNDO/REDO FEATURES
    // ============================================================================
    undoRedo: {
        enableUndoRedo: true,
        maxUndoSteps: 5,
        showUndoRedoButtons: true,
        enableUndoRedoShortcuts: true,
    },

    // ============================================================================
    // DEVELOPER FEATURES
    // ============================================================================
    developer: {
        showDevConsole: false, // Enable for debugging
        enableVerboseLogging: false, // Enable for debugging
        showPerformanceMetrics: false, // Enable for performance analysis
        enableUrlOverrides: true, // Allow ?feature_xxx=true in URL
        showEventBusMonitor: false, // Enable to monitor event bus activity
        enableReactDevTools: true,
    },
};

// ============================================================================
// ENVIRONMENT-SPECIFIC OVERRIDES
// ============================================================================

/**
 * Apply environment-specific feature flag overrides
 * This function can be called at app initialization to override defaults
 * based on environment variables or build configuration
 */
export const applyEnvironmentOverrides = () => {
    const env = import.meta.env.MODE;

    if (env === 'development') {
        // Development overrides
        featureFlags.developer.enableVerboseLogging = true;
        featureFlags.developer.showDevConsole = false;
        featureFlags.api.showDetailedErrors = true;
    } else if (env === 'staging') {
        // Staging overrides - test all features
        featureFlags.dataGrid.enableRowReordering = true;
        featureFlags.dataGrid.showColumnRemoveIcon = true;
        featureFlags.header.showLineCount = true;
        featureFlags.header.showFormulaCost = true;
        featureFlags.header.showTargetCost = true;
    } else if (env === 'production') {
        // Production overrides - conservative defaults
        featureFlags.developer.enableVerboseLogging = false;
        featureFlags.developer.showDevConsole = false;
        featureFlags.developer.enableUrlOverrides = false;
        featureFlags.api.showDetailedErrors = false;
    }
};

/**
 * Apply URL parameter overrides for feature flags
 * Allows developers to test features via URL parameters
 * Example: ?feature_rowReordering=true
 * 
 * Only works if developer.enableUrlOverrides is true
 */
export const applyUrlOverrides = () => {
    if (!featureFlags.developer.enableUrlOverrides) {
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);

    // Helper to parse boolean from string
    const parseBoolean = (value: string | null): boolean | null => {
        if (value === null) return null;
        return value.toLowerCase() === 'true';
    };

    // DataGrid overrides
    const rowReordering = parseBoolean(urlParams.get('feature_rowReordering'));
    if (rowReordering !== null) featureFlags.dataGrid.enableRowReordering = rowReordering;

    const columnRemoveIcon = parseBoolean(urlParams.get('feature_columnRemoveIcon'));
    if (columnRemoveIcon !== null) featureFlags.dataGrid.showColumnRemoveIcon = columnRemoveIcon;

    // Header overrides
    const lineCount = parseBoolean(urlParams.get('feature_lineCount'));
    if (lineCount !== null) featureFlags.header.showLineCount = lineCount;

    const formulaCost = parseBoolean(urlParams.get('feature_formulaCost'));
    if (formulaCost !== null) featureFlags.header.showFormulaCost = formulaCost;

    const targetCost = parseBoolean(urlParams.get('feature_targetCost'));
    if (targetCost !== null) featureFlags.header.showTargetCost = targetCost;

    // API overrides
    const useDxApi = parseBoolean(urlParams.get('feature_useDxApi'));
    if (useDxApi !== null) featureFlags.api.useDxApi = useDxApi;

    console.log('Feature flags overrides applied from URL:', {
        rowReordering,
        columnRemoveIcon,
        lineCount,
        formulaCost,
        targetCost,
        useDxApi,
    });
};

// ============================================================================
// INITIALIZATION
// ============================================================================

// Apply overrides on module load
applyEnvironmentOverrides();
applyUrlOverrides();

// Export default configuration
export default featureFlags;
