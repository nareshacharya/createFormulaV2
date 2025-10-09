# Pega Formulation App

A modern React-based fragrance formulation management system designed for perfumers and fragrance developers. This application provides comprehensive tools for managing ingredients, creating formulas, and analyzing fragrance compositions.

## 🌟 Features

### Core Functionality
- **Ingredient Library Management**: Browse and search through a comprehensive database of fragrance ingredients
- **Formula Creation & Management**: Create, edit, and manage fragrance formulas with detailed composition tracking
- **Advanced Filtering & Search**: Powerful query builder with multi-criteria filtering capabilities
- **Real-time Cost Calculation**: Automatic cost analysis and percentage calculations for formulas
- **Interactive Data Grids**: Professional data tables with sorting, filtering, and selection capabilities

### Ingredient Management
- **Comprehensive Ingredient Data**: Track essential oils, aroma chemicals, and base materials
- **Regulatory Compliance**: IFRA categories, allergen tracking, and MAC (Maximum Allowable Concentration) limits
- **Supplier Information**: Manage supplier data and pricing information  
- **Status Tracking**: Active, inactive, analytical, and SERS review status management
- **Chemical Properties**: CAS numbers, EINECS, FEMA codes, and detailed descriptions

### Formula Development
- **Multi-Formula Support**: Manage multiple formulas simultaneously with version control
- **Note Classification**: Organize ingredients by fragrance notes (top, middle, base)
- **Percentage Composition**: Real-time percentage calculations and total validation
- **Cost Analysis**: Raw material cost (RMC) calculations and cost per kilogram tracking
- **Formula Status Management**: Draft, active, and archived status workflows

### User Interface
- **Modern Design**: Clean, professional interface built with Tailwind CSS
- **Responsive Layout**: Optimized for desktop and tablet usage
- **Collapsible Panels**: Flexible workspace with resizable library panel
- **Interactive Modals**: Context-aware dialogs for detailed ingredient and formula views
- **Real-time Updates**: Live data synchronization across application components

## 🛠️ Technology Stack

### Frontend
- **React 19**: Latest React with modern hooks and concurrent features
- **TypeScript**: Full type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **React Router DOM**: Client-side routing with modern navigation patterns
- **React Query Builder**: Advanced filtering and query construction

### Development Tools
- **Vite**: Lightning-fast build tool and development server
- **ESLint**: Code quality and consistency enforcement
- **PostCSS**: CSS processing and optimization
- **TypeScript ESLint**: TypeScript-specific linting rules

### Architecture
- **Component-Based**: Modular, reusable React components
- **Service Layer**: Abstracted data access with Pega integration points
- **Event-Driven**: Global event bus for component communication
- **Mock Data**: Development-ready with comprehensive sample data

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd createFormulaV2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open application**
   Navigate to `http://localhost:3000` in your browser

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production-ready application
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── DataGrid.tsx    # Advanced data table component
│   ├── SearchBar.tsx   # Search functionality
│   ├── QueryBuilder.tsx # Advanced filtering interface
│   └── ...
├── pages/              # Application pages
│   └── home/           # Main application page
├── services/           # Data access layer
│   └── pega.ts         # Pega integration service
├── view/               # Layout and shell components
│   ├── AppShell/       # Main application layout
│   ├── Library/        # Ingredient/formula library panel
│   └── WorkArea/       # Main workspace area
├── mocks/              # Development mock data
├── utils/              # Utility functions and helpers
└── router/             # Application routing configuration
```

## 🧪 Data Models

### Ingredient
```typescript
interface Ingredient {
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
  // ... additional properties
}
```

### Formula
```typescript
interface Formula {
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
```

## 🔧 Development Features

### Mock Data System
The application includes comprehensive mock data for development:
- **Ingredients**: 15+ sample ingredients covering essential oils, aroma chemicals, and base materials
- **Formulas**: 8 complete sample formulas with different categories and statuses
- **Attributes**: Configurable ingredient attributes and metadata

### Service Integration
- **PegaService**: Abstract service layer ready for Pega DX API integration
- **Event Bus**: Global communication system for component coordination
- **Query Evaluator**: Advanced filtering logic for ingredient and formula searches

### UI Components
- **DataGrid**: Professional data tables with sorting, filtering, and multi-select
- **QueryBuilder**: Visual query construction with multiple operators and combinators
- **Modal System**: Global modal management with context-aware dialogs
- **Badge System**: Status indicators and categorization labels

## 🎯 Usage Examples

### Creating a New Formula
1. Navigate to the Library panel
2. Select "Formulas" tab
3. Click "Add Formula" to open the formula creation modal
4. Add ingredients with percentages
5. Save with appropriate status (draft/active)

### Advanced Ingredient Search
1. Select "Ingredients" tab in Library panel
2. Use search bar for quick text search
3. Click "Advanced Filters" for complex queries
4. Build multi-criteria filters using the query builder
5. Apply filters to see filtered results

### Cost Analysis
The WorkArea automatically calculates:
- Individual ingredient costs
- Formula total cost per kilogram
- Running totals and percentages
- Raw Material Cost (RMC) analysis

## 🔮 Future Enhancements

### Planned Features
- **Pega Integration**: Connect to Pega DX API for real-time data
- **Advanced Analytics**: Fragrance composition analysis and recommendations
- **Compliance Checking**: Automated IFRA and regulatory compliance validation
- **Export Functionality**: PDF reports and formula exports
- **User Management**: Multi-user support with role-based permissions
- **Version History**: Complete formula version tracking and comparison

### Technical Improvements
- **PWA Support**: Offline capability and mobile app features
- **Real-time Sync**: Multi-user real-time collaboration
- **Advanced Caching**: Optimized data loading and performance
- **Accessibility**: WCAG 2.1 compliance and screen reader support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software developed for Pega Systems.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Review the documentation and code comments

---

**Built with ❤️ for the fragrance industry**