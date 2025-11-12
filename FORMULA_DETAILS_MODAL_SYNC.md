# Formula Details Modal Synchronization with Creation Flow

## Issue Summary
The Edit/View Formula Details popup was not synchronized with the formula creation flow:
1. **Field types mismatch**: Category was a text input instead of a dropdown
2. **Missing fields**: Many fields from creation flow were not shown in the edit modal
3. **No dynamic field rendering**: Fields were hardcoded, not based on formula type configuration

## Solution Implemented

### 1. Dynamic Field Rendering System
**File**: `src/components/FormulaDetailsModal.tsx`

#### Key Changes:
- **Imported all field configurations** from the formula creation config:
  - `GENERAL_INFO_FIELDS` - Category, Region, Country, SAP PLM Code, LIMS Code
  - `FORMULA_DETAILS_FIELDS` - Fragrance Name, Sample ID, Version, Dosage, Inclusion Level
  - `PRODUCT_INFO_FIELDS` - Product Format, Brand, Supplier, Claims, Production details
  - `PROJECT_REFERENCE_FIELDS` - Project ID, CPT Target, Dosage Target

- **Formula type-aware rendering**:
  ```typescript
  const visibleFields = allFields.filter((field) =>
    isFieldVisibleForType(field, formulaType, formData)
  );
  ```

- **Proper field grouping** by configuration sections:
  - General Information
  - Formula Details  
  - Product Information
  - Project Reference

### 2. Field Type Support

#### Implemented Field Types:
- **`select`**: Dropdown with options (Category, Region, Country, Product Format)
- **`multi-select`**: Comma-separated text input (Claims)
- **`number`**: Numeric input with min/max validation (Dosage, Version, CPT)
- **`date`**: Date picker (Production Date)
- **`textarea`**: Multi-line text (Description, Comments)
- **`text`**: Single-line text input (Names, Codes, IDs)

#### Field Rendering Function:
```typescript
const renderField = (field: FormField) => {
  const value = (formData as Record<string, unknown>)[field.name] ?? "";
  const isDisabled = isReadOnly || field.disabled;

  switch (field.type) {
    case "select": 
      return <select>...</select>;
    case "number":
      return <input type="number" min={...} max={...} />;
    case "date":
      return <input type="date" />;
    case "textarea":
      return <textarea rows={3} />;
    default:
      return <input type="text" />;
  }
};
```

### 3. Mock Data for Dropdowns

Added mock options for API-backed dropdown fields:
```typescript
const mockOptions: Record<string, Array<{ value: string; label: string }>> = {
  category: [
    { value: "Fine Fragrance", label: "Fine Fragrance" },
    { value: "Eau de Toilette", label: "Eau de Toilette" },
    { value: "Eau de Parfum", label: "Eau de Parfum" },
    { value: "Home Care", label: "Home Care" },
    { value: "Personal Care", label: "Personal Care" },
    { value: "Deodorant", label: "Deodorant" },
  ],
  region: [
    { value: "EMEA", label: "EMEA" },
    { value: "Americas", label: "Americas" },
    { value: "APAC", label: "APAC" },
  ],
  country: [
    { value: "US", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "FR", label: "France" },
    // ... more countries
  ],
  productFormat: [
    { value: "spray", label: "Spray" },
    { value: "lotion", label: "Lotion" },
    { value: "cream", label: "Cream" },
    // ... more formats
  ],
};
```

**Note**: In production, these should be fetched from the API endpoints defined in `REFERENCE_DATA_ENDPOINTS`.

### 4. Formula Type-Specific Fields

The modal now correctly shows different fields based on formula type:

#### BASE Formula:
- Fragrance Name (required)
- Category, Region, Country (required)
- Product Format (required)
- SAP PLM Code, LIMS Code
- Brand, Supplier, Claims, Variant
- Production Code/Date
- Recommended Dosage
- Brief CPT/Dosage Targets
- Formula Inclusion Level

#### DILUTION Formula:
- Same as BASE

#### ANALYTICAL Formula:
- **Sample ID** (required) - instead of Fragrance Name
- Category, Region, Country (required)
- Product Format (required)
- SAP PLM Code, LIMS Code
- Production Code/Date
- **Excludes**: Brand, Supplier, Claims, Variant, Dosage fields

#### PERFUMER Formula:
- Fragrance Name (required)
- **Fragrance Dosage %** (required)
- Category, Region, Country (required)
- Product Format (required)
- All optional fields from BASE formula

### 5. Field Section Rendering

Dynamic section rendering based on visible fields:
```typescript
const renderFieldSection = (fields: FormField[], title: string) => {
  if (fields.length === 0) return null;
  
  return (
    <div className="border-b border-gray-200 pb-5">
      <h3>{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name} className={field.type === "textarea" ? "col-span-2" : ""}>
            <label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
            {field.helpText && !isReadOnly && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Testing Checklist

### 1. Field Type Verification
- [ ] Category shows as dropdown with options (not text input)
- [ ] Region shows as dropdown
- [ ] Country shows as dropdown  
- [ ] Product Format shows as dropdown
- [ ] Version shows as number input
- [ ] Dosage fields show as number inputs
- [ ] Production Date shows as date picker
- [ ] Description shows as textarea

### 2. Formula Type-Specific Fields
- [ ] **BASE**: Shows Fragrance Name, all optional fields
- [ ] **DILUTION**: Shows same fields as BASE
- [ ] **ANALYTICAL**: Shows Sample ID instead of Fragrance Name, hides marketing fields
- [ ] **PERFUMER**: Shows Fragrance Dosage %, all BASE fields

### 3. Edit vs View Mode
- [ ] Edit mode: All fields editable (except Version, Created By, Last Updated)
- [ ] View mode: All fields disabled, shows lock indicator
- [ ] Save button only visible in edit mode
- [ ] Cancel/Close button text changes based on mode

### 4. Data Integrity
- [ ] Existing formula data populates correctly
- [ ] Dropdown selections show current values
- [ ] Changes save correctly
- [ ] Required field indicators (*) display correctly

## Future Enhancements

### 1. API Integration
Replace mock options with actual API calls:
```typescript
// In useEffect or custom hook
const [categoryOptions, setCategoryOptions] = useState([]);

useEffect(() => {
  fetch(REFERENCE_DATA_ENDPOINTS.categories)
    .then(res => res.json())
    .then(data => setCategoryOptions(data));
}, []);
```

### 2. Proper Multi-Select Component
Replace text input with actual multi-select dropdown:
```typescript
case "multi-select":
  return <MultiSelectDropdown options={...} value={...} />;
```

### 3. Validation
Add field validation on save:
```typescript
const validateField = (field: FormField, value: unknown) => {
  if (field.required && !value) return "Required field";
  if (field.validation?.pattern && !field.validation.pattern.test(String(value))) {
    return field.validation.message;
  }
  // ... more validation rules
};
```

### 4. Conditional Field Dependencies
Implement `dependsOn` logic from field config:
```typescript
// Show Unit only if Recommended Dosage is filled
if (field.visibility?.dependsOn === "recommendedProductDosage") {
  if (!formData.recommendedProductDosage) return null;
}
```

### 5. Computed Fields
Implement auto-calculated fields like UFI Code:
```typescript
if (field.dataSource?.type === "COMPUTED") {
  const computedValue = field.dataSource.compute(formData);
  return <input value={computedValue} disabled />;
}
```

## Build & Deployment

**Build Status**: ✅ Success (1.72s)
**Bundle Size**: 529.82 kB (150.47 kB gzipped)
**Commit**: `a215f53`
**Branch**: `12Nov`

**Files Changed**:
- `src/components/FormulaDetailsModal.tsx` - Complete rebuild with dynamic rendering
- `out/index.html` - Production build output

## Summary

The Formula Details Modal now:
1. ✅ Uses proper field types (dropdowns, number inputs, date pickers)
2. ✅ Shows all fields from formula creation configuration
3. ✅ Dynamically renders fields based on formula type
4. ✅ Groups fields by logical sections
5. ✅ Supports both edit and view modes
6. ✅ Matches the UX of formula creation flow

The modal is now fully synchronized with the formula creation configuration system, providing a consistent experience for users whether creating or editing formulas.
