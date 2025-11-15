/* eslint-disable jsx-a11y/label-has-associated-control, jsx-a11y/control-has-associated-label */
interface GroupedRowProps {
  groupValue: string;
  groupColumn: string;
  rowCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  colspan: number;
}

/**
 * GroupedRow - Displays a collapsible group header row in the DataGrid
 * Used when data is grouped by a categorical attribute
 */
export const GroupedRow = ({
  groupValue,
  groupColumn,
  rowCount,
  isExpanded,
  onToggle,
  colspan,
}: GroupedRowProps) => {
  return (
    <tr className="bg-blue-50 border-b border-blue-200 hover:bg-blue-100 transition-colors">
      <td colSpan={colspan} className="px-4 py-3">
        <div className="flex items-center justify-between">
          <button
                type="button"
            onClick={onToggle}
            className="flex items-center space-x-3 text-sm font-medium text-blue-900 hover:text-blue-700 transition-colors"
          >
            <i
              className={`ri-${
                isExpanded ? "arrow-down" : "arrow-right"
              }-s-line text-lg`}
            ></i>
            <span className="font-semibold">{groupColumn}:</span>
            <span className="px-2 py-1 bg-white rounded border border-blue-200">
              {groupValue || "(Empty)"}
            </span>
            <span className="text-blue-600 text-xs">
              ({rowCount} {rowCount === 1 ? "item" : "items"})
            </span>
          </button>
          <div className="text-xs text-blue-600">
            Click to {isExpanded ? "collapse" : "expand"}
          </div>
        </div>
      </td>
    </tr>
  );
};
