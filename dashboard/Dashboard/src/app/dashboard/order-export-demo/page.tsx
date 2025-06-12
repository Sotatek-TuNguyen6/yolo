'use client';

import { Button } from '@/components/ui/button';
import { OrderExportButton } from '@/components/order-export-button';
import { OrderPrintButton } from '@/components/order-print-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportOrdersToExcel } from '@/utils/orderExport';
import { exportOrdersToPdf } from '@/utils/pdfExport';

// Sample order data for demo
const sampleOrder = {
  orderId: 'ORD12345',
  orderDate: new Date().toISOString(),
  customerInfo: {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0987654321'
  },
  shippingAddress: '123 Đường Lê Lợi',
  township: 'Quận 1',
  city: 'TP. Hồ Chí Minh',
  paymentType: 'BANK_TRANSFER',
  paymentStatus: 'paid',
  orderStatus: 'processing',
  deliveryType: 'HOME_DELIVERY',
  deliveryDate: Date.now() + 86400000 * 3, // 3 days from now
  totalQuantity: 3,
  totalPrice: 1250000,
  orderDetails: [
    {
      product: {
        name: 'Áo thun nam',
        productId: 'SP001',
        images: [{
          url: ['https://example.com/product1.jpg'],
          color: 'Đen',
          colorCode: '#000000'
        }]
      },
      size: 'XL',
      quantity: 1,
      price: 350000,
      discountPercent: 10
    },
    {
      product: {
        name: 'Quần jean nữ',
        productId: 'SP002',
        images: [{
          url: ['https://example.com/product2.jpg'],
          color: 'Xanh',
          colorCode: '#0000FF'
        }]
      },
      size: 'M',
      quantity: 2,
      price: 450000,
      discountPercent: 0
    }
  ]
};

// Sample multiple orders for list export demo
const sampleOrders = [
  sampleOrder,
  {
    ...sampleOrder,
    orderId: 'ORD12346',
    customerInfo: {
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0123456789'
    },
    paymentStatus: 'pending',
    orderStatus: 'pending',
    totalQuantity: 1,
    totalPrice: 450000
  },
  {
    ...sampleOrder,
    orderId: 'ORD12347',
    customerInfo: {
      name: 'Lê Văn C',
      email: 'levanc@example.com',
      phone: '0369852147'
    },
    paymentStatus: 'failed',
    orderStatus: 'cancelled',
    totalQuantity: 5,
    totalPrice: 2550000
  }
];

export default function OrderExportDemoPage() {
  const handleExportMultipleToExcel = () => {
    try {
      exportOrdersToExcel(sampleOrders as unknown as Record<string, unknown>[]);
    } catch (error) {
      console.error('Error exporting orders to Excel:', error);
      alert('Có lỗi xảy ra khi xuất Excel. Vui lòng thử lại sau.');
    }
  };

  const handleExportMultipleToPdf = () => {
    try {
      exportOrdersToPdf(sampleOrders as unknown as Record<string, unknown>[]);
    } catch (error) {
      console.error('Error exporting orders to PDF:', error);
      alert('Có lỗi xảy ra khi xuất PDF. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Demo Xuất Hóa Đơn</h1>
      
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="single">Đơn hàng đơn lẻ</TabsTrigger>
          <TabsTrigger value="multiple">Nhiều đơn hàng</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Xuất một đơn hàng</CardTitle>
              <CardDescription>
                Demo xuất một đơn hàng ra Excel hoặc PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-medium mb-2">Thông tin đơn hàng mẫu:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Mã đơn hàng: {sampleOrder.orderId}</li>
                    <li>Khách hàng: {sampleOrder.customerInfo.name}</li>
                    <li>Tổng tiền: {sampleOrder.totalPrice.toLocaleString('vi-VN')} VND</li>
                    <li>Trạng thái: Đang xử lý</li>
                  </ul>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Xuất đơn hàng:</h3>
                    <div className="flex gap-2">
                      <OrderExportButton 
                        order={sampleOrder as unknown as Record<string, unknown>} 
                        buttonText="Xuất Excel"
                      />
                      <OrderPrintButton 
                        order={sampleOrder as unknown as Record<string, unknown>} 
                        buttonText="In hóa đơn"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium mb-2">Giải thích:</h3>
                <p>
                  Khi nhấn vào nút xuất Excel hoặc PDF, hệ thống sẽ tạo file và tự động tải xuống.
                  File Excel sẽ được tải xuống dưới dạng .xlsx, còn file PDF sẽ được tải xuống dưới dạng .pdf.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="multiple" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Xuất nhiều đơn hàng</CardTitle>
              <CardDescription>
                Demo xuất danh sách đơn hàng ra Excel hoặc PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="font-medium mb-2">Danh sách đơn hàng mẫu:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {sampleOrders.map((order, index) => (
                    <li key={index}>
                      {order.orderId} - {order.customerInfo.name} - {order.totalPrice.toLocaleString('vi-VN')} VND
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-2 mb-6">
                <Button 
                  variant="outline" 
                  onClick={handleExportMultipleToExcel}
                >
                  Xuất nhiều đơn hàng ra Excel
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleExportMultipleToPdf}
                >
                  Xuất nhiều đơn hàng ra PDF
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Giải thích:</h3>
                <p>
                  Khi xuất nhiều đơn hàng, hệ thống sẽ tạo một bảng tổng hợp các đơn hàng bao gồm các thông tin 
                  cơ bản như mã đơn hàng, khách hàng, ngày đặt, trạng thái, tổng tiền. File Excel và PDF sẽ được tải xuống
                  với tên là danh-sach-don-hang-[ngày].xlsx hoặc danh-sach-don-hang-[ngày].pdf.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 