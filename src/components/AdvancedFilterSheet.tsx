/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { useEffect, useState } from "react";
import type { Ingredient } from "../services/pega";
import { eventBus } from "../utils/bus";
import { evaluateQuery } from "../utils/queryEvaluator";
import { tw, mergeStyles } from "../utils/tailwindToInline";
import Button from "./Button";
import IngredientTable from "./IngredientTable";
import Modal from "./Modal";
import MultiSelectDropdown from "./MultiSelectDropdown";
import QueryBuilder from "./QueryBuilder";
import type { FilterGroup } from "./QueryBuilder";

interface AdvancedFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (query: FilterGroup) => void;
  ingredients: Ingredient[];
  filteredIngredients?: Ingredient[]; // Reserved for future use
}

const AdvancedFilterSheet = ({
  isOpen,
  onClose,
  onApplyFilters,
  ingredients,
  filteredIngredients: _filteredIngredients, // Reserved for future use
}: AdvancedFilterSheetProps) => {
  const [currentQuery, setCurrentQuery] = useState<FilterGroup>({
    id: "root",
    combinator: "and",
    rules: [],
  });
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [displayColumns, setDisplayColumns] = useState<string[]>([
    "name",
    "status",
    "price",
    "type",
    "category",
    "supplier",
    "mac",
  ]);
  const [localFilteredIngredients, setLocalFilteredIngredients] = useState<
    Ingredient[]
  >([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  const availableColumns = [
    "name",
    "code",
    "type",
    "category",
    "supplier",
    "status",
    "price",
    "mac",
    "odorProfile",
    "volatility",
    "allergens",
    "ifraCategory",
    "casNumber",
    "unit",
  ];

  // Apply filters locally within the modal
  useEffect(() => {
    const filtered = ingredients.filter((ingredient) => {
      return evaluateQuery(ingredient, currentQuery);
    });
    setLocalFilteredIngredients(filtered);
  }, [ingredients, currentQuery]);

  const handleQueryChange = (query: FilterGroup) => {
    setCurrentQuery(query);
  };

  const handleApplyFilters = () => {
    // Apply filters to the main library view
    onApplyFilters(currentQuery);
    onClose();
  };

  const handleClearFilters = () => {
    const emptyQuery = {
      id: "root",
      combinator: "and" as const,
      rules: [],
    };
    setCurrentQuery(emptyQuery);
    setSelectedIngredients([]);
  };

  const handleAddToFormula = () => {
    const ingredientsToAdd = localFilteredIngredients.filter((ing) =>
      selectedIngredients.includes(ing.id)
    );
    ingredientsToAdd.forEach((ingredient) => {
      eventBus.emit("ingredient-selected", { ingredient });
    });
    setSelectedIngredients([]); // Clear selection after adding
    onClose(); // Close modal after adding
  };

  // Reset selection when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedIngredients([]);
      setLocalFilteredIngredients(ingredients);
    }
  }, [isOpen, ingredients]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced Ingredient Filters"
      size="3xl"
      noPadding
      headerActions={
        <div style={mergeStyles(tw("flex items-center"), { gap: "1rem" })}>
          <div style={tw("text-sm text-gray-500")}>
            {localFilteredIngredients.length} of {ingredients.length}{" "}
            ingredients
          </div>
          {selectedIngredients.length > 0 && (
            <Button
              onClick={handleAddToFormula}
              size="sm"
              style={tw("whitespace-nowrap")}
            >
              <i style={tw("mr-1")} className="ri-add-line"></i>
              Add {selectedIngredients.length} to Formula
            </Button>
          )}
        </div>
      }
      footerActions={
        <div style={tw("flex justify-between items-center w-full")}>
          <div style={tw("text-sm text-gray-500")}>
            {selectedIngredients.length} ingredients selected
          </div>
          <div style={mergeStyles(tw("flex"), { gap: "0.75rem" })}>
            <button
              type="button"
              onClick={handleClearFilters}
              style={tw(
                "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              )}
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              style={tw(
                "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              )}
            >
              Apply to Library
            </button>
          </div>
        </div>
      }
    >
      <div style={tw("flex h-full")}>
        {/* Left Side - Filter Criteria Panel */}
        <div
          style={mergeStyles(
            tw(
              "border-r border-gray-200 flex-shrink-0 bg-gray-50 flex flex-col"
            ),
            { width: "20rem" }
          )}
        >
          {/* Filter Criteria Header */}
          <div style={tw("border-b border-gray-200 flex-shrink-0")}>
            <div
              style={tw(
                "flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100"
              )}
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            >
              <h4 style={tw("text-sm font-medium text-gray-700")}>
                Filter Criteria ({currentQuery.rules.length})
              </h4>
              <i
                style={tw("text-sm text-gray-500")}
                className={`ri-arrow-${
                  isFilterExpanded ? "up" : "down"
                }-s-line`}
              ></i>
            </div>
          </div>

          {/* Filter Criteria Content - Expandable to full height */}
          {isFilterExpanded && (
            <div style={tw("flex-1 overflow-hidden flex flex-col")}>
              <div style={tw("flex-1 overflow-auto p-3")}>
                <QueryBuilder
                  onQueryChange={handleQueryChange}
                  onApply={() => {
                    /* Local apply only */
                  }}
                  onClear={handleClearFilters}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Search Results */}
        <div style={tw("flex-1 flex flex-col overflow-hidden")}>
          {/* Compact Results Header with Column Configuration */}
          <div
            style={tw(
              "px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0"
            )}
          >
            <div style={tw("flex items-center justify-between")}>
              <div
                style={mergeStyles(tw("flex items-center"), { gap: "1rem" })}
              >
                <h4 style={tw("text-sm font-medium text-gray-700")}>
                  Search Results
                </h4>
                <div style={tw("text-xs text-gray-500")}>
                  {localFilteredIngredients.length} ingredients found
                </div>
              </div>
              <div
                style={mergeStyles(tw("flex items-center"), { gap: "0.5rem" })}
              >
                <span style={tw("text-xs text-gray-500")}>Columns:</span>
                <div style={tw("w-48")}>
                  <MultiSelectDropdown
                    options={availableColumns}
                    selectedOptions={displayColumns}
                    onSelectionChange={setDisplayColumns}
                    placeholder="Configure columns..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div style={tw("flex-1 p-4 overflow-auto")}>
            <IngredientTable
              ingredients={localFilteredIngredients}
              selectedIngredients={selectedIngredients}
              onSelectionChange={setSelectedIngredients}
              displayColumns={displayColumns}
              showActionsBar={false}
              enableAdvancedFeatures={false}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AdvancedFilterSheet;
