/* eslint-disable jsx-a11y/label-has-associated-control */
import type { Ingredient } from "../../services/pega";
import { tw } from "../../utils/tailwindToInline";

interface PhysicalPropertiesSectionProps {
  ingredient: Ingredient;
}

const PhysicalPropertiesSection = ({
  ingredient, // eslint-disable-line @typescript-eslint/no-unused-vars
}: PhysicalPropertiesSectionProps) => {
  // Mock physical properties data
  const mockData = {
    appearance: "Colorless to pale yellow liquid",
    odor: "Fresh, citrusy, bergamot-like",
    density: "0.876 g/cm³ at 20°C",
    boilingPoint: "176°C",
    meltingPoint: "-96°C",
    flashPoint: "48°C",
    solubility: "Insoluble in water, soluble in alcohol and oils",
    refractiveIndex: "1.474 at 20°C",
    opticalRotation: "+15° to +25°",
    viscosity: "1.2 cP at 20°C",
  };

  const properties = [
    { label: "Appearance", value: mockData.appearance, icon: "ri-eye-line" },
    { label: "Odor", value: mockData.odor, icon: "ri-nose-line" },
    { label: "Density", value: mockData.density, icon: "ri-scales-3-line" },
    {
      label: "Boiling Point",
      value: mockData.boilingPoint,
      icon: "ri-temp-hot-line",
    },
    {
      label: "Melting Point",
      value: mockData.meltingPoint,
      icon: "ri-temp-cold-line",
    },
    { label: "Flash Point", value: mockData.flashPoint, icon: "ri-fire-line" },
    { label: "Solubility", value: mockData.solubility, icon: "ri-drop-line" },
    {
      label: "Refractive Index",
      value: mockData.refractiveIndex,
      icon: "ri-focus-3-line",
    },
    {
      label: "Optical Rotation",
      value: mockData.opticalRotation,
      icon: "ri-refresh-line",
    },
    {
      label: "Viscosity",
      value: mockData.viscosity,
      icon: "ri-water-percent-line",
    },
  ];

  return (
    <div style={tw("space-y-6")}>
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          Physical Properties
        </h3>
        <div style={tw("space-y-4")}>
          {properties.map((property) => (
            <div
              key={property.label}
              style={tw("flex items-start space-x-3 p-3 bg-gray-50 rounded-lg")}
            >
              <div
                style={tw(
                  "flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                )}
              >
                <i className={`${property.icon} text-blue-600 text-sm`}></i>
              </div>
              <div style={tw("flex-1 min-w-0")}>
                <label
                  style={tw("block text-sm font-medium text-gray-700 mb-1")}
                >
                  {property.label}
                </label>
                <p style={tw("text-sm text-gray-900")}>{property.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Information */}
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          Safety & Handling
        </h3>
        <div style={tw("bg-yellow-50 border border-yellow-200 rounded-lg p-4")}>
          <div style={tw("flex items-start")}>
            <i className="ri-alert-line text-yellow-600 mt-0.5 mr-2"></i>
            <div>
              <p style={tw("text-sm text-yellow-800 font-medium")}>
                Safety Considerations
              </p>
              <ul style={tw("text-sm text-yellow-700 mt-2 space-y-1")}>
                <li>
                  • Flash point: {mockData.flashPoint} - Keep away from heat
                  sources
                </li>
                <li>• Store in cool, dry place away from direct sunlight</li>
                <li>• Use appropriate ventilation when handling</li>
                <li>• Avoid contact with eyes and skin</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Test Methods */}
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          Test Methods
        </h3>
        <div style={tw("bg-gray-50 rounded-lg p-4")}>
          <p style={tw("text-sm text-gray-600 mb-3")}>
            Standard test methods used for property determination:
          </p>
          <ul style={tw("text-sm text-gray-700 space-y-1")}>
            <li>• Density: ASTM D4052</li>
            <li>• Refractive Index: ASTM D1218</li>
            <li>• Flash Point: ASTM D93</li>
            <li>• Optical Rotation: USP &lt;781&gt;</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PhysicalPropertiesSection;
