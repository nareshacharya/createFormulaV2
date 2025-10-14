import type { Column } from "../components/DataGrid";
import { calculateRMC, type IngredientCostData } from "./rmcCalculator";

/**
 * Calculate totals for formula columns in the data grid
 * Handles running totals, target totals, RMC (raw material cost), and weighted averages
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
                        columnValues.reduce((sum, val) => sum + val, 0).toFixed(2)
                    );
                    break;
                case "target":
                    // Preserve existing target value if it exists, otherwise default to 100.0
                    if (updatedRow[col.key] === null || updatedRow[col.key] === undefined) {
                        updatedRow[col.key] = 100.0;
                    }
                    // If target was already set, keep the existing value
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
                case "weighted": {
                    // Calculate weighted average for cost per kg
                    // Formula: Weighted Avg = ∑(Cost × Amount%) / ∑(Amount%)
                    const totalPercentage = columnValues.reduce(
                        (sum, val) => sum + val,
                        0
                    );

                    if (totalPercentage === 0) {
                        updatedRow[col.key] = 0;
                        break;
                    }

                    const weightedSum = ingredientRows
                        .filter((row) => !row.isFormula)
                        .reduce((sum, row) => {
                            const percentage = parseFloat(row[col.key]) || 0;
                            const cost = parseFloat(row.costKg) || 0;
                            return sum + (cost * percentage);
                        }, 0);

                    updatedRow[col.key] = parseFloat(
                        (weightedSum / totalPercentage).toFixed(2)
                    );
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
