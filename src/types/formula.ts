/**
 * Formula Type Definitions
 * 
 * Enhanced type definitions for formula creation and management
 * Supporting multiple formula types with conditional fields
 */

import type { FormulaType } from '../config/formulaTypes.config';

// Status types
export type FormulaStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'SUBMITTED';
export type AssessmentStatusType = 'NOT_ASSESSED' | 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW';

/**
 * Assessment Status for Compliance
 */
export interface AssessmentStatus {
    status: AssessmentStatusType;
    checkDate?: Date;
    complianceNotes?: string;
    checkedBy?: string;
}

/**
 * Project Reference Information
 * Displayed when formula is part of a project (US-1048)
 */
export interface ProjectReference {
    projectId: string;
    projectName: string;
    briefName?: string;
    briefDosageTarget?: number;  // %
    briefCptTarget?: number;      // $
    targetMarket?: string;
    client?: string;
}

/**
 * Formula Header - Complete Formula Metadata
 * Contains all fields from Business Analyst requirements
 */
export interface FormulaHeader {
    // ============================================================================
    // SYSTEM GENERATED FIELDS
    // ============================================================================

    /** Unique Formula ID - Auto-generated (US-1168) */
    formulaId: string;

    /** Perfumer Formula ID - Auto-generated for PERFUMER type (US-1255) */
    perfumerFormulaId?: string;

    /** Formula Status - Auto-set to DRAFT on creation */
    status: FormulaStatus;

    /** Formula Type */
    formulaType: FormulaType;

    /** Creation timestamp */
    createdDate: Date;

    /** Last modification timestamp */
    modifiedDate: Date;

    /** Created by user */
    createdBy: string;

    /** Last modified by user */
    modifiedBy: string;

    // ============================================================================
    // FORMULA INFORMATION (TableSubClass: Formula Information)
    // ============================================================================

    /** Formula Assessment Status - Indicates readiness for compliance */
    formulaAssessmentStatus?: AssessmentStatus;

    /** Actual Dosage Target set by Perfumer - Mandatory */
    fragranceDosageActual?: number;  // %

    /** Formula Version - Versioning control - Mandatory */
    formulaVersion: number;

    // ============================================================================
    // GENERAL INFORMATION (TableSubClass: General Information)
    // ============================================================================

    /** Business Category - Mandatory */
    category: string;

    /** Region for Fragrance Product - Mandatory */
    region: string;

    /** Country for Fragrance Product - Mandatory */
    country: string;

    /** SAP PLM Code - Optional */
    sapPlmCode?: string;

    /** LIMS Code - Optional */
    limsCode?: string;

    // ============================================================================
    // TYPE-SPECIFIC FIELDS
    // ============================================================================

    /** Fragrance Name - Mandatory for BASE, DILUTION, PERFUMER */
    fragranceName?: string;

    /** Sample ID - Mandatory for ANALYTICAL */
    sampleId?: string;

    // ============================================================================
    // PRODUCT INFORMATION (TableSubClass: Product Information)
    // ============================================================================

    /** Brand - Optional */
    brand?: string;

    /** Claims - Optional */
    claims?: string;

    /** Variant Name - Optional */
    variant?: string;

    /** Supplier - Optional */
    supplier?: string;

    /** Product Format - Mandatory */
    productFormat: string;

    /** Product production code - Optional */
    productionCode?: string;

    /** Product production date - Optional */
    productionDate?: Date;

    /** Recommended dosage level from Supplier - Optional */
    recommendedProductDosage?: number;

    /** Unit of recommended dosage - Optional */
    unitOfRecommendedDosage?: string;

    /** UFI Code - Auto-generated */
    ufiCode?: string;

    /** Other useful information on pack - Optional */
    commentOnProduct?: string;

    // ============================================================================
    // PROJECT REFERENCE (TableSubClass: Project Reference)
    // ============================================================================

    /** Project ID - Optional (FK to Project) */
    projectId?: string;

    /** Project Details - Populated if projectId exists (US-1048) */
    projectDetails?: ProjectReference;

    /** Reference CPT Target from Brief - Optional */
    briefCptTarget?: number;  // $

    /** Reference Dosage Target from Brief - Optional */
    briefFragranceDosageTarget?: number;  // %

    // ============================================================================
    // COMPOSITION (TableSubClass: Composition)
    // ============================================================================

    /** Formula Inclusion Level - Optional */
    formulaInclusionLevel?: number;  // %

    /** Total percentage of all ingredients */
    totalPercentage: number;

    /** Cost per kilogram */
    costPerKg?: number;

    /** List of ingredients in formula */
    ingredients: FormulaIngredient[];

    /** Olfactive notes classification */
    notes: {
        top: string[];
        middle: string[];
        base: string[];
    };

    /** Formula description */
    description: string;
}

/**
 * Formula Ingredient
 */
export interface FormulaIngredient {
    /** Unique identifier for this ingredient entry */
    id: string;

    /** Reference to ingredient master data */
    ingredientId: string;

    /** Ingredient name */
    name: string;

    /** Percentage in formula (0-100) */
    percentage: number;

    /** Ingredient type */
    type: string;

    /** Optional notes */
    notes?: string;

    /** Ingredient status in formula */
    status?: 'ACTIVE' | 'SUBSTITUTED' | 'REMOVED';

    /** Date added to formula */
    addedDate?: Date;

    /** If substituted, reference to replacement ingredient */
    substitutedWith?: string;
}

/**
 * Formula Composition Details
 */
export interface FormulaComposition {
    formulaId: string;
    ingredients: FormulaIngredient[];
    totalWeight: number;
    totalPercentage: number;
    inclusionLevel: number;  // % within product
    lastModified: Date;
}

/**
 * Dilution Information (if applicable)
 */
export interface DilutionInfo {
    dilutionId: string;
    dilutionPercentage: number;
    baseIngredient: string;
    dilutionRatio: string;
    solventUsed?: string;
}

/**
 * Validation Result
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings?: ValidationWarning[];
}

/**
 * Validation Error
 */
export interface ValidationError {
    field: string;
    message: string;
    code?: string;
}

/**
 * Validation Warning
 */
export interface ValidationWarning {
    field: string;
    message: string;
    code?: string;
}
