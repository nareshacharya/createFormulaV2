/**
 * Formula Creation Type Definitions
 * 
 * Defines exact TypeScript interfaces matching Pega Constellation payload structures
 * for formula creation, versioning, sharing, and analytical formula operations.
 * 
 * All field names use PascalCase to match Pega specification exactly.
 * All payloads wrapped in { data: {...} } structure per Pega requirements.
 * 
 * User Stories:
 * - US #1108: Formula Creation (Base, Dilution, Perfumer formulas)
 * - US #1137: Analytical Formula
 * - US #2202: File Import (future, base infrastructure ready)
 */

/**
 * Formula Type Enum
 * Exact values as required by Pega (note: Analytical and Perfumer include spaces)
 */
export type PegaFormulaType = "BASE" | "DILUTION" | "ANALYTICAL" | "PERFUMER";

/**
 * D_CreateFormula Payload
 * Used to create new formula records in Pega
 * 
 * User Story: US #1108, US #1137
 * Mandatory fields depend on formula type:
 * - Base/Dilution: FormulaType, FragranceName, Country, IncludeInInventory
 * - Analytical: FormulaType, SampleID (must be unique)
 * - Perfumer: FormulaType, FragranceName, Country, IncludeInInventory
 */
export interface CreateFormulaPayload {
    data: {
        // Formula Identification
        FormulaType: PegaFormulaType;
        FragranceName?: string; // Optional for Analytical (not applicable)
        SampleID?: string; // Required for Analytical, must be unique
        FormulaCodeID?: string; // Optional, system-generated if not provided

        // General Information
        Description?: string;
        Country?: string; // Required for Base/Dilution/Perfumer
        Region?: string;

        // Formula Details
        AlcoholConcentration?: number; // Percentage value
        FragranceActualDosage?: number; // PPM or other unit
        TargetFragranceDosage?: number;
        PreservativeConcentration?: number;

        // Ingredient Information
        FragranceIngredientUsage?: string; // Comment/notes
        TotalFragranceConcentration?: number;

        // Product Information
        ProductCategory?: string;
        ProductFormat?: string;
        IncludeInInventory?: boolean; // Default false for Base/Dilution/Perfumer

        // Project Reference
        ProjectID?: string;
        ProjectName?: string;

        // Status (always set to DRAFT on creation)
        FormulaStatus: "DRAFT";

        // Timestamps (system-generated, included for completeness)
        CreatedDate?: string; // ISO 8601 format
        ModifiedDate?: string; // ISO 8601 format
        CreatedByUserID?: string;
        ModifiedByUserID?: string;

        // Analytical Formula Specific Fields (Optional)
        AnalyticalVersion?: string;
        AnalyticalInterpretation?: string;
        AnalyticalMethod?: string;
        LabName?: string;
        LabDate?: string;

        // Perfumer Formula Specific Fields (Optional)
        PerfumerID?: string;
        PerfumerName?: string;
        PerfumerRegion?: string;

        // Additional Metadata
        InternalNotes?: string;
        ExternalNotes?: string;
        Tags?: string[]; // Array of tag strings
    };
}

/**
 * D_CreateFormulaVersion Payload
 * Used to link a formula to a specific version after creation
 * 
 * Flow: Create formula → Extract FormulaID → Create version
 * User Story: US #1108, US #1137
 */
export interface CreateFormulaVersionPayload {
    data: {
        // Version Information (required)
        FormulaID: string; // Returned from CreateFormula response
        VersionNumber: string; // Format: "FormulaID.number" e.g., "B00008.1"
        VersionDescription?: string;

        // Metadata
        CreatedDate?: string; // ISO 8601 format, typically current date
        ModifiedDate?: string;
        CreatedByUserID?: string;
        ModifiedByUserID?: string;
    };
}

/**
 * D_ShareFormula Payload
 * Used to share formula with other team members or groups
 * 
 * User Story: US #1108
 */
export interface ShareFormulaPayload {
    data: {
        // Required
        FormulaID: string; // Formula to share
        SharedWithUserID: string; // User or group ID to share with
        ShareType: "View" | "Edit"; // Permission level

        // Optional
        ShareMessage?: string; // Message to include with share
        ExpiryDate?: string; // ISO 8601 format
    };
}

/**
 * D_CreateAnalyticalFormula Payload
 * Used to create analytical formula record with extended fields
 * 
 * Triggered when user selects "Analytical Formula" type
 * Requires unique SampleID validation before calling this endpoint
 * 
 * User Story: US #1137
 */
export interface CreateAnalyticalFormulaPayload {
    data: {
        // Basic Information (required)
        FormulaType: "Analytical Formula";
        SampleID: string; // Must be unique, validated before API call
        FormulaStatus: "DRAFT";

        // Analytical Sample Information
        AnalyticalVersion?: string; // Version of analytical method used
        AnalyticalInterpretation?: string; // Interpretation of results
        AnalyticalMethod?: string; // GC, LC, MS, etc.
        AnalyticalComments?: string;

        // Lab Information
        LabName?: string; // Laboratory name
        LabCity?: string;
        LabCountry?: string;
        LabDate?: string; // ISO 8601 format
        LabAnalyst?: string; // Person who conducted analysis

        // Technical Parameters
        AlcoholConcentration?: number; // %
        FragranceConcentration?: number; // % or PPM
        ActualFragranceDosage?: number;
        TargetFragranceDosage?: number;
        PreservativeConcentration?: number;
        PreservativeName?: string;

        // Component Information
        ComponentCount?: number; // Number of components in formula
        TotalFragranceConcentration?: number;
        TotalAlcoholConcentration?: number;

        // Results & Analysis
        AnalyticalResult?: "Pass" | "Fail" | "Conditional" | "Not Tested";
        AnalyticalCertification?: boolean;
        AnalyticalRemarks?: string;

        // Related Reference
        BaseFormulaID?: string; // Link to base formula if applicable
        ReferenceFormulaID?: string;

        // Project & Country (required)
        Country?: string;
        Region?: string;
        ProjectID?: string;
        ProjectName?: string;

        // Metadata
        Description?: string;
        InternalNotes?: string;
        ExternalNotes?: string;

        CreatedDate?: string;
        ModifiedDate?: string;
        CreatedByUserID?: string;
        ModifiedByUserID?: string;
    };
}

/**
 * Response from CreateFormula endpoint
 * Returned after successful formula creation
 */
export interface CreateFormulaResponse {
    success: boolean;
    data?: {
        FormulaID: string; // Unique identifier for the created formula
        FormulaCodeID?: string;
        FragranceName?: string;
        SampleID?: string;
        FormulaType: PegaFormulaType;
        FormulaStatus: "DRAFT";
        CreatedDate: string;
        PerfumerFormulaID?: string; // For Perfumer formulas
        AnalyticalFormulaID?: string; // For Analytical formulas
    };
    error?: {
        code: string;
        message: string;
        details?: string;
    };
}

/**
 * Response from CreateFormulaVersion endpoint
 */
export interface CreateFormulaVersionResponse {
    success: boolean;
    data?: {
        FormulaID: string;
        VersionNumber: string;
        CreatedDate: string;
    };
    error?: {
        code: string;
        message: string;
    };
}

/**
 * Response from ShareFormula endpoint
 */
export interface ShareFormulaResponse {
    success: boolean;
    data?: {
        FormulaID: string;
        SharedWithUserID: string;
        ShareType: "View" | "Edit";
        SharedDate: string;
    };
    error?: {
        code: string;
        message: string;
    };
}

/**
 * Response from CreateAnalyticalFormula endpoint
 */
export interface CreateAnalyticalFormulaResponse {
    success: boolean;
    data?: {
        FormulaID: string;
        AnalyticalFormulaID: string;
        SampleID: string;
        FormulaStatus: "DRAFT";
        CreatedDate: string;
    };
    error?: {
        code: string;
        message: string;
    };
}

/**
 * Response from CheckDuplicateSampleID endpoint
 * Used to validate Sample ID uniqueness before creating analytical formula
 */
export interface CheckDuplicateSampleIDResponse {
    success: boolean;
    data?: {
        SampleID: string;
        Exists: boolean; // true if Sample ID already exists
        ExistingFormulaID?: string; // If exists, returns the formula ID
    };
    error?: {
        code: string;
        message: string;
    };
}

/**
 * Validation Result Type
 * Returned by validation functions
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings?: ValidationWarning[];
}

/**
 * Validation Error
 * Contains field name and error message
 */
export interface ValidationError {
    field: string;
    message: string;
    code?: string; // Error code for programmatic handling
}

/**
 * Validation Warning
 * Non-blocking validation issues
 */
export interface ValidationWarning {
    field: string;
    message: string;
}

/**
 * Internal Formula Data Type
 * Used for form state management in UI components
 * Maps from Pega PascalCase back to camelCase for UI convenience
 */
export interface NewFormulaData {
    // Formula Identification
    formulaType: PegaFormulaType;
    name?: string; // Combined fragrance name / formula name
    fragranceName?: string; // Legacy support
    sampleID?: string;
    formulaCodeID?: string;

    // General Information
    description?: string;
    country?: string;
    region?: string;

    // Formula Details
    alcoholConcentration?: number;
    fragranceActualDosage?: number;
    targetFragranceDosage?: number;
    preservativeConcentration?: number;

    // Ingredient Information
    fragranceIngredientUsage?: string;
    totalFragranceConcentration?: number;

    // Product Information
    productCategory?: string;
    productFormat?: string;
    includeInInventory?: boolean;

    // Project Reference
    projectID?: string;
    projectName?: string;

    // Analytical Formula Specific
    analyticalVersion?: string;
    analyticalInterpretation?: string;
    analyticalMethod?: string;
    labName?: string;
    labDate?: string;

    // Perfumer Formula Specific
    perfumerID?: string;
    perfumerName?: string;
    perfumerRegion?: string;

    // Additional Metadata
    internalNotes?: string;
    externalNotes?: string;
    tags?: string[];
}

/**
 * Pega Error Response
 * Standard error format from Pega DX API
 */
export interface PegaApiError {
    error: {
        code: string;
        message: string;
        details?: {
            field?: string;
            description?: string;
        };
    };
}

/**
 * API Error with categorization
 * Used internally for error handling
 */
export interface CategorizedApiError extends Error {
    code: string;
    statusCode?: number;
    category: "validation" | "duplicate" | "auth" | "network" | "server" | "unknown";
    details?: Record<string, unknown>;
}

/**
 * Formula Creation Request Context
 * Contains all metadata for a formula creation request
 */
export interface FormulaCreationContext {
    userId: string; // Current user ID
    timestamp: string; // ISO 8601 format
    sessionID: string; // Workspace session ID
    formulaType: PegaFormulaType;
    isDraft: boolean; // true during creation
}

/**
 * Formula Update Request Context
 * Contains metadata for formula update requests (from details modal)
 */
export interface FormulaUpdateContext {
    userId: string; // Current user ID
    timestamp: string; // ISO 8601 format
    formulaID: string; // Formula being updated
    previousStatus: string; // Status before update
    updateReason?: string; // Why the update is being made
}

/**
 * Analytical Formula Method Types (US #2202)
 * Different analysis methods for compositional data
 */
export type AnalyticalMethodType = "DB_VALIDATE" | "AMDIS_FULL" | "AMDIS_SCREEN";

export const ANALYTICAL_METHOD_TYPES = {
    DB_VALIDATE: "DB_VALIDATE",
    AMDIS_FULL: "AMDIS_FULL",
    AMDIS_SCREEN: "AMDIS_SCREEN",
} as const;

export const ANALYTICAL_METHOD_LABELS: Record<AnalyticalMethodType, string> = {
    DB_VALIDATE: "DB Validate",
    AMDIS_FULL: "AMDIS Full",
    AMDIS_SCREEN: "AMDIS Screen",
};

/**
 * Parsed Ingredient from Analytical Composition File
 */
export interface AnalyticalCompositionIngredient {
    name: string;
    percentage: number;
    retentionTime?: number; // For chromatography data
    peakArea?: number; // For spectral data
    matchQuality?: number; // Match quality score (0-100)
    mappedIngredientId: string | null;
    status: "matched" | "unmatched" | "pending";
}

/**
 * Analytical Composition Upload Data
 * Used for US #2202 - Import Analytical Sample File
 */
export interface AnalyticalCompositionUpload {
    sampleID: string; // Linked to the analytical formula
    methodType: AnalyticalMethodType; // Which analysis method was used
    ingredients: AnalyticalCompositionIngredient[];
    sheetName: string; // Name of Excel sheet imported from
    importDate: string; // ISO 8601 format
    fileHash?: string; // For duplicate detection
}
