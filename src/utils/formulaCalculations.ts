import type { Column } from "../components/DataGrid";
import { calculateRMC, type IngredientCostData } from "./rmcCalculator";

/**
 * Calculate totals for formula columns in the data grid
 * Handles running totals, RMC (raw material cost), and line count
 */
export const calculateTotals = (
    data: any[],
    columns: Column[],
    formulaColumnIds?: string[]
) => {
    const ingredientRows = data.filter((row) => !row.isTotal);
    const totalRows = data.filter((row) => row.isTotal);

    // Get formula columns from current columns state or passed parameter
    const formulaColumns = formulaColumnIds
        ? formulaColumnIds.map((id) => ({ key: id }))
        : columns.filter(
            (col) => col.group === "Formulas" && col.type === "number"
        );

    const updatedTotals = totalRows.map((totalRow) => {
        const updatedRow = { ...totalRow };

        formulaColumns.forEach((col) => {
            const columnValues = ingredientRows
                .filter((row) => !row.isFormula) // Only count individual ingredients, not formula groups
                .map((row) => parseFloat(row[col.key]) || 0)
                .filter((val) => !isNaN(val));

            switch (totalRow.totalType) {
                case "running":
                    updatedRow[col.key] = parseFloat(
                        columnValues.reduce((sum, val) => sum + val, 0).toFixed(5)
                    );
                    break;
                case "rmc": {
                    // Calculate raw material cost using proper RMC calculator
                    // Formula: RMC = ∑(Amount% × Cost/kg) / 100
                    const ingredients: IngredientCostData[] = ingredientRows
                        .filter((row) => !row.isFormula)
                        .map((row) => ({
                            id: row.id,
                            name: row.description || row.name || '',
                            amount: parseFloat(row[col.key]) || 0,
                            costPerKg: parseFloat(row.costKg) || 0,
                        }))
                        .filter((ing) => ing.amount > 0); // Only include ingredients with amounts

                    const rmcValue = calculateRMC(ingredients);
                    updatedRow[col.key] = parseFloat(rmcValue.toFixed(2));
                    break;
                }
                case "lineCount": {
                    // Count the number of lines (ingredients) that have a non-zero value in this column
                    // Do not count un-exploded formulas (rows with isFormula=true and no children visible)
                    const lineCount = ingredientRows.filter((row) => {
                        // Skip formula group rows (un-exploded formulas)
                        if (row.isFormula) return false;
                        // Count only rows with non-zero values
                        const value = parseFloat(row[col.key]) || 0;
                        return value > 0;
                    }).length;

                    updatedRow[col.key] = lineCount;
                    break;
                }
            }
        });

        return updatedRow;
    });

    return [...ingredientRows, ...updatedTotals];
};

/**
 * Get empty state data for the table when no ingredients are present
 */
export const getEmptyStateData = (tableData: any[], hasIngredients: boolean) => {
    if (hasIngredients) return tableData;

    // Return a single row that spans all columns with the empty message
    return [
        {
            id: "empty-state",
            description: "",
            costKg: null,
            contCost: null,
            isTotal: false,
            isEmpty: true,
        },
    ];
};

/**
 * Calculate contribution cost for all rows based on the active formula
 * Formula: (percentage in active formula * cost per kg) / 1000
 */
export const recalculateContributionCosts = (
    data: any[],
    editableFormulaId: string
): any[] => {
    if (!editableFormulaId) return data;

    return data.map((row) => {
        // Skip total rows
        if (row.isTotal) {
            return row;
        }

        // Calculate contribution cost based on active formula percentage
        const percentage = parseFloat(row[editableFormulaId]) || 0;
        const costPerKg = parseFloat(row.costKg) || 0;
        const contCost = (percentage * costPerKg) / 1000;

        return {
            ...row,
            contCost: parseFloat(contCost.toFixed(4)),
        };
    });
};
