import type { Dispatch, SetStateAction } from "react";
import { toast } from "react-hot-toast";
import type { Column } from "../../../components/DataGrid";
import type { Formula } from "../../../services/pega";
import type { WorkspaceContextType } from "../../../context/WorkspaceContext";
import { eventBus } from "../../../utils/bus";
import { calculateTotals } from "../../../utils/formulaCalculations";
import { isFormulaEditable } from "../../../utils/formulaUtils";
import { isOwnFormula } from "../../../utils/formulaIdGenerator";
import type { StateHistoryManager } from "../../../utils/stateHistory";

interface UseDataGridHandlersProps {
    columns: Column[];
    selectedFormulaIds: string[]; // Reserved for future use
    editableFormula: string;
    formulas: Formula[];
    availableFormulas: Formula[];
    tableData: any[];
    pendingFormulaIds: React.RefObject<Set<string>>;
    workspaceHistory: StateHistoryManager;
    workspace: WorkspaceContextType;
    setTableData: Dispatch<SetStateAction<any[]>>;
    setColumns: Dispatch<SetStateAction<Column[]>>;
    setSelectedFormulaIds: Dispatch<SetStateAction<string[]>>;
    setEditableFormula: Dispatch<SetStateAction<string>>;
}

export const useDataGridHandlers = ({
    columns,
    selectedFormulaIds: _selectedFormulaIds, // Reserved for future use
    editableFormula,
    formulas,
    availableFormulas,
    tableData,
    pendingFormulaIds,
    workspaceHistory,
    setTableData,
    setColumns,
    setSelectedFormulaIds,
    setEditableFormula,
}: UseDataGridHandlersProps) => {
    const handleRowDelete = (rowId: string) => {
        console.log("🔥 handleRowDelete ENTRY - rowId:", rowId);

        // Save state before deletion
        workspaceHistory.push(
            { columns, tableData, formulas, availableFormulas },
            "delete_row",
            `Deleted row: ${rowId}`
        );

        setTableData((prev) => {
            const rowToDelete = prev.find((row) => row.id === rowId);
            console.log("🗑️ handleRowDelete called:", {
                rowId,
                rowToDelete,
                isFormula: rowToDelete?.isFormula,
                formulaId: rowToDelete?.formulaId,
                parentFormulaId: rowToDelete?.parentFormulaId
            });

            // If deleting a formula group row, also delete its ingredients and update tracking
            if (rowToDelete?.isFormula && rowToDelete?.formulaId) {
                console.log("📋 Deleting formula GROUP row:", rowToDelete.formulaId);
                let newData = prev.filter((row) => row.id !== rowId);
                newData = newData.filter(
                    (row) => row.parentFormulaId !== rowToDelete.formulaId
                );

                // Remove from tracking sets and update state
                pendingFormulaIds.current?.delete(rowToDelete.formulaId);
                setSelectedFormulaIds((prevSelected) =>
                    prevSelected.filter((id) => id !== rowToDelete.formulaId)
                );

                // The useEffect in WorkArea will emit the formula-selections-updated event
                console.log("✅ Formula group row deleted, selectedFormulaIds will be updated");

                return newData;
            }

            // For regular ingredient rows: check if they have data in formula columns
            if (!rowToDelete?.isTotal && !rowToDelete?.isFormula) {
                // Get all formula columns
                const formulaColumns = columns.filter(
                    (col) => col.group === "Formulas" && col.formulaId
                );

                // Check if this row has any data in formula columns
                const hasDataInFormulas = formulaColumns.some(
                    (col) => rowToDelete?.[col.id] && rowToDelete[col.id] !== 0
                );

                if (hasDataInFormulas) {
                    // Row has data - set formula values to 0 instead of deleting the row
                    console.log(`Row ${rowId} has formula data - setting values to 0 instead of deleting`);
                    return prev.map((row) => {
                        if (row.id === rowId) {
                            const updatedRow = { ...row };
                            // Set all formula column values to 0
                            formulaColumns.forEach((col) => {
                                updatedRow[col.id] = 0;
                            });
                            return updatedRow;
                        }
                        return row;
                    });
                }
            }

            // Default behavior: delete the row
            let newData = prev.filter((row) => row.id !== rowId);

            // If deleting an ingredient that belongs to a formula, check if all formula ingredients are gone
            if (rowToDelete?.parentFormulaId) {
                console.log("📋 Deleting ingredient from formula:", rowToDelete.parentFormulaId);

                // Check if this is the last ingredient for this formula
                const remainingIngredientsForFormula = newData.filter(
                    (row) => row.parentFormulaId === rowToDelete.parentFormulaId
                );

                // Also check if the formula group row still exists
                const formulaGroupRow = newData.find(
                    (row) => row.isFormula && row.formulaId === rowToDelete.parentFormulaId
                );

                // If no ingredients left and no group row, remove formula from tracking
                if (remainingIngredientsForFormula.length === 0 && !formulaGroupRow) {
                    console.log("✅ Last ingredient deleted, removing formula from tracking:", rowToDelete.parentFormulaId);
                    pendingFormulaIds.current?.delete(rowToDelete.parentFormulaId);
                    setSelectedFormulaIds((prevSelected) =>
                        prevSelected.filter((id) => id !== rowToDelete.parentFormulaId)
                    );
                }
            }

            return newData;
        });

        // Emit undo state update
        eventBus.emit("undo-state-updated", {
            canUndo: workspaceHistory.canUndo(),
            count: workspaceHistory.getUndoCount(),
        });
    };

    const handleCellEdit = (rowId: string, columnId: string, value: any) => {
        // Save state before editing
        workspaceHistory.push(
            { columns, tableData, formulas, availableFormulas },
            "edit_cell",
            `Edited cell: row ${rowId}, column ${columnId}`
        );

        setTableData((prev) => {
            const updatedRow = prev.find((row) => row.id === rowId);
            let newData = prev.map((row) => {
                if (row.id === rowId) {
                    const newRow = { ...row, [columnId]: parseFloat(value) || 0 };

                    // If editing the active formula column cell, recalculate contribution cost
                    const column = columns.find((col) => col.id === columnId);
                    if (
                        column &&
                        column.group === "Formulas" &&
                        columnId === editableFormula &&
                        !row.isTotal
                    ) {
                        const percentage = parseFloat(value) || 0;
                        const costPerKg = row.costKg || 0;
                        newRow.contCost = parseFloat(((percentage * costPerKg) / 1000).toFixed(4));
                    }

                    return newRow;
                }
                return row;
            });

            // If editing a formula row in active formula column, scale all child ingredients
            if (
                updatedRow &&
                updatedRow.isFormula &&
                updatedRow.formulaId &&
                columnId === editableFormula
            ) {
                const formulaId = updatedRow.formulaId;
                const newFormulaPercentage = parseFloat(value) || 0;

                // Update all child ingredient rows of this formula
                newData = newData.map((childRow) => {
                    if (childRow.parentFormulaId === formulaId && childRow.originalPercentage !== undefined) {
                        // Scale the child ingredient value: (originalPercentage * newFormulaPercentage) / 100
                        const scaledValue = parseFloat(
                            ((childRow.originalPercentage * newFormulaPercentage) / 100).toFixed(2)
                        );
                        return {
                            ...childRow,
                            [columnId]: scaledValue,
                            contCost: parseFloat(((scaledValue * childRow.costKg) / 1000).toFixed(4)),
                        };
                    }
                    return childRow;
                });
            }

            // Show toast for target total updates
            if (updatedRow?.totalType === "target") {
                toast.success(
                    `Target total updated to ${parseFloat(value).toFixed(2)}%`
                );
            }

            return calculateTotals(newData, columns);
        });

        // Emit undo state update
        eventBus.emit("undo-state-updated", {
            canUndo: workspaceHistory.canUndo(),
            count: workspaceHistory.getUndoCount(),
        });
    };

    const handleDeleteColumn = (columnId: string) => {
        const columnToDelete = columns.find((col) => col.id === columnId);
        if (!columnToDelete) return;

        // Save state before deletion
        workspaceHistory.push(
            { columns, tableData, formulas, availableFormulas },
            "delete_column",
            `Deleted column: ${columnToDelete.title}`
        );

        setColumns((prev) => prev.filter((col) => col.id !== columnId));

        // When deleting a formula column, also clean up ingredients that ONLY belong to that formula
        setTableData((prev) => {
            let newData = prev.map((row) => {
                const { [columnId]: deleted, ...rest } = row;
                return rest;
            });

            // If it's a formula column, check if any ingredients should be removed
            if (columnToDelete.formulaId) {
                // Get all formula columns (excluding the one being deleted)
                const remainingFormulaColumns = columns.filter(
                    (col) =>
                        col.group === "Formulas" && col.formulaId && col.id !== columnId
                );

                // Check each ingredient row that belongs to the deleted formula
                newData = newData.filter((row) => {
                    // Skip total rows
                    if (row.isTotal) {
                        return true;
                    }

                    // If this ingredient belongs to the deleted formula
                    if (row.parentFormulaId === columnToDelete.formulaId) {
                        // Check if this ingredient has data in any remaining formula column
                        const hasDataInOtherFormulas = remainingFormulaColumns.some(
                            (col) => row[col.id] && row[col.id] !== 0
                        );

                        // If no data in other formulas, remove the ingredient row
                        if (!hasDataInOtherFormulas) {
                            console.log(
                                `Removing ingredient row ${row.id} - only belonged to deleted formula ${columnToDelete.formulaId}`
                            );
                            return false; // Remove this row
                        }
                    }

                    return true; // Keep the row
                });
            }

            return newData;
        });

        // If it's a formula column, update selected formula IDs and unlock if editable
        if (columnToDelete.formulaId) {
            // Unlock formula if it's editable
            const formula = formulas.find((f) => f.id === columnToDelete.formulaId) || 
                           availableFormulas.find((f) => f.id === columnToDelete.formulaId);
            if (formula && isFormulaEditable(formula)) {
                workspace.unlockFormula(columnToDelete.formulaId);
            }

            setSelectedFormulaIds((prev) =>
                prev.filter((id) => id !== columnToDelete.formulaId)
            );

            // The useEffect in WorkArea will emit the formula-selections-updated event

            // If this was the active formula, set another EDITABLE formula as active (prefer owned/draft formulas)
            if (editableFormula === columnId) {
                const remainingFormulaColumns = columns.filter(
                    (col) =>
                        col.group === "Formulas" && col.formulaId && col.id !== columnId
                );

                // Find an editable formula (owned or draft status)
                let nextEditableColumn = null;
                for (const col of remainingFormulaColumns) {
                    const workspaceFormula = formulas.find(
                        (f) => f.id === col.formulaId
                    );
                    const availableFormula = availableFormulas.find(
                        (f) => f.id === col.formulaId
                    );
                    const formula = workspaceFormula || availableFormula;

                    // Check if formula is owned or in draft status
                    const isFormulaOwned = col.formulaId ? isOwnFormula(col.formulaId) : false;
                    if (
                        formula &&
                        (formula.status === "draft" || isFormulaOwned)
                    ) {
                        nextEditableColumn = col;
                        break;
                    }
                }

                if (nextEditableColumn) {
                    setEditableFormula(nextEditableColumn.id);
                    const formula = formulas.find(
                        (f) => f.id === nextEditableColumn.formulaId
                    );
                    if (formula) {
                        eventBus.emit("active-formula-changed", { formula });
                    }
                } else {
                    // No editable formulas left
                    setEditableFormula("");
                    eventBus.emit("active-formula-changed", { formula: null });
                }
            }
        }

        // If it's an attribute column, update selected attributes
        if (columnToDelete.attributeId) {
            const remainingAttributeColumns = columns.filter(
                (col) =>
                    col.group === "Attributes" && col.attributeId && col.id !== columnId
            );
            const newSelectedAttributes = remainingAttributeColumns.map(
                (col) => col.attributeId!
            );
            eventBus.emit("work-area-attributes-updated", {
                selectedAttributes: newSelectedAttributes,
            });
        }

        // Emit undo state update
        eventBus.emit("undo-state-updated", {
            canUndo: workspaceHistory.canUndo(),
            count: workspaceHistory.getUndoCount(),
        });
    };

    const handleColumnReorder = (fromIndex: number, toIndex: number) => {
        // Save state before reordering
        workspaceHistory.push(
            { columns, tableData, formulas, availableFormulas },
            "reorder_columns",
            `Reordered columns: ${fromIndex} to ${toIndex}`
        );

        setColumns((prev) => {
            const newColumns = [...prev];
            const [movedColumn] = newColumns.splice(fromIndex, 1);
            newColumns.splice(toIndex, 0, movedColumn);
            return newColumns;
        });

        // Emit undo state update
        eventBus.emit("undo-state-updated", {
            canUndo: workspaceHistory.canUndo(),
            count: workspaceHistory.getUndoCount(),
        });
    };

    return {
        handleRowDelete,
        handleCellEdit,
        handleDeleteColumn,
        handleColumnReorder,
    };
};
