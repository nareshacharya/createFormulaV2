/* eslint-disable @typescript-eslint/no-use-before-define */

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
  id: string;  // Universal formula ID (F00001v1) - not displayed on screen
  name: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  createdBy: string;
  lastUpdated: string;
  category: string;
  projectName?: string;
  projectId?: string;
  totalPercentage: number;
  costPerKg?: number;
  ingredients: FormulaIngredient[];
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
  description: string;

  // Formula type-specific fields
  formulaType?: 'BASE' | 'DILUTION' | 'ANALYTICAL' | 'PERFUMER';

  // Type-specific display IDs (shown on data grid)
  perfumerFormulaId?: string;  // e.g., MZ00001v1 (for PERFUMER type)
  baseFormulaId?: string;       // e.g., B00001v1 (for BASE type)
  dilutionFormulaId?: string;   // e.g., D00001v1 (for DILUTION type)
  analyticalFormulaId?: string; // e.g., A00001v1 (for ANALYTICAL type)

  // U-Code (generated when formula is locked)
  uCode?: string;  // e.g., UAD00001A

  // Extended fields from formula creation configuration
  region?: string;
  country?: string;
  sapPlmCode?: string;
  limsCode?: string;
  fragranceName?: string;
  sampleId?: string;
  fragranceDosageActual?: number;
  formulaVersion?: number;
  formulaInclusionLevel?: number;
  productFormat?: string;
  brand?: string;
  supplier?: string;
  claims?: string[];
  variant?: string;
  productionCode?: string;
  productionDate?: string;
  recommendedProductDosage?: number;
  unitOfRecommendedDosage?: string;
  ufiCode?: string;
  commentOnProduct?: string;
  briefCptTarget?: number;
  briefFragranceDosageTarget?: number;
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

// Project types
export interface Project {
  id: string;
  name: string;
  projectId: string;
  displayId: string;
  description: string;
  category: string;
  status: 'active' | 'in-progress' | 'planning' | 'archived';
  createdBy: string;
  createdDate: string;
  lastModified: string;
  lastModifiedBy: string;
  region: string;
  country: string;
  currencies: string[];
  defaultCurrency: string;
  numberOfFormulas: number;
  numberOfCategories: number;
  budget?: number;
  budgetCurrency?: string;
  startDate: string;
  endDate: string;
  manager: string;
  team: string[];
  tags: string[];
  notes?: string;
  progress: number; // 0-100 percentage
  priority: 'critical' | 'high' | 'medium' | 'low';
  visibility: 'public' | 'private';
  archived: boolean;
}

// Stubbed service functions that mirror DX API read/write and Data Page fetches
export class PegaService {
  /**
   * Get ingredients list with pagination support
   * @param filters Optional filters including pagination (skip, limit), search, status, type
   * @returns Array of ingredients
   */
  static async getIngredients(filters?: {
    skip?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
  }): Promise<Ingredient[]> {
    const { skip = 0, limit = 50, search, status, type } = filters || {};

    let results = [...mockIngredients];

    // Apply filters
    if (search) {
      const query = search.toLowerCase();
      results = results.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.code?.toLowerCase().includes(query)
      );
    }

    if (status) {
      results = results.filter((i) => i.status === status);
    }

    if (type) {
      results = results.filter((i) => i.type === type);
    }

    // Apply pagination
    return results.slice(skip, skip + limit);
  }

  /**
   * Get detailed ingredient information
   * @param ingredientId The ingredient ID to fetch details for
   * @param version Optional version parameter (for future versioning)
   * @returns Detailed ingredient information
   */
  static async getIngredientDetails(
    ingredientId: string,
    _version?: string
  ): Promise<Ingredient | null> {
    const ingredient = mockIngredients.find((i) => i.id === ingredientId);
    if (!ingredient) return null;

    // In a real implementation, this would fetch enriched data from Pega
    // including compliance, safety, supplier, and composition details
    return ingredient;
  }

  /**
   * Get formulas list with pagination support
   * @param filters Optional filters including pagination (skip, limit), search, status, projectId
   * @returns Array of formulas
   */
  static async getFormulas(filters?: {
    skip?: number;
    limit?: number;
    search?: string;
    status?: string;
    projectId?: string;
  }): Promise<Formula[]> {
    const { skip = 0, limit = 50, search, status, projectId } = filters || {};
    const { mockFormulas } = await import('../mocks/formulas');

    let results = [...(mockFormulas as unknown as Formula[])];

    // Apply filters
    if (search) {
      const query = search.toLowerCase();
      results = results.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.id.toLowerCase().includes(query)
      );
    }

    if (status) {
      results = results.filter((f) => f.status === status);
    }

    if (projectId) {
      results = results.filter((f) => f.projectId === projectId);
    }

    // Apply pagination
    return results.slice(skip, skip + limit);
  }

  /**
   * Get detailed formula information
   * @param formulaId The formula ID to fetch details for
   * @param version Optional version parameter (for future versioning)
   * @returns Detailed formula information
   */
  static async getFormulaDetails(
    formulaId: string,
    _version?: string
  ): Promise<Formula | null> {
    const { mockFormulas } = await import('../mocks/formulas');
    const formula = (mockFormulas as unknown as Formula[]).find(
      (f) => f.id === formulaId
    );
    if (!formula) return null;

    // In a real implementation, this would fetch enriched data from Pega
    // including compliance information and audit history
    return formula;
  }

  /**
   * Get ingredient attributes list
   * @returns Array of all ingredient attributes
   */
  static async getIngredientAttributes(): Promise<IngredientAttribute[]> {
    const { mockIngredientAttributes } = await import(
      '../mocks/ingredientAttributes'
    );
    return mockIngredientAttributes;
  }

  static async searchIngredients(query: string, type?: string): Promise<Ingredient[]> {
    // TODO: Replace with actual API call
    return mockIngredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(query.toLowerCase()) &&
      (!type || ingredient.type === type)
    );
  }

  static async searchFormulas(query: string, _filters?: Record<string, unknown>): Promise<Formula[]> {
    // TODO: Replace with actual API call
    const { mockFormulas } = await import('../mocks/formulas');
    return (mockFormulas as Formula[]).filter(formula =>
      formula.name.toLowerCase().includes(query.toLowerCase()) ||
      formula.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  static async searchAttributes(query: string, _filters?: Record<string, unknown>): Promise<IngredientAttribute[]> {
    // TODO: Replace with actual API call
    const { mockIngredientAttributes } = await import('../mocks/ingredientAttributes');
    return mockIngredientAttributes.filter(attribute =>
      attribute.name.toLowerCase().includes(query.toLowerCase()) ||
      attribute.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Project-related methods
  static async getProjects(_filters?: Record<string, unknown>): Promise<Project[]> {
    // TODO: Replace with actual API call
    const { mockProjects } = await import('../mocks/projects');
    return mockProjects as Project[];
  }

  static async getProject(id: string): Promise<Project | null> {
    // TODO: Replace with actual API call
    const { mockProjects } = await import('../mocks/projects');
    return (mockProjects as Project[]).find(p => p.id === id || p.projectId === id) || null;
  }

  static async searchProjects(query: string, _filters?: Record<string, unknown>): Promise<Project[]> {
    // TODO: Replace with actual API call
    const { mockProjects } = await import('../mocks/projects');
    return (mockProjects as Project[]).filter(project =>
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      project.description.toLowerCase().includes(query.toLowerCase()) ||
      project.displayId.toLowerCase().includes(query.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  static async getProjectsByManager(manager: string): Promise<Project[]> {
    // TODO: Replace with actual API call
    const { mockProjects } = await import('../mocks/projects');
    return (mockProjects as Project[]).filter(p => p.manager === manager || p.team.includes(manager));
  }

  static async getProjectsByRegion(region: string): Promise<Project[]> {
    // TODO: Replace with actual API call
    const { mockProjects } = await import('../mocks/projects');
    return (mockProjects as Project[]).filter(p => p.region === region);
  }

  static async getProjectsByStatus(status: string): Promise<Project[]> {
    // TODO: Replace with actual API call
    const { mockProjects } = await import('../mocks/projects');
    return (mockProjects as Project[]).filter(p => p.status === status);
  }

  static async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    // TODO: Replace with actual API call
    return {
      ...project,
      id: `PROJ-${Date.now()}`,
    } as Project;
  }

  static async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    // TODO: Replace with actual API call
    const { mockProjects } = await import('../mocks/projects');
    const existing = (mockProjects as Project[]).find(p => p.id === id || p.projectId === id);
    if (!existing) {
      throw new Error(`Project ${id} not found`);
    }
    return { ...existing, ...updates };
  }

  static async deleteProject(_id: string): Promise<boolean> {
    // TODO: Replace with actual API call
    return true;
  }

  static async createFormula(formula: Omit<Formula, 'id'>): Promise<Formula> {
    // TODO: Replace with actual API call
    return { ...formula, id: `formula-${Date.now()}` };
  }

  static async updateFormula(id: string, updates: Partial<Formula>): Promise<Formula> {
    // TODO: Replace with actual API call
    const { mockFormulas } = await import('../mocks/formulas');
    const existing = (mockFormulas as Formula[]).find(f => f.id === id);
    if (!existing) {
      throw new Error(`Formula ${id} not found`);
    }
    return { ...existing, ...updates };
  }

  // ============================================================================
  // FORMULA CREATION METHODS (User Story: US #1108, US #1137)
  // ============================================================================

  /**
   * Create formula from payload (D_CreateFormula)
   * Returns response in DX API format (CreateFormulaResponse)
   */
  static async createFormulaFromPayload(payload: any): Promise<any> {
    const formulaId = `F${String(Date.now()).slice(-6)}`;
    const createdDate = new Date().toISOString();

    // Return in DX API response format
    return {
      success: true,
      data: {
        FormulaID: formulaId,
        FragranceName: payload.data.FragranceName,
        SampleID: payload.data.SampleID,
        FormulaType: payload.data.FormulaType?.toUpperCase(),
        FormulaStatus: 'DRAFT',
        CreatedDate: createdDate,
        CreatedByUserID: payload.data.CreatedByUserID || 'System',
        ...(payload.data.FormulaType?.toUpperCase() === 'PERFUMER' && {
          PerfumerFormulaID: `PERF${String(Date.now()).slice(-6)}`
        }),
        ...(payload.data.FormulaType?.toUpperCase() === 'ANALYTICAL' && {
          AnalyticalFormulaID: `AN${String(Date.now()).slice(-6)}`
        })
      }
    };
  }

  /**
   * Create formula version (D_CreateFormulaVersion)
   */
  static async createFormulaVersion(payload: any): Promise<{ versionNumber: string; formulaId: string }> {
    return {
      versionNumber: payload.data.VersionNumber,
      formulaId: payload.data.FormulaID,
    };
  }

  /**
   * Create analytical formula (D_CreateAnalyticalFormula)
   * User Story: US #1137
   */
  static async createAnalyticalFormula(payload: any): Promise<{ formulaId: string; analyticalFormulaId: string; sampleId: string }> {
    const formulaId = `A${String(Date.now()).slice(-6)}`;
    const analyticalId = `AN${String(Date.now()).slice(-6)}`;

    return {
      formulaId,
      analyticalFormulaId: analyticalId,
      sampleId: payload.data.SampleID,
    };
  }

  /**
   * Check if Sample ID is available (D_CheckSampleIDExists)
   * Returns true if available, false if duplicate
   */
  static async checkDuplicateSampleId(sampleId: string): Promise<boolean> {
    // Mock implementation: always return true (available)
    // In production, this would query existing formulas
    const { mockFormulas } = await import('../mocks/formulas');

    const exists = (mockFormulas as Formula[]).some(f =>
      f.sampleId?.toLowerCase() === sampleId.toLowerCase()
    );

    return !exists; // Return availability (true = available, false = duplicate)
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

// Mock data for development - removed unused _mockFormulas and _mockAttributes

/* Removed unused mock data:
const _mockFormulas: Formula[] = [...];
const _mockAttributes: IngredientAttribute[] = [...];
*/
