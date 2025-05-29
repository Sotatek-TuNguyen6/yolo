// import { Product } from "./product.interface";
import { Product } from "@/types/product";
import { User } from "./user.interface";

// Các type để sử dụng trong frontend
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'momo' | 'zalopay';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

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

// Interface chính cho Order
export interface Order {
  _id?: string;
  user: User;
  fullName: string;
  emailAddress: string;
  address: IAddress;
  phoneNumber: string;
  noteAddress?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  isPayment: boolean;
  items: IOrderItem[];
  subTotal: number;
  shippingFee: number;
  total: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;

  // Các trường bổ sung cho frontend
  orderNumber?: string;
  paymentStatus?: PaymentStatus;
  discount?: number;
  grandTotal?: number;
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
