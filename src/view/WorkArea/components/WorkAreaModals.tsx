/**
 * Modal Components for WorkArea
 * Extracted to keep WorkArea.tsx under 1000 lines
 */

import AttributeSelector from "../../../components/AttributeSelector";
import Button from "../../../components/Button";
import Dialog from "../../../components/Dialog";
import FormulaModal from "../../../components/FormulaModal";
import type { Formula, IngredientAttribute } from "../../../services/pega";
import { tw, mergeStyles } from "../../../utils/tailwindToInline";

interface ModalsProps {
  // Formula Modal
  showFormulaModal: boolean;
  setShowFormulaModal: (show: boolean) => void;
  onFormulaModalCreateFormula: (formula: Omit<Formula, "id">) => void;
  onFormulaModalSelectFormula: (formula: Formula) => void;
  availableFormulas: Formula[];
  maxFormulaSelections: number;
  currentFormulaSelections: number;
  selectedFormulaIds: string[];

  // Attribute Dialog
  showAttributeDialog: boolean;
  setShowAttributeDialog: (show: boolean) => void;
  attributes: IngredientAttribute[];
  selectedAttributes: IngredientAttribute[];
  maxAttributeSelections: number;
  onAttributesSelected: (attributes: IngredientAttribute[]) => void;
}

export const WorkAreaModals = ({
  showFormulaModal,
  setShowFormulaModal,
  onFormulaModalCreateFormula,
  onFormulaModalSelectFormula,
  availableFormulas,
  maxFormulaSelections,
  currentFormulaSelections,
  selectedFormulaIds,
  showAttributeDialog,
  setShowAttributeDialog,
  attributes,
  selectedAttributes,
  maxAttributeSelections,
  onAttributesSelected,
}: ModalsProps) => {
  return (
    <>
      {/* Formula Modal */}
      <FormulaModal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        onCreateFormula={onFormulaModalCreateFormula}
        onSelectFormula={onFormulaModalSelectFormula}
        availableFormulas={availableFormulas}
        maxSelections={maxFormulaSelections}
        currentSelections={currentFormulaSelections}
        selectedFormulaIds={selectedFormulaIds}
      />

      {/* Attribute Selector Dialog */}
      <Dialog
        isOpen={showAttributeDialog}
        onClose={() => setShowAttributeDialog(false)}
        title="Select Attributes"
        size="lg"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <AttributeSelector
            attributes={attributes}
            selectedIds={selectedAttributes.map((attr) => attr.id)}
            onSelectionChange={(ids) => {
              const selected = attributes.filter((attr) =>
                ids.includes(attr.id)
              );
              onAttributesSelected(selected);
            }}
            maxSelections={maxAttributeSelections}
          />
          <div style={mergeStyles(tw("flex justify-end border-t"), { gap: "0.5rem", paddingTop: "1rem" })}>
            <Button
              variant="secondary"
              onClick={() => setShowAttributeDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowAttributeDialog(false)}
            >
              Apply
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};
