import { IOrder, IOrderData } from '@/models'
import { createSlice } from '@reduxjs/toolkit'
import { reducers } from '@/store/order/reducers'

export interface IOrderStore {
   orders: IOrder[]
   orderSave: IOrderData | null
}

const initialState: IOrderStore = {
   orders: [],
   orderSave: null,
}

const orderSlice = createSlice({
   name: 'order',
   initialState,
   reducers,
})

export const { setOrderSave, resetOrderSave } = orderSlice.actions
export default orderSlice.reducer
