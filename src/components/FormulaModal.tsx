import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import PillTabs from "./PillTabs";
import FormulaDataGrid from "./FormulaDataGrid";
import type { Formula } from "../services/pega";

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
    name: "",
    category: "Eau de Toilette",
    description: "",
    createdBy: "Current User",
  });

  const categories = [
    "Eau de Toilette",
    "Eau de Parfum",
    "Eau de Cologne",
    "Parfum",
    "Eau Fraiche",
  ];

  const remainingSelections = maxSelections - currentSelections;

  const handleClose = () => {
    setActiveTab("select");
    setSelectedFormulas([]);
    setNewFormulaData({
      name: "",
      category: "Eau de Toilette",
      description: "",
      createdBy: "Current User",
    });
    onClose();
  };

  const handleCreateNewFormula = () => {
    if (!newFormulaData.name.trim()) {
      return;
    }

    const newFormula: Omit<Formula, "id"> = {
      name: newFormulaData.name,
      version: "v1", // Updated to match naming convention
      status: "draft",
      createdBy: newFormulaData.createdBy,
      lastUpdated: new Date().toISOString().split("T")[0],
      category: newFormulaData.category,
      totalPercentage: 0,
      description: newFormulaData.description,
      ingredients: [],
      notes: {
        top: [],
        middle: [],
        base: [],
      },
    };

    onCreateFormula(newFormula);
    handleClose();
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

  const CreateFormulaForm = () => (
    <div className="px-6 pt-3 pb-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formula Name *
            </label>
            <input
              type="text"
              value={newFormulaData.name}
              onChange={(e) =>
                setNewFormulaData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter formula name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
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
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Created By
            </label>
            <input
              type="text"
              value={newFormulaData.createdBy}
              onChange={(e) =>
                setNewFormulaData((prev) => ({
                  ...prev,
                  createdBy: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter creator name"
            />
          </div>

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
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter formula description (optional)"
            />
          </div>
        </div>
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
            disabled={!newFormulaData.name.trim()}
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
          {activeTab === "create" && <CreateFormulaForm />}
          {activeTab === "select" && <SelectFormulaForm />}
        </div>
      </div>
    </Modal>
  );
};

export default FormulaModal;
