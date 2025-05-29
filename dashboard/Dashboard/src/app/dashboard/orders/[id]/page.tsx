'use client';

import { useQueryRequest, useMutationRequest } from '@/hooks/useQuery';
import { Order, OrderStatus } from '@/interface/order.interface';
import { CommonResponse } from '@/types/common';
import { LoadingSpinner } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Truck,
  Ban,
  RotateCcw,
  CheckCircle2,
  ClipboardList,
  Loader2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

type OrderDetailData = CommonResponse<{
  order: Order;
}>;

function getOrderStatusColor(status: OrderStatus) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
    case 'processing':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80';
    case 'shipping':
      return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100/80';
    case 'delivered':
      return 'bg-green-100 text-green-800 hover:bg-green-100/80';
    case 'cancelled':
      return 'bg-red-100 text-red-800 hover:bg-red-100/80';
    case 'refunded':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
  }
}

function getPaymentStatusBadge(isPayment: boolean) {
  return isPayment
    ? 'bg-green-100 text-green-800 hover:bg-green-100/80'
    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
}

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  // Fetch order details
  const { data: orderData, isLoading } = useQueryRequest<OrderDetailData>({
    url: `/orders/${id}`,
    queryKey: ['order', id],
  });

  // Update order status mutation
  const { mutate: updateOrderStatus } = useMutationRequest<Order, { status: OrderStatus }>({
    url: `/orders/${id}/status`,
    method: 'patch',
    successMessage: 'Cập nhật trạng thái đơn hàng thành công',
    errorMessage: 'Cập nhật trạng thái đơn hàng thất bại',
    queryKey: ['order', id],
    mutationOptions: {
      onSuccess: () => {
        setIsUpdatingStatus(false);
      },
    },
  });

  // Update payment status mutation
  const { mutate: updatePaymentStatus } = useMutationRequest<Order, { isPayment: boolean }>({
    url: `/orders/${id}/payment-status`,
    method: 'patch',
    successMessage: 'Cập nhật trạng thái thanh toán thành công',
    errorMessage: 'Cập nhật trạng thái thanh toán thất bại',
    queryKey: ['order', id],
    mutationOptions: {
      onSuccess: () => {
        setIsUpdatingPayment(false);
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  const order = orderData?.data?.order;

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h2 className="text-2xl font-bold">Không tìm thấy đơn hàng</h2>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }

  const orderStatusOptions = [
    { value: 'pending', label: 'Đang chờ xử lý', icon: <ClipboardList className="h-4 w-4 mr-2" /> },
    { value: 'processing', label: 'Đang xử lý', icon: <Loader2 className="h-4 w-4 mr-2" /> },
    { value: 'shipping', label: 'Đang giao hàng', icon: <Truck className="h-4 w-4 mr-2" /> },
    { value: 'delivered', label: 'Đã giao hàng', icon: <CheckCircle2 className="h-4 w-4 mr-2" /> },
    { value: 'cancelled', label: 'Đã hủy', icon: <Ban className="h-4 w-4 mr-2" /> },
    { value: 'refunded', label: 'Đã hoàn tiền', icon: <RotateCcw className="h-4 w-4 mr-2" /> },
  ];

  const handleOrderStatusChange = (value: string) => {
    setIsUpdatingStatus(true);
    updateOrderStatus({ status: value as OrderStatus });
  };

  const statusText = {
    pending: 'Đang chờ xử lý',
    processing: 'Đang xử lý',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền',
  };

  const methodText = {
    cash: 'Tiền mặt khi nhận hàng',
    bank_transfer: 'Chuyển khoản',
    credit_card: 'Thẻ tín dụng',
    momo: 'Ví MoMo',
    zalopay: 'ZaloPay',
  };

  // Generate order number if not available
  const displayOrderNumber = order.orderNumber || `#${order._id?.substring(0, 8)}`;

  return (
    <div className="container mx-auto py-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng {displayOrderNumber}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={getOrderStatusColor(order.status)} variant="outline">
            {statusText[order.status]}
          </Badge>
          <Badge className={getPaymentStatusBadge(order.isPayment)} variant="outline">
            {order.isPayment ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thông tin cơ bản đơn hàng */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin đơn hàng</CardTitle>
            <CardDescription>Chi tiết về đơn hàng {displayOrderNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm">Mã đơn hàng</h3>
                <p>{displayOrderNumber}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm">Ngày đặt hàng</h3>
                <p>
                  {order.createdAt &&
                    format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm">Phương thức thanh toán</h3>
                <p>{methodText[order.paymentMethod]}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm">Trạng thái thanh toán</h3>
                <div className="mt-1">
                  <Select
                    defaultValue={order.isPayment ? 'true' : 'false'}
                    onValueChange={value => {
                      setIsUpdatingPayment(true);
                      updatePaymentStatus({
                        isPayment: value === 'true',
                      });
                    }}
                    disabled={isUpdatingPayment}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trạng thái thanh toán" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Chưa thanh toán</SelectItem>
                      <SelectItem value="true">Đã thanh toán</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm">Trạng thái đơn hàng</h3>
              <div className="mt-1">
                <Select
                  defaultValue={order.status}
                  onValueChange={handleOrderStatusChange}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái đơn hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm">Ghi chú đơn hàng</h3>
              <p className="text-wrap">{order.noteAddress || 'Không có ghi chú'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin khách hàng */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm">Khách hàng</h3>
              <p>{order.fullName}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm">Email</h3>
              <p>{order.emailAddress}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm">Số điện thoại</h3>
              <p>{order.phoneNumber}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm">Địa chỉ giao hàng</h3>
              <p className="text-wrap">
                {order.address.street}, {order.address.ward.name}, {order.address.district.name},{' '}
                {order.address.province.name}
              </p>
            </div>

            {order.noteAddress && (
              <div>
                <h3 className="font-medium text-sm">Ghi chú giao hàng</h3>
                <p className="text-wrap">{order.noteAddress}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Danh sách sản phẩm trong đơn hàng</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">STT</TableHead>
                <TableHead className="w-[300px]">Sản phẩm</TableHead>
                <TableHead>Kích thước</TableHead>
                <TableHead>Màu sắc</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
                <TableHead className="text-center">Số lượng</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, index) => {
                console.log(item);
                // Xử lý product, color, size dựa trên định dạng
                const productName =
                  typeof item.product === 'string' ? 'Sản phẩm không xác định' : item.product.name;

                const productImage =
                  typeof item.product === 'string' ? '' : item.product.featuredImage;

                // Xử lý sizes - có thể là mảng hoặc đối tượng đơn lẻ
                let sizeNames = [];
                if (Array.isArray(item.size)) {
                  sizeNames = item.size.map(s => (typeof s === 'string' ? s : s?.name || 'N/A'));
                } else {
                  const sizeName =
                    typeof item.size === 'string' ? item.size : item.size?.name || 'N/A';
                  sizeNames = [sizeName];
                }

                // Xử lý colors - có thể là mảng hoặc đối tượng đơn lẻ
                let colorNames = [];
                if (Array.isArray(item.color)) {
                  colorNames = item.color.map(c => (typeof c === 'string' ? c : c?.name || 'N/A'));
                } else {
                  const colorName =
                    typeof item.color === 'string' ? item.color : item.color?.name || 'N/A';
                  colorNames = [colorName];
                }

                // Tính toán số lượng và giá
                const quantity = item.quantity || item.quantities || 0;
                const price = item.product.price || 0;
                const totalPrice = item.totalPrice || price * quantity;

                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {productImage && (
                          <Image
                            src={productImage}
                            alt={productName}
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                          />
                        )}
                        <span className="font-medium">{productName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {sizeNames.map((name, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {colorNames.map((name, idx) => {
                          // Nếu có giá trị màu, hiển thị màu sắc
                          const colorValue =
                            typeof item.color === 'object' &&
                            !Array.isArray(item.color) &&
                            item.color?.value;
                          const colorStyle = colorValue
                            ? { backgroundColor: colorValue, color: '#fff' }
                            : {};

                          return (
                            <Badge
                              key={idx}
                              variant="outline"
                              style={colorStyle}
                              className="text-xs"
                            >
                              {name}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {price.toLocaleString('vi-VN')} VND
                    </TableCell>
                    <TableCell className="text-center">{quantity}</TableCell>
                    <TableCell className="text-right">
                      {totalPrice.toLocaleString('vi-VN')} VND
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-col items-end">
          <div className="space-y-2 w-[300px]">
            <div className="flex justify-between">
              <span>Tổng tiền hàng:</span>
              <span className="font-medium">{order.subTotal.toLocaleString('vi-VN')} VND</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span className="font-medium">{order.shippingFee.toLocaleString('vi-VN')} VND</span>
            </div>
            {order.discount && order.discount > 0 && (
              <div className="flex justify-between">
                <span>Giảm giá:</span>
                <span className="font-medium text-red-500">
                  -{order.discount.toLocaleString('vi-VN')} VND
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng thanh toán:</span>
              <span>{(order.total || order.grandTotal || 0).toLocaleString('vi-VN')} VND</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
        <Button onClick={() => window.print()}>In đơn hàng</Button>
      </div>
    </div>
  );
}
