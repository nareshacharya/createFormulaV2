import type { DataGridRow, DragState } from "../types";
import { isRowDraggable } from "../utils/rowOrdering";

interface DraggableRowProps {
  row: DataGridRow;
  dragState: DragState;
  onDragStart: (rowId: string) => void;
  onDragOver: (e: React.DragEvent, rowId: string) => void;
  onDragEnd: () => void;
  onDragLeave: () => void;
  children: React.ReactNode;
}

/**
 * Wrapper component to make table rows draggable
 */
export const DraggableRow = ({
  row,
  dragState,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragLeave,
  children,
}: DraggableRowProps) => {
  const isDraggable = isRowDraggable(row);
  const isDragging = dragState.draggedRowId === row.id;
  const isDragOver = dragState.dragOverRowId === row.id;

  return (
    <tr
      draggable={isDraggable}
      onDragStart={() => isDraggable && onDragStart(row.id)}
      onDragOver={(e) => isDraggable && onDragOver(e, row.id)}
      onDragEnd={onDragEnd}
      onDragLeave={onDragLeave}
      className={`
        ${isDragging ? "opacity-50" : ""}
        ${isDragOver ? "border-t-2 border-blue-500" : ""}
        ${isDraggable ? "cursor-move hover:bg-gray-50" : ""}
      `}
    >
      {isDraggable && (
        <td className="px-2 py-2 border-r border-gray-100">
          <div className="flex items-center justify-center text-gray-400 hover:text-gray-600">
            <i className="ri-draggable text-lg"></i>
          </div>
        </td>
      )}
      {!isDraggable && <td className="px-2 py-2 border-r border-gray-100"></td>}
      {children}
    </tr>
  );
};
