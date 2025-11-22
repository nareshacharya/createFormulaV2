import type { Formula } from "../services/pega";

/**
 * Determines if a formula is editable based on its status
 * Only draft formulas are editable
 */
export const isFormulaEditable = (formula: Formula): boolean => {
  return formula.status === "draft";
};

/**
 * Determines if a formula is read-only
 */
export const isFormulaReadOnly = (formula: Formula): boolean => {
  return !isFormulaEditable(formula);
};
