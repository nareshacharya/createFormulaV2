import type { Solvent } from '../types/dilution';

/**
 * Mock solvents data
 * Common solvents used for ingredient dilution in perfumery
 */
export const mockSolvents: Solvent[] = [
    {
        id: 'SOLV001',
        name: 'Ethanol (95%)',
        code: 'ETH95',
        category: 'alcohol',
        commonUse: 'Standard perfumery alcohol for dilutions',
    },
    {
        id: 'SOLV002',
        name: 'Dipropylene Glycol (DPG)',
        code: 'DPG',
        category: 'other',
        commonUse: 'Non-volatile solvent, good for heavy materials',
    },
    {
        id: 'SOLV009',
        name: 'Dioctyl Adipate',
        code: 'DOA',
        category: 'other',
        commonUse: 'Dioctyl Adipate - plasticizer and solvent',
    },
    {
        id: 'SOLV005',
        name: 'Triethyl Citrate',
        code: 'TEC',
        category: 'other',
        commonUse: 'Alternative to DEP, good solubilizer',
    },
    {
        id: 'SOLV003',
        name: 'Isopropyl Myristate (IPM)',
        code: 'IPM',
        category: 'oil',
        commonUse: 'Excellent for diluting solid/crystalline materials',
    },
    {
        id: 'SOLV004',
        name: 'Benzyl Benzoate',
        code: 'BB',
        category: 'other',
        commonUse: 'Good solvent for resins and balsams',
    },
    {
        id: 'SOLV006',
        name: 'Propylene Glycol',
        code: 'PG',
        category: 'other',
        commonUse: 'Water-soluble solvent',
    },
    {
        id: 'SOLV007',
        name: 'Fractionated Coconut Oil (MCT)',
        code: 'MCT',
        category: 'oil',
        commonUse: 'Neutral carrier oil for dilutions',
    },
    {
        id: 'SOLV010',
        name: 'DOWANOL DMP',
        code: 'DMP',
        category: 'other',
        commonUse: 'Dipropylene Glycol Methyl Ether - coupling solvent',
    },
    {
        id: 'SOLV011',
        name: 'DOWANOL TMP',
        code: 'TMP',
        category: 'other',
        commonUse: 'Tripropylene Glycol Methyl Ether - high boiling solvent',
    },
];
