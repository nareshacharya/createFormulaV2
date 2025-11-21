# Phase 6: FormulaModal Component Integration - Quick Start Guide

**Objective:** Connect FormulaModal to formula creation API and validation logic  
**Estimated Time:** 3 hours  
**Status:** Ready to Start

---

## What Needs to Happen

### 1. Import Validation & API Services
Add these imports at the top of `FormulaModal.tsx`:

```typescript
import { FormulaValidator, validateFormula, buildCreateFormulaPayload } from '../utils/formulaValidation';
import { ApiService } from '../services/api';
import type { NewFormulaData } from '../types/formula.creation.types';
import toast from 'react-hot-toast';
```

### 2. Add Validation Before API Call
In the submit handler, add:

```typescript
// Get current user ID (from context or props)
const userId = workspaceContext?.currentUser?.id || 'current-user';

// Validate formula before submission
const validation = validateFormula(newFormulaData, newFormulaData.formulaType);
if (!validation.isValid) {
  // Show first error to user
  const firstError = validation.errors[0];
  toast.error(`${firstError.field}: ${firstError.message}`);
  return;
}

// Show warnings if any
validation.warnings?.forEach(warning => {
  console.warn(`[Validation Warning] ${warning.field}: ${warning.message}`);
});
```

### 3. Call Formula Creation API
After validation passes:

```typescript
try {
  setIsLoading(true);
  
  // Build payload from form data
  const payload = buildCreateFormulaPayload(newFormulaData, userId);
  
  // For analytical formulas: check Sample ID first
  if (newFormulaData.formulaType === 'Analytical Formula') {
    const sampleCheckResult = await ApiService.checkSampleIdAvailability(
      newFormulaData.sampleID || ''
    );
    
    if (!sampleCheckResult.success || !sampleCheckResult.data?.available) {
      toast.error('Sample ID already exists or is invalid');
      return;
    }
  }
  
  // Create formula
  const result = await ApiService.createFormulaFromData(payload);
  
  if (!result.success) {
    toast.error(result.error?.message || 'Failed to create formula');
    return;
  }
  
  // Create version
  const versionPayload = {
    data: {
      FormulaID: result.data.formulaId,
      VersionNumber: result.data.versionId,
      CreatedDate: new Date().toISOString(),
      CreatedByUserID: userId,
    }
  };
  
  await ApiService.createFormulaVersionRecord(versionPayload);
  
  // Success!
  toast.success(`Formula created successfully! ID: ${result.data.formulaId}`);
  
  // Close modal and refresh list
  onClose();
  onFormulaCreated?.({
    id: result.data.formulaId,
    name: newFormulaData.fragranceName || '',
    version: result.data.versionId,
    status: 'draft',
  });
  
} catch (error) {
  toast.error(`Error creating formula: ${error instanceof Error ? error.message : 'Unknown error'}`);
  console.error('[FormulaModal] Error:', error);
} finally {
  setIsLoading(false);
}
```

### 4. Add Field Visibility Logic
Use the existing `isFieldVisibleForType()` function to show/hide fields:

```typescript
// Already exists in FormulaDetailsModal - copy this pattern
const visibleFields = allFields.filter((field) =>
  isFieldVisibleForType(
    field,
    formulaType,
    newFormulaData as Record<string, unknown>
  )
);
```

### 5. Handle User Feedback
Add loading state and disable buttons during submission:

```typescript
// In JSX
<Button 
  variant="primary" 
  onClick={handleSubmit}
  disabled={isLoading}
>
  {isLoading ? 'Creating Formula...' : 'Create Formula'}
</Button>
```

---

## Important Points to Remember

### Field Sync with Edit Modal
✅ **FormulaDetailsModal already uses the same field configs:**
- `GENERAL_INFO_FIELDS`
- `FORMULA_DETAILS_FIELDS`
- `PRODUCT_INFO_FIELDS`
- `PROJECT_REFERENCE_FIELDS`

**Action:** Use these SAME field configs in FormulaModal to ensure sync

### Formula Types
✅ **Ensure these are capitalized correctly:**
- `"Base"` (not "BASE" or "base")
- `"Dilution"` (not "DILUTION" or "dilution")
- `"Analytical Formula"` (includes space!)
- `"Perfumer Formula"` (includes space!)

### Sample ID for Analytical
✅ **CRITICAL:** Must check before creating
```typescript
// This check is MANDATORY for Analytical Formula
if (formulaType === "Analytical Formula") {
  const available = await ApiService.checkSampleIdAvailability(sampleId);
  if (!available) return; // Don't submit
}
```

### Status is Auto-Set
✅ **Never ask user for status on creation:**
- `FormulaValidator.buildCreateFormulaPayload()` sets it to `"DRAFT"` automatically
- Edit modal can change it later

### Mock vs Real API
✅ **Test with mock first:**
```typescript
// In featureFlags.ts temporarily:
useDxApi: false, // Use mock data for testing

// Then set to true when ready for real API
useDxApi: true,
```

---

## Testing Checklist (After Implementation)

### Unit Tests
- [ ] All 4 formula types validate correctly
- [ ] Mandatory fields enforced per type
- [ ] Analytical Sample ID checked before creation
- [ ] Validation errors show correct messages
- [ ] Payload builders convert fields correctly

### Integration Tests
- [ ] Mock API flow works end-to-end
- [ ] DX API flow works end-to-end
- [ ] Error handling shows user-friendly messages
- [ ] Loading state works during submission
- [ ] Toast notifications show correctly

### Component Tests
- [ ] Form fields visible per formula type
- [ ] Submit button disabled during loading
- [ ] Modal closes on success
- [ ] Modal stays open on error
- [ ] Success callback fires with correct data

### E2E Tests (in browser)
- [ ] Create Base formula - success
- [ ] Create Dilution formula - success
- [ ] Create Analytical with new Sample ID - success
- [ ] Create Analytical with duplicate Sample ID - error message
- [ ] Create Perfumer formula - success
- [ ] Validation error for missing Fragrance Name - shown
- [ ] Validation error for invalid Sample ID format - shown

---

## Common Pitfalls to Avoid

❌ **DON'T:** Use lowercase formula types (`"base"` instead of `"Base"`)  
✅ **DO:** Use exact capitalization from `FORMULA_TYPES` config

❌ **DON'T:** Set `FormulaStatus` from user input  
✅ **DO:** Let `buildCreateFormulaPayload()` set it to `"DRAFT"`

❌ **DON'T:** Skip Sample ID check for analytical formulas  
✅ **DO:** Always call `checkSampleIdAvailability()` first

❌ **DON'T:** Mix camelCase and PascalCase field names  
✅ **DO:** Use NewFormulaData (camelCase) in UI, payload builder converts to PascalCase

❌ **DON'T:** Ignore validation warnings  
✅ **DO:** Log them and consider showing to user

---

## Reference Files

**Types Definition:**  
→ `src/types/formula.creation.types.ts`

**Validation Logic:**  
→ `src/utils/formulaValidation.ts`

**API Service:**  
→ `src/services/api.ts` (methods: createFormulaFromData, createFormulaVersionRecord, checkSampleIdAvailability)

**Current Modal (for pattern reference):**  
→ `src/components/FormulaDetailsModal.tsx`

**Field Configs (to ensure sync):**  
→ `src/config/fieldConfigs/generalInfo.fields.ts`  
→ `src/config/fieldConfigs/formulaDetails.fields.ts`  
→ `src/config/fieldConfigs/productInfo.fields.ts`  
→ `src/config/fieldConfigs/projectReference.fields.ts`

---

## Next Steps After Phase 6

1. **Phase 7:** Sync FormulaDetailsModal with creation (2-3 hours)
   - Ensure edit modal shows all creation fields
   - Make analytical fields editable
   - Verify field visibility consistency

2. **Phase 8:** Comprehensive Testing (3+ hours)
   - Unit tests for validation
   - Integration tests for API
   - E2E tests for full workflow
   - Error scenario testing

3. **Deployment:** Feature flag switch
   - Set `useDxApi: true` to go live
   - Set `useDxApi: false` to fallback to mock

---

**Ready to start? Let's go! 🚀**
