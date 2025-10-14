/**
 * Formula Naming Convention Utility
 * Generates formula IDs based on user initials, product name, and sequential numbering
 * Format: [USER_INITIALS]F[PRODUCT_INITIALS][SEQUENTIAL_NUMBER]v[VERSION]
 * Example: JDF-PFRA-00001v1
 */

export interface FormulaNameConfig {
  userInitials: string;
  productName: string;
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
  return "JD"; // John Doe
};

/**
 * Extract product initials from product name
 * Takes first letter of each word, max 4 letters
 */
export const getProductInitials = (productName: string): string => {
  const words = productName
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  let initials = words.map((word) => word[0]).join("");

  // Limit to 4 characters
  if (initials.length > 4) {
    initials = initials.substring(0, 4);
  }

  return initials;
};

/**
 * Get next sequential number based on existing formulas
 * Finds highest number and increments
 */
export const getNextSequentialNumber = (
  existingFormulas: Array<{ id: string }>,
  prefix: string
): string => {
  let maxNumber = 0;

  existingFormulas.forEach((formula) => {
    // Extract number from formula ID
    // Format: PREFIX-00001v1 or PREFIX-00001_v2
    const match = formula.id.match(/(\d{5})(?:v\d+|_v\d+)?$/);
    if (match && formula.id.startsWith(prefix)) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) {
        maxNumber = num;
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
    productName,
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
  const productInitials = getProductInitials(productName);
  const prefix = `${userInitials}F-${productInitials}`;

  const sequentialNumber = getNextSequentialNumber(currentFormulas, prefix);

  return `${prefix}-${sequentialNumber}`;
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
  // Extract user initials from formula ID (before 'F')
  const match = formulaId.match(/^([A-Z]{2,3})F-/);
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
  // Format: [2-3 LETTERS]F-[2-4 LETTERS]-[5 DIGITS][VERSION]
  const pattern = /^[A-Z]{2,3}F-[A-Z]{2,4}-\d{5}(v\d+|_v\d+)?$/;
  return pattern.test(formulaId);
};
