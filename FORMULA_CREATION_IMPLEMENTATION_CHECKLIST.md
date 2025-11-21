# Formula Creation DX API - Implementation Checklist

**Date:** November 21, 2025  
**Status:** Ready for Development  
**Estimated Effort:** 13.5 hours  
**Related Docs:**
- `docs/FORMULA_CREATION_DX_API_PLAN.md` - Detailed implementation plan
- `docs/FORMULA_CREATION_PAYLOAD_MAPPING.md` - Exact payload structures
- `FORMULA_CREATION_INTEGRATION_SUMMARY.md` - Quick reference

---

## Phase 1: TypeScript Interfaces (1 hour) ⏳

**File:** `src/types/formula.creation.types.ts` (NEW)

### Checklist

- [ ] Create base file with proper header/comments
- [ ] Define `CreateFormulaPayload` interface with all 25 fields
  - [ ] Include `data` wrapper object
  - [ ] All field names match Pega exactly (case-sensitive)
  - [ ] All field types correct (string, number, etc.)
  - [ ] Comments for each field explaining source
- [ ] Define `CreateFormulaVersionPayload` interface (3 fields)
- [ ] Define `ShareFormulaPayload` interface (3 fields)
- [ ] Define `CreateAnalyticalFormulaPayload` interface with all 20+ fields
- [ ] Define response interfaces:
  - [ ] `CreateFormulaResponse` (FormulaID, PerfumerFormulaID, Status, CreatedTimestamp)
  - [ ] `CreateFormulaVersionResponse` (VersionID, etc.)
  - [ ] `ShareFormulaResponse` (ShareID, Status, etc.)
  - [ ] `CreateAnalyticalFormulaResponse` (AnalyticalCaseID, SampleID, Status, etc.)
- [ ] Define validation types:
  - [ ] `ValidationError` (field, message, value)
  - [ ] `ValidationResult` (isValid, errors[])
- [ ] Export all types
- [ ] Add JSDoc comments to each type
- [ ] No import errors when building

**Verification:**
```bash
npm run build  # Should compile without errors
```

---

## Phase 2: DX API Service Methods (2 hours) ⏳

**File:** `src/services/dxApi.ts` (EXTEND)

### Checklist for `createFormula()`

- [ ] Add method signature with `CreateFormulaPayload` parameter
- [ ] Use `executeRequest` helper (follow existing GET pattern)
- [ ] POST method to `/data-pages/D_CreateFormula`
- [ ] Include JSON Content-Type header
- [ ] Return `DxApiResponse<CreateFormulaResponse>`
- [ ] Add error handling
- [ ] Add JSDoc with example usage

### Checklist for `createFormulaVersion()`

- [ ] Add method signature with payload parameter
- [ ] POST method to `/data-pages/D_CreateFormulaVersion`
- [ ] Build payload structure from parameters
- [ ] Return `DxApiResponse<{ VersionID: string }>`
- [ ] Handle errors gracefully

### Checklist for `shareFormula()`

- [ ] Add method signature with payload parameter
- [ ] POST method to `/data-pages/D_ShareFormula`
- [ ] Include email validation check
- [ ] Return `DxApiResponse<{ ShareID: string; Status: string }>`

### Checklist for `createAnalyticalFormula()`

- [ ] Add method signature with payload parameter
- [ ] Call `checkDuplicateSampleId()` before creation
- [ ] If duplicate found: return error response (don't call API)
- [ ] POST method to `/data-pages/D_CreateAnalyticalFormula`
- [ ] Return `DxApiResponse<CreateAnalyticalFormulaResponse>`

### Checklist for `checkDuplicateSampleId()`

- [ ] Add as private static method
- [ ] GET to `/data-pages/D_CheckSampleIDExists?sampleId={id}`
- [ ] Return boolean (true = exists, false = available)
- [ ] Handle query string encoding properly
- [ ] Add error handling

### Verification

- [ ] All 5 methods compile without errors
- [ ] Methods follow existing patterns (dxApi.ts style)
- [ ] Proper error handling (try-catch, typed responses)
- [ ] No TypeScript errors: `npm run lint`
- [ ] JSDoc comments complete and accurate

---

## Phase 3: Validation Logic (1.5 hours) ⏳

**File:** `src/utils/formulaValidation.ts` (NEW)

### Checklist for `FormulaValidator` class

- [ ] Create class with static methods
- [ ] Add `validateBaseFormula()` method
  - [ ] Check formulaType required ✓
  - [ ] Check fragranceName required ✓
  - [ ] Check country required ✓
  - [ ] Check fragranceDosage range (0-100) if provided ✓
  - [ ] Return ValidationResult with errors[] ✓
- [ ] Add `validateAnalyticalFormula()` method
  - [ ] Check sampleId required ✓
  - [ ] Check sampleId unique (will be checked server-side) ✓
  - [ ] Return ValidationResult ✓
- [ ] Add `validateDilutionFormula()` method
  - [ ] Run base validation ✓
  - [ ] Check baseFormulaId required ✓
  - [ ] Check dilutionPercentage range (0-100) if provided ✓
- [ ] Add `validatePerfumerFormula()` method (similar to base)

### Checklist for `buildCreateFormulaPayload()`

- [ ] Accept `NewFormulaData` and `userId` parameters
- [ ] Map all NewFormulaData fields to Pega payload fields
- [ ] Handle PascalCase conversion (e.g., `fragranceName` → `Fragrance`)
- [ ] Set defaults for optional fields
- [ ] Set `FormulaStatus: 'DRAFT'` always
- [ ] Set `IsFragranceLocked: 'no'` for new formulas
- [ ] Handle field transformations (arrays to CSV strings, etc.)
- [ ] Return payload with proper structure: `{ data: { ... } }`

### Checklist for `buildAnalyticalPayload()`

- [ ] Accept `NewFormulaData` parameter
- [ ] Build analytical payload structure
- [ ] Set `FormulaType: 'Analytical Formula'` always
- [ ] Include all 20+ analytical fields
- [ ] Return proper structure

### Checklist for `mapFormulaType()`

- [ ] Map "BASE" → "Base"
- [ ] Map "DILUTION" → "Dilution"
- [ ] Map "ANALYTICAL" → "Analytical Formula"
- [ ] Map "PERFUMER" → "Perfumer Formula"
- [ ] Handle unknown values gracefully

### Verification

- [ ] All methods compile without errors
- [ ] Unit tests for each validator pass
- [ ] Validation errors have meaningful messages
- [ ] Field names exactly match Pega (check case-sensitivity)
- [ ] No TypeScript errors: `npm run lint`
- [ ] Edge cases handled (null, undefined, empty strings)

---

## Phase 4: API Service Layer (1 hour) ⏳

**File:** `src/services/api.ts` (EXTEND)

### Checklist for `createFormula()`

- [ ] Accept `CreateFormulaPayload` parameter
- [ ] Check if using DX API or mock
- [ ] If DX API: call `DxApiService.createFormula(payload)`
- [ ] If mock: call `PegaService.createFormula(payload)`
- [ ] Map response using `mapDxApiResponse()`
- [ ] Handle errors via `handleError()`
- [ ] Return `ApiResponse<CreateFormulaResponse>`

### Checklist for `createFormulaVersion()`

- [ ] Accept formulaId, currentVersion, perfumerFormulaId? parameters
- [ ] Build `CreateFormulaVersionPayload` internally
- [ ] Route to DX API or mock
- [ ] Return proper response type

### Checklist for `shareFormula()`

- [ ] Accept formulaId, version, userEmail parameters
- [ ] Build `ShareFormulaPayload` internally
- [ ] Validate email format (basic)
- [ ] Route to DX API or mock
- [ ] Return proper response type

### Checklist for `createAnalyticalFormula()`

- [ ] Accept `CreateAnalyticalFormulaPayload` parameter
- [ ] Route to DX API or mock
- [ ] Return proper response type

### Verification

- [ ] All methods follow existing ApiService patterns
- [ ] Proper error handling and response mapping
- [ ] Routes correctly based on feature flag
- [ ] No TypeScript errors
- [ ] Methods integrated with mock service

---

## Phase 5: FormulaModal Component (3 hours) ⏳

**File:** `src/components/FormulaModal.tsx` (EXTEND)

### Checklist for Validation Integration

- [ ] Import `FormulaValidator` from validation utils
- [ ] Add `validationErrors` to component state
- [ ] Before submit: call appropriate validator
  - [ ] If analytical: `FormulaValidator.validateAnalyticalFormula()`
  - [ ] If dilution: `FormulaValidator.validateDilutionFormula()`
  - [ ] Else: `FormulaValidator.validateBaseFormula()`
- [ ] If validation fails: display errors and don't submit
- [ ] Show field-level error messages
- [ ] Clear errors when user corrects field

### Checklist for API Integration

- [ ] Import `ApiService` methods
- [ ] Add API call handler `handleCreateFormula()`
  - [ ] Run validation first
  - [ ] Build payload using `buildCreateFormulaPayload()`
  - [ ] Call `ApiService.createFormula(payload)`
  - [ ] Check response success
  - [ ] If success:
    - [ ] Extract FormulaID from response
    - [ ] Call `ApiService.createFormulaVersion(...)`
    - [ ] Call `onCreateFormula()` callback
    - [ ] Close modal
  - [ ] If failure: show error message
- [ ] Add loading state while API call in progress
- [ ] Add error state with retry option

### Checklist for Field Visibility

- [ ] Import `isFieldVisible()` from config
- [ ] For each form section:
  - [ ] Conditionally render based on formula type
  - [ ] Hide fields not applicable to selected type
  - [ ] Show mandatory indicators for required fields
- [ ] Specific checks:
  - [ ] Fragrance Name: hidden for ANALYTICAL only
  - [ ] Sample ID: shown for ANALYTICAL only (mandatory)
  - [ ] Base Formula ID: shown for DILUTION only (mandatory)
  - [ ] Analytical section: shown for ANALYTICAL only
  - [ ] Project details: always shown
  - [ ] Product info: hidden for ANALYTICAL

### Checklist for Analytical Formula Sections

- [ ] Add new form sections for analytical fields
- [ ] Include all 20+ analytical fields:
  - [ ] Versioning Analytical
  - [ ] Suffix
  - [ ] Suffix Information
  - [ ] Tracked Competitor
  - [ ] Tracking ID
  - [ ] Sample Type
  - [ ] Sample Weight
  - [ ] Extraction Method
  - [ ] Internal Standard Volume/Number/Concentration
  - [ ] Data Analysis Method
  - [ ] Comments
  - [ ] Alkane Standard Information
  - [ ] Fragrance Inclusion Level
  - [ ] Data Analyst
  - [ ] Component Count
  - [ ] Generic Cost
  - [ ] Formula Costed
  - [ ] Solvent Level
  - [ ] MCM/PCM/NM Level
- [ ] All fields optional except Sample ID

### Checklist for Error/Success Handling

- [ ] Show toast/notification on success
- [ ] Show toast/notification on error
- [ ] Display specific error messages:
  - [ ] Validation errors (field-level)
  - [ ] Duplicate Sample ID error
  - [ ] Network/API errors
  - [ ] Pega-specific validation errors
- [ ] Provide retry mechanism for failed API calls
- [ ] Log errors to console (dev only)

### Checklist for State Management

- [ ] Add state for API loading: `isSubmitting`
- [ ] Add state for API error: `submissionError`
- [ ] Add state for validation errors: `validationErrors`
- [ ] Update states during API lifecycle
- [ ] Clear errors on input change

### Verification

- [ ] Component renders without errors
- [ ] Form validation works for each formula type
- [ ] API calls made with correct payloads
- [ ] Error messages display correctly
- [ ] Field visibility logic works
- [ ] Loading state shows during submission
- [ ] No TypeScript errors
- [ ] Browser console clean

---

## Phase 6: Mock Data & Configuration (2.5 hours) ⏳

**File:** `src/services/pega.ts` (EXTEND)

### Checklist for Mock Implementation

- [ ] Add `createFormula()` method to PegaService
  - [ ] Accept payload parameter
  - [ ] Generate mock FormulaID (e.g., "B" + timestamp + serial)
  - [ ] Return response with FormulaID, status, timestamp
  - [ ] Store created formula in mock data (optional)
- [ ] Add `createFormulaVersion()` method
  - [ ] Accept parameters
  - [ ] Return mock version response
- [ ] Add `shareFormula()` method
  - [ ] Accept parameters
  - [ ] Return mock share response
- [ ] Add `createAnalyticalFormula()` method
  - [ ] Accept payload parameter
  - [ ] Check for duplicate Sample ID in mock data
  - [ ] Return mock analytical response
- [ ] Add `checkDuplicateSampleId()` method
  - [ ] Accept sampleId parameter
  - [ ] Return boolean (true if exists)
  - [ ] Check against mock data

### File: `src/config/featureFlags.ts` (EXTEND)

- [ ] Add to `dataPages` object:
  - [ ] `formulaCreation: 'D_CreateFormula'`
  - [ ] `formulaVersioning: 'D_CreateFormulaVersion'`
  - [ ] `formulaSharing: 'D_ShareFormula'`
  - [ ] `analyticalFormulaCreation: 'D_CreateAnalyticalFormula'`
  - [ ] `checkDuplicateSampleId: 'D_CheckSampleIDExists'`
- [ ] Verify URLs match Pega endpoints
- [ ] Add comments explaining each data page

### File: `src/mocks/formulas.ts` (ENHANCE)

- [ ] Add sample analytical formulas with all fields
- [ ] Add variations:
  - [ ] Base formula (all fields populated)
  - [ ] Dilution formula (with base reference)
  - [ ] Analytical formula (with sample ID)
  - [ ] Perfumer formula (all fields)
- [ ] Include proper TypeScript types
- [ ] Add helper to generate test data

### Verification

- [ ] Mock methods called when feature flag `useDxApi = false`
- [ ] Mock data has realistic structure
- [ ] Duplicate Sample ID detection works
- [ ] Formula IDs generated correctly
- [ ] All tests pass with mock data
- [ ] Can toggle between mock and real API

---

## Phase 7: Testing (3 hours) ⏳

### Unit Tests

**File:** `src/utils/formulaValidation.test.ts` (NEW)

- [ ] Test `validateBaseFormula()`
  - [ ] Valid base formula passes ✓
  - [ ] Missing formulaType fails ✓
  - [ ] Missing fragranceName fails ✓
  - [ ] Missing country fails ✓
  - [ ] Invalid dosage % fails (>100) ✓
  - [ ] Error messages are clear ✓
- [ ] Test `validateAnalyticalFormula()`
  - [ ] Valid analytical passes ✓
  - [ ] Missing sampleId fails ✓
- [ ] Test `validateDilutionFormula()`
  - [ ] Valid dilution passes ✓
  - [ ] Missing baseFormulaId fails ✓
- [ ] Test `buildCreateFormulaPayload()`
  - [ ] Payload structure correct ✓
  - [ ] All fields mapped correctly ✓
  - [ ] PascalCase conversion works ✓
  - [ ] Defaults applied ✓
- [ ] Test `mapFormulaType()`
  - [ ] All 4 types map correctly ✓
  - [ ] Unknown types handled ✓

### Integration Tests

**File:** `src/services/api.test.ts` (NEW)

- [ ] Test `createFormula()` with DX API enabled
  - [ ] Calls DxApiService.createFormula() ✓
  - [ ] Response mapped correctly ✓
  - [ ] Error handled correctly ✓
- [ ] Test `createFormula()` with mock data
  - [ ] Calls PegaService.createFormula() ✓
  - [ ] Response has correct structure ✓
- [ ] Test `createFormulaVersion()`
  - [ ] Payload built correctly ✓
  - [ ] API called with correct params ✓
- [ ] Test `shareFormula()`
  - [ ] Email validation ✓
  - [ ] API called with correct params ✓
- [ ] Test `createAnalyticalFormula()`
  - [ ] Duplicate check happens first ✓
  - [ ] If duplicate: error returned ✓
  - [ ] If unique: API called ✓

### Component Tests

**File:** `src/components/FormulaModal.test.tsx` (UPDATE/NEW)

- [ ] Test field visibility per formula type
  - [ ] Base: shows fragrance name, hides sample ID ✓
  - [ ] Dilution: shows base formula ID ✓
  - [ ] Analytical: shows sample ID (mandatory) ✓
  - [ ] Analytical: hides fragrance name ✓
- [ ] Test validation
  - [ ] Form submit blocked if invalid ✓
  - [ ] Error messages shown ✓
  - [ ] Errors cleared on input change ✓
- [ ] Test API submission
  - [ ] Loading state shown during submission ✓
  - [ ] API called with correct payload ✓
  - [ ] Success message shown ✓
  - [ ] Modal closes on success ✓
  - [ ] Error message shown on failure ✓
- [ ] Test analytical formula creation
  - [ ] All 20+ fields included ✓
  - [ ] Unique sample ID enforced ✓

### End-to-End Tests

**File:** Manual test scenarios (DOCUMENT IN TEST PLAN)

- [ ] Test Scenario 1: Create Base Formula
  - [ ] Fill all mandatory fields
  - [ ] Submit formula
  - [ ] Verify formula ID generated
  - [ ] Verify status is DRAFT
  - [ ] Verify version created
- [ ] Test Scenario 2: Create Dilution Formula
  - [ ] Select dilution type
  - [ ] Base formula field required
  - [ ] Submit successfully
- [ ] Test Scenario 3: Create Analytical Formula
  - [ ] Select analytical type
  - [ ] Sample ID field appears (required)
  - [ ] Cannot use duplicate sample ID
  - [ ] Submit successfully
- [ ] Test Scenario 4: API Fallback
  - [ ] Disable DX API (feature flag)
  - [ ] Create formula with mock data
  - [ ] Verify mock data used
  - [ ] Verify form still works
- [ ] Test Scenario 5: Error Handling
  - [ ] Test network error
  - [ ] Test Pega validation error
  - [ ] Test duplicate Sample ID error
  - [ ] Verify error messages clear

### Test Coverage

- [ ] Unit: ≥90% coverage
- [ ] Integration: ≥80% coverage
- [ ] Component: ≥75% coverage
- [ ] Run: `npm run test -- --coverage`

### Verification

- [ ] All tests pass: `npm run test`
- [ ] No test warnings
- [ ] Coverage targets met
- [ ] Integration tests pass
- [ ] E2E scenarios documented
- [ ] No console errors during tests

---

## Final Verification (0.5 hours) ⏳

### Build & Quality

- [ ] Clean build: `npm run build` ✅
- [ ] No TypeScript errors: `npm run lint` ✅
- [ ] All tests pass: `npm run test` ✅
- [ ] No console errors or warnings ✅
- [ ] Bundle size not significantly increased ✅

### Code Review Checklist

- [ ] All code follows project conventions ✅
- [ ] JSDoc comments on all public methods ✅
- [ ] Error handling complete ✅
- [ ] Type safety ensured (no `any` types) ✅
- [ ] No hardcoded values ✅
- [ ] Feature flags used correctly ✅
- [ ] Consistent with existing patterns ✅
- [ ] Performance acceptable (<2s for creation) ✅

### Documentation

- [ ] FORMULA_CREATION_DX_API_PLAN.md complete ✅
- [ ] FORMULA_CREATION_PAYLOAD_MAPPING.md accurate ✅
- [ ] FORMULA_CREATION_INTEGRATION_SUMMARY.md updated ✅
- [ ] Code comments clear ✅
- [ ] README updated if needed ✅

### Git & Deployment

- [ ] All changes committed with clear messages ✅
- [ ] Branch created for feature: `feature/formula-creation-dx-api` ✅
- [ ] No merge conflicts ✅
- [ ] Ready for PR review ✅
- [ ] Ready for staging deployment ✅

---

## Success Criteria (Final Checklist)

All items must be ✅ before considering work complete:

### Functionality
- [ ] D_CreateFormula endpoint integrated ✅
- [ ] D_CreateFormulaVersion endpoint integrated ✅
- [ ] D_ShareFormula endpoint integrated ✅
- [ ] D_CreateAnalyticalFormula endpoint integrated ✅
- [ ] All payloads match Pega spec exactly ✅

### Validation & Rules
- [ ] Mandatory field validation working ✅
- [ ] Formula type-based field visibility correct ✅
- [ ] Duplicate Sample ID prevention ✅
- [ ] Status set to 'DRAFT' on creation ✅
- [ ] Formula versioning working ✅

### Error Handling
- [ ] Network errors handled ✅
- [ ] Pega validation errors displayed ✅
- [ ] Duplicate Sample ID shows specific error ✅
- [ ] User-friendly error messages ✅
- [ ] Retry mechanism available ✅

### Testing
- [ ] Unit tests pass ✅
- [ ] Integration tests pass ✅
- [ ] Component tests pass ✅
- [ ] E2E scenarios documented ✅
- [ ] Test coverage ≥80% ✅

### Quality
- [ ] No TypeScript errors ✅
- [ ] No ESLint errors ✅
- [ ] No console errors ✅
- [ ] Performance acceptable ✅
- [ ] Code follows conventions ✅

### Integration
- [ ] Mock data fallback working ✅
- [ ] Feature flag controls behavior ✅
- [ ] Existing functionality not broken ✅
- [ ] Database/storage integrated if needed ✅

### Documentation
- [ ] Implementation plan complete ✅
- [ ] Payload mappings documented ✅
- [ ] Code comments clear ✅
- [ ] Test scenarios documented ✅

---

## Notes

### Common Issues to Watch For

1. **Field Name Casing** - Pega uses PascalCase, not camelCase
   - ❌ `fragranceActualDosage`
   - ✅ `FragranceActualDosage`

2. **Payload Wrapping** - All fields must be in `data` object
   - ❌ `{ FormulaType: "Base", ... }`
   - ✅ `{ data: { FormulaType: "Base", ... } }`

3. **Status Default** - Always create with status "DRAFT"
   - ❌ Leaving empty
   - ✅ `FormulaStatus: "DRAFT"`

4. **Sample ID Uniqueness** - Check BEFORE calling create
   - ❌ Call API, then handle duplicate error
   - ✅ Call checkDuplicateSampleId first

5. **Formula Type Mapping** - Map correctly from UI to Pega format
   - UI: "ANALYTICAL" → Pega: "Analytical Formula"
   - Case matters!

---

## Timeline Summary

| Phase | Task | Hours | Status |
|-------|------|-------|--------|
| 1 | TypeScript Interfaces | 1.0 | ⏳ Not Started |
| 2 | DX API Methods | 2.0 | ⏳ Not Started |
| 3 | Validation Logic | 1.5 | ⏳ Not Started |
| 4 | API Service Layer | 1.0 | ⏳ Not Started |
| 5 | FormulaModal Component | 3.0 | ⏳ Not Started |
| 6 | Mock & Config | 2.5 | ⏳ Not Started |
| 7 | Testing & Verification | 3.0 | ⏳ Not Started |
| **TOTAL** | | **13.5** | ⏳ **Not Started** |

---

## Implementation Kickoff

**When ready to begin:**

1. ✅ Print this checklist
2. ✅ Create feature branch: `git checkout -b feature/formula-creation-dx-api`
3. ✅ Start with Phase 1: TypeScript Interfaces
4. ✅ Follow checklist items in order
5. ✅ Mark items complete as you go
6. ✅ Keep documents updated with progress
7. ✅ Commit code frequently with clear messages
8. ✅ When all ✅ complete, create PR for review

---

**Document Version:** 1.0  
**Created:** November 21, 2025  
**Status:** Ready for Implementation  
**Next Action:** Begin Phase 1 - Create TypeScript Interfaces
