'use client';

import { useQueryRequest } from '@/hooks/useQuery';
import { EPaymentStatus, Order } from '@/interface/order.interface';
import { DataTable } from '../tasks/components/data-table';
import { columns } from './columns';
import { CommonResponse } from '@/types/common';
import { LoadingSpinner } from '@/components/Loading';
import { FilterConfig } from '../tasks/components/data-table-toolbar';
import { Button } from '@/components/ui/button';
import { FileDown, FileText } from 'lucide-react';
import { exportOrdersToExcel } from '@/utils/orderExport';
import { exportOrdersToPdf } from '@/utils/pdfExport';

type OrderListData = CommonResponse<Order[]>;

export default function OrdersPage() {
  // Fetch orders data
  const { data: ordersData, isLoading } = useQueryRequest<OrderListData>({
    url: '/orders',
    queryKey: ['orders'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  const orders = ordersData?.data || [];

  // Filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      column: 'paymentType',
      title: 'Phương thức thanh toán',
      options: [
        {
          label: 'Tiền mặt',
          value: 'CASH_ON_DELIVERY',
        },
        {
          label: 'Chuyển khoản',
          value: 'BANK_TRANSFER',
        },
      ],
    },
    {
      column: 'paymentStatus',
      title: 'Trạng thái thanh toán',
      options: [
        {
          label: 'Đã thanh toán',
          value: EPaymentStatus.PAID,
        },
        {
          label: 'Chờ thanh toán',
          value: EPaymentStatus.PENDING,
        },
        {
          label: 'Thanh toán thất bại',
          value: EPaymentStatus.FAILED,
        },
        {
          label: 'Đã hoàn tiền',
          value: EPaymentStatus.REFUNDED,
        },
      ],
    },
  ];

  // Handle export to Excel
  const handleExportToExcel = () => {
    if (!orders.length) return;
    
    try {
      exportOrdersToExcel(orders as unknown as Record<string, unknown>[]);
    } catch (error) {
      console.error('Error exporting orders:', error);
      alert('Có lỗi xảy ra khi xuất dữ liệu. Vui lòng thử lại sau.');
    }
  };

  // Handle export to PDF
  const handleExportToPdf = () => {
    if (!orders.length) return;
    
    try {
      exportOrdersToPdf(orders as unknown as Record<string, unknown>[]);
    } catch (error) {
      console.error('Error exporting orders to PDF:', error);
      alert('Có lỗi xảy ra khi xuất PDF. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportToExcel}>
            <FileDown className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
          <Button variant="outline" onClick={handleExportToPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Xuất PDF
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-md shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-700">Tổng đơn hàng</h3>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
            <h3 className="text-lg font-semibold text-yellow-700">Chờ xử lý</h3>
            <p className="text-2xl font-bold">
              {orders.filter(order => order.paymentStatus === EPaymentStatus.PENDING).length}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-md border border-green-100">
            <h3 className="text-lg font-semibold text-green-700">Đã thanh toán</h3>
            <p className="text-2xl font-bold">
              {orders.filter(order => order.paymentStatus === EPaymentStatus.PAID).length}
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-md border border-red-100">
            <h3 className="text-lg font-semibold text-red-700">Đã hủy</h3>
            <p className="text-2xl font-bold">
              {orders.filter(order => order.paymentStatus === EPaymentStatus.FAILED).length}
            </p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        filterConfigs={filterConfigs}
        searchColumn="orderId"
        searchPlaceholder="Tìm kiếm theo mã đơn hàng..."
      />
    </div>
  );
}
