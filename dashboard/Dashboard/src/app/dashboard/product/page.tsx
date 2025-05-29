'use client';

import { useQueryRequest, useMutationRequest } from '@/hooks/useQuery';
import { Product } from '@/interface/product.interface';
import { DataTable } from '../tasks/components/data-table';
import { columns } from './columns';
import { CommonResponse } from '@/types/common';
import { LoadingSpinner } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { PlusCircle, CheckCircle2, XCircle, Trash } from 'lucide-react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Category, SubCategory } from '@/types/category';
import { Size } from '@/types/sizes';
import { Color } from '@/interface/color.interface';
import MultipleSelector from '@/components/ui/multiple-selector';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';

type ProductListData = CommonResponse<{
  products: Product[];
  prevPage: number;
  nextPage: number;
  total: number;
}>;

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
  onSelectionChange?: (selection: { label: string; value: string }[]) => void;
};

const MultipleSelectorDemo = <T,>({
  data,
  getLabel,
  getValue,
  defaultSelected,
  onSelectionChange,
}: MultipleSelectorDemoProps<T>) => {
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
        onChange={onSelectionChange}
      />
    </div>
  );
};

// Fix type definitions
type ColorOption = { label: string; value: string };
type SizeOption = { label: string; value: string };

export default function ProductPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState<ColorOption[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<SizeOption[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      summary: '',
      content: '',
      subContent: '',
      category: '',
      subCategory: '',
      originPrice: 0,
      price: 0,
      discount: 0,
      availableQuantities: 0,
      isFreeShip: false,
      slug: '',
    },
  });

  // Product list data
  const { data: products, isLoading } = useQueryRequest<ProductListData>({
    url: '/products',
    queryKey: ['products'],
  });

  // Data for dropdowns
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

  // Create product mutation
  const { mutate: createProduct, isPending: isCreating } = useMutationRequest<
    Product,
    (ProductFormValues & { colors: string[]; sizes: string[] }) | FormData
  >({
    url: '/products/with-images',
    method: 'post',
    successMessage: 'Thêm sản phẩm thành công',
    errorMessage: 'Thêm sản phẩm thất bại',
    queryKey: ['products'],
    mutationOptions: {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        form.reset();
        setSelectedColors([]);
        setSelectedSizes([]);
        setUploadedImages([]);
        setImagePreviewUrls([]);
      },
      onError: () => {
        setIsAddDialogOpen(false);
        form.reset();
        setSelectedColors([]);
        setSelectedSizes([]);
        setUploadedImages([]);
        setImagePreviewUrls([]);
      },
    },
  });

  // Handle form submission
  async function handleCreateProduct(data: ProductFormValues) {
    // Tạo FormData nếu có ảnh được tải lên
    if (uploadedImages.length > 0) {
      const formData = new FormData();

      // Thêm các trường dữ liệu từ form
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      // Thêm colors và sizes
      selectedColors.forEach(color => {
        formData.append(`colors`, color.value);
      });

      selectedSizes.forEach(size => {
        formData.append(`sizes`, size.value);
      });

      // Thêm các ảnh
      uploadedImages.forEach(file => {
        formData.append(`files`, file);
      });

      formData.append(`colorId`, selectedColors[0].value);
      // Gọi API với FormData
      createProduct(formData as FormData);
    } else {
      // Nếu không có ảnh, gửi dữ liệu thông thường
      const productData = {
        ...data,
        colors: selectedColors.map(c => c.value),
        sizes: selectedSizes.map(s => s.value),
      };

      createProduct(productData);
    }
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setUploadedImages(prev => [...prev, ...newFiles]);

    // Create preview URLs
    const newImageUrls = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newImageUrls]);
  };

  // Remove image from preview
  const removeImage = (index: number) => {
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Check if data is loading
  const isFormLoading =
    isLoadingColors ||
    isLoadingSizes ||
    isLoadingCategories ||
    isLoadingSubCategories ||
    isCreating;

  // Define common size options
  const defaultSizeOptions = [
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
    { label: 'XXL', value: 'XXL' },
  ];

  // Define filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      column: 'isFreeShip',
      title: 'Miễn phí vận chuyển',
      options: [
        {
          label: 'Có',
          value: true,
          icon: CheckCircle2,
        },
        {
          label: 'Không',
          value: false,
          icon: XCircle,
        },
      ],
    },
    {
      column: 'sizes',
      title: 'Kích thước',
      options: defaultSizeOptions,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Sản phẩm</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm sản phẩm
        </Button>
      </div>

      {isLoading ? (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-md">
          <LoadingSpinner />
        </div>
      ) : (
        <DataTable
          data={products?.data?.products ?? []}
          columns={columns}
          filterConfigs={filterConfigs}
          searchColumn="name"
          searchPlaceholder="Tìm sản phẩm..."
        />
      )}

      {/* Dialog thêm sản phẩm */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:h-[7px] [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:hidden [&::-webkit-scrollbar-thumb]:bg-black/30 [&::-webkit-scrollbar-thumb]:rounded-[4px]">
          <DialogHeader>
            <DialogTitle>Thêm sản phẩm mới</DialogTitle>
          </DialogHeader>

          {isFormLoading ? (
            <LoadingSpinner />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateProduct)} className="space-y-6">
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
                      onSelectionChange={setSelectedColors}
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
                      onSelectionChange={setSelectedSizes}
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

                {/* Upload ảnh sản phẩm */}
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Ảnh sản phẩm</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Chọn nhiều ảnh để tải lên (JPG, PNG, WEBP)
                  </p>

                  {/* Image Preview */}
                  {imagePreviewUrls.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            width={100}
                            height={100}
                            className="h-24 w-full object-cover rounded-md border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <DialogFooter className="bg-white dark:bg-background mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      form.reset();
                      setSelectedColors([]);
                      setSelectedSizes([]);
                      setUploadedImages([]);
                      setImagePreviewUrls([]);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Đang thêm...' : 'Thêm sản phẩm'}
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
