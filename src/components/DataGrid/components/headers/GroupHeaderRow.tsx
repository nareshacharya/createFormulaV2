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
  formulaId?: string;
  attributeId?: string;
  values?: string[];
  options?: string[];
  render?: (value: any, row: any) => React.ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface GroupHeaderRowProps {
  columns: Column[];
  groupedColumns: Record<string, Column[]>;
  enableRowReordering?: boolean;
  enableBulkSelection?: boolean;
  getGroupColor: (groupName: string) => string;
  getGroupSpan: (groupName: string) => number;
}

export const GroupHeaderRow = ({
  columns,
  groupedColumns,
  enableRowReordering = false,
  enableBulkSelection = false,
  getGroupColor,
  getGroupSpan,
}: GroupHeaderRowProps) => {
  const groups = Object.keys(groupedColumns).filter(
    (group) => group !== "default"
  );

  if (groups.length === 0) return null;

  return (
    <tr>
      {/* Drag handle column (if enabled) */}
      {enableRowReordering && (
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-50">
          {/* Empty for drag handle */}
        </th>
      )}

      {/* Checkbox column (if enabled) */}
      {enableBulkSelection && (
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-50">
          {/* Empty for checkbox */}
        </th>
      )}

      {/* Non-grouped columns (columns without a group property) */}
      {columns
        .filter((col) => !col.group && col.type !== "add-column")
        .map((col) => (
          <th
            key={col.id}
            className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 bg-gray-50"
          >
            {/* Empty header for non-grouped columns */}
          </th>
        ))}

      {/* Group headers */}
      {groups.map((groupName) => (
        <th
          key={groupName}
          className={`px-3 py-2 text-center text-xs font-medium uppercase tracking-wider border-b border-r last:border-r-0 border-gray-200 ${getGroupColor(
            groupName
          )}`}
          colSpan={getGroupSpan(groupName)}
        >
          {groupName}
        </th>
      ))}
    </tr>
  );
};
