'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { User, UserGender, UserStatus } from '@/interface/user.interface';
import { useMutationRequest } from '@/hooks/useQuery';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Loader2, EyeIcon, EyeOffIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// Định nghĩa UserRole mới
type UserRole = 'admin' | 'staff';

// Schema xác thực form
const userFormSchema = z.object({
  userName: z.string().min(3, {
    message: 'Tên đăng nhập phải có ít nhất 3 ký tự',
  }),
  email: z.string().email({
    message: 'Email không hợp lệ',
  }),
  password: z
    .string()
    .min(6, {
      message: 'Mật khẩu phải có ít nhất 6 ký tự',
    })
    .optional(),
  fullName: z.string().min(2, {
    message: 'Tên đầy đủ phải có ít nhất 2 ký tự',
  }),
  phoneNumber: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']),
  role: z.enum(['admin', 'staff']),
  status: z.enum(['active', 'inactive', 'banned']),
  dateOfBirth: z.date().optional(),
  avatar: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
  onSuccess?: () => void;
}

// Custom DatePicker with YearPicker
function CustomDatePicker({
  value,
  onChange,
}: {
  value?: Date;
  onChange: (date: Date | undefined) => void;
}) {
  return (
    <Calendar
      mode="single"
      selected={value}
      onSelect={onChange}
      disabled={date => date > new Date() || date < new Date('1900-01-01')}
      initialFocus
      defaultMonth={value || new Date()}
      captionLayout="dropdown-buttons"
      fromYear={1900}
      toYear={new Date().getFullYear()}
      className="rounded-md border"
      locale={vi}
    />
  );
}

export function UserForm({ user, open, onOpenChange, readOnly = false, onSuccess }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isEditing = !!user && !readOnly;
  const isViewing = !!user && readOnly;
  const isCreating = !user;

  const title = isViewing
    ? 'Chi tiết người dùng'
    : isEditing
      ? 'Chỉnh sửa người dùng'
      : 'Thêm người dùng mới';

  const description = isViewing
    ? `Xem thông tin chi tiết của người dùng ${user?.fullName}`
    : isEditing
      ? `Chỉnh sửa thông tin của người dùng ${user?.fullName}`
      : 'Điền thông tin để tạo người dùng mới';

  // Tạo validation schema dựa vào trường hợp
  const formSchema = isCreating
    ? userFormSchema.refine(data => !!data.password, {
        message: 'Mật khẩu là bắt buộc khi tạo người dùng mới',
        path: ['password'],
      })
    : userFormSchema;

  // Khởi tạo form với giá trị mặc định từ user (nếu có)
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: user
      ? {
          userName: user.userName,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber || '',
          gender: user.gender,
          role: user.role , // Chuyển đổi role manager sang admin
          status: user.status,
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : undefined,
          avatar: user.avatar || '',
        }
      : {
          userName: '',
          email: '',
          password: '',
          fullName: '',
          phoneNumber: '',
          gender: 'male' as UserGender,
          role: 'staff' as UserRole,
          status: 'active' as UserStatus,
          dateOfBirth: undefined,
          avatar: '',
        },
  });

  // Mutation để tạo mới hoặc cập nhật người dùng
  const { mutate: saveUser, isPending } = useMutationRequest<User, UserFormValues>({
    url: user ? `/users/${user._id}` : '/users',
    method: user ? 'patch' : 'post',
    successMessage: user ? 'Cập nhật người dùng thành công' : 'Tạo người dùng thành công',
    errorMessage: user ? 'Cập nhật người dùng thất bại' : 'Tạo người dùng thất bại',
    queryKey: ['users'],
    mutationOptions: {
      onSuccess: () => {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      },
    },
  });

  // Xử lý gửi form
  function onSubmit(data: UserFormValues) {
    // Nếu không phải tạo mới và password trống, loại bỏ trường password
    if (!isCreating && !data.password) {
      // Tạo object mới không chứa password
      const dataWithoutPassword = Object.fromEntries(
        Object.entries(data).filter(([key]) => key !== 'password'),
      );
      saveUser(dataWithoutPassword as UserFormValues);
    } else {
      saveUser(data);
    }
  }

  const genderOptions = [
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' },
  ];

  const roleOptions = [
    { value: 'admin', label: 'Quản trị viên' },
    { value: 'staff', label: 'Nhân viên' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
    { value: 'banned', label: 'Bị khóa' },
  ];

  function getUserStatusClass(status: UserStatus) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100/80';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
      case 'banned':
        return 'bg-red-100 text-red-800 hover:bg-red-100/80';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
    }
  }

  // Render avatar với fallback cho user hiện tại
  const renderAvatar = () => {
    if (!user) return null;

    const initials = user.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    return (
      <div className="flex flex-col items-center mb-8">
        <div className="p-1 rounded-full bg-gradient-to-r from-blue-300 to-purple-300 mb-3">
          <Avatar className="h-28 w-28 border-4 border-white">
            <AvatarImage src={user.avatar} alt={user.fullName} />
            <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <h3 className="text-xl font-semibold">{user.fullName}</h3>
        <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
        <div className="flex items-center mt-1">
          <Badge variant="outline" className={getUserStatusClass(user.status as UserStatus)}>
            {statusOptions.find(s => s.value === user.status)?.label}
          </Badge>
        </div>
      </div>
    );
  };

  // Toggle hiển thị mật khẩu
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f3f4f6' }}
      >
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{description}</DialogDescription>
        </DialogHeader>

        {isViewing && renderAvatar()}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
            {isViewing ? (
              // Xem chi tiết (chỉ hiển thị thông tin)
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Tên đăng nhập</h3>
                    <p className="font-medium">{user?.userName}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Tên đầy đủ</h3>
                    <p className="font-medium">{user?.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Số điện thoại</h3>
                    <p className="font-medium">{user?.phoneNumber || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Giới tính</h3>
                    <p className="font-medium">
                      {genderOptions.find(g => g.value === user?.gender)?.label}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Ngày sinh</h3>
                    <p className="font-medium">
                      {user?.dateOfBirth
                        ? format(new Date(user.dateOfBirth), 'dd/MM/yyyy', { locale: vi })
                        : 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Vai trò</h3>
                    <p className="font-medium">
                      {roleOptions.find(r => r.value === user?.role)
                        ? roleOptions.find(r => r.value === user?.role)?.label
                        : user.role}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Ngày đăng ký</h3>
                    <p className="font-medium">
                      {user?.createdAt
                        ? format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi })
                        : 'Không rõ'}
                    </p>
                  </div>
                </div>

                {user?.orders && user.orders.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Đơn hàng đã đặt
                      </h3>
                      <div className="text-sm">
                        <Badge
                          variant="outline"
                          className="mr-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          {user.orders.length} đơn hàng
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Chỉnh sửa hoặc thêm mới
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Tên đăng nhập</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập tên đăng nhập"
                            {...field}
                            className="focus-visible:ring-blue-500 w-full"
                            disabled={isEditing}
                          />
                        </FormControl>
                        {isEditing && (
                          <FormDescription className="text-xs">
                            Tên đăng nhập không thể thay đổi
                          </FormDescription>
                        )}
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập email"
                            {...field}
                            className="focus-visible:ring-blue-500 w-full"
                            disabled={isEditing}
                          />
                        </FormControl>
                        {isEditing && (
                          <FormDescription className="text-xs">
                            Email không thể thay đổi
                          </FormDescription>
                        )}
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Hiển thị trường mật khẩu chỉ khi tạo mới */}
                {isCreating && (
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Mật khẩu</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Nhập mật khẩu"
                                {...field}
                                className="focus-visible:ring-blue-500 w-full pr-10"
                              />
                              <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={togglePasswordVisibility}
                              >
                                {showPassword ? (
                                  <EyeOffIcon className="h-5 w-5" />
                                ) : (
                                  <EyeIcon className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Mật khẩu phải có ít nhất 6 ký tự
                          </FormDescription>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Tên đầy đủ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập tên đầy đủ"
                            {...field}
                            className="focus-visible:ring-blue-500 w-full"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Số điện thoại</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập số điện thoại"
                            {...field}
                            className="focus-visible:ring-blue-500 w-full"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-sm font-medium">Giới tính</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="focus-visible:ring-blue-500 w-full">
                              <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="w-full">
                            {genderOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full">
                        <FormLabel className="text-sm font-medium">Ngày sinh</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal focus-visible:ring-blue-500',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'dd/MM/yyyy', { locale: vi })
                                ) : (
                                  <span>Chọn ngày sinh</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CustomDatePicker value={field.value} onChange={field.onChange} />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-sm font-medium">Vai trò</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="focus-visible:ring-blue-500 w-full">
                              <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="w-full">
                            {roleOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-sm font-medium">Trạng thái</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="focus-visible:ring-blue-500 w-full">
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="w-full">
                            {statusOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-sm font-medium">Ảnh đại diện (URL)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập URL ảnh đại diện"
                          {...field}
                          className="focus-visible:ring-blue-500 w-full"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Nhập URL ảnh đại diện của người dùng
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter className="pt-4 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-300"
              >
                {isViewing ? 'Đóng' : 'Hủy'}
              </Button>

              {!isViewing && (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
