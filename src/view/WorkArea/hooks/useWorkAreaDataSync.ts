import { useEffect } from "react";
import { eventBus } from "../../../utils/bus";
import type { Column } from "../../../components/DataGrid";
import type { Formula } from "../../../services/pega";

interface WorkspaceContextType {
    activeTabId: string;
    activeWorkspace: {
        columns: Column[];
        tableData: Record<string, unknown>[];
        formulas: Formula[];
        selectedFormulaIds: string[];
        editableFormula: string;
        selectedAttributes: string[];
        selectedFormulas: Formula[];
    };
    updateWorkspaceData: (data: {
        columns: Column[];
        tableData: Record<string, unknown>[];
        formulas: Formula[];
        selectedFormulaIds: string[];
        editableFormula: string;
        selectedAttributes: string[];
        selectedFormulas: Formula[];
    }) => void;
}

export const useWorkAreaDataSync = (
    workspace: WorkspaceContextType,
    columns: Column[],
    tableData: Record<string, unknown>[],
    formulas: Formula[],
    selectedFormulaIds: string[],
    editableFormula: string,
    selectedAttributes: string[],
    selectedFormulas: string[],
    setColumns: (cols: Column[]) => void,
    setTableData: (data: Record<string, unknown>[]) => void,
    setFormulasState: (f: Formula[]) => void,
    setSelectedFormulaIds: (ids: string[]) => void,
    setEditableFormula: (formula: string) => void,
    setSelectedAttributes: (attrs: string[]) => void,
    setSelectedFormulasState: (f: string[]) => void
) => {
    // Restore workspace data when active workspace changes (tab switch)
    useEffect(() => {
        const wsData = workspace.activeWorkspace;

        // Ensure all ingredient rows have ingredientId field for export
        const migratedTableData = wsData.tableData.map((row) => {
            // For ingredient rows, ensure ingredientId field exists even if it wasn't set before
            if (!row.isTotal && !row.isFormula && !("ingredientId" in row)) {
                return {
                    ...row,
                    ingredientId: undefined,
                };
            }
            return row;
        });

        setColumns(wsData.columns);
        setTableData(migratedTableData);
        setFormulasState(wsData.formulas);
        setSelectedFormulaIds(wsData.selectedFormulaIds);
        setEditableFormula(wsData.editableFormula || "");
        setSelectedAttributes(wsData.selectedAttributes);

        // Convert Formula[] to string[] for local state
        const formulaIds = wsData.selectedFormulas.map((f) => f.id);
        setSelectedFormulasState(formulaIds);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspace.activeTabId]);

    // Save workspace data whenever it changes
    useEffect(() => {
        // Convert string[] to Formula[] for workspace context
        const selectedFormulaObjects = formulas.filter((f) =>
            selectedFormulas.includes(f.id)
        );

        workspace.updateWorkspaceData({
            columns,
            tableData,
            formulas,
            selectedFormulaIds,
            editableFormula,
            selectedAttributes,
            selectedFormulas: selectedFormulaObjects,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        columns,
        tableData,
        formulas,
        selectedFormulaIds,
        editableFormula,
        selectedAttributes,
        selectedFormulas,
    ]);

    // Sync selected formula IDs with LibraryPanel whenever they change
    useEffect(() => {
        eventBus.emit("formula-selections-updated", {
            count: selectedFormulaIds.length,
            selectedIds: selectedFormulaIds,
        });
    }, [selectedFormulaIds]);

    // Sync selected ingredients with LibraryPanel whenever tableData changes
    useEffect(() => {
        const ingredientNames = tableData
            .filter((row) => !row.isTotal && !row.isFormula)
            .map((row) => row.description);
        eventBus.emit("work-area-updated", {
            ingredients: ingredientNames,
        });
    }, [tableData]);
};
