import { useState, useRef, useEffect, useMemo } from "react";
import { tw } from "../utils/tailwindToInline";

interface MultiSelectDropdownProps {
  options: string[];
  selectedOptions: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  maxHeight?: string;
}

const MultiSelectDropdown = ({
  options,
  selectedOptions,
  onSelectionChange,
  placeholder = "Select columns...",
  maxHeight = "200px",
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      onSelectionChange(selectedOptions.filter((item) => item !== option));
    } else {
      onSelectionChange([...selectedOptions, option]);
    }
  };

  const handleSelectAll = () => {
    if (selectedOptions.length === options.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...options]);
    }
  };

  const formatLabel = (option: string) => {
    return option
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buttonStyle = useMemo(
    () =>
      tw(
        "w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer"
      ),
    []
  );
  const dropdownStyle = useMemo(
    () => ({
      ...tw(
        "absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
      ),
      zIndex: 10,
    }),
    []
  );

  return (
    <div style={tw("relative")} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={buttonStyle}
      >
        <div style={tw("flex items-center justify-between")}>
          <span style={tw("text-sm text-gray-700")}>
            {selectedOptions.length === 0
              ? placeholder
              : `${selectedOptions.length} column${
                  selectedOptions.length !== 1 ? "s" : ""
                } selected`}
          </span>
          <i
            className={`ri-arrow-${isOpen ? "up" : "down"}-s-line`}
            style={tw("text-gray-400")}
          ></i>
        </div>
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          {/* Search Input */}
          <div style={tw("p-2 border-b border-gray-200")}>
            <input
              type="text"
              placeholder="Search columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={tw(
                "w-full px-2 py-1 text-sm border border-gray-300 rounded"
              )}
            />
          </div>

          {/* Select All Option */}
          <div style={tw("p-2 border-b border-gray-200")}>
            <label
              style={tw(
                "flex items-center space-x-2 cursor-pointer text-sm font-medium"
              )}
            >
              <input
                type="checkbox"
                checked={selectedOptions.length === options.length}
                onChange={handleSelectAll}
                style={tw("rounded border-gray-300 cursor-pointer")}
              />
              <span style={tw("text-gray-700")}>Select All</span>
            </label>
          </div>

          {/* Options List */}
          <div style={{ ...tw("overflow-y-auto"), maxHeight: "12rem" }}>
            {filteredOptions.map((option) => (
              <label
                key={option}
                style={tw(
                  "flex items-center space-x-2 px-3 py-2 cursor-pointer text-sm"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleToggleOption(option)}
                  style={tw("rounded border-gray-300 cursor-pointer")}
                />
                <span style={tw("text-gray-600")}>{formatLabel(option)}</span>
              </label>
            ))}

            {filteredOptions.length === 0 && (
              <div style={tw("px-3 py-2 text-sm text-gray-500 text-center")}>
                No columns found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
