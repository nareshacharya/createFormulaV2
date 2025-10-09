import { useState, useEffect } from "react";
import { headerTokens } from "../../utils/tokens";
import HeaderBadges from "./Header.Badges";
import HeaderActions from "./Header.Actions";
import FormulaModal from "../../components/FormulaModal";
import { eventBus } from "../../utils/bus";
import type { Formula } from "../../services/pega";
import { useModal } from "../../App";

const AppHeader = () => {
  const { showModal, hideModal } = useModal();
  const [activeFormula, setActiveFormula] = useState<Formula | null>(null);
  const [availableFormulas, setAvailableFormulas] = useState<Formula[]>([]);
  const [currentFormulaSelections, setCurrentFormulaSelections] = useState(0);
  const [selectedFormulaIds, setSelectedFormulaIds] = useState<string[]>([]);

  useEffect(() => {
    const handleActiveFormulaChange = (data: { formula: Formula | null }) => {
      setActiveFormula(data.formula);
    };

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

    eventBus.on("active-formula-changed", handleActiveFormulaChange);
    eventBus.on("formula-selections-updated", handleFormulaSelectionsUpdate);
    eventBus.on("available-formulas-updated", handleAvailableFormulasUpdate);

    return () => {
      eventBus.off("active-formula-changed", handleActiveFormulaChange);
      eventBus.off("formula-selections-updated", handleFormulaSelectionsUpdate);
      eventBus.off("available-formulas-updated", handleAvailableFormulasUpdate);
    };
  }, []);

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

  const handleLoadFormula = () => {
    eventBus.emit("load-formula");
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

  return (
    <div className="w-full bg-purple-800 border-b border-purple-700 relative z-1">
      {/* Purple bar */}
      <div className="h-1 bg-purple-600 w-full"></div>

      {/* Header content */}
      <header
        className={`${headerTokens.height} ${headerTokens.padding} flex items-center justify-between w-full`}
      >
        <HeaderBadges activeFormula={activeFormula} />

        <div className="flex items-center space-x-4">
          {/* Formula Actions */}
          <div className="flex items-center gap-1">
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
              onClick={handleLoadFormula}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
              title="Load Formula"
            >
              <i className="ri-folder-open-line text-white text-sm"></i>
            </button>
          </div>

          <HeaderActions />
        </div>
      </header>
    </div>
  );
};

export default AppHeader;
