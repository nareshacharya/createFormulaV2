/**
 * Step 5: Project Reference Field Configuration
 * 
 * Project-related fields (all optional):
 * - Project ID (lookup/search)
 * - Project Name (display only, from selected project)
 * - Project Region (display only)
 * - Project Country (display only)
 * - Project Manager (display only)
 * - Project Status (display only)
 * - Project Currencies (display only)
 * - Project Default Currency (display only)
 * - Brief CPT Target
 * - Brief Fragrance Dosage Target
 */

import type { FormField } from '../../models/FormField.model';
import { getValidationRule } from '../formulaCreation.config';
import { FORMULA_TYPES } from '../formulaTypes.config';

export const PROJECT_REFERENCE_FIELDS: FormField[] = [
  {
    name: 'projectId',
    label: 'Project ID',
    type: 'select',
    required: false,
    placeholder: 'Select a project (optional)',
    helpText: 'Link this formula to an existing project. The project mapping will be stored in workspace context.',
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
      endpoint: '/api/projects/search',
      valueField: 'id',
      labelField: 'displayId'
    },
    group: 'project-ref'
  },
  {
    name: 'projectName',
    label: 'Project Name',
    type: 'text',
    required: false,
    helpText: 'Project name (display only, populated from project selection)',
    disabled: true,
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.ANALYTICAL,
        FORMULA_TYPES.PERFUMER
      ],
      dependsOn: ['projectId'],
      showWhen: (formData: Record<string, unknown>) => !!formData.projectId
    },
    dataSource: {
      type: 'COMPUTED',
      compute: (formData: Record<string, unknown>) => {
        return (formData as any)?.projectName || '';
      }
    },
    group: 'project-ref'
  },
  {
    name: 'projectRegion',
    label: 'Project Region',
    type: 'text',
    required: false,
    helpText: 'Geographic region where the project operates',
    disabled: true,
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.ANALYTICAL,
        FORMULA_TYPES.PERFUMER
      ],
      dependsOn: ['projectId'],
      showWhen: (formData: Record<string, unknown>) => !!formData.projectId
    },
    dataSource: {
      type: 'COMPUTED',
      compute: (formData: Record<string, unknown>) => {
        return (formData as any)?.projectRegion || '';
      }
    },
    group: 'project-ref'
  },
  {
    name: 'projectCountry',
    label: 'Project Country',
    type: 'text',
    required: false,
    helpText: 'Country where the project is based',
    disabled: true,
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.ANALYTICAL,
        FORMULA_TYPES.PERFUMER
      ],
      dependsOn: ['projectId'],
      showWhen: (formData: Record<string, unknown>) => !!formData.projectId
    },
    dataSource: {
      type: 'COMPUTED',
      compute: (formData: Record<string, unknown>) => {
        return (formData as any)?.projectCountry || '';
      }
    },
    group: 'project-ref'
  },
  {
    name: 'projectManager',
    label: 'Project Manager',
    type: 'text',
    required: false,
    helpText: 'The project manager responsible for this project',
    disabled: true,
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.ANALYTICAL,
        FORMULA_TYPES.PERFUMER
      ],
      dependsOn: ['projectId'],
      showWhen: (formData: Record<string, unknown>) => !!formData.projectId
    },
    dataSource: {
      type: 'COMPUTED',
      compute: (formData: Record<string, unknown>) => {
        return (formData as any)?.projectManager || '';
      }
    },
    group: 'project-ref'
  },
  {
    name: 'projectStatus',
    label: 'Project Status',
    type: 'text',
    required: false,
    helpText: 'Current status of the project (active, in-progress, planning, archived)',
    disabled: true,
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.ANALYTICAL,
        FORMULA_TYPES.PERFUMER
      ],
      dependsOn: ['projectId'],
      showWhen: (formData: Record<string, unknown>) => !!formData.projectId
    },
    dataSource: {
      type: 'COMPUTED',
      compute: (formData: Record<string, unknown>) => {
        return (formData as any)?.projectStatus || '';
      }
    },
    group: 'project-ref'
  },
  {
    name: 'projectCurrencies',
    label: 'Project Currencies',
    type: 'text',
    required: false,
    helpText: 'Currencies supported by this project (comma-separated)',
    disabled: true,
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.ANALYTICAL,
        FORMULA_TYPES.PERFUMER
      ],
      dependsOn: ['projectId'],
      showWhen: (formData: Record<string, unknown>) => !!formData.projectId
    },
    dataSource: {
      type: 'COMPUTED',
      compute: (formData: Record<string, unknown>) => {
        const currencies = (formData as any)?.projectCurrencies;
        return Array.isArray(currencies) ? currencies.join(', ') : '';
      }
    },
    group: 'project-ref'
  },
  {
    name: 'projectDefaultCurrency',
    label: 'Project Default Currency',
    type: 'text',
    required: false,
    helpText: 'Default currency for project budgeting and cost calculations',
    disabled: true,
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.ANALYTICAL,
        FORMULA_TYPES.PERFUMER
      ],
      dependsOn: ['projectId'],
      showWhen: (formData: Record<string, unknown>) => !!formData.projectId
    },
    dataSource: {
      type: 'COMPUTED',
      compute: (formData: Record<string, unknown>) => {
        return (formData as any)?.projectDefaultCurrency || '';
      }
    },
    group: 'project-ref'
  },
  {
    name: 'briefCptTarget',
    label: 'Brief CPT Target',
    type: 'number',
    required: false,
    placeholder: 'Enter CPT target (optional)',
    helpText: 'Cost per thousand target from the project brief',
    validation: getValidationRule('briefCptTarget'),
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
    group: 'project-ref'
  },
  {
    name: 'briefFragranceDosageTarget',
    label: 'Brief Fragrance Dosage Target (%)',
    type: 'number',
    required: false,
    placeholder: 'Enter dosage target (optional)',
    helpText: 'Target fragrance dosage percentage from the project brief',
    validation: getValidationRule('briefFragranceDosageTarget'),
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
    group: 'project-ref'
  }
];

export default PROJECT_REFERENCE_FIELDS;
