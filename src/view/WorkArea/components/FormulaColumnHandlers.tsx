/**
 * Formula Column Action Handlers
 * Extracted from WorkArea to keep file size manageable
 */

import toast from "react-hot-toast";
import type { Column } from "../../../components/DataGrid";
import type { Formula } from "../../../services/pega";
import { eventBus } from "../../../utils/bus";
import { appStateHistory } from "../../../utils/stateHistory";
import {
  getCurrentUserInitials,
  generateFormulaIdentifier,
  getNextVersion,
  isFormulaFromOtherProject,
  isValidFormulaId,
} from "../../../utils/formulaNaming";

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

    const formula = formulas.find((f) => f.id === column.formulaId);
    if (!formula) {
      toast.error("Formula data not found");
      return;
    }

    try {
      toast.loading("Creating new version...", { id: "create-version" });

      // TODO: Replace with actual Pega DX API call
      // const response = await PegaService.createFormulaVersion(formula.id);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get current user initials
      const userInitials = getCurrentUserInitials();

      // Check if formula is from another project
      const isFromOtherProject = isFormulaFromOtherProject(
        formula.id,
        userInitials
      );

      let newFormulaId: string;
      let newVersion: string;

      if (isFromOtherProject || !isValidFormulaId(formula.id)) {
        // Formula is from another project or doesn't follow naming convention
        // Generate completely new ID with v1
        newFormulaId = generateFormulaIdentifier({
          userInitials,
          productName: formula.category || "Product",
          currentFormulas: availableFormulas,
          isReferenceFromOtherProject: true,
        });
        newVersion = "v1";
        toast.success(
          "Formula adapted from reference. New formula ID generated.",
          { duration: 3000 }
        );
      } else {
        // Formula is from same project - just increment version
        newVersion = getNextVersion(formula.version);
        newFormulaId = generateFormulaIdentifier({
          userInitials,
          productName: formula.category || "Product",
          currentFormulas: availableFormulas,
          isReferenceFromOtherProject: false,
          existingFormulaId: formula.id,
        });
        newFormulaId = `${newFormulaId}${newVersion}`;
      }

      // Create new formula with updated ID and version
      const newFormula: Formula = {
        ...formula,
        id: newFormulaId,
        version: newVersion,
        name: `${formula.name.replace(/\s*\(v\d+\)$/, "")} (${newVersion})`,
        createdBy: userInitials,
        lastUpdated: new Date().toISOString(),
        status: "draft",
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
      const newColumn: Column = {
        id: newColumnId,
        key: newColumnId,
        title: newFormula.name,
        type: "number",
        editable: true,
        sortable: true,
        group: "Formulas",
        formulaId: newFormula.id,
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

      toast.success(`Created ${newVersion}: ${newFormulaId}`, {
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

  const handleSendForCompoundingFromMenu = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column || !column.formulaId) {
      toast.error("No formula found for this column");
      return;
    }

    const formula = formulas.find((f) => f.id === column.formulaId);
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

    // TODO: Replace with actual Pega DX API call
    // await PegaService.sendForCompounding(formula.id);

    toast.loading("Sending formula for compounding...", {
      id: "send-compounding",
    });

    // Simulate API call
    setTimeout(() => {
      toast.success(`Formula "${formula.name}" sent for compounding`, {
        id: "send-compounding",
        duration: 4000,
      });

      // Save state for undo
      appStateHistory.push(
        { columns, tableData, formulas },
        "send_for_compounding",
        `Sent formula ${formula.name} for compounding`
      );

      // Emit event to update undo state
      eventBus.emit("undo-state-updated", {
        canUndo: appStateHistory.canUndo(),
        count: appStateHistory.getUndoCount(),
      });

      // Emit the send-for-compounding event for header sync
      eventBus.emit("send-for-compounding");
    }, 1500);
  };

  return {
    handleCreateVersion,
    handleNormalizeFromMenu,
    handleSendForCompoundingFromMenu,
  };
};
