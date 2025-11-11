/**
 * Formula Types Configuration
 * 
 * Defines the different types of formulas supported by the system
 * and their display labels.
 */

export const FORMULA_TYPES = {
  BASE: 'BASE',
  DILUTION: 'DILUTION',
  ANALYTICAL: 'ANALYTICAL',
  PERFUMER: 'PERFUMER'
} as const;

export const FORMULA_TYPE_LABELS = {
  BASE: 'Base Formula',
  DILUTION: 'Dilution Formula',
  ANALYTICAL: 'Analytical Formula',
  PERFUMER: 'Perfumer Formula'
} as const;

export const FORMULA_TYPE_DESCRIPTIONS = {
  BASE: 'Create a base fragrance composition that can be used as foundation for other formulas',
  DILUTION: 'Create a diluted version of an existing base formula with specific concentration',
  ANALYTICAL: 'Create a laboratory analysis formula for testing and quality control purposes',
  PERFUMER: 'Create a perfumer-designed formula with complete fragrance composition'
} as const;

export type FormulaType = typeof FORMULA_TYPES[keyof typeof FORMULA_TYPES];

/**
 * Get label for formula type
 */
export const getFormulaTypeLabel = (type: FormulaType): string => {
  return FORMULA_TYPE_LABELS[type] || type;
};

/**
 * Get description for formula type
 */
export const getFormulaTypeDescription = (type: FormulaType): string => {
  return FORMULA_TYPE_DESCRIPTIONS[type] || '';
};

/**
 * Get all formula types as array
 */
export const getAllFormulaTypes = (): FormulaType[] => {
  return Object.values(FORMULA_TYPES);
};

/**
 * Check if a string is a valid formula type
 */
export const isValidFormulaType = (type: string): type is FormulaType => {
  return Object.values(FORMULA_TYPES).includes(type as FormulaType);
};
