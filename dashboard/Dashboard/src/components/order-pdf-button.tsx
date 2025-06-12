'use client';

import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { exportOrderToPdf } from '@/utils/pdfExport';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { formatDate } from '@/utils/date';

interface OrderPdfButtonProps {
  order: Record<string, unknown>;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonText?: string;
  className?: string;
}

interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
}

interface OrderDetail {
  product?: {
    name?: string;
    productId?: string;
    images?: Array<{
      url?: string[];
      color?: string;
      colorCode?: string;
    }>;
  };
  productName?: string;
  size?: string;
  quantity?: number;
  price?: number;
  discountPercent?: number;
}

export function OrderPdfButton({
  order,
  variant = 'outline',
  buttonText = 'Xuất PDF',
  className = ''
}: OrderPdfButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleExport = () => {
    try {
      exportOrderToPdf(order);
    } catch (error) {
      console.error('Error exporting order to PDF:', error);
      alert('Có lỗi xảy ra khi xuất PDF. Vui lòng thử lại sau.');
    }
  };

  const formatPrice = (price: number): string => {
    return `${price?.toLocaleString('vi-VN')} VND`;
  };

  const formatPaymentType = (type: string): string => {
    switch (type) {
      case 'CASH_ON_DELIVERY': return 'Thanh toán khi nhận hàng';
      case 'BANK_TRANSFER': return 'Chuyển khoản ngân hàng';
      default: return type || '';
    }
  };

  const formatPaymentStatus = (status: string): string => {
    switch (status) {
      case 'pending': return 'Chờ thanh toán';
      case 'paid': return 'Đã thanh toán';
      case 'failed': return 'Thanh toán thất bại';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status || '';
    }
  };

  const formatOrderStatus = (status: string): string => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipping': return 'Đang gửi hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status || '';
    }
  };

  const customerInfo = order.customerInfo as CustomerInfo | undefined;
  const orderDetails = order.orderDetails as OrderDetail[] | undefined || [];

  return (
    <>
      <Button variant={variant} onClick={() => setDialogOpen(true)} className={className}>
        <FileText className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Xem trước hóa đơn</DialogTitle>
            <DialogDescription>
              Xem trước hóa đơn trước khi xuất PDF
            </DialogDescription>
          </DialogHeader>
          
          <div id="order-preview" className="p-4 bg-white">
            <h1 className="text-2xl font-bold text-center">CHI TIẾT ĐƠN HÀNG</h1>
            
            <div className="mt-4">
              <p><strong>Mã đơn hàng:</strong> {order.orderId as string || ''}</p>
              <p><strong>Ngày đặt hàng:</strong> {order.orderDate ? formatDate(new Date(order.orderDate as string)) : ''}</p>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-bold">THÔNG TIN KHÁCH HÀNG</h2>
              {customerInfo && (
                <div className="mt-2">
                  <p><strong>Tên:</strong> {customerInfo.name || ''}</p>
                  <p><strong>Email:</strong> {customerInfo.email || ''}</p>
                  <p><strong>Số điện thoại:</strong> {customerInfo.phone || ''}</p>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <h3 className="font-bold">Địa chỉ giao hàng:</h3>
              <p>
                {[
                  order.shippingAddress as string,
                  order.township as string,
                  order.city as string,
                  order.state as string
                ].filter(Boolean).join(', ')}
              </p>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-bold">THÔNG TIN THANH TOÁN</h2>
              <div className="mt-2">
                <p><strong>Phương thức thanh toán:</strong> {formatPaymentType(order.paymentType as string)}</p>
                <p><strong>Trạng thái thanh toán:</strong> {formatPaymentStatus(order.paymentStatus as string)}</p>
                <p><strong>Trạng thái đơn hàng:</strong> {formatOrderStatus(order.orderStatus as string)}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-bold">CHI TIẾT SẢN PHẨM</h2>
              <table className="min-w-full mt-2 border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2">STT</th>
                    <th className="border px-4 py-2">Sản phẩm</th>
                    <th className="border px-4 py-2">SL</th>
                    <th className="border px-4 py-2">Đơn giá</th>
                    <th className="border px-4 py-2">Giảm giá</th>
                    <th className="border px-4 py-2">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails.map((detail, index) => {
                    const productName = detail.product?.name || detail.productName || 'Sản phẩm không xác định';
                    const size = detail.size || '';
                    const quantity = detail.quantity || 0;
                    const price = detail.price || 0;
                    const discountPercent = detail.discountPercent || 0;
                    const total = price * quantity * (1 - discountPercent / 100);
                    
                    return (
                      <tr key={index}>
                        <td className="border px-4 py-2">{index + 1}</td>
                        <td className="border px-4 py-2">{`${productName} (${size})`}</td>
                        <td className="border px-4 py-2 text-center">{quantity}</td>
                        <td className="border px-4 py-2 text-right">{formatPrice(price)}</td>
                        <td className="border px-4 py-2 text-center">{`${discountPercent}%`}</td>
                        <td className="border px-4 py-2 text-right">{formatPrice(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-right">
              <p><strong>Tổng số lượng:</strong> {order.totalQuantity as number || 0}</p>
              <p className="text-xl font-bold"><strong>Tổng tiền:</strong> {formatPrice(order.totalPrice as number)}</p>
            </div>
            
            <div className="mt-6 text-center">
              <p>Cảm ơn quý khách đã mua hàng!</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Đóng</Button>
            <Button onClick={handleExport}>Xuất PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 