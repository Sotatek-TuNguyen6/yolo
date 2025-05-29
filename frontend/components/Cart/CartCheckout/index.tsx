import { cartApi } from '@/api'
import { useToastify } from '@/hooks'
import { ICart } from '@/models'
import { formatCurrency } from '@/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export interface ICartCheckoutProps {
   total: number
   cart: ICart
}

export function CartCheckout({ total, cart }: ICartCheckoutProps) {
   const router = useRouter()
   const { error } = useToastify()

   const handleNavPayment = async () => {
      try {
         await cartApi.updateCartByItemsList(cart._id as string, cart.items)
         router.push('/checkout')
      } catch (err) {
         error((err as Error).message)
      }
   }

   return (
      <div className="w-full p-5 flex items-center justify-between gap-4 bg-white rounded">
         <div className="font-semibold text-sm text-sapo">
            Tổng đơn:{' '}
            <span className="text-lg text-red-600 font-bold">
               {formatCurrency(total)}
            </span>
         </div>
         <button
            className={'btn rounded text-white bg-secondary font-semibold disabled-btn'}
            disabled={!total}
            onClick={handleNavPayment}
         >
            <span>Thanh toán</span>
         </button>
      </div>
   )
}
