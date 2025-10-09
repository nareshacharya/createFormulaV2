import Badge from "../Badge";
import type { Ingredient } from "../../services/pega";

interface ChemicalPropertiesSectionProps {
  ingredient: Ingredient;
}

const ChemicalPropertiesSection = ({
  ingredient: _ingredient,
}: ChemicalPropertiesSectionProps) => {
  // Mock chemical properties data
  const mockData = {
    purity: "≥95%",
    waterContent: "≤0.1%",
    acidValue: "≤1.0 mg KOH/g",
    esterValue: "120-140 mg KOH/g",
    peroxideValue: "≤10 meq O2/kg",
    heavyMetals: "≤10 ppm",
    residualSolvents: "Within ICH limits",
    stability: "Stable under normal conditions",
    incompatibilities: [
      "Strong oxidizing agents",
      "Strong acids",
      "Strong bases",
    ],
    degradationProducts: ["Linalool oxide", "Bergamot lactone"],
    shelfLife: "24 months",
  };

  return (
    <div className="space-y-6">
      {/* Purity & Composition */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Purity & Composition
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purity
            </label>
            <p className="text-sm text-gray-900 font-medium">
              {mockData.purity}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Water Content
            </label>
            <p className="text-sm text-gray-900">{mockData.waterContent}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acid Value
            </label>
            <p className="text-sm text-gray-900">{mockData.acidValue}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ester Value
            </label>
            <p className="text-sm text-gray-900">{mockData.esterValue}</p>
          </div>
        </div>
      </div>

      {/* Quality Parameters */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quality Parameters
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              Peroxide Value
            </span>
            <Badge variant="success">{mockData.peroxideValue}</Badge>
          </div>
          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              Heavy Metals
            </span>
            <Badge variant="success">{mockData.heavyMetals}</Badge>
          </div>
          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              Residual Solvents
            </span>
            <Badge variant="success">{mockData.residualSolvents}</Badge>
          </div>
        </div>
      </div>

      {/* Stability & Storage */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Stability & Storage
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <i className="ri-shield-check-line text-green-600 mt-0.5 mr-2"></i>
              <div>
                <p className="text-sm text-green-800 font-medium">Stability</p>
                <p className="text-sm text-green-700 mt-1">
                  {mockData.stability}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shelf Life
            </label>
            <p className="text-sm text-gray-900">{mockData.shelfLife}</p>
          </div>
        </div>
      </div>

      {/* Incompatibilities */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Chemical Incompatibilities
        </h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <i className="ri-alert-line text-red-600 mt-0.5 mr-2"></i>
            <div>
              <p className="text-sm text-red-800 font-medium">
                Avoid contact with:
              </p>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                {mockData.incompatibilities.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Degradation Products */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Degradation Products
        </h3>
        <div className="space-y-2">
          {mockData.degradationProducts.map((product, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
            >
              <i className="ri-arrow-right-s-line text-gray-400"></i>
              <span className="text-sm text-gray-700">{product}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChemicalPropertiesSection;
