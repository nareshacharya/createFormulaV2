import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: "sm" | "md" | "lg" | "xl" | "2xl";
  headerActions?: ReactNode;
}

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

  const widthClasses = {
    sm: "w-80",
    md: "w-96",
    lg: "w-[32rem]",
    xl: "w-[40rem]",
    "2xl": "w-[48rem]",
  };

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`
          fixed top-0 right-0 h-full bg-white shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${widthClasses[width]}
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="drawer-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <div className="flex items-center space-x-2">
            {headerActions}
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <i className="ri-close-line text-gray-600"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;
