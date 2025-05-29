import { ICategory } from '@/models'
import { createSlice } from '@reduxjs/toolkit'
import extraReducers from '@/store/category/thunkApi'

export interface ICategoryStore {
   categories: ICategory[]
}

const initialState: ICategoryStore = {
   categories: [],
}

const categorySlice = createSlice({
   name: 'category',
   initialState,
   reducers: {},
   extraReducers,
})

export default categorySlice.reducer
