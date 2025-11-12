import { useState, useCallback } from "react";
import type { Formula } from "../services/pega";
import toast from "react-hot-toast";

/**
 * useFormulaDetails Hook (Controller Layer)
 * 
 * Manages formula details modal state and operations.
 * Handles both edit mode (for owned formulas) and view mode (for locked formulas).
 * 
 * @param formulas - List of all available formulas
 * @param onUpdateFormula - Callback to update formula details
 * @returns Modal state and handlers
 */
export const useFormulaDetails = (
  formulas: Formula[],
  onUpdateFormula: (formulaId: string, updates: Partial<Formula>) => void
) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  /**
   * Open formula details modal in edit mode
   * For owned/editable formulas
   */
  const handleEditFormulaDetails = useCallback((formulaId: string) => {
    // Find formula by universal formula ID
    const formula = formulas.find(f => f.id === formulaId);

    if (formula) {
      setSelectedFormula(formula);
      setIsReadOnly(false);
      setIsModalOpen(true);
    } else {
      toast.error("Formula not found");
      console.error("Formula not found with ID:", formulaId, "Available formulas:", formulas.map(f => f.id));
    }
  }, [formulas]);

  /**
   * Open formula details modal in view-only mode
   * For locked/reference formulas
   */
  const handleViewFormulaDetails = useCallback((formulaId: string) => {
    // Find formula by universal formula ID
    const formula = formulas.find(f => f.id === formulaId);

    if (formula) {
      setSelectedFormula(formula);
      setIsReadOnly(true);
      setIsModalOpen(true);
    } else {
      toast.error("Formula not found");
      console.error("Formula not found with ID:", formulaId, "Available formulas:", formulas.map(f => f.id));
    }
  }, [formulas]);

  /**
   * Save formula details updates
   */
  const handleSaveFormula = useCallback((updates: Partial<Formula>) => {
    if (!selectedFormula || isReadOnly) return;

    try {
      onUpdateFormula(selectedFormula.id, updates);
      toast.success("Formula details updated successfully");
      setIsModalOpen(false);
      setSelectedFormula(null);
    } catch (error) {
      toast.error("Failed to update formula details");
      console.error("Error updating formula:", error);
    }
  }, [selectedFormula, isReadOnly, onUpdateFormula]);

  /**
   * Close modal and reset state
   */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedFormula(null);
    setIsReadOnly(false);
  }, []);

  return {
    // State
    isFormulaDetailsModalOpen: isModalOpen,
    selectedFormula,
    isReadOnly,

    // Handlers
    handleEditFormulaDetails,
    handleViewFormulaDetails,
    handleSaveFormula,
    handleCloseFormulaDetails: handleCloseModal,
  };
};
