import { useMemo, type CSSProperties } from "react";
import { tw, mergeStyles } from "../utils/tailwindToInline";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  type?: "button" | "submit" | "reset";
  title?: string;
}

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  style,
  type = "button",
  title,
}: ButtonProps) => {
  const buttonStyle = useMemo(() => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap cursor-pointer";

    const variantClasses = {
      primary: "bg-blue-600 text-white",
      secondary: "bg-gray-200 text-gray-900",
      ghost: "text-gray-600",
      outline: "border border-gray-300 text-gray-700",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

    return mergeStyles(
      tw(
        `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses}`
      ),
      style
    );
  }, [variant, size, disabled, style]);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={buttonStyle}
    >
      {children}
    </button>
  );
};

export default Button;
