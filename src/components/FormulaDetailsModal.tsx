import { useEffect, useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import type { Formula } from "../services/pega";
import { FORMULA_TYPES, getFormulaTypeLabel } from "../config/formulaTypes.config";
import { isFieldVisible } from "../config/formulaCreation.config";

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
 * Shows all fields that were captured during formula creation
 * based on formula type configuration.
 */
const FormulaDetailsModal = ({
  isOpen,
  onClose,
  formula,
  isReadOnly,
  onSave,
}: FormulaDetailsModalProps) => {
  const [formData, setFormData] = useState<Partial<Formula> | null>(null);

  useEffect(() => {
    if (formula) {
      setFormData({
        name: formula.name,
        category: formula.category,
        description: formula.description,
        formulaType: formula.formulaType,
        // Add all relevant fields from formula
        projectName: formula.projectName,
        projectId: formula.projectId,
        ...formula,
      });
    }
  }, [formula]);

  const handleInputChange = (field: keyof Formula, value: string | number | undefined) => {
    if (isReadOnly) return;
    setFormData((prev) => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleSave = () => {
    if (!formData || isReadOnly) return;
    onSave?.(formData);
    onClose();
  };

  const handleCancel = () => {
    setFormData(null);
    onClose();
  };

  if (!formula || !formData) return null;

  const formulaType = formula.formulaType || FORMULA_TYPES.BASE;

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
          <span className="text-sm font-medium text-gray-700">Formula Type:</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {getFormulaTypeLabel(formulaType)}
          </span>
        </div>

        {/* Form Fields organized by sections */}
        <div className="space-y-5">
          {/* Basic Information Section */}
          <div className="border-b border-gray-200 pb-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Formula Name/Fragrance Name */}
              {isFieldVisible("fragranceName", formulaType) && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fragrance Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              )}

              {/* Sample ID (for Analytical) */}
              {isFieldVisible("sampleId", formulaType) && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Sample ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={(formData as Record<string, unknown>).sampleId as string || ""}
                    onChange={(e) =>
                      handleInputChange("sampleId" as keyof Formula, e.target.value)
                    }
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.category || ""}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              {/* Version */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  value={formula.version || ""}
                  disabled
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className="border-b border-gray-200 pb-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Project Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.projectName || ""}
                  onChange={(e) =>
                    handleInputChange("projectName", e.target.value)
                  }
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Project ID
                </label>
                <input
                  type="text"
                  value={formData.projectId || ""}
                  onChange={(e) => handleInputChange("projectId", e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* Created By and Last Updated */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Created By
              </label>
              <input
                type="text"
                value={formula.createdBy || ""}
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
                    : ""
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
