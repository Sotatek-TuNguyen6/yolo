import { addressApi, authApi, orderApi, productApi, userApi } from '@/api'
import {
   IAddress,
   ILogin,
   ILoginGoogle,
   IOrder,
   IOrderData,
   IProduct,
   IUser,
} from '@/models'
import {
   ActionReducerMapBuilder,
   PayloadAction,
   createAsyncThunk,
} from '@reduxjs/toolkit'
import { IUserStore } from '.'
import { setLs } from '@/utils'

export const loginUser = createAsyncThunk(
   'user/loginUser',
   async (data: ILogin, { rejectWithValue }) => {
      try {
         const res = await authApi.login(data)
         console.log('res', res)
         setLs(process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY as string, res.data.token)
         // setLs(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY as string, res.data.refreshToken)
         return res.data.user
      } catch (error) {
         return rejectWithValue(error as string)
      }
   }
)

export const loginGoogleUser = createAsyncThunk(
   'user/loginGoogleUser',
   async (data: ILoginGoogle, { rejectWithValue }) => {
      try {
         const res = await authApi.loginGoogle(data)
         setLs(process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY as string, res.data.accessToken)
         setLs(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY as string, res.data.refreshToken)
         return res.data.user
      } catch (error) {
         return rejectWithValue(error as string)
      }
   }
)

export const getProfile = createAsyncThunk('user/getProfile', async () => {
   const res = await userApi.getMe()
   return res.data.user
})

export const updateUser = createAsyncThunk(
   'user/updateUser',
   async (data: Partial<IUser>, { rejectWithValue }) => {
      try {
         const res = await userApi.updateUser(data._id as string, data)
         return res.data.user
      } catch (error) {
         return rejectWithValue(error as string)
      }
   }
)

export const deleteAddressUser = createAsyncThunk(
   'user/deleteAddressUser',
   async (ids: { userId: string; addressId: string }, { rejectWithValue }) => {
      try {
         const res = await addressApi.deleteAddressForUser(ids.addressId, ids.userId)
         return res.data.addresses
      } catch (error) {
         return rejectWithValue(error)
      }
   }
)

export const likeProduct = createAsyncThunk(
   'user/likeProduct',
   async (productId: string) => {
      const res = await productApi.likeProduct(productId)
      return res.data.product
   }
)

export const unlikeProduct = createAsyncThunk(
   'user/unlikeProduct',
   async (productId: string) => {
      const res = await productApi.unlikeProduct(productId)
      return res.data.product
   }
)

export const createOrder = createAsyncThunk(
   'user/createOrder',
   async (data: IOrderData, { rejectWithValue }) => {
      try {
         const res = await orderApi.createOrder(data)
         return res.data.order
      } catch (error) {
         return rejectWithValue(error)
      }
   }
)

const extraReducers = (builder: ActionReducerMapBuilder<IUserStore>) => {
   builder
      .addCase(loginUser.fulfilled, (state: IUserStore, action: PayloadAction<IUser>) => {
         state.user = action.payload
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
         throw new Error(action.payload.message as string)
      })

   builder
      .addCase(
         loginGoogleUser.fulfilled,
         (state: IUserStore, action: PayloadAction<IUser>) => {
            state.user = action.payload
         }
      )
      .addCase(loginGoogleUser.rejected, (state, action: PayloadAction<any>) => {
         throw new Error(action.payload.message as string)
      })

   builder
      .addCase(
         getProfile.fulfilled,
         (state: IUserStore, action: PayloadAction<IUser>) => {
            state.user = action.payload
         }
      )
      .addCase(getProfile.rejected, (state, action: PayloadAction<any>) => {
         throw new Error(action.payload.message as string)
      })

   builder
      .addCase(
         updateUser.fulfilled,
         (state: IUserStore, action: PayloadAction<IUser>) => {
            state.user = action.payload
         }
      )
      .addCase(updateUser.rejected, (state, action: PayloadAction<any>) => {
         throw new Error(action.payload.message as string)
      })

   builder
      .addCase(
         deleteAddressUser.fulfilled,
         (state: IUserStore, action: PayloadAction<IAddress[]>) => {
            if (state.user) {
               state.user.addresses = action.payload
            }
         }
      )
      .addCase(deleteAddressUser.rejected, (state, action: PayloadAction<any>) => {
         throw new Error(action.payload.message as string)
      })

   builder
      .addCase(
         likeProduct.fulfilled,
         (state: IUserStore, action: PayloadAction<IProduct>) => {
            const product = action.payload
            if (state.user) {
               const user = state.user
               user.favoriteProducts.unshift(product)
               state.user = user
            }
         }
      )
      .addCase(likeProduct.rejected, (state, action: PayloadAction<any>) => {
         throw new Error(action.payload.message as string)
      })

   builder
      .addCase(
         unlikeProduct.fulfilled,
         (state: IUserStore, action: PayloadAction<IProduct>) => {
            const product = action.payload
            if (state.user) {
               const user = state.user
               const idx = (user.favoriteProducts as IProduct[]).findIndex(
                  (p) => p._id === product._id
               )
               if (idx > -1) {
                  user.favoriteProducts.splice(idx, 1)
                  state.user = user
               }
            }
         }
      )
      .addCase(unlikeProduct.rejected, (state, action: PayloadAction<any>) => {
         throw new Error(action.payload.message as string)
      })

   builder
      .addCase(
         createOrder.fulfilled,
         (state: IUserStore, action: PayloadAction<IOrder>) => {
            const order = action.payload
            if (state.user && state.user.orders) {
               const orders = state.user.orders
               orders.push(order)
               state.user.orders = orders
            }
         }
      )
      .addCase(createOrder.rejected, (state: IUserStore, action: PayloadAction<any>) => {
         throw new Error(action.payload)
      })
}

export default extraReducers
