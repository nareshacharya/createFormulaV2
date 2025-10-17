import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import type { Formula } from "../services/pega";
import { eventBus } from "../utils/bus";

interface FormulaQuickViewProps {
  formula: Formula | null;
  isOpen: boolean;
  onClose: () => void;
}

const FormulaQuickView = ({
  formula,
  isOpen,
  onClose,
}: FormulaQuickViewProps) => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", label: "Overview", icon: "info" },
    { id: "ingredients", label: "Ingredients", icon: "beaker" },
    { id: "notes", label: "Fragrance Notes", icon: "air_freshener" },
  ];

  const handleAddToWorkArea = () => {
    if (formula) {
      eventBus.emit("formula-selected-for-column", { formula });
      onClose();
    }
  };

  const getStatusColor = () => {
    if (!formula) return "bg-gray-500";
    switch (formula.status) {
      case "active":
        return "bg-green-500";
      case "draft":
        return "bg-yellow-500";
      case "archived":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusLabel = () => {
    if (!formula) return "Unknown";
    return formula.status.charAt(0).toUpperCase() + formula.status.slice(1);
  };

  const renderOverviewSection = () => {
    if (!formula) return null;

    return (
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Formula ID
              </label>
              <p className="text-sm text-gray-900 mt-1">{formula.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Version
              </label>
              <p className="text-sm text-gray-900 mt-1">{formula.version}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <div className="flex items-center mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor()} mr-2`}
                />
                <p className="text-sm text-gray-900">{getStatusLabel()}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Category
              </label>
              <p className="text-sm text-gray-900 mt-1">{formula.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Created By
              </label>
              <p className="text-sm text-gray-900 mt-1">{formula.createdBy}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Last Updated
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {formula.lastUpdated}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Cost per kg
              </label>
              <p className="text-sm text-gray-900 mt-1 font-semibold">
                ${formula.costPerKg?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Total Percentage
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {formula.totalPercentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {formula.description && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {formula.description}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderIngredientsSection = () => {
    if (!formula || !formula.ingredients || formula.ingredients.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <span className="material-symbols-rounded text-2xl mb-2">beaker</span>
          <p>No ingredients in this formula</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ingredient List
        </h3>
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingredient Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formula.ingredients.map((ingredient, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {ingredient.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {ingredient.ingredientId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        ingredient.type === "natural"
                          ? "bg-green-100 text-green-800"
                          : ingredient.type === "synthetic"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ingredient.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                    {ingredient.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-3 text-sm font-semibold text-gray-900"
                >
                  Total
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                  {formula.ingredients
                    .reduce((sum, ing) => sum + ing.percentage, 0)
                    .toFixed(2)}
                  %
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  const renderNotesSection = () => {
    if (!formula || !formula.notes) {
      return (
        <div className="text-center py-8 text-gray-500">
          <span className="material-symbols-rounded text-2xl mb-2">
            air_freshener
          </span>
          <p>No fragrance notes available</p>
        </div>
      );
    }

    const { top, middle, base } = formula.notes;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Fragrance Notes
        </h3>

        {/* Top Notes */}
        <div>
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
            <h4 className="text-sm font-semibold text-gray-900">Top Notes</h4>
          </div>
          {top && top.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {top.map((note, index) => (
                <span
                  key={index}
                  className="inline-flex px-3 py-1 text-sm bg-yellow-50 text-yellow-800 rounded-full border border-yellow-200"
                >
                  {note}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No top notes</p>
          )}
        </div>

        {/* Middle Notes */}
        <div>
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-pink-400 rounded-full mr-2"></div>
            <h4 className="text-sm font-semibold text-gray-900">
              Middle Notes
            </h4>
          </div>
          {middle && middle.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {middle.map((note, index) => (
                <span
                  key={index}
                  className="inline-flex px-3 py-1 text-sm bg-pink-50 text-pink-800 rounded-full border border-pink-200"
                >
                  {note}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No middle notes</p>
          )}
        </div>

        {/* Base Notes */}
        <div>
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
            <h4 className="text-sm font-semibold text-gray-900">Base Notes</h4>
          </div>
          {base && base.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {base.map((note, index) => (
                <span
                  key={index}
                  className="inline-flex px-3 py-1 text-sm bg-purple-50 text-purple-800 rounded-full border border-purple-200"
                >
                  {note}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No base notes</p>
          )}
        </div>
      </div>
    );
  };

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return renderOverviewSection();
      case "ingredients":
        return renderIngredientsSection();
      case "notes":
        return renderNotesSection();
      default:
        return null;
    }
  };

  if (!formula) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formula.name}
      size="3xl"
      headerActions={
        <Button onClick={handleAddToWorkArea} size="sm">
          <span className="material-symbols-rounded mr-2">add</span>
          Add to Work Area
        </Button>
      }
    >
      <div className="flex h-full">
        {/* Vertical Sidebar Navigation */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
          <nav className="p-4 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors cursor-pointer text-left
                  ${
                    activeSection === section.id
                      ? "bg-blue-100 text-blue-700 border-l-4 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }
                `}
              >
                <span
                  className={`material-symbols-rounded mr-3 text-base flex-shrink-0`}
                >
                  {section.icon}
                </span>
                <span className="truncate">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area with consistent height and proper scrolling */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">{renderSection()}</div>
        </div>
      </div>
    </Modal>
  );
};

export default FormulaQuickView;
