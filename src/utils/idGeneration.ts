/**
 * ID Generation Utility for Formula Management
 * 
 * Implements the versioning and ID generation logic as per BA requirements.
 * 
 * KEY CONCEPTS FROM USER STORY:
 * - Formula ID (Theme): F00001 - Unique across all formulas, increments continuously
 * - Trial Version: .1, .2, .3 etc. - Represents iterations within a theme
 * - Perfumer Formula ID: [INITIALS][NUMBER].[VERSION] (e.g., MZ00001.1)
 * - U-Code: UAD00001A - Generated when formula is locked
 * 
 * OUR IMPLEMENTATION FORMAT (with slight modification):
 * - Formula ID: F00001v1 (using 'v' instead of '.' for clarity)
 * - Perfumer Formula ID: MZ00001v1 (user initials + number + version)
 * - Type-specific IDs: 
 *   - Base: B00001v1
 *   - Dilution: D00001v1
 *   - Analytical: A00001v1
 *   - Perfumer: NP00001v1 (where NP are user initials)
 * 
 * VERSIONING LOGIC:
 * - Same user copying own formula: Increment version (v1 -> v2 -> v3)
 * - Different user copying formula: New initials, restart at v1
 * - Formula ID continues incrementing regardless of type
 */

import type { FormulaType } from "../config/formulaTypes.config";
import { FORMULA_TYPES } from "../config/formulaTypes.config";

/**
 * Perfumer directory - should be fetched from Pega in production
 * Default to 'AA' if no user available
 */
export const PERFUMER_DIRECTORY: Record<string, string> = {
  'AC': 'Clemente, Augustin',
  'AD': 'Dulio, Andrea',
  'DC': "C'Ailceta, Daniel",
  'JM': 'Mastrocola, John',
  'JP': 'Jean-Pascal, Osmont',
  'ML': 'Lenoir, Mathieu',
  'MZ': 'Montejo-Coll, Mariazel',
  'RK': 'Kumar, Raj',
  'TS': 'Thierry, Suong',
  'VC': 'Vincent, Chevalier',
  'ZF': 'Jose, Juarez',
  'MK': 'Makarand',
  'NP': 'Pentapati, Naresh',
  'AA': 'Default User'
};

/**
 * Get current user initials
 * In production, this should fetch from Pega user service
 */
export const getCurrentUserInitials = (): string => {
  // TODO: Replace with actual Pega user service call
  // For now, return 'AA' as default if no user
  return localStorage.getItem('userInitials') || 'AA';
};

/**
 * Set current user initials (for testing/mock purposes)
 */
export const setCurrentUserInitials = (initials: string): void => {
  if (PERFUMER_DIRECTORY[initials]) {
    localStorage.setItem('userInitials', initials);
  }
};

/**
 * Get type prefix for formula type
 */
const getTypePrefix = (formulaType: FormulaType): string => {
  switch (formulaType) {
    case FORMULA_TYPES.BASE:
      return 'B';
    case FORMULA_TYPES.DILUTION:
      return 'D';
    case FORMULA_TYPES.ANALYTICAL:
      return 'A';
    case FORMULA_TYPES.PERFUMER:
      return ''; // Perfumer uses user initials instead of type prefix
    default:
      return 'F';
  }
};

/**
 * Parse a Formula ID to extract components
 * Supports multiple formats:
 * - F00001v1 (Theme-based)
 * - B00001v1 (Base)
 * - D00001v1 (Dilution)
 * - A00001v1 (Analytical)
 * - MZ00001v1 (Perfumer with initials)
 */
export interface ParsedFormulaId {
  prefix: string;           // F, B, D, A, or user initials (MZ, etc.)
  sequenceNumber: number;   // 00001
  version: number;          // 1 from v1
  fullId: string;           // Complete ID
  isPerfumerFormula: boolean;
  userInitials?: string;    // Only for perfumer formulas
}

export const parseFormulaId = (formulaId: string): ParsedFormulaId | null => {
  // Match patterns:
  // - F00001v1, B00001v1, D00001v1, A00001v1 (single letter + 5 digits + version)
  // - MZ00001v1, NP00001v1 (2-3 letters + 5 digits + version)
  const match = formulaId.match(/^([A-Z]{1,3})(\d{5})v(\d+)$/);
  
  if (!match) {
    return null;
  }

  const [, prefix, seqStr, versionStr] = match;
  const sequenceNumber = parseInt(seqStr, 10);
  const version = parseInt(versionStr, 10);

  // Check if it's a perfumer formula (2-3 letter prefix that's in the directory)
  const isPerfumerFormula = prefix.length > 1 && PERFUMER_DIRECTORY[prefix] !== undefined;

  return {
    prefix,
    sequenceNumber,
    version,
    fullId: formulaId,
    isPerfumerFormula,
    userInitials: isPerfumerFormula ? prefix : undefined
  };
};

/**
 * Get next sequence number for a given prefix
 * Looks through existing formulas and finds the highest number with the same prefix
 */
export const getNextSequenceNumber = (
  existingFormulas: Array<{ id: string }>,
  prefix: string
): number => {
  let maxNumber = 0;

  existingFormulas.forEach((formula) => {
    const parsed = parseFormulaId(formula.id);
    if (parsed && parsed.prefix === prefix) {
      if (parsed.sequenceNumber > maxNumber) {
        maxNumber = parsed.sequenceNumber;
      }
    }
  });

  return maxNumber + 1;
};

/**
 * Get next version number for a user's formulas based on sequence number
 * When a user creates a new version of their own formula (same sequence number)
 */
export const getNextVersionNumber = (
  existingFormulas: Array<{ id: string }>,
  prefix: string,
  sequenceNumber: number
): number => {
  let maxVersion = 0;

  existingFormulas.forEach((formula) => {
    const parsed = parseFormulaId(formula.id);
    if (parsed && 
        parsed.prefix === prefix && 
        parsed.sequenceNumber === sequenceNumber) {
      if (parsed.version > maxVersion) {
        maxVersion = parsed.version;
      }
    }
  });

  return maxVersion + 1;
};

/**
 * Configuration for ID generation
 */
export interface IdGenerationConfig {
  formulaType: FormulaType;
  userInitials?: string;
  existingFormulas: Array<{ id: string; createdBy?: string }>;
  baseFormulaId?: string;        // If creating a version/copy of existing formula
  isUserCopy?: boolean;          // If current user is copying their own formula
}

/**
 * Generate Formula ID based on type and context
 * 
 * SCENARIOS:
 * 1. New formula (no base): Generate new ID with v1
 * 2. User creating version of own formula: Keep sequence, increment version
 * 3. Different user copying formula: New sequence for that user, v1
 */
export const generateFormulaId = (config: IdGenerationConfig): string => {
  const {
    formulaType,
    userInitials: providedInitials,
    existingFormulas,
    baseFormulaId,
    isUserCopy = false
  } = config;

  const userInitials = providedInitials || getCurrentUserInitials();

  // Determine prefix based on formula type
  let prefix: string;
  if (formulaType === FORMULA_TYPES.PERFUMER) {
    prefix = userInitials;
  } else {
    prefix = getTypePrefix(formulaType);
  }

  // CASE 1: Creating a new version of user's own formula
  if (baseFormulaId && isUserCopy) {
    const parsed = parseFormulaId(baseFormulaId);
    if (parsed && parsed.prefix === prefix) {
      // Same prefix (same user for perfumer, same type for others)
      // Get next version for this sequence number
      const nextVersion = getNextVersionNumber(
        existingFormulas,
        prefix,
        parsed.sequenceNumber
      );
      return `${prefix}${parsed.sequenceNumber.toString().padStart(5, '0')}v${nextVersion}`;
    }
  }

  // CASE 2: Different user copying OR new formula
  // Get next available sequence number for this prefix
  const nextSequence = getNextSequenceNumber(existingFormulas, prefix);
  const sequenceStr = nextSequence.toString().padStart(5, '0');
  
  return `${prefix}${sequenceStr}v1`;
};

/**
 * Generate Perfumer Formula ID specifically
 * Alias for generateFormulaId with PERFUMER type for clarity
 */
export const generatePerfumerFormulaId = (
  userInitials: string,
  existingFormulas: Array<{ id: string }>,
  baseFormulaId?: string,
  isUserCopy?: boolean
): string => {
  return generateFormulaId({
    formulaType: FORMULA_TYPES.PERFUMER,
    userInitials,
    existingFormulas,
    baseFormulaId,
    isUserCopy
  });
};

/**
 * Generate U-Code (Universal Code) when formula is locked
 * Format: UAD00001A, UAD00001B, UAD00001C
 * 
 * U-Codes increment the letter suffix for different versions within same theme
 */
export const generateUCode = (
  existingUCodes: string[],
  themeNumber: number
): string => {
  const prefix = 'UAD';
  const themeStr = themeNumber.toString().padStart(5, '0');
  
  // Find highest letter suffix for this theme
  const pattern = new RegExp(`^${prefix}${themeStr}([A-Z])$`);
  let maxCharCode = 64; // 'A' is 65
  
  existingUCodes.forEach(code => {
    const match = code.match(pattern);
    if (match) {
      const charCode = match[1].charCodeAt(0);
      if (charCode > maxCharCode) {
        maxCharCode = charCode;
      }
    }
  });
  
  const nextLetter = String.fromCharCode(maxCharCode + 1);
  return `${prefix}${themeStr}${nextLetter}`;
};

/**
 * Validate formula ID format
 */
export const isValidFormulaId = (formulaId: string): boolean => {
  const parsed = parseFormulaId(formulaId);
  return parsed !== null;
};

/**
 * Check if user owns this formula (for perfumer formulas)
 */
export const isOwnFormula = (
  formulaId: string,
  userInitials?: string
): boolean => {
  const initials = userInitials || getCurrentUserInitials();
  const parsed = parseFormulaId(formulaId);
  
  if (!parsed || !parsed.isPerfumerFormula) {
    return false;
  }
  
  return parsed.userInitials === initials;
};

/**
 * Get theme number from Formula ID
 * For integration with U-Code generation
 */
export const getThemeNumber = (formulaId: string): number | null => {
  const parsed = parseFormulaId(formulaId);
  return parsed ? parsed.sequenceNumber : null;
};

/**
 * Format version for display
 */
export const formatVersion = (version: number): string => {
  return `v${version}`;
};

/**
 * Pega Integration Functions (Placeholder)
 * These will be implemented when Pega integration is established
 */

export interface PegaIdResponse {
  formulaId: string;
  perfumerFormulaId?: string;
  uCode?: string;
  success: boolean;
  error?: string;
}

/**
 * Request ID generation from Pega
 * This is a placeholder - actual implementation will call Pega API
 */
export const requestPegaIdGeneration = async (
  _formulaType: FormulaType,
  _userInitials: string,
  _baseFormulaId?: string
): Promise<PegaIdResponse> => {
  // TODO: Implement actual Pega API call
  // For now, throw error to indicate Pega integration not available
  throw new Error('Pega integration not yet available - using fallback ID generation');
};

/**
 * Generate IDs with Pega integration (with fallback)
 * This function tries Pega first, falls back to local generation
 */
export const generateIdsWithPegaFallback = async (
  config: IdGenerationConfig
): Promise<{
  formulaId: string;
  perfumerFormulaId?: string;
  usingFallback: boolean;
}> => {
  try {
    // Try Pega integration first
    const response = await requestPegaIdGeneration(
      config.formulaType,
      config.userInitials || getCurrentUserInitials(),
      config.baseFormulaId
    );
    
    if (response.success) {
      return {
        formulaId: response.formulaId,
        perfumerFormulaId: response.perfumerFormulaId,
        usingFallback: false
      };
    }
  } catch (error) {
    console.warn('Pega ID generation failed, using fallback:', error);
  }
  
  // Fallback to local generation
  const formulaId = generateFormulaId(config);
  const perfumerFormulaId = config.formulaType === FORMULA_TYPES.PERFUMER
    ? formulaId
    : undefined;
    
  return {
    formulaId,
    perfumerFormulaId,
    usingFallback: true
  };
};

/**
 * Get the display ID for a formula (type-specific ID shown on data grid)
 * @param formula - Formula object
 * @returns The type-specific display ID (e.g., B00001v1, MZ00001v1)
 */
export const getFormulaDisplayId = (formula: {
  id: string;
  perfumerFormulaId?: string;
  baseFormulaId?: string;
  dilutionFormulaId?: string;
  analyticalFormulaId?: string;
}): string => {
  // Return type-specific ID if available, otherwise fall back to universal ID
  return (
    formula.perfumerFormulaId ||
    formula.baseFormulaId ||
    formula.dilutionFormulaId ||
    formula.analyticalFormulaId ||
    formula.id
  );
};
