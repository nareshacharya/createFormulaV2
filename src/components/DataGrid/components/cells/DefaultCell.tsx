import Badge from "../../../Badge";

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

interface DefaultCellProps {
  row: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  column: Column;
  value: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const DefaultCell = ({ row, column, value }: DefaultCellProps) => {
  const isTotal = row.isTotal;

  // Add-column type - empty cell
  if (column.type === "add-column") {
    return (
      <div className="flex items-center justify-center h-full">
        {/* Empty cell for rows - no plus icon */}
      </div>
    );
  }

  // Custom render function
  if (column.render) {
    return <>{column.render(value, row)}</>;
  }

  // Badge type
  if (column.type === "badge") {
    return (
      <Badge variant="default" size="sm">
        {value}
      </Badge>
    );
  }

  // Boolean type
  if (column.type === "boolean") {
    return (
      <span
        className={`text-sm ${isTotal ? "font-semibold text-gray-900" : ""}`}
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }

  // Default text rendering
  return (
    <span className={`text-sm ${isTotal ? "font-semibold text-gray-900" : ""}`}>
      {value}
    </span>
  );
};
