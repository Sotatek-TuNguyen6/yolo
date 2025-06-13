'use client';

import { useQueryRequest, useMutationRequest } from '@/hooks/useQuery';
import { Tag } from '@/interface/tag.interface';
import { DataTable } from '../tasks/components/data-table';
import { columns } from './columns';
import { CommonResponse } from '@/types/common';
import { LoadingSpinner } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { FilterConfig } from '../tasks/components/data-table-toolbar';
import { useState, useEffect } from 'react';
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

type TagListData = CommonResponse<Tag[]>;

// Define form type
type TagFormValues = {
  name: string;
  slug: string;
};

// Define the form schema to match the type
const tagFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Tên tag không được để trống',
  }),
  slug: z.string().min(1, {
    message: 'Slug không được để trống',
  }).regex(/^[a-z0-9-]+$/, {
    message: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang',
  }),
});

// Hàm tạo slug từ tên
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default function TagsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form setup
  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  // Tự động tạo slug khi tên thay đổi
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'name' && value.name) {
        form.setValue('slug', createSlug(value.name));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Tag list data
  const { data: tags, isLoading } = useQueryRequest<TagListData>({
    url: '/tags',
    queryKey: ['tags'],
  });

  // Create tag mutation
  const { mutate: createTag, isPending: isCreating } = useMutationRequest<Tag, TagFormValues>({
    url: '/tags',
    method: 'post',
    successMessage: 'Thêm tag thành công',
    errorMessage: 'Thêm tag thất bại',
    queryKey: ['tags'],
    mutationOptions: {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        form.reset();
      },
      onError: () => {
        setIsAddDialogOpen(false);
        form.reset();
      },
    },
  });

  // Handle form submission
  function handleCreateTag(data: TagFormValues) {
    createTag(data);
  }

  // Define filter configurations
  const filterConfigs: FilterConfig[] = [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Quản lý Tags</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm tag
        </Button>
      </div>

      {isLoading ? (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-md">
          <LoadingSpinner />
        </div>
      ) : (
        <DataTable
          data={tags?.data ?? []}
          columns={columns}
          filterConfigs={filterConfigs}
          searchColumn="name"
          searchPlaceholder="Tìm tag..."
        />
      )}

      {/* Dialog thêm tag */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm tag mới</DialogTitle>
          </DialogHeader>

          {isCreating ? (
            <LoadingSpinner />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateTag)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên tag</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nhập tên tag" />
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
                          <Input {...field} placeholder="Slug sẽ được tự động tạo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Footer */}
                <DialogFooter className="bg-white dark:bg-background mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Đang thêm...' : 'Thêm tag'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 