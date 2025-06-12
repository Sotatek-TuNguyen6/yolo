import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

type BookType = 'xlsx' | 'xlsm' | 'xlsb' | 'xls' | 'csv' | 'txt' | 'html';

interface ExportToExcelOptions {
  fileName?: string;
  sheetName?: string;
  fileExtension?: BookType;
}

type ExcelValue = string | number | boolean | Date | null | undefined;

/**
 * Get a value from an object using dot notation path
 * @param obj - The object to get the value from
 * @param path - The path to the value (e.g. 'customer.name')
 * @returns The value at the path
 */
export const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce((value, key) => {
    return value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined;
  }, obj as unknown);
};

/**
 * Convert data to Excel file and trigger download
 * @param data - Array of objects to export
 * @param options - Export options (fileName, sheetName, fileExtension)
 */
export const exportToExcel = <T extends Record<string, ExcelValue>>(
  data: T[],
  options: ExportToExcelOptions = {}
) => {
  const {
    fileName = 'export',
    sheetName = 'Sheet1',
    fileExtension = 'xlsx' as BookType
  } = options;

  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file as array buffer
    const excelBuffer = XLSX.write(workbook, { bookType: fileExtension, type: 'array' });
    
    // Convert array buffer to blob
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    // Save file and trigger download
    saveAs(blob, `${fileName}.${fileExtension}`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

/**
 * Format data before exporting to Excel
 * @param data - Raw data to format
 * @param columnMapping - Map of original field names/paths to display names
 * @param formatters - Map of field formatters
 */
export const formatDataForExport = <T extends Record<string, unknown>>(
  data: T[],
  columnMapping: Record<string, string>,
  formatters: Record<string, (value: unknown, row: T) => ExcelValue> = {}
): Record<string, ExcelValue>[] => {
  return data.map(item => {
    const formattedItem: Record<string, ExcelValue> = {};
    
    Object.entries(columnMapping).forEach(([key, displayName]) => {
      // Support for nested paths with dot notation (e.g., 'customer.name')
      const value = key.includes('.') ? getNestedValue(item, key) : item[key];
      formattedItem[displayName] = formatters[key] ? formatters[key](value, item) : value as ExcelValue;
    });
    
    return formattedItem;
  });
};

/**
 * Flatten a nested object for Excel export
 * @param data - Nested object to flatten
 * @param prefix - Prefix for flattened keys
 * @returns Flattened object
 */
export const flattenObject = (
  data: Record<string, unknown>, 
  prefix = ''
): Record<string, ExcelValue> => {
  const result: Record<string, ExcelValue> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      // Recursively flatten nested objects
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else if (Array.isArray(value)) {
      // Handle arrays by creating a comma-separated string
      result[newKey] = value
        .map(item => {
          if (item && typeof item === 'object') {
            return JSON.stringify(item);
          }
          return String(item);
        })
        .join(', ');
    } else {
      // Assign primitive values directly
      result[newKey] = value as ExcelValue;
    }
  });
  
  return result;
}; 