'use client';

import { useQueryRequest } from '@/hooks/useQuery';
import { Order } from '@/interface/order.interface';
import { DataTable } from '../tasks/components/data-table';
import { columns } from './columns';
import { CommonResponse } from '@/types/common';
import { LoadingSpinner } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { FilterConfig } from '../tasks/components/data-table-toolbar';
import {
  ArrowDownToLine,
  CheckCircle2,
  ClipboardList,
  Truck,
  Ban,
  RotateCcw,
  Loader2,
} from 'lucide-react';

type OrderListData = CommonResponse<{
  orders: Order[];
  prevPage: number;
  nextPage: number;
  total: number;
}>;

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

  const orders = ordersData?.data?.orders || [];

  // Filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      column: 'status',
      title: 'Trạng thái đơn hàng',
      options: [
        {
          label: 'Đang chờ xử lý',
          value: 'pending',
          icon: ClipboardList,
        },
        {
          label: 'Đang xử lý',
          value: 'processing',
          icon: Loader2,
        },
        {
          label: 'Đang giao hàng',
          value: 'shipping',
          icon: Truck,
        },
        {
          label: 'Đã giao hàng',
          value: 'delivered',
          icon: CheckCircle2,
        },
        {
          label: 'Đã hủy',
          value: 'cancelled',
          icon: Ban,
        },
        {
          label: 'Đã hoàn tiền',
          value: 'refunded',
          icon: RotateCcw,
        },
      ],
    },
    // {
    //   column: 'paymentStatus',
    //   title: 'Trạng thái thanh toán',
    //   options: [
    //     {
    //       label: 'Chờ thanh toán',
    //       value: 'pending',
    //       icon: ClipboardList,
    //     },
    //     {
    //       label: 'Đã thanh toán',
    //       value: 'paid',
    //       icon: CreditCard,
    //     },
    //     {
    //       label: 'Thanh toán thất bại',
    //       value: 'failed',
    //       icon: XCircle,
    //     },
    //     {
    //       label: 'Đã hoàn tiền',
    //       value: 'refunded',
    //       icon: RotateCcw,
    //     },
    //   ],
    // },
    {
      column: 'paymentMethod',
      title: 'Phương thức thanh toán',
      options: [
        {
          label: 'Tiền mặt',
          value: 'cash',
        },
        {
          label: 'Tiền mặt khi nhận hàng',
          value: 'cod',
        },
        {
          label: 'Paypal',
          value: 'paypal',
        },
        {
          label: 'Vnpay',
          value: 'vnpay',
        },
        {
          label: 'Ví MoMo',
          value: 'momo',
        },
      ],
    },
    {
      column: 'isPayment',
      title: 'Trạng thái thanh toán',
      options: [
        {
          label: 'Đã thanh toán',
          value: true,
        },
        {
          label: 'Chờ thanh toán',
          value: false,
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <Button onClick={() => window.print()}>
          <ArrowDownToLine className="mr-2 h-4 w-4" />
          Xuất báo cáo
        </Button>
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
              {orders.filter(order => order.status === 'pending').length}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-md border border-green-100">
            <h3 className="text-lg font-semibold text-green-700">Đã giao hàng</h3>
            <p className="text-2xl font-bold">
              {orders.filter(order => order.status === 'delivered').length}
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-md border border-red-100">
            <h3 className="text-lg font-semibold text-red-700">Đã hủy</h3>
            <p className="text-2xl font-bold">
              {orders.filter(order => order.status === 'cancelled').length}
            </p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        filterConfigs={filterConfigs}
        searchColumn="orderNumber"
        searchPlaceholder="Tìm kiếm theo mã đơn hàng..."
      />
    </div>
  );
}
