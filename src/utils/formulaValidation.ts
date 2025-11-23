/**
 * Formula Validation Utilities
 * 
 * Provides validation logic for formula creation and editing across all formula types.
 * Ensures mandatory fields are present per user stories #1108, #1137, #2202.
 * 
 * Used by:
 * - FormulaModal (creation flow)
 * - FormulaDetailsModal (edit flow)
 * - API service layer (before submission)
 */

import type {
    PegaFormulaType,
    CreateFormulaPayload,
    CreateAnalyticalFormulaPayload,
    NewFormulaData,
    ValidationResult,
    ValidationError,
    ValidationWarning,
} from "../types/formula.creation.types";

/**
 * FormulaValidator Class
 * Centralized validation for all formula types
 * Supports both creation and edit scenarios
 */
export class FormulaValidator {
    /**
     * Validate formula data based on type
     * Routes to type-specific validation
     */
    static validateFormula(
        data: Partial<NewFormulaData>,
        formulaType: PegaFormulaType
    ): ValidationResult {
        switch (formulaType) {
            case "BASE":
                return this.validateBaseFormula(data);
            case "DILUTION":
                return this.validateDilutionFormula(data);
            case "ANALYTICAL":
                return this.validateAnalyticalFormula(data);
            case "PERFUMER":
                return this.validatePerfumerFormula(data);
            default:
                return {
                    isValid: false,
                    errors: [{ field: "formulaType", message: "Invalid formula type" }],
                };
        }
    }

    /**
     * Validate Base Formula
     * User Story: US #1108
     * Mandatory: FormulaType, FragranceName, Country, IncludeInInventory
     */
    static validateBaseFormula(data: Partial<NewFormulaData>): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Required fields per US #1108
        if (!data.name || data.name.trim() === "") {
            errors.push({
                field: "name",
                message: "Fragrance Name is required",
                code: "MISSING_FRAGRANCE_NAME",
            });
        } else if (data.name.length > 200) {
            errors.push({
                field: "name",
                message: "Fragrance Name cannot exceed 200 characters",
                code: "FRAGRANCE_NAME_TOO_LONG",
            });
        }

        if (!data.country || data.country.trim() === "") {
            errors.push({
                field: "country",
                message: "Country is required",
                code: "MISSING_COUNTRY",
            });
        }

        // includeInInventory defaults to false if not specified
        if (data.includeInInventory === undefined) {
            warnings.push({
                field: "includeInInventory",
                message: "Default value (false) will be used if not specified",
            });
        }

        // Validate numerical fields if provided
        if (data.alcoholConcentration !== undefined) {
            if (
                data.alcoholConcentration < 0 ||
                data.alcoholConcentration > 100
            ) {
                errors.push({
                    field: "alcoholConcentration",
                    message: "Alcohol Concentration must be between 0 and 100",
                    code: "INVALID_ALCOHOL_CONCENTRATION",
                });
            }
        }

        if (data.fragranceActualDosage !== undefined) {
            if (data.fragranceActualDosage < 0) {
                errors.push({
                    field: "fragranceActualDosage",
                    message: "Fragrance Actual Dosage cannot be negative",
                    code: "INVALID_FRAGRANCE_DOSAGE",
                });
            }
        }

        if (data.preservativeConcentration !== undefined) {
            if (
                data.preservativeConcentration < 0 ||
                data.preservativeConcentration > 100
            ) {
                errors.push({
                    field: "preservativeConcentration",
                    message: "Preservative Concentration must be between 0 and 100",
                    code: "INVALID_PRESERVATIVE_CONCENTRATION",
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings: warnings.length > 0 ? warnings : undefined,
        };
    }

    /**
     * Validate Dilution Formula
     * User Story: US #1108
     * Mandatory: Same as Base (inherits requirements)
     * Additional: Should reference a base formula
     */
    static validateDilutionFormula(data: Partial<NewFormulaData>): ValidationResult {
        // Dilution formulas have same mandatory requirements as Base
        const baseValidation = this.validateBaseFormula(data);

        const warnings: ValidationWarning[] = [...(baseValidation.warnings || [])];

        // Add dilution-specific validation
        if (!data.fragranceActualDosage) {
            warnings.push({
                field: "fragranceActualDosage",
                message:
                    "Fragrance Actual Dosage is recommended for dilution formulas",
            });
        }

        return {
            isValid: baseValidation.isValid,
            errors: baseValidation.errors,
            warnings: warnings.length > 0 ? warnings : undefined,
        };
    }

    /**
     * Validate Analytical Formula
     * User Story: US #1137
     * Mandatory: FormulaType, SampleID (must be unique - checked separately)
     * Note: FragranceName is not required for analytical formulas
     */
    static validateAnalyticalFormula(
        data: Partial<NewFormulaData>
    ): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Required fields per US #1137
        if (!data.sampleID || data.sampleID.trim() === "") {
            errors.push({
                field: "sampleID",
                message: "Sample ID is required for analytical formulas",
                code: "MISSING_SAMPLE_ID",
            });
        } else if (data.sampleID.length > 50) {
            errors.push({
                field: "sampleID",
                message: "Sample ID cannot exceed 50 characters",
                code: "SAMPLE_ID_TOO_LONG",
            });
        } else if (!this.isValidSampleIDFormat(data.sampleID)) {
            errors.push({
                field: "sampleID",
                message:
                    "Sample ID format invalid. Use alphanumeric characters and hyphens only",
                code: "INVALID_SAMPLE_ID_FORMAT",
            });
        }

        // Country is optional for analytical but recommended
        if (!data.country) {
            warnings.push({
                field: "country",
                message: "Country is recommended for tracking purposes",
            });
        }

        // Validate numerical fields if provided
        if (data.alcoholConcentration !== undefined) {
            if (
                data.alcoholConcentration < 0 ||
                data.alcoholConcentration > 100
            ) {
                errors.push({
                    field: "alcoholConcentration",
                    message: "Alcohol Concentration must be between 0 and 100",
                    code: "INVALID_ALCOHOL_CONCENTRATION",
                });
            }
        }

        // Lab date validation if provided
        if (data.labDate) {
            if (!this.isValidISODate(data.labDate)) {
                errors.push({
                    field: "labDate",
                    message: "Lab Date must be in valid ISO 8601 format (YYYY-MM-DD)",
                    code: "INVALID_LAB_DATE_FORMAT",
                });
            }
        }

        // AnalyticalResult validation if provided
        if (data.analyticalInterpretation) {
            if (data.analyticalInterpretation.length > 1000) {
                errors.push({
                    field: "analyticalInterpretation",
                    message:
                        "Analytical Interpretation cannot exceed 1000 characters",
                    code: "ANALYTICAL_INTERPRETATION_TOO_LONG",
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings: warnings.length > 0 ? warnings : undefined,
        };
    }

    /**
     * Validate Perfumer Formula
     * User Story: US #1108
     * Mandatory: Same as Base + Perfumer information
     */
    static validatePerfumerFormula(data: Partial<NewFormulaData>): ValidationResult {
        // Perfumer formulas have same base requirements
        const baseValidation = this.validateBaseFormula(data);

        const warnings: ValidationWarning[] = [...(baseValidation.warnings || [])];

        // Perfumer-specific validation
        if (data.perfumerID && data.perfumerID.length > 50) {
            baseValidation.errors.push({
                field: "perfumerID",
                message: "Perfumer ID cannot exceed 50 characters",
                code: "PERFUMER_ID_TOO_LONG",
            });
        }

        return {
            isValid: baseValidation.isValid && baseValidation.errors.length === 0,
            errors: baseValidation.errors,
            warnings: warnings.length > 0 ? warnings : undefined,
        };
    }

    /**
     * Helper: Validate Sample ID format
     * Allows alphanumeric, hyphens, underscores
     */
    private static isValidSampleIDFormat(sampleID: string): boolean {
        const regex = /^[a-zA-Z0-9\-_]+$/;
        return regex.test(sampleID);
    }

    /**
     * Helper: Validate ISO 8601 date format
     */
    private static isValidISODate(dateString: string): boolean {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;

        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }

    /**
     * Build CreateFormulaPayload from UI form data
     * Converts camelCase NewFormulaData to PascalCase Pega payload
     * Sets status to DRAFT and includes user context
     */
    static buildCreateFormulaPayload(
        formData: Partial<NewFormulaData>,
        userId: string,
        timestamp: string
    ): CreateFormulaPayload {
        return {
            data: {
                // Required fields
                FormulaType: formData.formulaType || "BASE",
                FragranceName: formData.name || formData.fragranceName,
                SampleID: formData.sampleID,
                FormulaCodeID: formData.formulaCodeID,

                // General Information
                Description: formData.description,
                Country: formData.country,
                Region: formData.region,

                // Formula Details
                AlcoholConcentration: formData.alcoholConcentration,
                FragranceActualDosage: formData.fragranceActualDosage,
                TargetFragranceDosage: formData.targetFragranceDosage,
                PreservativeConcentration: formData.preservativeConcentration,

                // Ingredient Information
                FragranceIngredientUsage: formData.fragranceIngredientUsage,
                TotalFragranceConcentration: formData.totalFragranceConcentration,

                // Product Information
                ProductCategory: formData.productCategory,
                ProductFormat: formData.productFormat,
                IncludeInInventory: formData.includeInInventory ?? false,

                // Project Reference
                ProjectID: formData.projectID,
                ProjectName: formData.projectName,

                // Status always DRAFT on creation
                FormulaStatus: "DRAFT",

                // Metadata
                CreatedDate: timestamp,
                CreatedByUserID: userId,
                ModifiedDate: timestamp,
                ModifiedByUserID: userId,

                // Analytical Fields
                AnalyticalVersion: formData.analyticalVersion,
                AnalyticalInterpretation: formData.analyticalInterpretation,
                AnalyticalMethod: formData.analyticalMethod,
                LabName: formData.labName,
                LabDate: formData.labDate,

                // Perfumer Fields
                PerfumerID: formData.perfumerID,
                PerfumerName: formData.perfumerName,
                PerfumerRegion: formData.perfumerRegion,

                // Additional Metadata
                InternalNotes: formData.internalNotes,
                ExternalNotes: formData.externalNotes,
                Tags: formData.tags,
            },
        };
    }

    /**
     * Build CreateAnalyticalFormulaPayload from UI form data
     * Similar to buildCreateFormulaPayload but tailored for analytical formulas
     */
    static buildCreateAnalyticalFormulaPayload(
        formData: Partial<NewFormulaData>,
        userId: string,
        timestamp: string
    ): CreateAnalyticalFormulaPayload {
        return {
            data: {
                // Required
                FormulaType: "Analytical Formula",
                SampleID: formData.sampleID || "",
                FormulaStatus: "DRAFT",

                // Analytical Sample Information
                AnalyticalVersion: formData.analyticalVersion,
                AnalyticalInterpretation: formData.analyticalInterpretation,
                AnalyticalMethod: formData.analyticalMethod,
                AnalyticalComments: formData.description,

                // Lab Information
                LabName: formData.labName,
                LabDate: formData.labDate,
                LabAnalyst: userId,

                // Technical Parameters
                AlcoholConcentration: formData.alcoholConcentration,
                FragranceConcentration: formData.fragranceActualDosage,
                ActualFragranceDosage: formData.fragranceActualDosage,
                TargetFragranceDosage: formData.targetFragranceDosage,
                PreservativeConcentration: formData.preservativeConcentration,

                // Component Information
                TotalFragranceConcentration: formData.totalFragranceConcentration,
                TotalAlcoholConcentration: formData.alcoholConcentration,

                // Project & Country
                Country: formData.country,
                Region: formData.region,
                ProjectID: formData.projectID,
                ProjectName: formData.projectName,

                // Metadata
                Description: formData.description,
                InternalNotes: formData.internalNotes,
                ExternalNotes: formData.externalNotes,

                CreatedDate: timestamp,
                CreatedByUserID: userId,
                ModifiedDate: timestamp,
                ModifiedByUserID: userId,
            },
        };
    }

    /**
     * Map UI formula type to Pega formula type
     * Handles conversion between internal and Pega formats
     */
    static mapFormulaType(uiType: string): PegaFormulaType {
        const typeMap: Record<string, PegaFormulaType> = {
            base: "BASE",
            dilution: "DILUTION",
            analytical: "ANALYTICAL",
            analyticalformula: "ANALYTICAL",
            perfumer: "PERFUMER",
            perfumerformula: "PERFUMER",
        };

        const normalized = uiType.toLowerCase();
        return typeMap[normalized] || "BASE";
    }

    /**
     * Validate field name consistency
     * Ensures UI field names match Pega expectations
     */
    static validateFieldNameMapping(
        uiFieldName: string
    ): { isValid: boolean; pegaFieldName?: string; message?: string } {
        const fieldMap: Record<string, string> = {
            name: "FragranceName",
            fragranceName: "FragranceName",
            sampleID: "SampleID",
            formulaCodeID: "FormulaCodeID",
            description: "Description",
            country: "Country",
            region: "Region",
            alcoholConcentration: "AlcoholConcentration",
            fragranceActualDosage: "FragranceActualDosage",
            targetFragranceDosage: "TargetFragranceDosage",
            preservativeConcentration: "PreservativeConcentration",
            productCategory: "ProductCategory",
            productFormat: "ProductFormat",
            includeInInventory: "IncludeInInventory",
            projectID: "ProjectID",
            projectName: "ProjectName",
            analyticalVersion: "AnalyticalVersion",
            analyticalInterpretation: "AnalyticalInterpretation",
            analyticalMethod: "AnalyticalMethod",
            labName: "LabName",
            labDate: "LabDate",
            perfumerID: "PerfumerID",
            perfumerName: "PerfumerName",
        };

        const pegaFieldName = fieldMap[uiFieldName];
        if (!pegaFieldName) {
            return {
                isValid: false,
                message: `Unknown field name: ${uiFieldName}`,
            };
        }

        return {
            isValid: true,
            pegaFieldName,
        };
    }

    /**
     * Sanitize user input
     * Removes potentially harmful characters but preserves valid input
     */
    static sanitizeInput(value: string): string {
        if (typeof value !== "string") return "";

        // Remove leading/trailing whitespace
        let sanitized = value.trim();

        // Remove null bytes
        sanitized = sanitized.replace(/\0/g, "");

        // Limit length to prevent DOS
        sanitized = sanitized.substring(0, 2000);

        return sanitized;
    }

    /**
     * Check if all mandatory fields are present for formula type
     */
    static hasMandatoryFields(
        data: Partial<NewFormulaData>,
        formulaType: PegaFormulaType
    ): boolean {
        switch (formulaType) {
            case "BASE":
            case "DILUTION":
            case "PERFUMER":
                return Boolean(
                    (data.name || data.fragranceName) &&
                    data.country
                );
            case "ANALYTICAL":
                return Boolean(data.sampleID);
            default:
                return false;
        }
    }
}

/**
 * Validation helper function
 * Quick validation without class instantiation
 */
export const validateFormula = (
    data: Partial<NewFormulaData>,
    formulaType: PegaFormulaType
): ValidationResult => {
    return FormulaValidator.validateFormula(data, formulaType);
};

/**
 * Build payload helper function
 */
export const buildCreateFormulaPayload = (
    formData: Partial<NewFormulaData>,
    userId: string
): CreateFormulaPayload => {
    const timestamp = new Date().toISOString();
    return FormulaValidator.buildCreateFormulaPayload(formData, userId, timestamp);
};

/**
 * Build analytical payload helper function
 */
export const buildCreateAnalyticalFormulaPayload = (
    formData: Partial<NewFormulaData>,
    userId: string
): CreateAnalyticalFormulaPayload => {
    const timestamp = new Date().toISOString();
    return FormulaValidator.buildCreateAnalyticalFormulaPayload(
        formData,
        userId,
        timestamp
    );
};
