/**
 * Step 4: Product Information Field Configuration
 * 
 * Product-related fields (mostly optional):
 * - Product Format (mandatory for all)
 * - Brand, Supplier, Claims, Variant (optional)
 * - Production Code, Production Date (optional)
 * - Recommended Dosage, Unit (optional)
 * - UFI Code (computed, optional)
 * - Comment on Product (optional)
 */

import type { FormField } from '../../models/FormField.model';
import { REFERENCE_DATA_ENDPOINTS, getValidationRule } from '../formulaCreation.config';
import { FORMULA_TYPES } from '../formulaTypes.config';

export const PRODUCT_INFO_FIELDS: FormField[] = [
  {
    name: 'productFormat',
    label: 'Product Format',
    type: 'select',
    required: true,
    placeholder: 'Select product format',
    helpText: 'The format of the product (e.g., Spray, Lotion, Powder)',
    validation: getValidationRule('productFormat'),
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
      endpoint: REFERENCE_DATA_ENDPOINTS.productFormats,
      valueField: 'code',
      labelField: 'name'
    },
    group: 'product-info'
  },
  {
    name: 'brand',
    label: 'Brand',
    type: 'select',
    required: false,
    placeholder: 'Select brand (optional)',
    helpText: 'The brand associated with this formula',
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.PERFUMER
      ]
    },
    dataSource: {
      type: 'API',
      endpoint: REFERENCE_DATA_ENDPOINTS.brands,
      valueField: 'code',
      labelField: 'name'
    },
    group: 'product-info'
  },
  {
    name: 'supplier',
    label: 'Supplier',
    type: 'select',
    required: false,
    placeholder: 'Select supplier (optional)',
    helpText: 'The supplier for this formula',
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.PERFUMER
      ]
    },
    dataSource: {
      type: 'API',
      endpoint: REFERENCE_DATA_ENDPOINTS.suppliers,
      valueField: 'code',
      labelField: 'name'
    },
    group: 'product-info'
  },
  {
    name: 'claims',
    label: 'Claims',
    type: 'multi-select',
    required: false,
    placeholder: 'Select claims (optional)',
    helpText: 'Product claims associated with this formula',
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.PERFUMER
      ]
    },
    dataSource: {
      type: 'API',
      endpoint: REFERENCE_DATA_ENDPOINTS.claims,
      valueField: 'code',
      labelField: 'name'
    },
    group: 'product-info'
  },
  {
    name: 'variant',
    label: 'Variant',
    type: 'text',
    required: false,
    placeholder: 'Enter variant (optional)',
    helpText: 'Product variant description',
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
    group: 'product-info'
  },
  {
    name: 'productionCode',
    label: 'Production Code',
    type: 'text',
    required: false,
    placeholder: 'Enter production code (optional)',
    helpText: 'Manufacturing production code',
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
    group: 'product-info'
  },
  {
    name: 'productionDate',
    label: 'Production Date',
    type: 'date',
    required: false,
    placeholder: 'Select production date (optional)',
    helpText: 'Date of production',
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
    group: 'product-info'
  },
  {
    name: 'recommendedProductDosage',
    label: 'Recommended Product Dosage',
    type: 'number',
    required: false,
    placeholder: 'Enter recommended dosage (optional)',
    helpText: 'Recommended dosage for the product',
    validation: getValidationRule('recommendedProductDosage'),
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
    group: 'product-info'
  },
  {
    name: 'unitOfRecommendedDosage',
    label: 'Unit of Recommended Dosage',
    type: 'select',
    required: false,
    placeholder: 'Select unit (optional)',
    helpText: 'Unit of measurement for recommended dosage',
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.PERFUMER
      ],
      dependsOn: ['recommendedProductDosage']
    },
    options: [
      { value: 'g', label: 'Grams (g)' },
      { value: 'kg', label: 'Kilograms (kg)' },
      { value: 'ml', label: 'Milliliters (ml)' },
      { value: 'l', label: 'Liters (l)' },
      { value: '%', label: 'Percentage (%)' },
      { value: 'ppm', label: 'Parts per million (ppm)' }
    ],
    dataSource: {
      type: 'STATIC'
    },
    group: 'product-info'
  },
  {
    name: 'ufiCode',
    label: 'UFI Code',
    type: 'text',
    required: false,
    placeholder: 'Auto-generated after formula creation',
    helpText: 'Unique Formula Identifier (auto-generated)',
    disabled: true,
    visibility: {
      showForTypes: [
        FORMULA_TYPES.BASE,
        FORMULA_TYPES.DILUTION,
        FORMULA_TYPES.PERFUMER
      ]
    },
    dataSource: {
      type: 'COMPUTED',
      compute: (formData: Record<string, unknown>) => {
        const formulaId = formData.formulaId as string;
        const country = formData.country as string;
        if (!formulaId || !country) return '';
        return `UFI-${formulaId}-${country}`;
      }
    },
    group: 'product-info'
  },
  {
    name: 'commentOnProduct',
    label: 'Comment on Product',
    type: 'textarea',
    required: false,
    placeholder: 'Enter comments (optional)',
    helpText: 'Additional comments or notes about the product',
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
    group: 'product-info'
  }
];

export default PRODUCT_INFO_FIELDS;
