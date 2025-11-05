import { createContext, useMemo } from "react";
import type { ReactNode } from "react";
import { featureFlags, type FeatureFlags } from "../config/featureFlags";

/**
 * Feature Flags Context
 *
 * Provides access to feature flags throughout the application via React Context.
 * This allows components to check feature flags without direct imports,
 * making it easier to override flags in tests or different environments.
 */

export interface FeatureFlagsContextValue {
  flags: FeatureFlags;
}

export const FeatureFlagsContext = createContext<
  FeatureFlagsContextValue | undefined
>(undefined);

interface FeatureFlagsProviderProps {
  children: ReactNode;
  overrides?: Partial<FeatureFlags>;
}

/**
 * Feature Flags Provider
 *
 * Wraps the application to provide feature flags to all components.
 * Optionally accepts overrides for testing or environment-specific configuration.
 */
export const FeatureFlagsProvider = ({
  children,
  overrides,
}: FeatureFlagsProviderProps) => {
  const value = useMemo(() => {
    // Merge overrides with default flags if provided
    const mergedFlags = overrides
      ? {
          ...featureFlags,
          ...overrides,
          api: { ...featureFlags.api, ...overrides.api },
          dataGrid: { ...featureFlags.dataGrid, ...overrides.dataGrid },
          header: { ...featureFlags.header, ...overrides.header },
          formula: { ...featureFlags.formula, ...overrides.formula },
          ingredient: { ...featureFlags.ingredient, ...overrides.ingredient },
          dilution: { ...featureFlags.dilution, ...overrides.dilution },
          workspace: { ...featureFlags.workspace, ...overrides.workspace },
          undoRedo: { ...featureFlags.undoRedo, ...overrides.undoRedo },
          developer: { ...featureFlags.developer, ...overrides.developer },
        }
      : featureFlags;

    return { flags: mergedFlags };
  }, [overrides]);

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};
