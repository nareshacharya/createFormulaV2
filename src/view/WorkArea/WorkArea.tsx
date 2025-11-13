import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import DataGrid from "../../components/DataGrid";
import type { Column } from "../../components/DataGrid";
import AttributeSelector from "../../components/AttributeSelector";
import Dialog from "../../components/Dialog";
import Modal from "../../components/Modal";
import FormulaModal from "../../components/FormulaModal";
import FormulaDetailsModal from "../../components/FormulaDetailsModal";
import ExcelUploadModal from "../../components/ExcelUploadModal";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import { PegaService } from "../../services/pega";
import type {
  Formula,
  Ingredient,
  IngredientAttribute,
} from "../../services/pega";
import { eventBus } from "../../utils/bus";
import {
  calculateTotals,
  getEmptyStateData,
} from "../../utils/formulaCalculations";
import { useWorkAreaState } from "./hooks/useWorkAreaState";
import { useDataGridHandlers } from "./hooks/useDataGridHandlers";
import { useFormulaOperations } from "./hooks/useFormulaOperations";
import { useFormulaColumnHandlers } from "./components/FormulaColumnHandlers";
import { useDilution } from "../../components/dilution";
import {
  generateNewFormulaId,
  isOwnFormula,
} from "../../utils/formulaIdGenerator";
import type { WorkspaceState } from "../../utils/workspaceManager";
import { exportData } from "../../utils/exportUtils";
import { useWorkspace } from "../../hooks/useWorkspace";
import { useWorkspaceHistory } from "../../hooks/useWorkspaceHistory";
import { useFormulaDetails } from "../../hooks/useFormulaDetails";
import { useExcelUpload } from "../../hooks/useExcelUpload";

const WorkArea = () => {
  // Workspace context - manages data isolation between tabs
  const workspace = useWorkspace();

  // Get workspace-scoped history manager
  const workspaceHistory = useWorkspaceHistory();

  // Use custom hooks for state management
  const state = useWorkAreaState();

  // Dilution state management
  const dilutionState = useDilution();
  const {
    columns,
    tableData,
    formulas,
    ingredients,
    attributes,
    editableFormula,
    maxAttributeSelections,
    maxFormulaSelections,
    selectedFormulaIds,
    pendingFormulaIds,
    showFormulaModal,
    showFormulaSelector,
    availableFormulas,
    activeFormula,
    selectedAttributes,
    selectedFormulas,
    setColumns,
    setTableData,
    setFormulas,
    setIngredients,
    setAttributes,
    setEditableFormula,
    setSelectedFormulaIds,
    setShowFormulaModal,
    setShowFormulaSelector,
    setAvailableFormulas,
    setActiveFormula,
    setSelectedAttributes,
    setSelectedFormulas,
  } = state;

  // Local state for attribute dialog and grouping
  const [showAttributeDialog, setShowAttributeDialog] = useState(false);
  const [groupedByColumn, setGroupedByColumn] = useState<string | null>(null);

  // Undo state tracking
  const [undoState, setUndoState] = useState({
    canUndo: false,
    undoCount: 0,
  });

  // Track if initial state has been saved for undo
  const initialStateSaved = useRef(false);

  // Track the current active workspace ID to detect switches
  const currentWorkspaceId = useRef(workspace.activeTabId);

  // Helper function to save initial state before first user action
  const ensureInitialStateSaved = useCallback(() => {
    if (!initialStateSaved.current && columns.length > 0) {
      workspaceHistory.push(
        {
          columns,
          tableData,
          formulas,
          availableFormulas,
          dilutions: dilutionState.dilutions, // Access current dilution state
        },
        "initial_state",
        "Initial application state"
      );
      initialStateSaved.current = true;
      eventBus.emit("undo-state-updated", {
        canUndo: workspaceHistory.canUndo(),
        count: workspaceHistory.getUndoCount(),
      });
    }
  }, [
    columns,
    tableData,
    formulas,
    availableFormulas,
    dilutionState,
    workspaceHistory,
  ]);

  // Helper function to save state after an action completes
  const saveStateAfterAction = useCallback(
    (action: string, description: string) => {
      // Use setTimeout to ensure state updates have completed
      setTimeout(() => {
        // Access dilutionState directly to get current value
        const currentDilutions = dilutionState.dilutions;
        workspaceHistory.push(
          {
            columns,
            tableData,
            formulas,
            availableFormulas,
            dilutions: currentDilutions,
          },
          action,
          description
        );
        eventBus.emit("undo-state-updated", {
          canUndo: workspaceHistory.canUndo(),
          count: workspaceHistory.getUndoCount(),
        });
      }, 0);
    },
    [
      columns,
      tableData,
      formulas,
      availableFormulas,
      dilutionState,
      workspaceHistory,
    ]
  );

  // Listen to workspace switches and reset undo state for the new workspace
  useEffect(() => {
    const handleWorkspaceSwitched = () => {
      // Reset the initial state saved flag so the new workspace starts fresh
      initialStateSaved.current = false;

      // Get the current workspace's actual undo state
      const actualCanUndo = workspaceHistory.canUndo();
      const actualUndoCount = workspaceHistory.getUndoCount();

      // Update UI state with actual workspace history state
      setUndoState({
        canUndo: actualCanUndo,
        undoCount: actualUndoCount,
      });

      // Update the current workspace ID reference
      currentWorkspaceId.current = workspace.activeTabId;
    };

    eventBus.on("workspace-switched", handleWorkspaceSwitched);

    return () => {
      eventBus.off("workspace-switched", handleWorkspaceSwitched);
    };
  }, [workspace.activeTabId, workspaceHistory]);

  // Listen to workspace creation and reset undo state for the new workspace
  useEffect(() => {
    const handleWorkspaceCreated = () => {
      // Reset the initial state saved flag so the new workspace starts fresh
      initialStateSaved.current = false;

      // New workspace has no history, so always disable undo
      setUndoState({
        canUndo: false,
        undoCount: 0,
      });

      // Update the current workspace ID reference
      currentWorkspaceId.current = workspace.activeTabId;
    };

    eventBus.on("workspace-created", handleWorkspaceCreated);

    return () => {
      eventBus.off("workspace-created", handleWorkspaceCreated);
    };
  }, [workspace.activeTabId]);

  // Use custom hooks for handlers
  const {
    handleRowDelete,
    handleCellEdit,
    handleDeleteColumn,
    handleColumnReorder,
  } = useDataGridHandlers({
    columns,
    selectedFormulaIds,
    editableFormula,
    formulas,
    availableFormulas,
    tableData,
    pendingFormulaIds,
    setTableData,
    setColumns,
    setSelectedFormulaIds,
    setEditableFormula,
  });

  const { handleNormalize, handleMergeDuplicates, handleExplodeFormula } =
    useFormulaOperations({
      columns,
      editableFormula,
      formulas,
      availableFormulas,
      tableData,
      ingredients,
      setTableData,
      selectedFormulaIds,
      setSelectedFormulaIds,
      pendingFormulaIds,
    });

  // Use extracted formula column handlers
  const {
    handleCreateVersion,
    handleNormalizeFromMenu,
    handleSendForCompoundingFromMenu,
  } = useFormulaColumnHandlers({
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
  });

  // Callback for updating formula details
  const handleUpdateFormula = useCallback(
    (formulaId: string, updates: Partial<Formula>) => {
      setFormulas((prevFormulas) =>
        prevFormulas.map((formula) =>
          formula.id === formulaId ? { ...formula, ...updates } : formula
        )
      );
      // Also update in availableFormulas if it exists there
      setAvailableFormulas((prevFormulas) =>
        prevFormulas.map((formula) =>
          formula.id === formulaId ? { ...formula, ...updates } : formula
        )
      );
    },
    [setFormulas, setAvailableFormulas]
  );

  // Callback for adding ingredients from Excel upload
  const handleAddIngredientsToFormula = useCallback(
    (
      formulaId: string,
      parsedIngredients: Array<{
        mappedIngredientId: string;
        percentage: number;
      }>
    ) => {
      const formula = formulas.find((f) => f.id === formulaId);
      if (!formula) return;

      // Add new rows to tableData for each ingredient
      const newRows = parsedIngredients
        .map((parsed) => {
          const ingredient = ingredients.find(
            (ing) => ing.id === parsed.mappedIngredientId
          );
          if (!ingredient) return null;

          const newRow: Record<string, unknown> = {
            id: `${Date.now()}-${Math.random()}`,
            ingredient: ingredient.name,
            ingredientId: ingredient.id,
          };

          // Add formula percentage - find column by formulaId
          const formulaColumn = columns.find(
            (col) => col.formulaId === formulaId
          );

          if (formulaColumn) {
            newRow[formulaColumn.id] = parsed.percentage;
          }

          return newRow;
        })
        .filter(Boolean);

      setTableData((prevData) => [...prevData, ...newRows]);
    },
    [formulas, ingredients, columns, setTableData]
  );

  // Combine workspace formulas with available formulas for lookup
  // This ensures formulas from other workspaces can be found
  const allFormulas = useMemo(() => {
    const seen = new Set<string>();
    const combined: Formula[] = [];

    // Add workspace formulas first
    for (const formula of formulas) {
      if (!seen.has(formula.id)) {
        seen.add(formula.id);
        combined.push(formula);
      }
    }

    // Add available formulas (from other workspaces/global)
    for (const formula of availableFormulas) {
      if (!seen.has(formula.id)) {
        seen.add(formula.id);
        combined.push(formula);
      }
    }

    return combined;
  }, [formulas, availableFormulas]);

  // Use formula details hook
  const {
    isFormulaDetailsModalOpen,
    selectedFormula,
    isReadOnly,
    handleEditFormulaDetails,
    handleViewFormulaDetails,
    handleSaveFormula,
    handleCloseFormulaDetails,
  } = useFormulaDetails(allFormulas, handleUpdateFormula);

  // Use Excel upload hook
  const {
    isExcelUploadModalOpen,
    selectedFormulaId,
    availableIngredients,
    handleUploadExcel,
    handleUploadIngredients,
    handleCloseExcelUpload,
  } = useExcelUpload(formulas, ingredients, handleAddIngredientsToFormula);

  // Handle undo action
  const handleUndoAction = useCallback(() => {
    const previousState = workspaceHistory.undo();
    if (previousState) {
      // Restore the previous state
      setColumns(previousState.columns);
      setTableData(previousState.tableData);
      setFormulas(previousState.formulas);
      setAvailableFormulas(previousState.availableFormulas);

      // Restore dilution state
      if (previousState.dilutions) {
        dilutionState.restoreDilutions(previousState.dilutions);
      } else {
        dilutionState.clearAllDilutions();
      }

      // Emit undo state update
      eventBus.emit("undo-state-updated", {
        canUndo: workspaceHistory.canUndo(),
        count: workspaceHistory.getUndoCount(),
      });

      // Update formula selections count
      const formulaColumns = previousState.columns.filter(
        (col: Column) => col.group === "Formulas" && col.formulaId
      );
      const formulaIds = formulaColumns.map((col: Column) => col.formulaId!);
      setSelectedFormulaIds(formulaIds);

      toast.success("Action undone successfully");
    } else {
      toast.error("Nothing to undo");
    }
  }, [
    workspaceHistory,
    dilutionState,
    setColumns,
    setTableData,
    setFormulas,
    setAvailableFormulas,
    setSelectedFormulaIds,
  ]);

  // Wrapper for send action that uses the current active formula
  const handleToolbarSend = useCallback(() => {
    if (!editableFormula) {
      toast.error("Please select an active formula first");
      return;
    }
    handleSendForCompoundingFromMenu(editableFormula);
  }, [editableFormula, handleSendForCompoundingFromMenu]);

  // Handle export to Excel
  const handleExportToExcel = useCallback(() => {
    try {
      // Use getDisplayColumns directly without adding to dependencies
      // This is safe because getDisplayColumns is defined in the component
      const exportColumns = getDisplayColumns();
      const exportData_impl = getEmptyStateData(tableData, false); // Get all data, not empty state

      const fileName = editableFormula
        ? `formula-${editableFormula.replace(/\s+/g, "_")}-${
            new Date().toISOString().split("T")[0]
          }`
        : `formulation-${new Date().toISOString().split("T")[0]}`;

      exportData(
        {
          columns: exportColumns,
          data: exportData_impl,
          filename: fileName,
        },
        "excel"
      );
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData, editableFormula]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [formulasData, ingredientsData, attributesData] =
          await Promise.all([
            PegaService.getFormulas(),
            PegaService.getIngredients(),
            PegaService.getIngredientAttributes(),
          ]);
        setAvailableFormulas(formulasData);
        setIngredients(ingredientsData);
        setAttributes(attributesData);
        // Don't set formulas here - they should only be added when loaded as columns
        // setFormulas(formulasData);

        // Emit available formulas to header
        eventBus.emit("available-formulas-updated", { formulas: formulasData });

        // DO NOT auto-load formulas - let user select them manually
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  // Sync workspace data when active workspace changes (tab switch)
  useEffect(() => {
    console.log(
      "🔄 Workspace changed - restoring data for:",
      workspace.activeTabId
    );

    // Restore workspace data
    const wsData = workspace.activeWorkspace;
    setColumns(wsData.columns);
    setTableData(wsData.tableData);
    setFormulas(wsData.formulas);
    setSelectedFormulaIds(wsData.selectedFormulaIds);
    setEditableFormula(wsData.editableFormula || "");
    setSelectedAttributes(wsData.selectedAttributes);

    // Convert Formula[] to string[] for local state
    const formulaIds = wsData.selectedFormulas.map((f) => f.id);
    setSelectedFormulas(formulaIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace.activeTabId]);

  // Save workspace data whenever it changes
  useEffect(() => {
    console.log("💾 Saving workspace data...");

    // Convert string[] to Formula[] for workspace context
    const selectedFormulaObjects = formulas.filter((f) =>
      selectedFormulas.includes(f.id)
    );

    workspace.updateWorkspaceData({
      columns,
      tableData,
      formulas,
      selectedFormulaIds,
      editableFormula,
      selectedAttributes,
      selectedFormulas: selectedFormulaObjects,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columns,
    tableData,
    formulas,
    selectedFormulaIds,
    editableFormula,
    selectedAttributes,
    selectedFormulas,
  ]);

  // Sync selected formula IDs with LibraryPanel whenever they change
  useEffect(() => {
    console.log("🔄 selectedFormulaIds changed:", selectedFormulaIds);
    eventBus.emit("formula-selections-updated", {
      count: selectedFormulaIds.length,
      selectedIds: selectedFormulaIds,
    });
  }, [selectedFormulaIds]);

  // Sync selected ingredients with LibraryPanel whenever tableData changes
  useEffect(() => {
    const ingredientNames = tableData
      .filter((row) => !row.isTotal && !row.isFormula)
      .map((row) => row.description);
    eventBus.emit("work-area-updated", {
      ingredients: ingredientNames,
    });
  }, [tableData]);

  // Recalculate contribution costs when active formula changes
  useEffect(() => {
    if (!editableFormula) return;

    setTableData((prev) => {
      const updatedData = prev.map((row) => {
        // Skip total rows - they'll be recalculated
        if (row.isTotal) {
          return row;
        }

        // Calculate contribution cost based on active formula percentage
        const percentage = parseFloat(row[editableFormula]) || 0;
        const costPerKg = parseFloat(row.costKg) || 0;
        const contCost = (percentage * costPerKg) / 1000;

        return {
          ...row,
          contCost: parseFloat(contCost.toFixed(4)),
        };
      });

      // Recalculate totals after updating contribution costs
      return calculateTotals(updatedData, columns);
    });
  }, [editableFormula, setTableData, columns]);

  // Register event handlers for normalize and merge duplicates
  useEffect(() => {
    eventBus.on("normalize-formula", handleNormalize);
    eventBus.on("merge-duplicates", handleMergeDuplicates);

    // Listen for dilution changes to save state for undo
    const handleDilutionChanged = () => {
      ensureInitialStateSaved();
      // Use a longer delay to ensure dilution state has updated
      setTimeout(() => {
        // Access dilutionState directly here to get the current value, not from closure
        const currentDilutions = dilutionState.dilutions;
        workspaceHistory.push(
          {
            columns,
            tableData,
            formulas,
            availableFormulas,
            dilutions: currentDilutions,
          },
          "apply_dilution",
          "Applied dilution to ingredient"
        );
        eventBus.emit("undo-state-updated", {
          canUndo: workspaceHistory.canUndo(),
          count: workspaceHistory.getUndoCount(),
        });
      }, 100); // Longer delay to ensure React has updated dilution state
    };

    eventBus.on("dilution-changed", handleDilutionChanged);

    return () => {
      eventBus.off("normalize-formula", handleNormalize);
      eventBus.off("merge-duplicates", handleMergeDuplicates);
      eventBus.off("dilution-changed", handleDilutionChanged);
    };
  }, [
    handleNormalize,
    handleMergeDuplicates,
    ensureInitialStateSaved,
    columns,
    tableData,
    formulas,
    availableFormulas,
    dilutionState,
    workspaceHistory,
  ]);

  useEffect(() => {
    const handleIngredientClick = (data: {
      ingredient: Ingredient;
      insertAfterRowId?: string;
    }) => {
      // VALIDATION: Check if we have at least one formula (column or group row) before adding ingredients
      const hasFormulaColumns = columns.some(
        (col) => col.group === "Formulas" && col.formulaId
      );
      const hasFormulaGroupRows = tableData.some(
        (row) => row.isFormula && row.formulaId
      );

      if (!hasFormulaColumns && !hasFormulaGroupRows) {
        toast.error("Please add a formula first before adding ingredients", {
          duration: 3000,
        });
        return;
      }

      // Check if ingredient already exists in the work area
      const existingIngredient = tableData.find(
        (row) =>
          !row.isTotal &&
          !row.isFormula &&
          row.description === data.ingredient.name
      );

      if (existingIngredient) {
        toast.error(`${data.ingredient.name} is already in the work area`);
        return;
      }

      const newRow = {
        id: `ingredient_${Date.now()}`,
        description: data.ingredient.name,
        costKg: data.ingredient.price || 0,
        contCost: 0.0,
        isTotal: false,
        isFormula: false,
        status: data.ingredient.status,
        mac: data.ingredient.mac,
        ingredientId: data.ingredient.id,
      };

      // Ensure initial state is saved before first action
      ensureInitialStateSaved();

      setTableData((prev) => {
        // If this is the first ingredient, also add the total row
        if (prev.length === 0) {
          const totalRow = {
            id: "runningTotal",
            description: "Total",
            costKg: null,
            contCost: null,
            isTotal: true,
            totalType: "running",
          };
          return [newRow, totalRow];
        }

        // If insertAfterRowId is provided, insert after that specific row
        if (data.insertAfterRowId) {
          const insertIndex = prev.findIndex(
            (row) => row.id === data.insertAfterRowId
          );
          if (insertIndex !== -1) {
            return [
              ...prev.slice(0, insertIndex + 1),
              newRow,
              ...prev.slice(insertIndex + 1),
            ];
          }
        }

        // Default behavior: insert before the total row
        const totalIndex = prev.findIndex((row) => row.isTotal);
        if (totalIndex !== -1) {
          return [
            ...prev.slice(0, totalIndex),
            newRow,
            ...prev.slice(totalIndex),
          ];
        }
        return [...prev, newRow];
      });

      // Emit event to update selected ingredients in library
      const currentIngredients = tableData
        .filter((row) => !row.isTotal && !row.isFormula)
        .map((row) => row.description);
      eventBus.emit("work-area-updated", {
        ingredients: [...currentIngredients, data.ingredient.name],
      });

      // Show success toast
      toast.success(`Ingredient "${data.ingredient.name}" added to work area`);

      // Save state after action completes
      saveStateAfterAction(
        "add_ingredient",
        `Added ingredient: ${data.ingredient.name}`
      );
    };

    const handleFormulaSelected = (data: {
      formula: Formula;
      insertAfterRowId?: string;
    }) => {
      // REQUIREMENT 1: Check if there are any formula columns
      // Formulas can only be added if at least one formula column exists
      const hasFormulaColumns = columns.some(
        (col) => col.group === "Formulas" && col.formulaId
      );

      if (!hasFormulaColumns) {
        toast.error(
          "Please add a formula column first before selecting formulas from the library",
          { duration: 4000 }
        );
        return;
      }

      // Check if formula is already selected or being added (prevents race condition)
      if (
        selectedFormulaIds.includes(data.formula.id) ||
        pendingFormulaIds.current.has(data.formula.id)
      ) {
        toast.error(
          `Formula "${data.formula.name}" is already in the work area`
        );
        return;
      }

      // Mark this formula as being added (synchronous)
      pendingFormulaIds.current.add(data.formula.id);

      // Immediately update selected formula IDs to prevent race conditions on rapid clicks
      // The useEffect will handle emitting the event
      const newSelectedIds = [...selectedFormulaIds, data.formula.id];
      setSelectedFormulaIds(newSelectedIds);

      // Find or calculate formula cost per kg from ingredients
      let formulaCostPerKg = data.formula.costPerKg || 0;
      if (!formulaCostPerKg && data.formula.ingredients) {
        // Calculate from ingredients if not provided
        formulaCostPerKg = data.formula.ingredients.reduce((sum, ing) => {
          const ingredient = ingredients.find((i) => i.id === ing.ingredientId);
          const ingredientCost = ingredient?.price || 0;
          return sum + (ingredientCost * ing.percentage) / 100;
        }, 0);
      }

      // Create formula group row with default 100% percentage
      const formulaGroupRow = {
        id: `formula_group_${Date.now()}`,
        description: data.formula.name,
        costKg: formulaCostPerKg,
        contCost: 0.0,
        isTotal: false,
        isFormula: true,
        formulaId: data.formula.id,
        isExpanded: true, // Start expanded by default
        level: 0,
        percentage: 100, // Default to 100% of the formula
        status: data.formula.status,
      };

      // Ensure initial state is saved before first action
      ensureInitialStateSaved();

      // Add formula percentage to active formula column (100% default)
      const formulaColumns = columns.filter(
        (col) => col.group === "Formulas" && col.type === "number"
      );

      // If there's no active formula column yet, we need to add one first
      if (formulaColumns.length === 0) {
        // This formula is being added as the first column - don't set percentage yet
        formulaGroupRow[`temp_formula`] = 100;
      } else if (editableFormula) {
        // Set 100% in active formula column
        formulaGroupRow[editableFormula] = 100;
        // Calculate contribution cost: (percentage * cost/kg) / 1000
        formulaGroupRow.contCost = (100 * formulaCostPerKg) / 1000;
      }

      // Create ingredient rows for the formula
      const formulaIngredientRows = data.formula.ingredients.map(
        (ing, index) => {
          const ingredient = ingredients.find((i) => i.id === ing.ingredientId);
          const ingredientCostPerKg = ingredient?.price || 0;

          const rowData: any = {
            id: `formula_ing_${data.formula.id}_${index}`,
            description: ing.name,
            costKg: ingredientCostPerKg,
            contCost: 0.0,
            isTotal: false,
            isFormula: false,
            parentFormulaId: data.formula.id,
            level: 1,
            percentage: ing.percentage,
            status: ingredient?.status,
            mac: ingredient?.mac,
            ingredientId: ingredient?.id,
          };

          // Set ingredient values in formula columns
          formulaColumns.forEach((col) => {
            if (col.id === editableFormula) {
              // For active formula: ingredient percentage = (ingredient % in formula * formula % in column) / 100
              const ingredientPercentageInColumn = (ing.percentage * 100) / 100; // Since formula is 100%
              rowData[col.id] = parseFloat(
                ingredientPercentageInColumn.toFixed(2)
              );
              // Calculate contribution cost for ingredient
              rowData.contCost =
                (ingredientPercentageInColumn * ingredientCostPerKg) / 1000;
            } else {
              rowData[col.id] = 0;
            }
          });

          return rowData;
        }
      );

      setTableData((prev) => {
        let newData = [...prev];
        const formulaRowsToInsert = [formulaGroupRow, ...formulaIngredientRows];

        // If this is the first item, also add the total row
        if (prev.length === 0) {
          const totalRow = {
            id: "runningTotal",
            description: "Total",
            costKg: null,
            contCost: null,
            isTotal: true,
            totalType: "running",
          };
          newData = [...formulaRowsToInsert, totalRow];
        } else if (data.insertAfterRowId) {
          // Insert after specific row if provided
          const insertIndex = prev.findIndex(
            (row) => row.id === data.insertAfterRowId
          );
          if (insertIndex !== -1) {
            newData = [
              ...prev.slice(0, insertIndex + 1),
              ...formulaRowsToInsert,
              ...prev.slice(insertIndex + 1),
            ];
          } else {
            // Fallback to default behavior if row not found
            const totalIndex = prev.findIndex((row) => row.isTotal);
            if (totalIndex !== -1) {
              newData = [
                ...prev.slice(0, totalIndex),
                ...formulaRowsToInsert,
                ...prev.slice(totalIndex),
              ];
            } else {
              newData = [...prev, ...formulaRowsToInsert];
            }
          }
        } else {
          // Default behavior: insert before total row
          const totalIndex = prev.findIndex((row) => row.isTotal);
          if (totalIndex !== -1) {
            newData = [
              ...prev.slice(0, totalIndex),
              ...formulaRowsToInsert,
              ...prev.slice(totalIndex),
            ];
          } else {
            newData = [...prev, ...formulaRowsToInsert];
          }
        }

        // Recalculate totals
        return calculateTotals(newData, columns);
      });

      // Show success toast
      toast.success(`Formula "${data.formula.name}" added to work area`);

      // Save state after action completes
      saveStateAfterAction(
        "add_formula_group",
        `Added formula group: ${data.formula.name}`
      );
    };

    // Add handler for expand/collapse toggle
    const handleToggleFormulaExpansion = (formulaId: string) => {
      setTableData((prev) =>
        prev.map((row) =>
          row.formulaId === formulaId && row.isFormula
            ? { ...row, isExpanded: !row.isExpanded }
            : row
        )
      );
    };

    const handleAttributeSelected = (data: {
      attribute: IngredientAttribute;
    }) => {
      // VALIDATION: Check if we have at least one formula (column or group row) before adding attributes
      const hasFormulaColumns = columns.some(
        (col) => col.group === "Formulas" && col.formulaId
      );
      const hasFormulaGroupRows = tableData.some(
        (row) => row.isFormula && row.formulaId
      );

      if (!hasFormulaColumns && !hasFormulaGroupRows) {
        toast.error("Please add a formula first before adding attributes", {
          duration: 3000,
        });
        return;
      }

      const newColumnId = `attr_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const newColumn: Column = {
        id: newColumnId,
        key: newColumnId,
        title: data.attribute.name,
        attributeId: data.attribute.id,
        type: data.attribute.type === "number" ? "number" : "text",
        sortable: true,
        editable: false,
        group: "Attributes",
        width: 120,
      };

      // Ensure initial state is saved before first action
      ensureInitialStateSaved();

      setColumns((prev) => {
        const attributeAddIndex = prev.findIndex(
          (col) => col.id === "attributeAdd"
        );
        if (attributeAddIndex !== -1) {
          return [
            ...prev.slice(0, attributeAddIndex),
            newColumn,
            ...prev.slice(attributeAddIndex),
          ];
        }
        return [...prev, newColumn];
      });

      setTableData((prev) =>
        prev.map((row) => {
          if (row.isTotal) {
            return { ...row, [newColumnId]: null };
          }

          // Generate sample data based on attribute type
          let sampleValue;
          switch (data.attribute.type) {
            case "number":
              // Generate realistic values based on attribute
              if (data.attribute.id === "ATTR006")
                sampleValue = Math.floor(Math.random() * 10) + 1; // MAC
              else if (data.attribute.id === "ATTR011")
                sampleValue = Math.floor(Math.random() * 100) + 10; // Price
              else if (data.attribute.id === "ATTR016")
                sampleValue = Math.floor(Math.random() * 500) + 50;
              // Molecular Weight
              else if (data.attribute.id === "ATTR017")
                sampleValue = Math.floor(Math.random() * 200) + 100;
              // Boiling Point
              else if (data.attribute.id === "ATTR018")
                sampleValue = Math.floor(Math.random() * 100) - 20;
              // Melting Point
              else if (data.attribute.id === "ATTR019")
                sampleValue = (Math.random() * 2 + 0.5).toFixed(2); // Density
              else if (data.attribute.id === "ATTR020")
                sampleValue = (Math.random() * 0.5 + 1.3).toFixed(3);
              // Refractive Index
              else if (data.attribute.id === "ATTR021")
                sampleValue = Math.floor(Math.random() * 150) + 50;
              // Flash Point
              else if (data.attribute.id === "ATTR025")
                sampleValue = Math.floor(Math.random() * 36) + 12; // Shelf Life
              else if (data.attribute.id === "ATTR026")
                sampleValue = (Math.random() * 50 + 1).toFixed(1); // Viscosity
              else if (data.attribute.id === "ATTR027")
                sampleValue = (Math.random() * 8 + 3).toFixed(1); // pH
              else if (data.attribute.id === "ATTR028")
                sampleValue = Math.floor(Math.random() * 1000) + 10;
              // Solubility
              else if (data.attribute.id === "ATTR029")
                sampleValue = (Math.random() * 100).toFixed(2);
              // Vapor Pressure
              else if (data.attribute.id === "ATTR030")
                sampleValue = (Math.random() * 50 + 20).toFixed(1);
              // Surface Tension
              else if (data.attribute.id === "ATTR031")
                sampleValue = (Math.random() * 2).toFixed(3);
              // Thermal Conductivity
              else if (data.attribute.id === "ATTR032")
                sampleValue = (Math.random() * 3 + 1).toFixed(2);
              // Specific Heat
              else if (data.attribute.id === "ATTR033")
                sampleValue = (Math.random() * 50 + 2).toFixed(1);
              // Dielectric Constant
              else if (data.attribute.id === "ATTR034")
                sampleValue = Math.floor(Math.random() * 20) + 1;
              // Concentration Limit
              else if (data.attribute.id === "ATTR035")
                sampleValue = Math.floor(Math.random() * 10) + 90; // Purity
              else sampleValue = Math.floor(Math.random() * 100) + 1;
              break;
            case "boolean":
              sampleValue = Math.random() > 0.5 ? "Yes" : "No";
              break;
            case "select":
              const options = data.attribute.values || [
                "Option A",
                "Option B",
                "Option C",
              ];
              sampleValue = options[Math.floor(Math.random() * options.length)];
              break;
            default:
              sampleValue = `Sample ${data.attribute.name}`;
          }

          return { ...row, [newColumnId]: sampleValue };
        })
      );

      // Update selected attributes list and emit to library
      const currentAttributeColumns = columns.filter(
        (col) => col.group === "Attributes" && col.attributeId
      );
      const newSelectedAttributes = [
        ...currentAttributeColumns.map((col) => col.attributeId!),
        data.attribute.id,
      ];
      eventBus.emit("work-area-attributes-updated", {
        selectedAttributes: newSelectedAttributes,
      });

      // Save state after action completes
      saveStateAfterAction(
        "add_attribute",
        `Added attribute: ${data.attribute.name}`
      );
    };

    const handleAttributeDeselected = (data: { attributeId: string }) => {
      // Find and remove the attribute column
      const columnToRemove = columns.find(
        (col) => col.attributeId === data.attributeId
      );
      if (columnToRemove) {
        setColumns((prev) =>
          prev.filter((col) => col.id !== columnToRemove.id)
        );
        setTableData((prev) =>
          prev.map((row) => {
            const { [columnToRemove.id]: deleted, ...rest } = row;
            return rest;
          })
        );

        // Update selected attributes list and emit to library
        const remainingAttributeColumns = columns.filter(
          (col) =>
            col.group === "Attributes" &&
            col.attributeId &&
            col.attributeId !== data.attributeId
        );
        const newSelectedAttributes = remainingAttributeColumns.map(
          (col) => col.attributeId!
        );
        eventBus.emit("work-area-attributes-updated", {
          selectedAttributes: newSelectedAttributes,
        });
      }
    };

    const handleCreateFormula = () => {
      // Generate proper formula ID using centralized utility
      const newFormulaId = generateNewFormulaId({
        existingFormulas: availableFormulas,
      });

      const newFormula: Formula = {
        id: newFormulaId,
        name: `New Formula ${Date.now()}`,
        version: "v1",
        status: "draft",
        createdBy: "Current User",
        lastUpdated: new Date().toISOString().split("T")[0],
        category: "Eau de Toilette",
        totalPercentage: 0,
        ingredients: [],
        notes: {
          top: [],
          middle: [],
          base: [],
        },
        description: "New formula created in workspace",
      };

      setActiveFormula(newFormula);
    };

    const handleLoadFormula = () => {
      setShowFormulaSelector(true);
    };

    const handleNewFormulaCreated = (data: { formula: Formula }) => {
      // Check if we've reached the maximum number of formula columns
      const currentFormulaColumns = columns.filter(
        (col) => col.group === "Formulas" && col.formulaId
      );
      if (currentFormulaColumns.length >= maxFormulaSelections) {
        console.log("Maximum number of formula columns reached");
        return;
      }

      // Ensure initial state is saved before first action
      ensureInitialStateSaved();

      const newColumnId = `formula_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Get the display ID (type-specific ID to show in header)
      const displayId =
        data.formula.perfumerFormulaId ||
        data.formula.baseFormulaId ||
        data.formula.dilutionFormulaId ||
        data.formula.analyticalFormulaId ||
        data.formula.id;

      const newColumn: Column = {
        id: newColumnId,
        key: newColumnId,
        title: data.formula.name,
        formulaId: data.formula.id, // Universal ID
        formulaDisplayId: displayId, // Type-specific display ID
        type: "number",
        sortable: true,
        editable: true,
        group: "Formulas",
        width: 120,
      };

      setColumns((prev) => {
        const formulaAddIndex = prev.findIndex(
          (col) => col.id === "formulaAdd"
        );
        if (formulaAddIndex !== -1) {
          return [
            ...prev.slice(0, formulaAddIndex),
            newColumn,
            ...prev.slice(formulaAddIndex),
          ];
        }
        return [...prev, newColumn];
      });

      setTableData((prev) => {
        const updatedData = prev.map((row) => {
          if (row.isTotal) {
            return { ...row, [newColumnId]: null };
          }
          return { ...row, [newColumnId]: 0 }; // Start with 0 for new formulas
        });

        return calculateTotals(updatedData, columns);
      });

      // If this is the first formula column, automatically activate it (only if owned or draft)
      if (currentFormulaColumns.length === 0) {
        const isFormulaOwned = isOwnFormula(data.formula.id);
        const isDraft = data.formula.status === "draft";

        if (isFormulaOwned || isDraft) {
          setEditableFormula(newColumnId);
          eventBus.emit("active-formula-changed", { formula: data.formula });

          // Immediately trigger totals calculation for the new active formula
          setTimeout(() => {
            setTableData((prev) =>
              calculateTotals(prev, columns, [newColumnId])
            );
          }, 0);
        }
      }

      // Add the formula to the available formulas list
      setFormulas((prev) => [...prev, data.formula]);
      const updatedFormulas = [...availableFormulas, data.formula];
      setAvailableFormulas(updatedFormulas);

      // Emit event outside of setState to avoid React warning
      eventBus.emit("available-formulas-updated", {
        formulas: updatedFormulas,
      });

      // REQUIREMENT 2: Track formula added as column - add to selectedFormulaIds
      // The useEffect at line 144 will emit the event automatically
      setSelectedFormulaIds((prev) => [...prev, data.formula.id]);

      // Save state after action completes
      saveStateAfterAction(
        "add_formula",
        `Added formula: ${data.formula.name}`
      );
    };

    const handleFormulaSelectedForColumn = (data: { formula: Formula }) => {
      // Check if we've reached the maximum number of formula columns
      const currentFormulaColumns = columns.filter(
        (col) => col.group === "Formulas" && col.formulaId
      );
      if (currentFormulaColumns.length >= maxFormulaSelections) {
        console.log("Maximum number of formula columns reached");
        return;
      }

      // Ensure initial state is saved before first action
      ensureInitialStateSaved();

      const newColumnId = `formula_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Get the display ID (type-specific ID to show in header)
      const displayId =
        data.formula.perfumerFormulaId ||
        data.formula.baseFormulaId ||
        data.formula.dilutionFormulaId ||
        data.formula.analyticalFormulaId ||
        data.formula.id;

      const newColumn: Column = {
        id: newColumnId,
        key: newColumnId,
        title: data.formula.name,
        formulaId: data.formula.id, // Universal ID
        formulaDisplayId: displayId, // Type-specific display ID
        type: "number",
        sortable: true,
        editable: true,
        group: "Formulas",
        width: 120,
      };

      setColumns((prev) => {
        const formulaAddIndex = prev.findIndex(
          (col) => col.id === "formulaAdd"
        );
        if (formulaAddIndex !== -1) {
          return [
            ...prev.slice(0, formulaAddIndex),
            newColumn,
            ...prev.slice(formulaAddIndex),
          ];
        }
        return [...prev, newColumn];
      });

      // Calculate formula cost per kg
      let formulaCostPerKg = data.formula.costPerKg || 0;
      if (!formulaCostPerKg && data.formula.ingredients) {
        formulaCostPerKg = data.formula.ingredients.reduce((sum, ing) => {
          const ingredient = ingredients.find((i) => i.id === ing.ingredientId);
          const ingredientCost = ingredient?.price || 0;
          return sum + (ingredientCost * ing.percentage) / 100;
        }, 0);
      }

      setTableData((prev) => {
        // Check if this is the first formula column being added
        const isFirstColumn = currentFormulaColumns.length === 0;
        const hasExistingData = prev.some((row) => !row.isTotal);

        // If this is the first formula and we don't have ingredients yet, add them
        if (isFirstColumn && !hasExistingData && data.formula.ingredients) {
          // Create ingredient rows from the formula
          const ingredientRows = data.formula.ingredients.map((ing, index) => {
            const ingredient = ingredients.find(
              (i) => i.id === ing.ingredientId
            );
            const ingredientCostPerKg = ingredient?.price || 0;

            const rowData: any = {
              id: `formula_ing_${data.formula.id}_${index}`,
              description: ing.name,
              costKg: ingredientCostPerKg,
              contCost: (ing.percentage * ingredientCostPerKg) / 1000,
              isTotal: false,
              isFormula: false,
              percentage: ing.percentage,
              [newColumnId]: ing.percentage,
            };

            return rowData;
          });

          // Create total row
          const totalRow = {
            id: "runningTotal",
            description: "Total",
            costKg: null,
            contCost: null,
            isTotal: true,
            totalType: "running",
            [newColumnId]: null,
          };

          const updatedData = [...ingredientRows, totalRow];
          return calculateTotals(updatedData, [newColumn]);
        } else if (!hasExistingData && data.formula.ingredients) {
          // If we have other columns but no data yet, still add ingredients
          const ingredientRows = data.formula.ingredients.map((ing, index) => {
            const ingredient = ingredients.find(
              (i) => i.id === ing.ingredientId
            );
            const ingredientCostPerKg = ingredient?.price || 0;

            const rowData: any = {
              id: `formula_ing_${data.formula.id}_${index}`,
              description: ing.name,
              costKg: ingredientCostPerKg,
              contCost: (ing.percentage * ingredientCostPerKg) / 1000,
              isTotal: false,
              isFormula: false,
              percentage: ing.percentage,
            };

            // Add 0 for other formula columns
            currentFormulaColumns.forEach((col) => {
              rowData[col.id] = 0;
            });

            // Set the percentage for the new column
            rowData[newColumnId] = ing.percentage;

            return rowData;
          });

          // Add the new column data to existing rows
          const updatedData = prev.map((row) => {
            if (row.isTotal) {
              return { ...row, [newColumnId]: null };
            }
            return { ...row, [newColumnId]: 0 };
          });

          // Insert ingredient rows before total rows
          const totalIndex = updatedData.findIndex((row) => row.isTotal);
          if (totalIndex !== -1) {
            const finalData = [
              ...updatedData.slice(0, totalIndex),
              ...ingredientRows,
              ...updatedData.slice(totalIndex),
            ];
            return calculateTotals(finalData, columns.concat(newColumn));
          }

          return calculateTotals(
            [...updatedData, ...ingredientRows],
            columns.concat(newColumn)
          );
        } else if (data.formula.ingredients) {
          // We have existing data - add new formula's ingredients and merge with existing rows
          const newIngredientRows = data.formula.ingredients.map(
            (ing, index) => {
              const ingredient = ingredients.find(
                (i) => i.id === ing.ingredientId
              );
              const ingredientCostPerKg = ingredient?.price || 0;

              const rowData: any = {
                id: `formula_ing_${data.formula.id}_${index}`,
                description: ing.name,
                costKg: ingredientCostPerKg,
                contCost: (ing.percentage * ingredientCostPerKg) / 1000,
                isTotal: false,
                isFormula: false,
                percentage: ing.percentage,
              };

              // Add 0 for all existing formula columns
              currentFormulaColumns.forEach((col) => {
                rowData[col.id] = 0;
              });

              // Set the percentage for the new column
              rowData[newColumnId] = ing.percentage;

              return rowData;
            }
          );

          // Separate existing rows into ingredients and totals
          const existingIngredientRows = prev.filter((row) => !row.isTotal);
          const existingTotalRows = prev.filter((row) => row.isTotal);

          // Add new column to all existing rows
          const updatedExistingIngredients = existingIngredientRows.map(
            (row) => ({
              ...row,
              [newColumnId]: 0,
            })
          );

          const updatedTotalRows = existingTotalRows.map((row) => ({
            ...row,
            [newColumnId]: null,
          }));

          // Merge new ingredients with existing ones
          // Check if ingredients already exist by description (case-insensitive)
          const mergedIngredients: any[] = [...updatedExistingIngredients];

          newIngredientRows.forEach((newRow) => {
            const existingRowIndex = mergedIngredients.findIndex(
              (existing) =>
                existing.description.toLowerCase().trim() ===
                newRow.description.toLowerCase().trim()
            );

            if (existingRowIndex !== -1) {
              // Ingredient already exists - update the new column value
              mergedIngredients[existingRowIndex] = {
                ...mergedIngredients[existingRowIndex],
                [newColumnId]: newRow[newColumnId],
              };
            } else {
              // New ingredient - add it to the list
              mergedIngredients.push(newRow);
            }
          });

          // Combine ingredients and totals
          const finalData = [...mergedIngredients, ...updatedTotalRows];
          return calculateTotals(finalData, columns.concat(newColumn));
        } else {
          // No ingredients in formula - just add the new column with 0 values
          const updatedData = prev.map((row) => {
            if (row.isTotal) {
              return { ...row, [newColumnId]: null };
            }
            return { ...row, [newColumnId]: 0 };
          });

          return calculateTotals(updatedData, columns.concat(newColumn));
        }
      });

      // REQUIREMENT 2: Track formula added as column from library - add to selectedFormulaIds
      // The useEffect at line 144 will emit the event automatically
      setSelectedFormulaIds((prev) => [...prev, data.formula.id]);

      // Add formula to workspace formulas array
      setFormulas((prev) => {
        // Check if formula already exists in workspace
        if (prev.some((f) => f.id === data.formula.id)) {
          return prev;
        }
        return [...prev, data.formula];
      });

      // If this is the first formula column, automatically activate it (only if owned or draft)
      if (currentFormulaColumns.length === 0) {
        const isFormulaOwned = isOwnFormula(data.formula.id);
        const isDraft = data.formula.status === "draft";

        if (isFormulaOwned || isDraft) {
          setEditableFormula(newColumnId);
          eventBus.emit("active-formula-changed", { formula: data.formula });

          // Immediately trigger totals calculation for the new active formula
          setTimeout(() => {
            setTableData((prev) =>
              calculateTotals(prev, columns, [newColumnId])
            );
          }, 0);
        }
      }

      // Show success toast
      toast.success(
        `Formula "${data.formula.name}" added with ${
          data.formula.ingredients?.length || 0
        } ingredients`
      );

      // Save state after action completes
      saveStateAfterAction(
        "add_formula",
        `Added formula: ${data.formula.name}`
      );

      // Emit event to update selected ingredients in library after state update
      // Note: The useEffect at line 151 already handles this automatically when tableData changes
      // No need for manual emission here
    };

    eventBus.on("ingredient-selected", handleIngredientClick);
    eventBus.on("formula-selected", handleFormulaSelected);
    eventBus.on("attribute-selected", handleAttributeSelected);
    eventBus.on("attribute-deselected", handleAttributeDeselected);
    eventBus.on("create-formula", handleCreateFormula);
    eventBus.on("load-formula", handleLoadFormula);
    eventBus.on("new-formula-created", handleNewFormulaCreated);
    eventBus.on("formula-selected-for-column", handleFormulaSelectedForColumn);
    eventBus.on("undo-action", handleUndoAction);
    eventBus.on("undo-state-updated", (data) => {
      setUndoState({
        canUndo: data.canUndo,
        undoCount: data.count,
      });
    });

    return () => {
      eventBus.off("ingredient-selected", handleIngredientClick);
      eventBus.off("formula-selected", handleFormulaSelected);
      eventBus.off("attribute-selected", handleAttributeSelected);
      eventBus.off("attribute-deselected", handleAttributeDeselected);
      eventBus.off("create-formula", handleCreateFormula);
      eventBus.off("load-formula", handleLoadFormula);
      eventBus.off("new-formula-created", handleNewFormulaCreated);
      eventBus.off(
        "formula-selected-for-column",
        handleFormulaSelectedForColumn
      );
      eventBus.off("undo-action", handleUndoAction);
      eventBus.off("undo-state-updated", (data) => {
        setUndoState({
          canUndo: data.canUndo,
          undoCount: data.count,
        });
      });
    };
  }, [
    handleUndoAction,
    ensureInitialStateSaved,
    saveStateAfterAction,
    columns,
    tableData,
    selectedFormulaIds,
    editableFormula,
    ingredients,
    formulas,
    availableFormulas,
    maxFormulaSelections,
    pendingFormulaIds,
    setTableData,
    setColumns,
    setSelectedFormulaIds,
    setFormulas,
    setAvailableFormulas,
    setEditableFormula,
    setShowFormulaSelector,
    setActiveFormula,
  ]);

  // Monitor active formula metrics and emit updates to header
  useEffect(() => {
    if (editableFormula && tableData.length > 0) {
      const ingredientRows = tableData.filter(
        (row) => !row.isTotal && !row.isFormula
      );
      const lineCount = ingredientRows.filter((row) => {
        const value = parseFloat(row[editableFormula]) || 0;
        return value > 0;
      }).length;

      // Calculate target cost (sum of all percentages in active formula)
      const totalRow = tableData.find(
        (row) => row.isTotal && row.totalType === "running"
      );
      const targetCost = totalRow
        ? parseFloat(totalRow[editableFormula]) || 0
        : 0;

      // Calculate formula cost (RMC) for active formula: sum of (amount% × cost/kg) / 100
      const formulaCost = ingredientRows.reduce((sum, row) => {
        const amount = parseFloat(row[editableFormula]) || 0;
        const costPerKg = parseFloat(row.costKg) || 0;
        // Calculate contribution cost: (amount% × cost/kg) / 100
        return sum + (amount * costPerKg) / 100;
      }, 0);

      eventBus.emit("active-formula-metrics-updated", {
        lineCount,
        targetCost,
        formulaCost,
      });
    }
  }, [tableData, editableFormula]);

  // Workspace State Management - Save and Load
  useEffect(() => {
    // Handler to capture current workspace state
    const handleWorkspaceStateRequest = () => {
      const state = {
        // DataGrid Core State
        columns,
        tableData,

        // Formula State
        formulas,
        availableFormulas,
        selectedFormulas,
        selectedFormulaIds,
        editableFormula,
        activeFormulaId: editableFormula, // Map column ID to formula ID

        // Ingredient State
        ingredients,
        expandedIngredients: [], // TODO: Track expanded formula rows if needed

        // Attribute State
        attributes,
        selectedAttributes,

        // UI State
        groupedByColumn,
        filters: {}, // TODO: Add filter state if needed
        sortConfig: null, // TODO: Add sort state if needed

        // Metadata
        lastModified: new Date().toISOString(),
      };

      // Emit the captured state
      eventBus.emit("workspace-state-ready", { state });
      console.log("📦 Workspace state captured:", state);
    };

    // Handler to restore workspace state
    const handleWorkspaceStateLoad = ({ state }: { state: WorkspaceState }) => {
      console.log("📥 Loading workspace state:", state);

      try {
        // Restore DataGrid Core State
        if (state.columns) setColumns(state.columns as Column[]);
        if (state.tableData)
          setTableData(state.tableData as Record<string, unknown>[]);

        // Restore Formula State
        if (state.formulas) setFormulas(state.formulas as Formula[]);
        if (state.availableFormulas)
          setAvailableFormulas(state.availableFormulas as Formula[]);
        if (state.selectedFormulaIds)
          setSelectedFormulaIds(state.selectedFormulaIds);
        if (state.editableFormula !== undefined)
          setEditableFormula(state.editableFormula);

        // Restore Ingredient State
        if (state.ingredients)
          setIngredients(state.ingredients as Ingredient[]);

        // Restore Attribute State
        if (state.attributes)
          setAttributes(state.attributes as IngredientAttribute[]);
        if (state.selectedAttributes)
          setSelectedAttributes(state.selectedAttributes);

        // Restore UI State
        if (state.groupedByColumn !== undefined)
          setGroupedByColumn(state.groupedByColumn);

        // Emit events to sync with other components
        const ingredientsList = state.ingredients as Ingredient[];
        eventBus.emit("work-area-updated", {
          ingredients: ingredientsList?.map((ing) => ing.name) || [],
        });

        if (state.selectedAttributes) {
          eventBus.emit("work-area-attributes-updated", {
            selectedAttributes: state.selectedAttributes,
          });
        }

        if (state.selectedFormulaIds) {
          eventBus.emit("formula-selections-updated", {
            selectedFormulas: state.selectedFormulaIds,
          });
        }

        toast.success("Workspace loaded successfully!");
        console.log("✅ Workspace state restored");
      } catch (error) {
        console.error("❌ Error loading workspace state:", error);
        toast.error("Failed to load workspace state");
      }
    };

    // Register event listeners
    eventBus.on("request-workspace-state", handleWorkspaceStateRequest);
    eventBus.on("load-workspace-state", handleWorkspaceStateLoad);

    return () => {
      eventBus.off("request-workspace-state", handleWorkspaceStateRequest);
      eventBus.off("load-workspace-state", handleWorkspaceStateLoad);
    };
  }, [
    columns,
    tableData,
    formulas,
    availableFormulas,
    selectedFormulas,
    selectedFormulaIds,
    editableFormula,
    ingredients,
    attributes,
    selectedAttributes,
    groupedByColumn,
    setColumns,
    setTableData,
    setFormulas,
    setAvailableFormulas,
    setSelectedFormulas,
    setSelectedFormulaIds,
    setEditableFormula,
    setIngredients,
    setAttributes,
    setSelectedAttributes,
    setGroupedByColumn,
  ]);

  const handleLoadFormulaFromModal = (formula: Formula) => {
    // Load formula ingredients into the work area
    const formulaIngredients = formula.ingredients.map((ing, index) => ({
      id: `formula_ing_${index}`,
      description: ing.name,
      costKg: 0, // Price not available in FormulaIngredient
      contCost: 0.0,
      isTotal: false,
    }));

    const totalRow = {
      id: "runningTotal",
      description: "Total",
      costKg: null,
      contCost: null,
      isTotal: true,
      totalType: "running",
    };

    setTableData([...formulaIngredients, totalRow]);
    setActiveFormula(formula);
    setShowFormulaSelector(false);

    // Update selected ingredients in library
    const ingredientNames = formulaIngredients.map((ing) => ing.description);
    eventBus.emit("work-area-updated", { ingredients: ingredientNames });
  };

  const handleAddFormulaColumn = () => {
    // Check if we've reached the maximum number of formula columns
    const currentFormulaColumns = columns.filter(
      (col) => col.group === "Formulas" && col.formulaId
    );
    if (currentFormulaColumns.length >= maxFormulaSelections) {
      return; // Don't show modal if max reached
    }

    setShowFormulaModal(true);
  };

  const handleFormulaModalCreateFormula = (formula: Omit<Formula, "id">) => {
    // Generate proper formula ID using centralized utility
    const newFormulaId = generateNewFormulaId({
      existingFormulas: availableFormulas,
    });

    const newFormula: Formula = {
      ...formula,
      id: newFormulaId,
      version: "v1", // Ensure version is in correct format
    };

    // Emit event to add this formula as a new column in the work area
    // The event handler (handleNewFormulaCreated) will automatically add it to selectedFormulaIds
    eventBus.emit("new-formula-created", { formula: newFormula });

    // Close the modal
    setShowFormulaModal(false);
  };

  const handleFormulaModalSelectFormula = (formula: Formula) => {
    // Emit event to add this formula as a new column in the work area
    // The event handler (handleFormulaSelectedForColumn) will automatically add it to selectedFormulaIds
    eventBus.emit("formula-selected-for-column", { formula });

    // Close the modal
    setShowFormulaModal(false);
  };

  // Modified handleAddAttributeColumn with max selection logic
  const handleAddAttributeColumn = () => {
    // Check if we've reached the maximum number of attribute columns
    const currentAttributeColumns = columns.filter(
      (col) => col.group === "Attributes" && col.attributeId
    );
    if (currentAttributeColumns.length >= maxAttributeSelections) {
      return; // Don't show modal if max reached
    }

    setSelectedAttributes([]);
    setShowAttributeDialog(true);
  };

  const handleAddAttributes = () => {
    const attributesToAdd = attributes.filter((a) =>
      selectedAttributes.includes(a.id)
    );

    // Ensure initial state is saved before first action
    if (attributesToAdd.length > 0) {
      ensureInitialStateSaved();
    }

    attributesToAdd.forEach((attribute) => {
      const newColumnId = `attr_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const newColumn: Column = {
        id: newColumnId,
        key: newColumnId,
        title: attribute.name,
        attributeId: attribute.id,
        type:
          attribute.type === "number"
            ? "number"
            : attribute.type === "select"
            ? "select"
            : "text",
        sortable: true,
        editable: false,
        group: "Attributes",
        width: 120,
        values: attribute.values, // Include values for select-type attributes
      };

      setColumns((prev) => {
        const attributeAddIndex = prev.findIndex(
          (col) => col.id === "attributeAdd"
        );
        if (attributeAddIndex !== -1) {
          return [
            ...prev.slice(0, attributeAddIndex),
            newColumn,
            ...prev.slice(attributeAddIndex),
          ];
        }
        return [...prev, newColumn];
      });

      setTableData((prev) =>
        prev.map((row) => {
          if (row.isTotal) {
            return { ...row, [newColumnId]: null };
          }

          // Generate sample data based on attribute type
          let sampleValue;
          switch (attribute.type) {
            case "number": {
              sampleValue = Math.floor(Math.random() * 10) + 1;
              break;
            }
            case "boolean": {
              sampleValue = Math.random() > 0.5 ? "Yes" : "No";
              break;
            }
            case "select": {
              const options = attribute.values || [
                "Option A",
                "Option B",
                "Option C",
              ];
              sampleValue = options[Math.floor(Math.random() * options.length)];
              break;
            }
            default: {
              sampleValue = `Sample ${attribute.name}`;
            }
          }

          return { ...row, [newColumnId]: sampleValue };
        })
      );
    });

    // Update selected attributes list and emit to library to sync
    // Get all attribute column IDs including the newly added ones
    setTimeout(() => {
      setColumns((currentColumns) => {
        const allAttributeColumns = currentColumns.filter(
          (col) => col.group === "Attributes" && col.attributeId
        );
        const allSelectedAttributeIds = allAttributeColumns.map(
          (col) => col.attributeId!
        );
        eventBus.emit("work-area-attributes-updated", {
          selectedAttributes: allSelectedAttributeIds,
        });
        return currentColumns;
      });

      // Save state after attributes are added
      if (attributesToAdd.length > 0) {
        saveStateAfterAction(
          "add_attributes_bulk",
          `Added ${attributesToAdd.length} attribute(s)`
        );
      }
    }, 100);

    setSelectedAttributes([]);
    setShowAttributeDialog(false);
  };

  // Add the missing handleToggleFormulaExpansion function
  const handleToggleFormulaExpansion = (formulaId: string) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.formulaId === formulaId && row.isFormula
          ? { ...row, isExpanded: !row.isExpanded }
          : row
      )
    );
  };

  // Row reordering handler
  const handleRowReorder = (rowOrder: string[]) => {
    // Ensure initial state is saved before first action
    ensureInitialStateSaved();

    setTableData((prev) => {
      // Separate total rows from regular rows
      const totalRows = prev.filter((row) => row.isTotal);
      const regularRows = prev.filter((row) => !row.isTotal);

      // Create a map for quick lookup
      const rowMap = new Map(regularRows.map((row) => [row.id, row]));

      // Reorder according to the new order
      const reorderedRows = rowOrder
        .map((id) => rowMap.get(id))
        .filter((row): row is NonNullable<typeof row> => row !== undefined);

      // Return reordered rows followed by total rows
      return [...reorderedRows, ...totalRows];
    });

    // Save state after action completes
    saveStateAfterAction("reorder_rows", "Reordered rows");
  };
  // Toggle grouping handler
  const handleToggleGrouping = (columnId: string) => {
    setGroupedByColumn((prev) => (prev === columnId ? null : columnId));
  };

  // Bulk delete handler
  const handleBulkDelete = (rowIds: string[]) => {
    console.log("🗑️ handleBulkDelete called with rowIds:", rowIds);

    // Ensure initial state is saved before first action
    ensureInitialStateSaved();

    setTableData((prev) => {
      const rowsToDelete = prev.filter((row) => rowIds.includes(row.id));
      console.log("📋 Rows being deleted:", rowsToDelete);

      // Check if any formula group rows are being deleted
      const deletedFormulaIds = rowsToDelete
        .filter((row) => row.isFormula && row.formulaId)
        .map((row) => row.formulaId);

      console.log("🔍 Deleted formula IDs:", deletedFormulaIds);

      // Remove deleted formulas from tracking
      if (deletedFormulaIds.length > 0) {
        deletedFormulaIds.forEach((id) => {
          pendingFormulaIds.current?.delete(id);
        });
        setSelectedFormulaIds((prev) =>
          prev.filter((id) => !deletedFormulaIds.includes(id))
        );
        console.log("✅ Removed formulas from tracking:", deletedFormulaIds);
      }

      // Also check if deleting ingredients that belong to formulas
      const deletedIngredients = rowsToDelete.filter(
        (row) => row.parentFormulaId
      );
      if (deletedIngredients.length > 0) {
        console.log(
          "📋 Deleted ingredients with parentFormulaId:",
          deletedIngredients
        );

        // For each formula, check if all its ingredients and group row are being deleted
        const affectedFormulaIds = new Set(
          deletedIngredients.map((row) => row.parentFormulaId)
        );
        const formulasToRemove: string[] = [];

        affectedFormulaIds.forEach((formulaId) => {
          const remainingRows = prev.filter(
            (row) =>
              !rowIds.includes(row.id) &&
              (row.formulaId === formulaId || row.parentFormulaId === formulaId)
          );

          // If no rows remain for this formula, remove it from tracking
          if (remainingRows.length === 0) {
            formulasToRemove.push(formulaId);
          }
        });

        if (formulasToRemove.length > 0) {
          console.log("✅ Formulas with all rows deleted:", formulasToRemove);
          formulasToRemove.forEach((id) => {
            pendingFormulaIds.current?.delete(id);
          });
          setSelectedFormulaIds((prev) =>
            prev.filter((id) => !formulasToRemove.includes(id))
          );
        }
      }

      // Also remove child ingredients of deleted formula groups
      const newData = prev.filter((row) => {
        // Keep rows that are not in the delete list
        if (!rowIds.includes(row.id)) {
          // But also remove child ingredients if their parent formula is being deleted
          if (
            row.parentFormulaId &&
            deletedFormulaIds.includes(row.parentFormulaId)
          ) {
            return false;
          }
          return true;
        }
        return false;
      });

      return newData;
    });

    // Save state after action completes
    saveStateAfterAction("bulk_delete", `Deleted ${rowIds.length} row(s)`);

    toast.success(
      `${rowIds.length} row${rowIds.length > 1 ? "s" : ""} deleted`
    );
  };

  // Check if we have any ingredient data to show
  const hasIngredients = tableData.some((row) => !row.isTotal);

  const handleSetActiveFormula = (columnId: string) => {
    // Find the formula associated with this column
    const column = columns.find((col) => col.id === columnId);

    // Check if formula is locked (not owned and not draft)
    if (column && column.formulaId) {
      const isFormulaOwned = isOwnFormula(column.formulaId);

      // Check if formula is in draft status
      const workspaceFormula = formulas.find((f) => f.id === column.formulaId);
      const availableFormula = availableFormulas.find(
        (f) => f.id === column.formulaId
      );
      const isDraft =
        workspaceFormula?.status === "draft" ||
        availableFormula?.status === "draft";

      // Prevent setting locked formulas as active
      if (!isFormulaOwned && !isDraft) {
        toast.error(
          "Cannot set locked formula as active. Create a new version to edit."
        );
        return;
      }
    }

    setEditableFormula(columnId);

    // Find the formula and emit to header
    if (column && column.formulaId) {
      const formula = formulas.find((f) => f.id === column.formulaId);
      if (formula) {
        eventBus.emit("active-formula-changed", { formula });

        // Calculate and emit line count and target cost for active formula
        const ingredientRows = tableData.filter(
          (row) => !row.isTotal && !row.isFormula
        );
        const lineCount = ingredientRows.filter((row) => {
          const value = parseFloat(row[columnId]) || 0;
          return value > 0;
        }).length;

        // Calculate target cost (sum of all percentages in active formula)
        const totalRow = tableData.find(
          (row) => row.isTotal && row.totalType === "running"
        );
        const targetCost = totalRow ? parseFloat(totalRow[columnId]) || 0 : 0;

        // Calculate formula cost (RMC) for active formula: sum of (amount% × cost/kg) / 100
        const formulaCost = ingredientRows.reduce((sum, row) => {
          const amount = parseFloat(row[columnId]) || 0;
          const costPerKg = parseFloat(row.costKg) || 0;
          // Calculate contribution cost: (amount% × cost/kg) / 100
          return sum + (amount * costPerKg) / 100;
        }, 0);

        eventBus.emit("active-formula-metrics-updated", {
          lineCount,
          targetCost,
          formulaCost,
        });
      }
    }
  };

  // Check if we should show the add column button for attributes
  const shouldShowAttributeAddButton = () => {
    const currentAttributeColumns = columns.filter(
      (col) => col.group === "Attributes" && col.attributeId
    );
    return currentAttributeColumns.length < maxAttributeSelections;
  };

  // Check if we should show the add column button for formulas
  const shouldShowFormulaAddButton = () => {
    const currentFormulaColumns = columns.filter(
      (col) => col.group === "Formulas" && col.formulaId
    );
    return currentFormulaColumns.length < maxFormulaSelections;
  };

  // Update columns to conditionally hide the add buttons
  const getDisplayColumns = () => {
    let displayColumns = [...columns];

    if (!shouldShowAttributeAddButton()) {
      displayColumns = displayColumns.filter(
        (col) => col.id !== "attributeAdd"
      );
    }

    if (!shouldShowFormulaAddButton()) {
      displayColumns = displayColumns.filter((col) => col.id !== "formulaAdd");
    }

    return displayColumns;
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Data Grid */}
      <div className="flex-1 overflow-hidden">
        <DataGrid
          columns={getDisplayColumns()}
          data={getEmptyStateData(tableData, hasIngredients)}
          formulas={formulas}
          availableFormulas={availableFormulas}
          ingredients={ingredients}
          libraryFormulas={availableFormulas}
          onAddColumn={(columnType) => {
            if (columnType === "formula") {
              handleAddFormulaColumn();
            } else if (columnType === "attribute") {
              handleAddAttributeColumn();
            }
          }}
          onAddFormula={handleAddFormulaColumn}
          onRowDelete={handleRowDelete}
          onBulkDelete={handleBulkDelete}
          onCellEdit={handleCellEdit}
          onDeleteColumn={handleDeleteColumn}
          onSetActiveFormula={handleSetActiveFormula}
          onCreateVersion={handleCreateVersion}
          onNormalizeFormula={handleNormalizeFromMenu}
          onSendForCompounding={handleSendForCompoundingFromMenu}
          onEditFormulaDetails={handleEditFormulaDetails}
          onViewFormulaDetails={handleViewFormulaDetails}
          onUploadExcel={handleUploadExcel}
          onExplodeFormula={handleExplodeFormula}
          onToggleFormulaExpansion={handleToggleFormulaExpansion}
          onColumnReorder={handleColumnReorder}
          onRowReorder={handleRowReorder}
          onToggleGrouping={handleToggleGrouping}
          groupedByColumn={groupedByColumn}
          editableFormula={editableFormula}
          className="h-full"
          showEmptyState={!hasIngredients}
          enableRowReordering={true}
          enableBulkSelection={true}
          dilutionState={dilutionState}
          // Toolbar actions
          onToolbarAddFormula={handleAddFormulaColumn}
          onToolbarMergeDuplicates={handleMergeDuplicates}
          onToolbarNormalize={handleNormalize}
          onToolbarSend={handleToolbarSend}
          onToolbarUndo={handleUndoAction}
          onToolbarExport={handleExportToExcel}
          toolbarCanUndo={undoState.canUndo}
          toolbarUndoCount={undoState.undoCount}
          toolbarCanSend={!!activeFormula}
        />
      </div>

      {/* Formula Modal */}
      <FormulaModal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        onCreateFormula={handleFormulaModalCreateFormula}
        onSelectFormula={handleFormulaModalSelectFormula}
        availableFormulas={availableFormulas}
        maxSelections={maxFormulaSelections}
        currentSelections={
          columns.filter((col) => col.group === "Formulas" && col.formulaId)
            .length
        }
        selectedFormulaIds={selectedFormulaIds} // Pass selected formula IDs
      />

      {/* Formula Details Modal */}
      <FormulaDetailsModal
        isOpen={isFormulaDetailsModalOpen}
        onClose={handleCloseFormulaDetails}
        formula={selectedFormula}
        isReadOnly={isReadOnly}
        onSave={handleSaveFormula}
      />

      {/* Excel Upload Modal */}
      <ExcelUploadModal
        isOpen={isExcelUploadModalOpen}
        onClose={handleCloseExcelUpload}
        onUpload={handleUploadIngredients}
        availableIngredients={availableIngredients}
      />

      {/* Load Formula Modal */}
      <Modal
        isOpen={showFormulaSelector}
        onClose={() => setShowFormulaSelector(false)}
        title="Load Formula"
        size="lg"
      >
        <div className="p-4 max-h-80 overflow-y-auto">
          <div className="space-y-2">
            {availableFormulas.map((formula) => (
              <div
                key={formula.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleLoadFormulaFromModal(formula)}
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {formula.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    v{formula.version} • {formula.category}
                  </div>
                </div>
                <Badge
                  variant={
                    formula.status === "active"
                      ? "success"
                      : formula.status === "draft"
                      ? "warning"
                      : "default"
                  }
                  size="sm"
                >
                  {formula.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Attribute Selection Dialog */}
      <Dialog
        isOpen={showAttributeDialog}
        onClose={() => {
          setSelectedAttributes([]);
          setShowAttributeDialog(false);
        }}
        title="Add Attribute Columns"
        size="xl"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedAttributes([]);
                setShowAttributeDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAttributes}
              disabled={selectedAttributes.length === 0}
            >
              Add {selectedAttributes.length} Attribute
              {selectedAttributes.length !== 1 ? "s" : ""}
            </Button>
          </>
        }
      >
        <AttributeSelector
          attributes={attributes}
          selectedIds={selectedAttributes}
          onSelectionChange={setSelectedAttributes}
          maxSelections={
            maxAttributeSelections -
            columns.filter(
              (col) => col.group === "Attributes" && col.attributeId
            ).length
          }
          highlightedIds={columns
            .filter((col) => col.group === "Attributes" && col.attributeId)
            .map((col) => col.attributeId!)}
        />
      </Dialog>
    </div>
  );
};

export default WorkArea;
