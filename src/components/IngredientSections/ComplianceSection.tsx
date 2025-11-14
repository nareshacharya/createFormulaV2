import type { Ingredient } from "../../services/pega";
import Badge from "../Badge";
import { tw } from "../../utils/tailwindToInline";

interface ComplianceSectionProps {
  ingredient: Ingredient;
}

const ComplianceSection = ({
  ingredient: _ingredient,
}: ComplianceSectionProps) => {
  // Mock compliance data
  const mockData = {
    ifraStatus: "Approved",
    ifraCategory: "Category 1-11",
    ifraRestrictions: "Max concentration: 0.4% in finished products",
    euRegulation: "Compliant",
    fdaStatus: "GRAS",
    reachRegistration: "Registered",
    allergenDeclaration: "Contains: Limonene, Linalool",
    mac: 0.85, // Maximum Allowable Concentration
    regulatoryUpdates: [
      {
        date: "2024-01-10",
        authority: "IFRA",
        change: "Updated maximum concentration limits",
        status: "active",
      },
      {
        date: "2023-11-15",
        authority: "EU",
        change: "Added to Annex III restrictions",
        status: "active",
      },
    ],
  };

  const getComplianceStatus = (status: string) => {
    const statusMap = {
      Approved: "success",
      Compliant: "success",
      GRAS: "success",
      Registered: "success",
      Restricted: "warning",
      Prohibited: "error",
    } as const;

    return statusMap[status as keyof typeof statusMap] || "default";
  };

  const getMacStatus = (mac: number) => {
    if (mac < 0) return { variant: "error" as const, text: "Non-Compliant" };
    if (mac < 0.5) return { variant: "warning" as const, text: "Limited Use" };
    return { variant: "success" as const, text: "Compliant" };
  };

  const macStatus = getMacStatus(mockData.mac);

  return (
    <div style={tw("space-y-6")}>
      {/* Regulatory Status Overview */}
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          Regulatory Status
        </h3>
        <div style={tw("grid grid-cols-2 gap-4")}>
          <div style={tw("p-3 border border-gray-200 rounded-lg")}>
            <div style={tw("flex justify-between items-center")}>
              <span style={tw("text-sm font-medium text-gray-700")}>
                IFRA Status
              </span>
              <Badge variant={getComplianceStatus(mockData.ifraStatus)}>
                {mockData.ifraStatus}
              </Badge>
            </div>
          </div>
          <div style={tw("p-3 border border-gray-200 rounded-lg")}>
            <div style={tw("flex justify-between items-center")}>
              <span style={tw("text-sm font-medium text-gray-700")}>
                EU Regulation
              </span>
              <Badge variant={getComplianceStatus(mockData.euRegulation)}>
                {mockData.euRegulation}
              </Badge>
            </div>
          </div>
          <div style={tw("p-3 border border-gray-200 rounded-lg")}>
            <div style={tw("flex justify-between items-center")}>
              <span style={tw("text-sm font-medium text-gray-700")}>
                FDA Status
              </span>
              <Badge variant={getComplianceStatus(mockData.fdaStatus)}>
                {mockData.fdaStatus}
              </Badge>
            </div>
          </div>
          <div style={tw("p-3 border border-gray-200 rounded-lg")}>
            <div style={tw("flex justify-between items-center")}>
              <span style={tw("text-sm font-medium text-gray-700")}>REACH</span>
              <Badge variant={getComplianceStatus(mockData.reachRegistration)}>
                {mockData.reachRegistration}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* MAC (Maximum Allowable Concentration) */}
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          Maximum Allowable Concentration
        </h3>
        <div style={tw("p-4 border border-gray-200 rounded-lg")}>
          <div style={tw("flex items-center justify-between mb-2")}>
            <span style={tw("text-sm font-medium text-gray-700")}>
              Current MAC Value
            </span>
            <Badge variant={macStatus.variant}>{macStatus.text}</Badge>
          </div>
          <div style={tw("flex items-center space-x-4")}>
            <div style={tw("flex-1 bg-gray-200 rounded-full h-2")}>
              <div
                style={{
                  ...tw(
                    `h-2 rounded-full ${
                      mockData.mac < 0
                        ? "bg-red-500"
                        : mockData.mac < 0.5
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`
                  ),
                  width: `${Math.max(0, Math.min(100, mockData.mac * 100))}%`,
                }}
              ></div>
            </div>
            <span style={tw("text-sm font-medium text-gray-900")}>
              {mockData.mac}
            </span>
          </div>
        </div>
      </div>

      {/* IFRA Details */}
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          IFRA Guidelines
        </h3>
        <div style={tw("space-y-3")}>
          <div style={tw("p-3 bg-blue-50 border border-blue-200 rounded-lg")}>
            <label style={tw("block text-sm font-medium text-blue-800 mb-1")}>
              Category Classification
            </label>
            <p style={tw("text-sm text-blue-700")}>{mockData.ifraCategory}</p>
          </div>
          <div
            style={tw("p-3 bg-yellow-50 border border-yellow-200 rounded-lg")}
          >
            <label style={tw("block text-sm font-medium text-yellow-800 mb-1")}>
              Usage Restrictions
            </label>
            <p style={tw("text-sm text-yellow-700")}>
              {mockData.ifraRestrictions}
            </p>
          </div>
        </div>
      </div>

      {/* Allergen Information */}
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          Allergen Declaration
        </h3>
        <div style={tw("p-4 bg-orange-50 border border-orange-200 rounded-lg")}>
          <div style={tw("flex items-start")}>
            <i className="ri-alert-line text-orange-600 mt-0.5 mr-2"></i>
            <div>
              <p style={tw("text-sm text-orange-800 font-medium")}>
                Allergen Information
              </p>
              <p style={tw("text-sm text-orange-700 mt-1")}>
                {mockData.allergenDeclaration}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Regulatory Updates */}
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          Recent Regulatory Updates
        </h3>
        <div style={tw("space-y-3")}>
          {mockData.regulatoryUpdates.map((update, index) => (
            <div
              key={index}
              style={tw("p-3 border border-gray-200 rounded-lg")}
            >
              <div style={tw("flex items-start justify-between")}>
                <div style={tw("flex-1")}>
                  <div style={tw("flex items-center space-x-2 mb-1")}>
                    <Badge variant="info" size="sm">
                      {update.authority}
                    </Badge>
                    <span style={tw("text-xs text-gray-500")}>
                      {update.date}
                    </span>
                  </div>
                  <p style={tw("text-sm text-gray-900")}>{update.change}</p>
                </div>
                <Badge variant="success" size="sm">
                  Active
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplianceSection;
