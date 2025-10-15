import Badge from "../../Badge";
import type { Column } from "../../DataGrid";

interface CellRendererProps {
  row: any;
  column: Column;
  editingCell: { rowId: string; columnId: string } | null;
  editValue: any;
  setEditValue: (value: any) => void;
  handleCellSave: () => void;
  handleCellCancel: () => void;
  editableFormula?: string;
  onToggleFormulaExpansion?: (formulaId: string) => void;
  onExplodeFormula?: (formulaId: string) => void;
}

/**
 * Component to render individual cells in the data grid
 * Handles different cell types, editing states, and special formatting
 */
export const CellRenderer = ({
  row,
  column,
  editingCell,
  editValue,
  setEditValue,
  handleCellSave,
  handleCellCancel,
  editableFormula,
  onToggleFormulaExpansion,
  onExplodeFormula,
}: CellRendererProps) => {
  const value = row[column.key];
  const isEditing =
    editingCell?.rowId === row.id && editingCell?.columnId === column.id;
  const isTotal = row.isTotal;
  const isEmpty = row.isEmpty;
  const isActiveFormula = column.id === editableFormula;
  const isFormulaColumn = column.id.startsWith("formula");

  // Helper function for comparison glyphs
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

  // Add-column type - empty cell for rows
  if (column.type === "add-column") {
    return (
      <div className="flex items-center justify-center h-full">
        {/* Empty cell for rows - no plus icon */}
      </div>
    );
  }

  // Description column with hierarchy and empty state
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

  // Editing mode for non-total, non-fixed, active formula cells
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
    // Formula rows in formula columns - editable percentage for active formula
    if (row.isFormula && isFormulaColumn && isActiveFormula) {
      if (isEditing) {
        return (
          <div className="flex items-center">
            <input
              type="number"
              value={editValue}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (val < 0 || isNaN(val)) {
                  setEditValue(0);
                } else {
                  setEditValue(val);
                }
              }}
              onInput={(e) => {
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
                  e.preventDefault();
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
      const activeValue = row[editableFormula || ""] || 0;
      const displayValue = getComparisonGlyph(activeValue, value);

      if (displayValue === "-" || displayValue === ">>") {
        return <span className="text-sm text-gray-400">{displayValue}</span>;
      }

      if (typeof value === "number") {
        return <span className="text-sm">{value.toFixed(2)}</span>;
      }
    }

    // Total rows for formula columns - Target Total editable for active formula
    if (isTotal && isFormulaColumn) {
      if (row.totalType === "target" && isActiveFormula) {
        if (isEditing) {
          return (
            <input
              type="number"
              value={editValue}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (val < 0 || isNaN(val)) {
                  setEditValue(0);
                } else {
                  setEditValue(val);
                }
              }}
              onInput={(e) => {
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
                  e.preventDefault();
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

    // Regular number formatting
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
