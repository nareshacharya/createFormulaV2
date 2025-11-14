import { useState } from "react";
import type { Formula } from "../services/pega";
import { eventBus } from "../utils/bus";
import { tw, mergeStyles } from "../utils/tailwindToInline";
import FormulaQuickView from "./FormulaQuickView";
import ListRow from "./ListRow";

interface FormulaListProps {
  formulas: Formula[];
  searchQuery?: string;
  selectedFormulas: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onFormulaSelect?: (formula: Formula) => void;
}

const FormulaList = ({
  formulas,
  searchQuery = "",
  selectedFormulas,
}: FormulaListProps) => {
  const [hoveredFormula, setHoveredFormula] = useState<string | null>(null);
  const [selectedFormulaForView, setSelectedFormulaForView] =
    useState<Formula | null>(null);

  const getStatusColor = (formula: Formula) => {
    switch (formula.status) {
      case "active":
        return "bg-green-500";
      case "draft":
        return "bg-yellow-500";
      case "archived":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const filteredFormulas = formulas.filter((formula) => {
    if (!formula) return false;

    // Ensure searchQuery is defined and is a string
    if (!searchQuery || typeof searchQuery !== "string") return true;

    const searchLower = searchQuery.toLowerCase();
    const name = formula.name || "";
    const category = formula.category || "";
    const id = formula.id || "";

    return (
      name.toLowerCase().includes(searchLower) ||
      category.toLowerCase().includes(searchLower) ||
      id.toLowerCase().includes(searchLower)
    );
  });

  const handleFormulaClick = (formula: Formula) => {
    eventBus.emit("formula-selected", { formula });
  };

  const handleViewClick = (e: React.MouseEvent, formula: Formula) => {
    e.stopPropagation();
    setSelectedFormulaForView(formula);
  };

  const isFormulaSelected = (formulaId: string) => {
    return selectedFormulas.includes(formulaId);
  };

  if (filteredFormulas.length === 0) {
    return (
      <div style={tw("text-center py-8 text-gray-500")}>
        <span
          style={mergeStyles(tw("text-2xl"), {
            marginBottom: "0.5rem",
            display: "block",
          })}
          className="material-symbols-rounded"
        >
          science
        </span>
        <p>No formulas found</p>
        {searchQuery && (
          <p style={mergeStyles(tw("text-sm"), { marginTop: "0.25rem" })}>
            Try adjusting your search term
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={tw("space-y-0")}>
      {filteredFormulas.map((formula) => {
        if (!formula || !formula.id) return null;

        const isSelected = isFormulaSelected(formula.id);

        return (
          <ListRow
            key={formula.id}
            onHover={(isHovered) =>
              setHoveredFormula(isHovered ? formula.id : null)
            }
            onClick={() => handleFormulaClick(formula)}
            compact={true}
            className={
              isSelected ? "bg-blue-50 border-l-2 border-blue-400" : ""
            }
          >
            <div style={tw("flex items-center justify-between w-full px-3")}>
              <div style={tw("flex items-center flex-1")}>
                {/* Status Dot */}
                <div
                  style={{
                    width: "0.375rem",
                    height: "0.375rem",
                    borderRadius: "9999px",
                    flexShrink: 0,
                    marginRight: "0.5rem",
                    ...tw(getStatusColor(formula)),
                  }}
                  title={`Status: ${formula.status}`}
                />

                {/* Formula Info */}
                <div style={tw("flex-1 min-w-0")}>
                  <h4
                    style={tw(
                      `font-medium text-sm truncate ${
                        isSelected ? "text-blue-900" : "text-gray-900"
                      }`
                    )}
                  >
                    {formula.name}
                    {isSelected && (
                      <span
                        style={tw("text-blue-600 ml-1 text-xs")}
                        className="material-symbols-rounded"
                      >
                        check
                      </span>
                    )}
                  </h4>
                  <p
                    style={tw(
                      `text-xs truncate font-normal ${
                        isSelected ? "text-blue-600" : "text-gray-500"
                      }`
                    )}
                  >
                    {formula.id}
                  </p>
                </div>

                {/* Cost */}
                <div style={tw("text-right flex-shrink-0")}>
                  <p
                    style={tw(
                      `text-xs font-normal ${
                        isSelected ? "text-blue-600" : "text-gray-500"
                      }`
                    )}
                  >
                    ${formula.costPerKg?.toFixed(2) || "0.00"}/kg
                  </p>
                </div>
              </div>

              {/* Eye Icon - Only visible on hover */}
              {hoveredFormula === formula.id && (
                <button
                  style={tw(
                    "ml-2 p-1 rounded hover:bg-gray-100 cursor-pointer flex-shrink-0"
                  )}
                  onClick={(e) => handleViewClick(e, formula)}
                  aria-label={`View details for ${formula.name}`}
                >
                  <span
                    style={tw("text-gray-400 text-lg")}
                    className="material-symbols-rounded"
                  >
                    visibility
                  </span>
                </button>
              )}
            </div>
          </ListRow>
        );
      })}

      {/* Quick View Modal */}
      <FormulaQuickView
        formula={selectedFormulaForView}
        isOpen={!!selectedFormulaForView}
        onClose={() => setSelectedFormulaForView(null)}
      />
    </div>
  );
};

export default FormulaList;
