/* eslint-disable jsx-a11y/label-has-associated-control */
import { isFieldVisible } from "../../config/formulaCreation.config";
import {
  FORMULA_TYPES,
  getFormulaTypeLabel,
  getFormulaTypeDescription,
} from "../../config/formulaTypes.config";
import type { FormulaType } from "../../config/formulaTypes.config";
import { tw, mergeStyles } from "../../utils/tailwindToInline";

interface FormulaData {
  formulaType: FormulaType;
  name: string;
  fragranceName: string;
  sampleId: string;
  baseFormulaId: string;
  dilutionPercentage: number | undefined;
  version: number;
  [key: string]: any;
}

interface FormulaTypeSectionProps {
  formulaData: FormulaData;
  onDataChange: (updates: Partial<FormulaData>) => void;
}

const FormulaTypeSelection = ({
  formulaData,
  onDataChange,
}: FormulaTypeSectionProps) => {
  return (
    <div style={tw("space-y-5")}>
      {/* Formula Type Selection */}
      <div>
        <div
          style={mergeStyles(tw("flex items-center"), {
            gap: "0.5rem",
            marginBottom: "0.5rem",
          })}
        >
          <label style={tw("block text-sm font-medium text-gray-700")}>
            Formula Type *
          </label>
          <div style={tw("relative group inline-block")}>
            <i className="ri-information-line text-gray-400 text-base cursor-help"></i>
            <div
              style={tw(
                "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 absolute left-0 top-6 w-80 p-4 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none"
              )}
            >
              <div style={{ marginBottom: "0.75rem" }}>
                <strong style={tw("text-blue-300")}>Base Formula:</strong>{" "}
                <span style={tw("text-gray-300")}>
                  {getFormulaTypeDescription(FORMULA_TYPES.BASE)}
                </span>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <strong style={tw("text-blue-300")}>Dilution Formula:</strong>{" "}
                <span style={tw("text-gray-300")}>
                  {getFormulaTypeDescription(FORMULA_TYPES.DILUTION)}
                </span>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <strong style={tw("text-blue-300")}>
                  Analytical Formula:
                </strong>{" "}
                <span style={tw("text-gray-300")}>
                  {getFormulaTypeDescription(FORMULA_TYPES.ANALYTICAL)}
                </span>
              </div>
              <div>
                <strong style={tw("text-blue-300")}>Perfumer Formula:</strong>{" "}
                <span style={tw("text-gray-300")}>
                  {getFormulaTypeDescription(FORMULA_TYPES.PERFUMER)}
                </span>
              </div>
              <div
                style={tw(
                  "absolute left-6 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"
                )}
              ></div>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
          }}
        >
          {Object.values(FORMULA_TYPES).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onDataChange({ formulaType: type })}
              style={tw(
                `p-3 rounded-lg border-2 transition-all ${
                  formulaData.formulaType === type
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`
              )}
            >
              <div style={tw("flex items-center justify-between")}>
                <div style={tw("font-medium text-sm text-gray-900")}>
                  {getFormulaTypeLabel(type)}
                </div>
                {formulaData.formulaType === type && (
                  <i className="ri-checkbox-circle-fill text-blue-500 text-base"></i>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fragrance Name / Sample ID - Full Width */}
      {isFieldVisible("fragranceName", formulaData.formulaType) && (
        <div>
          <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
            Fragrance Name (Base Ingredient) *
          </label>
          <input
            type="text"
            value={formulaData.fragranceName}
            onChange={(e) => onDataChange({ fragranceName: e.target.value })}
            style={tw(
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
            placeholder="Enter fragrance name"
          />
        </div>
      )}

      {isFieldVisible("sampleId", formulaData.formulaType) && (
        <div>
          <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
            Sample ID *
          </label>
          <input
            type="text"
            value={formulaData.sampleId}
            onChange={(e) => onDataChange({ sampleId: e.target.value })}
            style={tw(
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
            placeholder="Enter sample ID"
          />
        </div>
      )}

      {/* Base Formula & Dilution % for DILUTION type */}
      {isFieldVisible("baseFormulaId", formulaData.formulaType) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
          <div>
            <label
              style={tw("block text-sm font-medium text-gray-700 mb-2")}
            >
              Base Formula *
            </label>
            <input
              type="text"
              value={formulaData.baseFormulaId || ""}
              onChange={(e) => onDataChange({ baseFormulaId: e.target.value })}
              style={tw(
                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              )}
              placeholder="Search for base formula..."
            />
          </div>
          <div>
            <label
              style={tw("block text-sm font-medium text-gray-700 mb-2")}
            >
              Dilution Percentage *
            </label>
            <div style={tw("relative")}>
              <input
                type="number"
                value={formulaData.dilutionPercentage || ""}
                onChange={(e) =>
                  onDataChange({ dilutionPercentage: parseFloat(e.target.value) })
                }
                style={tw(
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
                placeholder="0.00"
                min="0"
                max="100"
                step="0.01"
              />
              <span style={tw("absolute right-3 top-2.5 text-gray-500")}>
                %
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Formula Name & Version - Two Column */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px",
        }}
      >
        {/* Formula Name */}
        <div>
          <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
            Formula Name
          </label>
          <input
            type="text"
            value={formulaData.name}
            onChange={(e) => onDataChange({ name: e.target.value })}
            style={tw(
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
            placeholder="Enter formula name"
          />
        </div>

        {/* Formula Version */}
        <div>
          <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
            Formula Version
          </label>
          <input
            type="number"
            value={formulaData.version || 1}
            onChange={(e) => onDataChange({ version: parseInt(e.target.value, 10) })}
            style={tw(
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
            min="1"
          />
        </div>
      </div>
    </div>
  );
};

export default FormulaTypeSelection;
