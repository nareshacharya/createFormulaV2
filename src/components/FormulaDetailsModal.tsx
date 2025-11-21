/* eslint-disable jsx-a11y/label-has-associated-control */
import { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { isFieldVisible } from "../config/formulaCreation.config";
import type { FormulaType } from "../config/formulaTypes.config";
import {
  FORMULA_TYPES,
  getFormulaTypeLabel,
} from "../config/formulaTypes.config";
import type { Formula } from "../services/pega";
import { ApiService } from "../services/api";
import { tw, mergeStyles } from "../utils/tailwindToInline";
import { WorkspaceContext } from "../context/WorkspaceContext";
import Button from "./Button";
import Modal from "./Modal";

// Import section components
import FormulaTypeSelection from "./FormulaSections/FormulaTypeSelection";
import FormulaProductInformation from "./FormulaSections/FormulaProductInformation";
import FormulaProjectInformation from "./FormulaSections/FormulaProjectInformation";
import FormulaProductionInformation from "./FormulaSections/FormulaProductionInformation";
import FormulaAdditionalInformation from "./FormulaSections/FormulaAdditionalInformation";

interface FormulaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  formula: Formula | null;
  isReadOnly: boolean;
  onSave?: (updatedFormula: Partial<Formula>) => void;
}

interface FormData {
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
  fragranceName: string;
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
  version?: string;
}

/**
 * FormulaDetailsModal Component
 *
 * Displays formula details in either:
 * - Edit mode (for editable/owned formulas)
 * - View-only mode (for locked/reference formulas)
 *
 * Uses the same section-based components as FormulaModal for consistency
 */
const FormulaDetailsModal = ({
  isOpen,
  onClose,
  formula,
  isReadOnly,
  onSave,
}: FormulaDetailsModalProps) => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [activeFormSection, setActiveFormSection] = useState("identification");
  const workspaceContext = useContext(WorkspaceContext);

  const formSections = [
    { id: "identification", label: "Identification", icon: "label" },
    { id: "details", label: "Details", icon: "info" },
    { id: "product-project", label: "Product & Project", icon: "shopping_bag" },
    { id: "additional", label: "Additional", icon: "more" },
  ];

  useEffect(() => {
    if (formula) {
      // Map formula data to form data structure
      const mappedData: FormData = {
        formulaType: (formula.formulaType || FORMULA_TYPES.BASE) as FormulaType,
        name: formula.name || "",
        sampleID: formula.sampleId || "",
        category: formula.category || "",
        region: formula.region || "",
        country: formula.country || "",
        description: formula.description || "",
        createdBy: formula.createdBy || "Current User",
        baseFormulaId: formula.baseFormulaId || "",
        dilutionPercentage: formula.fragranceDosageActual,
        fragranceDosage: formula.fragranceDosageActual,
        fragranceName: formula.fragranceName || "",
        productFormat: formula.productFormat || "",
        limsCode: formula.limsCode || "",
        sapPlmCode: formula.sapPlmCode || "",
        brand: formula.brand || "",
        claims: formula.claims || [],
        variant: formula.variant || "",
        supplier: formula.supplier || "",
        productionCode: formula.productionCode || "",
        productionDate: formula.productionDate || "",
        recommendedDosage: formula.recommendedProductDosage,
        dosageUnit: formula.unitOfRecommendedDosage || "",
        commentOnProduct: formula.commentOnProduct || "",
        projectId: formula.projectId || "",
        projectName: formula.projectName || "",
        projectCurrencies: [],
        projectDefaultCurrency: "",
        version: formula.version,
      };
      setFormData(mappedData);
    }
  }, [formula]);

  // Load project data when projectId changes
  useEffect(() => {
    if (formData?.projectId) {
      const loadProject = async () => {
        try {
          const response = await ApiService.getProject(formData.projectId);
          if (response.success && response.data) {
            const project = response.data;
            setFormData((prev) =>
              prev
                ? {
                    ...prev,
                    projectCurrencies: project.currencies || [],
                    projectDefaultCurrency: project.defaultCurrency || "",
                  }
                : null
            );
          }
        } catch (error) {
          // Silently handle error
        }
      };
      loadProject();
    }
  }, [formData?.projectId]);

  const handleInputChange = (updates: Record<string, any>) => {
    if (isReadOnly) return;
    setFormData((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const handleSave = () => {
    if (!formData || isReadOnly) return;

    // Map form data back to formula object
    const saveData: Partial<Formula> = {
      name: formData.name || formData.fragranceName,
      category: formData.category,
      region: formData.region,
      country: formData.country,
      description: formData.description,
      fragranceName: formData.fragranceName,
      sampleId: formData.sampleID,
      productFormat: formData.productFormat,
      limsCode: formData.limsCode,
      sapPlmCode: formData.sapPlmCode,
      brand: formData.brand,
      claims: formData.claims,
      variant: formData.variant,
      supplier: formData.supplier,
      productionCode: formData.productionCode,
      productionDate: formData.productionDate,
      recommendedProductDosage: formData.recommendedDosage,
      unitOfRecommendedDosage: formData.dosageUnit,
      commentOnProduct: formData.commentOnProduct,
      projectId: formData.projectId,
      fragranceDosageActual: formData.fragranceDosage,
    };

    // Save project mapping to workspace context if projectId is set
    if (workspaceContext && formula?.id && saveData.projectId) {
      workspaceContext.setProjectMapping(formula.id, saveData.projectId, "");
    }

    onSave?.(saveData);
    toast.success("Formula details updated successfully");
    onClose();
  };

  const handleCancel = () => {
    setFormData(null);
    onClose();
  };

  if (!formula || !formData) return null;

  const formulaType = formData.formulaType;

  const renderFormSection = () => {
    switch (activeFormSection) {
      case "identification":
        return (
          <FormulaTypeSelection
            formulaData={formData as any}
            onDataChange={handleInputChange}
          />
        );

      case "details":
        return (
          <FormulaProductInformation
            formulaData={formData as any}
            onDataChange={handleInputChange}
          />
        );

      case "product-project":
        return (
          <FormulaProjectInformation
            formulaData={formData as any}
            onDataChange={handleInputChange}
          />
        );

      case "additional":
        return (
          <>
            <FormulaProductionInformation
              formulaData={formData as any}
              onDataChange={handleInputChange}
            />
            <div style={tw("mt-6 border-t border-gray-200 pt-6")}>
              <FormulaAdditionalInformation
                formulaData={formData as any}
                onDataChange={handleInputChange}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={isReadOnly ? "View Formula Details" : "Edit Formula Details"}
      size="4xl"
      noPadding
    >
      <div className="space-y-0">
        {/* Header with formula type and read-only indicator */}
        <div className="px-6 pt-6 pb-3 flex items-center justify-between">
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span style={tw("text-sm font-medium text-gray-700")}>
              Formula Type:
            </span>
            <span
              style={tw(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              )}
            >
              {getFormulaTypeLabel(formulaType)}
            </span>
          </div>
          {isReadOnly && (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span
                className="material-symbols-rounded"
                style={tw("text-sm text-gray-500")}
              >
                lock
              </span>
              <span style={tw("text-xs text-gray-600")}>Read-Only</span>
            </div>
          )}
        </div>

        {isReadOnly && (
          <div className="px-6 pb-3">
            <div
              style={mergeStyles(
                tw(
                  "bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center"
                ),
                { gap: "0.5rem" }
              )}
            >
              <span
                style={tw("text-gray-500 text-base")}
                className="material-symbols-rounded"
              >
                info
              </span>
              <div style={tw("flex-1")}>
                <p style={tw("text-sm font-medium text-gray-700")}>
                  Reference Formula
                </p>
                <p style={tw("text-xs text-gray-500")}>
                  This formula is locked and cannot be edited
                </p>
              </div>
            </div>
          </div>
        )}

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
                    disabled={isReadOnly}
                    style={mergeStyles(
                      tw(
                        "w-full flex items-center text-sm font-medium rounded-md cursor-pointer disabled:cursor-not-allowed"
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

        {/* Metadata Section - Always at bottom */}
        <div
          style={mergeStyles(
            tw(
              "px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center"
            ),
            {
              display: "flex",
              gap: "1rem",
              fontSize: "0.75rem",
            }
          )}
        >
          <div style={tw("flex gap-4 flex-1 text-gray-600")}>
            <div>
              <span style={tw("font-medium")}>Created by:</span>{" "}
              {formula.createdBy}
            </div>
            <div>
              <span style={tw("font-medium")}>ID:</span> {formula.id}
            </div>
            {formula.lastUpdated && (
              <div>
                <span style={tw("font-medium")}>Updated:</span>{" "}
                {new Date(formula.lastUpdated).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={mergeStyles(tw("flex justify-end"), { gap: "0.75rem" })}>
            <Button variant="outline" onClick={handleCancel}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && <Button onClick={handleSave}>Save Changes</Button>}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FormulaDetailsModal;
