/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from "react";
import { isFieldVisible } from "../config/formulaCreation.config";
import {
  FORMULA_TYPES,
  getFormulaTypeLabel,
  getFormulaTypeDescription,
} from "../config/formulaTypes.config";
import type { FormulaType } from "../config/formulaTypes.config";
import type { Formula } from "../services/pega";
import {
  generateFormulaId,
  getCurrentUserInitials,
} from "../utils/idGeneration";
import { tw, mergeStyles } from "../utils/tailwindToInline";
import Button from "./Button";
import FormulaDataGrid from "./FormulaDataGrid";
import Modal from "./Modal";
import PillTabs from "./PillTabs";

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFormula: (formula: Omit<Formula, "id">) => void;
  onSelectFormula: (formula: Formula) => void;
  availableFormulas: Formula[];
  maxSelections?: number;
  currentSelections?: number;
  selectedFormulaIds?: string[];
}

const FormulaModal = ({
  isOpen,
  onClose,
  onCreateFormula,
  onSelectFormula,
  availableFormulas,
  maxSelections = 4,
  currentSelections = 0,
  selectedFormulaIds = [],
}: FormulaModalProps) => {
  const [activeTab, setActiveTab] = useState<"create" | "select">("select");
  const [activeFormSection, setActiveFormSection] = useState("identification");
  const [selectedFormulas, setSelectedFormulas] = useState<string[]>([]);
  const [newFormulaData, setNewFormulaData] = useState({
    formulaType: FORMULA_TYPES.BASE as FormulaType,
    name: "",
    fragranceName: "",
    sampleId: "",
    category: "",
    region: "",
    country: "",
    description: "",
    createdBy: "Current User",
    baseFormulaId: "",
    dilutionPercentage: undefined as number | undefined,
    fragranceDosage: undefined as number | undefined,
    version: 1,
    productFormat: "",
    limsCode: "",
    sapPlmCode: "",
    brand: "",
    claims: [] as string[],
    variant: "",
    supplier: "",
    productionCode: "",
    productionDate: "",
    recommendedDosage: undefined as number | undefined,
    dosageUnit: "",
    commentOnProduct: "",
    projectId: "" as string,
    projectCurrencies: [] as string[],
    projectDefaultCurrency: "" as string,
  });

  const remainingSelections = maxSelections - currentSelections;

  const handleClose = () => {
    setActiveTab("select");
    setActiveFormSection("identification");
    setSelectedFormulas([]);
    setNewFormulaData({
      formulaType: FORMULA_TYPES.BASE as FormulaType,
      name: "",
      fragranceName: "",
      sampleId: "",
      category: "",
      region: "",
      country: "",
      description: "",
      createdBy: "Current User",
      baseFormulaId: "",
      dilutionPercentage: undefined,
      fragranceDosage: undefined,
      version: 1,
      productFormat: "",
      limsCode: "",
      sapPlmCode: "",
      brand: "",
      claims: [],
      variant: "",
      supplier: "",
      productionCode: "",
      productionDate: "",
      recommendedDosage: undefined,
      dosageUnit: "",
      commentOnProduct: "",
      projectId: "",
      projectCurrencies: [],
      projectDefaultCurrency: "",
    });
    onClose();
  };

  const handleCreateNewFormula = () => {
    // Validate mandatory fields for all types
    if (
      !newFormulaData.category ||
      !newFormulaData.region ||
      !newFormulaData.country ||
      !newFormulaData.productFormat
    ) {
      return;
    }

    // Type-specific mandatory validation
    if (
      isFieldVisible("fragranceName", newFormulaData.formulaType) &&
      !newFormulaData.fragranceName
    ) {
      return;
    }

    if (
      isFieldVisible("sampleId", newFormulaData.formulaType) &&
      !newFormulaData.sampleId
    ) {
      return;
    }

    if (
      isFieldVisible("baseFormulaId", newFormulaData.formulaType) &&
      !newFormulaData.baseFormulaId
    ) {
      return;
    }

    if (
      isFieldVisible("dilutionPercentage", newFormulaData.formulaType) &&
      !newFormulaData.dilutionPercentage
    ) {
      return;
    }

    // Fragrance Dosage is mandatory for all types (per user story)
    if (!newFormulaData.fragranceDosage) {
      return;
    }

    // Generate type-specific display ID (shown on data grid)
    const typeSpecificId = generateFormulaId({
      formulaType: newFormulaData.formulaType,
      userInitials: getCurrentUserInitials(),
      existingFormulas: availableFormulas,
      // For now, creating new formulas (not versions)
      // Later: add support for baseFormulaId and isUserCopy when implementing versioning
    });

    // Generate universal formula ID (F00001v1) - not displayed on screen
    // Find highest F-sequence number across all formulas
    const fSequenceNumbers = availableFormulas
      .map((f) => {
        const match = f.id.match(/^F(\d{5})v\d+$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);
    const nextFSequence =
      (fSequenceNumbers.length > 0 ? Math.max(...fSequenceNumbers) : 0) + 1;
    const universalFormulaId = `F${nextFSequence
      .toString()
      .padStart(5, "0")}v1`;

    // Generate formula name based on type
    const formulaName =
      newFormulaData.formulaType === FORMULA_TYPES.ANALYTICAL
        ? `ANALYTICAL-${newFormulaData.sampleId}`
        : newFormulaData.fragranceName;

    // Extract version from generated ID (e.g., v1 from B00001v1)
    const versionMatch = typeSpecificId.match(/v(\d+)$/);
    const version = versionMatch ? `v${versionMatch[1]}` : "v1";

    // Determine which type-specific ID field to populate
    const typeSpecificIdFields: Record<string, Partial<Formula>> = {
      [FORMULA_TYPES.BASE]: { baseFormulaId: typeSpecificId },
      [FORMULA_TYPES.DILUTION]: { dilutionFormulaId: typeSpecificId },
      [FORMULA_TYPES.ANALYTICAL]: { analyticalFormulaId: typeSpecificId },
      [FORMULA_TYPES.PERFUMER]: { perfumerFormulaId: typeSpecificId },
    };

    const newFormula: Formula = {
      id: universalFormulaId, // Universal ID (F00001v1) - not displayed
      name: formulaName,
      version: version,
      status: "draft" as const,
      createdBy: newFormulaData.createdBy,
      lastUpdated: new Date().toISOString(),
      category: newFormulaData.category,
      totalPercentage: 0,
      ingredients: [],
      notes: {
        top: [],
        middle: [],
        base: [],
      },
      description: newFormulaData.description,
      formulaType: newFormulaData.formulaType,
      ...typeSpecificIdFields[newFormulaData.formulaType], // Add type-specific ID
    };
    onCreateFormula(newFormula);
    handleClose();
  };

  const [activeFormSection, setActiveFormSection] = useState<string>(
    "identification"
  );

  // Form sections for Create tab
  const formSections = [
    { id: "identification", label: "Identification", icon: "label" },
    {
      id: "generalAndDosage",
      label: "General & Dosage",
      icon: "description",
    },
    { id: "project", label: "Project", icon: "folder" },
    { id: "product", label: "Product", icon: "shopping_bag" },
    { id: "codes", label: "System Codes", icon: "code" },
    { id: "production", label: "Production", icon: "factory" },
    { id: "additional", label: "Additional", icon: "more" },
  ];

  const handleSelectFormulas = () => {
    const formulasToSelect = availableFormulas.filter((f) =>
      selectedFormulas.includes(f.id)
    );
    formulasToSelect.forEach((formula) => onSelectFormula(formula));
    handleClose();
  };

  const tabs = [
    { id: "select", label: "Select Existing", count: availableFormulas.length },
    { id: "create", label: "Create New" },
  ];

  const renderFormSection = () => {
    switch (activeFormSection) {
      case "identification":
        return (
          <div style={tw("space-y-4")}>
            {/* Formula Type Selection */}
            <div>
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
                      <strong style={tw("text-blue-300")}>
                        Base Formula:
                      </strong>{" "}
                      <span style={tw("text-gray-300")}>
                        {getFormulaTypeDescription(FORMULA_TYPES.BASE)}
                      </span>
                    </div>
                    <div style={{ marginBottom: "0.75rem" }}>
                      <strong style={tw("text-blue-300")}>
                        Dilution Formula:
                      </strong>{" "}
                      <span style={tw("text-gray-300")}>
                        {getFormulaTypeDescription(FORMULA_TYPES.DILUTION)}
                      </span>
                    </div>
                    <div style={{ marginBottom: "0.75rem" }}>
                      <strong style={tw("text-blue-300")}>
                        Analytical Formula:
                      </strong>{" "}
                      <span style={tw("text-gray-300")}>
                        {getFormulaTypeDescription(
                          FORMULA_TYPES.ANALYTICAL
                        )}
                      </span>
                    </div>
                    <div>
                      <strong style={tw("text-blue-300")}>
                        Perfumer Formula:
                      </strong>{" "}
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
                    onClick={() =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        formulaType: type,
                      }))
                    }
                    style={tw(
                      `p-3 rounded-lg border-2 transition-all ${
                        newFormulaData.formulaType === type
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`
                    )}
                  >
                    <div style={tw("flex items-center justify-between")}>
                      <div style={tw("font-medium text-sm text-gray-900")}>
                        {getFormulaTypeLabel(type)}
                      </div>
                      {newFormulaData.formulaType === type && (
                        <i className="ri-checkbox-circle-fill text-blue-500 text-base"></i>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fragrance Name / Sample ID - Full Width */}
            {isFieldVisible("fragranceName", newFormulaData.formulaType) && (
              <div>
                <label
                  style={tw("block text-sm font-medium text-gray-700 mb-2")}
                >
                  Fragrance Name *
                </label>
                <input
                  type="text"
                  value={newFormulaData.fragranceName}
                  onChange={(e) =>
                    setNewFormulaData((prev) => ({
                      ...prev,
                      fragranceName: e.target.value,
                    }))
                  }
                  style={tw(
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                  placeholder="Enter fragrance name"
                />
              </div>
            )}

            {isFieldVisible("sampleId", newFormulaData.formulaType) && (
              <div>
                <label
                  style={tw("block text-sm font-medium text-gray-700 mb-2")}
                >
                  Sample ID *
                </label>
                <input
                  type="text"
                  value={newFormulaData.sampleId}
                  onChange={(e) =>
                    setNewFormulaData((prev) => ({
                      ...prev,
                      sampleId: e.target.value,
                    }))
                  }
                  style={tw(
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                  placeholder="Enter sample ID"
                />
              </div>
            )}

            {/* Base Formula & Dilution % for DILUTION type */}
            {isFieldVisible("baseFormulaId", newFormulaData.formulaType) && (
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
                    value={newFormulaData.baseFormulaId || ""}
                    onChange={(e) =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        baseFormulaId: e.target.value,
                      }))
                    }
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
                      value={newFormulaData.dilutionPercentage || ""}
                      onChange={(e) =>
                        setNewFormulaData((prev) => ({
                          ...prev,
                          dilutionPercentage: parseFloat(e.target.value),
                        }))
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
                <label
                  style={tw("block text-sm font-medium text-gray-700 mb-2")}
                >
                  Formula Name
                </label>
                <input
                  type="text"
                  value={newFormulaData.name}
                  onChange={(e) =>
                    setNewFormulaData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  style={tw(
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                  placeholder="Enter formula name"
                />
              </div>

              {/* Formula Version */}
              <div>
                <label
                  style={tw("block text-sm font-medium text-gray-700 mb-2")}
                >
                  Formula Version
                </label>
                <input
                  type="number"
                  value={newFormulaData.version || 1}
                  onChange={(e) =>
                    setNewFormulaData((prev) => ({
                      ...prev,
                      version: parseInt(e.target.value, 10),
                    }))
                  }
                  style={tw(
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                  min="1"
                />
              </div>
            </div>
          </div>
        );

      case "generalAndDosage":
        return (
          <div style={tw("space-y-4")}>
            {/* General Information Fields */}
            <div>
              <h4 style={tw("text-xs font-semibold text-gray-600 uppercase mb-3")}>
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
                  <label
                    style={tw("block text-sm font-medium text-gray-700 mb-2")}
                  >
                    Category *
                  </label>
                  <select
                    value={newFormulaData.category}
                    onChange={(e) =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
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
                  <label
                    style={tw("block text-sm font-medium text-gray-700 mb-2")}
                  >
                    Region *
                  </label>
                  <select
                    value={newFormulaData.region}
                    onChange={(e) =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        region: e.target.value,
                      }))
                    }
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
                  <label
                    style={tw("block text-sm font-medium text-gray-700 mb-2")}
                  >
                    Country *
                  </label>
                  <select
                    value={newFormulaData.country}
                    onChange={(e) =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    style={tw(
                      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                    )}
                    disabled={!newFormulaData.region}
                  >
                    <option value="">Select country...</option>
                    {newFormulaData.region === "NA" && (
                      <>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="MX">Mexico</option>
                      </>
                    )}
                    {newFormulaData.region === "EU" && (
                      <>
                        <option value="UK">United Kingdom</option>
                        <option value="FR">France</option>
                        <option value="DE">Germany</option>
                        <option value="IT">Italy</option>
                        <option value="ES">Spain</option>
                      </>
                    )}
                    {newFormulaData.region === "APAC" && (
                      <>
                        <option value="CN">China</option>
                        <option value="JP">Japan</option>
                        <option value="KR">South Korea</option>
                        <option value="AU">Australia</option>
                      </>
                    )}
                    {newFormulaData.region === "LATAM" && (
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

            {/* Dosage & Format Fields */}
            <div>
              <h4 style={tw("text-xs font-semibold text-gray-600 uppercase mb-3")}>
                Dosage & Product Format
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                }}
              >
                {/* Fragrance Dosage - Mandatory for all types */}
                <div>
                  <label
                    style={tw("block text-sm font-medium text-gray-700 mb-2")}
                  >
                    Fragrance Dosage (%, Actual) *
                  </label>
                  <div style={tw("relative")}>
                    <input
                      type="number"
                      value={newFormulaData.fragranceDosage || ""}
                      onChange={(e) =>
                        setNewFormulaData((prev) => ({
                          ...prev,
                          fragranceDosage: parseFloat(e.target.value),
                        }))
                      }
                      style={tw(
                        "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      )}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    <span
                      style={tw("absolute right-3 top-2.5 text-gray-500")}
                    >
                      %
                    </span>
                  </div>
                </div>

                {/* Product Format - Mandatory for all types */}
                <div>
                  <label
                    style={tw("block text-sm font-medium text-gray-700 mb-2")}
                  >
                    Product Format *
                  </label>
                  <select
                    value={newFormulaData.productFormat || ""}
                    onChange={(e) =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        productFormat: e.target.value,
                      }))
                    }
                    style={tw(
                      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
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

      case "project":
        return (
          <div style={tw("space-y-4")}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
              }}
            >
              {/* Project ID */}
              <div>
                <label
                  style={tw("block text-sm font-medium text-gray-700 mb-2")}
                >
                  Project ID
                </label>
                <input
                  type="text"
                  value={newFormulaData.projectId || ""}
                  onChange={(e) =>
                    setNewFormulaData((prev) => ({
                      ...prev,
                      projectId: e.target.value,
                    }))
                  }
                  style={tw(
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                  placeholder="Enter or search for project..."
                />
              </div>

              {/* Project Currencies */}
              <div>
                <label
                  style={tw("block text-sm font-medium text-gray-700 mb-2")}
                >
                  Project Currencies
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(newFormulaData.projectCurrencies)
                      ? newFormulaData.projectCurrencies.join(", ")
                      : ""
                  }
                  onChange={(e) =>
                    setNewFormulaData((prev) => ({
                      ...prev,
                      projectCurrencies: e.target.value
                        .split(",")
                        .map((c) => c.trim())
                        .filter((c) => c),
                    }))
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
                <label
                  style={tw("block text-sm font-medium text-gray-700 mb-2")}
                >
                  Default Currency
                </label>
                <input
                  type="text"
                  value={newFormulaData.projectDefaultCurrency || ""}
                  onChange={(e) =>
                    setNewFormulaData((prev) => ({
                      ...prev,
                      projectDefaultCurrency: e.target.value,
                    }))
                  }
                  style={tw(
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  )}
                  placeholder="Default currency"
                  disabled
                />
              </div>
            </div>
          </div>
        );

      case "product":
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
            }}
          >
            {/* Brand - Optional */}
            <div>
              <label
                style={tw("block text-sm font-medium text-gray-700 mb-2")}
              >
                Brand
              </label>
              <input
                type="text"
                value={newFormulaData.brand || ""}
                onChange={(e) =>
                  setNewFormulaData((prev) => ({
                    ...prev,
                    brand: e.target.value,
                  }))
                }
                style={tw(
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
                placeholder="Enter brand"
              />
            </div>

            {/* Variant - Optional */}
            <div>
              <label
                style={tw("block text-sm font-medium text-gray-700 mb-2")}
              >
                Variant
              </label>
              <input
                type="text"
                value={newFormulaData.variant || ""}
                onChange={(e) =>
                  setNewFormulaData((prev) => ({
                    ...prev,
                    variant: e.target.value,
                  }))
                }
                style={tw(
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
                placeholder="Enter variant name"
              />
            </div>

            {/* Supplier - Optional */}
            <div>
              <label
                style={tw("block text-sm font-medium text-gray-700 mb-2")}
              >
                Supplier
              </label>
              <input
                type="text"
                value={newFormulaData.supplier || ""}
                onChange={(e) =>
                  setNewFormulaData((prev) => ({
                    ...prev,
                    supplier: e.target.value,
                  }))
                }
                style={tw(
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
                placeholder="Enter supplier"
              />
            </div>
          </div>
        );

      case "codes":
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
            }}
          >
            {/* SAP PLM Code */}
            {(newFormulaData.formulaType === FORMULA_TYPES.BASE ||
              newFormulaData.formulaType === FORMULA_TYPES.PERFUMER) && (
              <div>
                <label
                  style={tw("block text-sm font-medium text-gray-700 mb-2")}
                >
                  SAP PLM Code
                </label>
                <input
                  type="text"
                  value={newFormulaData.sapPlmCode || ""}
                  onChange={(e) =>
                    setNewFormulaData((prev) => ({
                      ...prev,
                      sapPlmCode: e.target.value,
                    }))
                  }
                  style={tw(
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                  placeholder="Enter SAP PLM code"
                />
              </div>
            )}

            {/* LIMS Code */}
            {(newFormulaData.formulaType === FORMULA_TYPES.BASE ||
              newFormulaData.formulaType === FORMULA_TYPES.ANALYTICAL) && (
              <div>
                <label
                  style={tw("block text-sm font-medium text-gray-700 mb-2")}
                >
                  LIMS Code
                </label>
                <input
                  type="text"
                  value={newFormulaData.limsCode || ""}
                  onChange={(e) =>
                    setNewFormulaData((prev) => ({
                      ...prev,
                      limsCode: e.target.value,
                    }))
                  }
                  style={tw(
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                  placeholder="Enter LIMS code"
                />
              </div>
            )}
          </div>
        );

      case "production":
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
            }}
          >
            {/* Product Production Code */}
            <div>
              <label
                style={tw("block text-sm font-medium text-gray-700 mb-2")}
              >
                Product Production Code
              </label>
              <input
                type="text"
                value={newFormulaData.productionCode || ""}
                onChange={(e) =>
                  setNewFormulaData((prev) => ({
                    ...prev,
                    productionCode: e.target.value,
                  }))
                }
                style={tw(
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
                placeholder="Enter production code"
              />
            </div>

            {/* Product Production Date */}
            <div>
              <label
                style={tw("block text-sm font-medium text-gray-700 mb-2")}
              >
                Product Production Date
              </label>
              <input
                type="date"
                value={newFormulaData.productionDate || ""}
                onChange={(e) =>
                  setNewFormulaData((prev) => ({
                    ...prev,
                    productionDate: e.target.value,
                  }))
                }
                style={tw(
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
              />
            </div>

            {/* Recommended Product Dosage */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label
                style={tw("block text-sm font-medium text-gray-700 mb-2")}
              >
                Recommended Product Dosage
              </label>
              <div style={tw("flex gap-2")}>
                <input
                  type="number"
                  value={newFormulaData.recommendedDosage || ""}
                  onChange={(e) =>
                    setNewFormulaData((prev) => ({
                      ...prev,
                      recommendedDosage: parseFloat(e.target.value),
                    }))
                  }
                  style={tw(
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <select
                  value={newFormulaData.dosageUnit || ""}
                  onChange={(e) =>
                    setNewFormulaData((prev) => ({
                      ...prev,
                      dosageUnit: e.target.value,
                    }))
                  }
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
        );

      case "additional":
        return (
          <div style={tw("space-y-4")}>
            {/* Claims - Full Width */}
            <div>
              <label
                style={tw("block text-sm font-medium text-gray-700 mb-2")}
              >
                Claims
              </label>
              <input
                type="text"
                value={newFormulaData.claims.join(", ")}
                onChange={(e) =>
                  setNewFormulaData((prev) => ({
                    ...prev,
                    claims: e.target.value
                      .split(",")
                      .map((c) => c.trim())
                      .filter((c) => c),
                  }))
                }
                style={tw(
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
                placeholder="Enter claims (comma-separated)"
              />
            </div>

            {/* Comment on Product */}
            <div>
              <label
                style={tw("block text-sm font-medium text-gray-700 mb-2")}
              >
                Comment on Product
              </label>
              <textarea
                value={newFormulaData.commentOnProduct}
                onChange={(e) =>
                  setNewFormulaData((prev) => ({
                    ...prev,
                    commentOnProduct: e.target.value,
                  }))
                }
                style={tw(
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
                placeholder="Enter comments..."
                rows={4}
              />
            </div>

            {/* Info Banner - Only for special types */}
            {newFormulaData.formulaType === FORMULA_TYPES.PERFUMER && (
              <div style={tw("bg-green-50 border border-green-200 rounded-lg p-3")}>
                <div style={tw("flex items-start")}>
                  <i className="ri-check-line text-green-600 mr-2 text-lg mt-0.5"></i>
                  <div style={tw("text-sm text-green-800")}>
                    <strong>Perfumer Formula:</strong> This formula type allows
                    perfumers to design complete fragrance compositions with
                    full control over ingredient selection and concentrations.
                  </div>
                </div>
              </div>
            )}
            {newFormulaData.formulaType === FORMULA_TYPES.ANALYTICAL && (
              <div style={tw("bg-amber-50 border border-amber-200 rounded-lg p-3")}>
                <div style={tw("flex items-start")}>
                  <i className="ri-alert-line text-amber-600 mr-2 text-lg mt-0.5"></i>
                  <div style={tw("text-sm text-amber-800")}>
                    <strong>Analytical Formula:</strong> This is for laboratory
                    testing purposes. Ensure all safety protocols are followed.
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };
        {/* Formula Type Selection */}
        <div>
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
                onClick={() =>
                  setNewFormulaData((prev) => ({ ...prev, formulaType: type }))
                }
                style={tw(
                  `p-3 rounded-lg border-2 transition-all ${
                    newFormulaData.formulaType === type
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`
                )}
              >
                <div style={tw("flex items-center justify-between")}>
                  <div style={tw("font-medium text-sm text-gray-900")}>
                    {getFormulaTypeLabel(type)}
                  </div>
                  {newFormulaData.formulaType === type && (
                    <i className="ri-checkbox-circle-fill text-blue-500 text-base"></i>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Formula Identification Fields */}
        <div style={tw("space-y-4")}>
          {/* Fragrance Name / Sample ID - Full Width */}
          {isFieldVisible("fragranceName", newFormulaData.formulaType) && (
            <div>
              <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
                Fragrance Name *
              </label>
              <input
                type="text"
                value={newFormulaData.fragranceName}
                onChange={(e) =>
                  setNewFormulaData((prev) => ({
                    ...prev,
                    fragranceName: e.target.value,
                  }))
                }
                style={tw(
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
                placeholder="Enter fragrance name"
              />
            </div>
          )}

          {isFieldVisible("sampleId", newFormulaData.formulaType) && (
            <div>
              <label style={tw("block text-sm font-medium text-gray-700 mb-2")}>
                Sample ID *
              </label>
              <input
                type="text"
                value={newFormulaData.sampleId}
                onChange={(e) =>
                  setNewFormulaData((prev) => ({
                    ...prev,
                    sampleId: e.target.value,
                  }))
                }
                style={tw(
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
                placeholder="Enter sample ID"
              />
            </div>
          )}

          {/* Base Formula & Dilution % for DILUTION type */}
          {isFieldVisible("baseFormulaId", newFormulaData.formulaType) && (
            <div style={tw("grid grid-cols-2 gap-4")}>
              <div>
                <label
                  style={tw("block text-sm font-medium text-gray-700 mb-2")}
                >
                  Base Formula *
                </label>
                <input
                  type="text"
                  value={newFormulaData.baseFormulaId || ""}
                  onChange={(e) =>
                    setNewFormulaData((prev) => ({
                      ...prev,
                      baseFormulaId: e.target.value,
                    }))
                  }
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
                    value={newFormulaData.dilutionPercentage || ""}
                    onChange={(e) =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        dilutionPercentage: parseFloat(e.target.value),
                      }))
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
                value={newFormulaData.name}
                onChange={(e) =>
                  setNewFormulaData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
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
                value={newFormulaData.version || 1}
                onChange={(e) =>
                  setNewFormulaData((prev) => ({
                    ...prev,
                    version: parseInt(e.target.value, 10),
                  }))
                }
                style={tw(
                  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                )}
                min="1"
              />
            </div>
          </div>
        </div>

        {/* General Information & Dosage Section (Combined - Mandatory) */}
        <div style={tw("border border-gray-200 rounded-lg")}>
          <button
            type="button"
            onClick={() => toggleSection("generalAndDosage")}
            style={tw(
              "w-full flex items-center justify-between p-3 hover:bg-gray-50 hover:rounded-tl-lg hover:rounded-tr-lg transition-colors"
            )}
          >
            <h3 style={tw("text-sm font-semibold text-gray-900")}>
              General Information & Dosage *
            </h3>
            <i
              className={`ri-arrow-${
                expandedSections.generalAndDosage ? "up" : "down"
              }-s-line text-gray-500 text-lg`}
            ></i>
          </button>
          {expandedSections.generalAndDosage && (
            <div style={tw("p-4 space-y-4")}>
              {/* General Information Fields */}
              <div>
                <h4
                  style={tw(
                    "text-xs font-semibold text-gray-600 uppercase mb-3"
                  )}
                >
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
                    <label
                      style={tw("block text-sm font-medium text-gray-700 mb-2")}
                    >
                      Category *
                    </label>
                    <select
                      value={newFormulaData.category}
                      onChange={(e) =>
                        setNewFormulaData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
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
                    <label
                      style={tw("block text-sm font-medium text-gray-700 mb-2")}
                    >
                      Region *
                    </label>
                    <select
                      value={newFormulaData.region}
                      onChange={(e) =>
                        setNewFormulaData((prev) => ({
                          ...prev,
                          region: e.target.value,
                        }))
                      }
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
                    <label
                      style={tw("block text-sm font-medium text-gray-700 mb-2")}
                    >
                      Country *
                    </label>
                    <select
                      value={newFormulaData.country}
                      onChange={(e) =>
                        setNewFormulaData((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      style={tw(
                        "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                      )}
                      disabled={!newFormulaData.region}
                    >
                      <option value="">Select country...</option>
                      {newFormulaData.region === "NA" && (
                        <>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="MX">Mexico</option>
                        </>
                      )}
                      {newFormulaData.region === "EU" && (
                        <>
                          <option value="UK">United Kingdom</option>
                          <option value="FR">France</option>
                          <option value="DE">Germany</option>
                          <option value="IT">Italy</option>
                          <option value="ES">Spain</option>
                        </>
                      )}
                      {newFormulaData.region === "APAC" && (
                        <>
                          <option value="CN">China</option>
                          <option value="JP">Japan</option>
                          <option value="KR">South Korea</option>
                          <option value="AU">Australia</option>
                        </>
                      )}
                      {newFormulaData.region === "LATAM" && (
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

              {/* Dosage & Format Fields */}
              <div>
                <h4
                  style={tw(
                    "text-xs font-semibold text-gray-600 uppercase mb-3"
                  )}
                >
                  Dosage & Product Format
                </h4>
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
                      Fragrance Dosage (%, Actual) *
                    </label>
                    <div style={tw("relative")}>
                      <input
                        type="number"
                        value={newFormulaData.fragranceDosage || ""}
                        onChange={(e) =>
                          setNewFormulaData((prev) => ({
                            ...prev,
                            fragranceDosage: parseFloat(e.target.value),
                          }))
                        }
                        style={tw(
                          "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        )}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <span
                        style={tw("absolute right-3 top-2.5 text-gray-500")}
                      >
                        %
                      </span>
                    </div>
                  </div>

                  {/* Product Format - Mandatory for all types */}
                  <div>
                    <label
                      style={tw("block text-sm font-medium text-gray-700 mb-2")}
                    >
                      Product Format *
                    </label>
                    <select
                      value={newFormulaData.productFormat || ""}
                      onChange={(e) =>
                        setNewFormulaData((prev) => ({
                          ...prev,
                          productFormat: e.target.value,
                        }))
                      }
                      style={tw(
                        "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
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
          )}
        </div>

        {/* Project Information Section */}
        <div style={tw("border border-gray-200 rounded-lg")}>
          <button
            type="button"
            onClick={() => toggleSection("project")}
            style={tw(
              "w-full flex items-center justify-between p-3 hover:bg-gray-50 hover:rounded-tl-lg hover:rounded-tr-lg transition-colors"
            )}
          >
            <h3 style={tw("text-sm font-semibold text-gray-900")}>
              Project Information
            </h3>
            <i
              className={`ri-arrow-${
                expandedSections.project ? "up" : "down"
              }-s-line text-gray-500 text-lg`}
            ></i>
          </button>
          {expandedSections.project && (
            <div style={tw("p-4 space-y-4")}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                }}
              >
                {/* Project ID */}
                <div>
                  <label
                    style={tw("block text-sm font-medium text-gray-700 mb-2")}
                  >
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={newFormulaData.projectId || ""}
                    onChange={(e) =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        projectId: e.target.value,
                      }))
                    }
                    style={tw(
                      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    )}
                    placeholder="Enter or search for project..."
                  />
                </div>

                {/* Project Currencies */}
                <div>
                  <label
                    style={tw("block text-sm font-medium text-gray-700 mb-2")}
                  >
                    Project Currencies
                  </label>
                  <input
                    type="text"
                    value={
                      Array.isArray(newFormulaData.projectCurrencies)
                        ? newFormulaData.projectCurrencies.join(", ")
                        : ""
                    }
                    onChange={(e) =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        projectCurrencies: e.target.value
                          .split(",")
                          .map((c) => c.trim())
                          .filter((c) => c),
                      }))
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
                  <label
                    style={tw("block text-sm font-medium text-gray-700 mb-2")}
                  >
                    Default Currency
                  </label>
                  <input
                    type="text"
                    value={newFormulaData.projectDefaultCurrency || ""}
                    onChange={(e) =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        projectDefaultCurrency: e.target.value,
                      }))
                    }
                    style={tw(
                      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    )}
                    placeholder="Default currency"
                    disabled
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Information Section */}
        <div style={tw("border border-gray-200 rounded-lg")}>
          <button
            type="button"
            onClick={() => toggleSection("product")}
            style={tw(
              "w-full flex items-center justify-between p-3 hover:bg-gray-50 hover:rounded-tl-lg hover:rounded-tr-lg transition-colors"
            )}
          >
            <h3 style={tw("text-sm font-semibold text-gray-900")}>
              Product Information
            </h3>
            <i
              className={`ri-arrow-${
                expandedSections.product ? "up" : "down"
              }-s-line text-gray-500 text-lg`}
            ></i>
          </button>
          {expandedSections.product && (
            <div style={tw("p-4")}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                }}
              >
                {/* Brand - Optional */}
                <div>
                  <label
                    style={tw("block text-sm font-medium text-gray-700 mb-2")}
                  >
                    Brand
                  </label>
                  <input
                    type="text"
                    value={newFormulaData.brand || ""}
                    onChange={(e) =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        brand: e.target.value,
                      }))
                    }
                    style={tw(
                      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    )}
                    placeholder="Enter brand"
                  />
                </div>

                {/* Variant - Optional */}
                <div>
                  <label
                    style={tw("block text-sm font-medium text-gray-700 mb-2")}
                  >
                    Variant
                  </label>
                  <input
                    type="text"
                    value={newFormulaData.variant || ""}
                    onChange={(e) =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        variant: e.target.value,
                      }))
                    }
                    style={tw(
                      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    )}
                    placeholder="Enter variant name"
                  />
                </div>

                {/* Supplier - Optional */}
                <div>
                  <label
                    style={tw("block text-sm font-medium text-gray-700 mb-2")}
                  >
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={newFormulaData.supplier || ""}
                    onChange={(e) =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        supplier: e.target.value,
                      }))
                    }
                    style={tw(
                      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    )}
                    placeholder="Enter supplier"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Codes Section */}
        <div style={tw("border border-gray-200 rounded-lg")}>
          <button
            type="button"
            onClick={() => toggleSection("codes")}
            style={tw(
              "w-full flex items-center justify-between p-3 hover:bg-gray-50 hover:rounded-tl-lg hover:rounded-tr-lg transition-colors"
            )}
          >
            <h3 style={tw("text-sm font-semibold text-gray-900")}>
              System Codes
            </h3>
            <i
              className={`ri-arrow-${
                expandedSections.codes ? "up" : "down"
              }-s-line text-gray-500 text-lg`}
            ></i>
          </button>
          {expandedSections.codes && (
            <div style={tw("p-4")}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                }}
              >
                {/* SAP PLM Code */}
                {(newFormulaData.formulaType === FORMULA_TYPES.BASE ||
                  newFormulaData.formulaType === FORMULA_TYPES.PERFUMER) && (
                  <div>
                    <label
                      style={tw("block text-sm font-medium text-gray-700 mb-2")}
                    >
                      SAP PLM Code
                    </label>
                    <input
                      type="text"
                      value={newFormulaData.sapPlmCode || ""}
                      onChange={(e) =>
                        setNewFormulaData((prev) => ({
                          ...prev,
                          sapPlmCode: e.target.value,
                        }))
                      }
                      style={tw(
                        "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      )}
                      placeholder="Enter SAP PLM code"
                    />
                  </div>
                )}

                {/* LIMS Code */}
                {(newFormulaData.formulaType === FORMULA_TYPES.BASE ||
                  newFormulaData.formulaType === FORMULA_TYPES.ANALYTICAL) && (
                  <div>
                    <label
                      style={tw("block text-sm font-medium text-gray-700 mb-2")}
                    >
                      LIMS Code
                    </label>
                    <input
                      type="text"
                      value={newFormulaData.limsCode || ""}
                      onChange={(e) =>
                        setNewFormulaData((prev) => ({
                          ...prev,
                          limsCode: e.target.value,
                        }))
                      }
                      style={tw(
                        "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      )}
                      placeholder="Enter LIMS code"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Production Information Section */}
        <div style={tw("border border-gray-200 rounded-lg")}>
          <button
            type="button"
            onClick={() => toggleSection("production")}
            style={tw(
              "w-full flex items-center justify-between p-3 hover:bg-gray-50 hover:rounded-tl-lg hover:rounded-tr-lg transition-colors"
            )}
          >
            <h3 style={tw("text-sm font-semibold text-gray-900")}>
              Production Information
            </h3>
            <i
              className={`ri-arrow-${
                expandedSections.production ? "up" : "down"
              }-s-line text-gray-500 text-lg`}
            ></i>
          </button>
          {expandedSections.production && (
            <div style={tw("p-4")}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                }}
              >
                {/* Product Production Code */}
                <div>
                  <label
                    style={tw("block text-sm font-medium text-gray-700 mb-2")}
                  >
                    Product Production Code
                  </label>
                  <input
                    type="text"
                    value={newFormulaData.productionCode || ""}
                    onChange={(e) =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        productionCode: e.target.value,
                      }))
                    }
                    style={tw(
                      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    )}
                    placeholder="Enter production code"
                  />
                </div>

                {/* Product Production Date */}
                <div>
                  <label
                    style={tw("block text-sm font-medium text-gray-700 mb-2")}
                  >
                    Product Production Date
                  </label>
                  <input
                    type="date"
                    value={newFormulaData.productionDate || ""}
                    onChange={(e) =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        productionDate: e.target.value,
                      }))
                    }
                    style={tw(
                      "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    )}
                  />
                </div>

                {/* Recommended Product Dosage */}
                <div>
                  <label
                    style={tw("block text-sm font-medium text-gray-700 mb-2")}
                  >
                    Recommended Product Dosage
                  </label>
                  <div style={tw("flex gap-2")}>
                    <input
                      type="number"
                      value={newFormulaData.recommendedDosage || ""}
                      onChange={(e) =>
                        setNewFormulaData((prev) => ({
                          ...prev,
                          recommendedDosage: parseFloat(e.target.value),
                        }))
                      }
                      style={tw(
                        "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      )}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    <select
                      value={newFormulaData.dosageUnit || ""}
                      onChange={(e) =>
                        setNewFormulaData((prev) => ({
                          ...prev,
                          dosageUnit: e.target.value,
                        }))
                      }
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
          )}
        </div>

        {/* Additional Information Section */}
        <div style={tw("border border-gray-200 rounded-lg")}>
          <button
            type="button"
            onClick={() => toggleSection("additional")}
            style={tw(
              "w-full flex items-center justify-between p-3 hover:bg-gray-50 hover:rounded-tl-lg hover:rounded-tr-lg transition-colors"
            )}
          >
            <h3 style={tw("text-sm font-semibold text-gray-900")}>
              Additional Information
            </h3>
            <i
              className={`ri-arrow-${
                expandedSections.additional ? "up" : "down"
              }-s-line text-gray-500 text-lg`}
            ></i>
          </button>
          {expandedSections.additional && (
            <div style={tw("p-4 space-y-4")}>
              {/* Claims - Full Width */}
              <div>
                <label
                  style={tw("block text-sm font-medium text-gray-700 mb-2")}
                >
                  Claims
                </label>
                <input
                  type="text"
                  value={newFormulaData.claims.join(", ")}
                  onChange={(e) =>
                    setNewFormulaData((prev) => ({
                      ...prev,
                      claims: e.target.value
                        .split(",")
                        .map((c) => c.trim())
                        .filter((c) => c),
                    }))
                  }
                  style={tw(
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                  placeholder="Enter claims (comma-separated)"
                />
              </div>

              {/* Comment on Product */}
              <div>
                <label
                  style={tw("block text-sm font-medium text-gray-700 mb-2")}
                >
                  Comment on Product
                </label>
                <textarea
                  value={newFormulaData.commentOnProduct}
                  onChange={(e) =>
                    setNewFormulaData((prev) => ({
                      ...prev,
                      commentOnProduct: e.target.value,
                    }))
                  }
                  rows={2}
                  style={tw(
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  )}
                  placeholder="Other useful information on pack (optional)"
                />
              </div>

              {/* Description - Full Width */}
              <div>
                <label
                  style={tw("block text-sm font-medium text-gray-700 mb-2")}
                >
                  Description
                </label>
                <textarea
                  value={newFormulaData.description}
                  onChange={(e) =>
                    setNewFormulaData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  style={tw(
                    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  )}
                  placeholder="Enter formula description (optional)"
                />
              </div>
            </div>
          )}
        </div>

        {/* Info Banner - Only for special types */}
        {newFormulaData.formulaType === FORMULA_TYPES.PERFUMER && (
          <div style={tw("bg-green-50 border border-green-200 rounded-lg p-3")}>
            <div style={tw("flex items-start")}>
              <i className="ri-sparkle-line text-green-600 text-lg mr-2 mt-0.5"></i>
              <div style={tw("text-sm text-green-700")}>
                <strong style={tw("font-medium")}>
                  Auto-ID Generation Enabled
                </strong>
                <div style={tw("mt-1 text-green-600")}>
                  This formula will automatically generate a Perfumer Formula ID
                  (PERF-YYYYMMDD-####)
                </div>
              </div>
            </div>
          </div>
        )}
        {newFormulaData.formulaType === FORMULA_TYPES.ANALYTICAL && (
          <div style={tw("bg-amber-50 border border-amber-200 rounded-lg p-3")}>
            <div style={tw("flex items-start")}>
              <i className="ri-flask-line text-amber-600 text-lg mr-2 mt-0.5"></i>
              <div style={tw("text-sm text-amber-700")}>
                <strong style={tw("font-medium")}>Analytical Formula</strong>
                <div style={tw("mt-1 text-amber-600")}>
                  Requires Sample ID for laboratory analysis and quality control
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const SelectFormulaForm = () => (
    <div style={tw("px-6 pt-3 pb-6")}>
      <div style={tw("space-y-4")}>
        {remainingSelections > 0 ? (
          <FormulaDataGrid
            formulas={availableFormulas}
            selectedFormulas={selectedFormulas}
            onSelectionChange={setSelectedFormulas}
            maxSelections={remainingSelections}
            highlightedFormulas={selectedFormulaIds} // Pass already selected formulas to highlight
          />
        ) : (
          <div style={tw("text-center py-8")}>
            <div style={tw("text-gray-500 mb-2")}>
              <i className="ri-information-line text-2xl"></i>
            </div>
            <div style={tw("text-sm text-gray-600")}>
              Maximum number of formula columns ({maxSelections}) reached.
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const getFooterActions = () => {
    if (activeTab === "create") {
      return (
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateNewFormula}
            disabled={
              !newFormulaData.category ||
              !newFormulaData.region ||
              !newFormulaData.country ||
              !newFormulaData.productFormat ||
              !newFormulaData.fragranceDosage ||
              (isFieldVisible("fragranceName", newFormulaData.formulaType) &&
                !newFormulaData.fragranceName.trim()) ||
              (isFieldVisible("sampleId", newFormulaData.formulaType) &&
                !newFormulaData.sampleId.trim()) ||
              (isFieldVisible("baseFormulaId", newFormulaData.formulaType) &&
                !newFormulaData.baseFormulaId.trim()) ||
              (isFieldVisible(
                "dilutionPercentage",
                newFormulaData.formulaType
              ) &&
                !newFormulaData.dilutionPercentage)
            }
          >
            Create Formula
          </Button>
        </div>
      );
    }

    if (activeTab === "select") {
      if (remainingSelections === 0) {
        return (
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        );
      }

      return (
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSelectFormulas}
            disabled={selectedFormulas.length === 0}
          >
            Add {selectedFormulas.length} Formula
            {selectedFormulas.length !== 1 ? "s" : ""}
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Formula"
      size="4xl"
      footerActions={getFooterActions()}
      noPadding
    >
      <div className="space-y-0">
        <div className="px-6 pt-6 pb-3">
          <PillTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as "create" | "select")}
          />
        </div>

        <div className="flex" style={{ minHeight: "500px" }}>
          {activeTab === "create" && (
            <>
              {/* Vertical Sidebar Navigation */}
              <div
                style={mergeStyles(
                  tw("bg-gray-50 border-r border-gray-200 flex-shrink-0"),
                  { width: "14rem" }
                )}
              >
                <nav style={{ padding: "1rem" }}>
                  {formSections.map((section) => {
                    const isActive = activeFormSection === section.id;
                    return (
                      <button
                        type="button"
                        key={section.id}
                        onClick={() => setActiveFormSection(section.id)}
                        style={mergeStyles(
                          tw(
                            "w-full flex items-center text-sm font-medium rounded-md cursor-pointer"
                          ),
                          {
                            paddingLeft: "0.75rem",
                            paddingRight: "0.75rem",
                            paddingTop: "0.625rem",
                            paddingBottom: "0.625rem",
                            marginBottom: "0.25rem",
                            textAlign: "left",
                          },
                          isActive
                            ? mergeStyles(tw("bg-blue-100 text-blue-700"), {
                                borderLeft: "4px solid #2563eb",
                              })
                            : tw("text-gray-600")
                        )}
                      >
                        <span
                          className="material-symbols-rounded"
                          style={mergeStyles(tw("text-base flex-shrink-0"), {
                            marginRight: "0.75rem",
                          })}
                        >
                          {section.icon}
                        </span>
                        <span style={tw("truncate")}>{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Content Area */}
              <div style={tw("flex-1 flex flex-col overflow-hidden")}>
                <div
                  style={mergeStyles(tw("flex-1 overflow-y-auto"), {
                    padding: "1.5rem",
                  })}
                >
                  {renderFormSection()}
                </div>
              </div>
            </>
          )}

          {activeTab === "select" && <SelectFormulaForm />}
        </div>
      </div>
    </Modal>
  );
};

export default FormulaModal;
