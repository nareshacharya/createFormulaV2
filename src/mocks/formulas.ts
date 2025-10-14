
// Mock formulas data for development
// Format: [USER_INITIALS]-F-[SEQUENTIAL_NUMBER]v[VERSION]
// Example: NP-F-00001v1 (Naresh Pentapati, Formula, #1, version 1)

export const mockFormulas = [
  {
    id: 'NP-F-00001v1',
    name: 'Fresh Citrus Blend',
    version: 'v1',
    status: 'active',
    createdBy: 'Naresh Pentapati',
    lastUpdated: '2024-10-14',
    category: 'Eau de Toilette',
    projectName: 'Summer Collection 2024',
    projectId: 'PROJ-001',
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
    id: 'NP-F-00002v1',
    name: 'Romantic Rose Garden',
    version: 'v1',
    status: 'active',
    createdBy: 'Naresh Pentapati',
    lastUpdated: '2024-10-13',
    category: 'Eau de Parfum',
    projectName: 'Floral Romance Line',
    projectId: 'PROJ-002',
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
    id: 'NP-F-00003v1',
    name: 'Woody Amber Signature',
    version: 'v1',
    status: 'draft',
    createdBy: 'Naresh Pentapati',
    lastUpdated: '2024-10-12',
    category: 'Eau de Parfum',
    projectName: 'Premium Signature Series',
    projectId: 'PROJ-003',
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
    id: 'NP-F-00004v1',
    name: 'Lavender Dreams',
    version: 'v1',
    status: 'active',
    createdBy: 'Naresh Pentapati',
    lastUpdated: '2024-10-11',
    category: 'Eau de Cologne',
    projectName: 'Wellness Collection',
    projectId: 'PROJ-004',
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
    id: 'SJ-F-00001v1',
    name: 'Vanilla Gourmand',
    version: 'v1',
    status: 'active',
    createdBy: 'Sarah Johnson',
    lastUpdated: '2024-10-10',
    category: 'Eau de Parfum',
    projectName: 'Sweet Indulgence',
    projectId: 'PROJ-005',
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
    id: 'MC-F-00001v1',
    name: 'Ocean Breeze',
    version: 'v1',
    status: 'archived',
    createdBy: 'Michael Chen',
    lastUpdated: '2024-10-08',
    category: 'Eau de Toilette',
    projectName: 'Aquatic Adventure',
    projectId: 'PROJ-006',
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
    id: 'ER-F-00001v1',
    name: 'Spiced Patchouli',
    version: 'v1',
    status: 'draft',
    createdBy: 'Emma Rodriguez',
    lastUpdated: '2024-10-07',
    category: 'Eau de Parfum',
    projectName: 'Eastern Spice Collection',
    projectId: 'PROJ-007',
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
    id: 'DK-F-00001v1',
    name: 'Clean Cotton',
    version: 'v1',
    status: 'active',
    createdBy: 'David Kim',
    lastUpdated: '2024-10-06',
    category: 'Eau de Toilette',
    projectName: 'Fresh Laundry Line',
    projectId: 'PROJ-008',
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
    id: 'NP-F-00001v1',
    name: 'Fresh Citrus Blend',
    version: 'v1',
    status: 'active' as const,
    createdBy: 'Naresh Pentapati',
    lastUpdated: '2024-10-14',
    category: 'Eau de Toilette',
    projectName: 'Summer Collection 2024',
    projectId: 'PROJ-001',
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
    id: 'NP-F-00002v1',
    name: 'Romantic Rose Garden',
    version: 'v1',
    status: 'active' as const,
    createdBy: 'Naresh Pentapati',
    lastUpdated: '2024-10-13',
    category: 'Eau de Parfum',
    projectName: 'Floral Romance Line',
    projectId: 'PROJ-002',
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
    id: 'NP-F-00003v1',
    name: 'Woody Amber Signature',
    version: 'v1',
    status: 'draft' as const,
    createdBy: 'Naresh Pentapati',
    lastUpdated: '2024-10-12',
    category: 'Eau de Parfum',
    projectName: 'Premium Signature Series',
    projectId: 'PROJ-003',
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
    id: 'NP-F-00004v1',
    name: 'Lavender Dreams',
    version: 'v1',
    status: 'active' as const,
    createdBy: 'Naresh Pentapati',
    lastUpdated: '2024-10-11',
    category: 'Eau de Cologne',
    projectName: 'Wellness Collection',
    projectId: 'PROJ-004',
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
    id: 'SJ-F-00001v1',
    name: 'Vanilla Gourmand',
    version: 'v1',
    status: 'active' as const,
    createdBy: 'Sarah Johnson',
    lastUpdated: '2024-10-10',
    category: 'Eau de Parfum',
    projectName: 'Sweet Indulgence',
    projectId: 'PROJ-005',
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
    id: 'MC-F-00001v1',
    name: 'Ocean Breeze',
    version: 'v1',
    status: 'archived' as const,
    createdBy: 'Michael Chen',
    lastUpdated: '2024-10-08',
    category: 'Eau de Toilette',
    projectName: 'Aquatic Adventure',
    projectId: 'PROJ-006',
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
    id: 'ER-F-00001v1',
    name: 'Spiced Patchouli',
    version: 'v1',
    status: 'draft' as const,
    createdBy: 'Emma Rodriguez',
    lastUpdated: '2024-10-07',
    category: 'Eau de Parfum',
    projectName: 'Eastern Spice Collection',
    projectId: 'PROJ-007',
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
    id: 'DK-F-00001v1',
    name: 'Clean Cotton',
    version: 'v1',
    status: 'active' as const,
    createdBy: 'David Kim',
    lastUpdated: '2024-10-06',
    category: 'Eau de Toilette',
    projectName: 'Fresh Laundry Line',
    projectId: 'PROJ-008',
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

