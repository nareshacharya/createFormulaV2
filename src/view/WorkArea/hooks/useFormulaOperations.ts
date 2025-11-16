import type { Dispatch, SetStateAction } from "react";
import { toast } from "react-hot-toast";
import type { Column } from "../../../components/DataGrid";
import type { Formula, Ingredient } from "../../../services/pega";
import { eventBus } from "../../../utils/bus";
import { calculateTotals } from "../../../utils/formulaCalculations";
import { appStateHistory } from "../../../utils/stateHistory";

interface UseFormulaOperationsProps {
    columns: Column[];
    editableFormula: string;
    formulas: Formula[];
    availableFormulas: Formula[];
    tableData: any[];
    ingredients: Ingredient[];
    setTableData: Dispatch<SetStateAction<any[]>>;
    // selectedFormulaIds - Reserved for future use
    setSelectedFormulaIds: Dispatch<SetStateAction<string[]>>;
    pendingFormulaIds: React.RefObject<Set<string>>;
}

export const useFormulaOperations = ({
    columns,
    editableFormula,
    formulas,
    availableFormulas,
    tableData,
    ingredients,
    setTableData,
    // selectedFormulaIds - Reserved for future use
    setSelectedFormulaIds,
    pendingFormulaIds,
}: UseFormulaOperationsProps) => {
    const handleNormalize = () => {
        if (!editableFormula) {
            toast.error("No active formula to normalize");
            return;
        }

        // Save state before normalizing
        appStateHistory.push(
            { columns, tableData, formulas, availableFormulas },
            "normalize_formula",
            `Normalized active formula`
        );

        setTableData((prev) => {
            const targetTotalRow = prev.find(
                (row) => row.isTotal && row.totalType === "target"
            );
            const runningTotalRow = prev.find(
                (row) => row.isTotal && row.totalType === "running"
            );

            if (!targetTotalRow || !runningTotalRow) {
                toast.error("Could not find target or running total");
                return prev;
            }

            const targetTotal = targetTotalRow[editableFormula];
            const runningTotal = runningTotalRow[editableFormula];

            if (!targetTotal || !runningTotal || runningTotal === 0) {
                toast.error("Invalid target or running total");
                return prev;
            }

            const adjustmentFactor = targetTotal / runningTotal;

            const newData = prev.map((row) => {
                // Only normalize exploded ingredients (not formula group rows)
                // A row is normalizable if it's not a total row and not a formula group row
                if (!row.isTotal && !row.isFormula) {
                    const currentValue = row[editableFormula] || 0;
                    const newValue = parseFloat(
                        (currentValue * adjustmentFactor).toFixed(2)
                    );
                    return { ...row, [editableFormula]: newValue };
                }
                return row;
            });

            const finalData = calculateTotals(newData, columns);

            toast.success(`Formula normalized to ${targetTotal.toFixed(2)}%`);
            return finalData;
        });

        // Emit undo state update
        eventBus.emit("undo-state-updated", {
            canUndo: appStateHistory.canUndo(),
            count: appStateHistory.getUndoCount(),
        });
    };

    const handleMergeDuplicates = () => {
        // Save state before merging
        appStateHistory.push(
            { columns, tableData, formulas, availableFormulas },
            "merge_duplicates",
            `Merged duplicate ingredients`
        );

        setTableData((prev) => {
            // Separate ingredient rows and total rows
            const ingredientRows = prev.filter((row) => !row.isTotal);
            const totalRows = prev.filter((row) => row.isTotal);

            // Check if we have any total rows to preserve
            if (totalRows.length === 0) {
                toast.error("Table structure is incomplete. Please add formulas first.");
                return prev;
            }

            const grouped = new Map<string, any[]>();
            ingredientRows.forEach((row) => {
                const key = row.description.toLowerCase().trim();
                if (!grouped.has(key)) {
                    grouped.set(key, []);
                }
                grouped.get(key)!.push(row);
            });

            const mergedRows: any[] = [];
            let mergedCount = 0;

            grouped.forEach((rows) => {
                if (rows.length === 1) {
                    mergedRows.push(rows[0]);
                } else {
                    mergedCount += rows.length - 1;

                    // Create base merged row with only non-formula properties
                    const mergedRow: any = {
                        id: rows[0].id,
                        description: rows[0].description,
                        costKg: rows[0].costKg,
                        isTotal: false,
                        isFormula: false,
                    };

                    // Get all formula columns
                    const formulaColumns = columns.filter(
                        (col) => col.group === "Formulas" && col.formulaId
                    );

                    // Sum up values for each formula column
                    formulaColumns.forEach((col) => {
                        const total = rows.reduce((sum, row) => {
                            const value = parseFloat(row[col.key]) || 0;
                            return sum + value;
                        }, 0);
                        mergedRow[col.key] = parseFloat(total.toFixed(2));
                    });

                    // Copy any other properties from first row (like level, parentFormulaId, etc.)
                    Object.keys(rows[0]).forEach((key) => {
                        if (
                            key !== 'id' &&
                            key !== 'description' &&
                            key !== 'costKg' &&
                            key !== 'contCost' &&
                            key !== 'isTotal' &&
                            key !== 'isFormula' &&
                            !formulaColumns.find((col) => col.key === key)
                        ) {
                            mergedRow[key] = rows[0][key];
                        }
                    });

                    // Recalculate contribution cost based on active formula
                    if (editableFormula) {
                        const percentage = parseFloat(mergedRow[editableFormula]) || 0;
                        const costPerKg = parseFloat(mergedRow.costKg) || 0;
                        mergedRow.contCost = parseFloat(((percentage * costPerKg) / 1000).toFixed(4));
                    } else {
                        mergedRow.contCost = 0;
                    }

                    mergedRows.push(mergedRow);
                }
            });

            if (mergedCount === 0) {
                toast.error("No duplicate ingredients found");
                return prev;
            }

            // Recalculate totals with merged rows - must include total rows in the data
            const dataWithTotals = [...mergedRows, ...totalRows];
            const dataWithRecalculatedTotals = calculateTotals(dataWithTotals, columns);

            toast.success(
                `Merged ${mergedCount} duplicate ingredient${mergedCount > 1 ? "s" : ""
                }`
            );
            return dataWithRecalculatedTotals;
        });

        // Emit undo state update
        eventBus.emit("undo-state-updated", {
            canUndo: appStateHistory.canUndo(),
            count: appStateHistory.getUndoCount(),
        });
    };

    const handleExplodeFormula = (formulaId: string) => {
        console.log("💣 handleExplodeFormula called for formulaId:", formulaId);

        // Save state before exploding
        appStateHistory.push(
            { columns, tableData, formulas, availableFormulas },
            "explode_formula",
            `Exploded formula: ${formulaId}`
        );

        setTableData((prev) => {
            const formula = formulas.find((f) => f.id === formulaId);
            if (!formula) {
                console.log("❌ Formula not found:", formulaId);
                return prev;
            }

            const formulaGroupRow = prev.find(
                (row) => row.isFormula && row.formulaId === formulaId
            );

            if (!formulaGroupRow) {
                console.log("❌ Formula group row not found for:", formulaId);
                return prev;
            }

            console.log("✅ Exploding formula:", formula.name, "with", formula.ingredients.length, "ingredients");

            const percentage = formulaGroupRow[editableFormula] || 100;
            const multiplier = percentage / 100;

            const newData = prev.filter(
                (row) =>
                    !(row.isFormula && row.formulaId === formulaId) &&
                    row.parentFormulaId !== formulaId
            );

            const totalIndex = newData.findIndex((row) => row.isTotal);
            const insertIndex = totalIndex !== -1 ? totalIndex : newData.length;

            const formulaColumns = columns.filter(
                (col) => col.group === "Formulas" && col.type === "number"
            );

            const individualIngredients = formula.ingredients.map((ing, index) => {
                const ingredient = ingredients.find((i) => i.id === ing.ingredientId);
                const rowData: any = {
                    id: `exploded_ing_${formulaId}_${index}`,
                    description: ing.name,
                    costKg: ingredient?.price || 0,
                    contCost: 0.0,
                    isTotal: false,
                    isFormula: false,
                    level: 0,
                };

                formulaColumns.forEach((col) => {
                    if (col.id === editableFormula) {
                        rowData[col.key] = parseFloat((ing.percentage * multiplier).toFixed(2));
                    } else {
                        rowData[col.key] = 0;
                    }
                });

                return rowData;
            });

            newData.splice(insertIndex, 0, ...individualIngredients);

            toast.success(
                `Formula "${formula.name}" exploded with ${percentage}% of ingredients`
            );

            return calculateTotals(newData, columns);
        });

        // REQUIREMENT 4: Remove the exploded formula from selectedFormulaIds
        // The useEffect in WorkArea will emit the formula-selections-updated event
        console.log("💣 Removing exploded formula from tracking:", formulaId);

        // Clean up pending formulas ref
        pendingFormulaIds.current?.delete(formulaId);

        setSelectedFormulaIds((prev) => {
            const newIds = prev.filter((id) => id !== formulaId);
            console.log("✅ selectedFormulaIds after explosion:", newIds);
            return newIds;
        });

        // Emit undo state update
        eventBus.emit("undo-state-updated", {
            canUndo: appStateHistory.canUndo(),
            count: appStateHistory.getUndoCount(),
        });
    };

    return {
        handleNormalize,
        handleMergeDuplicates,
        handleExplodeFormula,
    };
};
