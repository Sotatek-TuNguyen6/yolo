'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Order, PaymentMethod, PaymentStatus, OrderStatus } from '@/interface/order.interface';
import { DataTableColumnHeader } from '../tasks/components/data-table-column-header';
import { DataTableRowActions } from '../tasks/components/data-table-row-actions';
import { Row } from '@tanstack/react-table';
import { Eye, Edit, Trash, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMutationRequest } from '@/hooks/useQuery';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function ActionCell({ row }: { row: Row<Order> }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const { mutate: deleteOrder, isPending: isDeleting } = useMutationRequest<
    { success: boolean },
    undefined
  >({
    url: `/orders/${row.original._id}`,
    method: 'delete',
    successMessage: 'Xóa đơn hàng thành công',
    errorMessage: 'Xóa đơn hàng thất bại',
    queryKey: ['orders'],
    mutationOptions: {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      },
    },
  });

  return (
    <>
      <DataTableRowActions
        row={row}
        actions={[
          {
            label: 'Xem chi tiết',
            onClick: () => router.push(`/dashboard/orders/${row.original.orderId}`),
            icon: <Eye className="h-4 w-4" />,
          },
          {
            label: 'Chỉnh sửa',
            onClick: () => router.push(`/dashboard/orders/${row.original.orderId}/edit`),
            icon: <Edit className="h-4 w-4" />,
          },
          {
            label: 'Xóa',
            onClick: () => setIsDeleteDialogOpen(true),
            icon: <Trash className="h-4 w-4" />,
            shortcut: '⌘⌫',
          },
        ]}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Xác nhận xóa đơn hàng
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa đơn hàng &ldquo;
              {row.original.orderId || row.original._id}&rdquo;? Hành động này không thể hoàn
              tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteOrder(undefined)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa đơn hàng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getPaymentStatusColor(status: PaymentStatus) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
    case 'paid':
      return 'bg-green-100 text-green-800 hover:bg-green-100/80';
    case 'failed':
      return 'bg-red-100 text-red-800 hover:bg-red-100/80';
    case 'refunded':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
  }
}

function getOrderStatusColor(status: OrderStatus) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
    case 'processing':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80';
    case 'shipping':
      return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100/80';
    case 'delivered':
      return 'bg-green-100 text-green-800 hover:bg-green-100/80';
    case 'cancelled':
      return 'bg-red-100 text-red-800 hover:bg-red-100/80';
    case 'refunded':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
  }
}

export const columns: ColumnDef<Order>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'orderId',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Mã đơn hàng" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/orders/${row.original.orderId}`}
            className="font-medium hover:underline text-blue-600"
          >
            {row.getValue('orderId') || `#${row.original.orderId}`}
          </Link>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày đặt hàng" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="font-medium">
            {row.original.createdAt &&
              format(new Date(row.original.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Khách hàng" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{row.original.customerInfo.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'paymentType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phương thức thanh toán" />
    ),
    cell: ({ row }) => {
      const method = row.getValue('paymentType') as PaymentMethod;
      const methodText: Record<PaymentMethod, string> = {
        CASH_ON_DELIVERY: 'Tiền mặt khi nhận hàng',
        BANK_TRANSFER: 'Chuyển khoản',
      };

      return <div className="font-medium">{methodText[method] || method}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'paymentStatus',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái thanh toán" />,
    cell: ({ row }) => {
      const isPayment = row.getValue('paymentStatus') as PaymentStatus;
      const paymentStatusText: Record<PaymentStatus, string> = {
        pending: 'Chờ thanh toán',
        paid: 'Đã thanh toán',
        failed: 'Thất bại',
        refunded: 'Đã hoàn tiền',
      };
      return (
        <Badge
          variant="outline"
          className={getPaymentStatusColor(isPayment)}
        >
          {paymentStatusText[isPayment]}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'orderStatus',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái đơn hàng" />,
    cell: ({ row }) => {
      const status = row.getValue('orderStatus') as OrderStatus;
      const orderStatusText: Record<OrderStatus, string> = {
        pending: 'Chờ xử lý',
        processing: 'Đang xử lý',
        shipping: 'Đang giao hàng',
        delivered: 'Đã giao hàng',
        cancelled: 'Đã hủy',
        refunded: 'Đã hoàn tiền',
      };
      
      if (!status) return null;
      
      return (
        <Badge
          variant="outline"
          className={getOrderStatusColor(status)}
        >
          {orderStatusText[status] || status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'totalPrice',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tổng tiền" />,
    cell: ({ row }) => {
      const totalValue = (row.getValue('totalPrice') as number) || 0;
      return <div className="font-medium">{totalValue.toLocaleString('vi-VN')} VND</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} />,
  },
];
