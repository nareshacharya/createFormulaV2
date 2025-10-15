import { useState, useRef, useEffect } from "react";
import Badge from "./Badge";
import { useClickOutside } from "../hooks/useClickOutside";
import { useRowReordering } from "./DataGrid/hooks/useRowReordering";
import { useSavedViews } from "./DataGrid/hooks/useSavedViews";
import { useBulkSelection } from "./DataGrid/hooks/useBulkSelection";
import { BulkActionsToolbar } from "./DataGrid/components/BulkActionsToolbar";
import { isRowDraggable } from "./DataGrid/utils/rowOrdering";

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
  formulaId?: string;
  attributeId?: string;
  values?: string[];
  options?: string[];
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataGridProps {
  columns: Column[];
  data: any[];
  onAddColumn?: (columnType: "formula" | "attribute") => void;
  onRowDelete?: (rowId: string) => void;
  onBulkDelete?: (rowIds: string[]) => void;
  onCellEdit?: (rowId: string, columnId: string, value: any) => void;
  onDeleteColumn?: (columnId: string) => void;
  onSetActiveFormula?: (columnId: string) => void;
  onCreateVersion?: (columnId: string) => void;
  onNormalizeFormula?: (columnId: string) => void;
  onSendForCompounding?: (columnId: string) => void;
  onExplodeFormula?: (formulaId: string) => void;
  onToggleFormulaExpansion?: (formulaId: string) => void;
  onColumnReorder?: (fromIndex: number, toIndex: number) => void;
  onRowReorder?: (rowOrder: string[]) => void;
  onSaveView?: (viewName: string) => void;
  onLoadView?: (viewId: string) => void;
  editableFormula?: string;
  className?: string;
  showEmptyState?: boolean;
  enableRowReordering?: boolean;
  enableSavedViews?: boolean;
  enableBulkSelection?: boolean;
}

const DataGrid = ({
  columns,
  data,
  onAddColumn,
  onRowDelete,
  onBulkDelete,
  onCellEdit,
  onDeleteColumn,
  onSetActiveFormula,
  onCreateVersion,
  onNormalizeFormula,
  onSendForCompounding,
  onExplodeFormula,
  onToggleFormulaExpansion,
  onColumnReorder,
  onRowReorder,
  onSaveView,
  onLoadView,
  editableFormula,
  className = "",
  showEmptyState = false,
  enableRowReordering = true,
  enableSavedViews = false,
  enableBulkSelection = true,
}: DataGridProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<any>("");
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);
  const [showColumnActions, setShowColumnActions] = useState<string | null>(
    null
  );

  // Row reordering hooks
  const {
    dragState: rowDragState,
    handleDragStart: handleRowDragStart,
    handleDragOver: handleRowDragOver,
    handleDragEnd: handleRowDragEnd,
    handleDragLeave: handleRowDragLeave,
  } = useRowReordering(data, onRowReorder);

  // Saved views hooks
  const {
    savedViews,
    currentViewId,
    saveView,
    loadView,
    deleteView,
    loadSavedViews,
  } = useSavedViews();

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

  const tableRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load saved views on mount
  useEffect(() => {
    if (enableSavedViews) {
      loadSavedViews();
    }
  }, [enableSavedViews, loadSavedViews]);

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
  const getComparisonGlyph = (
    activeValue: number,
    compareValue: number | null | string
  ) => {
    if (compareValue === null || compareValue === undefined) return "-";
    if (compareValue === "-") return "-";
    if (compareValue === 0) return "-";
    if (
      typeof compareValue === "number" &&
      Math.abs(compareValue - activeValue) < 0.001
    )
      return ">>";
    return compareValue;
  };

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

  const handleCellClick = (
    rowId: string,
    columnId: string,
    currentValue: any
  ) => {
    const row = data.find((r) => r.id === rowId);
    const column = columns.find((col) => col.id === columnId);

    // Allow editing target total in active formula, but prevent editing other total rows
    const isTargetTotalInActiveFormula =
      row?.isTotal &&
      row?.totalType === "target" &&
      column.id === editableFormula;

    // Prevent editing of total rows (except target total in active formula), non-editable columns, or fixed columns
    if (
      (row?.isTotal && !isTargetTotalInActiveFormula) ||
      !column?.editable ||
      column?.fixed ||
      row?.isEmpty
    )
      return;

    // Only allow editing of active formula column
    if (column.id.startsWith("formula") && column.id !== editableFormula)
      return;

    setEditingCell({ rowId, columnId });
    setEditValue(currentValue);
  };

  const handleCellSave = () => {
    if (!editingCell) return;

    onCellEdit?.(editingCell.rowId, editingCell.columnId, editValue);
    setEditingCell(null);
    setEditValue("");
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue("");
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

  const renderCell = (row: any, column: Column) => {
    const value = row[column.key];
    const isEditing =
      editingCell?.rowId === row.id && editingCell?.columnId === column.id;
    const isTotal = row.isTotal;
    const isEmpty = row.isEmpty;
    const isActiveFormula = column.id === editableFormula;
    const isFormulaColumn = column.id.startsWith("formula");
    const isEditable =
      column.editable && !row.isTotal && editableFormula === column.id;

    // New add-column rendering - only show plus icon in header, not in rows
    if (column.type === "add-column") {
      return (
        <div className="flex items-center justify-center h-full">
          {/* Empty cell for rows - no plus icon */}
        </div>
      );
    }

    // Description column with hierarchy and empty state handling
    if (column.key === "description") {
      if (isEmpty) {
        return (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
              <i className="ri-flask-line text-xl text-gray-400"></i>
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-2">
              No ingredients added
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Start building your formula by adding ingredients from the library
              panel.
            </p>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <i className="ri-arrow-left-line mr-2 text-blue-500"></i>
              Select ingredients from the library panel
            </div>
          </div>
        );
      }

      const indent = (row.level || 0) * 20;
      return (
        <div
          className="flex items-center h-full"
          style={{ paddingLeft: `${indent}px` }}
        >
          {row.isFormula && (
            <div className="flex items-center space-x-1 mr-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFormulaExpansion?.(row.formulaId);
                }}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 cursor-pointer"
                title={row.isExpanded ? "Collapse Formula" : "Expand Formula"}
              >
                <i
                  className={`ri-arrow-${
                    row.isExpanded ? "down" : "right"
                  }-s-line text-sm`}
                ></i>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExplodeFormula?.(row.formulaId);
                }}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-orange-600 cursor-pointer"
                title="Explode Formula"
              >
                <i className="ri-bubble-chart-line text-sm"></i>
              </button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            {row.isFormula && (
              <i className="ri-folder-line text-blue-600 text-sm"></i>
            )}
            <span
              className={`text-sm ${
                row.isFormula ? "font-semibold text-blue-900" : ""
              } ${row.isTotal ? "font-semibold" : ""} ${
                row.parentFormulaId && !row.isExpanded ? "text-gray-600" : ""
              }`}
            >
              {value || ""}
            </span>
          </div>
        </div>
      );
    }

    // Editing mode
    if (isEditing && !isTotal && !column.fixed && isActiveFormula) {
      if (column.type === "select" && column.options) {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellSave}
            className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none"
            autoFocus
          >
            {column.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      }

      return (
        <input
          type={column.type === "number" ? "number" : "text"}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCellSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCellSave();
            } else if (e.key === "Escape") {
              handleCellCancel();
            }
          }}
          className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none"
          autoFocus
        />
      );
    }

    // Custom render function
    if (column.render) {
      return column.render(value, row);
    }

    // Badge type
    if (column.type === "badge") {
      return (
        <Badge variant="default" size="sm">
          {value}
        </Badge>
      );
    }

    // Number type handling
    if (column.type === "number") {
      // Formula rows in formula columns - show editable percentage
      if (row.isFormula && isFormulaColumn && isActiveFormula) {
        if (isEditing) {
          return (
            <div className="flex items-center">
              <input
                type="number"
                value={editValue}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  // Prevent negative values
                  if (val < 0 || isNaN(val)) {
                    setEditValue(0);
                  } else {
                    setEditValue(val);
                  }
                }}
                onInput={(e) => {
                  // Additional safeguard - prevent negative input
                  const input = e.target as HTMLInputElement;
                  if (parseFloat(input.value) < 0) {
                    input.value = "0";
                    setEditValue(0);
                  }
                }}
                onBlur={handleCellSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCellSave();
                  } else if (e.key === "Escape") {
                    handleCellCancel();
                  } else if (e.key === "-" || e.key === "Minus") {
                    e.preventDefault(); // Block minus key
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-blue-500 rounded focus:outline-none"
                autoFocus
                min="0"
                max="100"
                step="0.01"
                style={{
                  MozAppearance: "textfield",
                  appearance: "textfield",
                }}
              />
            </div>
          );
        }
        // Show as editable-looking input field by default
        return (
          <div className="flex items-center">
            <input
              type="number"
              value={typeof value === "number" ? value.toFixed(5) : value || 0}
              readOnly
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded text-gray-900 cursor-pointer focus:outline-none"
              min="0"
              style={{
                MozAppearance: "textfield",
                appearance: "textfield",
              }}
            />
          </div>
        );
      }

      // Comparison glyphs for non-active formulas
      if (isFormulaColumn && !isActiveFormula && !isTotal) {
        const activeValue = row[editableFormula] || 0;
        const displayValue = getComparisonGlyph(activeValue, value);

        if (displayValue === "-" || displayValue === ">>") {
          return <span className="text-sm text-gray-400">{displayValue}</span>;
        }

        // Show 2 decimals for readonly formula values
        if (typeof value === "number") {
          return <span className="text-sm">{value.toFixed(2)}</span>;
        }
      }

      // Total rows for formula columns - make Target Total editable for active formula
      if (isTotal && isFormulaColumn) {
        if (row.totalType === "target" && isActiveFormula) {
          if (isEditing) {
            return (
              <input
                type="number"
                value={editValue}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  // Prevent negative values
                  if (val < 0 || isNaN(val)) {
                    setEditValue(0);
                  } else {
                    setEditValue(val);
                  }
                }}
                onInput={(e) => {
                  // Additional safeguard - prevent negative input
                  const input = e.target as HTMLInputElement;
                  if (parseFloat(input.value) < 0) {
                    input.value = "0";
                    setEditValue(0);
                  }
                }}
                onBlur={handleCellSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCellSave();
                  } else if (e.key === "Escape") {
                    handleCellCancel();
                  } else if (e.key === "-" || e.key === "Minus") {
                    e.preventDefault(); // Block minus key
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-blue-500 rounded focus:outline-none font-semibold"
                autoFocus
                min="0"
                step="0.01"
                style={{
                  MozAppearance: "textfield",
                  appearance: "textfield",
                }}
              />
            );
          }
          // Show as input field even when not editing (for Target Total in active formula)
          const displayValue =
            typeof value === "number" ? value.toFixed(5) : value;
          return (
            <input
              type="number"
              value={displayValue}
              readOnly
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded font-semibold text-gray-900 cursor-pointer focus:outline-none"
              min="0"
              style={{
                MozAppearance: "textfield",
                appearance: "textfield",
              }}
            />
          );
        }

        if (value === "-") {
          return <span className="text-sm text-gray-400">-</span>;
        }
        if (value !== null && value !== undefined) {
          // Show 5 decimals for active formula, 2 decimals for others
          const decimals = isActiveFormula ? 5 : 2;
          const displayValue =
            typeof value === "number" ? value.toFixed(decimals) : value;
          return (
            <span
              className={`text-sm ${
                isTotal ? "font-semibold text-gray-900" : ""
              }`}
            >
              {displayValue}
            </span>
          );
        }
        return <span className="text-sm text-gray-400">-</span>;
      }

      // Currency formatting for cost columns
      if (column.id === "costKg" || column.id === "contCost") {
        if (value === null || value === undefined) return "-";
        const displayValue =
          typeof value === "number" ? value.toFixed(2) : value;
        return (
          <span
            className={`text-sm ${
              isTotal ? "font-semibold text-gray-900" : ""
            }`}
          >
            ${displayValue}
          </span>
        );
      }

      // Regular number formatting - 5 decimals for active formula, 2 decimals for others
      const decimals = isFormulaColumn && isActiveFormula ? 5 : 2;
      const displayValue =
        typeof value === "number" ? value.toFixed(decimals) : value;
      return (
        <span
          className={`text-sm ${isTotal ? "font-semibold text-gray-900" : ""}`}
        >
          {displayValue}
        </span>
      );
    }

    // Boolean type
    if (column.type === "boolean") {
      return (
        <span
          className={`text-sm ${isTotal ? "font-semibold text-gray-900" : ""}`}
        >
          {value ? "Yes" : "No"}
        </span>
      );
    }

    // Default text rendering
    return (
      <span
        className={`text-sm ${isTotal ? "font-semibold text-gray-900" : ""}`}
      >
        {value}
      </span>
    );
  };

  const renderGroupHeaders = () => {
    const groups = Object.keys(groupedColumns).filter(
      (group) => group !== "default"
    );
    if (groups.length === 0) return null;

    return (
      <tr>
        {/* Drag handle column (if enabled) */}
        {enableRowReordering && (
          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
            {/* Empty for drag handle */}
          </th>
        )}

        {/* Checkbox column (if enabled) */}
        {enableBulkSelection && (
          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
            {/* Empty for checkbox */}
          </th>
        )}

        {/* Description column (no group) */}
        {columns.find((col) => col.key === "description") && (
          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
            {/* Empty for description */}
          </th>
        )}

        {/* Other non-grouped columns */}
        {columns
          .filter(
            (col) =>
              !col.group &&
              col.key !== "description" &&
              col.type !== "add-column"
          )
          .map((col) => (
            <th
              key={col.id}
              className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200 bg-gray-50"
            >
              {col.title}
            </th>
          ))}

        {/* Group headers */}
        {groups.map((groupName) => (
          <th
            key={groupName}
            className={`px-3 py-2 text-center text-xs font-medium uppercase tracking-wider border-b border-gray-200 ${getGroupColor(
              groupName
            )}`}
            colSpan={getGroupSpan(groupName)}
          >
            {groupName}
          </th>
        ))}
      </tr>
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
        enableSavedViews={enableSavedViews}
        savedViews={savedViews}
        currentViewId={currentViewId}
        onSaveView={(viewName) => {
          saveView(
            viewName,
            data.map((row) => row.id)
          );
          onSaveView?.(viewName);
        }}
        onLoadView={(viewId) => {
          loadView(viewId);
          onLoadView?.(viewId);
        }}
        onDeleteView={deleteView}
      />

      <div className="flex-1 overflow-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full">
          <thead className="bg-white sticky top-0 z-10">
            {/* Group headers */}
            {renderGroupHeaders()}

            {/* Column headers */}
            <tr className="border-b border-gray-200">
              {/* Drag handle column (if enabled) */}
              {enableRowReordering && (
                <th className="w-8 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  <i className="ri-draggable text-gray-400"></i>
                </th>
              )}

              {/* Checkbox column (if enabled) */}
              {enableBulkSelection && (
                <th className="w-10 px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  <input
                    type="checkbox"
                    checked={isAllSelected()}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = isSomeSelected();
                      }
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </th>
              )}

              {columns.map((column, index) => {
                const isDraggable =
                  column.type !== "add-column" &&
                  !column.fixed &&
                  (column.group === "Formulas" ||
                    column.group === "Attributes");

                return (
                  <th
                    key={column.id}
                    className={`
                    relative px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    cursor-pointer select-none border-r border-gray-200 last:border-r-0
                    ${
                      column.id === editableFormula
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-50 hover:bg-gray-100"
                    }
                    ${dragOverColumn === index ? "bg-blue-100" : ""}
                    ${draggedColumn === index ? "opacity-50" : ""}
                    ${column.type === "add-column" ? "bg-gray-100" : ""}
                    ${column.fixed ? "bg-gray-100" : ""}
                    ${isDraggable ? "cursor-move" : ""}
                  `}
                    draggable={isDraggable}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onClick={(e) =>
                      column.type !== "add-column" &&
                      !column.fixed &&
                      handleColumnHeaderClick(e, column.id)
                    }
                  >
                    {/* Column header content */}
                    {column.type === "add-column" ? (
                      <div
                        className="flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors py-2 rounded"
                        onClick={() =>
                          handleAddColumn(
                            column.group === "Formulas"
                              ? "formula"
                              : "attribute"
                          )
                        }
                      >
                        <div className="relative group">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
                              <i className="ri-add-line text-sm"></i>
                            </div>
                            <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                              {column.group === "Formulas"
                                ? "Add Formula"
                                : "Add Attribute"}
                            </span>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Click to{" "}
                            {column.group === "Formulas"
                              ? "add a formula"
                              : "add an attribute"}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex flex-col">
                            <span className="truncate">{column.title}</span>
                            {column.formulaId && (
                              <span className="text-xs text-gray-400 font-normal">
                                {column.formulaId}
                              </span>
                            )}
                          </div>
                          {column.fixed && (
                            <i className="ri-lock-line text-xs text-gray-400"></i>
                          )}
                          {column.sortable && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSort(column.id);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {sortConfig?.key === column.id ? (
                                sortConfig.direction === "asc" ? (
                                  <i className="ri-arrow-up-line text-xs"></i>
                                ) : (
                                  <i className="ri-arrow-down-line text-xs"></i>
                                )
                              ) : (
                                <i className="ri-expand-up-down-line text-xs"></i>
                              )}
                            </button>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          {/* Actions menu for formula columns */}
                          {column.id.startsWith("formula") && !column.fixed && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowColumnActions(
                                    showColumnActions === column.id
                                      ? null
                                      : column.id
                                  );
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1"
                              >
                                <i className="ri-more-2-line text-xs"></i>
                              </button>

                              {showColumnActions === column.id && (
                                <div
                                  ref={menuRef}
                                  className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[200px]"
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSetActiveFormula?.(column.id);
                                      setShowColumnActions(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                  >
                                    <i className="ri-edit-line text-xs"></i>
                                    <span>Set Active</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCreateVersion?.(column.id);
                                      setShowColumnActions(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 whitespace-nowrap"
                                  >
                                    <i className="ri-file-copy-line text-xs"></i>
                                    <span>Create new version</span>
                                  </button>
                                  <div className="border-t border-gray-200 my-1"></div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onNormalizeFormula?.(column.id);
                                      setShowColumnActions(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                  >
                                    <i className="ri-scales-line text-xs"></i>
                                    <span>Normalize</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSendForCompounding?.(column.id);
                                      setShowColumnActions(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 whitespace-nowrap"
                                  >
                                    <i className="ri-send-plane-line text-xs"></i>
                                    <span>Send for Compounding</span>
                                  </button>
                                  <div className="border-t border-gray-200 my-1"></div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteColumn?.(column.id);
                                      setShowColumnActions(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                  >
                                    <i className="ri-close-circle-line text-xs"></i>
                                    <span>Remove</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {getSortedData().map((row, _rowIndex) => {
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
                        <i className="ri-draggable text-gray-400 cursor-move"></i>
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

                    return (
                      <td
                        key={`${row.id}-${column.id}`}
                        className={`
                        px-3 py-2 border-r border-gray-100 last:border-r-0 font-sans
                        ${
                          column.editable &&
                          !row.isTotal &&
                          !column.fixed &&
                          column.id === editableFormula &&
                          column.type !== "add-column" &&
                          !row.isEmpty
                            ? "cursor-pointer hover:bg-blue-50"
                            : ""
                        }
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
                        onClick={() => {
                          if (column.type !== "add-column") {
                            if (
                              row.isTotal &&
                              row.totalType === "target" &&
                              column.id === editableFormula
                            ) {
                              handleCellClick(
                                row.id,
                                column.id,
                                row[column.key]
                              );
                            } else {
                              handleCellClick(
                                row.id,
                                column.id,
                                row[column.key]
                              );
                            }
                          }
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
        </table>
      </div>
    </div>
  );
};

export default DataGrid;
