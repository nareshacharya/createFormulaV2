import { useState, useCallback } from "react";
import type { DragState, DataGridRow } from "../types";

/**
 * Hook for managing row drag and drop reordering
 */
export const useRowReordering = (
  data: DataGridRow[],
  onRowReorder?: (rowOrder: string[]) => void
) => {
  const [dragState, setDragState] = useState<DragState>({
    draggedRowId: null,
    dragOverRowId: null,
  });

  const handleDragStart = useCallback((rowId: string) => {
    setDragState((prev) => ({ ...prev, draggedRowId: rowId }));
  }, []);

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
    const { draggedRowId, dragOverRowId } = dragState;

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
          onRowReorder(newOrder.map((row) => row.id));
        }
      }
    }

    setDragState({ draggedRowId: null, dragOverRowId: null });
  }, [dragState, data, onRowReorder]);

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
