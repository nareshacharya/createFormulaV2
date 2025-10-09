
import { useState } from 'react';
import { IngredientAttribute } from '../services/pega';
import SearchBar from './SearchBar';

interface AttributeDataGridProps {
  attributes: IngredientAttribute[];
  selectedAttributes: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  maxSelections?: number;
}

const AttributeDataGrid = ({
  attributes = [],
  selectedAttributes = [],
  onSelectionChange,
  maxSelections = 4
}: AttributeDataGridProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter attributes based on search
  const filteredAttributes = attributes.filter(attribute => 
    !searchQuery || 
    attribute.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAttributeToggle = (attributeId: string) => {
    const isSelected = selectedAttributes.includes(attributeId);
    
    if (isSelected) {
      // Remove from selection
      onSelectionChange(selectedAttributes.filter(id => id !== attributeId));
    } else if (selectedAttributes.length < maxSelections) {
      // Add to selection
      onSelectionChange([...selectedAttributes, attributeId]);
    }
  };

  // Show empty state if no attributes
  if (!attributes || attributes.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        <div className="text-center">
          <i className="ri-list-check-line text-3xl mb-2"></i>
          <p>No attributes available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search attributes..."
        className="w-full"
      />

      {/* Selection Counter */}
      <div className="text-sm text-gray-600 text-center">
        {selectedAttributes.length} of {maxSelections} selected
      </div>

      {/* Attribute List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAttributes.map(attribute => {
          const isSelected = selectedAttributes.includes(attribute.id);
          const isDisabled = !isSelected && selectedAttributes.length >= maxSelections;
          
          return (
            <label
              key={attribute.id}
              className={`
                flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all
                ${isSelected 
                  ? 'bg-blue-50 border-blue-200' 
                  : isDisabled 
                    ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed' 
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }
              `}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => !isDisabled && handleAttributeToggle(attribute.id)}
                disabled={isDisabled}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              
              <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                {attribute.name}
              </span>
            </label>
          );
        })}
      </div>

      {/* No Results Message */}
      {filteredAttributes.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-500">
          <i className="ri-search-line text-2xl mb-2"></i>
          <p className="text-sm">No attributes found for "{searchQuery}"</p>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
        {filteredAttributes.length} attributes available
      </div>
    </div>
  );
};

export default AttributeDataGrid;
