/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { useEffect, useRef, useMemo } from "react";
import type { ReactNode } from "react";
import { tw } from "../utils/tailwindToInline";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: "sm" | "md" | "lg" | "xl" | "2xl";
  headerActions?: ReactNode;
}

const widthStyles = {
  sm: "320px", // w-80 = 20rem
  md: "384px", // w-96 = 24rem
  lg: "512px", // w-[32rem]
  xl: "640px", // w-[40rem]
  "2xl": "768px", // w-[48rem]
};

const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  width = "md",
  headerActions,
}: DrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the drawer
      setTimeout(() => {
        drawerRef.current?.focus();
      }, 100);

      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll
      document.body.style.overflow = "";

      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const drawerStyle = useMemo(
    () => ({
      position: "fixed" as const,
      top: 0,
      right: 0,
      height: "100%",
      backgroundColor: "#ffffff",
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      zIndex: 9999,
      transform: isOpen ? "translateX(0)" : "translateX(100%)",
      transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      width: widthStyles[width],
    }),
    [isOpen, width]
  );

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
        overflow: "hidden",
      }}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          transition: "opacity 200ms",
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={drawerStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div
          style={tw(
            "flex items-center justify-between p-4 border-b border-gray-200"
          )}
        >
          <h2
            id="drawer-title"
            style={tw("text-lg font-semibold text-gray-900")}
          >
            {title}
          </h2>
          <div style={tw("flex items-center space-x-2")}>
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              style={tw("p-2 rounded-md transition-colors cursor-pointer")}
              aria-label="Close drawer"
            >
              <i className="ri-close-line" style={tw("text-gray-600")}></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={tw("flex-1 overflow-hidden")}>{children}</div>
      </div>
    </div>
  );
};

export default Drawer;
