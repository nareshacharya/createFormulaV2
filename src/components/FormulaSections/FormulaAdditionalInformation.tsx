/* eslint-disable jsx-a11y/label-has-associated-control */
import { tw } from "../../utils/tailwindToInline";

interface FormulaData {
  claims: string[];
  commentOnProduct: string;
  [key: string]: unknown;
}

interface Props {
  formulaData: FormulaData;
  onDataChange: (updates: Partial<FormulaData>) => void;
}

const FormulaAdditionalInformation = ({ formulaData, onDataChange }: Props) => {
  return (
    <div>
      <h4 style={tw("text-xs font-semibold text-gray-600 uppercase mb-4")}>
        Additional Information
      </h4>

      {/* Claims - Full Width */}
      <div style={tw("mb-3")}>
        <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
          Claims
        </label>
        <input
          type="text"
          value={formulaData.claims.join(", ")}
          onChange={(e) =>
            onDataChange({
              claims: e.target.value
                .split(",")
                .map((c) => c.trim())
                .filter((c) => c),
            })
          }
          style={tw(
            "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          )}
          placeholder="Enter claims (comma-separated)"
        />
      </div>

      {/* Comment on Product */}
      <div>
        <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
          Comment on Product
        </label>
        <textarea
          value={formulaData.commentOnProduct}
          onChange={(e) => onDataChange({ commentOnProduct: e.target.value })}
          style={tw(
            "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          )}
          placeholder="Enter comments..."
          rows={4}
        />
      </div>
    </div>
  );
};

export default FormulaAdditionalInformation;
