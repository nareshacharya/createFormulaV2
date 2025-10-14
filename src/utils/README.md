# State Management and Calculations

This directory contains utilities for state management, history tracking, and formula calculations.

## Files Overview

### `stateHistory.ts`
**Purpose**: Manages application state history for undo/redo functionality and audit trails

**Key Features**:
- Maximum 5 undo operations
- Deep state cloning to prevent mutations
- Timestamps for every action
- Action descriptions for audit
- Export/import for persistence
- Integration with Pega DX API for audit requirements

**Usage**:
```typescript
import { appStateHistory } from "./utils/stateHistory";

// Save current state
appStateHistory.push(currentState, "add_ingredient", "Added Lavender Oil");

// Undo operation
const previousState = appStateHistory.undo();
if (previousState) {
  restoreState(previousState);
}

// Check if undo is available
if (appStateHistory.canUndo()) {
  // Show undo button
}

// Get full audit trail
const history = appStateHistory.getFullHistory();
// Send to Pega DX API or export for compliance
```

### `rmcCalculator.ts`
**Purpose**: Calculate Raw Material Costs (RMC) and weighted averages for formula attributes

**Key Functions**:

**1. RMC Calculation**
```typescript
import { calculateRMC } from "./utils/rmcCalculator";

const ingredients = [
  { id: '1', name: 'Lavender', amount: 50, costPerKg: 10 },
  { id: '2', name: 'Bergamot', amount: 30, costPerKg: 20 },
  { id: '3', name: 'Base', amount: 20, costPerKg: 5 }
];

const rmc = calculateRMC(ingredients); // Returns 12.5
// Formula: (50*10 + 30*20 + 20*5) / 100 = 1250 / 100 = 12.5
```

**2. Weighted Average Calculation**
```typescript
import { calculateWeightedAverage } from "./utils/rmcCalculator";

const attributes = [
  { id: '1', name: 'density', value: 0.85, amount: 50 },
  { id: '2', name: 'density', value: 1.15, amount: 30 },
  { id: '3', name: 'density', value: 0.95, amount: 20 }
];

const avgDensity = calculateWeightedAverage(attributes); // Returns 0.955
// Formula: (0.85*50 + 1.15*30 + 0.95*20) / 100 = 95.5 / 100 = 0.955
```

**3. Contribution Cost**
```typescript
import { calculateContributionCost } from "./utils/rmcCalculator";

const cost = calculateContributionCost(50, 10); // Returns 5
// Formula: (50 * 10) / 100 = 5
```

**4. Multiple Attributes**
```typescript
import { calculateMultipleAttributeAverages } from "./utils/rmcCalculator";

const ingredientAttributes = {
  'ing1': { density: 0.85, volatility: 75, odor: 8 },
  'ing2': { density: 1.15, volatility: 20, odor: 6 }
};

const amounts = {
  'ing1': 60,
  'ing2': 40
};

const averages = calculateMultipleAttributeAverages(
  ingredientAttributes,
  amounts,
  ['density', 'volatility', 'odor']
);
// Returns: { density: 0.97, volatility: 53, odor: 7.2 }
```

### `queryEvaluator.ts`
**Purpose**: Evaluate filter queries for ingredient and formula searches

### `bus.ts`
**Purpose**: Event bus for component communication

### `tokens.ts`
**Purpose**: Token management utilities

### `formulaCalculations.ts`
**Purpose**: Formula-specific calculations (totals, normalization, etc.)

## Mathematical Formulas

### Raw Material Cost (RMC)

**Formula**: 
```
RMC = ∑(Ingredient Amount% × Ingredient Cost per Kg) / 100
```

**Description**: 
Calculates the total cost of raw materials in a formula based on ingredient percentages and their individual costs per kilogram.

**Example**:
```
Ingredient A: 40% at $15/kg = (40 × 15) / 100 = $6.00
Ingredient B: 35% at $25/kg = (35 × 25) / 100 = $8.75
Ingredient C: 25% at $10/kg = (25 × 10) / 100 = $2.50
Total RMC = $6.00 + $8.75 + $2.50 = $17.25/kg
```

### Weighted Average for Attributes

**Formula**:
```
Weighted Average = ∑(Attribute Value × Ingredient Amount%) / ∑(Ingredient Amount%)
```

**Description**:
Calculates an overall attribute value for a formula based on the weighted contribution of each ingredient.

**Applicable Attributes**:
- **Density** (g/cm³)
- **Volatility** (%)
- **Refractive Index**
- **Odor Intensity** (1-10 scale)
- **Flash Point** (°C)
- **Viscosity** (cP)
- **pH Level**
- Any other physical or chemical property

**Example (Density)**:
```
Ingredient A: Density 0.82, Amount 50%  → 0.82 × 50 = 41.0
Ingredient B: Density 1.05, Amount 30%  → 1.05 × 30 = 31.5
Ingredient C: Density 0.90, Amount 20%  → 0.90 × 20 = 18.0
Sum of weighted values = 90.5
Sum of amounts = 100%
Weighted Average = 90.5 / 100 = 0.905 g/cm³
```

**Example (Odor Intensity)**:
```
Ingredient A: Odor 9, Amount 60%  → 9 × 60 = 540
Ingredient B: Odor 5, Amount 25%  → 5 × 25 = 125
Ingredient C: Odor 3, Amount 15%  → 3 × 15 = 45
Sum of weighted values = 710
Sum of amounts = 100%
Weighted Average = 710 / 100 = 7.1
```

## Integration with Pega DX API

### State History Export

The state history can be exported for audit and compliance:

```typescript
import { appStateHistory } from "./utils/stateHistory";

// Export full history as JSON
const historyJson = appStateHistory.exportHistory();

// Send to Pega DX API
await fetch('/api/v1/audit/formula-history', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: historyJson
});
```

### RMC in Compounding Submission

RMC is automatically calculated and included in compounding submissions:

```typescript
import { calculateRMC } from "./utils/rmcCalculator";
import { prepareFormulaForCompounding } from "../services/compounding";

const rmc = calculateRMC(ingredients);
const compoundingData = prepareFormulaForCompounding(
  formula,
  ingredients,
  attributes,
  targetTotal
);

// compoundingData.metadata.rmc contains the calculated RMC
await submitForCompounding(compoundingData);
```

## Validation

### Ingredient Data Validation

```typescript
import { validateIngredientData } from "./utils/rmcCalculator";

const validation = validateIngredientData(ingredients);

if (!validation.isValid) {
  console.error("Validation errors:", validation.errors);
  // Show errors to user
} else {
  // Proceed with calculation
  const rmc = calculateRMC(ingredients);
}
```

**Checks**:
- ✅ No negative amounts
- ✅ No negative costs
- ✅ All ingredients have IDs
- ✅ All ingredients have names
- ✅ Amounts are numeric
- ✅ Costs are numeric

## Display Formatting

### Currency Formatting

```typescript
import { formatCurrency } from "./utils/rmcCalculator";

const rmc = 17.25;
console.log(formatCurrency(rmc)); // "$17.25"
console.log(formatCurrency(rmc, "EUR")); // "€17.25"
console.log(formatCurrency(rmc, "GBP")); // "£17.25"
```

### Percentage Formatting

```typescript
import { formatPercentage } from "./utils/rmcCalculator";

const amount = 45.678;
console.log(formatPercentage(amount)); // "45.68%"
console.log(formatPercentage(amount, 1)); // "45.7%"
console.log(formatPercentage(amount, 3)); // "45.678%"
```

## Testing

### Unit Tests

```typescript
// RMC Calculation
describe('calculateRMC', () => {
  it('should calculate correct RMC for multiple ingredients', () => {
    const ingredients = [
      { id: '1', name: 'A', amount: 50, costPerKg: 10 },
      { id: '2', name: 'B', amount: 50, costPerKg: 20 }
    ];
    expect(calculateRMC(ingredients)).toBe(15);
  });

  it('should return 0 for empty ingredients', () => {
    expect(calculateRMC([])).toBe(0);
  });

  it('should handle single ingredient', () => {
    const ingredients = [
      { id: '1', name: 'A', amount: 100, costPerKg: 15 }
    ];
    expect(calculateRMC(ingredients)).toBe(15);
  });
});

// Weighted Average
describe('calculateWeightedAverage', () => {
  it('should calculate correct weighted average', () => {
    const attributes = [
      { id: '1', name: 'density', value: 1.0, amount: 50 },
      { id: '2', name: 'density', value: 0.8, amount: 50 }
    ];
    expect(calculateWeightedAverage(attributes)).toBe(0.9);
  });

  it('should handle uneven amounts', () => {
    const attributes = [
      { id: '1', name: 'density', value: 1.0, amount: 75 },
      { id: '2', name: 'density', value: 0.8, amount: 25 }
    ];
    expect(calculateWeightedAverage(attributes)).toBe(0.95);
  });
});

// State History
describe('StateHistoryManager', () => {
  it('should limit history to 5 undos', () => {
    const manager = new StateHistoryManager();
    for (let i = 0; i < 10; i++) {
      manager.push({ count: i }, `action-${i}`);
    }
    expect(manager.getUndoCount()).toBeLessThanOrEqual(5);
  });

  it('should properly undo and redo', () => {
    const manager = new StateHistoryManager();
    manager.push({ value: 1 }, 'action-1');
    manager.push({ value: 2 }, 'action-2');
    
    expect(manager.getCurrentState()).toEqual({ value: 2 });
    
    manager.undo();
    expect(manager.getCurrentState()).toEqual({ value: 1 });
    
    manager.redo();
    expect(manager.getCurrentState()).toEqual({ value: 2 });
  });
});
```

## Performance Considerations

### RMC Calculation
- **Time Complexity**: O(n) where n is number of ingredients
- **Space Complexity**: O(1)
- **Recommended**: Cache results for large formulas

### Weighted Average Calculation
- **Time Complexity**: O(n) where n is number of attributes
- **Space Complexity**: O(1)
- **Recommended**: Batch calculate multiple attributes at once

### State History
- **Time Complexity**: O(1) for push/pop operations
- **Space Complexity**: O(n) where n ≤ 6 (max history size)
- **Memory**: Deep cloning may impact large states; consider selective state saving

## Best Practices

### 1. Always Validate Before Calculating
```typescript
const validation = validateIngredientData(ingredients);
if (validation.isValid) {
  const rmc = calculateRMC(ingredients);
} else {
  showErrors(validation.errors);
}
```

### 2. Use Batch Calculations for Multiple Attributes
```typescript
// Good: Calculate all at once
const averages = calculateMultipleAttributeAverages(
  ingredientAttributes,
  amounts,
  ['density', 'volatility', 'odor', 'flashPoint']
);

// Avoid: Multiple individual calculations
// const density = calculateWeightedAverage(...);
// const volatility = calculateWeightedAverage(...);
// ...
```

### 3. Save State Before Major Operations
```typescript
// Save state before bulk operation
appStateHistory.push(
  currentState,
  'bulk_edit',
  'Updated all ingredient amounts'
);

// Perform operation
performBulkEdit();

// If error, user can undo
```

### 4. Export History Regularly for Audit
```typescript
// Export every 100 actions or before major submissions
if (appStateHistory.getCurrentEntry()) {
  const history = appStateHistory.exportHistory();
  await saveToAuditLog(history);
}
```

## Related Documentation

- [Compounding Feature](../docs/COMPOUNDING_FEATURE.md)
- [Changes Log](../docs/CHANGES.md)
- [Theme Configuration](../docs/THEME_CONFIGURATION.md)
