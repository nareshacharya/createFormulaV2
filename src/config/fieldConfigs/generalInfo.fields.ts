/**
 * Step 2: General Information Field Configuration
 * 
 * Defines fields for general formula information:
 * - Category (mandatory)
 * - Region (mandatory)
 * - Country (mandatory)
 * - SAP PLM Code (optional)
 * - LIMS Code (optional)
 */

import type { FormField } from '../../models/FormField.model';
import { FORMULA_TYPES } from '../formulaTypes.config';
import { REFERENCE_DATA_ENDPOINTS, getValidationRule } from '../formulaCreation.config';

export const GENERAL_INFO_FIELDS: FormField[] = [
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    placeholder: 'Select a category',
    helpText: 'The category this formula belongs to (e.g., Fine Fragrance, Home Care)',
    validation: getValidationRule('category'),
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.ANALYTICAL,
        FORMULA_TYPES.PERFUMER
      ]
    },
    dataSource: {
      type: 'API',
      endpoint: REFERENCE_DATA_ENDPOINTS.categories,
      valueField: 'code',
      labelField: 'name'
    },
    group: 'general-info'
  },
  {
    name: 'region',
    label: 'Region',
    type: 'select',
    required: true,
    placeholder: 'Select a region',
    helpText: 'The geographical region for this formula',
    validation: getValidationRule('region'),
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.ANALYTICAL,
        FORMULA_TYPES.PERFUMER
      ]
    },
    dataSource: {
      type: 'API',
      endpoint: REFERENCE_DATA_ENDPOINTS.regions,
      valueField: 'code',
      labelField: 'name'
    },
    group: 'general-info'
  },
  {
    name: 'country',
    label: 'Country',
    type: 'select',
    required: true,
    placeholder: 'Select a country',
    helpText: 'The specific country for this formula',
    validation: getValidationRule('country'),
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.ANALYTICAL,
        FORMULA_TYPES.PERFUMER
      ],
      dependsOn: ['region']
    },
    dataSource: {
      type: 'API',
      endpoint: REFERENCE_DATA_ENDPOINTS.countries,
      valueField: 'code',
      labelField: 'name',
      filterBy: 'region'
    },
    group: 'general-info'
  },
  {
    name: 'sapPlmCode',
    label: 'SAP PLM Code',
    type: 'text',
    required: false,
    placeholder: 'Enter SAP PLM Code (optional)',
    helpText: 'Optional reference code from SAP PLM system',
    validation: getValidationRule('sapPlmCode'),
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
    group: 'general-info'
  },
  {
    name: 'limsCode',
    label: 'LIMS Code',
    type: 'text',
    required: false,
    placeholder: 'Enter LIMS Code (optional)',
    helpText: 'Optional reference code from LIMS system',
    validation: getValidationRule('limsCode'),
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
    group: 'general-info'
  }
];

export default GENERAL_INFO_FIELDS;
