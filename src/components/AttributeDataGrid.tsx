import { useState } from "react";
import type { IngredientAttribute } from "../services/pega";
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
      <div className="flex items-center justify-center h-40 text-gray-500">
        <div className="text-center">
          <i className="ri-list-check-line text-3xl mb-2"></i>
          <p>No attributes available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Section - Instruction and Search */}
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Select up to {maxSelections} attributes to add as columns. You can
          select multiple attributes.
        </p>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search attributes..."
          className="w-full"
        />

        {/* Selection Counter */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {filteredAttributes.length} attributes available
          </span>
          <span className="font-medium text-blue-600">
            {selectedAttributes.length} of {maxSelections} selected
          </span>
        </div>
      </div>

      {/* Attribute List - 3 Column Grid */}
      <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2">
        {filteredAttributes.map((attribute) => {
          const isSelected = selectedAttributes.includes(attribute.id);
          const isDisabled =
            !isSelected && selectedAttributes.length >= maxSelections;

          return (
            <label
              key={attribute.id}
              className={`
                flex items-start space-x-2 p-3 rounded-md border cursor-pointer transition-all
                ${
                  isSelected
                    ? "bg-blue-50 border-blue-300 shadow-sm"
                    : isDisabled
                    ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                    : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                }
              `}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() =>
                  !isDisabled && handleAttributeToggle(attribute.id)
                }
                disabled={isDisabled}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-50 flex-shrink-0 cursor-pointer"
              />

              <span
                className={`text-sm leading-tight ${
                  isSelected ? "text-blue-900 font-medium" : "text-gray-700"
                }`}
              >
                {attribute.name}
              </span>
            </label>
          );
        })}
      </div>

      {/* No Results Message */}
      {filteredAttributes.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-500">
          <i className="ri-search-line text-2xl mb-2"></i>
          <p className="text-sm">No attributes found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default AttributeDataGrid;
