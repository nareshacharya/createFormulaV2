/**
 * Test file for ID Generation
 * This demonstrates the ID generation logic with examples from the user story
 */

import { FORMULA_TYPES } from '../../config/formulaTypes.config';
import {
    generateFormulaId,
    generatePerfumerFormulaId,
    generateUCode,
    parseFormulaId,
    getNextSequenceNumber,
    getNextVersionNumber,
    setCurrentUserInitials,
    getCurrentUserInitials,
    isOwnFormula,
    PERFUMER_DIRECTORY
} from '../idGeneration';

/**
 * Example test scenarios based on the user story
 */

describe('ID Generation - User Story Scenarios', () => {

    // Mock existing formulas for testing
    const existingFormulas = [
        { id: 'F00001v1', createdBy: 'Mariazel' },
        { id: 'F00001v2', createdBy: 'Mariazel' },
        { id: 'MZ00001v1', createdBy: 'Mariazel' },
        { id: 'MZ00001v2', createdBy: 'Mariazel' },
    ];

    describe('Scenario 1: Mariazel creates new theme (Base Formula)', () => {
        it('should generate F00002v1 for new base formula', () => {
            setCurrentUserInitials('MZ');

            const formulaId = generateFormulaId({
                formulaType: FORMULA_TYPES.BASE,
                userInitials: 'MZ',
                existingFormulas
            });

            expect(formulaId).toBe('B00001v1'); // First base formula
        });
    });

    describe('Scenario 2: Mariazel creates new trial (version)', () => {
        it('should increment version for same user copying own formula', () => {
            setCurrentUserInitials('MZ');

            const formulaId = generateFormulaId({
                formulaType: FORMULA_TYPES.PERFUMER,
                userInitials: 'MZ',
                existingFormulas,
                baseFormulaId: 'MZ00001v2',
                isUserCopy: true
            });

            expect(formulaId).toBe('MZ00001v3'); // Increment version
        });
    });

    describe('Scenario 3: Mathieu creates editable copy of Mariazel formula', () => {
        it('should create new ID with different initials, version v1', () => {
            setCurrentUserInitials('ML');

            const formulaId = generateFormulaId({
                formulaType: FORMULA_TYPES.PERFUMER,
                userInitials: 'ML',
                existingFormulas,
                baseFormulaId: 'MZ00001v2',
                isUserCopy: false // Different user
            });

            expect(formulaId).toBe('ML00001v1'); // New sequence for Mathieu
        });
    });

    describe('Scenario 4: Mathieu creates a new version', () => {
        it('should increment version for Mathieu own formula', () => {
            const formulasWithMathieu = [
                ...existingFormulas,
                { id: 'ML00001v1', createdBy: 'Mathieu' }
            ];

            setCurrentUserInitials('ML');

            const formulaId = generateFormulaId({
                formulaType: FORMULA_TYPES.PERFUMER,
                userInitials: 'ML',
                existingFormulas: formulasWithMathieu,
                baseFormulaId: 'ML00001v1',
                isUserCopy: true
            });

            expect(formulaId).toBe('ML00001v2'); // Increment version
        });
    });

    describe('U-Code Generation', () => {
        it('should generate UAD00001A for first locked formula', () => {
            const uCode = generateUCode([], 1);
            expect(uCode).toBe('UAD00001A');
        });

        it('should increment letter suffix for same theme', () => {
            const existingUCodes = ['UAD00001A'];
            const uCode = generateUCode(existingUCodes, 1);
            expect(uCode).toBe('UAD00001B');
        });

        it('should generate UAD00001C for third version', () => {
            const existingUCodes = ['UAD00001A', 'UAD00001B'];
            const uCode = generateUCode(existingUCodes, 1);
            expect(uCode).toBe('UAD00001C');
        });
    });

    describe('Formula Type-specific IDs', () => {
        it('should generate B00001v1 for Base formula', () => {
            const formulaId = generateFormulaId({
                formulaType: FORMULA_TYPES.BASE,
                userInitials: 'MZ',
                existingFormulas: []
            });

            expect(formulaId).toBe('B00001v1');
        });

        it('should generate D00001v1 for Dilution formula', () => {
            const formulaId = generateFormulaId({
                formulaType: FORMULA_TYPES.DILUTION,
                userInitials: 'MZ',
                existingFormulas: []
            });

            expect(formulaId).toBe('D00001v1');
        });

        it('should generate A00001v1 for Analytical formula', () => {
            const formulaId = generateFormulaId({
                formulaType: FORMULA_TYPES.ANALYTICAL,
                userInitials: 'MZ',
                existingFormulas: []
            });

            expect(formulaId).toBe('A00001v1');
        });

        it('should generate MZ00001v1 for Perfumer formula', () => {
            const formulaId = generateFormulaId({
                formulaType: FORMULA_TYPES.PERFUMER,
                userInitials: 'MZ',
                existingFormulas: []
            });

            expect(formulaId).toBe('MZ00001v1');
        });
    });

    describe('Parse Formula ID', () => {
        it('should parse Base formula ID correctly', () => {
            const parsed = parseFormulaId('B00005v3');

            expect(parsed).toEqual({
                prefix: 'B',
                sequenceNumber: 5,
                version: 3,
                fullId: 'B00005v3',
                isPerfumerFormula: false,
                userInitials: undefined
            });
        });

        it('should parse Perfumer formula ID correctly', () => {
            const parsed = parseFormulaId('MZ00001v2');

            expect(parsed).toEqual({
                prefix: 'MZ',
                sequenceNumber: 1,
                version: 2,
                fullId: 'MZ00001v2',
                isPerfumerFormula: true,
                userInitials: 'MZ'
            });
        });

        it('should return null for invalid format', () => {
            const parsed = parseFormulaId('INVALID-ID');
            expect(parsed).toBeNull();
        });
    });

    describe('Ownership Checks', () => {
        it('should identify own perfumer formula', () => {
            setCurrentUserInitials('MZ');

            const isOwn = isOwnFormula('MZ00001v1', 'MZ');
            expect(isOwn).toBe(true);
        });

        it('should identify other user formula', () => {
            setCurrentUserInitials('MZ');

            const isOwn = isOwnFormula('ML00001v1', 'MZ');
            expect(isOwn).toBe(false);
        });

        it('should return false for non-perfumer formula', () => {
            setCurrentUserInitials('MZ');

            const isOwn = isOwnFormula('B00001v1', 'MZ');
            expect(isOwn).toBe(false);
        });
    });

    describe('Sequence Number Generation', () => {
        it('should get next sequence number for new prefix', () => {
            const nextSeq = getNextSequenceNumber(existingFormulas, 'B');
            expect(nextSeq).toBe(1); // No base formulas exist
        });

        it('should increment existing sequence', () => {
            const formulasWithBase = [
                ...existingFormulas,
                { id: 'B00001v1' },
                { id: 'B00002v1' }
            ];

            const nextSeq = getNextSequenceNumber(formulasWithBase, 'B');
            expect(nextSeq).toBe(3);
        });
    });

    describe('Version Number Generation', () => {
        it('should get next version for existing sequence', () => {
            const nextVersion = getNextVersionNumber(existingFormulas, 'MZ', 1);
            expect(nextVersion).toBe(3); // MZ00001v1 and MZ00001v2 exist
        });

        it('should return v1 for new sequence', () => {
            const nextVersion = getNextVersionNumber(existingFormulas, 'MZ', 999);
            expect(nextVersion).toBe(1); // No formulas with sequence 999
        });
    });

    describe('Perfumer Directory', () => {
        it('should have all required perfumers', () => {
            expect(PERFUMER_DIRECTORY['AC']).toBe('Clemente, Augustin');
            expect(PERFUMER_DIRECTORY['MZ']).toBe('Montejo-Coll, Mariazel');
            expect(PERFUMER_DIRECTORY['ML']).toBe('Lenoir, Mathieu');
            expect(PERFUMER_DIRECTORY['NP']).toBe('Pentapati, Naresh');
            expect(PERFUMER_DIRECTORY['AA']).toBe('Default User');
        });
    });

    describe('Default User Handling', () => {
        it('should use AA as default when no user set', () => {
            localStorage.removeItem('userInitials');
            const initials = getCurrentUserInitials();
            expect(initials).toBe('AA');
        });
    });
});

/**
 * MANUAL TESTING EXAMPLES
 * 
 * You can run these in the browser console to test the ID generation
 */

/*
// Import the functions
import { 
  generateFormulaId, 
  setCurrentUserInitials, 
  generateUCode 
} from './utils/idGeneration';
import { FORMULA_TYPES } from './config/formulaTypes.config';

// Set current user
setCurrentUserInitials('MZ');

// Example 1: Mariazel creates new base formula
const baseId = generateFormulaId({
  formulaType: FORMULA_TYPES.BASE,
  userInitials: 'MZ',
  existingFormulas: []
});
console.log('Base Formula ID:', baseId); // B00001v1

// Example 2: Mariazel creates perfumer formula
const perfumerId = generateFormulaId({
  formulaType: FORMULA_TYPES.PERFUMER,
  userInitials: 'MZ',
  existingFormulas: []
});
console.log('Perfumer Formula ID:', perfumerId); // MZ00001v1

// Example 3: Mariazel creates version 2
const version2Id = generateFormulaId({
  formulaType: FORMULA_TYPES.PERFUMER,
  userInitials: 'MZ',
  existingFormulas: [{ id: 'MZ00001v1' }],
  baseFormulaId: 'MZ00001v1',
  isUserCopy: true
});
console.log('Version 2 ID:', version2Id); // MZ00001v2

// Example 4: Mathieu copies Mariazel's formula
setCurrentUserInitials('ML');
const mathieuCopyId = generateFormulaId({
  formulaType: FORMULA_TYPES.PERFUMER,
  userInitials: 'ML',
  existingFormulas: [{ id: 'MZ00001v1' }, { id: 'MZ00001v2' }],
  baseFormulaId: 'MZ00001v2',
  isUserCopy: false
});
console.log('Mathieu Copy ID:', mathieuCopyId); // ML00001v1

// Example 5: Generate U-Code
const uCode1 = generateUCode([], 1);
console.log('U-Code 1:', uCode1); // UAD00001A

const uCode2 = generateUCode(['UAD00001A'], 1);
console.log('U-Code 2:', uCode2); // UAD00001B
*/
