# Formula Creation DX API Integration - Analysis & Plan Summary

**Date:** November 21, 2025  
**Status:** ✅ Plan Complete - Ready for Implementation  
**Branch:** 21Nov

---

## 📋 What Was Analyzed

### User Requirements Extracted
From the attachments provided, I've extracted and analyzed:

✅ **4 Pega Data Pages to Integrate:**
1. **D_CreateFormula** - Base formula creation with 25+ fields
2. **D_CreateFormulaVersion** - Version control
3. **D_ShareFormula** - Share with users
4. **D_CreateAnalyticalFormula** - Analytical formula with 20+ fields

✅ **3 Related User Stories:**
- **US #1108** - Formula Creation (mandatory fields, formula types, status)
- **US #1137** - Analytical Formula Upload (unique Sample ID, additional fields)
- **US #2202** - Import Analytical Sample File (file upload, field mapping)
- **US #1156** - Formula Navigation Quick Links

✅ **Key Business Rules:**
- 4 formula types: Base, Dilution, Analytical Formula, Perfumer Formula
- Field visibility depends on formula type
- System generates: Formula ID, Perfumer Formula ID, Status (DRAFT)
- Duplicate Sample ID prevention for analytical formulas
- Project propagation of certain fields
- Status workflow: DRAFT → Active → Archived

---

## 🔍 Current Implementation Analysis

### What Already Exists ✅
| Component | Status | Details |
|-----------|--------|---------|
| FormulaModal.tsx | ✅ Ready | Tab-based UI (Select/Create), formula type selector |
| Form Sections | ✅ Ready | Multiple sections for different data categories |
| DxApiService | ⚠️ Partial | GET methods exist, needs POST methods |
| ApiService | ✅ Ready | Routing layer (mock vs. DX API) - ready to extend |
| Feature Flags | ✅ Ready | Configuration system ready |
| Data Models | ✅ Ready | Formula type definitions in pega.ts |
| ID Generation | ✅ Ready | ID utilities available |

### Critical Gaps to Fill ❌
| Gap | Impact | Severity |
|-----|--------|----------|
| No POST methods in DxApiService | Cannot save formulas to Pega | 🔴 Critical |
| No formula creation TypeScript interfaces | Payload structure mismatch | 🔴 Critical |
| No validation logic | Invalid data passed to Pega | 🔴 Critical |
| No duplicate Sample ID check | Analytical formulas break | 🟠 High |
| Field visibility not enforced | UI shows wrong fields | 🟠 High |
| No formula versioning flow | Version tracking fails | 🟠 High |
| No analytical field handling | Incomplete feature | 🟠 High |
| No share formula capability | Team collaboration blocked | 🟡 Medium |

---

## 📊 Implementation Complexity Summary

### By Component

```
Complexity Matrix:
┌─────────────────────┬──────────┬──────────┐
│ Component           │ Effort   │ Risk     │
├─────────────────────┼──────────┼──────────┤
│ TypeScript Types    │ 1 hour   │ 🟢 Low   │
│ DX API Methods      │ 2 hours  │ 🟢 Low   │
│ Validation Logic    │ 1.5 hrs  │ 🟡 Med   │
│ API Service Extend  │ 1 hour   │ 🟢 Low   │
│ FormulaModal Update │ 3 hours  │ 🟠 High  │
│ Mock Data Support   │ 2 hours  │ 🟢 Low   │
│ Feature Flags       │ 30 mins  │ 🟢 Low   │
│ Testing             │ 3 hours  │ 🟡 Med   │
└─────────────────────┴──────────┴──────────┘

Total: ~13.5 hours | Complexity: 🟠 Medium
```

### By Feature

**Highest Complexity:**
- FormulaModal field visibility logic (conditional rendering per type)
- Validation rules across 4 different formula types
- Error handling for Pega-specific validation errors

**Medium Complexity:**
- API method integration following existing patterns
- Mock data support for testing

**Lowest Complexity:**
- Adding POST methods to DxApiService (follows existing GET pattern)
- Feature flag configuration

---

## 🎯 Implementation Plan Overview

### 6 Implementation Phases

```
Phase 1: TypeScript Interfaces (1 hour)
├─ CreateFormulaPayload ✨
├─ CreateFormulaVersionPayload ✨
├─ ShareFormulaPayload ✨
├─ CreateAnalyticalFormulaPayload ✨
└─ Response & Validation types ✨

Phase 2: DX API Service Methods (2 hours)
├─ createFormula() ✨
├─ createFormulaVersion() ✨
├─ shareFormula() ✨
├─ createAnalyticalFormula() ✨
└─ checkDuplicateSampleId() ✨

Phase 3: Validation & Helpers (1.5 hours)
├─ FormulaValidator class ✨
├─ validateBaseFormula() ✨
├─ validateAnalyticalFormula() ✨
├─ validateDilutionFormula() ✨
└─ buildCreateFormulaPayload() ✨

Phase 4: API Service Integration (1 hour)
├─ createFormula() ✨
├─ createFormulaVersion() ✨
├─ shareFormula() ✨
└─ createAnalyticalFormula() ✨

Phase 5: FormulaModal Component (3 hours)
├─ Field visibility logic ✨
├─ Validation before submit ✨
├─ API integration ✨
├─ Error/success handling ✨
└─ Analytical sections ✨

Phase 6: Configuration & Testing (3.5 hours)
├─ Update feature flags ✨
├─ Mock data support ✨
└─ Comprehensive testing ✨
```

---

## 📁 Files to Create & Modify

### New Files (3)
```
src/types/formula.creation.types.ts          (Main interfaces)
src/utils/formulaValidation.ts               (Validation logic)
docs/FORMULA_CREATION_DX_API_PLAN.md        (Detailed plan)
```

### Files to Extend (4)
```
src/services/dxApi.ts                        (+4 POST methods)
src/services/api.ts                          (+4 routing methods)
src/components/FormulaModal.tsx              (+validation, API calls)
src/config/featureFlags.ts                   (+5 new data pages)
```

### Files to Support (2)
```
src/services/pega.ts                         (+4 mock methods)
src/mocks/formulas.ts                        (Enhanced test data)
```

---

## 🎨 Field Visibility Matrix

How fields appear based on Formula Type:

```
Field                          | Base | Dilution | Analytical | Perfumer
──────────────────────────────┼──────┼──────────┼────────────┼─────────
Fragrance Name                 | ✅   | ✅       | ❌         | ✅
Sample ID                      | ❌   | ❌       | ✅ (req)   | ❌
Base Formula ID                | ❌   | ✅ (req) | ❌         | ❌
Analytical Fields (20+)        | ❌   | ❌       | ✅         | ❌
Project Details                | ✅   | ✅       | ✅         | ✅
Product Information            | ✅   | ✅       | ❌         | ✅
Production Info                | ✅   | ✅       | ❌         | ✅
EU Allergen Fields             | ✅   | ✅       | ❌         | ✅
Country/Region                 | ✅   | ✅       | ✅         | ✅
```

---

## 🔐 Mandatory Fields Checklist

**Per US #1108 - Formula Creation:**
- [ ] Formula Type (required, 4 options)
- [ ] Fragrance Name (required, visible only for Base/Dilution/Perfumer)
- [ ] Country (required, multi-select)
- [ ] Project ID (if linked to project)

**Per US #1137 - Analytical Formula:**
- [ ] Sample ID (required, must be unique)
- [ ] All other analytical fields optional

**System Generated (Auto-set):**
- [ ] Formula ID (system generated, format: B00001v1)
- [ ] Perfumer Formula ID (if applicable)
- [ ] Status: 'DRAFT' (on creation)
- [ ] Timestamp (auto)

---

## 🚀 Ready-to-Implement Code Structure

### Example: New Types File
```typescript
// src/types/formula.creation.types.ts
export interface CreateFormulaPayload {
  data: {
    ProjectID: string;
    Fragrance: string;
    FormulaType: 'Base' | 'Dilution' | 'Analytical Formula' | 'Perfumer Formula';
    FragranceActualDosage: number;
    // ... 22 more fields exactly as specified in Pega
  };
}
```

### Example: DX API Method
```typescript
// Add to src/services/dxApi.ts
static async createFormula(
  payload: CreateFormulaPayload
): Promise<DxApiResponse<CreateFormulaResponse>> {
  return this.executeRequest<CreateFormulaResponse>(
    `${featureFlags.api.dxApiConfig.baseUrl}/data-pages/D_CreateFormula`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
```

### Example: Validation
```typescript
// src/utils/formulaValidation.ts
static validateBaseFormula(data: NewFormulaData): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!data.formulaType) {
    errors.push({ field: 'formulaType', message: 'Formula Type is mandatory' });
  }
  if (!data.fragranceName) {
    errors.push({ field: 'fragranceName', message: 'Fragrance Name is mandatory' });
  }
  // ... more validations
  
  return { isValid: errors.length === 0, errors };
}
```

---

## ✨ Key Implementation Notes

### 1. Exact Payload Structure
- **Must replicate** Pega field names exactly (case-sensitive)
- **CamelCase vs PascalCase:** Pega uses `FragranceActualDosage` not `fragranceActualDosage`
- All fields in the `data` object (not at root level)

### 2. Error Handling Strategy
```
Validation Error (Client)
    ↓ Show field errors immediately
    
API Error (Pega)
    ↓ Duplicate Sample ID → Specific message
    ↓ Validation Error → Show Pega message
    ↓ Network Error → Queue + show offline
    ↓ Server Error → Fallback to mock
```

### 3. Formula ID Generation
- System generates on creation
- Response contains FormulaID
- Next call: D_CreateFormulaVersion with that ID
- Display format varies by type (B00001, P00001, D00001, A00001)

### 4. Status Management
- Default: 'DRAFT' when created
- Field: `FormulaStatus: 'DRAFT'` in payload
- Locked: `IsFragranceLocked: 'yes'` when saved

### 5. Mock Data Fallback
- If Pega API down, all 4 methods must work with mock
- Generate fake IDs locally using existing idGeneration utils
- Store in-memory or localStorage for session

---

## 📋 Pre-Implementation Checklist

Before starting implementation:

- [ ] Read the full plan at `docs/FORMULA_CREATION_DX_API_PLAN.md`
- [ ] Review Pega payload structure in attachments
- [ ] Verify existing featureFlags structure
- [ ] Test current mock data flow
- [ ] Setup test environment with mock data
- [ ] Review FormulaModal current implementation
- [ ] Plan database schema for formula storage (if needed)
- [ ] Coordinate with Pega team on endpoint URLs

---

## 📞 Questions to Resolve Before Implementation

1. **Pega Endpoint URLs** - Confirm exact URLs for all 4 data pages
2. **Authentication** - Using OAuth2 or API key?
3. **Project Propagation** - Which fields propagate from Project? (TargetRMC, TargetDosage, etc.)
4. **Formula ID Format** - Exact format rules? (B00001, B00001v1, etc.)
5. **Duplicate Check** - How to query existing Sample IDs from Pega?
6. **File Import** - SharePoint connection details for US #2202?
7. **Versioning Logic** - How to handle version increments?
8. **Permission Model** - Who can share formulas? Any role restrictions?

---

## 🎯 Success Criteria

All items must be ✅ before marking complete:

- [ ] All 4 Pega data pages integrated and tested
- [ ] Payload structures match Pega spec exactly
- [ ] Mandatory field validation working per US #1108
- [ ] Formula type determines field visibility correctly
- [ ] System generates formula IDs and versions
- [ ] Status set to 'DRAFT' on creation ✓
- [ ] Duplicate Sample ID prevention working
- [ ] Formula versioning flow complete
- [ ] Share formula capability functional
- [ ] Mock data fallback working
- [ ] All tests passing (unit + integration + E2E)
- [ ] No console errors or warnings
- [ ] Error messages user-friendly
- [ ] Performance acceptable (<2s for creation)

---

## 📚 Complete Implementation Plan Location

**Full detailed plan:** `docs/FORMULA_CREATION_DX_API_PLAN.md`

Includes:
- Phase-by-phase breakdown
- Code examples for each phase
- Field visibility matrix
- Error handling strategy
- Validation rules per formula type
- Timeline and effort estimates
- Success criteria checklist

---

## 🔄 Next Action

**Ready to start Phase 1: TypeScript Interfaces**

When ready, I can:
1. Create `src/types/formula.creation.types.ts` with all interfaces
2. Create `src/utils/formulaValidation.ts` with validation logic
3. Add POST methods to `src/services/dxApi.ts`
4. Extend `src/services/api.ts` with routing
5. Update `src/components/FormulaModal.tsx` with integration
6. Run tests and validation

**Estimated time for full implementation:** 13.5 hours

---

**Document Version:** 1.0  
**Status:** Ready for Implementation  
**Last Updated:** November 21, 2025
