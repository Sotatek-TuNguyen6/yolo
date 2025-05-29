'use client';

import { useQueryRequest, useMutationRequest } from '@/hooks/useQuery';
import { Color } from '@/interface/color.interface';
import { DataTable } from '../tasks/components/data-table';
import { columns } from './columns';
import { CommonResponse } from '@/types/common';
import { LoadingSpinner } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';

type ColorListData = CommonResponse<{
  colors: Color[];
  prevPage: number;
  nextPage: number;
  total: number;
}>;

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

export default function ColorsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch colors data
  const { data: colorsData, isLoading } = useQueryRequest<ColorListData>({
    url: '/colors',
    queryKey: ['colors'],
  });

  // Form setup
  const form = useForm<ColorFormValues>({
    resolver: zodResolver(colorFormSchema),
    defaultValues: {
      name: '',
      value: '#000000',
    },
  });

  // Add color mutation
  const { mutate: addColor, isPending: isCreating } = useMutationRequest<Color, ColorFormValues>({
    url: '/colors',
    method: 'post',
    successMessage: 'Thêm màu sắc thành công',
    errorMessage: 'Thêm màu sắc thất bại',
    queryKey: ['colors'],
    mutationOptions: {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        form.reset({
          name: '',
          value: '#000000',
        });
      },
    },
  });

  // Handle form submission
  function onSubmit(data: ColorFormValues) {
    addColor(data);
  }

  // Handle color input change
  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('value', e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  const colors = colorsData?.data?.colors || [];

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý màu sắc</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm màu sắc mới
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={colors}
        searchColumn="name"
        searchPlaceholder="Tìm kiếm màu sắc..."
      />

      {/* Add Color Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm màu sắc mới</DialogTitle>
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
                      <Input placeholder="Nhập tên màu sắc" {...field} />
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
                    <div className="grid grid-cols-[1fr,auto] gap-2">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>

                      <div className="flex items-center">
                        <input
                          type="color"
                          value={field.value}
                          onChange={handleColorPickerChange}
                          className="h-8 w-10 cursor-pointer rounded border-0"
                        />
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Đang thêm...' : 'Thêm màu sắc'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
