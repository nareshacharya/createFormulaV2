/**
 * Step 1: Type Selection Field Configuration
 * 
 * Defines the field configuration for the formula type selection step.
 * Users choose between Base, Dilution, Analytical, or Perfumer Formula.
 */

import type { FormField } from '../../models/FormField.model';
import { FORMULA_TYPES, getFormulaTypeLabel, getFormulaTypeDescription } from '../formulaTypes.config';

export const TYPE_SELECTION_FIELDS: FormField[] = [
  {
    name: 'formulaType',
    label: 'Formula Type',
    type: 'radio-card',
    required: true,
    placeholder: 'Select a formula type',
    helpText: 'Choose the type of formula you want to create. This determines which fields will be available.',
    validation: {
      message: 'Formula type is required'
    },
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.ANALYTICAL,
        FORMULA_TYPES.PERFUMER
      ]
    },
    options: [
      {
        value: FORMULA_TYPES.BASE,
        label: getFormulaTypeLabel(FORMULA_TYPES.BASE),
        description: getFormulaTypeDescription(FORMULA_TYPES.BASE),
        icon: 'science',
        badge: 'Most Common'
      },
      {
        value: FORMULA_TYPES.DILUTION,
        label: getFormulaTypeLabel(FORMULA_TYPES.DILUTION),
        description: getFormulaTypeDescription(FORMULA_TYPES.DILUTION),
        icon: 'water_drop'
      },
      {
        value: FORMULA_TYPES.ANALYTICAL,
        label: getFormulaTypeLabel(FORMULA_TYPES.ANALYTICAL),
        description: getFormulaTypeDescription(FORMULA_TYPES.ANALYTICAL),
        icon: 'analytics'
      },
      {
        value: FORMULA_TYPES.PERFUMER,
        label: getFormulaTypeLabel(FORMULA_TYPES.PERFUMER),
        description: getFormulaTypeDescription(FORMULA_TYPES.PERFUMER),
        icon: 'person',
        badge: 'Auto-ID Generation'
      }
    ],
    dataSource: {
      type: 'STATIC'
    },
    group: 'type-selection'
  }
];

export default TYPE_SELECTION_FIELDS;
