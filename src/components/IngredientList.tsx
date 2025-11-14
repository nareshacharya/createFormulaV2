import { useState, useEffect } from "react";
import type { Ingredient } from "../services/pega";
import { eventBus } from "../utils/bus";
import { tw, mergeStyles } from "../utils/tailwindToInline";
import IngredientQuickView from "./IngredientQuickView";
import ListRow from "./ListRow";

interface IngredientListProps {
  ingredients: Ingredient[];
  searchQuery?: string;
  activeFilter?: string;
  appliedFilters?: any;
  onIngredientSelect?: (ingredient: Ingredient) => void;
  selectedIngredients?: string[];
}

const IngredientList = ({
  ingredients,
  searchQuery = "",
  onIngredientSelect,
  selectedIngredients = [],
  activeFilter = "",
  appliedFilters = {},
}: IngredientListProps) => {
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [localSelectedIngredients, setLocalSelectedIngredients] = useState<
    string[]
  >([]);

  // Listen for work area updates to track selected ingredients
  useEffect(() => {
    const handleWorkAreaUpdate = (data: { ingredients: string[] }) => {
      setLocalSelectedIngredients(data.ingredients || []);
    };

    eventBus.on("work-area-updated", handleWorkAreaUpdate);

    return () => {
      eventBus.off("work-area-updated", handleWorkAreaUpdate);
    };
  }, []);

  const getStatusColor = (ingredient: Ingredient) => {
    const { status, mac } = ingredient;

    if (mac < 0) return "bg-red-500"; // Non-Compliant
    if (status === "inactive") return "bg-gray-400"; // Inactive
    if (status === "active" || status === "palette") return "bg-green-500"; // Active/Palette
    if (status === "analytical") return "bg-purple-500"; // Analytical
    if (status === "sers_review") return "bg-blue-500"; // SERS Review

    return "bg-green-500"; // Default to active
  };

  const filteredIngredients = ingredients.filter((ingredient) => {
    const searchLower = searchQuery?.toLowerCase() || "";
    const matchesSearch =
      !searchQuery ||
      ingredient.name.toLowerCase().includes(searchLower) ||
      ingredient.id.toLowerCase().includes(searchLower) ||
      (ingredient.code && ingredient.code.toLowerCase().includes(searchLower));
    const matchesFilter = !activeFilter || ingredient.type === activeFilter;

    // Apply additional filters from modal
    let matchesAdvancedFilters = true;

    if (
      appliedFilters.category &&
      appliedFilters.category !==
        ingredient.category.toLowerCase().replace(" ", "-")
    ) {
      matchesAdvancedFilters = false;
    }

    if (
      appliedFilters.supplier &&
      appliedFilters.supplier !== ingredient.supplier.toLowerCase()
    ) {
      matchesAdvancedFilters = false;
    }

    if (appliedFilters.minPrice && ingredient.price < appliedFilters.minPrice) {
      matchesAdvancedFilters = false;
    }

    if (appliedFilters.maxPrice && ingredient.price > appliedFilters.maxPrice) {
      matchesAdvancedFilters = false;
    }

    return matchesSearch && matchesFilter && matchesAdvancedFilters;
  });

  const handleInfoClick = (e: React.MouseEvent, ingredient: Ingredient) => {
    e.stopPropagation();
    setSelectedIngredient(ingredient);
  };

  const handleIngredientClick = (ingredient: Ingredient) => {
    // Check if ingredient is already selected
    const isAlreadySelected = selectedIngredients.includes(ingredient.name);

    if (isAlreadySelected) {
      // Show visual feedback that it's already selected
      console.log(`${ingredient.name} is already in the work area`);
      return;
    }

    // Emit event to add ingredient to work area
    eventBus.emit("ingredient-selected", { ingredient });

    // Add to local selected state for immediate visual feedback
    setLocalSelectedIngredients((prev) => [...prev, ingredient.name]);
  };

  const isIngredientSelected = (ingredientName: string) => {
    return selectedIngredients.includes(ingredientName);
  };

  return (
    <>
      <div>
        {filteredIngredients.map((ingredient) => {
          const isSelected = isIngredientSelected(ingredient.name);

          return (
            <ListRow
              key={ingredient.id}
              onHover={(isHovered) =>
                setHoveredRow(isHovered ? ingredient.id : null)
              }
              onClick={() => handleIngredientClick(ingredient)}
              compact={true}
              selected={isSelected}
            >
              <div style={tw("flex items-center justify-between w-full px-3")}>
                <div style={tw("flex items-center flex-1")}>
                  {/* Status Dot */}
                  <div
                    style={mergeStyles(
                      tw(
                        `rounded-full flex-shrink-0 ${getStatusColor(
                          ingredient
                        )}`
                      ),
                      {
                        width: "0.375rem",
                        height: "0.375rem",
                        marginRight: "0.5rem",
                      }
                    )}
                    title={`Status: ${ingredient.status}`}
                  />

                  {/* Ingredient Info */}
                  <div style={mergeStyles(tw("flex-1"), { minWidth: 0 })}>
                    <h4
                      style={tw(
                        `font-medium text-sm truncate ${
                          isSelected ? "text-blue-900" : "text-gray-900"
                        }`
                      )}
                    >
                      {ingredient.name}
                      {isSelected && (
                        <span style={tw("text-blue-600 ml-1 text-xs")} className="material-symbols-rounded">
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
                      {ingredient.code}
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
                      ${ingredient.price.toFixed(2)}/{ingredient.unit}
                    </p>
                  </div>
                </div>

                {/* Info Icon - Only visible on hover, larger size */}
                {hoveredRow === ingredient.id && (
                  <button
                    style={mergeStyles(
                      tw("p-1 rounded cursor-pointer flex-shrink-0"),
                      { marginLeft: "0.5rem" }
                    )}
                    onClick={(e) => handleInfoClick(e, ingredient)}
                    aria-label={`View details for ${ingredient.name}`}
                  >
                    <span style={tw("text-gray-400 text-lg")} className="material-symbols-rounded">
                      info
                    </span>
                  </button>
                )}
              </div>
            </ListRow>
          );
        })}

        {filteredIngredients.length === 0 && (
          <div
            style={mergeStyles(tw("text-center text-gray-500"), {
              paddingTop: "1.5rem",
              paddingBottom: "1.5rem",
            })}
          >
            <span
              style={mergeStyles(tw("text-xl"), { marginBottom: "0.5rem", display: "block" })}
              className="material-symbols-rounded"
            >
              search
            </span>
            <p style={tw("text-sm")}>No ingredients found</p>
            {(searchQuery ||
              activeFilter ||
              Object.keys(appliedFilters).length > 0) && (
              <p style={mergeStyles(tw("text-xs"), { marginTop: "0.25rem" })}>
                Try adjusting your search or filters
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <IngredientQuickView
        ingredient={selectedIngredient}
        isOpen={!!selectedIngredient}
        onClose={() => setSelectedIngredient(null)}
      />
    </>
  );
};

export default IngredientList;
