
// Lightweight types for Pega data structures
export interface Ingredient {
  id: string;
  name: string;
  code: string;
  price: number;
  unit: string;
  type: 'natural' | 'synthetic' | 'base';
  category: string;
  supplier: string;
  status: 'active' | 'inactive' | 'palette' | 'analytical' | 'sers_review';
  mac: number; // Maximum Allowable Concentration
  odorProfile?: string;
  volatility?: string;
  allergens?: string[];
  ifraCategory?: string;
  casNumber?: string;
  einecs?: string;
  fema?: string;
  description?: string;
}

// Formula types
export interface Formula {
  id: string;
  name: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  createdBy: string;
  lastUpdated: string;
  category: string;
  totalPercentage: number;
  ingredients: FormulaIngredient[];
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
  description: string;
}

export interface FormulaIngredient {
  ingredientId: string;
  name: string;
  percentage: number;
  type: string;
  notes?: string;
}

export interface IngredientAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  description: string;
  category: string;
  isRequired: boolean;
  values?: string[];
  unit?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  examples?: string[];
}

// Stubbed service functions that mirror DX API read/write and Data Page fetches
export class PegaService {
  // TODO: Implement actual DX API calls
  static async getIngredients(filters?: any): Promise<Ingredient[]> {
    // TODO: Replace with actual API call
    return mockIngredients;
  }

  static async getFormulas(filters?: any): Promise<Formula[]> {
    // TODO: Replace with actual API call
    const { mockFormulas } = await import('../mocks/formulas');
    return mockFormulas as any;
  }

  static async getIngredientAttributes(): Promise<IngredientAttribute[]> {
    // TODO: Replace with actual API call
    const { mockIngredientAttributes } = await import('../mocks/ingredientAttributes');
    return mockIngredientAttributes;
  }

  static async searchIngredients(query: string, type?: string): Promise<Ingredient[]> {
    // TODO: Replace with actual API call
    return mockIngredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(query.toLowerCase()) &&
      (!type || ingredient.type === type)
    );
  }

  static async searchFormulas(query: string, filters?: any): Promise<Formula[]> {
    // TODO: Replace with actual API call
    const { mockFormulas } = await import('../mocks/formulas');
    return mockFormulas.filter(formula =>
      formula.name.toLowerCase().includes(query.toLowerCase()) ||
      formula.description.toLowerCase().includes(query.toLowerCase())
    ) as any;
  }

  static async searchAttributes(query: string, filters?: any): Promise<IngredientAttribute[]> {
    // TODO: Replace with actual API call
    const { mockIngredientAttributes } = await import('../mocks/ingredientAttributes');
    return mockIngredientAttributes.filter(attribute =>
      attribute.name.toLowerCase().includes(query.toLowerCase()) ||
      attribute.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  static async createFormula(formula: Omit<Formula, 'id'>): Promise<Formula> {
    // TODO: Replace with actual API call
    return { ...formula, id: `formula-${Date.now()}` };
  }

  static async updateFormula(id: string, updates: Partial<Formula>): Promise<Formula> {
    // TODO: Replace with actual API call
    const { mockFormulas } = await import('../mocks/formulas');
    const existing = mockFormulas.find(f => f.id === id);
    return { ...existing!, ...updates } as any;
  }
}

// Mock data for development - expanded with more ingredients
const mockIngredients: Ingredient[] = [
  // Natural Essential Oils
  {
    id: 'INGR8007758',
    name: 'Bergamot Oil',
    code: 'INGR8007758',
    price: 23.40,
    unit: 'kg',
    type: 'natural',
    category: 'Essential Oils',
    supplier: 'Givaudan',
    status: 'active',
    mac: 0.4,
    odorProfile: 'Fresh, Citrus',
    volatility: 'Top Note',
    allergens: ['Limonene', 'Linalool'],
    ifraCategory: 'Category 4',
    casNumber: '8007-75-8',
    description: 'Fresh citrus oil extracted from bergamot peel'
  },
  {
    id: 'INGR8007761',
    name: 'Rose Otto',
    code: 'INGR8007761',
    price: 1250.00,
    unit: 'kg',
    type: 'natural',
    category: 'Essential Oils',
    supplier: 'Givaudan',
    status: 'active',
    mac: 0.2,
    odorProfile: 'Floral, Rose',
    volatility: 'Middle Note',
    allergens: ['Citronellol', 'Geraniol'],
    ifraCategory: 'Category 4',
    casNumber: '8007-01-0',
    description: 'Premium rose essential oil from Bulgarian roses'
  },
  {
    id: 'INGR8007764',
    name: 'Lavender Oil',
    code: 'INGR8007764',
    price: 45.60,
    unit: 'kg',
    type: 'natural',
    category: 'Essential Oils',
    supplier: 'IFF',
    status: 'active',
    mac: 0.5,
    odorProfile: 'Floral, Herbal',
    volatility: 'Middle Note',
    allergens: ['Linalool', 'Limonene'],
    ifraCategory: 'Category 4',
    casNumber: '8000-28-0',
    description: 'Calming lavender oil from French lavender fields'
  },
  {
    id: 'INGR8007765',
    name: 'Patchouli Oil',
    code: 'INGR8007765',
    price: 78.90,
    unit: 'kg',
    type: 'natural',
    category: 'Essential Oils',
    supplier: 'Firmenich',
    status: 'active',
    mac: 0.8,
    odorProfile: 'Woody, Earthy',
    volatility: 'Base Note',
    allergens: [],
    ifraCategory: 'Category 4',
    casNumber: '8014-09-3',
    description: 'Rich, earthy patchouli oil from Indonesia'
  },
  {
    id: 'INGR8007766',
    name: 'Eucalyptus Oil',
    code: 'INGR8007766',
    price: 32.50,
    unit: 'kg',
    type: 'natural',
    category: 'Essential Oils',
    supplier: 'Givaudan',
    status: 'active',
    mac: 0.3,
    odorProfile: 'Fresh, Medicinal',
    volatility: 'Top Note',
    allergens: ['Limonene'],
    ifraCategory: 'Category 4',
    casNumber: '8000-48-4',
    description: 'Refreshing eucalyptus oil with cooling properties'
  },
  {
    id: 'INGR8007767',
    name: 'Sandalwood Oil',
    code: 'INGR8007767',
    price: 890.00,
    unit: 'kg',
    type: 'natural',
    category: 'Essential Oils',
    supplier: 'IFF',
    status: 'active',
    mac: 0.6,
    odorProfile: 'Woody, Creamy',
    volatility: 'Base Note',
    allergens: [],
    ifraCategory: 'Category 4',
    casNumber: '8006-87-9',
    description: 'Premium sandalwood oil with creamy woody notes'
  },

  // Synthetic Aroma Chemicals
  {
    id: 'INGR8007759',
    name: 'Linalool',
    code: 'INGR8007759',
    price: 23.40,
    unit: 'kg',
    type: 'synthetic',
    category: 'Aroma Chemicals',
    supplier: 'Firmenich',
    status: 'active',
    mac: 0.8,
    odorProfile: 'Floral, Fresh',
    volatility: 'Middle Note',
    allergens: ['Linalool'],
    ifraCategory: 'Category 4',
    casNumber: '78-70-6',
    fema: '2635',
    description: 'Versatile floral aroma chemical with fresh notes'
  },
  {
    id: 'INGR8007762',
    name: 'Vanillin',
    code: 'INGR8007762',
    price: 45.80,
    unit: 'kg',
    type: 'synthetic',
    category: 'Aroma Chemicals',
    supplier: 'Firmenich',
    status: 'active',
    mac: 1.0,
    odorProfile: 'Sweet, Vanilla',
    volatility: 'Base Note',
    allergens: [],
    ifraCategory: 'Category 4',
    casNumber: '121-33-5',
    fema: '3107',
    description: 'Classic vanilla aroma chemical for sweet compositions'
  },
  {
    id: 'INGR8007768',
    name: 'Benzyl Acetate',
    code: 'INGR8007768',
    price: 34.20,
    unit: 'kg',
    type: 'synthetic',
    category: 'Aroma Chemicals',
    supplier: 'Givaudan',
    status: 'active',
    mac: 0.5,
    odorProfile: 'Floral, Fruity',
    volatility: 'Middle Note',
    allergens: ['Benzyl Acetate'],
    ifraCategory: 'Category 4',
    casNumber: '140-11-4',
    fema: '2135',
    description: 'Jasmine-like floral aroma chemical'
  },
  {
    id: 'INGR8007769',
    name: 'Hedione',
    code: 'INGR8007769',
    price: 67.30,
    unit: 'kg',
    type: 'synthetic',
    category: 'Aroma Chemicals',
    supplier: 'Firmenich',
    status: 'active',
    mac: 0.6,
    odorProfile: 'Floral, Jasmine',
    volatility: 'Middle Note',
    allergens: [],
    ifraCategory: 'Category 4',
    casNumber: '24851-98-7',
    description: 'Radiant jasmine aroma chemical with diffusive properties'
  },
  {
    id: 'INGR8007770',
    name: 'Iso E Super',
    code: 'INGR8007770',
    price: 89.50,
    unit: 'kg',
    type: 'synthetic',
    category: 'Aroma Chemicals',
    supplier: 'IFF',
    status: 'active',
    mac: 0.7,
    odorProfile: 'Woody, Amber',
    volatility: 'Base Note',
    allergens: [],
    ifraCategory: 'Category 4',
    casNumber: '54464-57-2',
    description: 'Modern woody amber molecule with skin-like qualities'
  },
  {
    id: 'INGR8007771',
    name: 'Ambroxan',
    code: 'INGR8007771',
    price: 125.00,
    unit: 'kg',
    type: 'synthetic',
    category: 'Aroma Chemicals',
    supplier: 'Givaudan',
    status: 'active',
    mac: 0.8,
    odorProfile: 'Amber, Marine',
    volatility: 'Base Note',
    allergens: [],
    ifraCategory: 'Category 4',
    casNumber: '6790-58-5',
    description: 'Clean amber molecule with marine facets'
  },

  // Base Materials
  {
    id: 'INGR8007760',
    name: 'Ethanol (95%)',
    code: 'INGR8007760',
    price: 23.40,
    unit: 'kg',
    type: 'base',
    category: 'Solvents',
    supplier: 'IFF',
    status: 'active',
    mac: -1, // No restriction
    odorProfile: 'Neutral',
    volatility: 'Top Note',
    allergens: [],
    casNumber: '64-17-5',
    description: 'High-grade ethanol for fragrance dilution'
  },
  {
    id: 'INGR8007763',
    name: 'Dipropylene Glycol',
    code: 'INGR8007763',
    price: 12.30,
    unit: 'kg',
    type: 'base',
    category: 'Solvents',
    supplier: 'IFF',
    status: 'active',
    mac: -1, // No restriction
    odorProfile: 'Neutral',
    volatility: 'Base Note',
    allergens: [],
    casNumber: '25265-71-8',
    description: 'Odorless solvent for fragrance applications'
  },
  {
    id: 'INGR8007772',
    name: 'Benzyl Benzoate',
    code: 'INGR8007772',
    price: 28.70,
    unit: 'kg',
    type: 'base',
    category: 'Solvents',
    supplier: 'Givaudan',
    status: 'active',
    mac: -1, // No restriction
    odorProfile: 'Mild, Sweet',
    volatility: 'Base Note',
    allergens: ['Benzyl Benzoate'],
    casNumber: '120-51-4',
    description: 'Mild solvent with fixative properties'
  },
  {
    id: 'INGR8007773',
    name: 'Triethyl Citrate',
    code: 'INGR8007773',
    price: 35.60,
    unit: 'kg',
    type: 'base',
    category: 'Solvents',
    supplier: 'Firmenich',
    status: 'active',
    mac: -1, // No restriction
    odorProfile: 'Neutral',
    volatility: 'Middle Note',
    allergens: [],
    casNumber: '77-93-0',
    description: 'Eco-friendly solvent alternative'
  },

  // Some inactive/analytical ingredients
  {
    id: 'INGR8007774',
    name: 'Oakmoss Absolute',
    code: 'INGR8007774',
    price: 450.00,
    unit: 'kg',
    type: 'natural',
    category: 'Essential Oils',
    supplier: 'Givaudan',
    status: 'sers_review',
    mac: 0.1,
    odorProfile: 'Woody, Earthy',
    volatility: 'Base Note',
    allergens: ['Atranol', 'Chloroatranol'],
    ifraCategory: 'Category 4',
    casNumber: '9000-50-4',
    description: 'Classic chypre ingredient under SERS review'
  },
  {
    id: 'INGR8007775',
    name: 'Methyl Anthranilate',
    code: 'INGR8007775',
    price: 67.80,
    unit: 'kg',
    type: 'synthetic',
    category: 'Aroma Chemicals',
    supplier: 'IFF',
    status: 'analytical',
    mac: 0.3,
    odorProfile: 'Fruity, Grape',
    volatility: 'Middle Note',
    allergens: [],
    casNumber: '134-20-3',
    fema: '2682',
    description: 'Grape-like aroma chemical for analytical use only'
  }
];

// Mock data for development
const mockFormulas: Formula[] = [
  {
    id: 'FORM001',
    name: 'Fresh Citrus Blend',
    version: '1.0',
    status: 'active',
    createdBy: 'John Doe',
    lastUpdated: '2024-01-15',
    category: '',
    totalPercentage: 0,
    ingredients: [
      { ingredientId: 'INGR8007758', name: '', percentage: 15.5, type: '' },
      { ingredientId: 'INGR8007759', name: '', percentage: 8.2, type: '' }
    ],
    notes: { top: [], middle: [], base: [] },
    description: ''
  }
];

const mockAttributes: IngredientAttribute[] = [
  {
    id: 'ATTR001',
    name: 'Odor Profile',
    type: 'select',
    description: '',
    category: '',
    isRequired: false,
    values: ['Fresh', 'Floral', 'Woody', 'Citrus', 'Spicy']
  },
  {
    id: 'ATTR002',
    name: 'Volatility',
    type: 'select',
    description: '',
    category: '',
    isRequired: false,
    values: ['Top Note', 'Middle Note', 'Base Note']
  }
];
