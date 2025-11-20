/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useClickOutside } from "../hooks/useClickOutside";
import { useDataGridFeatures } from "../hooks/useFeatureFlags";
import { mockSolvents } from "../mocks/solvents";
import type { Ingredient, Formula } from "../services/pega";
import type { Dilution } from "../types/dilution";
import { eventBus } from "../utils/bus";
import { isOwnFormula } from "../utils/formulaIdGenerator";
import { tw, mergeStyles } from "../utils/tailwindToInline";
import { AddItemButton } from "./DataGrid/components/AddItemButton";
import { AddItemModal } from "./DataGrid/components/AddItemModal";
import { BulkActionsToolbar } from "./DataGrid/components/BulkActionsToolbar";
import { CellRenderer } from "./DataGrid/components/cells/CellRenderer";
import { EditableCell } from "./DataGrid/components/EditableCell";
import { TableHeader } from "./DataGrid/components/headers/TableHeader";
import { useBulkSelection } from "./DataGrid/hooks/useBulkSelection";
import { useKeyboardNavigation } from "./DataGrid/hooks/useKeyboardNavigation";
import { useRowReordering } from "./DataGrid/hooks/useRowReordering";
import { isRowDraggable } from "./DataGrid/utils/rowOrdering";
import { DilutionModal } from "./dilution";
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
  formulas?: any[]; // Array of formulas to check formula types
  availableFormulas?: any[]; // Global formulas for cross-workspace access
  // Library data for inline add feature
  ingredients?: Ingredient[];
  libraryFormulas?: Formula[];
  onAddColumn?: (columnType: "formula" | "attribute") => void;
  onAddFormula?: () => void;
  onRowDelete?: (rowId: string) => void; // Reserved for future use
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
  // showEmptyState?: boolean; // Reserved for future use
  enableRowReordering?: boolean;
  enableBulkSelection?: boolean;
  dilutionState?: UseDilutionReturn;
  // Toolbar actions
  onToolbarAddFormula?: () => void;
  onToolbarMergeDuplicates?: () => void;
  onToolbarNormalize?: () => void;
  onToolbarSend?: () => void;
  onToolbarUndo?: () => void;
  onToolbarComplianceCheck?: () => void;
  onToolbarExport?: () => void;
  toolbarCanUndo?: boolean;
  toolbarUndoCount?: number;
  toolbarCanSend?: boolean;
  toolbarCanComplianceCheck?: boolean;
}

const DataGrid = ({
  columns,
  data,
  formulas = [],
  availableFormulas = [],
  ingredients = [],
  libraryFormulas = [],
  onAddColumn,
  onAddFormula,
  onRowDelete: _onRowDelete, // Reserved for future use
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
  // showEmptyState, // Reserved for future use
  enableRowReordering: enableRowReorderingProp,
  enableBulkSelection: enableBulkSelectionProp,
  dilutionState,
  // Toolbar actions
  onToolbarAddFormula,
  onToolbarMergeDuplicates,
  onToolbarNormalize,
  onToolbarSend,
  onToolbarUndo,
  onToolbarComplianceCheck,
  onToolbarExport,
  toolbarCanUndo = false,
  toolbarUndoCount = 0,
  toolbarCanSend = false,
  toolbarCanComplianceCheck = false,
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

  // Add item modal state
  const [addItemModal, setAddItemModal] = useState<{
    isOpen: boolean;
    insertAfterRowId: string;
  }>({
    isOpen: false,
    insertAfterRowId: "",
  });

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

  // Handlers for inline add feature
  const handleAddItemClick = (rowId: string) => {
    setAddItemModal({
      isOpen: true,
      insertAfterRowId: rowId,
    });
  };

  const handleAddIngredient = (ingredient: Ingredient) => {
    // Emit event that WorkArea's existing handler will process
    // Include insertAfterRowId to specify where the ingredient should be inserted
    eventBus.emit("ingredient-selected", {
      ingredient,
      insertAfterRowId: addItemModal.insertAfterRowId,
    });
    toast.success(`Added ${ingredient.name}`);
  };

  const handleAddFormula = (formula: Formula) => {
    // Emit event that WorkArea's existing handler will process
    // Include insertAfterRowId to specify where the formula should be inserted
    eventBus.emit("formula-selected", {
      formula,
      insertAfterRowId: addItemModal.insertAfterRowId,
    });
    toast.success(`Added ${formula.name}`);
  };

  const handleCloseAddItemModal = () => {
    setAddItemModal({
      isOpen: false,
      insertAfterRowId: "",
    });
  };

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
  const groupedColumns = columns.reduce(
    (acc, column, index) => {
      const group = column.group || "default";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push({ ...column, originalIndex: index });
      return acc;
    },
    {} as Record<string, (Column & { originalIndex: number })[]>
  );

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

  // Render cell content for Target Total rows
  const renderTargetTotalCell = (
    row: Record<string, any>,
    column: Column
  ): React.ReactNode => {
    if (column.type === "number") {
      const val = row[column.key];
      const displayValue =
        typeof val === "number" ? val.toFixed(5) : val || "100.00000";
      return (
        <span
          style={tw("text-sm font-semibold text-gray-900 text-right block")}
        >
          {displayValue}
        </span>
      );
    }
    return row[column.key];
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

  // Handle yield adjustment for a single selected ingredient
  const handleYield = () => {
    if (selectedRows.size !== 1 || !editableFormula) return;

    // Check if the active formula is editable (owned or draft)
    const activeColumn = columns.find((col) => col.id === editableFormula);
    if (activeColumn?.formulaId) {
      const isFormulaOwned = isOwnFormula(activeColumn.formulaId);
      const workspaceFormula = formulas.find(
        (f) => f.id === activeColumn.formulaId
      );
      const availableFormula = availableFormulas.find(
        (f) => f.id === activeColumn.formulaId
      );
      const isDraft =
        workspaceFormula?.status === "draft" ||
        availableFormula?.status === "draft";

      if (!isFormulaOwned && !isDraft) {
        toast.error("Cannot adjust yield for locked formulas");
        return;
      }
    }

    const selectedRowId = Array.from(selectedRows)[0];
    const selectedRow = data.find((row) => row.id === selectedRowId);

    // Only allow yield for ingredient rows (not total rows or formula group rows)
    if (!selectedRow || selectedRow.isTotal || selectedRow.isFormula) {
      toast.error("Yield can only be applied to ingredient rows");
      return;
    }

    // Find the total row for the active formula
    const totalRow = data.find(
      (row) => row.isTotal && row.totalType === "running"
    );
    if (!totalRow) {
      toast.error("No total row found");
      return;
    }

    // Find the target total row for the active formula
    const targetRow = data.find(
      (row) => row.isTotal && row.totalType === "target"
    );
    if (!targetRow) {
      toast.error("No target total row found");
      return;
    }

    // Get current values
    const currentAmount = parseFloat(selectedRow[editableFormula]) || 0;
    const currentTotal = parseFloat(totalRow[editableFormula]) || 0;
    const targetTotal = parseFloat(targetRow[editableFormula]) || 100;

    // Calculate the difference that needs to be adjusted
    const difference = targetTotal - currentTotal;

    // Calculate the new amount for the selected ingredient
    const newAmount = currentAmount + difference;

    // Validate that the new amount is not negative
    if (newAmount < 0) {
      toast.error(
        `Cannot adjust: resulting amount would be negative (${newAmount.toFixed(
          2
        )})`
      );
      return;
    }

    // Apply the change
    if (onCellEdit) {
      onCellEdit(selectedRowId, editableFormula, newAmount);
      toast.success(
        `Adjusted ${
          selectedRow.description || "ingredient"
        } from ${currentAmount.toFixed(2)} to ${newAmount.toFixed(2)} (${
          difference > 0 ? "+" : ""
        }${difference.toFixed(2)})`
      );
      clearSelection();
    }
  };

  return (
    <div
      style={mergeStyles(tw("flex flex-col h-full p-2"), tw(className))}
      ref={tableRef}
    >
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedRows.size}
        onBulkDelete={() => {
          if (selectedRows.size > 0) {
            // Check if the active formula is editable (owned or draft)
            if (editableFormula) {
              const activeColumn = columns.find(
                (col) => col.id === editableFormula
              );
              if (activeColumn?.formulaId) {
                const isFormulaOwned = isOwnFormula(activeColumn.formulaId);
                const workspaceFormula = formulas.find(
                  (f) => f.id === activeColumn.formulaId
                );
                const availableFormula = availableFormulas.find(
                  (f) => f.id === activeColumn.formulaId
                );
                const isDraft =
                  workspaceFormula?.status === "draft" ||
                  availableFormula?.status === "draft";

                if (!isFormulaOwned && !isDraft) {
                  toast.error("Cannot delete ingredients from locked formulas");
                  return;
                }
              }
            }

            onBulkDelete?.(Array.from(selectedRows));
            clearSelection();
          }
        }}
        onClearSelection={clearSelection}
        onYield={editableFormula ? handleYield : undefined}
        onAddFormula={onToolbarAddFormula}
        onMergeDuplicates={onToolbarMergeDuplicates}
        onNormalize={onToolbarNormalize}
        onSend={onToolbarSend}
        onUndo={onToolbarUndo}
        onComplianceCheck={onToolbarComplianceCheck}
        onExport={onToolbarExport}
        canUndo={toolbarCanUndo}
        undoCount={toolbarUndoCount}
        canSend={toolbarCanSend}
        canComplianceCheck={toolbarCanComplianceCheck}
      />

      <div
        ref={scrollContainerRef}
        style={tw(
          "flex-1 overflow-auto border border-gray-200 rounded-lg shadow-sm"
        )}
      >
        <table style={tw("w-full")}>
          <TableHeader
            columns={columns}
            formulas={formulas}
            availableFormulas={availableFormulas}
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

          <tbody style={tw("bg-white divide-y divide-gray-200")}>
            {getSortedData()
              .filter((row) => !row.isTotal)
              .map((row) => {
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
                    className={`group relative ${
                      row.isTotal ? "" : "hover:bg-gray-50"
                    } ${isDraggedOver ? "border-t-2 border-blue-500" : ""}`}
                    style={mergeStyles(
                      tw(
                        row.isTotal
                          ? "bg-gray-100 border-t-2 border-gray-300"
                          : ""
                      ),
                      tw(row.isEmpty ? "bg-gray-50" : ""),
                      tw(row.parentFormulaId ? "bg-blue-25" : ""),
                      tw(isBeingDragged ? "opacity-50" : "")
                    )}
                  >
                    {/* Drag handle cell (if enabled) */}
                    {enableRowReordering && (
                      <td
                        style={mergeStyles(
                          tw("w-8 px-2 py-2 text-center hidden lg:table-cell"),
                          {}
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isDraggable && (
                          <span
                            style={mergeStyles(
                              { fontSize: "16px" },
                              tw("text-gray-400 cursor-move")
                            )}
                            className="material-symbols-rounded"
                          >
                            drag_handle
                          </span>
                        )}
                      </td>
                    )}

                    {/* Checkbox cell (if enabled) */}
                    {enableBulkSelection && (
                      <td
                        style={tw("w-10 px-3 py-2 text-center")}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!row.isTotal &&
                          !row.isEmpty &&
                          !row.parentFormulaId && (
                            <input
                              type="checkbox"
                              checked={isRowSelected(row.id)}
                              onChange={() => toggleRowSelection(row.id)}
                              style={tw(
                                "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                              )}
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

                      // Check if formula is owned by user or is a draft
                      let isFormulaEditable = true;
                      if (column.formulaId && column.id === editableFormula) {
                        const isFormulaOwned = isOwnFormula(column.formulaId);

                        // Check if formula is in draft status
                        const workspaceFormula = formulas.find(
                          (f) => f.id === column.formulaId
                        );
                        const availableFormula = availableFormulas.find(
                          (f) => f.id === column.formulaId
                        );
                        const isDraft =
                          workspaceFormula?.status === "draft" ||
                          availableFormula?.status === "draft";

                        // Formula is editable only if owned or is a draft
                        isFormulaEditable = isFormulaOwned || isDraft;
                      }

                      const isEditable =
                        column.editable &&
                        (!row.isTotal || isTargetTotalInActiveFormula) &&
                        !column.fixed &&
                        column.id === editableFormula &&
                        column.type !== "add-column" &&
                        !row.isEmpty &&
                        isFormulaEditable; // Add ownership/draft check

                      // Use EditableCell for ingredient rows in editable formula columns
                      // For Target Total, use regular cell rendering (only becomes input on focus)
                      if (
                        (isEditable && !isTargetTotalInActiveFormula) ||
                        (isFocused &&
                          column.id === editableFormula &&
                          !isTargetTotalInActiveFormula)
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

                      // For Target Total in active formula ONLY when focused or editing, render as EditableCell
                      if (
                        isTargetTotalInActiveFormula &&
                        (isFocused || isEditing)
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

                      // Regular cells (Target Total when not focused, other rows, etc.)
                      return (
                        <td
                          key={`${row.id}-${column.id}`}
                          style={mergeStyles(
                            tw(
                              "px-3 py-2 border-r border-gray-100 last:border-r-0 font-sans"
                            ),
                            tw(column.key === "description" ? "relative" : ""),
                            tw(
                              isTargetTotalInActiveFormula
                                ? "cursor-pointer hover:bg-blue-50"
                                : ""
                            ),
                            tw(
                              row.isTotal && !isTargetTotalInActiveFormula
                                ? "font-medium bg-gray-100"
                                : ""
                            ),
                            tw(column.fixed ? "bg-gray-25" : ""),
                            tw(
                              column.id === editableFormula && !column.fixed
                                ? "bg-green-50"
                                : ""
                            ),
                            tw(
                              row.isEmpty && column.key === "description"
                                ? "text-center"
                                : ""
                            ),
                            {
                              width: getColumnWidth(),
                              minWidth: getColumnWidth(),
                              maxWidth: getColumnWidth(),
                            }
                          )}
                          colSpan={
                            row.isEmpty && column.key === "description"
                              ? columns.length + (enableRowReordering ? 1 : 0) + (enableBulkSelection ? 1 : 0)
                              : 1
                          }
                          onClick={() => {
                            // Make Target Total clickable to focus
                            if (isTargetTotalInActiveFormula) {
                              navigation.handleCellFocus(row.id, column.id);
                            }
                          }}
                        >
                          {isTargetTotalInActiveFormula
                            ? renderTargetTotalCell(row, column)
                            : // For all other cells, use normal renderCell
                              renderCell(row, column)}

                          {/* Add Item Button inside description cell */}
                          {column.key === "description" &&
                            dataGridFlags.enableInlineAddItem &&
                            !row.isEmpty &&
                            !row.parentFormulaId && (
                              <AddItemButton
                                rowId={row.id}
                                isTotal={row.isTotal}
                                isFormula={!!row.formulaId}
                                onAdd={handleAddItemClick}
                              />
                            )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>

          {/* Sticky footer for total rows */}
          <tfoot
            style={mergeStyles(
              tw("bg-white sticky bottom-0 z-10 border-t-1 border-gray-100"),
              tw(
                scrollState.canScrollDown
                  ? "shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
                  : ""
              )
            )}
          >
            {getSortedData()
              .filter((row) => row.isTotal)
              .map((row) => {
                return (
                  <tr key={row.id} style={tw("bg-gray-100")}>
                    {/* Drag handle cell (if enabled) */}
                    {enableRowReordering && (
                      <td style={tw("w-8 px-2 py-2 text-center")} />
                    )}

                    {/* Checkbox cell (if enabled) */}
                    {enableBulkSelection && (
                      <td style={tw("w-10 px-3 py-2 text-center")} />
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

                      // Check if it's editing/focused (same as tbody)
                      const isEditing =
                        navigation.editingCell?.rowId === row.id &&
                        navigation.editingCell?.columnId === column.id;
                      const isFocused =
                        navigation.focusedCell?.rowId === row.id &&
                        navigation.focusedCell?.columnId === column.id;

                      // Check if it's target total in active formula (same as tbody)
                      const isTargetTotalInActiveFormula =
                        row.isTotal &&
                        row.totalType === "target" &&
                        column.id === editableFormula;

                      // For Target Total in active formula ONLY when focused or editing, render as EditableCell
                      if (
                        isTargetTotalInActiveFormula &&
                        (isFocused || isEditing)
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

                      // Regular cell rendering
                      return (
                        <td
                          key={`${row.id}-${column.id}`}
                          style={mergeStyles(
                            tw(
                              "px-3 py-2 border-r border-gray-100 last:border-r-0 font-sans"
                            ),
                            tw(
                              isTargetTotalInActiveFormula
                                ? "cursor-pointer hover:bg-blue-50"
                                : ""
                            ),
                            tw(
                              row.isTotal && !isTargetTotalInActiveFormula
                                ? "font-medium bg-gray-100"
                                : ""
                            ),
                            tw(column.fixed ? "bg-gray-25" : ""),
                            tw(
                              column.id === editableFormula && !column.fixed
                                ? "bg-green-50"
                                : ""
                            ),
                            {
                              width: getColumnWidth(),
                              minWidth: getColumnWidth(),
                              maxWidth: getColumnWidth(),
                            }
                          )}
                          onClick={() => {
                            // Make Target Total clickable to focus
                            if (isTargetTotalInActiveFormula) {
                              navigation.handleCellFocus(row.id, column.id);
                            }
                          }}
                        >
                          {isTargetTotalInActiveFormula
                            ? renderTargetTotalCell(row, column)
                            : // For all other cells, use normal renderCell
                              renderCell(row, column)}
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

      {/* Add Item Modal */}
      {dataGridFlags.enableInlineAddItem && (
        <AddItemModal
          isOpen={addItemModal.isOpen}
          onClose={handleCloseAddItemModal}
          onAddIngredient={handleAddIngredient}
          onAddFormula={handleAddFormula}
          ingredients={ingredients}
          formulas={libraryFormulas}
          insertAfterRowId={addItemModal.insertAfterRowId}
        />
      )}
    </div>
  );
};

// Memoize DataGrid component to prevent unnecessary re-renders
// Only re-render if data, columns, or formulas actually change
const MemoizedDataGrid = React.memo(
  DataGrid,
  (prevProps, nextProps) => {
    return (
      prevProps.data === nextProps.data &&
      prevProps.columns === nextProps.columns &&
      prevProps.formulas === nextProps.formulas &&
      prevProps.availableFormulas === nextProps.availableFormulas &&
      prevProps.ingredients === nextProps.ingredients &&
      prevProps.loading === nextProps.loading
    );
  }
);

export default MemoizedDataGrid;
