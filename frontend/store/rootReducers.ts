import { AnyAction, combineReducers, Reducer } from 'redux'
import { AppState } from '.'
import userReducer from '@/store/user'
import commonReducer from '@/store/common'
import categoryReducer from '@/store/category'
import sizeReducer from '@/store/size'
import colorReducer from '@/store/color'
import cartReducer from '@/store/cart'
import commentReducer from '@/store/comment'
import orderReducer from '@/store/order'
import subCategoryReducer from '@/store/subCategory'

export const DESTROY_ACTION = 'DESTROY_STORE'

export const combinedReducer = combineReducers({
   common: commonReducer,
   user: userReducer,
   category: categoryReducer,
   size: sizeReducer,
   color: colorReducer,
   cart: cartReducer,
   comment: commentReducer,
   order: orderReducer,
   subCategory: subCategoryReducer,
})

const rootReducers: Reducer = (state: AppState, action: AnyAction) => {
   if (action.type === DESTROY_ACTION) {
      state = {} as AppState
   }
   return combinedReducer(state, action)
}

export default rootReducers
