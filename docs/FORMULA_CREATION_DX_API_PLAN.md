# Formula Creation - DX API Integration Plan

**Date:** November 21, 2025  
**Status:** Planning Phase  
**Related User Stories:** #1108, #1137, #1156, #2202

---

## Executive Summary

This document outlines the integration of 4 formula creation Pega Data Pages into the CreateFormulaV2 application:

1. **D_CreateFormula** - Base formula creation
2. **D_CreateFormulaVersion** - Formula versioning
3. **D_ShareFormula** - Share formula with users
4. **D_CreateAnalyticalFormula** - Analytical formula creation

### Key Requirements
- ✅ Exact payload structure replication from Pega
- ✅ Mandatory field validation per user story #1108
- ✅ Formula type-based field visibility (Base, Dilution, Analytical, Perfumer)
- ✅ System-generated formula IDs with proper versioning
- ✅ Duplicate Sample ID prevention for analytical formulas
- ✅ Status management (DRAFT on creation, locked fields when saved)
- ✅ Project linkage and propagation
- ✅ Fallback to mock data if Pega API unavailable

---

## Current Implementation Analysis

### What Exists ✅
1. **FormulaModal.tsx** - Component with tab-based UI (Select/Create)
2. **FormulaTypeSelection** - Type selector (Base, Dilution, Analytical, Perfumer)
3. **FormulaSections/** - Multiple sections for data input
4. **DxApiService** - API abstraction layer with GET methods
5. **ApiService** - Routing layer (mock vs. DX API)
6. **featureFlags.ts** - Feature toggle configuration
7. **idGeneration.ts** - ID generation utilities
8. **Formula data model** - Type definitions in pega.ts

### Gaps to Fill ⚠️

| Gap | Impact | Solution |
|-----|--------|----------|
| No POST methods in DxApiService | Cannot save formulas | Add 4 new DX API methods |
| No formula creation types/interfaces | Payload mismatch | Create TypeScript interfaces |
| No validation logic | Invalid data submission | Add validation helpers |
| No duplicate Sample ID check | Analytical formula issues | Query before create |
| No formula versioning logic | Version tracking fails | Implement D_CreateFormulaVersion |
| No share formula capability | Collaboration blocked | Implement D_ShareFormula |
| No analytical field handling | Incomplete analytical support | Extend FormulaModal sections |
| No field visibility logic enforced | All fields always shown | Implement conditional rendering |

---

## Implementation Plan

### Phase 1: Data Types & Interfaces

**File:** `src/types/formula.creation.types.ts` (NEW)

```typescript
// Base formula creation payload
export interface CreateFormulaPayload {
  data: {
    ProjectID: string;
    Fragrance: string;
    FormulaType: 'Base' | 'Dilution' | 'Analytical Formula' | 'Perfumer Formula';
    FragranceActualDosage: number;
    pyDescription: string;
    UCode: string;
    IsFragranceLocked: 'yes' | 'no';
    FormulaStatus: string;
    BatchSize: number;
    IsCompoundingInProgress: 'yes' | 'no';
    Comments: string;
    TPLReviewStatus: string;
    Theme: string;
    Trial: string;
    ReferenceRDCategory: string;
    Country: string;
    BaseLIMSFormulaCode: string;
    BasePLMCode: string;
    FragranceTargetDosage: number;
    FragranceTargetBrand: string;
    FragranceTargetClaims: string;
    Variant: string;
    SupplierID: string;
    FragranceCurrentName: string;
    ProductProductionCode: string;
    RecomProductDosageNo: string;
    RecomProductDosageUnit: string;
    EUAllergensTotalCount: number;
    EUAllergensTotalPercentage: number;
    TargetRMC: number;
    FormulaInclusionLevel: number;
  };
}

// Formula version creation payload
export interface CreateFormulaVersionPayload {
  data: {
    FormulaID: string;
    CurrentFormulaVersion: string;
    PerfumerFormulaID: string;
  };
}

// Share formula payload
export interface ShareFormulaPayload {
  data: {
    FormulaID: string;
    FormulaVersion: string;
    pyUserIdentifier: string;
  };
}

// Analytical formula creation payload
export interface CreateAnalyticalFormulaPayload {
  data: {
    FormulaType: 'Analytical Formula';
    SampleID: string;
    VersioningAnalytical: string;
    Suffix: string;
    SuffixInformation: string;
    TrackedCompetitor: string;
    TrackingID: string;
    pyNote: string;
    SampleType: string;
    SampleWeight: number;
    ExtractionMethod: string;
    InternalStandardVolume: number;
    InternalStandardNumber: number;
    InternalStandardConcentration: number;
    DataAnalysisMethod: string;
    Comments: string;
    AlkaneStandardInformation: string;
    FragranceInclusionLevel: number;
    DataAnalyst: string;
    ComponentCount: number;
    GenericCost: number;
    FormulaCosted: number;
    SolventLevel: number;
    note: string;
    MCMPCMAndNMLevel: number;
  };
}

// Response types
export interface CreateFormulaResponse {
  FormulaID: string;
  PerfumerFormulaID?: string;
  Status: string;
  CreatedTimestamp: string;
}

export interface CreateAnalyticalFormulaResponse {
  AnalyticalCaseID: string;
  SampleID: string;
  Status: string;
  CreatedTimestamp: string;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
```

### Phase 2: DX API Service Methods

**File:** `src/services/dxApi.ts` (EXTEND)

Add 4 new POST methods:

```typescript
/**
 * Create a new formula
 */
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

/**
 * Create formula version
 */
static async createFormulaVersion(
  payload: CreateFormulaVersionPayload
): Promise<DxApiResponse<{ VersionID: string }>> {
  return this.executeRequest<{ VersionID: string }>(
    `${featureFlags.api.dxApiConfig.baseUrl}/data-pages/D_CreateFormulaVersion`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Share formula with user
 */
static async shareFormula(
  payload: ShareFormulaPayload
): Promise<DxApiResponse<{ ShareID: string; Status: string }>> {
  return this.executeRequest<{ ShareID: string; Status: string }>(
    `${featureFlags.api.dxApiConfig.baseUrl}/data-pages/D_ShareFormula`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Create analytical formula
 */
static async createAnalyticalFormula(
  payload: CreateAnalyticalFormulaPayload
): Promise<DxApiResponse<CreateAnalyticalFormulaResponse>> {
  // Check for duplicate Sample ID first
  const duplicateCheck = await this.checkDuplicateSampleId(
    payload.data.SampleID
  );
  if (!duplicateCheck.success) {
    return {
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_FAILED,
        message: `Sample ID already exists: ${payload.data.SampleID}`,
        details: { field: 'SampleID' }
      }
    };
  }

  return this.executeRequest<CreateAnalyticalFormulaResponse>(
    `${featureFlags.api.dxApiConfig.baseUrl}/data-pages/D_CreateAnalyticalFormula`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Check if Sample ID already exists (prevents duplicates)
 */
private static async checkDuplicateSampleId(
  sampleId: string
): Promise<DxApiResponse<boolean>> {
  return this.executeRequest<boolean>(
    `${featureFlags.api.dxApiConfig.baseUrl}/data-pages/D_CheckSampleIDExists?sampleId=${encodeURIComponent(sampleId)}`,
    { method: 'GET' }
  );
}
```

### Phase 3: Validation & Helper Functions

**File:** `src/utils/formulaValidation.ts` (NEW)

```typescript
import type { ValidationResult, ValidationError } from '@/types/formula.creation.types';
import type { NewFormulaData } from '@/components/FormulaModal';

export class FormulaValidator {
  /**
   * Validate base formula creation
   */
  static validateBaseFormula(data: NewFormulaData): ValidationResult {
    const errors: ValidationError[] = [];

    // Mandatory fields per US #1108
    if (!data.formulaType) {
      errors.push({ field: 'formulaType', message: 'Formula Type is mandatory' });
    }
    if (!data.fragranceName) {
      errors.push({ field: 'fragranceName', message: 'Fragrance Name is mandatory' });
    }
    if (!data.country || data.country.length === 0) {
      errors.push({ field: 'country', message: 'Country is mandatory' });
    }

    // Field-specific validation
    if (data.fragranceDosage !== undefined && (data.fragranceDosage < 0 || data.fragranceDosage > 100)) {
      errors.push({
        field: 'fragranceDosage',
        message: 'Dosage must be between 0 and 100'
      });
    }

    if (data.dilutionPercentage !== undefined && 
        (data.dilutionPercentage < 0 || data.dilutionPercentage > 100)) {
      errors.push({
        field: 'dilutionPercentage',
        message: 'Dilution percentage must be between 0 and 100'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate analytical formula creation
   */
  static validateAnalyticalFormula(data: NewFormulaData): ValidationResult {
    const errors: ValidationError[] = [];

    // Mandatory field per US #1137
    if (!data.sampleId) {
      errors.push({ field: 'sampleId', message: 'Sample ID is mandatory for analytical formulas' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate dilution formula
   */
  static validateDilutionFormula(data: NewFormulaData): ValidationResult {
    const errors = this.validateBaseFormula(data).errors;

    if (!data.baseFormulaId) {
      errors.push({ field: 'baseFormulaId', message: 'Base Formula is required for dilutions' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export function buildCreateFormulaPayload(data: NewFormulaData, userId: string) {
  // Map NewFormulaData to Pega payload structure
  return {
    data: {
      ProjectID: data.projectId || '',
      Fragrance: data.fragranceName,
      FormulaType: mapFormulaType(data.formulaType),
      FragranceActualDosage: data.fragranceDosage || 0,
      pyDescription: data.description,
      UCode: '', // System generated
      IsFragranceLocked: data.baseFormulaId ? 'yes' : 'no',
      FormulaStatus: 'DRAFT',
      BatchSize: data.dilutionPercentage || 0,
      IsCompoundingInProgress: 'no',
      Comments: data.commentOnProduct || '',
      TPLReviewStatus: 'Pending',
      Theme: '',
      Trial: '',
      ReferenceRDCategory: data.category,
      Country: data.country,
      BaseLIMSFormulaCode: data.limsCode,
      BasePLMCode: data.sapPlmCode,
      FragranceTargetDosage: data.fragranceDosage || 0,
      FragranceTargetBrand: data.brand,
      FragranceTargetClaims: data.claims.join(','),
      Variant: data.variant,
      SupplierID: data.supplier,
      FragranceCurrentName: data.fragranceName,
      ProductProductionCode: data.productionCode,
      RecomProductDosageNo: String(data.recommendedDosage || ''),
      RecomProductDosageUnit: data.dosageUnit,
      EUAllergensTotalCount: 0,
      EUAllergensTotalPercentage: 0,
      TargetRMC: 0,
      FormulaInclusionLevel: 0
    }
  };
}

function mapFormulaType(type: string): string {
  const mapping: Record<string, string> = {
    'BASE': 'Base',
    'DILUTION': 'Dilution',
    'ANALYTICAL': 'Analytical Formula',
    'PERFUMER': 'Perfumer Formula'
  };
  return mapping[type] || type;
}
```

### Phase 4: API Service Integration

**File:** `src/services/api.ts` (EXTEND)

Add formula creation methods to ApiService:

```typescript
/**
 * Create a new formula
 */
static async createFormula(
  payload: CreateFormulaPayload
): Promise<ApiResponse<CreateFormulaResponse>> {
  try {
    if (this.isUsingDxApi()) {
      const response = await DxApiService.createFormula(payload);
      return this.mapDxApiResponse(response);
    } else {
      // Mock data version
      const mockResponse = await PegaService.createFormula(payload);
      return { success: true, data: mockResponse };
    }
  } catch (error) {
    return this.handleError(error);
  }
}

/**
 * Create formula version
 */
static async createFormulaVersion(
  formulaId: string,
  currentVersion: string,
  perfumerFormulaId?: string
): Promise<ApiResponse<{ VersionID: string }>> {
  try {
    if (this.isUsingDxApi()) {
      const payload: CreateFormulaVersionPayload = {
        data: {
          FormulaID: formulaId,
          CurrentFormulaVersion: currentVersion,
          PerfumerFormulaID: perfumerFormulaId || ''
        }
      };
      const response = await DxApiService.createFormulaVersion(payload);
      return this.mapDxApiResponse(response);
    } else {
      const mockResponse = await PegaService.createFormulaVersion(
        formulaId,
        currentVersion
      );
      return { success: true, data: mockResponse };
    }
  } catch (error) {
    return this.handleError(error);
  }
}

/**
 * Share formula with user
 */
static async shareFormula(
  formulaId: string,
  version: string,
  userEmail: string
): Promise<ApiResponse<{ ShareID: string; Status: string }>> {
  try {
    if (this.isUsingDxApi()) {
      const payload: ShareFormulaPayload = {
        data: {
          FormulaID: formulaId,
          FormulaVersion: version,
          pyUserIdentifier: userEmail
        }
      };
      const response = await DxApiService.shareFormula(payload);
      return this.mapDxApiResponse(response);
    } else {
      const mockResponse = await PegaService.shareFormula(
        formulaId,
        version,
        userEmail
      );
      return { success: true, data: mockResponse };
    }
  } catch (error) {
    return this.handleError(error);
  }
}

/**
 * Create analytical formula
 */
static async createAnalyticalFormula(
  payload: CreateAnalyticalFormulaPayload
): Promise<ApiResponse<CreateAnalyticalFormulaResponse>> {
  try {
    if (this.isUsingDxApi()) {
      const response = await DxApiService.createAnalyticalFormula(payload);
      return this.mapDxApiResponse(response);
    } else {
      const mockResponse = await PegaService.createAnalyticalFormula(payload);
      return { success: true, data: mockResponse };
    }
  } catch (error) {
    return this.handleError(error);
  }
}
```

### Phase 5: FormulaModal Component Updates

**File:** `src/components/FormulaModal.tsx` (EXTEND)

Key changes:
1. Add field visibility logic based on formula type
2. Implement validation before submit
3. Call API service to create formula
4. Show success/error messages
5. Generate formula ID after creation

```typescript
// Add to form submission handler
const handleCreateFormula = async () => {
  // Validate based on formula type
  let validation: ValidationResult;
  
  if (newFormulaData.formulaType === 'ANALYTICAL') {
    validation = FormulaValidator.validateAnalyticalFormula(newFormulaData);
  } else if (newFormulaData.formulaType === 'DILUTION') {
    validation = FormulaValidator.validateDilutionFormula(newFormulaData);
  } else {
    validation = FormulaValidator.validateBaseFormula(newFormulaData);
  }

  if (!validation.isValid) {
    // Show error messages
    setValidationErrors(validation.errors);
    return;
  }

  // Build payload
  const payload = buildCreateFormulaPayload(newFormulaData, getCurrentUserInitials());

  // Call API
  const response = await ApiService.createFormula(payload);

  if (response.success && response.data) {
    // Create version
    await ApiService.createFormulaVersion(
      response.data.FormulaID,
      `${response.data.FormulaID}.1`,
      response.data.PerfumerFormulaID
    );

    // Show success and close modal
    onCreateFormula({ ...newFormulaData, id: response.data.FormulaID });
    onClose();
  } else {
    // Show error
    setError(response.error?.message || 'Failed to create formula');
  }
};
```

### Phase 6: Feature Flag Configuration

**File:** `src/config/featureFlags.ts` (EXTEND)

Add new data page configurations:

```typescript
dataPages: {
  // ... existing
  formulaCreation: 'D_CreateFormula',
  formulaVersioning: 'D_CreateFormulaVersion',
  formulaSharing: 'D_ShareFormula',
  analyticalFormulaCreation: 'D_CreateAnalyticalFormula',
  checkDuplicateSampleId: 'D_CheckSampleIDExists'
}
```

---

## Implementation Timeline

| Phase | Tasks | Estimated Time | Priority |
|-------|-------|-----------------|----------|
| 1 | Create TypeScript interfaces | 1 hour | P0 |
| 2 | Add DX API service methods | 2 hours | P0 |
| 3 | Implement validation logic | 1.5 hours | P0 |
| 4 | Extend API service layer | 1 hour | P0 |
| 5 | Update FormulaModal component | 3 hours | P0 |
| 6 | Update feature flags | 30 mins | P0 |
| 7 | Add mock data support | 2 hours | P1 |
| 8 | Testing & validation | 3 hours | P0 |

**Total Estimated Time:** 13.5 hours

---

## Field Visibility Matrix

Based on Formula Type:

| Field | Base | Dilution | Analytical | Perfumer |
|-------|------|----------|-----------|----------|
| Fragrance Name | ✅ | ✅ | ❌ | ✅ |
| Sample ID | ❌ | ❌ | ✅ (mandatory) | ❌ |
| Base Formula ID | ❌ | ✅ (mandatory) | ❌ | ❌ |
| Analytical Fields | ❌ | ❌ | ✅ | ❌ |
| Project Details | ✅ | ✅ | ✅ | ✅ |
| Product Info | ✅ | ✅ | ❌ | ✅ |

---

## Mandatory Fields Per User Story

**US #1108 - Formula Creation:**
- Formula Type ✅ (Base, Dilution, Analytical Formula, Perfumer Formula)
- Fragrance Name ✅ (visible for Base, Dilution, Perfumer only)
- Sample ID ✅ (visible for Analytical only)
- Country ✅ (from Project or Manual)
- Project details if available ✅

**US #1137 - Analytical Formula:**
- Sample ID ✅ (mandatory, must be unique)
- All other analytical fields optional

**US #2202 - Import Analytical Sample File:**
- File import functionality
- Method Type selector (DB Validate, AMDIS Full, AMDIS Screen)
- SharePoint connection
- Ingredient mapping logic

---

## Error Handling Strategy

```
User submits formula
    ↓
Validate input (client-side)
    ↓ validation fails → Show errors
    ↓
Call DX API createFormula()
    ↓ success → Extract FormulaID
    ↓ duplicate Sample ID → Show specific error, suggest new ID
    ↓ validation error → Show Pega validation message
    ↓ network error → Queue for retry, show offline message
    ↓ server error → Fallback to mock, show warning
    ↓
Create version via D_CreateFormulaVersion
    ↓ success → Reload formulas, close modal
    ↓ failure → Show version creation error
```

---

## Success Criteria

- ✅ All 4 Pega data pages integrated
- ✅ Exact payload structure matching
- ✅ Mandatory field validation per US #1108
- ✅ Formula type-based field visibility
- ✅ System-generated formula IDs
- ✅ Status set to 'DRAFT' on creation
- ✅ Duplicate Sample ID prevention
- ✅ Formula versioning working
- ✅ Share formula capability
- ✅ Fallback to mock data if API unavailable
- ✅ All tests passing
- ✅ No console errors

---

## Next Steps

1. ✅ Review this plan with team
2. ⏳ Implement Phase 1: Data Types
3. ⏳ Implement Phase 2: DX API Methods
4. ⏳ Implement Phase 3: Validation
5. ⏳ Implement Phase 4-6: Integration & Testing
6. ⏳ User acceptance testing
7. ⏳ Deploy to staging

---

**Document Version:** 1.0  
**Last Updated:** November 21, 2025  
**Status:** Ready for Implementation
