/**
 * Formula Column Action Handlers
 * Extracted from WorkArea to keep file size manageable
 */

import { toast } from "react-hot-toast";
import type { Column } from "../../../components/DataGrid";
import type { Formula } from "../../../services/pega";
import { eventBus } from "../../../utils/bus";
import { getCurrentUserInitials } from "../../../utils/idGeneration";
import { appStateHistory } from "../../../utils/stateHistory";

export interface FormulaHandlersConfig {
  columns: Column[];
  tableData: any[];
  formulas: Formula[];
  availableFormulas: Formula[];
  editableFormula: string | null;
  maxFormulaSelections: number;
  setAvailableFormulas: React.Dispatch<React.SetStateAction<Formula[]>>;
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  setTableData: React.Dispatch<React.SetStateAction<any[]>>;
  handleNormalize: () => void;
}

export const useFormulaColumnHandlers = (config: FormulaHandlersConfig) => {
  const {
    columns,
    tableData,
    formulas,
    availableFormulas,
    editableFormula,
    maxFormulaSelections,
    setAvailableFormulas,
    setColumns,
    setTableData,
    handleNormalize,
  } = config;

  // Helper to determine which type-specific ID field exists
  const getTypeSpecificIdField = (
    formula: Formula
  ):
    | "perfumerFormulaId"
    | "baseFormulaId"
    | "dilutionFormulaId"
    | "analyticalFormulaId"
    | null => {
    if (formula.perfumerFormulaId) return "perfumerFormulaId";
    if (formula.baseFormulaId) return "baseFormulaId";
    if (formula.dilutionFormulaId) return "dilutionFormulaId";
    if (formula.analyticalFormulaId) return "analyticalFormulaId";
    return null;
  };

  const handleCreateVersion = async (columnId: string) => {
    // Check formula limit first
    const currentFormulaColumns = columns.filter(
      (col) => col.group === "Formulas" && col.formulaId
    );

    if (currentFormulaColumns.length >= maxFormulaSelections) {
      toast.error(
        `Maximum of ${maxFormulaSelections} formula columns allowed. Remove a column before creating a new version.`,
        { duration: 4000 }
      );
      return;
    }

    const column = columns.find((col) => col.id === columnId);
    if (!column || !column.formulaId) {
      toast.error("No formula found for this column");
      return;
    }

    // Search in both workspace formulas and available formulas
    let formula = formulas.find((f) => f.id === column.formulaId);
    if (!formula) {
      formula = availableFormulas.find((f) => f.id === column.formulaId);
    }
    if (!formula) {
      toast.error("Formula data not found");
      return;
    }

    try {
      toast.loading("Creating new version...", { id: "create-version" });

      // TODO: Replace with actual Pega DX API call
      // const response = await PegaService.createFormulaVersion(formula.id);

      // Simulate API call
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get current user initials
      const userInitials = getCurrentUserInitials();

      // Determine if this is the same user or different user
      const isUserCopy = formula.createdBy === userInitials;

      // Get the type-specific ID to increment version from
      const currentTypeSpecificId =
        formula.perfumerFormulaId ||
        formula.baseFormulaId ||
        formula.dilutionFormulaId ||
        formula.analyticalFormulaId ||
        formula.id; // Fallback to universal ID if type-specific not set

      let newTypeSpecificId: string;
      let newVersion: string;

      if (isUserCopy && currentTypeSpecificId) {
        // Same user - increment version on existing sequence
        const match = currentTypeSpecificId.match(
          /^([A-Z]{1,3})(\d{5})v(\d+)$/
        );
        if (match) {
          const [, prefix, sequence, versionNum] = match;
          const nextVersion = parseInt(versionNum, 10) + 1;
          newTypeSpecificId = `${prefix}${sequence}v${nextVersion}`;
          newVersion = `v${nextVersion}`;
        } else {
          // Fallback if ID doesn't match expected format
          newTypeSpecificId = `${userInitials}00001v1`;
          newVersion = "v1";
        }
      } else {
        // Different user - generate new sequence with their initials, reset to v1
        const userFormulas = availableFormulas.filter((f) => {
          const id =
            f.perfumerFormulaId ||
            f.baseFormulaId ||
            f.dilutionFormulaId ||
            f.analyticalFormulaId ||
            f.id;
          return id.startsWith(userInitials);
        });

        const sequences = userFormulas
          .map((f) => {
            const id =
              f.perfumerFormulaId ||
              f.baseFormulaId ||
              f.dilutionFormulaId ||
              f.analyticalFormulaId ||
              f.id;
            const match = id.match(/^[A-Z]{1,3}(\d{5})v\d+$/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter((n) => n > 0);

        const nextSequence =
          (sequences.length > 0 ? Math.max(...sequences) : 0) + 1;
        newTypeSpecificId = `${userInitials}${nextSequence
          .toString()
          .padStart(5, "0")}v1`;
        newVersion = "v1";

        toast.success("Creating new version with your initials", {
          duration: 3000,
        });
      }

      // Generate new universal formula ID (F-sequence)
      const fSequenceNumbers = availableFormulas
        .map((f) => {
          const match = f.id.match(/^F(\d{5})v\d+$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => n > 0);
      const nextFSequence =
        (fSequenceNumbers.length > 0 ? Math.max(...fSequenceNumbers) : 0) + 1;
      const newUniversalId = `F${nextFSequence.toString().padStart(5, "0")}v1`;

      // Determine which type-specific ID field to update
      const typeSpecificIdField = getTypeSpecificIdField(formula);

      // Create new formula with updated IDs and version
      const newFormula: Formula = {
        ...formula,
        id: newUniversalId, // New universal ID
        version: newVersion,
        name: `${formula.name.replace(/\s*\(v\d+\)$/, "")} (${newVersion})`,
        createdBy: userInitials,
        lastUpdated: new Date().toISOString(),
        status: "draft",
        ...(typeSpecificIdField
          ? { [typeSpecificIdField]: newTypeSpecificId }
          : {}),
      };

      // Add new formula to available formulas list
      setAvailableFormulas((prev) => [...prev, newFormula]);

      // Get all data from the current column
      const columnData: Record<string, number> = {};
      tableData.forEach((row) => {
        if (!row.isTotal && row[columnId] !== undefined) {
          columnData[row.id] = row[columnId];
        }
      });

      // Create new column with the new formula version
      const newColumnId = `formula_${Date.now()}`;
      const displayId =
        newFormula.perfumerFormulaId ||
        newFormula.baseFormulaId ||
        newFormula.dilutionFormulaId ||
        newFormula.analyticalFormulaId ||
        newFormula.id;
      const newColumn: Column = {
        id: newColumnId,
        key: newColumnId,
        title: newFormula.name,
        type: "number",
        editable: true,
        sortable: true,
        group: "Formulas",
        formulaId: newFormula.id,
        formulaDisplayId: displayId,
      };

      setColumns((prev) => {
        const insertIndex = prev.findIndex((col) => col.id === "formulaAdd");
        if (insertIndex === -1) {
          return [...prev, newColumn];
        }
        return [
          ...prev.slice(0, insertIndex),
          newColumn,
          ...prev.slice(insertIndex),
        ];
      });

      // Copy data from original column to new column
      setTableData((prev) =>
        prev.map((row) => ({
          ...row,
          [newColumnId]: columnData[row.id] || (row.isTotal ? null : 0),
        }))
      );

      // Save state for undo
      appStateHistory.push(
        { columns, tableData, formulas, availableFormulas },
        "create_version",
        `Created version ${newVersion} of formula ${formula.name}`
      );

      // Emit event to update undo state
      eventBus.emit("undo-state-updated", {
        canUndo: appStateHistory.canUndo(),
        count: appStateHistory.getUndoCount(),
      });

      // Update available formulas count
      eventBus.emit("available-formulas-updated", {
        formulas: [...availableFormulas, newFormula],
      });

      toast.success(`Created ${newVersion}: ${newTypeSpecificId}`, {
        id: "create-version",
        duration: 4000,
      });
    } catch (error) {
      console.error("Failed to create version:", error);
      toast.error("Failed to create new version", { id: "create-version" });
    }
  };

  const handleNormalizeFromMenu = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column || !column.formulaId) {
      toast.error("No formula found for this column");
      return;
    }

    // Call the normalize handler
    handleNormalize();

    // Show toast notification
    toast.success(`Normalized formula: ${column.title}`, { duration: 3000 });

    // Save state for undo
    appStateHistory.push(
      { columns, tableData, formulas },
      "normalize_formula",
      `Normalized formula ${column.title}`
    );

    // Emit event to update undo state
    eventBus.emit("undo-state-updated", {
      canUndo: appStateHistory.canUndo(),
      count: appStateHistory.getUndoCount(),
    });
  };

  const handleSendForCompoundingFromMenu = async (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column || !column.formulaId) {
      toast.error("No formula found for this column");
      return;
    }

    // Search in both workspace formulas and available formulas
    let formula = formulas.find((f) => f.id === column.formulaId);
    if (!formula) {
      formula = availableFormulas.find((f) => f.id === column.formulaId);
    }
    if (!formula) {
      toast.error("Formula data not found");
      return;
    }

    // Check if this is the active formula
    if (editableFormula !== columnId) {
      toast.error(
        "Please set this formula as active before sending for compounding"
      );
      return;
    }

    // Type narrowing for TypeScript strictness
    const selectedFormula = formula;

    toast.loading("Sending formula for compounding...", {
      id: "send-compounding",
    });

    try {
      // Import services dynamically
      const { ApiService } = await import("../../../services/api");
      const { prepareFormulaForCompounding, validateFormulaForCompounding } = 
        await import("../../../services/compounding");

      // Prepare formula data for submission
      const compoundingFormula = prepareFormulaForCompounding(
        selectedFormula,
        // Map table data to ingredients (placeholder - actual implementation would extract ingredients from tableData)
        [],
        // Attributes (placeholder)
        []
      );

      // Validate before submission
      const validation = validateFormulaForCompounding(compoundingFormula);
      if (!validation.isValid) {
        toast.error(
          `Validation failed: ${validation.errors.join(", ")}`,
          {
            id: "send-compounding",
            duration: 5000,
          }
        );
        return;
      }

      // Submit via ApiService
      const response = await ApiService.submitForCompounding(
        selectedFormula.id,
        compoundingFormula
      );

      if (response.success) {
        toast.success(
          `Formula "${selectedFormula.name}" sent for compounding`,
          {
            id: "send-compounding",
            duration: 4000,
          }
        );

        // Save state for undo
        appStateHistory.push(
          { columns, tableData, formulas },
          "send_for_compounding",
          `Sent formula ${selectedFormula.name} for compounding`
        );

        // Emit event to update undo state
        eventBus.emit("undo-state-updated", {
          canUndo: appStateHistory.canUndo(),
          count: appStateHistory.getUndoCount(),
        });

        // Emit the send-for-compounding event for header sync
        eventBus.emit("send-for-compounding");

        // Emit submission success event
        eventBus.emit("formula-submitted", {
          formulaId: selectedFormula.id,
          formulaName: selectedFormula.name,
          result: response.data,
        });
      } else {
        toast.error(
          `Failed to send formula: ${response.error?.message || "Unknown error"}`,
          {
            id: "send-compounding",
            duration: 4000,
          }
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(
        `Error sending formula: ${errorMessage}`,
        {
          id: "send-compounding",
          duration: 4000,
        }
      );
    }
  };

  return {
    handleCreateVersion,
    handleNormalizeFromMenu,
    handleSendForCompoundingFromMenu,
  };
};
