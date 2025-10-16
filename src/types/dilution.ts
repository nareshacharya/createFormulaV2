/**
 * Dilution Types
 * Data structures for ingredient dilution with solvents
 */

export interface Solvent {
    id: string;
    name: string;
    code: string;
    category: 'alcohol' | 'oil' | 'water' | 'other';
    commonUse: string;
}

export interface DilutionPreset {
    label: string;
    value: number; // Percentage as decimal (e.g., 0.01 for 1%)
    display: string; // Display format (e.g., "1%")
}

export interface Dilution {
    solventIds: string[]; // Array of solvent IDs used
    concentration: number; // Final concentration as decimal (e.g., 0.01 for 1%)
    isCustom: boolean; // Whether concentration is custom or from preset
}

export interface IngredientWithDilution {
    ingredientId: string;
    ingredientName: string;
    dilution?: Dilution;
}

// Standard dilution presets
export const DILUTION_PRESETS: DilutionPreset[] = [
    { label: '50%', value: 0.5, display: '50%' },
    { label: '25%', value: 0.25, display: '25%' },
    { label: '10%', value: 0.1, display: '10%' },
    { label: '1%', value: 0.01, display: '1%' },
    { label: '0.1%', value: 0.001, display: '0.1%' },
    { label: '0.01%', value: 0.0001, display: '0.01%' },
    { label: '0.001%', value: 0.00001, display: '0.001%' },
    { label: '0.0001%', value: 0.000001, display: '0.0001%' },
    { label: '0.00001%', value: 0.0000001, display: '0.00001%' },
];
