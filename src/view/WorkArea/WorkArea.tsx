import { useState, useEffect, useRef } from "react";
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

const WorkArea = () => {
  const [activeFormula, setActiveFormula] = useState<Formula | null>(null);
  const [availableFormulas, setAvailableFormulas] = useState<Formula[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [attributes, setAttributes] = useState<IngredientAttribute[]>([]);
  const [showFormulaSelector, setShowFormulaSelector] = useState(false);
  const formulasAutoLoadedRef = useRef(false); // Use ref instead of state to prevent StrictMode duplicates
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [selectedFormulas, setSelectedFormulas] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [editableFormula, setEditableFormula] = useState<string>("");
  const [maxAttributeSelections] = useState(5); // Configurable later
  const [maxFormulaSelections] = useState(4); // Configurable later
  const [selectedFormulaIds, setSelectedFormulaIds] = useState<string[]>([]); // Track selected formula IDs
  const pendingFormulaIds = useRef<Set<string>>(new Set()); // Track in-flight additions synchronously

  // Initialize default columns but empty data
  useEffect(() => {
    const defaultColumns: Column[] = [
      {
        id: "description",
        key: "description",
        title: "Description",
        type: "text",
        sortable: true,
        editable: false,
        fixed: true,
        width: 200,
        minWidth: 150,
      },
      {
        id: "formulaAdd",
        key: "formulaAdd",
        title: "",
        type: "add-column",
        group: "Formulas",
        width: 40,
        fixed: false,
      },
      {
        id: "costKg",
        key: "costKg",
        title: "Cost/kg",
        type: "number",
        sortable: true,
        editable: false,
        group: "Cost",
        width: 100,
      },
      {
        id: "contCost",
        key: "contCost",
        title: "Cont. Cost",
        type: "number",
        sortable: true,
        editable: false,
        group: "Cost",
        width: 100,
      },
      {
        id: "attributeAdd",
        key: "attributeAdd",
        title: "",
        type: "add-column",
        group: "Attributes",
        width: 40,
        fixed: false,
      },
    ];

    setColumns(defaultColumns);
    // Start with empty data - no default ingredients or attributes
    setTableData([]);
  }, []);

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

  useEffect(() => {
    const handleIngredientClick = (data: { ingredient: Ingredient }) => {
      // Check if ingredient already exists in the work area
      const existingIngredient = tableData.find(
        (row) =>
          !row.isTotal &&
          !row.isFormula &&
          row.description === data.ingredient.name
      );

      if (existingIngredient) {
        // If ingredient already exists, don't add duplicate
        console.log(`${data.ingredient.name} is already in the work area`);
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
        // If this is the first ingredient, also add the total rows
        if (prev.length === 0) {
          const totalRows = [
            {
              id: "runningTotal",
              description: "Running Total",
              costKg: null,
              contCost: null,
              isTotal: true,
              totalType: "running",
            },
            {
              id: "targetTotal",
              description: "Target Total",
              costKg: null,
              contCost: null,
              isTotal: true,
              totalType: "target",
            },
            {
              id: "rmc",
              description: "RMC (Raw Material Cost)",
              costKg: null,
              contCost: null,
              isTotal: true,
              totalType: "rmc",
            },
            {
              id: "weightedAvg",
              description: "Weighted Average",
              costKg: null,
              contCost: null,
              isTotal: true,
              totalType: "weighted",
            },
          ];
          return [newRow, ...totalRows];
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

        // If this is the first item, also add the total rows
        if (prev.length === 0) {
          const totalRows = [
            {
              id: "runningTotal",
              description: "Running Total",
              costKg: null,
              contCost: null,
              isTotal: true,
              totalType: "running",
            },
            {
              id: "targetTotal",
              description: "Target Total",
              costKg: null,
              contCost: null,
              isTotal: true,
              totalType: "target",
            },
            {
              id: "rmc",
              description: "RMC (Raw Material Cost)",
              costKg: null,
              contCost: null,
              isTotal: true,
              totalType: "rmc",
            },
            {
              id: "weightedAvg",
              description: "Weighted Average",
              costKg: null,
              contCost: null,
              isTotal: true,
              totalType: "weighted",
            },
          ];
          newData = [formulaGroupRow, ...formulaIngredientRows, ...totalRows];
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
        return calculateTotals(newData);
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

        return calculateTotals(updatedData);
      });

      // If this is the first formula column, automatically activate it
      if (currentFormulaColumns.length === 0) {
        setEditableFormula(newColumnId);
        eventBus.emit("active-formula-changed", { formula: data.formula });
      }

      // Add the formula to the available formulas list
      setFormulas((prev) => [...prev, data.formula]);
      setAvailableFormulas((prev) => {
        const updated = [...prev, data.formula];
        eventBus.emit("available-formulas-updated", { formulas: updated });
        return updated;
      });

      // Update selected formula IDs
      const newSelectedIds = [...selectedFormulaIds, data.formula.id];
      setSelectedFormulaIds(newSelectedIds);

      // Update formula selections count with selected IDs
      const newCount =
        columns.filter((col) => col.group === "Formulas" && col.formulaId)
          .length + 1;
      eventBus.emit("formula-selections-updated", {
        count: newCount,
        selectedIds: newSelectedIds,
      });
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

      setTableData((prev) => {
        const updatedData = prev.map((row) => {
          if (row.isTotal) {
            return { ...row, [newColumnId]: null };
          }
          return { ...row, [newColumnId]: Math.floor(Math.random() * 30) + 5 }; // Random values for existing formulas
        });

        return calculateTotals(updatedData);
      });

      // Update selected formula IDs
      const newSelectedIds = [...selectedFormulaIds, data.formula.id];
      setSelectedFormulaIds(newSelectedIds);

      // If this is the first formula column, automatically activate it
      if (currentFormulaColumns.length === 0) {
        setEditableFormula(newColumnId);
        eventBus.emit("active-formula-changed", { formula: data.formula });
      }

      // Update formula selections count with selected IDs
      const newCount =
        columns.filter((col) => col.group === "Formulas" && col.formulaId)
          .length + 1;
      eventBus.emit("formula-selections-updated", {
        count: newCount,
        selectedIds: newSelectedIds,
      });
    };

    const handleNormalize = () => {
      if (!editableFormula) {
        toast.error("No active formula to normalize");
        return;
      }

      setTableData((prev) => {
        // Find the target total for the active formula
        const targetTotalRow = prev.find(
          (row) => row.isTotal && row.totalType === "target"
        );
        const runningTotalRow = prev.find(
          (row) => row.isTotal && row.totalType === "running"
        );

        if (!targetTotalRow || !runningTotalRow) {
          toast.error("Could not find target or running total");
          return prev;
        }

        const targetTotal = targetTotalRow[editableFormula];
        const runningTotal = runningTotalRow[editableFormula];

        if (!targetTotal || !runningTotal || runningTotal === 0) {
          toast.error("Invalid target or running total");
          return prev;
        }

        // Calculate the adjustment factor
        const adjustmentFactor = targetTotal / runningTotal;

        // Adjust all ingredient percentages
        const newData = prev.map((row) => {
          if (!row.isTotal && !row.isFormula) {
            const currentValue = row[editableFormula] || 0;
            const newValue = parseFloat(
              (currentValue * adjustmentFactor).toFixed(2)
            );
            return { ...row, [editableFormula]: newValue };
          }
          return row;
        });

        // Recalculate totals
        const finalData = calculateTotals(newData);

        toast.success(`Formula normalized to ${targetTotal.toFixed(2)}%`);
        return finalData;
      });
    };

    const handleMergeDuplicates = () => {
      setTableData((prev) => {
        // Filter out total rows
        const ingredientRows = prev.filter((row) => !row.isTotal);
        const totalRows = prev.filter((row) => row.isTotal);

        // Group by description (case-insensitive)
        const grouped = new Map<string, any[]>();
        ingredientRows.forEach((row) => {
          const key = row.description.toLowerCase().trim();
          if (!grouped.has(key)) {
            grouped.set(key, []);
          }
          grouped.get(key)!.push(row);
        });

        // Merge duplicates
        const mergedRows: any[] = [];
        let mergedCount = 0;

        grouped.forEach((rows, key) => {
          if (rows.length === 1) {
            // No duplicates
            mergedRows.push(rows[0]);
          } else {
            // Merge duplicates
            mergedCount += rows.length - 1;

            // Use the first row as the base
            const mergedRow = { ...rows[0] };

            // Get all formula column IDs
            const formulaColumns = columns.filter(
              (col) => col.group === "Formulas" && col.formulaId
            );

            // Sum up values for each formula column
            formulaColumns.forEach((col) => {
              const total = rows.reduce((sum, row) => {
                const value = parseFloat(row[col.key]) || 0;
                return sum + value;
              }, 0);
              mergedRow[col.key] = parseFloat(total.toFixed(2));
            });

            mergedRows.push(mergedRow);
          }
        });

        if (mergedCount === 0) {
          toast.error("No duplicate ingredients found");
          return prev;
        }

        // Recalculate totals with merged data
        const finalData = calculateTotals(mergedRows);

        toast.success(
          `Merged ${mergedCount} duplicate ingredient${
            mergedCount > 1 ? "s" : ""
          }`
        );
        return finalData;
      });
    };

    eventBus.on("ingredient-selected", handleIngredientClick);
    eventBus.on("formula-selected", handleFormulaSelected);
    eventBus.on("attribute-selected", handleAttributeSelected);
    eventBus.on("attribute-deselected", handleAttributeDeselected);
    eventBus.on("create-formula", handleCreateFormula);
    eventBus.on("load-formula", handleLoadFormula);
    eventBus.on("new-formula-created", handleNewFormulaCreated);
    eventBus.on("formula-selected-for-column", handleFormulaSelectedForColumn);
    eventBus.on("normalize-formula", handleNormalize);
    eventBus.on("merge-duplicates", handleMergeDuplicates);

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
      eventBus.off("normalize-formula", handleNormalize);
      eventBus.off("merge-duplicates", handleMergeDuplicates);
    };
  }, []); // Empty dependency array to prevent re-registration

  const handleLoadFormulaFromModal = (formula: Formula) => {
    // Load formula ingredients into the work area
    const formulaIngredients = formula.ingredients.map((ing, index) => ({
      id: `formula_ing_${index}`,
      description: ing.name,
      costKg: 0, // Price not available in FormulaIngredient
      contCost: 0.0,
      isTotal: false,
    }));

    const totalRows = [
      {
        id: "runningTotal",
        description: "Running Total",
        costKg: null,
        contCost: null,
        isTotal: true,
        totalType: "running",
      },
      {
        id: "targetTotal",
        description: "Target Total",
        costKg: null,
        contCost: null,
        isTotal: true,
        totalType: "target",
      },
      {
        id: "rmc",
        description: "RMC (Raw Material Cost)",
        costKg: null,
        contCost: null,
        isTotal: true,
        totalType: "rmc",
      },
      {
        id: "weightedAvg",
        description: "Weighted Average",
        costKg: null,
        contCost: null,
        isTotal: true,
        totalType: "weighted",
      },
    ];

    setTableData([...formulaIngredients, ...totalRows]);
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
  };

  const handleFormulaModalSelectFormula = (formula: Formula) => {
    // Emit event to add this formula as a new column in the work area
    eventBus.emit("formula-selected-for-column", { formula });
  };

  // Modified handleAddAttributeColumn with max selection logic
  const [showAttributeDialog, setShowAttributeDialog] = useState(false);

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
        type: attribute.type === "number" ? "number" : "text",
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
          switch (attribute.type) {
            case "number":
              sampleValue = Math.floor(Math.random() * 10) + 1;
              break;
            case "boolean":
              sampleValue = Math.random() > 0.5 ? "Yes" : "No";
              break;
            case "select":
              const options = attribute.values || [
                "Option A",
                "Option B",
                "Option C",
              ];
              sampleValue = options[Math.floor(Math.random() * options.length)];
              break;
            default:
              sampleValue = `Sample ${attribute.name}`;
          }

          return { ...row, [newColumnId]: sampleValue };
        })
      );
    });

    setSelectedAttributes([]);
    setShowAttributeDialog(false);
  };

  const handleRowDelete = (rowId: string) => {
    setTableData((prev) => {
      const rowToDelete = prev.find((row) => row.id === rowId);
      let newData = prev.filter((row) => row.id !== rowId);

      // If deleting a formula group, also delete its ingredients and update tracking
      if (rowToDelete?.isFormula) {
        newData = newData.filter(
          (row) => row.parentFormulaId !== rowToDelete.formulaId
        );

        // Remove from tracking sets and update state
        // The useEffect will handle emitting both events
        pendingFormulaIds.current.delete(rowToDelete.formulaId);
        const updatedSelectedIds = selectedFormulaIds.filter(
          (id) => id !== rowToDelete.formulaId
        );
        setSelectedFormulaIds(updatedSelectedIds);
      }

      return newData;
    });
  };

  const handleCellEdit = (rowId: string, columnId: string, value: any) => {
    setTableData((prev) => {
      const updatedRow = prev.find((row) => row.id === rowId);
      const newData = prev.map((row) => {
        if (row.id === rowId) {
          const newRow = { ...row, [columnId]: parseFloat(value) || 0 };

          // If editing a formula column cell, recalculate contribution cost
          const column = columns.find((col) => col.id === columnId);
          if (column && column.group === "Formulas" && !row.isTotal) {
            const percentage = parseFloat(value) || 0;
            const costPerKg = row.costKg || 0;
            // Contribution cost = (percentage in grams * cost per kg) / 1000
            newRow.contCost = (percentage * costPerKg) / 1000;
          }

          return newRow;
        }
        return row;
      });

      // Show toast for target total updates
      if (updatedRow?.totalType === "target") {
        toast.success(
          `Target total updated to ${parseFloat(value).toFixed(2)}%`
        );
      }

      // Recalculate totals after any edit
      return calculateTotals(newData);
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    // Find the column to be deleted
    const columnToDelete = columns.find((col) => col.id === columnId);
    if (!columnToDelete) return;

    // Remove the column from columns array
    setColumns((prev) => prev.filter((col) => col.id !== columnId));

    // Remove the column data from all rows
    setTableData((prev) =>
      prev.map((row) => {
        const { [columnId]: deleted, ...rest } = row;
        return rest;
      })
    );

    // If it's a formula column, update selected formula IDs and counts
    if (columnToDelete.formulaId) {
      const newSelectedIds = selectedFormulaIds.filter(
        (id) => id !== columnToDelete.formulaId
      );
      setSelectedFormulaIds(newSelectedIds);

      // Update formula selections count
      const newCount = columns.filter(
        (col) =>
          col.group === "Formulas" && col.formulaId && col.id !== columnId
      ).length;
      eventBus.emit("formula-selections-updated", {
        count: newCount,
        selectedIds: newSelectedIds,
      });

      // If this was the active formula, set another formula as active or clear it
      if (editableFormula === columnId) {
        const remainingFormulaColumns = columns.filter(
          (col) =>
            col.group === "Formulas" && col.formulaId && col.id !== columnId
        );
        if (remainingFormulaColumns.length > 0) {
          setEditableFormula(remainingFormulaColumns[0].id);
          const formula = formulas.find(
            (f) => f.id === remainingFormulaColumns[0].formulaId
          );
          if (formula) {
            eventBus.emit("active-formula-changed", { formula });
          }
        } else {
          setEditableFormula("");
          eventBus.emit("active-formula-changed", { formula: null });
        }
      }
    }

    // If it's an attribute column, update selected attributes
    if (columnToDelete.attributeId) {
      const remainingAttributeColumns = columns.filter(
        (col) =>
          col.group === "Attributes" && col.attributeId && col.id !== columnId
      );
      const newSelectedAttributes = remainingAttributeColumns.map(
        (col) => col.attributeId!
      );
      eventBus.emit("work-area-attributes-updated", {
        selectedAttributes: newSelectedAttributes,
      });
    }
  };

  const handleColumnReorder = (fromIndex: number, toIndex: number) => {
    setColumns((prev) => {
      const newColumns = [...prev];
      const [movedColumn] = newColumns.splice(fromIndex, 1);
      newColumns.splice(toIndex, 0, movedColumn);
      return newColumns;
    });
  };

  const handleExplodeFormula = (formulaId: string) => {
    setTableData((prev) => {
      const formula = formulas.find((f) => f.id === formulaId);
      if (!formula) return prev;

      // Find the formula group row to get the percentage
      const formulaGroupRow = prev.find(
        (row) => row.isFormula && row.formulaId === formulaId
      );

      if (!formulaGroupRow) return prev;

      // Get the percentage from the active formula column
      const percentage = formulaGroupRow[editableFormula] || 100;
      const multiplier = percentage / 100;

      // Remove the formula group and its nested ingredients
      const newData = prev.filter(
        (row) =>
          !(row.isFormula && row.formulaId === formulaId) &&
          row.parentFormulaId !== formulaId
      );

      // Add individual ingredients with adjusted percentages
      const totalIndex = newData.findIndex((row) => row.isTotal);
      const insertIndex = totalIndex !== -1 ? totalIndex : newData.length;

      const formulaColumns = columns.filter(
        (col) => col.group === "Formulas" && col.type === "number"
      );

      const individualIngredients = formula.ingredients.map((ing, index) => {
        const ingredient = ingredients.find((i) => i.id === ing.ingredientId);
        const rowData: any = {
          id: `exploded_ing_${formulaId}_${index}`,
          description: ing.name,
          costKg: ingredient?.price || 0,
          contCost: 0.0,
          isTotal: false,
          isFormula: false,
          level: 0,
        };

        // Set the percentage for each formula column
        formulaColumns.forEach((col) => {
          if (col.id === editableFormula) {
            // For active formula, apply the multiplier to ingredient percentage
            rowData[col.id] = parseFloat(
              (ing.percentage * multiplier).toFixed(2)
            );
          } else {
            rowData[col.id] = 0;
          }
        });

        return rowData;
      });

      newData.splice(insertIndex, 0, ...individualIngredients);

      // Remove the formula from tracking sets and update state
      // The useEffect will handle emitting both events
      pendingFormulaIds.current.delete(formulaId);
      const newSelectedIds = selectedFormulaIds.filter(
        (id) => id !== formulaId
      );
      setSelectedFormulaIds(newSelectedIds);

      // Show success toast
      toast.success(
        `Formula "${formula.name}" exploded with ${percentage}% of ingredients`
      );

      return calculateTotals(newData);
    });
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

  // Add function to calculate totals with proper column handling and 2 decimal places
  const calculateTotals = (data: any[], formulaColumnIds?: string[]) => {
    const ingredientRows = data.filter((row) => !row.isTotal);
    const totalRows = data.filter((row) => row.isTotal);

    // Get formula columns from current columns state or passed parameter
    const formulaColumns = formulaColumnIds
      ? formulaColumnIds.map((id) => ({ key: id }))
      : columns.filter(
          (col) => col.group === "Formulas" && col.type === "number"
        );

    const updatedTotals = totalRows.map((totalRow) => {
      const updatedRow = { ...totalRow };

      formulaColumns.forEach((col) => {
        const columnValues = ingredientRows
          .filter((row) => !row.isFormula) // Only count individual ingredients, not formula groups
          .map((row) => parseFloat(row[col.key]) || 0)
          .filter((val) => !isNaN(val));

        switch (totalRow.totalType) {
          case "running":
            updatedRow[col.key] = parseFloat(
              columnValues.reduce((sum, val) => sum + val, 0).toFixed(2)
            );
            break;
          case "target":
            updatedRow[col.key] = 100.0; // Target is typically 100%
            break;
          case "rmc":
            // Calculate raw material cost based on percentages and costs
            const rmcValue = ingredientRows
              .filter((row) => !row.isFormula)
              .reduce((sum, row) => {
                const percentage = parseFloat(row[col.key]) || 0;
                const cost = parseFloat(row.costKg) || 0;
                return sum + (percentage * cost) / 100;
              }, 0);
            updatedRow[col.key] = parseFloat(rmcValue.toFixed(2));
            break;
          case "weighted":
            // Calculate weighted average
            const totalPercentage = columnValues.reduce(
              (sum, val) => sum + val,
              0
            );
            const weightedSum = ingredientRows
              .filter((row) => !row.isFormula)
              .reduce((sum, row) => {
                const percentage = parseFloat(row[col.key]) || 0;
                const cost = parseFloat(row.costKg) || 0;
                return sum + percentage * cost;
              }, 0);
            updatedRow[col.key] =
              totalPercentage > 0
                ? parseFloat((weightedSum / totalPercentage).toFixed(2))
                : 0;
            break;
        }
      });

      return updatedRow;
    });

    return [...ingredientRows, ...updatedTotals];
  };

  // Check if we have any ingredient data to show
  const hasIngredients = tableData.some((row) => !row.isTotal);

  // Empty state row for the table
  const getEmptyStateData = () => {
    if (hasIngredients) return tableData;

    // Return a single row that spans all columns with the empty message
    return [
      {
        id: "empty-state",
        description: "",
        costKg: null,
        contCost: null,
        isTotal: false,
        isEmpty: true,
      },
    ];
  };

  const handleSetActiveFormula = (columnId: string) => {
    setEditableFormula(columnId);

    // Find the formula associated with this column and emit to header
    const column = columns.find((col) => col.id === columnId);
    if (column && column.formulaId) {
      const formula = formulas.find((f) => f.id === column.formulaId);
      if (formula) {
        eventBus.emit("active-formula-changed", { formula });
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
    <div className="h-full bg-white">
      <DataGrid
        columns={getDisplayColumns()}
        data={getEmptyStateData()}
        onAddColumn={(columnType) => {
          if (columnType === "formula") {
            handleAddFormulaColumn();
          } else if (columnType === "attribute") {
            handleAddAttributeColumn();
          }
        }}
        onRowDelete={handleRowDelete}
        onCellEdit={handleCellEdit}
        onDeleteColumn={handleDeleteColumn}
        onSetActiveFormula={handleSetActiveFormula}
        onExplodeFormula={handleExplodeFormula}
        onToggleFormulaExpansion={handleToggleFormulaExpansion}
        onColumnReorder={handleColumnReorder}
        editableFormula={editableFormula}
        className="h-full"
        showEmptyState={!hasIngredients}
      />

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
        />
      </Dialog>
    </div>
  );
};

export default WorkArea;
