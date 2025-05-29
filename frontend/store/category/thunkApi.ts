import { categoryApi } from '@/api'
import { ICategory } from '@/models'
import {
   ActionReducerMapBuilder,
   PayloadAction,
   createAsyncThunk,
} from '@reduxjs/toolkit'
import { ICategoryStore } from '.'

export const getAllCategories = createAsyncThunk('size/getAllCategories', async () => {
   const res = await categoryApi.getAllCategories()
   return res.data.categories
})

const extraReducers = (builder: ActionReducerMapBuilder<ICategoryStore>) => {
   builder.addCase(
      getAllCategories.fulfilled,
      (state: ICategoryStore, action: PayloadAction<ICategory[]>) => {
         state.categories = action.payload
      }
   )
}

export default extraReducers
