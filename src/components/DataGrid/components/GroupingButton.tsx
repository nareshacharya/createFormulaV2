import { useState, useRef, useEffect } from "react";

interface GroupingButtonProps {
  columnId: string;
  columnLabel: string;
  isGrouped: boolean;
  availableValues: string[];
  onToggleGrouping: (columnId: string) => void;
}

/**
 * GroupingButton - Enables grouping for categorical (non-numeric) attribute columns
 * Displays available categories and allows users to group data by this attribute
 */
export const GroupingButton = ({
  columnId,
  columnLabel,
  isGrouped,
  availableValues,
  onToggleGrouping,
}: GroupingButtonProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close preview
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        setShowPreview(false);
      }
    };

    if (showPreview) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showPreview]);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => onToggleGrouping(columnId)}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        className={`
          p-1 rounded transition-colors
          ${
            isGrouped
              ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }
        `}
        title={isGrouped ? "Remove grouping" : "Group by this attribute"}
      >
        <i className={`ri-${isGrouped ? "subtract" : "add"}-box-line text-sm`}></i>
      </button>

      {/* Preview Tooltip */}
      {showPreview && availableValues.length > 0 && (
        <div
          ref={previewRef}
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 min-w-[200px] max-w-[300px]"
        >
          <div className="text-xs font-medium text-gray-700 mb-2">
            {isGrouped ? "Grouped by:" : "Group by:"} {columnLabel}
          </div>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {availableValues.slice(0, 10).map((value, idx) => (
              <div
                key={idx}
                className="text-xs text-gray-600 px-2 py-1 bg-gray-50 rounded"
              >
                {value}
              </div>
            ))}
            {availableValues.length > 10 && (
              <div className="text-xs text-gray-500 italic px-2 py-1">
                +{availableValues.length - 10} more...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
