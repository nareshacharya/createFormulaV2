/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from "react";
import type { Ingredient } from "../services/pega";
import { tw, mergeStyles } from "../utils/tailwindToInline";
import Button from "./Button";
import Modal from "./Modal";

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (mappedIngredients: ParsedIngredient[]) => void;
  availableIngredients: Ingredient[];
}

interface ParsedIngredient {
  name: string;
  percentage: number;
  mappedIngredientId: string | null;
  status: "matched" | "unmatched" | "pending";
}

/**
 * ExcelUploadModal Component (View Layer)
 *
 * Exclusive for analytical formulas.
 * Allows users to upload an Excel file containing ingredients
 * and map them to the system's ingredient library.
 *
 * Expected Excel format:
 * - Column 1: Ingredient Name
 * - Column 2: Percentage
 */
const ExcelUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  availableIngredients,
}: ExcelUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedIngredients, setParsedIngredients] = useState<
    ParsedIngredient[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    // Validate file type
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (
      !validTypes.includes(selectedFile.type) &&
      !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)
    ) {
      setError("Please upload a valid Excel file (.xlsx, .xls) or CSV file");
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleProcessFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Parse the Excel file
      const fileReader = new FileReader();

      fileReader.onload = (event) => {
        try {
          const data = event.target?.result;

          // For CSV files
          if (file.name.endsWith(".csv")) {
            const text = data as string;
            const rows = text.split("\n").filter((row) => row.trim());

            // Skip header row and parse ingredients
            const ingredients: ParsedIngredient[] = rows.slice(1).map((row) => {
              const [name, percentage] = row
                .split(",")
                .map((val) => val.trim());

              // Try to find matching ingredient
              const match = availableIngredients.find(
                (ing) => ing.name.toLowerCase() === name.toLowerCase()
              );

              return {
                name,
                percentage: parseFloat(percentage) || 0,
                mappedIngredientId: match?.id || null,
                status: match ? "matched" : "unmatched",
              };
            });

            setParsedIngredients(ingredients);
          } else {
            // For Excel files, we'll need a library like xlsx
            // For now, show a message
            setError(
              "Excel file parsing requires additional library. Please use CSV format for now."
            );
          }

          setIsProcessing(false);
        } catch (_err) {
          setError("Failed to parse file. Please check the file format.");
          setIsProcessing(false);
        }
      };

      if (file.name.endsWith(".csv")) {
        fileReader.readAsText(file);
      } else {
        fileReader.readAsBinaryString(file);
      }
    } catch (_err) {
      setError("Failed to read file. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleIngredientMapping = (
    ingredientName: string,
    ingredientId: string
  ) => {
    setParsedIngredients((prev) =>
      prev.map((ing) =>
        ing.name === ingredientName
          ? { ...ing, mappedIngredientId: ingredientId, status: "matched" }
          : ing
      )
    );
  };

  const handleUpload = () => {
    // Check if all ingredients are mapped
    const unmapped = parsedIngredients.filter(
      (ing) => ing.status === "unmatched"
    );

    if (unmapped.length > 0) {
      setError(
        `Please map all ingredients. ${unmapped.length} ingredient(s) are still unmapped.`
      );
      return;
    }

    onUpload(parsedIngredients);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setParsedIngredients([]);
    setError(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Composition from Excel"
      size="xl"
      noPadding
    >
      <div
        style={mergeStyles(tw("p-6"), {
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        })}
      >
        {/* Instructions */}
        <div style={tw("bg-blue-50 border border-blue-200 rounded-lg p-4")}>
          <div style={mergeStyles(tw("flex items-start"), { gap: "0.75rem" })}>
            <span
              style={tw("text-blue-600 text-xl")}
              className="material-symbols-rounded"
            >
              info
            </span>
            <div style={tw("flex-1")}>
              <h4
                style={mergeStyles(tw("text-sm font-semibold text-blue-900"), {
                  marginBottom: "0.25rem",
                })}
              >
                Excel Format Requirements
              </h4>
              <ul
                style={mergeStyles(
                  tw("text-xs text-blue-800 list-disc list-inside"),
                  { display: "flex", flexDirection: "column", gap: "0.25rem" }
                )}
              >
                <li>Column 1: Ingredient Name</li>
                <li>Column 2: Percentage (numeric value)</li>
                <li>First row should contain headers</li>
                <li>Supported formats: .xlsx, .xls, .csv</li>
              </ul>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <label style={tw("block text-sm font-medium text-gray-700")}>
            Select Excel File
          </label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={mergeStyles(
              tw(
                "flex items-center justify-center px-4 py-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer"
              ),
              isDragging
                ? tw("border-blue-500 bg-blue-50")
                : tw(
                    "border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50"
                  )
            )}
          >
            <label
              style={tw(
                "flex-1 flex flex-col items-center justify-center cursor-pointer"
              )}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                style={tw("hidden")}
              />
              <div
                style={mergeStyles(
                  tw("flex flex-col items-center text-gray-600"),
                  { gap: "0.5rem" }
                )}
              >
                <span
                  style={tw("text-3xl text-blue-500")}
                  className="material-symbols-rounded"
                >
                  upload_file
                </span>
                <div style={tw("text-center")}>
                  <p style={tw("text-sm font-medium text-gray-900")}>
                    {file ? file.name : "Drag and drop your file here"}
                  </p>
                  {!file && (
                    <p
                      style={mergeStyles(tw("text-xs text-gray-500"), {
                        marginTop: "0.25rem",
                      })}
                    >
                      or click to select file
                    </p>
                  )}
                </div>
              </div>
            </label>

            {file && (
              <Button
                variant="primary"
                onClick={handleProcessFile}
                disabled={isProcessing}
                style={{ marginLeft: "1rem" }}
              >
                {isProcessing ? "Processing..." : "Process File"}
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={mergeStyles(
              tw(
                "bg-red-50 border border-red-200 rounded-lg p-3 flex items-center"
              ),
              { gap: "0.5rem" }
            )}
          >
            <span
              style={tw("text-red-500 text-base")}
              className="material-symbols-rounded"
            >
              error
            </span>
            <p style={tw("text-sm text-red-700")}>{error}</p>
          </div>
        )}

        {/* Parsed Ingredients Table */}
        {parsedIngredients.length > 0 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <h4 style={tw("text-sm font-semibold text-gray-900")}>
              Ingredient Mapping ({parsedIngredients.length} ingredients)
            </h4>

            <div
              style={tw("border border-gray-200 rounded-lg overflow-hidden")}
            >
              <div style={{ maxHeight: "24rem", overflowY: "auto" }}>
                <table style={tw("w-full")}>
                  <thead
                    style={mergeStyles(tw("bg-gray-50"), {
                      position: "sticky",
                      top: 0,
                    })}
                  >
                    <tr>
                      <th
                        style={tw(
                          "px-4 py-2 text-left text-xs font-medium text-gray-700"
                        )}
                      >
                        Excel Name
                      </th>
                      <th
                        style={tw(
                          "px-4 py-2 text-right text-xs font-medium text-gray-700"
                        )}
                      >
                        Percentage
                      </th>
                      <th
                        style={tw(
                          "px-4 py-2 text-left text-xs font-medium text-gray-700"
                        )}
                      >
                        Map to Ingredient
                      </th>
                      <th
                        style={tw(
                          "px-4 py-2 text-center text-xs font-medium text-gray-700"
                        )}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody style={tw("divide-y divide-gray-200")}>
                    {parsedIngredients.map((ingredient) => (
                      <tr key={ingredient.name} style={tw("hover:bg-gray-50")}>
                        <td style={tw("px-4 py-3 text-sm text-gray-900")}>
                          {ingredient.name}
                        </td>
                        <td
                          style={tw(
                            "px-4 py-3 text-sm text-gray-900 text-right"
                          )}
                        >
                          {ingredient.percentage}%
                        </td>
                        <td style={tw("px-4 py-3")}>
                          <select
                            value={ingredient.mappedIngredientId || ""}
                            onChange={(e) =>
                              handleIngredientMapping(
                                ingredient.name,
                                e.target.value
                              )
                            }
                            style={mergeStyles(
                              tw("w-full px-2 text-sm border rounded"),
                              {
                                paddingTop: "0.375rem",
                                paddingBottom: "0.375rem",
                              },
                              ingredient.status === "matched"
                                ? tw("border-green-300 bg-green-50")
                                : tw("border-red-300 bg-red-50")
                            )}
                          >
                            <option value="">Select ingredient...</option>
                            {availableIngredients.map((ing) => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={tw("px-4 py-3 text-center")}>
                          {ingredient.status === "matched" ? (
                            <span
                              style={mergeStyles(
                                tw(
                                  "inline-flex items-center rounded text-xs font-medium bg-green-100 text-green-800"
                                ),
                                {
                                  paddingLeft: "0.5rem",
                                  paddingRight: "0.5rem",
                                  paddingTop: "0.125rem",
                                  paddingBottom: "0.125rem",
                                }
                              )}
                            >
                              <span
                                style={mergeStyles(tw("text-xs"), {
                                  marginRight: "0.25rem",
                                })}
                                className="material-symbols-rounded"
                              >
                                check_circle
                              </span>
                              Mapped
                            </span>
                          ) : (
                            <span
                              style={mergeStyles(
                                tw(
                                  "inline-flex items-center rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                                ),
                                {
                                  paddingLeft: "0.5rem",
                                  paddingRight: "0.5rem",
                                  paddingTop: "0.125rem",
                                  paddingBottom: "0.125rem",
                                }
                              )}
                            >
                              <span
                                style={mergeStyles(tw("text-xs"), {
                                  marginRight: "0.25rem",
                                })}
                                className="material-symbols-rounded"
                              >
                                warning
                              </span>
                              Unmapped
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div
              style={tw(
                "flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded"
              )}
            >
              <span>Total: {parsedIngredients.length} ingredients</span>
              <span style={tw("text-green-600")}>
                Mapped:{" "}
                {parsedIngredients.filter((i) => i.status === "matched").length}
              </span>
              <span style={tw("text-yellow-600")}>
                Unmapped:{" "}
                {
                  parsedIngredients.filter((i) => i.status === "unmatched")
                    .length
                }
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={mergeStyles(
            tw("flex justify-end pt-4 border-t border-gray-200"),
            { gap: "0.75rem" }
          )}
        >
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {parsedIngredients.length > 0 && (
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={parsedIngredients.some(
                (ing) => ing.status === "unmatched"
              )}
            >
              Upload Ingredients
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ExcelUploadModal;
