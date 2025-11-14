import { useState } from "react";
import type { IngredientAttribute } from "../services/pega";
import { tw, mergeStyles } from "../utils/tailwindToInline";
import SearchBar from "./SearchBar";

interface AttributeDataGridProps {
  attributes: IngredientAttribute[];
  selectedAttributes: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  maxSelections?: number;
}

const AttributeDataGrid = ({
  attributes = [],
  selectedAttributes = [],
  onSelectionChange,
  maxSelections = 4,
}: AttributeDataGridProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter attributes based on search
  const filteredAttributes = attributes.filter(
    (attribute) =>
      !searchQuery ||
      attribute.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAttributeToggle = (attributeId: string) => {
    const isSelected = selectedAttributes.includes(attributeId);

    if (isSelected) {
      // Remove from selection
      onSelectionChange(selectedAttributes.filter((id) => id !== attributeId));
    } else if (selectedAttributes.length < maxSelections) {
      // Add to selection
      onSelectionChange([...selectedAttributes, attributeId]);
    }
  };

  // Show empty state if no attributes
  if (!attributes || attributes.length === 0) {
    return (
      <div
        style={mergeStyles(
          tw("flex items-center justify-center text-gray-500"),
          { height: "10rem" }
        )}
      >
        <div style={tw("text-center")}>
          <i
            style={mergeStyles(tw("text-3xl"), {
              marginBottom: "0.5rem",
              display: "block",
            })}
            className="ri-list-check-line"
          ></i>
          <p>No attributes available</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section - Instruction and Search */}
      <div>
        <p
          style={mergeStyles(tw("text-sm text-gray-600"), {
            marginBottom: "1rem",
          })}
        >
          Select up to {maxSelections} attributes to add as columns. You can
          select multiple attributes.
        </p>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search attributes..."
          style={mergeStyles(tw("w-full"), { marginBottom: "1rem" })}
        />

        {/* Selection Counter */}
        <div
          style={mergeStyles(tw("flex items-center justify-between text-xs"), {
            marginBottom: "1rem",
          })}
        >
          <span style={tw("text-gray-500")}>
            {filteredAttributes.length} attributes available
          </span>
          <span style={tw("font-medium text-blue-600")}>
            {selectedAttributes.length} of {maxSelections} selected
          </span>
        </div>
      </div>

      {/* Attribute List - 3 Column Grid */}
      <div
        style={mergeStyles(tw("overflow-y-auto"), {
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.5rem",
          maxHeight: "400px",
          paddingRight: "0.5rem",
        })}
      >
        {filteredAttributes.map((attribute) => {
          const isSelected = selectedAttributes.includes(attribute.id);
          const isDisabled =
            !isSelected && selectedAttributes.length >= maxSelections;

          return (
            <label
              key={attribute.id}
              style={mergeStyles(
                tw("flex items-start rounded-md border cursor-pointer"),
                { padding: "0.75rem", gap: "0.5rem" },
                isSelected
                  ? tw("bg-blue-50 border-blue-300")
                  : isDisabled
                    ? mergeStyles(tw("bg-gray-50 border-gray-200"), {
                        opacity: 0.5,
                        cursor: "not-allowed",
                      })
                    : tw("bg-white border-gray-200")
              )}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() =>
                  !isDisabled && handleAttributeToggle(attribute.id)
                }
                disabled={isDisabled}
                style={mergeStyles(
                  tw(
                    "rounded border-gray-300 text-blue-600 flex-shrink-0 cursor-pointer"
                  ),
                  {
                    marginTop: "0.125rem",
                    width: "1rem",
                    height: "1rem",
                    opacity: isDisabled ? 0.5 : 1,
                  }
                )}
              />

              <span
                style={mergeStyles(
                  tw(
                    `text-sm ${
                      isSelected ? "text-blue-900 font-medium" : "text-gray-700"
                    }`
                  ),
                  { lineHeight: "1.25" }
                )}
              >
                {attribute.name}
              </span>
            </label>
          );
        })}
      </div>

      {/* No Results Message */}
      {filteredAttributes.length === 0 && searchQuery && (
        <div
          style={mergeStyles(tw("text-center text-gray-500"), {
            paddingTop: "2rem",
            paddingBottom: "2rem",
          })}
        >
          <i
            style={mergeStyles(tw("text-2xl"), {
              marginBottom: "0.5rem",
              display: "block",
            })}
            className="ri-search-line"
          ></i>
          <p style={tw("text-sm")}>No attributes found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default AttributeDataGrid;
