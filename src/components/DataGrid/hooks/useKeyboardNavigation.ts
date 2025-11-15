import { useState, useEffect, useCallback, useRef } from "react";
import type { Column } from "../../DataGrid";

interface NavigationCell {
    rowId: string;
    columnId: string;
}

interface DataRow {
    id: string;
    isTotal?: boolean;
    totalType?: string;
    isEmpty?: boolean;
    [key: string]: unknown;
}

interface UseKeyboardNavigationProps {
    data: DataRow[];
    columns: Column[];
    editableFormula?: string;
    onCellEdit?: (rowId: string, columnId: string, value: unknown) => void;
    onNavigate?: (cell: NavigationCell) => void;
}

interface UseKeyboardNavigationReturn {
    focusedCell: NavigationCell | null;
    editingCell: NavigationCell | null;
    editValue: string;
    handleCellFocus: (rowId: string, columnId: string) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    handleInputChange: (value: string) => void;
    clearFocus: () => void;
    isEditing: boolean;
}

/**
 * Custom hook for keyboard navigation in DataGrid
 * 
 * Features:
 * - Arrow key navigation (up, down, left, right)
 * - Direct typing to replace cell value (no cursor visible)
 * - Enter to save and move down
 * - Escape to cancel editing
 * - Tab to move right, Shift+Tab to move left
 * - Auto-focus first editable cell when formula becomes active
 */
export const useKeyboardNavigation = ({
    data,
    columns,
    editableFormula,
    onCellEdit,
    onNavigate,
}: UseKeyboardNavigationProps): UseKeyboardNavigationReturn => {
    const [focusedCell, setFocusedCell] = useState<NavigationCell | null>(null);
    const [editingCell, setEditingCell] = useState<NavigationCell | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const previousFormulaRef = useRef<string | undefined>(editableFormula);

    // Get editable cells (only in active formula column)
    const getEditableCells = useCallback((): NavigationCell[] => {
        const editableCells: NavigationCell[] = [];

        // Filter for regular rows (not total rows) and active formula column
        data.forEach((row) => {
            if (row.isTotal) {
                // Only include target total row for editing
                if (row.totalType === "target") {
                    const column = columns.find((col) => col.id === editableFormula);
                    if (column && column.editable && !column.fixed) {
                        editableCells.push({
                            rowId: row.id,
                            columnId: editableFormula,
                        });
                    }
                }
            } else if (!row.isEmpty) {
                // Regular rows
                const column = columns.find((col) => col.id === editableFormula);
                if (column && column.editable && !column.fixed) {
                    editableCells.push({
                        rowId: row.id,
                        columnId: editableFormula,
                    });
                }
            }
        });

        return editableCells;
    }, [data, columns, editableFormula]);

    // Auto-focus first cell when formula becomes active
    useEffect(() => {
        if (editableFormula && editableFormula !== previousFormulaRef.current) {
            const editableCells = getEditableCells();
            if (editableCells.length > 0) {
                const firstCell = editableCells[0];

                setFocusedCell(firstCell);
                setEditingCell(null);

                // Initialize editValue with the first cell's current value
                const row = data.find((r) => r.id === firstCell.rowId);
                const column = columns.find((col) => col.id === firstCell.columnId);
                if (row && column) {
                    const currentValue = row[column.key];
                    setEditValue(currentValue !== null && currentValue !== undefined ? String(currentValue) : "");
                }

                onNavigate?.(firstCell);
            }
        }
        previousFormulaRef.current = editableFormula;
    }, [editableFormula, getEditableCells, onNavigate, data, columns]);

    // Handle cell focus (when user clicks on a cell)
    const handleCellFocus = useCallback(
        (rowId: string, columnId: string) => {
            // Only allow focusing cells in the active formula column
            if (columnId !== editableFormula) return;

            const row = data.find((r) => r.id === rowId);
            const column = columns.find((col) => col.id === columnId);

            // Check if it's target total in active formula
            const isTargetTotalInActiveFormula =
                row?.isTotal &&
                row?.totalType === "target" &&
                columnId === editableFormula;

            // Prevent focusing non-editable cells
            if (
                (row?.isTotal && !isTargetTotalInActiveFormula) ||
                !column?.editable ||
                column?.fixed ||
                row?.isEmpty
            ) {
                return;
            }

            // Save the current editing cell before moving to new cell
            if (editingCell && (editingCell.rowId !== rowId || editingCell.columnId !== columnId)) {
                const numericValue = parseFloat(editValue);
                const finalValue = Number.isNaN(numericValue) ? editValue : numericValue;
                onCellEdit?.(editingCell.rowId, editingCell.columnId, finalValue);
            }

            setFocusedCell({ rowId, columnId });
            setEditingCell(null);
            // Initialize editValue with current cell value
            const currentValue = row[column.key];
            setEditValue(currentValue !== null && currentValue !== undefined ? String(currentValue) : "");
            onNavigate?.({ rowId, columnId });
        },
        [editableFormula, data, columns, onNavigate, editingCell, editValue, onCellEdit]
    );

    // Navigate to the next/previous cell
    const navigateToCell = useCallback(
        (direction: "up" | "down" | "left" | "right") => {
            if (!focusedCell) return;

            const editableCells = getEditableCells();
            const currentIndex = editableCells.findIndex(
                (cell) =>
                    cell.rowId === focusedCell.rowId &&
                    cell.columnId === focusedCell.columnId
            );

            if (currentIndex === -1) return;

            let nextIndex = currentIndex;

            switch (direction) {
                case "down":
                case "right":
                    nextIndex = currentIndex + 1;
                    if (nextIndex >= editableCells.length) {
                        nextIndex = 0; // Wrap to first cell
                    }
                    break;
                case "up":
                case "left":
                    nextIndex = currentIndex - 1;
                    if (nextIndex < 0) {
                        nextIndex = editableCells.length - 1; // Wrap to last cell
                    }
                    break;
            }

            const nextCell = editableCells[nextIndex];
            if (nextCell) {
                setFocusedCell(nextCell);
                setEditingCell(null);

                // Initialize editValue with the next cell's current value
                const row = data.find((r) => r.id === nextCell.rowId);
                const column = columns.find((col) => col.id === nextCell.columnId);
                if (row && column) {
                    const currentValue = row[column.key];
                    setEditValue(currentValue !== null && currentValue !== undefined ? String(currentValue) : "");
                }

                onNavigate?.(nextCell);
            }
        },
        [focusedCell, getEditableCells, onNavigate, data, columns]
    );

    // Save the current cell value
    const saveCell = useCallback(() => {
        if (!editingCell) return;

        // Parse numeric value
        const numericValue = parseFloat(editValue);
        const finalValue = Number.isNaN(numericValue) ? editValue : numericValue;

        onCellEdit?.(editingCell.rowId, editingCell.columnId, finalValue);
        setEditingCell(null);
        setEditValue("");
    }, [editingCell, editValue, onCellEdit]);

    // Handle keyboard events
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!focusedCell) return;

            // If currently editing
            if (editingCell) {
                switch (e.key) {
                    case "Enter":
                        e.preventDefault();
                        saveCell();
                        navigateToCell("down");
                        break;
                    case "Escape":
                        e.preventDefault();
                        setEditingCell(null);
                        setEditValue("");
                        break;
                    case "ArrowDown":
                        e.preventDefault();
                        saveCell();
                        navigateToCell("down");
                        break;
                    case "ArrowUp":
                        e.preventDefault();
                        saveCell();
                        navigateToCell("up");
                        break;
                    case "ArrowRight":
                        // Allow right arrow in editing mode for cursor movement
                        if (e.target instanceof HTMLInputElement) {
                            const input = e.target;
                            if (input.selectionStart === input.value.length) {
                                e.preventDefault();
                                saveCell();
                                navigateToCell("right");
                            }
                        }
                        break;
                    case "ArrowLeft":
                        // Allow left arrow in editing mode for cursor movement
                        if (e.target instanceof HTMLInputElement) {
                            const input = e.target;
                            if (input.selectionStart === 0) {
                                e.preventDefault();
                                saveCell();
                                navigateToCell("left");
                            }
                        }
                        break;
                    case "Tab":
                        e.preventDefault();
                        saveCell();
                        navigateToCell(e.shiftKey ? "left" : "right");
                        break;
                }
            } else {
                // Not editing - handle navigation and start editing
                switch (e.key) {
                    case "Enter":
                    case " ": {
                        e.preventDefault();
                        // Start editing with empty value
                        setEditingCell(focusedCell);
                        setEditValue("");
                        break;
                    }
                    case "ArrowDown":
                        e.preventDefault();
                        navigateToCell("down");
                        break;
                    case "ArrowUp":
                        e.preventDefault();
                        navigateToCell("up");
                        break;
                    case "ArrowRight":
                        e.preventDefault();
                        navigateToCell("right");
                        break;
                    case "ArrowLeft":
                        e.preventDefault();
                        navigateToCell("left");
                        break;
                    case "Tab":
                        e.preventDefault();
                        navigateToCell(e.shiftKey ? "left" : "right");
                        break;
                    case "Escape":
                        e.preventDefault();
                        setFocusedCell(null);
                        break;
                    default:
                        // Start editing with the typed character (if it's numeric or dot)
                        if (
                            e.key.length === 1 &&
                            !e.ctrlKey &&
                            !e.metaKey &&
                            !e.altKey &&
                            /[0-9.]/.test(e.key) // Only allow numbers and dot
                        ) {
                            e.preventDefault();
                            setEditingCell(focusedCell);
                            setEditValue(e.key);
                        }
                        break;
                }
            }
        },
        [focusedCell, editingCell, saveCell, navigateToCell]
    );

    // Handle input change with validation
    const handleInputChange = useCallback((value: string) => {
        // Only allow numbers and single dot, no negative values
        const cleaned = value.replace(/[^0-9.]/g, '');
        // Ensure only one dot
        const parts = cleaned.split('.');
        const sanitized = parts.length > 2 ? `${parts[0]  }.${  parts.slice(1).join('')}` : cleaned;
        setEditValue(sanitized);
    }, []);

    // Clear focus
    const clearFocus = useCallback(() => {
        setFocusedCell(null);
        setEditingCell(null);
        setEditValue("");
    }, []);

    return {
        focusedCell,
        editingCell,
        editValue,
        handleCellFocus,
        handleKeyDown,
        handleInputChange,
        clearFocus,
        isEditing: !!editingCell,
    };
};
