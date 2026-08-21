import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Helper utilities for exporting Firestore data to downloadable CSV, Excel (.xlsx), PDF (.pdf), or text files.
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
  
  const targetName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', targetName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  const sizeKb = (blob.size / 1024).toFixed(1);
  return `${sizeKb} KB`;
};

/**
 * Generates a formatted PDF (.pdf) file and triggers a browser file download.
 */
export const downloadPdf = <T>(
  filename: string,
  docTitle: string,
  columns: ExportColumn<T>[],
  data: T[]
): string => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Document Title Header Banner
  doc.setFillColor(12, 62, 109); // Dark blue header (#0C3E6D)
  doc.rect(0, 0, 210, 24, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Physio Care Platform - Report Export', 14, 15);

  // Report Title Subheader
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(docTitle, 14, 34);

  // Metadata line
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const generatedAt = `Generated on ${new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })} | Total Records: ${data.length}`;
  doc.text(generatedAt, 14, 40);

  // Table Data Preparation
  const tableHeaders = columns.map((col) => col.header);
  const tableRows = data.map((item) =>
    columns.map((col) => {
      const val = col.accessor(item);
      return val !== null && val !== undefined ? String(val) : '-';
    })
  );

  // Auto Table Plugin Rendering
  autoTable(doc, {
    startY: 46,
    head: [tableHeaders],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [12, 62, 109],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      cellPadding: 3,
      overflow: 'linebreak',
    },
  });

  const pdfArrayBuffer = doc.output('arraybuffer');
  const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
  const targetName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', targetName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  const sizeKb = (blob.size / 1024).toFixed(1);
  return `${sizeKb} KB`;
};

/**
 * Generates an Excel spreadsheet (.xlsx) workbook and triggers a browser file download.
 */
export const downloadExcel = <T>(
  filename: string,
  sheetName: string,
  columns: ExportColumn<T>[],
  data: T[]
): string => {
  const rowObjects = data.map((item) => {
    const rowObj: Record<string, any> = {};
    columns.forEach((col) => {
      rowObj[col.header] = col.accessor(item) ?? '';
    });
    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rowObjects);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const targetName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', targetName);
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
