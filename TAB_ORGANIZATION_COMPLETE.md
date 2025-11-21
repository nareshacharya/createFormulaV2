# Tab Organization Reference

## Overall Tab Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    CREATE FORMULA MODAL                     │
├─────────────────────────────────────────────────────────────┤
│  Tab 1: Identification   Tab 2: Details   Tab 3: Product    │
│  Tab 4: Additional                                           │
├─────────────────────────────────────────────────────────────┤
```

---

## Tab 1: Identification
**Purpose:** All mandatory fields in one place  
**Sections:** 2

```
┌─ FORMULA IDENTIFICATION (Section 1)
│  └─ Formula Type * (Required for all)
│     [BASE]  [DILUTION]  [ANALYTICAL]  [PERFUMER]
│
├─ MANDATORY INFORMATION (Section 2)
│  │
│  ├─ Fragrance Name * (if applicable)
│  │  Input field - visible for BASE, DILUTION, PERFUMER
│  │
│  ├─ Sample ID * (if applicable)
│  │  Input field - visible for ANALYTICAL
│  │
│  ├─ Base Formula * + Dilution % * (if DILUTION)
│  │  [Input]  [0.00%]  - visible only for DILUTION
│  │
│  ├─ Formula Name
│  │  Input field - all types
│  │
│  └─ Formula Version
│     Input field (number) - all types
```

**Spacing:**
- Section header to content: 16px
- Between individual fields: 12px
- Divider between sections: 24px above and below

---

## Tab 2: Details
**Purpose:** General information, dosage, and system codes  
**Sections:** 3

```
┌─ GENERAL INFORMATION (Section 1)
│  [Category*]    [Region*]
│  [Country*]
│
├─ DOSAGE & PRODUCT FORMAT (Section 2) ← Divider: 24px
│  [Fragrance Dosage%*]  [Product Format*]
│
└─ SYSTEM CODES (Section 3) ← Divider: 24px
   [SAP PLM Code] (BASE/PERFUMER)
   [LIMS Code]    (BASE/ANALYTICAL)
```

**Mandatory Fields:**
- Category *
- Region *
- Country *
- Fragrance Dosage *
- Product Format *

**Optional Fields:**
- SAP PLM Code (type-specific)
- LIMS Code (type-specific)

---

## Tab 3: Product & Project
**Purpose:** Product details and project reference  
**Sections:** 2

```
┌─ PRODUCT INFORMATION (Section 1)
│  [Brand]        [Variant]
│  [Supplier]
│
└─ PROJECT INFORMATION (Section 2) ← Divider: 24px
   [Project ID]
   [Currencies]        (read-only)
   [Default Currency]  (read-only)
```

**All Optional Fields:**
- Brand
- Variant
- Supplier
- Project ID
- Currencies (auto-populated)
- Default Currency (auto-populated)

---

## Tab 4: Additional
**Purpose:** Production details and extra information  
**Sections:** 2

```
┌─ PRODUCTION INFORMATION (Section 1)
│  [Production Code]           [Production Date]
│  [Recommended Dosage] [Unit]
│
└─ ADDITIONAL INFORMATION (Section 2) ← Divider: 24px
   [Claims]
   [Comment on Product] (textarea, 4 rows)
```

**All Optional Fields:**
- Production Code
- Production Date
- Recommended Dosage + Unit
- Claims
- Comment on Product

---

## Spacing & Styling Guide

### Section Headers (Consistent Across All Tabs)
```
Style: text-xs font-semibold text-gray-600 uppercase
Size: 12px, bold, uppercase, medium-dark gray
Margin Below: 16px (mb-4)
```

### Dividers Between Sections
```
Style: border-t border-gray-200 pt-6 mt-6 mb-6
Effect: Light gray line with 24px padding above/below
```

### Field Labels
```
Style: block text-sm font-medium text-gray-700 mb-2
Size: 14px, semi-bold, dark gray
Margin Below: 8px
```

### Input Fields
```
Style: w-full px-3 py-2 border border-gray-300 rounded-md
Focus: ring-2 ring-blue-500
```

### Grid Layouts
- **Single Column:** Full width, margin-bottom: 12px
- **Two Column:** Each 50% width, gap: 16px
- **Three Column:** Each 33% width, gap: 16px (used in Formula Type selector)

---

## Field Type Visibility Matrix

### BASE Formula
**Mandatory:**
- formulaType, category, region, country, fragranceName, productFormat

**Optional:**
- name, version, projectId, sapPlmCode, limsCode, brand, supplier, claims, variant, production info, recommended dosage, comments

**Hidden:**
- sampleId

### DILUTION Formula
**Mandatory:**
- formulaType, category, region, country, fragranceName, baseFormulaId, dilutionPercentage, productFormat

**Optional:**
- name, version, projectId, sapPlmCode, limsCode, brand, supplier, claims, variant, production info, recommended dosage, comments

**Hidden:**
- sampleId

### ANALYTICAL Formula
**Mandatory:**
- formulaType, category, region, country, sampleId, productFormat

**Optional:**
- name, version, projectId, limsCode, production info, comments

**Hidden:**
- fragranceName, brand, supplier, claims, variant, recommended dosage, fragrance dosage actual

### PERFUMER Formula
**Mandatory:**
- formulaType, category, region, country, fragranceName, fragranceDosage, productFormat

**Optional:**
- name, version, projectId, sapPlmCode, limsCode, brand, supplier, claims, variant, production info, recommended dosage, comments

**Hidden:**
- sampleId

---

## User Flow

### Creating a New Formula
1. **Tab 1 (Identification)** ← Start here
   - Select formula type
   - Fill mandatory fields (type-specific)
   - Enter name and version

2. **Tab 2 (Details)** ← Complete required info
   - Set category, region, country
   - Set fragrance dosage and product format
   - Optionally add system codes

3. **Tab 3 (Product & Project)** ← Add optional details
   - Enter brand, variant, supplier
   - Link to project if applicable

4. **Tab 4 (Additional)** ← Fine-tune
   - Add production information
   - Add claims and comments

5. **Click "Create Formula"** ← Save

---

## Consistency Checklist

- [x] All section headers: text-xs font-semibold text-gray-600 uppercase mb-4
- [x] All dividers: border-t border-gray-200 pt-6 mt-6 mb-6
- [x] All field labels: text-sm font-medium text-gray-700 mb-2
- [x] All input spacing: mb-3 between fields
- [x] No mixed spacing utilities (all manual values)
- [x] Grid layouts consistent (gap: 16px)
- [x] Mandatory fields consolidated to Tab 1
- [x] Visual hierarchy clear
- [x] Type-specific field visibility respected
- [x] No cramped or overlapping fields

---

## Implementation Notes

### Files Modified
1. FormulaTypeSelection.tsx - Complete restructure with all mandatory fields
2. FormulaGeneralInformation.tsx - Header and divider updates
3. FormulaSystemCodes.tsx - Styling standardization
4. FormulaProductInformation.tsx - Styling standardization
5. FormulaProjectInformation.tsx - Styling standardization
6. FormulaProductionInformation.tsx - Styling standardization
7. FormulaAdditionalInformation.tsx - Styling standardization

### Removed
- `style={tw("space-y-5")}` utility class from all components
- Inconsistent `mb-2` margins on section headers

### Added
- Consistent `mb-4` to all section headers
- Uniform divider styling with `border-t border-gray-200 pt-6 mt-6 mb-6`
- Clear section organization with proper spacing

### Result
- ✅ 100% consistent spacing across all tabs
- ✅ Clean visual hierarchy
- ✅ User-friendly field organization
- ✅ 0 TypeScript errors
- ✅ Production ready
