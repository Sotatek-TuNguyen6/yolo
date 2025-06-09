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
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HexColorPicker } from 'react-colorful';
import { toast } from 'sonner';

// Define form type explicitly to match the Product structure
type ProductFormValues = {
  name: string;
  description: string;
  detail: string;
  category: string;
  price: number;
  discountPercent: number;
  tags: string[];
  slug: string;
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
  slug: z.string()
    .min(3, { message: 'Slug phải có ít nhất 3 ký tự' })
    .regex(/^[a-z0-9\-]+$/, { 
      message: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang' 
    }),
});

type CategoryListData = CommonResponse<Category[]>;

// Define color and size types for image uploads
type ColorOption = { label: string; value: string; colorCode: string };

// Define image group type
type ImageGroup = {
  id: string;
  color: ColorOption | null;
  sizeQuantities: { size: string; quantity: number }[];
  images: File[];
  imagePreviewUrls: string[];
};

export default function AddProductPage() {
  const router = useRouter();
  const [imageGroups, setImageGroups] = useState<ImageGroup[]>([
    {
      id: Date.now().toString(),
      color: {
        label: '',
        value: '',
        colorCode: '#000000'
      },
      sizeQuantities: [],
      images: [],
      imagePreviewUrls: [],
    },
  ]);

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
      slug: '',
    },
  });

  // Function to generate slug from product name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD') // Decompose Vietnamese characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
      .replace(/[đĐ]/g, 'd') // Replace Vietnamese d/D with d
      .replace(/[^a-z0-9\s]/g, '') // Remove non-alphanumeric characters except spaces
      .trim()
      .replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-6); // Add timestamp suffix for uniqueness
  };

  // Auto-generate slug when name changes
  const watchName = form.watch('name');
  
  // Generate slug when name changes if slug is empty
  React.useEffect(() => {
    if (watchName && !form.getValues('slug')) {
      const generatedSlug = generateSlug(watchName);
      form.setValue('slug', generatedSlug);
    }
  }, [watchName, form]);

  // Categories data
  const { data: categories, isLoading: isLoadingCategories } = useQueryRequest<CategoryListData>({
    url: '/categories',
    queryKey: ['categories'],
  });

  // Tags data
  const { data: tagsData, isLoading: isLoadingTags } = useQueryRequest<CommonResponse<Tag[]>>({
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
    // Validate that all image groups have color information
    const missingColorInfo = imageGroups.some(group => !group.color?.label || group.color.label.trim() === '');
    if (missingColorInfo) {
      toast.error('Vui lòng nhập tên cho tất cả màu sắc');
      return;
    }

    // Validate that all image groups have at least one image
    const missingImages = imageGroups.some(group => group.images.length === 0);
    if (missingImages) {
      toast.error('Vui lòng tải lên ít nhất một hình ảnh cho mỗi màu sắc');
      return;
    }

    // Validate that all image groups have at least one size quantity
    const missingSizes = imageGroups.some(group => group.sizeQuantities.length === 0);
    if (missingSizes) {
      toast.error('Vui lòng thêm ít nhất một kích thước cho mỗi màu sắc');
      return;
    }

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
        sizeQuantities: group.sizeQuantities,
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
        color: {
          label: '',
          value: '',
          colorCode: '#000000'
        },
        sizeQuantities: [],
        images: [],
        imagePreviewUrls: [],
      },
    ]);
  };

  // Remove an image group
  const removeImageGroup = (groupId: string) => {
    setImageGroups(prev => prev.filter(group => group.id !== groupId));
  };

  // Add or update size quantity for a specific group
  const updateSizeQuantity = (groupId: string, size: string, quantity: number) => {
    setImageGroups(prev =>
      prev.map(group => {
        if (group.id === groupId) {
          // Check if size already exists
          const existingIndex = group.sizeQuantities.findIndex(sq => sq.size === size);
          
          if (existingIndex >= 0) {
            // Update existing size
            const updatedSizeQuantities = [...group.sizeQuantities];
            updatedSizeQuantities[existingIndex] = { size, quantity };
            return { ...group, sizeQuantities: updatedSizeQuantities };
          } else {
            // Add new size
            return { 
              ...group, 
              sizeQuantities: [...group.sizeQuantities, { size, quantity }] 
            };
          }
        }
        return group;
      }),
    );
  };

  // Remove size from a group
  const removeSizeQuantity = (groupId: string, size: string) => {
    setImageGroups(prev =>
      prev.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            sizeQuantities: group.sizeQuantities.filter(sq => sq.size !== size)
          };
        }
        return group;
      }),
    );
  };

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
    <div className="space-y-4 max-w-full px-2 sm:px-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Thêm sản phẩm mới</h2>
        </div>
      </div>

      {isLoadingCategories || isLoadingTags ? (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white dark:bg-background rounded-lg shadow p-3 sm:p-6">
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(data => {
                handleCreateProduct(data as ProductFormValues);
              })} 
              className="space-y-4 sm:space-y-6"
            >
              {/* Grid chia 2 cột chính */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Cột trái */}
                <div className="space-y-3 sm:space-y-4">
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
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug URL</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} placeholder="ten-san-pham" />
                          </FormControl>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Slug sẽ hiển thị trên URL (VD: /products/ten-san-pham). Slug phải là duy nhất.
                        </p>
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
                          <SelectContent position="popper" className="w-full min-w-[200px]">
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
                <div className="space-y-3 sm:space-y-4">
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
                        className="flex min-h-[80px] sm:min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <Label>Ảnh sản phẩm theo màu và kích thước</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addImageGroup} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-1" /> Thêm nhóm ảnh
                  </Button>
                </div>

                {imageGroups.map((group, index) => (
                  <Card key={group.id} className="p-3 sm:p-4">
                    <CardContent className="p-0 pt-3 sm:pt-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
                        <h4 className="font-medium flex items-center gap-2">
                          Nhóm ảnh {index + 1}
                          {group.color?.label && (
                            <div className="flex items-center gap-1">
                              <div 
                                className="w-4 h-4 rounded-full border" 
                                style={{ backgroundColor: group.color?.colorCode || '#000000' }}
                              ></div>
                              <span className="text-sm text-muted-foreground">({group.color.label})</span>
                            </div>
                          )}
                        </h4>
                        {imageGroups.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImageGroup(group.id)}
                            className="w-full sm:w-auto"
                          >
                            <Trash className="h-4 w-4 mr-1 sm:mr-0" />
                            <span className="sm:hidden">Xóa nhóm</span>
                          </Button>
                        )}
                      </div>

                      <div className="mb-3 sm:mb-4">
                        {/* Màu sắc */}
                        <div className="space-y-2 mb-3 sm:mb-4">
                          <Label>Màu sắc</Label>
                          <Input
                            value={group.color?.label || ''}
                            onChange={e => {
                              const updatedColor = { 
                                ...(group.color || { value: '', colorCode: '#000000' }),
                                label: e.target.value,
                                value: e.target.value.toLowerCase().replace(/\s+/g, '-')
                              };
                              setImageGroups(prev =>
                                prev.map(g => {
                                  if (g.id === group.id) {
                                    return { ...g, color: updatedColor };
                                  }
                                  return g;
                                })
                              );
                            }}
                            placeholder="Tên màu (VD: Đỏ, Xanh...)"
                            className="mb-1"
                          />
                          <p className="text-xs text-muted-foreground mb-2 sm:mb-3">
                            Tên màu sắc sẽ hiển thị cho người dùng khi chọn sản phẩm
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                          <div
                            className="w-8 h-8 rounded-md border"
                            style={{ backgroundColor: group.color?.colorCode || '#000000' }}
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                Chọn màu
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start" side="bottom">
                              <div className="w-[220px] sm:w-auto">
                                <HexColorPicker
                                  color={group.color?.colorCode || '#000000'}
                                  onChange={color => {
                                    const updatedColor = { 
                                      ...(group.color || { label: '', value: '' }),
                                      colorCode: color
                                    };
                                    setImageGroups(prev =>
                                      prev.map(g => {
                                        if (g.id === group.id) {
                                          return { ...g, color: updatedColor };
                                        }
                                        return g;
                                      })
                                    );
                                  }}
                                />
                              </div>
                              <div className="p-2">
                                <Input
                                  value={group.color?.colorCode || '#000000'}
                                  onChange={e => {
                                    const updatedColor = { 
                                      ...(group.color || { label: '', value: '' }),
                                      colorCode: e.target.value
                                    };
                                    setImageGroups(prev =>
                                      prev.map(g => {
                                        if (g.id === group.id) {
                                          return { ...g, color: updatedColor };
                                        }
                                        return g;
                                      })
                                    );
                                  }}
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Kích thước và số lượng */}
                      <div className="space-y-2">
                        <Label>Kích thước và số lượng</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {group.sizeQuantities.map((sizeQty, sizeIndex) => (
                            <div key={sizeIndex} className="flex items-center gap-2 p-2 border rounded-md">
                              <div className="font-medium flex-grow">{sizeQty.size}</div>
                              <div className="flex items-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 rounded-r-none"
                                  onClick={() => {
                                    const newQuantity = Math.max(1, sizeQty.quantity - 1);
                                    updateSizeQuantity(group.id, sizeQty.size, newQuantity);
                                  }}
                                >
                                  -
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  value={sizeQty.quantity}
                                  onChange={e => updateSizeQuantity(
                                    group.id, 
                                    sizeQty.size, 
                                    parseInt(e.target.value) || 1
                                  )}
                                  className="h-7 w-16 text-center rounded-none border-x-0"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 rounded-l-none"
                                  onClick={() => {
                                    const newQuantity = sizeQty.quantity + 1;
                                    updateSizeQuantity(group.id, sizeQty.size, newQuantity);
                                  }}
                                >
                                  +
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => removeSizeQuantity(group.id, sizeQty.size)}
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}

                          {/* Thêm kích thước mới */}
                          <div className="mt-2">
                            <Select
                              onValueChange={value => {
                                // Only add if not already in the list
                                if (!group.sizeQuantities.some(sq => sq.size === value)) {
                                  updateSizeQuantity(group.id, value, 1);
                                }
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Thêm kích thước..." />
                              </SelectTrigger>
                              <SelectContent position="popper" className="w-full min-w-[200px]">
                                {allSizeOptions
                                  .filter(option => !group.sizeQuantities.some(sq => sq.size === option.value))
                                  .map(size => (
                                    <SelectItem key={size.value} value={size.value}>
                                      {size.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    {/* Upload ảnh */}
                    <div className="p-0 sm:p-4 sm:pt-0 space-y-2 mt-4 sm:mt-0">
                      <Label htmlFor={`image-upload-${group.id}`}>Tải lên ảnh</Label>
                      <Input
                        id={`image-upload-${group.id}`}
                        type="file"
                        accept="image/jpeg, image/png"
                        multiple
                        onChange={e => handleFileChange(e, group.id)}
                        className="cursor-pointer text-xs sm:text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Chọn nhiều ảnh để tải lên (JPG, PNG)
                      </p>

                      {/* Image Preview */}
                      {group.imagePreviewUrls.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                          {group.imagePreviewUrls.map((url: string, imgIndex: number) => (
                            <div key={imgIndex} className="relative group">
                              <div className="relative w-full pt-[100%]">
                                <Image
                                  src={url}
                                  alt={`Preview ${imgIndex + 1}`}
                                  fill
                                  className="absolute inset-0 object-cover rounded-md border"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(group.id, imgIndex)}
                              >
                                <Trash className="h-2 w-2 sm:h-3 sm:w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/product')}
                  className="w-full sm:w-auto"
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
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
