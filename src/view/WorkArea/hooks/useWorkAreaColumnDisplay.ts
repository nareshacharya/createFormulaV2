import { useCallback, useMemo } from "react";
import type { Column } from "../../../components/DataGrid";

export const useWorkAreaColumnDisplay = (
    columns: Column[],
    maxAttributeSelections: number,
    maxFormulaSelections: number
) => {
    // Check if we should show the add column button for attributes
    const shouldShowAttributeAddButton = useCallback(() => {
        const currentAttributeColumns = columns.filter(
            (col) => col.group === "Attributes" && col.attributeId
        );
        return currentAttributeColumns.length < maxAttributeSelections;
    }, [columns, maxAttributeSelections]);

    // Check if we should show the add column button for formulas
    const shouldShowFormulaAddButton = useCallback(() => {
        const currentFormulaColumns = columns.filter(
            (col) => col.group === "Formulas" && col.formulaId
        );
        return currentFormulaColumns.length < maxFormulaSelections;
    }, [columns, maxFormulaSelections]);

    // Get display columns with conditionally hidden add buttons
    const getDisplayColumns = useCallback(() => {
        let displayColumns = [...columns];

        if (!shouldShowAttributeAddButton()) {
            displayColumns = displayColumns.filter(
                (col) => col.id !== "attributeAdd"
            );
        }

        if (!shouldShowFormulaAddButton()) {
            displayColumns = displayColumns.filter((col) => col.id !== "formulaAdd");
        }

        return displayColumns;
    }, [columns, shouldShowAttributeAddButton, shouldShowFormulaAddButton]);

    return useMemo(
        () => ({
            shouldShowAttributeAddButton,
            shouldShowFormulaAddButton,
            getDisplayColumns,
        }),
        [shouldShowAttributeAddButton, shouldShowFormulaAddButton, getDisplayColumns]
    );
};
