import { commentApi, productApi } from '@/api'
import { IComment, ICommentData, ICommentReplyData, ICommentRes } from '@/models'
import {
   ActionReducerMapBuilder,
   PayloadAction,
   createAsyncThunk,
} from '@reduxjs/toolkit'
import { ICommentStore } from '.'

export interface ICommentParams {
   id: string
   userId: string
}

export interface ICommentUnLike extends Omit<ICommentParams, 'id'> {
   comment: IComment
}

export interface ICommentReply {
   id: string
   comment: ICommentReplyData
}

export interface ICommentReplyRes {
   id: string
   comment: IComment
}

export interface IReply {
   id: string
   commentRootId: string
}

export const getAllCommentsForProduct = createAsyncThunk(
   'comment/getAllCommentsForProduct',
   async (productId: string, { rejectWithValue }) => {
      try {
         const res = await commentApi.getAllCommentsForProduct(productId)
         return res.data
      } catch (error) {
         return rejectWithValue(error)
      }
   }
)

export const createComment = createAsyncThunk(
   'comment/createComment',
   async (data: ICommentData, { rejectWithValue }) => {
      try {
         const res = await commentApi.createComment(data)
         await productApi.calculatorRatings(data.product as string)
         return res.data.comment
      } catch (error) {
         return rejectWithValue(error)
      }
   }
)

export const updateComment = createAsyncThunk(
   'comment/updateComment',
   async (data: Partial<IComment>, { rejectWithValue }) => {
      try {
         const res = await commentApi.updateComment(data._id as string, data)
         return res.data.comment
      } catch (error) {
         return rejectWithValue(error)
      }
   }
)

export const likeComment = createAsyncThunk(
   'comment/likeComment',
   async (id: string, { rejectWithValue }) => {
      try {
         const res = await commentApi.likeComment(id)
         return res.data.comment
      } catch (error) {
         console.log('error', error)
         return rejectWithValue(
            (error as any)?.error || 'Có lỗi xảy ra khi thích bình luận'
         )
      }
   }
)

export const unlikeComment = createAsyncThunk(
   'comment/unlikeComment',
   async (params: ICommentParams, { rejectWithValue }) => {
      try {
         const res = await commentApi.unlikeComment(params.id)
         return {
            comment: res.data.comment,
            userId: params.userId,
         }
      } catch (error) {
         return rejectWithValue(error)
      }
   }
)

export const replyComment = createAsyncThunk(
   'comment/replyComment',
   async (data: ICommentReply, { rejectWithValue }) => {
      try {
         const res = await commentApi.replyComment(data.id, data.comment)

         return {
            id: data.id,
            comment: res.data.comment,
         }
      } catch (error) {
         return rejectWithValue(error)
      }
   }
)

export const likeReplyComment = createAsyncThunk(
   'comment/likeReplyComment',
   async (params: IReply, { rejectWithValue }) => {
      try {
         const res = await commentApi.likeReplyComment(params.commentRootId, params.id)

         return res.data.comment
      } catch (error) {
         return rejectWithValue(error)
      }
   }
)

export const unlikeReplyComment = createAsyncThunk(
   'comment/unlikeReplyComment',
   async (params: IReply, { rejectWithValue }) => {
      try {
         const res = await commentApi.unlikeReplyComment(params.commentRootId, params.id)

         return res.data.comment
      } catch (error) {
         return rejectWithValue(error)
      }
   }
)

export const deleteComment = createAsyncThunk(
   'comment/deleteComment',
   async (id: string, { rejectWithValue }) => {
      try {
         const res = await commentApi.deleteComment(id)
         await productApi.calculatorRatings(res.data.comment.product as string)
         return id
      } catch (error) {
         return rejectWithValue(error)
      }
   }
)

export const deleteCommentReply = createAsyncThunk(
   'comment/deleteCommentReply',
   async (params: IReply, { rejectWithValue }) => {
      try {
         const res = await commentApi.deleteReplyComment(params.commentRootId, params.id)
         return res.data.comment
      } catch (error) {
         return rejectWithValue(error)
      }
   }
)

export const updateCommentReply = createAsyncThunk(
   'comment/updateCommentReply',
   async (data: Partial<IComment>, { rejectWithValue }) => {
      try {
         const res = await commentApi.updateReplyComment(
            data.commentRoot as string,
            data._id as string,
            data
         )
         return res.data.comment
      } catch (error) {
         return rejectWithValue(error)
      }
   }
)

const extraReducers = (builder: ActionReducerMapBuilder<ICommentStore>) => {
   builder
      .addCase(
         getAllCommentsForProduct.fulfilled,
         (state: ICommentStore, action: PayloadAction<ICommentRes>) => {
            state.comments = action.payload.comments
            state.total = action.payload.total
         }
      )
      .addCase(
         getAllCommentsForProduct.rejected,
         (state: ICommentStore, action: PayloadAction<any>) => {
            throw new Error(action.payload)
         }
      )

   builder
      .addCase(
         createComment.fulfilled,
         (state: ICommentStore, action: PayloadAction<IComment>) => {
            const comments = [...state.comments]
            comments.unshift(action.payload)
            state.comments = comments
            state.total = state.total + 1
         }
      )
      .addCase(
         createComment.rejected,
         (state: ICommentStore, action: PayloadAction<any>) => {
            throw new Error(action.payload)
         }
      )

   builder
      .addCase(
         likeComment.fulfilled,
         (state: ICommentStore, action: PayloadAction<IComment>) => {
            const comments = [...state.comments]
            const idx = comments.findIndex((c) => c._id === action.payload._id)
            if (idx > -1) {
               comments[idx] = action.payload
               state.comments = comments
            }
         }
      )
      .addCase(
         likeComment.rejected,
         (state: ICommentStore, action: PayloadAction<any>) => {
            throw new Error(action.payload)
         }
      )

   builder
      .addCase(
         unlikeComment.fulfilled,
         (state: ICommentStore, action: PayloadAction<ICommentUnLike>) => {
            const { comment, userId } = action.payload
            const comments = [...state.comments]
            const idx = comments.findIndex((c) => c._id === comment._id)
            if (idx > -1) {
               const idxUserLike = comment.likes?.findIndex(
                  (l) => l.toString() === userId
               ) as number
               if (idx > -1) {
                  comment.likes?.splice(idxUserLike, 1)
                  comments[idx] = comment
                  state.comments = comments
               }
            }
         }
      )
      .addCase(
         unlikeComment.rejected,
         (state: ICommentStore, action: PayloadAction<any>) => {
            throw new Error(action.payload)
         }
      )

   builder
      .addCase(
         replyComment.fulfilled,
         (state: ICommentStore, action: PayloadAction<ICommentReplyRes>) => {
            const comments = [...state.comments]
            const { id, comment } = action.payload
            const idx = comments.findIndex((c) => c._id === id)
            if (idx > -1) {
               comments[idx].reply = comment.reply
               state.comments = comments
            }
         }
      )
      .addCase(
         replyComment.rejected,
         (state: ICommentStore, action: PayloadAction<any>) => {
            throw new Error(action.payload)
         }
      )

   builder
      .addCase(
         likeReplyComment.fulfilled,
         (state: ICommentStore, action: PayloadAction<IComment>) => {
            const comments = [...state.comments]
            const comment = action.payload
            const idx = comments.findIndex((c) => c._id === comment._id)

            if (idx > -1) {
               comments[idx].reply = comment.reply
               state.comments = comments
            }
         }
      )
      .addCase(
         likeReplyComment.rejected,
         (state: ICommentStore, action: PayloadAction<any>) => {
            throw new Error(action.payload)
         }
      )

   builder
      .addCase(
         unlikeReplyComment.fulfilled,
         (state: ICommentStore, action: PayloadAction<IComment>) => {
            const comments = [...state.comments]
            const comment = action.payload
            const idx = comments.findIndex((c) => c._id === comment._id)

            if (idx > -1) {
               comments[idx].reply = comment.reply
               state.comments = comments
            }
         }
      )
      .addCase(
         unlikeReplyComment.rejected,
         (state: ICommentStore, action: PayloadAction<any>) => {
            throw new Error(action.payload)
         }
      )

   builder
      .addCase(
         deleteComment.fulfilled,
         (state: ICommentStore, action: PayloadAction<string>) => {
            const comments = [...state.comments]
            const idx = comments.findIndex((c) => c._id === action.payload)
            if (idx > -1) {
               comments.splice(idx, 1)
               state.comments = comments
            }
         }
      )
      .addCase(
         deleteComment.rejected,
         (state: ICommentStore, action: PayloadAction<any>) => {
            throw new Error(action.payload)
         }
      )

   builder
      .addCase(
         deleteCommentReply.fulfilled,
         (state: ICommentStore, action: PayloadAction<IComment>) => {
            const comments = [...state.comments]
            const commentRootIdx = comments.findIndex((c) => c._id === action.payload._id)
            if (commentRootIdx > -1) {
               comments[commentRootIdx] = action.payload
               state.comments = comments
            }
         }
      )
      .addCase(
         deleteCommentReply.rejected,
         (state: ICommentStore, action: PayloadAction<any>) => {
            throw new Error(action.payload)
         }
      )
   builder
      .addCase(
         updateComment.fulfilled,
         (state: ICommentStore, action: PayloadAction<IComment>) => {
            const comments = [...state.comments]
            const comment = action.payload
            const idx = comments.findIndex((c) => c._id === comment._id)
            if (idx > -1) {
               comments[idx] = comment
               state.comments = comments
            }
         }
      )
      .addCase(
         updateComment.rejected,
         (state: ICommentStore, action: PayloadAction<any>) => {
            throw new Error(action.payload)
         }
      )

   builder
      .addCase(
         updateCommentReply.fulfilled,
         (state: ICommentStore, action: PayloadAction<IComment>) => {
            const comments = [...state.comments]
            const comment = action.payload
            const idx = comments.findIndex((c) => c._id === comment._id)
            if (idx > -1) {
               comments[idx] = comment
               state.comments = comments
            }
         }
      )
      .addCase(
         updateCommentReply.rejected,
         (state: ICommentStore, action: PayloadAction<any>) => {
            throw new Error(action.payload)
         }
      )
}

export default extraReducers
