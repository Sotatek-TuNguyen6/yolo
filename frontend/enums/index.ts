export enum TypeAuth {
   EMAIL = 'email',
   GOOGLE = 'google',
   FACEBOOK = 'facebook',
}

export enum Gender {
   MALE = 'male',
   FEMALE = 'female',
   OTHER = 'other',
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

export enum ShippingMethodOrder {
   NORMAL = 'normal',
   EXPRESS = 'express',
}

export enum TypeQuantity {
   INCREASE = 'increase',
   DECREASE = 'decrease',
}

export enum TypeBuy {
   ADD_TO_CART = 'add to cart',
   BUY_NOW = 'buy now',
}

export enum TypeModalDelete {
   DELETE_ADDRESS = 'delete_address',
   DELETE_PRODUCT = 'delete_product',
   DELETE_COMMENT = 'delete_comment',
   DELETE_REPLY_COMMENT = 'delete_reply_comment',
}

export enum TypeMessageLoading {
   LOADING = 'loading',
   UPDATE = 'update',
}

export enum TypeMeasurement {
   HEIGHT = 'height',
   WEIGHT = 'weight',
}

export enum Size {
   S = 'S',
   M = 'M',
   L = 'L',
   XL = 'XL',
   '2XL' = '2XL',
}

export enum ReportType {
   OBSCENE_CONTENT = 'obscene',
   HATE_SPEECH_CONTENT = 'hate speech',
   THREATENING_CONTENT = 'threatening',
   HARASSMENT_CONTENT = 'harassment',
   ABUSE_CONTENT = 'abuse',
   OTHER = 'other',
}

export enum GenderVi {
   MALE = 'Nam',
   FEMALE = 'Nữ',
   OTHER = 'Khác',
}
