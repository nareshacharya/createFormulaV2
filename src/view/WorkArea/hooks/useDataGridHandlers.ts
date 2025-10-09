import type { Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";
import type { Column } from "../../../components/DataGrid";
import type { Formula } from "../../../services/pega";
import { calculateTotals } from "../../../utils/formulaCalculations";
import { eventBus } from "../../../utils/bus";

interface UseDataGridHandlersProps {
    columns: Column[];
    selectedFormulaIds: string[];
    editableFormula: string;
    formulas: Formula[];
    pendingFormulaIds: React.RefObject<Set<string>>;
    setTableData: Dispatch<SetStateAction<any[]>>;
    setColumns: Dispatch<SetStateAction<Column[]>>;
    setSelectedFormulaIds: Dispatch<SetStateAction<string[]>>;
    setEditableFormula: Dispatch<SetStateAction<string>>;
}

export const useDataGridHandlers = ({
    columns,
    selectedFormulaIds,
    editableFormula,
    formulas,
    pendingFormulaIds,
    setTableData,
    setColumns,
    setSelectedFormulaIds,
    setEditableFormula,
}: UseDataGridHandlersProps) => {
    const handleRowDelete = (rowId: string) => {
        setTableData((prev) => {
            const rowToDelete = prev.find((row) => row.id === rowId);
            let newData = prev.filter((row) => row.id !== rowId);

            // If deleting a formula group, also delete its ingredients and update tracking
            if (rowToDelete?.isFormula) {
                newData = newData.filter(
                    (row) => row.parentFormulaId !== rowToDelete.formulaId
                );

                // Remove from tracking sets and update state
                pendingFormulaIds.current?.delete(rowToDelete.formulaId);
                const updatedSelectedIds = selectedFormulaIds.filter(
                    (id) => id !== rowToDelete.formulaId
                );
                setSelectedFormulaIds(updatedSelectedIds);
            }

            return newData;
        });
    };

    const handleCellEdit = (rowId: string, columnId: string, value: any) => {
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
    };

    const handleDeleteColumn = (columnId: string) => {
        const columnToDelete = columns.find((col) => col.id === columnId);
        if (!columnToDelete) return;

        setColumns((prev) => prev.filter((col) => col.id !== columnId));

        setTableData((prev) =>
            prev.map((row) => {
                const { [columnId]: deleted, ...rest } = row;
                return rest;
            })
        );

        // If it's a formula column, update selected formula IDs
        if (columnToDelete.formulaId) {
            const newSelectedIds = selectedFormulaIds.filter(
                (id) => id !== columnToDelete.formulaId
            );
            setSelectedFormulaIds(newSelectedIds);

            const newCount = columns.filter(
                (col) =>
                    col.group === "Formulas" && col.formulaId && col.id !== columnId
            ).length;
            eventBus.emit("formula-selections-updated", {
                count: newCount,
                selectedIds: newSelectedIds,
            });

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
    };

    const handleColumnReorder = (fromIndex: number, toIndex: number) => {
        setColumns((prev) => {
            const newColumns = [...prev];
            const [movedColumn] = newColumns.splice(fromIndex, 1);
            newColumns.splice(toIndex, 0, movedColumn);
            return newColumns;
        });
    };

    return {
        handleRowDelete,
        handleCellEdit,
        handleDeleteColumn,
        handleColumnReorder,
    };
};
