/**
 * DataGrid Type Definitions
 * Centralized type definitions for the DataGrid component
 */

export interface Column {
    id: string;
    label: string;
    key: string;
    type?: "text" | "number" | "boolean" | "add-column" | "select";
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    fixed?: boolean;
    editable?: boolean;
    group?: string;
    formulaId?: string;
    sortable?: boolean;
    groupable?: boolean;
    attributeId?: string;
    attributeValues?: string[];
    render?: (value: any, row: any) => React.ReactNode;
}

export interface DataGridRow {
    id: string;
    [key: string]: any;
    isTotal?: boolean;
    totalType?: string;
    isFormula?: boolean;
    isEmpty?: boolean;
}

export interface SavedView {
    id: string;
    name: string;
    rowOrder: string[];
    timestamp: number;
}

export interface DragState {
    draggedRowId: string | null;
    dragOverRowId: string | null;
}

export interface EditingCell {
    rowId: string;
    columnId: string;
}

export interface DataGridProps {
    columns: Column[];
    data: DataGridRow[];
    onCellEdit?: (rowId: string, columnId: string, value: any) => void;
    onRowDelete?: (rowId: string) => void;
    onColumnReorder?: (startIndex: number, endIndex: number) => void;
    onDeleteColumn?: (columnId: string) => void;
    onAddColumn?: () => void;
    onColumnMenuAction?: (columnId: string, action: string) => void;
    editableFormula?: string | null;
    maxFormulaSelections?: number;
    onNormalizeFormula?: (columnId: string) => void;
    onSendForCompounding?: (columnId: string) => void;
    onCreateVersion?: (columnId: string) => void;
    onRowReorder?: (rowOrder: string[]) => void;
    savedViews?: SavedView[];
    onSaveView?: (viewName: string) => void;
    onLoadView?: (viewId: string) => void;
    showEmptyState?: boolean;
    groupedByColumn?: string | null;
    onToggleGrouping?: (columnId: string) => void;
}
