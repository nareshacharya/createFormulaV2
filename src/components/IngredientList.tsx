
import { useState, useEffect } from 'react';
import ListRow from './ListRow';
import IngredientQuickView from './IngredientQuickView';
import { Ingredient } from '../services/pega';
import { eventBus } from '../utils/bus';

interface IngredientListProps {
  ingredients: Ingredient[];
  searchQuery?: string;
  activeFilter?: string;
  appliedFilters?: any;
}

const IngredientList = ({ 
  ingredients, 
  searchQuery = '', 
  activeFilter = '', 
  appliedFilters = {} 
}: IngredientListProps) => {
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Listen for work area updates to track selected ingredients
  useEffect(() => {
    const handleWorkAreaUpdate = (data: { ingredients: string[] }) => {
      setSelectedIngredients(data.ingredients || []);
    };

    eventBus.on('work-area-updated', handleWorkAreaUpdate);
    
    return () => {
      eventBus.off('work-area-updated', handleWorkAreaUpdate);
    };
  }, []);

  const getStatusColor = (ingredient: Ingredient) => {
    const { status, mac } = ingredient;
    
    if (mac < 0) return 'bg-red-500'; // Non-Compliant
    if (status === 'inactive') return 'bg-gray-400'; // Inactive
    if (status === 'active' || status === 'palette') return 'bg-green-500'; // Active/Palette
    if (status === 'analytical') return 'bg-purple-500'; // Analytical
    if (status === 'sers_review') return 'bg-blue-500'; // SERS Review
    
    return 'bg-green-500'; // Default to active
  };

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = !searchQuery || ingredient.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !activeFilter || ingredient.type === activeFilter;
    
    // Apply additional filters from modal
    let matchesAdvancedFilters = true;
    
    if (appliedFilters.category && appliedFilters.category !== ingredient.category.toLowerCase().replace(' ', '-')) {
      matchesAdvancedFilters = false;
    }
    
    if (appliedFilters.supplier && appliedFilters.supplier !== ingredient.supplier.toLowerCase()) {
      matchesAdvancedFilters = false;
    }
    
    if (appliedFilters.minPrice && ingredient.price < appliedFilters.minPrice) {
      matchesAdvancedFilters = false;
    }
    
    if (appliedFilters.maxPrice && ingredient.price > appliedFilters.maxPrice) {
      matchesAdvancedFilters = false;
    }
    
    return matchesSearch && matchesFilter && matchesAdvancedFilters;
  });

  const handleInfoClick = (e: React.MouseEvent, ingredient: Ingredient) => {
    e.stopPropagation();
    setSelectedIngredient(ingredient);
  };

  const handleIngredientClick = (ingredient: Ingredient) => {
    // Check if ingredient is already selected
    const isAlreadySelected = selectedIngredients.includes(ingredient.name);
    
    if (isAlreadySelected) {
      // Show visual feedback that it's already selected
      console.log(`${ingredient.name} is already in the work area`);
      return;
    }

    // Emit event to add ingredient to work area
    eventBus.emit('ingredient-selected', { ingredient });
    
    // Add to local selected state for immediate visual feedback
    setSelectedIngredients(prev => [...prev, ingredient.name]);
  };

  const isIngredientSelected = (ingredientName: string) => {
    return selectedIngredients.includes(ingredientName);
  };

  return (
    <>
      <div className="space-y-0">
        {filteredIngredients.map((ingredient) => {
          const isSelected = isIngredientSelected(ingredient.name);
          
          return (
            <ListRow
              key={ingredient.id}
              onHover={(isHovered) => setHoveredRow(isHovered ? ingredient.id : null)}
              onClick={() => handleIngredientClick(ingredient)}
              compact={true}
              className={isSelected ? 'bg-blue-50 border-l-2 border-blue-400' : ''}
            >
              <div className="flex items-center justify-between w-full px-3">
                <div className="flex items-center space-x-2 flex-1">
                  {/* Status Dot */}
                  <div 
                    className={`w-1.5 h-1.5 rounded-full ${getStatusColor(ingredient)} flex-shrink-0`}
                    title={`Status: ${ingredient.status}`}
                  />
                  
                  {/* Ingredient Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {ingredient.name}
                      {isSelected && (
                        <i className="ri-check-line text-blue-600 ml-1 text-xs"></i>
                      )}
                    </h4>
                    <p className={`text-xs truncate font-normal ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                      {ingredient.code}
                    </p>
                  </div>
                  
                  {/* Cost */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-normal ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                      ${ingredient.price.toFixed(2)}/{ingredient.unit}
                    </p>
                  </div>
                </div>
                
                {/* Info Icon - Only visible on hover, larger size */}
                {hoveredRow === ingredient.id && (
                  <button 
                    className="ml-2 p-1 rounded hover:bg-gray-100 cursor-pointer flex-shrink-0"
                    onClick={(e) => handleInfoClick(e, ingredient)}
                    aria-label={`View details for ${ingredient.name}`}
                  >
                    <i className="ri-information-line text-gray-400 text-lg"></i>
                  </button>
                )}
              </div>
            </ListRow>
          );
        })}
        
        {filteredIngredients.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <i className="ri-search-line text-xl mb-2"></i>
            <p className="text-sm">No ingredients found</p>
            {(searchQuery || activeFilter || Object.keys(appliedFilters).length > 0) && (
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            )}
          </div>
        )}
      </div>
      
      {/* Quick View Modal */}
      <IngredientQuickView
        ingredient={selectedIngredient}
        isOpen={!!selectedIngredient}
        onClose={() => setSelectedIngredient(null)}
      />
    </>
  );
};

export default IngredientList;
