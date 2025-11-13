/**
 * AddItemButton Component
 *
 * Displays a plus icon button that appears on row hover in the DataGrid.
 * Allows users to quickly add ingredients or formulas directly from the grid.
 *
 * Features:
 * - Shows on hover for ingredient/formula rows only
 * - Hidden for total rows
 * - Opens AddItemModal for item selection
 * - Positioned at the start of each row
 *
 * @module DataGrid/components/AddItemButton
 */

interface AddItemButtonProps {
  /** Row ID for tracking position */
  rowId: string;

  /** Whether the row is a total row */
  isTotal?: boolean;

  /** Whether the row is a formula group row */
  isFormula?: boolean;

  /** Callback when add button is clicked */
  onAdd: (rowId: string) => void;

  /** Additional CSS classes */
  className?: string;
}

export const AddItemButton = ({
  rowId,
  isTotal = false,
  isFormula: _isFormula = false,
  onAdd,
  className: _className = "",
}: AddItemButtonProps) => {
  // Don't show button for total rows
  if (isTotal) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd(rowId);
  };

  return (
    <div
      className="absolute left-0 top-full mt-1 z-20 flex justify-center w-full pointer-events-none"
      style={{ transform: "translateY(-16px)" }}
    >
      <button
        onClick={handleClick}
        className="
          w-6 h-6 rounded-full flex items-center justify-center
          transition-all duration-200
          bg-purple-200 text-purple-700 shadow-lg
          opacity-0 group-hover:opacity-100
          scale-90 group-hover:scale-100
          hover:bg-purple-500 hover:text-white hover:scale-110
          focus:outline-none focus:ring-2 focus:ring-blue-300 focus:opacity-100
          pointer-events-auto
        "
        title="Add ingredient or formula below this row"
        aria-label="Add ingredient or formula below this row"
      >
        <span className="material-symbols-rounded text-sm">add</span>
      </button>
    </div>
  );
};
