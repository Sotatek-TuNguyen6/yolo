'use client';

import { useQueryRequest } from '@/hooks/useQuery';
import { Product } from '@/interface/product.interface';
import { DataTable } from '../tasks/components/data-table';
import { columns, ProductImagesExpanded } from './columns';
import { CommonResponse } from '@/types/common';
import { LoadingSpinner } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { PlusCircle, CheckCircle2, XCircle } from 'lucide-react';
import { FilterConfig } from '../tasks/components/data-table-toolbar';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/date';
import { ExportButton } from '@/components/export-button';

// Updated type definition to match the new API response structure
type ProductListData = CommonResponse<Product[]>;

export default function ProductPage() {
  const router = useRouter();

  // Product list data
  const { data: products, isLoading } = useQueryRequest<ProductListData>({
    url: '/products/get-all-product/byAdmin',
    queryKey: ['products'],
  });

  // Define filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      column: 'stock',
      title: 'Tình trạng kho',
      options: [
        {
          label: 'Còn hàng',
          value: true,
          icon: CheckCircle2,
        },
        {
          label: 'Hết hàng',
          value: false,
          icon: XCircle,
        },
      ],
    },
  ];

  // Define column mapping for Excel export
  const columnMapping = {
    name: 'Tên sản phẩm',
    price: 'Giá',
    description: 'Mô tả',
    quantity: 'Số lượng',
    stock: 'Tình trạng kho',
    categories: 'Danh mục',
    createdAt: 'Ngày tạo',
    updatedAt: 'Ngày cập nhật'
  };

  // Define formatters for specific fields
  const formatters = {
    price: (value: unknown) => {
      if (typeof value === 'number') {
        return `${value.toLocaleString('vi-VN')} VND`;
      }
      return value as string;
    },
    stock: (value: unknown) => {
      return value === true ? 'Còn hàng' : 'Hết hàng';
    },
    categories: (value: unknown) => {
      if (Array.isArray(value)) {
        return value.map((cat: { name: string }) => cat.name).join(', ');
      }
      return '';
    },
    createdAt: (value: unknown) => {
      if (typeof value === 'string') {
        return formatDate(new Date(value));
      }
      return value as string;
    },
    updatedAt: (value: unknown) => {
      if (typeof value === 'string') {
        return formatDate(new Date(value));
      }
      return value as string;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Sản phẩm</h2>
        <div className="flex gap-2">
          {products?.data && (
            <ExportButton
              data={products.data as unknown as Record<string, unknown>[]}
              columnMapping={columnMapping}
              formatters={formatters}
              fileName={`products-report-${new Date().toISOString().split('T')[0]}`}
              sheetName="Sản phẩm"
              allowedRoles={['admin', 'staff']}
            />
          )}
          <Button onClick={() => router.push('/dashboard/product/add')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-md">
          <LoadingSpinner />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products?.data || []}
          filterConfigs={filterConfigs}
          searchColumn="name"
          searchPlaceholder="Tìm kiếm theo tên sản phẩm..."
          renderSubComponent={({ row }) => <ProductImagesExpanded product={row.original} />}
        />
      )}
    </div>
  );
}
