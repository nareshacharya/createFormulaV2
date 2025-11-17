/**
 * Form Field Model
 * 
 * Defines the structure and behavior of form fields in the formula creation process
 */

import type { FormulaType } from '../config/formulaTypes.config';

export type FieldType =
    | 'text'
    | 'select'
    | 'multi-select'
    | 'number'
    | 'date'
    | 'textarea'
    | 'radio'
    | 'radio-card'
    | 'checkbox'
    | 'autocomplete'
    | 'search'
    | 'display';

/**
 * Field Option (for select, radio, etc.)
 */
export interface FieldOption {
    value: string;
    label: string;
    description?: string;
    icon?: string;
    badge?: string;
    disabled?: boolean;
}

/**
 * Form Field Configuration
 */
export interface FormField {
    /** Unique field identifier (optional, defaults to name) */
    id?: string;

    /** Field name (matches data model property) */
    name: string;

    /** Display label */
    label: string;

    /** Field type */
    type: FieldType;

    /** Is field required */
    required: boolean;

    /** Validation rules */
    validation?: FieldValidation;

    /** Visibility rules */
    visibility?: FieldVisibility;

    /** Data source configuration */
    dataSource?: DataSourceConfig;

    /** Default value */
    defaultValue?: unknown;

    /** Placeholder text */
    placeholder?: string;

    /** Help text */
    helpText?: string;

    /** Maximum length for text fields */
    maxLength?: number;

    /** Minimum length for text fields */
    minLength?: number;

    /** Is field disabled */
    disabled?: boolean;

    /** Is field read-only */
    readOnly?: boolean;

    /** Field width (grid columns) */
    width?: number;

    /** CSS class name */
    className?: string;

    /** Options for select, radio, checkbox fields */
    options?: FieldOption[];

    /** Group identifier for field grouping */
    group?: string;
}

/**
 * Field Validation Rules
 */
export interface FieldValidation {
    /** Regular expression pattern */
    pattern?: RegExp;

    /** Minimum length for strings */
    minLength?: number;

    /** Maximum length for strings */
    maxLength?: number;

    /** Minimum value for numbers */
    min?: number;

    /** Maximum value for numbers */
    max?: number;

    /** Custom validation function */
    custom?: (value: unknown, formData?: Record<string, unknown>) => boolean;

    /** Validation message */
    message?: string;

    /** Error message */
    errorMessage?: string;

    /** Is field required */
    required?: boolean;

    /** Required error message */
    requiredMessage?: string;
}

/**
 * Field Visibility Rules
 */
export interface FieldVisibility {
    /** Show for these formula types */
    formulaTypes?: FormulaType[];

    /** Show for these formula types (alias) */
    showForTypes?: FormulaType[];

    /** Hide for these formula types */
    hideForTypes?: FormulaType[];

    /** Depends on another field (simple) */
    dependsOn?: string | string[] | {
        fieldId: string;
        value: unknown;
        operator?: 'equals' | 'notEquals' | 'in' | 'notIn' | 'greaterThan' | 'lessThan';
    };

    /** Custom visibility function */
    showWhen?: (formData: Record<string, unknown>) => boolean;
}

/**
 * Data Source Configuration
 */
export interface DataSourceConfig {
    /** Data source type */
    type: 'API' | 'CONFIG' | 'COMPUTED' | 'STATIC';

    /** API endpoint */
    apiEndpoint?: string;

    /** API endpoint (alias) */
    endpoint?: string;

    /** Configuration key */
    configKey?: string;

    /** Static options */
    options?: Array<{ value: string; label: string }>;

    /** Computed function */
    compute?: (formData: Record<string, unknown>) => unknown;

    /** Value field for API data */
    valueField?: string;

    /** Label field for API data */
    labelField?: string;

    /** Filter field for dependent data */
    filterBy?: string;

    /** Cache duration in seconds */
    cacheDuration?: number;

    /** Transform response function */
    transform?: (data: unknown) => Array<{ value: string; label: string }>;
}

/**
 * Field Group Configuration
 */
export interface FieldGroup {
    /** Group identifier */
    id: string;

    /** Group label */
    label: string;

    /** Group description */
    description?: string;

    /** Fields in this group */
    fields: FormField[];

    /** Is group collapsible */
    collapsible?: boolean;

    /** Is group collapsed by default */
    defaultCollapsed?: boolean;

    /** Group visibility rules */
    visibility?: FieldVisibility;
}

/**
 * Helper: Create form field
 */
export const createFormField = (config: Partial<FormField> & Pick<FormField, 'name' | 'label' | 'type'>): FormField => {
    return {
        id: config.id || config.name,
        required: false,
        disabled: false,
        readOnly: false,
        width: 12, // Full width by default
        ...config
    };
};

/**
 * Helper: Check if field is visible for formula type
 */
export const isFieldVisibleForType = (field: FormField, formulaType: FormulaType, formData?: Record<string, unknown>): boolean => {
    if (!field.visibility) {
        return true;
    }

    // Check formula type visibility (support both properties)
    const showForTypes = field.visibility.showForTypes || field.visibility.formulaTypes;
    if (showForTypes && !showForTypes.includes(formulaType)) {
        return false;
    }

    if (field.visibility.hideForTypes && field.visibility.hideForTypes.includes(formulaType)) {
        return false;
    }

    // Check dependency
    if (field.visibility.dependsOn && formData) {
        const dep = field.visibility.dependsOn;

        // Simple string dependency: check if field exists
        if (typeof dep === 'string') {
            if (!formData[dep]) return false;
        }
        // Array of field names: check if any exist
        else if (Array.isArray(dep)) {
            if (!dep.some(fieldId => formData[fieldId])) return false;
        }
        // Complex dependency with operator
        else {
            const { fieldId, value, operator = 'equals' } = dep;
            const dependentValue = formData[fieldId];

            switch (operator) {
                case 'equals':
                    if (dependentValue !== value) return false;
                    break;
                case 'notEquals':
                    if (dependentValue === value) return false;
                    break;
                case 'in':
                    if (!Array.isArray(value) || !value.includes(dependentValue)) return false;
                    break;
                case 'notIn':
                    if (Array.isArray(value) && value.includes(dependentValue)) return false;
                    break;
                case 'greaterThan':
                    if (!(Number(dependentValue) > Number(value))) return false;
                    break;
                case 'lessThan':
                    if (!(Number(dependentValue) < Number(value))) return false;
                    break;
                default:
                    break;
            }
        }
    }

    // Check custom visibility function
    if (field.visibility.showWhen && formData) {
        return field.visibility.showWhen(formData);
    }

    return true;
};

/**
 * Helper: Validate field value
 */
export const validateField = (field: FormField, value: unknown): { isValid: boolean; error?: string } => {
    if (!field.validation) {
        return { isValid: true };
    }

    const validation = field.validation;

    // Required validation
    if (field.required && (value === null || value === undefined || value === '')) {
        return {
            isValid: false,
            error: validation.requiredMessage || `${field.label} is required`
        };
    }

    // Skip other validations if value is empty and not required
    if (!field.required && (value === null || value === undefined || value === '')) {
        return { isValid: true };
    }

    // Pattern validation
    if (validation.pattern && typeof value === 'string' && !validation.pattern.test(value)) {
        return {
            isValid: false,
            error: validation.errorMessage || `${field.label} has invalid format`
        };
    }

    // Length validation
    if (typeof value === 'string') {
        if (validation.minLength && value.length < validation.minLength) {
            return {
                isValid: false,
                error: validation.errorMessage || `${field.label} must be at least ${validation.minLength} characters`
            };
        }
        if (validation.maxLength && value.length > validation.maxLength) {
            return {
                isValid: false,
                error: validation.errorMessage || `${field.label} must not exceed ${validation.maxLength} characters`
            };
        }
    }

    // Number validation
    if (typeof value === 'number') {
        if (validation.min !== undefined && value < validation.min) {
            return {
                isValid: false,
                error: validation.errorMessage || `${field.label} must be at least ${validation.min}`
            };
        }
        if (validation.max !== undefined && value > validation.max) {
            return {
                isValid: false,
                error: validation.errorMessage || `${field.label} must not exceed ${validation.max}`
            };
        }
    }

    // Custom validation
    if (validation.custom && !validation.custom(value)) {
        return {
            isValid: false,
            error: validation.errorMessage || `${field.label} is invalid`
        };
    }

    return { isValid: true };
};
