import { useState, useEffect, useRef } from "react";
import AdvancedFilterSheet from "../../components/AdvancedFilterSheet";
import FormulaList from "../../components/FormulaList";
import IngredientAttributeList from "../../components/IngredientAttributeList";
import IngredientList from "../../components/IngredientList";
import PillTabs from "../../components/PillTabs";
import type { FilterGroup } from "../../components/QueryBuilder";
import SearchBar from "../../components/SearchBar";
import { ApiService } from "../../services/api";
import type {
  Ingredient,
  Formula,
  IngredientAttribute,
} from "../../services/pega";
import { eventBus } from "../../utils/bus";
import { evaluateQuery } from "../../utils/queryEvaluator";
import { tw, mergeStyles } from "../../utils/tailwindToInline";

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
  const [_attributeTypeFilter, _setAttributeTypeFilter] =
    useState<string>("all");
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedFormulaIds, setSelectedFormulaIds] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Data states
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [attributes, setAttributes] = useState<IngredientAttribute[]>([]);
  const [_isLoading, setIsLoading] = useState(true);
  const [_isLoadingMore, _setIsLoadingMore] = useState(false);
  const [_error, _setError] = useState<string | null>(null);

  // Pagination states
  const [_ingredientPage, setIngredientPage] = useState(0);
  const [_formulaPage, setFormulaPage] = useState(0);
  const [_hasMoreIngredients, setHasMoreIngredients] = useState(true);
  const [_hasMoreFormulas, setHasMoreFormulas] = useState(true);
  const pageSize = 50;

  // Debouncing search
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const tabs = [
    { id: "ingredients", label: "Ingredients", icon: "labs" },
    { id: "formulas", label: "Formulas", icon: "experiment" },
    { id: "attributes", label: "Attributes", icon: "checklist" },
  ];

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [ingredientsResponse, formulasResponse, attributesResponse] =
          await Promise.all([
            ApiService.getIngredients({
              skip: 0,
              limit: pageSize,
              search: searchQuery || undefined,
              status: activeFilter === "all" ? undefined : activeFilter,
            }),
            ApiService.getFormulas({
              skip: 0,
              limit: pageSize,
              search: searchQuery || undefined,
            }),
            ApiService.getIngredientAttributes(),
          ]);

        if (ingredientsResponse.success && ingredientsResponse.data) {
          setIngredients(ingredientsResponse.data);
          setHasMoreIngredients(ingredientsResponse.data.length === pageSize);
        }

        if (formulasResponse.success && formulasResponse.data) {
          setFormulas(formulasResponse.data);
          setHasMoreFormulas(formulasResponse.data.length === pageSize);
        }

        if (attributesResponse.success && attributesResponse.data) {
          setAttributes(attributesResponse.data);
        }
      } catch (err) {
        // Silently handle - allow fallback to mock data
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Debounced search handler
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setIngredientPage(0);
      setFormulaPage(0);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

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

  // Listen for workspace events to clear transient selections
  useEffect(() => {
    const clearAllSelections = () => {
      setSelectedIngredients([]);
      setSelectedFormulaIds([]);
      setSelectedAttributes([]);
      setSearchQuery("");
      setActiveFilter("all");
      setCurrentQuery({
        id: "root",
        combinator: "and",
        rules: [],
      });
    };

    const handleWorkspaceCreated = () => {
      clearAllSelections();
    };

    const handleWorkspaceSwitched = (_data: {
      workspaceId: string;
      workspaceName: string;
      previousWorkspaceId: string;
    }) => {
      clearAllSelections();
    };

    eventBus.on("workspace-created", handleWorkspaceCreated);
    eventBus.on("workspace-switched", handleWorkspaceSwitched);

    return () => {
      eventBus.off("workspace-created", handleWorkspaceCreated);
      eventBus.off("workspace-switched", handleWorkspaceSwitched);
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

  // Calculate attribute type counts
  const textCount = attributes.filter((a) => a.type === "text").length;
  const numberCount = attributes.filter((a) => a.type === "number").length;
  const booleanCount = attributes.filter((a) => a.type === "boolean").length;
  const selectCount = attributes.filter((a) => a.type === "select").length;
  const totalAttributeCount = attributes.length;

  const ingredientFilters = [
    { id: "all", label: "All", count: totalCount },
    { id: "natural", label: "Natural", count: naturalCount },
    { id: "synthetic", label: "Synthetic", count: syntheticCount },
    { id: "bases", label: "Bases", count: basesCount },
  ];

  const attributeTypeFilters = [
    { id: "all", label: "All", count: totalAttributeCount },
    { id: "text", label: "Text", count: textCount },
    { id: "number", label: "Number", count: numberCount },
    { id: "boolean", label: "Boolean", count: booleanCount },
    { id: "select", label: "Select", count: selectCount },
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
    <div style={tw("h-full flex flex-col bg-white")}>
      {/* Header */}
      <div style={tw("p-4 border-b border-gray-200 flex-shrink-0")}>
        <div style={tw("flex items-center justify-between mb-4")}>
          <h2 style={tw("text-lg font-semibold text-gray-900")}>Library</h2>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search ${activeTab}...`}
          showFilterButton={activeTab === "ingredients"}
          onFilterClick={() => setShowAdvancedFilters(true)}
        />

        <div style={tw("mt-4")}>
          <PillTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Level 2 Filters for Ingredients */}
        {activeTab === "ingredients" && (
          <div
            style={mergeStyles(tw("mt-3 flex items-center"), {
              gap: "0.25rem",
            })}
          >
            {ingredientFilters.map((filter) => (
              <button
                type="button"
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                style={tw(`
                  px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer
                  ${
                    activeFilter === filter.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }
                `)}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
            {hasActiveFilters && (
              <div
                style={mergeStyles(
                  tw(
                    "flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"
                  ),
                  { gap: "0.25rem", marginLeft: "0.5rem" }
                )}
              >
                <span
                  style={tw("text-sm")}
                  className="material-symbols-rounded"
                >
                  tune
                </span>
                <span>Advanced</span>
              </div>
            )}
          </div>
        )}

        {activeTab === "attributes" && (
          <div
            style={mergeStyles(tw("mt-3 flex items-center flex-wrap"), {
              gap: "0.25rem",
            })}
          >
            {attributeTypeFilters.map((filter) => (
              <button
                type="button"
                key={filter.id}
                onClick={() => _setAttributeTypeFilter(filter.id)}
                style={tw(`
                  px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer
                  text-gray-600 hover:text-gray-900 hover:bg-gray-100
                `)}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={tw("flex-1 overflow-auto")}>
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
      <div style={tw("p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0")}>
        <div style={tw("text-xs text-gray-500 text-center")}>
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
