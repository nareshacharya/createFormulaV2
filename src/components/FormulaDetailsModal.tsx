import { useEffect, useState } from "react";
import { FORMULA_DETAILS_FIELDS } from "../config/fieldConfigs/formulaDetails.fields";
import { GENERAL_INFO_FIELDS } from "../config/fieldConfigs/generalInfo.fields";
import { PRODUCT_INFO_FIELDS } from "../config/fieldConfigs/productInfo.fields";
import { PROJECT_REFERENCE_FIELDS } from "../config/fieldConfigs/projectReference.fields";
import type { FormulaType } from "../config/formulaTypes.config";
import {
  FORMULA_TYPES,
  getFormulaTypeLabel,
} from "../config/formulaTypes.config";
import type { FormField } from "../models/FormField.model";
import { isFieldVisibleForType } from "../models/FormField.model";
import type { Formula } from "../services/pega";
import Button from "./Button";
import Modal from "./Modal";

interface FormulaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  formula: Formula | null;
  isReadOnly: boolean;
  onSave?: (updatedFormula: Partial<Formula>) => void;
}

/**
 * FormulaDetailsModal Component (View Layer)
 *
 * Displays formula details in either:
 * - Edit mode (for editable/owned formulas)
 * - View-only mode (for locked/reference formulas)
 *
 * Dynamically renders all fields from formula creation configuration
 * based on formula type with proper field types (dropdowns, text, etc.)
 */
const FormulaDetailsModal = ({
  isOpen,
  onClose,
  formula,
  isReadOnly,
  onSave,
}: FormulaDetailsModalProps) => {
  const [formData, setFormData] = useState<Partial<Formula> | null>(null);

  // Combine all field configurations
  const allFields: FormField[] = [
    ...GENERAL_INFO_FIELDS,
    ...FORMULA_DETAILS_FIELDS,
    ...PRODUCT_INFO_FIELDS,
    ...PROJECT_REFERENCE_FIELDS,
  ];

  useEffect(() => {
    if (formula) {
      // Map formula data to field names expected by field configurations
      const mappedData = {
        ...formula,
        // Map 'name' to 'fragranceName' for BASE/DILUTION/PERFUMER formulas
        fragranceName: formula.fragranceName || formula.name,
        // Ensure formulaVersion is set from version if not already set
        formulaVersion:
          formula.formulaVersion ||
          parseInt(formula.version?.replace("v", "") || "1"),
      };
      setFormData(mappedData);
    }
  }, [formula]);

  const handleInputChange = (
    fieldName: string,
    value: string | number | string[] | undefined
  ) => {
    if (isReadOnly) return;
    setFormData((prev) => (prev ? { ...prev, [fieldName]: value } : null));
  };

  const handleSave = () => {
    if (!formData || isReadOnly) return;
    // Map fragranceName back to name for the formula object
    const saveData = {
      ...formData,
      name: formData.fragranceName || formData.name,
    };
    onSave?.(saveData);
    onClose();
  };

  const handleCancel = () => {
    setFormData(null);
    onClose();
  };

  if (!formula || !formData) return null;

  const formulaType = (formula.formulaType ||
    FORMULA_TYPES.BASE) as FormulaType;

  // Filter fields visible for this formula type
  const visibleFields = allFields.filter((field) =>
    isFieldVisibleForType(
      field,
      formulaType,
      formData as Record<string, unknown>
    )
  );

  // Group fields by category
  const generalInfoFields = visibleFields.filter(
    (f) => f.group === "general-info"
  );
  const formulaDetailsFields = visibleFields.filter(
    (f) => f.group === "formula-details"
  );
  const productInfoFields = visibleFields.filter(
    (f) => f.group === "product-info"
  );
  const projectReferenceFields = visibleFields.filter(
    (f) => f.group === "project-ref"
  );

  // Mock data for dropdown fields (in production, these would be loaded from API)
  const mockOptions: Record<string, Array<{ value: string; label: string }>> = {
    category: [
      { value: "Fine Fragrance", label: "Fine Fragrance" },
      { value: "Eau de Toilette", label: "Eau de Toilette" },
      { value: "Eau de Parfum", label: "Eau de Parfum" },
      { value: "Home Care", label: "Home Care" },
      { value: "Personal Care", label: "Personal Care" },
      { value: "Deodorant", label: "Deodorant" },
    ],
    region: [
      { value: "EMEA", label: "EMEA" },
      { value: "Americas", label: "Americas" },
      { value: "APAC", label: "APAC" },
    ],
    country: [
      { value: "US", label: "United States" },
      { value: "UK", label: "United Kingdom" },
      { value: "FR", label: "France" },
      { value: "DE", label: "Germany" },
      { value: "IT", label: "Italy" },
      { value: "ES", label: "Spain" },
      { value: "CN", label: "China" },
      { value: "JP", label: "Japan" },
      { value: "IN", label: "India" },
    ],
    productFormat: [
      { value: "spray", label: "Spray" },
      { value: "lotion", label: "Lotion" },
      { value: "cream", label: "Cream" },
      { value: "gel", label: "Gel" },
      { value: "powder", label: "Powder" },
      { value: "stick", label: "Stick" },
    ],
  };

  /**
   * Render individual field based on type
   */
  const renderField = (field: FormField) => {
    const value = (formData as Record<string, unknown>)[field.name] ?? "";
    const isDisabled = isReadOnly || field.disabled;

    const inputClassName = `w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      isDisabled ? "bg-gray-50 cursor-not-allowed" : ""
    }`;

    switch (field.type) {
      case "select": {
        // Use field options if available, otherwise use mock options
        const options = field.options || mockOptions[field.name] || [];
        return (
          <select
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            disabled={isDisabled}
            className={inputClassName}
          >
            <option value="">
              {field.placeholder || `Select ${field.label}`}
            </option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={
                  "disabled" in option ? Boolean(option.disabled) : false
                }
              >
                {option.label}
              </option>
            ))}
          </select>
        );
      }

      case "multi-select": {
        // Render as text input showing comma-separated values
        const multiValue = Array.isArray(value)
          ? value.join(", ")
          : String(value || "");
        return (
          <input
            type="text"
            value={multiValue}
            onChange={(e) =>
              handleInputChange(
                field.name,
                e.target.value.split(",").map((v) => v.trim())
              )
            }
            disabled={isDisabled}
            placeholder={field.placeholder}
            className={inputClassName}
          />
        );
      }

      case "number":
        return (
          <input
            type="number"
            value={value as string}
            onChange={(e) =>
              handleInputChange(
                field.name,
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            disabled={isDisabled}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className={inputClassName}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            disabled={isDisabled}
            className={inputClassName}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            disabled={isDisabled}
            placeholder={field.placeholder}
            rows={3}
            maxLength={field.maxLength}
            className={inputClassName}
          />
        );

      case "text":
      default:
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            disabled={isDisabled}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            className={inputClassName}
          />
        );
    }
  };

  /**
   * Render field section
   */
  const renderFieldSection = (fields: FormField[], title: string) => {
    if (fields.length === 0) return null;

    return (
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          {fields.map((field) => (
            <div
              key={field.name}
              className={field.type === "textarea" ? "col-span-2" : ""}
            >
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
                <span>{field.label}</span>
                {field.required && <span className="text-red-500 ml-1">*</span>}
                {field.helpText && (
                  <div className="group relative inline-block ml-1">
                    <span
                      className="material-symbols-rounded text-gray-400 hover:text-gray-600 cursor-help"
                      style={{ fontSize: "14px" }}
                    >
                      info
                    </span>
                    <div className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50 pointer-events-none">
                      {field.helpText}
                      <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={isReadOnly ? "View Formula Details" : "Edit Formula Details"}
      size="xl"
    >
      <div className="space-y-5 px-6 py-4">
        {/* Read-only indicator */}
        {isReadOnly && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center space-x-2">
            <span className="material-symbols-rounded text-gray-500 text-base">
              lock
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                Reference Formula (Read-Only)
              </p>
              <p className="text-xs text-gray-500">
                This formula is locked and cannot be edited
              </p>
            </div>
          </div>
        )}

        {/* Formula Type Badge */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">
            Formula Type:
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {getFormulaTypeLabel(formulaType)}
          </span>
        </div>

        {/* Form Fields organized by sections */}
        <div className="space-y-5">
          {/* General Information Section */}
          {renderFieldSection(generalInfoFields, "General Information")}

          {/* Formula Details Section */}
          {renderFieldSection(formulaDetailsFields, "Formula Details")}

          {/* Product Information Section */}
          {renderFieldSection(productInfoFields, "Product Information")}

          {/* Project Reference Section */}
          {renderFieldSection(projectReferenceFields, "Project Reference")}

          {/* Description - Always visible */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isReadOnly}
              rows={3}
              placeholder="Enter description (optional)"
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* Metadata - Read-only */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Created By
              </label>
              <input
                type="text"
                value={formula.createdBy || "Current User"}
                disabled
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Last Updated
              </label>
              <input
                type="text"
                value={
                  formula.lastUpdated
                    ? new Date(formula.lastUpdated).toLocaleDateString()
                    : new Date().toLocaleDateString()
                }
                disabled
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
          <Button variant="secondary" onClick={handleCancel}>
            {isReadOnly ? "Close" : "Cancel"}
          </Button>
          {!isReadOnly && (
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FormulaDetailsModal;
