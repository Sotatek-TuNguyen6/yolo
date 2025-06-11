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

type ProductDetailData = CommonResponse<Product>;
type CategoryListData = CommonResponse<Category[]>;

// Define form schema
const productFormSchema = z.object({
  name: z.string().min(3, {
    message: 'Tên sản phẩm phải có ít nhất 3 ký tự',
  }),
  description: z.string().optional(),
  detail: z.string().optional(),
  slug: z
    .string()
    .min(3, { message: 'Slug phải có ít nhất 3 ký tự' })
    .regex(/^[a-z0-9\-]+$/, {
      message: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang',
    })
    .optional(),
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
  isDeleted: z.boolean().optional(),
});

// Define form type
type ProductFormValues = z.infer<typeof productFormSchema>;

// Define a type for variant form values
type VariantFormValues = {
  color: string;
  colorCode: string;
  size: string[]; // Used for UI selection tracking
  quantity: number; // Legacy field, not used in API
  images: File[];
  sizeQuantities: { size: string; quantity: number }[]; // Format expected by API
};

// Define the VariantGroup type
type VariantGroup = {
  color: string;
  colorCode: string;
  sizes: {
    size: string[] | string; // Used for UI display
    quantity: number;
    images: string[];
    imagesId: string;
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
  const [selectedSizes, setSelectedSizes] = useState<{ [colorIndex: number]: string[] }>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null);
  const [newVariant, setNewVariant] = useState<VariantFormValues>({
    color: '',
    colorCode: '#000000',
    size: [],
    quantity: 0,
    images: [],
    sizeQuantities: [],
  });
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [newSizeQuantities, setNewSizeQuantities] = useState<{
    [colorIndex: number]: { size: string; quantity: number };
  }>({});

  // Function to generate slug from product name
  const generateSlug = (name: string): string => {
    return (
      name
        .toLowerCase()
        .normalize('NFD') // Decompose Vietnamese characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
        .replace(/[đĐ]/g, 'd') // Replace Vietnamese d/D with d
        .replace(/[^a-z0-9\s]/g, '') // Remove non-alphanumeric characters except spaces
        .trim()
        .replace(/\s+/g, '-') +
      '-' +
      Date.now().toString().slice(-6)
    ); // Add timestamp suffix for uniqueness
  };

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
    url: `/products/get-detail-product/${productId}`,
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
      slug: '',
      category: '',
      price: 0,
      stock: 0,
      discountPercent: 0,
      isDeleted: false,
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
        slug: product.slug || '',
        category:
          typeof product.category === 'object'
            ? product.category._id
            : (product.category as string) || '',
        price: product.price || 0,
        stock: product.stock || 0,
        discountPercent: product.discountPercent || 0,
        isDeleted: product.isDeleted || false,
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
          // Process all size-quantity pairs from the image
          if (image.sizeQuantities && image.sizeQuantities.length > 0) {
            image.sizeQuantities.forEach(sizeQty => {
              // Check if size exists in this color group
              const existingSizeInGroup = existingColorGroup.sizes.find(
                s =>
                  (Array.isArray(s.size) && s.size.includes(sizeQty.size)) ||
                  s.size === sizeQty.size,
              );

              if (existingSizeInGroup) {
                // Add images to existing size
                existingSizeInGroup.images = [...existingSizeInGroup.images, ...image.url];
                // Update quantity if needed
                if (existingSizeInGroup.quantity !== sizeQty.quantity) {
                  existingSizeInGroup.quantity = sizeQty.quantity;
                }
              } else {
                // Add new size to existing color
                existingColorGroup.sizes.push({
                  size: sizeQty.size,
                  quantity: sizeQty.quantity,
                  images: image.url,
                  imagesId: image._id || '',
                  _id: sizeQty._id || '',
                });
              }
            });
          } else {
            // If no sizeQuantities found (should not happen with updated schema)
            console.warn('Image missing sizeQuantities:', image);
            // Add a default size entry to not break the UI
            existingColorGroup.sizes.push({
              size: 'Default',
              quantity: 0,
              images: image.url,
              imagesId: image._id || '',
              _id: '',
            });
          }
        } else {
          // Add new color group
          const sizes = [];

          // Process all size-quantity pairs
          if (image.sizeQuantities && image.sizeQuantities.length > 0) {
            image.sizeQuantities.forEach(sizeQty => {
              sizes.push({
                size: sizeQty.size,
                quantity: sizeQty.quantity,
                images: image.url,
                imagesId: image._id,
                _id: sizeQty._id || '',
              });
            });
          } else {
            // If no sizeQuantities found (should not happen with updated schema)
            console.warn('Image missing sizeQuantities:', image);
            sizes.push({
              size: 'Default',
              quantity: 0,
              images: image.url,
              imagesId: image._id || '',
              _id: '',
            });
          }

          groups.push({
            color: image.color,
            colorCode: image.colorCode,
            sizes: sizes,
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
          // Add single string
          else {
            const cleanSize = typeof sizeValue === 'string' ? sizeValue : String(sizeValue);
            if (!sizes.includes(cleanSize)) {
              sizes.push(cleanSize);
            }
          }
        });

        initialSizes[index] = sizes;
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
    url: `/products/create-variant/${productId}`,
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
          sizeQuantities: [],
        });
        setImagePreviewUrls([]);

        // Refetch product data to show the new variant
        // setTimeout(() => {
        //   window.location.reload();
        // }, 1000);
      },
      onError: error => {
        console.error('API error:', error);
        toast.error('Có lỗi xảy ra khi thêm biến thể');
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
    { quantity: number; imagesId: string; sizeId: string }
  >({
    url: `/products/update-variants/${productId}`,
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
  const { mutate: deleteVariantMutation } = useMutationRequest<
    unknown,
    { imagesId: string; sizeId: string }
  >({
    url: `/products/delete-variant/${productId}`,
    method: 'patch',
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

  // Thêm mutation hook để gọi API thêm size mới
  const { mutate: addSizeToVariantMutation } = useMutationRequest<
    unknown,
    { imagesId: string; size: string; quantity: number }
  >({
    url: `/products/add-size/${productId}`,
    method: 'post',
    successMessage: 'Thêm kích thước mới thành công',
    errorMessage: 'Thêm kích thước thất bại',
    queryKey: ['product', productId],
    // mutationOptions: {
    //   onSuccess: () => {
    //     // Reload the product data
    //     window.location.reload();
    //   },
    // },
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
  const handleUpdateVariantQuantity = (
    variantId: string | undefined,
    newQuantity: number,
    imagesId: string | undefined,
  ) => {
    if (!variantId || !imagesId) {
      toast.error('Không tìm thấy ID biến thể');
      return;
    }

    updateVariantQuantityMutation({ quantity: newQuantity, sizeId: variantId, imagesId: imagesId });
  };

  const handleUpdateVariantSize = (variantId: string | undefined, newSize: string) => {
    if (!variantId) {
      toast.error('Không tìm thấy ID biến thể');
      return;
    }

    updateVariantSizeMutation({ size: newSize, imagesId: variantId });
  };

  const handleDeleteVariant = (variantId: string | undefined, sizeId: string | undefined) => {
    if (!variantId || !sizeId) {
      toast.error('Không tìm thấy ID biến thể');
      return;
    }

    deleteVariantMutation({ imagesId: variantId, sizeId: sizeId });
  };

  // Add size to sizeQuantities in newVariant
  const addSizeToVariant = (size: string) => {
    // Check if size already exists
    if (!newVariant.sizeQuantities.some(sq => sq.size === size)) {
      setNewVariant(prev => ({
        ...prev,
        sizeQuantities: [...prev.sizeQuantities, { size, quantity: 1 }],
        size: [...prev.size, size],
      }));

      toast.success(`Đã thêm kích thước ${size}`);
    } else {
      toast.warning(`Kích thước ${size} đã tồn tại!`);
    }
  };

  // Remove size from sizeQuantities in newVariant
  const removeSizeFromVariant = (sizeToRemove: string) => {
    setNewVariant(prev => ({
      ...prev,
      sizeQuantities: prev.sizeQuantities.filter(sq => sq.size !== sizeToRemove),
      size: prev.size.filter(s => s !== sizeToRemove),
    }));
  };

  // Update quantity for a specific size in newVariant
  const updateSizeQuantity = (size: string, quantity: number) => {
    setNewVariant(prev => ({
      ...prev,
      sizeQuantities: prev.sizeQuantities.map(sq => (sq.size === size ? { ...sq, quantity } : sq)),
    }));
  };

  // Add new variant
  const addVariant = async () => {
    // Validation checks
    if (!newVariant.color) {
      toast.error('Vui lòng nhập tên màu sắc');
      return;
    }

    if (newVariant.sizeQuantities.length === 0) {
      toast.error('Vui lòng thêm ít nhất một kích thước');
      return;
    }

    if (newVariant.images.length === 0) {
      toast.error('Vui lòng tải lên ít nhất một hình ảnh');
      return;
    }

    try {
      // Create FormData for the variant
      const formData = new FormData();
      formData.append('color', newVariant.color);
      formData.append('colorCode', newVariant.colorCode);

      // Convert sizeQuantities array to JSON string for the API
      // API expects: { size: string, quantity: number }[]
      formData.append('sizeQuantities', JSON.stringify(newVariant.sizeQuantities));

      // Add images
      newVariant.images.forEach(file => {
        formData.append('files', file);
      });

      // Send the data to the server
      addVariantMutation(formData);

      // Reset form after submission
      setNewVariant({
        color: '',
        colorCode: '#000000',
        size: [],
        quantity: 0,
        images: [],
        sizeQuantities: [],
      });
      setImagePreviewUrls([]);

      toast.success('Đang xử lý thêm biến thể, vui lòng đợi...');
    } catch (error) {
      console.error('Error adding variant:', error);
      toast.error('Có lỗi xảy ra khi thêm biến thể');
    }
  };

  // Save changes for the currently active color
  const saveColorSizeChanges = async () => {
    try {
      if (activeColorIndex === null) {
        toast.error('Vui lòng chọn một màu sắc trước');
        return;
      }

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

  const setNewSizeForGroup = (groupIndex: number, size: string) => {
    setNewSizeQuantities(prev => ({
      ...prev,
      [groupIndex]: { ...prev[groupIndex], size },
    }));
  };

  const updateNewSizeQuantity = (groupIndex: number, quantity: number) => {
    setNewSizeQuantities(prev => ({
      ...prev,
      [groupIndex]: { ...prev[groupIndex], quantity },
    }));
  };

  const handleAddSizeToVariant = (group: VariantGroup) => {
    const groupIndex = variants.findIndex(g => g.color === group.color);
    if (groupIndex === -1) return;

    const newSize = newSizeQuantities[groupIndex]?.size;
    const quantity = newSizeQuantities[groupIndex]?.quantity || 0;

    if (!newSize) {
      toast.error('Vui lòng chọn kích thước');
      return;
    }

    // Lấy imagesId từ variant đầu tiên của nhóm màu
    const imagesId = group.sizes[0]?.imagesId;
    if (!imagesId) {
      toast.error('Không tìm thấy ID biến thể');
      return;
    }

    // Gọi API để thêm size
    addSizeToVariantMutation({
      imagesId,
      size: newSize,
      quantity,
    });
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
                            name="slug"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Slug URL</FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input {...field} placeholder="ten-san-pham" />
                                  </FormControl>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      const name = form.getValues('name');
                                      if (name) {
                                        const newSlug = generateSlug(name);
                                        form.setValue('slug', newSlug);
                                      }
                                    }}
                                    className="shrink-0"
                                  >
                                    Tạo lại
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Slug sẽ hiển thị trên URL (VD: /products/ten-san-pham). Slug phải
                                  là duy nhất.
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
                                  <Input type="number" {...field} disabled={true} />
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

                          <FormField
                            control={form.control}
                            name="isDeleted"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Trạng thái</FormLabel>
                                <Select
                                  onValueChange={value => field.onChange(value === 'true')}
                                  defaultValue={field.value ? 'true' : 'false'}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="false">Hiển thị</SelectItem>
                                    <SelectItem value="true">Tạm ẩn</SelectItem>
                                  </SelectContent>
                                </Select>
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

                        <Label htmlFor="size" className="block mb-2">
                          Kích thước
                        </Label>
                        <div className="w-full mb-4">
                          <Select onValueChange={value => addSizeToVariant(value)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Thêm kích thước..." />
                            </SelectTrigger>
                            <SelectContent>
                              {allSizeOptions
                                .filter(
                                  option =>
                                    !newVariant.sizeQuantities.some(sq => sq.size === option.value),
                                )
                                .map(size => (
                                  <SelectItem key={size.value} value={size.value}>
                                    {size.label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Size quantities */}
                        <div className="space-y-2 mb-4">
                          {newVariant.sizeQuantities.length > 0 && (
                            <div className="space-y-2">
                              <Label>Kích thước và số lượng</Label>
                              <div className="grid grid-cols-1 gap-2">
                                {newVariant.sizeQuantities.map((sizeQty, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 border rounded-md"
                                  >
                                    <div className="font-medium flex-grow">{sizeQty.size}</div>
                                    <div className="flex items-center">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6 rounded-r-none"
                                        onClick={() => {
                                          const newQuantity = Math.max(1, sizeQty.quantity - 1);
                                          updateSizeQuantity(sizeQty.size, newQuantity);
                                        }}
                                      >
                                        -
                                      </Button>
                                      <Input
                                        type="number"
                                        min="1"
                                        value={sizeQty.quantity}
                                        onChange={e =>
                                          updateSizeQuantity(
                                            sizeQty.size,
                                            parseInt(e.target.value) || 1,
                                          )
                                        }
                                        className="h-6 w-16 text-center rounded-none border-x-0"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6 rounded-l-none"
                                        onClick={() => {
                                          const newQuantity = sizeQty.quantity + 1;
                                          updateSizeQuantity(sizeQty.size, newQuantity);
                                        }}
                                      >
                                        +
                                      </Button>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => removeSizeFromVariant(sizeQty.size)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
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
                        newVariant.sizeQuantities.length === 0 ||
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
                            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900 mb-4">
                              <h3 className="text-md font-semibold mb-3">Thêm kích thước mới</h3>
                              <div className="flex items-end gap-3">
                                <div className="flex-1">
                                  <Label htmlFor={`new-size-${groupIndex}`} className="mb-2 block">
                                    Kích thước
                                  </Label>
                                  <Select
                                    onValueChange={value => setNewSizeForGroup(groupIndex, value)}
                                  >
                                    <SelectTrigger id={`new-size-${groupIndex}`}>
                                      <SelectValue placeholder="Chọn kích thước..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {allSizeOptions
                                        .filter(
                                          option =>
                                            !group.sizes.some(
                                              s =>
                                                (Array.isArray(s.size) &&
                                                  s.size.includes(option.value)) ||
                                                s.size === option.value,
                                            ),
                                        )
                                        .map(size => (
                                          <SelectItem key={size.value} value={size.value}>
                                            {size.label}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="w-24">
                                  <Label
                                    htmlFor={`new-size-qty-${groupIndex}`}
                                    className="mb-2 block"
                                  >
                                    Số lượng
                                  </Label>
                                  <Input
                                    id={`new-size-qty-${groupIndex}`}
                                    type="number"
                                    min="0"
                                    value={newSizeQuantities[groupIndex]?.quantity || 0}
                                    onChange={e =>
                                      updateNewSizeQuantity(
                                        groupIndex,
                                        parseInt(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <Button
                                  className="mb-0"
                                  onClick={() => handleAddSizeToVariant(group)}
                                  disabled={!newSizeQuantities[groupIndex]?.size}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Thêm
                                </Button>
                              </div>
                            </div>

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
                                          disabled={true}
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
                                            handleUpdateVariantQuantity(
                                              sizeItem._id,
                                              newQuantity,
                                              sizeItem.imagesId,
                                            );
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
                                              sizeItem.imagesId,
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
                                            handleUpdateVariantQuantity(
                                              sizeItem._id,
                                              newQuantity,
                                              sizeItem.imagesId,
                                            );
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
                                        onClick={() =>
                                          handleDeleteVariant(sizeItem.imagesId, sizeItem._id)
                                        }
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
                        {product.discountPercent}
                        <Percent className="mr-1 h-4 w-4" />
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
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Trạng thái</p>
                    <Badge className={product.isDeleted ? 'bg-red-500' : 'bg-green-500'}>
                      {product.isDeleted ? 'Tạm ẩn' : 'Hiển thị'}
                    </Badge>
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
                      <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900 mb-4">
                        <h3 className="text-md font-semibold mb-3">Thêm kích thước mới</h3>
                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <Label htmlFor={`new-size-${groupIndex}`} className="mb-2 block">
                              Kích thước
                            </Label>
                            <Select onValueChange={value => setNewSizeForGroup(groupIndex, value)}>
                              <SelectTrigger id={`new-size-${groupIndex}`}>
                                <SelectValue placeholder="Chọn kích thước..." />
                              </SelectTrigger>
                              <SelectContent>
                                {allSizeOptions
                                  .filter(
                                    option =>
                                      !group.sizes.some(
                                        s =>
                                          (Array.isArray(s.size) &&
                                            s.size.includes(option.value)) ||
                                          s.size === option.value,
                                      ),
                                  )
                                  .map(size => (
                                    <SelectItem key={size.value} value={size.value}>
                                      {size.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-24">
                            <Label htmlFor={`new-size-qty-${groupIndex}`} className="mb-2 block">
                              Số lượng
                            </Label>
                            <Input
                              id={`new-size-qty-${groupIndex}`}
                              type="number"
                              min="0"
                              value={newSizeQuantities[groupIndex]?.quantity || 0}
                              onChange={e =>
                                updateNewSizeQuantity(groupIndex, parseInt(e.target.value) || 0)
                              }
                            />
                          </div>
                          <Button
                            className="mb-0"
                            onClick={() => handleAddSizeToVariant(group)}
                            disabled={!newSizeQuantities[groupIndex]?.size}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm
                          </Button>
                        </div>
                      </div>

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
                                      handleUpdateVariantQuantity(
                                        sizeItem._id,
                                        newQuantity,
                                        sizeItem.imagesId,
                                      );
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
                                        sizeItem.imagesId,
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
                                      handleUpdateVariantQuantity(
                                        sizeItem._id,
                                        newQuantity,
                                        sizeItem.imagesId,
                                      );
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
                                  onClick={() =>
                                    handleDeleteVariant(sizeItem.imagesId, sizeItem._id)
                                  }
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
