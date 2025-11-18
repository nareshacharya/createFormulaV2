/* eslint-disable jsx-a11y/label-has-associated-control */
import { tw } from "../../utils/tailwindToInline";

interface FormulaData {
  projectId: string;
  projectCurrencies: string[];
  projectDefaultCurrency: string;
  [key: string]: unknown;
}

interface Props {
  formulaData: FormulaData;
  onDataChange: (updates: Partial<FormulaData>) => void;
}

const FormulaProjectInformation = ({ formulaData, onDataChange }: Props) => {
  return (
    <div style={tw("space-y-5")}>
      <div>
        <h4 style={tw("text-xs font-semibold text-gray-600 uppercase mb-2")}>
          Project Information
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
      {/* Project ID */}
      <div>
        <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
          Project ID
        </label>
        <input
          type="text"
          value={formulaData.projectId || ""}
          onChange={(e) => onDataChange({ projectId: e.target.value })}
          style={tw(
            "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          )}
          placeholder="Enter or search for project..."
        />
      </div>

      {/* Project Currencies */}
      <div>
        <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
          Project Currencies
        </label>
        <input
          type="text"
          value={
            Array.isArray(formulaData.projectCurrencies)
              ? formulaData.projectCurrencies.join(", ")
              : ""
          }
          onChange={(e) =>
            onDataChange({
              projectCurrencies: e.target.value
                .split(",")
                .map((c) => c.trim())
                .filter((c) => c),
            })
          }
          style={tw(
            "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          )}
          placeholder="Comma-separated currencies"
          disabled
        />
      </div>

      {/* Project Default Currency */}
      <div>
        <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
          Default Currency
        </label>
        <input
          type="text"
          value={formulaData.projectDefaultCurrency || ""}
          onChange={(e) => onDataChange({ projectDefaultCurrency: e.target.value })}
          style={tw(
            "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          )}
          placeholder="Default currency"
          disabled
        />
      </div>
        </div>
      </div>
    </div>
  );
};

export default FormulaProjectInformation;
