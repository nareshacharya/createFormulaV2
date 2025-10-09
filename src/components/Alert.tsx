interface AlertProps {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
}

/**
 * Alert component for displaying informational messages with different variants.
 * Uses Tailwind CSS for styling with icon and color variations.
 */
const Alert = ({ children, variant = "info", className = "" }: AlertProps) => {
  const variantStyles = {
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      icon: "ri-information-line text-blue-500",
    },
    success: {
      container: "bg-green-50 border-green-200 text-green-800",
      icon: "ri-checkbox-circle-line text-green-500",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-800",
      icon: "ri-alert-line text-yellow-500",
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-800",
      icon: "ri-error-warning-line text-red-500",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${styles.container} ${className}`}
      role="alert"
    >
      <i className={`${styles.icon} text-lg flex-shrink-0 mt-0.5`}></i>
      <div className="text-sm leading-relaxed flex-1">{children}</div>
    </div>
  );
};

export default Alert;
