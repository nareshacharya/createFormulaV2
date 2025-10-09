
import { useState, lazy, Suspense } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Ingredient } from '../services/pega';
import { eventBus } from '../utils/bus';

// Lazy load sections for better performance
const OverviewSection = lazy(() => import('./IngredientSections/OverviewSection'));
const ChemicalStructureSection = lazy(() => import('./IngredientSections/ChemicalStructureSection'));
const PhysicalPropertiesSection = lazy(() => import('./IngredientSections/PhysicalPropertiesSection'));
const ChemicalPropertiesSection = lazy(() => import('./IngredientSections/ChemicalPropertiesSection'));
const ComplianceSection = lazy(() => import('./IngredientSections/ComplianceSection'));
const SuppliersSection = lazy(() => import('./IngredientSections/SuppliersSection'));
const DocumentsSection = lazy(() => import('./IngredientSections/DocumentsSection'));

interface IngredientQuickViewProps {
  ingredient: Ingredient | null;
  isOpen: boolean;
  onClose: () => void;
}

const IngredientQuickView = ({ ingredient, isOpen, onClose }: IngredientQuickViewProps) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: 'ri-information-line' },
    { id: 'chemical-structure', label: 'Chemical Structure', icon: 'ri-flask-line' },
    { id: 'physical-properties', label: 'Physical Properties', icon: 'ri-temp-hot-line' },
    { id: 'chemical-properties', label: 'Chemical Properties', icon: 'ri-test-tube-line' },
    { id: 'compliance', label: 'Compliance & Regulations', icon: 'ri-shield-check-line' },
    { id: 'suppliers', label: 'Suppliers', icon: 'ri-truck-line' },
    { id: 'documents', label: 'Documents', icon: 'ri-file-text-line' }
  ];

  const handleAddToFormula = () => {
    if (ingredient) {
      eventBus.emit('add-ingredient-to-formula', { ingredientId: ingredient.id });
      onClose();
    }
  };

  const renderSection = () => {
    if (!ingredient) return null;

    const SectionComponent = {
      'overview': OverviewSection,
      'chemical-structure': ChemicalStructureSection,
      'physical-properties': PhysicalPropertiesSection,
      'chemical-properties': ChemicalPropertiesSection,
      'compliance': ComplianceSection,
      'suppliers': SuppliersSection,
      'documents': DocumentsSection
    }[activeSection];

    if (!SectionComponent) return null;

    return (
      <Suspense fallback={
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      }>
        <SectionComponent ingredient={ingredient} />
      </Suspense>
    );
  };

  if (!ingredient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ingredient.name}
      size="3xl"
      headerActions={
        <Button
          onClick={handleAddToFormula}
          size="sm"
        >
          <i className="ri-add-line mr-2"></i>
          Add to Active Formula
        </Button>
      }
    >
      <div className="flex h-full">
        {/* Vertical Sidebar Navigation */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
          <nav className="p-4 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors cursor-pointer text-left
                  ${activeSection === section.id
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <i className={`${section.icon} mr-3 text-base flex-shrink-0`}></i>
                <span className="truncate">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Content Area with consistent height and proper scrolling */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {renderSection()}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default IngredientQuickView;
