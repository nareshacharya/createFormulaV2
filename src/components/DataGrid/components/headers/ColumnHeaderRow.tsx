/* eslint-disable jsx-a11y/label-has-associated-control, jsx-a11y/control-has-associated-label */
import { ColumnHeaderCell } from "./ColumnHeaderCell";

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

interface ColumnHeaderRowProps {
  columns: Column[];
  formulas?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  availableFormulas?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  enableRowReordering?: boolean;
  enableBulkSelection?: boolean;
  editableFormula?: string | null;
  draggedColumn: number | null;
  dragOverColumn: number | null;
  showColumnActions: string | null;
  sortConfig: SortConfig | null;
  groupedByColumn: string | null;
  isAllSelected: () => boolean;
  isSomeSelected: () => boolean;
  toggleSelectAll: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
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

export const ColumnHeaderRow = ({
  columns,
  formulas = [],
  availableFormulas = [],
  enableRowReordering = false,
  enableBulkSelection = false,
  editableFormula,
  draggedColumn,
  dragOverColumn,
  showColumnActions,
  sortConfig,
  groupedByColumn,
  isAllSelected,
  isSomeSelected,
  toggleSelectAll,
  menuRef,
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
}: ColumnHeaderRowProps) => {
  return (
    <tr>
      {/* Drag handle column (if enabled) */}
      {enableRowReordering && (
        <th className="w-8 px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 border-r border-b border-gray-200">
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
        <th className="w-10 px-3 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 border-r border-b border-gray-200">
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

      {columns.map((column, index) => (
        <ColumnHeaderCell
          key={column.id}
          column={column}
          formulas={formulas}
          availableFormulas={availableFormulas}
          index={index}
          editableFormula={editableFormula}
          draggedColumn={draggedColumn}
          dragOverColumn={dragOverColumn}
          showColumnActions={showColumnActions}
          sortConfig={sortConfig}
          groupedByColumn={groupedByColumn}
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
      ))}
    </tr>
  );
};
