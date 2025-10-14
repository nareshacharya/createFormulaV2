/**
 * Compounding Service
 * Handles preparation and submission of formula data for compounding via Pega DX API
 */

import type { Formula } from "./pega";

export interface CompoundingIngredient {
    id: string;
    name: string;
    casNumber?: string;
    amount: number;
    percentage: number;
    unit: string;
    cost?: number;
    contributionCost?: number;
    status: "active" | "pending" | "substituted" | "removed";
    fields: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    notes?: string;
}

export interface CompoundingAttribute {
    id: string;
    name: string;
    value: number | string;
    unit?: string;
    category: string;
    isCalculated: boolean;
    calculationMethod?: string;
}

export interface CompoundingFormula {
    id: string;
    name: string;
    version: string;
    targetTotal: number;
    unit: string;
    ingredients: CompoundingIngredient[];
    attributes: CompoundingAttribute[];
    metadata: {
        createdBy?: string;
        createdAt: Date;
        lastModified: Date;
        rmc: number; // Raw Material Cost
        totalAmount: number;
        status: "draft" | "ready" | "submitted" | "completed";
    };
}

export interface CompoundingSubmission {
    formula: CompoundingFormula;
    submittedBy: string;
    submittedAt: Date;
    priority: "low" | "normal" | "high" | "urgent";
    notes?: string;
    auditTrail: AuditEntry[];
}

export interface AuditEntry {
    timestamp: Date;
    action: string;
    description: string;
    user?: string;
    changes?: Record<string, { before: any; after: any }>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Prepare active formula for compounding submission
 * 
 * @param formula Active formula data
 * @param ingredients List of ingredients in the formula
 * @param attributes List of attributes for the formula
 * @param auditTrail History of changes for audit
 * @returns Prepared CompoundingFormula object
 */
export function prepareFormulaForCompounding(
    formula: Formula,
    ingredients: CompoundingIngredient[],
    attributes: CompoundingAttribute[],
    targetTotal: number = 100,
    _auditTrail?: AuditEntry[]
): CompoundingFormula {
    // Calculate RMC from contribution costs
    const rmc = ingredients.reduce(
        (sum, ing) => sum + (ing.contributionCost || 0),
        0
    );

    // Calculate total amount
    const totalAmount = ingredients.reduce(
        (sum, ing) => sum + ing.amount,
        0
    );

    return {
        id: formula.id,
        name: formula.name,
        version: formula.version,
        targetTotal: targetTotal,
        unit: "g", // Default unit
        ingredients: ingredients.map((ing) => ({
            ...ing,
            fields: {
                ...ing.fields,
                // Ensure all required fields are present
            },
        })),
        attributes: attributes.map((attr) => ({
            ...attr,
        })),
        metadata: {
            createdAt: new Date(),
            lastModified: new Date(),
            rmc,
            totalAmount,
            status: "ready",
        },
    };
}

/**
 * Validate formula data before submission
 */
export function validateFormulaForCompounding(
    formula: CompoundingFormula
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check formula has name and version
    if (!formula.name || formula.name.trim() === "") {
        errors.push("Formula name is required");
    }

    if (!formula.version || formula.version.trim() === "") {
        errors.push("Formula version is required");
    }

    // Check ingredients
    if (!formula.ingredients || formula.ingredients.length === 0) {
        errors.push("Formula must have at least one ingredient");
    }

    // Validate each ingredient
    formula.ingredients.forEach((ing, index) => {
        if (!ing.id) {
            errors.push(`Ingredient at position ${index + 1} is missing ID`);
        }
        if (!ing.name) {
            errors.push(`Ingredient at position ${index + 1} is missing name`);
        }
        if (ing.amount < 0) {
            errors.push(`Ingredient ${ing.name} has negative amount`);
        }
        if (ing.percentage < 0 || ing.percentage > 100) {
            errors.push(`Ingredient ${ing.name} has invalid percentage: ${ing.percentage}%`);
        }
    });

    // Check total percentage
    const totalPercentage = formula.ingredients.reduce(
        (sum, ing) => sum + ing.percentage,
        0
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
        errors.push(
            `Total ingredient percentage must equal 100% (current: ${totalPercentage.toFixed(2)}%)`
        );
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Submit formula for compounding via Pega DX API
 * 
 * @param submission Compounding submission data
 * @returns Promise with submission result
 */
export async function submitForCompounding(
    submission: CompoundingSubmission
): Promise<{ success: boolean; submissionId?: string; errors?: string[] }> {
    // Validate before submission
    const validation = validateFormulaForCompounding(submission.formula);
    if (!validation.isValid) {
        return {
            success: false,
            errors: validation.errors,
        };
    }

    try {
        // TODO: Replace with actual Pega DX API call
        // const response = await fetch('PEGA_DX_API_ENDPOINT/compounding', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': 'Bearer TOKEN'
        //   },
        //   body: JSON.stringify(submission)
        // });

        // Simulate API call for now
        console.log("Submitting formula for compounding:", submission);

        // Simulate success response
        return {
            success: true,
            submissionId: `COMP-${Date.now()}`,
        };
    } catch (error) {
        console.error("Failed to submit formula for compounding:", error);
        return {
            success: false,
            errors: [
                error instanceof Error ? error.message : "Unknown error occurred",
            ],
        };
    }
}

/**
 * Create audit entry for tracking changes
 */
export function createAuditEntry(
    action: string,
    description: string,
    changes?: Record<string, { before: any; after: any }> // eslint-disable-line @typescript-eslint/no-explicit-any
): AuditEntry {
    return {
        timestamp: new Date(),
        action,
        description,
        changes,
    };
}

/**
 * Export formula data for external systems
 */
export function exportFormulaData(formula: CompoundingFormula): string {
    return JSON.stringify(formula, null, 2);
}

/**
 * Import formula data from external systems
 */
export function importFormulaData(jsonData: string): CompoundingFormula | null {
    try {
        const data = JSON.parse(jsonData);
        // Validate imported data structure
        if (!data.id || !data.name || !data.ingredients) {
            throw new Error("Invalid formula data structure");
        }
        return data as CompoundingFormula;
    } catch (error) {
        console.error("Failed to import formula data:", error);
        return null;
    }
}
