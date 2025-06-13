'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Tag } from '@/interface/tag.interface';
import { DataTableColumnHeader } from '../tasks/components/data-table-column-header';
import { DataTableRowActions } from '../tasks/components/data-table-row-actions';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Edit, Trash, AlertTriangle } from 'lucide-react';
import { Row } from '@tanstack/react-table';
import React from 'react';
import { useMutationRequest } from '@/hooks/useQuery';
import { LoadingSpinner } from '@/components/Loading';
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
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import { Badge } from '@/components/ui/badge';

// Define the form schema
const tagFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Tên tag không được để trống',
  }),
});

// Define form type
type TagFormValues = {
  name: string;
};

// Tag Detail Dialog Component
function TagDetailDialog({
  tag,
  onClose,
  initialEditMode,
}: {
  tag: Tag;
  onClose: () => void;
  initialEditMode: boolean;
}) {
  const [isEditing, setIsEditing] = useState(initialEditMode);

  // Initialize form with React Hook Form
  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: tag.name,
    },
  });

  const { mutate: mutateUpdateTag, isPending } = useMutationRequest<Tag, TagFormValues>({
    url: `/tags/${tag._id}`,
    method: 'patch',
    successMessage: 'Cập nhật tag thành công',
    errorMessage: 'Cập nhật tag thất bại',
    queryKey: ['tags'],
    mutationOptions: {
      onSuccess: () => {
        onClose();
      },
    },
  });

  if (isPending) {
    return <LoadingSpinner />;
  }

  async function handleSave(data: TagFormValues) {
    mutateUpdateTag(data);
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader className="bg-white dark:bg-background">
        <DialogTitle>
          {isEditing ? 'Chỉnh sửa tag' : 'Thông tin tag'}
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
                    <FormLabel>Tên tag</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
        <div className="space-y-4 py-4">
          <div>
            <Label className="font-bold">Tên tag</Label>
            <p className="text-sm text-muted-foreground">{tag.name}</p>
          </div>

          {tag.createdAt && (
            <div>
              <Label className="font-bold">Ngày tạo</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(tag.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          )}

          {tag.updatedAt && (
            <div>
              <Label className="font-bold">Cập nhật lần cuối</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(tag.updatedAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          )}
        </div>
      )}
    </DialogContent>
  );
}

// Action cell component
function ActionCell({ row }: { row: Row<Tag> }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const { mutate: deleteTag, isPending: isDeleting } = useMutationRequest<
    { success: boolean },
    undefined
  >({
    url: `/tags/${row.original._id}`,
    method: 'delete',
    successMessage: 'Xóa tag thành công',
    errorMessage: 'Xóa tag thất bại',
    queryKey: ['tags'],
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
            label: 'Chỉnh sửa',
            onClick: () => router.push(`/dashboard/tags/${row.original._id}/edit`),
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

      {/* Dialog chi tiết tag */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <TagDetailDialog
          tag={row.original}
          onClose={() => setIsDialogOpen(false)}
          initialEditMode={false}
        />
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Xác nhận xóa tag
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tag &ldquo;{row.original.name}&rdquo;? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTag(undefined)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa tag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns: ColumnDef<Tag>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
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
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tên tag" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/tags/${row.original._id}`}
            className="font-medium hover:underline text-blue-600"
          >
            {row.getValue('name')}
          </Link>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'slug',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Slug" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="font-mono text-sm">{row.getValue('slug')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
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
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} />,
  },
]; 