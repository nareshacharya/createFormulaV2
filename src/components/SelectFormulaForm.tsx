/* eslint-disable jsx-a11y/label-has-associated-control */
import type { Formula } from "../services/pega";
import { tw } from "../utils/tailwindToInline";
import FormulaDataGrid from "./FormulaDataGrid";

interface SelectFormulaFormProps {
  availableFormulas: Formula[];
  selectedFormulas: string[];
  onSelectionChange: (formulas: string[]) => void;
  remainingSelections: number;
  selectedFormulaIds: string[];
}

const SelectFormulaForm = ({
  availableFormulas,
  selectedFormulas,
  onSelectionChange,
  remainingSelections,
  selectedFormulaIds,
}: SelectFormulaFormProps) => {
  return (
    <div style={tw("px-6 pt-3 pb-6")}>
      <div style={tw("space-y-4")}>
        {remainingSelections > 0 ? (
          <FormulaDataGrid
            formulas={availableFormulas}
            selectedFormulas={selectedFormulas}
            onSelectionChange={onSelectionChange}
            maxSelections={remainingSelections}
            highlightedFormulas={selectedFormulaIds}
          />
        ) : (
          <div style={tw("text-center py-8")}>
            <div style={tw("text-gray-500 mb-2")}>
              No more formulas can be added.
            </div>
            <div style={tw("text-sm text-gray-600")}>
              Maximum number of formula columns (4) reached.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectFormulaForm;
