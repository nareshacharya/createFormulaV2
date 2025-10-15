/**
 * Grouping utility functions for DataGrid
 * Handles grouping of table data by categorical attributes
 */

export interface GroupedData {
  groupValue: string;
  rows: any[];
}

/**
 * Groups table data by a specific column
 * @param data - The table data to group
 * @param columnKey - The column key to group by
 * @returns Array of grouped data
 */
export const groupDataByColumn = (
  data: any[],
  columnKey: string
): GroupedData[] => {
  const groups = new Map<string, any[]>();

  data.forEach((row) => {
    // Skip total rows
    if (row.isTotal) {
      return;
    }

    const value = row[columnKey];
    const groupKey = value !== undefined && value !== null ? String(value) : "";

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(row);
  });

  // Convert map to array and sort by group value
  return Array.from(groups.entries())
    .map(([groupValue, rows]) => ({
      groupValue,
      rows,
    }))
    .sort((a, b) => a.groupValue.localeCompare(b.groupValue));
};

/**
 * Gets unique values from a column in the data
 * @param data - The table data
 * @param columnKey - The column key to extract values from
 * @returns Array of unique values
 */
export const getUniqueColumnValues = (
  data: any[],
  columnKey: string
): string[] => {
  const values = new Set<string>();

  data.forEach((row) => {
    if (row.isTotal) {
      return;
    }

    const value = row[columnKey];
    if (value !== undefined && value !== null) {
      values.add(String(value));
    }
  });

  return Array.from(values).sort();
};

/**
 * Checks if a column is groupable (non-numeric, has values)
 * @param column - The column to check
 * @returns True if the column is groupable
 */
export const isColumnGroupable = (column: any): boolean => {
  return (
    column.type !== "number" &&
    column.type === "select" &&
    column.values &&
    column.values.length > 0
  );
};
