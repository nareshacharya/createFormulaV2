import { useCallback } from "react";
import { toast } from "react-hot-toast";
import type { Column } from "../../../components/DataGrid";
import type { Formula } from "../../../services/pega";
import { eventBus } from "../../../utils/bus";
import { isOwnFormula } from "../../../utils/formulaIdGenerator";

export const useRowOperations = (
    tableData: Record<string, unknown>[],
    columns: Column[],
    formulas: Formula[],
    availableFormulas: Formula[],
    pendingFormulaIds: React.MutableRefObject<Set<string> | null>,
    setTableData: (fn: (prev: Record<string, unknown>[]) => Record<string, unknown>[]) => void,
    setGroupedByColumn: (fn: ((prev: string | null) => string | null) | null) => void,
    setSelectedFormulaIds: (fn: (prev: string[]) => string[]) => void,
    setEditableFormula: (formula: string) => void,
    ensureInitialStateSaved: () => void,
    saveStateAfterAction: (action: string, description: string) => void
) => {
    const handleToggleFormulaExpansion = useCallback(
        (formulaId: string) => {
            setTableData((prev) =>
                prev.map((row) =>
                    row.formulaId === formulaId && row.isFormula
                        ? { ...row, isExpanded: !row.isExpanded }
                        : row
                )
            );
        },
        [setTableData]
    );

    const handleRowReorder = useCallback(
        (rowOrder: string[]) => {
            ensureInitialStateSaved();

            setTableData((prev) => {
                // Separate total rows from regular rows
                const totalRows = prev.filter((row) => row.isTotal);
                const regularRows = prev.filter((row) => !row.isTotal);

                // Create a map for quick lookup
                const rowMap = new Map(regularRows.map((row) => [row.id, row]));

                // Reorder according to the new order
                const reorderedRows = rowOrder
                    .map((id) => rowMap.get(id))
                    .filter((row): row is Record<string, unknown> => row !== undefined);

                // Return reordered rows followed by total rows
                return [...reorderedRows, ...totalRows];
            });

            saveStateAfterAction("reorder_rows", "Reordered rows");
        },
        [ensureInitialStateSaved, saveStateAfterAction, setTableData]
    );

    const handleToggleGrouping = useCallback(
        (columnId: string) => {
            setGroupedByColumn((prev) => (prev === columnId ? null : columnId));
        },
        [setGroupedByColumn]
    );

    const handleBulkDelete = useCallback(
        (rowIds: string[]) => {
            ensureInitialStateSaved();

            setTableData((prev) => {
                const rowsToDelete = prev.filter((row) => rowIds.includes(row.id as string));

                // Check if any formula group rows are being deleted
                const deletedFormulaIds = rowsToDelete
                    .filter((row) => row.isFormula && row.formulaId)
                    .map((row) => row.formulaId as string);

                // Remove deleted formulas from tracking
                if (deletedFormulaIds.length > 0) {
                    deletedFormulaIds.forEach((id) => {
                        pendingFormulaIds.current?.delete(id);
                    });
                    setSelectedFormulaIds((prevSelected) =>
                        prevSelected.filter((id) => !deletedFormulaIds.includes(id))
                    );
                }

                // Also check if deleting ingredients that belong to formulas
                const deletedIngredients = rowsToDelete.filter(
                    (row) => row.parentFormulaId
                );
                if (deletedIngredients.length > 0) {

                    // For each formula, check if all its ingredients and group row are being deleted
                    const affectedFormulaIds = new Set(
                        deletedIngredients.map((row) => row.parentFormulaId as string)
                    );
                    const formulasToRemove: string[] = [];

                    affectedFormulaIds.forEach((formulaId) => {
                        const remainingRows = prev.filter(
                            (row) =>
                                !rowIds.includes(row.id as string) &&
                                (row.formulaId === formulaId || row.parentFormulaId === formulaId)
                        );

                        // If no rows remain for this formula, remove it from tracking
                        if (remainingRows.length === 0) {
                            formulasToRemove.push(formulaId);
                        }
                    });

                    if (formulasToRemove.length > 0) {
                        formulasToRemove.forEach((id) => {
                            pendingFormulaIds.current?.delete(id);
                        });
                        setSelectedFormulaIds((prevSelected) =>
                            prevSelected.filter((id) => !formulasToRemove.includes(id))
                        );
                    }
                }

                // Also remove child ingredients of deleted formula groups
                const newData = prev.filter(
                    (row) =>
                        !rowIds.includes(row.id as string) &&
                        !(
                            row.parentFormulaId &&
                            deletedFormulaIds.includes(row.parentFormulaId as string)
                        )
                );

                return newData;
            });

            saveStateAfterAction("bulk_delete", `Deleted ${rowIds.length} row(s)`);

            toast.success(
                `${rowIds.length} row${rowIds.length > 1 ? "s" : ""} deleted`
            );
        },
        [
            ensureInitialStateSaved,
            pendingFormulaIds,
            saveStateAfterAction,
            setSelectedFormulaIds,
            setTableData,
        ]
    );

    const handleSetActiveFormula = useCallback(
        (columnId: string) => {
            // Find the formula associated with this column
            const column = columns.find((col) => col.id === columnId);

            // Check if formula is locked (not owned and not draft)
            if (column && column.formulaId) {
                const isFormulaOwned = isOwnFormula(column.formulaId);

                // Check if formula is in draft status
                const workspaceFormula = formulas.find((f) => f.id === column.formulaId);
                const availableFormula = availableFormulas.find(
                    (f) => f.id === column.formulaId
                );
                const isDraft =
                    workspaceFormula?.status === "draft" ||
                    availableFormula?.status === "draft";

                // Prevent setting locked formulas as active
                if (!isFormulaOwned && !isDraft) {
                    toast.error(
                        "Cannot set locked formula as active. Create a new version to edit."
                    );
                    return;
                }

                // Set as active (use columnId, not formulaId)
                setEditableFormula(columnId);
                
                // Emit event with formula object
                const formula = workspaceFormula || availableFormula;
                if (formula) {
                    eventBus.emit("active-formula-changed", { formula });
                }
                
                toast.success("Formula set as active");
            }
        },
        [columns, formulas, availableFormulas, setEditableFormula]
    );

    return {
        handleToggleFormulaExpansion,
        handleRowReorder,
        handleToggleGrouping,
        handleBulkDelete,
        handleSetActiveFormula,
    };
};
