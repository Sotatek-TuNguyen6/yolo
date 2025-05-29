import { ISubCategory } from '@/models'
import extraReducers from '@/store/subCategory/thunkApi'
import { createSlice } from '@reduxjs/toolkit'

export interface ISubCategoryStore {
   subCategories: ISubCategory[]
}

const initialState: ISubCategoryStore = {
   subCategories: [],
}

const subCategorySlice = createSlice({
   name: 'subCategory',
   initialState,
   reducers: {},
   extraReducers,
})

export default subCategorySlice.reducer
