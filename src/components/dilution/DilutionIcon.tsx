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
      className="inline-flex items-center justify-center w-5 h-5 ml-2 transition-all duration-200"
      title={hasDilution ? "Edit dilution" : "Add dilution"}
      aria-label={hasDilution ? "Edit dilution" : "Add dilution"}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-colors duration-200 ${
          hasDilution
            ? "text-blue-600"
            : isHovered
            ? "text-blue-500"
            : "text-gray-400"
        }`}
      >
        {/* Drop icon */}
        <path
          d="M8 2C8 2 4 6.5 4 9.5C4 11.71 5.79 13.5 8 13.5C10.21 13.5 12 11.71 12 9.5C12 6.5 8 2 8 2Z"
          fill={hasDilution ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};
