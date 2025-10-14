/**
 * RMC (Raw Material Cost) Calculator
 * Calculates cost metrics for formulas based on ingredient costs and amounts
 */

export interface IngredientCostData {
  id: string;
  name: string;
  amount: number; // Percentage
  costPerKg: number;
}

export interface AttributeData {
  id: string;
  name: string;
  value: number;
  amount: number; // Percentage for weighted calculation
}

/**
 * Calculate RMC (Raw Material Cost)
 * Formula: RMC = ∑(Ingredient Amount% × Ingredient Cost per Kg) / 100
 * 
 * @param ingredients Array of ingredients with amounts and costs
 * @returns Total RMC value
 */
export function calculateRMC(ingredients: IngredientCostData[]): number {
  if (!ingredients || ingredients.length === 0) {
    return 0;
  }

  const totalCost = ingredients.reduce((sum, ingredient) => {
    return sum + (ingredient.amount * ingredient.costPerKg) / 100;
  }, 0);

  return Number(totalCost.toFixed(4));
}

/**
 * Calculate weighted average for an attribute
 * Formula: Weighted Average = ∑(Attribute Value × Ingredient Amount%) / ∑(Ingredient Amount%)
 * 
 * @param attributes Array of attribute values with corresponding ingredient amounts
 * @returns Weighted average value
 */
export function calculateWeightedAverage(attributes: AttributeData[]): number {
  if (!attributes || attributes.length === 0) {
    return 0;
  }

  const totalWeightedValue = attributes.reduce((sum, attr) => {
    return sum + (attr.value * attr.amount);
  }, 0);

  const totalAmount = attributes.reduce((sum, attr) => {
    return sum + attr.amount;
  }, 0);

  if (totalAmount === 0) {
    return 0;
  }

  return Number((totalWeightedValue / totalAmount).toFixed(4));
}

/**
 * Calculate contribution cost for a single ingredient
 * Formula: Contribution Cost = (Ingredient Amount% × Ingredient Cost per Kg) / 100
 * 
 * @param amount Ingredient amount percentage
 * @param costPerKg Cost per kilogram
 * @returns Contribution cost
 */
export function calculateContributionCost(amount: number, costPerKg: number): number {
  return Number(((amount * costPerKg) / 100).toFixed(4));
}

/**
 * Calculate multiple attribute weighted averages
 * 
 * @param ingredientAttributes Map of ingredient IDs to their attribute values
 * @param amounts Map of ingredient IDs to their amounts
 * @param attributeNames Array of attribute names to calculate
 * @returns Map of attribute names to weighted averages
 */
export function calculateMultipleAttributeAverages(
  ingredientAttributes: Record<string, Record<string, number>>,
  amounts: Record<string, number>,
  attributeNames: string[]
): Record<string, number> {
  const results: Record<string, number> = {};

  attributeNames.forEach((attrName) => {
    const attrData: AttributeData[] = [];

    Object.keys(ingredientAttributes).forEach((ingredientId) => {
      const attributes = ingredientAttributes[ingredientId];
      const amount = amounts[ingredientId];

      if (attributes[attrName] !== undefined && amount !== undefined) {
        attrData.push({
          id: ingredientId,
          name: attrName,
          value: attributes[attrName],
          amount: amount,
        });
      }
    });

    results[attrName] = calculateWeightedAverage(attrData);
  });

  return results;
}

/**
 * Validate ingredient data before calculations
 */
export function validateIngredientData(ingredients: IngredientCostData[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!ingredients || ingredients.length === 0) {
    errors.push("No ingredients provided");
    return { isValid: false, errors };
  }

  ingredients.forEach((ing, index) => {
    if (ing.amount < 0) {
      errors.push(`Ingredient ${ing.name} (index ${index}) has negative amount`);
    }
    if (ing.costPerKg < 0) {
      errors.push(`Ingredient ${ing.name} (index ${index}) has negative cost`);
    }
    if (!ing.id) {
      errors.push(`Ingredient at index ${index} is missing ID`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format currency value for display
 */
export function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

/**
 * Format percentage value for display
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
