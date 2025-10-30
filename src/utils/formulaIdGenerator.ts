/**
 * Formula ID Generator Utility
 * Centralized logic for generating formula IDs in the correct format
 * Format: [USER_INITIALS]-F-[SEQUENTIAL_NUMBER]v[VERSION]
 * Example: NP-F-00001v1 (Naresh Pentapati, Formula, #1, version 1)
 * 
 * This utility ensures consistent formula ID generation across the application
 * and makes it easy to change the format in the future if needed.
 */

import type { Formula } from "../services/pega";
import {
    getCurrentUserInitials,
    getNextSequentialNumber,
    getNextVersion,
    parseVersionNumber,
} from "./formulaNaming";

export interface FormulaIdGeneratorConfig {
    /** Current user initials (e.g., "NP") */
    userInitials?: string;
    /** List of all available formulas to check for sequential numbers */
    existingFormulas: Formula[];
    /** For versioning: the existing formula to create a new version from */
    baseFormula?: Formula;
    /** Whether this is a reference formula from another user/project */
    isReferenceFromOtherProject?: boolean;
}

/**
 * Generate a new formula ID
 * 
 * @param config - Configuration for ID generation
 * @returns Generated formula ID in format XX-F-00000v0
 */
export const generateNewFormulaId = (
    config: FormulaIdGeneratorConfig
): string => {
    const userInitials = config.userInitials || getCurrentUserInitials();
    const { existingFormulas, baseFormula, isReferenceFromOtherProject } = config;

    // CASE 1: Creating a new version of an existing formula (same user)
    if (baseFormula && !isReferenceFromOtherProject) {
        // Extract the base ID without version (e.g., "NP-F-00003" from "NP-F-00003v1")
        const baseId = baseFormula.id.replace(/(v\d+|_v\d+)$/, "");
        const nextVersion = getNextVersion(baseFormula.version);
        return `${baseId}${nextVersion}`;
    }

    // CASE 2: Creating a new formula or adapting from another project
    // Generate a completely new ID with v1
    const sequentialNumber = getNextSequentialNumber(
        existingFormulas,
        userInitials
    );
    return `${userInitials}-F-${sequentialNumber}v1`;
};

/**
 * Parse a formula ID to extract its components
 * 
 * @param formulaId - Formula ID to parse (e.g., "NP-F-00003v2")
 * @returns Parsed components or null if invalid format
 */
export const parseFormulaId = (
    formulaId: string
): {
    userInitials: string;
    sequentialNumber: string;
    version: string;
    versionNumber: number;
} | null => {
    // Format: XX-F-00000v0
    const match = formulaId.match(/^([A-Z]{2,3})-F-(\d{5})(v\d+|_v\d+)$/);

    if (!match) {
        return null;
    }

    const [, userInitials, sequentialNumber, versionStr] = match;
    const versionNumber = parseVersionNumber(versionStr);

    return {
        userInitials,
        sequentialNumber,
        version: versionStr.replace("_", ""), // Normalize _v to v
        versionNumber,
    };
};

/**
 * Check if a formula ID belongs to the current user
 * 
 * @param formulaId - Formula ID to check
 * @param currentUserInitials - Current user's initials (optional, will fetch if not provided)
 * @returns True if formula belongs to current user
 */
export const isOwnFormula = (
    formulaId: string,
    currentUserInitials?: string
): boolean => {
    const parsed = parseFormulaId(formulaId);
    if (!parsed) {
        return false;
    }

    const userInitials = currentUserInitials || getCurrentUserInitials();
    return parsed.userInitials === userInitials;
};

/**
 * Get the base formula ID without version suffix
 * 
 * @param formulaId - Formula ID with version (e.g., "NP-F-00003v2")
 * @returns Base ID without version (e.g., "NP-F-00003")
 */
export const getBaseFormulaId = (formulaId: string): string => {
    return formulaId.replace(/(v\d+|_v\d+)$/, "");
};

/**
 * Validate formula ID format
 * 
 * @param formulaId - Formula ID to validate
 * @returns True if valid format
 */
export const isValidFormulaIdFormat = (formulaId: string): boolean => {
    // Format: [2-3 LETTERS]-F-[5 DIGITS][VERSION]
    const pattern = /^[A-Z]{2,3}-F-\d{5}(v\d+|_v\d+)$/;
    return pattern.test(formulaId);
};
