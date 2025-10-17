import { useState } from "react";

interface DilutionIconProps {
  onClick: () => void;
  hasDilution?: boolean;
}

/**
 * DilutionIcon Component
 * Displays a drop icon that appears on hover in the Description column
 * Indicates dilution capability and shows if dilution is already applied
 */
export const DilutionIcon = ({
  onClick,
  hasDilution = false,
}: DilutionIconProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="inline-flex items-center justify-center transition-all duration-200"
      title={hasDilution ? "Edit dilution" : "Add dilution"}
      aria-label={hasDilution ? "Edit dilution" : "Add dilution"}
    >
      <span
        className={`material-symbols-rounded text-sm transition-colors duration-200 ${
          hasDilution
            ? "text-blue-600"
            : isHovered
            ? "text-blue-500"
            : "text-gray-400"
        }`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        water_drop
      </span>
    </button>
  );
};
