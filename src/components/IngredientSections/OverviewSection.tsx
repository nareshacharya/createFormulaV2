
import Badge from '../Badge';
import type { Ingredient } from '../services/pega'';

interface OverviewSectionProps {
  ingredient: Ingredient;
}

const OverviewSection = ({ ingredient }: OverviewSectionProps) => {
  // Mock additional data that would come from API
  const mockData = {
    description: 'A natural essential oil extracted from bergamot citrus fruit, commonly used in perfumery for its fresh, citrusy, and slightly floral aroma.',
    odorProfile: ['Fresh', 'Citrus', 'Floral'],
    volatility: 'Top Note',
    strength: 'Medium',
    lastUpdated: '2024-01-15',
    createdBy: 'John Smith'
  };

  const getStatusBadge = () => {
    const mac = 1; // Mock MAC value
    if (mac < 0) return <Badge variant="error">Non-Compliant</Badge>;
    return <Badge variant="success">Active</Badge>;
  };

  const getTypeBadge = () => {
    const variants = {
      natural: 'success',
      synthetic: 'info',
      base: 'warning'
    } as const;
    
    return (
      <Badge variant={variants[ingredient.type] || 'default'}>
        {ingredient.type.charAt(0).toUpperCase() + ingredient.type.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredient Code
            </label>
            <p className="text-sm text-gray-900">{ingredient.code}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <p className="text-sm text-gray-900">{ingredient.category}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <div>{getTypeBadge()}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div>{getStatusBadge()}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost per {ingredient.unit}
            </label>
            <p className="text-sm text-gray-900 font-medium">${ingredient.price.toFixed(2)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <p className="text-sm text-gray-900">{ingredient.supplier}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{mockData.description}</p>
      </div>

      {/* Olfactory Properties */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Olfactory Properties</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Odor Profile
            </label>
            <div className="flex flex-wrap gap-2">
              {mockData.odorProfile.map((profile) => (
                <Badge key={profile} variant="info" size="sm">
                  {profile}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volatility
            </label>
            <Badge variant="purple" size="sm">{mockData.volatility}</Badge>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strength
            </label>
            <p className="text-sm text-gray-900">{mockData.strength}</p>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created By
            </label>
            <p className="text-sm text-gray-900">{mockData.createdBy}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <p className="text-sm text-gray-900">{mockData.lastUpdated}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
