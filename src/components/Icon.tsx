import React, { useMemo, type CSSProperties } from "react";
import {
  iconMap,
  IconSizeMap,
  type IconProps as BaseIconProps,
} from "../utils/iconMap";
import { mergeStyles } from "../utils/tailwindToInline";

/**
 * Material Symbols Icon Component
 *
 * Renders Material Symbols (Rounded, Weight 300)
 * Replaces Remix Icon components
 * Date: October 17, 2025
 *
 * @example
 * // Basic usage
 * <Icon name="beaker" />
 *
 * @example
 * // With size
 * <Icon name="beaker" size="lg" />
 *
 * @example
 * // With custom styling
 * <Icon name="send" style={{color: '#2563eb'}} />
 *
 * @example
 * // With accessibility
 * <Icon
 *   name="close"
 *   ariaLabel="Close dialog"
 *   title="Close"
 * />
 */

interface IconProps extends Omit<BaseIconProps, "className"> {
  style?: CSSProperties;
}

const Icon: React.FC<IconProps> = ({
  name,
  style,
  size = "xl",
  title,
  ariaLabel,
}) => {
  const sizeClass = IconSizeMap[size];
  const iconName = iconMap[name];

  const iconStyle = useMemo(() => {
    // Convert size class to fontSize
    const fontSizeMap: Record<string, string> = {
      "text-xs": "0.75rem",
      "text-sm": "0.875rem",
      "text-base": "1rem",
      "text-lg": "1.125rem",
      "text-xl": "1.25rem",
      "text-2xl": "1.5rem",
    };

    return mergeStyles(
      { fontSize: fontSizeMap[sizeClass] || "1.25rem" },
      style
    );
  }, [sizeClass, style]);

  return (
    <span
      className="material-symbols-rounded"
      style={iconStyle}
      title={title}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
    >
      {iconName}
    </span>
  );
};

export default Icon;

/**
 * Common icon exports for convenience
 * These are pre-configured Icon components for frequent use cases
 */

/**
 * Close button icon
 * Common for dismissing modals, dialogs, etc.
 */
export const CloseIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="close" size="lg" {...props} />
);

/**
 * Add button icon
 * Common for adding new items
 */
export const AddIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="add" size="lg" {...props} />
);

/**
 * Delete button icon
 * Common for removing items
 */
export const DeleteIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="deleteOutline" size="lg" {...props} />
);

/**
 * Edit button icon
 * Common for edit actions
 */
export const EditIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="edit" size="lg" {...props} />
);

/**
 * Search icon
 * Common for search inputs
 */
export const SearchIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="search" size="lg" {...props} />
);

/**
 * Filter icon
 * Common for filtering/advanced search
 */
export const FilterIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="tune" size="lg" {...props} />
);

/**
 * Beaker/Flask icon
 * Used for formula and ingredient icons
 */
export const FormulaIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="beaker" size="xl" {...props} />
);

/**
 * Bomb icon
 * Used for explode/detonate functionality
 */
export const ExplodeIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="bomb" size="lg" {...props} />
);

/**
 * Merge icon
 * Used for merge duplicates functionality
 */
export const MergeIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="callMerge" size="lg" {...props} />
);

/**
 * Send icon
 * Used for send for compounding
 */
export const SendIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="send" size="lg" {...props} />
);

/**
 * Save icon
 * Used for save workspace/state
 */
export const SaveIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="save" size="lg" {...props} />
);

/**
 * Undo icon
 * Used for undo operations
 */
export const UndoIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="undo" size="lg" {...props} />
);

/**
 * Balance/Normalize icon
 * Used for normalize formula
 */
export const NormalizeIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="balance" size="lg" {...props} />
);

/**
 * Check icon
 * Used for success states
 */
export const CheckIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="check" size="lg" {...props} />
);

/**
 * Alert/Warning icon
 * Used for warning messages
 */
export const AlertIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="warning" size="lg" {...props} />
);

/**
 * Error icon
 * Used for error messages
 */
export const ErrorIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="error" size="lg" {...props} />
);

/**
 * Info icon
 * Used for informational messages
 */
export const InfoIcon: React.FC<Omit<IconProps, "name">> = (props) => (
  <Icon name="info" size="lg" {...props} />
);
