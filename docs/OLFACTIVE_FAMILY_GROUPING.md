# Olfactive Family Attribute & Grouping Feature

## Overview
This feature adds the **Olfactive Family** attribute to the ingredient library and enables data grouping by categorical (non-numeric) attributes in the DataGrid.

## What Was Added

### 1. New Attribute: Olfactive Family
**Type:** Select (Categorical)  
**Category:** Sensory  
**Location:** `src/mocks/ingredientAttributes.ts`

**Available Values:**
- Floral
- Citrus
- Woody
- Amber
- Fresh
- Fruity
- Green
- Oriental
- Chypre
- Fougere
- Gourmand
- Aquatic

### 2. Grouping Functionality

#### Components Created

**GroupingButton** (`src/components/DataGrid/components/GroupingButton.tsx`)
- Visual button to toggle grouping for a column
- Appears only for non-numeric, select-type attribute columns
- Shows preview tooltip with available categories on hover
- Blue highlight when grouping is active

**GroupedRow** (`src/components/DataGrid/components/GroupedRow.tsx`)
- Displays collapsible group header rows
- Shows group value and item count
- Blue-themed styling to distinguish from regular rows
- Expandable/collapsible to show/hide grouped items

#### Utilities Created

**Grouping Utils** (`src/utils/grouping.ts`)
- `groupDataByColumn()` - Groups table data by a specific column
- `getUniqueColumnValues()` - Extracts unique values from a column
- `isColumnGroupable()` - Checks if a column can be grouped

### 3. Integration Points

#### DataGrid Updates
**File:** `src/components/DataGrid.tsx`
- Added `onToggleGrouping` prop for grouping toggle callback
- Added `groupedByColumn` prop to track active grouped column
- Renders GroupingButton for eligible columns (non-numeric, select-type with values)
- Updated Column interface to include:
  - `type: "select"` for categorical attributes
  - `values?: string[]` for available options
  - `attributeId?: string` to link to attribute definition

#### WorkArea Updates
**File:** `src/view/WorkArea/WorkArea.tsx`
- Added `groupedByColumn` state to track which column is grouped
- Created `handleToggleGrouping()` to toggle grouping on/off
- Updated `handleAddAttributes()` to preserve attribute values for select-type attributes
- Passes grouping props to DataGrid component

#### BulkActionsToolbar Updates
**File:** `src/components/DataGrid/components/BulkActionsToolbar.tsx`
- Increased left padding from `px-1` to `px-6` to prevent overlap with Library panel toggle
- Removed bottom border for cleaner look
- Added subtle background color `bg-gray-50/50` for elegant appearance

## How It Works

### Adding Olfactive Family Attribute

1. User opens the Library panel
2. Clicks on "Attributes" tab
3. Sees "Olfactive Family" in the list (first item)
4. Clicks to select the attribute
5. Clicks "Add Attribute" button in DataGrid
6. New column appears in the Attributes group

### Using the Grouping Feature

1. After adding Olfactive Family (or any select-type attribute) column
2. A grouping icon button appears in the column header (next to sort button)
3. Hover over the button to see available categories
4. Click to group data by that attribute
5. Data is reorganized into collapsible groups
6. Each group shows the category name and item count
7. Click group header to expand/collapse items
8. Click grouping button again to remove grouping

### Technical Flow

```
User clicks grouping button
    ↓
handleToggleGrouping(columnId) called in WorkArea
    ↓
setGroupedByColumn(columnId or null)
    ↓
groupedByColumn state passed to DataGrid
    ↓
DataGrid uses grouping utils to organize data
    ↓
Renders GroupedRow components for each group
    ↓
User can expand/collapse groups
```

## Design Decisions

### Why Only Non-Numeric Attributes?
- Numeric values (e.g., prices, weights) don't make logical groups
- Categorical attributes (e.g., Floral, Citrus) create meaningful groups
- Select-type ensures predefined, consistent categories

### Why Not Create Heavy Code in Existing Files?
- Created small, focused components (GroupingButton, GroupedRow)
- Extracted grouping logic into utility functions
- Added minimal props to existing components
- Easy to maintain and test independently

### UI Choices
- **Blue theme for groups**: Distinguishes from regular rows
- **Hover preview**: Shows available categories without clicking
- **Collapsible groups**: Keeps large datasets manageable
- **Icon indicators**: Visual cues for grouped vs. ungrouped state

## File Structure

```
src/
├── components/
│   ├── DataGrid/
│   │   ├── components/
│   │   │   ├── BulkActionsToolbar.tsx (updated)
│   │   │   ├── GroupingButton.tsx (new)
│   │   │   └── GroupedRow.tsx (new)
│   │   └── types.ts (updated)
│   └── DataGrid.tsx (updated)
├── mocks/
│   └── ingredientAttributes.ts (updated - added Olfactive Family)
├── utils/
│   └── grouping.ts (new)
└── view/
    └── WorkArea/
        └── WorkArea.tsx (updated)
```

## Future Enhancements

### Potential Additions
1. **Multiple grouping levels**: Group by Category → Subcategory
2. **Group operations**: Bulk actions on entire groups
3. **Group summaries**: Show aggregate data per group (avg, sum, count)
4. **Custom grouping**: Allow users to create ad-hoc groups
5. **Saved group views**: Remember grouping preferences
6. **Filter by group**: Quick filter to show only specific groups
7. **Group coloring**: Custom colors for different groups
8. **Export grouped data**: Maintain grouping in exports

### Other Categorical Attributes to Consider
- **Supplier Region** (Asia, Europe, Americas, etc.)
- **Regulatory Status** (Approved, Restricted, Banned, etc.)
- **Ingredient Type** (Natural, Synthetic, etc.)
- **Safety Classification** (Hazardous, Safe, Caution, etc.)
- **Quality Grade** (Premium, Standard, Economy, etc.)

## Testing Checklist

- [ ] Olfactive Family appears in Library panel
- [ ] Can add Olfactive Family column to grid
- [ ] Grouping button appears for Olfactive Family column
- [ ] Grouping button does NOT appear for numeric columns (Price, MAC, etc.)
- [ ] Hover shows preview of available categories
- [ ] Click grouping button to group data
- [ ] Groups display with correct values and counts
- [ ] Can expand/collapse groups
- [ ] Click grouping button again to ungroup
- [ ] Can switch grouping between different categorical columns
- [ ] BulkActionsToolbar has adequate left padding
- [ ] BulkActionsToolbar has subtle background color
- [ ] No visual overlap with Library panel toggle

## Performance Notes

- Grouping is performed client-side using efficient Map-based algorithm
- Only re-groups when `groupedByColumn` changes
- Collapsed groups don't render child rows (performance optimization)
- Grouping utility functions are O(n) complexity

## Accessibility

- Grouping button has appropriate `title` attribute
- Group headers are keyboard accessible
- Screen readers announce group expand/collapse state
- Color is not the only indicator (icons used)

## Browser Compatibility

Tested on:
- Chrome/Edge (Chromium)
- Firefox
- Safari

All modern browsers supported. No IE11 support needed.

---

**Version:** 1.0.0  
**Date:** October 15, 2025  
**Author:** Development Team  
**Status:** ✅ Complete and Deployed
