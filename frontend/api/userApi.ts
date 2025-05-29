import { IUser } from '@/models'
import AxiosClient from '.'

const BASE_URL = '/users'

export const getProfile = async (id: string) => {
   return AxiosClient.get(`${BASE_URL}/${id}`).then((res) => res.data)
}

export const getMe = async () => {
   return AxiosClient.get(`${BASE_URL}/info/profile`).then((res) => res.data)
}

export const updateUser = async (id: string, data: Partial<IUser>) => {
   return AxiosClient.put(`${BASE_URL}/${id}`, data).then((res) => res.data)
}

export const deleteMe = async () => {
   return AxiosClient.delete(`${BASE_URL}/me`)
}
