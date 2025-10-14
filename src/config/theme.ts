/**
 * Theme Configuration
 * Centralized styling constants for consistent UI across the application
 */

export const selectionStyles = {
  // Selected/Highlighted item styles (used for already-selected items)
  selected: {
    background: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-900",
    icon: "text-blue-600",
    shadow: "shadow-sm",
  },
  // Active selection (currently being selected in current session)
  active: {
    background: "bg-blue-100",
    border: "border-blue-400",
    text: "text-blue-900",
    icon: "text-blue-700",
    shadow: "shadow-md",
  },
  // Default/unselected state
  default: {
    background: "bg-white",
    border: "border-gray-200",
    text: "text-gray-700",
    icon: "text-gray-400",
    hover: "hover:bg-gray-50 hover:border-gray-300",
  },
  // Disabled state
  disabled: {
    background: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-400",
    icon: "text-gray-300",
    opacity: "opacity-50",
    cursor: "cursor-not-allowed",
  },
} as const;

/**
 * Get combined class names for a selection state
 */
export function getSelectionClasses(state: "selected" | "active" | "default" | "disabled") {
  const styles = selectionStyles[state];
  return Object.values(styles).join(" ");
}

/**
 * Get class names for a list item based on its state
 */
export function getListItemClasses(options: {
  isSelected?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
  isHighlighted?: boolean;
}) {
  const { isSelected, isActive, isDisabled, isHighlighted } = options;

  // Priority: disabled > highlighted/selected > active > default
  if (isDisabled) {
    const disabled = selectionStyles.disabled;
    return `${disabled.background} ${disabled.border} ${disabled.text} ${disabled.opacity} ${disabled.cursor}`;
  }

  if (isHighlighted || isSelected) {
    const selected = selectionStyles.selected;
    return `${selected.background} ${selected.border} ${selected.text} ${selected.shadow}`;
  }

  if (isActive) {
    const active = selectionStyles.active;
    return `${active.background} ${active.border} ${active.text} ${active.shadow}`;
  }

  const defaultStyle = selectionStyles.default;
  return `${defaultStyle.background} ${defaultStyle.border} ${defaultStyle.text} ${defaultStyle.hover}`;
}
