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
import { Edit, Eye, Trash, AlertTriangle } from 'lucide-react';
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { mutate: deleteTag, isPending: isDeleting } = useMutationRequest<
    { success: boolean },
    undefined
  >({
    url: `/tags/${row.original._id}`,
    method: 'delete',
    successMessage: 'Xóa tag thành công',
    errorMessage: 'Xóa tag thất bại',
    queryKey: ['tags'],
  });

  const handleDelete = () => {
    deleteTag(undefined);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <DataTableRowActions
        row={row}
        actions={[
          {
            label: 'Xem chi tiết',
            icon: <Eye className="mr-2 h-4 w-4" />,
            onClick: () => {
              setIsEditMode(false);
              setIsDialogOpen(true);
            },
          },
          {
            label: 'Chỉnh sửa',
            icon: <Edit className="mr-2 h-4 w-4" />,
            onClick: () => {
              setIsEditMode(true);
              setIsDialogOpen(true);
            },
          },
          {
            label: 'Xóa',
            icon: <Trash className="mr-2 h-4 w-4" />,
            onClick: () => setIsDeleteDialogOpen(true),
          },
        ]}
      />

      {/* Dialog chi tiết tag */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <TagDetailDialog
          tag={row.original}
          onClose={() => setIsDialogOpen(false)}
          initialEditMode={isEditMode}
        />
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
              Xác nhận xóa
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tag <strong>{row.original.name}</strong>?
              <br />
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tên tag" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
    cell: ({ row }) => (
      <div>
        {row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString('vi-VN')
          : 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cập nhật lần cuối" />,
    cell: ({ row }) => (
      <div>
        {row.original.updatedAt
          ? new Date(row.original.updatedAt).toLocaleDateString('vi-VN')
          : 'N/A'}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} />,
  },
]; 