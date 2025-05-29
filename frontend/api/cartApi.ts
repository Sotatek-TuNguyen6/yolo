import { ICart, ICartData, ICartForm, ICartItem } from '@/models'
import AxiosClient from '.'

const BASE_API = '/carts'

export const getAllCartsForUser = async (id: string) => {
   return AxiosClient.get(`${BASE_API}/user/${id}`).then((res) => res.data)
}

export const createCart = async (data: ICartForm) => {
   return AxiosClient.post(BASE_API, data).then((res) => res.data)
}

export const updateCartByItemsList = async (id: string, data: ICartItem[]) => {
   return AxiosClient.put(`${BASE_API}/items-list/${id}`, data).then((res) => res.data)
}

export const updateCartByItems = async (id: string, data: Partial<ICart>) => {
   return AxiosClient.put(`${BASE_API}/items/${id}`, data).then((res) => res.data)
}

export const deleteCartByItems = async (id: string, itemId: string) => {
   return AxiosClient.delete(`${BASE_API}/items/${id}/${itemId}`).then((res) => res.data)
}

export const deleteCart = async (id: string) => {
   return AxiosClient.delete(`${BASE_API}/${id}`)
}
