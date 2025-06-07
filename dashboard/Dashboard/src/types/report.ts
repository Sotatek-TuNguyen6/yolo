import { Order } from '@/interface/order.interface';
import { User } from '@/interface/user.interface';
import { Product } from './product';

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

export interface ProductReportSummary {
  totalProducts: number;
  totalActiveProducts: number;
  totalInactiveProducts: number;
  totalStock: number;
  averagePrice: number;
  highestPrice: number;
  lowestPrice: number;
}

export interface CategoryStats {
  [categoryName: string]: {
    count: number;
    averagePrice: number;
    totalStock: number;
  };
}

export interface PriceRangeStats {
  [range: string]: number; // e.g. "0-50": 10, "51-100": 20, etc.
}

export interface StockStats {
  inStock: number;
  lowStock: number; // Less than 10
  outOfStock: number;
}

export interface ProductReportResponse {
  summary: ProductReportSummary;
  categoryStats: CategoryStats;
  priceRangeStats: PriceRangeStats;
  stockStats: StockStats;
  topProducts?: Product[];
}

export interface UserReportSummary {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  newUsersLastMonth: number;
  growthRate: number; // percentage growth compared to last month
}

export interface UserStatusStats {
  [key: string]: number; // Use string index instead of mapped type
}

export interface MonthlyStats {
  [month: string]: number; // YYYY-MM format with number of registrations
}

export interface UserReportResponse {
  summary: UserReportSummary;
  statusStats: UserStatusStats;
  monthlyStats: MonthlyStats;
  users?: User[]; // Changed from User[] to any[] to allow undefined password
}

export interface ReportResponse {
  productReport: ProductReportResponse;
  userReport: UserReportResponse;
  orderReport: OrderReportResponse;
}
