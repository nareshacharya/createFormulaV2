/* eslint-disable jsx-a11y/label-has-associated-control */
import { FORMULA_TYPES } from "../../config/formulaTypes.config";
import { tw } from "../../utils/tailwindToInline";

interface FormulaData {
  formulaType: string;
  projectId: string;
  projectName: string;
  projectCurrencies: string[];
  projectDefaultCurrency: string;
  sapPlmCode: string;
  limsCode: string;
  [key: string]: unknown;
}

interface Props {
  formulaData: FormulaData;
  onDataChange: (updates: Partial<FormulaData>) => void;
  isReadOnly?: boolean;
}

// Mock project data - in real app, this would come from API
const MOCK_PROJECTS = [
  {
    id: "PROJ-001",
    name: "Premium Line",
    currencies: ["USD", "EUR", "GBP"],
    defaultCurrency: "USD",
  },
  {
    id: "PROJ-002",
    name: "Luxury Collection",
    currencies: ["EUR", "CHF", "GBP"],
    defaultCurrency: "EUR",
  },
  {
    id: "PROJ-003",
    name: "Mass Market",
    currencies: ["USD", "CAD", "MXN"],
    defaultCurrency: "USD",
  },
];

// Major currencies for fallback
const MAJOR_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CHF",
  "CAD",
  "AUD",
  "NZD",
  "CNY",
  "INR",
  "MXN",
];

const FormulaProjectInformation = ({ formulaData, onDataChange, isReadOnly = false }: Props) => {
  // Get project details when selected
  const selectedProject = MOCK_PROJECTS.find(
    (p) => p.id === formulaData.projectId
  );

  // When project changes, auto-populate currencies, default currency, and project name
  const handleProjectChange = (projectId: string) => {
    const project = MOCK_PROJECTS.find((p) => p.id === projectId);
    if (project) {
      onDataChange({
        projectId,
        projectName: project.name,
        projectCurrencies: project.currencies,
        projectDefaultCurrency: project.defaultCurrency,
      });
    } else {
      onDataChange({
        projectId,
        projectName: "",
        projectCurrencies: [],
        projectDefaultCurrency: "",
      });
    }
  };

  return (
    <div>
      {/* SECTION: System Codes */}
      <div style={tw("mb-6")}>
        <h4 style={tw("text-xs font-semibold text-gray-600 uppercase mb-4")}>
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
                disabled={isReadOnly}
                style={tw(
                  `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
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
                disabled={isReadOnly}
                style={tw(
                  `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
                )}
                placeholder="Enter LIMS code"
              />
            </div>
          )}
        </div>
      </div>

      {/* SECTION: Project Information */}
      <div style={tw("border-t border-gray-200 pt-6")}>
        <h4 style={tw("text-xs font-semibold text-gray-600 uppercase mb-4")}>
          Project Information
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
          {/* Project Selection Dropdown */}
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
              Project
            </label>
            <select
              value={formulaData.projectId || ""}
              onChange={(e) => handleProjectChange(e.target.value)}
              disabled={isReadOnly}
              style={tw(
                `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 ${isReadOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
              )}
            >
              <option value="">Select a project (optional)...</option>
              {MOCK_PROJECTS.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.id})
                </option>
              ))}
            </select>
          </div>

          {/* Project ID Display (Auto-populated) */}
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
              Project ID
            </label>
            <input
              type="text"
              value={formulaData.projectId || ""}
              style={tw(
                "w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              )}
              disabled
              placeholder="Auto-populated from project selection"
            />
          </div>

          {/* Project Currencies (Auto-populated, Read-only) */}
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
              Available Currencies
            </label>
            <input
              type="text"
              value={
                Array.isArray(formulaData.projectCurrencies)
                  ? formulaData.projectCurrencies.join(", ")
                  : ""
              }
              style={tw(
                "w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              )}
              disabled
              placeholder="Auto-populated from project"
            />
          </div>

          {/* Default Currency (Cascading Dropdown) */}
          <div>
            <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
              Default Currency
            </label>
            <select
              value={formulaData.projectDefaultCurrency || ""}
              onChange={(e) =>
                onDataChange({ projectDefaultCurrency: e.target.value })
              }
              style={tw(
                `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 ${isReadOnly || !formulaData.projectId ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}`
              )}
              disabled={isReadOnly || !formulaData.projectId}
            >
              <option value="">
                {formulaData.projectId
                  ? "Select currency..."
                  : "Select project first"}
              </option>
              {selectedProject &&
                selectedProject.currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormulaProjectInformation;
