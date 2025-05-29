import { IAddressData } from '@/models'
import AxiosClient from '.'

const BASE_API = '/addresses'

export const createAddress = async (data: IAddressData) => {
   return AxiosClient.post(`${BASE_API}`, data).then((res) => res.data)
}

export const updateAddressForUser = async (id: string, data: Partial<IAddressData>) => {
   return AxiosClient.put(`${BASE_API}/user/${id}`, data).then((res) => res.data)
}

export const deleteAddressForUser = async (id: string, userId: string) => {
   return AxiosClient.delete(`${BASE_API}/user/${userId}/${id}`).then((res) => res.data)
}
