import { PaymentMethodOrder, ShippingMethodOrder, StatusOrder } from '@/enums'
import {
   BaseDate,
   IAddressValue,
   IAddressValueFormat,
   ICartItem,
   IProduct,
   IUser,
} from '@/models'

// ENUM TYPE
export type IStatusOrder =
   | StatusOrder.CANCELLED
   | StatusOrder.COMPLETED
   | StatusOrder.CONFIRMED
   | StatusOrder.PENDING
   | StatusOrder.SHIPPING

export type IPaymentMethodOrder =
   | PaymentMethodOrder.CASH
   | PaymentMethodOrder.COD
   | PaymentMethodOrder.MOMO
   | PaymentMethodOrder.PAYPAL
   | PaymentMethodOrder.VNPAY

export type IShippingMethodOrder =
   | ShippingMethodOrder.NORMAL
   | ShippingMethodOrder.EXPRESS

// TYPE | INTERFACE

export interface IItemOrder {
   product: IProduct
   quantities: number
}

export interface IOrderData {
   id?: string
   _id?: string
   user: string | IUser
   fullName: string
   emailAddress: string
   phoneNumber: string
   address: IAddressValueFormat
   noteAddress?: string
   status: IStatusOrder
   paymentMethod: IPaymentMethodOrder
   shippingMethod: IShippingMethodOrder
   isPayment: boolean
   items: ICartItem[]
   subTotal: number
   shippingFee: number
   total: number
}

export interface IOrder extends Omit<IOrderData, 'id' | '_id'>, BaseDate {
   id: string
   _id: string
}

export interface IOrderForm {
   fullName: string
   emailAddress: string
   phoneNumber: string
   address: {
      street: string
      ward: IAddressValue | string
      district: IAddressValue | string
      province: IAddressValue | string
   }
   noteAddress: string
   paymentMethod: IPaymentMethodOrder
   shippingMethod: IShippingMethodOrder
}
