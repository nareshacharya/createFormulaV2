/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from "react";
import { toast } from "react-hot-toast";
import { isFieldVisible } from "../config/formulaCreation.config";
import { FORMULA_TYPES } from "../config/formulaTypes.config";
import type { FormulaType } from "../config/formulaTypes.config";
import type { Formula } from "../services/pega";
import {
  generateFormulaId,
  getCurrentUserInitials,
} from "../utils/idGeneration";
import { tw, mergeStyles } from "../utils/tailwindToInline";
import { FormulaValidator } from "../utils/formulaValidation";
import { ApiService } from "../services/api";
import Button from "./Button";
import Modal from "./Modal";
import PillTabs from "./PillTabs";
import SelectFormulaForm from "./SelectFormulaForm";
import type {
  AnalyticalCompositionUpload,
  AnalyticalCompositionIngredient,
} from "../types/formula.creation.types";
import AnalyticalCompositionUploadModal from "./AnalyticalCompositionUploadModal";

// Lazy load section components
import FormulaTypeSelection from "./FormulaSections/FormulaTypeSelection";
import FormulaProjectInformation from "./FormulaSections/FormulaProjectInformation";
import FormulaProductInformation from "./FormulaSections/FormulaProductInformation";
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
  sampleID: string;
  category: string;
  region: string;
  country: string;
  description: string;
  createdBy: string;
  baseFormulaId: string;
  dilutionPercentage: number | undefined;
  fragranceDosage: number | undefined;
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
  projectName: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyticalUploadOpen, setIsAnalyticalUploadOpen] = useState(false);
  const [analyticalComposition, setAnalyticalComposition] =
    useState<AnalyticalCompositionUpload | null>(null);
  const [newFormulaData, setNewFormulaData] = useState<NewFormulaData>({
    formulaType: FORMULA_TYPES.BASE as FormulaType,
    name: "",
    sampleID: "",
    category: "",
    region: "",
    country: "",
    description: "",
    createdBy: "Current User",
    baseFormulaId: "",
    dilutionPercentage: undefined,
    fragranceDosage: undefined,
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
    projectName: "",
    projectCurrencies: [],
    projectDefaultCurrency: "",
  });

  const remainingSelections = maxSelections - currentSelections;

  const formSections = [
    { id: "identification", label: "Identification", icon: "label" },
    { id: "details", label: "Details", icon: "info" },
    { id: "product-project", label: "Product & Project", icon: "shopping_bag" },
    { id: "additional", label: "Additional", icon: "more" },
  ];

  const handleClose = () => {
    setActiveTab("select");
    setActiveFormSection("identification");
    setSelectedFormulas([]);
    setNewFormulaData({
      formulaType: FORMULA_TYPES.BASE as FormulaType,
      name: "",
      sampleID: "",
      category: "",
      region: "",
      country: "",
      description: "",
      createdBy: "Current User",
      baseFormulaId: "",
      dilutionPercentage: undefined,
      fragranceDosage: undefined,
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
      projectName: "",
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
      toast.error("Please fill in all required fields");
      return;
    }

    // Type-specific mandatory validation
    if (
      isFieldVisible("fragranceName", newFormulaData.formulaType) &&
      !newFormulaData.fragranceName
    ) {
      toast.error("Fragrance name is required for this formula type");
      return;
    }

    if (
      isFieldVisible("sampleId", newFormulaData.formulaType) &&
      !newFormulaData.sampleID
    ) {
      toast.error("Sample ID is required for this formula type");
      return;
    }

    if (
      isFieldVisible("baseFormulaId", newFormulaData.formulaType) &&
      !newFormulaData.baseFormulaId
    ) {
      toast.error("Base Formula is required for this formula type");
      return;
    }

    if (
      isFieldVisible("dilutionPercentage", newFormulaData.formulaType) &&
      !newFormulaData.dilutionPercentage
    ) {
      toast.error("Dilution percentage is required for this formula type");
      return;
    }

    // Fragrance Dosage is only mandatory for PERFUMER type
    if (
      isFieldVisible("fragranceDosageActual", newFormulaData.formulaType) &&
      !newFormulaData.fragranceDosage
    ) {
      toast.error("Fragrance dosage is required for this formula type");
      return;
    }

    // Validate using FormulaValidator
    const validation = FormulaValidator.validateFormula(
      newFormulaData as any,
      newFormulaData.formulaType
    );

    if (!validation.isValid) {
      const errorMsg =
        validation.errors
          .filter((e) => e.message && e.message.trim())
          .map((e) => e.message)
          .join("; ") || "Validation failed";
      toast.error(errorMsg);
      return;
    }

    // For analytical formulas, check Sample ID availability before creating
    if (newFormulaData.formulaType === FORMULA_TYPES.ANALYTICAL) {
      setIsSubmitting(true);
      ApiService.checkSampleIdAvailability(newFormulaData.sampleID)
        .then((response) => {
          if (!response.data.available) {
            toast.error(
              `Sample ID "${newFormulaData.sampleID}" is already in use. Please use a different ID.`
            );
            setIsSubmitting(false);
            return;
          }

          // Proceed with formula creation
          submitFormula();
        })
        .catch(() => {
          toast.error("Failed to check Sample ID availability");
          setIsSubmitting(false);
        });
    } else {
      submitFormula();
    }
  };

  const submitFormula = async () => {
    try {
      setIsSubmitting(true);

      // Build payload using FormulaValidator
      const payload = FormulaValidator.buildCreateFormulaPayload(
        newFormulaData as any,
        newFormulaData.createdBy || "Current User",
        new Date().toISOString()
      );

      // Call API to create formula
      const response = await ApiService.createFormulaFromData(payload);

      if (response.success) {
        toast.success(
          `Formula "${
            newFormulaData.name || newFormulaData.fragranceName
          }" created successfully!`
        );

        // Generate formula object for callback
        const typeSpecificId = generateFormulaId({
          formulaType: newFormulaData.formulaType,
          userInitials: getCurrentUserInitials(),
          existingFormulas: availableFormulas,
        });

        const formulaName =
          newFormulaData.formulaType === FORMULA_TYPES.ANALYTICAL
            ? `ANALYTICAL-${newFormulaData.sampleID}`
            : newFormulaData.fragranceName;

        const versionMatch = typeSpecificId.match(/v(\d+)$/);
        const extractedVersion = versionMatch
          ? parseInt(versionMatch[1], 10)
          : 1;

        const formulaToCreate: Omit<Formula, "id"> = {
          name: newFormulaData.name || formulaName,
          version: extractedVersion.toString(),
          status: "draft",
          createdBy: newFormulaData.createdBy,
          lastUpdated: new Date().toISOString(),
          category: newFormulaData.category,
          projectName: newFormulaData.projectName || undefined,
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
          sampleId: newFormulaData.sampleID,
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

        // Close modal after short delay to show success message
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        toast.error(response.error || "Failed to create formula");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while creating the formula"
      );
    } finally {
      setIsSubmitting(false);
    }
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

  const handleAnalyticalCompositionUpload = (
    composition: AnalyticalCompositionUpload
  ) => {
    setAnalyticalComposition(composition);
    setIsAnalyticalUploadOpen(false);
    toast.success(
      `Uploaded ${composition.ingredients.length} ingredients from ${composition.sheetName}`
    );
  };

  const renderFormSection = () => {
    switch (activeFormSection) {
      case "identification":
        return (
          <FormulaTypeSelection
            formulaData={newFormulaData as any}
            onDataChange={(updates) =>
              setNewFormulaData((prev) => {
                const result = { ...prev, ...updates };
                return result as NewFormulaData;
              })
            }
          />
        );

      case "details":
        return (
          <>
            <FormulaProductInformation
              formulaData={newFormulaData as any}
              onDataChange={(updates) =>
                setNewFormulaData((prev) => {
                  const result = { ...prev, ...updates };
                  return result as NewFormulaData;
                })
              }
            />
          </>
        );

      case "product-project":
        return (
          <FormulaProjectInformation
            formulaData={newFormulaData as any}
            onDataChange={(updates) =>
              setNewFormulaData((prev) => {
                const result = { ...prev, ...updates };
                return result as NewFormulaData;
              })
            }
          />
        );

      case "additional":
        return (
          <>
            <FormulaProductionInformation
              formulaData={newFormulaData as any}
              onDataChange={(updates) =>
                setNewFormulaData((prev) => {
                  const result = { ...prev, ...updates };
                  return result as NewFormulaData;
                })
              }
            />
            <div style={tw("mt-6 border-t border-gray-200 pt-6")}>
              <FormulaAdditionalInformation
                formulaData={newFormulaData as any}
                onDataChange={(updates) =>
                  setNewFormulaData((prev) => {
                    const result = { ...prev, ...updates };
                    return result as NewFormulaData;
                  })
                }
              />
              {/* Analytical Composition Section */}
              {newFormulaData.formulaType === "ANALYTICAL" && (
                <div style={tw("mt-6 border-t border-gray-200 pt-6")}>
                  <div style={tw("flex items-center justify-between mb-4")}>
                    <div>
                      <h3 style={tw("font-semibold text-gray-900")}>
                        Analytical Composition
                      </h3>
                      <p style={tw("text-sm text-gray-600 mt-1")}>
                        Import composition data from Excel file
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsAnalyticalUploadOpen(true)}
                      variant="outline"
                    >
                      {analyticalComposition ? "Update" : "Upload"} File
                    </Button>
                  </div>

                  {analyticalComposition && (
                    <div
                      style={mergeStyles(
                        tw(
                          "bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4"
                        )
                      )}
                    >
                      <div style={tw("text-sm text-gray-700 space-y-2")}>
                        <div>
                          <span style={tw("font-medium")}>Sample ID:</span>{" "}
                          {analyticalComposition.sampleID}
                        </div>
                        <div>
                          <span style={tw("font-medium")}>Method Type:</span>{" "}
                          {analyticalComposition.methodType.toUpperCase()}
                        </div>
                        <div>
                          <span style={tw("font-medium")}>Ingredients:</span>{" "}
                          {analyticalComposition.ingredients.length}
                        </div>
                        <div>
                          <span style={tw("font-medium")}>Total %:</span>{" "}
                          {analyticalComposition.ingredients
                            .reduce((sum, ing) => sum + ing.percentage, 0)
                            .toFixed(2)}
                          %
                        </div>
                        <div>
                          <span style={tw("font-medium")}>Mapped:</span>{" "}
                          {
                            analyticalComposition.ingredients.filter(
                              (ing) => ing.status === "matched"
                            ).length
                          }
                          /{analyticalComposition.ingredients.length}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: "select", label: "Select Existing", count: availableFormulas.length },
    { id: "create", label: "Create New" },
  ];

  const getFooterActions = () => {
    if (activeTab === "create") {
      // Check mandatory fields based on formula type visibility
      const hasMandatoryFields =
        newFormulaData.category &&
        newFormulaData.region &&
        newFormulaData.country &&
        newFormulaData.productFormat &&
        (isFieldVisible("fragranceName", newFormulaData.formulaType)
          ? newFormulaData.fragranceName.trim()
          : true) &&
        (isFieldVisible("sampleId", newFormulaData.formulaType)
          ? newFormulaData.sampleID.trim()
          : true) &&
        (isFieldVisible("baseFormulaId", newFormulaData.formulaType)
          ? newFormulaData.baseFormulaId.trim()
          : true) &&
        (isFieldVisible("dilutionPercentage", newFormulaData.formulaType)
          ? newFormulaData.dilutionPercentage
          : true) &&
        (isFieldVisible("fragranceDosageActual", newFormulaData.formulaType)
          ? newFormulaData.fragranceDosage
          : true);

      return (
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateNewFormula}
            disabled={isSubmitting || !hasMandatoryFields}
          >
            {isSubmitting ? "Creating..." : "Create Formula"}
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
          <div
            style={mergeStyles(tw("flex"), {
              height: "100%",
              maxHeight: "calc(90vh - 200px)",
            })}
          >
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
              style={mergeStyles(tw("flex-1 overflow-y-auto p-6"), {
                backgroundColor: "#ffffff",
              })}
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
            <SelectFormulaForm
              availableFormulas={availableFormulas}
              selectedFormulas={selectedFormulas}
              onSelectionChange={setSelectedFormulas}
              remainingSelections={remainingSelections}
              selectedFormulaIds={selectedFormulaIds}
            />
          </div>
        )}
      </div>

      {/* Analytical Composition Upload Modal */}
      <AnalyticalCompositionUploadModal
        isOpen={isAnalyticalUploadOpen}
        sampleID={newFormulaData.sampleID}
        availableIngredients={[]} // TODO: Get from API
        onClose={() => setIsAnalyticalUploadOpen(false)}
        onUpload={handleAnalyticalCompositionUpload}
      />
    </Modal>
  );
};

export default FormulaModal;
