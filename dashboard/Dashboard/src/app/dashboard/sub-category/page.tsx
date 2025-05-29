'use client';

import { useQueryRequest, useMutationRequest } from '@/hooks/useQuery';
import { Category, SubCategory } from '@/types/category';
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
import MultipleSelector from '@/components/ui/multiple-selector';

type SubCategoryListData = CommonResponse<{
  subCategories: SubCategory[];
  prevPage: number;
  nextPage: number;
  total: number;
}>;

type CategoryListData = CommonResponse<{
  categories: Category[];
}>;

// Option interface for MultipleSelector
interface Option {
  value: string;
  label: string;
}

// Define form type
type SubCategoryFormValues = {
  name: string;
  description: string;
  slug: string;
  categoryParents: string[];
};

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

export default function SubCategoryPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Form setup
  const form = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      categoryParents: [],
    },
  });

  // SubCategory list data
  const { data: subCategories, isLoading } = useQueryRequest<SubCategoryListData>({
    url: '/sub-categories',
    queryKey: ['sub-categories'],
  });

  // Get categories for parent selection
  const { data: categoriesResponse, isLoading: isLoadingCategories } =
    useQueryRequest<CategoryListData>({
      url: '/categories',
      queryKey: ['categories'],
    });

  // Create subcategory mutation
  const { mutate: createSubCategory, isPending: isCreating } = useMutationRequest<
    SubCategory,
    SubCategoryFormValues | FormData
  >({
    url: '/sub-categories/with-image',
    method: 'post',
    successMessage: 'Thêm danh mục con thành công',
    errorMessage: 'Thêm danh mục con thất bại',
    queryKey: ['sub-categories'],
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
  async function handleCreateSubCategory(data: SubCategoryFormValues) {
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
      createSubCategory(formData as FormData);
    } else {
      // Nếu không có ảnh, gửi dữ liệu thông thường
      createSubCategory(data);
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

  const isFormLoading = isLoadingCategories || isCreating;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Danh mục con</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm danh mục con
        </Button>
      </div>

      {isLoading ? (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-md">
          <LoadingSpinner />
        </div>
      ) : (
        <DataTable
          data={subCategories?.data?.subCategories ?? []}
          columns={columns}
          filterConfigs={filterConfigs}
          searchColumn="name"
          searchPlaceholder="Tìm danh mục con..."
        />
      )}

      {/* Dialog thêm danh mục con */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:h-[7px] [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:hidden [&::-webkit-scrollbar-thumb]:bg-black/30 [&::-webkit-scrollbar-thumb]:rounded-[4px]">
          <DialogHeader>
            <DialogTitle>Thêm danh mục con mới</DialogTitle>
          </DialogHeader>

          {isFormLoading ? (
            <LoadingSpinner />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateSubCategory)} className="space-y-6">
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

                  {/* Ảnh danh mục con */}
                  <div className="space-y-2">
                    <Label>Ảnh danh mục con</Label>
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
                  <Button type="submit">Thêm danh mục con</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
