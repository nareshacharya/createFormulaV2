import { useState, useEffect, useRef } from "react";
import type { Column } from "../../../components/DataGrid";
import type { Formula, Ingredient, IngredientAttribute } from "../../../services/pega";

export const useWorkAreaState = () => {
    const [activeFormula, setActiveFormula] = useState<Formula | null>(null);
    const [availableFormulas, setAvailableFormulas] = useState<Formula[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [attributes, setAttributes] = useState<IngredientAttribute[]>([]);
    const [showFormulaSelector, setShowFormulaSelector] = useState(false);
    const formulasAutoLoadedRef = useRef(false);
    const [showFormulaModal, setShowFormulaModal] = useState(false);
    const [selectedFormulas, setSelectedFormulas] = useState<string[]>([]);
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
    const [formulas, setFormulas] = useState<Formula[]>([]);
    const [columns, setColumns] = useState<Column[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [editableFormula, setEditableFormula] = useState<string>("");
    const [maxAttributeSelections] = useState(5);
    const [maxFormulaSelections] = useState(4);
    const [selectedFormulaIds, setSelectedFormulaIds] = useState<string[]>([]);
    const pendingFormulaIds = useRef<Set<string>>(new Set());

    // Initialize default columns
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
                width: 250,
                minWidth: 150,
                maxWidth: 400,
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
        setTableData([]);
    }, []);

    return {
        // State
        activeFormula,
        availableFormulas,
        ingredients,
        attributes,
        showFormulaSelector,
        formulasAutoLoadedRef,
        showFormulaModal,
        selectedFormulas,
        selectedAttributes,
        formulas,
        columns,
        tableData,
        editableFormula,
        maxAttributeSelections,
        maxFormulaSelections,
        selectedFormulaIds,
        pendingFormulaIds,

        // Setters
        setActiveFormula,
        setAvailableFormulas,
        setIngredients,
        setAttributes,
        setShowFormulaSelector,
        setShowFormulaModal,
        setSelectedFormulas,
        setSelectedAttributes,
        setFormulas,
        setColumns,
        setTableData,
        setEditableFormula,
        setSelectedFormulaIds,
    };
};
