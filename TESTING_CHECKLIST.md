# Manual Testing Checklist - ID Generation & Versioning

## Prerequisites
Before testing, ensure you're on the **11Nov** branch and the code is compiled without errors.

## Test 1: Base Formula Creation
**Objective**: Verify Base formulas use B prefix

1. Open the application
2. Click "Add Formula" button
3. Select "Base Formula" type
4. Fill mandatory fields:
   - Category: Eau de Parfum
   - Region: North America (NA)
   - Country: United States (US)
   - Fragrance Name: Test Base Formula
   - Fragrance Dosage: 10%
   - Product Format: Spray
5. Click "Create Formula"
6. **Expected Result**: Formula ID should be `B00001v1` (or B00002v1 if formulas exist)
7. **Verify**: Check formula card/header shows correct ID

## Test 2: Dilution Formula Creation
**Objective**: Verify Dilution formulas use D prefix

1. Click "Add Formula"
2. Select "Dilution Formula"
3. Fill mandatory fields:
   - Fragrance Name: Test Dilution
   - Base Formula: (enter any formula ID)
   - Dilution Percentage: 50%
   - Category, Region, Country, Dosage, Format
4. Click "Create Formula"
5. **Expected Result**: Formula ID should be `D00001v1`
6. **Verify**: ID format is correct

## Test 3: Analytical Formula Creation
**Objective**: Verify Analytical formulas use A prefix

1. Click "Add Formula"
2. Select "Analytical Formula"
3. Fill mandatory fields:
   - Sample ID: SAMPLE-001
   - Category, Region, Country, Dosage, Format
4. Click "Create Formula"
5. **Expected Result**: Formula ID should be `A00001v1`
6. **Verify**: Formula name is "ANALYTICAL-SAMPLE-001"

## Test 4: Perfumer Formula Creation
**Objective**: Verify Perfumer formulas use user initials

1. Open browser console (F12)
2. Run: `localStorage.setItem('userInitials', 'MZ')`
3. Refresh the page
4. Click "Add Formula"
5. Select "Perfumer Formula"
6. Fill mandatory fields:
   - Fragrance Name: Test Perfumer Formula
   - Category, Region, Country, Dosage, Format
7. Click "Create Formula"
8. **Expected Result**: Formula ID should be `MZ00001v1`
9. **Verify**: ID uses MZ initials

## Test 5: Default User (AA) Fallback
**Objective**: Verify AA is used when no user is set

1. Open browser console
2. Run: `localStorage.removeItem('userInitials')`
3. Refresh the page
4. Create a Perfumer Formula
5. **Expected Result**: Formula ID should be `AA00001v1`
6. **Verify**: Default initials are used

## Test 6: Multiple Formulas of Same Type
**Objective**: Verify sequence numbers increment

1. Create 3 Base formulas in succession
2. **Expected Results**:
   - 1st formula: B00001v1
   - 2nd formula: B00002v1
   - 3rd formula: B00003v1
3. **Verify**: Each gets next sequential number

## Test 7: Different Formula Types Don't Interfere
**Objective**: Verify each type has independent sequence

1. Create one of each type:
   - Base: B00001v1
   - Dilution: D00001v1
   - Analytical: A00001v1
   - Perfumer (MZ): MZ00001v1
2. **Verify**: All start at 00001 for their prefix

## Test 8: Different Perfumers Get Different Sequences
**Objective**: Verify different users get separate sequences

1. Set user to MZ: `localStorage.setItem('userInitials', 'MZ')`
2. Create Perfumer formula → **Expected**: MZ00001v1
3. Set user to ML: `localStorage.setItem('userInitials', 'ML')`
4. Refresh and create Perfumer formula → **Expected**: ML00001v1
5. **Verify**: Each perfumer has their own sequence

## Test 9: Version Display
**Objective**: Verify version is displayed correctly

1. Create any formula
2. Check formula card/header
3. **Expected**: Version shows as "v1"
4. **Verify**: Version format is correct (lowercase 'v')

## Test 10: ID Parsing (Console Test)
**Objective**: Verify ID parsing works correctly

1. Open browser console
2. Import parser:
```javascript
import { parseFormulaId } from './src/utils/idGeneration';
```
3. Test parsing:
```javascript
// Test Base
parseFormulaId('B00001v1');
// Expected: { prefix: 'B', sequenceNumber: 1, version: 1, isPerfumerFormula: false }

// Test Perfumer
parseFormulaId('MZ00001v2');
// Expected: { prefix: 'MZ', sequenceNumber: 1, version: 2, isPerfumerFormula: true, userInitials: 'MZ' }

// Test Invalid
parseFormulaId('INVALID');
// Expected: null
```

## Test 11: Perfumer Directory Check
**Objective**: Verify all perfumers are in directory

1. Open browser console
2. Run:
```javascript
import { PERFUMER_DIRECTORY } from './src/utils/idGeneration';
console.table(PERFUMER_DIRECTORY);
```
3. **Verify**: All perfumers from user story are present:
   - AC, AD, DC, JM, JP, ML, MZ, RK, TS, VC, ZF, MK, NP, AA

## Test 12: Status Workflow
**Objective**: Verify formulas start in Draft status

1. Create any formula
2. **Expected**: Status shows as "Draft"
3. **Verify**: Status badge is visible with correct styling

## Test 13: Formula Name Generation
**Objective**: Verify correct formula naming

1. Create Analytical formula with Sample ID: TEST-123
2. **Expected**: Formula name is "ANALYTICAL-TEST-123"
3. Create Base formula with Fragrance Name: "Rose Garden"
4. **Expected**: Formula name is "Rose Garden"

## Test 14: Validation
**Objective**: Verify mandatory fields are enforced

1. Click "Add Formula"
2. Try to create without filling fields
3. **Expected**: Create button is disabled
4. Fill mandatory fields one by one
5. **Verify**: Button enables only when all required fields are filled

## Test 15: Multiple Users Testing (Advanced)
**Objective**: Simulate user story scenario

1. **Mariazel creates formula**:
   - Set: `localStorage.setItem('userInitials', 'MZ')`
   - Create Perfumer formula
   - Expected ID: MZ00001v1

2. **Mathieu creates formula**:
   - Set: `localStorage.setItem('userInitials', 'ML')`
   - Create Perfumer formula
   - Expected ID: ML00001v1

3. **Mariazel creates another**:
   - Set: `localStorage.setItem('userInitials', 'MZ')`
   - Create Perfumer formula
   - Expected ID: MZ00002v1 (sequence increments)

## Known Limitations (Not Yet Implemented)

- ❌ **Versioning UI**: Cannot create new versions of existing formulas yet
- ❌ **U-Code Generation**: Not implemented (requires "Lock Formula" feature)
- ❌ **Pega Integration**: Using fallback generation only
- ❌ **Copy Formula**: Cannot copy formulas to create new versions
- ❌ **Formula Sharing**: No sharing features yet
- ❌ **Status Transitions**: Cannot change status from Draft to Experimental/Locked

## Bug Reporting Template

If you find issues, report using this format:

```
**Test Number**: Test X
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: 
What should happen

**Actual Result**: 
What actually happened

**Formula ID Generated**: 
The ID that was created

**Console Errors**: 
Any errors in browser console

**User Initials Set**: 
What user initials were used
```

## Success Criteria

✅ All 15 tests pass without errors  
✅ Formula IDs follow correct format for each type  
✅ Sequence numbers increment properly  
✅ Different users get different sequences (for perfumer)  
✅ Default user (AA) works as fallback  
✅ No TypeScript/JavaScript errors in console  
✅ No breaking changes to existing functionality  
✅ Formulas can be created successfully  
✅ Formula cards display with correct information

## After Testing Checklist

- [ ] All tests passed
- [ ] No console errors
- [ ] Formula creation works for all types
- [ ] IDs are in correct format
- [ ] Versioning logic is correct (as far as can be tested)
- [ ] Ready to commit changes

## Notes
- The versioning UI (creating v2, v3, etc.) is not yet implemented
- This tests only the ID generation for NEW formulas
- U-Code generation will be tested when Lock Formula feature is added
- Pega integration is in fallback mode (expected behavior)
