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
  sampleID: string;
  baseFormulaId: string;
  dilutionPercentage: number | undefined;
  fragranceDosage: number | undefined;
  productFormat: string;
  category: string;
  region: string;
  country: string;
  [key: string]: any;
}

interface FormulaTypeSectionProps {
  formulaData: FormulaData;
  onDataChange: (updates: Partial<FormulaData>) => void;
  isReadOnly?: boolean;
}

const FormulaTypeSelection = ({
  formulaData,
  onDataChange,
  isReadOnly = false,
}: FormulaTypeSectionProps) => {
  return (
    <div>
      {/* SECTION: Formula Identification */}
      <div style={tw("mb-6")}>
        <h4 style={tw("text-xs font-semibold text-gray-600 uppercase mb-4")}>
          Formula Identification
        </h4>

        {/* Formula Type Selection */}
        <div style={tw("mb-6")}>
          <div
            style={mergeStyles(tw("flex items-center"), {
              gap: "0.5rem",
              marginBottom: "0.75rem",
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
                disabled={isReadOnly}
                style={tw(
                  `p-3 rounded-lg border-2 transition-all ${
                    formulaData.formulaType === type
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${isReadOnly ? "opacity-60 cursor-not-allowed" : ""}`
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
      </div>

      {/* SECTION: Mandatory Information (Consolidated) */}
      <div style={tw("border-t border-gray-200 pt-6 mt-6 mb-6")}>
        <h4 style={tw("text-xs font-semibold text-gray-600 uppercase mb-4")}>
          Mandatory Information
        </h4>

        {/* Two Column Grid for All Fields */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          {/* Fragrance Name - appears for all formula types */}
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
              Fragrance Name *
            </label>
            <input
              type="text"
              value={formulaData.name}
              onChange={(e) => onDataChange({ name: e.target.value })}
              disabled={isReadOnly}
              style={tw(
                `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
              )}
              placeholder="Enter fragrance name"
            />
          </div>

          {/* Sample ID - only for ANALYTICAL type */}
          {isFieldVisible("sampleId", formulaData.formulaType) && (
            <div>
              <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
                Sample ID *
              </label>
              <input
                type="text"
                value={formulaData.sampleID}
                onChange={(e) => onDataChange({ sampleID: e.target.value })}
                disabled={isReadOnly}
                style={tw(
                  `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
                )}
                placeholder="Enter sample ID"
              />
            </div>
          )}

          {/* Base Formula - for DILUTION type */}
          {isFieldVisible("baseFormulaId", formulaData.formulaType) && (
            <div>
              <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
                Base Formula *
              </label>
              <input
                type="text"
                value={formulaData.baseFormulaId || ""}
                onChange={(e) =>
                  onDataChange({ baseFormulaId: e.target.value })
                }
                disabled={isReadOnly}
                style={tw(
                  `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
                )}
                placeholder="Search for base formula..."
              />
            </div>
          )}

          {/* Dilution Percentage - for DILUTION type */}
          {isFieldVisible("dilutionPercentage", formulaData.formulaType) && (
            <div>
              <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
                Dilution Percentage *
              </label>
              <div style={tw("relative")}>
                <input
                  type="number"
                  value={formulaData.dilutionPercentage || ""}
                  onChange={(e) =>
                    onDataChange({
                      dilutionPercentage: parseFloat(e.target.value),
                    })
                  }
                  disabled={isReadOnly}
                  style={tw(
                    `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
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
          )}

          {/* Category */}
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
              Category *
            </label>
            <select
              value={formulaData.category}
              onChange={(e) => onDataChange({ category: e.target.value })}
              disabled={isReadOnly}
              style={tw(
                `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 ${isReadOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
              )}
            >
              <option value="">Select category...</option>
              <option value="Eau de Toilette">Eau de Toilette</option>
              <option value="Eau de Parfum">Eau de Parfum</option>
              <option value="Eau de Cologne">Eau de Cologne</option>
              <option value="Parfum">Parfum</option>
              <option value="Eau Fraiche">Eau Fraiche</option>
            </select>
          </div>

          {/* Region */}
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
              Region *
            </label>
            <select
              value={formulaData.region}
              onChange={(e) => onDataChange({ region: e.target.value })}
              disabled={isReadOnly}
              style={tw(
                `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 ${isReadOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
              )}
            >
              <option value="">Select region...</option>
              <option value="NA">North America</option>
              <option value="EU">Europe</option>
              <option value="APAC">Asia Pacific</option>
              <option value="LATAM">Latin America</option>
            </select>
          </div>

          {/* Country */}
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
              Country *
            </label>
            <select
              value={formulaData.country}
              onChange={(e) => onDataChange({ country: e.target.value })}
              style={tw(
                `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 ${isReadOnly || !formulaData.region ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
              )}
              disabled={isReadOnly || !formulaData.region}
            >
              <option value="">Select country...</option>
              {formulaData.region === "NA" && (
                <>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="MX">Mexico</option>
                </>
              )}
              {formulaData.region === "EU" && (
                <>
                  <option value="UK">United Kingdom</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                  <option value="IT">Italy</option>
                  <option value="ES">Spain</option>
                </>
              )}
              {formulaData.region === "APAC" && (
                <>
                  <option value="CN">China</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                  <option value="AU">Australia</option>
                </>
              )}
              {formulaData.region === "LATAM" && (
                <>
                  <option value="BR">Brazil</option>
                  <option value="AR">Argentina</option>
                  <option value="CL">Chile</option>
                </>
              )}
            </select>
          </div>

          {/* Fragrance Dosage - for Dosage & Product Format section */}
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
              Fragrance Dosage (%, Actual) *
            </label>
            <div style={tw("relative")}>
              <input
                type="number"
                value={formulaData.fragranceDosage || ""}
                onChange={(e) =>
                  onDataChange({ fragranceDosage: parseFloat(e.target.value) })
                }
                disabled={isReadOnly}
                style={tw(
                  `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
                )}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <span style={tw("absolute right-3 top-2.5 text-gray-500")}>
                %
              </span>
            </div>
          </div>

          {/* Product Format */}
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
              Product Format *
            </label>
            <select
              value={formulaData.productFormat || ""}
              onChange={(e) => onDataChange({ productFormat: e.target.value })}
              disabled={isReadOnly}
              style={tw(
                `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 ${isReadOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
              )}
            >
              <option value="">Select format...</option>
              <option value="Spray">Spray</option>
              <option value="Splash">Splash</option>
              <option value="Roll-on">Roll-on</option>
              <option value="Solid">Solid</option>
              <option value="Oil">Oil</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormulaTypeSelection;
