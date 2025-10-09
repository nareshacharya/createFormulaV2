
import { useState } from 'react';
import { Ingredient } from '../services/pega';
import Badge from './Badge';
import Button from './Button';
import { eventBus } from '../utils/bus';

interface IngredientTableProps {
  ingredients: Ingredient[];
  selectedIngredients: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  displayColumns: string[];
  showActionsBar?: boolean;
  enableAdvancedFeatures?: boolean;
}

const IngredientTable = ({
  ingredients,
  selectedIngredients,
  onSelectionChange,
  displayColumns,
  showActionsBar = true,
  enableAdvancedFeatures = false
}: IngredientTableProps) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = enableAdvancedFeatures ? 15 : 10;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'palette': return 'success';
      case 'analytical': return 'warning';
      case 'sers_review': return 'info';
      default: return 'default';
    }
  };

  const getStatusDotColor = (ingredient: Ingredient) => {
    const { status, mac } = ingredient;

    if (mac < 0) return 'bg-red-500'; // Non-Compliant
    if (status === 'inactive') return 'bg-gray-400'; // Inactive
    if (status === 'active' || status === 'palette') return 'bg-green-500'; // Active/Palette
    if (status === 'analytical') return 'bg-purple-500'; // Analytical
    if (status === 'sers_review') return 'bg-blue-500'; // SERS Review

    return 'bg-green-500'; // Default to active
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  const sortedIngredients = [...ingredients].sort((a, b) => {
    if (!sortConfig) return 0;

    const aVal = a[sortConfig.key as keyof Ingredient];
    const bVal = b[sortConfig.key as keyof Ingredient];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (sortConfig.direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedIngredients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIngredients = sortedIngredients.slice(startIndex, endIndex);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      onSelectionChange(paginatedIngredients.map(ing => ing.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleRowSelect = (e: React.ChangeEvent<HTMLInputElement>, ingredientId: string) => {
    const checked = e.target.checked;
    if (checked) {
      onSelectionChange([...selectedIngredients, ingredientId]);
    } else {
      onSelectionChange(selectedIngredients.filter(id => id !== ingredientId));
    }
  };

  const handleRowClick = (e: React.MouseEvent, ingredientId: string) => {
    e.stopPropagation();

    if (selectedIngredients.includes(ingredientId)) {
      onSelectionChange(selectedIngredients.filter(id => id !== ingredientId));
    } else {
      onSelectionChange([...selectedIngredients, ingredientId]);
    }
  };

  const handleAddToFormula = () => {
    const ingredientsToAdd = ingredients.filter(ing => selectedIngredients.includes(ing.id));
    ingredientsToAdd.forEach(ingredient => {
      eventBus.emit('ingredient-selected', { ingredient });
    });
    onSelectionChange([]); // Clear selection after adding
  };

  const renderCellValue = (ingredient: Ingredient, column: string) => {
    const value = ingredient[column as keyof Ingredient];

    switch (column) {
      case 'status':
        return (
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusDotColor(ingredient)}`} />
            <Badge variant={getStatusColor(value as string)} size="sm">
              {value as string}
            </Badge>
          </div>
        );
      case 'price':
        return `$${(value as number).toFixed(2)}`;
      case 'mac':
        return value === -1 ? 'No limit' : value;
      case 'allergens':
        const allergens = value as string[];
        return allergens && allergens.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {allergens.slice(0, 2).map(allergen => (
              <Badge key={allergen} variant="warning" size="xs">
                {allergen}
              </Badge>
            ))}
            {allergens.length > 2 && (
              <Badge variant="default" size="xs">
                +{allergens.length - 2}
              </Badge>
            )}
          </div>
        ) : '-';
      case 'type':
        return (
          <Badge
            variant={value === 'natural' ? 'success' : value === 'synthetic' ? 'info' : 'default'}
            size="sm"
          >
            {value as string}
          </Badge>
        );
      default:
        return value || '-';
    }
  };

  const getColumnLabel = (column: string) => {
    const labels: Record<string, string> = {
      name: 'Name',
      code: 'Code',
      price: 'Price',
      type: 'Type',
      category: 'Category',
      supplier: 'Supplier',
      status: 'Status',
      mac: 'MAC',
      odorProfile: 'Odor Profile',
      volatility: 'Volatility',
      allergens: 'Allergens',
      ifraCategory: 'IFRA Category',
      casNumber: 'CAS Number',
      unit: 'Unit'
    };
    return labels[column] || column;
  };

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <i className="ri-search-line text-2xl mb-2"></i>
        <p>No ingredients match your filters</p>
        <p className="text-sm mt-1">Try adjusting your filter criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions Bar - Only show if enabled */}
      {showActionsBar && (
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {selectedIngredients.length} of {ingredients.length} selected
            </span>
            {selectedIngredients.length > 0 && (
              <Button
                onClick={handleAddToFormula}
                size="sm"
                className="whitespace-nowrap"
              >
                <i className="ri-add-line mr-1"></i>
                Add to Formula
              </Button>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {ingredients.length} ingredients found
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="w-12 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIngredients.length === paginatedIngredients.length && paginatedIngredients.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              {displayColumns.map(column => (
                <th
                  key={column}
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{getColumnLabel(column)}</span>
                    {sortConfig?.key === column ? (
                      <i className={`ri-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}-line text-xs text-blue-600`}></i>
                    ) : (
                      <i className="ri-expand-up-down-line text-xs text-gray-400 opacity-0 group-hover:opacity-100"></i>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedIngredients.map(ingredient => (
              <tr
                key={ingredient.id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  selectedIngredients.includes(ingredient.id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={(e) => handleRowClick(e, ingredient.id)}
              >
                <td className="w-12 px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIngredients.includes(ingredient.id)}
                    onChange={(e) => handleRowSelect(e, ingredient.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </td>
                {displayColumns.map(column => (
                  <td key={column} className="px-3 py-3 text-sm text-gray-900 font-sans">
                    {renderCellValue(ingredient, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedIngredients.length)} of {sortedIngredients.length} ingredients
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <i className="ri-skip-back-line"></i>
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <i className="ri-arrow-left-line"></i>
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded-md cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <i className="ri-arrow-right-line"></i>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <i className="ri-skip-forward-line"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientTable;
