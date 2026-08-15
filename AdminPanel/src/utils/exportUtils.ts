/**
 * Helper utilities for exporting Firestore data to downloadable CSV, Excel-compatible, or text files.
 */

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

/**
 * Converts an array of objects to a CSV string and triggers a browser file download.
 */
export const downloadCsv = <T>(
  filename: string,
  columns: ExportColumn<T>[],
  data: T[]
): string => {
  const sanitizeCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = columns.map((col) => sanitizeCell(col.header)).join(',');
  const rows = data.map((item) =>
    columns.map((col) => sanitizeCell(col.accessor(item))).join(',')
  );

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  const sizeKb = (blob.size / 1024).toFixed(1);
  return `${sizeKb} KB`;
};

/**
 * Downloads a generic text file (formatted report or summary)
 */
export const downloadTextFile = (filename: string, content: string): string => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  const sizeKb = (blob.size / 1024).toFixed(1);
  return `${sizeKb} KB`;
};
