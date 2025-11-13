import { useState } from "react";
import { getListItemClasses, selectionStyles } from "../config/theme";
import type { IngredientAttribute } from "../services/pega";
import Alert from "./Alert";
import SearchBar from "./SearchBar";

interface AttributeSelectorProps {
  attributes: IngredientAttribute[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  maxSelections?: number;
  highlightedIds?: string[]; // Already added attributes to highlight
}

/**
 * Compact 3-column attribute selector with search and selection tracking.
 * Designed for use in dialogs/modals.
 */
const AttributeSelector = ({
  attributes = [],
  selectedIds = [],
  onSelectionChange,
  maxSelections = 5,
  highlightedIds = [],
}: AttributeSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter attributes based on search
  const filteredAttributes = attributes.filter((attr) =>
    attr.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (id: string) => {
    // Don't allow toggling of already highlighted (added) attributes
    if (highlightedIds.includes(id)) {
      return;
    }

    const isSelected = selectedIds.includes(id);

    if (isSelected) {
      // Deselect
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else if (selectedIds.length < maxSelections) {
      // Select
      onSelectionChange([...selectedIds, id]);
    }
  };

  if (attributes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <div className="text-center">
          <i className="ri-inbox-line text-4xl mb-2 block"></i>
          <p className="text-sm">No attributes available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Alert info */}
      <Alert variant="info">
        Select up to <strong>{maxSelections}</strong> attributes to add as
        columns.
      </Alert>

      {/* Compact Search and Counter Row */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search attributes..."
          />
        </div>
        <div className="flex items-center gap-4 text-xs whitespace-nowrap">
          <span className="text-gray-500">
            {filteredAttributes.length} available
          </span>
          <span className="font-medium text-blue-600">
            {selectedIds.length} / {maxSelections} selected
          </span>
        </div>
      </div>

      {/* Attribute grid - 3 columns */}
      <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
        {filteredAttributes.map((attr) => {
          const isSelected = selectedIds.includes(attr.id);
          const isHighlighted = highlightedIds.includes(attr.id);
          const isDisabled =
            isHighlighted ||
            (!isSelected && selectedIds.length >= maxSelections);

          const itemClasses = getListItemClasses({
            isSelected,
            isHighlighted,
            isDisabled,
          });

          return (
            <label
              key={attr.id}
              className={`flex items-start gap-2 p-3 rounded-md border transition-all cursor-pointer ${itemClasses}`}
            >
              <input
                type="checkbox"
                checked={isSelected || isHighlighted}
                onChange={() => !isDisabled && handleToggle(attr.id)}
                disabled={isDisabled}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-50 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex-1 min-w-0 flex items-center gap-1.5">
                <span className={`text-sm leading-tight block flex-1`}>
                  {attr.name}
                </span>
                {isHighlighted && (
                  <i
                    className={`ri-check-line text-base ${selectionStyles.selected.icon}`}
                  ></i>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* No results message */}
      {filteredAttributes.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-500">
          <i className="ri-search-line text-3xl mb-2 block"></i>
          <p className="text-sm">No attributes found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default AttributeSelector;
