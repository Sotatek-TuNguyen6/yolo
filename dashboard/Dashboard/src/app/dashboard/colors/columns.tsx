'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Color } from '@/interface/color.interface';
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
const colorFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Tên màu sắc không được để trống',
  }),
  value: z
    .string()
    .min(1, {
      message: 'Giá trị màu không được để trống',
    })
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: 'Giá trị màu phải là mã màu HEX hợp lệ (ví dụ: #FF5733)',
    }),
});

type ColorFormValues = z.infer<typeof colorFormSchema>;

function ActionCell({ row }: { row: Row<Color> }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(colorFormSchema),
    defaultValues: {
      name: row.original.name,
      value: row.original.value,
    },
  });

  const { mutate: updateColor, isPending: isUpdating } = useMutationRequest<Color, ColorFormValues>(
    {
      url: `/colors/${row.original._id}`,
      method: 'put',
      successMessage: 'Cập nhật màu sắc thành công',
      errorMessage: 'Cập nhật màu sắc thất bại',
      queryKey: ['colors'],
      mutationOptions: {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          form.reset();
        },
      },
    },
  );

  const { mutate: deleteColor, isPending: isDeleting } = useMutationRequest<
    { success: boolean },
    undefined
  >({
    url: `/colors/${row.original._id}`,
    method: 'delete',
    successMessage: 'Xóa màu sắc thành công',
    errorMessage: 'Xóa màu sắc thất bại',
    queryKey: ['colors'],
    mutationOptions: {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      },
    },
  });

  function onSubmit(data: ColorFormValues) {
    updateColor(data);
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
            <DialogTitle>Chỉnh sửa màu sắc</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên màu sắc</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá trị màu (HEX)</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <div
                        className="h-8 w-8 rounded-md border border-gray-300"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
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
              Xác nhận xóa màu sắc
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa màu sắc &ldquo;{row.original.name}&rdquo;? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteColor(undefined)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa màu sắc'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns: ColumnDef<Color>[] = [
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tên màu sắc" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{row.getValue('name')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'value',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Giá trị màu" />,
    cell: ({ row }) => {
      const colorValue = row.getValue('value') as string;
      return (
        <div className="flex items-center space-x-2">
          <div
            className="h-6 w-6 rounded-md border border-gray-300"
            style={{ backgroundColor: colorValue }}
          />
          <span className="font-mono">{colorValue}</span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} />,
  },
];
