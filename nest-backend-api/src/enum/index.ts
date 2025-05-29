export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
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
