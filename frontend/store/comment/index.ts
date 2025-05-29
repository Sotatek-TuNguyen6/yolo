import { IComment } from '@/models'
import { createSlice } from '@reduxjs/toolkit'
import extraReducers from '@/store/comment/thunkApi'

export interface ICommentStore {
   comments: IComment[]
   total: number
}

const initialState: ICommentStore = {
   comments: [],
   total: 0,
}

const commentSlice = createSlice({
   name: 'comment',
   initialState,
   reducers: {},
   extraReducers,
})

export default commentSlice.reducer
