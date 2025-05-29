import { Button } from '@/components/buttons'
import { CheckoutBillCartItem } from '@/components/Checkout/CheckoutBill/components'
import { ICart, IProduct } from '@/models'
import { formatCurrency } from '@/utils'
import { useMemo } from 'react'

export interface ICheckoutBillProps {
   isDisabledSubmit: boolean
   cart: ICart
   shippingFee: number
}

export function CheckoutBill({
   isDisabledSubmit,
   cart,
   shippingFee,
}: ICheckoutBillProps) {
   const totalPriceCart = useMemo(() => {
      if (!cart) return 0
      return (
         cart.items &&
         cart.items?.reduce((total, item) => {
            return total + ((item.product as IProduct).price || 0) * item.quantities
         }, 0)
      )
   }, [cart])

   const carts = useMemo(() => {
      return cart && cart.items ? cart.items : []
   }, [cart])

   const priceClass = 'flex items-center justify-between text-sm py-2 text-description'

   return (
      <div className="border-4 border-dashed border-secondary-dark rounded bg-white">
         <div className="p-4 border-b border-dashed">
            <h2 className="font-medium text-sapo mt-2 mb-4">Đơn hàng của bạn</h2>
            <div>
               {carts.map((cart) => (
                  <CheckoutBillCartItem key={cart.id} cart={cart} />
               ))}
            </div>
         </div>
         <div className="p-4 border-b border-dashed">
            <div className={priceClass}>
               <span className="text-gray-dark">Tạm tính</span>
               <span className="font-semibold">
                  {formatCurrency(totalPriceCart as number)}
               </span>
            </div>
            <div className={priceClass}>
               <span className="text-gray-dark">Phí vận chuyển</span>
               <span className="font-semibold">{formatCurrency(shippingFee)}</span>
            </div>
         </div>
         <div className="p-4 border-b border-dashed">
            <div className={`${priceClass} `}>
               <span className="text-gray-dark text-base">Tổng cộng</span>
               <span className="font-bold text-red-600 text-lg">
                  {formatCurrency(shippingFee + Number(totalPriceCart))}
               </span>
            </div>
         </div>
         <div className="p-4 border-b border-dashed">
            <div>
               <Button
                  type="submit"
                  className="w-full uppercase font-semibold text-sm"
                  title={'Đặt hàng'}
                  disabledClassName="disabled-btn-submit"
                  disabled={isDisabledSubmit}
               ></Button>
            </div>
         </div>
      </div>
   )
}
