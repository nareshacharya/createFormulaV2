import { useState, useEffect, useMemo, type CSSProperties } from "react";
import { tw, mergeStyles } from "../utils/tailwindToInline";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (query: string) => void;
  onSearch?: (query: string) => void;
  onFilterClick?: () => void;
  showFilterButton?: boolean;
  debounceMs?: number;
  style?: CSSProperties;
}

const SearchBar = ({
  placeholder = "Search...",
  value: externalValue,
  onChange: externalOnChange,
  onSearch,
  onFilterClick,
  showFilterButton = false,
  debounceMs = 300,
  style,
}: SearchBarProps) => {
  const [internalQuery, setInternalQuery] = useState("");
  const query = externalValue !== undefined ? externalValue : internalQuery;
  const setQuery = externalOnChange || setInternalQuery;

  useEffect(() => {
    if (onSearch) {
      const timer = setTimeout(() => {
        onSearch(query);
      }, debounceMs);

      return () => clearTimeout(timer);
    }
  }, [query, onSearch, debounceMs]);

  const containerStyle = useMemo(
    () => mergeStyles(tw("relative"), style),
    [style]
  );
  const inputStyle = useMemo(() => {
    const baseStyle = tw(
      "w-full pl-10 py-2 text-sm border border-gray-300 rounded-md"
    );
    const prStyle = showFilterButton
      ? { paddingRight: "2.5rem" }
      : { paddingRight: "1rem" };
    return mergeStyles(baseStyle, prStyle);
  }, [showFilterButton]);

  return (
    <div style={containerStyle}>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          paddingLeft: "12px",
          display: "flex",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <i className="ri-search-line" style={tw("text-gray-400 text-sm")}></i>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
      {showFilterButton && (
        <button
          onClick={onFilterClick}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            paddingRight: "12px",
            display: "flex",
            alignItems: "center",
            borderRadius: "0 6px 6px 0",
            transition:
              "color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "pointer",
            border: "none",
            background: "transparent",
          }}
          aria-label="Open advanced filters"
          title="Advanced filters"
        >
          <i
            className="ri-equalizer-line"
            style={tw("text-gray-400 text-sm")}
          ></i>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
