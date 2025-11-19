import { useMemo, type CSSProperties } from "react";
import { tw, mergeStyles } from "../utils/tailwindToInline";

interface AlertProps {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  style?: CSSProperties;
}

/**
 * Alert component for displaying informational messages with different variants.
 * Uses inline styles for Pega compatibility with icon and color variations.
 */
const Alert = ({ children, variant = "info", style }: AlertProps) => {
  const { containerStyle, iconStyle } = useMemo(() => {
    const variantStyles = {
      info: {
        container: "bg-blue-50 border-blue-200 text-blue-800",
        icon: "text-blue-500",
      },
      success: {
        container: "bg-green-50 border-green-200 text-green-800",
        icon: "text-green-500",
      },
      warning: {
        container: "bg-yellow-50 border-yellow-200 text-yellow-800",
        icon: "text-yellow-500",
      },
      error: {
        container: "bg-red-50 border-red-200 text-red-800",
        icon: "text-red-500",
      },
    };

    const styles = variantStyles[variant];

    return {
      containerStyle: mergeStyles(
        tw(`flex items-center gap-3 p-3 rounded-lg border ${styles.container}`),
        style
      ),
      iconStyle: tw(`${styles.icon} text-lg flex-shrink-0`),
    };
  }, [variant, style]);

  const iconClasses = {
    info: "ri-information-line",
    success: "ri-checkbox-circle-line",
    warning: "ri-alert-line",
    error: "ri-error-warning-line",
  };

  return (
    <div style={containerStyle} role="alert">
      <i className={iconClasses[variant]} style={iconStyle}></i>
      <div style={tw("text-sm flex-1")}>{children}</div>
    </div>
  );
};

export default Alert;
