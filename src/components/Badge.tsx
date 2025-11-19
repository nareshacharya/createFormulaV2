import { useMemo, type CSSProperties } from "react";
import { tw, mergeStyles } from "../utils/tailwindToInline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "purple";
  size?: "xs" | "sm" | "md";
  style?: CSSProperties;
}

const Badge = ({
  children,
  variant = "default",
  size = "sm",
  style,
}: BadgeProps) => {
  const badgeStyle = useMemo(() => {
    const baseClasses = "inline-flex items-center font-medium rounded-full";

    const variantClasses = {
      default: "bg-gray-100 text-gray-800",
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
      info: "bg-blue-100 text-blue-800",
      purple: "bg-purple-100 text-purple-800",
    };

    const sizeClasses = {
      xs: "px-1.5 py-0.5 text-xs",
      sm: "px-2 py-0.5 text-xs",
      md: "px-3 py-1 text-sm",
    };

    return mergeStyles(
      tw(`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`),
      style
    );
  }, [variant, size, style]);

  return <span style={badgeStyle}>{children}</span>;
};

export default Badge;
