import { IProduct, IUser } from '@/models'
import { createSlice } from '@reduxjs/toolkit'
import extraReducers from '@/store/user/thunkApi'
import { reducers } from '@/store/user/reducers'

export interface IUserStore {
   user: IUser | null
   recentlyViewed: IProduct[]
}

const initialState: IUserStore = {
   user: null,
   recentlyViewed: [],
}

const userSlice = createSlice({
   name: 'user',
   initialState,
   reducers,
   extraReducers,
})

export const {
   addAddress,
   updateAddress,
   addRecentlyProduct,
   resetUser,
   resetRecentlyProduct,
} = userSlice.actions
export default userSlice.reducer
