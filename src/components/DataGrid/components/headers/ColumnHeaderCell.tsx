import { GroupingButton } from "../GroupingButton";
import { isOwnFormula } from "../../../../utils/formulaIdGenerator";
import { useDataGridFeatures } from "../../../../hooks/useFeatureFlags";

// Use Column type from DataGrid.tsx to match parent component
interface Column {
  id: string;
  key: string;
  title: string;
  type: "text" | "number" | "boolean" | "select" | "add-column" | "badge";
  sortable?: boolean;
  editable?: boolean;
  fixed?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  group?: string;
  formulaId?: string; // Universal formula ID (F00001v1)
  formulaDisplayId?: string; // Type-specific display ID (B00001v1, MZ00001v1, etc.)
  attributeId?: string;
  values?: string[];
  options?: string[];
  render?: (value: any, row: any) => React.ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface ColumnHeaderCellProps {
  column: Column;
  formulas?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  index: number;
  editableFormula?: string | null;
  draggedColumn: number | null;
  dragOverColumn: number | null;
  showColumnActions: string | null;
  sortConfig: SortConfig | null;
  groupedByColumn: string | null;
  menuRef: React.RefObject<HTMLDivElement>;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onColumnHeaderClick: (e: React.MouseEvent, columnId: string) => void;
  onAddColumn: (type: "formula" | "attribute") => void;
  onSort: (columnId: string) => void;
  onToggleGrouping?: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  onSetActiveFormula?: (columnId: string) => void;
  onCreateVersion?: (columnId: string) => void;
  onNormalizeFormula?: (columnId: string) => void;
  onSendForCompounding?: (columnId: string) => void;
  onEditFormulaDetails?: (columnId: string) => void;
  onViewFormulaDetails?: (columnId: string) => void;
  onUploadExcel?: (columnId: string) => void;
  setShowColumnActions: (columnId: string | null) => void;
}

export const ColumnHeaderCell = ({
  column,
  formulas = [],
  index,
  editableFormula,
  draggedColumn,
  dragOverColumn,
  showColumnActions,
  sortConfig,
  groupedByColumn,
  menuRef,
  onDragStart,
  onDragOver,
  onDrop,
  onColumnHeaderClick,
  onAddColumn,
  onSort,
  onToggleGrouping,
  onDeleteColumn,
  onSetActiveFormula,
  onCreateVersion,
  onNormalizeFormula,
  onSendForCompounding,
  onEditFormulaDetails,
  onViewFormulaDetails,
  onUploadExcel,
  setShowColumnActions,
}: ColumnHeaderCellProps) => {
  // Get feature flags
  const dataGridFlags = useDataGridFeatures();

  const isDraggable =
    column.type !== "add-column" &&
    !column.fixed &&
    (column.group === "Formulas" || column.group === "Attributes");

  const getColumnWidth = () => {
    // Add column button - minimal width
    if (column.type === "add-column") return "50px";

    // Fixed columns - hug content
    if (column.fixed) return "auto";

    // Description column - fixed width
    if (column.key === "description") return "300px";

    // Formulas group - fixed equal width with max-width for ellipsis
    if (column.group === "Formulas") {
      return "180px";
    }

    // Cost group columns - hug content
    if (column.group === "Cost") return "124px";
    if (column.key === "cost") return "124px";

    // Attributes group - fixed equal width with max-width for ellipsis
    if (column.group === "Attributes") {
      return "140px";
    }

    return "auto";
  };

  return (
    <th
      key={column.id}
      className={`
        relative px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider
        cursor-pointer select-none border-r border-b border-gray-200 last:border-r-0
        ${
          column.id === editableFormula
            ? "bg-green-100 text-green-800"
            : "bg-gray-50 hover:bg-gray-100"
        }
        ${dragOverColumn === index ? "bg-blue-100" : ""}
        ${draggedColumn === index ? "opacity-50" : ""}
        ${column.type === "add-column" ? "bg-gray-100" : ""}
        ${column.fixed ? "bg-gray-100" : ""}
        ${isDraggable ? "cursor-move" : ""}
      `}
      style={{
        width: getColumnWidth(),
        minWidth: getColumnWidth(),
        maxWidth: getColumnWidth(),
      }}
      draggable={isDraggable}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onClick={(e) =>
        column.type !== "add-column" &&
        !column.fixed &&
        onColumnHeaderClick(e, column.id)
      }
    >
      {/* Column header content */}
      {column.type === "add-column" ? (
        <div
          className="flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors py-2 rounded"
          onClick={() =>
            onAddColumn(column.group === "Formulas" ? "formula" : "attribute")
          }
          title={`Click to ${
            column.group === "Formulas" ? "add a formula" : "add an attribute"
          }`}
        >
          <div className="relative group">
            <div className="flex items-center justify-center">
              <span className="material-symbols-rounded text-base text-gray-400 group-hover:text-blue-600 transition-colors">
                add
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center space-x-1 min-w-0">
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs" title={column.title}>
                {column.title}
              </span>
              {column.formulaDisplayId && (
                <span
                  className="text-xs text-gray-400 font-normal truncate"
                  title={column.formulaDisplayId}
                >
                  {column.formulaDisplayId}
                </span>
              )}
            </div>
            {column.fixed && (
              <span
                className="material-symbols-rounded text-xs text-gray-400 flex-shrink-0"
                title="Fixed column"
              >
                lock
              </span>
            )}
            {/* Show lock icon for reference formulas not owned by current user */}
            {!column.fixed &&
              column.formulaId &&
              !isOwnFormula(column.formulaId) && (
                <span
                  className="material-symbols-rounded text-xs text-amber-600 flex-shrink-0"
                  title="Reference formula (read-only)"
                >
                  lock
                </span>
              )}
            {column.sortable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSort(column.id);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                {sortConfig?.key === column.id ? (
                  sortConfig.direction === "asc" ? (
                    <span className="material-symbols-rounded text-xs">
                      arrow_upward
                    </span>
                  ) : (
                    <span className="material-symbols-rounded text-xs">
                      arrow_downward
                    </span>
                  )
                ) : (
                  <span className="material-symbols-rounded text-xs">
                    unfold_more
                  </span>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-0.5 flex-shrink-0">
            {/* Grouping button for non-numeric attribute columns */}
            {column.group === "Attributes" &&
              column.type !== "number" &&
              column.type === "select" &&
              column.values &&
              column.values.length > 0 &&
              onToggleGrouping && (
                <GroupingButton
                  columnId={column.id}
                  columnLabel={column.title}
                  isGrouped={groupedByColumn === column.id}
                  availableValues={column.values}
                  onToggleGrouping={onToggleGrouping}
                />
              )}

            {/* Remove icon for all formula and attribute columns */}
            {dataGridFlags.showColumnRemoveIcon &&
              ((column.id.startsWith("formula") && !column.fixed) ||
                (column.group === "Attributes" &&
                  column.id !== "description")) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteColumn?.(column.id);
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove column"
                >
                  <span className="material-symbols-rounded text-sm">
                    close
                  </span>
                </button>
              )}

            {/* Actions menu only for formula columns */}
            {column.id.startsWith("formula") && !column.fixed && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColumnActions(
                      showColumnActions === column.id ? null : column.id
                    );
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-rounded text-xs">
                    more_vert
                  </span>
                </button>

                {showColumnActions === column.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[200px]"
                  >
                    {/* Check if formula is owned by current user or is a newly created draft */}
                    {(() => {
                      // Check if formula is owned by user
                      const isFormulaOwned = column.formulaId
                        ? isOwnFormula(column.formulaId)
                        : true;

                      // Check if formula is in draft status (newly created, always editable)
                      const isDraft = column.formulaId
                        ? formulas.find((f) => f.id === column.formulaId)
                            ?.status === "draft"
                        : false;

                      // Formula is editable if owned by user OR is a draft
                      const isOwned = isFormulaOwned || isDraft;
                      const isReadonly = !isOwned;

                      return (
                        <>
                          {/* Set Active - only show for owned or draft formulas */}
                          {isOwned && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSetActiveFormula?.(column.id);
                                setShowColumnActions(null);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <span className="material-symbols-rounded text-xs">
                                edit
                              </span>
                              <span>Set Active</span>
                            </button>
                          )}

                          {/* View/Edit Formula Details - always available */}
                          {isOwned ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (column.formulaId) {
                                  onEditFormulaDetails?.(column.formulaId);
                                }
                                setShowColumnActions(null);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 whitespace-nowrap"
                            >
                              <span className="material-symbols-rounded text-xs">
                                description
                              </span>
                              <span>Edit Formula Details</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (column.formulaId) {
                                  onViewFormulaDetails?.(column.formulaId);
                                }
                                setShowColumnActions(null);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 whitespace-nowrap"
                            >
                              <span className="material-symbols-rounded text-xs">
                                visibility
                              </span>
                              <span>View Formula Details</span>
                            </button>
                          )}

                          {/* Upload Composition - only for owned analytical formulas */}
                          {isOwned &&
                            column.formulaId &&
                            (() => {
                              const formula = formulas.find(
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (f: any) => f.id === column.formulaId
                              );
                              return formula?.formulaType === "ANALYTICAL";
                            })() && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUploadExcel?.(column.formulaId);
                                  setShowColumnActions(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 whitespace-nowrap"
                              >
                                <span className="material-symbols-rounded text-xs">
                                  upload_file
                                </span>
                                <span>Upload Composition</span>
                              </button>
                            )}

                          {/* Create Version - always available */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateVersion?.(column.id);
                              setShowColumnActions(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 whitespace-nowrap"
                          >
                            <span className="material-symbols-rounded text-xs">
                              content_copy
                            </span>
                            <span>Create new version</span>
                          </button>

                          {/* Readonly indicator for non-owned formulas */}
                          {isReadonly && (
                            <div className="px-3 py-2 text-xs text-gray-500 italic flex items-center space-x-2 bg-gray-50">
                              <span className="material-symbols-rounded text-xs">
                                lock
                              </span>
                              <span>Reference formula (read-only)</span>
                            </div>
                          )}

                          {/* Divider and additional actions - only for owned formulas */}
                          {isOwned && (
                            <>
                              <div className="border-t border-gray-200 my-1"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNormalizeFormula?.(column.id);
                                  setShowColumnActions(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                              >
                                <span className="material-symbols-rounded text-xs">
                                  balance
                                </span>
                                <span>Normalize</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSendForCompounding?.(column.id);
                                  setShowColumnActions(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 whitespace-nowrap"
                              >
                                <span className="material-symbols-rounded text-xs">
                                  send
                                </span>
                                <span>Send for Compounding</span>
                              </button>
                            </>
                          )}

                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteColumn?.(column.id);
                              setShowColumnActions(null);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <span className="material-symbols-rounded text-xs">
                              delete
                            </span>
                            <span>Remove</span>
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </th>
  );
};
