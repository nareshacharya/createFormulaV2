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

// Lazy load section components
import FormulaTypeSelection from "./FormulaSections/FormulaTypeSelection";
import FormulaGeneralInformation from "./FormulaSections/FormulaGeneralInformation";
import FormulaProjectInformation from "./FormulaSections/FormulaProjectInformation";
import FormulaProductInformation from "./FormulaSections/FormulaProductInformation";
import FormulaSystemCodes from "./FormulaSections/FormulaSystemCodes";
import FormulaProductionInformation from "./FormulaSections/FormulaProductionInformation";
import FormulaAdditionalInformation from "./FormulaSections/FormulaAdditionalInformation";

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

interface NewFormulaData {
  formulaType: FormulaType;
  name: string;
  fragranceName: string;
  sampleId: string;
  category: string;
  region: string;
  country: string;
  description: string;
  createdBy: string;
  baseFormulaId: string;
  dilutionPercentage: number | undefined;
  fragranceDosage: number | undefined;
  version: number;
  productFormat: string;
  limsCode: string;
  sapPlmCode: string;
  brand: string;
  claims: string[];
  variant: string;
  supplier: string;
  productionCode: string;
  productionDate: string;
  recommendedDosage: number | undefined;
  dosageUnit: string;
  commentOnProduct: string;
  projectId: string;
  projectCurrencies: string[];
  projectDefaultCurrency: string;
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
  const [newFormulaData, setNewFormulaData] = useState<NewFormulaData>({
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

  const remainingSelections = maxSelections - currentSelections;

  const formSections = [
    { id: "identification", label: "Identification", icon: "label" },
    { id: "general", label: "General & Dosage", icon: "info" },
    { id: "project", label: "Project Info", icon: "folder" },
    { id: "product", label: "Product Info", icon: "shopping_bag" },
    { id: "codes", label: "System Codes", icon: "code" },
    { id: "production", label: "Production", icon: "factory" },
    { id: "additional", label: "Additional", icon: "more" },
  ];

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
    });

    // Generate universal formula ID (F00001v1) - not displayed on screen
    // Find highest F-sequence number across all formulas
    const fSequenceNumbers = availableFormulas
      .map((f) => {
        const match = f.id?.match(/F(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);
    const nextFSequence =
      (fSequenceNumbers.length > 0 ? Math.max(...fSequenceNumbers) : 0) + 1;
    const universalFormulaId = `F${nextFSequence
      .toString()
      .padStart(5, "0")}v${newFormulaData.version}`;

    // Generate formula name based on type
    const formulaName =
      newFormulaData.formulaType === FORMULA_TYPES.ANALYTICAL
        ? `ANALYTICAL-${newFormulaData.sampleId}`
        : newFormulaData.fragranceName;

    // Extract version from generated ID (e.g., v1 from B00001v1)
    const versionMatch = typeSpecificId.match(/v(\d+)$/);
    const extractedVersion = versionMatch ? parseInt(versionMatch[1], 10) : 1;

    const formulaToCreate: Omit<Formula, "id"> = {
      name: newFormulaData.name || formulaName,
      version: extractedVersion.toString(),
      status: "draft",
      createdBy: newFormulaData.createdBy,
      lastUpdated: new Date().toISOString(),
      category: newFormulaData.category,
      projectName: undefined,
      projectId: newFormulaData.projectId,
      totalPercentage: 0,
      ingredients: [],
      notes: { top: [], middle: [], base: [] },
      description: newFormulaData.description,
      formulaType: newFormulaData.formulaType,
      perfumerFormulaId:
        newFormulaData.formulaType === FORMULA_TYPES.PERFUMER
          ? typeSpecificId
          : undefined,
      baseFormulaId:
        newFormulaData.formulaType === FORMULA_TYPES.BASE ||
        newFormulaData.formulaType === FORMULA_TYPES.DILUTION
          ? typeSpecificId
          : undefined,
      dilutionFormulaId:
        newFormulaData.formulaType === FORMULA_TYPES.DILUTION
          ? typeSpecificId
          : undefined,
      analyticalFormulaId:
        newFormulaData.formulaType === FORMULA_TYPES.ANALYTICAL
          ? typeSpecificId
          : undefined,
      uCode: undefined,
      region: newFormulaData.region,
      country: newFormulaData.country,
      sapPlmCode: newFormulaData.sapPlmCode,
      limsCode: newFormulaData.limsCode,
      fragranceName: newFormulaData.fragranceName,
      sampleId: newFormulaData.sampleId,
      fragranceDosageActual: newFormulaData.fragranceDosage,
      formulaVersion: newFormulaData.version,
      productFormat: newFormulaData.productFormat,
      brand: newFormulaData.brand,
      supplier: newFormulaData.supplier,
      claims: newFormulaData.claims,
      variant: newFormulaData.variant,
      productionCode: newFormulaData.productionCode,
      productionDate: newFormulaData.productionDate,
      recommendedProductDosage: newFormulaData.recommendedDosage,
      unitOfRecommendedDosage: newFormulaData.dosageUnit,
      commentOnProduct: newFormulaData.commentOnProduct,
    };

    onCreateFormula(formulaToCreate);
    handleClose();
  };

  const handleSelectFormulas = () => {
    selectedFormulas.forEach((formulaId) => {
      const formula = availableFormulas.find((f) => f.id === formulaId);
      if (formula) {
        onSelectFormula(formula);
      }
    });
    handleClose();
  };

  const renderFormSection = () => {
    switch (activeFormSection) {
      case "identification":
        return (
          <FormulaTypeSelection
            formulaData={newFormulaData}
            onDataChange={(updates) =>
              setNewFormulaData((prev) => ({ ...prev, ...updates }))
            }
          />
        );

      case "general":
        return (
          <FormulaGeneralInformation
            formulaData={newFormulaData}
            onDataChange={(updates) =>
              setNewFormulaData((prev) => ({ ...prev, ...updates }))
            }
          />
        );

      case "project":
        return (
          <FormulaProjectInformation
            formulaData={newFormulaData}
            onDataChange={(updates) =>
              setNewFormulaData((prev) => ({ ...prev, ...updates }))
            }
          />
        );

      case "product":
        return (
          <FormulaProductInformation
            formulaData={newFormulaData}
            onDataChange={(updates) =>
              setNewFormulaData((prev) => ({ ...prev, ...updates }))
            }
          />
        );

      case "codes":
        return (
          <FormulaSystemCodes
            formulaData={newFormulaData}
            onDataChange={(updates) =>
              setNewFormulaData((prev) => ({ ...prev, ...updates }))
            }
          />
        );

      case "production":
        return (
          <FormulaProductionInformation
            formulaData={newFormulaData}
            onDataChange={(updates) =>
              setNewFormulaData((prev) => ({ ...prev, ...updates }))
            }
          />
        );

      case "additional":
        return (
          <FormulaAdditionalInformation
            formulaData={newFormulaData}
            onDataChange={(updates) =>
              setNewFormulaData((prev) => ({ ...prev, ...updates }))
            }
          />
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: "select", label: "Select Existing", count: availableFormulas.length },
    { id: "create", label: "Create New" },
  ];

  const SelectFormulaForm = () => (
    <div style={tw("px-6 pt-3 pb-6")}>
      <div style={tw("space-y-4")}>
        {remainingSelections > 0 ? (
          <FormulaDataGrid
            formulas={availableFormulas}
            selectedFormulas={selectedFormulas}
            onSelectionChange={setSelectedFormulas}
            maxSelections={remainingSelections}
            highlightedFormulas={selectedFormulaIds}
          />
        ) : (
          <div style={tw("text-center py-8")}>
            <div style={tw("text-gray-500 mb-2")}>
              No more formulas can be added.
            </div>
            <div style={tw("text-sm text-gray-600")}>
              Maximum number of formula columns (4) reached.
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

        {activeTab === "create" && (
          <div style={mergeStyles(tw("flex"), { height: "100%", maxHeight: "calc(90vh - 200px)" })}>
            {/* Vertical Navigation Sidebar */}
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
                          : tw("text-gray-600 hover:bg-gray-100")
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

            {/* Form Content Area */}
            <div
              style={mergeStyles(
                tw("flex-1 overflow-y-auto p-6"),
                { backgroundColor: "#ffffff" }
              )}
            >
              {renderFormSection()}
            </div>
          </div>
        )}

        {activeTab === "select" && (
          <div
            style={{
              minHeight: "400px",
            }}
          >
            <SelectFormulaForm />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default FormulaModal;
