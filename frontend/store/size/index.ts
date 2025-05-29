import { ISize } from '@/models'
import { createSlice } from '@reduxjs/toolkit'
import extraReducers from '@/store/size/thunkApi'

export interface ISizeStore {
   sizes: ISize[]
}

const initialState: ISizeStore = {
   sizes: [],
}

const sizeSlice = createSlice({
   name: 'size',
   initialState,
   reducers: {},
   extraReducers,
})

export default sizeSlice.reducer
