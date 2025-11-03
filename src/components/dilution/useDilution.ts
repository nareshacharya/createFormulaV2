import { useState, useCallback } from 'react';
import { eventBus } from '../../utils/bus';
import type { Dilution } from '../../types/dilution';

export interface DilutionState {
    [ingredientId: string]: Dilution;
}

export interface UseDilutionReturn {
    dilutions: DilutionState;
    getDilution: (ingredientId: string) => Dilution | undefined;
    setDilution: (ingredientId: string, dilution: Dilution) => void;
    removeDilution: (ingredientId: string) => void;
    hasDilution: (ingredientId: string) => boolean;
    clearAllDilutions: () => void;
    restoreDilutions: (savedDilutions: DilutionState) => void;
}

/**
 * useDilution Hook
 * Custom hook for managing ingredient dilution state
 * Keeps state management out of WorkArea to avoid file size bloat
 */
export const useDilution = (): UseDilutionReturn => {
    const [dilutions, setDilutions] = useState<DilutionState>({});

    /**
     * Get dilution for a specific ingredient
     */
    const getDilution = useCallback(
        (ingredientId: string): Dilution | undefined => {
            return dilutions[ingredientId];
        },
        [dilutions]
    );

    /**
     * Set or update dilution for an ingredient
     */
    const setDilution = useCallback((ingredientId: string, dilution: Dilution) => {
        setDilutions((prev) => {
            // If dilution has no solvents, remove it
            if (!dilution.solventIds || dilution.solventIds.length === 0) {
                const { [ingredientId]: _, ...rest } = prev;
                return rest;
            }

            return {
                ...prev,
                [ingredientId]: dilution,
            };
        });

        // Emit event to notify WorkArea to save state for undo
        setTimeout(() => {
            eventBus.emit("dilution-changed", { ingredientId, dilution });
        }, 0);
    }, []);

    /**
     * Remove dilution for an ingredient
     */
    const removeDilution = useCallback((ingredientId: string) => {
        setDilutions((prev) => {
            const { [ingredientId]: _, ...rest } = prev;
            return rest;
        });
    }, []);

    /**
     * Check if an ingredient has dilution
     */
    const hasDilution = useCallback(
        (ingredientId: string): boolean => {
            const dilution = dilutions[ingredientId];
            return !!dilution && dilution.solventIds.length > 0;
        },
        [dilutions]
    );

    /**
     * Clear all dilutions (useful for reset operations)
     */
    const clearAllDilutions = useCallback(() => {
        setDilutions({});
    }, []);

    /**
     * Restore dilutions from a saved state (for undo/redo)
     */
    const restoreDilutions = useCallback((savedDilutions: DilutionState) => {
        setDilutions(savedDilutions || {});
    }, []);

    return {
        dilutions,
        getDilution,
        setDilution,
        removeDilution,
        hasDilution,
        clearAllDilutions,
        restoreDilutions,
    };
};
