'use client';

import { useQueryRequest } from '@/hooks/useQuery';
import { SubCategory } from '@/types/category';
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

type SubCategoryDetailData = CommonResponse<{
  subCategory: SubCategory;
}>;

export default function SubCategoryDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  // Fetch subcategory details
  const { data: subCategoryData, isLoading } = useQueryRequest<SubCategoryDetailData>({
    url: `/sub-categories/${id}`,
    queryKey: ['subCategory', id],
  });

  const subCategory = subCategoryData?.data?.subCategory;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!subCategory) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h2 className="text-2xl font-bold">Không tìm thấy danh mục con</h2>
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
          <h1 className="text-2xl font-bold">{subCategory.name}</h1>
        </div>

        <Link href={`/dashboard/sub-category/edit/${id}`} passHref>
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
            {subCategory.imageUrl ? (
              <div className="rounded-md overflow-hidden">
                <Image
                  src={subCategory.imageUrl}
                  alt={subCategory.name}
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
            <CardTitle>Thông tin danh mục con</CardTitle>
            <CardDescription>Chi tiết về danh mục con {subCategory.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm">Tên danh mục con</h3>
              <p>{subCategory.name}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm">Slug</h3>
              <p>{subCategory.slug}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm">Danh mục cha</h3>
              <div className="space-y-1">
                {Array.isArray(subCategory.categoryParents) ? (
                  subCategory.categoryParents.map((category, index) => (
                    <div key={index}>
                      <Link
                        href={`/dashboard/category/${typeof category === 'string' ? category : category._id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {typeof category === 'string' ? 'Xem danh mục cha' : category.name}
                      </Link>
                    </div>
                  ))
                ) : (
                  <Link
                    href={`/dashboard/category/${
                      typeof subCategory.categoryParents === 'string'
                        ? subCategory.categoryParents
                        : subCategory.categoryParents?._id
                    }`}
                    className="text-blue-500 hover:underline"
                  >
                    {typeof subCategory.categoryParents === 'string'
                      ? 'Xem danh mục cha'
                      : subCategory.categoryParents?.name}
                  </Link>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm">Mô tả</h3>
              <p className="text-wrap">{subCategory.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm">Ngày tạo</h3>
                <p>{format(new Date(subCategory.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm">Cập nhật lần cuối</h3>
                <p>{format(new Date(subCategory.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Hành động</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
          <CardHeader>
            <CardTitle>Quay lại danh sách</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Xem tất cả danh mục con trong hệ thống</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/sub-category" passHref>
              <Button variant="outline">Xem danh sách</Button>
            </Link>
          </CardFooter>
        </Card>

        {Array.isArray(subCategory.categoryParents) && subCategory.categoryParents.length > 0 ? (
          <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle>Danh mục cha</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Xem thông tin chi tiết về danh mục cha</p>
            </CardContent>
            <CardFooter>
              <Link
                href={`/dashboard/category/${
                  typeof subCategory.categoryParents[0] === 'string'
                    ? subCategory.categoryParents[0]
                    : subCategory.categoryParents[0]._id
                }`}
                passHref
              >
                <Button variant="outline">Xem danh mục cha</Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          typeof subCategory.categoryParents === 'object' &&
          subCategory.categoryParents?._id && (
            <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle>Danh mục cha</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Xem thông tin chi tiết về danh mục cha</p>
              </CardContent>
              <CardFooter>
                <Link href={`/dashboard/category/${subCategory.categoryParents._id}`} passHref>
                  <Button variant="outline">Xem danh mục cha</Button>
                </Link>
              </CardFooter>
            </Card>
          )
        )}

        <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
          <CardHeader>
            <CardTitle>Chỉnh sửa</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Chỉnh sửa thông tin danh mục con này</p>
          </CardContent>
          <CardFooter>
            <Link href={`/dashboard/sub-category/edit/${id}`} passHref>
              <Button>Chỉnh sửa</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
