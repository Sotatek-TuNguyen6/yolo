import { colorApi } from '@/api'
import { IColor } from '@/models'
import {
   ActionReducerMapBuilder,
   PayloadAction,
   createAsyncThunk,
} from '@reduxjs/toolkit'
import { IColorStore } from '.'

export const getAllColors = createAsyncThunk('size/getAllColors', async () => {
   const res = await colorApi.getAllColors()
   return res.data.colors
})

const extraReducers = (builder: ActionReducerMapBuilder<IColorStore>) => {
   builder.addCase(
      getAllColors.fulfilled,
      (state: IColorStore, action: PayloadAction<IColor[]>) => {
         state.colors = action.payload
      }
   )
}

export default extraReducers
