'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '@/utils/date';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface OrderPrintButtonProps {
  order: Record<string, unknown>;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonText?: string;
  className?: string;
  dialogOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
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

export function OrderPrintButton({
  order,
  variant = 'outline',
  buttonText = 'In hóa đơn',
  className = '',
  dialogOpen: externalDialogOpen,
  onOpenChange: externalOnOpenChange
}: OrderPrintButtonProps) {
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  
  const dialogOpen = externalDialogOpen !== undefined ? externalDialogOpen : internalDialogOpen;
  const setDialogOpen = (open: boolean) => {
    if (externalOnOpenChange) {
      externalOnOpenChange(open);
    } else {
      setInternalDialogOpen(open);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('order-print-content');
    if (!printContent) return;
    
    const printCSS = `
      <style>
        @page { size: A4; margin: 1cm; }
        body { font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; }
        .print-header { text-align: center; margin-bottom: 20px; }
        .print-section { margin-bottom: 20px; }
        .print-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; }
        .print-table th { background-color: #f2f2f2; }
        .print-footer { text-align: center; margin-top: 30px; font-size: 14px; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .text-center { text-align: center; }
        .total-section { margin-top: 20px; }
        @media print {
          button { display: none !important; }
          .no-print { display: none !important; }
        }
      </style>
    `;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vui lòng cho phép mở cửa sổ pop-up để in hóa đơn');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn ${order.orderId}</title>
          ${printCSS}
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Đợi tài nguyên tải xong
    printWindow.onload = function() {
      printWindow.print();
      // printWindow.close();
    };
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
        <Printer className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Xem trước hóa đơn</DialogTitle>
            <DialogDescription>
              Xem trước hóa đơn trước khi in
            </DialogDescription>
          </DialogHeader>
          
          <div id="order-print-content" className="p-4 bg-white">
            <div className="print-header">
              <h1 className="text-2xl font-bold">CHI TIẾT ĐƠN HÀNG</h1>
            </div>
            
            <div className="print-section">
              <p><strong>Mã đơn hàng:</strong> {order.orderId as string || ''}</p>
              <p><strong>Ngày đặt hàng:</strong> {order.orderDate ? formatDate(new Date(order.orderDate as string)) : ''}</p>
            </div>
            
            <div className="print-section">
              <h2 className="text-xl font-bold">THÔNG TIN KHÁCH HÀNG</h2>
              {customerInfo && (
                <div className="mt-2">
                  <p><strong>Tên:</strong> {customerInfo.name || ''}</p>
                  <p><strong>Email:</strong> {customerInfo.email || ''}</p>
                  <p><strong>Số điện thoại:</strong> {customerInfo.phone || ''}</p>
                </div>
              )}
            </div>
            
            <div className="print-section">
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
            
            <div className="print-section">
              <h2 className="text-xl font-bold">THÔNG TIN THANH TOÁN</h2>
              <div className="mt-2">
                <p><strong>Phương thức thanh toán:</strong> {formatPaymentType(order.paymentType as string)}</p>
                <p><strong>Trạng thái thanh toán:</strong> {formatPaymentStatus(order.paymentStatus as string)}</p>
                <p><strong>Trạng thái đơn hàng:</strong> {formatOrderStatus(order.orderStatus as string)}</p>
              </div>
            </div>
            
            <div className="print-section">
              <h2 className="text-xl font-bold">CHI TIẾT SẢN PHẨM</h2>
              <table className="print-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Sản phẩm</th>
                    <th>SL</th>
                    <th>Đơn giá</th>
                    <th>Giảm giá</th>
                    <th>Thành tiền</th>
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
                        <td className="text-center">{index + 1}</td>
                        <td>{`${productName} (${size})`}</td>
                        <td className="text-center">{quantity}</td>
                        <td className="text-right">{formatPrice(price)}</td>
                        <td className="text-center">{`${discountPercent}%`}</td>
                        <td className="text-right">{formatPrice(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="total-section text-right">
              <p><strong>Tổng số lượng:</strong> {order.totalQuantity as number || 0}</p>
              <p className="text-xl font-bold"><strong>Tổng tiền:</strong> {formatPrice(order.totalPrice as number)}</p>
            </div>
            
            <div className="print-footer">
              <p>Cảm ơn quý khách đã mua hàng!</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} variant="outline">Đóng</Button>
            <Button onClick={handlePrint}>In hóa đơn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 