import { PaymentMethodOrder, ShippingMethodOrder } from '@/enums'

export const radioPayments = [
   {
      name: 'Thanh toán bằng tiền mặt',
      val: PaymentMethodOrder.CASH,
      img: '/cash_logo.png',
   },
   {
      name: 'Thanh toán qua ví MOMO',
      val: PaymentMethodOrder.MOMO,
      img: '/momo_logo.png',
   },
   {
      name: 'Thanh toán qua ứng dụng ngân hàng VNPAY',
      val: PaymentMethodOrder.VNPAY,
      img: '/vnpay_logo.png',
   },
   {
      name: 'Thanh toán qua Paypal',
      val: PaymentMethodOrder.PAYPAL,
      img: '/paypal_logo.png',
   },
]

export const radioShipping = [
   {
      name: 'Giao hàng thông thường',
      val: ShippingMethodOrder.NORMAL,
   },
   {
      name: 'Giao hàng nhanh',
      val: ShippingMethodOrder.EXPRESS,
   },
]
