'use client'

import { CartProductItem } from '@/components/Cart/CartProduct/components'
import { ICart } from '@/models'
import { AppState } from '@/store'
import { ReactNode, useMemo } from 'react'
import { BsTrash } from 'react-icons/bs'
import { connect } from 'react-redux'

export interface ICartProductProps {
   className?: string
   quantitiesProduct: number
   pCarts: ICart
}

export interface CartProductProps {
   firstCell: ReactNode
   secondCell: ReactNode
   className?: string
   isRemove?: boolean
   onRemoveCart?: (() => void) | (() => Promise<void>)
}

export function CartProductLayout({
   firstCell,
   secondCell,
   className = '',
   isRemove = false,
   onRemoveCart,
}: CartProductProps) {
   const handleRemoveCart = () => {
      onRemoveCart?.()
   }

   return (
      <div className={`relative grid grid-cols-[1.5fr_1fr] ${className}`}>
         <div>{firstCell}</div>
         <div>{secondCell}</div>
         {isRemove && (
            <button
               className="absolute bottom-8 right-5 group"
               onClick={handleRemoveCart}
            >
               <BsTrash className="text-gray-500 w-5 h-5 group-hover:text-red-500 duration-common" />
            </button>
         )}
      </div>
   )
}

function CartProduct({ className = '', quantitiesProduct, pCarts }: ICartProductProps) {
   const cartItems = useMemo(() => {
      return pCarts && pCarts.items && pCarts.items?.length > 0 ? pCarts.items : []
   }, [pCarts])

   const idCart = useMemo(() => {
      return pCarts && pCarts._id ? pCarts._id : ''
   }, [pCarts])

   return (
      <div className={`bg-white rounded ${className}`}>
         <div className="w-full flex items-end gap-4 p-5">
            <h3 className="uppercase font-semibold text-bold">Giỏ hàng</h3>
            <div className="inline-block text-tag">
               ({quantitiesProduct}) <span>Sản phẩm</span>
            </div>
         </div>
         <div className="w-full p-5 pb-0">
            <div className="w-full">
               <CartProductLayout
                  firstCell={<div className="block text-sm font-semibold">Sản phẩm</div>}
                  secondCell={
                     <div className="grid grid-cols-[1fr_2fr_1fr]">
                        <div className="block text-sm font-semibold text-center">
                           Đơn giá
                        </div>
                        <div className="block text-sm font-semibold text-center">
                           Số lượng
                        </div>
                        <div className="block text-sm font-semibold text-right">
                           Tổng tiền
                        </div>
                     </div>
                  }
               />
            </div>
         </div>
         <div>
            {cartItems.map((cart) => (
               <CartProductItem key={cart.id} cart={cart} idCart={idCart} />
            ))}
            {cartItems.length === 0 && (
               <p className="p-5 pt-3 text-sm text-gray-darker">
                  Không có sản phẩm nào trong giỏ hàng.
               </p>
            )}
         </div>
      </div>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pCarts: state.cart.cart,
   }
}

export default connect(mapStateToProps, null)(CartProduct)
