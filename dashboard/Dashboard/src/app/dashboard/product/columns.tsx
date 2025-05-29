'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Product } from '@/interface/product.interface';
import { DataTableColumnHeader } from '../tasks/components/data-table-column-header';
import { Color } from '@/interface/color.interface';
import { DataTableRowActions } from '../tasks/components/data-table-row-actions';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Edit, Eye, Trash, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Row } from '@tanstack/react-table';
import { Size } from '@/types/sizes';
import { Image as ImageType } from '@/interface/image.interface';
import React from 'react';
import MultipleSelector from '@/components/ui/multiple-selector';
import { useMutationRequest, useQueryRequest } from '@/hooks/useQuery';
import { LoadingSpinner } from '@/components/Loading';
import { CommonResponse } from '@/types/common';
import { Category, SubCategory } from '@/types/category';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Define the form schema to match the type
const productFormSchema = z.object({
  name: z.string().min(3, {
    message: 'Tên sản phẩm phải có ít nhất 3 ký tự',
  }),
  summary: z.string().min(10, {
    message: 'Tóm tắt phải có ít nhất 10 ký tự',
  }),
  content: z.string().min(10, {
    message: 'Nội dung phải có ít nhất 10 ký tự',
  }),
  subContent: z.string().optional(),
  category: z.string().min(1, {
    message: 'Vui lòng chọn danh mục',
  }),
  subCategory: z.string().min(1, {
    message: 'Vui lòng chọn danh mục con',
  }),
  originPrice: z.coerce.number().min(1000, {
    message: 'Giá gốc phải lớn hơn 1.000',
  }),
  price: z.coerce.number().min(1000, {
    message: 'Giá bán phải lớn hơn 1.000',
  }),
  discount: z.coerce.number().min(0).max(100, {
    message: 'Giảm giá phải từ 0 đến 100%',
  }),
  availableQuantities: z.coerce.number().min(0, {
    message: 'Số lượng không được âm',
  }),
  isFreeShip: z.boolean(),
  slug: z.string().min(3, {
    message: 'Slug phải có ít nhất 3 ký tự',
  }),
});

// Define ColorListData type for API response
type ColorListData = CommonResponse<{
  colors: Color[];
}>;

type SizeListData = CommonResponse<{
  sizes: Size[];
}>;

type SubCategoryListData = CommonResponse<{
  subCategories: SubCategory[];
}>;

type CategoryListData = CommonResponse<{
  categories: Category[];
}>;

type MultipleSelectorDemoProps<T> = {
  data: T[];
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  defaultSelected?: T[];
};

const MultipleSelectorDemo = <T,>({
  data,
  getLabel,
  getValue,
  defaultSelected,
}: MultipleSelectorDemoProps<T>) => {
  console.log(defaultSelected);
  return (
    <div className="w-full">
      <MultipleSelector
        defaultOptions={data.map(item => ({
          label: getLabel(item),
          value: getValue(item),
        }))}
        placeholder="Select options..."
        emptyIndicator={
          <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
            no results found.
          </p>
        }
        value={defaultSelected?.map(item => ({
          label: getLabel(item),
          value: getValue(item),
        }))}
      />
    </div>
  );
};

// Define form type explicitly instead of inferring from schema
type ProductFormValues = {
  name: string;
  summary: string;
  content: string;
  subContent?: string;
  category: string;
  subCategory: string;
  originPrice: number;
  price: number;
  discount: number;
  availableQuantities: number;
  isFreeShip: boolean;
  slug: string;
};

// Product Edit Dialog Component
function ProductDetailDialog({
  product,
  onClose,
  initialEditMode,
}: {
  product: Product;
  onClose: () => void;
  initialEditMode: boolean;
}) {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  // Add carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Process images for carousel
  const allImages: string[] = [];
  product.imageUrls?.forEach((imageObj: ImageType) => {
    imageObj.images.forEach((imgSrc: string) => {
      allImages.push(imgSrc);
    });
  });

  // Navigation functions for carousel
  const goToNextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % allImages.length);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length);
  };

  // Initialize form with React Hook Form - moved before any conditional returns
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product.name,
      summary: product.summary,
      content: product.content,
      subContent: product.subContent || '',
      category: product.category._id,
      // Convert subCategory to string if it's an object
      subCategory:
        typeof product.subCategory === 'string'
          ? product.subCategory
          : product.subCategory._id || '',
      originPrice: product.originPrice,
      price: product.price || 0,
      discount: product.discount || 0,
      availableQuantities: product.availableQuantities,
      isFreeShip: product.isFreeShip || false,
      slug: product.slug || '',
    },
  });

  const { data: colorsResponse, isLoading: isLoadingColors } = useQueryRequest<ColorListData>({
    url: '/colors',
    queryKey: ['colors'],
  });

  const { data: sizes, isLoading: isLoadingSizes } = useQueryRequest<SizeListData>({
    url: '/sizes',
    queryKey: ['sizes'],
  });

  const { data: categories, isLoading: isLoadingCategories } = useQueryRequest<CategoryListData>({
    url: '/categories',
    queryKey: ['categories'],
  });

  const { data: subCategories, isLoading: isLoadingSubCategories } =
    useQueryRequest<SubCategoryListData>({
      url: '/sub-categories',
      queryKey: ['sub-categories'],
    });

  const { mutate: mutateUpdateProduct, isPending } = useMutationRequest<Product, ProductFormValues>(
    {
      url: `/products/${product._id}`,
      method: 'patch',
      successMessage: 'Cập nhật sản phẩm thành công',
      errorMessage: 'Cập nhật sản phẩm thất bại',
      queryKey: ['products'],
      mutationOptions: {
        onSuccess: () => {
          onClose();
        },
      },
    },
  );

  if (
    isLoadingColors ||
    isLoadingSizes ||
    isLoadingCategories ||
    isLoadingSubCategories ||
    isPending
  ) {
    return <LoadingSpinner />;
  }

  async function handleSave(data: ProductFormValues) {
    console.log('Lưu thay đổi:', data);

    mutateUpdateProduct(data);
  }

  return (
    <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:h-[7px] [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:hidden [&::-webkit-scrollbar-thumb]:bg-black/30 [&::-webkit-scrollbar-thumb]:rounded-[4px]">
      <DialogHeader className="bg-white dark:bg-background">
        <DialogTitle>
          {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thông tin sản phẩm'}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4 mr-1" />
            {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa'}
          </Button>
        </DialogTitle>
      </DialogHeader>

      {isEditing ? (
        // Chế độ chỉnh sửa - hiển thị dạng columns với ảnh ở cuối
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
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
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Định danh URL cho sản phẩm (ví dụ: ao-thun-nam-trang)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tóm tắt</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nội dung phụ</FormLabel>
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
                          <SelectGroup>
                            {categories?.data.categories.map(category => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục con</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn danh mục con" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {subCategories?.data.subCategories.map(subCategory => (
                              <SelectItem key={subCategory._id} value={subCategory._id}>
                                {subCategory.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
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
                  name="originPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá gốc</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá hiện tại</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount"
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

                <FormField
                  control={form.control}
                  name="availableQuantities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFreeShip"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Miễn phí vận chuyển</FormLabel>
                        <FormDescription>Sản phẩm sẽ được miễn phí vận chuyển</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Màu sắc - full width */}
            <div className="space-y-2">
              <Label>Màu sắc</Label>
              <div className="w-full">
                <MultipleSelectorDemo
                  data={colorsResponse?.data.colors || []}
                  getLabel={color => color.name}
                  getValue={color => color._id}
                  defaultSelected={product.colors}
                />
              </div>
            </div>

            {/* Kích thước - full width */}
            <div className="space-y-2">
              <Label>Kích thước</Label>
              <div className="w-full">
                <MultipleSelectorDemo
                  data={sizes?.data.sizes || []}
                  getLabel={size => size.name}
                  getValue={size => size._id}
                  defaultSelected={product.sizes}
                />
              </div>
            </div>

            {/* Nội dung sản phẩm */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
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

            {/* Ảnh sản phẩm */}
            <div className="space-y-2">
              <Label>Ảnh sản phẩm</Label>
              <div className="flex flex-wrap gap-4 border rounded-md p-2 bg-muted">
                {/* Hiển thị ảnh nhỏ gọn nếu có nhiều ảnh */}
                {product.imageUrls?.map((imageObj: ImageType) =>
                  imageObj.images.map((imgSrc: string, index: number) => (
                    <Image
                      key={`${imageObj._id}-${index}`}
                      src={imgSrc}
                      alt={`${product.name} - ${imageObj.color}`}
                      width={100}
                      height={60}
                      className="object-cover rounded-md shadow-md"
                    />
                  )),
                )}
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className=" bg-white dark:bg-background mt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        </Form>
      ) : (
        // Chế độ xem thông tin
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-4">
            {/* Replace single image with carousel */}
            <div className="rounded-md overflow-hidden relative">
              {allImages.length > 0 ? (
                <>
                  <div className="relative aspect-video">
                    <Image
                      src={allImages[currentImageIndex]}
                      alt={`${product.name} - image ${currentImageIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Navigation buttons */}
                  {allImages.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                        onClick={goToPrevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                        onClick={goToNextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {/* Image indicators */}
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                        {allImages.map((_, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="icon"
                            className={`w-2 h-2 p-0 rounded-full ${
                              idx === currentImageIndex
                                ? 'bg-primary border-primary'
                                : 'bg-white/60 border-gray-300'
                            }`}
                            onClick={() => setCurrentImageIndex(idx)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Image
                  src={product.featuredImage}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="w-full object-cover"
                />
              )}
            </div>

            {/* Thumbnail navigation */}
            {allImages.length > 1 && (
              <div className="flex overflow-x-auto gap-2 pb-2">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 ${
                      idx === currentImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      width={60}
                      height={40}
                      className="object-cover w-[60px] h-[40px]"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label>Màu sắc</Label>
              <div className="flex flex-wrap gap-2">
                {product.colors?.map((color: Color) => (
                  <Badge
                    key={color._id}
                    variant="outline"
                    style={{ backgroundColor: color.value, color: '#fff' }}
                  >
                    {color.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kích thước</Label>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((size: Size, index: number) => {
                  const sizeName = size.name ?? '';
                  return (
                    <Badge key={index} variant="outline">
                      {sizeName}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold">Tên sản phẩm</Label>
                <p className="text-sm text-muted-foreground line-clamp-1 hover:line-clamp-none cursor-pointer">
                  {product.name}
                </p>
              </div>
              <div>
                <Label className="font-bold">Slug</Label>
                <p className="text-sm text-muted-foreground line-clamp-1 hover:line-clamp-none cursor-pointer">
                  {product.slug || 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold">Danh mục</Label>
                <Link
                  href={`/dashboard/category/${product.category._id}`}
                  className="hover:underline"
                >
                  <p className="text-sm">{product.category.name}</p>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold">Nội dung</Label>
                <p className="text-sm text-muted-foreground text-wrap line-clamp-3 hover:line-clamp-none cursor-pointer truncate">
                  {product.content}
                </p>
              </div>
              <div>
                <Label className="font-bold">Tóm tắt</Label>
                <p className="text-sm text-muted-foreground text-wrap line-clamp-2 hover:line-clamp-none cursor-pointer truncate">
                  {product.summary}
                </p>
              </div>
            </div>

            {/* Thanh ngang */}
            <div className="h-px bg-gray-200 my-4"></div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold">Giá gốc</Label>
                <p>{product.originPrice?.toLocaleString('vi-VN')} VND</p>
              </div>

              <div>
                <Label className="font-bold">Giá hiện tại</Label>
                <p>{product.price?.toLocaleString('vi-VN')} VND</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold">Giảm giá</Label>
                <p>{product.discount}%</p>
              </div>

              <div>
                <Label className="font-bold">Số lượng còn lại</Label>
                <p>{product.availableQuantities}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold">Miễn phí vận chuyển</Label>
                <p>{product.isFreeShip ? 'Có' : 'Không'}</p>
              </div>
            </div>

            {/* Thanh ngang */}
            <div className="h-px bg-gray-200 my-4"></div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold">Lượt mua</Label>
                <p>{product.unitsSold}</p>
              </div>

              <div>
                <Label className="font-bold">Lượt thích</Label>
                <p>{product.likes?.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold">Lượt comment</Label>
                <p>{product.comments?.length}</p>
              </div>

              <div>
                <Label className="font-bold">Đánh giá trung bình</Label>
                <p>{product.ratingAverage}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  );
}

// Action cell component để tránh lỗi useState trong cell function
function ActionCell({ row }: { row: Row<Product> }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { mutate: deleteProduct, isPending: isDeleting } = useMutationRequest<
    { success: boolean },
    undefined
  >({
    url: `/products/${row.original._id}`,
    method: 'delete',
    successMessage: 'Xóa sản phẩm thành công',
    errorMessage: 'Xóa sản phẩm thất bại',
    queryKey: ['products'],
  });

  const handleDelete = () => {
    deleteProduct(undefined);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <DataTableRowActions
        row={row}
        actions={[
          {
            label: 'Xem chi tiết',
            onClick: () => {
              setIsEditMode(false);
              setIsDialogOpen(true);
            },
            icon: <Eye className="h-4 w-4" />,
          },
          {
            label: 'Chỉnh sửa',
            onClick: () => {
              setIsEditMode(true);
              setIsDialogOpen(true);
            },
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

      {/* Dialog xem/sửa chi tiết */}
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <ProductDetailDialog
            product={row.original}
            onClose={() => setIsDialogOpen(false)}
            initialEditMode={isEditMode}
          />
        </Dialog>
      )}

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Xác nhận xóa sản phẩm
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm &ldquo;{row.original.name}&rdquo;? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Sản phẩm sẽ bị xóa khỏi hệ thống và không thể khôi phục. Tất cả dữ liệu liên quan đến
              sản phẩm này cũng sẽ bị xóa.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Đang xóa...' : 'Xóa sản phẩm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns: ColumnDef<Product>[] = [
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
    enableHiding: true,
    header: () => null,
    cell: () => null,
    enableSorting: false,
  },
  {
    accessorKey: 'productId',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => {
      const productId = row.getValue('productId') as string;
      return <div className="w-[80px]">SP-{productId ?? 0}</div>;
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'featuredImage',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ảnh chính" />,
    cell: ({ row }) => {
      const imageUrl = row.getValue('featuredImage') as string;
      return (
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger>
              <Image
                src={imageUrl}
                alt="Featured Image"
                width={100}
                height={100}
                className="cursor-pointer object-cover rounded"
              />
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-0">
              <Image
                src={imageUrl}
                alt="Featured Image"
                width={800}
                height={600}
                className="w-full h-auto"
              />
            </DialogContent>
          </Dialog>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sản phẩm" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate font-medium">{row.getValue('name')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'category',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Danh mục" />,
    cell: ({ row }) => {
      const category = row.getValue('category') as Category;
      return (
        <div className="flex space-x-2">
          <Link href={`/dashboard/category/${category._id}`} className="hover:underline">
            <span className="max-w-[150px] truncate font-medium">{category.name}</span>
          </Link>
        </div>
      );
    },
  },
  // {
  //   accessorKey: 'content',
  //   header: ({ column }) => <DataTableColumnHeader column={column} title="Nội dung" />,
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex space-x-2">
  //         <span className="max-w-[250px] truncate font-medium">{row.getValue('content')}</span>
  //       </div>
  //     );
  //   },
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: 'originPrice',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Giá gốc" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue('originPrice')
              ? ((row.getValue('originPrice') as number) ?? 0).toLocaleString('vi-VN')
              : '0'}{' '}
            VND
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Giá hiện tại" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue('price')
              ? ((row.getValue('price') as number) ?? 0).toLocaleString('vi-VN')
              : '0'}{' '}
            VND
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'discount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Giảm giá" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{row.getValue('discount')}%</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'isFreeShip',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Miễn phí vận chuyển" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue('isFreeShip') ? 'Có' : 'Không'}
          </span>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id);
      return value.includes(rowValue);
    },
  },
  {
    accessorKey: 'sizes',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Kích thước" />,
    cell: ({ row }) => {
      const sizes = row.getValue('sizes') as Size[];
      return (
        <div className="flex space-x-2">
          {sizes?.map((size: Size, index: number) => {
            return (
              <Badge key={index} variant="outline" className="font-semibold">
                {size.name}
              </Badge>
            );
          })}
        </div>
      );
    },
    filterFn: (row, id, filterValue) => {
      const rowValue = row.getValue(id) as string[];
      if (!rowValue || !Array.isArray(rowValue)) return false;

      // Check if any of the sizes in the row has a name that matches any of the filter values
      return rowValue.some(size => filterValue.includes(size));
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'colors',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Màu sắc" />,
    cell: ({ row }) => {
      // hiện thị bảng màu theo colors
      const colors = row.getValue('colors') as Color[];
      return (
        <div className="flex space-x-2">
          {colors?.map((color: Color) => {
            return (
              <Badge
                key={color._id}
                variant="outline"
                style={{ backgroundColor: color.value, color: '#fff' }}
              >
                {color.name}
              </Badge>
            );
          })}
        </div>
      );
    },
    filterFn: (row, id, filterValue) => {
      const rowValue = row.getValue(id) as Color[];
      if (!rowValue || !Array.isArray(rowValue)) return false;

      // Check if any of the colors in the row has a name that matches any of the filter values
      return rowValue.some(color => filterValue.includes(color.name));
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'availableQuantities',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Số lượng còn lại" />,
    cell: ({ row }) => {
      const availableQuantities = row.getValue('availableQuantities') as number;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{availableQuantities ?? 0}</span>
        </div>
      );
    },
  },
  {
    id: 'Hành động',
    cell: ({ row }) => <ActionCell row={row} />,
  },
];
