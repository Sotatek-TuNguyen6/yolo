import { EMPTY_OPTION } from '@/constants'
import { IAddressValue } from '@/models/auth'

export interface IAddressData {
   id?: string
   _id?: string
   user: string
   fullName: string
   phoneNumber: string
   street: string
   ward: IAddressValue | typeof EMPTY_OPTION | string
   district: IAddressValue | typeof EMPTY_OPTION | string
   province: IAddressValue | typeof EMPTY_OPTION | string
   isDefault: boolean
}

export interface IAddressValueFormat {
   street: string
   ward: string | IAddressValue
   district: string | IAddressValue
   province: string | IAddressValue
}

export interface IAddress extends Omit<IAddressData, 'id' | '_id'> {
   id: string
}

export type IAddressForm = Omit<IAddressData, 'id' | 'user' | '_id'>
