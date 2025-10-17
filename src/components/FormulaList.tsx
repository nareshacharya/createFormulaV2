import { useState } from "react";
import type { Formula } from "../services/pega";
import ListRow from "./ListRow";
import FormulaQuickView from "./FormulaQuickView";
import { eventBus } from "../utils/bus";

interface FormulaListProps {
  formulas: Formula[];
  searchTerm?: string;
  searchQuery?: string;
  selectedFormulas: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onFormulaSelect?: (formula: Formula) => void;
}

const FormulaList = ({
  formulas,
  searchTerm = "",
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

    // Ensure searchTerm is defined and is a string
    if (!searchTerm || typeof searchTerm !== "string") return true;

    const searchLower = searchTerm.toLowerCase();
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
      <div className="text-center py-8 text-gray-500">
        <span className="material-symbols-rounded text-2xl mb-2">beaker</span>
        <p>No formulas found</p>
        {searchTerm && (
          <p className="text-sm mt-1">Try adjusting your search term</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-0">
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
            <div className="flex items-center justify-between w-full px-3">
              <div className="flex items-center space-x-2 flex-1">
                {/* Status Dot */}
                <div
                  className={`w-1.5 h-1.5 rounded-full ${getStatusColor(
                    formula
                  )} flex-shrink-0`}
                  title={`Status: ${formula.status}`}
                />

                {/* Formula Info */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-medium text-sm truncate ${
                      isSelected ? "text-blue-900" : "text-gray-900"
                    }`}
                  >
                    {formula.name}
                    {isSelected && (
                      <span className="material-symbols-rounded text-blue-600 ml-1 text-xs">
                        check
                      </span>
                    )}
                  </h4>
                  <p
                    className={`text-xs truncate font-normal ${
                      isSelected ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {formula.id}
                  </p>
                </div>

                {/* Cost */}
                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-xs font-normal ${
                      isSelected ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    ${formula.costPerKg?.toFixed(2) || "0.00"}/kg
                  </p>
                </div>
              </div>

              {/* Eye Icon - Only visible on hover */}
              {hoveredFormula === formula.id && (
                <button
                  className="ml-2 p-1 rounded hover:bg-gray-100 cursor-pointer flex-shrink-0"
                  onClick={(e) => handleViewClick(e, formula)}
                  aria-label={`View details for ${formula.name}`}
                >
                  <span className="material-symbols-rounded text-gray-400 text-lg">
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
