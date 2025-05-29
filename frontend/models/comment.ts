import { ALL } from '@/constants'
import { IProduct, IUser } from '@/models'

export interface ICommentData {
   id?: string
   _id?: string
   user: IUser | string
   product: IProduct | string
   fullName: string
   commentRoot?: string | null
   email: string
   phoneNumber?: string
   reply: IComment[]
   comment: string
   likes: (IUser | string)[]
   rating: number
}

export type ICommentReplyData = Omit<ICommentData, 'rating' | 'reply'>

export interface IComment extends Omit<ICommentData, 'id' | '_id'> {
   id: string
   _id: string
}

export interface ICommentForm {
   fullName: string
   email: string
   phoneNumber: string
   comment: string
   rating: number
}

export interface ICommentRes {
   comments: IComment[]
   total: number
}

export type IFilterRating = typeof ALL | number
