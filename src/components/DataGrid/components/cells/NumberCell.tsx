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

interface NumberCellProps {
  row: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  column: Column;
  value: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  editableFormula?: string;
  onExplodeFormula?: (formulaId: string) => void;
  onCellEdit?: (rowId: string, columnId: string, value: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

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

export const NumberCell = ({
  row,
  column,
  value,
  editableFormula,
  onExplodeFormula,
  onCellEdit,
}: NumberCellProps) => {
  const isActiveFormula = column.id === editableFormula;
  const isFormulaColumn = column.id.startsWith("formula");
  const isTotal = row.isTotal;

  // Formula rows in formula columns
  if (row.isFormula && isFormulaColumn) {
    // Non-active formula columns: show plain number without input styling
    if (!isActiveFormula) {
      return (
        <div className="flex items-center justify-end text-sm text-gray-600">
          {typeof value === "number" ? value.toFixed(2) : value || "-"}
        </div>
      );
    }

    // Active formula column: show input with explode icon on right
    return (
      <div className="flex items-center gap-2 w-full group">
        <input
          type="number"
          value={typeof value === "number" ? value.toFixed(5) : value || 100}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            if (!Number.isNaN(newValue)) {
              onCellEdit?.(row.id, column.id, newValue);
            }
          }}
          className="flex-1 min-w-0 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="0.1"
          style={{
            MozAppearance: "textfield",
            appearance: "textfield",
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExplodeFormula?.(row.formulaId);
          }}
          className="opacity-0 group-hover:opacity-100 text-orange-600 hover:text-orange-700 transition-all"
          title="Explode Formula"
        >
          <span
            className="material-symbols-rounded text-base"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bomb
          </span>
        </button>
      </div>
    );
  }

  // Comparison glyphs for non-active formulas
  if (isFormulaColumn && !isActiveFormula && !isTotal) {
    const activeValue = row[editableFormula || ""] || 0;
    const displayValue = getComparisonGlyph(activeValue, value);

    if (displayValue === "-" || displayValue === ">>") {
      return (
        <span className="text-sm text-gray-400 text-right block">
          {displayValue}
        </span>
      );
    }

    // Show 2 decimals for readonly formula values
    if (typeof value === "number") {
      return (
        <span className="text-sm text-right block">{value.toFixed(2)}</span>
      );
    }
  }

  // Total rows for formula columns
  if (isTotal && isFormulaColumn) {
    // Target total row for active formula: display as regular value
    // The DataGrid component handles making it editable via EditableCell when focused
    // So here we just display it as a read-only value
    if (row.totalType === "target" && isActiveFormula) {
      const displayValue =
        typeof value === "number" ? value.toFixed(5) : value || "100.00000";
      return (
        <span className="text-sm font-semibold text-gray-900 text-right block">
          {displayValue}
        </span>
      );
    }

    // All other total rows (lines, rmc, running) remain read-only displays
    if (value === "-") {
      return (
        <span className="text-sm text-gray-400 font-semibold text-right block">
          -
        </span>
      );
    }
    if (value !== null && value !== undefined) {
      // Special handling for different total types
      let decimals = 2;
      let displayValue: string | number = value;

      if (row.totalType === "lines") {
        // Number of Lines: no decimals, just integer
        displayValue = typeof value === "number" ? Math.round(value) : value;
      } else if (row.totalType === "rmc") {
        // RMC: always 2 decimals
        decimals = 2;
        displayValue = typeof value === "number" ? value.toFixed(2) : value;
      } else if (row.totalType === "running" || row.totalType === "target") {
        // Running Total and Target Total: 5 decimals for active formula, 2 for others
        decimals = isActiveFormula ? 5 : 2;
        displayValue =
          typeof value === "number" ? value.toFixed(decimals) : value;
      } else {
        // Default: 5 decimals for active formula, 2 decimals for others
        decimals = isActiveFormula ? 5 : 2;
        displayValue =
          typeof value === "number" ? value.toFixed(decimals) : value;
      }

      return (
        <span
          className={`text-sm ${
            isTotal ? "font-semibold text-gray-900" : ""
          } text-right block`}
        >
          {displayValue}
        </span>
      );
    }
    return <span className="text-sm text-gray-400 text-right block">-</span>;
  }

  // Currency formatting for cost columns
  if (column.id === "costKg" || column.id === "contCost") {
    if (value === null || value === undefined) return "-";
    const displayValue = typeof value === "number" ? value.toFixed(2) : value;
    return <span className="text-sm text-right block">${displayValue}</span>;
  }

  // Regular number formatting - 5 decimals for active formula, 2 decimals for others
  const decimals = isFormulaColumn && isActiveFormula ? 5 : 2;
  const displayValue =
    typeof value === "number" ? value.toFixed(decimals) : value;
  return (
    <span
      className={`text-sm ${
        isTotal ? "font-semibold text-gray-900" : ""
      } text-right block`}
    >
      {displayValue}
    </span>
  );
};
