import { StatusOrder } from '@/enums'
import { IStatusOrder } from '@/models'

export const formatStatusShipping = (status: IStatusOrder) => {
   let html = ''
   const textClass = 'text-sm px-4 py-2 rounded-lg font-medium'

   switch (status) {
      case StatusOrder.PENDING: {
         html = `<span class="${textClass} text-secondary-dark bg-yellow-50">Chờ xác nhận</span>`
         break
      }
      case StatusOrder.CONFIRMED: {
         html = `<span class="${textClass} text-cyan-600 bg-cyan-50">Đã xác nhận</span>`
      }
      case StatusOrder.SHIPPING: {
         html = `<span class="${textClass} text-blue-600 bg-blue-50">Đang giao</span>`
      }
      case StatusOrder.COMPLETED: {
         html = `<span class="${textClass} text-green-600 bg-green-50">Đã giao</span>`
      }
   }

   return html
}

export const formatStatusPayment = (isPayment: string | boolean) => {
   const textClass = 'text-sm px-4 py-2 rounded-lg font-medium'
   const html =
      isPayment === 'true'
         ? `<span class="${textClass} text-green-600 bg-green-50">Đã thanh toán</span>`
         : `<span class="${textClass} text-red-600 bg-red-50">Chưa thanh toán</span>`

   return html
}
