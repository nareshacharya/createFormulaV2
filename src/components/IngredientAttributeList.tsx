import { useState } from "react";
import ListRow from "./ListRow";
import { eventBus } from "../utils/bus";

interface IngredientAttribute {
  id: string;
  name: string;
  type: "text" | "number" | "boolean" | "select";
  description: string;
  category: string;
  isRequired: boolean;
  values?: string[];
  unit?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  examples?: string[];
}

interface IngredientAttributeListProps {
  attributes: IngredientAttribute[];
  searchQuery?: string;
  appliedFilters?: any;
  selectedAttributes?: string[];
  maxSelections?: number;
  onAttributeSelect?: (attribute: IngredientAttribute) => void;
}

const IngredientAttributeList = ({
  attributes,
  searchQuery = "",
  appliedFilters = {},
  selectedAttributes = [],
  maxSelections = 5,
}: IngredientAttributeListProps) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const filteredAttributes = attributes.filter((attribute) => {
    const matchesSearch =
      !searchQuery ||
      attribute.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attribute.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attribute.category.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesAdvancedFilters = true;

    if (appliedFilters.type && appliedFilters.type !== attribute.type) {
      matchesAdvancedFilters = false;
    }

    if (
      appliedFilters.category &&
      appliedFilters.category !==
        attribute.category.toLowerCase().replace(" ", "-")
    ) {
      matchesAdvancedFilters = false;
    }

    if (
      appliedFilters.required !== undefined &&
      appliedFilters.required !== attribute.isRequired
    ) {
      matchesAdvancedFilters = false;
    }

    return matchesSearch && matchesAdvancedFilters;
  });

  const handleAttributeClick = (attribute: IngredientAttribute) => {
    const isSelected = selectedAttributes.includes(attribute.id);
    const canAdd = selectedAttributes.length < maxSelections;

    if (!isSelected && canAdd) {
      // Emit event to add attribute to work area
      eventBus.emit("attribute-selected", { attribute });
    } else if (isSelected) {
      // Emit event to remove attribute from work area
      eventBus.emit("attribute-deselected", { attributeId: attribute.id });
    }
  };

  return (
    <div className="space-y-0">
      {filteredAttributes.map((attribute) => {
        const isSelected = selectedAttributes.includes(attribute.id);
        const canAdd = selectedAttributes.length < maxSelections;
        const isDisabled = !isSelected && !canAdd;

        return (
          <ListRow
            key={attribute.id}
            onHover={(isHovered) =>
              setHoveredRow(isHovered ? attribute.id : null)
            }
            onClick={() => {
              if (!isDisabled) {
                handleAttributeClick(attribute);
              }
            }}
            compact={true}
            className={`
              ${isSelected ? "bg-blue-50 border-l-2 border-blue-400" : ""}
              ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <div className="flex items-center justify-between w-full px-3">
              <div className="flex items-center space-x-3 flex-1">
                {/* Attribute Info */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-medium text-sm truncate ${
                      isSelected ? "text-blue-900" : "text-gray-900"
                    }`}
                  >
                    {attribute.name}
                    {isSelected && (
                      <i className="ri-check-line text-blue-600 ml-1 text-xs"></i>
                    )}
                  </h4>
                  <p
                    className={`text-xs truncate font-normal ${
                      isSelected ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {attribute.category}
                    {attribute.unit && ` • ${attribute.unit}`}
                  </p>
                </div>
              </div>
            </div>
          </ListRow>
        );
      })}

      {filteredAttributes.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <i className="ri-list-check-line text-xl mb-2"></i>
          <p className="text-sm">No attributes found</p>
          {(searchQuery || Object.keys(appliedFilters).length > 0) && (
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          )}
        </div>
      )}

      {/* Selection Counter */}
      {selectedAttributes.length > 0 && (
        <div className="px-3 py-2 bg-blue-50 border-t border-blue-100">
          <div className="text-xs text-blue-700 text-center">
            {selectedAttributes.length} of {maxSelections} attributes selected
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientAttributeList;
