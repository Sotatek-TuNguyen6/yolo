'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { User, UserRole, UserStatus } from '@/interface/user.interface';
import { DataTableColumnHeader } from '../tasks/components/data-table-column-header';
import { DataTableRowActions } from '../tasks/components/data-table-row-actions';
import { Row } from '@tanstack/react-table';
import { Eye, Edit, Trash, AlertTriangle, Lock, Unlock } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Hàm tạo màu cho status badge
// function getUserStatusColor(status: UserStatus) {
//   switch (status) {
//     case 'active':
//       return 'bg-green-100 text-green-800 hover:bg-green-100/80';
//     case 'inactive':
//       return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
//     case 'banned':
//       return 'bg-red-100 text-red-800 hover:bg-red-100/80';
//     default:
//       return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
//   }
// }

// Hàm tạo màu cho role badge
function getUserRoleColor(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80';
    case 'staff':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
  }
}

// Component xử lý actions
interface ActionCellProps {
  row: Row<User>;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
}

function ActionCell({ row, onView, onEdit }: ActionCellProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

  const { mutate: deleteUser, isPending: isDeleting } = useMutationRequest<
    { success: boolean },
    undefined
  >({
    url: `/users/${row.original._id}`,
    method: 'delete',
    successMessage: 'Xóa người dùng thành công',
    errorMessage: 'Xóa người dùng thất bại',
    queryKey: ['users'],
    mutationOptions: {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      },
    },
  });

  const { mutate: updateUserStatus, isPending: isUpdatingStatus } = useMutationRequest<
    User,
    { status: UserStatus }
  >({
    url: `/users/lock/${row.original._id}`,
    method: 'patch',
    successMessage: 'Cập nhật trạng thái người dùng thành công',
    errorMessage: 'Cập nhật trạng thái người dùng thất bại',
    queryKey: ['users'],
    mutationOptions: {
      onSuccess: () => {
        setIsBlockDialogOpen(false);
      },
    },
  });

  const isUserActive = row.original.status === 'active';
  const newStatus = isUserActive ? ('banned' as UserStatus) : ('active' as UserStatus);

  return (
    <>
      <DataTableRowActions
        row={row}
        actions={[
          {
            label: 'Xem chi tiết',
            onClick: () => onView && onView(row.original),
            icon: <Eye className="h-4 w-4" />,
          },
          {
            label: 'Chỉnh sửa',
            onClick: () => onEdit && onEdit(row.original),
            icon: <Edit className="h-4 w-4" />,
          },
          {
            label: isUserActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
            onClick: () => setIsBlockDialogOpen(true),
            icon: isUserActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />,
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
              Xác nhận xóa người dùng
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa người dùng &ldquo;{row.original.fullName}&rdquo;? Hành động
              này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 border-t mt-6">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteUser(undefined)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa người dùng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block/Unblock Confirmation Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {isUserActive ? (
                <Lock className="h-5 w-5 text-yellow-500 mr-2" />
              ) : (
                <Unlock className="h-5 w-5 text-green-500 mr-2" />
              )}
              Xác nhận {isUserActive ? 'khóa' : 'mở khóa'} tài khoản
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn {isUserActive ? 'khóa' : 'mở khóa'} tài khoản của người dùng
              &ldquo;{row.original.fullName}&rdquo;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 border-t mt-6">
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant={isUserActive ? 'destructive' : 'default'}
              onClick={() => updateUserStatus({ status: newStatus })}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus
                ? 'Đang xử lý...'
                : isUserActive
                  ? 'Khóa tài khoản'
                  : 'Mở khóa tài khoản'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns: ColumnDef<User>[] = [
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
    accessorKey: '_id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <div className="max-w-[80px] truncate text-xs text-gray-500">{row.original._id}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'avatar',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ảnh đại diện" />,
    cell: ({ row }) => {
      const user = row.original;
      const initials = user.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

      return (
        <div className="flex justify-center">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage src={user.avatar} alt={user.fullName} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tên người dùng" />,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium text-blue-700">{row.getValue('fullName')}</span>
          <span className="text-xs text-gray-500">{row.original.userName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => {
      return <div className="text-sm">{row.getValue('email')}</div>;
    },
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Điện thoại" />,
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {row.getValue('phoneNumber') || (
            <span className="text-gray-400 italic">Chưa cập nhật</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vai trò" />,
    cell: ({ row }) => {
      const role = row.getValue('role') as UserRole;
      const roleText = {
        admin: 'Quản trị viên',
        staff: 'Nhân viên',
      };

      return (
        <Badge className={`${getUserRoleColor(role)} font-normal px-2 py-1`} variant="outline">
          {roleText[role]}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'active',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => {
      const status = row.getValue('active') as boolean;
      return (
        <Badge
          className={`${status ? 'bg-green-100 text-green-800 hover:bg-green-100/80' : 'bg-red-100 text-red-800 hover:bg-red-100/80'} font-normal px-2 py-1`}
          variant="outline"
        >
          {status ? 'Hoạt động' : 'Không hoạt động'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày đăng ký" />,
    cell: ({ row }) => {
      return (
        <div className="font-medium text-sm">
          {row.original.createdAt &&
            format(new Date(row.original.createdAt), 'dd/MM/yyyy', { locale: vi })}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: props => <ActionCell {...props} />,
  },
];
