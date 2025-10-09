
// Mock formulas data for development
export const mockFormulas = [
  {
    id: 'FORM001',
    name: 'Fresh Citrus Blend',
    version: '1.2',
    status: 'active',
    createdBy: 'Sarah Johnson',
    lastUpdated: '2024-01-15',
    category: 'Eau de Toilette',
    totalPercentage: 100,
    costPerKg: 125.50,
    description: 'A refreshing citrus fragrance perfect for summer wear',
    ingredients: [
      { ingredientId: 'INGR8007758', name: 'Bergamot Oil', percentage: 15.5, type: 'natural' },
      { ingredientId: 'INGR8007759', name: 'Linalool', percentage: 8.2, type: 'synthetic' },
      { ingredientId: 'INGR8007760', name: 'Ethanol (95%)', percentage: 70.0, type: 'base' },
      { ingredientId: 'INGR8007763', name: 'Dipropylene Glycol', percentage: 6.3, type: 'base' }
    ],
    notes: {
      top: ['Bergamot', 'Lemon'],
      middle: ['Lavender', 'Geranium'],
      base: ['Sandalwood', 'Musk']
    }
  },
  {
    id: 'FORM002',
    name: 'Romantic Rose Garden',
    version: '2.1',
    status: 'active',
    createdBy: 'Michael Chen',
    lastUpdated: '2024-01-12',
    category: 'Eau de Parfum',
    totalPercentage: 100,
    costPerKg: 245.75,
    description: 'An elegant floral composition centered around precious rose otto',
    ingredients: [
      { ingredientId: 'INGR8007761', name: 'Rose Otto', percentage: 12.0, type: 'natural' },
      { ingredientId: 'INGR8007769', name: 'Hedione', percentage: 6.5, type: 'synthetic' },
      { ingredientId: 'INGR8007768', name: 'Benzyl Acetate', percentage: 4.2, type: 'synthetic' },
      { ingredientId: 'INGR8007760', name: 'Ethanol (95%)', percentage: 65.0, type: 'base' },
      { ingredientId: 'INGR8007772', name: 'Benzyl Benzoate', percentage: 12.3, type: 'base' }
    ],
    notes: {
      top: ['Pink Pepper', 'Bergamot'],
      middle: ['Rose', 'Jasmine', 'Peony'],
      base: ['Sandalwood', 'White Musk']
    }
  },
  {
    id: 'FORM003',
    name: 'Woody Amber Signature',
    version: '1.0',
    status: 'draft',
    createdBy: 'Emma Rodriguez',
    lastUpdated: '2024-01-10',
    category: 'Eau de Parfum',
    totalPercentage: 100,
    costPerKg: 189.25,
    description: 'A modern woody amber fragrance with skin-like qualities',
    ingredients: [
      { ingredientId: 'INGR8007770', name: 'Iso E Super', percentage: 18.5, type: 'synthetic' },
      { ingredientId: 'INGR8007771', name: 'Ambroxan', percentage: 12.0, type: 'synthetic' },
      { ingredientId: 'INGR8007767', name: 'Sandalwood Oil', percentage: 8.5, type: 'natural' },
      { ingredientId: 'INGR8007765', name: 'Patchouli Oil', percentage: 5.2, type: 'natural' },
      { ingredientId: 'INGR8007760', name: 'Ethanol (95%)', percentage: 50.0, type: 'base' },
      { ingredientId: 'INGR8007773', name: 'Triethyl Citrate', percentage: 5.8, type: 'base' }
    ],
    notes: {
      top: ['Pink Pepper', 'Cardamom'],
      middle: ['Iris', 'Violet'],
      base: ['Sandalwood', 'Amber', 'Musk']
    }
  },
  {
    id: 'FORM004',
    name: 'Lavender Dreams',
    version: '1.5',
    status: 'active',
    createdBy: 'David Kim',
    lastUpdated: '2024-01-08',
    category: 'Eau de Cologne',
    totalPercentage: 100,
    costPerKg: 95.80,
    description: 'A calming lavender-based fragrance with aromatic herbs',
    ingredients: [
      { ingredientId: 'INGR8007764', name: 'Lavender Oil', percentage: 20.0, type: 'natural' },
      { ingredientId: 'INGR8007759', name: 'Linalool', percentage: 10.5, type: 'synthetic' },
      { ingredientId: 'INGR8007758', name: 'Bergamot Oil', percentage: 8.0, type: 'natural' },
      { ingredientId: 'INGR8007760', name: 'Ethanol (95%)', percentage: 58.0, type: 'base' },
      { ingredientId: 'INGR8007763', name: 'Dipropylene Glycol', percentage: 3.5, type: 'base' }
    ],
    notes: {
      top: ['Lavender', 'Bergamot', 'Lemon'],
      middle: ['Geranium', 'Rosemary'],
      base: ['Sandalwood', 'Musk']
    }
  },
  {
    id: 'FORM005',
    name: 'Vanilla Gourmand',
    version: '2.0',
    status: 'active',
    createdBy: 'Lisa Thompson',
    lastUpdated: '2024-01-05',
    category: 'Eau de Parfum',
    totalPercentage: 100,
    costPerKg: 167.40,
    description: 'A sweet gourmand fragrance with rich vanilla and warm woods',
    ingredients: [
      { ingredientId: 'INGR8007762', name: 'Vanillin', percentage: 15.0, type: 'synthetic' },
      { ingredientId: 'INGR8007768', name: 'Benzyl Acetate', percentage: 8.5, type: 'synthetic' },
      { ingredientId: 'INGR8007767', name: 'Sandalwood Oil', percentage: 6.0, type: 'natural' },
      { ingredientId: 'INGR8007760', name: 'Ethanol (95%)', percentage: 62.0, type: 'base' },
      { ingredientId: 'INGR8007772', name: 'Benzyl Benzoate', percentage: 8.5, type: 'base' }
    ],
    notes: {
      top: ['Mandarin', 'Pink Pepper'],
      middle: ['Jasmine', 'Orange Blossom'],
      base: ['Vanilla', 'Sandalwood', 'Tonka Bean']
    }
  },
  {
    id: 'FORM006',
    name: 'Ocean Breeze',
    version: '1.3',
    status: 'archived',
    createdBy: 'Alex Martinez',
    lastUpdated: '2023-12-20',
    category: 'Eau de Toilette',
    totalPercentage: 100,
    costPerKg: 112.30,
    description: 'A fresh marine fragrance evoking ocean waves and sea breeze',
    ingredients: [
      { ingredientId: 'INGR8007771', name: 'Ambroxan', percentage: 14.0, type: 'synthetic' },
      { ingredientId: 'INGR8007766', name: 'Eucalyptus Oil', percentage: 6.5, type: 'natural' },
      { ingredientId: 'INGR8007758', name: 'Bergamot Oil', percentage: 12.0, type: 'natural' },
      { ingredientId: 'INGR8007760', name: 'Ethanol (95%)', percentage: 64.0, type: 'base' },
      { ingredientId: 'INGR8007773', name: 'Triethyl Citrate', percentage: 3.5, type: 'base' }
    ],
    notes: {
      top: ['Sea Salt', 'Bergamot', 'Eucalyptus'],
      middle: ['Marine Accord', 'Jasmine'],
      base: ['Ambroxan', 'Driftwood', 'Musk']
    }
  },
  {
    id: 'FORM007',
    name: 'Spiced Patchouli',
    version: '1.1',
    status: 'draft',
    createdBy: 'Rachel Green',
    lastUpdated: '2024-01-03',
    category: 'Eau de Parfum',
    totalPercentage: 100,
    costPerKg: 198.65,
    description: 'A rich, earthy fragrance with warm spices and deep patchouli',
    ingredients: [
      { ingredientId: 'INGR8007765', name: 'Patchouli Oil', percentage: 16.0, type: 'natural' },
      { ingredientId: 'INGR8007770', name: 'Iso E Super', percentage: 10.5, type: 'synthetic' },
      { ingredientId: 'INGR8007762', name: 'Vanillin', percentage: 5.0, type: 'synthetic' },
      { ingredientId: 'INGR8007760', name: 'Ethanol (95%)', percentage: 60.0, type: 'base' },
      { ingredientId: 'INGR8007772', name: 'Benzyl Benzoate', percentage: 8.5, type: 'base' }
    ],
    notes: {
      top: ['Black Pepper', 'Cardamom'],
      middle: ['Patchouli', 'Rose', 'Geranium'],
      base: ['Vanilla', 'Sandalwood', 'Amber']
    }
  },
  {
    id: 'FORM008',
    name: 'Clean Cotton',
    version: '1.0',
    status: 'active',
    createdBy: 'James Wilson',
    lastUpdated: '2024-01-01',
    category: 'Eau de Toilette',
    totalPercentage: 100,
    costPerKg: 87.90,
    description: 'A fresh, clean fragrance reminiscent of freshly laundered cotton',
    ingredients: [
      { ingredientId: 'INGR8007759', name: 'Linalool', percentage: 18.0, type: 'synthetic' },
      { ingredientId: 'INGR8007764', name: 'Lavender Oil', percentage: 8.5, type: 'natural' },
      { ingredientId: 'INGR8007771', name: 'Ambroxan', percentage: 6.0, type: 'synthetic' },
      { ingredientId: 'INGR8007760', name: 'Ethanol (95%)', percentage: 64.0, type: 'base' },
      { ingredientId: 'INGR8007763', name: 'Dipropylene Glycol', percentage: 3.5, type: 'base' }
    ],
    notes: {
      top: ['Aldehydes', 'Lemon', 'Bergamot'],
      middle: ['Lavender', 'Lily of the Valley', 'Freesia'],
      base: ['White Musk', 'Sandalwood', 'Amber']
    }
  }
];

export const formulas = [
  {
    id: 'FORM001',
    name: 'Fresh Citrus Blend',
    version: '1.2',
    status: 'active' as const,
    createdBy: 'Sarah Johnson',
    lastUpdated: '2024-01-15',
    category: 'Eau de Toilette',
    totalPercentage: 100,
    costPerKg: 125.50,
    description: 'A vibrant and energizing citrus fragrance with bergamot and lemon top notes',
    ingredients: [
      { ingredientId: 'ING001', name: 'Bergamot Essential Oil', percentage: 15, type: 'natural' },
      { ingredientId: 'ING002', name: 'Lemon Essential Oil', percentage: 10, type: 'natural' },
      { ingredientId: 'ING003', name: 'Limonene', percentage: 8, type: 'synthetic' },
      { ingredientId: 'ING004', name: 'Ethanol', percentage: 67, type: 'base' }
    ],
    notes: {
      top: ['Bergamot', 'Lemon', 'Grapefruit'],
      middle: ['Neroli', 'Petitgrain'],
      base: ['White Musk', 'Cedar']
    }
  },
  {
    id: 'FORM002',
    name: 'Romantic Rose Garden',
    version: '2.0',
    status: 'active' as const,
    createdBy: 'Michael Chen',
    lastUpdated: '2024-01-12',
    category: 'Eau de Parfum',
    totalPercentage: 100,
    costPerKg: 245.75,
    description: 'An elegant floral composition centered around Bulgarian rose and peony',
    ingredients: [
      { ingredientId: 'ING005', name: 'Bulgarian Rose Otto', percentage: 12, type: 'natural' },
      { ingredientId: 'ING006', name: 'Peony Accord', percentage: 8, type: 'synthetic' },
      { ingredientId: 'ING007', name: 'Geraniol', percentage: 6, type: 'synthetic' },
      { ingredientId: 'ING008', name: 'Dipropylene Glycol', percentage: 74, type: 'base' }
    ],
    notes: {
      top: ['Pink Pepper', 'Mandarin'],
      middle: ['Bulgarian Rose', 'Peony', 'Jasmine'],
      base: ['Sandalwood', 'Musk', 'Amber']
    }
  },
  {
    id: 'FORM003',
    name: 'Woody Amber Signature',
    version: '1.0',
    status: 'draft' as const,
    createdBy: 'Emma Rodriguez',
    lastUpdated: '2024-01-10',
    category: 'Eau de Parfum',
    totalPercentage: 95,
    costPerKg: 189.25,
    description: 'A sophisticated woody amber fragrance with oud and sandalwood',
    ingredients: [
      { ingredientId: 'ING009', name: 'Oud Accord', percentage: 10, type: 'synthetic' },
      { ingredientId: 'ING010', name: 'Sandalwood Essential Oil', percentage: 15, type: 'natural' },
      { ingredientId: 'ING011', name: 'Amber Base', percentage: 12, type: 'base' },
      { ingredientId: 'ING012', name: 'Ethanol', percentage: 58, type: 'base' }
    ],
    notes: {
      top: ['Saffron', 'Cardamom'],
      middle: ['Rose', 'Oud'],
      base: ['Sandalwood', 'Amber', 'Vanilla']
    }
  },
  {
    id: 'FORM004',
    name: 'Lavender Dreams',
    version: '1.5',
    status: 'active' as const,
    createdBy: 'David Kim',
    lastUpdated: '2024-01-08',
    category: 'Eau de Cologne',
    totalPercentage: 100,
    costPerKg: 95.80,
    description: 'A calming lavender-based fragrance with herbal undertones',
    ingredients: [
      { ingredientId: 'ING013', name: 'Lavender Essential Oil', percentage: 20, type: 'natural' },
      { ingredientId: 'ING014', name: 'Linalool', percentage: 8, type: 'synthetic' },
      { ingredientId: 'ING015', name: 'Bergamot Essential Oil', percentage: 5, type: 'natural' },
      { ingredientId: 'ING016', name: 'Ethanol', percentage: 67, type: 'base' }
    ],
    notes: {
      top: ['Lavender', 'Bergamot'],
      middle: ['Rosemary', 'Thyme'],
      base: ['Cedarwood', 'Musk']
    }
  },
  {
    id: 'FORM005',
    name: 'Vanilla Gourmand',
    version: '1.8',
    status: 'active' as const,
    createdBy: 'Lisa Park',
    lastUpdated: '2024-01-05',
    category: 'Eau de Parfum',
    totalPercentage: 100,
    costPerKg: 167.40,
    description: 'A sweet gourmand fragrance with vanilla and caramel notes',
    ingredients: [
      { ingredientId: 'ING017', name: 'Vanilla Extract', percentage: 18, type: 'natural' },
      { ingredientId: 'ING018', name: 'Ethyl Maltol', percentage: 6, type: 'synthetic' },
      { ingredientId: 'ING019', name: 'Caramel Accord', percentage: 8, type: 'synthetic' },
      { ingredientId: 'ING020', name: 'Dipropylene Glycol', percentage: 68, type: 'base' }
    ],
    notes: {
      top: ['Sweet Orange', 'Cinnamon'],
      middle: ['Vanilla', 'Caramel', 'Tonka Bean'],
      base: ['Sandalwood', 'Musk', 'Amber']
    }
  },
  {
    id: 'FORM006',
    name: 'Ocean Breeze',
    version: '2.1',
    status: 'archived' as const,
    createdBy: 'James Wilson',
    lastUpdated: '2023-12-20',
    category: 'Eau de Toilette',
    totalPercentage: 100,
    costPerKg: 112.30,
    description: 'A fresh aquatic fragrance reminiscent of ocean waves',
    ingredients: [
      { ingredientId: 'ING021', name: 'Calone', percentage: 12, type: 'synthetic' },
      { ingredientId: 'ING022', name: 'Sea Salt Accord', percentage: 8, type: 'synthetic' },
      { ingredientId: 'ING023', name: 'Ambergris Accord', percentage: 6, type: 'synthetic' },
      { ingredientId: 'ING024', name: 'Ethanol', percentage: 74, type: 'base' }
    ],
    notes: {
      top: ['Sea Breeze', 'Lemon', 'Mint'],
      middle: ['Sea Salt', 'Jasmine'],
      base: ['Ambergris', 'Driftwood', 'Musk']
    }
  },
  {
    id: 'FORM007',
    name: 'Spiced Patchouli',
    version: '1.3',
    status: 'draft' as const,
    createdBy: 'Anna Thompson',
    lastUpdated: '2024-01-03',
    category: 'Eau de Parfum',
    totalPercentage: 92,
    costPerKg: 198.65,
    description: 'An earthy patchouli fragrance with warm spices',
    ingredients: [
      { ingredientId: 'ING025', name: 'Patchouli Essential Oil', percentage: 16, type: 'natural' },
      { ingredientId: 'ING026', name: 'Black Pepper Essential Oil', percentage: 4, type: 'natural' },
      { ingredientId: 'ING027', name: 'Cinnamon Bark Oil', percentage: 3, type: 'natural' },
      { ingredientId: 'ING028', name: 'Dipropylene Glycol', percentage: 69, type: 'base' }
    ],
    notes: {
      top: ['Black Pepper', 'Cardamom'],
      middle: ['Patchouli', 'Rose', 'Cinnamon'],
      base: ['Sandalwood', 'Vanilla', 'Musk']
    }
  },
  {
    id: 'FORM008',
    name: 'Clean Cotton',
    version: '1.1',
    status: 'active' as const,
    createdBy: 'Robert Lee',
    lastUpdated: '2024-01-01',
    category: 'Eau de Toilette',
    totalPercentage: 100,
    costPerKg: 87.90,
    description: 'A fresh, clean fragrance inspired by freshly laundered cotton',
    ingredients: [
      { ingredientId: 'ING029', name: 'White Musk', percentage: 14, type: 'synthetic' },
      { ingredientId: 'ING030', name: 'Lily of the Valley', percentage: 8, type: 'synthetic' },
      { ingredientId: 'ING031', name: 'Aldehydes', percentage: 6, type: 'synthetic' },
      { ingredientId: 'ING032', name: 'Ethanol', percentage: 72, type: 'base' }
    ],
    notes: {
      top: ['Aldehydes', 'Lemon', 'Green Leaves'],
      middle: ['Lily of the Valley', 'Jasmine', 'Rose'],
      base: ['White Musk', 'Cedar', 'Sandalwood']
    }
  }
];
