import { useState, useCallback } from "react";
import type { DragState, DataGridRow } from "../types";

/**
 * Hook for managing row drag and drop reordering
 */
export const useRowReordering = (
    data: DataGridRow[],
    onRowReorder?: (rowOrder: string[]) => void,
    onSortReset?: () => void
) => {
    const [dragState, setDragState] = useState<DragState>({
        draggedRowId: null,
        dragOverRowId: null,
    });

    const handleDragStart = useCallback((rowId: string) => {
        // Reset any active sorting when user starts dragging
        if (onSortReset) {
            onSortReset();
        }
        setDragState((prev) => ({ ...prev, draggedRowId: rowId }));
    }, [onSortReset]);

    const handleDragOver = useCallback(
        (e: React.DragEvent, rowId: string) => {
            e.preventDefault();
            setDragState((prev) => {
                if (prev.dragOverRowId !== rowId) {
                    return { ...prev, dragOverRowId: rowId };
                }
                return prev;
            });
        },
        []
    );

    const handleDragEnd = useCallback(() => {
        setDragState((currentDragState) => {
            const { draggedRowId, dragOverRowId } = currentDragState;

            if (draggedRowId && dragOverRowId && draggedRowId !== dragOverRowId) {
                // Find non-total rows only
                const reorderableRows = data.filter((row) => !row.isTotal);
                const draggedIndex = reorderableRows.findIndex(
                    (row) => row.id === draggedRowId
                );
                const targetIndex = reorderableRows.findIndex(
                    (row) => row.id === dragOverRowId
                );

                if (draggedIndex !== -1 && targetIndex !== -1) {
                    // Create new order
                    const newOrder = [...reorderableRows];
                    const [removed] = newOrder.splice(draggedIndex, 1);
                    newOrder.splice(targetIndex, 0, removed);

                    // Notify parent of new order
                    if (onRowReorder) {
                        console.log("Row reordering:", { draggedRowId, dragOverRowId, newOrder: newOrder.map(r => r.id) });
                        onRowReorder(newOrder.map((row) => row.id));
                    }
                }
            }

            // Reset drag state
            return { draggedRowId: null, dragOverRowId: null };
        });
    }, [data, onRowReorder]);

    const handleDragLeave = useCallback(() => {
        setDragState((prev) => ({ ...prev, dragOverRowId: null }));
    }, []);

    return {
        dragState,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragLeave,
    };
};
