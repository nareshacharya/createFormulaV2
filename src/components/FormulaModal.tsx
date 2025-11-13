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
  selectedFormulaIds?: string[]; // Add this to track already selected formulas
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
  });

  const remainingSelections = maxSelections - currentSelections;

  const handleClose = () => {
    setActiveTab("select");
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

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    generalAndDosage: true,
    product: true,
    codes: true,
    production: false,
    additional: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

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

  const createFormulaForm = (
    <div className="px-6 pt-3 pb-6">
      <div className="space-y-6">
        {/* Formula Type Selection */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Formula Type *
            </label>
            <div className="relative group inline-block">
              <i className="ri-information-line text-gray-400 text-base cursor-help"></i>
              <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 absolute left-0 top-6 w-80 p-4 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none">
                <div className="mb-3">
                  <strong className="text-blue-300">Base Formula:</strong>{" "}
                  <span className="text-gray-300">
                    {getFormulaTypeDescription(FORMULA_TYPES.BASE)}
                  </span>
                </div>
                <div className="mb-3">
                  <strong className="text-blue-300">Dilution Formula:</strong>{" "}
                  <span className="text-gray-300">
                    {getFormulaTypeDescription(FORMULA_TYPES.DILUTION)}
                  </span>
                </div>
                <div className="mb-3">
                  <strong className="text-blue-300">Analytical Formula:</strong>{" "}
                  <span className="text-gray-300">
                    {getFormulaTypeDescription(FORMULA_TYPES.ANALYTICAL)}
                  </span>
                </div>
                <div>
                  <strong className="text-blue-300">Perfumer Formula:</strong>{" "}
                  <span className="text-gray-300">
                    {getFormulaTypeDescription(FORMULA_TYPES.PERFUMER)}
                  </span>
                </div>
                <div className="absolute left-6 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Object.values(FORMULA_TYPES).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setNewFormulaData((prev) => ({ ...prev, formulaType: type }))
                }
                className={`p-3 rounded-lg border-2 transition-all ${
                  newFormulaData.formulaType === type
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm text-gray-900">
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
        <div className="space-y-4">
          {/* Fragrance Name / Sample ID - Full Width */}
          {isFieldVisible("fragranceName", newFormulaData.formulaType) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter fragrance name"
              />
            </div>
          )}

          {isFieldVisible("sampleId", newFormulaData.formulaType) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter sample ID"
              />
            </div>
          )}

          {/* Base Formula & Dilution % for DILUTION type */}
          {isFieldVisible("baseFormulaId", newFormulaData.formulaType) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search for base formula..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dilution Percentage *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={newFormulaData.dilutionPercentage || ""}
                    onChange={(e) =>
                      setNewFormulaData((prev) => ({
                        ...prev,
                        dilutionPercentage: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">
                    %
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Formula Version */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formula Version
            </label>
            <input
              type="number"
              value={newFormulaData.version || 1}
              onChange={(e) =>
                setNewFormulaData((prev) => ({
                  ...prev,
                  version: parseInt(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
            />
          </div>
        </div>

        {/* General Information & Dosage Section (Combined - Mandatory) */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => toggleSection("generalAndDosage")}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 hover:rounded-tl-lg hover:rounded-tr-lg transition-colors"
          >
            <h3 className="text-sm font-semibold text-gray-900">
              General Information & Dosage *
            </h3>
            <i
              className={`ri-arrow-${
                expandedSections.generalAndDosage ? "up" : "down"
              }-s-line text-gray-500 text-lg`}
            ></i>
          </button>
          {expandedSections.generalAndDosage && (
            <div className="p-4 space-y-4">
              {/* General Information Fields */}
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase mb-3">
                  General Information
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
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
                <h4 className="text-xs font-semibold text-gray-600 uppercase mb-3">
                  Dosage & Product Format
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Fragrance Dosage - Mandatory for all types */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fragrance Dosage (%, Actual) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={newFormulaData.fragranceDosage || ""}
                        onChange={(e) =>
                          setNewFormulaData((prev) => ({
                            ...prev,
                            fragranceDosage: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <span className="absolute right-3 top-2.5 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Product Format - Mandatory for all types */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
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

        {/* Product Information Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => toggleSection("product")}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 hover:rounded-tl-lg hover:rounded-tr-lg transition-colors"
          >
            <h3 className="text-sm font-semibold text-gray-900">
              Product Information
            </h3>
            <i
              className={`ri-arrow-${
                expandedSections.product ? "up" : "down"
              }-s-line text-gray-500 text-lg`}
            ></i>
          </button>
          {expandedSections.product && (
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Brand - Optional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter brand"
                  />
                </div>

                {/* Variant - Optional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter variant name"
                  />
                </div>

                {/* Supplier - Optional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter supplier"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Codes Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => toggleSection("codes")}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 hover:rounded-tl-lg hover:rounded-tr-lg transition-colors"
          >
            <h3 className="text-sm font-semibold text-gray-900">
              System Codes
            </h3>
            <i
              className={`ri-arrow-${
                expandedSections.codes ? "up" : "down"
              }-s-line text-gray-500 text-lg`}
            ></i>
          </button>
          {expandedSections.codes && (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* SAP PLM Code */}
                {(newFormulaData.formulaType === FORMULA_TYPES.BASE ||
                  newFormulaData.formulaType === FORMULA_TYPES.PERFUMER) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter SAP PLM code"
                    />
                  </div>
                )}

                {/* LIMS Code */}
                {(newFormulaData.formulaType === FORMULA_TYPES.BASE ||
                  newFormulaData.formulaType === FORMULA_TYPES.ANALYTICAL) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter LIMS code"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Production Information Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => toggleSection("production")}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 hover:rounded-tl-lg hover:rounded-tr-lg transition-colors"
          >
            <h3 className="text-sm font-semibold text-gray-900">
              Production Information
            </h3>
            <i
              className={`ri-arrow-${
                expandedSections.production ? "up" : "down"
              }-s-line text-gray-500 text-lg`}
            ></i>
          </button>
          {expandedSections.production && (
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Product Production Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter production code"
                  />
                </div>

                {/* Product Production Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Recommended Product Dosage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommended Product Dosage
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newFormulaData.recommendedDosage || ""}
                      onChange={(e) =>
                        setNewFormulaData((prev) => ({
                          ...prev,
                          recommendedDosage: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => toggleSection("additional")}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 hover:rounded-tl-lg hover:rounded-tr-lg transition-colors"
          >
            <h3 className="text-sm font-semibold text-gray-900">
              Additional Information
            </h3>
            <i
              className={`ri-arrow-${
                expandedSections.additional ? "up" : "down"
              }-s-line text-gray-500 text-lg`}
            ></i>
          </button>
          {expandedSections.additional && (
            <div className="p-4 space-y-4">
              {/* Claims - Full Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter claims (comma-separated)"
                />
              </div>

              {/* Comment on Product */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Other useful information on pack (optional)"
                />
              </div>

              {/* Description - Full Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter formula description (optional)"
                />
              </div>
            </div>
          )}
        </div>

        {/* Info Banner - Only for special types */}
        {newFormulaData.formulaType === FORMULA_TYPES.PERFUMER && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start">
              <i className="ri-sparkle-line text-green-600 text-lg mr-2 mt-0.5"></i>
              <div className="text-sm text-green-700">
                <strong className="font-medium">
                  Auto-ID Generation Enabled
                </strong>
                <div className="mt-1 text-green-600">
                  This formula will automatically generate a Perfumer Formula ID
                  (PERF-YYYYMMDD-####)
                </div>
              </div>
            </div>
          </div>
        )}
        {newFormulaData.formulaType === FORMULA_TYPES.ANALYTICAL && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start">
              <i className="ri-flask-line text-amber-600 text-lg mr-2 mt-0.5"></i>
              <div className="text-sm text-amber-700">
                <strong className="font-medium">Analytical Formula</strong>
                <div className="mt-1 text-amber-600">
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
    <div className="px-6 pt-3 pb-6">
      <div className="space-y-4">
        {remainingSelections > 0 ? (
          <FormulaDataGrid
            formulas={availableFormulas}
            selectedFormulas={selectedFormulas}
            onSelectionChange={setSelectedFormulas}
            maxSelections={remainingSelections}
            highlightedFormulas={selectedFormulaIds} // Pass already selected formulas to highlight
          />
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">
              <i className="ri-information-line text-2xl"></i>
            </div>
            <div className="text-sm text-gray-600">
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
      size="3xl"
      footerActions={getFooterActions()}
    >
      <div className="space-y-0">
        <div className="px-6 pt-6 pb-3">
          <PillTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as "create" | "select")}
          />
        </div>

        <div className="min-h-[400px]">
          {activeTab === "create" && createFormulaForm}
          {activeTab === "select" && <SelectFormulaForm />}
        </div>
      </div>
    </Modal>
  );
};

export default FormulaModal;
