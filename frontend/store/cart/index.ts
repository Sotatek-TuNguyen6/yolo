import { ICart } from '@/models'
import { createSlice } from '@reduxjs/toolkit'
import extraReducers from '@/store/cart/thunkApi'
import { reducers } from '@/store/cart/reducers'

export interface ICartStore {
   cart: ICart | null
   total: number
}

const initialState: ICartStore = {
   cart: null,
   total: 0,
}

const cartSlice = createSlice({
   name: 'cart',
   initialState,
   reducers,
   extraReducers,
})

export const { updateItemQuantities, resetCart } = cartSlice.actions
export default cartSlice.reducer
