/**
 * Step 5: Project Reference Field Configuration
 * 
 * Project-related fields (all optional):
 * - Project ID (lookup/search)
 * - Project Details (display only, from US-1048)
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
    type: 'search',
    required: false,
    placeholder: 'Search for a project (optional)',
    helpText: 'Link this formula to an existing project',
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
      labelField: 'name'
    },
    group: 'project-ref'
  },
  {
    name: 'projectDetails',
    label: 'Project Details',
    type: 'display',
    required: false,
    helpText: 'Project information from US-1048',
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
      type: 'API',
      endpoint: '/api/projects/{projectId}',
      compute: (formData: Record<string, unknown>) => {
        const projectId = formData.projectId as string;
        return projectId ? `/api/projects/${projectId}` : '';
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
