/**
 * Custom hook for managing WorkArea event bus listeners
 * Handles all event subscriptions and cleanup
 */

import { useEffect } from "react";
import { eventBus } from "../../../utils/bus";
import type { Formula, Ingredient, IngredientAttribute } from "../../../services/pega";

interface UseWorkAreaEventsProps {
    handleIngredientClick: (ingredient: Ingredient) => void;
    handleFormulaSelected: (formula: Formula) => void;
    handleAttributeSelected: (attribute: IngredientAttribute) => void;
    handleAttributeDeselected: (attribute: IngredientAttribute) => void;
    handleNewFormulaCreated: (data: { formula: Formula }) => void;
    handleFormulaSelectedForColumn: (data: { formula: Formula }) => void;
    handleNormalize: () => void;
    handleMergeDuplicates: () => void;
}

export function useWorkAreaEvents(handlers: UseWorkAreaEventsProps) {
    const {
        handleIngredientClick,
        handleFormulaSelected,
        handleAttributeSelected,
        handleAttributeDeselected,
        handleNewFormulaCreated,
        handleFormulaSelectedForColumn,
        handleNormalize,
        handleMergeDuplicates,
    } = handlers;

    useEffect(() => {
        // Subscribe to all event bus events
        eventBus.on("ingredient-clicked", handleIngredientClick);
        eventBus.on("formula-selected", handleFormulaSelected);
        eventBus.on("attribute-selected", handleAttributeSelected);
        eventBus.on("attribute-deselected", handleAttributeDeselected);
        eventBus.on("new-formula-created", handleNewFormulaCreated);
        eventBus.on("formula-selected-for-column", handleFormulaSelectedForColumn);
        eventBus.on("normalize-formula", handleNormalize);
        eventBus.on("merge-duplicates", handleMergeDuplicates);

        // Cleanup function
        return () => {
            eventBus.off("ingredient-clicked", handleIngredientClick);
            eventBus.off("formula-selected", handleFormulaSelected);
            eventBus.off("attribute-selected", handleAttributeSelected);
            eventBus.off("attribute-deselected", handleAttributeDeselected);
            eventBus.off("new-formula-created", handleNewFormulaCreated);
            eventBus.off("formula-selected-for-column", handleFormulaSelectedForColumn);
            eventBus.off("normalize-formula", handleNormalize);
            eventBus.off("merge-duplicates", handleMergeDuplicates);
        };
    }, [
        handleIngredientClick,
        handleFormulaSelected,
        handleAttributeSelected,
        handleAttributeDeselected,
        handleNewFormulaCreated,
        handleFormulaSelectedForColumn,
        handleNormalize,
        handleMergeDuplicates,
    ]);
}
