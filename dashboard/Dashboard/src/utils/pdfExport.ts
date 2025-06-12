import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './date';

/**
 * Export an order to PDF
 * @param order - The order object to export
 */
export const exportOrderToPdf = (order: Record<string, unknown>): void => {
  try {
    // Create new PDF document (A4 portrait)
    const doc = new jsPDF();
    
    // Set font and use unicode 
    // Sử dụng font mặc định của jsPDF để hỗ trợ Unicode tiếng Việt
    doc.setFont('helvetica');
    
    // Set font size and add title
    doc.setFontSize(20);
    doc.text('Chi tiết đơn hàng', 105, 15, { align: 'center' });
    
    // Add order ID and date
    doc.setFontSize(12);
    doc.text(`Ma don hang: ${order.orderId || ''}`, 14, 30);
    doc.text(
      `Ngay dat hang: ${order.orderDate ? formatDate(new Date(order.orderDate as string)) : ''}`, 
      14, 
      38
    );
    
    // Add customer information
    doc.setFontSize(14);
    doc.text('THONG TIN KHACH HANG', 14, 50);
    
    doc.setFontSize(11);
    const customerInfo = order.customerInfo as Record<string, unknown> | undefined;
    if (customerInfo) {
      doc.text(`Ten: ${customerInfo.name || ''}`, 14, 58);
      doc.text(`Email: ${customerInfo.email || ''}`, 14, 65);
      doc.text(`So dien thoai: ${customerInfo.phone || ''}`, 14, 72);
    }
    
    // Add shipping address
    doc.text('Dia chi giao hang:', 14, 80);
    const address = [
      order.shippingAddress,
      order.township,
      order.city,
      order.state
    ].filter(Boolean).join(', ');
    
    // Handle long addresses by splitting them
    const splitAddress = doc.splitTextToSize(address, 180);
    doc.text(splitAddress, 14, 87);
    
    // Add payment information
    doc.setFontSize(14);
    doc.text('THONG TIN THANH TOAN', 14, 105);
    
    doc.setFontSize(11);
    const paymentType = formatPaymentType(order.paymentType as string);
    const paymentStatus = formatPaymentStatus(order.paymentStatus as string);
    const orderStatus = formatOrderStatus(order.orderStatus as string);
    
    doc.text(`Phuong thuc thanh toan: ${paymentType}`, 14, 113);
    doc.text(`Trang thai thanh toan: ${paymentStatus}`, 14, 120);
    doc.text(`Trang thai don hang: ${orderStatus}`, 14, 127);
    
    // Add order items
    doc.setFontSize(14);
    doc.text('CHI TIET SAN PHAM', 14, 140);
    
    // Create table for order items
    const orderDetails = order.orderDetails as Array<Record<string, unknown>> | undefined;
    if (orderDetails && orderDetails.length > 0) {
      const tableData = orderDetails.map((detail, index) => {
        const product = detail.product as Record<string, unknown> | undefined;
        const productName = product?.name || detail.productName || 'San pham khong xac dinh';
        const size = detail.size || '';
        const quantity = detail.quantity || 0;
        const price = detail.price || 0;
        const discountPercent = detail.discountPercent || 0;
        const total = (price as number) * (quantity as number) * (1 - (discountPercent as number) / 100);
        
        return [
          index + 1,
          `${productName} (${size})`,
          quantity,
          formatPrice(price as number),
          `${discountPercent}%`,
          formatPrice(total)
        ];
      });
      
      autoTable(doc, {
        startY: 145,
        head: [['STT', 'San pham', 'SL', 'Don gia', 'Giam gia', 'Thanh tien']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] }
      });
    }
    
    // Get the last position where the table ended
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    
    // Add total
    doc.setFontSize(12);
    doc.text(`Tong so luong: ${order.totalQuantity || 0}`, 130, finalY);
    doc.setFontSize(14);
    doc.text(`Tong tien: ${formatPrice(order.totalPrice as number)}`, 130, finalY + 10);
    
    // Add footer
    doc.setFontSize(10);
    doc.text('Cam on quy khach da mua hang!', 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`don-hang-${order.orderId}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error creating PDF:', error);
    throw error;
  }
};

/**
 * Export multiple orders to PDF
 * @param orders - Array of order objects to export
 */
export const exportOrdersToPdf = (orders: Record<string, unknown>[]): void => {
  try {
    // Create new PDF document (A4 landscape)
    const doc = new jsPDF({
      orientation: 'landscape'
    });
    
    // Set font and use unicode
    doc.setFont('helvetica');
    
    // Set font size and add title
    doc.setFontSize(20);
    doc.text('DANH SACH DON HANG', 150, 15, { align: 'center' });
    
    // Add date range
    doc.setFontSize(11);
    doc.text(`Ngay xuat: ${formatDate(new Date())}`, 150, 22, { align: 'center' });
    
    // Create table for orders
    const tableData = orders.map((order, index) => {
      const customerInfo = order.customerInfo as Record<string, unknown> | undefined;
      return [
        index + 1,
        order.orderId || '',
        order.orderDate ? formatDate(new Date(order.orderDate as string)) : '',
        customerInfo?.name || '',
        customerInfo?.phone || '',
        formatPaymentType(order.paymentType as string),
        formatPaymentStatus(order.paymentStatus as string),
        formatOrderStatus(order.orderStatus as string),
        formatPrice(order.totalPrice as number)
      ];
    });
    
    autoTable(doc, {
      startY: 30,
      head: [['STT', 'Ma don', 'Ngay dat', 'Khach hang', 'SDT', 'Phuong thuc TT', 'Trang thai TT', 'Trang thai DH', 'Tong tien']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Add footer
    doc.setFontSize(10);
    doc.text(`Tong so: ${orders.length} don hang`, 14, 200);
    
    // Save the PDF
    doc.save(`danh-sach-don-hang-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error creating PDF:', error);
    throw error;
  }
};

// Helper functions for formatting
const formatPaymentType = (type: string): string => {
  switch (type) {
    case 'CASH_ON_DELIVERY': return 'Thanh toan khi nhan hang';
    case 'BANK_TRANSFER': return 'Chuyen khoan ngan hang';
    default: return type || '';
  }
};

const formatPaymentStatus = (status: string): string => {
  switch (status) {
    case 'pending': return 'Cho thanh toan';
    case 'paid': return 'Da thanh toan';
    case 'failed': return 'Thanh toan that bai';
    case 'refunded': return 'Da hoan tien';
    default: return status || '';
  }
};

const formatOrderStatus = (status: string): string => {
  switch (status) {
    case 'pending': return 'Cho xu ly';
    case 'processing': return 'Dang xu ly';
    case 'shipping': return 'Dang gui hang';
    case 'delivered': return 'Da giao hang';
    case 'cancelled': return 'Da huy';
    default: return status || '';
  }
};

const formatPrice = (price: number): string => {
  return `${price?.toLocaleString('vi-VN')} VND`;
};
