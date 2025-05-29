import { PayloadAction } from '@reduxjs/toolkit'
import { IUserStore } from '.'
import { IAddress, IProduct } from '@/models'

export const reducers = {
   resetUser(state: IUserStore) {
      state.user = null
   },
   resetRecentlyProduct(state: IUserStore) {
      state.recentlyViewed = []
   },
   updateAddress(state: IUserStore, action: PayloadAction<IAddress[]>) {
      const addresses = [...action.payload]
      if (state.user) {
         state.user.addresses = addresses
         const addressDefault = addresses.find((a) => a.isDefault)
         if (addressDefault) {
            state.user.address = addressDefault
         }
      }
   },
   addAddress(state: IUserStore, action: PayloadAction<IAddress[]>) {
      const addresses = [...action.payload]
      if (state.user) {
         state.user.addresses = addresses
         const addressDefault = addresses.find((a) => a.isDefault)
         if (addressDefault) {
            state.user.address = addressDefault
         }
      }
   },
   addRecentlyProduct(state: IUserStore, action: PayloadAction<IProduct>) {
      if (state.user) {
         if (state.recentlyViewed && state.recentlyViewed?.length > 8) {
            state.recentlyViewed.pop()
         }
         if (state.recentlyViewed?.length === 0) state.recentlyViewed = []

         const ids = state.recentlyViewed?.map((p) => p.id)
         if (!ids.includes(action.payload.id)) {
            state.recentlyViewed.unshift(action.payload)
         }
      }
   },
}
