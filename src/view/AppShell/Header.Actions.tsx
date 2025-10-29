import { useState, useEffect, useRef } from "react";
import { eventBus } from "../../utils/bus";
import FormulaModal from "../../components/FormulaModal";
import SaveWorkspaceModal from "../../components/SaveWorkspaceModal";
import { useModal } from "../../App";
import type { Formula } from "../../services/pega";
import toast from "react-hot-toast";
import {
  saveWorkspace,
  canCreateWorkspace,
  getWorkspaces,
  loadWorkspaceById,
  deleteWorkspace,
  type WorkspaceState,
  type Workspace,
} from "../../utils/workspaceManager";

const HeaderActions = () => {
  const { showModal, hideModal } = useModal();
  const [availableFormulas, setAvailableFormulas] = useState<Formula[]>([]);
  const [currentFormulaSelections, setCurrentFormulaSelections] = useState(0);
  const [selectedFormulaIds, setSelectedFormulaIds] = useState<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [undoCount, setUndoCount] = useState(0);
  const [hasActiveFormula, setHasActiveFormula] = useState(false);
  const [showWorkspacesDropdown, setShowWorkspacesDropdown] = useState(false);
  const [savedWorkspaces, setSavedWorkspaces] = useState<Workspace[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFormulaSelectionsUpdate = (data: {
      count: number;
      selectedIds?: string[];
    }) => {
      setCurrentFormulaSelections(data.count);
      if (data.selectedIds) {
        setSelectedFormulaIds(data.selectedIds);
      }
    };

    const handleAvailableFormulasUpdate = (data: { formulas: Formula[] }) => {
      setAvailableFormulas(data.formulas);
    };

    const handleUndoStateUpdate = (data: {
      canUndo: boolean;
      count: number;
    }) => {
      setCanUndo(data.canUndo);
      setUndoCount(data.count);
    };

    const handleActiveFormulaUpdate = (data: { hasActiveFormula: boolean }) => {
      setHasActiveFormula(data.hasActiveFormula);
    };

    eventBus.on("formula-selections-updated", handleFormulaSelectionsUpdate);
    eventBus.on("available-formulas-updated", handleAvailableFormulasUpdate);
    eventBus.on("undo-state-updated", handleUndoStateUpdate);
    eventBus.on("active-formula-updated", handleActiveFormulaUpdate);

    return () => {
      eventBus.off("formula-selections-updated", handleFormulaSelectionsUpdate);
      eventBus.off("available-formulas-updated", handleAvailableFormulasUpdate);
      eventBus.off("undo-state-updated", handleUndoStateUpdate);
      eventBus.off("active-formula-updated", handleActiveFormulaUpdate);
    };
  }, []);

  // Load saved workspaces when dropdown is opened
  useEffect(() => {
    if (showWorkspacesDropdown) {
      setSavedWorkspaces(getWorkspaces());
    }
  }, [showWorkspacesDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowWorkspacesDropdown(false);
      }
    };

    if (showWorkspacesDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showWorkspacesDropdown]);

  const handleNormalize = () => {
    eventBus.emit("normalize-formula");
  };

  const handleCreateFormula = () => {
    showModal(
      <FormulaModal
        isOpen={true}
        onClose={hideModal}
        onCreateFormula={handleFormulaModalCreateFormula}
        onSelectFormula={handleFormulaModalSelectFormula}
        availableFormulas={availableFormulas}
        maxSelections={4}
        currentSelections={currentFormulaSelections}
        selectedFormulaIds={selectedFormulaIds}
      />
    );
  };

  const handleFormulaModalCreateFormula = (formula: Omit<Formula, "id">) => {
    const newFormula: Formula = {
      ...formula,
      id: `FORM${Date.now()}`,
    };

    // Emit event to add this formula as a new column in the work area
    eventBus.emit("new-formula-created", { formula: newFormula });
    hideModal();
  };

  const handleFormulaModalSelectFormula = (formula: Formula) => {
    // Emit event to add this formula as a new column in the work area
    eventBus.emit("formula-selected-for-column", { formula });
    hideModal();
  };

  const handleMergeDuplicates = () => {
    eventBus.emit("merge-duplicates");
  };

  const handleSendForCompounding = () => {
    if (!hasActiveFormula) {
      toast.error(
        "Please select an active formula before sending for compounding"
      );
      return;
    }
    eventBus.emit("send-for-compounding");
  };

  const handleUndo = () => {
    if (!canUndo) {
      return;
    }
    eventBus.emit("undo-action");
  };

  const handleSaveWorkspace = () => {
    if (!canCreateWorkspace()) {
      toast.error(
        "Maximum of 3 workspaces allowed. Please delete one to create new."
      );
      return;
    }

    showModal(
      <SaveWorkspaceModal
        isOpen={true}
        onClose={hideModal}
        onSave={handleSaveWorkspaceWithName}
      />
    );
  };

  const handleSaveWorkspaceWithName = (workspaceName: string) => {
    try {
      // Set up one-time listener for workspace state
      const handleWorkspaceStateReady = ({ state }: { state: WorkspaceState }) => {
        try {
          const workspace = saveWorkspace(workspaceName, state);
          toast.success(`Workspace "${workspace.name}" saved successfully!`);
          hideModal();
          
          // Clean up listener
          eventBus.off("workspace-state-ready", handleWorkspaceStateReady);
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to save workspace"
          );
          eventBus.off("workspace-state-ready", handleWorkspaceStateReady);
        }
      };

      // Register listener
      eventBus.on("workspace-state-ready", handleWorkspaceStateReady);
      
      // Request current state from WorkArea
      eventBus.emit("request-workspace-state");
      
      // Set a timeout in case WorkArea doesn't respond
      setTimeout(() => {
        eventBus.off("workspace-state-ready", handleWorkspaceStateReady);
      }, 5000);
      
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save workspace"
      );
    }
  };

  const handleLoadWorkspace = (workspaceId: string) => {
    try {
      const success = loadWorkspaceById(workspaceId);
      if (success) {
        const workspace = savedWorkspaces.find(w => w.id === workspaceId);
        toast.success(`Workspace "${workspace?.name}" loaded successfully!`);
        setShowWorkspacesDropdown(false);
      } else {
        toast.error("Failed to load workspace");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load workspace"
      );
    }
  };

  const handleDeleteWorkspace = (workspaceId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering load
    
    const workspace = savedWorkspaces.find(w => w.id === workspaceId);
    if (!workspace) return;
    
    if (confirm(`Are you sure you want to delete workspace "${workspace.name}"?`)) {
      try {
        deleteWorkspace(workspaceId);
        toast.success(`Workspace "${workspace.name}" deleted`);
        setSavedWorkspaces(getWorkspaces()); // Refresh list
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete workspace"
        );
      }
    }
  };

  const handleToggleWorkspacesDropdown = () => {
    setShowWorkspacesDropdown(!showWorkspacesDropdown);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Formula Actions Group - Icon + Text Style */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCreateFormula}
          className="group relative w-[42px] xl:w-[68px] flex flex-col items-center justify-center py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 transition-colors cursor-pointer shadow-sm"
          title="New Formula"
        >
          <div className="relative">
            <span className="material-symbols-rounded text-white text-xl leading-6">
              experiment
            </span>
            <span className="material-symbols-rounded text-white text-xs absolute -top-0.5 -right-[0.325rem]">
              add
            </span>
          </div>
          <span className="text-[10px] text-white/80 font-medium whitespace-nowrap hidden xl:inline">
            Formula
          </span>
          {/* Tooltip for small screens */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none xl:hidden">
            Formula
          </div>
        </button>

        <button
          onClick={handleMergeDuplicates}
          className="group relative w-[42px] xl:w-[68px] flex flex-col items-center justify-center py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 transition-colors cursor-pointer shadow-sm"
          title="Merge Duplicates"
        >
          <span className="material-symbols-rounded text-white text-xl leading-6 mb-0.5">
            call_merge
          </span>
          <span className="text-[10px] text-white/80 font-medium whitespace-nowrap hidden xl:inline">
            Merge
          </span>
          {/* Tooltip for small screens */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none xl:hidden">
            Merge
          </div>
        </button>

        <button
          onClick={handleNormalize}
          className="group relative w-[42px] xl:w-[68px] flex flex-col items-center justify-center py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 transition-colors cursor-pointer shadow-sm"
          title="Normalize Formula"
        >
          <span className="material-symbols-rounded text-white text-xl leading-6 mb-0.5">
            balance
          </span>
          <span className="text-[10px] text-white/80 font-medium whitespace-nowrap hidden xl:inline">
            Normalize
          </span>
          {/* Tooltip for small screens */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none xl:hidden">
            Normalize
          </div>
        </button>

        <button
          onClick={handleSendForCompounding}
          className={`group relative w-[42px] xl:w-[68px] flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm ${
            hasActiveFormula
              ? "bg-purple-700 hover:bg-purple-600"
              : "bg-purple-700/50 cursor-not-allowed"
          }`}
          title="Send Active Formula for Compounding"
          disabled={!hasActiveFormula}
        >
          <span className="material-symbols-rounded text-white text-xl leading-6 mb-0.5">
            send
          </span>
          <span className="text-[10px] text-white/80 font-medium whitespace-nowrap hidden xl:inline">
            Send
          </span>
          {/* Tooltip for small screens */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none xl:hidden">
            Send
          </div>
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-purple-600 mx-1"></div>

      {/* Workspace Management - Save & Load */}
      <div className="flex items-center gap-2">
        {/* Save Workspace Button */}
        <button
          onClick={handleSaveWorkspace}
          className="group relative w-[42px] xl:w-[68px] flex flex-col items-center justify-center py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm"
          title="Save current workspace state"
        >
          <span className="material-symbols-rounded text-xl leading-6 mb-0.5">
            save
          </span>
          <span className="text-[10px] font-medium hidden xl:inline">Save</span>
          {/* Tooltip for small screens */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none xl:hidden">
            Save
          </div>
        </button>

        {/* Load Workspace Button with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleToggleWorkspacesDropdown}
            className="group relative w-[42px] xl:w-[68px] flex flex-col items-center justify-center py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm"
            title="Load saved workspace"
          >
            <span className="material-symbols-rounded text-xl leading-6 mb-0.5">
              folder_open
            </span>
            <span className="text-[10px] font-medium hidden xl:inline">Load</span>
            {/* Tooltip for small screens */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none xl:hidden">
              Load
            </div>
          </button>

          {/* Workspaces Dropdown */}
          {showWorkspacesDropdown && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
                  Saved Workspaces ({savedWorkspaces.length}/3)
                </div>
                {savedWorkspaces.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No saved workspaces
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {savedWorkspaces.map((workspace) => (
                      <div
                        key={workspace.id}
                        className="group flex items-center justify-between px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                        onClick={() => handleLoadWorkspace(workspace.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {workspace.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(workspace.createdAt).toLocaleDateString()} {new Date(workspace.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteWorkspace(workspace.id, e)}
                          className="ml-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete workspace"
                        >
                          <span className="material-symbols-rounded text-base">
                            delete
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-purple-600 mx-1"></div>

      {/* Undo Action */}
      <button
        onClick={handleUndo}
        className={`group relative w-[42px] xl:w-[68px] flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors shadow-sm ${
          canUndo
            ? "bg-purple-700 hover:bg-purple-600 cursor-pointer"
            : "bg-purple-700/50 cursor-not-allowed"
        }`}
        title={canUndo ? `Undo (${undoCount} available)` : "No actions to undo"}
        disabled={!canUndo}
      >
        <span className="material-symbols-rounded text-white text-xl leading-6 mb-0.5">
          undo
        </span>
        <span className="text-[10px] text-white/80 font-medium hidden xl:inline">
          Undo
        </span>
        {undoCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-semibold shadow-sm">
            {undoCount}
          </span>
        )}
        {/* Tooltip for small screens */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none xl:hidden">
          Undo {undoCount > 0 ? `(${undoCount})` : ""}
        </div>
      </button>
    </div>
  );
};

export default HeaderActions;
