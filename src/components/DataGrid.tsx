import { useState, useRef, useEffect } from "react";
import Badge from "./Badge";
import { useClickOutside } from "../hooks/useClickOutside";
import { useRowReordering } from "./DataGrid/hooks/useRowReordering";
import { useSavedViews } from "./DataGrid/hooks/useSavedViews";
import { useBulkSelection } from "./DataGrid/hooks/useBulkSelection";
import { useKeyboardNavigation } from "./DataGrid/hooks/useKeyboardNavigation";
import { BulkActionsToolbar } from "./DataGrid/components/BulkActionsToolbar";
import { EditableCell } from "./DataGrid/components/EditableCell";
import { GroupingButton } from "./DataGrid/components/GroupingButton";
import { isRowDraggable } from "./DataGrid/utils/rowOrdering";
import { DilutionIcon, DilutionBadge, DilutionModal } from "./dilution";
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
  onToggleGrouping?: (columnId: string) => void;
  groupedByColumn?: string | null;
  editableFormula?: string;
  className?: string;
  showEmptyState?: boolean;
  enableRowReordering?: boolean;
  enableSavedViews?: boolean;
  enableBulkSelection?: boolean;
  dilutionState?: UseDilutionReturn;
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
  onToggleGrouping,
  groupedByColumn,
  editableFormula,
  className = "",
  showEmptyState = false,
  enableRowReordering = true,
  enableSavedViews = false,
  enableBulkSelection = true,
  dilutionState,
}: DataGridProps) => {
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
    const value = row[column.key];
    const isTotal = row.isTotal;
    const isEmpty = row.isEmpty;

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
          <div className="text-center py-32">
            <div className="w-24 h-24 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="material-symbols-rounded text-5xl text-gray-400">
                science
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No ingredients added
            </h3>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <span className="material-symbols-rounded mr-2 text-blue-500">
                arrow_back
              </span>
              Select ingredients from the library panel
            </div>
          </div>
        );
      }

      const indent = (row.level || 0) * 20;
      const isIngredient = !row.isFormula && !row.isTotal && row.id;
      const dilution =
        dilutionState && isIngredient
          ? dilutionState.getDilution(row.id)
          : undefined;
      const hasDilution =
        dilutionState && isIngredient
          ? dilutionState.hasDilution(row.id)
          : false;

      return (
        <div
          className="flex items-center justify-between h-full group"
          style={{ paddingLeft: `${indent}px` }}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
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
                  <span
                    className={`material-symbols-rounded text-sm ${
                      row.isExpanded
                        ? "content: 'expand_less'"
                        : "content: 'expand_more'"
                    }`}
                  >
                    {row.isExpanded ? "expand_less" : "expand_more"}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExplodeFormula?.(row.formulaId);
                  }}
                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-orange-600 cursor-pointer"
                  title="Explode Formula"
                >
                  <span className="material-symbols-rounded text-sm">bomb</span>
                </button>
              </div>
            )}
            {row.isFormula && (
              <span className="material-symbols-rounded text-blue-600 text-sm">
                folder
              </span>
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

            {/* Dilution Badge - show text if ingredient has dilution */}
            {dilution && dilution.solventIds.length > 0 && (
              <DilutionBadge
                dilution={dilution}
                solvents={mockSolvents}
                onClick={() => {
                  setDilutionModal({
                    isOpen: true,
                    ingredientId: row.id,
                    ingredientName: value || "",
                  });
                }}
              />
            )}
          </div>

          {/* Dilution Icon - floating to the right, centered vertically */}
          {isIngredient && dilutionState && (
            <div
              className={`flex items-center justify-center ml-2 ${
                hasDilution
                  ? ""
                  : "opacity-0 group-hover:opacity-100 transition-opacity"
              }`}
            >
              <DilutionIcon
                onClick={() => {
                  setDilutionModal({
                    isOpen: true,
                    ingredientId: row.id,
                    ingredientName: value || "",
                  });
                }}
                hasDilution={hasDilution}
              />
            </div>
          )}
        </div>
      );
    }

    // Note: Editing is now handled by EditableCell component, not here

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
      const isActiveFormula = column.id === editableFormula;
      const isFormulaColumn = column.id.startsWith("formula");

      // Formula rows in formula columns - show non-editable display
      if (row.isFormula && isFormulaColumn) {
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

      // Total rows for formula columns
      if (isTotal && isFormulaColumn) {
        // Target total is now handled by EditableCell, so just display normally
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
                <th className="w-8 px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50">
                  <span
                    className="material-symbols-rounded text-gray-400"
                    style={{ fontSize: "16px" }}
                  >
                    drag_handle
                  </span>
                </th>
              )}

              {/* Checkbox column (if enabled) */}
              {enableBulkSelection && (
                <th className="w-10 px-3 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50">
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

                const getColumnWidth = () => {
                  // Add column button - minimal width
                  if (column.type === "add-column") return "50px";

                  // Fixed columns - hug content
                  if (column.fixed) return "auto";

                  // Description column - fixed width
                  if (column.key === "description") return "300px";

                  // Formulas group - fixed equal width with max-width for ellipsis
                  if (column.group === "Formulas") {
                    return "180px";
                  }

                  // Cost group columns - hug content
                  if (column.group === "Cost") return "124px";
                  if (column.key === "cost") return "124px";

                  // Attributes group - fixed equal width with max-width for ellipsis
                  if (column.group === "Attributes") {
                    return "140px";
                  }

                  return "auto";
                };

                return (
                  <th
                    key={column.id}
                    className={`
                    relative px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider
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
                    style={{
                      width: getColumnWidth(),
                      minWidth: getColumnWidth(),
                      maxWidth: getColumnWidth(),
                    }}
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
                        title={`Click to ${
                          column.group === "Formulas"
                            ? "add a formula"
                            : "add an attribute"
                        }`}
                      >
                        <div className="relative group">
                          <div className="flex items-center justify-center">
                            <span className="material-symbols-rounded text-base text-gray-400 group-hover:text-blue-600 transition-colors">
                              add
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center space-x-1 min-w-0">
                          <div className="flex flex-col min-w-0">
                            <span
                              className="truncate text-xs"
                              title={column.title}
                            >
                              {column.title}
                            </span>
                            {column.formulaId && (
                              <span
                                className="text-xs text-gray-400 font-normal truncate"
                                title={column.formulaId}
                              >
                                {column.formulaId}
                              </span>
                            )}
                          </div>
                          {column.fixed && (
                            <span className="material-symbols-rounded text-xs text-gray-400 flex-shrink-0">
                              lock
                            </span>
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
                                  <span className="material-symbols-rounded text-xs">
                                    arrow_upward
                                  </span>
                                ) : (
                                  <span className="material-symbols-rounded text-xs">
                                    arrow_downward
                                  </span>
                                )
                              ) : (
                                <span className="material-symbols-rounded text-xs">
                                  unfold_more
                                </span>
                              )}
                            </button>
                          )}
                        </div>

                        <div className="flex items-center space-x-0.5 flex-shrink-0">
                          {/* Grouping button for non-numeric attribute columns */}
                          {column.group === "Attributes" &&
                            column.type !== "number" &&
                            column.type === "select" &&
                            column.values &&
                            column.values.length > 0 &&
                            onToggleGrouping && (
                              <GroupingButton
                                columnId={column.id}
                                columnLabel={column.title}
                                isGrouped={groupedByColumn === column.id}
                                availableValues={column.values}
                                onToggleGrouping={onToggleGrouping}
                              />
                            )}

                          {/* Remove icon for all formula and attribute columns */}
                          {((column.id.startsWith("formula") &&
                            !column.fixed) ||
                            (column.group === "Attributes" &&
                              column.id !== "description")) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteColumn?.(column.id);
                              }}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Remove column"
                            >
                              <span className="material-symbols-rounded text-sm">
                                close
                              </span>
                            </button>
                          )}

                          {/* Actions menu only for formula columns */}
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
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <span className="material-symbols-rounded text-xs">
                                  more_vert
                                </span>
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
                                    <span className="material-symbols-rounded text-xs">
                                      edit
                                    </span>
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
                                    <span className="material-symbols-rounded text-xs">
                                      content_copy
                                    </span>
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
                                    <span className="material-symbols-rounded text-xs">
                                      balance
                                    </span>
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
                                    <span className="material-symbols-rounded text-xs">
                                      send
                                    </span>
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
                                    <span className="material-symbols-rounded text-xs">
                                      delete
                                    </span>
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
                            ${row.isTotal ? "font-medium bg-gray-100" : ""}
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
