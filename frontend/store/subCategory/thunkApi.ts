import { subCategoryApi } from '@/api'
import { ISubCategory } from '@/models'
import {
   ActionReducerMapBuilder,
   PayloadAction,
   createAsyncThunk,
} from '@reduxjs/toolkit'
import { ISubCategoryStore } from '.'

export const getAllSubCategories = createAsyncThunk(
   'size/getAllSubCategories',
   async () => {
      const res = await subCategoryApi.getAllSubCategories()
      return res.data.subCategories
   }
)

const extraReducers = (builder: ActionReducerMapBuilder<ISubCategoryStore>) => {
   builder.addCase(
      getAllSubCategories.fulfilled,
      (state: ISubCategoryStore, action: PayloadAction<ISubCategory[]>) => {
         state.subCategories = action.payload
      }
   )
}

export default extraReducers
