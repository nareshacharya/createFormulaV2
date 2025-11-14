import type { ReactNode } from "react";
import { tw, mergeStyles } from "../utils/tailwindToInline";

interface ListRowProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  price?: string;
  badge?: ReactNode;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onHover?: (isHovered: boolean) => void;
  hovered?: boolean;
  compact?: boolean;
  className?: string;
}

const ListRow = ({
  children,
  title,
  subtitle,
  price,
  badge,
  selected,
  onSelect,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onHover,
  hovered,
  compact = false,
  className = "",
}: ListRowProps) => {
  const baseStyles = tw(
    "border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors"
  );
  const paddingStyles = compact ? tw("py-2") : tw("py-3");
  const selectedStyles = selected
    ? tw("bg-blue-50 border-l-4 border-l-blue-500")
    : tw("hover:bg-gray-50");
  const hoverStyles = hovered ? tw("bg-gray-50") : {};

  const containerStyles = mergeStyles(
    baseStyles,
    paddingStyles,
    selectedStyles,
    hoverStyles,
    className ? tw(className) : {}
  );

  return (
    <div
      style={containerStyles}
      onClick={onClick}
      onMouseEnter={() => {
        onMouseEnter?.();
        onHover?.(true);
      }}
      onMouseLeave={() => {
        onMouseLeave?.();
        onHover?.(false);
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
    >
      {title || subtitle || price || badge ? (
        <div style={tw("flex items-center justify-between px-4")}>
          <div style={tw("flex items-center space-x-3")}>
            {onSelect && (
              <input
                type="checkbox"
                checked={selected || false}
                onChange={(e) => onSelect(e.target.checked)}
                style={tw("rounded border-gray-300")}
              />
            )}
            <div style={tw("flex-1")}>
              {title && (
                <div style={tw("font-medium text-gray-900")}>{title}</div>
              )}
              {subtitle && (
                <div style={tw("text-sm text-gray-500")}>{subtitle}</div>
              )}
            </div>
          </div>
          <div style={tw("flex items-center space-x-3")}>
            {price && (
              <div style={tw("text-sm font-medium text-gray-700")}>{price}</div>
            )}
            {badge}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default ListRow;
