import { ICart, ICartItem } from '@/models'
import { PayloadAction } from '@reduxjs/toolkit'
import { ICartStore } from '.'

export interface IItemCart {
   id: string
   quantities: number
}

export const reducers = {
   updateItemQuantities(state: ICartStore, action: PayloadAction<IItemCart>) {
      const item = action.payload
      const cart = { ...state.cart }

      const idx = cart?.items?.findIndex(
         (i) => i._id?.toString() === item.id.toString()
      ) as number
      if (idx > -1) {
         ;(cart.items as ICartItem[])[idx].quantities = item.quantities
         state.cart = cart as ICart
      }
   },
   resetCart(state: ICartStore) {
      state.cart = null
      state.total = 0
   },
}
