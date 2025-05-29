'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Order, OrderStatus, PaymentMethod } from '@/interface/order.interface';
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

// function getPaymentStatusColor(status: PaymentStatus) {
//   switch (status) {
//     case 'pending':
//       return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
//     case 'confirmed':
//       return 'bg-green-100 text-green-800 hover:bg-green-100/80';
//     case 'shipping':
//       return 'bg-red-100 text-red-800 hover:bg-red-100/80';
//     case 'refunded':
//       return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
//     default:
//       return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
//   }
// }

function ActionCell({ row }: { row: Row<Order> }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
            onClick: () => {},
            icon: <Eye className="h-4 w-4" />,
          },
          {
            label: 'Chỉnh sửa',
            onClick: () => {},
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
              {row.original.orderNumber || row.original._id}&rdquo;? Hành động này không thể hoàn
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
    accessorKey: 'orderNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Mã đơn hàng" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/orders/${row.original._id}`}
            className="font-medium hover:underline text-blue-600"
          >
            {row.getValue('orderNumber') || `#${row.original._id?.substring(0, 8)}`}
          </Link>
        </div>
      );
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
          <span className="max-w-[500px] truncate font-medium">{row.original.fullName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as OrderStatus;
      const statusText: Record<OrderStatus, string> = {
        pending: 'Đang chờ xử lý',
        processing: 'Đang xử lý',
        shipping: 'Đang giao hàng',
        delivered: 'Đã giao hàng',
        cancelled: 'Đã hủy',
        refunded: 'Đã hoàn tiền',
      };

      return (
        <Badge className={getOrderStatusColor(status)} variant="outline">
          {statusText[status]}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'paymentMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phương thức thanh toán" />
    ),
    cell: ({ row }) => {
      const method = row.getValue('paymentMethod') as PaymentMethod;
      const methodText: Record<PaymentMethod, string> = {
        cash: 'Tiền mặt khi nhận hàng',
        bank_transfer: 'Chuyển khoản',
        credit_card: 'Thẻ tín dụng',
        momo: 'Ví MoMo',
        zalopay: 'ZaloPay',
      };

      return <div className="font-medium">{methodText[method] || method}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'isPayment',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái thanh toán" />,
    cell: ({ row }) => {
      const isPayment = row.getValue('isPayment') as boolean;
      console.log(isPayment);
      return (
        <Badge
          variant="outline"
          className={isPayment ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        >
          {isPayment ? 'Đã thanh toán' : 'Chờ thanh toán'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'total',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tổng tiền" />,
    cell: ({ row }) => {
      const totalValue = row.getValue('total') as number;
      console.log(totalValue);
      return <div className="font-medium">{totalValue.toLocaleString('vi-VN')} VND</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} />,
  },
];
