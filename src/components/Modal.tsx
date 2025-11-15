import { useEffect } from "react";
import { tw } from "../utils/tailwindToInline";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  footerActions?: React.ReactNode;
  headerActions?: React.ReactNode;
  noPadding?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  footerActions,
  headerActions,
  noPadding = false,
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles: Record<string, string> = {
    sm: "448px", // max-w-md = 28rem
    md: "512px", // max-w-lg = 32rem
    lg: "672px", // max-w-2xl = 42rem
    xl: "896px", // max-w-4xl = 56rem
    "2xl": "1152px", // max-w-6xl = 72rem
    "3xl": "1280px", // max-w-7xl = 80rem
    "4xl": "1440px", // max-w-[90rem]
    "5xl": "1600px", // max-w-[100rem]
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        overflowY: "auto",
      }}
    >
      {/* Backdrop */}
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
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div
        style={{
          display: "flex",
          minHeight: "100%",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          position: "relative",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            ...tw("relative bg-white shadow-xl flex flex-col"),
            width: "100%",
            maxWidth: sizeStyles[size],
            maxHeight: "90vh",
            borderRadius: "8px",
            overflow: "hidden",
          }}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div
            style={tw(
              "flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0"
            )}
          >
            <div style={tw("flex items-center gap-4")}>
              <h3 style={tw("text-lg font-semibold text-gray-900")}>{title}</h3>
            </div>
            <div style={tw("flex items-center gap-2")}>{headerActions}</div>
            <button
                type="button"
              onClick={onClose}
              style={tw(
                "text-gray-400 hover:text-gray-600 transition cursor-pointer"
              )}
              aria-label="Close"
            >
              <span className="material-symbols-rounded" style={tw("text-xl")}>
                close
              </span>
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              ...tw("flex-1 overflow-auto relative"),
              ...(noPadding ? {} : tw("p-6")),
            }}
          >
            {children}
          </div>

          {/* Footer */}
          {footerActions && (
            <div
              style={tw(
                "flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50"
              )}
            >
              {footerActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
