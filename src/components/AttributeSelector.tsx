import { useState } from "react";
import { getListItemClasses, selectionStyles } from "../config/theme";
import type { IngredientAttribute } from "../services/pega";
import { tw, mergeStyles } from "../utils/tailwindToInline";
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
  const filteredAttributes = attributes.filter(
    (attr) => attr.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div style={tw("flex items-center justify-center py-12 text-gray-500")}>
        <div style={tw("text-center")}>
          <i
            style={mergeStyles(tw("text-4xl block"), {
              marginBottom: "0.5rem",
            })}
            className="ri-inbox-line"
          ></i>
          <p style={tw("text-sm")}>No attributes available</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Alert info */}
      <div style={{ marginBottom: "16px" }}>
        <Alert variant="info">
          Select up to <strong>{maxSelections}</strong> attributes to add as
          columns.
        </Alert>
      </div>

      {/* Compact Search and Counter Row */}
      <div
        style={mergeStyles(tw("flex items-center gap-3"), {
          marginBottom: "16px",
        })}
      >
        <div style={tw("flex-1")}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search attributes..."
          />
        </div>
        <div style={tw("flex items-center gap-4 text-xs whitespace-nowrap")}>
          <span style={tw("text-gray-500")}>
            {filteredAttributes.length} available
          </span>
          <span style={tw("font-medium text-blue-600")}>
            {selectedIds.length} / {maxSelections} selected
          </span>
        </div>
      </div>

      {/* Attribute grid - 3 columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "12px",
          maxHeight: "400px",
          overflowY: "auto",
          paddingRight: "4px",
        }}
      >
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

          const labelStyles = mergeStyles(
            tw(
              "flex items-start gap-2 p-3 rounded-md border transition-all cursor-pointer"
            ),
            tw(itemClasses)
          );

          return (
            <label key={attr.id} style={labelStyles}>
              <input
                type="checkbox"
                checked={isSelected || isHighlighted}
                onChange={() => !isDisabled && handleToggle(attr.id)}
                disabled={isDisabled}
                style={tw(
                  "mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-50 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
                )}
              />
              <div style={tw("flex-1 min-w-0 flex items-center gap-1.5")}>
                <span style={tw("text-sm leading-tight block flex-1")}>
                  {attr.name}
                </span>
                {isHighlighted && (
                  <i
                    style={tw(`text-base ${selectionStyles.selected.icon}`)}
                    className="ri-check-line"
                  ></i>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* No results message */}
      {filteredAttributes.length === 0 && searchQuery && (
        <div style={tw("text-center py-8 text-gray-500")}>
          <i style={mergeStyles(tw("text-3xl block"), { marginBottom: "0.5rem" })} className="ri-search-line"></i>
          <p style={tw("text-sm")}>No attributes found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default AttributeSelector;
