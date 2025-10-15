import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DataGrid from "../../components/DataGrid";
import type { Column } from "../../components/DataGrid";
import AttributeSelector from "../../components/AttributeSelector";
import Dialog from "../../components/Dialog";
import Modal from "../../components/Modal";
import FormulaModal from "../../components/FormulaModal";
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

const WorkArea = () => {
  // Use custom hooks for state management
  const state = useWorkAreaState();
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
      ingredients,
      setTableData,
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
        setFormulas(formulasData);

        // Emit available formulas to header
        eventBus.emit("available-formulas-updated", { formulas: formulasData });

        // DO NOT auto-load formulas - let user select them manually
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  // Sync selected formula IDs with LibraryPanel whenever they change
  useEffect(() => {
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
      return prev.map((row) => {
        // Skip total rows
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
    });
  }, [editableFormula, setTableData]);

  // Register event handlers for normalize and merge duplicates
  useEffect(() => {
    eventBus.on("normalize-formula", handleNormalize);
    eventBus.on("merge-duplicates", handleMergeDuplicates);

    return () => {
      eventBus.off("normalize-formula", handleNormalize);
      eventBus.off("merge-duplicates", handleMergeDuplicates);
    };
  }, [handleNormalize, handleMergeDuplicates]);

  useEffect(() => {
    const handleIngredientClick = (data: { ingredient: Ingredient }) => {
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
        id: `ing_${Date.now()}`,
        description: data.ingredient.name,
        costKg: data.ingredient.price || 0,
        contCost: 0.0,
        isTotal: false,
        isFormula: false,
      };

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
    };

    const handleFormulaSelected = (data: { formula: Formula }) => {
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
      };

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
          newData = [formulaGroupRow, ...formulaIngredientRows, totalRow];
        } else {
          const totalIndex = prev.findIndex((row) => row.isTotal);
          if (totalIndex !== -1) {
            newData = [
              ...prev.slice(0, totalIndex),
              formulaGroupRow,
              ...formulaIngredientRows,
              ...prev.slice(totalIndex),
            ];
          } else {
            newData = [...prev, formulaGroupRow, ...formulaIngredientRows];
          }
        }

        // Recalculate totals
        return calculateTotals(newData, columns);
      });

      // Show success toast
      toast.success(`Formula "${data.formula.name}" added to work area`);
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
      const newFormula: Formula = {
        id: `FORM${Date.now()}`,
        name: `New Formula ${Date.now()}`,
        version: "1.0",
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

      const newColumnId = `formula_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const newColumn: Column = {
        id: newColumnId,
        key: newColumnId,
        title: data.formula.name,
        formulaId: data.formula.id,
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

      // If this is the first formula column, automatically activate it
      if (currentFormulaColumns.length === 0) {
        setEditableFormula(newColumnId);
        eventBus.emit("active-formula-changed", { formula: data.formula });

        // Immediately trigger totals calculation for the new active formula
        setTimeout(() => {
          setTableData((prev) => calculateTotals(prev, columns, [newColumnId]));
        }, 0);
      }

      // Add the formula to the available formulas list
      setFormulas((prev) => [...prev, data.formula]);
      setAvailableFormulas((prev) => {
        const updated = [...prev, data.formula];
        eventBus.emit("available-formulas-updated", { formulas: updated });
        return updated;
      });

      // Note: Do NOT update selectedFormulaIds here - formulas added via popup
      // should not be highlighted in the library panel
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

      const newColumnId = `formula_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const newColumn: Column = {
        id: newColumnId,
        key: newColumnId,
        title: data.formula.name,
        formulaId: data.formula.id,
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

      // Note: Do NOT update selectedFormulaIds here - formulas added via popup
      // should not be highlighted in the library panel

      // If this is the first formula column, automatically activate it
      if (currentFormulaColumns.length === 0) {
        setEditableFormula(newColumnId);
        eventBus.emit("active-formula-changed", { formula: data.formula });

        // Immediately trigger totals calculation for the new active formula
        setTimeout(() => {
          setTableData((prev) => calculateTotals(prev, columns, [newColumnId]));
        }, 0);
      }

      // Show success toast
      toast.success(
        `Formula "${data.formula.name}" added with ${
          data.formula.ingredients?.length || 0
        } ingredients`
      );

      // Emit event to update selected ingredients in library after state update
      setTimeout(() => {
        setTableData((current) => {
          const allIngredients = current
            .filter((row) => !row.isTotal && !row.isFormula)
            .map((row) => row.description);

          if (allIngredients.length > 0) {
            eventBus.emit("work-area-updated", { ingredients: allIngredients });
          }

          return current;
        });
      }, 0);
    };

    eventBus.on("ingredient-selected", handleIngredientClick);
    eventBus.on("formula-selected", handleFormulaSelected);
    eventBus.on("attribute-selected", handleAttributeSelected);
    eventBus.on("attribute-deselected", handleAttributeDeselected);
    eventBus.on("create-formula", handleCreateFormula);
    eventBus.on("load-formula", handleLoadFormula);
    eventBus.on("new-formula-created", handleNewFormulaCreated);
    eventBus.on("formula-selected-for-column", handleFormulaSelectedForColumn);

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
    };
  }, [
    columns,
    tableData,
    selectedFormulaIds,
    editableFormula,
    ingredients,
    formulas,
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
    const newFormula: Formula = {
      ...formula,
      id: `FORM${Date.now()}`,
    };

    // Emit event to add this formula as a new column in the work area
    eventBus.emit("new-formula-created", { formula: newFormula });

    // Update selectedFormulaIds to show it as selected in the modal
    setSelectedFormulaIds((prev) => [...prev, newFormula.id]);
  };

  const handleFormulaModalSelectFormula = (formula: Formula) => {
    // Emit event to add this formula as a new column in the work area
    eventBus.emit("formula-selected-for-column", { formula });

    // Update selectedFormulaIds to show it as selected in the modal
    setSelectedFormulaIds((prev) => [...prev, formula.id]);
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
  };

  // Save view handler
  const handleSaveView = (viewName: string) => {
    toast.success(`View "${viewName}" saved successfully`);
  };

  // Toggle grouping handler
  const handleToggleGrouping = (columnId: string) => {
    setGroupedByColumn((prev) => (prev === columnId ? null : columnId));
  };

  // Load view handler
  const handleLoadView = (viewId: string) => {
    toast.success(`View loaded successfully`);
  };

  // Bulk delete handler
  const handleBulkDelete = (rowIds: string[]) => {
    setTableData((prev) => prev.filter((row) => !rowIds.includes(row.id)));
    toast.success(
      `${rowIds.length} row${rowIds.length > 1 ? "s" : ""} deleted`
    );
  };

  // Check if we have any ingredient data to show
  const hasIngredients = tableData.some((row) => !row.isTotal);

  const handleSetActiveFormula = (columnId: string) => {
    setEditableFormula(columnId);

    // Find the formula associated with this column and emit to header
    const column = columns.find((col) => col.id === columnId);
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
          onAddColumn={(columnType) => {
            if (columnType === "formula") {
              handleAddFormulaColumn();
            } else if (columnType === "attribute") {
              handleAddAttributeColumn();
            }
          }}
          onRowDelete={handleRowDelete}
          onBulkDelete={handleBulkDelete}
          onCellEdit={handleCellEdit}
          onDeleteColumn={handleDeleteColumn}
          onSetActiveFormula={handleSetActiveFormula}
          onCreateVersion={handleCreateVersion}
          onNormalizeFormula={handleNormalizeFromMenu}
          onSendForCompounding={handleSendForCompoundingFromMenu}
          onExplodeFormula={handleExplodeFormula}
          onToggleFormulaExpansion={handleToggleFormulaExpansion}
          onColumnReorder={handleColumnReorder}
          onRowReorder={handleRowReorder}
          onSaveView={handleSaveView}
          onLoadView={handleLoadView}
          onToggleGrouping={handleToggleGrouping}
          groupedByColumn={groupedByColumn}
          editableFormula={editableFormula}
          className="h-full"
          showEmptyState={!hasIngredients}
          enableRowReordering={true}
          enableSavedViews={true}
          enableBulkSelection={true}
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
