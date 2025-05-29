'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Category, SubCategory } from '@/types/category';
import { DataTableColumnHeader } from '../tasks/components/data-table-column-header';
import { DataTableRowActions } from '../tasks/components/data-table-row-actions';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Edit, Eye, Trash, AlertTriangle } from 'lucide-react';
import { Row } from '@tanstack/react-table';
import React from 'react';
import { useMutationRequest, useQueryRequest } from '@/hooks/useQuery';
import { LoadingSpinner } from '@/components/Loading';
import { CommonResponse } from '@/types/common';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';
import MultipleSelector from '@/components/ui/multiple-selector';

type CategoryListData = CommonResponse<{
  categories: Category[];
}>;

// Option interface for MultipleSelector
interface Option {
  value: string;
  label: string;
}

// Define the form schema to match the type
const subCategoryFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Tên danh mục con phải có ít nhất 1 ký tự',
  }),
  description: z.string().min(1, {
    message: 'Mô tả phải có ít nhất 1 ký tự',
  }),
  slug: z.string().min(1, {
    message: 'Slug phải có ít nhất 1 ký tự',
  }),
  categoryParents: z.array(z.string()).min(1, {
    message: 'Vui lòng chọn ít nhất một danh mục cha',
  }),
});

// Define form type
type SubCategoryFormValues = {
  name: string;
  description: string;
  slug: string;
  categoryParents: string[];
};

// SubCategory Detail Dialog Component
function SubCategoryDetailDialog({
  subCategory,
  onClose,
  initialEditMode,
}: {
  subCategory: SubCategory;
  onClose: () => void;
  initialEditMode: boolean;
}) {
  const [isEditing, setIsEditing] = useState(initialEditMode);

  // Get categories for parent selection
  const { data: categoriesResponse } = useQueryRequest<CategoryListData>({
    url: '/categories',
    queryKey: ['categories'],
  });

  // Initialize form with React Hook Form
  const form = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategoryFormSchema),
    defaultValues: {
      name: subCategory.name,
      description: subCategory.description,
      slug: subCategory.slug,
      categoryParents: Array.isArray(subCategory.categoryParents)
        ? subCategory.categoryParents.map(cat => (typeof cat === 'string' ? cat : cat._id))
        : typeof subCategory.categoryParents === 'string'
          ? [subCategory.categoryParents]
          : subCategory.categoryParents?._id
            ? [subCategory.categoryParents._id]
            : [],
    },
  });

  const { mutate: mutateUpdateSubCategory, isPending } = useMutationRequest<
    SubCategory,
    SubCategoryFormValues
  >({
    url: `/sub-categories/${subCategory._id}`,
    method: 'patch',
    successMessage: 'Cập nhật danh mục con thành công',
    errorMessage: 'Cập nhật danh mục con thất bại',
    queryKey: ['sub-categories'],
    mutationOptions: {
      onSuccess: () => {
        onClose();
      },
    },
  });

  if (isPending) {
    return <LoadingSpinner />;
  }

  async function handleSave(data: SubCategoryFormValues) {
    mutateUpdateSubCategory(data);
  }

  return (
    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:h-[7px] [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:hidden [&::-webkit-scrollbar-thumb]:bg-black/30 [&::-webkit-scrollbar-thumb]:rounded-[4px]">
      <DialogHeader className="bg-white dark:bg-background">
        <DialogTitle>
          {isEditing ? 'Chỉnh sửa danh mục con' : 'Thông tin danh mục con'}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4 mr-1" />
            {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa'}
          </Button>
        </DialogTitle>
      </DialogHeader>

      {isEditing ? (
        // Chế độ chỉnh sửa
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên danh mục con</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryParents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục cha</FormLabel>
                    <div className="w-full">
                      <MultipleSelector
                        defaultOptions={
                          categoriesResponse?.data.categories.map(category => ({
                            label: category.name,
                            value: category._id,
                          })) || []
                        }
                        placeholder="Chọn danh mục cha..."
                        value={field.value.map(value => {
                          const category = categoriesResponse?.data.categories.find(
                            cat => cat._id === value,
                          );
                          return {
                            label: category?.name || value,
                            value: value,
                          };
                        })}
                        onChange={(selected: Option[]) => {
                          field.onChange(selected.map((item: Option) => item.value));
                        }}
                        emptyIndicator={
                          <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                            Không tìm thấy kết quả.
                          </p>
                        }
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ảnh danh mục */}
              <div className="space-y-2">
                <Label>Ảnh danh mục con</Label>
                <div className="flex flex-wrap gap-4 border rounded-md p-2 bg-muted">
                  {subCategory.imageUrl && (
                    <Image
                      src={subCategory.imageUrl}
                      alt={subCategory.name}
                      width={100}
                      height={60}
                      className="object-cover rounded-md shadow-md"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="bg-white dark:bg-background mt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        </Form>
      ) : (
        // Chế độ xem thông tin
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            {subCategory.imageUrl && (
              <div className="rounded-md overflow-hidden relative">
                <Image
                  src={subCategory.imageUrl}
                  alt={subCategory.name}
                  width={400}
                  height={300}
                  className="w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label className="font-bold">Tên danh mục con</Label>
              <p className="text-sm text-muted-foreground">{subCategory.name}</p>
            </div>

            <div>
              <Label className="font-bold">Slug</Label>
              <p className="text-sm text-muted-foreground">{subCategory.slug}</p>
            </div>

            <div>
              <Label className="font-bold">Danh mục cha</Label>
              <div className="space-y-1">
                {Array.isArray(subCategory.categoryParents) ? (
                  subCategory.categoryParents.map((category, index) => (
                    <div key={index}>
                      <Link
                        href={`/dashboard/category/${typeof category === 'string' ? category : category._id}`}
                        className="text-sm text-blue-500 hover:underline block"
                      >
                        {typeof category === 'string' ? 'Xem danh mục cha' : category.name}
                      </Link>
                    </div>
                  ))
                ) : (
                  <Link
                    href={`/dashboard/category/${
                      typeof subCategory.categoryParents === 'string'
                        ? subCategory.categoryParents
                        : subCategory.categoryParents?._id
                    }`}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    {typeof subCategory.categoryParents === 'string'
                      ? 'Xem danh mục cha'
                      : subCategory.categoryParents?.name}
                  </Link>
                )}
              </div>
            </div>

            <div>
              <Label className="font-bold">Mô tả</Label>
              <p className="text-sm text-muted-foreground text-wrap line-clamp-3 hover:line-clamp-none cursor-pointer">
                {subCategory.description}
              </p>
            </div>

            <div>
              <Label className="font-bold">Ngày tạo</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(subCategory.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>

            <div>
              <Label className="font-bold">Cập nhật lần cuối</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(subCategory.updatedAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  );
}

// Action cell component để tránh lỗi useState trong cell function
function ActionCell({ row }: { row: Row<SubCategory> }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { mutate: deleteSubCategory, isPending: isDeleting } = useMutationRequest<
    { success: boolean },
    undefined
  >({
    url: `/sub-categories/${row.original._id}`,
    method: 'delete',
    successMessage: 'Xóa danh mục con thành công',
    errorMessage: 'Xóa danh mục con thất bại',
    queryKey: ['sub-categories'],
  });

  const handleDelete = () => {
    deleteSubCategory(undefined);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <DataTableRowActions
        row={row}
        actions={[
          {
            label: 'Xem chi tiết',
            onClick: () => {
              setIsEditMode(false);
              setIsDialogOpen(true);
            },
            icon: <Eye className="h-4 w-4" />,
          },
          {
            label: 'Chỉnh sửa',
            onClick: () => {
              setIsEditMode(true);
              setIsDialogOpen(true);
            },
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

      {/* Dialog xem/sửa chi tiết */}
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <SubCategoryDetailDialog
            subCategory={row.original}
            onClose={() => setIsDialogOpen(false)}
            initialEditMode={isEditMode}
          />
        </Dialog>
      )}

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Xác nhận xóa danh mục con
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa danh mục con &ldquo;{row.original.name}&rdquo;? Hành động
              này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Danh mục con sẽ bị xóa khỏi hệ thống và không thể khôi phục. Tất cả dữ liệu liên quan
              đến danh mục con này cũng sẽ bị xóa.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Đang xóa...' : 'Xóa danh mục con'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns: ColumnDef<SubCategory>[] = [
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
    enableHiding: true,
    header: () => null,
    cell: () => null,
    enableSorting: false,
  },
  {
    accessorKey: 'imageUrl',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ảnh" />,
    cell: ({ row }) => {
      const imageUrl = row.getValue('imageUrl') as string;
      return (
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger>
              <Image
                src={imageUrl}
                alt="SubCategory Image"
                width={50}
                height={50}
                className="cursor-pointer object-cover rounded"
              />
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-0">
              <Image
                src={imageUrl}
                alt="SubCategory Image"
                width={800}
                height={600}
                className="w-full h-auto"
              />
            </DialogContent>
          </Dialog>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tên danh mục con" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate font-medium">{row.getValue('name')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'categoryParents',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Danh mục cha" />,
    cell: ({ row }) => {
      const categoryParents = row.getValue('categoryParents');
      return (
        <div className="flex flex-col space-y-1">
          {Array.isArray(categoryParents) ? (
            categoryParents.map((category: Category | string, index: number) => (
              <Link
                key={index}
                href={`/dashboard/category/${typeof category === 'string' ? category : category._id}`}
                className="max-w-[150px] truncate font-medium text-blue-500 hover:underline block"
              >
                {typeof category === 'string' ? 'Xem danh mục' : category.name}
              </Link>
            ))
          ) : (
            <Link
              href={`/dashboard/category/${typeof categoryParents === 'string' ? categoryParents : (categoryParents as Category)?._id}`}
              className="max-w-[150px] truncate font-medium text-blue-500 hover:underline"
            >
              {typeof categoryParents === 'string'
                ? 'Xem danh mục'
                : (categoryParents as Category)?.name}
            </Link>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Mô tả" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[300px] truncate font-medium">{row.getValue('description')}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'slug',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[150px] truncate font-medium">{row.getValue('slug')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[150px] truncate font-medium">
            {new Date(createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      );
    },
  },
  {
    id: 'Hành động',
    cell: ({ row }) => <ActionCell row={row} />,
  },
];
