# Formula Creation - Payload & Field Mapping Reference

**Date:** November 21, 2025  
**Purpose:** Exact mapping between application fields and Pega payload structure

---

## 1. Base Formula (D_CreateFormula) - Full Payload Reference

### Payload Structure Template

```json
{
  "data": {
    "ProjectID": "Prj-001",
    "Fragrance": "Test Fragrance",
    "FormulaType": "Base",
    "FragranceActualDosage": 1.11,
    "pyDescription": "Formula description",
    "UCode": "U0011",
    "IsFragranceLocked": "yes",
    "FormulaStatus": "New",
    "BatchSize": 1.1,
    "IsCompoundingInProgress": "yes",
    "Comments": "Additional comments",
    "TPLReviewStatus": "Good",
    "Theme": "Theme value",
    "Trial": "Trial value",
    "ReferenceRDCategory": "Category",
    "Country": "India",
    "BaseLIMSFormulaCode": "LIMS-001",
    "BasePLMCode": "PLM-001",
    "FragranceTargetDosage": 22.2,
    "FragranceTargetBrand": "Brand Name",
    "FragranceTargetClaims": "Claim1,Claim2",
    "Variant": "Variant1",
    "SupplierID": "SUPL1",
    "FragranceCurrentName": "Fragrance01",
    "ProductProductionCode": "P001",
    "RecomProductDosageNo": "DOS1",
    "RecomProductDosageUnit": "U1",
    "EUAllergensTotalCount": 55.1,
    "EUAllergensTotalPercentage": 1.1,
    "TargetRMC": 1.1,
    "FormulaInclusionLevel": 1.1
  }
}
```

### Field Mapping (FormulaModal → Pega Payload)

| UI Form Field | Pega Field Name | Data Type | Mandatory | Default | Notes |
|---------------|-----------------|-----------|-----------|---------|-------|
| Formula Type | FormulaType | string | Yes | - | Values: "Base", "Dilution", "Analytical Formula", "Perfumer Formula" |
| Fragrance Name | Fragrance | string | Yes (for Base/Dilution/Perfumer) | - | Max length TBD |
| Fragrance Dosage (%) | FragranceActualDosage | number | No | 0 | Decimal, 0-100 range |
| Description | pyDescription | string | No | "" | Max 500 chars |
| U-Code | UCode | string | No | "" | System generated when locked |
| Is Locked | IsFragranceLocked | string | No | "no" | Values: "yes", "no" |
| Status | FormulaStatus | string | Yes | "New" | Values: "New", "Draft", "Active" |
| Batch Size | BatchSize | number | No | 0 | Decimal value |
| Compounding in Progress | IsCompoundingInProgress | string | No | "no" | Values: "yes", "no" |
| Comments | Comments | string | No | "" | Max 250 chars |
| TPL Review Status | TPLReviewStatus | string | No | "Pending" | Managed list value |
| Theme | Theme | string | No | "" | - |
| Trial | Trial | string | No | "" | - |
| Reference RD Category | ReferenceRDCategory | string | Yes | - | From dropdown |
| Country | Country | string | Yes | - | Multi-select, required |
| Base LIMS Code | BaseLIMSFormulaCode | string | No | "" | Project propagation |
| Base PLM Code | BasePLMCode | string | No | "" | Project propagation |
| Target Dosage | FragranceTargetDosage | number | No | 0 | Project propagation |
| Target Brand | FragranceTargetBrand | string | No | "" | Project propagation |
| Target Claims | FragranceTargetClaims | string | No | "" | Comma-separated, Project propagation |
| Variant | Variant | string | No | "" | Project propagation |
| Supplier ID | SupplierID | string | No | "" | Project propagation |
| Current Fragrance Name | FragranceCurrentName | string | No | "" | Same as Fragrance |
| Product Production Code | ProductProductionCode | string | No | "" | Manual entry |
| Recommended Dosage | RecomProductDosageNo | string | No | "" | From supplier |
| Dosage Unit | RecomProductDosageUnit | string | No | "" | From supplier |
| EU Allergens Count | EUAllergensTotalCount | number | No | 0 | Whole number |
| EU Allergens % | EUAllergensTotalPercentage | number | No | 0 | Decimal % |
| Target RMC | TargetRMC | number | No | 0 | 2 decimal places |
| Formula Inclusion Level | FormulaInclusionLevel | number | No | 0 | Percentage value |
| Project ID | ProjectID | string | No | "" | System/From project selection |

---

## 2. Formula Version (D_CreateFormulaVersion) - Payload

### Payload Structure

```json
{
  "data": {
    "FormulaID": "B00008",
    "CurrentFormulaVersion": "B00008.1",
    "PerfumerFormulaID": ""
  }
}
```

### Field Mapping

| Field | Type | Mandatory | Source | Notes |
|-------|------|-----------|--------|-------|
| FormulaID | string | Yes | Response from D_CreateFormula | The ID returned from formula creation |
| CurrentFormulaVersion | string | Yes | Constructed | Format: `{FormulaID}.{version}` e.g., "B00008.1" |
| PerfumerFormulaID | string | No | Formula response | Empty string if not applicable |

### Usage Flow
```
1. User creates formula via D_CreateFormula
2. System receives: { FormulaID: "B00008", PerfumerFormulaID: "..." }
3. Call D_CreateFormulaVersion with:
   - FormulaID: "B00008"
   - CurrentFormulaVersion: "B00008.1" (first version)
   - PerfumerFormulaID: PerfumerFormulaID from step 2
4. System returns: { VersionID: "B00008.1", ... }
```

---

## 3. Share Formula (D_ShareFormula) - Payload

### Payload Structure

```json
{
  "data": {
    "FormulaID": "B00008",
    "FormulaVersion": "B00008.1",
    "pyUserIdentifier": "user@example.com"
  }
}
```

### Field Mapping

| Field | Type | Mandatory | Source | Notes |
|-------|------|-----------|--------|-------|
| FormulaID | string | Yes | From formula object | System-generated ID |
| FormulaVersion | string | Yes | From formula object | Format: "B00008.1" |
| pyUserIdentifier | string | Yes | User input | Email format required |

### Usage Flow
```
1. User clicks "Share Formula" button
2. Shows dialog with email input
3. On confirm, calls D_ShareFormula with:
   - FormulaID: Selected formula ID
   - FormulaVersion: Current version
   - pyUserIdentifier: User-entered email
4. Shows confirmation: "Shared with user@example.com"
```

---

## 4. Analytical Formula (D_CreateAnalyticalFormula) - Full Payload

### Payload Structure Template

```json
{
  "data": {
    "FormulaType": "Analytical Formula",
    "SampleID": "0001",
    "VersioningAnalytical": "1",
    "Suffix": "55",
    "SuffixInformation": "Additional analysis reason",
    "TrackedCompetitor": "Competitor name",
    "TrackingID": "TRACK-001",
    "pyNote": "20250909",
    "SampleType": "Type",
    "SampleWeight": 5.55,
    "ExtractionMethod": "Extraction method",
    "InternalStandardVolume": 5.5,
    "InternalStandardNumber": 2.2,
    "InternalStandardConcentration": 55.6,
    "DataAnalysisMethod": "Analysis method",
    "Comments": "Comments from analyst",
    "AlkaneStandardInformation": "Standard info",
    "FragranceInclusionLevel": 6.5,
    "DataAnalyst": "Analyst name",
    "ComponentCount": 1,
    "GenericCost": 4.4,
    "FormulaCosted": 33.6,
    "SolventLevel": 7.7,
    "note": "Additional notes",
    "MCMPCMAndNMLevel": 9.99
  }
}
```

### Field Mapping (Analytical Formula)

| UI Form Field | Pega Field Name | Data Type | Mandatory | Default | Notes |
|---------------|-----------------|-----------|-----------|---------|-------|
| Formula Type | FormulaType | string | Yes | "Analytical Formula" | Fixed value |
| Sample ID | SampleID | string | Yes (UNIQUE) | - | Must be unique, enforced via D_CheckSampleIDExists |
| Versioning | VersioningAnalytical | string | No | "1" | Manual entry |
| Suffix | Suffix | string | No | "" | Codified identifier |
| Suffix Information | SuffixInformation | string | No | "" | Reason for suffix |
| Tracked Competitor | TrackedCompetitor | string | No | "" | Strategic competitor flag |
| Tracking ID | TrackingID | string | No | "" | Tracking number |
| Note (Date) | pyNote | string | No | "" | Date entered, format TBD |
| Sample Type | SampleType | string | No | "" | Type of sample |
| Sample Weight | SampleWeight | number | No | 0 | Weight in grams |
| Extraction Method | ExtractionMethod | string | No | "" | Method used |
| Internal Std Volume | InternalStandardVolume | number | No | 0 | Calibration volume |
| Internal Std Number | InternalStandardNumber | number | No | 0 | Calibration ID |
| Internal Std Concentration | InternalStandardConcentration | number | No | 0 | Calibration concentration |
| Data Analysis Method | DataAnalysisMethod | string | No | "" | Type of analysis |
| Comments | Comments | string | No | "" | Analyst comments |
| Alkane Standard Info | AlkaneStandardInformation | string | No | "" | Calibration standards |
| Fragrance Inclusion % | FragranceInclusionLevel | number | No | 0 | Percentage value |
| Data Analyst | DataAnalyst | string | No | "" | Person who analyzed |
| Component Count | ComponentCount | number | No | 0 | Whole number |
| Generic Cost (USD/KG) | GenericCost | number | No | 0 | Normalized cost |
| Formula Costed % | FormulaCosted | number | No | 0 | Percentage costed |
| Solvent Level % | SolventLevel | number | No | 0 | Solvent percentage |
| Additional Note | note | string | No | "" | General notes |
| MCM/PCM/NM Level % | MCMPCMAndNMLevel | number | No | 0 | Restricted substances % |

### Duplicate Sample ID Check
```typescript
// Before creating analytical formula:
const checkResponse = await DxApiService.checkDuplicateSampleId(sampleId);
if (checkResponse.data === true) {
  // Sample ID exists, show error
  throw new Error(`Sample ID "${sampleId}" already exists`);
}
// Proceed with creation
```

---

## 5. Response Structures

### D_CreateFormula Response

```json
{
  "success": true,
  "data": {
    "FormulaID": "B00008",
    "PerfumerFormulaID": "MZ00001",
    "Status": "DRAFT",
    "CreatedTimestamp": "2025-11-21T10:30:00Z"
  }
}
```

### D_CreateFormulaVersion Response

```json
{
  "success": true,
  "data": {
    "VersionID": "B00008.1",
    "FormulaID": "B00008",
    "VersionNumber": 1,
    "Status": "Created"
  }
}
```

### D_ShareFormula Response

```json
{
  "success": true,
  "data": {
    "ShareID": "SHARE-12345",
    "Status": "Shared",
    "SharedWith": "user@example.com",
    "ShareTimestamp": "2025-11-21T10:30:00Z"
  }
}
```

### D_CreateAnalyticalFormula Response

```json
{
  "success": true,
  "data": {
    "AnalyticalCaseID": "A00001",
    "SampleID": "0001",
    "Status": "DRAFT",
    "CreatedTimestamp": "2025-11-21T10:30:00Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Sample ID '0001' already exists",
    "details": {
      "field": "SampleID",
      "existingID": "0001"
    }
  }
}
```

---

## 6. Data Type Conversions

### String Values

| Field | Expected Format | Examples | Notes |
|-------|-----------------|----------|-------|
| FormulaType | PascalCase | "Base", "Dilution", "Analytical Formula", "Perfumer Formula" | Exact casing required |
| YesNo Fields | Lowercase | "yes", "no" | Case-sensitive |
| Status | Capitalized | "New", "Draft", "Active", "DRAFT" | Confirm with Pega |
| Email | Valid email | "user@example.com" | pyUserIdentifier |

### Numeric Values

| Field | Format | Range | Example |
|-------|--------|-------|---------|
| Dosage % | Decimal | 0-100 | 1.11, 22.2 |
| Count | Integer | 0-∞ | 55, 1, 2 |
| Concentration | Decimal | 0-∞ | 55.6, 9.99 |
| Weight | Decimal | 0-∞ | 5.55, 7.7 |
| Cost | Decimal | 0-∞ | 4.4, 33.6 |

---

## 7. Data Propagation from Project

When formula is linked to a project, these fields auto-populate:

```typescript
// Fields that propagate from Project object
const projectPropagatedFields = {
  TargetRMC: project.targetRMC,
  TargetDosage: project.targetDosage, // or FragranceTargetDosage
  TargetBrand: project.targetBrand,    // or FragranceTargetBrand
  TargetClaims: project.targetClaims,  // or FragranceTargetClaims
  Variant: project.variant,
  SupplierID: project.supplierID,
  Country: project.country,
  ReferenceRDCategory: project.referenceRDCategory,
  BaseLIMSFormulaCode: project.limsCode,
  BasePLMCode: project.plmCode
};
```

**Note:** User can override propagated fields in UI

---

## 8. Field Validation Rules

### Text Fields
- Trim whitespace
- Max length enforcement (250 for comments, 500 for description)
- Special characters allowed

### Numeric Fields
- Must be number type
- No negative values (unless specified)
- 2 decimal places for precision fields (RMC, Dosage)
- Whole numbers for counts

### Required Fields
- Cannot be empty or null
- Show error: "{FieldName} is required"

### Unique Fields
- SampleID: Must be checked via D_CheckSampleIDExists
- If duplicate: Show error with option to enter different ID

### Email Fields
- Must match valid email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Case-insensitive

### Dropdown/Managed Lists
- Must be from valid options only
- Show error if invalid value

---

## 9. Status & State Management

### Formula Status Lifecycle
```
Creation:          Status = "DRAFT"
                   ↓
After Save:        Status = "Active" (if released)
                   ↓
User Action:       Status = "Archived" (if archived)
```

### Locking Mechanism
```
Before Save:       IsFragranceLocked = "no"
After Release:     IsFragranceLocked = "yes"
                   ↓ (triggers UCode generation)
U-Code Generated:  UCode = "UAD00001A" (system assigned)
```

---

## 10. Common Validation Errors from Pega

Expected error responses:

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_SAMPLE_ID",
    "message": "Sample ID '0001' already exists",
    "details": { "field": "SampleID" }
  }
}

{
  "success": false,
  "error": {
    "code": "MANDATORY_FIELD_MISSING",
    "message": "Field 'Fragrance' is mandatory",
    "details": { "field": "Fragrance" }
  }
}

{
  "success": false,
  "error": {
    "code": "INVALID_FORMULA_TYPE",
    "message": "Invalid FormulaType: 'Invalid'. Must be one of: Base, Dilution, Analytical Formula, Perfumer Formula",
    "details": { "field": "FormulaType", "validValues": ["Base", "Dilution", "Analytical Formula", "Perfumer Formula"] }
  }
}

{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Invalid email format: 'notanemail'",
    "details": { "field": "pyUserIdentifier" }
  }
}
```

---

## 11. Quick Reference: Payload Building

### Base Formula Example
```typescript
const createBaseFormulaPayload = (data: NewFormulaData, projectId?: string) => ({
  data: {
    ProjectID: projectId || '',
    Fragrance: data.fragranceName,
    FormulaType: 'Base',
    FragranceActualDosage: data.fragranceDosage || 0,
    pyDescription: data.description,
    UCode: '',  // System generated
    IsFragranceLocked: 'no',
    FormulaStatus: 'DRAFT',  // Always on creation
    // ... other fields ...
  }
});
```

### Analytical Formula Example
```typescript
const createAnalyticalPayload = (data: NewFormulaData) => ({
  data: {
    FormulaType: 'Analytical Formula',
    SampleID: data.sampleId,  // MUST be unique
    VersioningAnalytical: '1',
    SampleType: data.sampleType || '',
    SampleWeight: data.sampleWeight || 0,
    // ... other optional fields ...
  }
});
```

---

## Notes for Implementation

1. ✅ **Exact Field Names** - Match Pega casing exactly (PascalCase)
2. ✅ **Payload Structure** - All fields wrapped in `data` object
3. ✅ **Type Conversion** - JavaScript types must match Pega expectations
4. ✅ **Mandatory Fields** - Validate before API call
5. ✅ **Unique Fields** - Check duplicates (Sample ID)
6. ✅ **Project Propagation** - Apply when project selected
7. ✅ **Error Handling** - Map Pega errors to user-friendly messages
8. ✅ **Status Default** - Always "DRAFT" on creation
9. ✅ **Version Format** - Must be "{ID}.{number}"
10. ✅ **Mock Data** - When Pega unavailable, generate locally

---

**Document Version:** 1.0  
**Last Updated:** November 21, 2025  
**Purpose:** Reference guide for exact payload structures and field mappings
