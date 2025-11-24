/**
 * Analytical Composition Upload Modal (US #2202)
 * Handles file upload, sheet selection, ingredient parsing, and mapping
 */

import React, { useState, useCallback } from "react";
import type {
  AnalyticalCompositionIngredient,
  AnalyticalCompositionUpload,
  AnalyticalMethodType,
} from "../types/formula.creation.types";
import {
  ANALYTICAL_METHOD_LABELS,
  ANALYTICAL_METHOD_TYPES,
} from "../types/formula.creation.types";
import { AnalyticalCompositionService } from "../services/analyticalComposition";
import Modal from "./Modal";
import Button from "./Button";
import Toast from "./Toast";
import type { Ingredient } from "../services/pega";

interface AnalyticalCompositionUploadModalProps {
  isOpen: boolean;
  sampleID: string;
  availableIngredients: Ingredient[];
  onClose: () => void;
  onUpload: (composition: AnalyticalCompositionUpload) => void;
}

type UploadStep = "file-select" | "sheet-select" | "ingredient-map" | "confirm";

interface UploadState {
  step: UploadStep;
  file: File | null;
  availableSheets: string[];
  selectedSheet: string | null;
  detectedMethod: AnalyticalMethodType | null;
  selectedMethod: AnalyticalMethodType | null;
  ingredients: AnalyticalCompositionIngredient[];
  error: string | null;
  loading: boolean;
  unmappedCount: number;
}

export const AnalyticalCompositionUploadModal: React.FC<
  AnalyticalCompositionUploadModalProps
> = ({ isOpen, sampleID, availableIngredients, onClose, onUpload }) => {
  const [state, setState] = useState<UploadState>({
    step: "file-select",
    file: null,
    availableSheets: [],
    selectedSheet: null,
    detectedMethod: null,
    selectedMethod: null,
    ingredients: [],
    error: null,
    loading: false,
    unmappedCount: 0,
  });

  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Try to read as Excel first
        if (file.name.endsWith(".csv")) {
          // For CSV files, parse directly and skip sheet selection
          const ingredients = await AnalyticalCompositionService.parseCSVFile(
            file,
            availableIngredients
          );

          const unmappedCount = ingredients.filter(
            (ing) => ing.status === "unmatched"
          ).length;

          setState((prev) => ({
            ...prev,
            file,
            availableSheets: ["Data"],
            selectedSheet: "Data",
            detectedMethod: ANALYTICAL_METHOD_TYPES.DB_VALIDATE,
            selectedMethod: ANALYTICAL_METHOD_TYPES.DB_VALIDATE,
            ingredients,
            unmappedCount,
            step: "ingredient-map",
            loading: false,
          }));

          setToast({
            type: "success",
            message: `CSV loaded with ${ingredients.length} ingredient(s)`,
          });
        } else {
          // For Excel files
          const sheets =
            await AnalyticalCompositionService.getAvailableSheets(file);

          if (sheets.length === 0) {
            setToast({
              type: "error",
              message: "No sheets found in Excel file",
            });
            setState((prev) => ({
              ...prev,
              loading: false,
              error: "No sheets found in Excel file",
            }));
            return;
          }

          setState((prev) => ({
            ...prev,
            file,
            availableSheets: sheets,
            selectedSheet: sheets[0],
            step: sheets.length === 1 ? "ingredient-map" : "sheet-select",
            loading: false,
          }));

          setToast({
            type: "success",
            message: `File loaded with ${sheets.length} sheet(s)`,
          });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to read file";
        console.error("File select error:", err);
        setToast({ type: "error", message });
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }));
      }
    },
    [availableIngredients]
  );

  /**
   * Handle drag and drop
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-blue-500", "bg-blue-50");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");

    const file = e.dataTransfer.files?.[0];
    if (
      file &&
      (file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".csv"))
    ) {
      const event = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    } else {
      setToast({
        type: "error",
        message: "Please drop an Excel or CSV file",
      });
    }
  };

  /**
   * Handle sheet selection - only process if we're actually changing sheets
   */
  const handleSheetSelect = useCallback(
    async (sheetName: string) => {
      if (!state.file || !sheetName) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const detected =
          AnalyticalCompositionService.detectMethodType(sheetName);

        const ingredients =
          await AnalyticalCompositionService.parseCompositionSheet(
            state.file,
            sheetName,
            availableIngredients
          );

        const unmappedCount = ingredients.filter(
          (ing) => ing.status === "unmatched"
        ).length;

        setState((prev) => ({
          ...prev,
          selectedSheet: sheetName,
          detectedMethod: detected,
          selectedMethod: detected,
          ingredients,
          unmappedCount,
          step: "ingredient-map",
          loading: false,
        }));

        setToast({
          type: "success",
          message: `Parsed ${ingredients.length} ingredients from sheet`,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to parse sheet";
        setToast({ type: "error", message });
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }));
      }
    },
    [state.file, availableIngredients]
  );

  /**
   * Handle ingredient mapping
   */
  const handleMapIngredient = useCallback(
    (ingredientName: string, ingredientId: string) => {
      setState((prev) => {
        const updatedIngredients = prev.ingredients.map((ing) =>
          ing.name === ingredientName
            ? {
                ...ing,
                mappedIngredientId: ingredientId,
                status: "matched" as const,
              }
            : ing
        );

        const unmappedCount = updatedIngredients.filter(
          (ing) => ing.status === "unmatched"
        ).length;

        return {
          ...prev,
          ingredients: updatedIngredients,
          unmappedCount,
        };
      });
    },
    []
  );

  /**
   * Handle upload confirmation
   */
  const handleConfirm = useCallback(() => {
    if (!state.selectedMethod) {
      setToast({
        type: "error",
        message: "Please select an analysis method",
      });
      return;
    }

    const composition = AnalyticalCompositionService.createCompositionUpload(
      sampleID,
      state.selectedMethod,
      state.ingredients,
      state.selectedSheet || ""
    );

    const validation =
      AnalyticalCompositionService.validateComposition(composition);

    if (!validation.isValid) {
      setToast({
        type: "error",
        message: validation.errors[0],
      });
      return;
    }

    // Show warnings if any
    if (validation.warnings && validation.warnings.length > 0) {
      setToast({
        type: "info",
        message: validation.warnings[0],
      });
    }

    onUpload(composition);
    setToast({
      type: "success",
      message: "Composition uploaded successfully",
    });

    // Reset and close
    setTimeout(() => {
      setState({
        step: "file-select",
        file: null,
        availableSheets: [],
        selectedSheet: null,
        detectedMethod: null,
        selectedMethod: null,
        ingredients: [],
        error: null,
        loading: false,
        unmappedCount: 0,
      });
      onClose();
    }, 1000);
  }, [
    state.selectedMethod,
    state.ingredients,
    state.selectedSheet,
    sampleID,
    onUpload,
    onClose,
  ]);

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setState({
      step: "file-select",
      file: null,
      availableSheets: [],
      selectedSheet: null,
      detectedMethod: null,
      selectedMethod: null,
      ingredients: [],
      error: null,
      loading: false,
      unmappedCount: 0,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        title="Upload Analytical Composition"
        onClose={handleClose}
      >
        <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Upload Analytical Composition
          </h2>

          {/* File Select Step */}
          {state.step === "file-select" && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Upload an Excel file containing analytical composition data for
                Sample ID: <strong>{sampleID}</strong>
              </p>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition"
              >
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  disabled={state.loading}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  <div className="text-4xl mb-2">📁</div>
                  <p className="font-medium text-gray-700">
                    Drag and drop your Excel or CSV file here
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: .xlsx, .xls, .csv
                  </p>
                </label>
              </div>

              {state.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <div className="font-medium mb-1">Error:</div>
                  <div>{state.error}</div>
                  {state.error.toLowerCase().includes("library") && (
                    <div className="mt-2 text-xs text-red-600">
                      Tip: Try converting your Excel file to CSV format and
                      upload that instead.
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={state.loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Sheet Select Step */}
          {state.step === "sheet-select" && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                The file contains multiple sheets. Select which sheet contains
                the composition data:
              </p>

              <div className="grid grid-cols-1 gap-2 mb-6">
                {state.availableSheets.map((sheet) => (
                  <button
                    type="button"
                    key={sheet}
                    onClick={() => {
                      setState((prev) => ({
                        ...prev,
                        selectedSheet: sheet,
                      }));
                    }}
                    disabled={state.loading}
                    className={`p-3 rounded border-2 text-left transition ${
                      state.selectedSheet === sheet
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{sheet}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {AnalyticalCompositionService.detectMethodType(
                        sheet
                      ).toUpperCase()}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setState((prev) => ({ ...prev, step: "file-select" }))
                  }
                  disabled={state.loading}
                >
                  Back
                </Button>
                <Button
                  onClick={() => handleSheetSelect(state.selectedSheet || "")}
                  disabled={state.loading || !state.selectedSheet}
                >
                  {state.loading ? "Loading..." : "Process Sheet"}
                </Button>
              </div>
            </div>
          )}

          {/* Ingredient Map Step */}
          {state.step === "ingredient-map" && (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Analysis Method</h3>
                    <p className="text-sm text-gray-600">
                      Select the analysis method type
                    </p>
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {state.unmappedCount > 0 && (
                      <span className="text-red-600">
                        {state.unmappedCount} unmapped
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {Object.values(ANALYTICAL_METHOD_TYPES).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          selectedMethod: method,
                        }))
                      }
                      className={`p-2 rounded border-2 text-sm transition ${
                        state.selectedMethod === method
                          ? "border-blue-500 bg-blue-50 font-medium"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {ANALYTICAL_METHOD_LABELS[method]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Ingredients</h3>
                <div className="border rounded overflow-hidden max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">
                          Name
                        </th>
                        <th className="px-4 py-2 text-right font-medium w-20">
                          %
                        </th>
                        <th className="px-4 py-2 text-center font-medium w-20">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.ingredients.map((ing, idx) => (
                        <tr
                          key={`ingredient-${idx}-${ing.name}-${ing.percentage}`}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-4 py-2">
                            <select
                              value={ing.mappedIngredientId || ""}
                              onChange={(e) =>
                                handleMapIngredient(ing.name, e.target.value)
                              }
                              className="w-full p-1 border rounded text-xs"
                            >
                              <option value="">
                                {ing.name}
                                {ing.status === "unmatched"
                                  ? " (unmapped)"
                                  : ""}
                              </option>
                              {availableIngredients.map((avail) => (
                                <option key={avail.id} value={avail.id}>
                                  {avail.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2 text-right">
                            {ing.percentage.toFixed(5)}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                ing.status === "matched"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {ing.status === "matched" ? "✓" : "!"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setState((prev) => ({ ...prev, step: "sheet-select" }))
                  }
                  disabled={state.loading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={state.loading || !state.selectedMethod}
                >
                  {state.loading ? "Processing..." : "Upload Composition"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {toast && (
        <Toast
          type={toast.type === "info" ? "success" : toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default AnalyticalCompositionUploadModal;
