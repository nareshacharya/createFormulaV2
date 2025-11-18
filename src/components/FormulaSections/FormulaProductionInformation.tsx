/* eslint-disable jsx-a11y/label-has-associated-control */
import { tw } from "../../utils/tailwindToInline";

interface FormulaData {
  productionCode: string;
  productionDate: string;
  recommendedDosage: number | undefined;
  dosageUnit: string;
  [key: string]: unknown;
}

interface Props {
  formulaData: FormulaData;
  onDataChange: (updates: Partial<FormulaData>) => void;
}

const FormulaProductionInformation = ({ formulaData, onDataChange }: Props) => {
  return (
    <div style={tw("space-y-5")}>
      <div>
        <h4 style={tw("text-xs font-semibold text-gray-600 uppercase mb-2")}>
          Production Information
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
      {/* Product Production Code */}
      <div>
        <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
          Product Production Code
        </label>
        <input
          type="text"
          value={formulaData.productionCode || ""}
          onChange={(e) => onDataChange({ productionCode: e.target.value })}
          style={tw(
            "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          )}
          placeholder="Enter production code"
        />
      </div>

      {/* Product Production Date */}
      <div>
        <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
          Product Production Date
        </label>
        <input
          type="date"
          value={formulaData.productionDate || ""}
          onChange={(e) => onDataChange({ productionDate: e.target.value })}
          style={tw(
            "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          )}
        />
      </div>

      {/* Recommended Product Dosage */}
      <div>
        <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
          Recommended Product Dosage
        </label>
        <div style={tw("flex gap-2")}>
          <input
            type="number"
            value={formulaData.recommendedDosage || ""}
            onChange={(e) =>
              onDataChange({ recommendedDosage: parseFloat(e.target.value) })
            }
            style={tw(
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          <select
            value={formulaData.dosageUnit || ""}
            onChange={(e) => onDataChange({ dosageUnit: e.target.value })}
            style={tw(
              "w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
          >
            <option value="">Unit</option>
            <option value="%">%</option>
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="kg">kg</option>
            <option value="L">L</option>
          </select>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default FormulaProductionInformation;
