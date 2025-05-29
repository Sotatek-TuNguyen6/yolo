import { sizeApi } from '@/api'
import {
   ActionReducerMapBuilder,
   PayloadAction,
   createAsyncThunk,
} from '@reduxjs/toolkit'
import { ISizeStore } from '.'
import { ISize } from '@/models'

export const getAllSizes = createAsyncThunk('size/getAllSizes', async () => {
   const res = await sizeApi.getAllSizes()
   return res.data.sizes
})

const extraReducers = (builder: ActionReducerMapBuilder<ISizeStore>) => {
   builder.addCase(
      getAllSizes.fulfilled,
      (state: ISizeStore, action: PayloadAction<ISize[]>) => {
         state.sizes = action.payload
      }
   )
}

export default extraReducers
