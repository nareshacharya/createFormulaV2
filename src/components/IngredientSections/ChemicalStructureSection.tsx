/* eslint-disable jsx-a11y/label-has-associated-control */
import type { Ingredient } from "../../services/pega";
import { tw } from "../../utils/tailwindToInline";

interface ChemicalStructureSectionProps {
  ingredient: Ingredient;
}

const ChemicalStructureSection = ({
  ingredient, // eslint-disable-line @typescript-eslint/no-unused-vars
}: ChemicalStructureSectionProps) => {
  // Mock chemical data
  const mockData = {
    molecularFormula: "C10H16O",
    molecularWeight: "152.23 g/mol",
    casNumber: "5989-27-5",
    einecs: "227-813-5",
    smiles: "CC1=CCC(CC1)C(=C)C",
    inchi: "InChI=1S/C10H16O/c1-7(2)9-4-6-10(11)8(3)5-9/h9,11H,1,4-6H2,2-3H3",
  };

  return (
    <div style={tw("space-y-6")}>
      {/* Molecular Information */}
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          Molecular Information
        </h3>
        <div style={tw("grid grid-cols-2 gap-4")}>
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-1")}>
              Molecular Formula
            </label>
            <p style={tw("text-sm text-gray-900 font-mono")}>
              {mockData.molecularFormula}
            </p>
          </div>
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-1")}>
              Molecular Weight
            </label>
            <p style={tw("text-sm text-gray-900")}>
              {mockData.molecularWeight}
            </p>
          </div>
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-1")}>
              CAS Number
            </label>
            <p style={tw("text-sm text-gray-900 font-mono")}>
              {mockData.casNumber}
            </p>
          </div>
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-1")}>
              EINECS Number
            </label>
            <p style={tw("text-sm text-gray-900 font-mono")}>
              {mockData.einecs}
            </p>
          </div>
        </div>
      </div>

      {/* Structure Representation */}
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          Structure Representation
        </h3>

        {/* Placeholder for chemical structure diagram */}
        <div
          style={tw(
            "bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4"
          )}
        >
          <i className="ri-flask-line text-4xl text-gray-400 mb-2"></i>
          <p style={tw("text-sm text-gray-500")}>Chemical structure diagram</p>
          <p style={tw("text-xs text-gray-400 mt-1")}>Would be rendered here</p>
        </div>

        <div style={tw("space-y-4")}>
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-1")}>
              SMILES
            </label>
            <p
              style={tw(
                "text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded border break-all"
              )}
            >
              {mockData.smiles}
            </p>
          </div>
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-1")}>
              InChI
            </label>
            <p
              style={tw(
                "text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded border break-all"
              )}
            >
              {mockData.inchi}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Chemical Info */}
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          Additional Information
        </h3>
        <div style={tw("bg-blue-50 border border-blue-200 rounded-lg p-4")}>
          <div style={tw("flex items-start")}>
            <i className="ri-information-line text-blue-600 mt-0.5 mr-2"></i>
            <div>
              <p style={tw("text-sm text-blue-800 font-medium")}>
                Chemical Structure Data
              </p>
              <p style={tw("text-sm text-blue-700 mt-1")}>
                Detailed chemical structure information and 3D molecular models
                would be available through integration with chemical databases
                and structure rendering libraries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChemicalStructureSection;
