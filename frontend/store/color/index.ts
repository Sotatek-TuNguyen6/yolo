import { IColor } from '@/models'
import { createSlice } from '@reduxjs/toolkit'
import extraReducers from '@/store/color/thunkApi'

export interface IColorStore {
   colors: IColor[]
}

const initialState: IColorStore = {
   colors: [],
}

const colorSlice = createSlice({
   name: 'color',
   initialState,
   reducers: {},
   extraReducers,
})

export default colorSlice.reducer
