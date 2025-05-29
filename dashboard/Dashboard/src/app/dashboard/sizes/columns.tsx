'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Size } from '@/types/sizes';
import { DataTableColumnHeader } from '../tasks/components/data-table-column-header';
import { DataTableRowActions } from '../tasks/components/data-table-row-actions';
import { Row } from '@tanstack/react-table';
import { Edit, Trash, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
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

// Form schema
const sizeFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Tên kích thước không được để trống',
  }),
});

type SizeFormValues = z.infer<typeof sizeFormSchema>;

function ActionCell({ row }: { row: Row<Size> }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<SizeFormValues>({
    resolver: zodResolver(sizeFormSchema),
    defaultValues: {
      name: row.original.name,
    },
  });

  const { mutate: updateSize, isPending: isUpdating } = useMutationRequest<Size, SizeFormValues>({
    url: `/sizes/${row.original._id}`,
    method: 'put',
    successMessage: 'Cập nhật kích thước thành công',
    errorMessage: 'Cập nhật kích thước thất bại',
    queryKey: ['sizes'],
    mutationOptions: {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        form.reset();
      },
    },
  });

  const { mutate: deleteSize, isPending: isDeleting } = useMutationRequest<
    { success: boolean },
    undefined
  >({
    url: `/sizes/${row.original._id}`,
    method: 'delete',
    successMessage: 'Xóa kích thước thành công',
    errorMessage: 'Xóa kích thước thất bại',
    queryKey: ['sizes'],
    mutationOptions: {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      },
    },
  });

  function onSubmit(data: SizeFormValues) {
    updateSize(data);
  }

  return (
    <>
      <DataTableRowActions
        row={row}
        actions={[
          {
            label: 'Chỉnh sửa',
            onClick: () => setIsEditDialogOpen(true),
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa kích thước</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên kích thước</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} type="button">
                  Hủy
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Xác nhận xóa kích thước
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa kích thước &ldquo;{row.original.name}&rdquo;? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteSize(undefined)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa kích thước'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns: ColumnDef<Size>[] = [
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
    cell: ({ row }) => <div className="w-[80px] truncate">{row.getValue('_id')}</div>,
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tên kích thước" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{row.getValue('name')}</span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} />,
  },
];
