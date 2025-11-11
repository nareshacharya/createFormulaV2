import type React from "react";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  // Action buttons (Add Formula, Merge, Normalize, Send, Undo)
  onAddFormula?: () => void;
  onMergeDuplicates?: () => void;
  onNormalize?: () => void;
  onSend?: () => void;
  onUndo?: () => void;
  onExport?: () => void;
  canUndo?: boolean;
  undoCount?: number;
  canSend?: boolean;
}

// Helper function to render toolbar buttons with responsive text
const ToolbarButton = ({
  onClick,
  disabled,
  icon,
  label,
  title,
  children,
  className = "",
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: string;
  label: string;
  title: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  const baseClasses = `group relative flex items-center justify-center px-2 py-1 rounded-lg transition-all duration-200 
    ${!disabled ? "hover:bg-blue-600 hover:shadow-sm" : ""} 
    ${className}`;

  const colorClasses = disabled
    ? "bg-blue-100 text-blue-400 cursor-not-allowed"
    : "bg-blue-250 text-blue-700 hover:text-white";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${colorClasses}`}
      title={title}
    >
      <span className="material-symbols-rounded text-base">{icon}</span>
      {/* Show label only on xl screens and up (1280px+) */}
      <span className="hidden xl:inline text-xs font-medium ml-1">{label}</span>
      {children}
    </button>
  );
};

export const BulkActionsToolbar = ({
  selectedCount,
  onBulkDelete,
  onClearSelection,
  onAddFormula,
  onMergeDuplicates,
  onNormalize,
  onSend,
  onUndo,
  onExport,
  canUndo = false,
  undoCount = 0,
  canSend = false,
}: BulkActionsToolbarProps) => {
  return (
    <div className="flex items-center justify-between mb-3 px-3 xl:px-6 py-2.5 bg-gray-50/50 gap-3">
      {/* Left side - Selection count and bulk actions */}
      <div className="flex items-center space-x-2 xl:space-x-3 text-xs">
        <span className="text-gray-600 font-medium hidden lg:inline">
          {selectedCount} selected
        </span>

        {selectedCount > 0 && (
          <>
            <button
              onClick={onClearSelection}
              className="bg-gray-150 text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 hover:shadow-sm flex items-center gap-1 px-2 py-1 rounded-lg"
              title="Clear selection"
            >
              <span className="material-symbols-rounded text-base">clear</span>
              <span className="hidden xl:inline text-xs font-medium">
                Clear
              </span>
            </button>

            {onBulkDelete && (
              <button
                onClick={onBulkDelete}
                className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-900 transition-all duration-200 hover:shadow-sm flex items-center gap-1 px-2 py-1 rounded-lg"
                title="Delete selected items"
              >
                <span className="material-symbols-rounded text-base">
                  delete
                </span>
                <span className="hidden xl:inline text-xs font-medium">
                  Delete
                </span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Right side - Data Grid Actions (Add Formula, Merge, Normalize, Send, Undo, Export) */}
      <div className="flex items-center gap-1 xl:gap-2 overflow-x-auto">
        {/* Add Formula Button */}
        {onAddFormula && (
          <ToolbarButton
            onClick={onAddFormula}
            icon="experiment"
            label="Add Formula"
            title="Add Formula"
          />
        )}

        {/* Merge Duplicates Button */}
        {onMergeDuplicates && (
          <ToolbarButton
            onClick={onMergeDuplicates}
            icon="call_merge"
            label="Merge"
            title="Merge Duplicates"
          />
        )}

        {/* Normalize Formula Button */}
        {onNormalize && (
          <ToolbarButton
            onClick={onNormalize}
            icon="balance"
            label="Normalize"
            title="Normalize Formula"
          />
        )}

        {/* Send for Compounding Button */}
        {onSend && (
          <ToolbarButton
            onClick={onSend}
            disabled={!canSend}
            icon="send"
            label="Send"
            title={
              canSend
                ? "Send Active Formula for Compounding"
                : "Select an active formula"
            }
          />
        )}

        {/* Undo Button */}
        {onUndo && (
          <ToolbarButton
            onClick={onUndo}
            disabled={!canUndo}
            icon="undo"
            label="Undo"
            title={
              canUndo ? `Undo (${undoCount} available)` : "No actions to undo"
            }
          >
            {undoCount > 0 && (
              <span className="ml-1 bg-blue-500 text-white text-[9px] px-1 rounded-full font-semibold">
                {undoCount}
              </span>
            )}
          </ToolbarButton>
        )}

        {/* Export Button */}
        {onExport && (
          <ToolbarButton
            onClick={onExport}
            icon="download"
            label="Export"
            title="Export as Excel"
          />
        )}
      </div>
    </div>
  );
};

export default BulkActionsToolbar;
