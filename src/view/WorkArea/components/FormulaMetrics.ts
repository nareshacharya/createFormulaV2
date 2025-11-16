import { useEffect, useState } from "react";
import type { Formula } from "../../../services/pega";
import { eventBus } from "../../../utils/bus";

interface FormulaMetrics {
  lineCount: number;
  targetCost: number;
  formulaCost: number;
}

/**
 * Component to calculate and emit formula metrics (line count, costs) to the header
 * Monitors changes in table data and active formula to provide real-time updates
 */
export const useFormulaMetrics = (
  tableData: any[],
  editableFormula: string | null
  // formulas - Reserved for future use
) => {
  const [currentMetrics, setCurrentMetrics] = useState<FormulaMetrics>({
    lineCount: 0,
    targetCost: 0,
    formulaCost: 0,
  });

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

      const metrics = {
        lineCount,
        targetCost,
        formulaCost,
      };

      setCurrentMetrics(metrics);
      eventBus.emit("active-formula-metrics-updated", metrics);
    }
  }, [tableData, editableFormula]);

  return currentMetrics;
};

/**
 * Helper to emit formula metrics when active formula changes
 */
export const emitFormulaMetrics = (
  columnId: string,
  tableData: any[],
  formulas: Formula[],
  columns: any[]
) => {
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
    return sum + (amount * costPerKg) / 100;
  }, 0);

  eventBus.emit("active-formula-metrics-updated", {
    lineCount,
    targetCost,
    formulaCost,
  });

  // Also emit the formula object for header display
  const column = columns.find((col) => col.id === columnId);
  if (column && column.formulaId) {
    const formula = formulas.find((f) => f.id === column.formulaId);
    if (formula) {
      eventBus.emit("active-formula-changed", { formula });
    }
  }
};
