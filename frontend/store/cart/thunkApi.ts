import { cartApi } from '@/api'
import { ICart, ICartData, ICartForm, ICartsRes } from '@/models'
import {
   ActionReducerMapBuilder,
   PayloadAction,
   createAsyncThunk,
} from '@reduxjs/toolkit'
import { ICartStore } from '.'

export interface IItemParams {
   id: string
   itemId: string
}

export const getAllCarts = createAsyncThunk('cart/getAllCarts', async (id: string) => {
   const res = await cartApi.getAllCartsForUser(id)
   return res.data
})

export const createCart = createAsyncThunk(
   'cart/createCart',
   async (data: ICartForm, { rejectWithValue }) => {
      try {
         const res = await cartApi.createCart(data)
         return res.data
      } catch (error) {
         return rejectWithValue(error)
      }
   }
)

export const deleteItemCart = createAsyncThunk(
   'cart/deleteItemCart',
   async ({ id, itemId }: IItemParams, { rejectWithValue }) => {
      try {
         const res = await cartApi.deleteCartByItems(id, itemId)
         return res.data.cart
      } catch (error) {
         return rejectWithValue(error)
      }
   }
)

const extraReducers = (builder: ActionReducerMapBuilder<ICartStore>) => {
   builder.addCase(
      getAllCarts.fulfilled,
      (state: ICartStore, action: PayloadAction<ICartsRes>) => {
         console.log('action', action)
         state.cart = action.payload.carts[0]
         state.total =
            action.payload.carts.length === 0
               ? 0
               : (action.payload.carts[0].items?.length as number)
      }
   )

   builder
      .addCase(
         createCart.fulfilled,
         (state: ICartStore, action: PayloadAction<ICart>) => {
            console.log('action', action)
            state.total = action.payload.items?.length as number | 0
            state.cart = action.payload
         }
      )
      .addCase(createCart.rejected, (state, action: PayloadAction<any>) => {
         throw new Error(action.payload.message as string)
      })

   builder
      .addCase(
         deleteItemCart.fulfilled,
         (state: ICartStore, action: PayloadAction<ICart>) => {
            state.cart = Object.keys(action.payload).length > 0 ? action.payload : null
            state.total = action.payload.items
               ? (action.payload.items.length as number)
               : 0
         }
      )
      .addCase(deleteItemCart.rejected, (state, action: PayloadAction<any>) => {
         throw new Error(action.payload.message as string)
      })
}

export default extraReducers
