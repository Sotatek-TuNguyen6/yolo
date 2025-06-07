'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQueryRequest, useMutationRequest } from '@/hooks/useQuery';
import { Product } from '@/interface/product.interface';
import { CommonResponse } from '@/types/common';
import { LoadingSpinner } from '@/components/Loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  Edit,
  Tag,
  Calendar,
  Percent,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category } from '@/types/category';
import { toast } from 'sonner';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import MultipleSelector from '@/components/ui/multiple-selector';

type ProductDetailData = CommonResponse<Product>;
type CategoryListData = CommonResponse<Category[]>;

// Define form schema
const productFormSchema = z.object({
  name: z.string().min(3, {
    message: 'Tên sản phẩm phải có ít nhất 3 ký tự',
  }),
  description: z.string().optional(),
  detail: z.string().optional(),
  category: z.string().min(1, {
    message: 'Vui lòng chọn danh mục',
  }),
  price: z.coerce.number().min(1000, {
    message: 'Giá bán phải lớn hơn 1.000',
  }),
  stock: z.coerce.number().min(0, {
    message: 'Số lượng không được âm',
  }),
  discountPercent: z.coerce.number().min(0).max(100, {
    message: 'Giảm giá phải từ 0 đến 100%',
  }),
});

// Define form type
type ProductFormValues = z.infer<typeof productFormSchema>;

// Define a type for variant form values
type VariantFormValues = {
  color: string;
  colorCode: string;
  size: string[];
  quantity: number;
  images: File[];
};

// Define the VariantGroup type
type VariantGroup = {
  color: string;
  colorCode: string;
  sizes: {
    size: string[];
    quantity: number;
    images: string[];
    _id?: string;
  }[];
};

// // Extend the Option type to include our custom properties
// type ExtendedOption = {
//   label: string;
//   value: string;
//   originalValue?: any;
// };

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [variants, setVariants] = useState<VariantGroup[]>([]);
  console.log(variants);
  const [selectedSizes, setSelectedSizes] = useState<{ [colorIndex: number]: string[] }>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null);
  const [newVariant, setNewVariant] = useState<VariantFormValues>({
    color: '',
    colorCode: '#000000',
    size: [],
    quantity: 0,
    images: [],
  });
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Define common size options
  const allSizeOptions = [
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
    { label: 'XXL', value: 'XXL' },
  ];

  // Check if we're in edit mode from the URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, []);

  // Fetch product details
  const { data: productData, isLoading } = useQueryRequest<ProductDetailData>({
    url: `/products/${productId}`,
    queryKey: ['product', productId],
  });

  // Fetch categories for the edit form
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useQueryRequest<CategoryListData>({
      url: '/categories',
      queryKey: ['categories'],
    });

  // Create form with React Hook Form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      detail: '',
      category: '',
      price: 0,
      stock: 0,
      discountPercent: 0,
    },
  });

  // Update form values when product data is loaded
  useEffect(() => {
    if (productData?.data) {
      const product = productData.data;
      form.reset({
        name: product.name || '',
        description: product.description || '',
        detail: product.detail || '',
        category:
          typeof product.category === 'object'
            ? product.category._id
            : (product.category as string) || '',
        price: product.price || 0,
        stock: product.stock || 0,
        discountPercent: product.discountPercent || 0,
      });
    }
  }, [productData, form]);

  // Process and group product variants when data is loaded
  useEffect(() => {
    if (productData?.data?.images && productData.data.images.length > 0) {
      const groups: VariantGroup[] = [];

      productData.data.images.forEach(image => {
        // Find if this color already exists in our groups
        const existingColorGroup = groups.find(group => group.color === image.color);

        if (existingColorGroup) {
          // Check if size exists in this color group
          const existingSizeInGroup = existingColorGroup.sizes.find(s => s.size === image.size);

          if (existingSizeInGroup) {
            // Add images to existing size
            existingSizeInGroup.images = [...existingSizeInGroup.images, ...image.url];
          } else {
            // Add new size to existing color
            existingColorGroup.sizes.push({
              size: image.size,
              quantity: image.quantity,
              images: image.url,
              _id: image._id,
            });
          }
        } else {
          // Add new color group
          groups.push({
            color: image.color,
            colorCode: image.colorCode,
            sizes: [
              {
                size: image.size,
                quantity: image.quantity,
                images: image.url,
                _id: image._id,
              },
            ],
          });
        }
      });

      setVariants(groups);

      // Initialize selectedSizes with current sizes
      const initialSizes: { [colorIndex: number]: string[] } = {};
      groups.forEach((group, index) => {
        // Make sure each size is a separate string in the array
        const sizes: string[] = [];

        group.sizes.forEach(sizeItem => {
          const sizeValue = sizeItem.size;

          // Handle array case - add all items from the array
          if (Array.isArray(sizeValue)) {
            sizeValue.forEach(s => {
              const cleanSize = typeof s === 'string' ? s : String(s);
              if (!sizes.includes(cleanSize)) {
                sizes.push(cleanSize);
              }
            });
          }
          // Handle string with commas - split and add all parts
          // else if (typeof sizeValue === 'string' && sizeValue.includes(',')) {
          //   sizeValue.split(',').forEach(s => {
          //     const cleanSize = s.trim();
          //     if (!sizes.includes(cleanSize)) {
          //       sizes.push(cleanSize);
          //     }
          //   });
          // }
          // Add single string
          else {
            const cleanSize = typeof sizeValue === 'string' ? sizeValue : String(sizeValue);
            if (!sizes.includes(cleanSize)) {
              sizes.push(cleanSize);
            }
          }
        });

        initialSizes[index] = sizes;
        console.log(`Initial sizes for color ${group.color}:`, initialSizes[index]);
      });
      setSelectedSizes(initialSizes);

      // Set the active color index to the first color group if available
      if (groups.length > 0) {
        setActiveColorIndex(0);
      }
    }
  }, [productData]);

  // Update product mutation
  const { mutate: updateProduct, isPending: isUpdating } = useMutationRequest<
    Product,
    ProductFormValues
  >({
    url: `/products/${productId}`,
    method: 'patch',
    successMessage: 'Cập nhật sản phẩm thành công',
    errorMessage: 'Cập nhật sản phẩm thất bại',
    queryKey: ['product', productId],
    mutationOptions: {
      onSuccess: () => {
        setIsEditing(false);
        toast.success('Cập nhật sản phẩm thành công');
      },
      onError: error => {
        console.log(error);
        toast.error('Cập nhật sản phẩm thất bại');
      },
    },
  });

  // Add variant mutation
  const { mutate: addVariantMutation } = useMutationRequest<unknown, FormData>({
    url: `/products/${productId}/variants`,
    method: 'post',
    successMessage: 'Thêm biến thể thành công',
    errorMessage: 'Thêm biến thể thất bại',
    queryKey: ['product', productId],
    mutationOptions: {
      onSuccess: () => {
        setNewVariant({
          color: '',
          colorCode: '#000000',
          size: [],
          quantity: 0,
          images: [],
        });
        setImagePreviewUrls([]);
        // window.location.reload();
      },
    },
  });

  const { mutate: updateVariantMutation } = useMutationRequest<
    unknown,
    { imagesId: string; size: string[] }
  >({
    url: `/products/update-size/${productId}`,
    method: 'patch',
    successMessage: 'Cập nhật biến thể thành công',
    errorMessage: 'Cập nhật biến thể thất bại',
    queryKey: ['product', productId],
    mutationOptions: {
      onSuccess: () => {
        setHasUnsavedChanges(false);
        // window.location.reload();
      },
    },
  });

  // Update variant quantity mutation
  const { mutate: updateVariantQuantityMutation } = useMutationRequest<
    unknown,
    { quantity: number; imagesId: string }
  >({
    url: `/products/${productId}/variants`,
    method: 'patch',
    successMessage: 'Cập nhật số lượng thành công',
    errorMessage: 'Cập nhật số lượng thất bại',
    queryKey: ['product', productId],
  });

  // Update variant size mutation
  const { mutate: updateVariantSizeMutation } = useMutationRequest<
    unknown,
    { size: string; imagesId: string }
  >({
    url: `/products/${productId}/variants`,
    method: 'patch',
    successMessage: 'Cập nhật kích thước thành công',
    errorMessage: 'Cập nhật kích thước thất bại',
    queryKey: ['product', productId],
  });

  // Delete variant mutation
  const { mutate: deleteVariantMutation } = useMutationRequest<unknown, { imagesId: string }>({
    url: `/products/${productId}/variants`,
    method: 'delete',
    successMessage: 'Xóa biến thể thành công',
    errorMessage: 'Xóa biến thể thất bại',
    queryKey: ['product', productId],
    mutationOptions: {
      onSuccess: () => {
        // Update variants state instead of reloading the page
        if (activeColorIndex !== null) {
          // Remove the variant from the local state
          const updatedVariants = [...variants];
          const colorToUpdate = updatedVariants[activeColorIndex];

          // If this was the last size for this color, remove the entire color group
          if (colorToUpdate.sizes.length <= 1) {
            updatedVariants.splice(activeColorIndex, 1);
            setActiveColorIndex(updatedVariants.length > 0 ? 0 : null);
          }

          setVariants(updatedVariants);
        }
      },
    },
  });

  // Handle form submission
  const onSubmit = (data: ProductFormValues) => {
    updateProduct(data);
  };

  // Handle file upload for new variant
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setNewVariant(prev => ({ ...prev, images: [...prev.images, ...newFiles] }));

    // Create preview URLs
    const newImageUrls = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newImageUrls]);
  };

  // Remove image from preview
  const removeImage = (index: number) => {
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    setNewVariant(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Handler functions using mutations
  const handleUpdateVariantQuantity = (variantId: string | undefined, newQuantity: number) => {
    if (!variantId) {
      toast.error('Không tìm thấy ID biến thể');
      return;
    }

    updateVariantQuantityMutation({ quantity: newQuantity, imagesId: variantId });
  };

  const handleUpdateVariantSize = (variantId: string | undefined, newSize: string) => {
    if (!variantId) {
      toast.error('Không tìm thấy ID biến thể');
      return;
    }

    updateVariantSizeMutation({ size: newSize, imagesId: variantId });
  };

  const handleDeleteVariant = (variantId: string | undefined) => {
    if (!variantId) {
      toast.error('Không tìm thấy ID biến thể');
      return;
    }

    deleteVariantMutation({ imagesId: variantId });
  };

  // Add new variant
  const addVariant = async () => {
    if (
      !newVariant.color ||
      newVariant.size.length === 0 ||
      newVariant.quantity <= 0 ||
      newVariant.images.length === 0
    ) {
      toast.error('Vui lòng điền đầy đủ thông tin biến thể');
      return;
    }

    // Create multiple variants, one for each selected size
    const formData = new FormData();
    formData.append('color', newVariant.color);
    formData.append('colorCode', newVariant.colorCode);
    formData.append('quantity', String(newVariant.quantity));
    newVariant.images.forEach(file => {
      formData.append('files', file);
    });
    newVariant.size.forEach(size => {
      formData.append('size', size);
    });

    addVariantMutation(formData);

    // Wait for all variants to be added
    // Reset form

    // Update the variants state without reloading the page
    // const response = await fetch(`/api/products/${productId}`);
    // const newProductData = await response.json();

    // if (newProductData?.data?.images) {
    //   // Process the new product data to update variants
    //   const groups: VariantGroup[] = [];

    //   // Define the type for image based on the Product interface
    //   interface ProductImage {
    //     _id: string;
    //     color: string;
    //     colorCode: string;
    //     size: string[];
    //     quantity: number;
    //     url: string[];
    //   }

    //   newProductData.data.images.forEach((image: ProductImage) => {
    //     // Find if this color already exists in our groups
    //     const existingColorGroup = groups.find(group => group.color === image.color);

    //     if (existingColorGroup) {
    //       // Check if size exists in this color group
    //       const existingSizeInGroup = existingColorGroup.sizes.find(s => s.size === image.size);

    //       if (existingSizeInGroup) {
    //         // Add images to existing size
    //         existingSizeInGroup.images = [...existingSizeInGroup.images, ...image.url];
    //       } else {
    //         // Add new size to existing color
    //         existingColorGroup.sizes.push({
    //           size: image.size,
    //           quantity: image.quantity,
    //           images: image.url,
    //           _id: image._id,
    //         });
    //       }
    //     } else {
    //       // Add new color group
    //       groups.push({
    //         color: image.color,
    //         colorCode: image.colorCode,
    //         sizes: [
    //           {
    //             size: image.size,
    //             quantity: image.quantity,
    //             images: image.url,
    //             _id: image._id,
    //           },
    //         ],
    //       });
    //     }
    //   });

    //   setVariants(groups);
    // }
  };

  // Save changes for the currently active color
  const saveColorSizeChanges = async () => {
    try {
      if (activeColorIndex === null) {
        toast.error('Vui lòng chọn một màu sắc trước');
        return;
      }

      console.log('Saving changes for color index:', activeColorIndex);

      const colorGroup = variants[activeColorIndex];
      if (!colorGroup) {
        toast.error('Không tìm thấy nhóm màu sắc');
        return;
      }

      // Find the first variant ID to use for the update
      const firstVariantId = colorGroup.sizes[0]?._id;
      if (!firstVariantId) {
        toast.error('Không tìm thấy biến thể');
        return;
      }

      // Get the new sizes for this color
      const newSizes = selectedSizes[activeColorIndex] || [];
      console.log('New sizes for color:', colorGroup.color, newSizes);
      console.log(
        'Types of sizes:',
        newSizes.map(size => ({
          size,
          type: typeof size,
          isArray: Array.isArray(size),
        })),
      );

      // Process all sizes to ensure they are valid strings
      const processedSizes: string[] = [];

      newSizes.forEach(size => {
        // If size is an array, add all elements
        if (Array.isArray(size)) {
          size.forEach(s => {
            const cleanSize = typeof s === 'string' ? s : String(s);
            if (!processedSizes.includes(cleanSize)) {
              processedSizes.push(cleanSize);
            }
          });
        }
        // If size is a string with commas, split and add all parts
        else if (typeof size === 'string' && size.includes(',')) {
          size.split(',').forEach(s => {
            const cleanSize = s.trim();
            if (!processedSizes.includes(cleanSize)) {
              processedSizes.push(cleanSize);
            }
          });
        }
        // Add single string
        else {
          const cleanSize = typeof size === 'string' ? size : String(size);
          if (!processedSizes.includes(cleanSize)) {
            processedSizes.push(cleanSize);
          }
        }
      });

      console.log('Processed sizes to send:', processedSizes);

      // Call the update mutation with the correct payload structure
      await updateVariantMutation({
        imagesId: firstVariantId,
        size: processedSizes,
      });

      setHasUnsavedChanges(false);
      toast.success(`Đã lưu thay đổi kích thước cho màu ${colorGroup.color}`);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Lưu thay đổi thất bại');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!productData || !productData.data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h2>
        <Button onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }

  const product = productData.data;

  return (
    <div className="container mx-auto py-8">
      {/* Back button and actions */}
      <div className="flex justify-between mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="mr-2 h-4 w-4" />
              Hủy
            </Button>
            <Button variant="default" onClick={form.handleSubmit(onSubmit)} disabled={isUpdating}>
              <Save className="mr-2 h-4 w-4" />
              {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        ) : (
          <Button variant="default" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Product header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <div className="flex items-center space-x-4 text-muted-foreground">
          <span className="flex items-center">
            <Tag className="mr-1 h-4 w-4" />
            ID: SP-{product.productId || '0'}
          </span>
          {product.createdAt && (
            <span className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              Ngày tạo: {new Date(product.createdAt).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
      </div>

      {/* Main content - show different UI based on isEditing state */}
      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCategories ? (
              <LoadingSpinner />
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="info">Thông tin cơ bản</TabsTrigger>
                  <TabsTrigger value="variants">Biến thể & Hình ảnh</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left column */}
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
                                <FormLabel>Mô tả ngắn</FormLabel>
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
                                      {categoriesData?.data?.map(category => (
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
                        </div>

                        {/* Right column */}
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Giá bán</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="stock"
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

                      {/* Full width fields */}
                      <FormField
                        control={form.control}
                        name="detail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chi tiết sản phẩm</FormLabel>
                            <FormControl>
                              <Textarea rows={5} className="min-h-[120px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="variants" className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Thêm biến thể mới</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="color">Màu sắc</Label>
                        <Input
                          id="color"
                          value={newVariant.color}
                          onChange={e => setNewVariant({ ...newVariant, color: e.target.value })}
                          placeholder="Tên màu (VD: Đỏ, Xanh...)"
                          className="mb-2"
                        />

                        <div className="flex items-center gap-2 mb-4">
                          <div
                            className="w-8 h-8 rounded-md border"
                            style={{ backgroundColor: newVariant.colorCode }}
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                Chọn màu
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <HexColorPicker
                                color={newVariant.colorCode}
                                onChange={color =>
                                  setNewVariant({ ...newVariant, colorCode: color })
                                }
                              />
                              <div className="p-2">
                                <Input
                                  value={newVariant.colorCode}
                                  onChange={e =>
                                    setNewVariant({ ...newVariant, colorCode: e.target.value })
                                  }
                                />
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <Label htmlFor="size">Kích thước</Label>
                        <div className="w-full mb-4">
                          <MultipleSelector
                            defaultOptions={allSizeOptions}
                            placeholder="Chọn kích thước..."
                            value={newVariant.size.map(size => {
                              // Ensure size is a string, not an array or joined string
                              let finalSize = size;

                              // Handle array case
                              if (Array.isArray(size)) {
                                finalSize = typeof size[0] === 'string' ? size[0] : String(size[0]);
                              }
                              // Handle string with commas
                              else if (typeof size === 'string' && size.includes(',')) {
                                finalSize = size.split(',')[0];
                              }
                              // Ensure it's a string
                              else {
                                finalSize = typeof size === 'string' ? size : String(size);
                              }

                              return {
                                label: finalSize,
                                value: finalSize,
                              };
                            })}
                            onChange={options => {
                              // Extract just the string values to avoid nested arrays
                              const newSizes = options.map(option => option.value);
                              setNewVariant({
                                ...newVariant,
                                size: newSizes,
                              });
                            }}
                            emptyIndicator={
                              <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                Không tìm thấy kích thước
                              </p>
                            }
                          />
                        </div>

                        <Label htmlFor="quantity">Số lượng</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={newVariant.quantity}
                          onChange={e =>
                            setNewVariant({ ...newVariant, quantity: parseInt(e.target.value) })
                          }
                          min="0"
                        />
                      </div>

                      <div>
                        <Label className="block mb-2">Hình ảnh</Label>
                        <div className="border-2 border-dashed rounded-lg p-4 text-center mb-4">
                          <Label
                            htmlFor="image-upload"
                            className="cursor-pointer flex flex-col items-center"
                          >
                            <Upload className="h-8 w-8 mb-2 text-gray-500" />
                            <span className="text-sm text-gray-500">Tải lên hình ảnh</span>
                            <span className="text-xs text-gray-400 mt-1">
                              Chọn nhiều hình ảnh cùng lúc
                            </span>
                          </Label>
                          <Input
                            id="image-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </div>

                        {imagePreviewUrls.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {imagePreviewUrls.map((url, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square relative rounded-md overflow-hidden border">
                                  <Image
                                    src={url}
                                    alt={`Preview ${index}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={addVariant}
                      disabled={
                        !newVariant.color ||
                        newVariant.size.length === 0 ||
                        newVariant.quantity <= 0 ||
                        newVariant.images.length === 0
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm biến thể
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        Biến thể hiện tại
                        {activeColorIndex !== null && variants[activeColorIndex] && (
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            (Đang chọn màu: {variants[activeColorIndex].color})
                          </span>
                        )}
                      </h3>
                      {hasUnsavedChanges && (
                        <Button
                          variant="default"
                          onClick={saveColorSizeChanges}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Lưu thay đổi kích thước
                        </Button>
                      )}
                    </div>

                    <Tabs
                      defaultValue={variants.length > 0 ? variants[0]?.color : 'no-variants'}
                      className="w-full"
                      onValueChange={value => {
                        // Find the index of the color that matches the selected tab value
                        const index = variants.findIndex(group => group.color === value);
                        if (index !== -1) {
                          console.log('Tab changed to:', value, 'index:', index);
                          setActiveColorIndex(index);
                        }
                      }}
                    >
                      <TabsList className="mb-4 flex flex-wrap">
                        {variants.length > 0 ? (
                          variants.map((group, index) => (
                            <TabsTrigger
                              key={`color-${index}`}
                              value={group.color}
                              className="flex items-center gap-2"
                            >
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: group.colorCode || '#ccc' }}
                              />
                              {group.color} ({group.sizes.length} sizes)
                            </TabsTrigger>
                          ))
                        ) : (
                          <TabsTrigger value="no-variants">Không có biến thể</TabsTrigger>
                        )}
                      </TabsList>

                      {variants.length > 0 ? (
                        variants.map((group, groupIndex) => (
                          <TabsContent
                            key={`content-${groupIndex}`}
                            value={group.color}
                            className="space-y-6"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {group.sizes.map((sizeItem, sizeIndex) => (
                                <div
                                  key={`size-${sizeIndex}`}
                                  className="border rounded-lg p-4 bg-background"
                                >
                                  <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-sm">
                                        Size:
                                      </Badge>
                                      <div className="relative">
                                        <Input
                                          value={sizeItem.size || 'N/A'}
                                          className="h-6 w-20 text-sm py-0 px-2"
                                          onChange={e => {
                                            // Update local state
                                            const newVariants = [...variants];
                                            newVariants[groupIndex].sizes[sizeIndex].size = [
                                              e.target.value,
                                            ]; // Wrap the string in an array
                                            setVariants(newVariants);
                                          }}
                                          onBlur={e => {
                                            if (
                                              e.target.value !==
                                              (Array.isArray(sizeItem.size)
                                                ? sizeItem.size[0]
                                                : sizeItem.size)
                                            ) {
                                              handleUpdateVariantSize(sizeItem._id, e.target.value);
                                            }
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center">
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-6 w-6 rounded-r-none"
                                          onClick={() => {
                                            const newQuantity = Math.max(0, sizeItem.quantity - 1);
                                            handleUpdateVariantQuantity(sizeItem._id, newQuantity);
                                            // Update local state
                                            const newVariants = [...variants];
                                            newVariants[groupIndex].sizes[sizeIndex].quantity =
                                              newQuantity;
                                            setVariants(newVariants);
                                          }}
                                        >
                                          -
                                        </Button>
                                        <Input
                                          type="number"
                                          value={sizeItem.quantity}
                                          onChange={e => {
                                            const newQuantity = parseInt(e.target.value) || 0;
                                            // Update local state
                                            const newVariants = [...variants];
                                            newVariants[groupIndex].sizes[sizeIndex].quantity =
                                              newQuantity;
                                            setVariants(newVariants);
                                          }}
                                          onBlur={() => {
                                            handleUpdateVariantQuantity(
                                              sizeItem._id,
                                              sizeItem.quantity,
                                            );
                                          }}
                                          className="h-6 w-16 text-center rounded-none border-x-0"
                                        />
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-6 w-6 rounded-l-none"
                                          onClick={() => {
                                            const newQuantity = sizeItem.quantity + 1;
                                            handleUpdateVariantQuantity(sizeItem._id, newQuantity);
                                            // Update local state
                                            const newVariants = [...variants];
                                            newVariants[groupIndex].sizes[sizeIndex].quantity =
                                              newQuantity;
                                            setVariants(newVariants);
                                          }}
                                        >
                                          +
                                        </Button>
                                      </div>
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleDeleteVariant(sizeItem._id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2">
                                    {sizeItem.images.map((url, imgIndex) => (
                                      <Dialog key={`img-${imgIndex}`}>
                                        <DialogTrigger asChild>
                                          <div className="aspect-square relative rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity">
                                            <Image
                                              src={url}
                                              alt={`${product.name} - ${group.color} - ${sizeItem.size} - ${imgIndex}`}
                                              fill
                                              className="object-cover"
                                            />
                                          </div>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl p-0">
                                          <div className="relative">
                                            <Image
                                              src={url}
                                              alt={`${product.name} - ${group.color} - ${sizeItem.size}`}
                                              width={800}
                                              height={600}
                                              className="w-full h-auto"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3">
                                              <div className="flex flex-wrap gap-2">
                                                <Badge
                                                  className="mr-2"
                                                  style={{
                                                    backgroundColor: group.colorCode || '#ccc',
                                                    color: '#fff',
                                                  }}
                                                >
                                                  {group.color || 'Không có màu'}
                                                </Badge>
                                                <Badge variant="outline" className="bg-white/20">
                                                  Size: {sizeItem.size || 'N/A'}
                                                </Badge>
                                                <Badge variant="secondary">
                                                  SL: {sizeItem.quantity || 0}
                                                </Badge>
                                              </div>
                                            </div>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        ))
                      ) : (
                        <TabsContent value="no-variants" className="text-center py-8 text-gray-500">
                          Sản phẩm chưa có biến thể nào
                        </TabsContent>
                      )}
                    </Tabs>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Hủy
            </Button>
            <Button variant="default" onClick={form.handleSubmit(onSubmit)} disabled={isUpdating}>
              {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Main info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Giá bán</p>
                    <p className="text-lg font-bold">
                      {product.price?.toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                  {product.discountPercent && product.discountPercent > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Giảm giá</p>
                      <p className="flex items-center text-lg font-bold text-red-500">
                        <Percent className="mr-1 h-4 w-4" />
                        {product.discountPercent}%
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Tổng số lượng</p>
                    <p className="text-lg font-bold">{product.stock || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Danh mục</p>
                    <p className="text-lg font-bold">
                      {typeof product.category === 'object' ? product.category.name : 'Không có'}
                    </p>
                  </div>
                </div>

                {product.description && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Mô tả</p>
                    <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
                  </div>
                )}

                {product.detail && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Chi tiết</p>
                    <p className="text-gray-700 dark:text-gray-300">{product.detail}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product variants */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Biến thể sản phẩm</h2>

                <Tabs
                  defaultValue={variants.length > 0 ? variants[0]?.color : 'no-variants'}
                  className="w-full"
                  onValueChange={value => {
                    // Find the index of the color that matches the selected tab value
                    const index = variants.findIndex(group => group.color === value);
                    if (index !== -1) {
                      console.log('Tab changed to:', value, 'index:', index);
                      setActiveColorIndex(index);
                    }
                  }}
                >
                  <TabsList className="mb-4 flex flex-wrap">
                    {variants.length > 0 ? (
                      variants.map((group, index) => (
                        <TabsTrigger
                          key={`color-${index}`}
                          value={group.color}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: group.colorCode || '#ccc' }}
                          />
                          {group.color} ({group.sizes.length} sizes)
                        </TabsTrigger>
                      ))
                    ) : (
                      <TabsTrigger value="no-variants">Không có biến thể</TabsTrigger>
                    )}
                  </TabsList>

                  {variants.map((group, groupIndex) => (
                    <TabsContent
                      key={`content-${groupIndex}`}
                      value={group.color}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.sizes.map((sizeItem, sizeIndex) => (
                          <div
                            key={`size-${sizeIndex}`}
                            className="border rounded-lg p-4 bg-background"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-sm">
                                  Size:
                                </Badge>
                                <div className="relative">
                                  <Input
                                    value={sizeItem.size || 'N/A'}
                                    className="h-6 w-20 text-sm py-0 px-2"
                                    onChange={e => {
                                      // Update local state
                                      const newVariants = [...variants];
                                      newVariants[groupIndex].sizes[sizeIndex].size = [
                                        e.target.value,
                                      ]; // Wrap the string in an array
                                      setVariants(newVariants);
                                    }}
                                    onBlur={e => {
                                      if (
                                        e.target.value !==
                                        (Array.isArray(sizeItem.size)
                                          ? sizeItem.size[0]
                                          : sizeItem.size)
                                      ) {
                                        handleUpdateVariantSize(sizeItem._id, e.target.value);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 rounded-r-none"
                                    onClick={() => {
                                      const newQuantity = Math.max(0, sizeItem.quantity - 1);
                                      handleUpdateVariantQuantity(sizeItem._id, newQuantity);
                                      // Update local state
                                      const newVariants = [...variants];
                                      newVariants[groupIndex].sizes[sizeIndex].quantity =
                                        newQuantity;
                                      setVariants(newVariants);
                                    }}
                                  >
                                    -
                                  </Button>
                                  <Input
                                    type="number"
                                    value={sizeItem.quantity}
                                    onChange={e => {
                                      const newQuantity = parseInt(e.target.value) || 0;
                                      // Update local state
                                      const newVariants = [...variants];
                                      newVariants[groupIndex].sizes[sizeIndex].quantity =
                                        newQuantity;
                                      setVariants(newVariants);
                                    }}
                                    onBlur={() => {
                                      handleUpdateVariantQuantity(sizeItem._id, sizeItem.quantity);
                                    }}
                                    className="h-6 w-16 text-center rounded-none border-x-0"
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 rounded-l-none"
                                    onClick={() => {
                                      const newQuantity = sizeItem.quantity + 1;
                                      handleUpdateVariantQuantity(sizeItem._id, newQuantity);
                                      // Update local state
                                      const newVariants = [...variants];
                                      newVariants[groupIndex].sizes[sizeIndex].quantity =
                                        newQuantity;
                                      setVariants(newVariants);
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleDeleteVariant(sizeItem._id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              {sizeItem.images.map((url, imgIndex) => (
                                <Dialog key={`img-${imgIndex}`}>
                                  <DialogTrigger asChild>
                                    <div className="aspect-square relative rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity">
                                      <Image
                                        src={url}
                                        alt={`${product.name} - ${group.color} - ${sizeItem.size} - ${imgIndex}`}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-3xl p-0">
                                    <div className="relative">
                                      <Image
                                        src={url}
                                        alt={`${product.name} - ${group.color} - ${sizeItem.size}`}
                                        width={800}
                                        height={600}
                                        className="w-full h-auto"
                                      />
                                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3">
                                        <div className="flex flex-wrap gap-2">
                                          <Badge
                                            className="mr-2"
                                            style={{
                                              backgroundColor: group.colorCode || '#ccc',
                                              color: '#fff',
                                            }}
                                          >
                                            {group.color || 'Không có màu'}
                                          </Badge>
                                          <Badge variant="outline" className="bg-white/20">
                                            Size: {sizeItem.size || 'N/A'}
                                          </Badge>
                                          <Badge variant="secondary">
                                            SL: {sizeItem.quantity || 0}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Gallery and quick actions */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Hình ảnh chính</h2>
                <div className="aspect-square relative rounded-md overflow-hidden mb-4">
                  <Image
                    src={
                      selectedImageUrl || product.images?.[0]?.url?.[0] || '/placeholder-image.jpg'
                    }
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-4 gap-2">
                  {product.images?.slice(0, 8).map(
                    (image, index) =>
                      image.url?.[0] && (
                        <div
                          key={`thumb-${index}`}
                          className={`aspect-square relative rounded-md overflow-hidden border-2 cursor-pointer 
                          ${selectedImageUrl === image.url[0] ? 'border-primary' : 'border-transparent'}`}
                          onClick={() => setSelectedImageUrl(image.url[0])}
                        >
                          <Image
                            src={image.url[0]}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Tổng quan biến thể</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Màu sắc</p>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((group, index) => (
                        <Badge
                          key={`color-badge-${index}`}
                          variant="outline"
                          style={{ backgroundColor: group.colorCode || '#ccc', color: '#fff' }}
                        >
                          {group.color}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Kích thước</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(
                        new Set(variants.flatMap(group => group.sizes.map(s => s.size))),
                      ).map((size, index) => (
                        <Badge key={`size-badge-${index}`} variant="outline">
                          {size || 'N/A'}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Tổng số ảnh</p>
                    <p className="text-lg font-bold">
                      {product.images?.reduce((total, img) => total + img.url.length, 0) || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
