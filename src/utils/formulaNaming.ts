/**
 * Formula Naming Convention Utility
 * Generates formula IDs based on user initials and sequential numbering
 * Format: [USER_INITIALS]-F-[SEQUENTIAL_NUMBER]v[VERSION]
 * Example: JD-F-00001v1 (John Doe, Formula, #1, version 1)
 */

export interface FormulaNameConfig {
    userInitials: string;
    currentFormulas: Array<{ id: string; version: string }>;
    isReferenceFromOtherProject?: boolean;
    existingFormulaId?: string;
}

/**
 * Get user initials from current user
 * TODO: Replace with actual user service call
 */
export const getCurrentUserInitials = (): string => {
    // TODO: Replace with actual Pega user service
    // For now, return mock initials
    return "NP"; // Naresh Pentapati
};

/**
 * Get next sequential number based on existing formulas for a specific user
 * Finds highest number and increments
 */
export const getNextSequentialNumber = (
    existingFormulas: Array<{ id: string }>,
    userInitials: string
): string => {
    let maxNumber = 0;
    const prefix = `${userInitials}-F-`;

    existingFormulas.forEach((formula) => {
        // Extract number from formula ID
        // Format: XX-F-00001v1 or XX-F-00001_v2
        if (formula.id.startsWith(prefix)) {
            const match = formula.id.match(/F-(\d{5})(?:v\d+|_v\d+)?$/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNumber) {
                    maxNumber = num;
                }
            }
        }
    });

    // Increment and format with leading zeros
    const nextNumber = maxNumber + 1;
    return nextNumber.toString().padStart(5, "0");
};

/**
 * Parse version number from formula version string
 */
export const parseVersionNumber = (version: string): number => {
    const match = version.match(/v(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
};

/**
 * Generate next version string
 */
export const getNextVersion = (currentVersion: string): string => {
    const currentNum = parseVersionNumber(currentVersion);
    return `v${currentNum + 1}`;
};

/**
 * Generate new formula ID based on naming convention
 */
export const generateFormulaId = (config: FormulaNameConfig): string => {
    const {
        userInitials,
        currentFormulas,
        isReferenceFromOtherProject = false,
        existingFormulaId,
    } = config;

    // If creating a new version of existing formula (same project)
    if (!isReferenceFromOtherProject && existingFormulaId) {
        // Extract base ID without version suffix
        const baseId = existingFormulaId.replace(/(_v\d+|v\d+)$/, "");
        return baseId;
    }

    // Create new formula ID (new formula or reference from other project)
    const sequentialNumber = getNextSequentialNumber(currentFormulas, userInitials);
    return `${userInitials}-F-${sequentialNumber}`;
};

/**
 * Generate complete formula identifier with version
 */
export const generateFormulaIdentifier = (
    config: FormulaNameConfig,
    version: string = "v1"
): string => {
    const baseId = generateFormulaId(config);
    return `${baseId}${version}`;
};

/**
 * Check if formula is from another project
 * Compares user initials in formula ID with current user
 */
export const isFormulaFromOtherProject = (
    formulaId: string,
    currentUserInitials: string
): boolean => {
    // Extract user initials from formula ID (before '-F-')
    const match = formulaId.match(/^([A-Z]{2,3})-F-/);
    if (!match) {
        return false;
    }

    const formulaUserInitials = match[1];
    return formulaUserInitials !== currentUserInitials;
};

/**
 * Validate formula ID format
 */
export const isValidFormulaId = (formulaId: string): boolean => {
    // Format: [2-3 LETTERS]-F-[5 DIGITS][VERSION]
    // Example: NP-F-00001v1 or JD-F-00023v2
    const pattern = /^[A-Z]{2,3}-F-\d{5}(v\d+|_v\d+)?$/;
    return pattern.test(formulaId);
};
