import { useContext } from 'react';
import { FeatureFlagsContext, type FeatureFlagsContextValue } from '../context/FeatureFlagsContext';
import type { FeatureFlags } from '../config/featureFlags';

/**
 * Feature Flags Hooks
 * 
 * Custom hooks for accessing feature flags in components.
 * Separated from the context provider to avoid Fast Refresh warnings.
 */

/**
 * Hook to access all feature flags
 * 
 * @returns Complete feature flags object
 * 
 * @example
 * const { flags } = useFeatureFlags();
 * if (flags.dataGrid.enableRowReordering) {
 *   // Render row reordering UI
 * }
 */
export const useFeatureFlags = (): FeatureFlagsContextValue => {
    const context = useContext(FeatureFlagsContext);

    if (context === undefined) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
    }

    return context;
};

// ============================================================================
// SPECIALIZED HOOKS FOR SPECIFIC FEATURE CATEGORIES
// ============================================================================

/**
 * Hook to access API-related feature flags
 * 
 * @example
 * const { useDxApi, dxApiConfig, enableCaching } = useApiFeatures();
 */
export const useApiFeatures = () => {
    const { flags } = useFeatureFlags();
    return flags.api;
};

/**
 * Hook to access DataGrid feature flags
 * 
 * @example
 * const { enableRowReordering, showColumnRemoveIcon } = useDataGridFeatures();
 */
export const useDataGridFeatures = () => {
    const { flags } = useFeatureFlags();
    return flags.dataGrid;
};

/**
 * Hook to access Header feature flags
 * 
 * @example
 * const { showLineCount, showFormulaCost } = useHeaderFeatures();
 */
export const useHeaderFeatures = () => {
    const { flags } = useFeatureFlags();
    return flags.header;
};

/**
 * Hook to access Formula management feature flags
 * 
 * @example
 * const { enableFormulaCreation, enableSendForCompounding } = useFormulaFeatures();
 */
export const useFormulaFeatures = () => {
    const { flags } = useFeatureFlags();
    return flags.formula;
};

/**
 * Hook to access Ingredient management feature flags
 * 
 * @example
 * const { enableAdvancedFiltering, showIngredientPricing } = useIngredientFeatures();
 */
export const useIngredientFeatures = () => {
    const { flags } = useFeatureFlags();
    return flags.ingredient;
};

/**
 * Hook to access Dilution feature flags
 * 
 * @example
 * const { enableDilution, maxSolventsPerDilution } = useDilutionFeatures();
 */
export const useDilutionFeatures = () => {
    const { flags } = useFeatureFlags();
    return flags.dilution;
};

/**
 * Hook to access Workspace feature flags
 * 
 * @example
 * const { enableMultiWorkspace, maxWorkspaces } = useWorkspaceFeatures();
 */
export const useWorkspaceFeatures = () => {
    const { flags } = useFeatureFlags();
    return flags.workspace;
};

/**
 * Hook to access Undo/Redo feature flags
 * 
 * @example
 * const { enableUndoRedo, maxUndoSteps } = useUndoRedoFeatures();
 */
export const useUndoRedoFeatures = () => {
    const { flags } = useFeatureFlags();
    return flags.undoRedo;
};

/**
 * Hook to access Developer feature flags
 * 
 * @example
 * const { showDevConsole, enableVerboseLogging } = useDeveloperFeatures();
 */
export const useDeveloperFeatures = () => {
    const { flags } = useFeatureFlags();
    return flags.developer;
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

type FlagValue = boolean | number | string | object;

/**
 * Hook to check if a specific feature is enabled
 * Provides a simple boolean check for any feature flag path
 * 
 * @example
 * const isRowReorderingEnabled = useFeature('dataGrid', 'enableRowReordering');
 * const shouldShowLineCount = useFeature('header', 'showLineCount');
 */
export const useFeature = (
    category: keyof FeatureFlags,
    feature: string
): boolean => {
    const { flags } = useFeatureFlags();
    const value = (flags[category] as unknown as Record<string, FlagValue>)?.[feature];
    return typeof value === 'boolean' ? value : false;
};

/**
 * Hook to check if multiple features are all enabled
 * Useful for conditional rendering that depends on multiple flags
 * 
 * @example
 * const allEnabled = useFeatures([
 *   ['dataGrid', 'enableRowReordering'],
 *   ['dataGrid', 'enableBulkSelection']
 * ]);
 */
export const useFeatures = (
    features: Array<[keyof FeatureFlags, string]>
): boolean => {
    const { flags } = useFeatureFlags();
    return features.every(([category, feature]) => {
        const value = (flags[category] as unknown as Record<string, FlagValue>)?.[feature];
        return typeof value === 'boolean' ? value : false;
    });
};

/**
 * Hook to check if any of the specified features is enabled
 * Useful for showing UI when at least one feature is available
 * 
 * @example
 * const anyEnabled = useAnyFeature([
 *   ['header', 'showLineCount'],
 *   ['header', 'showFormulaCost'],
 *   ['header', 'showTargetCost']
 * ]);
 */
export const useAnyFeature = (
    features: Array<[keyof FeatureFlags, string]>
): boolean => {
    const { flags } = useFeatureFlags();
    return features.some(([category, feature]) => {
        const value = (flags[category] as unknown as Record<string, FlagValue>)?.[feature];
        return typeof value === 'boolean' ? value : false;
    });
};

/**
 * Hook to get the current API mode (DX API vs Mock)
 * 
 * @returns 'dx-api' | 'mock'
 * 
 * @example
 * const apiMode = useApiMode();
 * console.log(`Using ${apiMode} for data fetching`);
 */
export const useApiMode = (): 'dx-api' | 'mock' => {
    const { useDxApi } = useApiFeatures();
    return useDxApi ? 'dx-api' : 'mock';
};

/**
 * Hook to determine if the app is in development mode
 * Useful for showing developer-only features
 * 
 * @example
 * const isDev = useIsDevelopment();
 * if (isDev) {
 *   // Show debug panel
 * }
 */
export const useIsDevelopment = (): boolean => {
    const { showDevConsole, enableVerboseLogging } = useDeveloperFeatures();
    return showDevConsole || enableVerboseLogging || import.meta.env.DEV;
};
