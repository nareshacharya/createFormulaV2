import { useState } from "react";
import type { Ingredient } from "../services/pega";
import { eventBus } from "../utils/bus";
import { tw, mergeStyles } from "../utils/tailwindToInline";
import Badge from "./Badge";
import Button from "./Button";

interface IngredientTableProps {
  ingredients: Ingredient[];
  selectedIngredients: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  displayColumns: string[];
  showActionsBar?: boolean;
  enableAdvancedFeatures?: boolean;
}

const IngredientTable = ({
  ingredients,
  selectedIngredients,
  onSelectionChange,
  displayColumns,
  showActionsBar = true,
  enableAdvancedFeatures = false,
}: IngredientTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = enableAdvancedFeatures ? 15 : 10;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "palette":
        return "success";
      case "analytical":
        return "warning";
      case "sers_review":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusDotColor = (ingredient: Ingredient) => {
    const { status, mac } = ingredient;

    if (mac < 0) return "bg-red-500"; // Non-Compliant
    if (status === "inactive") return "bg-gray-400"; // Inactive
    if (status === "active" || status === "palette") return "bg-green-500"; // Active/Palette
    if (status === "analytical") return "bg-purple-500"; // Analytical
    if (status === "sers_review") return "bg-blue-500"; // SERS Review

    return "bg-green-500"; // Default to active
  };

  const getTypeBadgeVariant = (type: string): "success" | "info" | "default" => {
    if (type === "natural") return "success";
    if (type === "synthetic") return "info";
    return "default";
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  const sortedIngredients = [...ingredients].sort((a, b) => {
    if (!sortConfig) return 0;

    const aVal = a[sortConfig.key as keyof Ingredient];
    const bVal = b[sortConfig.key as keyof Ingredient];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (sortConfig.direction === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedIngredients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIngredients = sortedIngredients.slice(startIndex, endIndex);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      onSelectionChange(paginatedIngredients.map((ing) => ing.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleRowSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    ingredientId: string
  ) => {
    const checked = e.target.checked;
    if (checked) {
      onSelectionChange([...selectedIngredients, ingredientId]);
    } else {
      onSelectionChange(
        selectedIngredients.filter((id) => id !== ingredientId)
      );
    }
  };

  const handleRowClick = (e: React.MouseEvent, ingredientId: string) => {
    e.stopPropagation();

    if (selectedIngredients.includes(ingredientId)) {
      onSelectionChange(
        selectedIngredients.filter((id) => id !== ingredientId)
      );
    } else {
      onSelectionChange([...selectedIngredients, ingredientId]);
    }
  };

  const handleAddToFormula = () => {
    const ingredientsToAdd = ingredients.filter((ing) =>
      selectedIngredients.includes(ing.id)
    );
    ingredientsToAdd.forEach((ingredient) => {
      eventBus.emit("ingredient-selected", { ingredient });
    });
    onSelectionChange([]); // Clear selection after adding
  };

  const renderCellValue = (ingredient: Ingredient, column: string) => {
    const value = ingredient[column as keyof Ingredient];

    switch (column) {
      case "status":
        return (
          <div style={tw("flex items-center")}>
            <div
              style={mergeStyles(
                tw(`rounded-full ${getStatusDotColor(ingredient)}`),
                { width: "0.5rem", height: "0.5rem", marginRight: "0.5rem" }
              )}
            />
            <Badge variant={getStatusColor(value as string)} size="sm">
              {value as string}
            </Badge>
          </div>
        );
      case "price":
        return `$${(value as number).toFixed(2)}`;
      case "mac":
        return value === -1 ? "No limit" : value;
      case "allergens": {
        const allergens = value as string[];
        return allergens && allergens.length > 0 ? (
          <div style={mergeStyles(tw("flex flex-wrap"), { gap: "0.25rem" })}>
            {allergens.slice(0, 2).map((allergen) => (
              <Badge key={allergen} variant="warning" size="xs">
                {allergen}
              </Badge>
            ))}
            {allergens.length > 2 && (
              <Badge variant="default" size="xs">
                +{allergens.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          "-"
        );
      }
      case "type":
        return (
          <Badge
            variant={getTypeBadgeVariant(value as string)}
            size="sm"
          >
            {value as string}
          </Badge>
        );
      default:
        return value || "-";
    }
  };

  const getColumnLabel = (column: string) => {
    const labels: Record<string, string> = {
      name: "Name",
      code: "Code",
      price: "Price",
      type: "Type",
      category: "Category",
      supplier: "Supplier",
      status: "Status",
      mac: "MAC",
      odorProfile: "Odor Profile",
      volatility: "Volatility",
      allergens: "Allergens",
      ifraCategory: "IFRA Category",
      casNumber: "CAS Number",
      unit: "Unit",
    };
    return labels[column] || column;
  };

  if (ingredients.length === 0) {
    return (
      <div
        style={mergeStyles(tw("text-center text-gray-500"), {
          paddingTop: "2rem",
          paddingBottom: "2rem",
        })}
      >
        <i
          style={mergeStyles(tw("text-2xl"), {
            marginBottom: "0.5rem",
            display: "block",
          })}
          className="ri-search-line"
        ></i>
        <p>No ingredients match your filters</p>
        <p style={mergeStyles(tw("text-sm"), { marginTop: "0.25rem" })}>
          Try adjusting your filter criteria
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Actions Bar - Only show if enabled */}
      {showActionsBar && (
        <div
          style={mergeStyles(
            tw("flex items-center justify-between bg-gray-50 px-4 rounded-lg"),
            {
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              marginBottom: "1rem",
            }
          )}
        >
          <div style={tw("flex items-center")}>
            <span
              style={mergeStyles(tw("text-sm text-gray-600"), {
                marginRight: "1rem",
              })}
            >
              {selectedIngredients.length} of {ingredients.length} selected
            </span>
            {selectedIngredients.length > 0 && (
              <Button
                onClick={handleAddToFormula}
                size="sm"
                style={tw("whitespace-nowrap")}
              >
                <i style={mergeStyles(tw("mr-1"))} className="ri-add-line"></i>
                Add to Formula
              </Button>
            )}
          </div>
          <div style={tw("text-sm text-gray-500")}>
            {ingredients.length} ingredients found
          </div>
        </div>
      )}

      {/* Table */}
      <div style={tw("overflow-auto border border-gray-200 rounded-lg")}>
        <table style={tw("w-full")}>
          <thead
            style={mergeStyles(tw("bg-gray-50"), {
              position: "sticky",
              top: 0,
            })}
          >
            <tr>
              <th
                style={mergeStyles(tw("px-3 text-left"), {
                  width: "3rem",
                  paddingTop: "0.75rem",
                  paddingBottom: "0.75rem",
                })}
              >
                <input
                  type="checkbox"
                  checked={
                    selectedIngredients.length ===
                      paginatedIngredients.length &&
                    paginatedIngredients.length > 0
                  }
                  onChange={handleSelectAll}
                  style={tw(
                    "rounded border-gray-300 text-blue-600 cursor-pointer"
                  )}
                />
              </th>
              {displayColumns.map((column) => (
                <th
                  key={column}
                  style={mergeStyles(
                    tw(
                      "px-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                    ),
                    {
                      paddingTop: "0.75rem",
                      paddingBottom: "0.75rem",
                      letterSpacing: "0.05em",
                    }
                  )}
                  onClick={() => handleSort(column)}
                >
                  <div style={tw("flex items-center")}>
                    <span style={{ marginRight: "0.25rem" }}>
                      {getColumnLabel(column)}
                    </span>
                    {sortConfig?.key === column ? (
                      <i
                        style={tw("text-xs text-blue-600")}
                        className={`ri-arrow-${
                          sortConfig.direction === "asc" ? "up" : "down"
                        }-line`}
                      ></i>
                    ) : (
                      <i
                        style={mergeStyles(tw("text-xs text-gray-400"), {
                          opacity: 0,
                        })}
                        className="ri-expand-up-down-line"
                      ></i>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            style={mergeStyles(tw("bg-white"), {
              borderTop: "1px solid #e5e7eb",
            })}
          >
            {paginatedIngredients.map((ingredient) => (
              <tr
                key={ingredient.id}
                style={mergeStyles(
                  tw("cursor-pointer"),
                  selectedIngredients.includes(ingredient.id)
                    ? tw("bg-blue-50")
                    : {},
                  { borderBottom: "1px solid #e5e7eb" }
                )}
                onClick={(e) => handleRowClick(e, ingredient.id)}
              >
                <td
                  style={mergeStyles(tw("px-3"), {
                    width: "3rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                  })}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedIngredients.includes(ingredient.id)}
                    onChange={(e) => handleRowSelect(e, ingredient.id)}
                    style={tw(
                      "rounded border-gray-300 text-blue-600 cursor-pointer"
                    )}
                  />
                </td>
                {displayColumns.map((column) => (
                  <td
                    key={column}
                    style={mergeStyles(tw("px-3 text-sm text-gray-900"), {
                      paddingTop: "0.75rem",
                      paddingBottom: "0.75rem",
                      fontFamily: "sans-serif",
                    })}
                  >
                    {renderCellValue(ingredient, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div
          style={mergeStyles(tw("flex items-center justify-between"), {
            marginTop: "1rem",
          })}
        >
          <div style={tw("flex items-center")}>
            <div
              style={mergeStyles(tw("text-sm text-gray-500"), {
                marginRight: "1rem",
              })}
            >
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, sortedIngredients.length)} of{" "}
              {sortedIngredients.length} ingredients
            </div>
          </div>
          <div style={tw("flex items-center")}>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={mergeStyles(
                tw("text-sm border border-gray-300 rounded-md cursor-pointer"),
                {
                  paddingLeft: "0.5rem",
                  paddingRight: "0.5rem",
                  paddingTop: "0.25rem",
                  paddingBottom: "0.25rem",
                  marginRight: "0.5rem",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }
              )}
            >
              <i className="ri-skip-back-line"></i>
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={mergeStyles(
                tw("text-sm border border-gray-300 rounded-md cursor-pointer"),
                {
                  paddingLeft: "0.75rem",
                  paddingRight: "0.75rem",
                  paddingTop: "0.25rem",
                  paddingBottom: "0.25rem",
                  marginRight: "0.5rem",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }
              )}
            >
              <i className="ri-arrow-left-line"></i>
            </button>

            <div style={tw("flex items-center")}>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                const isCurrentPage = currentPage === pageNum;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={mergeStyles(
                      tw("text-sm border rounded-md cursor-pointer"),
                      isCurrentPage
                        ? tw("bg-blue-600 text-white border-blue-600")
                        : tw("border-gray-300"),
                      {
                        paddingLeft: "0.75rem",
                        paddingRight: "0.75rem",
                        paddingTop: "0.25rem",
                        paddingBottom: "0.25rem",
                        marginRight: "0.25rem",
                      }
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={mergeStyles(
                tw("text-sm border border-gray-300 rounded-md cursor-pointer"),
                {
                  paddingLeft: "0.75rem",
                  paddingRight: "0.75rem",
                  paddingTop: "0.25rem",
                  paddingBottom: "0.25rem",
                  marginLeft: "0.5rem",
                  marginRight: "0.5rem",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }
              )}
            >
              <i className="ri-arrow-right-line"></i>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={mergeStyles(
                tw("text-sm border border-gray-300 rounded-md cursor-pointer"),
                {
                  paddingLeft: "0.5rem",
                  paddingRight: "0.5rem",
                  paddingTop: "0.25rem",
                  paddingBottom: "0.25rem",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }
              )}
            >
              <i className="ri-skip-forward-line"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientTable;
