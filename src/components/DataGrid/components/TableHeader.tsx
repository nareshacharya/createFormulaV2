import type { Column } from "../types";

interface TableHeaderProps {
  columns: Column[];
  sortConfig: { key: string; direction: "asc" | "desc" } | null;
  editableFormula?: string;
  showColumnActions: string | null;
  draggedColumn: number | null;
  dragOverColumn: number | null;
  onSort: (columnId: string) => void;
  onHeaderClick: (e: React.MouseEvent, columnId: string) => void;
  onDragStart: (e: React.DragEvent, columnIndex: number) => void;
  onDragOver: (e: React.DragEvent, columnIndex: number) => void;
  onDrop: (e: React.DragEvent, columnIndex: number) => void;
  onColumnActionsToggle: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  onCreateVersion?: (columnId: string) => void;
  onNormalizeFormula?: (columnId: string) => void;
  onSendForCompounding?: (columnId: string) => void;
  onExplodeFormula?: (formulaId: string) => void;
  onAddColumn?: (columnType: "formula" | "attribute") => void;
}

export const TableHeader = ({
  columns,
  sortConfig,
  editableFormula,
  showColumnActions,
  draggedColumn,
  dragOverColumn,
  onSort,
  onHeaderClick,
  onDragStart,
  onDragOver,
  onDrop,
  onColumnActionsToggle,
  onDeleteColumn,
  onCreateVersion,
  onNormalizeFormula,
  onSendForCompounding,
  onExplodeFormula,
  onAddColumn,
}: TableHeaderProps) => {
  const getSortIcon = (columnId: string) => {
    if (sortConfig?.key !== columnId) {
      return <i className="ri-arrow-up-down-line text-gray-400"></i>;
    }
    return sortConfig.direction === "asc" ? (
      <i className="ri-arrow-up-line"></i>
    ) : (
      <i className="ri-arrow-down-line"></i>
    );
  };

  return (
    <thead className="sticky top-0 z-10">
      <tr className="bg-gray-50">
        {columns.map((column, index) => {
          const isActiveFormula = column.id === editableFormula;
          const isDragging = draggedColumn === index;
          const isDragOver = dragOverColumn === index;
          const canDrag =
            column.group === "Formulas" || column.group === "Attributes";

          return (
            <th
              key={column.id}
              draggable={canDrag}
              onDragStart={(e) => canDrag && onDragStart(e, index)}
              onDragOver={(e) => canDrag && onDragOver(e, index)}
              onDrop={(e) => canDrag && onDrop(e, index)}
              onClick={(e) => onHeaderClick(e, column.id)}
              className={`
                px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2
                ${isActiveFormula ? "bg-blue-50 border-blue-500" : "border-gray-200"}
                ${isDragging ? "opacity-50" : ""}
                ${isDragOver ? "border-l-4 border-l-blue-500" : ""}
                ${canDrag ? "cursor-move" : ""}
                ${column.type === "add-column" ? "w-12 text-center cursor-pointer hover:bg-gray-100" : ""}
                ${column.fixed ? "sticky left-0 z-20 bg-gray-50" : ""}
              `}
              style={{
                minWidth: column.minWidth,
                width: column.width,
                maxWidth: column.maxWidth,
              }}
            >
              {column.type === "add-column" ? (
                <div className="flex items-center justify-center">
                  <div className="relative group">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onColumnActionsToggle(column.id);
                      }}
                      className="p-1.5 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <i className="ri-add-line text-blue-600 text-lg"></i>
                    </button>

                    {showColumnActions === column.id && (
                      <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[180px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddColumn?.("formula");
                            onColumnActionsToggle("");
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <i className="ri-flask-line"></i>
                          Add Formula
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddColumn?.("attribute");
                            onColumnActionsToggle("");
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <i className="ri-database-2-line"></i>
                          Add Attribute
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {canDrag && (
                      <i className="ri-draggable text-gray-400 flex-shrink-0"></i>
                    )}
                    <span className="truncate">{column.label}</span>
                    {isActiveFormula && (
                      <span className="flex-shrink-0 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {column.sortable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSort(column.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {getSortIcon(column.id)}
                      </button>
                    )}

                    {!column.fixed && column.group === "Formulas" && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onColumnActionsToggle(column.id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <i className="ri-more-2-fill"></i>
                        </button>

                        {showColumnActions === column.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[200px]">
                            {isActiveFormula && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onNormalizeFormula?.(column.id);
                                    onColumnActionsToggle("");
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <i className="ri-percent-line"></i>
                                  Normalize to Target
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCreateVersion?.(column.id);
                                    onColumnActionsToggle("");
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <i className="ri-file-copy-line"></i>
                                  Create Version
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSendForCompounding?.(column.id);
                                    onColumnActionsToggle("");
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <i className="ri-send-plane-line"></i>
                                  Send for Compounding
                                </button>
                                <hr className="my-2" />
                              </>
                            )}
                            {column.formulaId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onExplodeFormula?.(column.formulaId!);
                                  onColumnActionsToggle("");
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <i className="ri-file-list-line"></i>
                                View Formula Details
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    `Are you sure you want to delete "${column.label}"?`
                                  )
                                ) {
                                  onDeleteColumn?.(column.id);
                                }
                                onColumnActionsToggle("");
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <i className="ri-delete-bin-line"></i>
                              Delete Column
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
};
