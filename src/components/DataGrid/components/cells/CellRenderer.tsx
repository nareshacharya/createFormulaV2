import type { UseDilutionReturn } from "../../../dilution";
import { DescriptionCell } from "./DescriptionCell";
import { NumberCell } from "./NumberCell";
import { DefaultCell } from "./DefaultCell";

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

interface CellRendererProps {
  row: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  column: Column;
  editableFormula?: string;
  dilutionState?: UseDilutionReturn;
  onToggleFormulaExpansion?: (formulaId: string) => void;
  onExplodeFormula?: (formulaId: string) => void;
  onDilutionClick?: (ingredientId: string, ingredientName: string) => void;
  onCellEdit?: (rowId: string, columnId: string, value: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const CellRenderer = ({
  row,
  column,
  editableFormula,
  dilutionState,
  onToggleFormulaExpansion,
  onExplodeFormula,
  onDilutionClick,
  onCellEdit,
}: CellRendererProps) => {
  const value = row[column.key];

  // Description column gets special treatment
  if (column.key === "description") {
    return (
      <DescriptionCell
        row={row}
        value={value}
        dilutionState={dilutionState}
        onToggleFormulaExpansion={onToggleFormulaExpansion}
        onExplodeFormula={onExplodeFormula}
        onDilutionClick={onDilutionClick}
      />
    );
  }

  // Number type cells
  if (column.type === "number") {
    return (
      <NumberCell
        row={row}
        column={column}
        value={value}
        editableFormula={editableFormula}
        onExplodeFormula={onExplodeFormula}
        onCellEdit={onCellEdit}
      />
    );
  }

  // All other cell types (text, boolean, badge, add-column, etc.)
  return <DefaultCell row={row} column={column} value={value} />;
};
