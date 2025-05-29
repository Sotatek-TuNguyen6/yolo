import { IComment, ICommentData, ICommentReplyData } from '@/models'
import AxiosClient from '.'

const BASE_API = '/comments'

export const getAllCommentsForProduct = async (productId: string) => {
   return AxiosClient.get(`${BASE_API}/${productId}`).then((res) => res.data)
}

export const createComment = async (data: ICommentData) => {
   return AxiosClient.post(BASE_API, data).then((res) => res.data)
}

export const updateComment = async (id: string, data: Partial<IComment>) => {
   return AxiosClient.put(`${BASE_API}/${id}`, data).then((res) => res.data)
}

export const deleteComment = async (id: string) => {
   return AxiosClient.delete(`${BASE_API}/${id}`).then((res) => res.data)
}

export const likeComment = async (id: string) => {
   return AxiosClient.get(`${BASE_API}/like/${id}`).then((res) => res.data)
}

export const unlikeComment = async (id: string) => {
   return AxiosClient.get(`${BASE_API}/unlike/${id}`).then((res) => res.data)
}

export const replyComment = async (id: string, data: ICommentReplyData) => {
   return AxiosClient.post(`${BASE_API}/reply/${id}`, data).then((res) => res.data)
}

export const likeReplyComment = async (commentRootId: string, id: string) => {
   return AxiosClient.get(`${BASE_API}/reply/like/${commentRootId}/${id}`).then(
      (res) => res.data
   )
}

export const unlikeReplyComment = async (commentRootId: string, id: string) => {
   return AxiosClient.get(`${BASE_API}/reply/unlike/${commentRootId}/${id}`).then(
      (res) => res.data
   )
}

export const deleteReplyComment = async (commentRootId: string, id: string) => {
   return AxiosClient.delete(`${BASE_API}/reply/${commentRootId}/${id}`).then(
      (res) => res.data
   )
}

export const updateReplyComment = async (
   commentRootId: string,
   id: string,
   data: Partial<IComment>
) => {
   return AxiosClient.put(`${BASE_API}/reply/${commentRootId}/${id}`, data).then(
      (res) => res.data
   )
}
