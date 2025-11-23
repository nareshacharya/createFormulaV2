/**
 * Formula Creation Configuration
 * 
 * Main configuration file for the formula creation process.
 * Defines steps, field visibility, validation rules, and auto-generation patterns.
 * 
 * This file is data-driven and should not exceed 1000 lines.
 */

import type { FormulaType } from './formulaTypes.config';

// ============================================================================
// STEP CONFIGURATION
// ============================================================================

export interface FormStep {
    id: string;
    label: string;
    description?: string;
    sequence: number;
    required: boolean;
    icon?: string;
}

export const FORM_STEPS: FormStep[] = [
    {
        id: 'identification',
        label: 'Identification',
        description: 'Select formula type and basic identification',
        sequence: 1,
        required: true,
        icon: 'label'
    },
    {
        id: 'details',
        label: 'Details',
        description: 'Formula-specific information and dosage',
        sequence: 2,
        required: true,
        icon: 'info'
    },
    {
        id: 'product-project',
        label: 'Product & Project',
        description: 'Product details and project reference',
        sequence: 3,
        required: false,
        icon: 'shopping_bag'
    },
    {
        id: 'additional',
        label: 'Additional',
        description: 'System codes, production, and extra info',
        sequence: 4,
        required: false,
        icon: 'more'
    }
];

// ============================================================================
// FIELD VISIBILITY MATRIX
// ============================================================================

export interface FieldVisibilityConfig {
    required: string[];
    optional: string[];
    hidden: string[];
}

export const FIELD_VISIBILITY: Record<FormulaType, FieldVisibilityConfig> = {
    BASE: {
        required: [
            'formulaType',
            'category',
            'region',
            'country',
            'fragranceName',
            'productFormat'
        ],
        optional: [
            'projectId',
            'sapPlmCode',
            'limsCode',
            'brand',
            'supplier',
            'claims',
            'variant',
            'productionCode',
            'productionDate',
            'recommendedProductDosage',
            'unitOfRecommendedDosage',
            'commentOnProduct',
            'briefCptTarget',
            'briefFragranceDosageTarget',
            'formulaInclusionLevel'
        ],
        hidden: [
            'sampleId'
        ]
    },
    DILUTION: {
        required: [
            'formulaType',
            'category',
            'region',
            'country',
            'fragranceName',
            'productFormat'
        ],
        optional: [
            'projectId',
            'sapPlmCode',
            'limsCode',
            'brand',
            'supplier',
            'claims',
            'variant',
            'productionCode',
            'productionDate',
            'recommendedProductDosage',
            'unitOfRecommendedDosage',
            'commentOnProduct',
            'briefCptTarget',
            'briefFragranceDosageTarget',
            'formulaInclusionLevel'
        ],
        hidden: [
            'sampleId'
        ]
    },
    ANALYTICAL: {
        required: [
            'formulaType',
            'category',
            'region',
            'country',
            'sampleId',
            'productFormat'
        ],
        optional: [
            'projectId',
            'sapPlmCode',
            'limsCode',
            'productionCode',
            'productionDate',
            'commentOnProduct'
        ],
        hidden: [
            'fragranceName',
            'brand',
            'supplier',
            'claims',
            'variant',
            'recommendedProductDosage',
            'unitOfRecommendedDosage',
            'briefCptTarget',
            'briefFragranceDosageTarget',
            'fragranceDosageActual'
        ]
    },
    PERFUMER: {
        required: [
            'formulaType',
            'category',
            'region',
            'country',
            'fragranceName',
            'fragranceDosageActual',
            'productFormat'
        ],
        optional: [
            'projectId',
            'sapPlmCode',
            'limsCode',
            'brand',
            'supplier',
            'claims',
            'variant',
            'productionCode',
            'productionDate',
            'recommendedProductDosage',
            'unitOfRecommendedDosage',
            'commentOnProduct',
            'briefCptTarget',
            'briefFragranceDosageTarget',
            'formulaInclusionLevel'
        ],
        hidden: [
            'sampleId'
        ]
    }
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export interface FieldValidationRule {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
}

export const VALIDATION_RULES: Record<string, FieldValidationRule> = {
    fragranceName: {
        minLength: 3,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9\s\-_'&.]+$/,
        message: 'Fragrance name must be 3-100 characters, alphanumeric only'
    },
    sampleId: {
        minLength: 3,
        maxLength: 50,
        pattern: /^[A-Z0-9\-_]+$/,
        message: 'Sample ID must be 3-50 characters, uppercase alphanumeric'
    },
    fragranceDosageActual: {
        min: 0.1,
        max: 100,
        message: 'Dosage must be between 0.1% and 100%'
    },
    formulaVersion: {
        min: 1,
        max: 999,
        message: 'Version must be between 1 and 999'
    },
    category: {
        message: 'Category is required'
    },
    region: {
        message: 'Region is required'
    },
    country: {
        message: 'Country is required'
    },
    productFormat: {
        message: 'Product format is required'
    },
    sapPlmCode: {
        maxLength: 50,
        pattern: /^[A-Z0-9-]+$/,
        message: 'SAP PLM Code must be alphanumeric'
    },
    limsCode: {
        maxLength: 50,
        pattern: /^[A-Z0-9-]+$/,
        message: 'LIMS Code must be alphanumeric'
    },
    recommendedProductDosage: {
        min: 0,
        max: 100,
        message: 'Recommended dosage must be between 0 and 100'
    },
    briefCptTarget: {
        min: 0,
        message: 'CPT target must be positive'
    },
    briefFragranceDosageTarget: {
        min: 0,
        max: 100,
        message: 'Dosage target must be between 0% and 100%'
    },
    formulaInclusionLevel: {
        min: 0,
        max: 100,
        message: 'Inclusion level must be between 0% and 100%'
    }
};

// ============================================================================
// AUTO-GENERATION PATTERNS
// ============================================================================

export interface AutoGenerationConfig {
    pattern: string;
    example: string;
    sequentialDigits: number;
    applicableForTypes?: FormulaType[];
}

export const AUTO_GENERATION: Record<string, AutoGenerationConfig> = {
    formulaId: {
        pattern: 'FORM-{YYYY}{MM}{DD}-{SEQUENTIAL}',
        example: 'FORM-20241105-0001',
        sequentialDigits: 4
    },
    perfumerFormulaId: {
        pattern: 'PERF-{YYYY}{MM}{DD}-{SEQUENTIAL}',
        example: 'PERF-20241105-0001',
        sequentialDigits: 4,
        applicableForTypes: ['PERFUMER']
    },
    ufiCode: {
        pattern: 'UFI-{FORMULA_ID}-{COUNTRY_CODE}',
        example: 'UFI-FORM-20241105-0001-US',
        sequentialDigits: 0
    }
};

// ============================================================================
// STATUS WORKFLOW
// ============================================================================

export interface StatusWorkflowConfig {
    creationStatus: string;
    allowedTransitions: Record<string, string[]>;
}

export const STATUS_WORKFLOW: StatusWorkflowConfig = {
    creationStatus: 'DRAFT',
    allowedTransitions: {
        'DRAFT': ['ACTIVE', 'ARCHIVED'],
        'ACTIVE': ['INACTIVE', 'ARCHIVED'],
        'INACTIVE': ['ACTIVE', 'ARCHIVED'],
        'ARCHIVED': [],
        'SUBMITTED': ['ACTIVE', 'ARCHIVED']
    }
};

// ============================================================================
// REFERENCE DATA CONFIGURATIONS
// ============================================================================

export const REFERENCE_DATA_ENDPOINTS = {
    categories: '/api/reference/categories',
    regions: '/api/reference/regions',
    countries: '/api/reference/countries',
    brands: '/api/reference/brands',
    suppliers: '/api/reference/suppliers',
    productFormats: '/api/reference/product-formats',
    claims: '/api/reference/claims'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get visible fields for a formula type
 */
export const getVisibleFields = (formulaType: FormulaType): string[] => {
    const config = FIELD_VISIBILITY[formulaType];
    return [...config.required, ...config.optional];
};

/**
 * Get required fields for a formula type
 */
export const getRequiredFields = (formulaType: FormulaType): string[] => {
    return FIELD_VISIBILITY[formulaType].required;
};

/**
 * Check if field is required for formula type
 */
export const isFieldRequired = (fieldName: string, formulaType: FormulaType): boolean => {
    return FIELD_VISIBILITY[formulaType].required.includes(fieldName);
};

/**
 * Check if field is hidden for formula type
 */
export const isFieldHidden = (fieldName: string, formulaType: FormulaType): boolean => {
    return FIELD_VISIBILITY[formulaType].hidden.includes(fieldName);
};

/**
 * Check if field is visible for formula type
 */
export const isFieldVisible = (fieldName: string, formulaType: FormulaType): boolean => {
    const config = FIELD_VISIBILITY[formulaType];
    return config.required.includes(fieldName) || config.optional.includes(fieldName);
};

/**
 * Get validation rule for field
 */
export const getValidationRule = (fieldName: string): FieldValidationRule | undefined => {
    return VALIDATION_RULES[fieldName];
};

/**
 * Get auto-generation config for field
 */
export const getAutoGenerationConfig = (fieldName: string): AutoGenerationConfig | undefined => {
    return AUTO_GENERATION[fieldName];
};

/**
 * Get form steps
 */
export const getFormSteps = (): FormStep[] => {
    return FORM_STEPS;
};

/**
 * Get step by ID
 */
export const getStepById = (stepId: string): FormStep | undefined => {
    return FORM_STEPS.find(step => step.id === stepId);
};

/**
 * Get next step
 */
export const getNextStep = (currentStepId: string): FormStep | undefined => {
    const currentStep = FORM_STEPS.find(step => step.id === currentStepId);
    if (!currentStep) return undefined;

    return FORM_STEPS.find(step => step.sequence === currentStep.sequence + 1);
};

/**
 * Get previous step
 */
export const getPreviousStep = (currentStepId: string): FormStep | undefined => {
    const currentStep = FORM_STEPS.find(step => step.id === currentStepId);
    if (!currentStep) return undefined;

    return FORM_STEPS.find(step => step.sequence === currentStep.sequence - 1);
};

// Export configuration object
export const FORMULA_CREATION_CONFIG = {
    steps: FORM_STEPS,
    fieldVisibility: FIELD_VISIBILITY,
    validation: VALIDATION_RULES,
    autoGeneration: AUTO_GENERATION,
    statusWorkflow: STATUS_WORKFLOW,
    referenceData: REFERENCE_DATA_ENDPOINTS
};

export default FORMULA_CREATION_CONFIG;
