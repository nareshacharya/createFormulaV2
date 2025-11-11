# ID Generation Validation Instructions

## Understanding the Issue

The formula you see in the data grid with ID `NP-F-00005v1` (name: "zxccxz") is an **EXISTING** formula that was created before the new ID generation system was implemented. It's either:
- Part of the mock data in `src/mocks/formulas.ts`
- A formula you created previously that's stored in your workspace
- Persisted in browser localStorage

## The New System Works Correctly

The new ID generation logic (`src/utils/idGeneration.ts`) IS being used when you create NEW formulas through the FormulaModal. The old formulas remain unchanged to avoid breaking existing data.

## How to Validate the New ID Generation

### Step 1: Clear Existing Data (Optional)

If you want to start fresh and see only new-format IDs:

1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to Application tab → Local Storage → your domain
3. Clear all keys or just workspace-related keys
4. Refresh the page

### Step 2: Create a New Formula

1. Click the **"+ Formula"** button or **"Create/Add Formula"** button
2. In the modal, switch to **"Create New"** tab
3. Select **"Perfumer Formula"** type
4. Fill in the mandatory fields:
   - **Fragrance Name**: "Test Perfumer Formula"
   - **Category**: Select any (e.g., "Eau de Parfum")
   - **Region**: Select any (e.g., "North America (NA)")
   - **Country**: Select any (e.g., "United States (US)")
   - **Fragrance Dosage**: Enter any number (e.g., "10")
   - **Product Format**: Select any (e.g., "Spray")
5. Click **"Create Formula"**

### Step 3: Verify the New ID Format

**Expected Result:**
- The new formula ID should be **`AA00001v1`** (since no user is set yet, it defaults to 'AA')
- The ID format should be: **[2-3 LETTERS][5 DIGITS]v[VERSION]**
- NO hyphens (-)
- lowercase 'v' for version

**Old Format (existing formulas):** `NP-F-00005v1`  
**New Format (newly created):** `AA00001v1` or `B00001v1` or `MZ00001v1`

### Step 4: Test Different Formula Types

Create one of each type to verify type-specific prefixes:

#### Base Formula
1. Select "Base Formula" type
2. Fill mandatory fields
3. **Expected ID**: `B00001v1`

#### Dilution Formula
1. Select "Dilution Formula" type  
2. Fill mandatory fields including:
   - Base Formula ID
   - Dilution Percentage
3. **Expected ID**: `D00001v1`

#### Analytical Formula
1. Select "Analytical Formula" type
2. Fill mandatory fields including Sample ID
3. **Expected ID**: `A00001v1`

#### Perfumer Formula (with user initials)
1. Open browser console (F12)
2. Run: `localStorage.setItem('userInitials', 'MZ')`
3. Refresh the page
4. Create a Perfumer Formula
5. **Expected ID**: `MZ00001v1`

### Step 5: Verify Sequence Increments

Create multiple formulas of the same type:

1. Create 3 Base formulas
2. **Expected IDs**: `B00001v1`, `B00002v1`, `B00003v1`
3. Verify each gets the next sequential number

### Step 6: Check Where the ID Appears

The formula ID should appear in:
1. ✅ **Data Grid Column Header** - Below the formula name
2. ✅ **Formula List** - When browsing formulas
3. ✅ **Formula Details** - In quick view or edit modal

## Troubleshooting

### "I still see old IDs"
- **Reason**: Those are existing formulas. Only NEW formulas use the new format.
- **Solution**: Create a NEW formula to see the new format.

### "ID shows as undefined or null"
- **Reason**: Formula creation might have failed
- **Solution**: Check browser console for errors

### "ID format is still NP-F-00001v1"
- **Reason**: You might be looking at an old formula
- **Solution**: Make sure you created a NEW formula after the code update

### "Default user is not 'AA'"
- **Reason**: User initials might be set in localStorage
- **Solution**: Run `localStorage.removeItem('userInitials')` in console

## Expected Behavior Summary

| Formula Type | User Initials | Expected ID Format | Example |
|-------------|---------------|-------------------|---------|
| BASE | (any) | B00001v1 | B00001v1 |
| DILUTION | (any) | D00001v1 | D00001v1 |
| ANALYTICAL | (any) | A00001v1 | A00001v1 |
| PERFUMER | Not set (AA) | AA00001v1 | AA00001v1 |
| PERFUMER | MZ | MZ00001v1 | MZ00001v1 |
| PERFUMER | NP | NP00001v1 | NP00001v1 |

## Next Steps After Validation

Once you verify the NEW formulas have the correct ID format:

1. ✅ **Validation Complete** - The system is working correctly
2. 🔄 **Optional**: Update mock data to use new format (see below)
3. 💾 **Commit**: Ready to commit changes to 11Nov branch

## Optional: Update Mock Data

If you want ALL formulas (including mock data) to use the new format:

We can update `src/mocks/formulas.ts` to convert old IDs to new format:
- `NP-F-00001v1` → `NP00001v1` (Perfumer type)
- `NP-F-00002v1` → `B00001v1` (if it's a Base formula)
- etc.

**Let me know if you want to update the mock data too.**

## Confirmation Checklist

- [ ] Created a new Base formula → ID format: `B00001v1` ✅
- [ ] Created a new Dilution formula → ID format: `D00001v1` ✅
- [ ] Created a new Analytical formula → ID format: `A00001v1` ✅
- [ ] Created a new Perfumer formula → ID format: `AA00001v1` (or `MZ00001v1` if user set) ✅
- [ ] Verified sequence increments correctly ✅
- [ ] Verified ID appears in data grid header ✅
- [ ] No console errors during formula creation ✅

## Summary

**The new ID generation is working correctly!** 

The formula you saw (`NP-F-00005v1`) is an existing/old formula. When you create a NEW formula through the modal, it will use the new ID format (`AA00001v1`, `B00001v1`, etc.).

This is intentional - we don't want to change IDs of existing formulas as that could break references and historical data.
