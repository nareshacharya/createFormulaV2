import { useState, useEffect } from "react";
import { getListItemClasses, selectionStyles } from "../config/theme";
import type { Formula } from "../services/pega";
import { tw, mergeStyles } from "../utils/tailwindToInline";
import Alert from "./Alert";
import Badge from "./Badge";

interface FormulaDataGridProps {
  formulas: Formula[];
  selectedFormulas: string[];
  onSelectionChange: (selected: string[]) => void;
  maxSelections?: number;
  highlightedFormulas?: string[]; // Add this prop to highlight already selected formulas
}

const FormulaDataGrid = ({
  formulas = [],
  selectedFormulas = [],
  onSelectionChange,
  maxSelections = 4,
  highlightedFormulas = [], // Default to empty array
}: FormulaDataGridProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [displayColumns] = useState<string[]>([
    "name",
    "id",
    "version",
    "status",
    "category",
    "costPerKg",
  ]);

  const itemsPerPage = 10;

  /* --------------------------------------------------------------------- *
   *  Data processing (filter → sort → paginate)
   * --------------------------------------------------------------------- */
  const filteredFormulas = formulas.filter((formula) => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      formula.name?.toLowerCase().includes(lower) ||
      formula.version?.toLowerCase().includes(lower) ||
      formula.id?.toLowerCase().includes(lower) ||
      formula.category?.toLowerCase().includes(lower)
    );
  });

  const sortedFormulas = [...filteredFormulas].sort((a, b) => {
    if (!sortConfig) return 0;

    const aVal = a[sortConfig.key as keyof Formula];
    const bVal = b[sortConfig.key as keyof Formula];

    // Defensive handling of null/undefined values
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // Numeric comparison if both are numbers, otherwise use localeCompare for strings
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal);
    const bStr = String(bVal);
    return sortConfig.direction === "asc"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  const totalPages = Math.ceil(sortedFormulas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFormulas = sortedFormulas.slice(startIndex, endIndex);

  /* --------------------------------------------------------------------- *
   *  Handlers
   * --------------------------------------------------------------------- */
  const handleSort = (key: string) => {
    const direction =
      sortConfig && sortConfig.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleRowClick = (formulaId: string) => {
    // Don't allow selection of already highlighted (selected) formulas
    if (highlightedFormulas.includes(formulaId)) {
      return;
    }

    if (selectedFormulas.includes(formulaId)) {
      onSelectionChange(selectedFormulas.filter((id) => id !== formulaId));
    } else if (!maxSelections || selectedFormulas.length < maxSelections) {
      onSelectionChange([...selectedFormulas, formulaId]);
    }
  };

  const handleCheckboxChange = (formulaId: string) => {
    // Don't allow selection of already highlighted (selected) formulas
    if (highlightedFormulas.includes(formulaId)) {
      return;
    }

    handleRowClick(formulaId);
  };

  const handleSelectAll = () => {
    if (isAllCurrentPageSelected) {
      // Deselect all on current page respecting highlighted formulas
      const newIds = selectedFormulas.filter(
        (id) => !paginatedFormulas.some((f) => f.id === id)
      );
      onSelectionChange(newIds);
    } else {
      // Only select formulas that are not already highlighted
      const availableIds = paginatedFormulas
        .filter((f) => !highlightedFormulas.includes(f.id))
        .slice(
          0,
          maxSelections ? maxSelections - selectedFormulas.length : undefined
        )
        .map((f) => f.id);
      onSelectionChange([...selectedFormulas, ...availableIds]);
    }
  };

  // Reset to first page whenever the search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  /* --------------------------------------------------------------------- *
   *  Early return – empty state
   * --------------------------------------------------------------------- */
  if (!formulas || formulas.length === 0) {
    return (
      <div
        style={mergeStyles(
          tw("flex items-center justify-center text-gray-500"),
          { height: "10rem" }
        )}
      >
        <div style={tw("text-center")}>
          <i style={tw("text-3xl")} className="ri-test-tube-line"></i>
          <p style={{ marginTop: "8px" }}>No formulas available</p>
        </div>
      </div>
    );
  }

  const isAllCurrentPageSelected =
    paginatedFormulas.length > 0 &&
    paginatedFormulas.every((f) => selectedFormulas.includes(f.id));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "default";
      default:
        return "default";
    }
  };

  const getColumnLabel = (col: string) => {
    const map: Record<string, string> = {
      name: "Name",
      id: "Formula ID",
      version: "Version",
      status: "Status",
      category: "Category",
      costPerKg: "Cost per kg",
    };
    return map[col] ?? col;
  };

  const renderCellValue = (formula: Formula, column: string) => {
    const value = formula[column as keyof Formula];
    switch (column) {
      case "status":
        return (
          <Badge variant={getStatusColor(value as string)} size="sm">
            {value as string}
          </Badge>
        );
      case "costPerKg":
        return typeof value === "number" ? `$${value.toFixed(2)}` : "-";
      case "ingredients":
        return Array.isArray(value) ? `${value.length} ingredients` : "-";
      case "notes":
        if (value && typeof value === "object" && "top" in value) {
          const notes = value as {
            top?: unknown[];
            middle?: unknown[];
            base?: unknown[];
          };
          return `Top: ${notes.top?.length || 0}, Mid: ${
            notes.middle?.length || 0
          }, Base: ${notes.base?.length || 0}`;
        }
        return "-";
      default:
        if (Array.isArray(value)) {
          return value.join(", ");
        }
        return String(value ?? "-");
    }
  };

  // Prepare column objects for the table header
  const columns = displayColumns.map((col) => ({
    key: col,
    title: getColumnLabel(col),
  }));

  return (
    <div>
      {/* Alert info */}
      <div style={{ marginBottom: "12px" }}>
        <Alert variant="info">
          Select up to <strong>{maxSelections}</strong> formulas to compare.
        </Alert>
      </div>

      {/* Compact Search and Counter Row */}
      <div
        style={mergeStyles(tw("flex items-center gap-3"), {
          marginBottom: "12px",
        })}
      >
        <div style={tw("flex-1")}>
          <div style={tw("relative")}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                paddingLeft: "12px",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              <i
                style={tw("text-gray-400 text-sm")}
                className="ri-search-line"
              ></i>
            </div>
            <input
              type="text"
              placeholder="Search by name or formula ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={mergeStyles(
                tw("w-full py-2 text-sm border border-gray-300 rounded-md"),
                { paddingLeft: "2.5rem", paddingRight: "1rem" }
              )}
            />
          </div>
        </div>
        <div style={tw("flex items-center gap-4 text-xs whitespace-nowrap")}>
          <span style={tw("text-gray-500")}>
            {filteredFormulas.length} available
          </span>
          <span style={tw("font-medium text-blue-600")}>
            {selectedFormulas.length} / {maxSelections || "∞"} selected
          </span>
        </div>
      </div>

      {/* Table */}
      <div
        style={mergeStyles(
          tw("overflow-y-auto border border-gray-200 rounded-lg"),
          { maxHeight: "24rem" }
        )}
      >
        <table style={tw("w-full")}>
          <thead
            style={mergeStyles(tw("bg-gray-50"), {
              position: "sticky",
              top: 0,
            })}
          >
            <tr>
              <th style={mergeStyles(tw("px-3 py-2"), { width: "3rem" })}>
                <input
                  type="checkbox"
                  checked={isAllCurrentPageSelected}
                  onChange={handleSelectAll}
                  disabled={
                    maxSelections
                      ? selectedFormulas.length >= maxSelections &&
                        !isAllCurrentPageSelected
                      : false
                  }
                  style={mergeStyles(
                    tw("rounded border-gray-300 cursor-pointer"),
                    {
                      opacity:
                        maxSelections &&
                        selectedFormulas.length >= maxSelections &&
                        !isAllCurrentPageSelected
                          ? 0.5
                          : 1,
                    }
                  )}
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={tw(
                    "px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                  )}
                  onClick={() => handleSort(column.key)}
                >
                  <div
                    style={mergeStyles(tw("flex items-center"), { gap: "4px" })}
                  >
                    <span>{column.title}</span>
                    {sortConfig?.key === column.key ? (
                      <i
                        style={tw("text-xs text-blue-600")}
                        className={`ri-arrow-${
                          sortConfig.direction === "asc" ? "up" : "down"
                        }-line`}
                      />
                    ) : (
                      <i
                        style={tw("text-xs text-gray-400")}
                        className="ri-expand-up-down-line"
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ borderTop: "1px solid #e5e7eb" }}>
            {paginatedFormulas.map((formula) => {
              const isSelected = selectedFormulas.includes(formula.id);
              const isHighlighted = highlightedFormulas.includes(formula.id);
              const isDisabled =
                isHighlighted ||
                (maxSelections &&
                  selectedFormulas.length >= maxSelections &&
                  !isSelected);

              // Use consistent theme-based classes
              const rowClasses = getListItemClasses({
                isSelected,
                isHighlighted,
                isDisabled: isDisabled && !isSelected && !isHighlighted,
              });

              return (
                <tr
                  key={formula.id}
                  style={mergeStyles(tw(rowClasses), tw("cursor-pointer"))}
                  onClick={() => !isDisabled && handleRowClick(formula.id)}
                >
                  <td style={tw("px-3 py-2")}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCheckboxChange(formula.id)}
                      disabled={isDisabled}
                      style={mergeStyles(
                        tw("rounded border-gray-300 cursor-pointer"),
                        {
                          opacity: isDisabled ? 0.5 : 1,
                        }
                      )}
                    />
                  </td>
                  {displayColumns.map((col) => (
                    <td key={col} style={tw("px-3 py-2 text-sm font-medium")}>
                      {col === "name" ? (
                        <span
                          style={mergeStyles(
                            tw("font-medium flex items-center"),
                            { gap: "6px" }
                          )}
                        >
                          {renderCellValue(formula, col)}
                          {isHighlighted && (
                            <i
                              style={tw(
                                `text-base ${selectionStyles.selected.icon}`
                              )}
                              className="ri-check-line"
                            ></i>
                          )}
                        </span>
                      ) : (
                        renderCellValue(formula, col)
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={tw("flex items-center justify-between")}>
          <div style={tw("text-sm text-gray-500")}>
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, sortedFormulas.length)} of{" "}
            {sortedFormulas.length} formulas
          </div>
          <div style={mergeStyles(tw("flex items-center"), { gap: "8px" })}>
            <button
                  type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={mergeStyles(
                tw(
                  "px-3 py-1 text-sm border border-gray-300 rounded-md cursor-pointer"
                ),
                {
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }
              )}
            >
              <i className="ri-arrow-left-line" />
            </button>

            <div style={mergeStyles(tw("flex items-center"), { gap: "4px" })}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                const isCurrentPage = currentPage === pageNum;
                return (
                  <button
                  type="button"
                type="button"
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={mergeStyles(
                      tw("px-3 py-1 text-sm border rounded-md cursor-pointer"),
                      isCurrentPage
                        ? tw("bg-blue-600 text-white border-blue-600")
                        : tw("border-gray-300")
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
                  type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={mergeStyles(
                tw(
                  "px-3 py-1 text-sm border border-gray-300 rounded-md cursor-pointer"
                ),
                {
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }
              )}
            >
              <i className="ri-arrow-right-line" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormulaDataGrid;
