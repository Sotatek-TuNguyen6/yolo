'use client';

import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { exportToExcel, formatDataForExport } from '@/utils/exportUtils';
// import RoleBasedElement from '@/components/role-based-element';

interface ExportButtonProps<T> {
  data: T[];
  columnMapping: Record<string, string>;
  formatters?: Record<string, (value: unknown, row: Record<string, unknown>) => string | number | boolean | Date | null | undefined>;
  fileName?: string;
  sheetName?: string;
  allowedRoles?: string[];
  buttonText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  columnMapping,
  formatters = {},
  fileName = `export-${new Date().toISOString().split('T')[0]}`,
  sheetName = 'Sheet1',
//   allowedRoles = ['admin'],
  buttonText = 'Xuất Excel',
  variant = 'outline'
}: ExportButtonProps<T>) {
  const handleExport = () => {
    try {
      // Format data for export
      const formattedData = formatDataForExport(
        data as Record<string, unknown>[],
        columnMapping,
        formatters
      );

      // Export to Excel
      exportToExcel(formattedData, {
        fileName,
        sheetName
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Có lỗi xảy ra khi xuất dữ liệu. Vui lòng thử lại sau.');
    }
  };

  return (
    // <RoleBasedElement allowedRoles={allowedRoles}>
      <Button variant={variant} onClick={handleExport}>
        <FileDown className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>
    // </RoleBasedElement>
  );
} 