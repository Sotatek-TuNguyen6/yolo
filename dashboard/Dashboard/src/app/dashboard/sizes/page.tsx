'use client';

import { useQueryRequest, useMutationRequest } from '@/hooks/useQuery';
import { Size } from '@/types/sizes';
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

type SizeListData = CommonResponse<{
  sizes: Size[];
  prevPage: number;
  nextPage: number;
  total: number;
}>;

// Form schema
const sizeFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Tên kích thước không được để trống',
  }),
});

type SizeFormValues = z.infer<typeof sizeFormSchema>;

export default function SizesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch sizes data
  const { data: sizesData, isLoading } = useQueryRequest<SizeListData>({
    url: '/sizes',
    queryKey: ['sizes'],
  });

  // Form setup
  const form = useForm<SizeFormValues>({
    resolver: zodResolver(sizeFormSchema),
    defaultValues: {
      name: '',
    },
  });

  // Add size mutation
  const { mutate: addSize, isPending: isCreating } = useMutationRequest<Size, SizeFormValues>({
    url: '/sizes',
    method: 'post',
    successMessage: 'Thêm kích thước thành công',
    errorMessage: 'Thêm kích thước thất bại',
    queryKey: ['sizes'],
    mutationOptions: {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        form.reset();
      },
    },
  });

  // Handle form submission
  function onSubmit(data: SizeFormValues) {
    addSize(data);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  const sizes = sizesData?.data?.sizes || [];

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý kích thước</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm kích thước mới
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={sizes}
        searchColumn="name"
        searchPlaceholder="Tìm kiếm kích thước..."
      />

      {/* Add Size Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm kích thước mới</DialogTitle>
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
                      <Input placeholder="Nhập tên kích thước" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Đang thêm...' : 'Thêm kích thước'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
