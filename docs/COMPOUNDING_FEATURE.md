# Compounding Feature Documentation

## Overview

The Compounding feature allows users to send the active formula from the data grid for compounding processing. This feature integrates with Pega DX API to submit formula data including all ingredients, their CAS numbers, field values, and status information.

## Key Features

### 1. Send for Compounding
- **Location**: Header panel (send plane icon)
- **Action**: Submits active formula with all ingredient data to Pega DX API
- **Requirements**: An active formula must be selected in the data grid
- **Data Sent**:
  - Formula metadata (ID, name, version, target total)
  - All ingredients under the active formula
  - Ingredient details: CAS numbers, amounts, percentages, costs
  - Field values and status for each ingredient
  - Calculated metrics (RMC, weighted averages)
  - Audit trail of all changes

### 2. Raw Material Cost (RMC)

**Formula**: `RMC = ∑(Ingredient Amount% × Ingredient Cost per Kg) / 100`

**Purpose**: Calculate the total cost of raw materials in a formula

**Example**:
```
Ingredient A: 50% amount, $10/kg cost → Contribution: (50 × 10) / 100 = $5
Ingredient B: 30% amount, $20/kg cost → Contribution: (30 × 20) / 100 = $6
Ingredient C: 20% amount, $15/kg cost → Contribution: (20 × 15) / 100 = $3
Total RMC = $5 + $6 + $3 = $14/kg
```

### 3. Weighted Average for Attributes

**Formula**: `Weighted Average = ∑(Ingredient Attribute Value × Ingredient Amount%) / ∑(Ingredient Amount%)`

**Purpose**: Calculate overall formula attribute values based on ingredient proportions

**Applicable to**:
- Density
- Volatility  
- Refractive Index
- Odor Intensity
- Other physical/chemical properties

**Example** (Density calculation):
```
Ingredient A: Density 0.85, Amount 50%  → (0.85 × 50) = 42.5
Ingredient B: Density 1.20, Amount 30%  → (1.20 × 30) = 36.0
Ingredient C: Density 0.95, Amount 20%  → (0.95 × 20) = 19.0
Total Weighted = 97.5
Total Amount = 100%
Weighted Average Density = 97.5 / 100 = 0.975 g/cm³
```

## User Interface

### Header Panel Actions

```
┌─────────────────────────────────────────────────────────────┐
│ [Flask+] [Merge] [Scale] [✈️ Send] [↩️ Undo] [Compliance] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**New Icons**:
1. **Send Plane Icon** (✈️): Send active formula for compounding
   - Enabled: When active formula exists
   - Disabled: Grayed out when no active formula
   - Tooltip: "Send Active Formula for Compounding"

2. **Undo Icon** (↩️): Undo recent actions
   - Shows count badge (max 5)
   - Enabled: When undo history exists
   - Disabled: Grayed out when no history
   - Tooltip: "Undo (X available)"

## Technical Implementation

### 1. Compounding Service (`src/services/compounding.ts`)

**Key Functions**:

```typescript
// Prepare formula data for submission
prepareFormulaForCompounding(
  formula: Formula,
  ingredients: CompoundingIngredient[],
  attributes: CompoundingAttribute[],
  targetTotal: number
): CompoundingFormula

// Validate formula before submission
validateFormulaForCompounding(
  formula: CompoundingFormula
): { isValid: boolean; errors: string[] }

// Submit to Pega DX API
submitForCompounding(
  submission: CompoundingSubmission
): Promise<{ success: boolean; submissionId?: string; errors?: string[] }>
```

**Data Structure**:
```typescript
interface CompoundingIngredient {
  id: string;
  name: string;
  casNumber?: string;
  amount: number;
  percentage: number;
  unit: string;
  cost?: number;
  contributionCost?: number;
  status: "active" | "pending" | "substituted" | "removed";
  fields: Record<string, any>;
  notes?: string;
}

interface CompoundingFormula {
  id: string;
  name: string;
  version: string;
  targetTotal: number;
  unit: string;
  ingredients: CompoundingIngredient[];
  attributes: CompoundingAttribute[];
  metadata: {
    createdAt: Date;
    lastModified: Date;
    rmc: number;
    totalAmount: number;
    status: "draft" | "ready" | "submitted" | "completed";
  };
}
```

### 2. RMC Calculator (`src/utils/rmcCalculator.ts`)

**Key Functions**:

```typescript
// Calculate total RMC
calculateRMC(ingredients: IngredientCostData[]): number

// Calculate weighted average for attributes
calculateWeightedAverage(attributes: AttributeData[]): number

// Calculate single ingredient contribution
calculateContributionCost(amount: number, costPerKg: number): number

// Calculate multiple attributes at once
calculateMultipleAttributeAverages(
  ingredientAttributes: Record<string, Record<string, number>>,
  amounts: Record<string, number>,
  attributeNames: string[]
): Record<string, number>
```

### 3. State History Manager (`src/utils/stateHistory.ts`)

**Purpose**: Track application state for undo/redo and audit

**Key Features**:
- Maximum 5 undo operations (6 total states including current)
- Deep cloning of state to prevent mutation
- Timestamps for audit trail
- Action descriptions for history
- Export/import for persistence
- Full audit trail for Pega DX API submission

**API**:
```typescript
class StateHistoryManager<T> {
  push(state: T, action: string, description?: string): void
  undo(): T | null
  redo(): T | null
  canUndo(): boolean
  canRedo(): boolean
  getCurrentState(): T | null
  getFullHistory(): HistoryEntry<T>[]
  getUndoCount(): number
  exportHistory(): string
  clear(): void
}
```

## Event Bus Integration

### New Events

```typescript
// Send active formula for compounding
eventBus.emit("send-for-compounding");

// Undo last action
eventBus.emit("undo-action");

// Update undo state in header
eventBus.emit("undo-state-updated", { 
  canUndo: boolean, 
  count: number 
});

// Update active formula state
eventBus.emit("active-formula-updated", { 
  hasActiveFormula: boolean 
});
```

## Workflow

### Send for Compounding Workflow

```
1. User selects active formula in data grid
   ↓
2. User clicks "Send for Compounding" icon
   ↓
3. System validates:
   - Active formula exists
   - All required fields present
   - Total percentage = 100%
   - No negative values
   ↓
4. System prepares data:
   - Collects all ingredients
   - Calculates RMC
   - Calculates weighted averages
   - Gathers audit trail
   ↓
5. System submits to Pega DX API
   ↓
6. Success: Show toast with submission ID
   Failure: Show error messages
   ↓
7. Log submission in audit trail
```

### Undo Workflow

```
1. User performs action (add ingredient, edit value, etc.)
   ↓
2. System saves current state to history
   - Action type
   - Timestamp
   - State snapshot
   - Description
   ↓
3. User clicks "Undo" icon
   ↓
4. System restores previous state
   ↓
5. Update UI to reflect previous state
   ↓
6. Update undo count badge
   ↓
7. Log undo action in audit trail
```

## Validation Rules

### Before Compounding Submission

1. **Formula Validation**:
   - ✅ Formula name required
   - ✅ Formula version required
   - ✅ At least one ingredient required
   - ✅ Total percentage must equal 100% (±0.01 tolerance)

2. **Ingredient Validation**:
   - ✅ Each ingredient must have ID and name
   - ✅ Amount must be non-negative
   - ✅ Percentage must be 0-100%
   - ✅ Cost per kg must be non-negative (if provided)

3. **Attribute Validation**:
   - ✅ All attribute values must be numeric
   - ✅ Weighted calculations require valid amounts

## API Integration

### Pega DX API Endpoint (To Be Implemented)

```typescript
POST /api/v1/compounding/submit

Headers:
  Content-Type: application/json
  Authorization: Bearer {token}

Body:
{
  "formula": CompoundingFormula,
  "submittedBy": "user@example.com",
  "submittedAt": "2025-10-14T10:30:00Z",
  "priority": "normal",
  "notes": "Optional submission notes",
  "auditTrail": AuditEntry[]
}

Response (Success):
{
  "success": true,
  "submissionId": "COMP-1729000000000",
  "message": "Formula submitted successfully"
}

Response (Error):
{
  "success": false,
  "errors": [
    "Total percentage must equal 100%",
    "Ingredient X has invalid amount"
  ]
}
```

## Audit Trail

### Stored Information

Every action on the data grid is tracked:

```typescript
interface AuditEntry {
  timestamp: Date;
  action: string; // "add_ingredient", "edit_value", "delete_row", etc.
  description: string; // Human-readable description
  user?: string; // User who performed action
  changes?: {
    field: { before: any, after: any }
  };
}
```

### Actions Tracked

- ✅ Add ingredient
- ✅ Remove ingredient
- ✅ Edit cell value
- ✅ Add attribute
- ✅ Remove attribute
- ✅ Add formula column
- ✅ Delete formula column
- ✅ Normalize formula
- ✅ Merge duplicates
- ✅ Set active formula
- ✅ Undo operation
- ✅ Send for compounding

### Audit Export

Audit trail can be exported for compliance:

```typescript
const history = appStateHistory.exportHistory();
// Save to file or send to audit system
```

## Error Handling

### User-Friendly Messages

```typescript
// No active formula
❌ "Please select an active formula before sending for compounding"

// Invalid total percentage
❌ "Total ingredient percentage must equal 100% (current: 98.5%)"

// Missing required fields
❌ "Ingredient Lavender Oil is missing CAS number"

// API connection error
❌ "Failed to submit formula. Please check your connection and try again."

// Validation error
❌ "Formula cannot be submitted: [list of errors]"
```

## Testing

### Manual Testing Checklist

- [ ] Send for compounding with active formula
- [ ] Try to send without active formula (should show error)
- [ ] Verify RMC calculation matches expected value
- [ ] Verify weighted averages calculated correctly
- [ ] Test undo functionality (5 operations)
- [ ] Test undo badge count display
- [ ] Verify audit trail records all actions
- [ ] Test validation errors display correctly
- [ ] Test API submission (mock)
- [ ] Test export of audit trail

### Unit Test Coverage

```typescript
// RMC Calculator
describe('calculateRMC', () => {
  it('should calculate correct RMC', () => {
    const ingredients = [
      { id: '1', name: 'A', amount: 50, costPerKg: 10 },
      { id: '2', name: 'B', amount: 50, costPerKg: 20 }
    ];
    expect(calculateRMC(ingredients)).toBe(15); // (50*10 + 50*20)/100
  });
});

// Weighted Average
describe('calculateWeightedAverage', () => {
  it('should calculate correct weighted average', () => {
    const attributes = [
      { id: '1', name: 'density', value: 0.85, amount: 60 },
      { id: '2', name: 'density', value: 1.15, amount: 40 }
    ];
    expect(calculateWeightedAverage(attributes)).toBe(0.97);
  });
});

// State History
describe('StateHistoryManager', () => {
  it('should maintain max 5 undo operations', () => {
    const manager = new StateHistoryManager();
    for (let i = 0; i < 10; i++) {
      manager.push({ value: i }, `action-${i}`);
    }
    expect(manager.getUndoCount()).toBeLessThanOrEqual(5);
  });
});
```

## Future Enhancements

### Phase 2 (Future)
1. **Redo Functionality**: Add redo button to complement undo
2. **Batch Compounding**: Submit multiple formulas at once
3. **Compounding Status Tracking**: Real-time status updates from Pega
4. **Cost Optimization**: Suggest ingredient substitutions to reduce RMC
5. **Historical Comparison**: Compare current formula with previous submissions
6. **Advanced Audit**: Search and filter audit trail
7. **Export Formats**: Export formula data in multiple formats (PDF, Excel, CSV)

### Phase 3 (Future)
1. **Approval Workflow**: Multi-level approval before compounding
2. **Batch Processing**: Queue multiple formulas
3. **Priority Management**: Urgent vs. normal compounding
4. **Notification System**: Email/SMS when compounding complete
5. **Integration**: Connect with inventory management
6. **Scheduling**: Schedule compounding for specific times

## Related Documentation

- [Changes Log](./CHANGES.md) - Complete change history
- [Theme Configuration](./THEME_CONFIGURATION.md) - UI styling guide
- [State Management](./STATE_MANAGEMENT.md) - Application state patterns
- [API Integration](./API_INTEGRATION.md) - Pega DX API details

## Support

For questions or issues with the compounding feature:
1. Check validation error messages
2. Review audit trail for action history
3. Check browser console for API errors
4. Refer to this documentation
5. Contact development team
