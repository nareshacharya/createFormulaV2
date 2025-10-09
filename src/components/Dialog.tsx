import { useEffect, useRef } from "react";
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
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog container - centered */}
      <div
        className="fixed inset-0 z-[9999] overflow-y-auto"
        aria-labelledby="dialog-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Dialog panel */}
          <div
            ref={dialogRef}
            className={`relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-2xl transform transition-all`}
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3
                id="dialog-title"
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                aria-label="Close dialog"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-[calc(90vh-180px)] overflow-y-auto">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
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
