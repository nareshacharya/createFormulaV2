/* eslint-disable jsx-a11y/label-has-associated-control */
import { tw } from "../../utils/tailwindToInline";

interface FormulaData {
  brand: string;
  variant: string;
  supplier: string;
  [key: string]: unknown;
}

interface Props {
  formulaData: FormulaData;
  onDataChange: (updates: Partial<FormulaData>) => void;
  isReadOnly?: boolean;
}

const FormulaProductInformation = ({ formulaData, onDataChange, isReadOnly = false }: Props) => {
  return (
    <div>
      {/* SECTION: Product Information */}
      <div style={tw("mb-6")}>
        <h4 style={tw("text-xs font-semibold text-gray-600 uppercase mb-4")}>
          Product Information
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
          {/* Brand */}
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
              Brand
            </label>
            <input
              type="text"
              value={formulaData.brand || ""}
              onChange={(e) => onDataChange({ brand: e.target.value })}
              disabled={isReadOnly}
              style={tw(
                `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
              )}
              placeholder="Enter brand"
            />
          </div>

          {/* Variant */}
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
              Variant
            </label>
            <input
              type="text"
              value={formulaData.variant || ""}
              onChange={(e) => onDataChange({ variant: e.target.value })}
              disabled={isReadOnly}
              style={tw(
                `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
              )}
              placeholder="Enter variant name"
            />
          </div>

          {/* Supplier */}
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
              Supplier
            </label>
            <input
              type="text"
              value={formulaData.supplier || ""}
              onChange={(e) => onDataChange({ supplier: e.target.value })}
              disabled={isReadOnly}
              style={tw(
                `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
              )}
              placeholder="Enter supplier"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormulaProductInformation;
