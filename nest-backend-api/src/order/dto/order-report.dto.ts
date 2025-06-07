import { Order } from '../entities/order.entity';

export interface OrderReportSummary {
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  averageOrderValue: number;
}

export interface PaymentTypeStats {
  [key: string]: {
    count: number;
    revenue: number;
  };
}

export interface DeliveryTypeStats {
  [key: string]: {
    count: number;
    revenue: number;
  };
}

export interface DailyStats {
  [date: string]: {
    count: number;
    revenue: number;
    items: number;
  };
}

export interface ProductSale {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface OrderReportResponse {
  summary: OrderReportSummary;
  paymentTypeStats: PaymentTypeStats;
  deliveryTypeStats: DeliveryTypeStats;
  dailyStats: DailyStats;
  topProducts: ProductSale[];
  orders: Order[];
}
