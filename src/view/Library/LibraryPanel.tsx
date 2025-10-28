import { useState, useEffect } from "react";
import SearchBar from "../../components/SearchBar";
import PillTabs from "../../components/PillTabs";
import IngredientList from "../../components/IngredientList";
import FormulaList from "../../components/FormulaList";
import IngredientAttributeList from "../../components/IngredientAttributeList";
import AdvancedFilterSheet from "../../components/AdvancedFilterSheet";
import Button from "../../components/Button";
import { PegaService } from "../../services/pega";
import type {
  Ingredient,
  Formula,
  IngredientAttribute,
} from "../../services/pega";
import { evaluateQuery } from "../../utils/queryEvaluator";
import type { FilterGroup } from "../../components/QueryBuilder";
import { eventBus } from "../../utils/bus";

const LibraryPanel = () => {
  const [activeTab, setActiveTab] = useState("ingredients");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<FilterGroup>({
    id: "root",
    combinator: "and",
    rules: [],
  });
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [maxAttributeSelections] = useState(5); // Configurable later
  const [selectedFormulaIds, setSelectedFormulaIds] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Data states
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [attributes, setAttributes] = useState<IngredientAttribute[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: "ingredients", label: "Ingredients", icon: "labs" },
    { id: "formulas", label: "Formulas", icon: "experiment" },
    { id: "attributes", label: "Attributes", icon: "checklist" },
  ];

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [ingredientsData, formulasData, attributesData] =
          await Promise.all([
            PegaService.getIngredients(),
            PegaService.getFormulas(),
            PegaService.getIngredientAttributes(),
          ]);

        setIngredients(ingredientsData);
        setFormulas(formulasData);
        setAttributes(attributesData);
      } catch (error) {
        console.error("Failed to load library data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Listen for attribute selection events from work area
  useEffect(() => {
    const handleWorkAreaUpdate = (data: { selectedAttributes?: string[] }) => {
      if (data.selectedAttributes) {
        setSelectedAttributes(data.selectedAttributes);
      }
    };

    eventBus.on("work-area-attributes-updated", handleWorkAreaUpdate);

    return () => {
      eventBus.off("work-area-attributes-updated", handleWorkAreaUpdate);
    };
  }, []);

  // Listen for formula selection updates
  useEffect(() => {
    const handleFormulaSelectionsUpdated = (data: {
      count: number;
      selectedIds: string[];
    }) => {
      console.log("📥 LibraryPanel received formula-selections-updated:", data);
      setSelectedFormulaIds(data.selectedIds || []);
    };

    eventBus.on("formula-selections-updated", handleFormulaSelectionsUpdated);

    return () => {
      eventBus.off(
        "formula-selections-updated",
        handleFormulaSelectionsUpdated
      );
    };
  }, []);

  // Listen for ingredient selection updates from work area
  useEffect(() => {
    const handleWorkAreaIngredientsUpdate = (data: {
      ingredients: string[];
    }) => {
      setSelectedIngredients(data.ingredients || []);
    };

    eventBus.on("work-area-updated", handleWorkAreaIngredientsUpdate);

    return () => {
      eventBus.off("work-area-updated", handleWorkAreaIngredientsUpdate);
    };
  }, []);

  // Filter ingredients based on search, type filter, and advanced filters
  const filteredIngredients = ingredients.filter((ingredient) => {
    // Basic search filter
    const matchesSearch =
      !searchQuery ||
      ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ingredient.code.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    const matchesTypeFilter =
      activeFilter === "all" ||
      (activeFilter === "natural" && ingredient.type === "natural") ||
      (activeFilter === "synthetic" && ingredient.type === "synthetic") ||
      (activeFilter === "bases" && ingredient.type === "base");

    // Advanced query filter
    const matchesQuery = evaluateQuery(ingredient, currentQuery);

    return matchesSearch && matchesTypeFilter && matchesQuery;
  });

  // Filter formulas based on search
  const filteredFormulas = formulas.filter(
    (formula) =>
      !searchQuery ||
      formula.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formula.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formula.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter attributes based on search
  const filteredAttributes = attributes.filter(
    (attribute) =>
      !searchQuery ||
      attribute.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attribute.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate filter counts correctly
  const naturalCount = ingredients.filter((i) => i.type === "natural").length;
  const syntheticCount = ingredients.filter(
    (i) => i.type === "synthetic"
  ).length;
  const basesCount = ingredients.filter((i) => i.type === "base").length;
  const totalCount = ingredients.length;

  const ingredientFilters = [
    { id: "all", label: "All", count: totalCount },
    { id: "natural", label: "Natural", count: naturalCount },
    { id: "synthetic", label: "Synthetic", count: syntheticCount },
    { id: "bases", label: "Bases", count: basesCount },
  ];

  const handleApplyFilters = (query: FilterGroup) => {
    setCurrentQuery(query);
    setShowAdvancedFilters(false);
  };

  const handleIngredientSelect = (ingredient: Ingredient) => {
    // Emit event to add ingredient to work area
    eventBus.emit("ingredient-selected", { ingredient });
  };

  const handleFormulaSelect = (formula: Formula) => {
    // Emit event to add formula to work area
    eventBus.emit("formula-selected", { formula });
  };

  const handleAttributeSelect = (attribute: IngredientAttribute) => {
    // Emit event to add attribute to work area
    eventBus.emit("attribute-selected", { attribute });
  };

  const hasActiveFilters = currentQuery.rules && currentQuery.rules.length > 0;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Library</h2>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search ${activeTab}...`}
          showFilterButton={activeTab === "ingredients"}
          onFilterClick={() => setShowAdvancedFilters(true)}
        />

        <div className="mt-4">
          <PillTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Level 2 Filters for Ingredients */}
        {activeTab === "ingredients" && (
          <div className="mt-3 flex items-center space-x-1">
            {ingredientFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`
                  px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer
                  ${
                    activeFilter === filter.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }
                `}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
            {hasActiveFilters && (
              <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded ml-2">
                <span className="material-symbols-rounded text-sm">tune</span>
                <span>Advanced</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "ingredients" && (
          <IngredientList
            ingredients={filteredIngredients}
            searchQuery={searchQuery}
            onIngredientSelect={handleIngredientSelect}
            selectedIngredients={selectedIngredients}
          />
        )}

        {activeTab === "formulas" && (
          <FormulaList
            formulas={filteredFormulas}
            searchQuery={searchQuery}
            onFormulaSelect={handleFormulaSelect}
            selectedFormulas={selectedFormulaIds}
          />
        )}

        {activeTab === "attributes" && (
          <IngredientAttributeList
            attributes={filteredAttributes}
            searchQuery={searchQuery}
            onAttributeSelect={handleAttributeSelect}
            selectedAttributes={selectedAttributes}
          />
        )}
      </div>

      {/* Results Summary */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="text-xs text-gray-500 text-center">
          {activeTab === "ingredients" &&
            `${filteredIngredients.length} of ${ingredients.length} ingredients`}
          {activeTab === "formulas" &&
            `${filteredFormulas.length} of ${formulas.length} formulas`}
          {activeTab === "attributes" &&
            `${filteredAttributes.length} of ${attributes.length} attributes`}
        </div>
      </div>

      {/* Advanced Filter Modal */}
      <AdvancedFilterSheet
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onApplyFilters={handleApplyFilters}
        ingredients={ingredients}
        filteredIngredients={filteredIngredients}
      />
    </div>
  );
};

export default LibraryPanel;
