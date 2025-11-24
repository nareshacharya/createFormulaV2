import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import type { Formula, Ingredient } from "../services/pega";
import type { AnalyticalCompositionUpload } from "../types/formula.creation.types";

/**
 * useExcelUpload Hook (Controller Layer)
 * 
 * Manages analytical composition upload modal state and operations.
 * Exclusive for analytical formulas.
 * 
 * @param formulas - List of all available formulas
 * @param ingredients - List of all available ingredients
 * @param onAddIngredientsToFormula - Callback to handle composition upload
 * @returns Modal state and handlers
 */
export const useExcelUpload = (
  formulas: Formula[],
  allIngredients: Ingredient[],
  onAddIngredientsToFormula: (formulaId: string, composition: AnalyticalCompositionUpload) => void
) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormulaId, setSelectedFormulaId] = useState<string | null>(null);

  /**
   * Open analytical composition upload modal
   * Only available for analytical formulas
   */
  const handleUploadExcel = useCallback((formulaId: string) => {
    // Find formula by universal formula ID
    const formula = formulas.find(f => f.id === formulaId);

    if (!formula) {
      toast.error("Formula not found");
      console.error("Formula not found with ID:", formulaId, "Available formulas:", formulas.map(f => f.id));
      return;
    }

    // Verify it's an analytical formula
    if (formula.formulaType !== "ANALYTICAL") {
      toast.error("Composition upload is only available for analytical formulas");
      return;
    }

    setSelectedFormulaId(formula.id);
    setIsModalOpen(true);
  }, [formulas]);

  /**
   * Process uploaded composition and add to formula
   */
  const handleUploadIngredients = useCallback((composition: AnalyticalCompositionUpload) => {
    if (!selectedFormulaId) {
      toast.error("No formula selected");
      return;
    }

    try {
      // Add composition to formula
      onAddIngredientsToFormula(selectedFormulaId, composition);

      toast.success(`Successfully uploaded ${composition.ingredients.length} ingredients to formula`);
      setIsModalOpen(false);
      setSelectedFormulaId(null);
    } catch (error) {
      toast.error("Failed to add composition to formula");
      console.error("Error adding composition:", error);
    }
  }, [selectedFormulaId, onAddIngredientsToFormula]);

  /**
   * Close modal and reset state
   */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedFormulaId(null);
  }, []);

  return {
    // State
    isExcelUploadModalOpen: isModalOpen,
    selectedFormulaId,
    availableIngredients: allIngredients,

    // Handlers
    handleUploadExcel,
    handleUploadIngredients,
    handleCloseExcelUpload: handleCloseModal,
  };
};
