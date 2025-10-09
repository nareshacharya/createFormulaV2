import { useState, useEffect } from "react";
import type { Formula } from "../services/pega";
import Badge from "./Badge";
// import SearchBar from "./SearchBar";

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
    "version",
    "formulaId",
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
      <div className="flex items-center justify-center h-40 text-gray-500">
        <div className="text-center">
          <i className="ri-test-tube-line text-3xl mb-2"></i>
          <p>No formulas available</p>
        </div>
      </div>
    );
  }

  const isAllCurrentPageSelected =
    paginatedFormulas.length > 0 &&
    paginatedFormulas.every((f) => selectedFormulas.includes(f.id));
  const isSomeCurrentPageSelected = paginatedFormulas.some((f) =>
    selectedFormulas.includes(f.id)
  );

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
      version: "Version",
      formulaId: "Formula ID",
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
          const notes = value as any;
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
    <div className="space-y-4">
      {/* Search bar & selection counter */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="ri-search-line text-gray-400 text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Search formulas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full pl-10 py-2 text-sm border border-gray-300 rounded-md
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              placeholder-gray-500
              pr-4
            "
          />
        </div>
        <div className="text-sm text-gray-500">
          {selectedFormulas.length} of {maxSelections || "unlimited"} selected
        </div>
      </div>

      {/* Table */}
      <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="w-12 px-3 py-2">
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
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {sortConfig?.key === column.key ? (
                      <i
                        className={`ri-arrow-${
                          sortConfig.direction === "asc" ? "up" : "down"
                        }-line text-xs text-blue-600`}
                      />
                    ) : (
                      <i className="ri-expand-up-down-line text-xs text-gray-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedFormulas.map((formula) => {
              const isSelected = selectedFormulas.includes(formula.id);
              const isHighlighted = highlightedFormulas.includes(formula.id);
              const isDisabled =
                isHighlighted ||
                (maxSelections &&
                  selectedFormulas.length >= maxSelections &&
                  !isSelected);

              return (
                <tr
                  key={formula.id}
                  className={`
                    hover:bg-gray-50 cursor-pointer
                    ${isSelected ? "bg-blue-50 border-blue-200" : ""}
                    ${isHighlighted ? "bg-yellow-50 border-yellow-200" : ""}
                    ${
                      isDisabled && !isSelected && !isHighlighted
                        ? "opacity-50"
                        : ""
                    }
                  `}
                  onClick={() => !isDisabled && handleRowClick(formula.id)}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCheckboxChange(formula.id)}
                      disabled={isDisabled}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                    />
                    {isHighlighted && (
                      <div className="text-xs text-yellow-600 mt-1">
                        Already selected
                      </div>
                    )}
                  </td>
                  {displayColumns.map((col) => (
                    <td key={col} className="px-3 py-2 text-sm font-medium">
                      {col === "name" ? (
                        <span className="font-medium">
                          {renderCellValue(formula, col)}
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
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, sortedFormulas.length)} of{" "}
            {sortedFormulas.length} formulas
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <i className="ri-arrow-left-line" />
            </button>

            <div className="flex items-center space-x-1">
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
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded-md cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <i className="ri-arrow-right-line" />
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="text-xs text-gray-500 text-center">
        {filteredFormulas.length} formulas found
      </div>
    </div>
  );
};

export default FormulaDataGrid;
