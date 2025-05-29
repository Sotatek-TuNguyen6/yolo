'use client';

import { useQueryRequest } from '@/hooks/useQuery';
import { Category, SubCategory } from '@/types/category';
import { CommonResponse } from '@/types/common';
import { LoadingSpinner } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pencil } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

type CategoryDetailData = CommonResponse<{
  category: Category;
}>;

type SubCategoryListData = CommonResponse<{
  subCategories: SubCategory[];
}>;

export default function CategoryDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  // Fetch category details
  const { data: categoryData, isLoading: isLoadingCategory } = useQueryRequest<CategoryDetailData>({
    url: `/categories/${id}`,
    queryKey: ['category', id],
  });

  // Fetch subcategories of this category
  const { data: subCategoriesData, isLoading: isLoadingSubCategories } =
    useQueryRequest<SubCategoryListData>({
      url: `/sub-categories/by-category/${id}`,
      queryKey: ['subCategories', id],
    });

  const category = categoryData?.data?.category;
  const subCategories = subCategoriesData?.data?.subCategories || [];

  const isLoading = isLoadingCategory || isLoadingSubCategories;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h2 className="text-2xl font-bold">Không tìm thấy danh mục</h2>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">{category.name}</h1>
        </div>

        <Link href={`/dashboard/category/edit/${id}`} passHref>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Hình ảnh</CardTitle>
          </CardHeader>
          <CardContent>
            {category.imageUrl ? (
              <div className="rounded-md overflow-hidden">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  width={400}
                  height={300}
                  className="w-full object-cover"
                />
              </div>
            ) : (
              <div className="bg-muted h-40 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Không có hình ảnh</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin danh mục</CardTitle>
            <CardDescription>Chi tiết về danh mục {category.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm">Tên danh mục</h3>
              <p>{category.name}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm">Slug</h3>
              <p>{category.slug}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm">Mô tả</h3>
              <p className="text-wrap">{category.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm">Ngày tạo</h3>
                <p>{format(new Date(category.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm">Cập nhật lần cuối</h3>
                <p>{format(new Date(category.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div>
        <h2 className="text-xl font-bold mb-4">Danh mục con thuộc {category.name}</h2>

        {subCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subCategories.map(subCategory => (
              <Link
                href={`/dashboard/sub-category/${subCategory._id}`}
                key={subCategory._id}
                passHref
              >
                <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{subCategory.name}</CardTitle>
                    <CardDescription className="text-xs truncate">
                      {subCategory.slug}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center gap-2">
                      {subCategory.imageUrl && (
                        <Image
                          src={subCategory.imageUrl}
                          alt={subCategory.name}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                        />
                      )}
                      <p className="text-sm line-clamp-2">{subCategory.description}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      Cập nhật:{' '}
                      {format(new Date(subCategory.updatedAt), 'dd/MM/yyyy', { locale: vi })}
                    </p>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-muted rounded-md p-8 text-center">
            <p className="text-muted-foreground">Không có danh mục con nào thuộc danh mục này</p>
            <Link href="/dashboard/sub-category" passHref>
              <Button variant="link">Thêm danh mục con</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
