import { useState, useEffect } from "react";
import type { Formula } from "../services/pega";
import ListRow from "./ListRow";
import Badge from "./Badge";
import { eventBus } from "../utils/bus";

interface FormulaListProps {
  formulas: Formula[];
  searchTerm: string;
  selectedFormulas: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const FormulaList = ({
  formulas,
  searchTerm = "",
  selectedFormulas,
  onSelectionChange,
}: FormulaListProps) => {
  const [hoveredFormula, setHoveredFormula] = useState<string | null>(null);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "default";
      default:
        return "default";
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

  const handleFormulaSelect = (formulaId: string, selected: boolean) => {
    if (selected) {
      onSelectionChange([...selectedFormulas, formulaId]);
    } else {
      onSelectionChange(selectedFormulas.filter((id) => id !== formulaId));
    }
  };

  if (filteredFormulas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <i className="ri-flask-line text-2xl mb-2"></i>
        <p>No formulas found</p>
        {searchTerm && (
          <p className="text-sm mt-1">Try adjusting your search term</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredFormulas.map((formula) => {
        if (!formula || !formula.id) return null;

        const ingredientCount = formula.ingredients?.length || 0;
        const avgPrice =
          ingredientCount > 0
            ? formula.ingredients.reduce(
                (sum, ing) => sum + (ing.price || 0),
                0
              ) / ingredientCount
            : 0;

        return (
          <ListRow
            key={formula.id}
            title={formula.name || "Untitled Formula"}
            subtitle={`v${formula.version || "1.0"} • ${
              formula.category || "Unknown"
            } • ${ingredientCount} ingredients`}
            price={`$${avgPrice.toFixed(2)}/kg`}
            badge={
              <Badge
                variant={getStatusVariant(formula.status || "draft")}
                size="sm"
              >
                {formula.status || "draft"}
              </Badge>
            }
            selected={selectedFormulas.includes(formula.id)}
            onSelect={(selected) => handleFormulaSelect(formula.id, selected)}
            onClick={() => handleFormulaClick(formula)}
            onMouseEnter={() => setHoveredFormula(formula.id)}
            onMouseLeave={() => setHoveredFormula(null)}
            hovered={hoveredFormula === formula.id}
          />
        );
      })}
    </div>
  );
};

export default FormulaList;
