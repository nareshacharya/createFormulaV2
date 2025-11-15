/**
 * AddItemModal Component
 *
 * Modal dialog for selecting and adding ingredients or formulas to the DataGrid.
 * Provides type selection (ingredient/formula) and search/filter capabilities.
 *
 * Features:
 * - Type selector (Ingredient/Formula)
 * - Search by name or ID
 * - List display with add buttons
 * - Integrates with library data
 *
 * @module DataGrid/components/AddItemModal
 */

import { useState, useEffect } from "react";
import type { Ingredient, Formula } from "../../../services/pega";
import Modal from "../../Modal";
import PillTabs from "../../PillTabs";
import SearchBar from "../../SearchBar";

interface AddItemModalProps {
  /** Whether the modal is open */
  isOpen: boolean;

  /** Callback to close the modal */
  onClose: () => void;

  /** Callback when an ingredient is selected */
  onAddIngredient: (ingredient: Ingredient) => void;

  /** Callback when a formula is selected */
  onAddFormula: (formula: Formula) => void;

  /** Available ingredients from library */
  ingredients: Ingredient[];

  /** Available formulas from library */
  formulas: Formula[];

  /** Row ID where item will be inserted */
  insertAfterRowId: string;
}

export const AddItemModal = ({
  isOpen,
  onClose,
  onAddIngredient,
  onAddFormula,
  ingredients,
  formulas,
  insertAfterRowId,
}: AddItemModalProps) => {
  const [itemType, setItemType] = useState<"ingredient" | "formula">(
    "ingredient"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setItemType("ingredient");
      setSearchQuery("");
    }
  }, [isOpen]);

  const tabs = [
    { id: "ingredient", label: "Ingredients", icon: "labs" },
    { id: "formula", label: "Formulas", icon: "experiment" },
  ];

  // Filter ingredients based on search
  const filteredIngredients = ingredients.filter(
    (ingredient) =>
      !searchQuery ||
      ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ingredient.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter formulas based on search
  const filteredFormulas = formulas.filter(
    (formula) =>
      !searchQuery ||
      formula.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formula.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleIngredientSelect = (ingredient: Ingredient) => {
    onAddIngredient(ingredient);
    onClose();
  };

  const handleFormulaSelect = (formula: Formula) => {
    onAddFormula(formula);
    onClose();
  };

  const footerActions = (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        Close
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Item"
      size="md"
      noPadding
      footerActions={footerActions}
    >
      <div className="flex flex-col h-full p-6">
        {/* Type Selector */}
        <div className="mb-4">
          <PillTabs
            tabs={tabs}
            activeTab={itemType}
            onTabChange={(tabId) =>
              setItemType(tabId as "ingredient" | "formula")
            }
          />
        </div>

        {/* Search */}
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={`Search ${itemType}s...`}
          />
        </div>

        {/* Info */}
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            {itemType === "ingredient"
              ? `Select an ingredient to insert after row "${insertAfterRowId}"`
              : `Select a formula to insert after row "${insertAfterRowId}"`}
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto border border-gray-200 rounded-md">
          {itemType === "ingredient" ? (
            <div>
              {filteredIngredients.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <span className="material-symbols-rounded text-4xl mb-2">
                    search_off
                  </span>
                  <p>No ingredients found</p>
                </div>
              ) : (
                filteredIngredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="p-3 border-b border-gray-100 hover:bg-gray-50 flex items-center justify-between group"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {ingredient.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ingredient.code} • {ingredient.type}
                      </div>
                    </div>
                    <button
                  type="button"
                      onClick={() => handleIngredientSelect(ingredient)}
                      className="ml-3 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div>
              {filteredFormulas.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <span className="material-symbols-rounded text-4xl mb-2">
                    search_off
                  </span>
                  <p>No formulas found</p>
                </div>
              ) : (
                filteredFormulas.map((formula) => (
                  <div
                    key={formula.id}
                    className="p-3 border-b border-gray-100 hover:bg-gray-50 flex items-center justify-between group"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {formula.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formula.id} • {formula.version} • {formula.status}
                      </div>
                    </div>
                    <button
                  type="button"
                      onClick={() => handleFormulaSelect(formula)}
                      className="ml-3 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
