// import { Product } from "./product.interface";
import { Product } from "./product.interface";
import { User } from "./user.interface";

// Các type để sử dụng trong frontend
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export enum EPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export type PaymentMethod = 'CASH_ON_DELIVERY' | 'BANK_TRANSFER';

// Keeping this for backward compatibility, but prefer using EPaymentStatus enum
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// PaymentType is the same as PaymentMethod, keeping for backward compatibility
export type PaymentType = 'CASH_ON_DELIVERY' | 'BANK_TRANSFER';

export enum EDeliveryType {
  STORE_PICKUP = 'STORE_PICKUP',
  HOME_DELIVERY = 'HOME_DELIVERY',
}

export type DeliveryType = 'STORE_PICKUP' | 'HOME_DELIVERY';

export interface IAddress {
  ward: {
    name: string,
    code: number,
  };
  district: {
    name: string;
    code: number;
  };
  province: {
    name: string;
    code: number;
  };
  street: string;
}

// Định nghĩa kiểu cho size và color
export interface ISize {
  _id: string;
  name: string;
}

export interface IColor {
  _id: string;
  name: string;
  value: string;
}

export interface IOrderItem {
  product: Product;
  color: IColor | IColor[] | string | string[];
  size: ISize | ISize[] | string | string[];
  quantities: number;
  quantity?: number;
  price?: number;
  totalPrice?: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface OrderDetail {
  orderDetailId: number;
  quantity: number;
  product: Product; // Using string for ObjectId
  price: number;
  imageId?: string;
}

// Interface chính cho Order
export interface Order {
  _id?: string;
  orderId: number;
  user?: User | string; // Using string for ObjectId
  customerInfo: CustomerInfo;
  shippingAddress: string;
  township?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  orderDate: Date | string;
  paymentType: PaymentMethod; // Using PaymentMethod instead of PaymentType
  deliveryType: DeliveryType;
  totalPrice: number;
  deliveryDate?: number;
  orderDetails: OrderDetail[];
  totalQuantity: number;
  paymentStatus: EPaymentStatus | PaymentStatus; // Support both enum and string type
  isPayment?: boolean; // Added based on usage in the UI
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Thêm các trường tương thích cho code cũ
export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note?: string;
}
