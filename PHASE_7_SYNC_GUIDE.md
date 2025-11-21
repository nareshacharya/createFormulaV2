# Phase 7: FormulaDetailsModal Sync Guide 🔄

## Objective
Ensure complete field parity between FormulaModal (create) and FormulaDetailsModal (edit) to guarantee consistent user experience across create, view, and edit flows.

## Context

### Phase 6 Accomplishment
- ✅ Optimized FormulaModal with 4-tab structure
- ✅ Integrated all validation logic
- ✅ Connected to API service layer
- ✅ Implemented toast notifications

### Current State
FormulaDetailsModal exists and supports:
- ✅ View-only mode (read-only formula display)
- ✅ Edit mode (for editable/owned formulas)
- ✅ Field visibility per formula type
- ✅ Project reference loading

### Challenge: Inconsistency Detection
**Current Issue:** FormulaDetailsModal uses a different field grouping approach than the new optimized FormulaModal:

**Old Modal (7 tabs):**
- Identification, General & Dosage, Project Info, Product Info, System Codes, Production, Additional

**New Modal (4 tabs):**
- Identification, Details, Product & Project, Additional

**FormulaDetailsModal (Field Groups):**
- Uses `@/config/fieldConfigs/` system:
  - formulaDetails.fields
  - generalInfo.fields
  - productInfo.fields
  - projectReference.fields
  - (No production/additional fields separate)

## Sync Strategy

### Phase 7A: Analysis (Current Stage)
**Goal:** Understand current field configurations and identify gaps

**Required Tasks:**
1. ✅ Map all fields in FormulaDetailsModal
   - Located in: `src/config/fieldConfigs/`
   - Key files: formulaDetails.fields, generalInfo.fields, productInfo.fields, projectReference.fields

2. Identify fields missing in FormulaDetailsModal
   - System Codes (SAP PLM, LIMS) - Check if in formulaDetails.fields
   - Production Info - Check if in any field config
   - Additional Info - Check if in any field config

3. Compare field definitions in create vs edit
   - Field types (text, select, number, date)
   - Validation rules (min/max, patterns)
   - Required vs optional status
   - Field visibility rules per formula type

### Phase 7B: Consolidation (Next)
**Goal:** Unified field configuration system

**Required Changes:**
1. Create unified field config used by BOTH modals
   - Location: `src/config/fieldConfigs/unifiedFormula.fields.ts` (new file)
   - Must include ALL fields used in FormulaModal
   - Must respect field visibility matrix per formula type

2. Export field groups matching 4-tab structure:
   ```typescript
   export const IDENTIFICATION_FIELDS = [...]
   export const DETAILS_FIELDS = [...]
   export const PRODUCT_PROJECT_FIELDS = [...]
   export const ADDITIONAL_FIELDS = [...]
   ```

3. Update FormulaDetailsModal to use unified config
4. Update FormulaModal to use unified config (Phase 6 already uses section components)

### Phase 7C: Synchronization (Next)
**Goal:** Field-level consistency

**Required Verification:**
1. ✅ Field names match exactly (camelCase in code)
2. ✅ Field types identical (text, number, select, etc.)
3. ✅ Validation rules consistent
4. ✅ Required status matches per formula type
5. ✅ Visibility rules identical
6. ✅ Placeholder text consistent
7. ✅ Help text/tooltips consistent

### Phase 7D: Flow Testing (Final)
**Goal:** Complete user journey consistency

**Testing Flows:**
1. Create Base Formula → View Details → Edit → Save
2. Create Dilution Formula → View Details → Edit → Save
3. Create Analytical Formula → View Details → Edit → Save
4. Create Perfumer Formula → View Details → Edit → Save

**Verification Points:**
- All fields visible in create appear in edit
- All fields editable in edit were fillable in create
- No extra fields appear in edit that weren't in create
- Field values persist correctly through create→view→edit cycle
- Validation rules enforced in both create and edit
- Error messages identical in both modals

## Current Field Configuration Structure

### Existing Files
Located in `src/config/fieldConfigs/`:
- `generalInfo.fields.ts` - General information fields
- `formulaDetails.fields.ts` - Formula-specific details
- `productInfo.fields.ts` - Product information
- `projectReference.fields.ts` - Project reference fields
- `ingredientAttributes.fields.ts` - Ingredient attributes (separate concern)

### Field Definition Structure
Each field typically includes:
```typescript
interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'multi-select';
  group: 'general-info' | 'formula-details' | 'product-info' | 'project-ref';
  required: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
  visibilityRules?: {
    visibleFor?: FormulaType[];
    hiddenFor?: FormulaType[];
    condition?: (formData: Record<string, any>) => boolean;
  };
}
```

## Implementation Checklist

### Step 1: Field Mapping
- [ ] List all fields currently in FormulaDetailsModal field configs
- [ ] List all fields rendered in FormulaModal components
- [ ] Identify missing/extra fields
- [ ] Document discrepancies

### Step 2: Unified Configuration
- [ ] Create `src/config/fieldConfigs/unifiedFormula.fields.ts`
- [ ] Define IDENTIFICATION_FIELDS array
- [ ] Define DETAILS_FIELDS array (includes General Info + System Codes)
- [ ] Define PRODUCT_PROJECT_FIELDS array (includes Product + Project)
- [ ] Define ADDITIONAL_FIELDS array
- [ ] Add field visibility rules per formula type
- [ ] Export for use in both modals

### Step 3: Modal Updates
- [ ] Update FormulaDetailsModal to import unified config
- [ ] Update field rendering to use unified arrays
- [ ] Verify tab grouping matches FormulaModal
- [ ] Test field visibility per formula type

### Step 4: Validation Alignment
- [ ] Compare validation rules in FormulaValidator vs FormulaDetailsModal
- [ ] Ensure same rules applied in both
- [ ] Update FormulaDetailsModal if validation differs

### Step 5: Testing
- [ ] Test create Base → view → edit flow
- [ ] Test create Analytical → view → edit flow
- [ ] Verify field presence in all screens
- [ ] Verify field values persist
- [ ] Verify validation consistent
- [ ] Test all 4 formula types

### Step 6: Edge Cases
- [ ] Test hidden fields don't appear
- [ ] Test required fields enforced in edit
- [ ] Test optional fields optional in edit
- [ ] Test conditional visibility logic
- [ ] Test dropdown options consistent

## Critical Success Factors

### 1. Field Name Consistency
**Current Risk:** Field names might differ between components
```typescript
// BAD: Different names in different places
formulaData.fragranceName    // FormulaModal
formData.fragrance_name      // FormulaDetailsModal

// GOOD: Consistent everywhere
formulaData.fragranceName    // Both modals
```

### 2. Type Safety
**Current Risk:** Type mismatches between camelCase (UI) and PascalCase (API)
```typescript
// Good: Convert at API boundary only
// FormulaModal: NewFormulaData (camelCase)
// API Layer: buildCreateFormulaPayload() converts to PascalCase
// FormulaDetailsModal: Uses camelCase for consistency
```

### 3. Visibility Matrix
**Current Risk:** Different visibility logic in different places
```typescript
// Must use same logic everywhere
const isVisible = isFieldVisible(fieldName, formulaType);
// Apply in FormulaModal rendering ✅
// Apply in FormulaDetailsModal rendering ✅
```

### 4. Validation Consistency
**Current Risk:** Different validation rules
```typescript
// Must validate identically in both places
// Pre-submission in FormulaModal ✅
// Real-time in FormulaDetailsModal ✅
// Must use same validation rules (FormulaValidator)
```

## Implementation Code Patterns

### Creating Unified Field Config

```typescript
// src/config/fieldConfigs/unifiedFormula.fields.ts
import type { FormField } from '../../models/FormField.model';
import { FORMULA_TYPES, type FormulaType } from '../formulaTypes.config';

export const IDENTIFICATION_FIELDS: FormField[] = [
  {
    name: 'formulaType',
    label: 'Formula Type',
    type: 'select',
    group: 'identification',
    required: true,
    options: [
      { value: FORMULA_TYPES.BASE, label: 'Base Formula' },
      { value: FORMULA_TYPES.DILUTION, label: 'Dilution Formula' },
      { value: FORMULA_TYPES.ANALYTICAL, label: 'Analytical Formula' },
      { value: FORMULA_TYPES.PERFUMER, label: 'Perfumer Formula' },
    ],
    visibilityRules: {
      visibleFor: [FORMULA_TYPES.BASE, FORMULA_TYPES.DILUTION, FORMULA_TYPES.ANALYTICAL, FORMULA_TYPES.PERFUMER],
    },
  },
  // ... more fields
];

export const DETAILS_FIELDS: FormField[] = [
  // General Information
  {
    name: 'fragranceName',
    label: 'Fragrance Name',
    type: 'text',
    group: 'general-info',
    required: true,
    placeholder: 'Enter fragrance name',
    validation: {
      minLength: 3,
      maxLength: 100,
    },
    visibilityRules: {
      visibleFor: [FORMULA_TYPES.BASE, FORMULA_TYPES.DILUTION, FORMULA_TYPES.PERFUMER],
      hiddenFor: [FORMULA_TYPES.ANALYTICAL],
    },
  },
  // ... more fields from General + System Codes
];

// ... export other field arrays

export const ALL_UNIFIED_FIELDS = [
  ...IDENTIFICATION_FIELDS,
  ...DETAILS_FIELDS,
  ...PRODUCT_PROJECT_FIELDS,
  ...ADDITIONAL_FIELDS,
];
```

### Using in FormulaDetailsModal

```typescript
import { 
  IDENTIFICATION_FIELDS, 
  DETAILS_FIELDS, 
  PRODUCT_PROJECT_FIELDS, 
  ADDITIONAL_FIELDS,
  ALL_UNIFIED_FIELDS 
} from '../config/fieldConfigs/unifiedFormula.fields';

// In component:
const allFields = ALL_UNIFIED_FIELDS;
const visibleFields = allFields.filter(field => 
  isFieldVisibleForType(field, formulaType, formData)
);

// Group by tab
const identificationFields = visibleFields.filter(f => f.group === 'identification');
const detailsFields = visibleFields.filter(f => f.group === 'details');
const productProjectFields = visibleFields.filter(f => f.group === 'product-project');
const additionalFields = visibleFields.filter(f => f.group === 'additional');
```

## Timeline & Effort

### Phase 7A: Analysis
**Effort:** 1-2 hours
**Deliverable:** Gap analysis document

### Phase 7B: Consolidation
**Effort:** 2-3 hours
**Deliverable:** Unified field config file

### Phase 7C: Synchronization
**Effort:** 2-3 hours
**Deliverable:** Updated FormulaDetailsModal

### Phase 7D: Testing & Validation
**Effort:** 2-3 hours
**Deliverable:** Verified create→view→edit flows

**Total Phase 7 Estimate: 7-11 hours**

## Known Issues to Address

1. **Production/Additional Fields**
   - Current: Not explicitly defined in field configs
   - Solution: Add to unifiedFormula.fields.ts with appropriate visibility rules

2. **Field Options/Dropdowns**
   - Current: Mock data in FormulaDetailsModal
   - Solution: Use consistent reference data source (already available in FormulaSections)

3. **Conditional Visibility**
   - Current: Complex logic scattered across components
   - Solution: Centralize in FormField.visibilityRules with clear conditions

4. **Edit Mode Restrictions**
   - Current: Some fields disabled in edit mode
   - Solution: Add editableAfterCreation property to FormField interface

## Success Criteria ✅

- [ ] All fields in create modal visible/editable in edit modal
- [ ] Field definitions identical between modals
- [ ] Validation rules consistent
- [ ] No type mismatches between modals
- [ ] Create → View → Edit → Save flow works for all 4 formula types
- [ ] Field values persist correctly through entire flow
- [ ] Error messages identical where applicable
- [ ] UI/UX consistent between create and edit screens
- [ ] Code coverage ready for Phase 8 testing

## Next Steps After Phase 7

### Phase 8: Testing & Validation
Once Phase 7 complete and field sync verified:
- Write comprehensive unit tests
- Test all 4 formula types
- Test error scenarios
- Test validation consistency
- E2E testing of full flows

### Documentation
- Update user guide with create/edit flow
- Document field visibility matrix
- Create troubleshooting guide
- Document known limitations

## References

- **Create Modal:** `src/components/FormulaModal.tsx`
- **Edit Modal:** `src/components/FormulaDetailsModal.tsx`
- **Field Configs:** `src/config/fieldConfigs/`
- **Validation:** `src/utils/formulaValidation.ts`
- **Models:** `src/models/FormField.model.ts`
- **Formula Types:** `src/config/formulaTypes.config.ts`

## Common Pitfalls to Avoid

1. ❌ Don't forget to update field names across all files
2. ❌ Don't mix camelCase and PascalCase in UI code
3. ❌ Don't apply validation only in one modal
4. ❌ Don't forget visibility rules for each formula type
5. ❌ Don't test with only one formula type
6. ✅ DO test complete create→view→edit flow for all types
7. ✅ DO use unified config in both modals
8. ✅ DO keep API layer separate from UI
9. ✅ DO maintain backward compatibility
10. ✅ DO document all changes clearly

---

**Status: READY FOR IMPLEMENTATION** 🚀

Phase 7 is ready to begin. Start with Phase 7A (Analysis) to map all current fields, then proceed systematically through 7B, 7C, and 7D.
