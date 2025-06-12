'use client';

import { useQueryRequest } from '@/hooks/useQuery';
import { User } from '@/interface/user.interface';
import { DataTable } from '../tasks/components/data-table';
import { columns } from './columns';
import { CommonResponse } from '@/types/common';
import { LoadingSpinner } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { FilterConfig } from '../tasks/components/data-table-toolbar';
import { UserPlus, UserCheck, UserX, UserCog, Users } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserForm } from './components/user-form';
import { CellContext } from '@tanstack/react-table';

type UserListData = CommonResponse<{
  users: User[];
  prevPage: number;
  nextPage: number;
  total: number;
}>;

// Extended cell context with additional props
interface ExtendedCellContext extends CellContext<User, unknown> {
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
}

export default function UserPage() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [isViewMode, setIsViewMode] = useState(false);

  // Fetch users data
  const { data: usersData, isLoading } = useQueryRequest<UserListData>({
    url: '/users',
    queryKey: ['users'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  const users = usersData?.data?.users || [];
  const total = usersData?.data?.users.length || 0;

  // Đếm số lượng người dùng theo vai trò và trạng thái
  const activeUsers = users.filter(user => user.status === 'active').length;
  const bannedUsers = users.filter(user => user.status === 'inactive').length;
  const adminUsers = users.filter(user => user.role === 'admin').length;

  // Xử lý sự kiện xem chi tiết người dùng
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewMode(true);
  };

  // Xử lý sự kiện chỉnh sửa người dùng
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsViewMode(false);
  };

  // Filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      column: 'role',
      title: 'Vai trò',
      options: [
        {
          label: 'Quản trị viên',
          value: 'admin',
          icon: UserCog,
        },
        {
          label: 'Nhân viên',
          value: 'staff',
          icon: Users,
        },
      ],
    },
    {
      column: 'active',
      title: 'Trạng thái',
      options: [
        {
          label: 'Hoạt động',
          value: true,
          icon: UserCheck,
        },
        {
          label: 'Không hoạt động',
          value: false,
          icon: UserX,
        },
      ],
    },
  ];

  // Cập nhật columns để truyền vào các hàm xử lý
  const enhancedColumns = columns.map(column => {
    if (column.id === 'actions') {
      return {
        ...column,
        cell: (props: CellContext<User, unknown>) => {
          const { row } = props;
          return (
            <div>
              {column.cell && typeof column.cell === 'function'
                ? column.cell({
                    ...props,
                    onView: () => handleViewUser(row.original),
                    onEdit: () => handleEditUser(row.original),
                  } as ExtendedCellContext)
                : null}
            </div>
          );
        },
      };
    }
    return column;
  });

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <div className="flex space-x-2">
          {/* <Button variant="outline" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Xuất danh sách
          </Button> */}
          <Button onClick={() => setIsAddUserOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-blue-700">Tổng người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-green-700">Đang hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-red-700">Bị khóa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bannedUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-purple-700">Quản trị viên</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{adminUsers}</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={enhancedColumns}
        data={users}
        filterConfigs={filterConfigs}
        searchColumn="fullName"
        searchPlaceholder="Tìm kiếm theo tên, email..."
      />

      {/* Form thêm người dùng mới */}
      <UserForm
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onSuccess={() => {
          // Refresh data after success
        }}
      />

      {/* Form xem chi tiết hoặc chỉnh sửa người dùng */}
      {selectedUser && (
        <UserForm
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={() => setSelectedUser(undefined)}
          readOnly={isViewMode}
          onSuccess={() => {
            // Refresh data after success
          }}
        />
      )}
    </div>
  );
}
