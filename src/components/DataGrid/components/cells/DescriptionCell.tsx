import { mockSolvents } from "../../../../mocks/solvents";
import { tw } from "../../../../utils/tailwindToInline";
import { DilutionIcon } from "../../../dilution";
import type { UseDilutionReturn } from "../../../dilution";

interface DescriptionCellProps {
  row: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  value: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  dilutionState?: UseDilutionReturn;
  onToggleFormulaExpansion?: (formulaId: string) => void;
  onExplodeFormula?: (formulaId: string) => void;
  onDilutionClick?: (ingredientId: string, ingredientName: string) => void;
  onAddFormula?: () => void;
}

export const DescriptionCell = ({
  row,
  value,
  dilutionState,
  onToggleFormulaExpansion,
  onExplodeFormula,
  onDilutionClick,
  onAddFormula,
}: DescriptionCellProps) => {
  // Empty state handling
  if (row.isEmpty) {
    return (
      <div
        style={tw(
          "w-full h-full flex flex-col items-center justify-center py-24"
        )}
      >
        <div
          style={tw(
            "w-24 h-24 mb-3 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0"
          )}
        >
          <span className="material-symbols-rounded text-5xl text-gray-400">
            science
          </span>
        </div>
        <h3 style={tw("text-lg font-medium text-gray-400 mb-4")}>
          Start building by adding a formula to begin
        </h3>
        <button
          type="button"
          onClick={onAddFormula}
          style={tw(
            "px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 shadow-sm"
          )}
        >
          <span className="material-symbols-rounded text-lg">add</span>
          Create/Add Formula
        </button>
      </div>
    );
  }

  const indent = (row.level || 0) * 20;
  const isIngredient = !row.isFormula && !row.isTotal && row.id;
  const dilution =
    dilutionState && isIngredient
      ? dilutionState.getDilution(row.id)
      : undefined;

  // Get status color for ingredient/formula rows
  const getStatusColor = () => {
    if (row.isTotal) return ""; // No status for total rows
    const { status, mac } = row;

    // Handle formula-specific statuses
    if (status === "archived") return "bg-gray-500";
    if (status === "draft") return "bg-yellow-500";

    // Handle ingredient-specific statuses
    if (mac !== undefined && mac < 0) return "bg-red-500";
    if (status === "inactive") return "bg-gray-400";
    if (status === "active" || status === "palette") return "bg-green-500";
    if (status === "analytical") return "bg-purple-500";
    if (status === "sers_review") return "bg-blue-500";

    return "bg-green-500"; // Default to green
  };

  const statusColor = getStatusColor();

  return (
    <div
      className="flex items-center justify-between h-full group"
      style={{
        paddingLeft: `${indent}px`,
      }}
    >
      <div style={tw("flex items-center flex-1 min-w-0")}>
        {row.isFormula && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFormulaExpansion?.(row.formulaId);
            }}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 cursor-pointer"
            title={row.isExpanded ? "Collapse Formula" : "Expand Formula"}
            style={tw("-ml-1")}
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
        )}
        {row.isFormula && (
          <span
            className="material-symbols-rounded text-blue-600 text-sm"
            style={tw("mr-3")}
          >
            folder
          </span>
        )}
        {/* Status indicator dot */}
        {statusColor && (
          <div
            style={tw(
              `w-1.5 h-1.5 rounded-full ${statusColor} flex-shrink-0 ${
                row.isFormula ? "" : "mr-2"
              }`
            )}
            title={`Status: ${row.status || "active"}${
              row.mac !== undefined && row.mac < 0 ? " (non-compliant)" : ""
            }`}
          />
        )}
        <span
          className={`text-sm ${
            row.isFormula ? "font-semibold text-blue-900" : ""
          } ${row.isTotal ? "font-semibold" : ""} ${
            row.parentFormulaId && !row.isExpanded ? "text-gray-600" : ""
          }`}
          style={tw(row.isFormula && statusColor ? "ml-2" : "")}
        >
          {value || ""}
        </span>
      </div>

      {/* Explode button for formulas */}
      {row.isFormula && (
        <>
          {console.log(
            "🔍 Rendering explode button for formula:",
            row.formulaId,
            "has callback:",
            !!onExplodeFormula
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              console.log(
                "🧨 Explode button clicked for formula:",
                row.formulaId,
                "callback exists:",
                !!onExplodeFormula
              );
              if (onExplodeFormula) {
                onExplodeFormula(row.formulaId);
              } else {
                console.error("❌ onExplodeFormula callback is undefined!");
              }
            }}
            style={tw(
              "flex-shrink-0 ml-2 text-orange-600 hover:text-orange-700 transition-colors"
            )}
            title="Explode Formula"
          >
            <span
              className="material-symbols-rounded text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bomb
            </span>
          </button>
        </>
      )}

      {/* Dilution Display - show percentage and solvent when dilution exists */}
      {isIngredient &&
        !row.parentFormulaId &&
        dilutionState &&
        dilution &&
        dilution.solventIds.length > 0 && (
          <button
            type="button"
            onClick={() => {
              onDilutionClick?.(row.id, value || "");
            }}
            style={tw(
              "flex items-center gap-1 ml-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            )}
            title="Edit Dilution"
          >
            <span style={tw("text-xs font-medium whitespace-nowrap")}>
              {(() => {
                const solventCodes = dilution.solventIds
                  .map(
                    (id) => mockSolvents.find((s) => s.id === id)?.code || ""
                  )
                  .filter(Boolean)
                  .join(", ");
                const percentageDisplay = (
                  dilution.concentration * 100
                ).toFixed(dilution.concentration < 0.01 ? 4 : 2);
                return `${percentageDisplay}% ${solventCodes}`;
              })()}
            </span>
            <span
              className="material-symbols-rounded text-sm flex-shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              water_drop
            </span>
          </button>
        )}

      {/* Dilution Icon - show only when no dilution (on hover) */}
      {isIngredient &&
        !row.parentFormulaId &&
        dilutionState &&
        (!dilution || dilution.solventIds.length === 0) && (
          <div className="flex items-center justify-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DilutionIcon
              onClick={() => {
                onDilutionClick?.(row.id, value || "");
              }}
              hasDilution={false}
            />
          </div>
        )}
    </div>
  );
};
