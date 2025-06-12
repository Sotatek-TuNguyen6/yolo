'use client';

import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { exportOrderToExcel } from '@/utils/orderExport';

interface OrderExportButtonProps {
  order: Record<string, unknown>;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonText?: string;
  className?: string;
}

export function OrderExportButton({
  order,
  variant = 'outline',
  buttonText = 'Xuất Excel',
  className = ''
}: OrderExportButtonProps) {
  const handleExport = () => {
    try {
      exportOrderToExcel(order);
    } catch (error) {
      console.error('Error exporting order:', error);
      alert('Có lỗi xảy ra khi xuất dữ liệu. Vui lòng thử lại sau.');
    }
  };

  return (
    <Button variant={variant} onClick={handleExport} className={className}>
      <FileDown className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
} 