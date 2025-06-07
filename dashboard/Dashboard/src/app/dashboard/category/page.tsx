'use client';

import { useQueryRequest, useMutationRequest } from '@/hooks/useQuery';
import { Category } from '@/types/category';
import { DataTable } from '../tasks/components/data-table';
import { columns } from './columns';
import { CommonResponse } from '@/types/common';
import { LoadingSpinner } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { FilterConfig } from '../tasks/components/data-table-toolbar';
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
import { Label } from '@/components/ui/label';
import Image from 'next/image';

type CategoryListData = CommonResponse<Category[]>;

// Define form type
type CategoryFormValues = {
  name: string;
  description: string;
};

// Define the form schema to match the type
const categoryFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Tên danh mục phải có ít nhất 3 ký tự',
  }),
  description: z.string().min(1, {
    message: 'Mô tả phải có ít nhất 10 ký tự',
  }),
});

export default function CategoryPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Form setup
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // For easier access to form methods
  const {
    handleSubmit,
    formState: { errors },
  } = form;

  console.log(errors);

  // Category list data
  const { data: categories, isLoading } = useQueryRequest<CategoryListData>({
    url: '/categories',
    queryKey: ['categories'],
  });

  // Create category mutation
  const { mutate: createCategory, isPending: isCreating } = useMutationRequest<
    Category,
    CategoryFormValues | FormData
  >({
    url: '/categories/with-image',
    method: 'post',
    successMessage: 'Thêm danh mục thành công',
    errorMessage: 'Thêm danh mục thất bại',
    queryKey: ['categories'],
    mutationOptions: {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        form.reset();
        setUploadedImage(null);
        setImagePreviewUrl(null);
      },
      onError: () => {
        setIsAddDialogOpen(false);
        form.reset();
        setUploadedImage(null);
        setImagePreviewUrl(null);
      },
    },
  });

  // Handle form submission
  async function handleCreateCategory(data: CategoryFormValues) {
    // Tạo FormData nếu có ảnh được tải lên
    if (uploadedImage) {
      const formData = new FormData();

      // Thêm các trường dữ liệu từ form
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      // Thêm ảnh
      formData.append('file', uploadedImage);

      // Gọi API với FormData
      createCategory(formData as FormData);
    } else {
      // Nếu không có ảnh, gửi dữ liệu thông thường
      createCategory(data);
    }
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadedImage(file);

    // Create preview URL
    const imageUrl = URL.createObjectURL(file);
    setImagePreviewUrl(imageUrl);
  };

  // Remove image from preview
  const removeImage = () => {
    setImagePreviewUrl(null);
    setUploadedImage(null);
  };

  // Define filter configurations
  const filterConfigs: FilterConfig[] = [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Danh mục sản phẩm</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      {isLoading ? (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-md">
          <LoadingSpinner />
        </div>
      ) : (
        <DataTable
          data={categories?.data ?? []}
          columns={columns}
          filterConfigs={filterConfigs}
          searchColumn="name"
          searchPlaceholder="Tìm danh mục..."
        />
      )}

      {/* Dialog thêm danh mục */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:h-[7px] [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:hidden [&::-webkit-scrollbar-thumb]:bg-black/30 [&::-webkit-scrollbar-thumb]:rounded-[4px]">
          <DialogHeader>
            <DialogTitle>Thêm danh mục mới</DialogTitle>
          </DialogHeader>

          {isCreating ? (
            <LoadingSpinner />
          ) : (
            <Form {...form}>
              <form onSubmit={handleSubmit(handleCreateCategory)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên danh mục</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
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
                    <Label>Ảnh danh mục</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="max-w-xs"
                      />
                      {imagePreviewUrl && (
                        <Button variant="outline" size="sm" onClick={removeImage}>
                          Xóa ảnh
                        </Button>
                      )}
                    </div>
                    {imagePreviewUrl && (
                      <div className="mt-2">
                        <Image
                          src={imagePreviewUrl}
                          alt="Preview"
                          width={200}
                          height={150}
                          className="object-cover rounded-md border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <DialogFooter className="bg-white dark:bg-background mt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">Thêm danh mục</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
