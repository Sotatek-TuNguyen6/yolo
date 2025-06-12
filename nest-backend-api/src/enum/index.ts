export enum UserRole {
  ADMIN = 'admin',
  USER = 'staff',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum TypeAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum StatusOrder {
  PENDING = 'pending', // order created, waiting for confirm by admin or staff
  CONFIRMED = 'confirmed', // order confirmed by admin or staff
  SHIPPING = 'shipping', // order has been picked up by staff and is being shipped
  COMPLETED = 'completed', // order has been delivered
  CANCELLED = 'cancelled',
}

export enum PaymentMethodOrder {
  CASH = 'cash', // paid at store
  COD = 'cod', // paid at delivery (cash on delivery)
  VNPAY = 'vnpay', // paid by VNPAY
  MOMO = 'momo', // paid by Momo
  PAYPAL = 'paypal', // paid by Paypal
}

export enum PaymentType {
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum DeliveryType {
  STORE_PICKUP = 'STORE_PICKUP',
  YANGON = 'YANGON',
  OTHER = 'OTHER',
  SHIP = 'SHIP',
  FREE = 'FREE',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PROCESSING = 'processing',
  DELIVERED = 'delivered',
  REFUNDED = 'refunded',
}
