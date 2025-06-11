'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Product } from '@/interface/product.interface';
import { DataTableColumnHeader } from '../tasks/components/data-table-column-header';
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
import { useState } from 'react';
import { Edit, Eye, Trash, AlertTriangle, ChevronDown } from 'lucide-react';
import { Row } from '@tanstack/react-table';
import React from 'react';
import { useMutationRequest } from '@/hooks/useQuery';
import { Category } from '@/types/category';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Image as ImageType } from '@/interface/image.interface';
// Define ProductImage interface to match the schema
// interface ProductImage {
//   _id?: string;
//   url: string[];
//   color: string;
//   colorCode: string;
//   quantity: number;
//   size: string[];
// }

// Action cell component to avoid useState in cell function
function ActionCell({ row }: { row: Row<Product> }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

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

  const navigateToDetailPage = () => {
    router.push(`/dashboard/product/${row.original.productId}`);
  };

  const navigateToEditPage = () => {
    router.push(`/dashboard/product/${row.original.productId}?edit=true`);
  };

  return (
    <>
      <DataTableRowActions
        row={row}
        actions={[
          {
            label: 'Xem chi tiết',
            onClick: navigateToDetailPage,
            icon: <Eye className="h-4 w-4" />,
          },
          {
            label: 'Chỉnh sửa',
            onClick: navigateToEditPage,
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

// Image cell component to properly use React hooks
// function ImageCell({ product }: { product: Product }) {

//   // Get the first image from the images array
//   let imageUrl = '/placeholder-image.jpg';

//   if (product.images && product.images.length > 0 && product.images[0].url && product.images[0].url.length > 0) {
//     imageUrl = product.images[0].url[0];
//   }

//   return (
//     <div className="flex flex-col space-y-2">
//       <div className="flex space-x-2">
//         <Dialog>
//           <DialogTrigger>
//             <Image
//               src={imageUrl}
//               alt="Product Image"
//               width={100}
//               height={100}
//               className="cursor-pointer object-cover rounded"
//             />
//           </DialogTrigger>
//           <DialogContent className="max-w-3xl p-0">
//             <Image
//               src={imageUrl}
//               alt="Product Image"
//               width={800}
//               height={600}
//               className="w-full h-auto"
//             />
//           </DialogContent>
//         </Dialog>
//       </div>

//     </div>
//   );
// }

export const columns: ColumnDef<Product>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-8 w-8"
          onClick={() => row.toggleExpanded()}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${row.getIsExpanded() ? 'rotate-180' : ''}`}
          />
        </Button>
      );
    },
  },
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
      return (
        <Link
          href={`/dashboard/product/${productId}`}
          className="w-[80px] hover:underline text-blue-500"
        >
          {productId ?? ''}
        </Link>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   accessorKey: 'images',
  //   header: ({ column }) => <DataTableColumnHeader column={column} title="Ảnh" />,
  //   cell: ({ row }) => <ImageCell product={row.original} />,
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sản phẩm" />,
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[200px] truncate font-medium cursor-default" title={name}>
            {name}
          </span>
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
          {category && typeof category === 'object' && (
            <Link href={`/dashboard/category/${category._id}`} className="hover:underline">
              <span className="max-w-[150px] truncate font-medium">{category.name}</span>
            </Link>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Mô tả" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[250px] truncate font-medium">{row.getValue('description')}</span>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Giá" />,
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
    accessorKey: 'discountPercent',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Giảm giá" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue('discountPercent')}%
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Số lượng" />,
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">{stock ?? 0}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'isDeleted',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => {
      const isDeleted = row.getValue('isDeleted') as boolean;
      return (
        <Badge className={isDeleted ? 'bg-red-500' : 'bg-green-500'}>
          {isDeleted ? 'Tạm ẩn' : 'Hiển thị'}
        </Badge>
      );
    },
  },
  {
    id: 'Hành động',
    cell: ({ row }) => <ActionCell row={row} />,
  },
];

// Create a component for the expanded content
export function ProductImagesExpanded({ product }: { product: Product }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
      <h3 className="font-medium text-sm mb-3">Chi tiết sản phẩm</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {product.images && product.images.length > 0 ? (
          product.images.map((imageObj: ImageType, idx: number) => (
            <div
              key={`${imageObj._id || idx}`}
              className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm"
            >
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge
                  className="mr-1"
                  style={{
                    backgroundColor: imageObj.colorCode || '#ccc',
                    color: '#fff',
                  }}
                >
                  {imageObj.color || 'Không có màu'}
                </Badge>

                <Badge variant="outline" className="mr-1">
                  Size: {imageObj.sizeQuantities.map(sq => sq.size).join(', ') || 'N/A'}
                </Badge>

                <Badge variant="secondary">
                  SL: {imageObj.sizeQuantities.map(sq => sq.quantity).join(', ') || 0}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {imageObj.url?.map((url: string, urlIdx: number) => (
                  <Dialog key={urlIdx}>
                    <DialogTrigger>
                      <div className="relative w-[80px] h-[80px] cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                        <Image
                          src={url}
                          alt={`${product.name} - ${urlIdx}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-0">
                      <div className="relative">
                        <Image
                          src={url}
                          alt={`${product.name} - ${urlIdx}`}
                          width={800}
                          height={600}
                          className="w-full h-auto"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              className="mr-2"
                              style={{
                                backgroundColor: imageObj.colorCode || '#ccc',
                                color: '#fff',
                              }}
                            >
                              {imageObj.color || 'Không có màu'}
                            </Badge>
                            <Badge variant="outline" className="bg-white/20">
                              Size: {imageObj.sizeQuantities.map(sq => sq.size).join(', ') || 'N/A'}
                            </Badge>
                            <Badge variant="secondary">
                              SL: {imageObj.sizeQuantities.map(sq => sq.quantity).join(', ') || 0}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-4 text-gray-500">
            Không có hình ảnh cho sản phẩm này
          </div>
        )}
      </div>
    </div>
  );
}
