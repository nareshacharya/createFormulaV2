/**
 * Step 3: Formula Details Field Configuration
 * 
 * Conditional fields based on formula type:
 * - Fragrance Name (BASE, DILUTION, PERFUMER - mandatory)
 * - Sample ID (ANALYTICAL - mandatory)
 * - Fragrance Dosage (PERFUMER - mandatory)
 * - Formula Version (ALL - mandatory)
 */

import type { FormField } from '../../models/FormField.model';
import { FORMULA_TYPES } from '../formulaTypes.config';
import { getValidationRule } from '../formulaCreation.config';

export const FORMULA_DETAILS_FIELDS: FormField[] = [
  {
    name: 'fragranceName',
    label: 'Fragrance Name',
    type: 'text',
    required: true,
    placeholder: 'Enter fragrance name',
    helpText: 'The name of the fragrance for this formula',
    validation: getValidationRule('fragranceName'),
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.PERFUMER
      ]
    },
    dataSource: {
      type: 'STATIC'
    },
    group: 'formula-details'
  },
  {
    name: 'sampleId',
    label: 'Sample ID',
    type: 'text',
    required: true,
    placeholder: 'Enter sample ID',
    helpText: 'The unique identifier for the analytical sample',
    validation: getValidationRule('sampleId'),
    visibility: {
      showForTypes: [
        FORMULA_TYPES.ANALYTICAL
      ]
    },
    dataSource: {
      type: 'STATIC'
    },
    group: 'formula-details'
  },
  {
    name: 'fragranceDosageActual',
    label: 'Fragrance Dosage (%)',
    type: 'number',
    required: true,
    placeholder: 'Enter dosage percentage',
    helpText: 'The actual fragrance dosage percentage (0.1 - 100)',
    validation: getValidationRule('fragranceDosageActual'),
    visibility: {
      showForTypes: [
        FORMULA_TYPES.PERFUMER
      ]
    },
    dataSource: {
      type: 'STATIC'
    },
    group: 'formula-details'
  },
  {
    name: 'formulaVersion',
    label: 'Formula Version',
    type: 'number',
    required: true,
    placeholder: 'Enter version number',
    helpText: 'The version number of this formula (1-999)',
    validation: getValidationRule('formulaVersion'),
    defaultValue: 1,
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.ANALYTICAL,
        FORMULA_TYPES.PERFUMER
      ]
    },
    dataSource: {
      type: 'STATIC'
    },
    group: 'formula-details'
  },
  {
    name: 'formulaInclusionLevel',
    label: 'Formula Inclusion Level (%)',
    type: 'number',
    required: false,
    placeholder: 'Enter inclusion level (optional)',
    helpText: 'The inclusion level percentage of the formula (0-100)',
    validation: getValidationRule('formulaInclusionLevel'),
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.PERFUMER
      ]
    },
    dataSource: {
      type: 'STATIC'
    },
    group: 'formula-details'
  }
];

export default FORMULA_DETAILS_FIELDS;
