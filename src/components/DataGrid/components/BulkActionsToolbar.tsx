import type React from "react";

// Toolbar button width responsive styles
const toolbarButtonStyles = `
  @media (max-width: 1023px) {
    .toolbar-button {
      width: 2.5rem !important;
      max-width: 2.5rem !important;
    }
    .toolbar-button .toolbar-label {
      display: none !important;
    }
  }
  @media (min-width: 1024px) {
    .toolbar-button {
      width: 3.5rem !important;
      max-width: 3.5rem !important;
    }
    .toolbar-label {
      display: inline !important;
    }
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = toolbarButtonStyles;
  if (!document.getElementById("toolbar-button-styles")) {
    style.id = "toolbar-button-styles";
    document.head.appendChild(style);
  }
}

interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  onYield?: () => void; // New yield function
  // Action buttons (Add Formula, Merge, Normalize, Send, Undo, Compliance Check, Export)
  onAddFormula?: () => void;
  onMergeDuplicates?: () => void;
  onNormalize?: () => void;
  onSend?: () => void;
  onUndo?: () => void;
  onComplianceCheck?: () => void;
  onExport?: () => void;
  canUndo?: boolean;
  undoCount?: number;
  canSend?: boolean;
  canComplianceCheck?: boolean;
}

// Helper function to render toolbar buttons with vertical layout (icon on top, text below)
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
  const baseClasses = `group relative flex flex-col items-center justify-center px-1.5 py-1 rounded-lg transition-all duration-200 w-14
    ${!disabled ? "hover:bg-blue-600 hover:shadow-sm" : ""} 
    ${className}`;

  const colorClasses = disabled
    ? "bg-blue-100 text-blue-400 cursor-not-allowed"
    : "bg-blue-250 text-blue-700 hover:text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`toolbar-button ${baseClasses} ${colorClasses}`}
      title={title}
      style={{
        width: "3.5rem",
        maxWidth: "3.5rem",
      }}
    >
      <span className="material-symbols-rounded text-lg">{icon}</span>
      {/* Show label on lg screens and up (1024px+) */}
      <span className="toolbar-label hidden lg:inline text-[10px] font-medium mt-0.5 text-center leading-tight">
        {label}
      </span>
      {children}
    </button>
  );
};

export const BulkActionsToolbar = ({
  selectedCount,
  onBulkDelete,
  onClearSelection,
  onYield,
  onAddFormula,
  onMergeDuplicates,
  onNormalize,
  onSend,
  onUndo,
  onComplianceCheck,
  onExport,
  canUndo = false,
  undoCount = 0,
  canSend = false,
  canComplianceCheck = false,
}: BulkActionsToolbarProps) => {
  // Helper function to render secondary action buttons (Delete, Yield, Clear)
  const SecondaryButton = ({
    onClick,
    icon,
    label,
    title,
    colorClasses = "bg-gray-150 text-gray-700 hover:bg-gray-200 hover:text-gray-900",
  }: {
    onClick: () => void;
    icon: string;
    label: string;
    title: string;
    colorClasses?: string;
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`toolbar-button ${colorClasses} group relative flex flex-col items-center justify-center px-1.5 py-1 rounded-lg transition-all duration-200 w-14
          hover:shadow-sm`}
        title={title}
        style={{
          width: "3.5rem",
          maxWidth: "3.5rem",
        }}
      >
        <span className="material-symbols-rounded text-base">{icon}</span>
        <span className="toolbar-label hidden lg:inline text-[10px] font-medium mt-0.5 text-center leading-tight">
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="flex items-center justify-between mb-1 px-1 xl:px-6 py-1.5 bg-gray-50/50 gap-2">
      {/* Left side - Selection count and bulk actions */}
      <div className="flex items-center space-x-2 xl:space-x-3 text-xs pl-4 lg:pl-0">
        <span className="text-gray-600 font-medium hidden lg:inline">
          {selectedCount} selected
        </span>

        {selectedCount > 0 && (
          <>
            <SecondaryButton
              onClick={onClearSelection}
              icon="clear"
              label="Clear"
              title="Clear selection"
              colorClasses="bg-gray-150 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
            />

            {onBulkDelete && (
              <SecondaryButton
                onClick={onBulkDelete}
                icon="delete"
                label="Delete"
                title="Delete selected items"
                colorClasses="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-900"
              />
            )}

            {/* Yield button - only show when exactly 1 ingredient is selected */}
            {selectedCount === 1 && onYield && (
              <SecondaryButton
                onClick={onYield}
                icon="sync_alt"
                label="Yield"
                title="Adjust ingredient amount to match target total"
                colorClasses="bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-900"
              />
            )}
          </>
        )}
      </div>

      {/* Right side - Data Grid Actions (Add Formula, Merge, Normalize, Send, Compliance, Undo, Export) */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {/* Add Formula Button */}
        {onAddFormula && (
          <ToolbarButton
            onClick={onAddFormula}
            icon="experiment"
            label="Add"
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

        {/* Export Button */}
        {onExport && (
          <ToolbarButton
            onClick={onExport}
            icon="download"
            label="Export"
            title="Export as Excel"
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

        {/* Compliance Check Button */}
        {onComplianceCheck && (
          <ToolbarButton
            onClick={onComplianceCheck}
            disabled={!canComplianceCheck}
            icon="verified_user"
            label="Comply"
            title={
              canComplianceCheck
                ? "Check Formula Compliance"
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
              <span
                className="absolute bg-blue-500 text-white text-[9px] px-1 rounded-full font-semibold"
                style={{ top: "2px", right: "3px" }}
              >
                {undoCount}
              </span>
            )}
          </ToolbarButton>
        )}
      </div>
    </div>
  );
};

export default BulkActionsToolbar;
