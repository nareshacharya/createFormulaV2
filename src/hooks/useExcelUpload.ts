import { useState, useCallback } from "react";
import type { Formula, Ingredient } from "../services/pega";
import toast from "react-hot-toast";

interface ParsedIngredient {
  name: string;
  percentage: number;
  mappedIngredientId: string | null;
  status: "matched" | "unmatched" | "pending";
}

/**
 * useExcelUpload Hook (Controller Layer)
 * 
 * Manages Excel upload modal state and ingredient mapping operations.
 * Exclusive for analytical formulas.
 * 
 * @param formulas - List of all available formulas
 * @param ingredients - List of all available ingredients
 * @param onAddIngredientsToFormula - Callback to add ingredients to formula
 * @returns Modal state and handlers
 */
export const useExcelUpload = (
  formulas: Formula[],
  ingredients: Ingredient[],
  onAddIngredientsToFormula: (formulaId: string, ingredients: ParsedIngredient[]) => void
) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormulaId, setSelectedFormulaId] = useState<string | null>(null);

  /**
   * Open Excel upload modal
   * Only available for analytical formulas
   */
  const handleUploadExcel = useCallback((columnId: string) => {
    // Find formula by column ID
    const formula = formulas.find(f => 
      f.id === columnId || 
      f.analyticalFormulaId === columnId
    );

    if (!formula) {
      toast.error("Formula not found");
      return;
    }

    // Verify it's an analytical formula
    if (formula.formulaType !== "ANALYTICAL") {
      toast.error("Excel upload is only available for analytical formulas");
      return;
    }

    setSelectedFormulaId(formula.id);
    setIsModalOpen(true);
  }, [formulas]);

  /**
   * Process uploaded ingredients and add to formula
   */
  const handleUploadIngredients = useCallback((parsedIngredients: ParsedIngredient[]) => {
    if (!selectedFormulaId) {
      toast.error("No formula selected");
      return;
    }

    try {
      // Validate all ingredients are mapped
      const unmapped = parsedIngredients.filter(ing => ing.status === "unmatched");
      if (unmapped.length > 0) {
        toast.error(`${unmapped.length} ingredient(s) are still unmapped`);
        return;
      }

      // Add ingredients to formula
      onAddIngredientsToFormula(selectedFormulaId, parsedIngredients);
      
      toast.success(`Successfully added ${parsedIngredients.length} ingredients to formula`);
      setIsModalOpen(false);
      setSelectedFormulaId(null);
    } catch (error) {
      toast.error("Failed to add ingredients to formula");
      console.error("Error adding ingredients:", error);
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
    availableIngredients: ingredients,
    
    // Handlers
    handleUploadExcel,
    handleUploadIngredients,
    handleCloseExcelUpload: handleCloseModal,
  };
};
