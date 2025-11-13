
import type { FilterGroup, FilterRule } from '../components/QueryBuilder';
import type { Ingredient } from '../services/pega';

export const evaluateQuery = (ingredient: Ingredient, query: FilterGroup): boolean => {
  if (!query.rules || query.rules.length === 0) {
    return true; // No filters means show all
  }

  const results = query.rules.map(rule => {
    if ('rules' in rule) {
      // This is a nested group
      return evaluateQuery(ingredient, rule);
    } else {
      // This is a rule
      return evaluateRule(ingredient, rule);
    }
  });

  // Apply combinator logic
  if (query.combinator === 'and') {
    return results.every(result => result);
  } else {
    return results.some(result => result);
  }
};

const evaluateRule = (ingredient: Ingredient, rule: FilterRule): boolean => {
  const fieldValue = ingredient[rule.field as keyof Ingredient];
  const { operator, value } = rule;

  // Handle null checks first
  if (operator === 'null') {
    return fieldValue === null || fieldValue === undefined || fieldValue === '';
  }

  if (operator === 'notNull') {
    return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
  }

  // If field value is null/undefined and we're not checking for null, return false
  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  const stringValue = String(fieldValue).toLowerCase();
  const searchValue = value.toLowerCase();

  switch (operator) {
    case '=':
      return stringValue === searchValue;
    case '!=':
      return stringValue !== searchValue;
    case 'contains':
      return stringValue.includes(searchValue);
    case 'beginsWith':
      return stringValue.startsWith(searchValue);
    case 'endsWith':
      return stringValue.endsWith(searchValue);
    case '>':
      return Number(fieldValue) > Number(value);
    case '<':
      return Number(fieldValue) < Number(value);
    case '>=':
      return Number(fieldValue) >= Number(value);
    case '<=':
      return Number(fieldValue) <= Number(value);
    default:
      return true;
  }
};
