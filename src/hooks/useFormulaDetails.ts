import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import type { Formula } from "../services/pega";

/**
 * useFormulaDetails Hook (Controller Layer)
 * 
 * Manages formula details modal state and operations.
 * Handles both edit mode (for owned formulas) and view mode (for locked formulas).
 * 
 * @param allFormulas - Combined list of workspace formulas and available formulas
 * @param onUpdateFormula - Callback to update formula details
 * @returns Modal state and handlers
 */
export const useFormulaDetails = (
  allFormulas: Formula[],
  onUpdateFormula: (formulaId: string, updates: Partial<Formula>) => void
) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  /**
   * Open formula details modal in edit mode
   * For owned/editable formulas
   * Draft formulas are always editable regardless of ownership
   */
  const handleEditFormulaDetails = useCallback((formulaId: string) => {
    // Find formula by universal formula ID
    const formula = allFormulas.find(f => f.id === formulaId);

    if (formula) {
      setSelectedFormula(formula);
      // Draft formulas are always editable (isReadOnly = false)
      // Non-draft formulas are read-only in edit view
      setIsReadOnly(formula.status !== 'draft');
      setIsModalOpen(true);
    } else {
      toast.error("Formula not found");
      console.error("Formula not found with ID:", formulaId, "Available formulas:", allFormulas.map(f => f.id));
    }
  }, [allFormulas]);

  /**
   * Open formula details modal in view-only mode
   * For locked/reference formulas
   */
  const handleViewFormulaDetails = useCallback((formulaId: string) => {
    // Find formula by universal formula ID
    const formula = allFormulas.find(f => f.id === formulaId);

    if (formula) {
      setSelectedFormula(formula);
      setIsReadOnly(true);
      setIsModalOpen(true);
    } else {
      toast.error("Formula not found");
      console.error("Formula not found with ID:", formulaId, "Available formulas:", allFormulas.map(f => f.id));
    }
  }, [allFormulas]);

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
