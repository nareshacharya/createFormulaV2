import { useState } from "react";
import { eventBus } from "../utils/bus";
import { tw, mergeStyles } from "../utils/tailwindToInline";
import ListRow from "./ListRow";

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
  appliedFilters?: Record<string, unknown>;
  selectedAttributes?: string[];
  maxSelections?: number;
}

const IngredientAttributeList = ({
  attributes,
  searchQuery = "",
  appliedFilters = {},
  selectedAttributes = [],
  maxSelections = 5,
}: IngredientAttributeListProps) => {
  const [, setHoveredRow] = useState<string | null>(null);

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
    <div style={tw("space-y-0")}>
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
            compact
            className={`
              ${isSelected ? "bg-blue-50 border-l-2 border-blue-400" : ""}
              ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <div style={tw("flex items-center justify-between w-full px-3")}>
              <div style={tw("flex items-center space-x-3 flex-1")}>
                {/* Attribute Info */}
                <div style={tw("flex-1 min-w-0")}>
                  <h4
                    style={tw(
                      `font-medium text-sm truncate ${
                        isSelected ? "text-blue-900" : "text-gray-900"
                      }`
                    )}
                  >
                    {attribute.name}
                    {isSelected && (
                      <i
                        style={tw("ml-1 text-xs text-blue-600")}
                        className="ri-check-line"
                      ></i>
                    )}
                  </h4>
                  <p
                    style={tw(
                      `text-xs truncate font-normal ${
                        isSelected ? "text-blue-600" : "text-gray-500"
                      }`
                    )}
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
        <div style={tw("text-center py-6 text-gray-500")}>
          <i
            style={mergeStyles(tw("text-xl"), {
              marginBottom: "0.5rem",
              display: "block",
            })}
            className="ri-list-check-line"
          ></i>
          <p style={tw("text-sm")}>No attributes found</p>
          {(searchQuery || Object.keys(appliedFilters).length > 0) && (
            <p style={mergeStyles(tw("text-xs"), { marginTop: "0.25rem" })}>
              Try adjusting your search or filters
            </p>
          )}
        </div>
      )}

      {/* Selection Counter */}
      {selectedAttributes.length > 0 && (
        <div style={tw("px-3 py-2 bg-blue-50 border-t border-blue-100")}>
          <div style={tw("text-xs text-blue-700 text-center")}>
            {selectedAttributes.length} of {maxSelections} attributes selected
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientAttributeList;
