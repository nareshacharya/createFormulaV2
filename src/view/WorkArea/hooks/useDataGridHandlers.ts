import type { Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";
import type { Column } from "../../../components/DataGrid";
import type { Formula } from "../../../services/pega";
import { eventBus } from "../../../utils/bus";
import { calculateTotals } from "../../../utils/formulaCalculations";
import { appStateHistory } from "../../../utils/stateHistory";

interface UseDataGridHandlersProps {
    columns: Column[];
    _selectedFormulaIds: string[];
    editableFormula: string;
    formulas: Formula[];
    availableFormulas: Formula[];
    tableData: any[];
    pendingFormulaIds: React.RefObject<Set<string>>;
    setTableData: Dispatch<SetStateAction<any[]>>;
    setColumns: Dispatch<SetStateAction<Column[]>>;
    setSelectedFormulaIds: Dispatch<SetStateAction<string[]>>;
    setEditableFormula: Dispatch<SetStateAction<string>>;
}

export const useDataGridHandlers = ({
    columns,
    _selectedFormulaIds,
    editableFormula,
    formulas,
    availableFormulas,
    tableData,
    pendingFormulaIds,
    setTableData,
    setColumns,
    setSelectedFormulaIds,
    setEditableFormula,
}: UseDataGridHandlersProps) => {
    const handleRowDelete = (rowId: string) => {
        console.log("🔥 handleRowDelete ENTRY - rowId:", rowId);

        // Save state before deletion
        appStateHistory.push(
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
            let newData = prev.filter((row) => row.id !== rowId);

            // If deleting a formula group row, also delete its ingredients and update tracking
            if (rowToDelete?.isFormula && rowToDelete?.formulaId) {
                console.log("📋 Deleting formula GROUP row:", rowToDelete.formulaId);
                newData = newData.filter(
                    (row) => row.parentFormulaId !== rowToDelete.formulaId
                );

                // Remove from tracking sets and update state
                pendingFormulaIds.current?.delete(rowToDelete.formulaId);
                setSelectedFormulaIds((prev) =>
                    prev.filter((id) => id !== rowToDelete.formulaId)
                );

                // The useEffect in WorkArea will emit the formula-selections-updated event
                console.log("✅ Formula group row deleted, selectedFormulaIds will be updated");
            }
            // If deleting an ingredient that belongs to a formula, check if all formula ingredients are gone
            else if (rowToDelete?.parentFormulaId) {
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
                    setSelectedFormulaIds((prev) =>
                        prev.filter((id) => id !== rowToDelete.parentFormulaId)
                    );
                }
            }

            return newData;
        });

        // Emit undo state update
        eventBus.emit("undo-state-updated", {
            canUndo: appStateHistory.canUndo(),
            count: appStateHistory.getUndoCount(),
        });
    };

    const handleCellEdit = (rowId: string, columnId: string, value: any) => {
        // Save state before editing
        appStateHistory.push(
            { columns, tableData, formulas, availableFormulas },
            "edit_cell",
            `Edited cell: row ${rowId}, column ${columnId}`
        );

        setTableData((prev) => {
            const updatedRow = prev.find((row) => row.id === rowId);
            const newData = prev.map((row) => {
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
            canUndo: appStateHistory.canUndo(),
            count: appStateHistory.getUndoCount(),
        });
    };

    const handleDeleteColumn = (columnId: string) => {
        const columnToDelete = columns.find((col) => col.id === columnId);
        if (!columnToDelete) return;

        // Save state before deletion
        appStateHistory.push(
            { columns, tableData, formulas, availableFormulas },
            "delete_column",
            `Deleted column: ${columnToDelete.title}`
        );

        setColumns((prev) => prev.filter((col) => col.id !== columnId));

        setTableData((prev) =>
            prev.map((row) => {
                const { [columnId]: deleted, ...rest } = row;
                return rest;
            })
        );

        // If it's a formula column, update selected formula IDs
        if (columnToDelete.formulaId) {
            setSelectedFormulaIds((prev) =>
                prev.filter((id) => id !== columnToDelete.formulaId)
            );

            // The useEffect in WorkArea will emit the formula-selections-updated event

            // If this was the active formula, set another formula as active
            if (editableFormula === columnId) {
                const remainingFormulaColumns = columns.filter(
                    (col) =>
                        col.group === "Formulas" && col.formulaId && col.id !== columnId
                );
                if (remainingFormulaColumns.length > 0) {
                    setEditableFormula(remainingFormulaColumns[0].id);
                    const formula = formulas.find(
                        (f) => f.id === remainingFormulaColumns[0].formulaId
                    );
                    if (formula) {
                        eventBus.emit("active-formula-changed", { formula });
                    }
                } else {
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
            canUndo: appStateHistory.canUndo(),
            count: appStateHistory.getUndoCount(),
        });
    };

    const handleColumnReorder = (fromIndex: number, toIndex: number) => {
        // Save state before reordering
        appStateHistory.push(
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
            canUndo: appStateHistory.canUndo(),
            count: appStateHistory.getUndoCount(),
        });
    };

    return {
        handleRowDelete,
        handleCellEdit,
        handleDeleteColumn,
        handleColumnReorder,
    };
};
