'use client';

import { useQueryRequest, useMutationRequest } from '@/hooks/useQuery';
import { Product } from '@/interface/product.interface';
import { CommonResponse } from '@/types/common';
import { LoadingSpinner } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trash, Plus } from 'lucide-react';
import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { Category } from '@/types/category';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import MultipleSelector from '@/components/ui/multiple-selector';
import { Tag } from '@/interface/tag.interface';

// Define form type explicitly to match the Product structure
type ProductFormValues = {
  name: string;
  description: string;
  detail: string;
  category: string;
  price: number;
  discountPercent: number;
  tags: string[];
};

// Define the form schema to match the type
const productFormSchema = z.object({
  name: z.string().min(3, {
    message: 'Tên sản phẩm phải có ít nhất 3 ký tự',
  }),
  description: z.string().min(10, {
    message: 'Mô tả phải có ít nhất 10 ký tự',
  }),
  detail: z.string().min(10, {
    message: 'Chi tiết phải có ít nhất 10 ký tự',
  }),
  category: z.string().min(1, {
    message: 'Vui lòng chọn danh mục',
  }),
  price: z.coerce.number().min(1000, {
    message: 'Giá bán phải lớn hơn 1.000',
  }),
  discountPercent: z.coerce.number().min(0).max(100, {
    message: 'Giảm giá phải từ 0 đến 100%',
  }),
  tags: z.array(z.string()).default([]),
});

type CategoryListData = CommonResponse<Category[]>;

// Define color and size types for image uploads
type ColorOption = { label: string; value: string; colorCode: string };

// Define image group type
type ImageGroup = {
  id: string;
  color: ColorOption | null;
  size: string[];
  quantity: number;
  images: File[];
  imagePreviewUrls: string[];
};

export default function AddProductPage() {
  const router = useRouter();
  const [imageGroups, setImageGroups] = useState<ImageGroup[]>([
    {
      id: Date.now().toString(),
      color: null,
      size: [],
      quantity: 1,
      images: [],
      imagePreviewUrls: [],
    },
  ]);

  console.log(imageGroups);

  // Form setup
  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      detail: '',
      category: '',
      price: 0,
      discountPercent: 0,
      tags: [],
    },
  });

  // Categories data
  const { data: categories, isLoading: isLoadingCategories } = useQueryRequest<CategoryListData>({
    url: '/categories',
    queryKey: ['categories'],
  });

  // Tags data
  const { data: tagsData } = useQueryRequest<CommonResponse<Tag[]>>({
    url: '/tags',
    queryKey: ['tags'],
  });

  // Create product mutation
  const { mutate: createProduct, isPending: isCreating } = useMutationRequest<Product, FormData>({
    url: '/products/create-with-color-images',
    method: 'post',
    successMessage: 'Thêm sản phẩm thành công',
    errorMessage: 'Thêm sản phẩm thất bại',
    queryKey: ['products'],
    mutationOptions: {
      onSuccess: () => {
        router.push('/dashboard/product');
      },
    },
  });

  // Handle form submission
  async function handleCreateProduct(data: ProductFormValues) {
    // Create FormData for image upload
    const formData = new FormData();

    // Add form data (except tags)
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'tags') {
        formData.append(key, String(value));
      }
    });

    // Add tags separately
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tagId => {
        formData.append('tags', tagId);
      });
    }

    // Prepare images data structure for API
    const imagesData = imageGroups.map(group => {
      return {
        color: group.color?.label || '',
        colorCode: group.color?.colorCode || '',
        fileNames: group.images.map(file => file.name),
        quantity: group.quantity,
        size: group.size,
      };
    });

    // Add images data as JSON string
    formData.append('images', JSON.stringify(imagesData));

    // Add all files together
    imageGroups.forEach(group => {
      group.images.forEach(file => {
        formData.append('files', file);
      });
    });

    // Call API with FormData
    createProduct(formData);
  }

  // Handle file upload for a specific group
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, groupId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);

    setImageGroups(prev =>
      prev.map(group => {
        if (group.id === groupId) {
          // Create preview URLs
          const newImageUrls = newFiles.map(file => URL.createObjectURL(file));

          return {
            ...group,
            images: [...group.images, ...newFiles],
            imagePreviewUrls: [...group.imagePreviewUrls, ...newImageUrls],
          };
        }
        return group;
      }),
    );
  };

  // Remove image from a specific group
  const removeImage = (groupId: string, index: number) => {
    setImageGroups(prev =>
      prev.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            imagePreviewUrls: group.imagePreviewUrls.filter((_, i) => i !== index),
            images: group.images.filter((_, i) => i !== index),
          };
        }
        return group;
      }),
    );
  };

  // Add a new image group
  const addImageGroup = () => {
    setImageGroups(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        color: null,
        size: [],
        quantity: 1,
        images: [],
        imagePreviewUrls: [],
      },
    ]);
  };

  // Remove an image group
  const removeImageGroup = (groupId: string) => {
    setImageGroups(prev => prev.filter(group => group.id !== groupId));
  };

  // Update color for a specific group
  const updateGroupColor = (groupId: string, colorValue: string) => {
    const color = colorOptions.find(c => c.value === colorValue);
    if (!color) return;

    setImageGroups(prev =>
      prev.map(group => {
        if (group.id === groupId) {
          return { ...group, color };
        }
        return group;
      }),
    );
  };

  // Update size for a specific group
  const updateGroupSize = (groupId: string, sizes: string[]) => {
    setImageGroups(prev =>
      prev.map(group => {
        if (group.id === groupId) {
          return { ...group, size: sizes };
        }
        return group;
      }),
    );
  };

  // Update quantity for a specific group
  const updateGroupQuantity = (groupId: string, quantity: number) => {
    setImageGroups(prev =>
      prev.map(group => {
        if (group.id === groupId) {
          return { ...group, quantity };
        }
        return group;
      }),
    );
  };

  // Define common color options
  const colorOptions: ColorOption[] = [
    { label: 'Red', value: 'red', colorCode: '#FF0000' },
    { label: 'Blue', value: 'blue', colorCode: '#0000FF' },
    { label: 'Green', value: 'green', colorCode: '#008000' },
    { label: 'Black', value: 'black', colorCode: '#000000' },
    { label: 'White', value: 'white', colorCode: '#FFFFFF' },
  ];

  // Define common size options
  const allSizeOptions = [
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
    { label: 'XXL', value: 'XXL' },
  ];

  // Convert tags data to options format for MultipleSelector
  const tagOptions = tagsData?.data?.map(tag => ({
    label: tag.name,
    value: tag._id,
  })) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Thêm sản phẩm mới</h2>
        </div>
      </div>

      {isLoadingCategories ? (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white dark:bg-background rounded-lg shadow p-6">
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(data => {
                handleCreateProduct(data as ProductFormValues);
              })} 
              className="space-y-6"
            >
              {/* Grid chia 2 cột chính */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột trái */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên sản phẩm</FormLabel>
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh mục</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.data.map(category => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Cột phải */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giảm giá (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Chi tiết sản phẩm */}
              <FormField
                control={form.control}
                name="detail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chi tiết sản phẩm</FormLabel>
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

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags-input">Tags</Label>
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MultipleSelector
                          defaultOptions={tagOptions}
                          placeholder="Chọn tags..."
                          value={(field.value || []).map(tagId => {
                            const tag = tagsData?.data?.find(t => t._id === tagId);
                            return {
                              label: tag?.name || tagId,
                              value: tagId,
                            };
                          })}
                          onChange={options => {
                            field.onChange(options.map(option => option.value));
                          }}
                          emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                              Không tìm thấy tags
                            </p>
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Nhóm ảnh sản phẩm */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Ảnh sản phẩm theo màu và kích thước</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addImageGroup}>
                    <Plus className="h-4 w-4 mr-1" /> Thêm nhóm ảnh
                  </Button>
                </div>

                {imageGroups.map((group, index) => (
                  <Card key={group.id} className="p-4">
                    <CardContent className="p-0 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Nhóm ảnh {index + 1}</h4>
                        {imageGroups.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImageGroup(group.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Màu sắc */}
                        <div className="space-y-2">
                          <Label>Màu sắc</Label>
                          <Select
                            onValueChange={value => updateGroupColor(group.id, value)}
                            value={group.color?.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn màu sắc" />
                            </SelectTrigger>
                            <SelectContent>
                              {colorOptions.map(color => (
                                <SelectItem key={color.value} value={color.value}>
                                  <div className="flex items-center">
                                    <div
                                      className="w-4 h-4 mr-2 rounded-full"
                                      style={{ backgroundColor: color.colorCode }}
                                    />
                                    {color.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Kích thước */}
                        <div className="space-y-2">
                          <Label>Kích thước</Label>
                          <MultipleSelector
                            defaultOptions={allSizeOptions}
                            placeholder="Chọn kích thước..."
                            value={group.size.map(size => ({
                              label: size,
                              value: size
                            }))}
                            onChange={options => {
                              const newSizes = options.map(option => option.value);
                              updateGroupSize(group.id, newSizes);
                            }}
                            emptyIndicator={
                              <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                Không tìm thấy kích thước
                              </p>
                            }
                          />
                        </div>

                        {/* Số lượng */}
                        <div className="space-y-2">
                          <Label>Số lượng</Label>
                          <Input
                            type="number"
                            min="1"
                            value={group.quantity}
                            onChange={e =>
                              updateGroupQuantity(group.id, parseInt(e.target.value) || 1)
                            }
                          />
                        </div>
                      </div>

                      {/* Upload ảnh */}
                      <div className="space-y-2">
                        <Label htmlFor={`image-upload-${group.id}`}>Tải lên ảnh</Label>
                        <Input
                          id={`image-upload-${group.id}`}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={e => handleFileChange(e, group.id)}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                          Chọn nhiều ảnh để tải lên (JPG, PNG, WEBP)
                        </p>

                        {/* Image Preview */}
                        {group.imagePreviewUrls.length > 0 && (
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                            {group.imagePreviewUrls.map((url, imgIndex) => (
                              <div key={imgIndex} className="relative group">
                                <Image
                                  src={url}
                                  alt={`Preview ${imgIndex + 1}`}
                                  width={100}
                                  height={100}
                                  className="h-24 w-full object-cover rounded-md border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeImage(group.id, imgIndex)}
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/product')}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Đang thêm...' : 'Thêm sản phẩm'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
