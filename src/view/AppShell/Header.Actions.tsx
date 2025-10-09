import { useState, useEffect } from "react";
import { eventBus } from "../../utils/bus";
import FormulaModal from "../../components/FormulaModal";
import { useModal } from "../../App";
import type { Formula } from "../../services/pega";

const HeaderActions = () => {
  const { showModal, hideModal } = useModal();
  const [availableFormulas, setAvailableFormulas] = useState<Formula[]>([]);
  const [currentFormulaSelections, setCurrentFormulaSelections] = useState(0);
  const [selectedFormulaIds, setSelectedFormulaIds] = useState<string[]>([]);

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

    eventBus.on("formula-selections-updated", handleFormulaSelectionsUpdate);
    eventBus.on("available-formulas-updated", handleAvailableFormulasUpdate);

    return () => {
      eventBus.off("formula-selections-updated", handleFormulaSelectionsUpdate);
      eventBus.off("available-formulas-updated", handleAvailableFormulasUpdate);
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
