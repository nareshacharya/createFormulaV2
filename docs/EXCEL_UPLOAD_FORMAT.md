# Excel/CSV Upload Format for Analytical Composition

## Overview
When uploading an analytical composition file to add ingredients to your formula, the system parses Excel (.xlsx, .xls) and CSV (.csv) files. The file must have ingredients and their percentage composition.

## Required Column Format

The system expects columns in this order:

| Column | Header | Required | Description | Example |
|--------|--------|----------|-------------|---------|
| A | Ingredient Name | ✓ Yes | The name of the ingredient (must match or be manually mapped) | "Water" |
| B | Percentage | ✓ Yes | The percentage composition of this ingredient (0-100) | 95.5 |
| C | Retention Time | Optional | The retention time value (for analytical reference) | 12.34 |
| D | Peak Area | Optional | The peak area value (for analytical reference) | 1000.123 |
| E | Match Quality | Optional | The match quality score (for analytical reference) | 98.5 |

## Example File Format

### Minimal Example (Columns A & B only)
```
Ingredient Name,Percentage
Water,95.5
Glycerin,3.2
Ethanol,1.3
```

### Full Example (All columns)
```
Ingredient Name,Percentage,Retention Time,Peak Area,Match Quality
Water,95.50000,2.34,1500.123,99.5
Glycerin,3.20000,5.67,800.456,98.2
Ethanol,1.30000,8.90,200.789,97.8
```

## Important Notes

1. **Header Row**: The first row should contain column headers. The system will skip it during parsing.

2. **Ingredient Matching**:
   - The system attempts to match "Ingredient Name" (Column A) against your ingredient library
   - Matching is **case-insensitive** and can handle slight variations
   - If an exact match isn't found, you'll be prompted to manually select the ingredient during upload

3. **Decimal Precision**:
   - All numeric values are limited to **maximum 5 decimal places**
   - Examples: 95.5, 3.25000, 12.34567 (truncated to 12.34567)
   - Values are automatically rounded to this precision

4. **Percentage Values**:
   - Should be between 0 and 100
   - Decimals are supported (e.g., 95.5, 3.25, etc.)
   - Total percentage does NOT need to equal 100%
   - Unmapped ingredients are still added as rows in your formula

5. **Column Headers Must Match Exactly**:
   - Column A must be labeled as the ingredient identifier (or name)
   - Column B must be the percentage value
   - Optional columns must have recognizable headers for the system to parse them correctly

6. **File Format Support**:
   - ✓ Excel (.xlsx) - Recommended
   - ✓ Excel Legacy (.xls)
   - ✓ CSV (.csv)

## Workflow

1. **Create or Select Formula** → Click "Upload Composition"
2. **Select File** → Choose your Excel/CSV file
3. **Select Sheet** → If your file has multiple sheets, select the one with ingredient data
4. **Map Ingredients** → Review ingredient matches:
   - ✓ Green checkmark = Successfully matched to library
   - ⚠ Warning symbol = Ingredient will be added but not matched
   - 🔄 Can click to manually select a different ingredient from library
5. **Confirm Upload** → Review all data and click "Confirm"
6. **View in Grid** → Ingredients appear as rows in your formula with their percentages

## Troubleshooting

### Ingredients Not Found
- Check spelling of ingredient names in Column A
- The system performs case-insensitive matching, so "water" = "Water" = "WATER"
- If not found, you can manually select the ingredient in the mapping step

### Percentages Showing Truncated
- This is normal - the system limits decimals to 5 places for precision
- Example: 95.123456789 displays as 95.12346

### Wrong Column Interpreted
- Ensure Column A contains ingredient names/identifiers
- Ensure Column B contains percentage values
- Optional columns (C, D, E) must have clear headers

### File Not Parsing
- Verify the file is valid Excel or CSV format
- Ensure the first row contains headers
- Check that data starts from Row 2
- Try exporting your file as .xlsx if using older Excel format

## Advanced: Column Remapping During Upload

If your file has different column names (e.g., "RMID" for ID, "IngredientName"), you can still use it:
1. Upload the file normally
2. The system will attempt to find columns by position (A, B, C, etc.)
3. In the mapping step, you can manually verify/change ingredient selections
4. The percentage column (B) must still be in Column B position

**Note**: For best results, ensure your file follows the standard format above.
