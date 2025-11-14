import { useEffect, useRef } from "react";
import { tw } from "../utils/tailwindToInline";
import Portal from "./Portal";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  footer?: React.ReactNode;
}

/**
 * Dialog/Modal component with proper z-index layering and backdrop handling.
 * Uses Portal to render outside the normal DOM hierarchy.
 */
const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  footer,
}: DialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden";

      // Focus trap
      dialogRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
  };

  return (
    <Portal>
      {/* Backdrop - click to close */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 9998,
        }}
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onClose()}
        aria-label="Close dialog"
      />

      {/* Dialog container - centered */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
          zIndex: 9999,
        }}
        aria-labelledby="dialog-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          style={{
            display: "flex",
            minHeight: "100%",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          {/* Dialog panel */}
          <div
            ref={dialogRef}
            style={{
              ...tw(
                `relative w-full ${sizeClasses[size]} bg-white shadow-xl transition`
              ),
              borderRadius: "8px",
              overflow: "hidden",
            }}
            tabIndex={-1}
          >
            {/* Header */}
            <div
              style={tw(
                "flex items-center justify-between px-6 py-4 border-b border-gray-200"
              )}
            >
              <h3
                id="dialog-title"
                style={tw("text-lg font-semibold text-gray-900")}
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                style={tw(
                  "text-gray-400 transition p-1 rounded-md cursor-pointer"
                )}
                aria-label="Close dialog"
              >
                <i className="ri-close-line" style={tw("text-xl")}></i>
              </button>
            </div>

            {/* Content */}
            <div
              style={{
                ...tw("px-6 py-4 overflow-y-auto"),
                maxHeight: "calc(90vh - 180px)",
              }}
            >
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div
                style={tw(
                  "flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50"
                )}
              >
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Dialog;
