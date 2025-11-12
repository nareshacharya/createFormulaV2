import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useClickOutside } from "../hooks/useClickOutside";
import { useRowReordering } from "./DataGrid/hooks/useRowReordering";
import { useBulkSelection } from "./DataGrid/hooks/useBulkSelection";
import { useKeyboardNavigation } from "./DataGrid/hooks/useKeyboardNavigation";
import { useDataGridFeatures } from "../hooks/useFeatureFlags";
import { BulkActionsToolbar } from "./DataGrid/components/BulkActionsToolbar";
import { EditableCell } from "./DataGrid/components/EditableCell";
import { CellRenderer } from "./DataGrid/components/cells/CellRenderer";
import { TableHeader } from "./DataGrid/components/headers/TableHeader";
import { isRowDraggable } from "./DataGrid/utils/rowOrdering";
import { DilutionModal } from "./dilution";
import { mockSolvents } from "../mocks/solvents";
import type { Dilution } from "../types/dilution";
import type { UseDilutionReturn } from "./dilution";

export interface Column {
  id: string;
  key: string;
  title: string;
  type: "text" | "number" | "boolean" | "select" | "add-column" | "badge";
  sortable?: boolean;
  editable?: boolean;
  fixed?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  group?: string;
  formulaId?: string; // Universal formula ID (F00001v1)
  formulaDisplayId?: string; // Type-specific display ID (B00001v1, MZ00001v1, etc.)
  attributeId?: string;
  values?: string[];
  options?: string[];
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataGridProps {
  columns: Column[];
  data: any[];
  onAddColumn?: (columnType: "formula" | "attribute") => void;
  onAddFormula?: () => void;
  onRowDelete?: (rowId: string) => void;
  onBulkDelete?: (rowIds: string[]) => void;
  onCellEdit?: (rowId: string, columnId: string, value: any) => void;
  onDeleteColumn?: (columnId: string) => void;
  onSetActiveFormula?: (columnId: string) => void;
  onCreateVersion?: (columnId: string) => void;
  onNormalizeFormula?: (columnId: string) => void;
  onSendForCompounding?: (columnId: string) => void;
  onEditFormulaDetails?: (columnId: string) => void;
  onViewFormulaDetails?: (columnId: string) => void;
  onUploadExcel?: (columnId: string) => void;
  onExplodeFormula?: (formulaId: string) => void;
  onToggleFormulaExpansion?: (formulaId: string) => void;
  onColumnReorder?: (fromIndex: number, toIndex: number) => void;
  onRowReorder?: (rowOrder: string[]) => void;
  onToggleGrouping?: (columnId: string) => void;
  groupedByColumn?: string | null;
  editableFormula?: string;
  className?: string;
  showEmptyState?: boolean;
  enableRowReordering?: boolean;
  enableBulkSelection?: boolean;
  dilutionState?: UseDilutionReturn;
  // Toolbar actions
  onToolbarAddFormula?: () => void;
  onToolbarMergeDuplicates?: () => void;
  onToolbarNormalize?: () => void;
  onToolbarSend?: () => void;
  onToolbarUndo?: () => void;
  onToolbarExport?: () => void;
  toolbarCanUndo?: boolean;
  toolbarUndoCount?: number;
  toolbarCanSend?: boolean;
}

const DataGrid = ({
  columns,
  data,
  onAddColumn,
  onAddFormula,
  onRowDelete: _onRowDelete,
  onBulkDelete,
  onCellEdit,
  onDeleteColumn,
  onSetActiveFormula,
  onCreateVersion,
  onNormalizeFormula,
  onSendForCompounding,
  onEditFormulaDetails,
  onViewFormulaDetails,
  onUploadExcel,
  onExplodeFormula,
  onToggleFormulaExpansion,
  onColumnReorder,
  onRowReorder,
  onToggleGrouping,
  groupedByColumn,
  editableFormula,
  className = "",
  showEmptyState: _showEmptyState = false,
  enableRowReordering: enableRowReorderingProp,
  enableBulkSelection: enableBulkSelectionProp,
  dilutionState,
  // Toolbar actions
  onToolbarAddFormula,
  onToolbarMergeDuplicates,
  onToolbarNormalize,
  onToolbarSend,
  onToolbarUndo,
  onToolbarExport,
  toolbarCanUndo = false,
  toolbarUndoCount = 0,
  toolbarCanSend = false,
}: DataGridProps) => {
  // Get feature flags
  const dataGridFlags = useDataGridFeatures();

  // Use feature flags with prop override capability
  const enableRowReordering =
    enableRowReorderingProp !== undefined
      ? enableRowReorderingProp
      : dataGridFlags.enableRowReordering;

  const enableBulkSelection =
    enableBulkSelectionProp !== undefined
      ? enableBulkSelectionProp
      : dataGridFlags.enableBulkSelection;

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);
  const [showColumnActions, setShowColumnActions] = useState<string | null>(
    null
  );

  // Dilution modal state
  const [dilutionModal, setDilutionModal] = useState<{
    isOpen: boolean;
    ingredientId: string;
    ingredientName: string;
  } | null>(null);

  // Row reordering hooks
  const {
    dragState: rowDragState,
    handleDragStart: handleRowDragStart,
    handleDragOver: handleRowDragOver,
    handleDragEnd: handleRowDragEnd,
    handleDragLeave: handleRowDragLeave,
  } = useRowReordering(data, onRowReorder, () => {
    // Reset sorting when user starts dragging rows
    if (sortConfig) {
      setSortConfig(null);
      toast("Sorting cleared to enable manual reordering", {
        icon: "↕️",
        duration: 2000,
      });
    }
  });

  // Saved views hooks
  // Bulk selection hooks
  const {
    selectedRows,
    toggleRowSelection,
    toggleSelectAll,
    clearSelection,
    isRowSelected,
    isAllSelected,
    isSomeSelected,
  } = useBulkSelection(data);

  // Keyboard navigation hook
  const navigation = useKeyboardNavigation({
    data: data as any[], // Type assertion for compatibility
    columns,
    editableFormula,
    onCellEdit,
    onNavigate: (cell) => {
      // Scroll to cell if needed
      const cellElement = document.getElementById(
        `cell-${cell.rowId}-${cell.columnId}`
      );
      if (cellElement) {
        cellElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    },
  });

  const tableRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll state for conditional shadows
  const [scrollState, setScrollState] = useState({
    canScrollUp: false,
    canScrollDown: false,
  });

  // Detect scroll position for shadow effects
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setScrollState({
        canScrollUp: scrollTop > 0,
        canScrollDown: scrollTop + clientHeight < scrollHeight - 1,
      });
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    container.addEventListener("scroll", handleScroll);

    // Recheck on window resize
    const handleResize = () => handleScroll();
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [data]); // Recheck when data changes (might affect scrollability)

  // Close menu when clicking outside
  useClickOutside(
    menuRef,
    () => {
      if (showColumnActions) {
        setShowColumnActions(null);
      }
    },
    showColumnActions !== null
  );

  // Group columns by their group property
  const groupedColumns = columns.reduce((acc, column, index) => {
    const group = column.group || "default";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push({ ...column, originalIndex: index });
    return acc;
  }, {} as Record<string, (Column & { originalIndex: number })[]>);

  // Calculate column spans for group headers
  const getGroupSpan = (groupName: string) => {
    return groupedColumns[groupName]?.length || 0;
  };

  // Get group colors
  const getGroupColor = (groupName: string) => {
    const colors = {
      Formulas: "bg-blue-50 text-blue-700",
      Cost: "bg-green-50 text-green-700",
      Attributes: "bg-purple-50 text-purple-700",
      default: "bg-gray-50 text-gray-700",
    };
    return colors[groupName as keyof typeof colors] || colors.default;
  };

  // Get comparison glyph for non-active formula columns
  const handleSort = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column?.sortable) return;

    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === columnId &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }

    setSortConfig({ key: columnId, direction });
  };

  // Sort data based on sortConfig
  const getSortedData = () => {
    if (!sortConfig) return data;

    const { key, direction } = sortConfig;
    const column = columns.find((col) => col.id === key);
    if (!column) return data;

    // Separate total rows from regular rows
    const totalRows = data.filter((row) => row.isTotal);
    const regularRows = data.filter((row) => !row.isTotal);

    // Sort only regular rows
    const sortedRegularRows = [...regularRows].sort((a, b) => {
      const aValue = a[column.key];
      const bValue = b[column.key];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return direction === "asc" ? 1 : -1;
      if (bValue == null) return direction === "asc" ? -1 : 1;

      // Sort based on column type
      if (column.type === "number") {
        const aNum = typeof aValue === "number" ? aValue : parseFloat(aValue);
        const bNum = typeof bValue === "number" ? bValue : parseFloat(bValue);
        return direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      // Text sorting
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return direction === "asc" ? -1 : 1;
      if (aStr > bStr) return direction === "asc" ? 1 : -1;
      return 0;
    });

    // Return sorted regular rows followed by total rows
    return [...sortedRegularRows, ...totalRows];
  };

  const handleColumnHeaderClick = (e: React.MouseEvent, columnId: string) => {
    e.stopPropagation();

    // If it's a formula column, set it as active
    const column = columns.find((col) => col.id === columnId);
    if (
      column?.group === "Formulas" &&
      column.type === "number" &&
      onSetActiveFormula
    ) {
      onSetActiveFormula(columnId);
      return;
    }
  };

  const handleDragStart = (e: React.DragEvent, columnIndex: number) => {
    setDraggedColumn(columnIndex);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnIndex: number) => {
    e.preventDefault();

    // Check if columns are in the same group
    if (draggedColumn === null) return;

    const draggedCol = columns[draggedColumn];
    const targetCol = columns[columnIndex];

    // Only allow drag over for Formula and Attributes groups within the same group
    if (
      draggedCol?.group === targetCol?.group &&
      (draggedCol?.group === "Formulas" || draggedCol?.group === "Attributes")
    ) {
      setDragOverColumn(columnIndex);
    }
  };

  const handleDrop = (e: React.DragEvent, columnIndex: number) => {
    e.preventDefault();
    if (draggedColumn !== null && draggedColumn !== columnIndex) {
      // Check if columns are in the same group before reordering
      const draggedCol = columns[draggedColumn];
      const targetCol = columns[columnIndex];

      // Only allow reordering within Formula and Attributes groups
      if (
        draggedCol?.group === targetCol?.group &&
        (draggedCol?.group === "Formulas" || draggedCol?.group === "Attributes")
      ) {
        onColumnReorder?.(draggedColumn, columnIndex);
      }
    }
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const handleAddColumn = (columnType: "formula" | "attribute") => {
    if (onAddColumn) {
      onAddColumn(columnType);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setShowColumnActions(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const renderCell = (row: Record<string, any>, column: Column) => {
    return (
      <CellRenderer
        row={row}
        column={column}
        editableFormula={editableFormula}
        dilutionState={dilutionState}
        onToggleFormulaExpansion={onToggleFormulaExpansion}
        onExplodeFormula={onExplodeFormula}
        onDilutionClick={(ingredientId, ingredientName) => {
          setDilutionModal({
            isOpen: true,
            ingredientId,
            ingredientName,
          });
        }}
        onCellEdit={onCellEdit}
        onAddFormula={onAddFormula}
      />
    );
  };

  return (
    <div className={`flex flex-col h-full p-2 ${className}`} ref={tableRef}>
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedRows.size}
        onBulkDelete={() => {
          if (selectedRows.size > 0) {
            onBulkDelete?.(Array.from(selectedRows));
            clearSelection();
          }
        }}
        onClearSelection={clearSelection}
        onAddFormula={onToolbarAddFormula}
        onMergeDuplicates={onToolbarMergeDuplicates}
        onNormalize={onToolbarNormalize}
        onSend={onToolbarSend}
        onUndo={onToolbarUndo}
        onExport={onToolbarExport}
        canUndo={toolbarCanUndo}
        undoCount={toolbarUndoCount}
        canSend={toolbarCanSend}
      />

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto border border-gray-200 rounded-lg shadow-sm"
      >
        <table className="w-full">
          <TableHeader
            columns={columns}
            groupedColumns={groupedColumns}
            enableRowReordering={enableRowReordering}
            enableBulkSelection={enableBulkSelection}
            editableFormula={editableFormula}
            draggedColumn={draggedColumn}
            dragOverColumn={dragOverColumn}
            showColumnActions={showColumnActions}
            sortConfig={sortConfig}
            groupedByColumn={groupedByColumn}
            scrollState={scrollState}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
            toggleSelectAll={toggleSelectAll}
            menuRef={menuRef}
            getGroupColor={getGroupColor}
            getGroupSpan={getGroupSpan}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onColumnHeaderClick={handleColumnHeaderClick}
            onAddColumn={handleAddColumn}
            onSort={handleSort}
            onToggleGrouping={onToggleGrouping}
            onDeleteColumn={onDeleteColumn}
            onSetActiveFormula={onSetActiveFormula}
            onCreateVersion={onCreateVersion}
            onNormalizeFormula={onNormalizeFormula}
            onSendForCompounding={onSendForCompounding}
            onEditFormulaDetails={onEditFormulaDetails}
            onViewFormulaDetails={onViewFormulaDetails}
            onUploadExcel={onUploadExcel}
            setShowColumnActions={setShowColumnActions}
          />

          <tbody className="bg-white divide-y divide-gray-200">
            {getSortedData()
              .filter((row) => !row.isTotal)
              .map((row, _rowIndex) => {
                // Hide child ingredients if parent formula is collapsed
                const shouldHide =
                  row.parentFormulaId &&
                  !data.find((r) => r.formulaId === row.parentFormulaId)
                    ?.isExpanded;

                if (shouldHide) return null;

                const isDraggable = enableRowReordering && isRowDraggable(row);
                const isBeingDragged = rowDragState.draggedRowId === row.id;
                const isDraggedOver = rowDragState.dragOverRowId === row.id;

                return (
                  <tr
                    key={row.id}
                    draggable={isDraggable}
                    onDragStart={() => handleRowDragStart(row.id)}
                    onDragOver={(e) => handleRowDragOver(e, row.id)}
                    onDragEnd={handleRowDragEnd}
                    onDragLeave={handleRowDragLeave}
                    className={`
                    ${
                      row.isTotal
                        ? "bg-gray-100 border-t-2 border-gray-300"
                        : "hover:bg-gray-50"
                    }
                    ${row.isEmpty ? "bg-gray-50" : ""}
                    ${row.parentFormulaId ? "bg-blue-25" : ""}
                    ${isBeingDragged ? "opacity-50" : ""}
                    ${isDraggedOver ? "border-t-2 border-blue-500" : ""}
                  `}
                  >
                    {/* Drag handle cell (if enabled) */}
                    {enableRowReordering && (
                      <td
                        className="w-8 px-2 py-2 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isDraggable && (
                          <span
                            className="material-symbols-rounded text-gray-400 cursor-move"
                            style={{ fontSize: "16px" }}
                          >
                            drag_handle
                          </span>
                        )}
                      </td>
                    )}

                    {/* Checkbox cell (if enabled) */}
                    {enableBulkSelection && (
                      <td
                        className="w-10 px-3 py-2 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!row.isTotal && !row.isEmpty && (
                          <input
                            type="checkbox"
                            checked={isRowSelected(row.id)}
                            onChange={() => toggleRowSelection(row.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        )}
                      </td>
                    )}

                    {columns.map((column, colIndex) => {
                      // For empty state, only render the first column (description) with full colspan
                      if (row.isEmpty && colIndex > 0) {
                        return null;
                      }

                      // Column width calculation function (same as header)
                      const getColumnWidth = () => {
                        // Add column button - minimal width
                        if (column.type === "add-column") return "50px";

                        // Description column - fixed width (check before fixed columns)
                        if (column.key === "description") return "280px";

                        // Fixed columns - hug content
                        if (column.fixed) return "auto";

                        // Formulas group - fixed equal width
                        if (column.group === "Formulas") {
                          return "180px";
                        }

                        // Cost group columns - hug content
                        if (column.group === "Cost") return "124px";
                        if (column.key === "cost") return "124px";

                        // Attributes group - fixed equal width
                        if (column.group === "Attributes") {
                          return "140px";
                        }

                        return "auto";
                      };

                      const isEditing =
                        navigation.editingCell?.rowId === row.id &&
                        navigation.editingCell?.columnId === column.id;
                      const isFocused =
                        navigation.focusedCell?.rowId === row.id &&
                        navigation.focusedCell?.columnId === column.id;

                      // Check if it's target total in active formula
                      const isTargetTotalInActiveFormula =
                        row.isTotal &&
                        row.totalType === "target" &&
                        column.id === editableFormula;

                      const isEditable =
                        column.editable &&
                        (!row.isTotal || isTargetTotalInActiveFormula) &&
                        !column.fixed &&
                        column.id === editableFormula &&
                        column.type !== "add-column" &&
                        !row.isEmpty;

                      // Use EditableCell for editable formula columns (including target total)
                      if (
                        isEditable ||
                        (isFocused && column.id === editableFormula)
                      ) {
                        return (
                          <EditableCell
                            key={`${row.id}-${column.id}`}
                            value={row[column.key]}
                            isEditing={isEditing}
                            isFocused={isFocused}
                            editValue={navigation.editValue}
                            onChange={navigation.handleInputChange}
                            onKeyDown={navigation.handleKeyDown}
                            onClick={() =>
                              navigation.handleCellFocus(row.id, column.id)
                            }
                            align={column.type === "number" ? "right" : "left"}
                            className={`
                            border-r border-gray-100 last:border-r-0 font-sans
                            ${
                              row.isTotal && !isTargetTotalInActiveFormula
                                ? "font-medium bg-gray-100"
                                : ""
                            }
                            ${column.fixed ? "bg-gray-25" : ""}
                            ${
                              column.id === editableFormula && !column.fixed
                                ? "bg-green-50"
                                : ""
                            }
                          `}
                          />
                        );
                      }

                      // Regular cells (description, fixed columns, etc.)
                      return (
                        <td
                          key={`${row.id}-${column.id}`}
                          className={`
                          px-3 py-2 border-r border-gray-100 last:border-r-0 font-sans
                          ${
                            row.isTotal &&
                            row.totalType === "target" &&
                            column.id === editableFormula
                              ? "cursor-pointer hover:bg-blue-50"
                              : ""
                          }
                          ${row.isTotal ? "font-medium bg-gray-100" : ""}
                          ${column.fixed ? "bg-gray-25" : ""}
                          ${
                            column.id === editableFormula && !column.fixed
                              ? "bg-green-50"
                              : ""
                          }
                          ${
                            row.isEmpty && column.key === "description"
                              ? "text-center"
                              : ""
                          }
                        `}
                          style={{
                            width: getColumnWidth(),
                            minWidth: getColumnWidth(),
                            maxWidth: getColumnWidth(),
                          }}
                          colSpan={
                            row.isEmpty && column.key === "description"
                              ? columns.length
                              : 1
                          }
                        >
                          {renderCell(row, column)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>

          {/* Sticky footer for total rows */}
          <tfoot
            className={`bg-white sticky bottom-0 z-10 border-t-1 border-gray-100 ${
              scrollState.canScrollDown
                ? "shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
                : ""
            }`}
          >
            {getSortedData()
              .filter((row) => row.isTotal)
              .map((row) => {
                return (
                  <tr key={row.id} className="bg-gray-100">
                    {/* Drag handle cell (if enabled) */}
                    {enableRowReordering && (
                      <td className="w-8 px-2 py-2 text-center" />
                    )}

                    {/* Checkbox cell (if enabled) */}
                    {enableBulkSelection && (
                      <td className="w-10 px-3 py-2 text-center" />
                    )}

                    {columns.map((column) => {
                      // Column width calculation function (same as tbody)
                      const getColumnWidth = () => {
                        if (column.type === "add-column") return "50px";
                        if (column.key === "description") return "280px";
                        if (column.fixed) return "auto";
                        if (column.group === "Formulas") return "180px";
                        if (column.group === "Cost") return "124px";
                        if (column.key === "cost") return "124px";
                        if (column.group === "Attributes") return "140px";
                        return "auto";
                      };

                      return (
                        <td
                          key={`${row.id}-${column.id}`}
                          className={`
                            px-3 py-2 border-r border-gray-100 last:border-r-0 font-sans
                            font-medium bg-gray-100
                            ${column.fixed ? "bg-gray-25" : ""}
                            ${
                              column.id === editableFormula && !column.fixed
                                ? "bg-green-50"
                                : ""
                            }
                          `}
                          style={{
                            width: getColumnWidth(),
                            minWidth: getColumnWidth(),
                            maxWidth: getColumnWidth(),
                          }}
                        >
                          {renderCell(row, column)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tfoot>
        </table>
      </div>

      {/* Dilution Modal */}
      {dilutionModal && dilutionState && (
        <DilutionModal
          isOpen={dilutionModal.isOpen}
          onClose={() => setDilutionModal(null)}
          onApply={(dilution: Dilution) => {
            dilutionState.setDilution(dilutionModal.ingredientId, dilution);
            setDilutionModal(null);
          }}
          ingredientName={dilutionModal.ingredientName}
          currentDilution={dilutionState.getDilution(
            dilutionModal.ingredientId
          )}
          solvents={mockSolvents}
        />
      )}
    </div>
  );
};

export default DataGrid;
