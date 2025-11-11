# ID Generation System - Complete Implementation Summary

## What Was Implemented

### 1. Dual ID System

The formula system now has **TWO types of IDs**:

#### A. Universal Formula ID (Not Displayed)
- **Format**: `F00001v1`, `F00002v1`, `F00003v1`
- **Purpose**: Internal unique identifier across all formula types
- **Where stored**: `formula.id` field
- **Display**: NOT shown on the UI

#### B. Type-Specific Display ID (Shown on Data Grid)
- **Formats**:
  - Base formulas: `B00001v1`, `B00002v1`
  - Dilution formulas: `D00001v1`, `D00002v1`
  - Analytical formulas: `A00001v1`, `A00002v1`
  - Perfumer formulas: `MZ00001v1`, `NP00001v1` (uses user initials)
- **Purpose**: User-facing identifier shown below formula name in data grid
- **Where stored**:
  - `formula.baseFormulaId` for BASE type
  - `formula.dilutionFormulaId` for DILUTION type
  - `formula.analyticalFormulaId` for ANALYTICAL type
  - `formula.perfumerFormulaId` for PERFUMER type
- **Display**: YES - shown in data grid column header below formula name

#### C. U-Code (Future Implementation)
- **Format**: `UAD00001A`, `UAD00001B`
- **Purpose**: Generated when formula is locked/released
- **Where stored**: `formula.uCode` field
- **Status**: Field added, generation logic ready, but not triggered yet

---

## Files Modified

### 1. `/src/services/pega.ts`
**Changes**: Updated Formula interface

```typescript
export interface Formula {
  id: string;  // Universal formula ID (F00001v1) - not displayed
  // ... existing fields ...
  
  // NEW: Formula type-specific fields
  formulaType?: 'BASE' | 'DILUTION' | 'ANALYTICAL' | 'PERFUMER';
  
  // NEW: Type-specific display IDs (shown on data grid)
  perfumerFormulaId?: string;  // e.g., MZ00001v1 (for PERFUMER type)
  baseFormulaId?: string;       // e.g., B00001v1 (for BASE type)
  dilutionFormulaId?: string;   // e.g., D00001v1 (for DILUTION type)
  analyticalFormulaId?: string; // e.g., A00001v1 (for ANALYTICAL type)
  
  // NEW: U-Code (generated when formula is locked)
  uCode?: string;  // e.g., UAD00001A
}
```

---

### 2. `/src/components/FormulaModal.tsx`
**Changes**: Generate BOTH universal ID and type-specific display ID when creating new formulas

**Key Logic**:
```typescript
// Generate type-specific display ID (shown on data grid)
const typeSpecificId = generateFormulaId({
  formulaType: newFormulaData.formulaType,
  userInitials: getCurrentUserInitials(),
  existingFormulas: availableFormulas,
});

// Generate universal formula ID (F00001v1) - not displayed
const universalFormulaId = `F${nextFSequence.toString().padStart(5, '0')}v1`;

// Create formula with both IDs
const newFormula: Formula = {
  id: universalFormulaId,  // F00001v1
  formulaType: newFormulaData.formulaType,
  baseFormulaId: typeSpecificId,  // B00001v1 (if BASE type)
  // or perfumerFormulaId: typeSpecificId (if PERFUMER type)
  // etc.
};
```

---

### 3. `/src/view/WorkArea/components/FormulaColumnHandlers.tsx`
**Changes**: Updated "Create new version" logic to use new ID generation system

**Key Changes**:
- Replaced old `generateNewFormulaId` from `formulaIdGenerator.ts`
- Now uses new `getCurrentUserInitials` from `idGeneration.ts`
- Implements same-user vs different-user versioning logic:

**Same User Creating Version**:
```typescript
// If same user (e.g., MZ creates version of their own formula)
// MZ00001v1 → MZ00001v2 → MZ00001v3
const currentTypeSpecificId = formula.perfumerFormulaId; // MZ00001v1
const nextVersion = 2;
const newTypeSpecificId = `MZ00001v2`;
```

**Different User Creating Version**:
```typescript
// If different user (e.g., ML copies MZ's formula)
// MZ00001v2 → ML00001v1 (new sequence, reset to v1)
const nextSequence = getNextSequenceForUser('ML');
const newTypeSpecificId = `ML00001v1`;
```

---

### 4. `/src/components/DataGrid/types.ts`
**Changes**: Added `formulaDisplayId` field to Column interface

```typescript
export interface Column {
  // ... existing fields ...
  formulaId?: string;  // Universal formula ID (F00001v1)
  formulaDisplayId?: string;  // Type-specific display ID (B00001v1, MZ00001v1, etc.)
}
```

---

### 5. `/src/components/DataGrid.tsx`
**Changes**: Added `formulaDisplayId` field to Column interface (duplicate definition)

---

### 6. `/src/components/DataGrid/components/headers/ColumnHeaderCell.tsx`
**Changes**: Display `formulaDisplayId` instead of `formulaId` in column header

**Before**:
```tsx
{column.formulaId}  // Showed F00001v1
```

**After**:
```tsx
{column.formulaDisplayId}  // Shows B00001v1 or MZ00001v1
```

---

### 7. `/src/view/WorkArea/WorkArea.tsx`
**Changes**: When creating formula columns, populate both `formulaId` and `formulaDisplayId`

```typescript
const displayId = 
  data.formula.perfumerFormulaId ||
  data.formula.baseFormulaId ||
  data.formula.dilutionFormulaId ||
  data.formula.analyticalFormulaId ||
  data.formula.id;

const newColumn: Column = {
  formulaId: data.formula.id,  // Universal ID
  formulaDisplayId: displayId,  // Type-specific display ID
};
```

---

### 8. `/src/utils/idGeneration.ts`
**Changes**: Added helper function to get display ID

```typescript
export const getFormulaDisplayId = (formula: {
  id: string;
  perfumerFormulaId?: string;
  baseFormulaId?: string;
  dilutionFormulaId?: string;
  analyticalFormulaId?: string;
}): string => {
  return (
    formula.perfumerFormulaId ||
    formula.baseFormulaId ||
    formula.dilutionFormulaId ||
    formula.analyticalFormulaId ||
    formula.id  // Fallback to universal ID
  );
};
```

---

## How It Works Now

### Scenario 1: Creating a New Base Formula
1. User clicks "Add Formula" → "Create New"
2. Selects "Base Formula"
3. Fills mandatory fields
4. Clicks "Create Formula"

**Result**:
- `formula.id = "F00001v1"` (universal ID - internal only)
- `formula.baseFormulaId = "B00001v1"` (display ID)
- `formula.formulaType = "BASE"`
- Data grid shows: **"B00001v1"** below formula name ✅

---

### Scenario 2: Creating a New Perfumer Formula
1. User has initials set: `localStorage.setItem('userInitials', 'MZ')`
2. Creates "Perfumer Formula"

**Result**:
- `formula.id = "F00002v1"` (universal ID)
- `formula.perfumerFormulaId = "MZ00001v1"` (display ID)
- `formula.formulaType = "PERFUMER"`
- Data grid shows: **"MZ00001v1"** below formula name ✅

---

### Scenario 3: Same User Creating New Version
1. **Mariazel (MZ)** has formula `MZ00001v1`
2. Clicks "Create new version" on that formula

**Result**:
- `formula.id = "F00003v1"` (new universal ID)
- `formula.perfumerFormulaId = "MZ00001v2"` (incremented version on same sequence)
- Data grid shows: **"MZ00001v2"** ✅

---

### Scenario 4: Different User Creating Version
1. **Mariazel (MZ)** has formula `MZ00001v2`
2. **Mathieu (ML)** clicks "Create new version" on MZ's formula

**Result**:
- `formula.id = "F00004v1"` (new universal ID)
- `formula.perfumerFormulaId = "ML00001v1"` (ML's first formula, reset to v1)
- Data grid shows: **"ML00001v1"** ✅
- Toast message: "Creating new version with your initials"

---

## Mock Data Update Required

### Current State
Mock formulas in `/src/mocks/formulas.ts` still have old format:
```typescript
{
  id: 'NP-F-00001v1',  // Old format
  name: 'Fresh Citrus Blend',
}
```

### Need to Update To
```typescript
{
  id: 'F00001v1',  // Universal ID
  name: 'Fresh Citrus Blend',
  formulaType: 'PERFUMER',
  perfumerFormulaId: 'NP00001v1',  // Display ID
}
```

**Note**: Mock data is NOT updated yet. Existing formulas will show old IDs until mock data is migrated.

---

## Testing Instructions

### Test 1: Create New Base Formula
1. Click "Add Formula" → "Create New"
2. Select "Base Formula"
3. Fill required fields
4. **Expected**: Data grid shows `B00001v1` below formula name ✅

### Test 2: Create New Perfumer Formula (Default User)
1. Open console: `localStorage.removeItem('userInitials')`
2. Create "Perfumer Formula"
3. **Expected**: Data grid shows `AA00001v1` ✅

### Test 3: Create New Perfumer Formula (With User Initials)
1. Open console: `localStorage.setItem('userInitials', 'MZ')`
2. Refresh page
3. Create "Perfumer Formula"
4. **Expected**: Data grid shows `MZ00001v1` ✅

### Test 4: Create Version (Same User)
1. Set initials to 'MZ'
2. Create a Perfumer formula (gets `MZ00001v1`)
3. Click "Create new version" on that formula
4. **Expected**: New formula shows `MZ00001v2` ✅

### Test 5: Create Version (Different User)
1. Create formula as 'MZ' (gets `MZ00001v1`)
2. Change initials: `localStorage.setItem('userInitials', 'ML')`
3. Refresh and click "Create new version" on MZ's formula
4. **Expected**: New formula shows `ML00001v1` ✅
5. **Expected**: Toast message about creating with your initials ✅

---

## Known Limitations

### Not Yet Implemented
1. ❌ **Mock data not updated** - Existing formulas still show old format IDs
2. ❌ **U-Code generation** - Not triggered (requires "Lock Formula" feature)
3. ❌ **Formula type migration** - Old formulas don't have `formulaType` field
4. ❌ **Pega integration** - Still using local fallback generation

### Future Enhancements
1. **Update mock formulas** - Migrate all mock data to new format
2. **Lock formula feature** - Trigger U-Code generation
3. **Status transitions** - Draft → Experimental → Design Locked → Released
4. **Formula sharing** - Share formulas between users
5. **Version history UI** - Show all versions of a formula
6. **Bulk migration tool** - Convert old formula IDs to new format

---

## Breaking Changes

### For Existing Formulas
- **Old formulas** with ID format `NP-F-00001v1` will:
  - Keep their existing ID in `formula.id`
  - NOT have type-specific display IDs populated
  - Show the universal ID in data grid (as fallback)

### For New Formulas
- **New formulas** created after this update will:
  - Have universal ID `F00001v1` in `formula.id`
  - Have type-specific display ID in appropriate field
  - Show type-specific ID in data grid ✅

---

## Validation Checklist

- [x] Formula interface updated with new fields
- [x] FormulaModal generates both ID types
- [x] Create Version handler uses new ID generation
- [x] Data grid displays type-specific ID
- [x] Column interface includes formulaDisplayId
- [x] Helper function to get display ID
- [x] No TypeScript compilation errors
- [ ] Mock data updated (PENDING)
- [ ] Manual testing completed (PENDING)
- [ ] Ready to commit (PENDING - awaiting user validation)

---

## Next Steps

1. **Manual Testing**: Test all scenarios listed above
2. **Mock Data Update**: Convert existing mock formulas to new format (if desired)
3. **Commit Changes**: Once validated, commit to 11Nov branch
4. **Merge to Main**: After successful testing

---

## Summary

The ID generation system has been completely updated to support:
- ✅ Dual ID system (universal + type-specific)
- ✅ Type-specific display IDs shown in data grid
- ✅ Same-user version incrementing (v1 → v2 → v3)
- ✅ Different-user version reset (MZ00001v2 → ML00001v1)
- ✅ All formula types (BASE, DILUTION, ANALYTICAL, PERFUMER)
- ✅ Default user fallback ('AA')
- ✅ U-Code field ready for future implementation

**Status**: Implementation complete, awaiting validation before commit.
