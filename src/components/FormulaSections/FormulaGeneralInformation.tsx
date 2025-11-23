/* eslint-disable jsx-a11y/label-has-associated-control */
import { tw } from "../../utils/tailwindToInline";

interface FormulaData {
  category: string;
  region: string;
  country: string;
  [key: string]: unknown;
}

interface Props {
  formulaData: FormulaData;
  onDataChange: (updates: Partial<FormulaData>) => void;
}

const FormulaGeneralInformation = ({ formulaData, onDataChange }: Props) => {
  return (
    <div>
      {/* SECTION: General Information */}
      <div style={tw("mb-6")}>
        <h4 style={tw("text-xs font-semibold text-gray-600 uppercase mb-4")}>
          General Information
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
          {/* Category */}
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
              Category *
            </label>
            <select
              value={formulaData.category}
              onChange={(e) => onDataChange({ category: e.target.value })}
              style={tw(
                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
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
              style={tw(
                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
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
                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
              )}
              disabled={!formulaData.region}
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
        </div>
      </div>
    </div>
  );
};

export default FormulaGeneralInformation;
