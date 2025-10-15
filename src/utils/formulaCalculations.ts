import type { Column } from "../components/DataGrid";

/**
 * Calculate totals for formula columns in the data grid
 * Handles running totals, target totals, and cost sums
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

    // Process the running total row
    const runningTotalRow = totalRows.find((row) => row.totalType === "running");
    const updatedRunningTotal = runningTotalRow ? { ...runningTotalRow } : {
        id: "runningTotal",
        description: "Total",
        costKg: null,
        contCost: null,
        isTotal: true,
        totalType: "running",
    };

    // Calculate sum for formula columns
    formulaColumns.forEach((col) => {
        const columnValues = ingredientRows
            .filter((row) => !row.isFormula) // Only count individual ingredients, not formula groups
            .map((row) => parseFloat(row[col.key]) || 0)
            .filter((val) => !isNaN(val));

        updatedRunningTotal[col.key] = parseFloat(
            columnValues.reduce((sum, val) => sum + val, 0).toFixed(5)
        );
    });

    // Calculate sum for costKg column
    const costKgValues = ingredientRows
        .filter((row) => !row.isFormula)
        .map((row) => parseFloat(row.costKg) || 0)
        .filter((val) => !isNaN(val));

    updatedRunningTotal.costKg = parseFloat(
        costKgValues.reduce((sum, val) => sum + val, 0).toFixed(2)
    );

    // Calculate sum for contCost column
    const contCostValues = ingredientRows
        .filter((row) => !row.isFormula)
        .map((row) => parseFloat(row.contCost) || 0)
        .filter((val) => !isNaN(val));

    updatedRunningTotal.contCost = parseFloat(
        contCostValues.reduce((sum, val) => sum + val, 0).toFixed(2)
    );

    // Process or create the target total row
    const targetTotalRow = totalRows.find((row) => row.totalType === "target");
    const updatedTargetTotal = targetTotalRow ? { ...targetTotalRow } : {
        id: "targetTotal",
        description: "Target Total",
        costKg: null,
        contCost: null,
        isTotal: true,
        totalType: "target",
    };

    // Initialize target total to 100.00000 for formula columns if not already set
    formulaColumns.forEach((col) => {
        if (updatedTargetTotal[col.key] === undefined || updatedTargetTotal[col.key] === null) {
            updatedTargetTotal[col.key] = 100.00000;
        }
    });

    return [...ingredientRows, updatedRunningTotal, updatedTargetTotal];
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
