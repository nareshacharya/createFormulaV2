import type { Column } from "../components/DataGrid";

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
                    updatedRow[col.key] = 100.0; // Target is typically 100%
                    break;
                case "rmc": {
                    // Calculate raw material cost based on percentages and costs
                    const rmcValue = ingredientRows
                        .filter((row) => !row.isFormula)
                        .reduce((sum, row) => {
                            const percentage = parseFloat(row[col.key]) || 0;
                            const cost = parseFloat(row.costKg) || 0;
                            return sum + (percentage * cost) / 100;
                        }, 0);
                    updatedRow[col.key] = parseFloat(rmcValue.toFixed(2));
                    break;
                }
                case "weighted": {
                    // Calculate weighted average
                    const totalPercentage = columnValues.reduce(
                        (sum, val) => sum + val,
                        0
                    );
                    const weightedSum = ingredientRows
                        .filter((row) => !row.isFormula)
                        .reduce((sum, row) => {
                            const percentage = parseFloat(row[col.key]) || 0;
                            const cost = parseFloat(row.costKg) || 0;
                            return sum + percentage * cost;
                        }, 0);
                    updatedRow[col.key] =
                        totalPercentage > 0
                            ? parseFloat((weightedSum / totalPercentage).toFixed(2))
                            : 0;
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
