/**
 * Analytical Composition Service (US #2202)
 * Handles parsing and processing of analytical formula composition files
 * Supports multiple Excel sheets for different analysis methods
 */

import * as XLSX from "xlsx";
import type {
    AnalyticalCompositionIngredient,
    AnalyticalCompositionUpload,
    AnalyticalMethodType,
} from "../types/formula.creation.types";
import { ANALYTICAL_METHOD_TYPES } from "../types/formula.creation.types";
import type { Ingredient } from "./pega";

/**
 * Parse Excel file with multiple sheets
 * Returns available sheets and their names
 */
export class AnalyticalCompositionService {
    /**
     * Get available sheets from Excel file
     */
    static async getAvailableSheets(file: File): Promise<string[]> {
        return new Promise((resolve, reject) => {
            try {
                if (!file) {
                    reject(new Error("No file provided"));
                    return;
                }

                const reader = new FileReader();

                reader.onload = (event) => {
                    try {
                        const data = event.target?.result as ArrayBuffer;
                        if (!data) {
                            reject(new Error("Could not read file data"));
                            return;
                        }

                        if (typeof XLSX === "undefined") {
                            reject(
                                new Error(
                                    "XLSX library not loaded. Please refresh the page and try again."
                                )
                            );
                            return;
                        }

                        const workbook = XLSX.read(new Uint8Array(data), {
                            type: "array",
                        });

                        if (!workbook || !workbook.SheetNames) {
                            reject(new Error("Could not parse Excel workbook"));
                            return;
                        }

                        resolve(workbook.SheetNames);
                    } catch (error) {
                        reject(
                            new Error(
                                error instanceof Error
                                    ? `Failed to parse Excel: ${error.message}`
                                    : "Failed to read Excel file sheets"
                            )
                        );
                    }
                };

                reader.onerror = (error) => {
                    reject(
                        new Error(
                            `File read error: ${error || "Unknown error"}`
                        )
                    );
                };

                reader.readAsArrayBuffer(file);
            } catch (error) {
                reject(
                    new Error(
                        error instanceof Error
                            ? `Setup error: ${error.message}`
                            : "Failed to initialize file reader"
                    )
                );
            }
        });
    }

    /**
     * Parse Excel sheet for analytical composition data
     * Expected format:
     * - Column 1: Ingredient Name
     * - Column 2: Percentage
     * - Column 3: (Optional) Retention Time
     * - Column 4: (Optional) Peak Area
     * - Column 5: (Optional) Match Quality
     */
    static async parseCompositionSheet(
        file: File,
        sheetName: string,
        availableIngredients: Ingredient[]
    ): Promise<AnalyticalCompositionIngredient[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const data = event.target?.result as ArrayBuffer;
                    const workbook = XLSX.read(new Uint8Array(data), {
                        type: "array",
                    });

                    if (!workbook.SheetNames.includes(sheetName)) {
                        reject(new Error(`Sheet "${sheetName}" not found in file`));
                        return;
                    }

                    const worksheet = workbook.Sheets[sheetName];
                    if (!worksheet) {
                        reject(new Error(`Could not read sheet "${sheetName}"`));
                        return;
                    }
                    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
                        worksheet,
                        {
                            header: "A",
                            defval: "",
                        }
                    );

                    const ingredients: AnalyticalCompositionIngredient[] = rows
                        .slice(1) // Skip header
                        .filter((row) => row.A && row.B) // Must have name and percentage
                        .map((row) => {
                            const ingredientName = String(row.A).trim();
                            const percentage = parseFloat(String(row.B)) || 0;
                            const retentionTime = row.C
                                ? parseFloat(String(row.C))
                                : undefined;
                            const peakArea = row.D ? parseFloat(String(row.D)) : undefined;
                            const matchQuality = row.E
                                ? parseFloat(String(row.E))
                                : undefined;

                            // Try to match with available ingredients (case-insensitive)
                            const match = availableIngredients.find(
                                (ing) =>
                                    ing.name.toLowerCase() ===
                                    ingredientName.toLowerCase()
                            );

                            return {
                                name: ingredientName,
                                percentage,
                                retentionTime,
                                peakArea,
                                matchQuality,
                                mappedIngredientId: match?.id || null,
                                status: match ? "matched" : "unmatched",
                            };
                        });

                    if (ingredients.length === 0) {
                        reject(new Error("No valid ingredients found in sheet"));
                        return;
                    }

                    resolve(ingredients);
                } catch (error) {
                    reject(
                        new Error(
                            error instanceof Error
                                ? error.message
                                : "Failed to parse Excel sheet"
                        )
                    );
                }
            };

            reader.onerror = () => {
                reject(new Error("Failed to read file"));
            };

            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Detect method type from sheet name
     * Maps sheet names to analytical method types
     */
    static detectMethodType(sheetName: string): AnalyticalMethodType {
        const normalized = sheetName.toUpperCase();

        if (normalized.includes("DB") || normalized.includes("VALIDATE")) {
            return ANALYTICAL_METHOD_TYPES.DB_VALIDATE;
        }
        if (normalized.includes("AMDIS") && normalized.includes("FULL")) {
            return ANALYTICAL_METHOD_TYPES.AMDIS_FULL;
        }
        if (normalized.includes("AMDIS") && normalized.includes("SCREEN")) {
            return ANALYTICAL_METHOD_TYPES.AMDIS_SCREEN;
        }
        if (normalized.includes("AMDIS")) {
            return ANALYTICAL_METHOD_TYPES.AMDIS_FULL; // Default to AMDIS Full
        }

        return ANALYTICAL_METHOD_TYPES.DB_VALIDATE; // Default method
    }

    /**
     * Create composition upload object
     */
    static createCompositionUpload(
        sampleID: string,
        methodType: AnalyticalMethodType,
        ingredients: AnalyticalCompositionIngredient[],
        sheetName: string
    ): AnalyticalCompositionUpload {
        return {
            sampleID,
            methodType,
            ingredients,
            sheetName,
            importDate: new Date().toISOString(),
            fileHash: this.generateHash(JSON.stringify(ingredients)),
        };
    }

    /**
     * Calculate simple hash for composition data
     */
    private static generateHash(data: string): string {
        let hash = 0;
        for (let i = 0; i < data.length; i += 1) {
            const char = data.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash &= hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Validate composition data
     */
    static validateComposition(
        composition: AnalyticalCompositionUpload
    ): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Check sample ID
        if (!composition.sampleID || composition.sampleID.trim() === "") {
            errors.push("Sample ID is required");
        }

        // Check ingredients
        if (!composition.ingredients || composition.ingredients.length === 0) {
            errors.push("At least one ingredient is required");
        }

        // Check percentage total (should be close to 100)
        const totalPercentage = composition.ingredients.reduce(
            (sum, ing) => sum + ing.percentage,
            0
        );
        if (Math.abs(totalPercentage - 100) > 5) {
            errors.push(
                `Total percentage is ${totalPercentage.toFixed(2)}%, should be close to 100%`
            );
        }

        // Check for unmapped ingredients
        const unmapped = composition.ingredients.filter(
            (ing) => ing.status === "unmatched"
        );
        if (unmapped.length > 0) {
            errors.push(`${unmapped.length} ingredient(s) are not mapped to library`);
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * Parse CSV file as fallback for Excel files
     * Expects: IngredientName,Percentage format
     */
    static async parseCSVFile(
        file: File,
        availableIngredients: Ingredient[]
    ): Promise<AnalyticalCompositionIngredient[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const csv = event.target?.result as string;
                    const lines = csv.split("\n").filter((line) => line.trim());

                    if (lines.length < 2) {
                        reject(
                            new Error(
                                "CSV file must have at least a header row and one data row"
                            )
                        );
                        return;
                    }

                    // Parse CSV
                    const ingredients: AnalyticalCompositionIngredient[] = lines
                        .slice(1) // Skip header
                        .map((line): AnalyticalCompositionIngredient | null => {
                            const parts = line.split(",").map((p) => p.trim());
                            if (parts.length < 2) return null;

                            const ingredientName = parts[0];
                            const percentage = parseFloat(parts[1]) || 0;

                            const match = availableIngredients.find(
                                (ing) =>
                                    ing.name.toLowerCase() ===
                                    ingredientName.toLowerCase()
                            );

                            return {
                                name: ingredientName,
                                percentage,
                                retentionTime: undefined,
                                peakArea: undefined,
                                matchQuality: undefined,
                                mappedIngredientId: match?.id || null,
                                status: match ? ("matched" as const) : ("unmatched" as const),
                            };
                        })
                        .filter(
                            (ing): ing is AnalyticalCompositionIngredient =>
                                ing !== null
                        );

                    if (ingredients.length === 0) {
                        reject(new Error("No valid ingredients found in CSV"));
                        return;
                    }

                    resolve(ingredients);
                } catch (error) {
                    reject(
                        new Error(
                            error instanceof Error
                                ? `Failed to parse CSV: ${error.message}`
                                : "Failed to parse CSV file"
                        )
                    );
                }
            };

            reader.onerror = () => {
                reject(new Error("Failed to read CSV file"));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Update ingredient mapping for a composition
     */
    static updateIngredientMapping(
        composition: AnalyticalCompositionUpload,
        ingredientName: string,
        mappedId: string
    ): AnalyticalCompositionUpload {
        return {
            ...composition,
            ingredients: composition.ingredients.map((ing) =>
                ing.name === ingredientName
                    ? {
                        ...ing,
                        mappedIngredientId: mappedId,
                        status: mappedId ? ("matched" as const) : ("unmatched" as const),
                    }
                    : ing
            ),
        };
    }
}
