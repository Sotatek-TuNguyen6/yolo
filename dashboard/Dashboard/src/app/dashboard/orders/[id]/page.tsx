'use client';

import { useQueryRequest, useMutationRequest } from '@/hooks/useQuery';
import { EPaymentStatus, Order, PaymentStatus, OrderStatus } from '@/interface/order.interface';
import { CommonResponse } from '@/types/common';
import { LoadingSpinner } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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

type OrderDetailData = CommonResponse<Order>;

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

function getPaymentStatusColor(status: PaymentStatus) {
  switch (status) {
    case EPaymentStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
    case 'paid':
      return 'bg-green-100 text-green-800 hover:bg-green-100/80';
    case EPaymentStatus.FAILED:
      return 'bg-red-100 text-red-800 hover:bg-red-100/80';
    case EPaymentStatus.REFUNDED:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
  }
}

function getPaymentStatusBadge(status: PaymentStatus) {
  switch (status) {
    case EPaymentStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
    case EPaymentStatus.PAID:
      return 'bg-green-100 text-green-800 hover:bg-green-100/80';
    case EPaymentStatus.FAILED:
      return 'bg-red-100 text-red-800 hover:bg-red-100/80';
  }
}

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isUpdatingOrderStatus, setIsUpdatingOrderStatus] = useState(false);

  // Fetch order details
  const { data: orderData, isLoading } = useQueryRequest<OrderDetailData>({
    url: `/orders/detail/${id}`,
    queryKey: ['order', id],
  });
  // Update payment status mutation
  const { mutate: updatePaymentStatus } = useMutationRequest<
    Order,
    { paymentStatus: PaymentStatus }
  >({
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
  // Add order status mutation
  const { mutate: updateOrderStatus } = useMutationRequest<Order, { orderStatus: OrderStatus }>({
    url: `/orders/${id}/order-status`,
    method: 'patch',
    successMessage: 'Cập nhật trạng thái đơn hàng thành công',
    errorMessage: 'Cập nhật trạng thái đơn hàng thất bại',
    queryKey: ['order', id],
    mutationOptions: {
      onSuccess: () => {
        setIsUpdatingOrderStatus(false);
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

  const order = orderData?.data;

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

  const statusText = {
    pending: 'Đang chờ xử lý',
    processing: 'Đang xử lý',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền',
    paid: 'Đã thanh toán',
    failed: 'Thất bại',
  };

  const methodText = {
    CASH_ON_DELIVERY: 'Tiền mặt khi nhận hàng',
    BANK_TRANSFER: 'Chuyển khoản',
  };

  // Generate order number if not available
  const displayOrderNumber = order.orderId || `#${order._id?.substring(0, 8)}`;

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
          {order.orderStatus && (
            <Badge className={getOrderStatusColor(order.orderStatus)} variant="outline">
              {statusText[order.orderStatus]}
            </Badge>
          )}
          <Badge
            className={getPaymentStatusColor(order.paymentStatus as PaymentStatus)}
            variant="outline"
          >
            {statusText[order.paymentStatus as PaymentStatus]}
          </Badge>
          <Badge
            className={getPaymentStatusBadge(order.paymentStatus as PaymentStatus)}
            variant="outline"
          >
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
                  {order.orderDate &&
                    format(new Date(order.orderDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm">Phương thức thanh toán</h3>
                <p>{methodText[order.paymentType]}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm">Trạng thái thanh toán</h3>
                <div className="mt-1">
                  <Select
                    defaultValue={order.paymentStatus}
                    onValueChange={value => {
                      setIsUpdatingPayment(true);
                      updatePaymentStatus({
                        paymentStatus: value as PaymentStatus,
                      });
                    }}
                    disabled={isUpdatingPayment}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trạng thái thanh toán" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EPaymentStatus.PENDING}>Đang chờ thanh toán</SelectItem>
                      <SelectItem value={EPaymentStatus.PAID}>Đã thanh toán</SelectItem>
                      <SelectItem value={EPaymentStatus.FAILED}>Thanh toán thất bại</SelectItem>
                      <SelectItem value={EPaymentStatus.REFUNDED}>Đã hoàn tiền</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm">Trạng thái đơn hàng</h3>
                <div className="mt-1">
                  <Select
                    defaultValue={order.orderStatus || 'pending'}
                    onValueChange={value => {
                      setIsUpdatingOrderStatus(true);
                      updateOrderStatus({
                        orderStatus: value as OrderStatus,
                      });
                    }}
                    disabled={isUpdatingOrderStatus}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trạng thái đơn hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Đang chờ xử lý</SelectItem>
                      <SelectItem value="processing">Đang xử lý</SelectItem>
                      <SelectItem value="shipping">Đang giao hàng</SelectItem>
                      <SelectItem value="delivered">Đã giao hàng</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                      <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm">Ghi chú đơn hàng</h3>
                <p className="text-wrap">{'Không có ghi chú'}</p>
              </div>
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
              <p>{order.customerInfo?.name}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm">Email</h3>
              <p>{order.customerInfo?.email}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm">Số điện thoại</h3>
              <p>{order.customerInfo?.phone}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm">Địa chỉ giao hàng</h3>
              <p className="text-wrap">
                {order.shippingAddress}
                {order.township && `, ${order.township}`}
                {order.city && `, ${order.city}`}
                {order.state && `, ${order.state}`}
              </p>
            </div>
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
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[300px]">Sản phẩm</TableHead>
                <TableHead>Kích thước</TableHead>
                <TableHead>Màu sắc</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
                <TableHead className="text-center">Số lượng</TableHead>
                <TableHead className="text-center">Giảm giá</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.orderDetails.map((detail, index) => {
                // Get product info
                const productName =
                  typeof detail.product === 'string'
                    ? 'Sản phẩm không xác định'
                    : detail.product.name;

                const productImage =
                  typeof detail.product === 'string' ? '' : detail.product.images[0].url[0];

                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-mono text-xs"
                        onClick={() =>
                          router.push(`/dashboard/product/${detail?.product.productId}`)
                        }
                      >
                        {detail?.product.productId}
                      </Button>
                    </TableCell>
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
                      <Badge variant="outline" className="text-xs">
                        {detail.size}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ backgroundColor: detail.product.images[0].colorCode }}
                      >
                        {detail.product.images[0].color}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {detail.price.toLocaleString('vi-VN')} VND
                    </TableCell>
                    <TableCell className="text-center">{detail.quantity}</TableCell>
                    <TableCell className="text-center">{detail.discountPercent}%</TableCell>
                    <TableCell className="text-right">
                      {(
                        detail.price * detail.quantity -
                        (detail.price * detail.quantity * (detail?.discountPercent || 0)) / 100
                      ).toLocaleString('vi-VN')}{' '}
                      VND
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
              <span className="font-medium">
                {(order.totalPrice - (order.deliveryType === 'SHIP' ? 25000 : 0)).toLocaleString(
                  'vi-VN',
                )}{' '}
                VND
              </span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span className="font-medium">
                {order.deliveryType === 'SHIP' ? '25.000 VND' : '0 VND'}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng thanh toán:</span>
              <span>{order.totalPrice.toLocaleString('vi-VN')} VND</span>
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
