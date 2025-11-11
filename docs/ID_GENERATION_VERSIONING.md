# Formula ID Generation & Versioning System

## Overview

This document describes the ID generation and versioning logic implemented based on the Business Analyst's requirements.

## Key Changes from Old System

### Old Format (Before)
- Formula ID: `NP-F-00001V1`
- Format: `[INITIALS]-F-[NUMBER]V[VERSION]`

### New Format (Current)
- Formula ID: `F00001v1` or Type-specific (B00001v1, D00001v1, A00001v1)
- Perfumer Formula ID: `MZ00001v1` (user initials + number + version)
- Format: `[TYPE_PREFIX][NUMBER]v[VERSION]`

## ID Types

### 1. Formula ID (Theme ID)
- **Format**: `F00001v1`
- **Purpose**: Universal identifier for all formulas
- **Behavior**: Increments continuously across all formula types
- **Example**: F00001, F00002, F00003...

### 2. Type-Specific IDs

#### Base Formula
- **Format**: `B00001v1`
- **Prefix**: `B`
- **Example**: B00001v1, B00002v1, B00003v1

#### Dilution Formula
- **Format**: `D00001v1`
- **Prefix**: `D`
- **Example**: D00001v1, D00002v1, D00003v1

#### Analytical Formula
- **Format**: `A00001v1`
- **Prefix**: `A`
- **Example**: A00001v1, A00002v1, A00003v1

#### Perfumer Formula
- **Format**: `MZ00001v1`
- **Prefix**: User initials (MZ, ML, NP, etc.)
- **Example**: MZ00001v1, ML00001v1, NP00001v1

### 3. U-Code (Universal Code)
- **Format**: `UAD00001A`
- **Generated**: When formula is locked
- **Behavior**: Letter suffix (A, B, C...) increments for versions within same theme
- **Example**: UAD00001A, UAD00001B, UAD00001C

## Versioning Logic

### Scenario 1: New Formula Creation
**User**: Mariazel (MZ)  
**Action**: Creates new perfumer formula  
**Result**: `MZ00001v1`

```typescript
generateFormulaId({
  formulaType: FORMULA_TYPES.PERFUMER,
  userInitials: 'MZ',
  existingFormulas: []
});
// Returns: MZ00001v1
```

### Scenario 2: Same User Creates New Version
**User**: Mariazel (MZ)  
**Existing**: MZ00001v1, MZ00001v2  
**Action**: Creates new version of own formula  
**Result**: `MZ00001v3` (increment version)

```typescript
generateFormulaId({
  formulaType: FORMULA_TYPES.PERFUMER,
  userInitials: 'MZ',
  existingFormulas: [
    { id: 'MZ00001v1' },
    { id: 'MZ00001v2' }
  ],
  baseFormulaId: 'MZ00001v2',
  isUserCopy: true  // Same user
});
// Returns: MZ00001v3
```

### Scenario 3: Different User Copies Formula
**User**: Mathieu (ML)  
**Source**: MZ00001v2 (Mariazel's formula)  
**Action**: Creates editable copy  
**Result**: `ML00001v1` (new sequence, version resets)

```typescript
generateFormulaId({
  formulaType: FORMULA_TYPES.PERFUMER,
  userInitials: 'ML',
  existingFormulas: [
    { id: 'MZ00001v1' },
    { id: 'MZ00001v2' }
  ],
  baseFormulaId: 'MZ00001v2',
  isUserCopy: false  // Different user
});
// Returns: ML00001v1
```

### Scenario 4: User Creates Multiple Versions
**User**: Mathieu (ML)  
**Existing**: ML00001v1  
**Action**: Creates another version  
**Result**: `ML00001v2`

```typescript
generateFormulaId({
  formulaType: FORMULA_TYPES.PERFUMER,
  userInitials: 'ML',
  existingFormulas: [
    { id: 'ML00001v1' }
  ],
  baseFormulaId: 'ML00001v1',
  isUserCopy: true
});
// Returns: ML00001v2
```

## User Story Illustration

| Who | Scenario | Formula ID | Perfumer Formula ID | U-Code | Status | System Behavior |
|-----|----------|-----------|---------------------|--------|---------|-----------------|
| Mariazel | Create new Theme | F00001 | MZ00001 | N/A | Draft | New Theme created |
| Mariazel | Create new Trial | F00001v1 | MZ00001v1 | N/A | Experimental | New Trial Version |
| Mariazel | Create new Trial | F00001v2 | MZ00001v2 | N/A | Experimental | Increment version |
| Mathieu | Creating editable copy | F00001v3 | ML00001v1 | N/A | Experimental | New prefix, same theme |
| Mathieu | Creates new version | F00001v4 | ML00001v2 | N/A | Experimental | Increment version |
| Mariazel | Create new Trial | F00001v5 | MZ00001v3 | N/A | Experimental | Increment version |
| Mariazel | Lock Formula | F00001v6 | MZ00001v4 | UAD00001A | Design Locked | U-Code created |
| Mathieu | Lock Formula | F00001v4 | ML00001v2 | UAD00001B | Design Locked | U-Code incremented |

## Perfumer Directory

```typescript
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
  'AA': 'Default User'  // Fallback when no user available
};
```

## Implementation Details

### ID Generation Function

```typescript
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
    prefix = getTypePrefix(formulaType); // B, D, A, or F
  }

  // CASE 1: Creating a new version of user's own formula
  if (baseFormulaId && isUserCopy) {
    const parsed = parseFormulaId(baseFormulaId);
    if (parsed && parsed.prefix === prefix) {
      const nextVersion = getNextVersionNumber(
        existingFormulas,
        prefix,
        parsed.sequenceNumber
      );
      return `${prefix}${parsed.sequenceNumber.toString().padStart(5, '0')}v${nextVersion}`;
    }
  }

  // CASE 2: Different user copying OR new formula
  const nextSequence = getNextSequenceNumber(existingFormulas, prefix);
  const sequenceStr = nextSequence.toString().padStart(5, '0');
  
  return `${prefix}${sequenceStr}v1`;
};
```

### Parsing Formula IDs

```typescript
export interface ParsedFormulaId {
  prefix: string;           // F, B, D, A, or user initials
  sequenceNumber: number;   // 00001
  version: number;          // 1 from v1
  fullId: string;
  isPerfumerFormula: boolean;
  userInitials?: string;
}

export const parseFormulaId = (formulaId: string): ParsedFormulaId | null => {
  const match = formulaId.match(/^([A-Z]{1,3})(\d{5})v(\d+)$/);
  
  if (!match) return null;

  const [, prefix, seqStr, versionStr] = match;
  const sequenceNumber = parseInt(seqStr, 10);
  const version = parseInt(versionStr, 10);

  const isPerfumerFormula = prefix.length > 1 && 
                            PERFUMER_DIRECTORY[prefix] !== undefined;

  return {
    prefix,
    sequenceNumber,
    version,
    fullId: formulaId,
    isPerfumerFormula,
    userInitials: isPerfumerFormula ? prefix : undefined
  };
};
```

## Pega Integration

### Current Implementation (Fallback)
The system currently uses local ID generation as a fallback when Pega integration is not available.

### Future Pega Integration
```typescript
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
```

## Usage in FormulaModal

```typescript
const handleCreateNewFormula = () => {
  // ... validation ...

  // Generate formula ID using new system
  const formulaId = generateFormulaId({
    formulaType: newFormulaData.formulaType,
    userInitials: getCurrentUserInitials(),
    existingFormulas: availableFormulas,
  });

  // Extract version from ID
  const versionMatch = formulaId.match(/v(\d+)$/);
  const version = versionMatch ? `v${versionMatch[1]}` : 'v1';

  const newFormula: Formula = {
    id: formulaId,
    name: formulaName,
    version: version,
    status: "draft",
    // ... other fields ...
  };
  
  onCreateFormula(newFormula);
};
```

## Testing Examples

```javascript
// Test in browser console:
import { generateFormulaId, setCurrentUserInitials } from './utils/idGeneration';
import { FORMULA_TYPES } from './config/formulaTypes.config';

// Set user
setCurrentUserInitials('MZ');

// Example 1: New base formula
generateFormulaId({
  formulaType: FORMULA_TYPES.BASE,
  userInitials: 'MZ',
  existingFormulas: []
});
// Result: B00001v1

// Example 2: New perfumer formula
generateFormulaId({
  formulaType: FORMULA_TYPES.PERFUMER,
  userInitials: 'MZ',
  existingFormulas: []
});
// Result: MZ00001v1

// Example 3: Create version
generateFormulaId({
  formulaType: FORMULA_TYPES.PERFUMER,
  userInitials: 'MZ',
  existingFormulas: [{ id: 'MZ00001v1' }],
  baseFormulaId: 'MZ00001v1',
  isUserCopy: true
});
// Result: MZ00001v2
```

## Status Workflow

- **Draft**: Initial state when formula is created
- **Experimental**: When first trial version is created
- **Design Locked**: When formula is locked (U-Code generated)
- **Released**: When approved for external release

## Notes

- All versions remain active and visible to perfumers
- Formula ID continues incrementing regardless of formula type
- Version numbers are specific to user+sequence combination
- Default user initials are 'AA' if no user is available
- U-Code is only generated when formula status changes to "Design Locked"
