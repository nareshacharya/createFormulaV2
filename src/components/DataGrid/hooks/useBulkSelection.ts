import { useState, useCallback } from "react";

/**
 * Hook for managing bulk row selection
 */
export const useBulkSelection = (data: any[]) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleRowSelection = useCallback((rowId: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    const selectableRows = data.filter(
      (row) => !row.isTotal && !row.isEmpty
    );
    
    if (selectedRows.size === selectableRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(selectableRows.map((row) => row.id)));
    }
  }, [data, selectedRows.size]);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const isRowSelected = useCallback(
    (rowId: string) => selectedRows.has(rowId),
    [selectedRows]
  );

  const isAllSelected = useCallback(() => {
    const selectableRows = data.filter(
      (row) => !row.isTotal && !row.isEmpty
    );
    return (
      selectableRows.length > 0 && selectedRows.size === selectableRows.length
    );
  }, [data, selectedRows.size]);

  const isSomeSelected = useCallback(() => {
    return selectedRows.size > 0 && !isAllSelected();
  }, [selectedRows.size, isAllSelected]);

  return {
    selectedRows,
    toggleRowSelection,
    toggleSelectAll,
    clearSelection,
    isRowSelected,
    isAllSelected,
    isSomeSelected,
  };
};
