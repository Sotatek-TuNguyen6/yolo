import { PayloadAction } from '@reduxjs/toolkit'
import { IOrderStore } from '.'
import { IOrderData } from '@/models'

export const reducers = {
   setOrderSave(state: IOrderStore, action: PayloadAction<IOrderData>) {
      state.orderSave = action.payload
   },
   resetOrderSave(state: IOrderStore) {
      state.orderSave = null
   },
}
