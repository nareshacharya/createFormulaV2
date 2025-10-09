import type { ReactNode } from "react";

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
  return (
    <div
      className={`
        border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors
        ${compact ? "py-2" : "py-3"}
        ${
          selected
            ? "bg-blue-50 border-l-4 border-l-blue-500"
            : "hover:bg-gray-50"
        }
        ${hovered ? "bg-gray-50" : ""}
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => {
        onMouseEnter?.();
        onHover?.(true);
      }}
      onMouseLeave={() => {
        onMouseLeave?.();
        onHover?.(false);
      }}
    >
      {title || subtitle || price || badge ? (
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            {onSelect && (
              <input
                type="checkbox"
                checked={selected || false}
                onChange={(e) => onSelect(e.target.checked)}
                className="rounded border-gray-300"
              />
            )}
            <div className="flex-1">
              {title && (
                <div className="font-medium text-gray-900">{title}</div>
              )}
              {subtitle && (
                <div className="text-sm text-gray-500">{subtitle}</div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {price && (
              <div className="text-sm font-medium text-gray-700">{price}</div>
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
