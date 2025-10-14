import { useState, useEffect } from "react";
import { eventBus } from "../../utils/bus";
import FormulaModal from "../../components/FormulaModal";
import { useModal } from "../../App";
import type { Formula } from "../../services/pega";
import toast from "react-hot-toast";

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

  return (
    <div className="flex items-center gap-2">
      {/* Formula Actions */}
      <button
        onClick={handleCreateFormula}
        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
        title="New Formula"
      >
        <div className="relative">
          <i className="ri-flask-line text-white text-sm"></i>
          <i className="ri-add-line text-white text-xs absolute -top-1 -right-1"></i>
        </div>
      </button>
      <button
        onClick={handleMergeDuplicates}
        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
        title="Merge Duplicates"
      >
        <i className="ri-git-merge-line text-white text-sm"></i>
      </button>

      {/* Normalize Action */}
      <button
        onClick={handleNormalize}
        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
        title="Normalize Formula"
      >
        <i className="ri-scales-line text-white text-lg"></i>
      </button>

      {/* Send for Compounding */}
      <button
        onClick={handleSendForCompounding}
        className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
          hasActiveFormula
            ? "hover:bg-purple-700"
            : "opacity-50 cursor-not-allowed"
        }`}
        title="Send Active Formula for Compounding"
        disabled={!hasActiveFormula}
      >
        <i className="ri-send-plane-line text-white text-sm"></i>
      </button>

      {/* Undo Action */}
      <button
        onClick={handleUndo}
        className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors relative ${
          canUndo
            ? "hover:bg-purple-700 cursor-pointer"
            : "opacity-50 cursor-not-allowed"
        }`}
        title={canUndo ? `Undo (${undoCount} available)` : "No actions to undo"}
        disabled={!canUndo}
      >
        <i className="ri-arrow-go-back-line text-white text-sm"></i>
        {undoCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {undoCount}
          </span>
        )}
      </button>

      {/* Primary Action */}
      <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap">
        Run Compliance
      </button>

      {/* More Actions Menu - Always at the end */}
      <button
        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
        title="More Actions"
      >
        <i className="ri-more-2-fill text-white text-lg"></i>
      </button>
    </div>
  );
};

export default HeaderActions;
