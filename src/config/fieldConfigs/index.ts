/**
 * Field Configurations Index
 * 
 * Exports all field configurations for the formula creation process
 */

import type { FormField } from '../../models/FormField.model';
import FORMULA_DETAILS_FIELDS from './formulaDetails.fields';
import GENERAL_INFO_FIELDS from './generalInfo.fields';
import PRODUCT_INFO_FIELDS from './productInfo.fields';
import PROJECT_REFERENCE_FIELDS from './projectReference.fields';
import TYPE_SELECTION_FIELDS from './typeSelection.fields';

/**
 * All field configurations organized by step
 */
export const FIELD_CONFIGS: Record<string, FormField[]> = {
  'type-selection': TYPE_SELECTION_FIELDS,
  'general-info': GENERAL_INFO_FIELDS,
  'formula-details': FORMULA_DETAILS_FIELDS,
  'product-info': PRODUCT_INFO_FIELDS,
  'project-ref': PROJECT_REFERENCE_FIELDS
};

/**
 * Get fields for a specific step
 */
export const getFieldsForStep = (stepId: string): FormField[] => {
  return FIELD_CONFIGS[stepId] || [];
};

/**
 * Get all fields (flattened)
 */
export const getAllFields = (): FormField[] => {
  return Object.values(FIELD_CONFIGS).flat();
};

/**
 * Get field by name
 */
export const getFieldByName = (fieldName: string): FormField | undefined => {
  return getAllFields().find(field => field.name === fieldName);
};

// Named exports
export {
  TYPE_SELECTION_FIELDS,
  GENERAL_INFO_FIELDS,
  FORMULA_DETAILS_FIELDS,
  PRODUCT_INFO_FIELDS,
  PROJECT_REFERENCE_FIELDS
};

export default FIELD_CONFIGS;
