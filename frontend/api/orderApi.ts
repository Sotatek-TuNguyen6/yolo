import { IOrder, IOrderData } from '@/models'
import AxiosClient from '.'

const BASE_API = '/orders'

export const getAllOrders = async () => {
   return AxiosClient.get(BASE_API).then((res) => res.data)
}

export const createOrder = async (data: IOrderData) => {
   return AxiosClient.post(BASE_API, data).then((res) => res.data)
}

export const updateOrder = async (id: string, data: Partial<IOrder>) => {
   return AxiosClient.put(`${BASE_API}/${id}`, data).then((res) => res.data)
}

export const deleteOrder = async (id: string) => {
   return AxiosClient.delete(`${BASE_API}/${id}`)
}
