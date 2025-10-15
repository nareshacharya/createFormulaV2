import { useRef } from "react";
import { useClickOutside } from "../../../hooks/useClickOutside";

interface ColumnActionsMenuProps {
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onSetActive?: () => void;
  onCreateVersion?: () => void;
  onNormalize?: () => void;
  onSendForCompounding?: () => void;
  isFormula?: boolean;
  isActive?: boolean;
}

/**
 * Column Actions Menu Component
 * Provides dropdown menu for column operations
 */
export const ColumnActionsMenu = ({
  isOpen,
  onClose,
  onDelete,
  onSetActive,
  onCreateVersion,
  onNormalize,
  onSendForCompounding,
  isFormula = false,
  isActive = false,
}: ColumnActionsMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, onClose);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[200px]"
      onClick={(e) => e.stopPropagation()}
    >
      {isFormula && (
        <>
          {!isActive && onSetActive && (
            <button
              onClick={() => {
                onSetActive();
                onClose();
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <i className="ri-focus-line"></i>
              Set as Active
            </button>
          )}

          {isActive && (
            <>
              {onCreateVersion && (
                <button
                  onClick={() => {
                    onCreateVersion();
                    onClose();
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <i className="ri-file-copy-line"></i>
                  Create Version
                </button>
              )}

              {onNormalize && (
                <button
                  onClick={() => {
                    onNormalize();
                    onClose();
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <i className="ri-percent-line"></i>
                  Normalize
                </button>
              )}

              {onSendForCompounding && (
                <button
                  onClick={() => {
                    onSendForCompounding();
                    onClose();
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <i className="ri-flask-line"></i>
                  Send for Compounding
                </button>
              )}
            </>
          )}

          <div className="border-t border-gray-200 my-1"></div>
        </>
      )}

      {onDelete && (
        <button
          onClick={() => {
            if (
              window.confirm(
                `Are you sure you want to delete this ${
                  isFormula ? "formula" : "column"
                }?`
              )
            ) {
              onDelete();
              onClose();
            }
          }}
          className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
        >
          <i className="ri-delete-bin-line"></i>
          Delete {isFormula ? "Formula" : "Column"}
        </button>
      )}
    </div>
  );
};
