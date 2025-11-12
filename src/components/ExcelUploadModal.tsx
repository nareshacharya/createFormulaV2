import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import type { Ingredient } from "../services/pega";

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
  const [parsedIngredients, setParsedIngredients] = useState<ParsedIngredient[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ];
      
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        setError("Please upload a valid Excel file (.xlsx, .xls) or CSV file");
        return;
      }

      setFile(selectedFile);
      setError(null);
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
          if (file.name.endsWith('.csv')) {
            const text = data as string;
            const rows = text.split('\n').filter(row => row.trim());
            
            // Skip header row and parse ingredients
            const ingredients: ParsedIngredient[] = rows.slice(1).map(row => {
              const [name, percentage] = row.split(',').map(val => val.trim());
              
              // Try to find matching ingredient
              const match = availableIngredients.find(
                ing => ing.name.toLowerCase() === name.toLowerCase()
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
            setError("Excel file parsing requires additional library. Please use CSV format for now.");
          }
          
          setIsProcessing(false);
        } catch (_err) {
          setError("Failed to parse file. Please check the file format.");
          setIsProcessing(false);
        }
      };

      if (file.name.endsWith('.csv')) {
        fileReader.readAsText(file);
      } else {
        fileReader.readAsBinaryString(file);
      }
    } catch (_err) {
      setError("Failed to read file. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleIngredientMapping = (index: number, ingredientId: string) => {
    setParsedIngredients((prev) =>
      prev.map((ing, i) =>
        i === index
          ? { ...ing, mappedIngredientId: ingredientId, status: "matched" }
          : ing
      )
    );
  };

  const handleUpload = () => {
    // Check if all ingredients are mapped
    const unmapped = parsedIngredients.filter(ing => ing.status === "unmatched");
    
    if (unmapped.length > 0) {
      setError(`Please map all ingredients. ${unmapped.length} ingredient(s) are still unmapped.`);
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
      title="Upload Ingredients from Excel"
      size="xl"
    >
      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="material-symbols-rounded text-blue-600 text-xl">
              info
            </span>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Excel Format Requirements
              </h4>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Column 1: Ingredient Name</li>
                <li>Column 2: Percentage (numeric value)</li>
                <li>First row should contain headers</li>
                <li>Supported formats: .xlsx, .xls, .csv</li>
              </ul>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Select Excel File
          </label>
          
          <div className="flex items-center space-x-3">
            <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center space-x-2 text-gray-600">
                <span className="material-symbols-rounded">upload_file</span>
                <span className="text-sm">
                  {file ? file.name : "Click to select file"}
                </span>
              </div>
            </label>
            
            {file && (
              <Button
                variant="primary"
                onClick={handleProcessFile}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Process File"}
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
            <span className="material-symbols-rounded text-red-500 text-base">
              error
            </span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Parsed Ingredients Table */}
        {parsedIngredients.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">
              Ingredient Mapping ({parsedIngredients.length} ingredients)
            </h4>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                        Excel Name
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">
                        Percentage
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                        Map to Ingredient
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parsedIngredients.map((ingredient, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {ingredient.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {ingredient.percentage}%
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={ingredient.mappedIngredientId || ""}
                            onChange={(e) =>
                              handleIngredientMapping(index, e.target.value)
                            }
                            className={`w-full px-2 py-1.5 text-sm border rounded ${
                              ingredient.status === "matched"
                                ? "border-green-300 bg-green-50"
                                : "border-red-300 bg-red-50"
                            }`}
                          >
                            <option value="">Select ingredient...</option>
                            {availableIngredients.map((ing) => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {ingredient.status === "matched" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <span className="material-symbols-rounded text-xs mr-1">
                                check_circle
                              </span>
                              Mapped
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <span className="material-symbols-rounded text-xs mr-1">
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
            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded">
              <span>
                Total: {parsedIngredients.length} ingredients
              </span>
              <span className="text-green-600">
                Mapped: {parsedIngredients.filter(i => i.status === "matched").length}
              </span>
              <span className="text-yellow-600">
                Unmapped: {parsedIngredients.filter(i => i.status === "unmatched").length}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {parsedIngredients.length > 0 && (
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={parsedIngredients.some(ing => ing.status === "unmatched")}
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
