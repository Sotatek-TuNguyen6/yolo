'use client';

import { useQueryRequest, useMutationRequest } from '@/hooks/useQuery';
import { EPaymentStatus, Order, PaymentStatus, OrderStatus } from '@/interface/order.interface';
import { CommonResponse } from '@/types/common';
import { LoadingSpinner } from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

type OrderDetailData = CommonResponse<Order>;

export default function OrderEditPage() {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState<{
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
  }>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    paymentStatus: 'pending',
    orderStatus: 'pending',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch order details
  const { data: orderData, isLoading } = useQueryRequest<OrderDetailData>({
    url: `/orders/detail/${id}`,
    queryKey: ['order', id],
  });

  // Update order mutation
  const { mutate: updateOrder } = useMutationRequest<
    Order,
    {
      customerInfo: {
        name: string;
        email: string;
        phone: string;
      };
      shippingAddress: string;
      paymentStatus: PaymentStatus;
      orderStatus: OrderStatus;
    }
  >({
    url: `/orders/${id}`,
    method: 'patch',
    successMessage: 'Cập nhật đơn hàng thành công',
    errorMessage: 'Cập nhật đơn hàng thất bại',
    queryKey: ['order', id],
    mutationOptions: {
      onSuccess: () => {
        setIsSubmitting(false);
        router.push(`/dashboard/orders/${id}`);
      },
      onError: () => {
        setIsSubmitting(false);
      },
    },
  });

  useEffect(() => {
    if (orderData?.data) {
      const order = orderData.data;
      setFormData({
        customerName: order.customerInfo?.name || '',
        customerEmail: order.customerInfo?.email || '',
        customerPhone: order.customerInfo?.phone || '',
        shippingAddress: order.shippingAddress || '',
        paymentStatus: order.paymentStatus || 'pending',
        orderStatus: order.orderStatus || 'pending',
      });
    }
  }, [orderData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updateData = {
      customerInfo: {
        name: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
      },
      shippingAddress: formData.shippingAddress,
      paymentStatus: formData.paymentStatus,
      orderStatus: formData.orderStatus,
    };

    updateOrder(updateData);
  };

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
          <h1 className="text-2xl font-bold">Chỉnh sửa đơn hàng {displayOrderNumber}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Thông tin cơ bản đơn hàng */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đơn hàng</CardTitle>
              <CardDescription>Chỉnh sửa thông tin cơ bản</CardDescription>
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

              <div>
                <Label htmlFor="paymentStatus">Trạng thái thanh toán</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={value => handleSelectChange('paymentStatus', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full mt-1">
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

              <div>
                <Label htmlFor="orderStatus">Trạng thái đơn hàng</Label>
                <Select
                  value={formData.orderStatus}
                  onValueChange={value => handleSelectChange('orderStatus', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full mt-1">
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
            </CardContent>
          </Card>

          {/* Thông tin khách hàng */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
              <CardDescription>Chỉnh sửa thông tin liên hệ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Tên khách hàng</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Số điện thoại</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="shippingAddress">Địa chỉ giao hàng</Label>
                <Textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Danh sách sản phẩm</CardTitle>
            <CardDescription>Sản phẩm trong đơn hàng (chỉ xem)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Danh sách sản phẩm trong đơn hàng</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">STT</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Kích thước</TableHead>
                  <TableHead>Màu sắc</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-center">Số lượng</TableHead>
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

                  return (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <span className="font-medium">{productName}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {detail.size || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {typeof detail.product !== 'string' &&
                          detail.product.images &&
                          detail.product.images[0] && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{ backgroundColor: detail.product.images[0].colorCode }}
                            >
                              {detail.product.images[0].color}
                            </Badge>
                          )}
                      </TableCell>
                      <TableCell className="text-right">
                        {detail.price.toLocaleString('vi-VN')} VND
                      </TableCell>
                      <TableCell className="text-center">{detail.quantity}</TableCell>
                      <TableCell className="text-right">
                        {(detail.price * detail.quantity).toLocaleString('vi-VN')} VND
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
                <span className="font-medium">{order.totalPrice.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="font-medium">0 VND</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng thanh toán:</span>
                <span>{order.totalPrice.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => router.back()} type="button">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>Đang lưu...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
