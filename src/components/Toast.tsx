/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { tw } from "../utils/tailwindToInline";

interface ToastProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

const Toast = ({ type, message, onClose }: ToastProps) => {
  const bgColor = type === "success" ? "bg-green-50" : "bg-red-50";
  const borderColor =
    type === "success" ? "border-green-200" : "border-red-200";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const icon = type === "success" ? "✓" : "✕";
  const iconBgColor = type === "success" ? "bg-green-100" : "bg-red-100";

  return (
    <div
      style={tw(
        `flex items-start gap-3 p-3 rounded-lg border ${bgColor} ${borderColor}`
      )}
      role="alert"
    >
      <div
        style={tw(
          `flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full ${iconBgColor}`
        )}
      >
        <span style={tw(textColor)}>{icon}</span>
      </div>
      <div style={tw("flex-1 min-w-0")}>
        <p style={tw(`text-sm font-medium ${textColor}`)}>{message}</p>
      </div>
      <button
        onClick={onClose}
        style={tw(
          "flex-shrink-0 inline-flex text-gray-400 hover:text-gray-600"
        )}
        aria-label="Close notification"
      >
        <span style={tw("text-lg leading-none")}>×</span>
      </button>
    </div>
  );
};

export default Toast;
