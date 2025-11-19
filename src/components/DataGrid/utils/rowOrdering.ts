import type { DataGridRow } from "../types";

/**
 * Utility functions for row ordering
 */

export const applyRowOrder = (
    rows: DataGridRow[],
    rowOrder: string[]
): DataGridRow[] => {
    const regularRows = rows.filter((row) => !row.isTotal);
    const totalRows = rows.filter((row) => row.isTotal);

    // Create a map for quick lookup
    const rowMap = new Map(regularRows.map((row) => [row.id, row]));

    // Apply the custom order
    const orderedRows = rowOrder
        .map((id) => rowMap.get(id))
        .filter((row): row is DataGridRow => row !== undefined);

    // Add any rows that weren't in the order (shouldn't happen, but be safe)
    const orderedIds = new Set(rowOrder);
    const missingRows = regularRows.filter((row) => !orderedIds.has(row.id));

    // Return ordered rows followed by any missing rows and then total rows
    return [...orderedRows, ...missingRows, ...totalRows];
};

export const getCurrentRowOrder = (rows: DataGridRow[]): string[] => {
    return rows.filter((row) => !row.isTotal).map((row) => row.id);
};

export const isRowDraggable = (row: DataGridRow): boolean => {
    return !row.isTotal && !row.isEmpty && !row.parentFormulaId;
};
