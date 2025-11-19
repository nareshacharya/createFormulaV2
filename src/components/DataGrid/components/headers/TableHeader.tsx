import { ColumnHeaderRow } from "./ColumnHeaderRow";
import { GroupHeaderRow } from "./GroupHeaderRow";

// Use Column type from DataGrid.tsx to match parent component
interface Column {
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
  render?: (value: any, row: any) => React.ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface ScrollState {
  canScrollUp: boolean;
  canScrollDown: boolean;
}

interface TableHeaderProps {
  columns: Column[];
  formulas?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  availableFormulas?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  groupedColumns: Record<string, Column[]>;
  enableRowReordering?: boolean;
  enableBulkSelection?: boolean;
  editableFormula?: string | null;
  draggedColumn: number | null;
  dragOverColumn: number | null;
  showColumnActions: string | null;
  sortConfig: SortConfig | null;
  groupedByColumn: string | null;
  scrollState: ScrollState;
  isAllSelected: () => boolean;
  isSomeSelected: () => boolean;
  toggleSelectAll: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
  getGroupColor: (groupName: string) => string;
  getGroupSpan: (groupName: string) => number;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onColumnHeaderClick: (e: React.MouseEvent, columnId: string) => void;
  onAddColumn: (type: "formula" | "attribute") => void;
  onSort: (columnId: string) => void;
  onToggleGrouping?: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  onSetActiveFormula?: (columnId: string) => void;
  onCreateVersion?: (columnId: string) => void;
  onNormalizeFormula?: (columnId: string) => void;
  onSendForCompounding?: (columnId: string) => void;
  onEditFormulaDetails?: (columnId: string) => void;
  onViewFormulaDetails?: (columnId: string) => void;
  onUploadExcel?: (columnId: string) => void;
  setShowColumnActions: (columnId: string | null) => void;
}

export const TableHeader = ({
  columns,
  formulas = [],
  availableFormulas = [],
  groupedColumns,
  enableRowReordering = false,
  enableBulkSelection = false,
  editableFormula,
  draggedColumn,
  dragOverColumn,
  showColumnActions,
  sortConfig,
  groupedByColumn,
  scrollState,
  isAllSelected,
  isSomeSelected,
  toggleSelectAll,
  menuRef,
  getGroupColor,
  getGroupSpan,
  onDragStart,
  onDragOver,
  onDrop,
  onColumnHeaderClick,
  onAddColumn,
  onSort,
  onToggleGrouping,
  onDeleteColumn,
  onSetActiveFormula,
  onCreateVersion,
  onNormalizeFormula,
  onSendForCompounding,
  onEditFormulaDetails,
  onViewFormulaDetails,
  onUploadExcel,
  setShowColumnActions,
}: TableHeaderProps) => {
  return (
    <thead
      className={`bg-gray-300 sticky top-0 z-10 border-gray-100 ${
        scrollState.canScrollUp ? "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]" : ""
      }`}
    >
      {/* Group headers */}
      <GroupHeaderRow
        columns={columns}
        groupedColumns={groupedColumns}
        enableRowReordering={enableRowReordering}
        enableBulkSelection={enableBulkSelection}
        getGroupColor={getGroupColor}
        getGroupSpan={getGroupSpan}
      />

      {/* Column headers */}
      <ColumnHeaderRow
        columns={columns}
        formulas={formulas}
        availableFormulas={availableFormulas}
        enableRowReordering={enableRowReordering}
        enableBulkSelection={enableBulkSelection}
        editableFormula={editableFormula}
        draggedColumn={draggedColumn}
        dragOverColumn={dragOverColumn}
        showColumnActions={showColumnActions}
        sortConfig={sortConfig}
        groupedByColumn={groupedByColumn}
        isAllSelected={isAllSelected}
        isSomeSelected={isSomeSelected}
        toggleSelectAll={toggleSelectAll}
        menuRef={menuRef}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onColumnHeaderClick={onColumnHeaderClick}
        onAddColumn={onAddColumn}
        onSort={onSort}
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
    </thead>
  );
};
