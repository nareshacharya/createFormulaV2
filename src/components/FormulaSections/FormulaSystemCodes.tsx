/* eslint-disable jsx-a11y/label-has-associated-control */
import {
  FORMULA_TYPES,
} from "../../config/formulaTypes.config";
import { tw } from "../../utils/tailwindToInline";

interface FormulaData {
  formulaType: string;
  sapPlmCode: string;
  limsCode: string;
  [key: string]: unknown;
}

interface Props {
  formulaData: FormulaData;
  onDataChange: (updates: Partial<FormulaData>) => void;
}

const FormulaSystemCodes = ({ formulaData, onDataChange }: Props) => {
  return (
    <div style={tw("space-y-5")}>
      <div>
        <h4 style={tw("text-xs font-semibold text-gray-600 uppercase mb-2")}>
          System Codes
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
      {/* SAP PLM Code */}
      {(formulaData.formulaType === FORMULA_TYPES.BASE ||
        formulaData.formulaType === FORMULA_TYPES.PERFUMER) && (
        <div>
          <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
            SAP PLM Code
          </label>
          <input
            type="text"
            value={formulaData.sapPlmCode || ""}
            onChange={(e) => onDataChange({ sapPlmCode: e.target.value })}
            style={tw(
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
            placeholder="Enter SAP PLM code"
          />
        </div>
      )}

      {/* LIMS Code */}
      {(formulaData.formulaType === FORMULA_TYPES.BASE ||
        formulaData.formulaType === FORMULA_TYPES.ANALYTICAL) && (
        <div>
          <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
            LIMS Code
          </label>
          <input
            type="text"
            value={formulaData.limsCode || ""}
            onChange={(e) => onDataChange({ limsCode: e.target.value })}
            style={tw(
              "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
            placeholder="Enter LIMS code"
          />
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default FormulaSystemCodes;
