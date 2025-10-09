
// Mock ingredient attributes data - only numeric attributes suitable for comparison
export const mockIngredientAttributes = [
  {
    id: 'ATTR006',
    name: 'MAC (Maximum Allowable Concentration)',
    type: 'number' as const,
    description: 'Maximum allowable concentration percentage',
    category: 'Regulatory',
    isRequired: true,
    unit: '%',
    min: 0,
    max: 100
  },
  {
    id: 'ATTR011',
    name: 'Price',
    type: 'number' as const,
    description: 'Cost per unit',
    category: 'Commercial',
    isRequired: true,
    unit: '$/kg',
    min: 0
  },
  {
    id: 'ATTR016',
    name: 'Molecular Weight',
    type: 'number' as const,
    description: 'Molecular weight in g/mol',
    category: 'Chemical Properties',
    isRequired: false,
    unit: 'g/mol',
    min: 0
  },
  {
    id: 'ATTR017',
    name: 'Boiling Point',
    type: 'number' as const,
    description: 'Boiling point temperature',
    category: 'Physical Properties',
    isRequired: false,
    unit: '°C'
  },
  {
    id: 'ATTR018',
    name: 'Melting Point',
    type: 'number' as const,
    description: 'Melting point temperature',
    category: 'Physical Properties',
    isRequired: false,
    unit: '°C'
  },
  {
    id: 'ATTR019',
    name: 'Density',
    type: 'number' as const,
    description: 'Density at 20°C',
    category: 'Physical Properties',
    isRequired: false,
    unit: 'g/cm³',
    min: 0
  },
  {
    id: 'ATTR020',
    name: 'Refractive Index',
    type: 'number' as const,
    description: 'Refractive index at 20°C',
    category: 'Physical Properties',
    isRequired: false,
    min: 1.0,
    max: 2.0
  },
  {
    id: 'ATTR021',
    name: 'Flash Point',
    type: 'number' as const,
    description: 'Flash point temperature',
    category: 'Safety',
    isRequired: false,
    unit: '°C'
  },
  {
    id: 'ATTR025',
    name: 'Shelf Life',
    type: 'number' as const,
    description: 'Shelf life in months',
    category: 'Commercial',
    isRequired: false,
    unit: 'months',
    min: 1,
    max: 120
  },
  {
    id: 'ATTR026',
    name: 'Viscosity',
    type: 'number' as const,
    description: 'Dynamic viscosity at 20°C',
    category: 'Physical Properties',
    isRequired: false,
    unit: 'cP',
    min: 0
  },
  {
    id: 'ATTR027',
    name: 'pH Value',
    type: 'number' as const,
    description: 'pH value in aqueous solution',
    category: 'Chemical Properties',
    isRequired: false,
    min: 0,
    max: 14
  },
  {
    id: 'ATTR028',
    name: 'Solubility',
    type: 'number' as const,
    description: 'Water solubility at 20°C',
    category: 'Physical Properties',
    isRequired: false,
    unit: 'g/L',
    min: 0
  },
  {
    id: 'ATTR029',
    name: 'Vapor Pressure',
    type: 'number' as const,
    description: 'Vapor pressure at 20°C',
    category: 'Physical Properties',
    isRequired: false,
    unit: 'mmHg',
    min: 0
  },
  {
    id: 'ATTR030',
    name: 'Surface Tension',
    type: 'number' as const,
    description: 'Surface tension at 20°C',
    category: 'Physical Properties',
    isRequired: false,
    unit: 'mN/m',
    min: 0
  },
  {
    id: 'ATTR031',
    name: 'Thermal Conductivity',
    type: 'number' as const,
    description: 'Thermal conductivity coefficient',
    category: 'Physical Properties',
    isRequired: false,
    unit: 'W/m·K',
    min: 0
  },
  {
    id: 'ATTR032',
    name: 'Specific Heat',
    type: 'number' as const,
    description: 'Specific heat capacity',
    category: 'Physical Properties',
    isRequired: false,
    unit: 'J/g·K',
    min: 0
  },
  {
    id: 'ATTR033',
    name: 'Dielectric Constant',
    type: 'number' as const,
    description: 'Relative permittivity at 20°C',
    category: 'Physical Properties',
    isRequired: false,
    min: 1
  },
  {
    id: 'ATTR034',
    name: 'Concentration Limit',
    type: 'number' as const,
    description: 'Maximum recommended concentration',
    category: 'Regulatory',
    isRequired: false,
    unit: '%',
    min: 0,
    max: 100
  },
  {
    id: 'ATTR035',
    name: 'Purity',
    type: 'number' as const,
    description: 'Chemical purity percentage',
    category: 'Quality',
    isRequired: false,
    unit: '%',
    min: 0,
    max: 100
  }
];
