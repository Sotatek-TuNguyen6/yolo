import { formatDate } from './date';
import { formatDataForExport, exportToExcel } from './exportUtils';

type ExcelValue = string | number | boolean | Date | null | undefined;

// Helper functions for formatting
const formatPaymentType = (type: string): string => {
  switch (type) {
    case 'CASH_ON_DELIVERY': return 'Thanh toán khi nhận hàng';
    case 'BANK_TRANSFER': return 'Chuyển khoản ngân hàng';
    default: return type || '';
  }
};

const formatDeliveryType = (type: string): string => {
  switch (type) {
    case 'STORE_PICKUP': return 'Nhận tại cửa hàng';
    case 'HOME_DELIVERY': return 'Giao hàng tận nơi';
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
    case 'shipped': return 'Đã gửi hàng';
    case 'delivered': return 'Đã giao hàng';
    case 'cancelled': return 'Đã hủy';
    default: return status || '';
  }
};

const formatPrice = (price: number): string => {
  return `${price?.toLocaleString('vi-VN')} VND`;
};

const formatOrderDetails = (details: Array<Record<string, unknown>>): string => {
  return details.map(detail => {
    const product = detail.product as Record<string, unknown> | undefined;
    const productName = product?.name || detail.productName || 'Sản phẩm không xác định';
    const quantity = detail.quantity || 0;
    const price = detail.price || 0;
    const size = detail.size || '';
    
    return `${productName} (${size}) x${quantity} - ${formatPrice(price as number)}`;
  }).join('\n');
};

/**
 * Format an order for Excel export
 * @param order - The order object to format
 * @returns Formatted order data ready for export
 */
export const formatOrderForExport = (order: Record<string, unknown>): Record<string, ExcelValue> => {
  const formattedOrder: Record<string, ExcelValue> = {};

  // Basic order information
  formattedOrder['Mã đơn hàng'] = order.orderId as ExcelValue;
  formattedOrder['Ngày đặt hàng'] = order.orderDate 
    ? formatDate(new Date(order.orderDate as string)) 
    : '';
  
  // Customer information
  const customerInfo = order.customerInfo as Record<string, unknown> | undefined;
  if (customerInfo) {
    formattedOrder['Tên khách hàng'] = customerInfo.name as string;
    formattedOrder['Email'] = customerInfo.email as string;
    formattedOrder['Số điện thoại'] = customerInfo.phone as string;
  }
  
  // Address information
  formattedOrder['Địa chỉ giao hàng'] = order.shippingAddress as string;
  formattedOrder['Quận/Huyện'] = order.township as string;
  formattedOrder['Tỉnh/Thành phố'] = order.city as string;
  
  // Payment and delivery information
  formattedOrder['Phương thức thanh toán'] = formatPaymentType(order.paymentType as string);
  formattedOrder['Loại giao hàng'] = formatDeliveryType(order.deliveryType as string);
  formattedOrder['Ngày giao hàng'] = order.deliveryDate 
    ? formatDate(new Date(order.deliveryDate as number)) 
    : '';
  
  // Order status
  formattedOrder['Trạng thái thanh toán'] = formatPaymentStatus(order.paymentStatus as string);
  formattedOrder['Trạng thái đơn hàng'] = formatOrderStatus(order.orderStatus as string);
  
  // Order totals
  formattedOrder['Tổng số lượng'] = order.totalQuantity as ExcelValue;
  formattedOrder['Tổng tiền'] = formatPrice(order.totalPrice as number);
  
  // Format order details
  const orderDetails = order.orderDetails as Array<Record<string, unknown>> | undefined;
  if (orderDetails && orderDetails.length > 0) {
    formattedOrder['Chi tiết đơn hàng'] = formatOrderDetails(orderDetails);
  }
  
  return formattedOrder;
};

/**
 * Export a single order to Excel
 * @param order - The order object to export
 */
export const exportOrderToExcel = (order: Record<string, unknown>): void => {
  const formattedOrder = formatOrderForExport(order);
  
  // Export to Excel
  exportToExcel([formattedOrder], {
    fileName: `order-${order.orderId}-${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Chi tiết đơn hàng'
  });
};

/**
 * Export multiple orders to Excel
 * @param orders - Array of order objects to export
 */
export const exportOrdersToExcel = (orders: Record<string, unknown>[]): void => {
  // Define column mapping for Excel export
  const columnMapping = {
    orderId: 'Mã đơn hàng',
    'customerInfo.name': 'Tên khách hàng',
    'customerInfo.phone': 'Số điện thoại',
    'customerInfo.email': 'Email',
    totalPrice: 'Tổng tiền',
    totalQuantity: 'Tổng số lượng',
    paymentType: 'Phương thức thanh toán',
    paymentStatus: 'Trạng thái thanh toán',
    orderStatus: 'Trạng thái đơn hàng',
    deliveryType: 'Loại giao hàng',
    shippingAddress: 'Địa chỉ giao hàng',
    township: 'Quận/Huyện',
    city: 'Tỉnh/Thành phố',
    orderDate: 'Ngày đặt hàng',
    deliveryDate: 'Ngày giao hàng',
    createdAt: 'Ngày tạo',
    updatedAt: 'Ngày cập nhật'
  };

  // Define formatters for specific fields
  const formatters: Record<string, (value: unknown) => ExcelValue> = {
    paymentType: (value) => formatPaymentType(value as string),
    paymentStatus: (value) => formatPaymentStatus(value as string),
    orderStatus: (value) => formatOrderStatus(value as string),
    deliveryType: (value) => formatDeliveryType(value as string),
    totalPrice: (value) => formatPrice(value as number),
    orderDate: (value) => value ? formatDate(new Date(value as string)) : '',
    deliveryDate: (value) => value ? formatDate(new Date(value as number)) : '',
    createdAt: (value) => value ? formatDate(new Date(value as string)) : '',
    updatedAt: (value) => value ? formatDate(new Date(value as string)) : '',
  };

  // Format data for export
  const formattedData = formatDataForExport(
    orders as Record<string, unknown>[],
    columnMapping,
    formatters as Record<string, (value: unknown, row: Record<string, unknown>) => ExcelValue>
  );

  // Export to Excel
  exportToExcel(formattedData, {
    fileName: `orders-report-${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Đơn hàng'
  });
};
