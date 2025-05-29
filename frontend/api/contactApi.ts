import { IContactData } from '@/models'
import AxiosClient from '.'

const BASE_URL = '/contacts'

export const createContact = async (data: IContactData) => {
   return AxiosClient.post(`${BASE_URL}`, data).then((res) => res.data)
}
