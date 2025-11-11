/**
 * Export utilities for converting data to various formats
 */

import type { Column } from "../components/DataGrid";

export interface ExportData {
    columns: Column[];
    data: Record<string, unknown>[];
    filename: string;
}

/**
 * Convert data to CSV format and download as file
 * Note: Browsers can't directly create .xlsx files without a library
 * This exports as CSV which Excel can open seamlessly
 */
export const exportToCSV = ({
    columns,
    data,
    filename,
}: ExportData): void => {
    try {
        // Create header row from columns
        const headers = columns
            .filter((col) => col.id !== "selection") // Skip selection column
            .map((col) => `"${col.title.replace(/"/g, '""')}"`)
            .join(",");

        // Create data rows
        const rows = data.map((row) => {
            return columns
                .filter((col) => col.id !== "selection")
                .map((col) => {
                    const value = row[col.id];
                    // Handle null/undefined values
                    if (value === null || value === undefined) {
                        return '""';
                    }
                    // Quote and escape strings
                    if (typeof value === "string") {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    // Convert objects/arrays to JSON strings
                    if (typeof value === "object") {
                        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                    }
                    // Return numbers and booleans as-is
                    return String(value);
                })
                .join(",");
        });

        // Combine header and rows
        const csv = [headers, ...rows].join("\n");

        // Create blob and download
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Export to CSV failed:", error);
        throw new Error("Failed to export data to CSV");
    }
};

/**
 * Export data to Excel-compatible XML format (.xlsx-like)
 * This creates a proper spreadsheet format that Excel recognizes
 */
export const exportToExcel = ({
    columns,
    data,
    filename,
}: ExportData): void => {
    try {
        // Filter out non-exportable columns
        const exportColumns = columns.filter((col) => col.id !== "selection");

        // Create HTML table which Excel will convert
        const html = `<table>
      <thead>
        <tr>
          ${exportColumns.map((col) => `<th>${col.title}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${data
                .map(
                    (row) => `
          <tr>
            ${exportColumns
                            .map((col) => {
                                const value = row[col.id];
                                if (value === null || value === undefined) {
                                    return "<td></td>";
                                }
                                if (typeof value === "object") {
                                    return `<td>${JSON.stringify(value)}</td>`;
                                }
                                return `<td>${value}</td>`;
                            })
                            .join("")}
          </tr>
        `
                )
                .join("")}
      </tbody>
    </table>`;

        // Wrap in Excel compatible format
        const excelContent = `
      <html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #f3f4f6; border: 1px solid #e5e7eb; padding: 8px; font-weight: bold; text-align: left; }
          td { border: 1px solid #e5e7eb; padding: 8px; }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

        const blob = new Blob([excelContent], {
            type: "application/vnd.ms-excel;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.xls`);
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Export to Excel failed:", error);
        throw new Error("Failed to export data to Excel");
    }
};

/**
 * Export data choosing between CSV and Excel format
 */
export const exportData = (
    {
        columns,
        data,
        filename,
    }: ExportData,
    format: "csv" | "excel" = "excel"
): void => {
    if (format === "csv") {
        exportToCSV({ columns, data, filename });
    } else {
        exportToExcel({ columns, data, filename });
    }
};
