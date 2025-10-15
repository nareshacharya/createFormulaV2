import { useState, useEffect } from "react";
import { eventBus } from "../../utils/bus";
import FormulaModal from "../../components/FormulaModal";
import SaveWorkspaceModal from "../../components/SaveWorkspaceModal";
import { useModal } from "../../App";
import type { Formula } from "../../services/pega";
import toast from "react-hot-toast";
import {
  saveWorkspace,
  canCreateWorkspace,
  type WorkspaceState,
} from "../../utils/workspaceManager";

const HeaderActions = () => {
  const { showModal, hideModal } = useModal();
  const [availableFormulas, setAvailableFormulas] = useState<Formula[]>([]);
  const [currentFormulaSelections, setCurrentFormulaSelections] = useState(0);
  const [selectedFormulaIds, setSelectedFormulaIds] = useState<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [undoCount, setUndoCount] = useState(0);
  const [hasActiveFormula, setHasActiveFormula] = useState(false);

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
      // Emit event to gather current state
      eventBus.emit("request-workspace-state");

      // In a real implementation, you would collect the state from WorkArea
      // For now, we'll create a placeholder state
      const state: WorkspaceState = {
        formulas: [],
        ingredients: [],
        attributes: [],
        selectedFormulas: selectedFormulaIds,
        activeFormulaId: null,
        expandedIngredients: [],
        filters: {},
        lastModified: new Date().toISOString(),
      };

      const workspace = saveWorkspace(workspaceName, state);
      toast.success(`Workspace "${workspace.name}" saved successfully!`);
      hideModal();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save workspace"
      );
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Formula Actions Group - Icon + Text Style */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCreateFormula}
          className="group relative w-[68px] flex flex-col items-center justify-center py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 transition-colors cursor-pointer shadow-sm"
          title="New Formula"
        >
          <div className="relative mb-0.5">
            <i className="ri-flask-line text-white text-xl leading-6"></i>
            <i className="ri-add-line text-white text-xs absolute -top-0.5 -right-0.5 bg-purple-700 rounded-full"></i>
          </div>
          <span className="text-[10px] text-white/80 font-medium whitespace-nowrap hidden lg:inline">
            Formula
          </span>
          {/* Tooltip for small screens */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none lg:hidden">
            Formula
          </div>
        </button>

        <button
          onClick={handleMergeDuplicates}
          className="group relative w-[68px] flex flex-col items-center justify-center py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 transition-colors cursor-pointer shadow-sm"
          title="Merge Duplicates"
        >
          <i className="ri-git-merge-line text-white text-xl leading-6 mb-0.5"></i>
          <span className="text-[10px] text-white/80 font-medium whitespace-nowrap hidden lg:inline">
            Merge
          </span>
          {/* Tooltip for small screens */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none lg:hidden">
            Merge
          </div>
        </button>

        <button
          onClick={handleNormalize}
          className="group relative w-[68px] flex flex-col items-center justify-center py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 transition-colors cursor-pointer shadow-sm"
          title="Normalize Formula"
        >
          <i className="ri-scales-3-line text-white text-xl leading-6 mb-0.5"></i>
          <span className="text-[10px] text-white/80 font-medium whitespace-nowrap hidden lg:inline">
            Normalize
          </span>
          {/* Tooltip for small screens */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none lg:hidden">
            Normalize
          </div>
        </button>

        <button
          onClick={handleSendForCompounding}
          className={`group relative w-[68px] flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm ${
            hasActiveFormula
              ? "bg-purple-700 hover:bg-purple-600"
              : "bg-purple-700/50 cursor-not-allowed"
          }`}
          title="Send Active Formula for Compounding"
          disabled={!hasActiveFormula}
        >
          <i className="ri-send-plane-line text-white text-xl leading-6 mb-0.5"></i>
          <span className="text-[10px] text-white/80 font-medium whitespace-nowrap hidden lg:inline">
            Send
          </span>
          {/* Tooltip for small screens */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none lg:hidden">
            Send
          </div>
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-purple-600 mx-1"></div>

      {/* Save Workspace Button */}
      <button
        onClick={handleSaveWorkspace}
        className="group relative w-[68px] flex flex-col items-center justify-center py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm"
        title="Save current workspace state"
      >
        <i className="ri-save-3-line text-xl leading-6 mb-0.5"></i>
        <span className="text-[10px] font-medium hidden lg:inline">Save</span>
        {/* Tooltip for small screens */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none lg:hidden">
          Save
        </div>
      </button>

      {/* Undo Action */}
      <button
        onClick={handleUndo}
        className={`group relative w-[68px] flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors shadow-sm ${
          canUndo
            ? "bg-purple-700 hover:bg-purple-600 cursor-pointer"
            : "bg-purple-700/50 cursor-not-allowed"
        }`}
        title={canUndo ? `Undo (${undoCount} available)` : "No actions to undo"}
        disabled={!canUndo}
      >
        <i className="ri-arrow-go-back-line text-white text-xl leading-6 mb-0.5"></i>
        <span className="text-[10px] text-white/80 font-medium hidden lg:inline">
          Undo
        </span>
        {undoCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-semibold shadow-sm">
            {undoCount}
          </span>
        )}
        {/* Tooltip for small screens */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none lg:hidden">
          Undo {undoCount > 0 ? `(${undoCount})` : ""}
        </div>
      </button>
    </div>
  );
};

export default HeaderActions;
