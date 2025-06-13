'use client';

import { useQueryRequest, useMutationRequest } from '@/hooks/useQuery';
import { Tag } from '@/interface/tag.interface';
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
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/Loading';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CommonResponse } from '@/types/common';

// Define form type
type TagFormValues = {
  name: string;
  slug: string;
};
type TagData = CommonResponse<Tag>;

// Define the form schema
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

export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

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

  // Fetch tag data
  const { data: tag, isLoading: isLoadingTag } = useQueryRequest<TagData>({
    url: `/tags/${id}`,
    queryKey: ['tags', id],
  });
  console.log("tag", tag);

  // Update tag mutation
  const { mutate: updateTag, isPending: isUpdating } = useMutationRequest<TagData, TagFormValues>({
    url: `/tags/${id}`,
    method: 'patch',
    successMessage: 'Cập nhật tag thành công',
    errorMessage: 'Cập nhật tag thất bại',
    queryKey: ['tags'],
    mutationOptions: {
      onSuccess: () => {
        router.push('/dashboard/tags');
      },
    },
  });

  // Set form values when tag data is loaded
  useEffect(() => {
    if (tag) {
      form.reset({
        name: tag.data.name,
        slug: tag.data.slug,
      });
    }
  }, [tag, form]);

  // Handle form submission
  function handleUpdateTag(data: TagFormValues) {
    updateTag(data);
  }

  if (isLoadingTag) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Không tìm thấy tag</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Chỉnh sửa tag</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin tag</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateTag)} className="space-y-6">
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

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/tags')}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Đang cập nhật...' : 'Cập nhật tag'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 